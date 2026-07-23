import { describe, it, expect } from 'vitest';
import { toLocale } from '@/lib/locale';

describe('toLocale', () => {
  it('accepts supported locales', () => {
    expect(toLocale('nl')).toBe('nl');
    expect(toLocale('en')).toBe('en');
  });

  it('falls back to the default locale for anything unsupported', () => {
    // Also guards against user-supplied junk landing in a redirect URL.
    expect(toLocale('de')).toBe('nl');
    expect(toLocale('')).toBe('nl');
    expect(toLocale(undefined)).toBe('nl');
    expect(toLocale('../../evil')).toBe('nl');
    expect(toLocale(42)).toBe('nl');
  });
});
