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
  const to = process.env.CONTACT_EMAIL;
  if (!to) throw new EmailError('CONTACT_EMAIL missing');
  const { resend, from } = resendClient();

  const safeName = stripCRLF(input.name);
  const safeReplyTo = stripCRLF(input.email);
  const safeCompany = stripCRLF(input.company ?? '');

  const subject = stripCRLF(`[agenticengineering.nl] ${input.trainingInterest} — ${safeName}`);

  const text = [
    'Nieuwe registratie / aanvraag:',
    '',
    `Name: ${safeName}`,
    `Email: ${safeReplyTo}`,
    `Company: ${safeCompany || '—'}`,
    `Training interest: ${input.trainingInterest}`,
    `Delivery preference: ${input.deliveryPref}`,
    `Questionnaire: automatisch verzonden naar ${safeReplyTo}`,
    '',
    'Message:',
    input.message,
  ].join('\n');

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

export async function sendContactQuestionnaire(input: ContactInput): Promise<{ id: string }> {
  const { resend, from } = resendClient();
  const replyTo = process.env.CONTACT_EMAIL;
  if (!replyTo) throw new EmailError('CONTACT_EMAIL missing');
  const safeName = stripCRLF(input.name);
  const to = stripCRLF(input.email);
  const subject = stripCRLF('[agenticengineering.nl] Vragenlijst voor je training');
  const text = [
    `Hoi ${safeName},`,
    '',
    'Dank voor je registratie / aanvraag voor de Agentic Engineering training.',
    'Kun je deze vragen beantwoorden? Dan kunnen we de training beter laten aansluiten op jou en je team.',
    '',
    '1. Voor hoeveel deelnemers is de training bedoeld?',
    '2. Welke rollen zitten in de groep? Denk aan developers, QA, platform, product of management.',
    '3. Hoeveel ervaring is er al met Claude Code, Cursor, GitHub Copilot of vergelijkbare tools?',
    '4. Welke codebase, stack of workflow wil je vooral verbeteren?',
    '5. Wat moet na de training concreet anders gaan in het werk?',
    '6. Zijn er security-, compliance- of data-afspraken waar we rekening mee moeten houden?',
    '7. Heeft je team voorkeur voor in-company, remote of een publieke cohort?',
    '8. Welke periode of datum heeft je voorkeur?',
    '',
    'Je kunt gewoon op deze mail antwoorden.',
    '',
    'Groet,',
    'Agentic Engineering',
  ].join('\n');

  const result = await resend.emails.send({
    from,
    to,
    replyTo,
    subject,
    text,
  });
  if (result.error || !result.data?.id) {
    throw new EmailError(result.error?.message ?? 'unknown Resend error', result.error);
  }
  return { id: result.data.id };
}

export async function sendContactRegistrationEmails(input: ContactInput): Promise<void> {
  await sendContactEmail(input);
  await sendContactQuestionnaire(input);
}

export type BookingDetails = {
  attendees: { name: string; email: string }[];
  seats: number;
  grossCents: number;
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
