import { describe, it, expect, vi, beforeEach } from 'vitest';

const createMock = vi.fn();
vi.mock('@/lib/stripe', () => ({
  getStripe: () => ({ checkout: { sessions: { create: createMock } } }),
}));

import { POST } from '@/app/api/checkout/route';
import { __resetRateLimitForTests } from '@/lib/rate-limit';

const validBody = {
  trainingId: 'pilot',
  attendees: [{ name: 'Pascal', email: 'pascal@example.com' }],
};

function make(body: unknown, headers: Record<string, string> = {}) {
  return new Request('https://agenticengineering.nl/api/checkout', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      origin: 'https://agenticengineering.nl',
      'x-forwarded-for': '5.5.5.5',
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  __resetRateLimitForTests();
  process.env.STRIPE_SECRET_KEY = 'sk_test_123';
  createMock.mockResolvedValue({ url: 'https://checkout.stripe.com/c/session_abc' });
});

describe('POST /api/checkout', () => {
  it('200 returns the session url and prices server-side', async () => {
    const res = await POST(make(validBody));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ url: 'https://checkout.stripe.com/c/session_abc' });
    const arg = createMock.mock.calls[0][0];
    expect(arg.mode).toBe('payment');
    expect(arg.line_items[0].price_data.unit_amount).toBe(42229);
    expect(arg.line_items[0].quantity).toBe(1);
    expect(arg.metadata.trainingId).toBe('pilot');
    expect(arg.metadata.attendee_0).toContain('pascal@example.com');
  });

  it('enables promotion-code redemption (referral / discount codes)', async () => {
    await POST(make(validBody));
    expect(createMock.mock.calls[0][0].allow_promotion_codes).toBe(true);
  });

  it('prices discount-aug-26 with the early-bird discount before the deadline (server-enforced)', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-15T12:00:00+02:00'));
    try {
      const res = await POST(
        make({ trainingId: 'discount-aug-26', attendees: [{ name: 'A', email: 'a@x.com' }] }),
      );
      expect(res.status).toBe(200);
      const arg = createMock.mock.calls[0][0];
      // €1399 net → 30% off → €979,30 net → +21% VAT = 118495 cents gross
      expect(arg.line_items[0].price_data.unit_amount).toBe(118495);
      expect(arg.metadata.trainingId).toBe('discount-aug-26');
      expect(arg.success_url).toContain('/trainings/discount-aug-26/book/success');
    } finally {
      vi.useRealTimers();
    }
  });

  it('prices discount-aug-26 at the full price after the deadline', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-15T12:00:00+02:00'));
    try {
      await POST(
        make({ trainingId: 'discount-aug-26', attendees: [{ name: 'A', email: 'a@x.com' }] }),
      );
      // €1399 net → +21% VAT = 169279 cents gross, no discount
      expect(createMock.mock.calls[0][0].line_items[0].price_data.unit_amount).toBe(169279);
    } finally {
      vi.useRealTimers();
    }
  });

  it('ignores any client-supplied amount (no price tampering)', async () => {
    await POST(make({ ...validBody, amount: 1, priceEUR: 1 }));
    expect(createMock.mock.calls[0][0].line_items[0].price_data.unit_amount).toBe(42229);
  });

  it('multiplies quantity by attendee count', async () => {
    await POST(
      make({
        trainingId: 'pilot',
        attendees: [
          { name: 'A', email: 'a@x.com' },
          { name: 'B', email: 'b@x.com' },
        ],
      }),
    );
    expect(createMock.mock.calls[0][0].line_items[0].quantity).toBe(2);
  });

  it('400 on invalid payload', async () => {
    const res = await POST(make({ trainingId: 'pilot', attendees: [] }));
    expect(res.status).toBe(400);
  });

  it('403 on cross-origin', async () => {
    const res = await POST(make(validBody, { origin: 'https://evil.example' }));
    expect(res.status).toBe(403);
  });

  it('429 on rate limit', async () => {
    for (let i = 0; i < 5; i++) await POST(make(validBody));
    const res = await POST(make(validBody));
    expect(res.status).toBe(429);
  });
});
