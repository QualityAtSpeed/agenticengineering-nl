import Stripe from 'stripe';

let client: Stripe | null = null;

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY missing');
  if (!client) client = new Stripe(key);
  return client;
}

// Test-only: reset the memoised client so env changes take effect.
export function __resetStripeForTests() {
  client = null;
}
