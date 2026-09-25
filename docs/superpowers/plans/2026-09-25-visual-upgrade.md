# Visual Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the white/blue light theme and the dark theme with one muted theme: `#cdd3cd` surfaces, dark-green `.surface-dark` bands, antraciet headings, Rubik, and a floating pill nav.

**Architecture:** All colours stay Tailwind v4 `@theme` tokens in `app/globals.css`. A `.surface-dark` class in `@layer components` redefines the same tokens for its subtree, so components keep their utility classes and change colour by placement. A new `PageHeader` component gives every subpage a dark header band.

**Tech Stack:** Next.js 15 (App Router, RSC), React 19, Tailwind v4, next-intl, `next/font/google`, `next/og` (`ImageResponse`), Vitest + Testing Library, Playwright + axe.

**Spec:** `docs/superpowers/specs/2026-09-25-visual-upgrade-design.md`

## Execution rules (user constraints, override skill defaults)

- **No commits by the agent.** Every "Commit" step means: tell the user the task is done and which files changed; the user commits (the pre-commit hook needs README in the same commit — see Task 6).
- **No `rm`, no deletions by the agent.** File deletions are shown as a command; the user runs it.
- **No `pnpm`/test commands run by the agent.** Every "Run" step is shown to the user with a one-line explanation; the user runs it and pastes the result.
- **Every code edit is shown for manual approval** (Edit/Write tool; the user accepts each).
- **External fetches (docs, npm, GitHub) need permission first.**
- Communicate in Dutch, address the user as "Chef".

## Global Constraints

- Every text/UI colour pair in the code meets WCAG 2.1 AA (≥ 4.5:1 normal text, ≥ 3:1 large text and UI components).
- Light tokens: `bg-page #cdd3cd`, `bg-base #e1e5e1`, `bg-elevated #c5cbc4`, `bg-tint #bcc4bc`, `border-subtle #b0b7b0`, `border-strong #6b736d`, `text-primary #121714`, `text-soft #2c342f`, `text-muted #434d47`, `brand #2f3a34`, `brand-deep #2f3a34`, `brand-soft #d8ddd8`, `accent-green #1c8449`, `accent-green-hover #0f5a32`, `accent-orange #734105`, `accent-red #8f2a0e`, `on-accent #ffffff`.
- `.surface-dark` tokens: `bg-page #0f3b25`, `bg-base #144a2f`, `bg-elevated #12432b`, `bg-tint #185536`, `border-subtle #2c5e43`, `border-strong #6b9a82`, `text-primary #ffffff`, `text-soft #e2ece5`, `text-muted #a9c2b2`, `brand #ffffff`, `brand-deep #ffffff`, `brand-soft #1d5a3a`, `accent-green #3fb950`, `accent-green-hover #56d364`, `on-accent #0d1117`, `accent-red #ff9b8f`, `accent-orange #f2b877`.
- `.surface-dark` lives in `@layer components` (unlayered CSS would beat utilities such as `bg-transparent`).
- Nav shadow `0 8px 24px -12px rgb(0 0 0 / 0.35)`, radius `rounded-2xl`.
- Font: Rubik only; no `font-mono` anywhere in `components/` or `app/`.
- Every new translation key goes in both `messages/nl.json` and `messages/en.json` (this plan adds none; it removes `theme` from both).
- Keep all existing `data-testid`s and nav link order (`tests/e2e/pages/nav.ts` `NAV_ORDER`).
- No copy changes.

## Review Focus

1. **Sticky nav over light sections** — scrolling from the dark hero into "Waarom" must keep brand, links and NL/EN readable (each sits on its own `bg-base` island). Pinned by the Nav unit test that asserts each island carries the island classes (Task 2).
2. **Mobile menu open over light content** — the panel must have its own surface, not transparent. Pinned by the Nav unit test on `mobile-menu-panel` classes (Task 2).
3. **Long H1 in `PageHeader` at 390px** — "Basic Training (9 & 10 november 2026)" must wrap, not overflow. Checked in Task 7 manual step (mobile viewport).
4. **Pages whose first section used to be light** (success, 404) — must start dark so the floating nav is readable at load. Pinned by success-page and not-found unit tests asserting `surface-dark` on the first region (Task 3).
5. **Form states on light content** (red/orange banners, field errors, input borders) — must stay AA with the darker tokens. Pinned by the token test values (Task 1) and axe in `pnpm test:e2e` (Task 7); banners only render on error, so manual check in Task 7.

---

## File structure

| File | Responsibility | Task |
| --- | --- | --- |
| `app/globals.css` | light tokens, `.surface-dark` band tokens, base styles | 1 |
| `tests/lib/design-tokens.test.ts` (new) | guards token values, layer placement, no `.dark` | 1 |
| `app/[locale]/layout.tsx` | Rubik font; no ThemeProvider | 1, 2 |
| `components/ArticleFilterBar.tsx` | drop `font-mono`, AA active colour | 1 |
| `components/nav-styles.ts` (new) | shared island class strings | 2 |
| `components/Nav.tsx`, `components/MobileMenu.tsx` | floating island nav, no theme toggle | 2 |
| `components/ThemeProvider.tsx`, `components/ThemeToggle.tsx` | deleted | 2 |
| `messages/nl.json`, `messages/en.json` | remove `theme` namespace | 2 |
| `tests/e2e/theme.spec.ts`, `tests/e2e/pages/theme-toggle.ts` | deleted | 2 |
| `components/PageHeader.tsx` (new) | dark header band for subpages | 3 |
| subpages under `app/[locale]/…`, `components/BookPage.tsx` | use `PageHeader` | 3 |
| `components/Hero.tsx`, `app/[locale]/page.tsx`, `components/Footer.tsx`, `components/TestimonialCard.tsx`, `components/ProofStrip.tsx` | homepage rhythm | 4 |
| `app/[locale]/opengraph-image.tsx` + font files | new OG style with Rubik | 5 |
| `DESIGN.md`, `PRODUCT.md`, `CLAUDE.md`, `README.md` | docs | 6 |

---

### Task 1: Tokens, Rubik, filter bar

**Files:**
- Create: `tests/lib/design-tokens.test.ts`
- Modify: `app/globals.css` (whole file)
- Modify: `app/[locale]/layout.tsx:6,12,54`
- Modify: `components/ArticleFilterBar.tsx:46,51`

**Interfaces:**
- Produces: CSS class `.surface-dark` (any element; redefines tokens for its subtree and paints `bg-page`). Token `--color-bg-page` (utility `bg-bg-page`). Font variable `--font-sans-loaded` now Rubik.

- [x] **Step 1: Write the failing test**

