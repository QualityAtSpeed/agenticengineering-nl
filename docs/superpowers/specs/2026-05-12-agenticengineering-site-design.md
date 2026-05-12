# agenticengineering.nl — Site Design Spec

**Date:** 2026-05-12
**Owner:** Pascal Dufour
**Status:** Approved (brainstorm phase) — ready for implementation plan

---

## 1. Purpose

Build the public marketing site for **agenticengineering.nl**. The site sells two trainings in agentic engineering with Claude Code:

- **Basic** — 1 day, foundations + first hands-on
- **Advanced** — 2 days, integration + automation + team scale

Site doubles as a course-catalog platform (multi-product future). Launch scope is the two trainings plus instructor and contact pages.

### Primary goals

1. Communicate what agentic engineering is and what each training delivers.
2. Convert visitors into qualified leads via a contact form.
3. Establish brand authority in the Dutch and English-speaking dev markets.

### Audience

- Senior engineers / tech leads
- Engineering managers / CTOs
- Junior/mid developers

### Non-goals (v1)

- Blog / content marketing
- Online payments / booking calendar
- CMS-backed content
- Testimonials / client logos (placeholder slot only)
- Analytics tooling
- Privacy policy / cookie banner / T&C _(flagged risk — see §10)_

---

## 2. Trainings

### Basic — 1 day

**Outcome:** Ship working features with Claude Code, structured context, MCP-enabled, basic TDD loop with guardrails.

**Modules:**

1. `fundamentals-of-agent` — Fundamentals of an agent
2. `context-architecture` — CLAUDE.md, Rules files, project-wide configuration
3. `context-window-mechanics` — Compression, priming, recency bias
4. `build-first-feature` — Build first features with an agent
5. `intro-skills-rules` — Intro to Skills & Rules
6. `using-mcp-servers` — Using MCP servers (consume existing servers)
7. `test-first-intro` — Test-first strategy (intro)
8. `basic-hooks-quality-gates` — Basic hooks & quality gates (pre-commit, format/lint)

### Advanced — 2 days

**Outcome:** Engineering organisation runs agentic SDLC end-to-end with custom tooling and guardrails.

**Day 1 — integration:**

1. `building-custom-mcp` — Building custom MCP servers
2. `skills-rules-deep` — Skills & Rules deep dive, authoring
3. `agents-sdlc-phases` — Agents in every SDLC phase: refinement, planning, implementation, code review, test

**Day 2 — automation & scale:**

4. `agent-harnessing` — Agent harnessing (subagents, parallelism, orchestration)
5. `advanced-hooks-quality-gates` — Advanced hooks & quality gates (policy enforcement, CI integration, custom gates)
6. `test-first-advanced` — Test-first advanced patterns
7. `team-workflows-governance` — Team workflows + governance

### Delivery formats

- **In-company / on-site** — client books for team at their location
- **Public cohorts** — scheduled public dates, individual seats
- **Remote** — live online (Zoom/Teams)

### Pricing

Public prices, EUR ex-VAT. Actual numbers set by Pascal before launch (placeholders in `data/trainings.ts`).

---

## 3. Stack & infrastructure

| Concern   | Choice                                              |
| --------- | --------------------------------------------------- |
| Framework | Next.js 15 (App Router, TypeScript, RSC)            |
| Styling   | Tailwind CSS v4                                     |
| i18n      | `next-intl` (NL default, EN secondary)              |
| Forms     | React Hook Form + Zod (shared client/server schema) |
| Email     | Resend SDK                                          |
| Deploy    | Vercel (preview per PR, prod on `main`)             |
| Runtime   | Node 20+, pnpm                                      |

### Repository layout

```
app/
  [locale]/
    (marketing)/
      page.tsx          # Home
      about/page.tsx
      contact/page.tsx
      impressum/page.tsx
    layout.tsx
    not-found.tsx
  api/
    contact/route.ts
components/
  Nav.tsx
  Footer.tsx
  LangSwitcher.tsx
  Hero.tsx
  TrainingCard.tsx
  TrainingDetail.tsx
  CurriculumList.tsx
  ContactForm.tsx
  InstructorCard.tsx
  TerminalBlock.tsx
data/
  trainings.ts
  instructors.ts
lib/
  email.ts
  validation.ts
  rate-limit.ts
  sanitize.ts
messages/
  nl.json
  en.json
i18n/
  routing.ts
  request.ts
middleware.ts
public/
  logo.svg
  og/{nl,en}.png
docs/superpowers/specs/...
```

