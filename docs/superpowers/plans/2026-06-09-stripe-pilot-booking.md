# Stripe Pilot Booking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let visitors book and pay by card for the pilot training (€349 ex VAT p.p., online cohort 29–30 Jun 2026) via Stripe Checkout, with webhook-driven confirmation emails. Basic/advanced stay on the contact form.

**Architecture:** A pre-checkout booking form (seat count + per-attendee name/email) posts to `/api/checkout`, which looks up the price server-side from `data/trainings.ts`, adds 21% VAT, and creates a Stripe Checkout Session. Fulfillment happens only in `/api/stripe/webhook` on `checkout.session.completed`: it verifies the signature, dedupes the event, and sends a buyer confirmation + a `hello@` notification through the existing Resend setup. Stripe Dashboard is the system of record (no database).

**Tech Stack:** Next.js 15 App Router, TypeScript, `stripe` (Node SDK), Resend, react-hook-form + zod, next-intl, Vitest, Playwright.

---

## File Structure

New:

- `lib/pricing.ts` — `priceWithVat(trainingId)` in integer cents. Single source of VAT math.
- `lib/stripe.ts` — lazy, server-only Stripe client.
- `lib/http.ts` — shared origin allow-list + client-IP helpers (extracted from the contact route so both routes share one implementation).
- `app/api/checkout/route.ts` — create a Checkout Session.
- `app/api/stripe/webhook/route.ts` — verify signature, dedupe, fulfill.
- `components/BookingForm.tsx` — seat selector + attendee rows.
- `app/[locale]/trainings/pilot/book/page.tsx` — booking page.
- `app/[locale]/trainings/pilot/book/success/page.tsx` — success/UX page.
- Test files mirroring each unit under `tests/`.

Modified:

- `lib/validation.ts` — add `bookingSchema` + `BookingInput`.
- `lib/email.ts` — add `sendBookingConfirmation` + `sendBookingNotification`.
- `app/api/contact/route.ts` — import the extracted helpers from `lib/http.ts`.
- `components/TrainingCard.tsx`, `components/TrainingDetail.tsx` — pilot CTA → booking page + secondary contact link.
- `messages/nl.json`, `messages/en.json` — `booking` namespace + a `trainings.labels` secondary-link key.
- `.env.example` — three Stripe vars.
- `README.md` — env table, routes, stack, editing checklist (satisfies the `readme-check` pre-commit hook).
- `package.json` / `pnpm-lock.yaml` — `stripe` dependency.

---

## Conventions (read before starting)

- Run a single unit test file: `pnpm exec vitest run tests/lib/pricing.test.ts`.
- Run one test by name: `pnpm exec vitest run tests/lib/pricing.test.ts -t "adds 21%"`.
- Type check: `pnpm typecheck`. Lint: `pnpm lint`. i18n parity: `pnpm verify:i18n`.
- The repo uses a `lefthook` pre-commit hook (`format`, `lint`, `readme-check`). Do **not** use `--no-verify` for implementation commits — Task 1 updates the README up front so the hook passes for every later commit.
- Money is handled in **integer cents** everywhere to avoid float drift. Stripe `unit_amount` is cents.
- `@/` is the repo-root path alias (see `tsconfig.json`).

---

## Task 1: Dependency, env vars, and README

**Files:**

- Modify: `package.json`, `pnpm-lock.yaml` (via pnpm)
- Modify: `.env.example`
- Modify: `README.md`

- [ ] **Step 1: Install the Stripe Node SDK**

Run: `pnpm add stripe`
Expected: `stripe` appears under `dependencies` in `package.json`; lockfile updates.

- [ ] **Step 2: Add Stripe env vars to `.env.example`**

Append below the existing `BLOGS_ENABLED` line in `.env.example`:

```bash

# Stripe (pilot booking + payment). Use test-mode keys locally and in CI.
# STRIPE_SECRET_KEY: server-side API key (sk_test_… / sk_live_…)
# STRIPE_PUBLISHABLE_KEY: client-safe key (pk_test_… / pk_live_…)
# STRIPE_WEBHOOK_SECRET: signing secret for /api/stripe/webhook (whsec_…)
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
```

- [ ] **Step 3: Update `README.md` to satisfy the readme-check hook**