`tests/lib/design-tokens.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const css = readFileSync(path.resolve(__dirname, '../../app/globals.css'), 'utf8');

function block(selectorStart: string): string {
  const start = css.indexOf(selectorStart);
  if (start === -1) return '';
  const open = css.indexOf('{', start);
  let depth = 0;
  for (let i = open; i < css.length; i++) {
    if (css[i] === '{') depth++;
    if (css[i] === '}') depth--;
    if (depth === 0) return css.slice(open + 1, i);
  }
  return '';
}

const token = (scope: string, name: string) =>
  new RegExp(`--color-${name}:\\s*([^;]+);`).exec(scope)?.[1].trim();

describe('design tokens (app/globals.css)', () => {
  const theme = block('@theme');
  const components = block('@layer components');
  const band = block('.surface-dark');

  it('defines the muted light palette', () => {
    expect(token(theme, 'bg-page')).toBe('#cdd3cd');
    expect(token(theme, 'bg-base')).toBe('#e1e5e1');
    expect(token(theme, 'text-muted')).toBe('#434d47');
    expect(token(theme, 'brand')).toBe('#2f3a34');
    expect(token(theme, 'border-strong')).toBe('#6b736d');
    expect(token(theme, 'accent-orange')).toBe('#734105');
    expect(token(theme, 'accent-red')).toBe('#8f2a0e');
  });

  it('defines .surface-dark inside @layer components', () => {
    expect(components).toContain('.surface-dark');
    expect(token(band, 'bg-page')).toBe('#0f3b25');
    expect(token(band, 'brand')).toBe('#ffffff');
    expect(token(band, 'accent-green-hover')).toBe('#56d364');
    expect(token(band, 'border-strong')).toBe('#6b9a82');
  });

  it('has no dark theme and no unused accent-blue token', () => {
    expect(css).not.toMatch(/\.dark\b/);
    expect(css).not.toContain('--color-accent-blue');
  });

  it('paints html/body with bg-page', () => {
    expect(block('html,')).toContain('var(--color-bg-page)');
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run (user): `pnpm test tests/lib/design-tokens.test.ts`
Expected: FAIL (`bg-page` undefined, `.surface-dark` missing, `.dark` present).

- [x] **Step 3: Replace `app/globals.css`**

```css
@import 'tailwindcss';

@theme {
  /* surface */
  --color-bg-page: #cdd3cd;
  --color-bg-base: #e1e5e1;
  --color-bg-elevated: #c5cbc4;
  --color-bg-tint: #bcc4bc;

  /* borders */
  --color-border-subtle: #b0b7b0;
  --color-border-strong: #6b736d;

  /* text */
  --color-text-primary: #121714;
  --color-text-soft: #2c342f;
  --color-text-muted: #434d47;

  /* brand + accents */
  --color-brand: #2f3a34;
  --color-brand-deep: #2f3a34;
  --color-brand-soft: #d8ddd8;
  --color-accent-green: #1c8449;
  --color-accent-green-hover: #0f5a32;
  --color-accent-orange: #734105;
  --color-accent-red: #8f2a0e;

  /* foreground for solid accent-green fills (e.g. primary button) */
  --color-on-accent: #ffffff;

  --font-sans: var(--font-sans-loaded), system-ui, -apple-system, sans-serif;
}

:root {
  color-scheme: light;
}

html,
body {
  background-color: var(--color-bg-page);
  color: var(--color-text-primary);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
}

@layer base {
  a {
    color: var(--color-brand);
    text-decoration: none;
  }
  a:hover {
    color: var(--color-brand-deep);
    text-decoration: underline;
    text-underline-offset: 3px;
  }
}

/* Dark-green band. Redefines the tokens for its subtree so components keep
   their utilities. In @layer components so utilities (e.g. bg-transparent) win. */
@layer components {
  .surface-dark {
    --color-bg-page: #0f3b25;
    --color-bg-base: #144a2f;
    --color-bg-elevated: #12432b;
    --color-bg-tint: #185536;
    --color-border-subtle: #2c5e43;
    --color-border-strong: #6b9a82;
    --color-text-primary: #ffffff;
    --color-text-soft: #e2ece5;
    --color-text-muted: #a9c2b2;
    --color-brand: #ffffff;
    --color-brand-deep: #ffffff;
    --color-brand-soft: #1d5a3a;
    --color-accent-green: #3fb950;
    --color-accent-green-hover: #56d364;
    --color-accent-orange: #f2b877;
    --color-accent-red: #ff9b8f;
    /* bright green fills need a dark foreground for AA */
    --color-on-accent: #0d1117;

    background-color: var(--color-bg-page);
    color: var(--color-text-primary);
  }
}

