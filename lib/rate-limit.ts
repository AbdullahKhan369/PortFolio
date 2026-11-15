/**
 * Small in-memory sliding-window rate limiter (owner: S4).
 *
 * Honest limits: on serverless hosts every warm instance has its own memory,
 * so this stops bursts and casual bots but is not a global guarantee.
 * /api/inquiries adds a database-backed check on top (see lib/api/flood.ts).
 */

export interface RateLimitOptions {
  /** Max hits allowed inside the window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  /** Seconds until the oldest hit leaves the window (0 when ok). */
  retryAfter: number;
}

const buckets = new Map<string, number[]>();
let lastSweep = 0;
const MAX_KEYS = 5000;

function sweep(now: number, windowMs: number) {
  if (now - lastSweep < 60_000 && buckets.size < MAX_KEYS) return;
  lastSweep = now;
  for (const [key, hits] of buckets) {
    const fresh = hits.filter((t) => now - t < windowMs);
    if (fresh.length === 0) buckets.delete(key);
    else buckets.set(key, fresh);
  }
  // Hard cap so a flood of unique keys cannot grow memory without bound.
  if (buckets.size > MAX_KEYS) {
    const overflow = buckets.size - MAX_KEYS;
    let i = 0;
    for (const key of buckets.keys()) {
      buckets.delete(key);
      if (++i >= overflow) break;
    }
  }
}

export function rateLimit(key: string, { limit, windowMs }: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  sweep(now, windowMs);

  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    const retryAfter = Math.max(1, Math.ceil((hits[0] + windowMs - now) / 1000));
    buckets.set(key, hits);
    return { ok: false, remaining: 0, retryAfter };
  }
  hits.push(now);
  buckets.set(key, hits);
  return { ok: true, remaining: limit - hits.length, retryAfter: 0 };
}
