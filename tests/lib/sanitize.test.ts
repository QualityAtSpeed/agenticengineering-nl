import { describe, it, expect } from 'vitest';
import { stripCRLF } from '@/lib/sanitize';

describe('stripCRLF', () => {
  it('removes \\r and \\n', () => {
    expect(stripCRLF('hi\r\nthere')).toBe('hithere');
  });
  it('returns empty for empty input', () => {
    expect(stripCRLF('')).toBe('');
  });
  it('is a no-op on safe strings', () => {
    expect(stripCRLF('Hello world')).toBe('Hello world');
  });
  it('strips U+2028, U+2029, and U+0000', () => {
    expect(stripCRLF('hi\u2028there\u2029end\u0000done')).toBe('hithereenddone');
  });
});
