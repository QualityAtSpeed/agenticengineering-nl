import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getStripe } from '@/lib/stripe';
import { sendBookingConfirmation, sendBookingNotification, type BookingDetails } from '@/lib/email';

// In-memory dedupe. Best-effort across a single serverless instance; Stripe
// Dashboard remains the source of truth. Bounded to avoid unbounded growth.
const handled = new Set<string>();
const MAX_HANDLED = 1000;

function markHandled(id: string): boolean {
  if (handled.has(id)) return false;
  if (handled.size >= MAX_HANDLED) handled.clear();
  handled.add(id);
  return true;
}

export function __resetWebhookDedupeForTests() {
  handled.clear();
}

function parseAttendees(metadata: Record<string, string>): { name: string; email: string }[] {
  const out: { name: string; email: string }[] = [];
  for (let i = 0; metadata[`attendee_${i}`] !== undefined; i++) {
    const raw = metadata[`attendee_${i}`];
    const m = raw.match(/^(.*) <(.+)>$/);
    if (m) out.push({ name: m[1], email: m[2] });
  }
  return out;
}

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const sig = req.headers.get('stripe-signature');
  if (!secret || !sig) {
    return NextResponse.json({ ok: false, error: 'missing_signature' }, { status: 400 });
  }

  const body = await req.text(); // RAW body — required for signature verification
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, secret);
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_signature' }, { status: 400 });
  }

  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true }, { status: 200 });
  }

  if (!markHandled(event.id)) {
    return NextResponse.json({ received: true, deduped: true }, { status: 200 });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const metadata = (session.metadata ?? {}) as Record<string, string>;
  const attendees = parseAttendees(metadata);
  if (attendees.length === 0) {
    console.error('webhook_no_attendees', event.id);
    return NextResponse.json({ received: true }, { status: 200 });
  }

  const detail: BookingDetails = {
    attendees,
    seats: Number(metadata.seats ?? attendees.length),
    grossCents: session.amount_total ?? 0,
  };

  try {
    await sendBookingConfirmation(detail);
  } catch {
    // Confirmation failed — un-mark so Stripe retries (no duplicate: it never sent).
    handled.delete(event.id);
    console.error('webhook_confirmation_failed', event.id);
    return NextResponse.json({ ok: false, error: 'fulfillment_failed' }, { status: 500 });
  }

  // Internal notification is best-effort: a failure must not trigger a retry,
  // which would re-send the customer confirmation above.
  try {
    await sendBookingNotification(detail);
  } catch {
    console.error('webhook_notification_failed', event.id);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}

export const runtime = 'nodejs';
