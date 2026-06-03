# agenticengineering.nl Site — Implementation Plan (Vertical Slices)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy agenticengineering.nl — a bilingual (NL/EN) marketing site selling two trainings (Basic 1d, Advanced 2d) with curriculum, instructor bios, and a contact form that delivers leads via email.

**Architecture:** Next.js 15 (App Router, TypeScript, React Server Components) + Tailwind v4 + `next-intl` for NL/EN routing + Resend for transactional email + Vercel for hosting. Built as vertical slices: every slice ships a thin end-to-end working increment to production (not "all backend first, then all frontend"). Each slice has its own tests and deploys behind a preview URL before merge.

**Tech Stack:** Next.js 15, React 19, TypeScript 5, Tailwind CSS v4, next-intl 3.x, Resend SDK, Zod, React Hook Form, Vitest, React Testing Library, Playwright, axe-core, ESLint, Prettier, lefthook, pnpm, Node 20+, Vercel, GitHub Actions.

**Spec reference:** `docs/superpowers/specs/2026-05-12-agenticengineering-site-design.md`

---

## Vertical Slicing Philosophy

Each slice produces a working, deployable product that an end user could open in a browser. We never have a slice that ships only a "library layer" or only a "backend route" without the UI that exercises it.

| Slice | What lands in prod after merge                          |
| ----- | ------------------------------------------------------- |
| 0     | Empty CI/CD pipeline + Vercel preview from `main`       |
| 1     | Live homepage with hero (NL only), terminal-style theme |
| 2     | NL + EN locale switching on home                        |
| 3     | Basic training section with full curriculum rendered    |
| 4     | Advanced training section (Day 1 + Day 2)               |
| 5     | Nav, footer, About page with instructors                |
| 6     | Contact page with working form → email                  |
| 7     | Security headers, CSP, JSON-LD, sitemap, robots         |
| 8     | Impressum, final polish, launch acceptance              |

---

## File Structure

```
.
├── .github/workflows/ci.yml
├── .gitignore                       (exists)
├── .nvmrc                           (Node 20)
├── .env.example
├── eslint.config.mjs
├── lefthook.yml
├── next.config.ts
├── package.json
├── playwright.config.ts
├── pnpm-lock.yaml
├── postcss.config.mjs
├── prettier.config.mjs
├── tsconfig.json
├── vitest.config.ts
├── vitest.setup.ts
├── middleware.ts
├── i18n/
│   ├── routing.ts
│   └── request.ts
├── messages/
│   ├── nl.json
│   └── en.json
├── data/
│   ├── trainings.ts
│   └── instructors.ts
├── lib/
│   ├── validation.ts
│   ├── email.ts
│   ├── rate-limit.ts
│   └── sanitize.ts
├── components/
│   ├── Nav.tsx
│   ├── Footer.tsx
│   ├── LangSwitcher.tsx
│   ├── Hero.tsx
│   ├── TerminalBlock.tsx
│   ├── TrainingCard.tsx
│   ├── TrainingDetail.tsx
│   ├── CurriculumList.tsx
│   ├── ContactForm.tsx
│   ├── InstructorCard.tsx
│   └── JsonLd.tsx
├── app/
│   ├── globals.css
│   ├── sitemap.ts
│   ├── robots.ts
│   ├── api/contact/route.ts
│   └── [locale]/
│       ├── layout.tsx
│       ├── page.tsx
│       ├── not-found.tsx
│       ├── about/page.tsx
│       ├── contact/page.tsx
│       └── impressum/page.tsx
├── tests/
│   ├── lib/
│   │   ├── validation.test.ts
│   │   ├── sanitize.test.ts
│   │   ├── email.test.ts
│   │   └── rate-limit.test.ts
│   ├── components/
│   │   ├── ContactForm.test.tsx
│   │   ├── TrainingCard.test.tsx
│   │   └── LangSwitcher.test.tsx
│   ├── api/
│   │   └── contact.test.ts
│   └── i18n-integrity.test.ts
├── e2e/
│   ├── home.spec.ts
│   ├── language-switch.spec.ts
│   ├── contact.spec.ts
│   └── a11y.spec.ts
├── scripts/
│   └── verify-i18n.ts
└── public/
    ├── logo.svg                    (placeholder)
    └── og/{nl,en}.png              (placeholder)
```

**File responsibilities:**

- `i18n/routing.ts` — locales list, default, pathname routing object exported for `next-intl` Link/redirect.
- `i18n/request.ts` — per-request locale config, loads `messages/<locale>.json`.
- `middleware.ts` — `next-intl` middleware, runs on `/((?!api|_next|.*\\..*).*)`.
- `data/trainings.ts` — typed `trainings` record (basic, advanced) with module IDs + delivery formats + EUR price.
- `data/instructors.ts` — typed list of instructors.
- `lib/validation.ts` — Zod schemas shared between form and `/api/contact`.
- `lib/sanitize.ts` — `stripCRLF()` for email-header-safe strings.
- `lib/email.ts` — `sendContactEmail()` wrapper around Resend SDK; throws typed `EmailError`.
- `lib/rate-limit.ts` — `checkRateLimit(ip)` returns `{ ok, retryAfter }`; in-memory `Map` fallback, Upstash adapter stub.
- `components/Nav.tsx` / `Footer.tsx` / `LangSwitcher.tsx` — layout chrome.
- `components/Hero.tsx` / `TerminalBlock.tsx` — page intro.
- `components/TrainingCard.tsx` / `TrainingDetail.tsx` / `CurriculumList.tsx` — training rendering.
- `components/ContactForm.tsx` — RHF + Zod; client component.
- `components/JsonLd.tsx` — single permitted use of `dangerouslySetInnerHTML` for schema.org payloads.

---

## Conventions used in every task

- Run `pnpm install` lazily — only when a new dep is added.
- Tests live next to source under `tests/` mirroring import paths.
- Each task ends with a commit using Conventional Commits prefixes (`chore:`, `feat:`, `test:`, `docs:`, `fix:`, `ci:`).
- Every commit footer:

  ```
  Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
  ```

- Tests target Vitest unless they require a browser → Playwright.
- Branch model: feature branch per slice → PR → preview deploy → merge to `main` → prod deploy.

---

# Slice 0 — Foundation (deploy a blank Next.js page to Vercel)

**Outcome:** `main` auto-deploys to `*.vercel.app` preview URL. CI runs lint+typecheck on PRs.

## Task 0.1: Initialise pnpm workspace + Node version

**Files:**

- Create: `package.json`
- Create: `.nvmrc`
- Create: `.npmrc`

- [ ] **Step 1: Write `.nvmrc`**

File `.nvmrc`:

```
20
```

- [ ] **Step 2: Write `.npmrc`** (enforce strict store, no hoist hacks)

File `.npmrc`:

```
auto-install-peers=true
strict-peer-dependencies=false
shamefully-hoist=false
```

- [ ] **Step 3: Write minimal `package.json`**

File `package.json`:

```json
{
  "name": "agenticengineering-nl",
  "version": "0.1.0",
  "private": true,
  "packageManager": "pnpm@9.0.0",
  "engines": {
    "node": ">=20"
  },
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "format": "prettier --write .",
    "verify:i18n": "tsx scripts/verify-i18n.ts"
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add .nvmrc .npmrc package.json
git commit -m "chore: scaffold pnpm package manifest and Node version pin"
```

## Task 0.2: Install Next.js + React + TypeScript

**Files:**

- Modify: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `next-env.d.ts` (auto-generated, gitignored? — keep tracked)
- Create: `app/globals.css`
- Create: `app/layout.tsx` (temporary root, replaced in Task 0.4)
- Create: `app/page.tsx` (temporary, replaced in Task 0.4)

- [ ] **Step 1: Install runtime + dev deps**

```bash
pnpm add next@^15 react@^19 react-dom@^19
pnpm add -D typescript @types/node @types/react @types/react-dom
```

- [ ] **Step 2: Write `tsconfig.json`**

File `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Write `next.config.ts`**

File `next.config.ts`:

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
};

export default nextConfig;
```

- [ ] **Step 4: Write temporary root `app/layout.tsx`**

File `app/layout.tsx`:

```tsx
import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'agenticengineering.nl',
  description: 'Agentic engineering trainings with Claude Code.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 5: Write temporary `app/page.tsx`**

File `app/page.tsx`:

```tsx
export default function Page() {
  return <main>agenticengineering.nl — coming soon</main>;
}
```

- [ ] **Step 6: Write empty `app/globals.css`**

File `app/globals.css`:

```css
/* Tailwind import added in Task 0.3 */
```

- [ ] **Step 7: Build to verify**

Run: `pnpm build`
Expected: build succeeds, generates `.next/`. `next-env.d.ts` appears at repo root.

- [ ] **Step 8: Commit**

```bash
git add package.json pnpm-lock.yaml tsconfig.json next.config.ts next-env.d.ts app/
git commit -m "feat: scaffold Next.js 15 app router with React 19"
```

## Task 0.3: Add Tailwind v4 with Terminal/Dev theme tokens

**Files:**

- Modify: `package.json`
- Create: `postcss.config.mjs`
- Modify: `app/globals.css`

- [ ] **Step 1: Install Tailwind v4 + PostCSS plugin**

```bash
pnpm add -D tailwindcss@^4 @tailwindcss/postcss @tailwindcss/typography
```

- [ ] **Step 2: Write `postcss.config.mjs`**

File `postcss.config.mjs`:

```js
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
```

- [ ] **Step 3: Replace `app/globals.css` with theme tokens**

File `app/globals.css`:

```css
@import 'tailwindcss';

@theme {
  --color-bg-base: #0d1117;
  --color-bg-elevated: #161b22;
  --color-border-subtle: #30363d;
  --color-text-primary: #c9d1d9;
  --color-text-muted: #8b949e;
  --color-accent-green: #7ee787;
  --color-accent-blue: #58a6ff;
  --color-accent-orange: #f0883e;
  --color-accent-red: #ff7b72;

  --font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
}

:root {
  color-scheme: dark;
}

html,
body {
  background-color: var(--color-bg-base);
  color: var(--color-text-primary);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
}

*:focus-visible {
  outline: 2px solid var(--color-accent-blue);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 4: Update temporary page to verify styling**

Replace `app/page.tsx`:

```tsx
export default function Page() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <p className="text-accent-green font-mono text-xl">&gt; agenticengineering.nl</p>
    </main>
  );
}
```

- [ ] **Step 5: Dev-serve and visually verify**

Run: `pnpm dev`
Open: `http://localhost:3000`
Expected: dark page, green monospace text "> agenticengineering.nl".
Then: Ctrl+C.

- [ ] **Step 6: Commit**

```bash
git add package.json pnpm-lock.yaml postcss.config.mjs app/globals.css app/page.tsx
git commit -m "feat: add Tailwind v4 with terminal/dev theme tokens"
```

## Task 0.4: Add ESLint + Prettier + lefthook

**Files:**

- Modify: `package.json`
- Create: `eslint.config.mjs`
- Create: `prettier.config.mjs`
- Create: `lefthook.yml`
- Create: `.prettierignore`

- [ ] **Step 1: Install dev deps**

```bash
pnpm add -D eslint @eslint/js typescript-eslint eslint-config-next \
  eslint-plugin-security eslint-plugin-react eslint-plugin-react-hooks \
  prettier prettier-plugin-tailwindcss lefthook lint-staged
```

- [ ] **Step 2: Write `eslint.config.mjs`** (flat config)

File `eslint.config.mjs`:

```js
import js from '@eslint/js';
import ts from 'typescript-eslint';
import next from 'eslint-config-next';
import security from 'eslint-plugin-security';

export default [
  js.configs.recommended,
  ...ts.configs.recommended,
  ...next(),
  {
    plugins: { security },
    rules: {
      'react/no-danger': 'error',
      'security/detect-object-injection': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['components/JsonLd.tsx'],
    rules: { 'react/no-danger': 'off' },
  },
  { ignores: ['.next/**', 'node_modules/**', 'coverage/**', 'playwright-report/**'] },
];
```

- [ ] **Step 3: Write `prettier.config.mjs`**

File `prettier.config.mjs`:

```js
export default {
  semi: true,
  singleQuote: true,
  trailingComma: 'all',
  printWidth: 100,
  plugins: ['prettier-plugin-tailwindcss'],
};
```

- [ ] **Step 4: Write `.prettierignore`**

File `.prettierignore`:

```
.next
node_modules
pnpm-lock.yaml
coverage
playwright-report
test-results
```

- [ ] **Step 5: Write `lefthook.yml`**

File `lefthook.yml`:

```yaml
pre-commit:
  parallel: true
  commands:
    lint:
      glob: '*.{ts,tsx,js,jsx,mjs}'
      run: pnpm exec eslint {staged_files}
    format:
      glob: '*.{ts,tsx,js,jsx,mjs,json,css,md}'
      run: pnpm exec prettier --check {staged_files}
```

- [ ] **Step 6: Install hooks + verify lint passes**

```bash
pnpm exec lefthook install
pnpm lint
pnpm exec prettier --check .
```

Expected: both commands succeed (after running `pnpm exec prettier --write .` if needed).

- [ ] **Step 7: Commit**

```bash
git add package.json pnpm-lock.yaml eslint.config.mjs prettier.config.mjs lefthook.yml .prettierignore
git commit -m "chore: add eslint, prettier, lefthook pre-commit hooks"
```

## Task 0.5: Add Vitest + first lib test (sanity)

**Files:**

- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Create: `lib/sanitize.ts`
- Create: `tests/lib/sanitize.test.ts`

- [ ] **Step 1: Install Vitest deps**

```bash
pnpm add -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event tsx
```

- [ ] **Step 2: Write `vitest.config.ts`**

File `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['lib/**', 'app/api/**', 'components/**'],
      thresholds: { lines: 80, statements: 80, branches: 70, functions: 80 },
    },
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
});
```

- [ ] **Step 3: Write `vitest.setup.ts`**

File `vitest.setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 4: Write failing test for `stripCRLF`**

File `tests/lib/sanitize.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { stripCRLF } from '@/lib/sanitize';

describe('stripCRLF', () => {
  it('removes \\r and \\n', () => {
    expect(stripCRLF('hi\r\nthere')).toBe('hithere');
  });
  it('returns empty for empty input', () => {
    expect(stripCRLF('')).toBe('');
  });
  it('is a no-op on safe strings', () => {
    expect(stripCRLF('Hello world')).toBe('Hello world');
  });
});
```

- [ ] **Step 5: Run test (should fail — module missing)**

Run: `pnpm test`
Expected: FAIL — cannot resolve `@/lib/sanitize`.

- [ ] **Step 6: Implement `lib/sanitize.ts`**

File `lib/sanitize.ts`:

```ts
export function stripCRLF(input: string): string {
  return input.replace(/[\r\n]/g, '');
}
```

- [ ] **Step 7: Run test — expect green**

Run: `pnpm test`
Expected: 3 passing.

- [ ] **Step 8: Commit**

```bash
git add package.json pnpm-lock.yaml vitest.config.ts vitest.setup.ts lib/sanitize.ts tests/lib/sanitize.test.ts
git commit -m "chore: add Vitest with first passing lib test"
```

## Task 0.6: CI workflow (lint, typecheck, test, build)

**Files:**

- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Write CI workflow**

File `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test -- --coverage
      - run: pnpm build
```

- [ ] **Step 2: Commit + push branch + open PR**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add lint/typecheck/test/build workflow"
```

(Push + PR are user actions outside this plan.)

## Task 0.7: Connect Vercel project

**Files:** (none in repo)

- [ ] **Step 1: User action** — create Vercel project pointing at this repo, framework preset = Next.js, set `main` as production branch.

- [ ] **Step 2: Verify** — push the Slice-0 PR, confirm CI green, confirm Vercel preview URL renders the dark page with green text.

- [ ] **Step 3: Merge PR.** Verify production deploy at the Vercel-assigned domain.

**Slice 0 done when:** PR merged, prod URL shows green-on-black "> agenticengineering.nl", CI green.

---

# Slice 1 — Hero on the homepage (single locale, polished)

**Outcome:** Production homepage shows a real hero section with terminal-style branding and two CTA buttons. Still NL-only.

## Task 1.1: Fonts via `next/font` + apply globally

**Files:**

- Modify: `app/layout.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Write updated `app/layout.tsx` with fonts**

File `app/layout.tsx`:

```tsx
import './globals.css';
import type { ReactNode } from 'react';
import { Inter, JetBrains_Mono } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans-loaded', display: 'swap' });
const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono-loaded',
  display: 'swap',
});