*:focus-visible {
  outline: 2px solid var(--color-brand);
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

- [x] **Step 4: Switch the font to Rubik in `app/[locale]/layout.tsx`**

Line 6: `import { Inter } from 'next/font/google';` → `import { Rubik } from 'next/font/google';`

Line 12:
```tsx
const rubik = Rubik({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-sans-loaded',
  display: 'swap',
});
```

Line 54: `className={inter.variable}` → `className={rubik.variable}` (leave `suppressHydrationWarning` and `ThemeProvider` for Task 2).

- [x] **Step 5: `components/ArticleFilterBar.tsx`**

Line 46: `className="text-text-muted mt-12 mb-12 font-mono text-sm tracking-[0.1em]"` → `className="text-text-muted mt-12 mb-12 text-sm tracking-[0.1em]"`

Line 51: `const className = active ? 'text-accent-green' : 'text-text-muted hover:text-text-primary';` → `const className = active ? 'text-accent-green-hover' : 'text-text-muted hover:text-text-primary';`

- [x] **Step 6: Run tests**

Run (user): `pnpm test tests/lib/design-tokens.test.ts tests/components/ArticleFilterBar.test.tsx`
Expected: PASS (the filter-bar test checks `className` contains `text-accent-green`, which `text-accent-green-hover` satisfies).

- [x] **Step 7: Hand over for commit** — files: `app/globals.css`, `tests/lib/design-tokens.test.ts`, `app/[locale]/layout.tsx`, `components/ArticleFilterBar.tsx`. Suggested message: `feat(design): muted palette, surface-dark band tokens, Rubik`. (README is updated in Task 6; if the user wants to commit per task, README edits for this task move here.)

---

### Task 2: Remove dark theme, floating island nav

**Files:**
- Create: `components/nav-styles.ts`
- Modify: `components/Nav.tsx` (whole file), `components/MobileMenu.tsx` (whole file), `app/[locale]/layout.tsx:10,54,56,68`, `messages/nl.json`, `messages/en.json`
- Modify: `tests/components/nav.test.tsx` (add tests)
- Delete (user runs): `components/ThemeProvider.tsx`, `components/ThemeToggle.tsx`, `tests/e2e/theme.spec.ts`, `tests/e2e/pages/theme-toggle.ts`
- Dependency (user runs): remove `next-themes`

**Interfaces:**
- Consumes: `.surface-dark` (Task 1).
- Produces: `ISLAND`, `ISLAND_SM`, `ISLAND_MOBILE` string constants from `components/nav-styles.ts`.

- [x] **Step 1: Write the failing tests** — append to `tests/components/nav.test.tsx` inside `describe('<Nav />', …)`:

```tsx
  it('does not render a theme toggle', async () => {
    const ui = await Nav({ locale: 'en' });
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        {ui}
      </NextIntlClientProvider>,
    );
    expect(screen.queryByTestId('theme-toggle')).not.toBeInTheDocument();
  });

  it('floats in a dark band and gives brand and language switch their own surface', async () => {
    const ui = await Nav({ locale: 'en' });
    const { container } = render(
      <NextIntlClientProvider locale="en" messages={en}>
        {ui}
      </NextIntlClientProvider>,
    );
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper).toHaveClass('surface-dark', 'sticky', 'top-0', 'h-0', 'bg-transparent');
    expect(screen.getByTestId('nav-brand')).toHaveClass('sm:bg-bg-base/80', 'sm:rounded-2xl');
    expect(screen.getByTestId('nav-links')).toHaveClass('bg-bg-base/80', 'rounded-2xl');
    expect(screen.getByTestId('nav-lang')).toHaveClass('bg-bg-base/80', 'rounded-2xl');
  });

  it('opens the mobile panel on its own surface', async () => {
    const ui = await Nav({ locale: 'en' });
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        {ui}
      </NextIntlClientProvider>,
    );
    fireEvent.click(screen.getByTestId('mobile-menu-toggle'));
    expect(screen.getByTestId('mobile-menu-panel')).toHaveClass('bg-bg-base/80', 'rounded-2xl');
  });
```

- [x] **Step 2: Run tests to verify they fail**

Run (user): `pnpm test tests/components/nav.test.tsx`
Expected: the three new tests FAIL (`theme-toggle` found; no `surface-dark` wrapper; no `nav-links`/`nav-lang`).

- [x] **Step 3: Create `components/nav-styles.ts`**

```ts
// Shared surface for the floating nav. Full class strings (not built at runtime)
// so Tailwind's source scanner picks them up.
const SHADOW = 'shadow-[0_8px_24px_-12px_rgb(0_0_0/0.35)]';

/** Island surface at every breakpoint (links pill, lang switch, mobile panel). */
export const ISLAND = `rounded-2xl border border-border-subtle bg-bg-base/80 backdrop-blur ${SHADOW}`;

/** Island surface from `sm` up only (brand: inside the mobile bar below `sm`). */
export const ISLAND_SM =
  'sm:rounded-2xl sm:border sm:border-border-subtle sm:bg-bg-base/80 sm:backdrop-blur sm:shadow-[0_8px_24px_-12px_rgb(0_0_0/0.35)]';

/** Island surface below `sm` only (the full-width mobile bar). */
export const ISLAND_MOBILE =
  'max-sm:rounded-2xl max-sm:border max-sm:border-border-subtle max-sm:bg-bg-base/80 max-sm:backdrop-blur max-sm:shadow-[0_8px_24px_-12px_rgb(0_0_0/0.35)]';
```

Note: Tailwind scans source text, so every class must appear literally. `SHADOW` holds the literal `shadow-[…]`; the `sm:`/`max-sm:` variants are written out in full.

- [x] **Step 4: Replace `components/Nav.tsx`**

```tsx
import Image from 'next/image';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { LangSwitcher } from './LangSwitcher';
import { MobileMenu } from './MobileMenu';
import { ISLAND, ISLAND_MOBILE, ISLAND_SM } from './nav-styles';
import type { Locale } from '@/i18n/routing';

const LINK =
  'text-text-soft hover:text-brand hover:bg-bg-tint rounded-xl px-3.5 py-2 font-medium transition-colors hover:no-underline';

export async function Nav({ locale }: { locale: Locale }) {
  const t = await getTranslations('nav');
  return (
    // h-0: floats over the first section and takes no height. Every page starts
    // with a dark band (Hero / PageHeader) with enough top padding for it.
    <div className="surface-dark sticky top-0 z-20 h-0 bg-transparent">
      <nav
        className={`${ISLAND_MOBILE} relative mx-3 mt-3 grid grid-cols-[1fr_auto] items-center gap-4 px-3 py-1.5 sm:mx-auto sm:mt-3.5 sm:max-w-6xl sm:grid-cols-[1fr_auto_1fr] sm:px-6 sm:py-0`}
      >
        <Link
          href={`/${locale}`}
          data-testid="nav-brand"
          className={`${ISLAND_SM} text-text-primary inline-flex shrink-0 items-center gap-2 justify-self-start text-base font-bold hover:no-underline sm:px-4 sm:py-2`}
        >
          <Image src="/brand-icon.svg" alt="" width={28} height={28} aria-hidden />
          {t('brand')}
        </Link>
        <div
          data-testid="nav-links"
          className={`${ISLAND} hidden items-center gap-1 p-1.5 text-sm sm:flex`}
        >
          <Link href={`/${locale}/articles`} data-testid="nav-articles" className={LINK}>
            {t('articles')}
          </Link>
          <Link href={`/${locale}/trainings`} data-testid="nav-trainings" className={LINK}>
            {t('trainings')}
          </Link>
          <Link href={`/${locale}/about`} data-testid="nav-about" className={LINK}>
            {t('about')}
          </Link>
          <Link href={`/${locale}/faq`} data-testid="nav-faq" className={LINK}>
            {t('faq')}
          </Link>
          <Link href={`/${locale}/contact`} data-testid="nav-contact" className={LINK}>
            {t('contact')}
          </Link>
        </div>
        <div
          data-testid="nav-lang"
          className={`${ISLAND} hidden items-center justify-self-end px-4 py-2.5 sm:inline-flex`}
        >
          <LangSwitcher currentLocale={locale} />
        </div>
        <MobileMenu locale={locale} />
      </nav>
    </div>
  );
}
```

- [x] **Step 5: Replace `components/MobileMenu.tsx`**

```tsx
'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useEffect, useId, useRef, useState } from 'react';
import type { Locale } from '@/i18n/routing';
import { LangSwitcher } from './LangSwitcher';
import { ISLAND } from './nav-styles';

export function MobileMenu({ locale }: { locale: Locale }) {
  const t = useTranslations('nav');
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const linkClass = 'text-text-soft hover:text-brand';

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? t('closeMenu') : t('openMenu')}
        onClick={() => setOpen((v) => !v)}
        data-testid="mobile-menu-toggle"
        className="text-text-soft hover:text-brand inline-flex h-8 w-8 items-center justify-center sm:hidden"
      >
        {open ? (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        ) : (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden
          >
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        )}
      </button>
      {open && (
        <div
          id={panelId}
          data-testid="mobile-menu-panel"
          className={`${ISLAND} absolute inset-x-0 top-full mt-2 sm:hidden`}
        >
          <div className="flex flex-col gap-4 px-4 py-4 text-sm font-medium">
            <Link
              href={`/${locale}/articles`}
              onClick={() => setOpen(false)}
              data-testid="mobile-menu-articles"
              className={linkClass}
            >
              {t('articles')}
            </Link>
            <Link
              href={`/${locale}/trainings`}
              onClick={() => setOpen(false)}
              data-testid="mobile-menu-trainings"
              className={linkClass}
            >
              {t('trainings')}
            </Link>
            <Link
              href={`/${locale}/about`}
              onClick={() => setOpen(false)}
              data-testid="mobile-menu-about"
              className={linkClass}
            >
              {t('about')}
            </Link>
            <Link
              href={`/${locale}/faq`}
              onClick={() => setOpen(false)}
              data-testid="mobile-menu-faq"
              className={linkClass}
            >
              {t('faq')}
            </Link>
            <Link
              href={`/${locale}/contact`}
              onClick={() => setOpen(false)}
              data-testid="mobile-menu-contact"
              className={linkClass}
            >
              {t('contact')}
            </Link>
            <div className="border-border-subtle border-t pt-3">
              <LangSwitcher currentLocale={locale} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
```

- [x] **Step 6: `app/[locale]/layout.tsx`** — remove line 10 (`import { ThemeProvider } …`); line 54 `<html lang={locale} className={rubik.variable} suppressHydrationWarning>` → `<html lang={locale} className={rubik.variable}>`; remove the `<ThemeProvider>` opening (line 56) and closing (line 68) tags, keeping their children unchanged.

- [x] **Step 7: Remove the `theme` namespace** from `messages/nl.json` (`"theme": { "label": "Thema", "light": "Licht", "dark": "Donker", "system": "Systeem" }`) and `messages/en.json` (`"theme": { "label": "Theme", "light": "Light", "dark": "Dark", "system": "System" }`), including the trailing/leading comma so the JSON stays valid.

- [x] **Step 8: Deletions and dependency (user runs)**

```bash
git rm components/ThemeProvider.tsx components/ThemeToggle.tsx tests/e2e/theme.spec.ts tests/e2e/pages/theme-toggle.ts
pnpm remove next-themes
```
`git rm` removes the files and stages the deletion; `pnpm remove` drops `next-themes` from `package.json` and `pnpm-lock.yaml`.

- [x] **Step 9: Run tests**

Run (user): `pnpm test tests/components/nav.test.tsx tests/i18n-integrity.test.ts && pnpm verify:i18n && pnpm typecheck`
Expected: PASS; typecheck finds no imports of `ThemeToggle`/`ThemeProvider`/`next-themes`.

- [x] **Step 10: Hand over for commit** — `feat(nav): floating island nav, remove dark theme`.

---

### Task 3: `PageHeader` and subpages

**Files:**
- Create: `components/PageHeader.tsx`, `tests/components/PageHeader.test.tsx`, `tests/app/booking-success-page.test.tsx`, `tests/app/not-found.test.tsx`
- Modify: `app/[locale]/trainings/page.tsx:21-28`, `app/[locale]/trainings/[trainingId]/page.tsx:36-42`, `components/BookPage.tsx:30-58`, `app/[locale]/about/page.tsx:14-25`, `app/[locale]/contact/page.tsx:19-29`, `app/[locale]/faq/page.tsx:16-51`, `app/[locale]/impressum/page.tsx:12-24`, `app/[locale]/articles/page.tsx:34-55`, `app/[locale]/trainings/{basic-nov-26,pilot,discount-aug-26}/book/success/page.tsx:21-33`, `app/[locale]/not-found.tsx:5`

**Interfaces:**
- Consumes: `.surface-dark` (Task 1).
- Produces:
  ```ts
  export function PageHeader(props: {
    title: ReactNode;
    intro?: ReactNode;
    children?: ReactNode;
    width?: 'max-w-2xl' | 'max-w-3xl' | 'max-w-4xl'; // default 'max-w-4xl'
  }): JSX.Element
  ```
  Renders `<header data-testid="page-header" class="surface-dark …">` with one `<h1>`.

- [x] **Step 1: Write the failing tests**

`tests/components/PageHeader.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PageHeader } from '@/components/PageHeader';

describe('<PageHeader />', () => {
  it('renders the title as the only h1 inside a dark band', () => {
    render(<PageHeader title="Over ons" />);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Over ons');
    expect(screen.getByTestId('page-header')).toHaveClass('surface-dark');
  });

  it('leaves room for the floating nav', () => {
    render(<PageHeader title="x" />);
    expect(screen.getByTestId('page-header')).toHaveClass('pt-36');
  });

  it('renders intro and children when given', () => {
    render(
      <PageHeader title="x" intro="Intro tekst">
        <span>badge</span>
      </PageHeader>,
    );
    expect(screen.getByText('Intro tekst')).toBeInTheDocument();
    expect(screen.getByText('badge')).toBeInTheDocument();
  });

  it('omits the intro paragraph when not given', () => {
    const { container } = render(<PageHeader title="x" />);
    expect(container.querySelector('p')).toBeNull();
  });

  it('applies the requested content width', () => {
    const { container } = render(<PageHeader title="x" width="max-w-2xl" />);
    expect(container.querySelector('.max-w-2xl')).not.toBeNull();
  });
});
```

`tests/app/booking-success-page.test.tsx` (same `next-intl/server` mock pattern as `tests/app/booking-page-guard.test.tsx`):

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import en from '@/messages/en.json';

vi.mock('next-intl/server', () => ({
  setRequestLocale: vi.fn(),
  getTranslations: async (ns: string) => {
    const root = en as unknown as Record<string, unknown>;
    const branch = (ns ? (root[ns] as Record<string, unknown>) : root) ?? {};
    return (key: string, values?: Record<string, string>) => {
      let cur: unknown = branch;
      for (const seg of key.split('.')) {
        if (cur && typeof cur === 'object') cur = (cur as Record<string, unknown>)[seg];
        else return key;
      }
      if (typeof cur !== 'string') return key;
      return cur.replace(/\{(\w+)\}/g, (_, k: string) => values?.[k] ?? '');
    };
  },
}));

import BasicNov26BookingSuccessPage from '@/app/[locale]/trainings/basic-nov-26/book/success/page';

describe('booking success page', () => {
  it('starts with a dark header carrying the success title as h1', async () => {
    const ui = await BasicNov26BookingSuccessPage({
      params: Promise.resolve({ locale: 'en' as const }),
    });
    render(ui);
    expect(screen.getByTestId('page-header')).toHaveClass('surface-dark');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(en.booking.success.title);
    expect(screen.getByTestId('booking-success')).not.toContainElement(
      screen.getByRole('heading', { level: 1 }),
    );
  });
});
```

`tests/app/not-found.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import NotFound from '@/app/[locale]/not-found';

describe('404 page', () => {
  it('is a single dark band', () => {
    render(<NotFound />);
    expect(screen.getByRole('main')).toHaveClass('surface-dark');
  });
});
```

- [x] **Step 2: Run tests to verify they fail**

Run (user): `pnpm test tests/components/PageHeader.test.tsx tests/app/booking-success-page.test.tsx tests/app/not-found.test.tsx`
Expected: FAIL (`PageHeader` module not found; no `page-header`; `main` lacks `surface-dark`).

- [x] **Step 3: Create `components/PageHeader.tsx`**

```tsx
import type { ReactNode } from 'react';

type Width = 'max-w-2xl' | 'max-w-3xl' | 'max-w-4xl';

// Dark header band for subpages. pt-36 leaves room for the floating nav (Nav.tsx, h-0).
export function PageHeader({
  title,
  intro,
  children,
  width = 'max-w-4xl',
}: {
  title: ReactNode;
  intro?: ReactNode;
  children?: ReactNode;
  width?: Width;
}) {
  return (
    <header
      data-testid="page-header"
      className="surface-dark border-border-subtle border-b px-6 pt-36 pb-14"
    >
      <div className={`mx-auto ${width}`}>
        <h1 className="text-brand-deep text-3xl font-bold break-words sm:text-4xl">{title}</h1>
        {intro && <p className="text-text-soft mt-3 text-lg">{intro}</p>}
        {children}
      </div>
    </header>
  );
}
```

- [x] **Step 4: Use `PageHeader` on every subpage**

Each page gets `import { PageHeader } from '@/components/PageHeader';`. Pattern: the old `<main className="px-6 py-16 sm:py-20"><div className="mx-auto max-w-X"><h1 …>{title}</h1>[intro]…content…</div></main>` becomes:

```tsx
<main>
  <PageHeader title={…} intro={…} width="max-w-X" />
  <div className="px-6 py-16 sm:py-20">
    <div className="mx-auto max-w-X">…content…</div>
  </div>
</main>
```

Per file:

`app/[locale]/trainings/page.tsx` (return block):
```tsx
    <main>
      <PageHeader title={t('sectionTitle')} />
      <div className="px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl">
          {DISPLAYED_TRAININGS.map((id) => (
            <TrainingCard key={id} trainingId={id} locale={locale} />
          ))}
        </div>
      </div>
    </main>
```

`app/[locale]/trainings/[trainingId]/page.tsx` (return block):
```tsx
    <main>
      <PageHeader title={t('sectionTitle')} />
      <div className="px-6">
        <div className="mx-auto max-w-4xl">
          <TrainingDetail trainingId={trainingId} locale={locale} />
        </div>
      </div>
    </main>
```
(`TrainingDetail` is itself a `py-20` section, so the wrapper has no vertical padding.)

`components/BookPage.tsx` (return block):
```tsx
    <main>
      <PageHeader
        title={isSoldOut ? t('soldOutHeading') : t('title', { trainingName })}
        intro={isSoldOut ? t('soldOutBody') : t('intro', { trainingName })}
        width="max-w-2xl"
      >
        {!isSoldOut && (trainings[trainingId].schedule?.courseMode?.length ?? 0) > 0 && (
          <div className="mt-4">
            <DeliveryModeBadge courseMode={trainings[trainingId].schedule?.courseMode} />
          </div>
        )}
      </PageHeader>
      <div className="px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl">
          {isSoldOut ? (
            <Link href={`/${locale}/trainings`} className="text-brand inline-block underline">
              {t('soldOutBack')}
            </Link>
          ) : (
            <BookingForm locale={locale} trainingId={trainingId} />
          )}
        </div>
      </div>
    </main>
```

`app/[locale]/about/page.tsx` (return block):
```tsx
    <main>
      <PageHeader title={t('title')} intro={t('intro')} width="max-w-3xl" />
      <div className="px-6 py-16 sm:py-20">
        <div className="mx-auto grid max-w-3xl gap-6 md:grid-cols-2">
          {instructors.map((i) => (
            <InstructorCard key={i.id} id={i.id} />
          ))}
        </div>
      </div>
    </main>
```

`app/[locale]/contact/page.tsx` (return block):
```tsx
    <main>
      <PageHeader title={t('title')} intro={t('intro')} width="max-w-2xl" />
      <div className="px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl">
          <ContactForm defaultTraining={training === 'advanced' ? 'advanced' : 'basic'} />
        </div>
      </div>
    </main>
```

`app/[locale]/faq/page.tsx` (return block; also the inline link is now always underlined, WCAG 1.4.1):
```tsx
    <main>
      <JsonLd data={buildFaqJsonLd(items)} />
      <PageHeader title={t('title')} intro={t('intro')} width="max-w-3xl" />
      <div className="px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="divide-border-subtle border-border-subtle divide-y border-y">
            {items.map((item) => (
              <details key={item.question} className="group py-4">
                <summary className="text-text-primary flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                  {item.question}
                  <span
                    aria-hidden
                    className="text-text-muted transition-transform group-open:rotate-90"
                  >
                    ›
                  </span>
                </summary>
                <p className="text-text-soft mt-3 text-sm leading-relaxed">{item.answer}</p>
              </details>
            ))}
          </div>
          <p className="text-text-soft mt-10">
            {t('ctaLabel')}{' '}
            <Link
              href={`/${locale}/contact`}
              data-testid="faq-contact-link"
              className="text-brand font-medium underline"
            >
              {t('ctaLink')}
            </Link>
          </p>
        </div>
      </div>
    </main>
```

`app/[locale]/impressum/page.tsx` (return block):
```tsx
    <main>
      <PageHeader title={t('title')} width="max-w-2xl" />
      <div className="px-6 py-16 sm:py-20">
        <dl className="mx-auto max-w-2xl space-y-3">
          <Row label="Business" value={t('businessName')} />
          <Row label="Address" value={t('address')} />
          <Row label="KVK" value={t('kvk')} />
          <Row label="VAT" value={t('vat')} />
          <Row label="Email" value={t('email')} />
        </dl>
      </div>
    </main>
```

`app/[locale]/articles/page.tsx` (return block; the intro stays inside the h1 because `tests/e2e/pages/articles-page.ts:36` looks it up there):
```tsx
    <main>
      <PageHeader
        title={
          <>
            {t('title')}{' '}
            <span className="text-text-soft text-xl font-normal sm:text-2xl">{t('intro')}</span>
          </>
        }
      />
      <div className="px-6 pb-16 sm:pb-20">
        <div className="mx-auto max-w-4xl">
          <ArticleFilterBar currentType={currentType} locale={locale} showBlogs={showBlogs} />
          {visible.length === 0 ? (
            <p className="text-text-muted mt-12 text-sm">{t('emptyState')}</p>
          ) : (
            <ol className="border-border-subtle mt-12 ml-3 border-l pl-6">
              {visible.map((article) => (
                <TimelineEntryRow key={article.slug} article={article} locale={locale} />
              ))}
            </ol>
          )}
        </div>
      </div>
    </main>
```
(`ArticleFilterBar` already has `mt-12`; `pb-*` only avoids doubling the top gap. When blogs are off the filter bar renders `null` and the timeline's own `mt-12` provides the gap.)

Success pages — apply to all three (`basic-nov-26`, `pilot`, `discount-aug-26`), return block:
```tsx
    <main>
      <PageHeader title={t('success.title')} width="max-w-2xl" />
      <div className="px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl">
          <div
            className="border-accent-green/30 bg-accent-green/10 rounded-md border p-6"
            data-testid="booking-success"
          >
            <p className="text-text-soft text-lg">{t('success.body', { date })}</p>
          </div>
        </div>
      </div>
    </main>
```

`app/[locale]/not-found.tsx` line 5:
`<main className="flex min-h-screen items-center justify-center px-6 py-24 text-center">` → `<main className="surface-dark flex min-h-screen items-center justify-center px-6 py-24 text-center">`

- [x] **Step 5: Run tests**

Run (user): `pnpm test tests/components/PageHeader.test.tsx tests/app`
Expected: PASS, including existing `trainings-page`, `training-details-page`, `faq-page`, `articles-page`, `booking-page`, `booking-page-guard` tests.

- [x] **Step 6: Hand over for commit** — `feat(layout): PageHeader dark band on all subpages`.

---

### Task 4: Homepage rhythm, Hero, Footer, TestimonialCard

**Files:**
- Modify: `components/Hero.tsx:26,32`, `app/[locale]/page.tsx:3,57,63,82,104-124`, `components/Footer.tsx:9`, `components/TestimonialCard.tsx:21-27`
- Test: `tests/components/TestimonialCard.test.tsx`, `tests/components/Footer.test.tsx`, create `tests/components/Hero.test.tsx`

**Interfaces:**
- Consumes: `.surface-dark` (Task 1), `Button` (existing, `components/Button.tsx`).

- [x] **Step 1: Write the failing tests**

Append to `tests/components/TestimonialCard.test.tsx`:
```tsx
  it('has no side stripe, no carrier glyph and no monospace', () => {
    const { container } = renderCard(
      { quoteNL: 'Goede training', quoteEN: 'Great training', name: 'Jane Doe', role: 'Lead, Acme' },
      'nl',
    );
    const article = container.querySelector('article') as HTMLElement;
    expect(article.className).not.toMatch(/border-l-4/);
    expect(container.querySelector('.font-mono')).toBeNull();
    expect(container.querySelector('cite')).not.toHaveTextContent(/^\+/);
  });
```

Append to `tests/components/Footer.test.tsx`:
```tsx
  it('is a dark band', async () => {
    const ui = await Footer({ locale: 'en' });
    const { container } = render(ui);
    expect(container.querySelector('footer')).toHaveClass('surface-dark');
  });
```

`tests/components/Hero.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Hero } from '@/components/Hero';

