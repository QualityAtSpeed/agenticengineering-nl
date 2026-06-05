# Contributing

Thanks for your interest in improving **agenticengineering.nl**. This document covers local setup, the checks your change must pass, and how to open a pull request.

By participating in this project you agree to abide by the [Code of Conduct](./CODE_OF_CONDUCT.md).

## Prerequisites

- **Node.js 20** (see `.nvmrc` — run `nvm use`)
- **pnpm 9** (`corepack enable` will provision the pinned version)

## Local setup

```bash
git clone https://github.com/QualityAtSpeed/agenticengineering-nl.git
cd agenticengineering-nl
pnpm install
cp .env.example .env        # fill in values as needed; the site runs without secrets for most work
pnpm dev                    # http://localhost:3000
```

Most contributions do not need any secrets. `RESEND_API_KEY` is only required to exercise the live contact-form pipeline; the form is mocked in tests by default. See the **Environment variables** section of [`README.md`](./README.md) for the full list.

## Checks your change must pass

CI runs these on every pull request. Run them locally before pushing:

```bash
pnpm lint           # ESLint
pnpm typecheck      # tsc --noEmit
pnpm test           # Vitest unit/component tests
pnpm build          # production build must succeed
pnpm test:e2e       # Playwright (optional locally; runs in CI)
```

A `lefthook` pre-commit hook formats staged files with Prettier. Do not bypass it.

## Pull request guidelines

- Branch off `main`. Use a descriptive branch name (e.g. `feat/...`, `fix/...`, `docs/...`, `chore/...`).
- Keep PRs focused — one logical change per PR.
- Write a clear description: what changed and why. Link any related issue.
- The site is bilingual (Dutch default, English secondary). UI copy lives in `messages/{nl,en}.json` — update **both** locales.
- Read [`PRODUCT.md`](./PRODUCT.md) and [`DESIGN.md`](./DESIGN.md) before touching UI; they define tone, brand, and the design system.
- All status checks (lint, typecheck, tests, build, secret scan) must be green before review.
- Open PRs against `main`; a Vercel preview deployment is created automatically — verify your change renders in both locales.

## Reporting bugs and proposing features

Open a GitHub issue describing the problem (steps to reproduce, expected vs. actual) or the proposed feature and its motivation. For security issues, follow [`SECURITY.md`](./SECURITY.md) instead — do not file a public issue.
