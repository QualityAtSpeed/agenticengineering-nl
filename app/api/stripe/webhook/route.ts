import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getStripe } from '@/lib/stripe';
import { sendBookingConfirmation, sendBookingNotification, type BookingDetails } from '@/lib/email';
import { markHandled, unmarkHandled } from '@/lib/webhook-dedupe';

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

  // Delayed-notification methods (iDEAL, Bancontact, …) fire `completed` before the
  // money clears, then `async_payment_succeeded` once it settles (or `_failed`).
  // We fulfill on either event, but only when the session is actually paid; an
  // instant payment is paid at `completed`, a delayed one only at the async event.
  // See https://docs.stripe.com/payments/checkout/fulfillment#delayed-notification
  const FULFILL_EVENTS = new Set([
    'checkout.session.completed',
    'checkout.session.async_payment_succeeded',
  ]);

  if (event.type === 'checkout.session.async_payment_failed') {
    console.error('webhook_async_payment_failed', event.id);
    return NextResponse.json({ received: true }, { status: 200 });
  }

  if (!FULFILL_EVENTS.has(event.type)) {
    return NextResponse.json({ received: true }, { status: 200 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  // Not paid yet (delayed payment still processing). Do nothing now; the
  // async_payment_succeeded event will fulfill once the money clears.
  if (session.payment_status !== 'paid') {
    return NextResponse.json({ received: true, pending: true }, { status: 200 });
  }

  if (!markHandled(event.id)) {
    return NextResponse.json({ received: true, deduped: true }, { status: 200 });
  }

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
    company: {
      company: metadata.company ?? '',
      kvk: metadata.kvk ?? '',
      street: metadata.street ?? '',
      zipCode: metadata.zipCode ?? '',
      city: metadata.city ?? '',
      country: metadata.country ?? '',
      notes: metadata.notes ?? '',
    },
  };

  try {
    await sendBookingConfirmation(detail);
  } catch {
    // Confirmation failed — un-mark so Stripe retries (no duplicate: it never sent).
    unmarkHandled(event.id);
    console.error('webhook_confirmation_failed', event.id);
    return NextResponse.json({ ok: false, error: 'fulfillment_failed' }, { status: 500 });
  }

  // Internal notification is best-effort: a failure must not trigger a retry,
  // which would re-send the customer confirmation above.
  // non production will not send a notification to CONTACT_EMAIL
  if (process.env.VERCEL_ENV === 'production') {
    try {
      await sendBookingNotification(detail);
    } catch {
      console.error('webhook_notification_failed', event.id);
    }
  }
  return NextResponse.json({ received: true }, { status: 200 });
}

export const runtime = 'nodejs';