describe('<Hero />', () => {
  it('is a dark band whose dot grid follows the tokens', () => {
    const { container } = render(
      <Hero kicker="K" title="T" subtitle="S" primaryCta={{ label: 'Go', href: '/nl/trainings' }} />,
    );
    expect(container.querySelector('section')).toHaveClass('surface-dark');
    const dots = container.querySelector('[aria-hidden]') as HTMLElement;
    expect(dots.style.backgroundImage).toContain('var(--color-text-primary)');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('T');
  });
});
```

- [x] **Step 2: Run tests to verify they fail**

Run (user): `pnpm test tests/components/TestimonialCard.test.tsx tests/components/Footer.test.tsx tests/components/Hero.test.tsx`
Expected: FAIL (`border-l-4`, `font-mono`, `+ ` present; no `surface-dark`; hardcoded rgba).

Note: jsdom may drop a `backgroundImage` value it cannot parse (`color-mix`). If the Hero dot-grid assertion fails only for that reason after Step 3, replace it with a check on the raw attribute: `expect(dots.getAttribute('style')).toContain('--color-text-primary')`.

- [x] **Step 3: `components/Hero.tsx`**

Line 26: `className="border-border-subtle relative overflow-hidden border-b px-6 py-24 sm:py-28 lg:py-32"` → `className="surface-dark border-border-subtle relative overflow-hidden border-b px-6 py-24 sm:py-28 lg:py-32"`

Lines 31-32:
```tsx
          backgroundImage:
            'radial-gradient(circle, color-mix(in srgb, var(--color-text-primary) 8%, transparent) 1px, transparent 1.4px)',
