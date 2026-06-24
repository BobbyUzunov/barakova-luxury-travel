import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const rateLimitWindowMs = 60_000;
const maxRequestsPerWindow = 5;
const requestLog = new Map<string, { count: number; resetAt: number }>();

function createUpstashLimiter() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  const redis = new Redis({ url, token });

  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(maxRequestsPerWindow, "1 m"),
    prefix: "barakova-contact",
  });
}

const upstashLimiter = createUpstashLimiter();

function isRateLimitedInMemory(ip: string) {
  const now = Date.now();
  const current = requestLog.get(ip);

  if (!current || current.resetAt <= now) {
    requestLog.set(ip, { count: 1, resetAt: now + rateLimitWindowMs });
    return false;
  }

  current.count += 1;
  return current.count > maxRequestsPerWindow;
}

export async function isContactRateLimited(ip: string) {
  if (upstashLimiter) {
    const { success } = await upstashLimiter.limit(ip);
    return !success;
  }

  return isRateLimitedInMemory(ip);
}
