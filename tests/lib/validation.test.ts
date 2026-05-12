import { describe, it, expect } from 'vitest';
import { contactSchema } from '@/lib/validation';

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
