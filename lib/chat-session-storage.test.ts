import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import {
  chatSessionStorageKey,
  chatSessionStorageVersion,
  clearChatSession,
  getChatSessionSnapshot,
  invalidateChatSessionSnapshotCache,
  maxStoredChatMessages,
  sanitizeStoredChatSession,
  sanitizeStoredMessages,
  writeChatSession,
} from "./chat-session-storage";
import { createEmptyTravelProfile } from "./travel-profile";

const memoryStore = new Map<string, string>();

function installMemorySessionStorage() {
  const storage = {
    getItem(key: string) {
      return memoryStore.has(key) ? memoryStore.get(key)! : null;
    },
    setItem(key: string, value: string) {
      memoryStore.set(key, String(value));
    },
    removeItem(key: string) {
      memoryStore.delete(key);
    },
  };

  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: { sessionStorage: storage },
  });
}

afterEach(() => {
  memoryStore.clear();
  invalidateChatSessionSnapshotCache();
  // @ts-expect-error cleanup test shim
  delete globalThis.window;
});

describe("chat session storage", () => {
  it("accepts a valid stored session for the expected locale", () => {
    const session = sanitizeStoredChatSession(
      {
        version: chatSessionStorageVersion,
        locale: "bg",
        updatedAt: "2026-10-20T10:00:00.000Z",
        messages: [
          {
            id: "welcome",
            role: "assistant",
            content: "Здравейте",
            source: "faq",
          },
          {
            id: "u1",
            role: "user",
            content: "Искам Малдиви",
          },
        ],
        profile: {
          ...createEmptyTravelProfile("bg"),
          destinations: ["Малдиви"],
        },
      },
      "bg",
    );

    assert.ok(session);
    assert.equal(session?.locale, "bg");
    assert.equal(session?.messages.length, 2);
    assert.deepEqual(session?.profile.destinations, ["Малдиви"]);
  });

  it("rejects wrong version, locale mismatch, or empty messages", () => {
    assert.equal(
      sanitizeStoredChatSession(
        {
          version: 999,
          locale: "bg",
          messages: [{ id: "1", role: "user", content: "hi" }],
          profile: createEmptyTravelProfile("bg"),
        },
        "bg",
      ),
      null,
    );

    assert.equal(
      sanitizeStoredChatSession(
        {
          version: chatSessionStorageVersion,
          locale: "en",
          messages: [{ id: "1", role: "user", content: "hi" }],
          profile: createEmptyTravelProfile("en"),
        },
        "bg",
      ),
      null,
    );

    assert.equal(
      sanitizeStoredChatSession(
        {
          version: chatSessionStorageVersion,
          locale: "bg",
          messages: [],
          profile: createEmptyTravelProfile("bg"),
        },
        "bg",
      ),
      null,
    );
  });

  it("keeps the last 40 valid messages in chronological order", () => {
    const input = Array.from({ length: 45 }, (_, index) => ({
      id: `m${index}`,
      role: index % 2 === 0 ? ("user" as const) : ("assistant" as const),
      content: `msg-${index}`,
    }));

    const kept = sanitizeStoredMessages(input);
    assert.equal(kept.length, maxStoredChatMessages);
    assert.equal(kept[0]?.id, "m5");
    assert.equal(kept.at(-1)?.id, "m44");
    assert.equal(kept.at(-1)?.content, "msg-44");
  });

  it("returns a stable snapshot identity when storage is unchanged", () => {
    installMemorySessionStorage();
    writeChatSession({
      locale: "bg",
      messages: [
        { id: "welcome", role: "assistant", content: "Здравейте", source: "faq" },
        { id: "u1", role: "user", content: "Искам Малдиви" },
      ],
      profile: {
        ...createEmptyTravelProfile("bg"),
        destinations: ["Малдиви"],
      },
    });

    const first = getChatSessionSnapshot("bg");
    const second = getChatSessionSnapshot("bg");
    assert.ok(first);
    assert.equal(first, second);
    assert.equal(Object.is(first, second), true);
  });

  it("returns a new snapshot after an actual storage change", () => {
    installMemorySessionStorage();
    writeChatSession({
      locale: "bg",
      messages: [
        { id: "welcome", role: "assistant", content: "Здравейте", source: "faq" },
      ],
      profile: createEmptyTravelProfile("bg"),
    });

    const first = getChatSessionSnapshot("bg");
    writeChatSession({
      locale: "bg",
      messages: [
        { id: "welcome", role: "assistant", content: "Здравейте", source: "faq" },
        { id: "u1", role: "user", content: "за двама" },
      ],
      profile: {
        ...createEmptyTravelProfile("bg"),
        adults: 2,
      },
    });
    const second = getChatSessionSnapshot("bg");

    assert.ok(first);
    assert.ok(second);
    assert.notEqual(first, second);
    assert.equal(second?.messages.at(-1)?.content, "за двама");
  });

  it("clears snapshot cache when the conversation is reset", () => {
    installMemorySessionStorage();
    writeChatSession({
      locale: "bg",
      messages: [
        { id: "welcome", role: "assistant", content: "Здравейте", source: "faq" },
        { id: "u1", role: "user", content: "Искам Малдиви" },
      ],
      profile: createEmptyTravelProfile("bg"),
    });

    assert.ok(getChatSessionSnapshot("bg"));
    clearChatSession();
    assert.equal(window.sessionStorage.getItem(chatSessionStorageKey), null);
    assert.equal(getChatSessionSnapshot("bg"), null);
  });
});