```

- [x] **Step 4: `app/[locale]/page.tsx`**

Add import after line 3: `import { Button } from '@/components/Button';`

Line 57 (why callout): `className="border-brand bg-bg-tint mt-8 rounded-md border-l-4 px-5 py-4"` → `className="border-border-subtle bg-bg-tint mt-8 rounded-2xl border px-5 py-4"`

Line 63 (trainings section, keep `id="trainings"`): `className="border-border-subtle border-b px-6 py-20"` → `className="surface-dark border-border-subtle border-b px-6 py-20"`

Line 82 (instructors section, the `<section>` whose H2 is `tHome('instructorsTitle')`): `className="border-border-subtle border-b px-6 py-20"` → `className="surface-dark border-border-subtle border-b px-6 py-20"`

Lines 104-124 (final CTA `<section>` through its closing `</section>`) replaced by:
```tsx
      <section className="border-border-subtle border-b px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-brand max-w-[24ch] text-2xl font-bold sm:text-3xl">
            {tHome('finalCta.title')}
          </h2>
          <p className="text-text-soft mt-3 max-w-[56ch]">{tHome('finalCta.body')}</p>
          <Button href={`/${locale}/contact`} className="mt-7">
            {tHome('finalCta.cta')}
          </Button>
        </div>
      </section>
