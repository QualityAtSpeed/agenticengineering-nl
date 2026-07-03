import { describe, it, expect, afterEach } from 'vitest';
import { testimonialsEnabled } from '@/lib/flags';

const original = process.env.TESTIMONIALS_ENABLED;

afterEach(() => {
  if (original === undefined) delete process.env.TESTIMONIALS_ENABLED;
  else process.env.TESTIMONIALS_ENABLED = original;
});

describe('testimonialsEnabled', () => {
  it('returns true only when the env var is exactly "true"', () => {
    process.env.TESTIMONIALS_ENABLED = 'true';
    expect(testimonialsEnabled()).toBe(true);
  });

  it('returns false when unset', () => {
    delete process.env.TESTIMONIALS_ENABLED;
    expect(testimonialsEnabled()).toBe(false);
  });

  it('returns false for any non-"true" value', () => {
    process.env.TESTIMONIALS_ENABLED = '1';
    expect(testimonialsEnabled()).toBe(false);
  });
});