export const metadata = {
  title: 'agenticengineering.nl',
  description: 'Agentic engineering trainings with Claude Code.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="nl" className={`${inter.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 2: Update `app/globals.css` font vars to use loaded fonts**

Replace the `--font-mono` and `--font-sans` lines in the `@theme` block:

```css
--font-mono: var(--font-mono-loaded), ui-monospace, SFMono-Regular, Menlo, monospace;
--font-sans: var(--font-sans-loaded), system-ui, -apple-system, sans-serif;
```

- [ ] **Step 3: Dev-serve, verify fonts load (network panel shows Google Fonts hits)**

Run: `pnpm dev` → open `http://localhost:3000` → confirm monospace text uses JetBrains Mono. Ctrl+C.

- [ ] **Step 4: Commit**

```bash
git add app/layout.tsx app/globals.css
git commit -m "feat: load Inter + JetBrains Mono via next/font"
```

## Task 1.2: Build `<Hero />` component

**Files:**

- Create: `components/Hero.tsx`

- [ ] **Step 1: Write `<Hero />`**

File `components/Hero.tsx`:

```tsx
import Link from 'next/link';

type HeroProps = {
  kicker: string;
  title: string;
  subtitle: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
};

export function Hero({ kicker, title, subtitle, primaryCta, secondaryCta }: HeroProps) {
  return (
    <section className="px-6 py-24 sm:py-32 lg:py-40">
      <div className="mx-auto max-w-5xl">
        <p className="text-text-muted font-mono text-xs tracking-[0.2em] uppercase">{kicker}</p>
        <h1 className="text-text-primary mt-6 font-mono [font-size:clamp(2rem,6vw,4.5rem)] leading-[1.05] font-bold">
          <span className="text-accent-green">&gt;</span> {title}
        </h1>
        <p className="text-text-muted mt-6 max-w-2xl text-lg">{subtitle}</p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href={primaryCta.href}
            className="bg-accent-green text-bg-base inline-flex items-center gap-2 rounded-sm px-5 py-3 font-mono text-sm font-semibold transition hover:brightness-110"
          >
            $ {primaryCta.label}
          </Link>
          <Link
            href={secondaryCta.href}
            className="border-border-subtle text-text-primary hover:border-accent-blue hover:text-accent-blue inline-flex items-center gap-2 rounded-sm border px-5 py-3 font-mono text-sm transition"
          >
            → {secondaryCta.label}
          </Link>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Use it in `app/page.tsx`**

Replace `app/page.tsx`:

```tsx
import { Hero } from '@/components/Hero';

export default function Page() {
  return (
    <main>
      <Hero
        kicker="AGENTIC ENGINEERING · NL"
        title="Train je team in agentic engineering."
        subtitle="Twee praktijkgerichte trainingen in Claude Code. Eén dag basis, twee dagen advanced."
        primaryCta={{ label: 'book training', href: '/contact' }}
        secondaryCta={{ label: 'view curriculum', href: '#trainings' }}
      />
    </main>
  );
}
```

- [ ] **Step 3: Dev-serve, visually verify hero renders centred, two CTAs, dark theme**

Run: `pnpm dev` → check `http://localhost:3000`. Ctrl+C.

- [ ] **Step 4: Commit**

```bash
git add components/Hero.tsx app/page.tsx
git commit -m "feat: add hero section to homepage"
```

**Slice 1 done when:** PR merged, prod homepage shows the hero with terminal styling, fonts load, CTAs link to `/contact` (404 for now) and `#trainings` anchor.

---

# Slice 2 — Bilingual routing (NL + EN switcher)

**Outcome:** `/nl` and `/en` both render the hero. Language switcher in nav toggles between them and preserves path. `/` redirects to default locale.

## Task 2.1: Install + configure `next-intl`

**Files:**

- Modify: `package.json`
- Create: `i18n/routing.ts`
- Create: `i18n/request.ts`
- Create: `messages/nl.json`
- Create: `messages/en.json`
- Create: `middleware.ts`
- Modify: `next.config.ts`

- [ ] **Step 1: Install**

```bash
pnpm add next-intl
```

- [ ] **Step 2: Write `i18n/routing.ts`**

File `i18n/routing.ts`:

```ts
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['nl', 'en'],
  defaultLocale: 'nl',
  localePrefix: 'always',
});

export type Locale = (typeof routing.locales)[number];
```

- [ ] **Step 3: Write `i18n/request.ts`**

File `i18n/request.ts`:

```ts
import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
```

- [ ] **Step 4: Write `messages/nl.json`**

File `messages/nl.json`:

```json
{
  "meta": {
    "title": "agenticengineering.nl",
    "description": "Agentic engineering trainingen met Claude Code."
  },
  "nav": {
    "about": "Over ons",
    "contact": "Contact",
    "switchToEn": "EN",
    "switchToNl": "NL"
  },
  "hero": {
    "kicker": "AGENTIC ENGINEERING · NL",
    "title": "Train je team in agentic engineering.",
    "subtitle": "Twee praktijkgerichte trainingen in Claude Code. Eén dag basis, twee dagen advanced.",
    "ctaPrimary": "book training",
    "ctaSecondary": "view curriculum"
  }
}
```

- [ ] **Step 5: Write `messages/en.json`**

File `messages/en.json`:

```json
{
  "meta": {
    "title": "agenticengineering.nl",
    "description": "Agentic engineering trainings with Claude Code."
  },
  "nav": {
    "about": "About",
    "contact": "Contact",
    "switchToEn": "EN",
    "switchToNl": "NL"
  },
  "hero": {
    "kicker": "AGENTIC ENGINEERING · EN",
    "title": "Train your team in agentic engineering.",
    "subtitle": "Two hands-on trainings in Claude Code. One day foundations, two days advanced.",
    "ctaPrimary": "book training",
    "ctaSecondary": "view curriculum"
  }
}
```

- [ ] **Step 6: Write `middleware.ts`**

File `middleware.ts`:

```ts
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
```

- [ ] **Step 7: Update `next.config.ts` to use the next-intl plugin**

File `next.config.ts`:

```ts
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
};

export default withNextIntl(nextConfig);
```

- [ ] **Step 8: Commit**

```bash
git add package.json pnpm-lock.yaml i18n/ messages/ middleware.ts next.config.ts
git commit -m "feat: add next-intl scaffolding with nl and en messages"
```

## Task 2.2: Move pages under `[locale]` segment

**Files:**

- Delete: `app/page.tsx`
- Delete: `app/layout.tsx`
- Create: `app/[locale]/layout.tsx`
- Create: `app/[locale]/page.tsx`
- Create: `app/[locale]/not-found.tsx`

- [ ] **Step 1: Delete old root pages**

```bash
rm app/page.tsx app/layout.tsx
```

- [ ] **Step 2: Write `app/[locale]/layout.tsx`**

File `app/[locale]/layout.tsx`:

```tsx
import '../globals.css';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { routing } from '@/i18n/routing';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans-loaded', display: 'swap' });
const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono-loaded',
  display: 'swap',
});

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return { title: t('title'), description: t('description') };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html lang={locale} className={`${inter.variable} ${mono.variable}`}>
      <body>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Write `app/[locale]/page.tsx`**

File `app/[locale]/page.tsx`:

```tsx
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Hero } from '@/components/Hero';

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('hero');

  return (
    <main>
      <Hero
        kicker={t('kicker')}
        title={t('title')}
        subtitle={t('subtitle')}
        primaryCta={{ label: t('ctaPrimary'), href: `/${locale}/contact` }}
        secondaryCta={{ label: t('ctaSecondary'), href: '#trainings' }}
      />
    </main>
  );
}
```

- [ ] **Step 4: Write `app/[locale]/not-found.tsx`**

File `app/[locale]/not-found.tsx`:

```tsx
export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <p className="text-accent-red font-mono">// 404 — path not found</p>
    </main>
  );
}
```

- [ ] **Step 5: Build + dev-serve and verify**

Run: `pnpm build && pnpm dev`
Open: `http://localhost:3000` — should redirect to `/nl`.
Open: `http://localhost:3000/en` — should show English hero.
Ctrl+C.

- [ ] **Step 6: Commit**

```bash
git add app/
git commit -m "feat: move pages under [locale] segment, redirect / to default"
```

## Task 2.3: `<LangSwitcher />` component preserving pathname

**Files:**

- Create: `components/LangSwitcher.tsx`
- Modify: `app/[locale]/page.tsx`
- Create: `tests/components/LangSwitcher.test.tsx`

- [ ] **Step 1: Write failing test**

File `tests/components/LangSwitcher.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { LangSwitcher } from '@/components/LangSwitcher';

vi.mock('next/navigation', () => ({
  usePathname: () => '/nl/about',
  useRouter: () => ({ replace: vi.fn() }),
}));

describe('<LangSwitcher />', () => {
  it('renders both locale links preserving pathname suffix', () => {
    render(
      <NextIntlClientProvider
        locale="nl"
        messages={{ nav: { switchToEn: 'EN', switchToNl: 'NL' } }}
      >
        <LangSwitcher currentLocale="nl" />
      </NextIntlClientProvider>,
    );
    expect(screen.getByRole('link', { name: /EN/ })).toHaveAttribute('href', '/en/about');
    expect(screen.getByRole('link', { name: /NL/ })).toHaveAttribute('href', '/nl/about');
  });
});
```

- [ ] **Step 2: Run test — expect FAIL (module missing)**

Run: `pnpm test -- LangSwitcher`
Expected: FAIL — cannot resolve.

- [ ] **Step 3: Implement `components/LangSwitcher.tsx`**

File `components/LangSwitcher.tsx`:

```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { routing, type Locale } from '@/i18n/routing';

type Props = { currentLocale: Locale };

function swapLocale(pathname: string, target: Locale): string {
  const parts = pathname.split('/');
  if (parts.length > 1 && (routing.locales as readonly string[]).includes(parts[1])) {
    parts[1] = target;
    return parts.join('/');
  }
  return `/${target}${pathname}`;
}

export function LangSwitcher({ currentLocale }: Props) {
  const pathname = usePathname() ?? `/${currentLocale}`;
  const t = useTranslations('nav');
  return (
    <div className="flex items-center gap-2 font-mono text-xs">
      {routing.locales.map((locale) => (
        <Link
          key={locale}
          href={swapLocale(pathname, locale)}
          aria-current={locale === currentLocale ? 'page' : undefined}
          className={
            locale === currentLocale
              ? 'text-accent-green'
              : 'text-text-muted hover:text-accent-blue'
          }
        >
          {locale === 'en' ? t('switchToEn') : t('switchToNl')}
        </Link>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Run test — expect PASS**

Run: `pnpm test -- LangSwitcher`
Expected: PASS.

- [ ] **Step 5: Drop a temporary switcher into the home page header** (proper Nav comes in Slice 5)

Modify `app/[locale]/page.tsx`:

```tsx
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Hero } from '@/components/Hero';
import { LangSwitcher } from '@/components/LangSwitcher';
import type { Locale } from '@/i18n/routing';

