import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  sendContactEmail,
  sendContactQuestionnaire,
  sendContactRegistrationEmails,
  EmailError,
} from '@/lib/email';

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
    expect(arg.text).toContain('Nieuwe registratie / aanvraag');
    expect(arg.text).toContain('Questionnaire: automatisch verzonden');
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

describe('sendContactQuestionnaire', () => {
  it('emails the registrant with intake questions', async () => {
    sendMock.mockResolvedValue({ data: { id: 'q1' }, error: null });
    await sendContactQuestionnaire(payload);
    const arg = sendMock.mock.calls[0][0];
    expect(arg.from).toBe('noreply@agenticengineering.nl');
    expect(arg.to).toBe('pascal@example.com');
    expect(arg.replyTo).toBe('hello@agenticengineering.nl');
    expect(arg.subject).not.toMatch(/[\r\n]/);
    expect(arg.text).toContain('Voor hoeveel deelnemers');
    expect(arg.text).toContain('Je kunt gewoon op deze mail antwoorden.');
  });
});

describe('sendContactRegistrationEmails', () => {
  it('sends the operator overview and registrant questionnaire', async () => {
    sendMock.mockResolvedValue({ data: { id: 'ok' }, error: null });
    await sendContactRegistrationEmails(payload);
    expect(sendMock).toHaveBeenCalledTimes(2);
    expect(sendMock.mock.calls[0][0].to).toBe('hello@agenticengineering.nl');
    expect(sendMock.mock.calls[1][0].to).toBe('pascal@example.com');
  });
});

import { sendBookingConfirmation, sendBookingNotification, type BookingDetails } from '@/lib/email';

const booking: BookingDetails = {
  attendees: [
    { name: 'Pascal', email: 'pascal@example.com' },
    { name: 'Sam', email: 'sam@example.com' },
  ],
  seats: 2,
  grossCents: 84458,
};

describe('sendBookingConfirmation', () => {
  it('emails the first attendee and strips header injection', async () => {
    sendMock.mockResolvedValue({ data: { id: 'c1' }, error: null });
    await sendBookingConfirmation({
      ...booking,
      attendees: [{ name: 'Pascal\r\nBcc: x', email: 'pascal@example.com' }, booking.attendees[1]],
    });
    const arg = sendMock.mock.calls[0][0];
    expect(arg.to).toBe('pascal@example.com');
    expect(arg.from).toBe('noreply@agenticengineering.nl');
    expect(arg.subject).not.toMatch(/[\r\n]/);
    expect(arg.text).toContain('€844,58'); // 84458 cents, nl-NL formatting
  });
});

describe('sendBookingNotification', () => {
  it('emails CONTACT_EMAIL with the attendee list', async () => {
    sendMock.mockResolvedValue({ data: { id: 'n1' }, error: null });
    await sendBookingNotification(booking);
    const arg = sendMock.mock.calls[0][0];
    expect(arg.to).toBe('hello@agenticengineering.nl');
    expect(arg.text).toContain('sam@example.com');
    expect(arg.text).toContain('2');
  });

  it('throws EmailError on Resend error', async () => {
    sendMock.mockResolvedValue({ data: null, error: { message: 'fail' } });
    await expect(sendBookingNotification(booking)).rejects.toBeInstanceOf(EmailError);
  });
});
