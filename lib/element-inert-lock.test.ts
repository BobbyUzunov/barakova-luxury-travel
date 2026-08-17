import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import {
  lockElementInert,
  resetElementInertLockForTests,
} from "./element-inert-lock";

type MockElement = {
  inert: boolean;
};

function createMockElement(initialInert = false) {
  return { inert: initialInert } as MockElement as HTMLElement;
}

afterEach(() => {
  // Locks are cleared when unlock callbacks run in each test.
});

describe("element inert lock", () => {
  it("locks and unlocks a single element", () => {
    const element = createMockElement();

    const unlock = lockElementInert(element);
    assert.equal(element.inert, true);

    unlock();
    assert.equal(element.inert, false);
    resetElementInertLockForTests(element);
  });

  it("keeps inert while two locks are active", () => {
    const element = createMockElement();
    const unlockA = lockElementInert(element);
    const unlockB = lockElementInert(element);

    assert.equal(element.inert, true);

    unlockA();
    assert.equal(element.inert, true);

    unlockB();
    assert.equal(element.inert, false);
    resetElementInertLockForTests(element);
  });

  it("does not remove inert when one lock remains active", () => {
    const element = createMockElement();
    const unlockA = lockElementInert(element);
    const unlockB = lockElementInert(element);

    unlockA();
    assert.equal(element.inert, true);

    unlockB();
    assert.equal(element.inert, false);
    resetElementInertLockForTests(element);
  });

  it("restores the original inert=true state", () => {
    const element = createMockElement(true);
    const unlock = lockElementInert(element);

    assert.equal(element.inert, true);

    unlock();
    assert.equal(element.inert, true);
    resetElementInertLockForTests(element);
  });
});