---

## 4. Routes & sitemap

```
/                    → middleware redirect → /nl
/[locale]            → Home
/[locale]/about      → Instructors
/[locale]/contact    → Contact form
/[locale]/impressum  → KVK + business address
/api/contact         → POST: validate + send via Resend
/sitemap.xml         → auto-generated, locale-aware
/robots.txt          → allow all
```

`generateStaticParams` returns both locales for every page; build emits fully static HTML except `/api/contact`.

---

## 5. Home page layout (top → bottom)

1. **Nav** — logo + nav (About, Contact) + `<LangSwitcher />`. Sticky, terminal-style border-bottom.
2. **Hero** — H1 with mono accent (e.g. `> agentic engineering`), subtitle, primary CTA "Book training" → `/contact`, secondary CTA "View curriculum" → anchor.
3. **What is agentic engineering** — 2-3 paragraph pitch in `<TerminalBlock />`.
4. **Trainings overview** — two `<TrainingCard />` side-by-side (Basic 1d, Advanced 2d): duration · price · audience · "View details" anchor.
5. **Training detail — Basic** — full curriculum (8 modules), outcomes, prerequisites, delivery formats, price, CTA.
6. **Training detail — Advanced** — full curriculum (7 modules, Day 1 / Day 2 split), outcomes, prerequisites, delivery formats, price, CTA.
7. **Delivery formats** — three tiles (In-company, Public cohorts, Remote).
8. **Instructors snippet** — Pascal + collaborator headshots/names/one-liners; "Meet the team →" → `/about`.
9. **Testimonial slot (placeholder)** — bordered container with `// awaiting first cohort` mono note.
10. **Final CTA band** — "Ready to train your team?" → `/contact`.
11. **Footer** — brand wordmark · nav · socials (GitHub/X/LinkedIn) · impressum + KVK.

---

## 6. Data model

`data/trainings.ts`:

```ts
export type ModuleId =
  | 'fundamentals-of-agent'
  | 'context-architecture'
  | 'context-window-mechanics'
  | 'build-first-feature'
  | 'intro-skills-rules'
  | 'using-mcp-servers'
  | 'test-first-intro'
  | 'basic-hooks-quality-gates'
  | 'building-custom-mcp'
  | 'skills-rules-deep'
  | 'agents-sdlc-phases'
  | 'agent-harnessing'
  | 'advanced-hooks-quality-gates'
  | 'test-first-advanced'
  | 'team-workflows-governance';

export type DeliveryFormat = 'inCompany' | 'publicCohort' | 'remote';

export type Module = {
  id: ModuleId;
  day?: 1 | 2; // advanced only
};

export type Training = {
  id: 'basic' | 'advanced';
  durationDays: 1 | 2;
  priceEUR: number; // ex-VAT
  modules: Module[];
  deliveryFormats: DeliveryFormat[];
};

export const trainings: Record<Training['id'], Training>;
```

All human-readable content (titles, bullets, outcomes, audience, prerequisites) lives in `messages/{nl,en}.json` keyed by module id and training id.

`data/instructors.ts`:

```ts
export type Instructor = {
  id: string;
  name: string;
  role: string; // i18n key
  bio: string; // i18n key
  photo: string; // /public path
  socials?: { github?: string; x?: string; linkedin?: string };
};
```

---

## 7. i18n

- `next-intl` with locales `['nl', 'en']`, default `nl`.
- Routes prefixed `/nl/...`, `/en/...`.
- `middleware.ts` matches `/` → redirect to default locale, honours `Accept-Language` on first visit, cookie persists choice.
- `<LangSwitcher />` swaps locale while preserving pathname.
- `<html lang>` reflects current locale.
- `hreflang` alternates in `<head>` and sitemap.
- `messages/*.json` flat-ish nested keys: `nav`, `hero`, `trainings.basic`, `trainings.advanced`, `modules.<id>`, `deliveryFormats.<id>`, `contact`, `about`, `footer`, `impressum`.
- **CI integrity check**: every key present in both locales; every `ModuleId` has `title` and `bullets` entries.