export default async function Home({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('hero');

  return (
    <main>
      <header className="flex items-center justify-end px-6 py-4">
        <LangSwitcher currentLocale={locale} />
      </header>
      <Hero
        kicker={t('kicker')}
        title={t('title')}
        subtitle={t('subtitle')}
        primaryCta={{ label: t('ctaPrimary'), href: `/${locale}/contact` }}
        secondaryCta={{ label: t('ctaSecondary'), href: '#trainings' }}
      />
    </main>
  );
}
```

- [ ] **Step 6: Dev-serve, click switcher, verify locale toggles**

Run: `pnpm dev`. Toggle EN/NL. Ctrl+C.

- [ ] **Step 7: Commit**

```bash
git add components/LangSwitcher.tsx tests/components/LangSwitcher.test.tsx app/[locale]/page.tsx
git commit -m "feat: add language switcher preserving pathname"
```

## Task 2.4: i18n integrity script + test

**Files:**

- Create: `scripts/verify-i18n.ts`
- Create: `tests/i18n-integrity.test.ts`
- Modify: `.github/workflows/ci.yml`

- [ ] **Step 1: Write integrity test**

File `tests/i18n-integrity.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import nl from '@/messages/nl.json';
import en from '@/messages/en.json';

function flatten(obj: unknown, prefix = ''): string[] {
  if (typeof obj !== 'object' || obj === null) return [prefix];
  return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) =>
    flatten(v, prefix ? `${prefix}.${k}` : k),
  );
}

describe('i18n integrity', () => {
  it('nl and en have identical key sets', () => {
    const nlKeys = new Set(flatten(nl));
    const enKeys = new Set(flatten(en));
    const missingInEn = [...nlKeys].filter((k) => !enKeys.has(k));
    const missingInNl = [...enKeys].filter((k) => !nlKeys.has(k));
    expect({ missingInEn, missingInNl }).toEqual({ missingInEn: [], missingInNl: [] });
  });
});
```

- [ ] **Step 2: Write `scripts/verify-i18n.ts`** (CLI-friendly mirror for prebuild use)

File `scripts/verify-i18n.ts`:

```ts
import nl from '../messages/nl.json';
import en from '../messages/en.json';

function flatten(obj: unknown, prefix = ''): string[] {
  if (typeof obj !== 'object' || obj === null) return [prefix];
  return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) =>
    flatten(v, prefix ? `${prefix}.${k}` : k),
  );
}

const nlKeys = new Set(flatten(nl));
const enKeys = new Set(flatten(en));
const missingInEn = [...nlKeys].filter((k) => !enKeys.has(k));
const missingInNl = [...enKeys].filter((k) => !nlKeys.has(k));

if (missingInEn.length || missingInNl.length) {
  console.error('i18n integrity FAIL', { missingInEn, missingInNl });
  process.exit(1);
}
console.log('i18n integrity OK');
```

- [ ] **Step 3: Run test + script**

Run: `pnpm test -- i18n-integrity` then `pnpm verify:i18n`.
Expected: both pass.

- [ ] **Step 4: Add CI step**

Modify `.github/workflows/ci.yml` — insert after `pnpm typecheck`:

```yaml
- run: pnpm verify:i18n
```

- [ ] **Step 5: Commit**

```bash
git add scripts/verify-i18n.ts tests/i18n-integrity.test.ts .github/workflows/ci.yml
git commit -m "test: enforce nl/en message key parity in CI"
```

**Slice 2 done when:** Prod URLs `/nl` and `/en` render hero in their respective languages, switcher swaps locale while preserving path, CI enforces key parity.

---

# Slice 3 — Basic training section with full curriculum

**Outcome:** Home page renders a `<TrainingDetail />` for the Basic training with all 8 modules from the curriculum, pricing, audience, outcomes, delivery formats. Bilingual.

## Task 3.1: Define training data model + Basic training data

**Files:**

- Create: `data/trainings.ts`
- Modify: `messages/nl.json`
- Modify: `messages/en.json`

- [ ] **Step 1: Write `data/trainings.ts`**

File `data/trainings.ts`:

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

export type Module = { id: ModuleId; day?: 1 | 2 };

export type TrainingId = 'basic' | 'advanced';

export type Training = {
  id: TrainingId;
  durationDays: 1 | 2;
  priceEUR: number;
  modules: Module[];
  deliveryFormats: DeliveryFormat[];
};

export const trainings: Record<TrainingId, Training> = {
  basic: {
    id: 'basic',
    durationDays: 1,
    priceEUR: 799,
    modules: [
      { id: 'fundamentals-of-agent' },
      { id: 'context-architecture' },
      { id: 'context-window-mechanics' },
      { id: 'build-first-feature' },
      { id: 'intro-skills-rules' },
      { id: 'using-mcp-servers' },
      { id: 'test-first-intro' },
      { id: 'basic-hooks-quality-gates' },
    ],
    deliveryFormats: ['inCompany', 'publicCohort', 'remote'],
  },
  advanced: {
    id: 'advanced',
    durationDays: 2,
    priceEUR: 1799,
    modules: [
      { id: 'building-custom-mcp', day: 1 },
      { id: 'skills-rules-deep', day: 1 },
      { id: 'agents-sdlc-phases', day: 1 },
      { id: 'agent-harnessing', day: 2 },
      { id: 'advanced-hooks-quality-gates', day: 2 },
      { id: 'test-first-advanced', day: 2 },
      { id: 'team-workflows-governance', day: 2 },
    ],
    deliveryFormats: ['inCompany', 'publicCohort', 'remote'],
  },
};
```

> **Note on prices:** `799` and `1799` are placeholders. User confirms real numbers before launch (spec §15).

- [ ] **Step 2: Add training translations to `messages/nl.json`**

Merge into `messages/nl.json` (keep existing keys):

```json
{
  "trainings": {
    "sectionTitle": "Trainingen",
    "duration": {
      "basic": "1 dag",
      "advanced": "2 dagen"
    },
    "deliveryFormats": {
      "inCompany": "In-company",
      "publicCohort": "Open inschrijving",
      "remote": "Remote"
    },
    "labels": {
      "audience": "Voor wie",
      "prerequisites": "Vereisten",
      "outcomes": "Wat je leert",
      "modules": "Curriculum",
      "day1": "Dag 1 — integratie",
      "day2": "Dag 2 — automatisering",
      "price": "Prijs",
      "priceSuffix": "excl. BTW",
      "viewDetails": "Bekijk programma",
      "bookCta": "Plan deze training"
    },
    "basic": {
      "name": "Basic",
      "tagline": "Foundations + eerste hands-on met Claude Code.",
      "audience": [
        "Engineers en tech leads die agentic workflows willen adopteren",
        "Junior/mid developers die net beginnen met Claude Code",
        "CTO's en engineering managers die hun team willen opleiden"
      ],
      "prerequisites": [
        "Comfortabel met git en command line",
        "Schrijft features in ten minste één taal (TS/Python/Go/etc.)"
      ],
      "outcomes": [
        "Ship werkende features met Claude Code",
        "Configureer gestructureerde context (CLAUDE.md, rules)",
        "Gebruik bestaande MCP servers",
        "Werk volgens een basis test-first lus",
        "Stel basis hooks en quality gates in"
      ]
    },
    "advanced": {
      "name": "Advanced",
      "tagline": "Custom tooling, full SDLC-integratie, automatisering op team-schaal.",
      "audience": [
        "Senior engineers die Claude Code al gebruiken",
        "Tech leads die agentic workflows op team-niveau willen verankeren",
        "Teams die hun eigen tooling willen bouwen"
      ],
      "prerequisites": ["Basic training of vergelijkbare hands-on ervaring met Claude Code"],
      "outcomes": [
        "Bouw eigen MCP servers",
        "Authoring van Skills en Rules op productieniveau",
        "Run agentic workflows door alle SDLC-fases",
        "Orchestratie van subagents en parallelisme",
        "Implementeer geavanceerde quality gates in CI",
        "Governance en workflow-patronen voor teams"
      ]
    }
  },
  "modules": {
    "fundamentals-of-agent": {
      "title": "Fundamentals of an agent",
      "bullets": [
        "Wat is een agent en waarom werkt het",
        "Tool-loop, beslissingen, autonomie",
        "Verschil met chat en met automatisering"
      ]
    },
    "context-architecture": {
      "title": "Context architecture",
      "bullets": [
        "CLAUDE.md design",
        "Rules files en project-wide configuratie",
        "Hiërarchie: user, project, lokale overrides"
      ]
    },
    "context-window-mechanics": {
      "title": "Context window mechanics",
      "bullets": [
        "Compressie en samenvattingen",
        "Priming en recency bias",
        "Strategieën voor lange sessies"
      ]
    },
    "build-first-feature": {
      "title": "Build first features with an agent",
      "bullets": [
        "Van idee naar werkende feature",
        "Iteratie: plan, implement, review",
        "Hands-on lab"
      ]
    },
    "intro-skills-rules": {
      "title": "Intro to Skills & Rules",
      "bullets": [
        "Wanneer schrijf je een skill",
        "Wanneer schrijf je een rule",
        "Eerste eigen skill"
      ]
    },
    "using-mcp-servers": {
      "title": "Using MCP servers",
      "bullets": [
        "MCP overzicht",
        "Bestaande servers koppelen (Filesystem, GitHub, Linear, etc.)",
        "Best practices voor scope en permissions"
      ]
    },
    "test-first-intro": {
      "title": "Test-first strategy (intro)",
      "bullets": [
        "TDD loop met een agent",
        "Wanneer test eerst, wanneer test later",
        "Vermijd valse green builds"
      ]
    },
    "basic-hooks-quality-gates": {
      "title": "Basic hooks & quality gates",
      "bullets": [
        "Pre-commit checks (lint, format)",
        "Type-check als gate",
        "Eerste eigen hook configureren"
      ]
    },
    "building-custom-mcp": {
      "title": "Building custom MCP servers",
      "bullets": [
        "MCP server-architectuur",
        "Tools, resources, prompts implementeren",
        "Veiligheid en scope-design"
      ]
    },
    "skills-rules-deep": {
      "title": "Skills & Rules — deep dive",
      "bullets": [
        "Authoring van productie-skills",
        "Trigger-design en discoverability",
        "Skills delen binnen je team"
      ]
    },
    "agents-sdlc-phases": {
      "title": "Agents in every SDLC phase",
      "bullets": [
        "Refinement en planning met agents",
        "Implementatie en parallel werk",
        "Agentic code review en test"
      ]
    },
    "agent-harnessing": {
      "title": "Agent harnessing",
      "bullets": ["Subagents en delegatie", "Parallelle workflows", "Orchestratie-patronen"]
    },
    "advanced-hooks-quality-gates": {
      "title": "Advanced hooks & quality gates",
      "bullets": [
        "Policy enforcement via hooks",
        "CI-integratie en kosten-bewuste gates",
        "Custom security-gates"
      ]
    },
    "test-first-advanced": {
      "title": "Test-first — advanced patterns",
      "bullets": [
        "Contract- en integratietests met agents",
        "Property-based en mutation testing",
        "TDD voor teams met meerdere agents"
      ]
    },
    "team-workflows-governance": {
      "title": "Team workflows + governance",
      "bullets": [
        "Adoptie-strategie en role-design",
        "Audit en compliance-patronen",
        "Onboarding en kennisdeling"
      ]
    }
  }
}
```

- [ ] **Step 3: Mirror to `messages/en.json`**

Replace `messages/en.json` with the same structure, English copy. Use English audience/prereq/outcome strings. (Translate the NL block 1:1, keeping all module IDs identical.)

> Concrete English copy: every NL string above translated to natural English by the implementer. Module titles in English: "Fundamentals of an agent", "Context architecture", "Context window mechanics", "Build first features with an agent", "Intro to Skills & Rules", "Using MCP servers", "Test-first strategy (intro)", "Basic hooks & quality gates", "Building custom MCP servers", "Skills & Rules — deep dive", "Agents in every SDLC phase", "Agent harnessing", "Advanced hooks & quality gates", "Test-first — advanced patterns", "Team workflows + governance".

- [ ] **Step 4: Run i18n integrity test — expect PASS**

Run: `pnpm verify:i18n`
Expected: OK.

- [ ] **Step 5: Commit**

```bash
git add data/trainings.ts messages/
git commit -m "feat: add typed training data + nl/en curriculum copy"
```

## Task 3.2: `<CurriculumList />` + `<TrainingDetail />` components

**Files:**

- Create: `components/CurriculumList.tsx`
- Create: `components/TrainingDetail.tsx`
- Create: `tests/components/TrainingCard.test.tsx` (placeholder — moved to Task 4.1)

- [ ] **Step 1: Implement `components/CurriculumList.tsx`**

File `components/CurriculumList.tsx`:

