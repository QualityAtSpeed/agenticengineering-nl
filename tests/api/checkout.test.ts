import { describe, it, expect, vi, beforeEach } from 'vitest';

const createMock = vi.fn();
const listMock = vi.fn();
vi.mock('@/lib/stripe', () => ({
  getStripe: () => ({
    checkout: { sessions: { create: createMock } },
    promotionCodes: { list: listMock },
  }),
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
  listMock.mockResolvedValue({ data: [] });
});

describe('POST /api/checkout', () => {
  // pilot is sold out (409), so the bookable happy-path uses discount-aug-26.
  // Pinned after the early-bird deadline for a deterministic full price.
  const AFTER_DEADLINE = new Date('2026-08-15T12:00:00+02:00');
  const bookableBody = {
    trainingId: 'discount-aug-26',
    attendees: [{ name: 'Pascal', email: 'pascal@example.com' }],
  };

  it('200 returns the session url and prices server-side', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(AFTER_DEADLINE);
    try {
      const res = await POST(make(bookableBody));
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ url: 'https://checkout.stripe.com/c/session_abc' });
      const arg = createMock.mock.calls[0][0];
      expect(arg.mode).toBe('payment');
      expect(arg.line_items[0].price_data.unit_amount).toBe(169279);
      expect(arg.line_items[0].quantity).toBe(1);
      expect(arg.metadata.trainingId).toBe('discount-aug-26');
      expect(arg.metadata.attendee_0).toContain('pascal@example.com');
    } finally {
      vi.useRealTimers();
    }
  });

  it('enables promotion-code redemption for bookable trainings, alongside the attribution metadata', async () => {
    await POST(make(validBody));
    const pilotArg = createMock.mock.calls[0][0];
    expect(pilotArg.allow_promotion_codes).toBe(true);
    // coexists with the metadata the referral program ties a redemption back to
    expect(pilotArg.metadata.trainingId).toBe('pilot');

    vi.clearAllMocks();
    await POST(
      make({ trainingId: 'discount-aug-26', attendees: [{ name: 'A', email: 'a@x.com' }] }),
    );
    const discArg = createMock.mock.calls[0][0];
    expect(discArg.allow_promotion_codes).toBe(true);
    expect(discArg.metadata.trainingId).toBe('discount-aug-26');
  });

  it('applies a valid referral code as a Stripe discount and records attribution', async () => {
    listMock.mockResolvedValue({
      data: [{ id: 'promo_123', metadata: { referrer: 'piet@example.com' } }],
    });
    await POST(make({ ...validBody, referralCode: 'REF-7F3K9' }));
    expect(listMock).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'REF-7F3K9', active: true }),
    );
    const arg = createMock.mock.calls[0][0];
    expect(arg.discounts).toEqual([{ promotion_code: 'promo_123' }]);
    expect(arg.allow_promotion_codes).toBeUndefined();
    expect(arg.metadata.referralCode).toBe('REF-7F3K9');
    expect(arg.metadata.referrer).toBe('piet@example.com');
  });

  it('rejects an unknown / expired referral code with 400 and creates no session', async () => {
    listMock.mockResolvedValue({ data: [] });
    const res = await POST(make({ ...validBody, referralCode: 'NOPE' }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('invalid_referral');
    expect(createMock).not.toHaveBeenCalled();
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
    vi.useFakeTimers();
    vi.setSystemTime(AFTER_DEADLINE);
    try {
      await POST(make({ ...bookableBody, amount: 1, priceEUR: 1 }));
      expect(createMock.mock.calls[0][0].line_items[0].price_data.unit_amount).toBe(169279);
    } finally {
      vi.useRealTimers();
    }
  });

  it('multiplies quantity by attendee count', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(AFTER_DEADLINE);
    try {
      await POST(
        make({
          trainingId: 'discount-aug-26',
          attendees: [
            { name: 'A', email: 'a@x.com' },
            { name: 'B', email: 'b@x.com' },
          ],
        }),
      );
      expect(createMock.mock.calls[0][0].line_items[0].quantity).toBe(2);
    } finally {
      vi.useRealTimers();
    }
  });

  it('409 on a sold-out training (pilot), without creating a Stripe session', async () => {
    const res = await POST(make(validBody));
    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({ ok: false, error: 'sold_out' });
    expect(createMock).not.toHaveBeenCalled();
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