```

- [x] **Step 5: `components/Footer.tsx`** line 9: `<footer className="border-border-subtle bg-bg-elevated border-t">` → `<footer className="surface-dark border-border-subtle border-t">`

- [x] **Step 6: `components/TestimonialCard.tsx`** lines 21-27:
```tsx
    <article className="border-border-subtle bg-bg-elevated flex h-full flex-col justify-between rounded-2xl border p-8">
      <blockquote className="text-text-primary text-lg leading-relaxed">{quote}</blockquote>
      <cite className="mt-6 text-sm not-italic">
        <span className="text-text-primary block font-semibold">{name}</span>
        <span className="text-text-muted block">{role}</span>
        {isTranslated && <span className="text-text-muted mt-1 block">{t(translatedFromKey)}</span>}
      </cite>
```

- [x] **Step 7: Run tests**

Run (user): `pnpm test tests/components`
Expected: PASS (existing TestimonialCard tests still find `Jane Doe` inside `cite`).

- [x] **Step 8: Hand over for commit** — `feat(home): alternating dark/light blocks, token-based final CTA`.

---

### Task 5: Open Graph image with Rubik

**Files:**
- Modify: `app/[locale]/opengraph-image.tsx` (whole file)
- Create: font files (location decided in Step 1)

- [x] **Step 1: Resolve the three open questions (ask Chef before any fetch)**

Ask permission, then read:
1. Satori README (`https://github.com/vercel/satori`, section "Fonts"): does it accept variable fonts; which formats (ttf/otf/woff).
2. Next.js `ImageResponse` docs (`https://nextjs.org/docs/app/api-reference/functions/image-response`) and the `opengraph-image` docs: current recommended way to load a local font under `runtime = 'edge'` vs Node.
3. Source of static Rubik 400/600/700 files: `@fontsource/rubik` (per-weight `.woff` in `files/`) or `github.com/googlefonts/rubik`.

