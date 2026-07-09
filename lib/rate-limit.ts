import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const rateLimitWindowMs = 60_000;
const maxContactRequestsPerWindow = 5;
const maxChatRequestsPerWindow = 20;
const requestLog = new Map<string, { count: number; resetAt: number }>();
const chatRequestLog = new Map<string, { count: number; resetAt: number }>();

function createUpstashLimiter(prefix: string, maxRequests: number) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  const redis = new Redis({ url, token });

  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(maxRequests, "1 m"),
    prefix,
  });
}

const upstashContactLimiter = createUpstashLimiter(
  "barakova-contact",
  maxContactRequestsPerWindow,
);
const upstashChatLimiter = createUpstashLimiter(
  "barakova-chat",
  maxChatRequestsPerWindow,
);

function isRateLimitedInMemory(
  ip: string,
  store: Map<string, { count: number; resetAt: number }>,
  maxRequests: number,
) {
  const now = Date.now();
  const current = store.get(ip);

  if (!current || current.resetAt <= now) {
    store.set(ip, { count: 1, resetAt: now + rateLimitWindowMs });
    return false;
  }

  current.count += 1;
  return current.count > maxRequests;
}

async function isRateLimited(
  ip: string,
  limiter: Ratelimit | null,
  store: Map<string, { count: number; resetAt: number }>,
  maxRequests: number,
) {
  if (limiter) {
    try {
      const { success } = await limiter.limit(ip);
      return !success;
    } catch {
      return isRateLimitedInMemory(ip, store, maxRequests);
    }
  }

  return isRateLimitedInMemory(ip, store, maxRequests);
}

export async function isContactRateLimited(ip: string) {
  return isRateLimited(
    ip,
    upstashContactLimiter,
    requestLog,
    maxContactRequestsPerWindow,
  );
}

export async function isChatRateLimited(ip: string) {
  return isRateLimited(
    ip,
    upstashChatLimiter,
    chatRequestLog,
    maxChatRequestsPerWindow,
  );
}
