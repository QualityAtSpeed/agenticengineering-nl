# agenticengineering.nl

Training and curated, valuable news for agentic engineering. Bilingual (NL/EN), dark terminal-native aesthetic, deployed on Vercel.

Live: <https://agenticengineering.nl>

![agenticengineering.nl homepage](docs/screenshot.png)

---

## Stack

| Layer           | Choice                                                 |
| --------------- | ------------------------------------------------------ |
| Framework       | Next.js 15 (App Router, RSC)                           |
| Runtime         | Node.js 20                                             |
| Package manager | pnpm 9                                                 |
| Styling         | Tailwind CSS v4 (`@theme` tokens in `app/globals.css`) |
| i18n            | next-intl (NL default, EN alt)                         |
| Forms           | react-hook-form + Zod                                  |
| Mail            | Resend                                                 |
| Tests           | Vitest (unit) + Playwright (e2e + axe a11y)            |
| Hosting         | Vercel (Fluid Compute)                                 |

## Getting started

Prerequisites: Node.js 20 (`.nvmrc`), pnpm 9, git, Claude CLI (`claude`).

```bash
git clone https://github.com/<owner>/agenticengineering.nl.git
cd agenticengineering.nl
nvm use                   # picks Node 20 from .nvmrc
corepack enable           # provides pnpm 9
pnpm install
pnpm exec playwright install   # one-time, only if you'll run e2e
cp .env.example .env.local     # required: copy and fill in for local dev (contact form + feature flags)
pnpm dev                  # http://localhost:3000 → redirects to /nl
```

The pre-commit `readme-check` hook requires the Claude CLI and an Anthropic API key:

```bash
curl -fsSL https://claude.ai/install.sh | bash   # or: brew install --cask claude-code
export ANTHROPIC_API_KEY=<your-api-key>           # add to ~/.zshrc / ~/.bashrc to persist
```

