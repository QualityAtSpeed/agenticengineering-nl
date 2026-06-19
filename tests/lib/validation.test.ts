import { describe, it, expect } from 'vitest';
import { contactSchema, bookingSchema } from '@/lib/validation';

const valid = {
  name: 'Pascal',
  email: 'pascal@example.com',
  company: 'ValidateIT',
  trainingInterest: 'basic',
  deliveryPref: 'remote',
  message: 'I am interested in the basic training for our team of 6.',
  website: '',
};

describe('contactSchema', () => {
  it('accepts a valid payload', () => {
    expect(contactSchema.safeParse(valid).success).toBe(true);
  });
  it('rejects missing name', () => {
    expect(contactSchema.safeParse({ ...valid, name: '' }).success).toBe(false);
  });
  it('rejects invalid email', () => {
    expect(contactSchema.safeParse({ ...valid, email: 'not-an-email' }).success).toBe(false);
  });
  it('rejects oversize message', () => {
    expect(contactSchema.safeParse({ ...valid, message: 'a'.repeat(5001) }).success).toBe(false);
  });
  it('rejects too-short message', () => {
    expect(contactSchema.safeParse({ ...valid, message: 'hi' }).success).toBe(false);
  });
  it('rejects unknown trainingInterest enum', () => {
    expect(
      contactSchema.safeParse({ ...valid, trainingInterest: 'mystery' as never }).success,
    ).toBe(false);
  });
  it('rejects honeypot filled', () => {
    expect(contactSchema.safeParse({ ...valid, website: 'http://spam' }).success).toBe(false);
  });
});

describe('bookingSchema', () => {
  const attendee = { name: 'Pascal', email: 'pascal@example.com' };

  it('accepts a pilot booking with one attendee', () => {
    expect(bookingSchema.safeParse({ trainingId: 'pilot', attendees: [attendee] }).success).toBe(
      true,
    );
  });

  it('accepts a najaar-2026 booking with one attendee', () => {
    expect(
      bookingSchema.safeParse({ trainingId: 'najaar-2026', attendees: [attendee] }).success,
    ).toBe(true);
  });

  it('rejects an empty attendee list', () => {
    expect(bookingSchema.safeParse({ trainingId: 'pilot', attendees: [] }).success).toBe(false);
  });

  it('rejects more than 10 attendees', () => {
    const many = Array.from({ length: 11 }, () => attendee);
    expect(bookingSchema.safeParse({ trainingId: 'pilot', attendees: many }).success).toBe(false);
  });

  it('rejects a bad email', () => {
    expect(
      bookingSchema.safeParse({
        trainingId: 'pilot',
        attendees: [{ name: 'X', email: 'not-email' }],
      }).success,
    ).toBe(false);
  });

  it('rejects a non-bookable trainingId (basic/advanced are not self-serve)', () => {
    expect(bookingSchema.safeParse({ trainingId: 'basic', attendees: [attendee] }).success).toBe(
      false,
    );
    expect(bookingSchema.safeParse({ trainingId: 'advanced', attendees: [attendee] }).success).toBe(
      false,
    );
  });
});
