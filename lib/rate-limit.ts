const WINDOW_MS = 60_000;
const LIMIT = 5;

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();
let callsSinceSweep = 0;

export function checkRateLimit(ip: string): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now();
  callsSinceSweep += 1;
  if (callsSinceSweep >= 100) {
    callsSinceSweep = 0;
    for (const [k, v] of buckets) {
      if (v.resetAt <= now) buckets.delete(k);
    }
  }
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
  callsSinceSweep = 0;
}
