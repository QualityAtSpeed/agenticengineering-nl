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

const escapeHtml = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

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

export type BookingDetails = {
  attendees: { name: string; email: string }[];
  seats: number;
  grossCents: number;
  training: string;
};

function formatEuro(cents: number): string {
  return (cents / 100).toLocaleString('nl-NL', { minimumFractionDigits: 2 });
}

function bookingLines(b: BookingDetails): string {
  const attendees = b.attendees
    .map((a, i) => `  ${i + 1}. ${stripCRLF(a.name)} <${stripCRLF(a.email)}>`)
    .join('\n');
  return [
    `Training: ${b.training}`,
    `Seats: ${b.seats}`,
    `Total (incl. BTW): €${formatEuro(b.grossCents)}`,
    '',
    'Attendees:',
    attendees,
  ].join('\n');
}

function resendClient(): { resend: Resend; from: string } {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  if (!apiKey) throw new EmailError('RESEND_API_KEY missing');
  if (!from) throw new EmailError('CONTACT_FROM_EMAIL missing');
  return { resend: new Resend(apiKey), from };
}

export async function sendBookingConfirmation(b: BookingDetails): Promise<{ id: string }> {
  const { resend, from } = resendClient();

  const attendeesHtml = b.attendees
    .map(
      (a) =>
        `<tr><td style="padding:11px 0;border-bottom:1px solid #f0f3f6;">` +
        `<span style="font-size:15px;color:#16202b;font-weight:bold;">${escapeHtml(stripCRLF(a.name))}</span><br/>` +
        `<span style="font-size:13px;color:#8a94a2;">${escapeHtml(stripCRLF(a.email))}</span></td></tr>`,
    )
    .join('');

  const result = await resend.emails.send({
    from,
    to: stripCRLF(b.attendees[0].email),

    template: {
      id: 'booking-confirmation',
      variables: {
        // moet Record<string, string | number> zijn
        customerName: stripCRLF(b.attendees[0].name),
        training: b.training,
        seats: b.seats, // number mag
        total: formatEuro(b.grossCents), // string, bv. "1.184,95"
        attendeesHtml, // string (HTML) -> in de template als {{{attendeesHtml}}}
      },
    },
  });
  if (result.error || !result.data?.id) {
    throw new EmailError(result.error?.message ?? 'unknown Resend error', result.error);
  }
  return { id: result.data.id };
}

export async function sendBookingNotification(b: BookingDetails): Promise<{ id: string }> {
  const { resend, from } = resendClient();
  const to = process.env.CONTACT_EMAIL;
  if (!to) throw new EmailError('CONTACT_EMAIL missing');
  const subject = stripCRLF(`[agenticengineering.nl] Nieuwe boeking — ${b.seats} plek(ken)`);
  const text = ['Nieuwe betaalde boeking:', '', bookingLines(b)].join('\n');
  const result = await resend.emails.send({
    from,
    to,
    replyTo: stripCRLF(b.attendees[0].email),
    subject,
    text,
  });
  if (result.error || !result.data?.id) {
    throw new EmailError(result.error?.message ?? 'unknown Resend error', result.error);
  }
  return { id: result.data.id };
}
