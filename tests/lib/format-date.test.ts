import { describe, it, expect } from 'vitest';
import { formatTrainingDate } from '@/lib/format-date';
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