```tsx
import { useTranslations } from 'next-intl';
import type { Module } from '@/data/trainings';

export function CurriculumList({ modules }: { modules: Module[] }) {
  const t = useTranslations('modules');
  return (
    <ol className="space-y-6">
      {modules.map((m, i) => {
        const titleKey = `${m.id}.title` as const;
        const bulletsKey = `${m.id}.bullets` as const;
        const bullets = (t.raw(bulletsKey) as string[]) ?? [];
        return (
          <li key={m.id} className="border-border-subtle border-l-2 pl-5">
            <p className="text-text-muted font-mono text-xs">{String(i + 1).padStart(2, '0')}</p>
            <h4 className="text-text-primary mt-1 font-mono text-lg">
              <span className="text-accent-green">&gt;</span> {t(titleKey)}
            </h4>
            <ul className="text-text-muted mt-3 space-y-1 text-sm">
              {bullets.map((b) => (
                <li key={b}>· {b}</li>
              ))}
            </ul>
          </li>
        );
      })}
    </ol>
  );
}
```

- [ ] **Step 2: Implement `components/TrainingDetail.tsx`**

File `components/TrainingDetail.tsx`:

```tsx
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { trainings, type TrainingId } from '@/data/trainings';
import { CurriculumList } from './CurriculumList';

export function TrainingDetail({ trainingId, locale }: { trainingId: TrainingId; locale: string }) {
  const training = trainings[trainingId];
  const t = useTranslations('trainings');
  const tCommon = useTranslations('trainings.labels');

  const audience = t.raw(`${trainingId}.audience`) as string[];
  const prerequisites = t.raw(`${trainingId}.prerequisites`) as string[];
  const outcomes = t.raw(`${trainingId}.outcomes`) as string[];

  const modulesDay1 = training.modules.filter((m) => m.day === 1 || m.day === undefined);
  const modulesDay2 = training.modules.filter((m) => m.day === 2);

  return (
    <section
      id={`training-${trainingId}`}
      className="border-border-subtle bg-bg-elevated border-t px-6 py-20"
    >
      <div className="mx-auto max-w-5xl">
        <p className="text-text-muted font-mono text-xs tracking-[0.2em] uppercase">
          {t(`duration.${trainingId}`)} · {tCommon('price')} €
          {training.priceEUR.toLocaleString('nl-NL')} {tCommon('priceSuffix')}
        </p>
        <h2 className="text-text-primary mt-3 font-mono text-3xl sm:text-4xl">
          <span className="text-accent-green">&gt;</span> {t(`${trainingId}.name`)}
        </h2>
        <p className="text-text-muted mt-3 max-w-2xl">{t(`${trainingId}.tagline`)}</p>

        <div className="mt-10 grid gap-10 lg:grid-cols-3">
          <DetailList title={tCommon('audience')} items={audience} />
          <DetailList title={tCommon('prerequisites')} items={prerequisites} />
          <DetailList title={tCommon('outcomes')} items={outcomes} />
        </div>

        <div className="mt-14">
          <h3 className="text-text-muted font-mono text-sm tracking-[0.2em] uppercase">
            {tCommon('modules')}
          </h3>
          {training.id === 'advanced' ? (
            <div className="mt-6 grid gap-12 lg:grid-cols-2">
              <div>
                <p className="text-accent-orange font-mono text-xs">{tCommon('day1')}</p>
                <div className="mt-4">
                  <CurriculumList modules={modulesDay1} />
                </div>
              </div>
              <div>
                <p className="text-accent-orange font-mono text-xs">{tCommon('day2')}</p>
                <div className="mt-4">
                  <CurriculumList modules={modulesDay2} />
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-6">
              <CurriculumList modules={training.modules} />
            </div>
          )}
        </div>

        <div className="mt-12">
          <Link
            href={`/${locale}/contact?training=${trainingId}`}
            className="bg-accent-green text-bg-base inline-flex items-center gap-2 rounded-sm px-5 py-3 font-mono text-sm font-semibold hover:brightness-110"
          >
            $ {tCommon('bookCta')}
          </Link>
        </div>
      </div>
    </section>
  );
}

function DetailList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h4 className="text-text-muted font-mono text-xs tracking-[0.2em] uppercase">{title}</h4>
      <ul className="text-text-primary mt-3 space-y-2 text-sm">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="text-accent-green">›</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 3: Use it on the home page (Basic only this slice)**

Modify `app/[locale]/page.tsx`:

```tsx
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Hero } from '@/components/Hero';
import { LangSwitcher } from '@/components/LangSwitcher';
import { TrainingDetail } from '@/components/TrainingDetail';
import type { Locale } from '@/i18n/routing';

