import { Redis } from "@upstash/redis";

/**
 * Daily credit limiter for the visualizer.
 *
 * Uses Upstash Redis when UPSTASH_REDIS_REST_URL/TOKEN are set (required in
 * production — serverless instances don't share memory). Falls back to an
 * in-memory map for local dev.
 */

export const DAILY_LIMIT = 3;
/** Per-IP ceiling so clearing the visitor cookie doesn't grant unlimited credits. */
const IP_DAILY_LIMIT = 9;
const TTL_SECONDS = 26 * 60 * 60;

const memory = new Map<string, { count: number; expires: number }>();

function redis(): Redis | null {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    return new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return null;
}

async function increment(key: string): Promise<number> {
  const r = redis();
  if (r) {
    const count = await r.incr(key);
    if (count === 1) await r.expire(key, TTL_SECONDS);
    return count;
  }
  const now = Date.now();
  const entry = memory.get(key);
  if (!entry || entry.expires < now) {
    memory.set(key, { count: 1, expires: now + TTL_SECONDS * 1000 });
    return 1;
  }
  entry.count += 1;
  return entry.count;
}

async function currentCount(key: string): Promise<number> {
  const r = redis();
  if (r) return (await r.get<number>(key)) ?? 0;
  const entry = memory.get(key);
  return entry && entry.expires > Date.now() ? entry.count : 0;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

export async function getRemainingCredits(visitorId: string): Promise<number> {
  const used = await currentCount(`viz:${today()}:v:${visitorId}`);
  return Math.max(0, DAILY_LIMIT - used);
}

/**
 * Consume one generation credit. Returns whether the request may proceed and
 * how many credits remain for the visitor today.
 */
export async function consumeCredit(
  visitorId: string,
  ip: string
): Promise<{ allowed: boolean; remaining: number }> {
  const day = today();
  const visitorCount = await increment(`viz:${day}:v:${visitorId}`);
  if (visitorCount > DAILY_LIMIT) {
    return { allowed: false, remaining: 0 };
  }
  const ipCount = await increment(`viz:${day}:ip:${ip}`);
  if (ipCount > IP_DAILY_LIMIT) {
    return { allowed: false, remaining: 0 };
  }
  return { allowed: true, remaining: DAILY_LIMIT - visitorCount };
}

/** Return a credit when generation fails — the customer got nothing for it. */
export async function refundCredit(visitorId: string, ip: string): Promise<void> {
  const day = today();
  const r = redis();
  if (r) {
    await Promise.all([r.decr(`viz:${day}:v:${visitorId}`), r.decr(`viz:${day}:ip:${ip}`)]);
    return;
  }
  for (const key of [`viz:${day}:v:${visitorId}`, `viz:${day}:ip:${ip}`]) {
    const entry = memory.get(key);
    if (entry && entry.count > 0) entry.count -= 1;
  }
}

/** Simple abuse guard for the lead endpoint: max N submissions/day/IP. */
export async function consumeLeadSlot(ip: string): Promise<boolean> {
  const count = await increment(`lead:${today()}:ip:${ip}`);
  return count <= 10;
}
