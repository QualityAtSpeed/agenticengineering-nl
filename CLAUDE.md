# CLAUDE.md

agenticengineering.nl — bilingual (NL/EN) training + curated news site. Next.js 15 (App Router, RSC), React 19, Tailwind v4, next-intl, deployed on Vercel. Dark terminal-native aesthetic.

`README.md` is the canonical, exhaustive reference (stack, pipelines, env vars, deployment, DNS). Read it for anything not covered here. This file is the operational shortlist.

## Commands

```bash
pnpm dev            # http://localhost:3000 → redirects to /nl
pnpm build          # production build
pnpm typecheck      # tsc --noEmit
pnpm lint           # eslint
pnpm test           # vitest run (unit)
pnpm test:e2e       # playwright (run `pnpm exec playwright install` once first)
pnpm verify:i18n    # NL/EN translation key parity (CI gate)
pnpm format         # prettier --write .
```

Node 20 (`.nvmrc`), pnpm 9 (`corepack enable`). Run a single unit test with `pnpm test <path>` or `pnpm exec vitest run -t "<name>"`.

## Layout

- `app/[locale]/` — locale-routed pages (NL default). `app/api/{contact,checkout,stripe/webhook}/route.ts` — POST handlers.
- `components/` — UI components. `lib/` — logic (validation/Zod, email/Resend, stripe, rate-limit, http, flags, pricing, articles, structured-data, page-metadata).
- `data/` — typed catalogues (`trainings.ts`, `instructors.ts`) + `trusted-domains.json`. `news/` — markdown posts (frontmatter + body).
- `messages/{nl,en}.json` — translations. `i18n/` — next-intl routing/request config.
- `app/globals.css` — Tailwind v4 `@theme` block: **single source of design tokens**.

## Conventions

- **i18n**: every new translation key goes in BOTH `messages/nl.json` and `messages/en.json` — `verify:i18n` fails CI otherwise.
- **SEO metadata**: use `lib/page-metadata.ts` (`buildPageMetadata`) — don't hand-roll canonical/hreflang/OpenGraph per page.
- **JSON-LD**: homepage schema.org graph lives only in `lib/structured-data.ts` — don't re-inline JSON-LD in pages.
- **Design/brand**: read `DESIGN.md` (OKLCH palette, JetBrains Mono display / Inter body) and `PRODUCT.md` (tone, audience) before touching UI.
- **Security**: To-field of emails is never user-controlled; CRLF-stripped via `lib/sanitize.ts`. Stripe fulfillment happens only on the webhook (and only when `payment_status === 'paid'`), never on the success redirect.
- Feature flag `BLOGS_ENABLED` gates blog entries on `/articles` (`lib/flags.ts`).

## Pre-commit hook (lefthook)

`pre-commit` runs prettier `--check`, eslint, and `readme-check`. **`readme-check` calls the Claude CLI** to verify README.md still matches staged changes — it blocks the commit (exit 1) when new files/dirs/routes/lib/components/env vars or behavior changes aren't reflected in README.md. Keep README.md updated in the **same commit**. Requires `ANTHROPIC_API_KEY` in the shell. Don't use `--no-verify` unless fixing the hook itself.

## Deployment

Vercel GitHub App: push to `main` → production; any other branch → preview URL. Previews sit behind Vercel Deployment Protection (use `vercel curl` for authenticated smoke tests). Stripe webhook fulfillment works only on the designated `preview` branch. See README "Deployment" / "Preview environment" for details.
