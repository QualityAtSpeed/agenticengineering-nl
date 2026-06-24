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
  trainingId: 'pilot',
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
  const company = {
    company: 'ValidateIT',
    kvk: '12345678',
    street: 'Dokter Spanjaardweg 23',
    zipCode: '8025 BT',
    city: 'Zwolle',
    country: 'Nederland',
    notes: '',
  };
  const validBooking = { trainingId: 'pilot', attendees: [attendee], ...company };

  it('accepts a pilot booking with one attendee', () => {
    expect(bookingSchema.safeParse(validBooking).success).toBe(true);
  });

  it('accepts a discount-aug-26 booking with one attendee', () => {
    expect(
      bookingSchema.safeParse({ ...validBooking, trainingId: 'discount-aug-26' }).success,
    ).toBe(true);
  });

  it('accepts an empty kvk (optional)', () => {
    expect(bookingSchema.safeParse({ ...validBooking, kvk: '' }).success).toBe(true);
  });

  it('rejects a kvk that is not 8 digits', () => {
    expect(bookingSchema.safeParse({ ...validBooking, kvk: '123' }).success).toBe(false);
  });

  it('rejects a missing company name', () => {
    expect(bookingSchema.safeParse({ ...validBooking, company: '' }).success).toBe(false);
  });

  it('rejects a missing street', () => {
    expect(bookingSchema.safeParse({ ...validBooking, street: '' }).success).toBe(false);
  });

  it('accepts a non-Dutch postcode (loosened format)', () => {
    expect(
      bookingSchema.safeParse({ ...validBooking, zipCode: 'SW1A 1AA', country: 'United Kingdom' })
        .success,
    ).toBe(true);
  });

  it('rejects an empty attendee list', () => {
    expect(bookingSchema.safeParse({ ...validBooking, attendees: [] }).success).toBe(false);
  });

  it('rejects more than 10 attendees', () => {
    const many = Array.from({ length: 11 }, () => attendee);
    expect(bookingSchema.safeParse({ ...validBooking, attendees: many }).success).toBe(false);
  });

  it('rejects a bad email', () => {
    expect(
      bookingSchema.safeParse({
        ...validBooking,
        attendees: [{ name: 'X', email: 'not-email' }],
      }).success,
    ).toBe(false);
  });

  it('rejects a non-bookable trainingId (basic/advanced are not self-serve)', () => {
    expect(bookingSchema.safeParse({ ...validBooking, trainingId: 'basic' }).success).toBe(false);
    expect(bookingSchema.safeParse({ ...validBooking, trainingId: 'advanced' }).success).toBe(
      false,
    );
  });
});
