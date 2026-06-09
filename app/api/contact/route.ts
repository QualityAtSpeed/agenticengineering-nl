import { NextResponse } from 'next/server';
import { contactSchema } from '@/lib/validation';
import { sendContactEmail } from '@/lib/email';
import { checkRateLimit } from '@/lib/rate-limit';
import { isAllowedOrigin, clientIp } from '@/lib/http';

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

  if (
    typeof raw === 'object' &&
    raw !== null &&
    'website' in raw &&
    Boolean((raw as Record<string, unknown>).website)
  ) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'invalid_payload' }, { status: 400 });
  }

  try {
    await sendContactEmail(parsed.data);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    console.error('contact_email_failed');
    return NextResponse.json({ ok: false, error: 'email_failed' }, { status: 502 });
  }
}

export const runtime = 'nodejs';
