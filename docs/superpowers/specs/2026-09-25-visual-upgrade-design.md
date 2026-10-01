# Visual upgrade: muted surfaces, green bands, Rubik, pill nav

**Date:** 2026-09-25
**Status:** Approved design — ready for implementation plan
**Branch:** `feat/improve-visual`
**Reference mockup:** `rubik-preview.html` (session scratchpad; not committed)

## Problem

The current light theme is bright white (`#ffffff`) with a blue identity and reads
as flat and glaring. The site also carries a second, dark theme (theme toggle via
`next-themes`) that doubles the design surface. The goal is a calmer, more
cohesive look that keeps the green feel, with more contrast between sections.

## Goals

- Muted light surface instead of pure white.
- Alternating dark-green / light sections ("blocks") with strong contrast.
- Antraciet headings/links instead of blue.
- Rubik as the single font family.
- Centered, rounded pill navigation.
- One theme only: remove the dark theme and theme toggle.
- Every text/UI colour pair that occurs in the code meets WCAG 2.1 AA
  (≥ 4.5:1 normal text, ≥ 3:1 large text and UI components).

## Non-goals

- No copy/content changes (except removing carrier glyphs listed below).
- No changes to routing, i18n structure, Stripe/contact flows or data.
- No new brand logo; `public/brand-icon.svg` stays as-is.
- Historical specs/plans in `docs/superpowers/` about the theme switcher stay.

## 1. Tokens (`app/globals.css`)

### Mechanism

Tailwind v4 utilities resolve to CSS variables (`bg-bg-base` →
`background-color: var(--color-bg-base)`). The existing `:root.dark` block
already relies on this. Dark bands use the same mechanism: a `.surface-dark`
class redefines the tokens for its subtree. Components keep their existing
utility classes; e.g. `text-brand` automatically becomes white inside a band.

`.surface-dark` also sets `background-color: var(--color-bg-page)` and
`color: var(--color-text-primary)` so a band paints itself.

`.surface-dark` is defined inside `@layer components`. Unlayered CSS beats all
Tailwind v4 utility layers, so an unlayered rule would make utilities such as
`bg-transparent` (nav wrapper) lose. Sections that become a band drop their own
`bg-*` class (e.g. `bg-bg-elevated` on `Footer`).

### Light (default, `@theme`)

| Token                | Old       | New                         |
| -------------------- | --------- | --------------------------- |
| `bg-page` (new)      | —         | `#cdd3cd` (html/body)       |
| `bg-base`            | `#ffffff` | `#e1e5e1` (cards, inputs, pills) |
| `bg-elevated`        | `#f5f8fb` | `#c5cbc4`                   |
| `bg-tint`            | `#eef3f8` | `#bcc4bc`                   |
| `border-subtle`      | `#dde4ea` | `#b0b7b0`                   |
| `border-strong`      | `#c6d0d8` | `#6b736d`                   |
| `text-primary`       | `#0f141a` | `#121714`                   |
| `text-soft`          | `#2a323a` | `#2c342f`                   |
| `text-muted`         | `#5b6772` | `#434d47`                   |
| `brand`              | `#0b6fb0` | `#2f3a34`                   |
| `brand-deep`         | `#0a4d7a` | `#2f3a34`                   |
| `brand-soft`         | `#e8f1f8` | `#d8ddd8`                   |
| `accent-green`       | `#1c8449` | unchanged                   |
| `accent-green-hover` | `#167040` | `#0f5a32`                   |
| `accent-orange`      | `#c87a1a` | `#734105`                   |
| `accent-red`         | `#c8431b` | `#8f2a0e`                   |
| `on-accent`          | `#ffffff` | unchanged                   |

`html, body` background changes from `--color-bg-base` to `--color-bg-page`.

### Dark band (`.surface-dark`)

| Token                | Value     |
| -------------------- | --------- |
| `bg-page`            | `#0f3b25` |
| `bg-base`            | `#144a2f` |
| `bg-elevated`        | `#12432b` |
| `bg-tint`            | `#185536` |
| `border-subtle`      | `#2c5e43` |
| `border-strong`      | `#6b9a82` |
| `text-primary`       | `#ffffff` |
| `text-soft`          | `#e2ece5` |
| `text-muted`         | `#a9c2b2` |
| `brand`              | `#ffffff` |
| `brand-deep`         | `#ffffff` |
| `brand-soft`         | `#1d5a3a` |
| `accent-green`       | `#3fb950` |
| `accent-green-hover` | `#56d364` |
| `on-accent`          | `#0d1117` |
| `accent-red`         | `#ff9b8f` |
| `accent-orange`      | `#f2b877` |

### Removed

- `:root.dark` block and `color-scheme: dark`.
- `--color-accent-blue` (unused; grep finds it only in `globals.css`).

### Contrast (measured, WCAG relative luminance)

