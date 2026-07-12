import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { scheduleFocusRestore } from "./focus-restore-scheduler.ts";

afterEach(() => {
  delete (globalThis as { window?: Window }).window;
});

describe("deferred focus restoration", () => {
  it("restores focus after the current interaction", () => {
    const queue: Array<() => void> = [];
    let focused = false;
    const target = {
      focus() {
        focused = true;
      },
    } as unknown as HTMLElement;

    globalThis.window = {
      setTimeout(callback: () => void) {
        queue.push(callback);
        return queue.length;
      },
      clearTimeout() {},
    } as Window;

    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: {
        contains: () => true,
      },
    });

    const cancel = scheduleFocusRestore(target, "deferred");

    assert.equal(focused, false);
    queue[0]?.();
    assert.equal(focused, true);

    cancel();
  });

  it("cancels a pending deferred restore", () => {
    const queue: Array<() => void> = [];
    let focused = false;
    const target = {
      focus() {
        focused = true;
      },
    } as unknown as HTMLElement;

    globalThis.window = {
      setTimeout(callback: () => void) {
        queue.push(callback);
        return queue.length;
      },
      clearTimeout(timeoutId: number) {
        queue.splice(timeoutId - 1, 1);
      },
    } as Window;

    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: {
        contains: () => true,
      },
    });

    const cancel = scheduleFocusRestore(target, "deferred");
    cancel();
    queue[0]?.();

    assert.equal(focused, false);
  });

  it("restores focus immediately when requested", () => {
    let focused = false;
    const target = {
      focus() {
        focused = true;
      },
    } as unknown as HTMLElement;

    scheduleFocusRestore(target, "immediate");
    assert.equal(focused, true);
  });
});
