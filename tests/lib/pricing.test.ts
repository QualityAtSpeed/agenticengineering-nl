import { describe, it, expect } from 'vitest';
import { priceWithVat, VAT_RATE } from '@/lib/pricing';

describe('priceWithVat', () => {
  it('adds 21% VAT to the pilot net price in integer cents', () => {
    expect(VAT_RATE).toBe(0.21);
    const p = priceWithVat('pilot');
    expect(p.netCents).toBe(34900); // €349
    expect(p.vatCents).toBe(7329); // round(34900 * 0.21) = 7329
    expect(p.grossCents).toBe(42229); // €422.29
  });

  it('computes basic and advanced consistently', () => {
    expect(priceWithVat('basic').grossCents).toBe(169279); // round(139900*1.21)
    expect(priceWithVat('advanced').grossCents).toBe(120879); // round(99900*1.21)
  });

  it('gross equals net plus vat', () => {
    const p = priceWithVat('pilot');
    expect(p.grossCents).toBe(p.netCents + p.vatCents);
  });
});
