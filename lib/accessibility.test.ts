import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getMobileMenuInertAttribute } from "./mobile-menu-a11y.ts";
import {
  shouldRestoreModalFocus,
  shouldRestoreModalFocusOnUnmount,
} from "./modal-focus-restore.ts";
import { resetTurnstileChallenge } from "./turnstile-reset.ts";

describe("modal focus restore helpers", () => {
  it("does not restore focus before a modal has opened", () => {
    assert.equal(shouldRestoreModalFocus(false, false), false);
  });

  it("restores focus only after a true to false transition", () => {
    assert.equal(shouldRestoreModalFocus(true, false), true);
    assert.equal(shouldRestoreModalFocus(true, true), false);
  });

  it("restores focus on unmount when the modal is still open", () => {
    assert.equal(shouldRestoreModalFocusOnUnmount(true, true), true);
    assert.equal(shouldRestoreModalFocusOnUnmount(true, false), false);
    assert.equal(shouldRestoreModalFocusOnUnmount(false, true), false);
  });
});

describe("turnstile retry reset", () => {
  it("clears token state and resets the widget after server errors", () => {
    let token = "turnstile-token";
    let resetCalls = 0;

    resetTurnstileChallenge(
      () => {
        token = "";
      },
      () => {
        resetCalls += 1;
      },
    );

    assert.equal(token, "");
    assert.equal(resetCalls, 1);
  });

  it("still clears token state when the widget ref is unavailable", () => {
    let token = "turnstile-token";

    resetTurnstileChallenge(() => {
      token = "";
    });

    assert.equal(token, "");
  });
});

describe("mobile menu accessibility helpers", () => {
  it("marks closed menu content as inert", () => {
    assert.equal(getMobileMenuInertAttribute(false), true);
  });

  it("removes inert when the menu is open", () => {
    assert.equal(getMobileMenuInertAttribute(true), undefined);
  });
});
