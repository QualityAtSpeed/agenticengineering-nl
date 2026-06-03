import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendContactEmail, EmailError } from '@/lib/email';

const sendMock = vi.fn();

vi.mock('resend', () => {
  return {
    Resend: class {
      emails = { send: sendMock };
    },
  };
});

const payload = {
  name: 'Pascal',
  email: 'pascal@example.com',
  company: 'ValidateIT',
  trainingInterest: 'basic' as const,
  deliveryPref: 'remote' as const,
  message: 'I want to book the basic training.',
  website: '' as const,
};

beforeEach(() => {
  sendMock.mockReset();
  process.env.RESEND_API_KEY = 'test-key';
  process.env.CONTACT_EMAIL = 'hello@agenticengineering.nl';
  process.env.CONTACT_FROM_EMAIL = 'noreply@agenticengineering.nl';
});

describe('sendContactEmail', () => {
  it('sends email with stripped headers and reply-to', async () => {
    sendMock.mockResolvedValue({ data: { id: 'abc' }, error: null });
    await sendContactEmail({ ...payload, name: 'Pascal\r\nInjected: x' });
    expect(sendMock).toHaveBeenCalledTimes(1);
    const arg = sendMock.mock.calls[0][0];
    expect(arg.from).toBe('noreply@agenticengineering.nl');
    expect(arg.to).toBe('hello@agenticengineering.nl');
    expect(arg.replyTo).toBe('pascal@example.com');
    expect(arg.subject).not.toMatch(/[\r\n]/);
  });

  it('throws EmailError on Resend error', async () => {
    sendMock.mockResolvedValue({ data: null, error: { message: 'fail' } });
    await expect(sendContactEmail(payload)).rejects.toBeInstanceOf(EmailError);
  });

  it('throws EmailError on missing RESEND_API_KEY', async () => {
    delete process.env.RESEND_API_KEY;
    await expect(sendContactEmail(payload)).rejects.toBeInstanceOf(EmailError);
  });
});
