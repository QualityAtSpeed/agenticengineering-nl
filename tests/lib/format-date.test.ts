import { describe, it, expect } from 'vitest';
import { formatTrainingDate, formatTrainingDateRange } from '@/lib/format-date';
import { trainings } from '@/data/trainings';

describe('formatTrainingDate', () => {
  it('formats an ISO date as "D MMMM" in Dutch', () => {
    expect(formatTrainingDate('2026-09-21', 'nl')).toBe('21 september');
    expect(formatTrainingDate('2026-06-29', 'nl')).toBe('29 juni');
  });

  it('formats an ISO date as "D MMMM" in British English', () => {
    expect(formatTrainingDate('2026-09-21', 'en')).toBe('21 September');
    expect(formatTrainingDate('2026-06-29', 'en')).toBe('29 June');
  });

  it('is timezone-stable — no off-by-one from UTC date parsing', () => {
    expect(formatTrainingDate('2026-01-01', 'nl')).toBe('1 januari');
  });
});

// Guards the booking-success confirmation line: it must show the start date of the
// training that was actually booked (not a hardcoded date). Pins the two scheduled
// trainings whose /book/success pages use this.
describe('booking-success confirmation date per training', () => {
  it('derives the booked training start date', () => {
    const pilot = trainings.pilot.schedule;
    const discount = trainings['discount-aug-26'].schedule;
    expect(pilot, 'pilot has a schedule').toBeDefined();
    expect(discount, 'discount-aug-26 has a schedule').toBeDefined();
    expect(formatTrainingDate(pilot!.startDate, 'nl')).toBe('29 juni');
    expect(formatTrainingDate(discount!.startDate, 'nl')).toBe('21 september');
    expect(formatTrainingDate(discount!.startDate, 'en')).toBe('21 September');
  });
});

describe('formatTrainingDateRange', () => {
  it('joins two days in the same month (Dutch)', () => {
    expect(formatTrainingDateRange('2026-06-29', '2026-06-30', 'nl')).toBe('29 en 30 juni 2026');
    expect(formatTrainingDateRange('2026-09-21', '2026-09-22', 'nl')).toBe(
      '21 en 22 september 2026',
    );
  });

  it('spells out both months when the range crosses a month', () => {
    expect(formatTrainingDateRange('2026-06-30', '2026-07-01', 'nl')).toBe(
      '30 juni en 1 juli 2026',
    );
  });

  it('collapses a single-day range to one date', () => {
    expect(formatTrainingDateRange('2026-09-21', '2026-09-21', 'nl')).toBe('21 september 2026');
  });

  it('uses the locale conjunction and month names (English)', () => {
    expect(formatTrainingDateRange('2026-06-29', '2026-06-30', 'en')).toBe('29 and 30 June 2026');
  });
});
