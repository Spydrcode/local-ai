import { redis } from "./redis";

/**
 * Distributed rate limiter using Upstash Redis.
 * Allows `limit` requests per `windowSeconds` per key.
 */
export async function rateLimit(
  key: string,
  limit = 10,
  windowSeconds = 60
): Promise<{ allowed: boolean; remaining: number; reset: number }> {
  const now = Math.floor(Date.now() / 1000);
  const windowKey = `ratelimit:${key}:${Math.floor(now / windowSeconds)}`;
  const tx = redis.multi();
  tx.incr(windowKey);
  tx.expire(windowKey, windowSeconds);
  const results = await tx.exec();
  const count = (results?.[0] as number) || 0;
  return {
    allowed: count <= limit,
    remaining: Math.max(0, limit - count),
    reset: (Math.floor(now / windowSeconds) + 1) * windowSeconds,
  };
}