---

## 8. Contact form

### Client

`<ContactForm />` (React Hook Form + Zod):

| Field              | Type           | Constraints                                                 |
| ------------------ | -------------- | ----------------------------------------------------------- |
| name               | string         | required, 1-100                                             |
| email              | string (email) | required, RFC, ≤254                                         |
| company            | string         | optional, ≤200                                              |
| trainingInterest   | enum           | `basic` \| `advanced` \| `both` \| `other`                  |
| deliveryPref       | enum           | `inCompany` \| `publicCohort` \| `remote` \| `noPreference` |
| message            | string         | required, 10-5000                                           |
| website (honeypot) | string         | hidden; must be empty                                       |

States: idle → submitting → success | error. Success replaces form with confirmation; error keeps form, shows banner with mailto fallback.

### Server — `POST /api/contact`

Pipeline:

1. Parse JSON body → Zod parse (same schema).
2. Reject if `Origin` not in allowlist (`agenticengineering.nl`, configured Vercel preview pattern) → 403.
3. Rate-limit by IP (5 req/min). Exceeded → 429.
4. Honeypot non-empty → 200 fake-success, drop.
5. Sanitize `name`/`email`/`company` — strip `\r\n` to prevent header injection.
6. Call Resend: `from: CONTACT_FROM_EMAIL`, `to: CONTACT_EMAIL`, `reply_to: <user email>`, `subject: "[agenticengineering.nl] {trainingInterest} — {name}"`, body templated.
7. 10s timeout on Resend call. Failure → 502.
8. Success → 200 `{ ok: true }`. Log only request id + status.

### Env vars

| Name                 | Scope  | Required                                                     |
| -------------------- | ------ | ------------------------------------------------------------ |
| `RESEND_API_KEY`     | server | yes                                                          |
| `CONTACT_EMAIL`      | server | default `pascal@validate-it.nl`                              |
| `CONTACT_FROM_EMAIL` | server | verified Resend sender, e.g. `noreply@agenticengineering.nl` |
| `RATE_LIMIT_KV_URL`  | server | optional (Upstash); falls back to in-memory                  |

---

## 9. Visual system — Terminal/Dev

### Tailwind tokens

```ts
colors: {
  bg: { base: '#0d1117', elevated: '#161b22' },
  border: { subtle: '#30363d' },
  text: { primary: '#c9d1d9', muted: '#8b949e' },
  accent: { green: '#7ee787', blue: '#58a6ff', orange: '#f0883e', red: '#ff7b72' },
}
```

### Typography

- Headings: `JetBrains Mono` 700 (via `next/font/google`)
- Body: `Inter` 400/500/600
- All `display: swap`, primary preloaded
- Mono accents use `>` and `$` as bullets / section openers (e.g. `> trainings`, `$ book training`)
- Kicker labels: all-caps mono small text (e.g. `AGENTIC ENGINEERING · NL`)

### Layout

- Radii: `rounded-sm` (sharp, terminal feel)
- Borders: 1px subtle on cards/blocks
- Hover: accent-color underline + subtle glow on CTAs
- Motion: minimal — fade-in on scroll for sections (CSS `@starting-style` or `framer-motion` if needed). Reduced-motion disables all transitions.
- Mobile-first; breakpoints sm/md/lg/xl. Nav collapses < md. Training cards stack < lg.
- Hero font: `clamp(2rem, 6vw, 4.5rem)`.

### Accessibility

- WCAG AA contrast on all text.
- Focus rings: 2px solid `accent.blue`, 2px offset.
- Skip-to-content link.
- Form fields labelled; errors linked via `aria-describedby`.
- Language switcher announces locale change to assistive tech.
- Axe scan 0 violations on AA — CI gate.

---

## 10. Error handling

