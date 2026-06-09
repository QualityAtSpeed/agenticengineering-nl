# Stripe pilot booking — design

**Date:** 2026-06-09
**Status:** Approved (brainstorm)
**Scope:** Add card payment for the **pilot** training only. Basic and advanced are unchanged.

## Goal

Let a visitor book and pay for the pilot training by card. The pilot is €349 excl. BTW per person, an online-only cohort on 29–30 June 2026. Today every "Boek training" button links to the contact form (`/[locale]/contact?training=<id>`); this adds a real pay path for the pilot while keeping a contact link for people who want to ask first.

## Decisions

| Decision          | Choice                                                                                                                                              |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Self-serve scope  | Pilot only (€349). Basic/advanced keep the contact-form lead flow.                                                                                  |
| Payment mechanism | Stripe Checkout (hosted Session).                                                                                                                   |
| VAT               | Add 21% NL VAT on top, computed server-side. €349 net → €73.29 VAT → €422.29 gross per seat.                                                        |
| Quantity          | Seat selector; buyer can book multiple attendees in one payment.                                                                                    |
| Attendee data     | Per-attendee name + email, captured in a pre-checkout form.                                                                                         |
| Fulfillment       | Webhook-driven: buyer confirmation email + `hello@` notification, both via existing Resend. Stripe Dashboard is the system of record (no database). |
| Contact path      | Keep. Pilot gets a pay button **and** a smaller "Vragen? Contact" link.                                                                             |

## Flow

1. Pilot card/detail CTA links to a new page **`/[locale]/trainings/pilot/book`** (instead of the contact form).
2. The booking page renders a small form: a **seat count** selector plus one **name + email row per attendee** (rows grow/shrink with the seat count). Validated with zod + react-hook-form (same stack as the contact form).
3. Submit posts to **`POST /api/checkout`** with `{ trainingId: 'pilot', attendees: [{ name, email }, ...] }`.
4. The server looks up the price **from `data/trainings.ts`** (never trusts a client-supplied amount), computes 21% VAT, and creates a **Stripe Checkout Session**:
   - `quantity = attendees.length`
   - line item priced from the server-side gross-per-seat amount
   - attendee names/emails stored in session `metadata`
   - `success_url` → `/[locale]/trainings/pilot/book/success`, `cancel_url` → back to the booking page
   - returns the Session URL; the client redirects to it.
5. Stripe hosts the card page. On success the buyer lands on the success page — **UX only, no fulfillment there**.
6. **`POST /api/stripe/webhook`** receives `checkout.session.completed`, verifies the signature, and fulfills: sends the buyer confirmation email and the `hello@` notification. Handler is idempotent on the Stripe event id.

## Security (non-negotiable)

- **Fulfill on the webhook, never on the success redirect.** The redirect can be closed or skipped and is not trustworthy. The success page is cosmetic.
- **Price is resolved server-side** from `data/trainings.ts`. The client sends `trainingId`, never an amount — prevents price tampering.
- **Webhook signature verification** uses the raw request body: App Router `await req.text()` + `stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET)`. Never `req.json()` before verifying.
- **Idempotency**: webhooks redeliver. Track handled event ids (in-memory LRU is acceptable for this volume; Stripe Dashboard remains the source of truth) and no-op on repeats so confirmation emails don't double-send.
- `/api/checkout` reuses the contact route's **origin allow-list** (`ALLOWED_ORIGIN_PATTERNS`) and **rate-limit** (`checkRateLimit`) guards.
- Build and CI run against Stripe **test-mode** keys. No live card flows in CI.

## Components and files

New:

- `lib/stripe.ts` — lazy, server-only Stripe client.
- `lib/pricing.ts` — `priceWithVat(trainingId)` → `{ net, vat, gross }`. Single source of VAT math.
- `app/api/checkout/route.ts` — create Checkout Session (origin + rate-limit guarded, `runtime = 'nodejs'`).
- `app/api/stripe/webhook/route.ts` — verify signature, fulfill, idempotent (`runtime = 'nodejs'`).
- `components/BookingForm.tsx` — seat selector + attendee rows, react-hook-form + zod.
- `app/[locale]/trainings/pilot/book/page.tsx` — booking page hosting the form.
- `app/[locale]/trainings/pilot/book/success/page.tsx` — confirmation/UX page.

Modified:

- `lib/email.ts` — add `sendBookingConfirmation` (buyer) and `sendBookingNotification` (`hello@`), reusing the existing Resend setup.
- `lib/validation.ts` — add `bookingSchema` (trainingId enum + non-empty attendees array of `{ name, email }`).
- `components/TrainingCard.tsx`, `components/TrainingDetail.tsx` — for the pilot, point the primary CTA at the booking page and add the secondary contact link. Other trainings keep the current contact CTA.
- `.env.example` — add the three Stripe vars below.

## i18n

New keys in `messages/nl.json` (default) and `messages/en.json`:

- booking form: heading, seat-count label, attendee name/email labels, submit button, validation messages
- secondary contact link label ("Vragen? Contact" / "Questions? Contact")
- success page copy
- email subjects and bodies (confirmation + notification)

Dutch is the default locale; both locales must carry every new key (enforced by `pnpm verify:i18n`).

## Environment variables

Add to `.env.example` (following the existing pattern):

- `STRIPE_SECRET_KEY` — server-side Stripe API key.
- `STRIPE_PUBLISHABLE_KEY` — client-safe key (redirect uses the Session URL directly, but kept for completeness/future Elements).
- `STRIPE_WEBHOOK_SECRET` — for signature verification.

## Dependencies

- `pnpm add stripe` — official Node SDK, used for Session creation and webhook signature verification.

## Testing

- **Unit**: `priceWithVat` (VAT math, rounding, quantity); `bookingSchema` (rejects empty attendees, bad email, unknown trainingId).
- **Webhook handler**: rejects bad/missing signature; idempotent on repeated event id; fires both emails on a valid `checkout.session.completed` (Resend mocked).
- **`/api/checkout`**: rejects client-supplied amounts (price-tamper); enforces origin allow-list + rate limit; returns a Session URL on valid input (Stripe mocked).
- **E2E (Playwright)**: booking form renders in both locales, seat selector grows attendee rows, validation blocks submit; the Stripe redirect is stubbed (test mode, no live card in CI).

## Prerequisites (user-side)

- A Stripe account with test and live keys.
- A webhook endpoint registered in the Stripe Dashboard pointing at `https://agenticengineering.nl/api/stripe/webhook`, subscribed to `checkout.session.completed`. The signing secret goes into `STRIPE_WEBHOOK_SECRET`.

## Out of scope

- Payment for basic/advanced trainings (stay on contact form).
- Date/cohort selection (pilot is a single fixed cohort).
- Stripe Tax / cross-border VAT (single NL cohort; flat 21%).
- Persistent booking database (Stripe Dashboard + email is the record).
- Refund/cancellation UI (handled in the Stripe Dashboard).
