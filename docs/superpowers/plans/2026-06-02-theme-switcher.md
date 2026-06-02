# Theme Switcher Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let visitors choose Light / Dark / System theme, defaulting to their OS preference, with the choice persisted and no flash on load.

**Architecture:** Tailwind v4 semantic CSS-var tokens already drive every component, so dark mode is implemented by redefining the token variables under a `:root.dark` selector. `next-themes` toggles a `light`/`dark` class on `<html>`, handles system detection, persistence, and the no-flash inline script. A small client `ThemeToggle` (icon button + dropdown) drives it from the nav.

**Tech Stack:** Next.js 15 App Router, Tailwind CSS v4, next-themes, next-intl, Playwright (e2e), pnpm.

---

## File Structure

- `package.json` — add `next-themes` dependency.
- `components/ThemeProvider.tsx` (new) — client wrapper around `next-themes` `ThemeProvider`. One responsibility: provide theme context with our config.
- `app/[locale]/layout.tsx` (modify) — add `suppressHydrationWarning` to `<html>`, mount `ThemeProvider` in `<body>`.
- `app/globals.css` (modify) — add `:root.dark { … }` token override block.
- `components/ThemeToggle.tsx` (new) — client icon button + dropdown (Light/Dark/System). One responsibility: render the control and call `setTheme`.
- `components/Nav.tsx` (modify) — mount `ThemeToggle` (desktop, beside LangSwitcher).
- `components/MobileMenu.tsx` (modify) — mount `ThemeToggle` (mobile, inside the panel).
- `messages/en.json`, `messages/nl.json` (modify) — add top-level `theme` namespace.
- `e2e/pages/theme-toggle.ts` (new) — page object for the toggle.
- `e2e/theme.spec.ts` (new) — switching, persistence, system, mobile coverage.

---

## Task 1: Install next-themes and add the ThemeProvider

**Files:**

- Modify: `package.json` (via pnpm)
- Create: `components/ThemeProvider.tsx`
- Modify: `app/[locale]/layout.tsx`

- [ ] **Step 1: Install the dependency**

Run: `pnpm add next-themes`
Expected: `next-themes` appears under `dependencies` in `package.json`; `pnpm-lock.yaml` updated.

- [ ] **Step 2: Create the provider wrapper**

Create `components/ThemeProvider.tsx`:

```tsx
'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ReactNode } from 'react';

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </NextThemesProvider>
  );
}
```

- [ ] **Step 3: Wire it into the locale layout**

In `app/[locale]/layout.tsx`:

1. Add the import after the existing `Footer` import:

```tsx
import { ThemeProvider } from '@/components/ThemeProvider';
```

2. Add `suppressHydrationWarning` to the `<html>` tag and wrap the body contents in `ThemeProvider`. Replace the returned JSX (the `return ( … )` block) with:

```tsx
return (
  <html lang={locale} className={inter.variable} suppressHydrationWarning>
    <body>
      <ThemeProvider>
        <a
          href="#main"
          className="focus:bg-accent-green sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:rounded-sm focus:px-3 focus:py-1 focus:text-white"
        >
          Skip to content
        </a>
        <NextIntlClientProvider>
          <Nav locale={typedLocale} />
          <div id="main">{children}</div>
          <Footer locale={typedLocale} />
        </NextIntlClientProvider>
      </ThemeProvider>
    </body>
  </html>
);
```

- [ ] **Step 4: Verify it typechecks and builds**

Run: `pnpm typecheck`
Expected: PASS (no errors).