First-run sanity check:

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm verify:i18n
```

Contact form needs `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, `CONTACT_EMAIL` in `.env.local` (see [Environment variables](#environment-variables)). Skip if you're only touching UI/copy — the rest of the site renders without them.

Editing checklist:

- UI/copy → read `PRODUCT.md` + `DESIGN.md` first.
- New translation key → add to **both** `messages/nl.json` and `messages/en.json`; `pnpm verify:i18n` gates CI.
- New route → add it under `app/[locale]/`; sitemap auto-picks it up.
- API/server logic → keep validation in `lib/validation.ts`, side effects in `lib/*`.
- New news article → create `news/<slug>.md` with required frontmatter (see below). Run `pnpm article:image <source-url> <slug>` to fetch and save the OG image before committing.
- Pre-commit `lefthook` hook runs `format`, `lint`, and `readme-check` (validates README stays in sync; requires `claude` CLI + `ANTHROPIC_API_KEY`). Don't bypass with `--no-verify` unless you're fixing the hook itself.

### News article frontmatter

```yaml
title_nl: 'NL title' # required
title_en: 'EN title' # required
url: 'https://...' # required — canonical link shown to readers
source_url: 'https://...' # optional — URL visited to scrape og:image (defaults to url)
type: article # optional — 'article' (default) or 'blog'
date: 'YYYY-MM-DD' # required
author: 'First Last' # optional
placed_by: 'Name' # optional — who curated this entry
summary_nl: '...' # required
summary_en: '...' # required
image: '/news/<slug>.jpg' # optional — path relative to /public; falls back to /qas-icon.svg
```

Fetch the image with:

```bash
pnpm article:image <source-url> <slug>
# Example: pnpm article:image https://medium.com/some-post my-article-slug
```

"The script reads the page's `og:image` in headless mode, downloads it, and saves it to `public/news/<slug>.<ext>`. The source host **and** the image host must both be listed in `data/trusted-domains.json` — add new domains there when needed.

Deploy: push to `main` → auto-prod via Vercel GitHub App. Push any other branch → preview URL (see [Preview environment](#preview-environment)).

## Layout

```
app/
  [locale]/            # NL/EN routed pages (home, about, contact, impressum)
  api/contact/         # POST handler — Zod + rate-limit + Resend
  robots.ts            # /robots.txt
  sitemap.ts           # /sitemap.xml
  globals.css          # Tailwind v4 @theme block (single source of design tokens)
components/            # Hero, Nav, Footer, TrainingCard, TrainingDetail, ContactForm,
                       # ArticleFilterBar, InstructorCard, Button, DayAgenda, ProofStrip,
                       # TimelineEntry, JsonLd, LangSwitcher, MobileMenu, …
lib/
  validation.ts        # Zod schemas (contactSchema, trainingInterestEnum, …)
  email.ts             # Resend wrapper, sendContactEmail()
  rate-limit.ts        # Per-IP token bucket (in-memory; per-instance)
  sanitize.ts          # CRLF strip for email headers
  articles.ts          # Article/news loader (reads news/ markdown files)
  parseFrontmatter.ts  # Frontmatter parser for markdown articles
  flags.ts             # Feature flag helpers (BLOGS_ENABLED, …)
data/
  trainings.ts         # Training catalogue + modules (typed)
  instructors.ts       # Instructor profiles (typed)
  trusted-domains.json # Allowlist for origin/CSRF checks
news/                  # Markdown news + blog posts (frontmatter + body)
i18n/                  # next-intl config (routing.ts, request.ts)
messages/              # nl.json, en.json (translation keys)
scripts/
  verify-i18n.ts       # CI gate: NL/EN key parity
  fetch-article-images.ts # Downloads OG images for news articles
  metrics.ts           # Site metrics helper
tests/                 # Vitest unit + Playwright e2e
PRODUCT.md             # Brand register (users, tone, anti-references, principles)
DESIGN.md              # Design system (colors, typography, components, do's/don'ts)
LICENSE                # MIT license (© QualityAtSpeed)
next.config.ts         # Security headers + next-intl plugin
```

## Local development

```bash
pnpm install
pnpm dev                  # http://localhost:3000 (auto-redirects /  → /nl)
```

Routes:

- `/nl`, `/en` — locale-scoped pages
- `/nl/about`, `/nl/contact`, `/nl/impressum` (and `/en/*`)
- `/api/contact` — POST endpoint
- `/sitemap.xml`, `/robots.txt`

### Useful scripts

```bash
pnpm typecheck            # tsc --noEmit
pnpm lint                 # eslint
pnpm test                 # vitest run (unit)
pnpm test:e2e             # playwright (requires `pnpm exec playwright install` once)
pnpm verify:i18n          # NL/EN translation key parity check
pnpm build                # production build
pnpm format               # prettier --write .
```

A pre-commit `lefthook` hook runs `format`, `lint`, and `readme-check`. The `readme-check` command calls the Claude CLI — requires `ANTHROPIC_API_KEY` set in your shell. Don't bypass with `--no-verify` unless you're fixing the hook itself.

## Environment variables

Copy `.env.example` to `.env.local` and fill in the keys you need. Everything except the contact-form keys has a safe default when unset.

```bash
cp .env.example .env.local
```

| Key                  | Scope  | Purpose                                                                                                                                                      |
| -------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `RESEND_API_KEY`     | server | Auth for Resend API (40+ char `re_...` token). Never a placeholder. Separate key per env.                                                                    |
| `CONTACT_FROM_EMAIL` | server | FROM address on outbound mail. Must be on a Resend-verified domain. Currently `hello@agenticengineering.nl`.                                                 |
| `CONTACT_EMAIL`      | server | TO address (inbox that receives form submissions). Differs by env (see Preview section below).                                                               |
| `BLOGS_ENABLED`      | server | Feature flag for blog entries on `/articles`. Set to `'true'` to show blog entries and the all/blogs/articles filter bar. Unset/empty hides both. See below. |

The three contact-form keys are set in **Production** and **Preview** scopes (Development scope is intentionally empty — local dev uses `.env.local`). `BLOGS_ENABLED` is set per-scope as needed (see Feature flags below). Set via Vercel CLI or UI:

```bash
vercel env add RESEND_API_KEY production
vercel env add CONTACT_FROM_EMAIL production
vercel env add CONTACT_EMAIL production

vercel env add RESEND_API_KEY preview
vercel env add CONTACT_FROM_EMAIL preview
vercel env add CONTACT_EMAIL preview
```

Or paste real values in Vercel UI → Project → Settings → Environment Variables. After editing, redeploy (`vercel --prod` for production, or push a branch for preview) for new values to land in the function.

Local dev does not need these (contact form requires them at runtime). For local mail testing, create `.env.local` with the same keys.

### Feature flags

`BLOGS_ENABLED` gates the blog feature on `/articles`. Implementation in `lib/flags.ts`.

| Value                         | Behavior                                                                                                |
| ----------------------------- | ------------------------------------------------------------------------------------------------------- |
| `'true'`                      | Blog entries (frontmatter `type: blog`) appear on `/articles`; filter bar (all/blogs/articles) renders. |
| unset / empty / anything else | Blog entries are filtered out; filter bar is hidden entirely.                                           |

Production stays gated until launch. To preview the flag locally, set `BLOGS_ENABLED=true` in `.env.local` (or inline: `BLOGS_ENABLED=true pnpm dev`). Playwright e2e already sets it via `playwright.config.ts` so the filter-bar tests run.

When flipping the flag on in Vercel, set it for the relevant scope:

```bash
vercel env add BLOGS_ENABLED preview     # paste: true
vercel env add BLOGS_ENABLED production  # paste: true (when ready to launch)
```

## Contact form pipeline

```
Browser → POST /api/contact → app/api/contact/route.ts
                ├─ Origin allowlist (CSRF)        → 403 if mismatch
                ├─ Per-IP rate-limit              → 429 if exceeded
                ├─ Honeypot `website` field       → 200 silent-drop if set
                ├─ Zod contactSchema validate     → 400 if invalid
                └─ lib/email.ts → Resend.emails.send()
                                  ├─ EmailError → 502
                                  └─ ok → 200
```

Allowed origins (regex in `app/api/contact/route.ts`):

- `https://agenticengineering.nl` and `https://www.agenticengineering.nl`
- `https://agenticengineering*.vercel.app`
- `http://localhost(:port)`

To-field is never user-controlled. CRLF-stripped via `lib/sanitize.ts` to prevent header injection.

## Security headers

Set in `next.config.ts`. Apply only in production (dev keeps relaxed for local tooling).

- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Content-Security-Policy:` `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://api.resend.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'`

## Deployment

### One-time

```bash
brew install vercel-cli
vercel login
vercel link              # links cwd to existing Vercel project
```

### Deploy

```bash
vercel --prod            # production deploy + alias to apex
```

Vercel GitHub App is connected, so pushes to `main` auto-deploy to production and pushes to any other branch auto-deploy to a preview URL. Manual `vercel --prod` still works for out-of-band hot deploys.

### DNS (TransIP)

Mail and web records coexist on the same zone.

**Web (Vercel):**

| Name  | Type  | Value                                         |
| ----- | ----- | --------------------------------------------- |
| `@`   | A     | `76.76.21.21`                                 |
| `www` | CNAME | `cname.vercel-dns.com.` _(note trailing dot)_ |

**Mail (Resend — for `hello@agenticengineering.nl` sending):**

| Name                | Type | Value                                                                  |
| ------------------- | ---- | ---------------------------------------------------------------------- |
| `resend._domainkey` | TXT  | `p=…` _(DKIM, copy from Resend dashboard)_                             |
| `send`              | MX   | `feedback-smtp.eu-west-1.amazonses.com.` _(trailing dot, priority 10)_ |
| `send`              | TXT  | `v=spf1 include:amazonses.com ~all`                                    |
| `_dmarc`            | TXT  | `v=DMARC1; p=none;`                                                    |

**Mail (TransIP — apex inbox, unrelated to outbound sending):** existing MX `mx.transip.email.`, SPF `_spf.transip.email`, DKIM CNAMEs `transip-{a,b,c}._domainkey`. Untouched by Vercel migration.

TransIP gotcha: any record value that should resolve as an absolute FQDN **must end with a `.`** (MX, CNAME). Otherwise TransIP auto-appends the zone apex and breaks resolution.

### Verifying a deploy

```bash
curl -sI https://agenticengineering.nl/nl
# Expect: HTTP/2 200, all 6 security headers present.

curl -s -X POST https://agenticengineering.nl/api/contact \
  -H 'Content-Type: application/json' \
  -H 'Origin: https://agenticengineering.nl' \
  -d '{"name":"t","email":"t@example.com","trainingInterest":"basic","deliveryPref":"noPreference","message":"smoke test 0123456789","website":""}'
# Expect: {"ok":true}
```

## Preview environment

Every non-main branch push gets a Vercel preview deployment at `https://agenticengineering-<hash>-<scope>.vercel.app`. Previews exist to smoke-test code before promotion to production without touching the live inbox.

**Isolation from production:**

| Concern        | Production                            | Preview                                                                                |
| -------------- | ------------------------------------- | -------------------------------------------------------------------------------------- |
| Resend API key | full-access key (prod-only)           | separate domain-scoped key (revocable independently)                                   |
| FROM address   | `hello@agenticengineering.nl`         | `hello@agenticengineering.nl` (same verified sender)                                   |
| TO address     | `hello@agenticengineering.nl`         | `hello+preview@agenticengineering.nl` (plus-addressing — same inbox, filterable label) |
| URL            | `agenticengineering.nl` (+ www alias) | `agenticengineering-<hash>-<scope>.vercel.app`                                         |
| Access         | public                                | SSO wall (see below)                                                                   |

The plus-addressing trick (`hello+preview@…`) routes preview submissions to the same mailbox as production but with a `+preview` label, so a Gmail/IMAP filter can sort them automatically without provisioning a second mailbox. The `+` part is stripped by the SMTP server during delivery — `hello+anything@…` always lands at `hello@…`.

**SSO wall (Hobby tier limitation):**

Vercel Deployment Protection is forced on for previews on the Hobby plan. Public access (no Vercel login) requires upgrading to a paid tier. Three ways to access previews under the current plan:

1. **Browser, logged in:** open the preview URL, get redirected to Vercel SSO, sign in with the project-owner account → preview loads. Works for the project owner; not for external testers.
2. **CLI, authenticated:** `vercel curl <preview-url>/path` auto-injects a bypass token from your local Vercel auth. Use this for smoke tests:

   ```bash
   vercel curl https://agenticengineering-<hash>-<scope>.vercel.app/nl -I
   # Expect: HTTP/2 200

   vercel curl https://agenticengineering-<hash>-<scope>.vercel.app/api/contact \
     -X POST -H 'Content-Type: application/json' \
     -H 'Origin: https://agenticengineering-<hash>-<scope>.vercel.app' \
     -d '{"name":"preview probe","email":"t@example.com","trainingInterest":"basic","deliveryPref":"noPreference","message":"preview smoke 0123456789","website":""}'
   # Expect: {"ok":true}; mail lands at hello+preview@agenticengineering.nl
   ```

3. **Share with an external tester:** generate a one-off bypass URL — Vercel UI → Project → Settings → Deployment Protection → "Protection Bypass for Automation" → generate token, then share `https://<preview-url>/path?x-vercel-set-bypass-cookie=true&x-vercel-protection-bypass=<token>`. Sets a cookie so subsequent navigation within the preview works.

**Rotating the preview Resend key:**

The preview key has Resend "Sending access" scoped to `agenticengineering.nl` only. To rotate: Resend dashboard → API Keys → revoke old → create new → `vercel env rm RESEND_API_KEY preview && vercel env add RESEND_API_KEY preview` (paste new value at the prompt — never via `--value` on a shared terminal) → trigger a new preview deploy. Production is unaffected.

**Cleanup:**

Preview deployments are automatically deleted when their PR closes (via `.github/workflows/preview-teardown.yml`).

## i18n

Translation messages live in `messages/{nl,en}.json`. Locale routing in `i18n/routing.ts`. NL is the default locale (no prefix-less root — `/` redirects to `/nl`).

CI runs `pnpm verify:i18n` to enforce key parity between NL and EN. Add a new key → add it to both files.

## Testing

- **Unit** (`tests/**/*.test.ts`): Vitest, jsdom env for component tests. `pnpm test`.
- **E2E** (`tests/e2e/`): Playwright, hits dev server. `pnpm test:e2e`.
- **A11y**: axe-core integrated into Playwright tests. Zero WCAG 2.1 AA violations enforced.

CI workflow: `.github/workflows/ci.yml` runs typecheck + lint + unit + i18n integrity gate on every push.

## Brand and design context

- `PRODUCT.md` — who the site is for, tone of voice, anti-references, strategic principles.
- `DESIGN.md` — Stitch-format design system: colors (OKLCH dark palette), typography (JetBrains Mono display, Inter body), components, do's/don'ts.

These two files inform every UI decision. Read them before touching components.

## Contributing

Contributions are welcome. See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for local setup, the test/lint gates your change must pass, and PR conventions. By participating you agree to the [Code of Conduct](./CODE_OF_CONDUCT.md).

## Security

Please do not open public issues for security vulnerabilities. See [`SECURITY.md`](./SECURITY.md) for how to report them privately.

## License

Released under the [MIT License](./LICENSE). © QualityAtSpeed.
