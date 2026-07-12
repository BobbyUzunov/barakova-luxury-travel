import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { checkInMemoryRateLimit } from "./in-memory-rate-limit";

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
      return checkInMemoryRateLimit(
        ip,
        store,
        maxRequests,
        Date.now(),
        rateLimitWindowMs,
      );
    }
  }

  return checkInMemoryRateLimit(
    ip,
    store,
    maxRequests,
    Date.now(),
    rateLimitWindowMs,
  );
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

export {
  chatRequestLog,
  maxChatRequestsPerWindow,
  maxContactRequestsPerWindow,
  rateLimitWindowMs,
  requestLog,
};