Run: `pnpm build`
Expected: build completes successfully.

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml components/ThemeProvider.tsx app/\[locale\]/layout.tsx
git commit -m "feat(theme): add next-themes provider and no-flash setup"
```

---

## Task 2: Add the dark palette token overrides

**Files:**

- Modify: `app/globals.css`

- [ ] **Step 1: Add the dark token block**

In `app/globals.css`, immediately AFTER the closing `}` of the `@theme { … }` block and BEFORE the existing `:root { color-scheme: light; }` rule, insert:

```css
:root.dark {
  color-scheme: dark;

  /* surface */
  --color-bg-base: #0d1117;
  --color-bg-elevated: #161b22;
  --color-bg-tint: #1c2430;

  /* borders */
  --color-border-subtle: #30363d;
  --color-border-strong: #444c56;

  /* text */
  --color-text-primary: #e6edf3;
  --color-text-soft: #c9d1d9;
  --color-text-muted: #8b949e;

  /* brand + accents */
  --color-brand: #58a6ff;
  --color-brand-deep: #79c0ff;
  --color-brand-soft: #15324a;
  --color-accent-blue: #58a6ff;
  --color-accent-green: #3fb950;
  --color-accent-green-hover: #2ea043;
  --color-accent-orange: #e0934b;
  --color-accent-red: #ff7b72;
}
```

- [ ] **Step 2: Verify the override works in the browser**

Run: `pnpm dev` (if not already running).

In another terminal, confirm the dark class flips the background. Open `http://localhost:3000/nl`, then in the browser devtools console run:

```js
document.documentElement.classList.add('dark');
getComputedStyle(document.body).backgroundColor;
```

Expected: returns `rgb(13, 17, 23)` (i.e. `#0d1117`) and the page visibly darkens with light text.

Remove the class again:

```js
document.documentElement.classList.remove('dark');
```

Expected: page returns to white.

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "feat(theme): add dark palette token overrides"
```

---

## Task 3: Add theme i18n strings

**Files:**

- Modify: `messages/en.json`
- Modify: `messages/nl.json`

- [ ] **Step 1: Add the `theme` namespace to English**

In `messages/en.json`, add a top-level key (sibling of `articles`, `nav`, etc.). Insert after the opening `{`:

```json
  "theme": {
    "label": "Theme",
    "light": "Light",
    "dark": "Dark",
    "system": "System"
  },
```

- [ ] **Step 2: Add the `theme` namespace to Dutch**

In `messages/nl.json`, add the same top-level key after the opening `{`:

```json
  "theme": {
    "label": "Thema",
    "light": "Licht",
    "dark": "Donker",
    "system": "Systeem"
  },
```

- [ ] **Step 3: Verify JSON is valid and i18n parity holds**

Run: `pnpm verify:i18n`
Expected: PASS (en and nl have matching keys; new `theme.*` keys present in both).

- [ ] **Step 4: Commit**

```bash
git add messages/en.json messages/nl.json
git commit -m "feat(theme): add theme switcher i18n strings"
```

---

## Task 4: Build the ThemeToggle component

**Files:**

- Create: `components/ThemeToggle.tsx`

This component follows the existing client-component patterns in the repo
(`MobileMenu.tsx`): `useId` for the panel id, a `useRef` for the button,
an Escape-key + outside-click handler, and `data-testid` hooks for e2e.
It uses the `next-themes` `mounted` guard to avoid a hydration mismatch.

- [ ] **Step 1: Create the component**

Create `components/ThemeToggle.tsx`:

```tsx
'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';

type Mode = 'light' | 'dark' | 'system';
const MODES: Mode[] = ['light', 'dark', 'system'];

function SunIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  );
}