Worst case per role, light sections: `brand` on `bg-tint` 6.62; `text-muted` on
`bg-tint` 4.92; `accent-green-hover` on `bg-tint` 4.65; `accent-red` on
`bg-tint` 4.69; `accent-orange` on `bg-tint` 4.73, in `/10` banner 4.80;
`border-strong` on `bg-page` 3.21, on `bg-base` 3.84; `accent-green` button vs
`bg-page` 3.10; white on `accent-green` unchanged.

Dark band: `text-muted` 6.60; `brand` (white) 12.56; `accent-green-hover` 6.52;
`accent-red` 6.18 (`/10` banner 5.22); `accent-orange` 7.11 (`/10` 5.81);
`border-strong` 3.93; `on-accent` on `accent-green` 7.45.

Known constraint: `border-strong` on `bg-tint` is 2.74. No inputs or secondary
buttons sit on `bg-tint` today; keep it that way.

### Links

With antraciet `brand`, colour no longer distinguishes inline links from body
text (WCAG 1.4.1). Links inside running text must always be underlined.
Only `app/[locale]/faq/page.tsx:43` needs a change (`hover:underline` →
`underline`). Nav, footer and standalone links ("Meet the team →") are exempt.

## 2. Font

- `app/[locale]/layout.tsx`: `Inter` → `Rubik` from `next/font/google`, same
  variable `--font-sans-loaded`, `subsets: ['latin', 'latin-ext']`,
  `display: 'swap'`, variable weight (Rubik axis `wght` 300–900).
- Remove `font-mono` in `components/ArticleFilterBar.tsx:46` and
  `components/TestimonialCard.tsx:20`.
- `components/ArticleFilterBar.tsx:51`: active filter text `text-accent-green`
  (`#1c8449`, 3.10 on `bg-page`, fails AA) → `text-accent-green-hover`
  (`#0f5a32`, 5.46). The `[ | ]` glyphs in the filter bar and the `//` in
  `TimelineEntry` are out of scope for this change.

## 3. Navigation (`components/Nav.tsx`, `components/MobileMenu.tsx`)

### Desktop (`sm` and up)

- Remove the 3px gradient strip above the nav.
- Wrapper: `sticky top-0 z-20 h-0` (floats over the first section, takes no
  height) with `.surface-dark`, background transparent.
- One centred island (revised after visual review; replaces the earlier
  three-island layout): brand, links and `LangSwitcher` (after a 1px
  `border-subtle` divider) in a single pill, centred with `flex justify-center`.
  `ThemeToggle` is removed. Everything sits on the pill's own `bg-base` surface,
  so it stays readable when the sticky nav scrolls over light sections (loose
  white text would measure 1.52 on `bg-page` `#cdd3cd`).
- Pill styling: `rounded-2xl`, `border border-border-subtle`,
  `bg-bg-base/95`, `backdrop-blur`, shadow `0 8px 24px -12px rgb(0 0 0 / 0.35)`
  (documented exception to the shadow rule in `DESIGN.md`).
- Pill links: `px-3.5 py-2 rounded-xl`, hover `bg-bg-tint`.
- Link order and `data-testid`s unchanged (`tests/e2e/nav.spec.ts`).

### Mobile (below `sm`)

- Full-width pill with brand left and hamburger right.
- Panel: separate `rounded-2xl` card under the pill (same surface/blur/shadow),
  containing the links and `LangSwitcher`. Theme row removed.
- `data-testid`s unchanged (`mobile-menu-toggle`, `mobile-menu-panel`,
  `mobile-menu-*`).

## 4. Section rhythm

### Homepage (`app/[locale]/page.tsx`)

| Section                      | Surface                                   |
| ---------------------------- | ----------------------------------------- |
| Hero                         | dark                                      |
| Why                          | light                                     |
| Trainings                    | dark                                      |
| TestimonialsSection (flagged)| light                                     |
| ProofStrip                   | light (keeps `bg-bg-elevated`)            |
| Instructors                  | dark                                      |
| Final CTA                    | light, via tokens (see below)             |
| Footer                       | dark                                      |

- **Final CTA** (`page.tsx:104-122`): drop hardcoded `#0a4d7a`/`#0b6fb0`
  gradient, `bg-white`, `text-white`, dot overlay. Becomes a normal section:
  H2 `text-brand`, body `text-text-soft`, primary `Button`.
- **Hero dot grid** (`components/Hero.tsx:32`): replace hardcoded
  `rgba(11,111,176,0.08)` with `color-mix(in srgb, var(--color-text-primary) 8%, transparent)`.
- **Why callout** (`page.tsx:54`): remove side stripe. New classes:
  `border border-border-subtle bg-bg-tint rounded-2xl px-5 py-4`
  (open point: tint may be revisited).
- **TestimonialCard** (`components/TestimonialCard.tsx`): remove
  `border-l-4 border-l-accent-green`, `font-mono` and the `+ ` glyph; use
  `border border-border-subtle bg-bg-elevated rounded-2xl p-8`; name
  `font-semibold text-text-primary`.