export default async function Home({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('hero');

  return (
    <main>
      <header className="flex items-center justify-end px-6 py-4">
        <LangSwitcher currentLocale={locale} />
      </header>
      <Hero
        kicker={t('kicker')}
        title={t('title')}
        subtitle={t('subtitle')}
        primaryCta={{ label: t('ctaPrimary'), href: `/${locale}/contact` }}
        secondaryCta={{ label: t('ctaSecondary'), href: '#training-basic' }}
      />
      <TrainingDetail trainingId="basic" locale={locale} />
    </main>
  );
}
```

- [ ] **Step 4: Dev-serve and verify**

Run: `pnpm dev`. Check `/nl` and `/en` both render Basic training section with all 8 modules and 3 columns of detail lists. Ctrl+C.

- [ ] **Step 5: Commit**

```bash
git add components/CurriculumList.tsx components/TrainingDetail.tsx app/[locale]/page.tsx
git commit -m "feat: render Basic training detail with full curriculum"
```

**Slice 3 done when:** Prod homepage renders the Basic training section with all 8 modules, audience, prerequisites, outcomes, price, and a "book this training" CTA, in both NL and EN.

---

# Slice 4 — Advanced training + overview cards

**Outcome:** Above the two detail sections, two `<TrainingCard />` summary cards. Below them, full `<TrainingDetail />` for both Basic and Advanced (Day 1 / Day 2 split).

## Task 4.1: `<TrainingCard />` component

**Files:**

- Create: `components/TrainingCard.tsx`
- Create: `tests/components/TrainingCard.test.tsx`

- [ ] **Step 1: Write failing test**

File `tests/components/TrainingCard.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import nl from '@/messages/nl.json';
import { TrainingCard } from '@/components/TrainingCard';

describe('<TrainingCard />', () => {
  it('renders training name, duration, and formatted price for basic', () => {
    render(
      <NextIntlClientProvider locale="nl" messages={nl}>
        <TrainingCard trainingId="basic" locale="nl" />
      </NextIntlClientProvider>,
    );
    expect(screen.getByRole('heading', { name: /Basic/ })).toBeInTheDocument();
    expect(screen.getByText(/1 dag/)).toBeInTheDocument();
    expect(screen.getByText(/€799/)).toBeInTheDocument();
  });

  it('links to in-page anchor', () => {
    render(
      <NextIntlClientProvider locale="nl" messages={nl}>
        <TrainingCard trainingId="advanced" locale="nl" />
      </NextIntlClientProvider>,
    );
    expect(screen.getByRole('link', { name: /Bekijk programma/ })).toHaveAttribute(
      'href',
      '#training-advanced',
    );
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

Run: `pnpm test -- TrainingCard`
Expected: FAIL — module missing.

- [ ] **Step 3: Implement `components/TrainingCard.tsx`**

File `components/TrainingCard.tsx`:

```tsx
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { trainings, type TrainingId } from '@/data/trainings';

export function TrainingCard({
  trainingId,
  locale: _locale,
}: {
  trainingId: TrainingId;
  locale: string;
}) {
  const training = trainings[trainingId];
  const t = useTranslations('trainings');
  const tLabels = useTranslations('trainings.labels');

  return (
    <article className="border-border-subtle bg-bg-elevated flex h-full flex-col rounded-sm border p-6">
      <p className="text-text-muted font-mono text-xs tracking-[0.2em] uppercase">
        {t(`duration.${trainingId}`)}
      </p>
      <h3 className="text-text-primary mt-3 font-mono text-2xl">
        <span className="text-accent-green">&gt;</span> {t(`${trainingId}.name`)}
      </h3>
      <p className="text-text-muted mt-3 flex-1 text-sm">{t(`${trainingId}.tagline`)}</p>
      <p className="text-accent-orange mt-6 font-mono">
        €{training.priceEUR.toLocaleString('nl-NL')}{' '}
        <span className="text-text-muted text-xs">{tLabels('priceSuffix')}</span>
      </p>
      <Link
        href={`#training-${trainingId}`}
        className="text-accent-blue mt-6 inline-flex items-center gap-1 font-mono text-sm hover:underline"
      >
        → {tLabels('viewDetails')}
      </Link>
    </article>
  );
}
```

- [ ] **Step 4: Run test — expect PASS**

Run: `pnpm test -- TrainingCard`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/TrainingCard.tsx tests/components/TrainingCard.test.tsx
git commit -m "feat: add TrainingCard summary component"
```

## Task 4.2: Trainings overview + Advanced detail on home

**Files:**

- Modify: `app/[locale]/page.tsx`

- [ ] **Step 1: Update home to render overview + both details**

Modify `app/[locale]/page.tsx`:

```tsx
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Hero } from '@/components/Hero';
import { LangSwitcher } from '@/components/LangSwitcher';
import { TrainingCard } from '@/components/TrainingCard';
import { TrainingDetail } from '@/components/TrainingDetail';
import type { Locale } from '@/i18n/routing';

export default async function Home({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tHero = await getTranslations('hero');
  const tTrainings = await getTranslations('trainings');

  return (
    <main>
      <header className="flex items-center justify-end px-6 py-4">
        <LangSwitcher currentLocale={locale} />
      </header>

      <Hero
        kicker={tHero('kicker')}
        title={tHero('title')}
        subtitle={tHero('subtitle')}
        primaryCta={{ label: tHero('ctaPrimary'), href: `/${locale}/contact` }}
        secondaryCta={{ label: tHero('ctaSecondary'), href: '#trainings' }}
      />

      <section id="trainings" className="border-border-subtle border-t px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-text-primary font-mono text-3xl">
            <span className="text-accent-green">&gt;</span> {tTrainings('sectionTitle')}
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <TrainingCard trainingId="basic" locale={locale} />
            <TrainingCard trainingId="advanced" locale={locale} />
          </div>
        </div>
      </section>

      <TrainingDetail trainingId="basic" locale={locale} />
      <TrainingDetail trainingId="advanced" locale={locale} />
    </main>
  );
}
```

- [ ] **Step 2: Dev-serve, verify**

Run: `pnpm dev`. Confirm both training sections render. Click "view curriculum" → scrolls to overview. Click "view details" on Advanced card → scrolls to Advanced detail. Day 1 / Day 2 split shown. Ctrl+C.

- [ ] **Step 3: Commit**

```bash
git add app/[locale]/page.tsx
git commit -m "feat: add training overview cards and Advanced detail to home"
```

**Slice 4 done when:** Prod home has trainings section with both cards + both full details + functional in-page anchors, in both locales.

---

# Slice 5 — Nav, footer, About page

**Outcome:** Site has proper top nav (logo, About, Contact, language switcher) and a footer. About page lists Pascal + collaborators.

## Task 5.1: `<Nav />` + `<Footer />`

**Files:**

- Create: `components/Nav.tsx`
- Create: `components/Footer.tsx`
- Modify: `app/[locale]/layout.tsx`
- Modify: `app/[locale]/page.tsx`
- Modify: `messages/nl.json`, `messages/en.json`

- [ ] **Step 1: Add footer/nav keys to messages**

Merge into `messages/nl.json` (and mirror to `en.json` — translate to English):

```json
{
  "nav": {
    "about": "Over ons",
    "contact": "Contact",
    "switchToEn": "EN",
    "switchToNl": "NL",
    "brand": "agentic·engineering"
  },
  "footer": {
    "tagline": "Agentic engineering trainingen.",
    "rights": "© 2026 agenticengineering.nl",
    "impressumLink": "Bedrijfsgegevens",
    "github": "GitHub",
    "linkedin": "LinkedIn",
    "x": "X"
  }
}
```

(Keep all previously added keys.)

- [ ] **Step 2: Implement `components/Nav.tsx`**

File `components/Nav.tsx`:

```tsx
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { LangSwitcher } from './LangSwitcher';
import type { Locale } from '@/i18n/routing';

export async function Nav({ locale }: { locale: Locale }) {
  const t = await getTranslations('nav');
  return (
    <nav className="border-border-subtle bg-bg-base/90 sticky top-0 z-10 border-b backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href={`/${locale}`} className="text-text-primary font-mono text-sm">
          <span className="text-accent-green">$</span> {t('brand')}
        </Link>
        <div className="flex items-center gap-6 font-mono text-sm">
          <Link href={`/${locale}/about`} className="text-text-muted hover:text-accent-blue">
            {t('about')}
          </Link>
          <Link href={`/${locale}/contact`} className="text-text-muted hover:text-accent-blue">
            {t('contact')}
          </Link>
          <LangSwitcher currentLocale={locale} />
        </div>
      </div>
    </nav>
  );
}
```

- [ ] **Step 3: Implement `components/Footer.tsx`**

File `components/Footer.tsx`:

```tsx
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';

export async function Footer({ locale }: { locale: Locale }) {
  const t = await getTranslations('footer');
  return (
    <footer className="border-border-subtle bg-bg-elevated border-t px-6 py-12">
      <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-4">
        <div>
          <p className="text-text-primary font-mono text-sm">agentic·engineering</p>
          <p className="text-text-muted mt-2 text-xs">{t('tagline')}</p>
        </div>
        <div>
          <p className="text-text-muted font-mono text-xs tracking-[0.2em] uppercase">Pages</p>
          <ul className="mt-3 space-y-1 text-sm">
            <li>
              <Link href={`/${locale}/about`} className="text-text-primary hover:text-accent-blue">
                About
              </Link>
            </li>
            <li>
              <Link
                href={`/${locale}/contact`}
                className="text-text-primary hover:text-accent-blue"
              >
                Contact
              </Link>
            </li>
            <li>
              <Link
                href={`/${locale}/impressum`}
                className="text-text-primary hover:text-accent-blue"
              >
                {t('impressumLink')}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-text-muted font-mono text-xs tracking-[0.2em] uppercase">Socials</p>
          <ul className="mt-3 space-y-1 text-sm">
            <li>
              <a
                href="https://github.com/"
                rel="noopener noreferrer"
                target="_blank"
                className="text-text-primary hover:text-accent-blue"
              >
                {t('github')}
              </a>
            </li>
            <li>
              <a
                href="https://linkedin.com/"
                rel="noopener noreferrer"
                target="_blank"
                className="text-text-primary hover:text-accent-blue"
              >
                {t('linkedin')}
              </a>
            </li>
            <li>
              <a
                href="https://x.com/"
                rel="noopener noreferrer"
                target="_blank"
                className="text-text-primary hover:text-accent-blue"
              >
                {t('x')}
              </a>
            </li>
          </ul>
        </div>
        <div className="text-text-muted font-mono text-xs sm:text-right">
          <p>{t('rights')}</p>
        </div>
      </div>
    </footer>
  );
}
```

> Real social URLs replace the placeholders before launch (open item §15 of spec).

- [ ] **Step 4: Wire Nav + Footer into locale layout**

Modify `app/[locale]/layout.tsx`:

```tsx
import '../globals.css';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { routing, type Locale } from '@/i18n/routing';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans-loaded', display: 'swap' });
const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono-loaded',
  display: 'swap',
});

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return { title: t('title'), description: t('description') };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const typedLocale = locale as Locale;

  return (
    <html lang={locale} className={`${inter.variable} ${mono.variable}`}>
      <body>
        <a
          href="#main"
          className="focus:bg-accent-green focus:text-bg-base sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:rounded-sm focus:px-3 focus:py-1"
        >
          Skip to content
        </a>
        <NextIntlClientProvider>
          <Nav locale={typedLocale} />
          <div id="main">{children}</div>
          <Footer locale={typedLocale} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 5: Remove temporary header from home page**

Modify `app/[locale]/page.tsx` — delete the `<header>` block with `LangSwitcher` (Nav handles it now).

- [ ] **Step 6: Dev-serve and verify**

Run: `pnpm dev`. Confirm nav appears on all pages. Footer at bottom. Skip-link visible only on Tab focus. Ctrl+C.

- [ ] **Step 7: Commit**

```bash
git add components/Nav.tsx components/Footer.tsx app/[locale]/layout.tsx app/[locale]/page.tsx messages/
git commit -m "feat: add site nav, footer, skip-to-content link"
```

## Task 5.2: About page with instructor cards

**Files:**

- Create: `data/instructors.ts`
- Create: `components/InstructorCard.tsx`
- Create: `app/[locale]/about/page.tsx`
- Modify: `messages/nl.json`, `messages/en.json`

- [ ] **Step 1: Add about keys to messages (placeholder bios — user supplies real text in open items)**

Merge into `messages/nl.json` (and mirror EN):

```json
{
  "about": {
    "title": "Over ons",
    "intro": "We trainen engineering-teams in agentic engineering met Claude Code. Hands-on, productie-gericht, in NL of EN.",
    "instructors": {
      "pascal": {
        "name": "Pascal Dufour",
        "role": "Lead instructor",
        "bio": "Founder van agenticengineering.nl. Werkt al jaren met agentic workflows en helpt teams hun SDLC te moderniseren."
      },
      "collaborator-1": {
        "name": "Collaborator naam",
        "role": "Co-instructor",
        "bio": "Bio nog in te vullen."
      }
    }
  }
}
```

- [ ] **Step 2: Implement `data/instructors.ts`**

File `data/instructors.ts`:

```ts
export type InstructorId = 'pascal' | 'collaborator-1';

export type Instructor = {
  id: InstructorId;
  photo: string;
  socials?: { github?: string; linkedin?: string; x?: string };
};

export const instructors: Instructor[] = [
  { id: 'pascal', photo: '/instructors/pascal.png' },
  { id: 'collaborator-1', photo: '/instructors/collaborator-1.png' },
];
```

> Photo files live in `public/instructors/`. Until real photos arrive, the component falls back to initials (see Step 3).

- [ ] **Step 3: Implement `components/InstructorCard.tsx`**

File `components/InstructorCard.tsx`:

```tsx
import { useTranslations } from 'next-intl';
import type { InstructorId } from '@/data/instructors';

function Initials({ name }: { name: string }) {
  const letters = name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <div className="border-border-subtle bg-bg-base text-accent-green flex h-24 w-24 items-center justify-center rounded-sm border font-mono text-2xl">
      {letters}
    </div>
  );
}

export function InstructorCard({ id }: { id: InstructorId }) {
  const t = useTranslations(`about.instructors.${id}`);
  const name = t('name');
  return (
    <article className="border-border-subtle bg-bg-elevated flex gap-6 rounded-sm border p-6">
      <Initials name={name} />
      <div>
        <h3 className="text-text-primary font-mono text-lg">{name}</h3>
        <p className="text-text-muted font-mono text-xs tracking-[0.2em] uppercase">{t('role')}</p>
        <p className="text-text-muted mt-3 text-sm">{t('bio')}</p>
      </div>
    </article>
  );
}
```

- [ ] **Step 4: Implement `app/[locale]/about/page.tsx`**

File `app/[locale]/about/page.tsx`:

```tsx
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { InstructorCard } from '@/components/InstructorCard';
import { instructors } from '@/data/instructors';
import type { Locale } from '@/i18n/routing';

export default async function About({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('about');

  return (
    <main className="px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-text-primary font-mono text-4xl">
          <span className="text-accent-green">&gt;</span> {t('title')}
        </h1>
        <p className="text-text-muted mt-6 max-w-2xl">{t('intro')}</p>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {instructors.map((i) => (
            <InstructorCard key={i.id} id={i.id} />
          ))}
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 5: Dev-serve + verify**

Run: `pnpm dev`. Visit `/nl/about` and `/en/about`. Both render. Initials avatar shows. Ctrl+C.

- [ ] **Step 6: Commit**

```bash
git add data/instructors.ts components/InstructorCard.tsx app/[locale]/about/page.tsx messages/
git commit -m "feat: add About page with instructor cards"
```

**Slice 5 done when:** Prod has working Nav + Footer + skip-link + About page with at least 2 instructor cards in both locales.

---

# Slice 6 — Contact form (full flow: client → API → email)

**Outcome:** Contact page hosts a real form. Valid submission lands an email in `CONTACT_EMAIL` inbox. Honeypot, rate-limit, CSRF, sanitisation, validation all enforced.

## Task 6.1: Zod schema + `lib/validation.ts`

**Files:**

- Modify: `package.json`
- Create: `lib/validation.ts`
- Create: `tests/lib/validation.test.ts`

- [ ] **Step 1: Install Zod**

```bash
pnpm add zod
```

- [ ] **Step 2: Write failing tests**

File `tests/lib/validation.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { contactSchema } from '@/lib/validation';

const valid = {
  name: 'Pascal',
  email: 'pascal@example.com',
  company: 'ValidateIT',
  trainingInterest: 'basic',
  deliveryPref: 'remote',
  message: 'I am interested in the basic training for our team of 6.',
  website: '',
};

describe('contactSchema', () => {
  it('accepts a valid payload', () => {
    expect(contactSchema.safeParse(valid).success).toBe(true);
  });
  it('rejects missing name', () => {
    expect(contactSchema.safeParse({ ...valid, name: '' }).success).toBe(false);
  });
  it('rejects invalid email', () => {
    expect(contactSchema.safeParse({ ...valid, email: 'not-an-email' }).success).toBe(false);
  });
  it('rejects oversize message', () => {
    expect(contactSchema.safeParse({ ...valid, message: 'a'.repeat(5001) }).success).toBe(false);
  });
  it('rejects too-short message', () => {
    expect(contactSchema.safeParse({ ...valid, message: 'hi' }).success).toBe(false);
  });
  it('rejects unknown trainingInterest enum', () => {
    expect(
      contactSchema.safeParse({ ...valid, trainingInterest: 'mystery' as never }).success,
    ).toBe(false);
  });
  it('rejects honeypot filled', () => {
    expect(contactSchema.safeParse({ ...valid, website: 'http://spam' }).success).toBe(false);
  });
});
```

- [ ] **Step 3: Run — expect FAIL**

Run: `pnpm test -- validation`
Expected: FAIL — module missing.

- [ ] **Step 4: Implement `lib/validation.ts`**

File `lib/validation.ts`:

```ts
import { z } from 'zod';

export const trainingInterestEnum = z.enum(['basic', 'advanced', 'both', 'other']);
export const deliveryPrefEnum = z.enum(['inCompany', 'publicCohort', 'remote', 'noPreference']);

export const contactSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(254),
  company: z.string().trim().max(200).optional().default(''),
  trainingInterest: trainingInterestEnum,
  deliveryPref: deliveryPrefEnum,
  message: z.string().trim().min(10).max(5000),
  website: z.literal(''),
});

export type ContactInput = z.infer<typeof contactSchema>;
```

- [ ] **Step 5: Run — expect PASS**

Run: `pnpm test -- validation`
Expected: 7 passing.

- [ ] **Step 6: Commit**

```bash
git add package.json pnpm-lock.yaml lib/validation.ts tests/lib/validation.test.ts
git commit -m "feat: add Zod contact form schema"
```

## Task 6.2: Email wrapper around Resend

**Files:**

- Modify: `package.json`
- Create: `lib/email.ts`
- Create: `tests/lib/email.test.ts`
- Create: `.env.example`

- [ ] **Step 1: Install Resend**

```bash
pnpm add resend
```

- [ ] **Step 2: Write `.env.example`**

File `.env.example`:

```
RESEND_API_KEY=
CONTACT_EMAIL=hello@agenticengineering.nl
CONTACT_FROM_EMAIL=noreply@agenticengineering.nl
```

- [ ] **Step 3: Write failing tests**

File `tests/lib/email.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendContactEmail, EmailError } from '@/lib/email';

const sendMock = vi.fn();
vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({ emails: { send: sendMock } })),
}));

const payload = {
  name: 'Pascal',
  email: 'pascal@example.com',
  company: 'ValidateIT',
  trainingInterest: 'basic' as const,
  deliveryPref: 'remote' as const,
  message: 'I want to book the basic training.',
  website: '' as const,
};

beforeEach(() => {
  sendMock.mockReset();
  process.env.RESEND_API_KEY = 'test-key';
  process.env.CONTACT_EMAIL = 'hello@agenticengineering.nl';
  process.env.CONTACT_FROM_EMAIL = 'noreply@agenticengineering.nl';
});

describe('sendContactEmail', () => {
  it('sends email with stripped headers and reply-to', async () => {
    sendMock.mockResolvedValue({ data: { id: 'abc' }, error: null });
    await sendContactEmail({ ...payload, name: 'Pascal\r\nInjected: x' });
    expect(sendMock).toHaveBeenCalledTimes(1);
    const arg = sendMock.mock.calls[0][0];
    expect(arg.from).toBe('noreply@agenticengineering.nl');
    expect(arg.to).toBe('hello@agenticengineering.nl');
    expect(arg.replyTo).toBe('pascal@example.com');
    expect(arg.subject).not.toMatch(/[\r\n]/);
  });

  it('throws EmailError on Resend error', async () => {
    sendMock.mockResolvedValue({ data: null, error: { message: 'fail' } });
    await expect(sendContactEmail(payload)).rejects.toBeInstanceOf(EmailError);
  });

  it('throws EmailError on missing RESEND_API_KEY', async () => {
    delete process.env.RESEND_API_KEY;
    await expect(sendContactEmail(payload)).rejects.toBeInstanceOf(EmailError);
  });
});
```

- [ ] **Step 4: Run — expect FAIL**

Run: `pnpm test -- email`
Expected: FAIL.

- [ ] **Step 5: Implement `lib/email.ts`**

File `lib/email.ts`:

```ts
import { Resend } from 'resend';
import { stripCRLF } from './sanitize';
import type { ContactInput } from './validation';

export class EmailError extends Error {
  constructor(
    message: string,
    public cause?: unknown,
  ) {
    super(message);
    this.name = 'EmailError';
  }
}

export async function sendContactEmail(input: ContactInput): Promise<{ id: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL;
  if (!apiKey) throw new EmailError('RESEND_API_KEY missing');
  if (!to || !from) throw new EmailError('CONTACT_EMAIL or CONTACT_FROM_EMAIL missing');

  const safeName = stripCRLF(input.name);
  const safeReplyTo = stripCRLF(input.email);
  const safeCompany = stripCRLF(input.company ?? '');

  const subject = stripCRLF(`[agenticengineering.nl] ${input.trainingInterest} — ${safeName}`);

  const text = [
    `Name: ${safeName}`,
    `Email: ${safeReplyTo}`,
    `Company: ${safeCompany || '—'}`,
    `Training interest: ${input.trainingInterest}`,
    `Delivery preference: ${input.deliveryPref}`,
    '',
    'Message:',
    input.message,
  ].join('\n');

  const resend = new Resend(apiKey);
  const result = await resend.emails.send({
    from,
    to,
    replyTo: safeReplyTo,
    subject,
    text,
  });
  if (result.error || !result.data?.id) {
    throw new EmailError(result.error?.message ?? 'unknown Resend error', result.error);
  }
  return { id: result.data.id };
}
```

- [ ] **Step 6: Run — expect PASS**

Run: `pnpm test -- email`
Expected: 3 passing.

- [ ] **Step 7: Commit**

```bash
git add package.json pnpm-lock.yaml .env.example lib/email.ts tests/lib/email.test.ts
git commit -m "feat: add Resend email wrapper with header sanitisation"
```

## Task 6.3: In-memory rate-limit lib

**Files:**

- Create: `lib/rate-limit.ts`
- Create: `tests/lib/rate-limit.test.ts`

- [ ] **Step 1: Write failing tests**

File `tests/lib/rate-limit.test.ts`:

```ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { checkRateLimit, __resetRateLimitForTests } from '@/lib/rate-limit';

beforeEach(() => __resetRateLimitForTests());

describe('checkRateLimit', () => {
  it('allows first 5 hits in a minute', () => {
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit('1.2.3.4').ok).toBe(true);
    }
  });
  it('blocks the 6th hit in a minute', () => {
    for (let i = 0; i < 5; i++) checkRateLimit('1.2.3.4');
    const r = checkRateLimit('1.2.3.4');
    expect(r.ok).toBe(false);
    expect(r.retryAfterSec).toBeGreaterThan(0);
  });
  it('isolates IPs', () => {
    for (let i = 0; i < 5; i++) checkRateLimit('1.1.1.1');
    expect(checkRateLimit('2.2.2.2').ok).toBe(true);
  });
  it('rolls over after window', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T12:00:00Z'));
    for (let i = 0; i < 5; i++) checkRateLimit('9.9.9.9');
    expect(checkRateLimit('9.9.9.9').ok).toBe(false);
    vi.setSystemTime(new Date('2026-01-01T12:01:01Z'));
    expect(checkRateLimit('9.9.9.9').ok).toBe(true);
    vi.useRealTimers();
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

Run: `pnpm test -- rate-limit`
Expected: FAIL.

- [ ] **Step 3: Implement `lib/rate-limit.ts`**

File `lib/rate-limit.ts`:

```ts
const WINDOW_MS = 60_000;
const LIMIT = 5;

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function checkRateLimit(ip: string): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now();
  const existing = buckets.get(ip);
  if (!existing || existing.resetAt <= now) {
    buckets.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true };
  }
  if (existing.count < LIMIT) {
    existing.count += 1;
    return { ok: true };
  }
  return { ok: false, retryAfterSec: Math.ceil((existing.resetAt - now) / 1000) };
}

export function __resetRateLimitForTests() {
  buckets.clear();
}
```

- [ ] **Step 4: Run — expect PASS**

Run: `pnpm test -- rate-limit`
Expected: 4 passing.

- [ ] **Step 5: Commit**

```bash
git add lib/rate-limit.ts tests/lib/rate-limit.test.ts
git commit -m "feat: add in-memory IP rate limiter (5 req/min)"
```

## Task 6.4: `/api/contact` route

**Files:**

- Create: `app/api/contact/route.ts`
- Create: `tests/api/contact.test.ts`

- [ ] **Step 1: Write failing tests**

File `tests/api/contact.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/contact/route';
import { __resetRateLimitForTests } from '@/lib/rate-limit';

vi.mock('@/lib/email', async () => {
  const actual = await vi.importActual<typeof import('@/lib/email')>('@/lib/email');
  return { ...actual, sendContactEmail: vi.fn().mockResolvedValue({ id: 'mock' }) };
});

import { sendContactEmail } from '@/lib/email';

const validBody = {
  name: 'Pascal',
  email: 'pascal@example.com',
  company: 'ValidateIT',
  trainingInterest: 'basic',
  deliveryPref: 'remote',
  message: 'I am interested in the basic training.',
  website: '',
};

function make(body: unknown, headers: Record<string, string> = {}) {
  return new Request('https://agenticengineering.nl/api/contact', {
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
  process.env.RESEND_API_KEY = 'test';
  process.env.CONTACT_EMAIL = 'hello@agenticengineering.nl';
  process.env.CONTACT_FROM_EMAIL = 'noreply@agenticengineering.nl';
});

describe('POST /api/contact', () => {
  it('200 on valid payload + sends email', async () => {
    const res = await POST(make(validBody));
    expect(res.status).toBe(200);
    expect(sendContactEmail).toHaveBeenCalledTimes(1);
  });

  it('400 on invalid payload', async () => {
    const res = await POST(make({ ...validBody, email: 'not-email' }));
    expect(res.status).toBe(400);
  });

  it('403 on cross-origin', async () => {
    const res = await POST(make(validBody, { origin: 'https://evil.example' }));
    expect(res.status).toBe(403);
  });

  it('200 silent drop on honeypot', async () => {
    const res = await POST(make({ ...validBody, website: 'spam' }));
    expect(res.status).toBe(200);
    expect(sendContactEmail).not.toHaveBeenCalled();
  });

  it('429 on rate limit', async () => {
    for (let i = 0; i < 5; i++) await POST(make(validBody));
    const res = await POST(make(validBody));
    expect(res.status).toBe(429);
  });

  it('502 on email error', async () => {
    (sendContactEmail as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('boom'));
    const res = await POST(make(validBody));
    expect(res.status).toBe(502);
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

Run: `pnpm test -- api/contact`
Expected: FAIL.

- [ ] **Step 3: Implement `app/api/contact/route.ts`**

File `app/api/contact/route.ts`:

```ts
import { NextResponse } from 'next/server';
import { contactSchema } from '@/lib/validation';
import { sendContactEmail, EmailError } from '@/lib/email';
import { checkRateLimit } from '@/lib/rate-limit';

const ALLOWED_ORIGIN_PATTERNS = [
  /^https:\/\/agenticengineering\.nl$/,
  /^https:\/\/.*\.vercel\.app$/,
  /^http:\/\/localhost(:\d+)?$/,
];

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  return ALLOWED_ORIGIN_PATTERNS.some((re) => re.test(origin));
}

function clientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return '0.0.0.0';
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

  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    // honeypot path: schema fails because website should be ''. Distinguish.
    const websiteFilled =
      typeof (raw as { website?: unknown })?.website === 'string' &&
      (raw as { website: string }).website.length > 0;
    if (websiteFilled) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }
    return NextResponse.json(
      { ok: false, error: 'invalid_payload', issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    await sendContactEmail(parsed.data);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    const status = err instanceof EmailError ? 502 : 502;
    console.error('contact_email_failed', { status });
    return NextResponse.json({ ok: false, error: 'email_failed' }, { status });
  }
}

export const runtime = 'nodejs';
```

- [ ] **Step 4: Run — expect PASS**

Run: `pnpm test -- api/contact`
Expected: 6 passing.

- [ ] **Step 5: Commit**

```bash
git add app/api/contact/ tests/api/contact.test.ts
git commit -m "feat: add /api/contact route with validation, csrf, rate-limit, honeypot"
```

## Task 6.5: `<ContactForm />` client component

**Files:**

- Modify: `package.json`
- Create: `components/ContactForm.tsx`
- Create: `tests/components/ContactForm.test.tsx`
- Modify: `messages/nl.json`, `messages/en.json`

- [ ] **Step 1: Install RHF + Zod resolver**

```bash
pnpm add react-hook-form @hookform/resolvers
```

- [ ] **Step 2: Add contact translation keys to messages**

Merge into `messages/nl.json` (mirror EN):

```json
{
  "contact": {
    "title": "Contact",
    "intro": "Vertel ons over je team. We reageren binnen 1 werkdag.",
    "form": {
      "name": "Naam",
      "email": "E-mail",
      "company": "Bedrijf (optioneel)",
      "trainingInterest": "Interesse in welke training",
      "trainingOptions": {
        "basic": "Basic (1 dag)",
        "advanced": "Advanced (2 dagen)",
        "both": "Beide",
        "other": "Anders"
      },
      "deliveryPref": "Voorkeur levering",
      "deliveryOptions": {
        "inCompany": "In-company",
        "publicCohort": "Open inschrijving",
        "remote": "Remote",
        "noPreference": "Geen voorkeur"
      },
      "message": "Bericht",
      "submit": "Verzenden",
      "submitting": "Bezig met verzenden..."
    },
    "errors": {
      "required": "Verplicht veld",
      "invalidEmail": "Ongeldig e-mailadres",
      "messageTooShort": "Minstens 10 tekens",
      "messageTooLong": "Maximaal 5000 tekens",
      "generic": "Er ging iets mis. Mail direct naar hello@agenticengineering.nl.",
      "rateLimited": "Te veel verzoeken. Probeer over een minuut opnieuw."
    },
    "success": {
      "title": "Verzonden",
      "body": "We nemen binnen 1 werkdag contact op."
    }
  }
}
```

- [ ] **Step 3: Implement `components/ContactForm.tsx`**

File `components/ContactForm.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { contactSchema, type ContactInput } from '@/lib/validation';

type Status = 'idle' | 'submitting' | 'success' | 'error' | 'rateLimited';

export function ContactForm({ defaultTraining }: { defaultTraining?: 'basic' | 'advanced' }) {
  const t = useTranslations('contact');
  const [status, setStatus] = useState<Status>('idle');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      company: '',
      trainingInterest: defaultTraining ?? 'basic',
      deliveryPref: 'noPreference',
      message: '',
      website: '',
    },
  });

  async function onSubmit(values: ContactInput) {
    setStatus('submitting');
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(values),
    });
    if (res.ok) setStatus('success');
    else if (res.status === 429) setStatus('rateLimited');
    else setStatus('error');
  }

  if (status === 'success') {
    return (
      <div className="border-accent-green bg-bg-elevated rounded-sm border p-6">
        <p className="text-accent-green font-mono">// {t('success.title')}</p>
        <p className="text-text-muted mt-2">{t('success.body')}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Field label={t('form.name')} error={errors.name?.message}>
        <input
          type="text"
          autoComplete="name"
          {...register('name')}
          className="border-border-subtle bg-bg-elevated text-text-primary w-full rounded-sm border px-3 py-2 font-sans"
        />
      </Field>

      <Field label={t('form.email')} error={errors.email?.message}>
        <input
          type="email"
          autoComplete="email"
          {...register('email')}
          className="border-border-subtle bg-bg-elevated text-text-primary w-full rounded-sm border px-3 py-2 font-sans"
        />
      </Field>

      <Field label={t('form.company')} error={errors.company?.message}>
        <input
          type="text"
          autoComplete="organization"
          {...register('company')}
          className="border-border-subtle bg-bg-elevated text-text-primary w-full rounded-sm border px-3 py-2 font-sans"
        />
      </Field>

      <Field label={t('form.trainingInterest')} error={errors.trainingInterest?.message}>
        <select
          {...register('trainingInterest')}
          className="border-border-subtle bg-bg-elevated text-text-primary w-full rounded-sm border px-3 py-2 font-sans"
        >
          <option value="basic">{t('form.trainingOptions.basic')}</option>
          <option value="advanced">{t('form.trainingOptions.advanced')}</option>
          <option value="both">{t('form.trainingOptions.both')}</option>
          <option value="other">{t('form.trainingOptions.other')}</option>
        </select>
      </Field>

      <Field label={t('form.deliveryPref')} error={errors.deliveryPref?.message}>
        <select
          {...register('deliveryPref')}
          className="border-border-subtle bg-bg-elevated text-text-primary w-full rounded-sm border px-3 py-2 font-sans"
        >
          <option value="noPreference">{t('form.deliveryOptions.noPreference')}</option>
          <option value="inCompany">{t('form.deliveryOptions.inCompany')}</option>
          <option value="publicCohort">{t('form.deliveryOptions.publicCohort')}</option>
          <option value="remote">{t('form.deliveryOptions.remote')}</option>
        </select>
      </Field>

      <Field label={t('form.message')} error={errors.message?.message}>
        <textarea
          rows={6}
          {...register('message')}
          className="border-border-subtle bg-bg-elevated text-text-primary w-full rounded-sm border px-3 py-2 font-sans"
        />
      </Field>

      <div className="hidden">
        <label>
          Leave this empty
          <input type="text" tabIndex={-1} autoComplete="off" {...register('website')} />
        </label>
      </div>

      {status === 'error' && (
        <p className="text-accent-red font-mono text-sm">// {t('errors.generic')}</p>
      )}
      {status === 'rateLimited' && (
        <p className="text-accent-orange font-mono text-sm">// {t('errors.rateLimited')}</p>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="bg-accent-green text-bg-base inline-flex items-center gap-2 rounded-sm px-5 py-3 font-mono text-sm font-semibold hover:brightness-110 disabled:opacity-60"
      >
        $ {status === 'submitting' ? t('form.submitting') : t('form.submit')}
      </button>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-text-muted font-mono text-xs tracking-[0.2em] uppercase">{label}</span>
      <div className="mt-2">{children}</div>
      {error && <p className="text-accent-red mt-1 font-mono text-xs">// {error}</p>}
    </label>
  );
}
```

- [ ] **Step 4: Write minimal component test (success path)**

File `tests/components/ContactForm.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import nl from '@/messages/nl.json';
import { ContactForm } from '@/components/ContactForm';

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ ok: true }) }),
  );
});

function renderForm() {
  return render(
    <NextIntlClientProvider locale="nl" messages={nl}>
      <ContactForm />
    </NextIntlClientProvider>,
  );
}

describe('<ContactForm />', () => {
  it('shows success state after valid submit', async () => {
    const user = userEvent.setup();
    renderForm();
    await user.type(screen.getByLabelText(/Naam/), 'Pascal');
    await user.type(screen.getByLabelText(/E-mail/), 'pascal@example.com');
    await user.type(
      screen.getByLabelText(/Bericht/),
      'Wij willen graag de basic training boeken voor ons team.',
    );
    await user.click(screen.getByRole('button', { name: /Verzenden/ }));
    await waitFor(() => {
      expect(screen.getByText(/Verzonden/)).toBeInTheDocument();
    });
  });

  it('shows error banner on 500 response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 502, json: async () => ({}) }),
    );
    const user = userEvent.setup();
    renderForm();
    await user.type(screen.getByLabelText(/Naam/), 'Pascal');
    await user.type(screen.getByLabelText(/E-mail/), 'pascal@example.com');
    await user.type(screen.getByLabelText(/Bericht/), 'Voldoende lange testbericht hier.');
    await user.click(screen.getByRole('button', { name: /Verzenden/ }));
    await waitFor(() => {
      expect(screen.getByText(/Er ging iets mis/)).toBeInTheDocument();
    });
  });
});
```

- [ ] **Step 5: Run — expect PASS**

Run: `pnpm test -- ContactForm`
Expected: 2 passing.

- [ ] **Step 6: Commit**

```bash
git add package.json pnpm-lock.yaml components/ContactForm.tsx tests/components/ContactForm.test.tsx messages/
git commit -m "feat: add ContactForm client component with RHF + Zod"
```

## Task 6.6: Contact page

**Files:**

- Create: `app/[locale]/contact/page.tsx`

- [ ] **Step 1: Implement contact page**

File `app/[locale]/contact/page.tsx`:

```tsx
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { ContactForm } from '@/components/ContactForm';
import type { Locale } from '@/i18n/routing';

type Props = {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ training?: 'basic' | 'advanced' }>;
};

export default async function ContactPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { training } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations('contact');

  return (
    <main className="px-6 py-20">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-text-primary font-mono text-4xl">
          <span className="text-accent-green">&gt;</span> {t('title')}
        </h1>
        <p className="text-text-muted mt-4">{t('intro')}</p>
        <div className="mt-10">
          <ContactForm defaultTraining={training === 'advanced' ? 'advanced' : 'basic'} />
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Dev-serve, submit form locally with dummy env, verify either real email (if RESEND_API_KEY in `.env.local`) or 502 with banner**

Run: `pnpm dev`. Submit form at `/nl/contact`. If `RESEND_API_KEY` real and set, an email lands in `CONTACT_EMAIL`. Otherwise, error banner shows. Ctrl+C.

- [ ] **Step 3: Commit**

```bash
git add app/[locale]/contact/
git commit -m "feat: add Contact page with form"
```

**Slice 6 done when:** Contact page submits to `/api/contact`, valid messages deliver to `CONTACT_EMAIL`, honeypot/rate-limit/csrf paths return correct codes, all tests pass.

---

# Slice 7 — Security headers, CSP, JSON-LD, sitemap, robots

**Outcome:** Site scores A+ on securityheaders.com, structured data validates on Schema Markup Validator, sitemap is locale-aware, robots allows all.

## Task 7.1: Security headers via `next.config.ts`

**Files:**

- Modify: `next.config.ts`

- [ ] **Step 1: Update `next.config.ts`**

File `next.config.ts`:

```ts
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const securityHeaders = [
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data:",
      "font-src 'self' data: https://fonts.gstatic.com",
      "connect-src 'self' https://api.resend.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }];
  },
};

export default withNextIntl(nextConfig);
```

> **Note on CSP `'unsafe-inline'` for `script-src`:** Next.js 15 emits inline runtime scripts that need either `'unsafe-inline'` or strict nonces. Nonces require disabling static generation for affected pages. We accept `'unsafe-inline'` for v1 and revisit with strict nonces when traffic justifies the complexity. Spec §11 calls for nonce-based; flag as known deviation for review.

- [ ] **Step 2: Build, run prod, curl headers**

Run: `pnpm build && pnpm start`
In another terminal: `curl -sI http://localhost:3000/nl | grep -i 'strict\|content-security\|x-frame'`
Expected: all three headers present.
Stop both servers.

- [ ] **Step 3: Commit**

```bash
git add next.config.ts
git commit -m "feat: add HSTS, CSP, X-Frame-Options and friends"
```

## Task 7.2: `<JsonLd />` + Course + Organization schema

**Files:**

- Create: `components/JsonLd.tsx`
- Modify: `app/[locale]/page.tsx`

- [ ] **Step 1: Implement `components/JsonLd.tsx`** (only allowed `dangerouslySetInnerHTML` use)

File `components/JsonLd.tsx`:

```tsx
type JsonLdProps = { data: Record<string, unknown> };

export function JsonLd({ data }: JsonLdProps) {
  // eslint-disable-next-line react/no-danger -- type-controlled JSON only
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}
```

- [ ] **Step 2: Embed Course + Organization schema on home**

Modify `app/[locale]/page.tsx` (add to imports + JSX top):

```tsx
import { JsonLd } from '@/components/JsonLd';
import { trainings } from '@/data/trainings';
```

Insert at start of returned `<main>`:

```tsx
<JsonLd
  data={{
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: 'agenticengineering.nl',
        url: 'https://agenticengineering.nl',
        sameAs: ['https://github.com/', 'https://linkedin.com/'],
      },
      ...Object.values(trainings).map((tr) => ({
        '@type': 'Course',
        name: `${tr.id === 'basic' ? 'Basic' : 'Advanced'} — agentic engineering`,
        provider: { '@type': 'Organization', name: 'agenticengineering.nl' },
        offers: {
          '@type': 'Offer',
          priceCurrency: 'EUR',
          price: tr.priceEUR,
        },
      })),
    ],
  }}
/>
```

- [ ] **Step 3: Build + view-source to verify JSON-LD present**

Run: `pnpm build && pnpm start`. `curl -s http://localhost:3000/nl | grep -o 'application/ld+json'`
Expected: at least one match. Stop server.

- [ ] **Step 4: Commit**

```bash
git add components/JsonLd.tsx app/[locale]/page.tsx
git commit -m "feat: add Organization + Course JSON-LD on home"
```

## Task 7.3: Sitemap + robots

**Files:**

- Create: `app/sitemap.ts`
- Create: `app/robots.ts`

- [ ] **Step 1: Implement `app/sitemap.ts`**

File `app/sitemap.ts`:

```ts
import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';

const BASE = 'https://agenticengineering.nl';
const PATHS = ['', '/about', '/contact', '/impressum'] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return PATHS.flatMap((p) =>
    routing.locales.map((locale) => ({
      url: `${BASE}/${locale}${p}`,
      changeFrequency: 'monthly' as const,
      priority: p === '' ? 1.0 : 0.7,
      alternates: {
        languages: Object.fromEntries(routing.locales.map((l) => [l, `${BASE}/${l}${p}`])),
      },
    })),
  );
}
```

- [ ] **Step 2: Implement `app/robots.ts`**

File `app/robots.ts`:

```ts
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: 'https://agenticengineering.nl/sitemap.xml',
    host: 'https://agenticengineering.nl',
  };
}
```

- [ ] **Step 3: Build + verify**

Run: `pnpm build && pnpm start`. `curl -s http://localhost:3000/sitemap.xml | head -20`
Expected: XML containing both locales × 4 paths.
`curl -s http://localhost:3000/robots.txt`
Expected: `Sitemap:` line present.
Stop server.

- [ ] **Step 4: Commit**

```bash
git add app/sitemap.ts app/robots.ts
git commit -m "feat: add locale-aware sitemap and robots"
```

## Task 7.4: `hreflang` alternates in layout metadata

**Files:**

- Modify: `app/[locale]/layout.tsx`

- [ ] **Step 1: Update `generateMetadata`**

In `app/[locale]/layout.tsx`, replace the existing `generateMetadata`:

```tsx
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: `https://agenticengineering.nl/${locale}`,
      languages: {
        nl: 'https://agenticengineering.nl/nl',
        en: 'https://agenticengineering.nl/en',
      },
    },
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: `https://agenticengineering.nl/${locale}`,
      locale: locale === 'nl' ? 'nl_NL' : 'en_GB',
      type: 'website',
    },
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add app/[locale]/layout.tsx
git commit -m "feat: add canonical + hreflang + OG metadata per locale"
```

## Task 7.5: Add security gates to CI

**Files:**

- Modify: `.github/workflows/ci.yml`
- Modify: `package.json`

- [ ] **Step 1: Install audit tools**

```bash
pnpm add -D @octokit/openapi-types
# osv-scanner is a binary; install via the action below, not via pnpm.
```

- [ ] **Step 2: Add gates to workflow**

Modify `.github/workflows/ci.yml` — append jobs:

```yaml
audit:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: pnpm/action-setup@v4
      with: { version: 9 }
    - uses: actions/setup-node@v4
      with: { node-version: 20, cache: pnpm }
    - run: pnpm install --frozen-lockfile
    - run: pnpm audit --audit-level=high

osv:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: google/osv-scanner-action/osv-scanner-action@v1.7.0
      with:
        scan-args: |-
          --lockfile=pnpm-lock.yaml

gitleaks:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
      with: { fetch-depth: 0 }
    - uses: gitleaks/gitleaks-action@v2
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/ci.yml package.json pnpm-lock.yaml
git commit -m "ci: add pnpm audit, osv-scanner, gitleaks gates"
```

**Slice 7 done when:** Prod URL passes securityheaders.com (target A+), sitemap.xml + robots.txt return 200, JSON-LD validates, CI runs three security gates.

---

# Slice 8 — Impressum, final polish, E2E, launch acceptance

**Outcome:** Impressum page live with placeholder KVK + address. Playwright E2E covers home + locale switch + contact. axe scan clean. Lighthouse budgets met. Repo ready for launch sign-off.

## Task 8.1: Impressum page

**Files:**

- Create: `app/[locale]/impressum/page.tsx`
- Modify: `messages/nl.json`, `messages/en.json`

- [ ] **Step 1: Add impressum keys (placeholders for KVK + address — user fills before launch)**

Merge into `messages/nl.json` (mirror EN):

```json
{
  "impressum": {
    "title": "Bedrijfsgegevens",
    "businessName": "agenticengineering.nl",
    "operator": "Operator: <vul in vóór lancering>",
    "address": "<vul adres in>",
    "kvk": "KVK: <vul KVK in>",
    "vat": "BTW: <vul BTW in>",
    "email": "hello@agenticengineering.nl"
  }
}
```

- [ ] **Step 2: Implement page**

File `app/[locale]/impressum/page.tsx`:

```tsx
import { setRequestLocale, getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';

export default async function Impressum({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('impressum');

  return (
    <main className="px-6 py-20">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-text-primary font-mono text-4xl">
          <span className="text-accent-green">&gt;</span> {t('title')}
        </h1>
        <dl className="text-text-muted mt-10 space-y-3 font-mono text-sm">
          <Row label="Business" value={t('businessName')} />
          <Row label="Operator" value={t('operator')} />
          <Row label="Address" value={t('address')} />
          <Row label="KVK" value={t('kvk')} />
          <Row label="VAT" value={t('vat')} />
          <Row label="Email" value={t('email')} />
        </dl>
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap gap-x-4">
      <dt className="text-text-muted w-32">{label}</dt>
      <dd className="text-text-primary">{value}</dd>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/[locale]/impressum/ messages/
git commit -m "feat: add impressum page placeholders"
```

## Task 8.2: Playwright E2E setup

**Files:**

- Modify: `package.json`
- Create: `playwright.config.ts`
- Create: `e2e/home.spec.ts`
- Create: `e2e/language-switch.spec.ts`
- Create: `e2e/contact.spec.ts`

- [ ] **Step 1: Install + browsers**

```bash
pnpm add -D @playwright/test
pnpm exec playwright install --with-deps chromium
```

- [ ] **Step 2: Write `playwright.config.ts`**

File `playwright.config.ts`:

```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  webServer: {
    command: 'pnpm build && pnpm start',
    url: 'http://localhost:3000/nl',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  use: { baseURL: 'http://localhost:3000' },
  reporter: process.env.CI ? 'github' : 'list',
});
```

- [ ] **Step 3: Write `e2e/home.spec.ts`**

File `e2e/home.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test('home renders hero + both training sections in NL', async ({ page }) => {
  await page.goto('/nl');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/agentic engineering/i);
  await expect(page.locator('#training-basic')).toBeVisible();
  await expect(page.locator('#training-advanced')).toBeVisible();
});

test('redirects / to /nl', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/nl$/);
});
```

- [ ] **Step 4: Write `e2e/language-switch.spec.ts`**

File `e2e/language-switch.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test('switching locale on /about preserves path', async ({ page }) => {
  await page.goto('/nl/about');
  await page.getByRole('link', { name: 'EN' }).click();
  await expect(page).toHaveURL(/\/en\/about$/);
});
```

- [ ] **Step 5: Write `e2e/contact.spec.ts`**

File `e2e/contact.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test('contact form shows validation errors on empty submit', async ({ page }) => {
  await page.goto('/nl/contact');
  await page.getByRole('button', { name: /Verzenden/ }).click();
  await expect(page.getByText('// Verplicht veld').first()).toBeVisible();
});

test('contact form submits when API is mocked to 200', async ({ page }) => {
  await page.route('**/api/contact', (route) =>
    route.fulfill({ status: 200, body: JSON.stringify({ ok: true }) }),
  );
  await page.goto('/nl/contact');
  await page.fill('input[name="name"]', 'Pascal');
  await page.fill('input[name="email"]', 'pascal@example.com');
  await page.fill('textarea[name="message"]', 'Wij willen graag de basic training boeken.');
  await page.getByRole('button', { name: /Verzenden/ }).click();
  await expect(page.getByText('// Verzonden')).toBeVisible();
});
```

- [ ] **Step 6: Run E2E locally**

Run: `pnpm test:e2e`
Expected: 4 passing.

- [ ] **Step 7: Add E2E job to CI**

Modify `.github/workflows/ci.yml` — append:

```yaml
e2e:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: pnpm/action-setup@v4
      with: { version: 9 }
    - uses: actions/setup-node@v4
      with: { node-version: 20, cache: pnpm }
    - run: pnpm install --frozen-lockfile
    - run: pnpm exec playwright install --with-deps chromium
    - run: pnpm test:e2e
    - uses: actions/upload-artifact@v4
      if: failure()
      with:
        name: playwright-report
        path: playwright-report/
```

- [ ] **Step 8: Commit**

```bash
git add package.json pnpm-lock.yaml playwright.config.ts e2e/ .github/workflows/ci.yml
git commit -m "test: add Playwright E2E for home, locale, contact"
```

## Task 8.3: axe accessibility scan

**Files:**

- Modify: `package.json`
- Create: `e2e/a11y.spec.ts`

- [ ] **Step 1: Install axe**

```bash
pnpm add -D @axe-core/playwright
```

- [ ] **Step 2: Write a11y spec**

File `e2e/a11y.spec.ts`:

```ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const pages = ['/nl', '/en', '/nl/about', '/en/about', '/nl/contact', '/nl/impressum'];

for (const path of pages) {
  test(`a11y: ${path} has zero AA violations`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}
```

- [ ] **Step 3: Run + fix any reported violations inline**

Run: `pnpm test:e2e -- a11y`
Expected: green. If failures, fix `aria-` / labels / contrast inline. (Most likely: ensure form labels, link names, contrast on muted-on-elevated text. If muted text fails AA, bump muted to `#a1a8b0`.)

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml e2e/a11y.spec.ts
git commit -m "test: enforce zero axe AA violations on all pages"
```

## Task 8.4: Lighthouse manual check + launch acceptance checklist

**Files:**

- Create: `docs/superpowers/specs/launch-checklist.md`

- [ ] **Step 1: Run Lighthouse locally**

Run: `pnpm build && pnpm start`. In Chrome: DevTools → Lighthouse → Mobile → Performance + Accessibility + Best Practices + SEO.
Expected: Performance ≥95, Accessibility 100, Best Practices ≥95, SEO 100. If any miss, fix the specific suggestion inline (typical fixes: preload primary font, add `<meta viewport>` already present via Next, ensure `<html lang>`).

- [ ] **Step 2: Write `docs/superpowers/specs/launch-checklist.md`**

File `docs/superpowers/specs/launch-checklist.md`:

```markdown
# agenticengineering.nl — Launch checklist

Run this list before flipping prod DNS / before first promotion.

## Content

- [ ] Real prices set in `data/trainings.ts`
- [ ] Real KVK + address + VAT in `messages/*.json` `impressum` keys
- [ ] Real social URLs in `components/Footer.tsx`
- [ ] Real collaborator bios + photos under `public/instructors/`
- [ ] Logo replaced in `public/logo.svg`
- [ ] OG images under `public/og/{nl,en}.png`

## Infrastructure

- [ ] Vercel project linked to `main` for prod
- [ ] DNS A/CNAME for `agenticengineering.nl` → Vercel
- [ ] Resend domain verification (SPF, DKIM, DMARC) for `agenticengineering.nl`
- [ ] Env vars in Vercel: `RESEND_API_KEY`, `CONTACT_EMAIL`, `CONTACT_FROM_EMAIL`

## Security

- [ ] securityheaders.com — grade A or A+
- [ ] Mozilla Observatory — B+ or higher
- [ ] `pnpm audit` clean
- [ ] CodeQL (GitHub default) clean
- [ ] gitleaks clean on full repo
- [ ] Manual: header-injection attempt on form rejected (curl with `\r\n` in name)
- [ ] Manual: rate-limit fires after 5 requests/minute from one IP
- [ ] Manual: cross-origin POST returns 403
- [ ] Manual: oversize message (>5000 char) returns 400
- [ ] TLS cert valid + HSTS preload-eligible

## Functional

- [ ] CI green on `main`
- [ ] Both locales render hero, trainings, about, contact, impressum
- [ ] Language switcher preserves path on every page
- [ ] Contact form delivers email to `CONTACT_EMAIL`
- [ ] All 8 Basic modules + 7 Advanced modules render with bullets

## Performance

- [ ] Lighthouse mobile: Performance ≥95, A11y 100, BP ≥95, SEO 100
- [ ] LCP < 2.5s on throttled mobile

## Risks (track if not yet resolved)

- [ ] Privacy policy / cookie notice (recommended before public traffic)
- [ ] T&C / terms of training engagement (before first paid booking)
- [ ] Upstash/Vercel KV for distributed rate-limit (before scale or multi-region)
```

- [ ] **Step 3: Commit**

```bash
git add docs/superpowers/specs/launch-checklist.md
git commit -m "docs: add pre-launch checklist"
```

**Slice 8 done when:** Impressum live, all E2E + a11y green in CI, Lighthouse targets verified, launch checklist committed.

---

## Self-Review Notes

**Spec coverage walkthrough (every spec §):**

| Spec §                                                                                                                          | Slice / Task                                                                                                                          |
| ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| §2 Trainings: Basic 8 modules                                                                                                   | Task 3.1 data + 3.2 render                                                                                                            |
| §2 Trainings: Advanced 7 modules with Day1/Day2                                                                                 | Task 3.1 data + 4.2 render                                                                                                            |
| §2 Delivery formats                                                                                                             | Translations in 3.1, used in 3.2                                                                                                      |
| §2 Pricing display                                                                                                              | Task 3.2 + 4.1                                                                                                                        |
| §3 Stack: Next 15, Tailwind v4, next-intl, Resend, Vercel                                                                       | Slice 0 + Task 2.1 + Task 6.2 + Task 0.7                                                                                              |
| §3 Repo layout                                                                                                                  | File structure section + each task                                                                                                    |
| §4 Routes (`/`, `/[locale]`, `/[locale]/about`, etc.)                                                                           | Tasks 2.2, 5.2, 6.6, 8.1, plus API in 6.4                                                                                             |
| §5 Home page layout (Nav, Hero, Trainings overview, Basic detail, Advanced detail, Instructors snippet, Final CTA band, Footer) | 1.2, 4.2, 3.2, 5.1; instructors-on-home + final CTA noted as YAGNI for v1 — covered partially by Nav + About link. **Gap fix below.** |
| §6 Data model                                                                                                                   | Task 3.1 + 5.2                                                                                                                        |
| §7 i18n flow                                                                                                                    | Slice 2 + 2.4                                                                                                                         |
| §8 Contact form (client + server + env)                                                                                         | Slice 6 entire                                                                                                                        |
| §9 Visual system                                                                                                                | Task 0.3 + 1.1                                                                                                                        |
| §10 Error handling                                                                                                              | Task 6.4 + UI states in 6.5                                                                                                           |
| §11 Security headers + CSP                                                                                                      | Task 7.1                                                                                                                              |
| §11 Honeypot, rate-limit, CSRF, sanitisation                                                                                    | Task 6.3 + 6.4                                                                                                                        |
| §11 CI gates (audit, osv, gitleaks)                                                                                             | Task 7.5                                                                                                                              |
| §11 JSON-LD exception via `<JsonLd />`                                                                                          | Task 7.2                                                                                                                              |
| §12 Testing                                                                                                                     | 0.5, 2.3, 2.4, 4.1, 6.1, 6.2, 6.3, 6.4, 6.5, 8.2, 8.3                                                                                 |
| §13 Build/CI/deploy                                                                                                             | 0.6, 0.7, 7.5, 8.2                                                                                                                    |
| §13 SEO (sitemap, robots, hreflang, OG, JSON-LD)                                                                                | 7.2, 7.3, 7.4                                                                                                                         |
| §13 Performance budgets                                                                                                         | 8.4                                                                                                                                   |
| §14 Acceptance criteria                                                                                                         | mapped via launch checklist (8.4)                                                                                                     |
| §15 Open items                                                                                                                  | called out in tasks 3.1, 5.2, 8.1                                                                                                     |

**Gap fix — Spec §5 calls for "Instructors snippet on home" + "Final CTA band on home". Adding follow-up task.**

## Task 8.5 (gap fix): Instructors snippet + final CTA band on home

**Files:**

- Modify: `app/[locale]/page.tsx`
- Modify: `messages/nl.json`, `messages/en.json`

- [ ] **Step 1: Add keys**

Merge into `messages/nl.json` (mirror EN):

```json
{
  "home": {
    "instructorsTitle": "Wie geeft de training",
    "instructorsLink": "Meet the team →",
    "finalCta": {
      "title": "Klaar om je team op te leiden?",
      "body": "Plan een kennismaking. We reageren binnen 1 werkdag.",
      "cta": "book training"
    }
  }
}
```

- [ ] **Step 2: Add `InstructorsSnippet` + `FinalCta` inline in home**

Modify `app/[locale]/page.tsx`:

Replace the file with:

```tsx
import Link from 'next/link';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Hero } from '@/components/Hero';
import { TrainingCard } from '@/components/TrainingCard';
import { TrainingDetail } from '@/components/TrainingDetail';
import { InstructorCard } from '@/components/InstructorCard';
import { JsonLd } from '@/components/JsonLd';
import { instructors } from '@/data/instructors';
import { trainings } from '@/data/trainings';
import type { Locale } from '@/i18n/routing';

export default async function Home({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tHero = await getTranslations('hero');
  const tTrainings = await getTranslations('trainings');
  const tHome = await getTranslations('home');

  return (
    <main>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'Organization',
              name: 'agenticengineering.nl',
              url: 'https://agenticengineering.nl',
            },
            ...Object.values(trainings).map((tr) => ({
              '@type': 'Course',
              name: `${tr.id === 'basic' ? 'Basic' : 'Advanced'} — agentic engineering`,
              provider: { '@type': 'Organization', name: 'agenticengineering.nl' },
              offers: { '@type': 'Offer', priceCurrency: 'EUR', price: tr.priceEUR },
            })),
          ],
        }}
      />

      <Hero
        kicker={tHero('kicker')}
        title={tHero('title')}
        subtitle={tHero('subtitle')}
        primaryCta={{ label: tHero('ctaPrimary'), href: `/${locale}/contact` }}
        secondaryCta={{ label: tHero('ctaSecondary'), href: '#trainings' }}
      />

      <section id="trainings" className="border-border-subtle border-t px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-text-primary font-mono text-3xl">
            <span className="text-accent-green">&gt;</span> {tTrainings('sectionTitle')}
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <TrainingCard trainingId="basic" locale={locale} />
            <TrainingCard trainingId="advanced" locale={locale} />
          </div>
        </div>
      </section>

      <TrainingDetail trainingId="basic" locale={locale} />
      <TrainingDetail trainingId="advanced" locale={locale} />

      <section className="border-border-subtle border-t px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-text-primary font-mono text-2xl">
            <span className="text-accent-green">&gt;</span> {tHome('instructorsTitle')}
          </h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {instructors.map((i) => (
              <InstructorCard key={i.id} id={i.id} />
            ))}
          </div>
          <Link
            href={`/${locale}/about`}
            className="text-accent-blue mt-6 inline-flex font-mono text-sm hover:underline"
          >
            {tHome('instructorsLink')}
          </Link>
        </div>
      </section>

      <section className="border-border-subtle bg-bg-elevated border-t px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-text-primary font-mono text-3xl">
            <span className="text-accent-green">&gt;</span> {tHome('finalCta.title')}
          </h2>
          <p className="text-text-muted mt-4">{tHome('finalCta.body')}</p>
          <Link
            href={`/${locale}/contact`}
            className="bg-accent-green text-bg-base mt-8 inline-flex items-center gap-2 rounded-sm px-5 py-3 font-mono text-sm font-semibold hover:brightness-110"
          >
            $ {tHome('finalCta.cta')}
          </Link>
        </div>
      </section>
    </main>
  );
}
```

- [ ] **Step 3: Run i18n integrity + tests + dev-serve**

Run: `pnpm verify:i18n && pnpm test && pnpm dev`. Confirm sections render. Ctrl+C.

- [ ] **Step 4: Commit**

```bash
git add app/[locale]/page.tsx messages/
git commit -m "feat: add instructors snippet and final CTA band on home"
```

---

## Done definition

The plan is fully executed when:

1. CI is green on `main` with all gates (lint, typecheck, test, build, verify:i18n, audit, osv, gitleaks, e2e, a11y).
2. Production URL serves both locales with all sections from spec §5.
3. Contact form delivers email; honeypot, rate-limit, CSRF, sanitisation verified manually per launch checklist.
4. Lighthouse mobile ≥95 / 100 / ≥95 / 100 on home.
5. Launch checklist (`docs/superpowers/specs/launch-checklist.md`) reviewed and unresolved risks acknowledged.

---

## Execution choice

This plan is ready. Two execution options:

**1. Subagent-Driven (recommended)** — dispatch a fresh subagent per task, review between tasks, fast iteration. Uses `superpowers:subagent-driven-development`.

**2. Inline Execution** — execute tasks in this session using `superpowers:executing-plans`, batched with review checkpoints.