Report findings to Chef and pick the loading approach. The code in Step 3 assumes three static `.woff` files in `app/[locale]/fonts/` loaded with `fetch(new URL(…, import.meta.url))` under the edge runtime; adjust only the three `fetch` lines and the file names if the docs say otherwise.

- [x] **Step 2: Add the font files (user runs)**

Example if `@fontsource/rubik` is chosen (exact file names to confirm in Step 1):
```bash
mkdir -p "app/[locale]/fonts"
curl -L -o "app/[locale]/fonts/rubik-latin-400-normal.woff" "https://cdn.jsdelivr.net/npm/@fontsource/rubik/files/rubik-latin-400-normal.woff"
curl -L -o "app/[locale]/fonts/rubik-latin-600-normal.woff" "https://cdn.jsdelivr.net/npm/@fontsource/rubik/files/rubik-latin-600-normal.woff"
curl -L -o "app/[locale]/fonts/rubik-latin-700-normal.woff" "https://cdn.jsdelivr.net/npm/@fontsource/rubik/files/rubik-latin-700-normal.woff"
```

- [x] **Step 3: Replace `app/[locale]/opengraph-image.tsx`**

```tsx
import { ImageResponse } from 'next/og';
import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';

export const runtime = 'edge';
export const alt = 'agenticengineering.nl — agentic engineering trainings';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const font = (file: string) =>
  fetch(new URL(`./fonts/${file}`, import.meta.url)).then((res) => res.arrayBuffer());

export default async function Image({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'hero' });
  const [regular, semibold, bold] = await Promise.all([
    font('rubik-latin-400-normal.woff'),
    font('rubik-latin-600-normal.woff'),
    font('rubik-latin-700-normal.woff'),
  ]);

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: '#0f3b25',
        color: '#ffffff',
        padding: '80px',
        fontFamily: 'Rubik',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <svg width="64" height="64" viewBox="0 0 1080 1080">
          <g
            fill="none"
            stroke="#3fb950"
            strokeWidth="108"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M 260 820 L 540 250 L 820 820" />
            <path d="M 380 605 L 700 605" />
          </g>
          <circle cx="540" cy="465" r="40" fill="#3fb950" />
        </svg>
        <span style={{ fontSize: 36, fontWeight: 600, color: '#e2ece5' }}>agentic·engineering</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div
          style={{
            display: 'flex',
            fontSize: 84,
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
          }}
        >
          {t('title')}
        </div>
        <span style={{ fontSize: 32, fontWeight: 400, color: '#a9c2b2' }}>{t('subtitle')}</span>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: 'Rubik', data: regular, weight: 400, style: 'normal' },
        { name: 'Rubik', data: semibold, weight: 600, style: 'normal' },
        { name: 'Rubik', data: bold, weight: 700, style: 'normal' },
      ],
    },
  );
}
```

Note: the `alt` string contains an em dash; that is existing copy (out of scope).

- [x] **Step 4: Verify (user runs)**

Run: `pnpm build && pnpm start`, then open `http://localhost:3000/nl/opengraph-image` and `http://localhost:3000/en/opengraph-image`.
Expected: PNG 1200×630, green `#0f3b25`, Rubik (rounded letterforms, visibly different from the Noto Sans default), no `>` glyph, EN title wraps within the frame.

- [x] **Step 5: Hand over for commit** — `feat(og): Rubik on green band OG image` (include the font files).

---

### Task 6: Documentation

**Files:**
- Modify: `DESIGN.md` (frontmatter + sections 1-6), `PRODUCT.md:19,34`, `CLAUDE.md:3,35`, `README.md:3,110-113,445,460`

- [x] **Step 1: `DESIGN.md` frontmatter** — replace `description` and the `colors`, `typography.*.fontFamily` values and nav/button component entries:

