import { describe, it, expect, vi, beforeEach } from 'vitest';
import Stripe from 'stripe';

const confirmMock = vi.fn().mockResolvedValue({ id: 'c1' });
const notifyMock = vi.fn().mockResolvedValue({ id: 'n1' });
vi.mock('@/lib/email', () => ({
  sendBookingConfirmation: (...a: unknown[]) => confirmMock(...a),
  sendBookingNotification: (...a: unknown[]) => notifyMock(...a),
  EmailError: class extends Error {},
}));

import { POST, __resetWebhookDedupeForTests } from '@/app/api/stripe/webhook/route';

const SECRET = 'whsec_test_secret';
const stripe = new Stripe('sk_test_123');

function eventBody(id: string) {
  return JSON.stringify({
    id,
    type: 'checkout.session.completed',
    data: {
      object: {
        metadata: {
          trainingId: 'pilot',
          seats: '2',
          attendee_0: 'Pascal <pascal@example.com>',
          attendee_1: 'Sam <sam@example.com>',
        },
        amount_total: 84458,
      },
    },
  });
}

function signed(body: string) {
  const header = stripe.webhooks.generateTestHeaderString({ payload: body, secret: SECRET });
  return new Request('https://agenticengineering.nl/api/stripe/webhook', {
    method: 'POST',
    headers: { 'stripe-signature': header },
    body,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  __resetWebhookDedupeForTests();
  process.env.STRIPE_SECRET_KEY = 'sk_test_123';
  process.env.STRIPE_WEBHOOK_SECRET = SECRET;
  process.env.RESEND_API_KEY = 'test';
  process.env.CONTACT_EMAIL = 'hello@agenticengineering.nl';
  process.env.CONTACT_FROM_EMAIL = 'noreply@agenticengineering.nl';
});

describe('POST /api/stripe/webhook', () => {
  it('200 + fires both emails on a valid completed event', async () => {
    const res = await POST(signed(eventBody('evt_1')));
    expect(res.status).toBe(200);
    expect(confirmMock).toHaveBeenCalledTimes(1);
    expect(notifyMock).toHaveBeenCalledTimes(1);
    const detail = confirmMock.mock.calls[0][0];
    expect(detail.seats).toBe(2);
    expect(detail.grossCents).toBe(84458);
    expect(detail.attendees).toHaveLength(2);
    expect(detail.attendees[1]).toEqual({ name: 'Sam', email: 'sam@example.com' });
  });

  it('is idempotent — a redelivered event id does not resend', async () => {
    await POST(signed(eventBody('evt_dup')));
    await POST(signed(eventBody('evt_dup')));
    expect(confirmMock).toHaveBeenCalledTimes(1);
  });

  it('400 on a bad signature', async () => {
    const req = new Request('https://agenticengineering.nl/api/stripe/webhook', {
      method: 'POST',
      headers: { 'stripe-signature': 't=1,v1=bogus' },
      body: eventBody('evt_2'),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(confirmMock).not.toHaveBeenCalled();
  });

  it('200 + ignores unrelated event types', async () => {
    const body = JSON.stringify({
      id: 'evt_3',
      type: 'payment_intent.created',
      data: { object: {} },
    });
    const res = await POST(signed(body));
    expect(res.status).toBe(200);
    expect(confirmMock).not.toHaveBeenCalled();
  });

  it('500 + un-marks on confirmation failure, allowing retry', async () => {
    confirmMock.mockRejectedValueOnce(new Error('resend down'));
    const res1 = await POST(signed(eventBody('evt_fail')));
    expect(res1.status).toBe(500);
    // retry: confirmation now succeeds (default mock), event re-processed
    const res2 = await POST(signed(eventBody('evt_fail')));
    expect(res2.status).toBe(200);
    expect(confirmMock).toHaveBeenCalledTimes(2);
  });

  it('200 when only the internal notification fails (no customer-facing retry)', async () => {
    notifyMock.mockRejectedValueOnce(new Error('resend down'));
    const res = await POST(signed(eventBody('evt_notify_fail')));
    expect(res.status).toBe(200);
    expect(confirmMock).toHaveBeenCalledTimes(1);
  });
});
