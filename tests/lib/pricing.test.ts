import { describe, it, expect } from 'vitest';
import { priceWithVat, priceFor, VAT_RATE } from '@/lib/pricing';

describe('priceWithVat', () => {
  it('adds 21% VAT to the pilot net price in integer cents', () => {
    expect(VAT_RATE).toBe(0.21);
    const p = priceWithVat('pilot');
    expect(p.netCents).toBe(34900); // €349
    expect(p.vatCents).toBe(7329); // round(34900 * 0.21) = 7329
    expect(p.grossCents).toBe(42229); // €422.29
  });

  it('computes basic and advanced consistently', () => {
    expect(priceWithVat('basic').grossCents).toBe(120879); // round(99900*1.21)
    expect(priceWithVat('advanced').grossCents).toBe(120879); // round(99900*1.21)
  });

  it('gross equals net plus vat', () => {
    const p = priceWithVat('pilot');
    expect(p.grossCents).toBe(p.netCents + p.vatCents);
  });
});

describe('priceFor — early-bird', () => {
  const beforeDeadline = new Date('2026-07-15T12:00:00+02:00');
  const afterDeadline = new Date('2026-08-15T12:00:00+02:00');

  it('applies the 30% early-bird discount before the deadline (discount-aug-26)', () => {
    const p = priceFor('discount-aug-26', beforeDeadline);
    expect(p.earlyBird).toBe(true);
    expect(p.baseNetCents).toBe(99900); // €999 base
    expect(p.netCents).toBe(69930); // 30% off → €699.30
    expect(p.vatCents).toBe(14685); // round(69930 * 0.21)
    expect(p.grossCents).toBe(84615);
  });

  it('charges the full price on/after the deadline (discount-aug-26)', () => {
    const p = priceFor('discount-aug-26', afterDeadline);
    expect(p.earlyBird).toBe(false);
    expect(p.netCents).toBe(99900); // full €999
    expect(p.baseNetCents).toBe(99900);
  });

  it('the deadline is exclusive — 1 Aug 00:00 is already full price', () => {
    const p = priceFor('discount-aug-26', new Date('2026-08-01T00:00:00+02:00'));
    expect(p.earlyBird).toBe(false);
  });

  it('trainings without early-bird are unaffected by the date', () => {
    const a = priceFor('pilot', beforeDeadline);
    const b = priceFor('pilot', afterDeadline);
    expect(a.earlyBird).toBe(false);
    expect(a.netCents).toBe(34900);
    expect(a.grossCents).toBe(b.grossCents);
  });
});