### Subpages

New component `components/PageHeader.tsx`: dark band with H1 and optional
intro/children, top padding for the floating nav (`pt-36`), then content in a
light section. Replaces the repeated
`<main className="px-6 py-16 sm:py-20"> … <h1 className="text-brand-deep text-3xl font-bold sm:text-4xl">`.

| Route                                  | Header (dark)                  | Content (light)   |
| -------------------------------------- | ------------------------------ | ----------------- |
| `/trainings`                           | "Trainingen"                   | TrainingCards     |
| `/trainings/[trainingId]`              | "Trainingen"                   | TrainingDetail    |
| `/trainings/*/book` (`BookPage.tsx`)   | training name, intro, badge    | BookingForm       |
| `/about`                               | title, intro                   | InstructorCards   |
| `/contact`                             | title, intro                   | ContactForm       |
| `/faq`                                 | title                          | questions         |
| `/impressum`                           | title                          | text              |
| `/articles`                            | title + inline intro           | filter + timeline |
| `/trainings/*/book/success`            | `success.title` as H1          | success block with `success.body` only |
| `not-found.tsx`                        | whole page dark                | —                 |

## 5. Remove dark theme

| File                                             | Action                                   |
| ------------------------------------------------ | ---------------------------------------- |
| `components/ThemeProvider.tsx`                   | delete                                   |
| `components/ThemeToggle.tsx`                     | delete                                   |
| `app/[locale]/layout.tsx`                        | remove `<ThemeProvider>`; remove `suppressHydrationWarning` on `<html>` |
| `components/Nav.tsx`, `components/MobileMenu.tsx`| remove `ThemeToggle` usage               |
| `messages/nl.json`, `messages/en.json`           | remove `theme` namespace (parity)        |
| `tests/e2e/theme.spec.ts`                        | delete                                   |
| `tests/e2e/pages/theme-toggle.ts`                | delete                                   |
| `package.json` / lockfile                        | remove `next-themes` (`pnpm remove next-themes`, run by the user) |

## 6. Open Graph image (`app/[locale]/opengraph-image.tsx`)

Same layout and sizes as today (80px padding, 36px wordmark, 84px title,
32px subtitle, 64px logo). Changes:

- Background `#0f3b25`; title `#ffffff` weight 700, `letter-spacing: -0.02em`;
  wordmark `#e2ece5` weight 600; subtitle `#a9c2b2` weight 400.
- Remove the `>` glyph and the dark logo square (`rect fill="#0f1108"`);
  logo stroke/fill `#3fb950`.
- Font Rubik, loaded as font data via `ImageResponse({ fonts: [...] })`
  (Satori does not use `next/font`; each font entry is `{ name, data, weight }`,
  see `node_modules/next/dist/compiled/@vercel/og/types.d.ts:95-98`).
  Weights 400, 600, 700. Rubik is SIL OFL, bundling is allowed.

Resolved during implementation: Satori supports TTF/OTF/WOFF (not WOFF2;
variable fonts not documented) → static `@fontsource/rubik@5.3.0`
`rubik-latin-{400,600,700}-normal.woff` in `assets/fonts/`, read with
`readFile(join(process.cwd(), …))` on the Node.js runtime (the documented
pattern); `runtime = 'edge'` removed.

Originally open (kept for history):

- Whether Satori accepts a variable font file, or three static files are needed.
- Supported formats (ttf/otf/woff) and the source of the files. Upstream Google
  Fonts may ship Rubik only as a variable file; candidates to check include
  `@fontsource/rubik` (per-weight `.woff`) or instancing the variable file.
- How to read a bundled font file under `runtime = 'edge'`.

## 7. Documentation

- `DESIGN.md`: rewrite palette, surfaces/bands, Rubik, pill nav, shadow
  exception, always-underlined inline links, no gradient strip, no dark theme.
- `PRODUCT.md`: update "white surface, blue brand-deep headlines" and
  "brand blue" passages.
- `CLAUDE.md`: replace "Dark terminal-native aesthetic" and "JetBrains Mono".
- `README.md`: remove theme toggle; add `PageHeader` and `.surface-dark`
  (pre-commit `readme-check` requires README in the same commit).

## 8. Verification

Run by the user:

- `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm verify:i18n`, `pnpm build`.
- `pnpm test:e2e` (includes axe a11y on all routes and nav tests).
- Visual check with `pnpm dev`: homepage, each subpage, booking form states,
  mobile menu (390px), OG image at `/nl/opengraph-image` and `/en/opengraph-image`.

## Open points

- Tint of the why callout / testimonial card (`bg-tint` vs `bg-elevated`).
- `BookingForm` radios use `accent-brand/60`; verify ≥ 3:1 against `bg-page`
  in the browser (not measurable from code).
- Two consecutive light sections when `TESTIMONIALS_ENABLED` is on.
- Existing e2e/unit tests that assert classes, colours or Inter — to inventory
  in the plan.
