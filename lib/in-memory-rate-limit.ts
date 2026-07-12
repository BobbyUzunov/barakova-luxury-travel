export type InMemoryRateLimitEntry = {
  count: number;
  resetAt: number;
};

export type RateLimitCleanupPolicy = {
  cooldownMs: number;
  intervalMs: number;
  requestThreshold: number;
  sizeThreshold: number;
};

const defaultCleanupPolicy: RateLimitCleanupPolicy = {
  cooldownMs: 5_000,
  intervalMs: 60_000,
  requestThreshold: 50,
  sizeThreshold: 100,
};

let lastCleanupAt = 0;
let requestsSinceCleanup = 0;
let cleanupRunCount = 0;

export function cleanupExpiredRateLimitEntries(
  store: Map<string, InMemoryRateLimitEntry>,
  now: number,
) {
  cleanupRunCount += 1;

  for (const [ip, entry] of store) {
    if (entry.resetAt <= now) {
      store.delete(ip);
    }
  }
}

export function maybeCleanupExpiredRateLimitEntries(
  store: Map<string, InMemoryRateLimitEntry>,
  now: number,
  policy: RateLimitCleanupPolicy = defaultCleanupPolicy,
) {
  requestsSinceCleanup += 1;

  const timeSinceCleanup = now - lastCleanupAt;
  const intervalElapsed = timeSinceCleanup >= policy.intervalMs;
  const thresholdReached =
    store.size >= policy.sizeThreshold ||
    requestsSinceCleanup >= policy.requestThreshold;
  const shouldCleanup =
    intervalElapsed ||
    (thresholdReached && timeSinceCleanup >= policy.cooldownMs);

  if (!shouldCleanup) {
    return false;
  }

  cleanupExpiredRateLimitEntries(store, now);
  lastCleanupAt = now;
  requestsSinceCleanup = 0;
  return true;
}

export function checkInMemoryRateLimit(
  ip: string,
  store: Map<string, InMemoryRateLimitEntry>,
  maxRequests: number,
  now: number,
  windowMs: number,
  policy: RateLimitCleanupPolicy = defaultCleanupPolicy,
) {
  maybeCleanupExpiredRateLimitEntries(store, now, policy);

  const current = store.get(ip);

  if (!current || current.resetAt <= now) {
    if (current && current.resetAt <= now) {
      store.delete(ip);
    }

    store.set(ip, { count: 1, resetAt: now + windowMs });
    return false;
  }

  current.count += 1;
  return current.count > maxRequests;
}

export function getRateLimitCleanupRunCountForTests() {
  return cleanupRunCount;
}

export function resetRateLimitCleanupStateForTests() {
  lastCleanupAt = 0;
  requestsSinceCleanup = 0;
  cleanupRunCount = 0;
}
