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
  const beforeDeadline = new Date('2026-09-10T12:00:00+02:00');
  const afterDeadline = new Date('2026-09-15T12:00:00+02:00');

  it('applies the 30% early-bird discount before the deadline (discount-aug-26)', () => {
    const p = priceFor('discount-aug-26', beforeDeadline);
    expect(p.earlyBird).toBe(true);
    expect(p.baseNetCents).toBe(99900); // €999 base
    expect(p.netCents).toBe(69900); // €999 −30% floored to whole euros → €699
    expect(p.vatCents).toBe(14679); // round(69900 * 0.21)
    expect(p.grossCents).toBe(84579);
  });

  it('charges the full price on/after the deadline (discount-aug-26)', () => {
    const p = priceFor('discount-aug-26', afterDeadline);
    expect(p.earlyBird).toBe(false);
    expect(p.netCents).toBe(99900); // full €999
    expect(p.baseNetCents).toBe(99900);
  });

  it('the deadline is exclusive — 15 Sep 00:00 is already full price', () => {
    const p = priceFor('discount-aug-26', new Date('2026-09-15T00:00:00+02:00'));
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
