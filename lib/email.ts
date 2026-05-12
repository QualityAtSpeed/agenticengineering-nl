import { Resend } from 'resend';
import { stripCRLF } from './sanitize';
import type { ContactInput } from './validation';

export class EmailError extends Error {
  constructor(
    message: string,
    public cause?: unknown,
  ) {
    super(message);
    this.name = 'EmailError';
  }
}

export async function sendContactEmail(input: ContactInput): Promise<{ id: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL;
  if (!apiKey) throw new EmailError('RESEND_API_KEY missing');
  if (!to || !from) throw new EmailError('CONTACT_EMAIL or CONTACT_FROM_EMAIL missing');

  const safeName = stripCRLF(input.name);
  const safeReplyTo = stripCRLF(input.email);
  const safeCompany = stripCRLF(input.company ?? '');

  const subject = stripCRLF(`[agenticengineering.nl] ${input.trainingInterest} — ${safeName}`);

  const text = [
    `Name: ${safeName}`,
    `Email: ${safeReplyTo}`,
    `Company: ${safeCompany || '—'}`,
    `Training interest: ${input.trainingInterest}`,
    `Delivery preference: ${input.deliveryPref}`,
    '',
    'Message:',
    input.message,
  ].join('\n');

  const resend = new Resend(apiKey);
  const result = await resend.emails.send({
    from,
    to,
    replyTo: safeReplyTo,
    subject,
    text,
  });
  if (result.error || !result.data?.id) {
    throw new EmailError(result.error?.message ?? 'unknown Resend error', result.error);
  }
  return { id: result.data.id };
}
