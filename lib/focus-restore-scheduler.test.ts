import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { scheduleFocusRestore } from "./focus-restore-scheduler.ts";

type FrameCallback = FrameRequestCallback;

afterEach(() => {
  delete (globalThis as { window?: Window }).window;
});

describe("deferred focus restoration", () => {
  it("restores focus on the next animation frame", () => {
    const queue: FrameCallback[] = [];
    let focused = false;
    const target = {
      focus() {
        focused = true;
      },
    } as unknown as HTMLElement;

    globalThis.window = {
      requestAnimationFrame(callback: FrameCallback) {
        queue.push(callback);
        return queue.length;
      },
      cancelAnimationFrame() {},
    } as Window;

    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: {
        contains: () => true,
      },
    });

    const cancel = scheduleFocusRestore(target, "animationFrame");

    assert.equal(focused, false);
    queue[0]?.(0);
    assert.equal(focused, false);
    queue[1]?.(0);
    assert.equal(focused, true);

    cancel();
  });

  it("cancels a pending animation frame restore", () => {
    const queue: FrameCallback[] = [];
    let focused = false;
    const target = {
      focus() {
        focused = true;
      },
    } as unknown as HTMLElement;

    globalThis.window = {
      requestAnimationFrame(callback: FrameCallback) {
        queue.push(callback);
        return queue.length;
      },
      cancelAnimationFrame(frameId: number) {
        queue.splice(frameId - 1, 1);
      },
    } as Window;

    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: {
        contains: () => true,
      },
    });

    const cancel = scheduleFocusRestore(target, "animationFrame");
    cancel();
    queue[0]?.(0);

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
