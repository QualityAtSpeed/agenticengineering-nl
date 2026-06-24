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

export type BookingDetails = {
  attendees: { name: string; email: string }[];
  seats: number;
  grossCents: number;
  company?: CompanyDetails;
  // Referral attribution, set when a referral/promo code was redeemed.
  referralCode?: string;
  referrer?: string;
};

export type CompanyDetails = {
  company: string;
  kvk: string;
  street: string;
  zipCode: string;
  city: string;
  country: string;
  notes: string;
};

const PILOT_LABEL = 'Pilot - Basic Training (29 en 30 juni 2026)';

function formatEuro(cents: number): string {
  return (cents / 100).toLocaleString('nl-NL', { minimumFractionDigits: 2 });
}

function bookingLines(b: BookingDetails): string {
  const attendees = b.attendees
    .map((a, i) => `  ${i + 1}. ${stripCRLF(a.name)} <${stripCRLF(a.email)}>`)
    .join('\n');
  return [
    `Training: ${PILOT_LABEL}`,
    `Seats: ${b.seats}`,
    `Total (incl. BTW): €${formatEuro(b.grossCents)}`,
    '',
    'Attendees:',
    attendees,
  ].join('\n');
}

function companyLines(c: CompanyDetails): string {
  return [
    'Bedrijfsgegevens:',
    `  Bedrijfsnaam: ${stripCRLF(c.company) || '—'}`,
    `  KVK: ${stripCRLF(c.kvk) || '—'}`,
    `  Adres: ${stripCRLF(c.street)}, ${stripCRLF(c.zipCode)} ${stripCRLF(c.city)}, ${stripCRLF(c.country)}`,
    '',
    'Aanvullende informatie:',
    stripCRLF(c.notes) || '—',
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
  const to = stripCRLF(b.attendees[0].email);
  const subject = stripCRLF(`[agenticengineering.nl] Bevestiging boeking — ${PILOT_LABEL}`);
  const text = [
    'Bedankt voor je boeking! Je plek is bevestigd.',
    '',
    bookingLines(b),
    '',
    'We nemen contact op met praktische details voor de trainingsdagen.',
  ].join('\n');
  const result = await resend.emails.send({ from, to, subject, text });
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
  const referralLines = b.referralCode
    ? ['', `Referral code: ${stripCRLF(b.referralCode)}`].concat(
        b.referrer ? [`Verwezen door: ${stripCRLF(b.referrer)}`] : [],
      )
    : [];
  const text = [
    'Nieuwe betaalde boeking:',
    '',
    bookingLines(b),
    ...(b.company ? ['', companyLines(b.company)] : []),
    ...referralLines,
  ].join('\n');
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