export function ThemeToggle() {
  const t = useTranslations('theme');
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const panelId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [open]);

  // Before mount, render a stable placeholder to avoid hydration mismatch.
  const showMoon = mounted && resolvedTheme === 'dark';

  return (
    <div ref={containerRef} className="relative inline-flex">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={t('label')}
        onClick={() => setOpen((v) => !v)}
        data-testid="theme-toggle"
        className="text-text-soft hover:text-brand inline-flex h-8 w-8 items-center justify-center"
      >
        {showMoon ? <MoonIcon /> : <SunIcon />}
      </button>
      {open && (
        <div
          id={panelId}
          role="menu"
          className="border-border-subtle bg-bg-base absolute top-full right-0 mt-2 min-w-32 rounded-md border py-1 text-sm shadow-lg"
        >
          {MODES.map((mode) => (
            <button
              key={mode}
              type="button"
              role="menuitemradio"
              aria-checked={mounted && theme === mode}
              data-testid={`theme-option-${mode}`}
              onClick={() => {
                setTheme(mode);
                setOpen(false);
              }}
              className="text-text-soft hover:bg-bg-tint hover:text-brand flex w-full items-center justify-between gap-3 px-3 py-1.5 text-left"
            >
              <span>{t(mode)}</span>
              {mounted && theme === mode ? <span aria-hidden>✓</span> : null}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify it typechecks**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add components/ThemeToggle.tsx
git commit -m "feat(theme): add ThemeToggle icon button + dropdown"
```

---

## Task 5: Mount the toggle in the nav (desktop + mobile)

**Files:**

- Modify: `components/Nav.tsx`
- Modify: `components/MobileMenu.tsx`

- [ ] **Step 1: Mount in the desktop nav**

In `components/Nav.tsx`:

1. Add the import after the `MobileMenu` import:

```tsx
import { ThemeToggle } from './ThemeToggle';
```

2. Place the toggle beside the language switcher. Replace the existing
   `LangSwitcher` span block (the `<span … sm:inline> … </span>`) with:

```tsx
<span className="border-border-subtle hidden items-center gap-3 border-l pl-5 sm:inline-flex">
  <LangSwitcher currentLocale={locale} />
  <ThemeToggle />
</span>
```

- [ ] **Step 2: Mount in the mobile menu**

In `components/MobileMenu.tsx`:

1. Add the import after the `Locale` type import:

```tsx
import { ThemeToggle } from './ThemeToggle';
```

2. The existing `t` is `useTranslations('nav')`, which has no `theme` key, so add a
   second translator. At the top of the `MobileMenu` component body, alongside the
   existing `const t = useTranslations('nav');`, add:

```tsx
const tTheme = useTranslations('theme');
```

3. Inside the open panel, after the contact `Link` (the last `<Link>` before the
   closing `</div>` of the `flex flex-col` container), add this row:

```tsx
<div className="border-border-subtle flex items-center gap-2 border-t pt-3">
  <span className="text-text-muted">{tTheme('label')}</span>
  <ThemeToggle />
</div>
```

- [ ] **Step 3: Verify build + lint**

Run: `pnpm typecheck`
Expected: PASS.

Run: `pnpm lint`
Expected: PASS.

Run: `pnpm build`
Expected: build completes.

- [ ] **Step 4: Manually verify in the browser**

Run: `pnpm dev`. Open `http://localhost:3000/nl`.

- Click the sun/moon button in the nav → dropdown shows Licht / Donker / Systeem.
- Click **Donker** → page goes dark, icon switches to moon, check mark on Donker.
- Reload → still dark.
- Resize below the `sm` breakpoint → the desktop nav links hide; open the mobile
  menu → the theme row with the toggle is present and works.

- [ ] **Step 5: Commit**

```bash
git add components/Nav.tsx components/MobileMenu.tsx
git commit -m "feat(theme): mount ThemeToggle in desktop nav and mobile menu"
```

---

## Task 6: End-to-end coverage

**Files:**

- Create: `e2e/pages/theme-toggle.ts`
- Create: `e2e/theme.spec.ts`

Note: the e2e suite builds and serves production (`pnpm build && pnpm start`
via `playwright.config.ts`) and runs in chromium + webkit. next-themes stores
the choice in `localStorage` under the key `theme` and applies `class="dark"`
or `class="light"` to `<html>`.

- [ ] **Step 1: Write the page object**

Create `e2e/pages/theme-toggle.ts`:

```ts
import { type Page, type Locator } from '@playwright/test';
import { type Locale } from './home-page';

export class ThemeTogglePage {
  readonly html: Locator;
  readonly toggle: Locator;
  readonly optionLight: Locator;
  readonly optionDark: Locator;
  readonly optionSystem: Locator;

  constructor(
    readonly page: Page,
    readonly locale: Locale,
  ) {
    this.html = page.locator('html');
    this.toggle = page.getByTestId('theme-toggle').first();
    this.optionLight = page.getByTestId('theme-option-light').first();
    this.optionDark = page.getByTestId('theme-option-dark').first();
    this.optionSystem = page.getByTestId('theme-option-system').first();
  }

  async goto() {
    await this.page.goto(`/${this.locale}`);
  }

  async open() {
    await this.toggle.click();
  }
}
```

- [ ] **Step 2: Write the failing spec**

Create `e2e/theme.spec.ts`:

```ts
import { test, expect } from '@playwright/test';
import { ThemeTogglePage } from './pages/theme-toggle';

test('theme: selecting Dark applies the dark class and persists across reload', async ({
  page,
}) => {
  const theme = new ThemeTogglePage(page, 'nl');
  await theme.goto();
  await theme.open();
  await theme.optionDark.click();
  await expect(theme.html).toHaveClass(/dark/);

  await page.reload();
  await expect(theme.html).toHaveClass(/dark/);
});

test('theme: selecting Light applies the light class and persists across reload', async ({
  page,
}) => {
  const theme = new ThemeTogglePage(page, 'nl');
  await theme.goto();
  await theme.open();
  await theme.optionLight.click();
  await expect(theme.html).toHaveClass(/light/);
  await expect(theme.html).not.toHaveClass(/dark/);

  await page.reload();
  await expect(theme.html).toHaveClass(/light/);
});

test('theme: System mode follows the OS preference', async ({ page }) => {
  const theme = new ThemeTogglePage(page, 'nl');
  await page.emulateMedia({ colorScheme: 'dark' });
  await theme.goto();
  await theme.open();
  await theme.optionSystem.click();
  await expect(theme.html).toHaveClass(/dark/);

  await page.emulateMedia({ colorScheme: 'light' });
  await expect(theme.html).toHaveClass(/light/);
});

test('theme: toggle is reachable and works from the mobile menu', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  const theme = new ThemeTogglePage(page, 'nl');
  await theme.goto();
  await page.getByTestId('mobile-menu-toggle').click();
  await theme.open();
  await theme.optionDark.click();
  await expect(theme.html).toHaveClass(/dark/);
});
```

- [ ] **Step 3: Run the spec to verify it passes**

Run: `pnpm exec playwright test e2e/theme.spec.ts`
Expected: all theme tests PASS across chromium + webkit.

If the System test is flaky on webkit (emulateMedia timing), add a short
`await expect.poll(async () => (await theme.html.getAttribute('class')) ?? '')`
assertion instead of a direct `toHaveClass`. Only do this if it actually fails.

- [ ] **Step 4: Run the full suite to confirm no regressions**

Run: `pnpm test:e2e`
Expected: theme tests PASS. Pre-existing unrelated failures (blogs-filter flag,
home security-headers under dev) may remain — confirm no NEW failures in nav,
articles, or other suites caused by mounting the toggle.

- [ ] **Step 5: Commit**

```bash
git add e2e/pages/theme-toggle.ts e2e/theme.spec.ts
git commit -m "test(theme): e2e for light/dark/system switching and persistence"
```

---

## Self-Review Notes

- **Spec coverage:** provider/no-flash (Task 1), dark palette + `:root.dark` (Task 2),
  i18n (Task 3), toggle UI with mounted guard + a11y (Task 4), nav + mobile placement
  (Task 5), e2e for switch/persist/system/mobile (Task 6). All spec sections covered.
- **WCAG note:** the spec requires AA contrast verification. The dark values are
  GitHub-dark–derived and generally AA-safe on `#0d1117`; verify the brand/accent
  text pairings during Task 5 manual check and nudge values in `globals.css` if any
  pairing fails. This does not change the task structure.
- **Naming consistency:** component `ThemeToggle`, provider `ThemeProvider`,
  testids `theme-toggle` / `theme-option-{light,dark,system}`, i18n namespace
  `theme` with keys `label/light/dark/system` — used identically across Tasks 3–6.

```

```
