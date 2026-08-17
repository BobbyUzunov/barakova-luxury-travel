import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import {
  checkInMemoryRateLimit,
  cleanupExpiredRateLimitEntries,
  getRateLimitCleanupRunCountForTests,
  resetRateLimitCleanupStateForTests,
  type InMemoryRateLimitEntry,
  type RateLimitCleanupPolicy,
} from "./in-memory-rate-limit";

const fastTestPolicy: RateLimitCleanupPolicy = {
  cooldownMs: 100,
  intervalMs: 1_000,
  requestThreshold: 5,
  sizeThreshold: 3,
};

afterEach(() => {
  resetRateLimitCleanupStateForTests();
});

describe("in-memory rate limit cleanup", () => {
  it("removes expired entries during cleanup", () => {
    const store = new Map<string, InMemoryRateLimitEntry>([
      ["expired", { count: 2, resetAt: 100 }],
      ["active", { count: 1, resetAt: 500 }],
    ]);

    cleanupExpiredRateLimitEntries(store, 200);

    assert.equal(store.has("expired"), false);
    assert.equal(store.get("active")?.count, 1);
  });

  it("resets the window after expiry for the current IP", () => {
    const store = new Map<string, InMemoryRateLimitEntry>();
    const windowMs = 60_000;

    assert.equal(
      checkInMemoryRateLimit("1.1.1.1", store, 5, 1_000, windowMs, fastTestPolicy),
      false,
    );
    assert.equal(store.get("1.1.1.1")?.count, 1);

    assert.equal(
      checkInMemoryRateLimit("1.1.1.1", store, 5, 61_500, windowMs, fastTestPolicy),
      false,
    );
    assert.equal(store.get("1.1.1.1")?.count, 1);
    assert.equal(store.get("1.1.1.1")?.resetAt, 61_500 + windowMs);
  });

  it("does not run global cleanup on every request", () => {
    const store = new Map<string, InMemoryRateLimitEntry>([
      ["old-ip", { count: 5, resetAt: 1_000 }],
    ]);
    const now = 500;
    const noCleanupPolicy: RateLimitCleanupPolicy = {
      cooldownMs: 5_000,
      intervalMs: 60_000,
      requestThreshold: 20,
      sizeThreshold: 20,
    };

    for (let attempt = 0; attempt < 4; attempt += 1) {
      checkInMemoryRateLimit(
        `10.0.0.${attempt}`,
        store,
        5,
        now + attempt,
        60_000,
        noCleanupPolicy,
      );
    }

    assert.equal(getRateLimitCleanupRunCountForTests(), 0);
    assert.equal(store.has("old-ip"), true);
  });

  it("applies a cooldown after a size-triggered cleanup", () => {
    const store = new Map<string, InMemoryRateLimitEntry>([
      ["one", { count: 1, resetAt: 10_000 }],
      ["two", { count: 1, resetAt: 10_000 }],
      ["three", { count: 1, resetAt: 10_000 }],
    ]);

    checkInMemoryRateLimit("four", store, 5, 5_000, 60_000, fastTestPolicy);
    assert.equal(getRateLimitCleanupRunCountForTests(), 1);

    checkInMemoryRateLimit("five", store, 5, 5_001, 60_000, fastTestPolicy);
    checkInMemoryRateLimit("six", store, 5, 5_002, 60_000, fastTestPolicy);

    assert.equal(getRateLimitCleanupRunCountForTests(), 1);

    checkInMemoryRateLimit("seven", store, 5, 5_101, 60_000, fastTestPolicy);
    assert.equal(getRateLimitCleanupRunCountForTests(), 2);
  });

  it("removes expired entries once the cleanup threshold is reached", () => {
    const store = new Map<string, InMemoryRateLimitEntry>([
      ["old-ip", { count: 5, resetAt: 1_000 }],
      ["current-ip", { count: 1, resetAt: 10_000 }],
    ]);

    checkInMemoryRateLimit("new-ip", store, 5, 5_000, 60_000, fastTestPolicy);

    assert.equal(getRateLimitCleanupRunCountForTests(), 1);
    assert.equal(store.has("old-ip"), false);
    assert.equal(store.has("current-ip"), true);
    assert.equal(store.has("new-ip"), true);
  });

  it("blocks requests above the configured limit within the window", () => {
    const store = new Map<string, InMemoryRateLimitEntry>();
    const now = 10_000;
    const windowMs = 60_000;

    for (let attempt = 0; attempt < 5; attempt += 1) {
      assert.equal(
        checkInMemoryRateLimit(
          "9.9.9.9",
          store,
          5,
          now + attempt,
          windowMs,
          fastTestPolicy,
        ),
        false,
      );
    }

    assert.equal(
      checkInMemoryRateLimit(
        "9.9.9.9",
        store,
        5,
        now + 5,
        windowMs,
        fastTestPolicy,
      ),
      true,
    );
  });
});
