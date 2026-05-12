const WINDOW_MS = 60_000;
const LIMIT = 5;

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function checkRateLimit(ip: string): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now();
  const existing = buckets.get(ip);
  if (!existing || existing.resetAt <= now) {
    buckets.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true };
  }
  if (existing.count < LIMIT) {
    existing.count += 1;
    return { ok: true };
  }
  return { ok: false, retryAfterSec: Math.ceil((existing.resetAt - now) / 1000) };
}

export function __resetRateLimitForTests() {
  buckets.clear();
}