| Surface       | Failure                  | Behaviour                                                      |
| ------------- | ------------------------ | -------------------------------------------------------------- |
| Form (client) | Zod fails                | inline field error, no submit                                  |
| Form (server) | Zod fails                | 400 with field errors                                          |
| Form (server) | Resend error / timeout   | 502 + banner "Something went wrong — mail pascal@... directly" |
| Form          | Rate-limit exceeded      | 429 + retry message                                            |
| Form          | Honeypot filled          | 200 fake-success, drop silently                                |
| Form          | Origin mismatch          | 403                                                            |
| Routes        | Unknown locale           | 404                                                            |
| Routes        | Unknown path             | locale-aware `not-found.tsx`                                   |
| Image         | Missing instructor photo | fallback initials avatar                                       |
| Body          | No-JS                    | progressive enhancement — server action accepts FormData       |

---

## 11. Security & vulnerability checks

### Application-layer

- **Input validation** — Zod everywhere; max-length caps as table in §8.
- **Output encoding** — React auto-escapes. `dangerouslySetInnerHTML` permitted **only** for JSON-LD `<script type="application/ld+json">` blocks rendering trusted, statically-typed schema.org payloads (Course, Organization). Wrap in a `<JsonLd />` helper that `JSON.stringify`s the typed object — never accepts user input. ESLint `react/no-danger: error` globally, with file-level disable allowed only inside `components/JsonLd.tsx`.
- **Email header injection** — sanitize CR/LF from `name`, `email`, `subject`, `reply-to` before Resend call.
- **Rate-limit** — 5 req/min/IP on `/api/contact`. Upstash/Vercel KV preferred; in-memory Map acceptable v1 single-region.
- **Honeypot** — hidden `website` field; silent drop on fill.
- **Turnstile slot** — reserved (not enabled v1); enable if spam appears.
- **CSRF** — same-origin only; `Origin` header allowlist.
- **No auth, no sessions** — only `next-intl` locale cookie (`HttpOnly`, `SameSite=Lax`, `Secure`).
- **Secrets** — Vercel env only; `.env*` gitignored; no `NEXT_PUBLIC_` for server secrets.

### HTTP / transport

- HTTPS enforced (Vercel default).
- Security headers via `next.config.ts` `headers()`:
  - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
  - `Content-Security-Policy` — strict, nonce-based:
    - `default-src 'self'`
    - `script-src 'self' 'nonce-{nonce}'`
    - `style-src 'self' 'unsafe-inline'` (Tailwind compatibility)
    - `img-src 'self' data:`
    - `font-src 'self'`
    - `connect-src 'self' https://api.resend.com`
    - `frame-ancestors 'none'`
    - `base-uri 'self'`
    - `form-action 'self'`

### PII handling

- Contact form values only in transit (Resend send). No DB persistence.
- Server logs scrub form body — log only request id + status.
- Vercel platform access logs apply (flagged risk — see below).

### CI security gates

- `pnpm audit --audit-level=high` — block on high/critical.
- `osv-scanner` on PR.
- GitHub CodeQL — JS/TS scan enabled.
- `gitleaks` pre-commit + CI — block secret commits.
- ESLint plugins: `eslint-plugin-security`, `eslint-plugin-no-secrets`.
- `pnpm install --frozen-lockfile` in CI (prevents lockfile drift).
- `license-checker` ensures no GPL contamination.

### Pre-launch security checklist (acceptance)

1. securityheaders.com — grade A+
2. Mozilla Observatory — grade B+ or higher
3. `pnpm audit` clean at deploy commit
4. CodeQL no high-severity alerts
5. Manual: form header-injection attempt rejected
6. Manual: rate-limit + honeypot fire as designed
7. Manual: CSRF rejects cross-origin POST
8. Manual: TLS valid; HSTS preload-eligible
9. Manual: oversized message (>5000 char) rejected with 400
10. `.env.local` + `.env*` in `.gitignore`; `gitleaks` clean on full repo scan

### Known residual risks

- No privacy policy / cookie notice despite PII collection via contact form. **Strongly recommend adding before public launch** — GDPR exposure for NL-based business.
- No T&C for training engagement — recommend before first paid booking.
- In-memory rate-limit ineffective across multiple Vercel edge regions — upgrade to Upstash/KV before scale or if multi-region enabled.

---

## 12. Testing strategy

