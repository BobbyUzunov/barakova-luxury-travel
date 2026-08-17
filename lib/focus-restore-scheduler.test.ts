import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { scheduleFocusRestore } from "./focus-restore-scheduler";

type TimeoutHandle = number;

type MockWindow = {
  setTimeout: (callback: () => void) => TimeoutHandle;
  clearTimeout: (timeoutId?: TimeoutHandle) => void;
};

afterEach(() => {
  delete (globalThis as { window?: Window }).window;
});

function installDeferredFocusMocks(queue: Array<() => void>) {
  const mockWindow: MockWindow = {
    setTimeout(callback) {
      queue.push(callback);
      return queue.length;
    },
    clearTimeout(timeoutId) {
      if (typeof timeoutId === "number") {
        queue.splice(timeoutId - 1, 1);
      }
    },
  };

  globalThis.window = mockWindow as unknown as Window & typeof globalThis;

  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      contains: () => true,
    },
  });
}

describe("deferred focus restoration", () => {
  it("restores focus after the current interaction", () => {
    const queue: Array<() => void> = [];
    let focused = false;
    const target = {
      focus() {
        focused = true;
      },
    } as unknown as HTMLElement;

    installDeferredFocusMocks(queue);

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

    installDeferredFocusMocks(queue);

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
