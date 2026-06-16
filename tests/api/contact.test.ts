import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/email', async () => {
  const actual = await vi.importActual<typeof import('@/lib/email')>('@/lib/email');
  return { ...actual, sendContactRegistrationEmails: vi.fn().mockResolvedValue(undefined) };
});

import { POST } from '@/app/api/contact/route';
import { __resetRateLimitForTests } from '@/lib/rate-limit';
import { sendContactRegistrationEmails } from '@/lib/email';

const validBody = {
  name: 'Pascal',
  email: 'pascal@example.com',
  company: 'ValidateIT',
  trainingInterest: 'basic',
  deliveryPref: 'remote',
  message: 'I am interested in the basic training.',
  website: '',
};

function make(body: unknown, headers: Record<string, string> = {}) {
  return new Request('https://agenticengineering.nl/api/contact', {
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
  process.env.RESEND_API_KEY = 'test';
  process.env.CONTACT_EMAIL = 'hello@agenticengineering.nl';
  process.env.CONTACT_FROM_EMAIL = 'noreply@agenticengineering.nl';
});

describe('POST /api/contact', () => {
  it('200 on valid payload + sends email', async () => {
    const res = await POST(make(validBody));
    expect(res.status).toBe(200);
    expect(sendContactRegistrationEmails).toHaveBeenCalledTimes(1);
  });

  it('400 on invalid payload', async () => {
    const res = await POST(make({ ...validBody, email: 'not-email' }));
    expect(res.status).toBe(400);
  });

  it('403 on cross-origin', async () => {
    const res = await POST(make(validBody, { origin: 'https://evil.example' }));
    expect(res.status).toBe(403);
  });

  it('200 silent drop on honeypot (any truthy value, any type)', async () => {
    for (const website of ['spam', true, 123, ['x'], { a: 1 }]) {
      vi.clearAllMocks();
      const res = await POST(make({ ...validBody, website }));
      expect(res.status).toBe(200);
      expect(sendContactRegistrationEmails).not.toHaveBeenCalled();
    }
  });

  it('429 on rate limit', async () => {
    for (let i = 0; i < 5; i++) await POST(make(validBody));
    const res = await POST(make(validBody));
    expect(res.status).toBe(429);
  });

  it('502 on email error', async () => {
    (sendContactRegistrationEmails as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('boom'),
    );
    const res = await POST(make(validBody));
    expect(res.status).toBe(502);
  });
});
