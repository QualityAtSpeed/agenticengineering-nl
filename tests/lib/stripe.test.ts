import { describe, it, expect, beforeEach } from 'vitest';
import { getStripe, __resetStripeForTests } from '@/lib/stripe';

beforeEach(() => {
  __resetStripeForTests();
  delete process.env.STRIPE_SECRET_KEY;
});

describe('getStripe', () => {
  it('throws when STRIPE_SECRET_KEY is missing', () => {
    expect(() => getStripe()).toThrow(/STRIPE_SECRET_KEY/);
  });

  it('returns a Stripe instance when the key is set', () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_123';
    const stripe = getStripe();
    expect(stripe.checkout?.sessions).toBeDefined();
    expect(stripe.webhooks?.constructEvent).toBeTypeOf('function');
  });
});
