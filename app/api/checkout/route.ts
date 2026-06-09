import { NextResponse } from 'next/server';
import { bookingSchema } from '@/lib/validation';
import { priceWithVat } from '@/lib/pricing';
import { getStripe } from '@/lib/stripe';
import { isAllowedOrigin, clientIp } from '@/lib/http';
import { checkRateLimit } from '@/lib/rate-limit';

function baseUrl(req: Request): string {
  const origin = req.headers.get('origin');
  return origin && isAllowedOrigin(origin) ? origin : 'https://agenticengineering.nl';
}

export async function POST(req: Request) {
  if (!isAllowedOrigin(req.headers.get('origin'))) {
    return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 });
  }

  const limit = checkRateLimit(clientIp(req));
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, error: 'rate_limited' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSec) } },
    );
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const parsed = bookingSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'invalid_payload' }, { status: 400 });
  }

  const { trainingId, attendees } = parsed.data;
  const { grossCents } = priceWithVat(trainingId);
  const origin = baseUrl(req);

  const metadata: Record<string, string> = {
    trainingId,
    seats: String(attendees.length),
  };
  attendees.forEach((a, i) => {
    metadata[`attendee_${i}`] = `${a.name} <${a.email}>`;
  });

  try {
    const session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      customer_email: attendees[0].email,
      line_items: [
        {
          quantity: attendees.length,
          price_data: {
            currency: 'eur',
            unit_amount: grossCents,
            product_data: { name: 'Pilot - Basic Training (29 en 30 juni 2026)' },
          },
        },
      ],
      metadata,
      success_url: `${origin}/nl/trainings/pilot/book/success`,
      cancel_url: `${origin}/nl/trainings/pilot/book`,
    });

    if (!session.url) {
      return NextResponse.json({ ok: false, error: 'session_failed' }, { status: 502 });
    }
    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch {
    console.error('checkout_session_failed');
    return NextResponse.json({ ok: false, error: 'session_failed' }, { status: 502 });
  }
}

export const runtime = 'nodejs';
