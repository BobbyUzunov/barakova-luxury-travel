import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getFocusRestoreTarget } from "./focus-restore.ts";
import {
  getFocusWrapTarget,
  handleFocusTrapKeyDown,
} from "./focus-trap.ts";

describe("focus trap helpers", () => {
  it("wraps focus forward from the last element", () => {
    assert.equal(getFocusWrapTarget(3, 2, false), 0);
  });

  it("wraps focus backward from the first element", () => {
    assert.equal(getFocusWrapTarget(3, 0, true), 2);
  });

  it("does not wrap in the middle of the trap", () => {
    assert.equal(getFocusWrapTarget(3, 1, false), null);
    assert.equal(getFocusWrapTarget(3, 1, true), null);
  });

  it("returns null when there are no focusable elements", () => {
    assert.equal(getFocusWrapTarget(0, -1, false), null);
  });

  it("traps Tab at the last focusable element", () => {
    const createFocusable = () => ({
      hasAttribute: () => false,
      getAttribute: () => null,
      tabIndex: 0,
      focus() {
        focused = this;
      },
    });
    const first = createFocusable();
    const second = createFocusable();
    let focused = second;

    const container = {
      querySelectorAll: () => [first, second],
    } as unknown as HTMLElement;

    const originalDocument = globalThis.document;
    globalThis.document = {
      activeElement: second,
    } as Document;

    try {
      let prevented = false;
      const handled = handleFocusTrapKeyDown(container, {
        key: "Tab",
        shiftKey: false,
        preventDefault: () => {
          prevented = true;
        },
      });

      assert.equal(handled, true);
      assert.equal(prevented, true);
      assert.equal(focused, first);
    } finally {
      globalThis.document = originalDocument;
    }
  });
});

describe("focus restore helpers", () => {
  it("prefers an explicit restore target", () => {
    const launcher = { focus() {} };

    assert.equal(
      getFocusRestoreTarget({ current: launcher as HTMLElement }, {
        focus() {},
      } as Element),
      launcher,
    );
  });

  it("falls back to the previously focused element", () => {
    const previous = { focus() {} };

    assert.equal(
      getFocusRestoreTarget(undefined, previous as Element),
      previous,
    );
  });

  it("returns null when nothing can be restored", () => {
    assert.equal(getFocusRestoreTarget(undefined, null), null);
    assert.equal(getFocusRestoreTarget({ current: null }, null), null);
  });
});
