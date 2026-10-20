import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import {
  clearContactFormDraft,
  contactFormDraftStorageKey,
  contactFormDraftTtlMs,
  createContactFormDraft,
  readContactFormDraft,
  sanitizeContactFormDraft,
  writeContactFormDraft,
} from "./contact-form-draft";
import { createEmptyTravelProfile } from "./travel-profile";
import { buildTravelSummary } from "./travel-summary";

type MemoryStore = Map<string, string>;

function installSessionStorage(store: MemoryStore) {
  const sessionStorage = {
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null;
    },
    setItem(key: string, value: string) {
      store.set(key, value);
    },
    removeItem(key: string) {
      store.delete(key);
    },
  };

  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      sessionStorage,
      dispatchEvent() {
        return true;
      },
      addEventListener() {
        return undefined;
      },
      removeEventListener() {
        return undefined;
      },
    },
  });
}

afterEach(() => {
  Reflect.deleteProperty(globalThis, "window");
});

describe("contact form draft", () => {
  it("rejects invalid, expired, or wrong-locale drafts", () => {
    const summary = buildTravelSummary({
      ...createEmptyTravelProfile("bg"),
      destinations: ["Рим"],
    });
    const draft = createContactFormDraft({
      locale: "bg",
      summary,
      now: Date.now(),
    });

    assert.equal(sanitizeContactFormDraft(null), null);
    assert.equal(sanitizeContactFormDraft({ ...draft, version: 99 }), null);
    assert.equal(sanitizeContactFormDraft(draft, "en"), null);
    assert.equal(
      sanitizeContactFormDraft(
        {
          ...draft,
          expiresAt: new Date(Date.now() - 1000).toISOString(),
        },
        "bg",
      ),
      null,
    );
    assert.equal(
      sanitizeContactFormDraft({ ...draft, summaryText: "" }, "bg"),
      null,
    );

    const valid = sanitizeContactFormDraft(draft, "bg");
    assert.ok(valid);
    assert.equal(valid?.locale, "bg");
    assert.equal(valid?.applied, false);
    assert.ok(Date.parse(valid!.expiresAt) - Date.parse(valid!.createdAt) === contactFormDraftTtlMs);
  });

  it("writes, reads once-applied, and clears drafts in sessionStorage", () => {
    const store: MemoryStore = new Map();
    installSessionStorage(store);

    const summary = buildTravelSummary({
      ...createEmptyTravelProfile("en"),
      destinations: ["Paris"],
      adults: 2,
      children: 0,
    });
    const draft = createContactFormDraft({ locale: "en", summary });

    assert.equal(writeContactFormDraft(draft), true);
    assert.ok(store.has(contactFormDraftStorageKey));

    const read = readContactFormDraft("en");
    assert.ok(read);
    assert.equal(read?.id, draft.id);
    assert.equal(readContactFormDraft("bg"), null);

    writeContactFormDraft({ ...draft, applied: true });
    assert.equal(readContactFormDraft("en")?.applied, true);

    clearContactFormDraft();
    assert.equal(readContactFormDraft("en"), null);
    assert.equal(store.has(contactFormDraftStorageKey), false);
  });

  it("clears corrupted session payloads safely", () => {
    const store: MemoryStore = new Map();
    installSessionStorage(store);
    store.set(contactFormDraftStorageKey, "{not-json");
    assert.equal(readContactFormDraft("bg"), null);
    assert.equal(store.has(contactFormDraftStorageKey), false);
  });

  it("returns false when sessionStorage write fails and keeps no draft", () => {
    const store: MemoryStore = new Map();
    const sessionStorage = {
      getItem(key: string) {
        return store.has(key) ? store.get(key)! : null;
      },
      setItem() {
        throw new Error("QuotaExceededError");
      },
      removeItem(key: string) {
        store.delete(key);
      },
    };

    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        sessionStorage,
        dispatchEvent() {
          return true;
        },
        addEventListener() {
          return undefined;
        },
        removeEventListener() {
          return undefined;
        },
      },
    });

    const summary = buildTravelSummary({
      ...createEmptyTravelProfile("bg"),
      destinations: ["Сицилия"],
    });
    const draft = createContactFormDraft({ locale: "bg", summary });

    assert.equal(writeContactFormDraft(draft), false);
    assert.equal(store.has(contactFormDraftStorageKey), false);
    assert.equal(readContactFormDraft("bg"), null);
  });
});