| Layer          | Tool                           | Scope                                                                                                                    |
| -------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| Unit           | Vitest                         | `lib/validation.ts`, `lib/email.ts` (mocked), `lib/sanitize.ts`, `lib/rate-limit.ts`                                     |
| Component      | Vitest + React Testing Library | `<ContactForm />` success/error states, `<TrainingCard />` data binding, `<LangSwitcher />` pathname preservation        |
| Integration    | Vitest                         | `/api/contact` — valid payload calls Resend; invalid → 400; rate-limit → 429; honeypot → 200 drop; origin mismatch → 403 |
| E2E            | Playwright                     | Home loads both locales; nav switches locale + preserves path; contact form submits end-to-end against mocked Resend     |
| i18n integrity | custom script (CI)             | every key in `nl.json` ↔ `en.json`; every `ModuleId` translated                                                          |
| Accessibility  | `@axe-core/playwright`         | home, about, contact — 0 AA violations                                                                                   |

Coverage target: ≥80% lines on `lib/` + `app/api/`.

---

## 13. Build, CI, deploy

### Scripts

- `pnpm dev` — Next dev server
- `pnpm build` — `next build` (typecheck + i18n integrity)
- `pnpm test` — Vitest
- `pnpm test:e2e` — Playwright against preview build
- `pnpm lint` — ESLint
- `pnpm format` — Prettier
- Pre-commit (lefthook): lint-staged → prettier + eslint on changed files; gitleaks

### CI (GitHub Actions, on PR)

1. install (frozen lockfile)
2. typecheck
3. lint
4. test (unit + integration)
5. build
6. e2e (Playwright)
7. axe scan
8. security gates (pnpm audit, osv-scanner, codeql, gitleaks)
9. i18n integrity script

Red blocks merge.

### Deploy (Vercel)

- Repo linked to Vercel.
- `main` → prod `agenticengineering.nl`.
- All PRs → preview URLs.
- DNS: A/CNAME to Vercel (user owns domain — confirm registration before launch).
- Env vars set in Vercel: `RESEND_API_KEY`, `CONTACT_EMAIL`, `CONTACT_FROM_EMAIL`, optional `RATE_LIMIT_KV_URL`.
- Resend domain verification for `agenticengineering.nl` (SPF/DKIM/DMARC records).

### Performance budgets

- Lighthouse mobile: Performance ≥95, Accessibility 100, Best Practices ≥95, SEO 100
- LCP < 2.5s on 4G
- Only `<ContactForm />` and `<LangSwitcher />` ship client JS; all other pages RSC-only
- Fonts: `display: swap`, primary preloaded

### SEO

- Per-locale `<title>` + meta description in `messages/*.json`
- `<html lang>` per locale
- `hreflang` alternates `nl`/`en` in `<head>` and `sitemap.xml`
- Open Graph + Twitter card images per locale
- `robots.txt` allow all
- Structured data: `Course` schema.org per training, `Organization` on home

---

## 14. Acceptance criteria (launch ready)

1. Both locales fully translated; switcher round-trip works on every page.
2. Contact form delivers email to `CONTACT_EMAIL`; honeypot blocks bots; rate-limit blocks bursts; CSRF rejects cross-origin.
3. Home renders Hero + 2 trainings inline with full curriculum (8 Basic + 7 Advanced modules) + pricing + delivery formats + instructor snippet + footer.
4. About page lists Pascal + collaborators with bios.
5. Impressum lists KVK + business address.
6. Lighthouse targets met on prod.
7. CI green: tests + i18n integrity + axe + security gates.
8. Visual style matches Terminal/Dev tokens.
9. Security pre-launch checklist (§11) all green.
10. Deployed to Vercel at custom domain with HTTPS + verified Resend sender.

---

## 15. Open items (require user input before plan)

- Pricing numbers for Basic and Advanced (EUR ex-VAT).
- KVK number + business address for impressum.
- Logo files + brand color overrides if any (Terminal/Dev palette is the default).
- Collaborator info: names, roles, bios, photos, socials.
- Confirmation that `agenticengineering.nl` is registered and pointable to Vercel.
- Resend account + verified sender domain.
- Decision on privacy/cookie/T&C — recommend tackling before launch despite v1 scope.
