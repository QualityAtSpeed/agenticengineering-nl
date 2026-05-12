import { describe, it, expect, beforeEach, vi } from 'vitest';
import { checkRateLimit, __resetRateLimitForTests } from '@/lib/rate-limit';

beforeEach(() => __resetRateLimitForTests());

describe('checkRateLimit', () => {
  it('allows first 5 hits in a minute', () => {
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit('1.2.3.4').ok).toBe(true);
    }
  });
  it('blocks the 6th hit in a minute', () => {
    for (let i = 0; i < 5; i++) checkRateLimit('1.2.3.4');
    const r = checkRateLimit('1.2.3.4');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.retryAfterSec).toBeGreaterThan(0);
  });
  it('isolates IPs', () => {
    for (let i = 0; i < 5; i++) checkRateLimit('1.1.1.1');
    expect(checkRateLimit('2.2.2.2').ok).toBe(true);
  });
  it('rolls over after window', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T12:00:00Z'));
    for (let i = 0; i < 5; i++) checkRateLimit('9.9.9.9');
    expect(checkRateLimit('9.9.9.9').ok).toBe(false);
    vi.setSystemTime(new Date('2026-01-01T12:01:01Z'));
    expect(checkRateLimit('9.9.9.9').ok).toBe(true);
    vi.useRealTimers();
  });
});
