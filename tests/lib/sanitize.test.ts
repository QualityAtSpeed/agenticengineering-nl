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
});