Make these edits (match the README's existing formatting):

1. **Environment variables table** — add three rows:
   - `STRIPE_SECRET_KEY` — server — Stripe secret API key for creating Checkout Sessions and verifying webhooks.
   - `STRIPE_PUBLISHABLE_KEY` — client-safe — Stripe publishable key (reserved for future Elements; redirect uses the Session URL).
   - `STRIPE_WEBHOOK_SECRET` — server — Signing secret for `/api/stripe/webhook` signature verification.
2. **Routes section** — add: `/[locale]/trainings/pilot/book` (booking form), `/[locale]/trainings/pilot/book/success` (post-payment UX), `POST /api/checkout` (creates Stripe Checkout Session), `POST /api/stripe/webhook` (Stripe fulfillment webhook).
3. **Stack table** — add a row: `stripe` — payments — Checkout Sessions + webhook signature verification for pilot booking.
4. **Contact form section** — rename the "Contact form pipeline" heading focus or add a sibling subsection "Pilot booking pipeline" describing: booking form → `POST /api/checkout` (server-side pricing from `data/trainings.ts`, +21% VAT) → Stripe Checkout → `POST /api/stripe/webhook` (`checkout.session.completed`) → Resend confirmation + notification. State explicitly: fulfillment happens on the webhook, never the success redirect.
5. **Editing checklist** — add a bullet: editing the **pilot** training requires keeping the booking-page CTA (`/trainings/pilot/book`) and the secondary contact link in sync in both `TrainingCard.tsx` and `TrainingDetail.tsx`.

- [ ] **Step 4: Verify typecheck + readme-check pass**

Run: `pnpm typecheck`
Expected: no errors.
Run: `pnpm exec lefthook run pre-commit` (or stage the files and let the next commit run it)
Expected: `readme-check` passes.

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml .env.example README.md
git commit -m "build: add stripe dep, env vars, and README for pilot booking"
```

---

## Task 2: Server-side pricing with VAT (`lib/pricing.ts`)

**Files:**

- Create: `lib/pricing.ts`
- Test: `tests/lib/pricing.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// tests/lib/pricing.test.ts
import { describe, it, expect } from 'vitest';
import { priceWithVat, VAT_RATE } from '@/lib/pricing';

describe('priceWithVat', () => {
  it('adds 21% VAT to the pilot net price in integer cents', () => {
    expect(VAT_RATE).toBe(0.21);
    const p = priceWithVat('pilot');
    expect(p.netCents).toBe(34900); // €349
    expect(p.vatCents).toBe(7329); // round(34900 * 0.21) = 7329
    expect(p.grossCents).toBe(42229); // €422.29
  });

  it('computes basic and advanced consistently', () => {
    expect(priceWithVat('basic').grossCents).toBe(169279); // round(139900*1.21)
    expect(priceWithVat('advanced').grossCents).toBe(120879); // round(99900*1.21)
  });

  it('gross equals net plus vat', () => {
    const p = priceWithVat('pilot');
    expect(p.grossCents).toBe(p.netCents + p.vatCents);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run tests/lib/pricing.test.ts`
Expected: FAIL — cannot find module `@/lib/pricing`.

- [ ] **Step 3: Write the implementation**

```typescript
// lib/pricing.ts
import { trainings, type TrainingId } from '@/data/trainings';

export const VAT_RATE = 0.21;

export type PriceBreakdown = {
  netCents: number;
  vatCents: number;
  grossCents: number;
};

export function priceWithVat(trainingId: TrainingId): PriceBreakdown {
  const netCents = trainings[trainingId].priceEUR * 100;
  const vatCents = Math.round(netCents * VAT_RATE);
  return { netCents, vatCents, grossCents: netCents + vatCents };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec vitest run tests/lib/pricing.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/pricing.ts tests/lib/pricing.test.ts
git commit -m "feat(pricing): server-side VAT breakdown in cents"
```

---

## Task 3: Booking validation schema (`lib/validation.ts`)

**Files:**

- Modify: `lib/validation.ts`
- Test: `tests/lib/validation.test.ts` (add a describe block; do not remove existing tests)

- [ ] **Step 1: Write the failing test (append to the existing file)**

```typescript
// tests/lib/validation.test.ts — append
import { bookingSchema } from '@/lib/validation';

describe('bookingSchema', () => {
  const attendee = { name: 'Pascal', email: 'pascal@example.com' };

  it('accepts a pilot booking with one attendee', () => {
    expect(bookingSchema.safeParse({ trainingId: 'pilot', attendees: [attendee] }).success).toBe(
      true,
    );
  });

  it('rejects an empty attendee list', () => {
    expect(bookingSchema.safeParse({ trainingId: 'pilot', attendees: [] }).success).toBe(false);
  });

  it('rejects more than 10 attendees', () => {
    const many = Array.from({ length: 11 }, () => attendee);
    expect(bookingSchema.safeParse({ trainingId: 'pilot', attendees: many }).success).toBe(false);
  });

  it('rejects a bad email', () => {
    expect(
      bookingSchema.safeParse({
        trainingId: 'pilot',
        attendees: [{ name: 'X', email: 'not-email' }],
      }).success,
    ).toBe(false);
  });

  it('rejects a non-pilot trainingId (pilot-only scope)', () => {
    expect(bookingSchema.safeParse({ trainingId: 'basic', attendees: [attendee] }).success).toBe(
      false,
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run tests/lib/validation.test.ts -t bookingSchema`
Expected: FAIL — `bookingSchema` is not exported.

- [ ] **Step 3: Add the schema to `lib/validation.ts`**

Append to `lib/validation.ts`:

```typescript
export const attendeeSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(254),
});

// Pilot-only by design (see spec). Widen the literal when more trainings go self-serve.
export const bookingSchema = z.object({
  trainingId: z.literal('pilot'),
  attendees: z.array(attendeeSchema).min(1).max(10),
});

export type BookingInput = z.infer<typeof bookingSchema>;
export type Attendee = z.infer<typeof attendeeSchema>;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec vitest run tests/lib/validation.test.ts`
Expected: PASS (existing + 5 new).

- [ ] **Step 5: Commit**

```bash
git add lib/validation.ts tests/lib/validation.test.ts
git commit -m "feat(validation): add bookingSchema (pilot, 1-10 attendees)"
```

---

## Task 4: Extract shared HTTP guards (`lib/http.ts`)

Refactor the inline origin allow-list + client-IP logic out of the contact route so `/api/checkout` reuses the exact same implementation. Behaviour must not change — the existing contact tests are the regression guard.

**Files:**

- Create: `lib/http.ts`
- Test: `tests/lib/http.test.ts`
- Modify: `app/api/contact/route.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// tests/lib/http.test.ts
import { describe, it, expect } from 'vitest';
import { isAllowedOrigin, clientIp } from '@/lib/http';

describe('isAllowedOrigin', () => {
  it('allows the apex and www production domains', () => {
    expect(isAllowedOrigin('https://agenticengineering.nl')).toBe(true);
    expect(isAllowedOrigin('https://www.agenticengineering.nl')).toBe(true);
  });
  it('allows vercel preview domains and localhost', () => {
    expect(isAllowedOrigin('https://agenticengineering-git-foo.vercel.app')).toBe(true);
    expect(isAllowedOrigin('http://localhost:3000')).toBe(true);
  });
  it('rejects foreign and null origins', () => {
    expect(isAllowedOrigin('https://evil.example')).toBe(false);
    expect(isAllowedOrigin(null)).toBe(false);
  });
});

describe('clientIp', () => {
  it('prefers x-real-ip, then last x-forwarded-for, else 0.0.0.0', () => {
    const real = new Request('https://x', { headers: { 'x-real-ip': '1.2.3.4' } });
    expect(clientIp(real)).toBe('1.2.3.4');
    const fwd = new Request('https://x', { headers: { 'x-forwarded-for': '9.9.9.9, 8.8.8.8' } });
    expect(clientIp(fwd)).toBe('8.8.8.8');
    expect(clientIp(new Request('https://x'))).toBe('0.0.0.0');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run tests/lib/http.test.ts`
Expected: FAIL — cannot find module `@/lib/http`.

- [ ] **Step 3: Create `lib/http.ts` (move the logic verbatim from the contact route)**

```typescript
// lib/http.ts
const ALLOWED_ORIGIN_PATTERNS = [
  /^https:\/\/(www\.)?agenticengineering\.nl$/,
  /^https:\/\/agenticengineering(-[a-z0-9-]+)?\.vercel\.app$/,
  /^http:\/\/localhost(:\d+)?$/,
];

export function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  return ALLOWED_ORIGIN_PATTERNS.some((re) => re.test(origin));
}

export function clientIp(req: Request): string {
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) {
    const parts = fwd
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);
    if (parts.length > 0) return parts[parts.length - 1];
  }
  return '0.0.0.0';
}
```

- [ ] **Step 4: Refactor `app/api/contact/route.ts` to import these**

Delete the local `ALLOWED_ORIGIN_PATTERNS`, `isAllowedOrigin`, and `clientIp` definitions from `app/api/contact/route.ts` and add at the top with the other imports:

```typescript
import { isAllowedOrigin, clientIp } from '@/lib/http';
```

Leave the rest of the route untouched.

- [ ] **Step 5: Run the new + contact tests to verify no regression**

Run: `pnpm exec vitest run tests/lib/http.test.ts tests/api/contact.test.ts`
Expected: PASS (http suite + all existing contact tests still green).

- [ ] **Step 6: Commit**

```bash
git add lib/http.ts tests/lib/http.test.ts app/api/contact/route.ts
git commit -m "refactor(http): extract shared origin + client-ip guards"
```

---

## Task 5: Stripe client (`lib/stripe.ts`)

**Files:**

- Create: `lib/stripe.ts`
- Test: `tests/lib/stripe.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// tests/lib/stripe.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { getStripe } from '@/lib/stripe';

beforeEach(() => {
  delete process.env.STRIPE_SECRET_KEY;
});

describe('getStripe', () => {
  it('throws when STRIPE_SECRET_KEY is missing', () => {
    expect(() => getStripe()).toThrow(/STRIPE_SECRET_KEY/);
  });

  it('returns a Stripe instance when the key is set', () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_123';
    const stripe = getStripe();
    expect(stripe.checkout?.sessions).toBeDefined();
    expect(stripe.webhooks?.constructEvent).toBeTypeOf('function');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run tests/lib/stripe.test.ts`
Expected: FAIL — cannot find module `@/lib/stripe`.

- [ ] **Step 3: Write the implementation**

```typescript
// lib/stripe.ts
import Stripe from 'stripe';

let client: Stripe | null = null;

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY missing');
  if (!client) client = new Stripe(key);
  return client;
}

// Test-only: reset the memoised client so env changes take effect.
export function __resetStripeForTests() {
  client = null;
}
```

Note: the memoised `client` means the "missing key" test must run before any test sets the key, or call `__resetStripeForTests()`. The `beforeEach` deletes the key; add `__resetStripeForTests()` to the `beforeEach` if you reorder tests.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec vitest run tests/lib/stripe.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/stripe.ts tests/lib/stripe.test.ts
git commit -m "feat(stripe): lazy server-side Stripe client"
```

---

## Task 6: Booking emails (`lib/email.ts`)

Add two functions reusing the existing Resend setup and `stripCRLF` header hygiene. `sendBookingConfirmation` goes to the buyer (first attendee email); `sendBookingNotification` goes to `CONTACT_EMAIL`.

**Files:**

- Modify: `lib/email.ts`
- Test: `tests/lib/email.test.ts` (add describe blocks; keep existing tests)

- [ ] **Step 1: Write the failing tests (append to the existing file)**

```typescript
// tests/lib/email.test.ts — append (sendMock + resend mock already defined above)
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run tests/lib/email.test.ts -t Booking`
Expected: FAIL — `sendBookingConfirmation` / `sendBookingNotification` not exported.

- [ ] **Step 3: Add the functions to `lib/email.ts`**

Append to `lib/email.ts` (the `Resend`, `stripCRLF`, `EmailError` imports already exist at the top):

```typescript
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec vitest run tests/lib/email.test.ts`
Expected: PASS (existing + new). If the `€844,58` assertion fails, check the exact `nl-NL` output and align the test to the real formatting.

- [ ] **Step 5: Commit**

```bash
git add lib/email.ts tests/lib/email.test.ts
git commit -m "feat(email): booking confirmation + notification emails"
```

---

## Task 7: Checkout route (`app/api/checkout/route.ts`)

Creates a Checkout Session. Price comes only from `priceWithVat` — the client never sends an amount. Attendees go into session metadata as `attendee_0…attendee_N` (each well under Stripe's 500-char/value limit) plus `trainingId` and `seats`.

**Files:**

- Create: `app/api/checkout/route.ts`
- Test: `tests/api/checkout.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// tests/api/checkout.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const createMock = vi.fn();
vi.mock('@/lib/stripe', () => ({
  getStripe: () => ({ checkout: { sessions: { create: createMock } } }),
}));

import { POST } from '@/app/api/checkout/route';
import { __resetRateLimitForTests } from '@/lib/rate-limit';

const validBody = {
  trainingId: 'pilot',
  attendees: [{ name: 'Pascal', email: 'pascal@example.com' }],
};

function make(body: unknown, headers: Record<string, string> = {}) {
  return new Request('https://agenticengineering.nl/api/checkout', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      origin: 'https://agenticengineering.nl',
      'x-forwarded-for': '5.5.5.5',
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  __resetRateLimitForTests();
  process.env.STRIPE_SECRET_KEY = 'sk_test_123';
  createMock.mockResolvedValue({ url: 'https://checkout.stripe.com/c/session_abc' });
});

describe('POST /api/checkout', () => {
  it('200 returns the session url and prices server-side', async () => {
    const res = await POST(make(validBody));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ url: 'https://checkout.stripe.com/c/session_abc' });
    const arg = createMock.mock.calls[0][0];
    expect(arg.mode).toBe('payment');
    expect(arg.line_items[0].price_data.unit_amount).toBe(42229); // gross cents, server-derived
    expect(arg.line_items[0].quantity).toBe(1);
    expect(arg.metadata.trainingId).toBe('pilot');
    expect(arg.metadata.attendee_0).toContain('pascal@example.com');
  });

  it('ignores any client-supplied amount (no price tampering)', async () => {
    await POST(make({ ...validBody, amount: 1, priceEUR: 1 }));
    expect(createMock.mock.calls[0][0].line_items[0].price_data.unit_amount).toBe(42229);
  });

  it('multiplies quantity by attendee count', async () => {
    await POST(
      make({
        trainingId: 'pilot',
        attendees: [
          { name: 'A', email: 'a@x.com' },
          { name: 'B', email: 'b@x.com' },
        ],
      }),
    );
    expect(createMock.mock.calls[0][0].line_items[0].quantity).toBe(2);
  });

  it('400 on invalid payload', async () => {
    const res = await POST(make({ trainingId: 'pilot', attendees: [] }));
    expect(res.status).toBe(400);
  });

  it('403 on cross-origin', async () => {
    const res = await POST(make(validBody, { origin: 'https://evil.example' }));
    expect(res.status).toBe(403);
  });

  it('429 on rate limit', async () => {
    for (let i = 0; i < 5; i++) await POST(make(validBody));
    const res = await POST(make(validBody));
    expect(res.status).toBe(429);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run tests/api/checkout.test.ts`
Expected: FAIL — cannot find module `@/app/api/checkout/route`.

- [ ] **Step 3: Write the route**

```typescript
// app/api/checkout/route.ts
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
```

Note: the success/cancel URLs hardcode `/nl` for simplicity (Dutch default). If per-locale return is wanted later, pass the locale in the request body and validate it against `routing.locales`.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec vitest run tests/api/checkout.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add app/api/checkout/route.ts tests/api/checkout.test.ts
git commit -m "feat(api): checkout route with server-side pricing"
```

---

## Task 8: Webhook route (`app/api/stripe/webhook/route.ts`)

Verifies the Stripe signature against the **raw** body, dedupes on event id, and fulfills `checkout.session.completed` by sending both emails. Reconstructs attendees from the `attendee_*` metadata keys.

**Files:**

- Create: `app/api/stripe/webhook/route.ts`
- Test: `tests/api/stripe-webhook.test.ts`

- [ ] **Step 1: Write the failing test**

This uses the real `stripe` SDK to sign a payload (so signature verification is exercised end-to-end) and mocks only the email layer.

```typescript
// tests/api/stripe-webhook.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Stripe from 'stripe';

const confirmMock = vi.fn().mockResolvedValue({ id: 'c1' });
const notifyMock = vi.fn().mockResolvedValue({ id: 'n1' });
vi.mock('@/lib/email', () => ({
  sendBookingConfirmation: (...a: unknown[]) => confirmMock(...a),
  sendBookingNotification: (...a: unknown[]) => notifyMock(...a),
  EmailError: class extends Error {},
}));

import { POST } from '@/app/api/stripe/webhook/route';
import { __resetWebhookDedupeForTests } from '@/app/api/stripe/webhook/route';

const SECRET = 'whsec_test_secret';
const stripe = new Stripe('sk_test_123');

function eventBody(id: string) {
  return JSON.stringify({
    id,
    type: 'checkout.session.completed',
    data: {
      object: {
        metadata: {
          trainingId: 'pilot',
          seats: '2',
          attendee_0: 'Pascal <pascal@example.com>',
          attendee_1: 'Sam <sam@example.com>',
        },
        amount_total: 84458,
      },
    },
  });
}

function signed(body: string) {
  const header = stripe.webhooks.generateTestHeaderString({ payload: body, secret: SECRET });
  return new Request('https://agenticengineering.nl/api/stripe/webhook', {
    method: 'POST',
    headers: { 'stripe-signature': header },
    body,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  __resetWebhookDedupeForTests();
  process.env.STRIPE_SECRET_KEY = 'sk_test_123';
  process.env.STRIPE_WEBHOOK_SECRET = SECRET;
  process.env.RESEND_API_KEY = 'test';
  process.env.CONTACT_EMAIL = 'hello@agenticengineering.nl';
  process.env.CONTACT_FROM_EMAIL = 'noreply@agenticengineering.nl';
});

describe('POST /api/stripe/webhook', () => {
  it('200 + fires both emails on a valid completed event', async () => {
    const res = await POST(signed(eventBody('evt_1')));
    expect(res.status).toBe(200);
    expect(confirmMock).toHaveBeenCalledTimes(1);
    expect(notifyMock).toHaveBeenCalledTimes(1);
    const detail = confirmMock.mock.calls[0][0];
    expect(detail.seats).toBe(2);
    expect(detail.grossCents).toBe(84458);
    expect(detail.attendees).toHaveLength(2);
    expect(detail.attendees[1]).toEqual({ name: 'Sam', email: 'sam@example.com' });
  });

  it('is idempotent — a redelivered event id does not resend', async () => {
    await POST(signed(eventBody('evt_dup')));
    await POST(signed(eventBody('evt_dup')));
    expect(confirmMock).toHaveBeenCalledTimes(1);
  });

  it('400 on a bad signature', async () => {
    const res = await new Promise<Response>((r) =>
      r(
        POST(
          new Request('https://agenticengineering.nl/api/stripe/webhook', {
            method: 'POST',
            headers: { 'stripe-signature': 't=1,v1=bogus' },
            body: eventBody('evt_2'),
          }),
        ),
      ),
    );
    expect((await res).status).toBe(400);
    expect(confirmMock).not.toHaveBeenCalled();
  });

  it('200 + ignores unrelated event types', async () => {
    const body = JSON.stringify({
      id: 'evt_3',
      type: 'payment_intent.created',
      data: { object: {} },
    });
    const res = await POST(signed(body));
    expect(res.status).toBe(200);
    expect(confirmMock).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run tests/api/stripe-webhook.test.ts`
Expected: FAIL — cannot find module `@/app/api/stripe/webhook/route`.

- [ ] **Step 3: Write the route**

```typescript
// app/api/stripe/webhook/route.ts
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
    await sendBookingNotification(detail);
  } catch (err) {
    // Let Stripe retry: un-mark so a redelivery can re-attempt fulfillment.
    handled.delete(event.id);
    console.error('webhook_fulfillment_failed', event.id);
    return NextResponse.json({ ok: false, error: 'fulfillment_failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true }, { status: 200 });
}

export const runtime = 'nodejs';
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec vitest run tests/api/stripe-webhook.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add app/api/stripe/webhook/route.ts tests/api/stripe-webhook.test.ts
git commit -m "feat(api): stripe webhook with signature verify + dedupe"
```

---

## Task 9: i18n keys (`messages/nl.json`, `messages/en.json`)

Add a `booking` namespace to both files and a `trainings.labels.contactLink` key. Keys must be identical across both files (enforced by `tests/i18n-integrity.test.ts` and `pnpm verify:i18n`).

**Files:**

- Modify: `messages/nl.json`, `messages/en.json`
- Test: `tests/i18n-integrity.test.ts` (already exists — it is the guard; no edit needed)

- [ ] **Step 1: Add the `booking` namespace to `messages/nl.json`**

Add a top-level `"booking"` object (place it after `"contact"`):

```json
"booking": {
  "title": "Boek de pilot",
  "intro": "Reserveer je plek voor de pilot op 29 en 30 juni 2026. Prijs per deelnemer, incl. 21% btw.",
  "seatsLabel": "Aantal deelnemers",
  "attendeeName": "Naam deelnemer",
  "attendeeEmail": "E-mail deelnemer",
  "submit": "Naar betaling",
  "submitting": "Bezig…",
  "contactLink": "Liever eerst vragen stellen? Neem contact op",
  "errors": {
    "required": "Dit veld is verplicht.",
    "invalidEmail": "Vul een geldig e-mailadres in.",
    "generic": "Er ging iets mis. Probeer het opnieuw.",
    "rateLimited": "Te veel pogingen. Wacht even en probeer opnieuw."
  },
  "success": {
    "title": "Betaling gelukt — je plek is geboekt!",
    "body": "Je ontvangt een bevestiging per e-mail. Tot 29 juni!"
  }
}
```

- [ ] **Step 2: Add the matching `booking` namespace to `messages/en.json`**

```json
"booking": {
  "title": "Book the pilot",
  "intro": "Reserve your seat for the pilot on 29–30 June 2026. Price per attendee, incl. 21% VAT.",
  "seatsLabel": "Number of attendees",
  "attendeeName": "Attendee name",
  "attendeeEmail": "Attendee email",
  "submit": "Continue to payment",
  "submitting": "Working…",
  "contactLink": "Prefer to ask questions first? Get in touch",
  "errors": {
    "required": "This field is required.",
    "invalidEmail": "Enter a valid email address.",
    "generic": "Something went wrong. Please try again.",
    "rateLimited": "Too many attempts. Please wait and try again."
  },
  "success": {
    "title": "Payment successful — your seat is booked!",
    "body": "You'll receive a confirmation by email. See you on 29 June!"
  }
}
```

- [ ] **Step 3: Add the secondary contact-link label under `trainings.labels` in both files**

In `messages/nl.json` under `trainings.labels` add: `"contactLink": "Vragen? Contact"`.
In `messages/en.json` under `trainings.labels` add: `"contactLink": "Questions? Contact"`.

- [ ] **Step 4: Verify key parity + JSON validity**

Run: `pnpm exec vitest run tests/i18n-integrity.test.ts`
Expected: PASS (identical key sets).
Run: `pnpm verify:i18n`
Expected: no missing-key errors.

- [ ] **Step 5: Commit**

```bash
git add messages/nl.json messages/en.json
git commit -m "i18n: add booking namespace + pilot contact link"
```

---

## Task 10: Booking form component (`components/BookingForm.tsx`)

A client component: a seat-count selector that controls a dynamic list of attendee name/email rows, posts to `/api/checkout`, and redirects to the returned Stripe URL. Mirrors `ContactForm.tsx` patterns (Field, INPUT_CLASS, status states, testids).

**Files:**

- Create: `components/BookingForm.tsx`
- Test: `tests/components/BookingForm.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// tests/components/BookingForm.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import nl from '@/messages/nl.json';
import { BookingForm } from '@/components/BookingForm';

function renderForm() {
  return render(
    <NextIntlClientProvider locale="nl" messages={nl}>
      <BookingForm locale="nl" />
    </NextIntlClientProvider>,
  );
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('BookingForm', () => {
  it('renders one attendee row by default', () => {
    renderForm();
    expect(screen.getAllByTestId(/booking-attendee-name-/)).toHaveLength(1);
  });

  it('grows attendee rows when seat count increases', () => {
    renderForm();
    fireEvent.change(screen.getByTestId('booking-seats'), { target: { value: '3' } });
    expect(screen.getAllByTestId(/booking-attendee-name-/)).toHaveLength(3);
  });

  it('posts to /api/checkout and redirects to the Stripe url', async () => {
    const assignMock = vi.fn();
    vi.stubGlobal('location', { assign: assignMock } as unknown as Location);
    const fetchMock = vi
      .fn()
      .mockResolvedValue({
        ok: true,
        json: async () => ({ url: 'https://checkout.stripe.com/x' }),
      });
    vi.stubGlobal('fetch', fetchMock);

    renderForm();
    fireEvent.input(screen.getByTestId('booking-attendee-name-0'), { target: { value: 'Pascal' } });
    fireEvent.input(screen.getByTestId('booking-attendee-email-0'), {
      target: { value: 'pascal@example.com' },
    });
    fireEvent.click(screen.getByTestId('booking-submit'));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith('/api/checkout', expect.anything()));
    await waitFor(() => expect(assignMock).toHaveBeenCalledWith('https://checkout.stripe.com/x'));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run tests/components/BookingForm.test.tsx`
Expected: FAIL — cannot find module `@/components/BookingForm`.

- [ ] **Step 3: Write the component**

```tsx
// components/BookingForm.tsx
'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { bookingSchema, type BookingInput } from '@/lib/validation';
import { Button } from '@/components/Button';

type Status = 'idle' | 'submitting' | 'error' | 'rateLimited';

const INPUT_CLASS =
  'border-border-strong bg-bg-base text-text-primary focus:border-brand focus:ring-brand/20 w-full rounded-md border px-3 py-2 text-[0.9375rem] focus:ring-2 focus:outline-none';

const MAX_SEATS = 10;

export function BookingForm({ locale }: { locale: string }) {
  const t = useTranslations('booking');
  const [status, setStatus] = useState<Status>('idle');

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<BookingInput>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { trainingId: 'pilot', attendees: [{ name: '', email: '' }] },
  });

  const { fields, replace } = useFieldArray({ control, name: 'attendees' });

  function setSeats(n: number) {
    const next = Array.from({ length: n }, (_, i) => fields[i] ?? { name: '', email: '' });
    replace(next);
  }

  async function onSubmit(values: BookingInput) {
    setStatus('submitting');
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(values),
    });
    if (res.ok) {
      const { url } = (await res.json()) as { url: string };
      window.location.assign(url);
      return;
    }
    setStatus(res.status === 429 ? 'rateLimited' : 'error');
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <input type="hidden" {...register('trainingId')} value="pilot" />

      <label className="block">
        <span className="text-text-primary text-sm font-semibold">{t('seatsLabel')}</span>
        <div className="mt-1.5">
          <select
            data-testid="booking-seats"
            defaultValue="1"
            onChange={(e) => setSeats(Number(e.target.value))}
            className={INPUT_CLASS}
          >
            {Array.from({ length: MAX_SEATS }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      </label>

      {fields.map((field, i) => (
        <div
          key={field.id}
          className="border-border-subtle grid gap-3 rounded-md border p-4 sm:grid-cols-2"
        >
          <label className="block">
            <span className="text-text-primary text-sm font-semibold">{t('attendeeName')}</span>
            <input
              type="text"
              data-testid={`booking-attendee-name-${i}`}
              {...register(`attendees.${i}.name` as const)}
              className={`${INPUT_CLASS} mt-1.5`}
            />
            {errors.attendees?.[i]?.name && (
              <p className="text-accent-red mt-1.5 text-xs">{t('errors.required')}</p>
            )}
          </label>
          <label className="block">
            <span className="text-text-primary text-sm font-semibold">{t('attendeeEmail')}</span>
            <input
              type="email"
              data-testid={`booking-attendee-email-${i}`}
              {...register(`attendees.${i}.email` as const)}
              className={`${INPUT_CLASS} mt-1.5`}
            />
            {errors.attendees?.[i]?.email && (
              <p className="text-accent-red mt-1.5 text-xs">{t('errors.invalidEmail')}</p>
            )}
          </label>
        </div>
      ))}

      {status === 'error' && (
        <p className="border-accent-red/30 bg-accent-red/10 text-accent-red rounded-md border px-3 py-2 text-sm">
          {t('errors.generic')}
        </p>
      )}
      {status === 'rateLimited' && (
        <p className="border-accent-orange/30 bg-accent-orange/10 text-accent-orange rounded-md border px-3 py-2 text-sm">
          {t('errors.rateLimited')}
        </p>
      )}

      <Button type="submit" disabled={status === 'submitting'} data-testid="booking-submit">
        {status === 'submitting' ? t('submitting') : t('submit')}
      </Button>

      <p className="text-text-muted text-sm">
        <a
          href={`/${locale}/contact?training=pilot`}
          className="underline"
          data-testid="booking-contact-link"
        >
          {t('contactLink')}
        </a>
      </p>
    </form>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec vitest run tests/components/BookingForm.test.tsx`
Expected: PASS (3 tests). If the redirect test is flaky on `window.location`, assert on `fetchMock` resolution and the parsed `url` instead.

- [ ] **Step 5: Commit**

```bash
git add components/BookingForm.tsx tests/components/BookingForm.test.tsx
git commit -m "feat(booking): seat selector + attendee form component"
```

---

## Task 11: Booking + success pages

**Files:**

- Create: `app/[locale]/trainings/pilot/book/page.tsx`
- Create: `app/[locale]/trainings/pilot/book/success/page.tsx`
- Test: `tests/app/booking-page.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// tests/app/booking-page.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import nl from '@/messages/nl.json';
import BookingPage from '@/app/[locale]/trainings/pilot/book/page';

describe('BookingPage', () => {
  it('renders the booking title and form', async () => {
    const ui = await BookingPage({ params: Promise.resolve({ locale: 'nl' }) });
    render(
      <NextIntlClientProvider locale="nl" messages={nl}>
        {ui}
      </NextIntlClientProvider>,
    );
    expect(screen.getByText(nl.booking.title)).toBeInTheDocument();
    expect(screen.getByTestId('booking-submit')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run tests/app/booking-page.test.tsx`
Expected: FAIL — cannot find module `@/app/[locale]/trainings/pilot/book/page`.

- [ ] **Step 3: Write the booking page (mirrors `app/[locale]/contact/page.tsx`)**

```tsx
// app/[locale]/trainings/pilot/book/page.tsx
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { BookingForm } from '@/components/BookingForm';
import type { Locale } from '@/i18n/routing';

type Props = { params: Promise<{ locale: Locale }> };

export default async function BookingPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('booking');

  return (
    <main className="px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-brand-deep text-3xl font-bold sm:text-4xl">{t('title')}</h1>
        <p className="text-text-soft mt-3 text-lg">{t('intro')}</p>
        <div className="mt-10">
          <BookingForm locale={locale} />
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 4: Write the success page**

```tsx
// app/[locale]/trainings/pilot/book/success/page.tsx
import { setRequestLocale, getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';

type Props = { params: Promise<{ locale: Locale }> };

export default async function BookingSuccessPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('booking');

  return (
    <main className="px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-2xl">
        <div
          className="border-accent-green/30 bg-accent-green/10 rounded-md border p-6"
          data-testid="booking-success"
        >
          <h1 className="text-accent-green-hover text-2xl font-bold">{t('success.title')}</h1>
          <p className="text-text-soft mt-2 text-lg">{t('success.body')}</p>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm exec vitest run tests/app/booking-page.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add "app/[locale]/trainings/pilot/book/page.tsx" "app/[locale]/trainings/pilot/book/success/page.tsx" tests/app/booking-page.test.tsx
git commit -m "feat(booking): booking and success pages"
```

---

## Task 12: Wire the pilot CTA (`TrainingCard.tsx`, `TrainingDetail.tsx`)

For the pilot only, point the primary CTA at the booking page and add a secondary contact link. Basic/advanced keep the current contact CTA. Update the existing component tests.

**Files:**

- Modify: `components/TrainingCard.tsx` (CTA block, ~L141-149)
- Modify: `components/TrainingDetail.tsx` (CTA block, ~L179-184)
- Test: `tests/components/TrainingCard.test.tsx` (extend), `tests/app/training-details-page.test.tsx` (extend)

- [ ] **Step 1: Write/extend the failing test for `TrainingCard`**

Add to `tests/components/TrainingCard.test.tsx` a case asserting the pilot card's primary CTA links to the booking page:

```tsx
// in tests/components/TrainingCard.test.tsx — add within the existing describe
it('pilot CTA links to the booking page, not the contact form', () => {
  // render the card for trainingId="pilot" using the file's existing render helper
  const cta = screen.getByTestId('book-pilot');
  expect(cta.getAttribute('href')).toContain('/trainings/pilot/book');
  expect(cta.getAttribute('href')).not.toContain('/contact');
});

it('non-pilot CTA still links to the contact form', () => {
  // render the card for trainingId="basic"
  const cta = screen.getByTestId('book-basic');
  expect(cta.getAttribute('href')).toContain('/contact?training=basic');
});
```

(Match the file's existing render helper/imports; if it renders a single fixed training, add a second render for the other id.)

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run tests/components/TrainingCard.test.tsx`
Expected: FAIL — pilot CTA currently points at `/contact?training=pilot`.

- [ ] **Step 3: Update the `TrainingCard.tsx` CTA block**

Replace the price/CTA block (around L136-150) so the pilot links to the booking page and shows a contact link. Add `const isPilot = trainingId === 'pilot';` if not already present (it is, per L105).

```tsx
<div className={isPilot ? 'lg:pt-[1.875rem]' : undefined}>
  <p className="text-text-primary text-xl font-bold tabular-nums">
    €{training.priceEUR.toLocaleString('nl-NL')}
  </p>
  <p className="text-text-muted text-xs">{tLabels('priceSuffix')}</p>
  <Button
    size="sm"
    fullWidth
    href={isPilot ? `/${locale}/trainings/pilot/book` : `/${locale}/contact?training=${trainingId}`}
    data-testid={`book-${trainingId}`}
    className="mt-3"
  >
    {tLabels('bookCta')}
  </Button>
  {isPilot && (
    <a
      href={`/${locale}/contact?training=pilot`}
      data-testid="book-pilot-contact"
      className="text-text-muted mt-2 block text-center text-xs underline"
    >
      {tLabels('contactLink')}
    </a>
  )}
</div>
```

- [ ] **Step 4: Update the `TrainingDetail.tsx` CTA block**

Replace the CTA block (around L174-185). Add `const isPilot = trainingId === 'pilot';` near the top of the component if not already defined.

```tsx
<div className="border-border-subtle bg-bg-tint mt-10 flex flex-col gap-4 rounded-lg border px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
  <p className="text-text-primary font-semibold">
    €{training.priceEUR.toLocaleString('nl-NL')}{' '}
    <span className="text-text-muted text-sm font-normal">{tCommon('priceSuffix')}</span>
  </p>
  <div className="flex flex-col items-stretch gap-2 sm:items-end">
    <Button
      href={
        isPilot ? `/${locale}/trainings/pilot/book` : `/${locale}/contact?training=${trainingId}`
      }
      data-testid={`book-training-${trainingId}`}
    >
      {tCommon('bookCta')}
    </Button>
    {isPilot && (
      <a
        href={`/${locale}/contact?training=pilot`}
        data-testid="book-training-pilot-contact"
        className="text-text-muted text-xs underline"
      >
        {tCommon('contactLink')}
      </a>
    )}
  </div>
</div>
```

- [ ] **Step 5: Run the component + details-page tests**

Run: `pnpm exec vitest run tests/components/TrainingCard.test.tsx tests/app/training-details-page.test.tsx`
Expected: PASS. Add an equivalent pilot-CTA assertion to `training-details-page.test.tsx` (testid `book-training-pilot` → href contains `/trainings/pilot/book`).

- [ ] **Step 6: Commit**

```bash
git add components/TrainingCard.tsx components/TrainingDetail.tsx tests/components/TrainingCard.test.tsx tests/app/training-details-page.test.tsx
git commit -m "feat(booking): pilot CTA -> booking page + contact link"
```

---

## Task 13: E2E smoke (`tests/e2e/booking.spec.ts`)

Verify the booking page renders and the form behaves in both locales. Do **not** drive a live Stripe payment in CI; stub the `/api/checkout` response so the flow stops at "would redirect".

**Files:**

- Create: `tests/e2e/booking.spec.ts`

- [ ] **Step 1: Write the spec**

```typescript
// tests/e2e/booking.spec.ts
import { test, expect } from '@playwright/test';

for (const locale of ['nl', 'en'] as const) {
  test(`booking form renders and grows rows (${locale})`, async ({ page }) => {
    await page.goto(`/${locale}/trainings/pilot/book`);
    await expect(page.getByTestId('booking-submit')).toBeVisible();
    await expect(page.getByTestId('booking-attendee-name-0')).toBeVisible();

    await page.getByTestId('booking-seats').selectOption('3');
    await expect(page.getByTestId('booking-attendee-name-2')).toBeVisible();
  });
}

test('submitting redirects to the Stripe url (checkout stubbed)', async ({ page }) => {
  await page.route('**/api/checkout', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ url: 'https://example.com/stub-checkout' }),
    }),
  );

  await page.goto('/nl/trainings/pilot/book');
  await page.getByTestId('booking-attendee-name-0').fill('Pascal');
  await page.getByTestId('booking-attendee-email-0').fill('pascal@example.com');
  await Promise.all([
    page.waitForURL('https://example.com/stub-checkout'),
    page.getByTestId('booking-submit').click(),
  ]);
  await expect(page).toHaveURL('https://example.com/stub-checkout');
});
```

- [ ] **Step 2: Run the spec**

Run: `pnpm exec playwright test tests/e2e/booking.spec.ts`
Expected: PASS (3 tests). If the dev server isn't auto-started by `playwright.config.ts`, start it first (`pnpm dev`) or rely on the config's webServer block.

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/booking.spec.ts
git commit -m "test(e2e): pilot booking form smoke (checkout stubbed)"
```

---

## Task 14: Full verification + PR

- [ ] **Step 1: Run the whole unit suite**

Run: `pnpm test`
Expected: all green, including the new pricing/validation/http/stripe/email/checkout/webhook/BookingForm/booking-page suites.

- [ ] **Step 2: Typecheck, lint, i18n parity**

Run: `pnpm typecheck && pnpm lint && pnpm verify:i18n`
Expected: all pass.

- [ ] **Step 3: Build**

Run: `pnpm build`
Expected: build succeeds; the two new API routes and the booking pages appear in the route list.

- [ ] **Step 4: E2E**

Run: `pnpm test:e2e`
Expected: existing specs + the new booking spec pass.

- [ ] **Step 5: Manual local smoke (test mode)**

With `STRIPE_SECRET_KEY` (test) set, run `pnpm dev`, open `/nl/trainings/pilot/book`, fill one attendee, submit. Confirm the request hits `/api/checkout` and returns a `checkout.stripe.com` URL. For full webhook testing use the Stripe CLI: `stripe listen --forward-to localhost:3000/api/stripe/webhook` then `stripe trigger checkout.session.completed`. (Document this as a follow-up if the Stripe CLI isn't available in the worktree.)

- [ ] **Step 6: Push and open the PR**

```bash
git push -u origin feat/stripe-pilot-booking
gh pr create --title "feat: Stripe pilot booking + payment" --body "$(cat <<'EOF'
## Summary
- Adds self-serve card payment for the pilot training only (€349 ex VAT p.p., online cohort 29–30 Jun 2026)
- Stripe Checkout: server-side pricing from data/trainings.ts + 21% VAT, per-attendee form, quantity = seats
- Webhook-driven fulfillment (checkout.session.completed): buyer confirmation + hello@ notification via Resend
- Basic/advanced unchanged (stay on contact form); pilot keeps a secondary contact link

## Security
- Fulfillment on the webhook, never the success redirect
- Price resolved server-side; client sends trainingId, never an amount
- Webhook signature verified against the raw body; handler is idempotent on event id
- /api/checkout reuses the contact route's origin allow-list + rate limit

## Test plan
- [ ] `pnpm test` green (pricing/validation/http/stripe/email/checkout/webhook/form/page)
- [ ] `pnpm typecheck && pnpm lint && pnpm verify:i18n` pass
- [ ] `pnpm build` succeeds; new routes listed
- [ ] `/nl/trainings/pilot/book` and `/en/...` render; seat selector grows rows
- [ ] Local test-mode checkout returns a Stripe URL; `stripe trigger checkout.session.completed` fires both emails

## Prerequisites (deploy)
- Set STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET in Vercel
- Register the webhook endpoint in the Stripe Dashboard → /api/stripe/webhook (checkout.session.completed)

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 7: Surface the Vercel preview URL**

Run: `gh pr checks` (once Vercel posts) and share the preview URL. Verify the booking page renders in both locales on the preview.

---

## Self-Review (completed during planning)

- **Spec coverage:** scope (Task 12, 3) ✓; Checkout mechanism (7) ✓; VAT +21% server-side (2) ✓; quantity selector (10) ✓; per-attendee name+email (3, 10) ✓; webhook fulfillment + both emails (6, 8) ✓; keep contact link (9, 12) ✓; env vars (1) ✓; i18n parity (9) ✓; testing (every task + 13, 14) ✓; security non-negotiables — webhook-not-redirect (8), server-side price (2, 7), raw-body signature + idempotency (8), origin+rate-limit reuse (4, 7) ✓.
- **Type consistency:** `priceWithVat → {netCents,vatCents,grossCents}` used in Tasks 2/7; `BookingDetails {attendees,seats,grossCents}` defined in Task 6 and built identically in Task 8; `bookingSchema`/`BookingInput` defined in Task 3, consumed in 7/10; `getStripe()` defined in 5, used in 7/8; `isAllowedOrigin`/`clientIp` defined in 4, used in 7.
- **Placeholder scan:** every code step contains full code; no TBD/TODO. The only deferred item is the optional Stripe CLI webhook smoke (Task 14 Step 5), explicitly noted as environment-dependent.
- **Known limitation (from spec):** in-memory webhook dedupe is per-instance best-effort; Task 8 un-marks on fulfillment failure so Stripe retries. Acceptable for pilot volume per the approved spec.