```yaml
description: Muted green-grey marketing site with alternating dark-green bands for two Claude Code trainings, NL/EN.
colors:
  bg-page: '#cdd3cd'
  bg-base: '#e1e5e1'
  bg-elevated: '#c5cbc4'
  bg-tint: '#bcc4bc'
  border-subtle: '#b0b7b0'
  border-strong: '#6b736d'
  text-primary: '#121714'
  text-soft: '#2c342f'
  text-muted: '#434d47'
  brand: '#2f3a34'
  brand-deep: '#2f3a34'
  brand-soft: '#d8ddd8'
  accent-green: '#1c8449'
  accent-green-hover: '#0f5a32'
  accent-orange: '#734105'
  accent-red: '#8f2a0e'
  band-page: '#0f3b25'
  band-base: '#144a2f'
  band-text: '#ffffff'
  band-accent-green: '#3fb950'
```
Every `fontFamily: 'Inter, system-ui, -apple-system, sans-serif'` → `fontFamily: 'Rubik, system-ui, -apple-system, sans-serif'`. `components.nav`: `backgroundColor: '{colors.bg-base}'`, add `rounded: '16px'`, `shadow: '0 8px 24px -12px rgb(0 0 0 / 0.35)'`.

- [x] **Step 2: `DESIGN.md` body** — replace sections 1-6 with:

```markdown
## 1. Overview

A calm marketing site for agentic-engineering trainings. The page surface is a muted green-grey (`#cdd3cd`); dark-green bands (`#0f3b25`) alternate with light sections to structure the page. Headings are antraciet, action is green.

**Color strategy: Restrained, two surfaces.** Light sections use the `@theme` tokens. Dark bands use `.surface-dark`, which redefines the same tokens (white text, light green action). Components never pick band colours themselves; placement decides.

**Theme: One theme.** No dark mode, no toggle.

**Density.** Section padding `py-16`–`py-24`; body prose `max-w-2xl`.

## 2. Colors

See frontmatter. Light tokens live in `@theme` (`app/globals.css`); band tokens in `.surface-dark` inside `@layer components`. All text/UI pairs used in code meet WCAG 2.1 AA. `border-strong` on `bg-tint` is 2.74: never place inputs or secondary buttons on `bg-tint`.

## 3. Typography

Rubik for everything (variable, `next/font/google`). Hierarchy by weight (400/600/700) and size ≥ 1.25×. Headings and links use `brand` (antraciet in light sections, white in bands). Links inside running text are always underlined (WCAG 1.4.1).

## 4. Elevation

Flat surfaces separated by 1px `border-subtle`. Exception: the floating nav islands use `0 8px 24px -12px rgb(0 0 0 / 0.35)`. Primary CTA keeps `shadow-sm`.

## 5. Components

- **Nav:** sticky, zero-height, floats over the first section. Three `rounded-2xl` islands on `bg-base/80` + blur: brand (left), links (centre), language switch (right). Mobile: one full-width bar with brand + menu button; the panel is its own island.
- **Surfaces per page:** homepage Hero dark → Why light → Trainings dark → (Testimonials light) → ProofStrip light (`bg-elevated`) → Instructors dark → Final CTA light → Footer dark. Subpages: `PageHeader` (dark, `pt-36`) → content light → Footer dark. 404 is fully dark.
- **Callouts / testimonial cards:** full 1px border, tinted fill, `rounded-2xl`. No side stripes.
- **Forms:** inputs `bg-base`, `border-strong`, focus ring `brand`. Errors `accent-red`, banners `accent-*/10` fill + `/30` border.

## 6. Do's and Don'ts

### Do
- Put a section in a band with `.surface-dark`; don't hand-pick band colours.
- Keep body text at `max-w-2xl`.
- Underline inline links.
- Keep CTAs short and direct.

### Don't
- No monospace, no `>`, `$`, `//`, `›`, `+` carrier glyphs in new UI.
- No side-stripe borders.
- No gradients (the old nav strip and final-CTA gradient are gone).
- No new colours without checking an existing role; measure contrast before adding one.
- Don't animate layout; respect `prefers-reduced-motion`.
- Don't use em dashes in new copy.
```

- [x] **Step 3: `PRODUCT.md`**

Line 19, sentence `Visual register is friendly-formal: white surface, blue brand-deep headlines, green action color.` → `Visual register is friendly-formal: muted green-grey surface with dark-green bands, antraciet headlines, green action color.`

Line 34 → `3. **Restraint with one signal.** Action green (\`#1c8449\`, \`#3fb950\` in dark bands) is reserved for primary CTAs and success states; headings and links are antraciet (\`#2f3a34\`, white in bands). Surfaces are muted green-grey with dark-green bands. Everywhere else is neutral.`

- [x] **Step 4: `CLAUDE.md`**

Line 3: `… deployed on Vercel. Dark terminal-native aesthetic.` → `… deployed on Vercel. Muted green-grey surface with dark-green bands, Rubik.`

Line 35 (Conventions bullet): `(OKLCH palette, JetBrains Mono display / Inter body)` → `(muted palette + \`.surface-dark\` bands, Rubik)`.

- [x] **Step 5: `README.md`**

> Done — README.md already updated in this change. The lines below record what was changed, not open work.

Line 3: `dark terminal-native aesthetic` → `muted green-grey design with dark-green bands`.

Lines 110-113 components list: add `PageHeader` after `Nav, Footer,`.

After line 109 (`globals.css …`) keep the line and append ` + .surface-dark band tokens` to its comment.

Line 445: remove `` `theme`, `` from the namespace list.

Line 460: `colors (OKLCH dark palette), typography (JetBrains Mono display, Inter body)` → `colors (muted palette + \`.surface-dark\` bands), typography (Rubik)`.

- [x] **Step 6: Run** (user): `pnpm format && pnpm lint`
Expected: no errors.

- [x] **Step 7: Hand over for commit** — docs belong in the same commit as the code they describe if the user squashes; otherwise include README changes with each code commit so `readme-check` passes.

---

### Task 7: Full verification

- [x] **Step 1** (user): `pnpm typecheck && pnpm lint && pnpm test && pnpm verify:i18n && pnpm build`
Expected: all pass.

- [x] **Step 2** (user): `pnpm test:e2e`
Expected: pass, including `a11y.spec.ts` (axe) and `nav.spec.ts`. `theme.spec.ts` no longer exists.

- [ ] **Step 3** (user, manual in `pnpm dev`):
  - Homepage: scroll from hero into "Waarom" — brand, links and NL/EN stay readable.
  - Every subpage starts with the dark `PageHeader`; nav does not overlap the H1.
  - `/nl/trainings/basic-nov-26/book` at 390px: H1 wraps; submit an empty form to see field errors; check the radio buttons (`accent-brand/60`) are clearly visible on `#cdd3cd`.
  - Mobile menu (390px): opens as its own card, links + NL/EN work.
  - 404 (`/nl/does-not-exist`): fully dark, green button.
  - OG images `/nl/opengraph-image`, `/en/opengraph-image`.

- [ ] **Step 4:** Report results to Chef; list any open points (tint of callout, radios, two light sections with testimonials on).
