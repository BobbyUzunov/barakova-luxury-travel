import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getMobileMenuInertAttribute } from "./mobile-menu-a11y.ts";
import { resetTurnstileChallenge } from "./turnstile-reset.ts";

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
