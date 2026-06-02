# Theme switcher (light / dark / system)

**Date:** 2026-06-02
**Status:** Approved design — ready for implementation plan

## Problem

The site ships only a light theme. It previously had a dark ("terminal/dev")
theme that was dropped when the design moved to the current light/blue brand.
Users should be able to choose their preferred theme.

## Goals

- Let users pick **Light**, **Dark**, or **System** (follow OS).
- Default to **System** so first-paint matches the visitor's OS preference.
- Persist the choice across reloads and navigations.
- No flash of the wrong theme on load (no FOUC).
- Cohesive dark theme that is a sibling of the current light design — same
  blue brand and accent system, darkened surfaces and lightened text.

## Non-goals (YAGNI)

- Per-page or per-section themes.
- More than three modes.
- Reviving the old terminal/mono aesthetic (green monospace). The dark theme is
  a dark variant of the **current** design, not the old terminal look.

## Mechanism

Tailwind v4 (CSS-first `@theme`) + `next-themes`.

- Add the `next-themes` dependency.
- Add a client `ThemeProvider` wrapper (e.g. `components/ThemeProvider.tsx`,
  `'use client'`) and mount it in `app/[locale]/layout.tsx` inside `<body>`,
  wrapping the existing content. Props:
  - `attribute="class"` — next-themes sets `class="light"` / `class="dark"` on `<html>`.
  - `defaultTheme="system"`
  - `enableSystem`
- Add `suppressHydrationWarning` to the `<html>` element (next-themes requirement;
  its injected inline script sets the class before paint, which would otherwise
  trip React hydration warnings).
- next-themes injects the no-flash inline script automatically — no hand-rolled
  script needed.

### Token override strategy

The current `@theme` block in `app/globals.css` holds the **light** token values
and stays as-is (it is the default / light theme). Add a dark override block that
re-declares the same custom properties with dark values:

```css
:root.dark {
  color-scheme: dark;
  --color-bg-base: #0d1117;
  /* ...all tokens below... */
}
```

Use the `:root.dark` selector (specificity 0,2,0) so it reliably wins over the
`@theme`-generated `:root` declarations regardless of source order. Place the
block after the `@theme` block in `globals.css`.

Because every component already uses semantic token utilities (`bg-bg-base`,
`text-text-soft`, `border-border-subtle`, `text-brand`, etc.), **no component
restyling is required** — overriding the variables swaps the whole UI.

## Dark palette

Dark variant of the current blue brand, GitHub-dark–derived. Contrast must be
verified to WCAG AA (normal text ≥ 4.5:1, large/UI ≥ 3:1) during implementation;
adjust values if any pairing fails.

| token                        | light (current) | dark (new) |
| ---------------------------- | --------------- | ---------- |
| `--color-bg-base`            | #ffffff         | #0d1117    |
| `--color-bg-elevated`        | #f5f8fb         | #161b22    |
| `--color-bg-tint`            | #eef3f8         | #1c2430    |
| `--color-border-subtle`      | #dde4ea         | #30363d    |
| `--color-border-strong`      | #c6d0d8         | #444c56    |
| `--color-text-primary`       | #0f141a         | #e6edf3    |
| `--color-text-soft`          | #2a323a         | #c9d1d9    |
| `--color-text-muted`         | #5b6772         | #8b949e    |
| `--color-brand`              | #0b6fb0         | #58a6ff    |
| `--color-brand-deep`         | #0a4d7a         | #79c0ff    |
| `--color-brand-soft`         | #e8f1f8         | #15324a    |
| `--color-accent-blue`        | #0b6fb0         | #58a6ff    |
| `--color-accent-green`       | #1c8449         | #3fb950    |
| `--color-accent-green-hover` | #167040         | #2ea043    |
| `--color-accent-orange`      | #c87a1a         | #e0934b    |
| `--color-accent-red`         | #c8431b         | #ff7b72    |
| `--color-on-accent`          | #ffffff         | #0d1117    |

Notes:

- `--color-brand-deep` is used for headings and link hover. On the light theme it
  is _darker_ than `--color-brand`; on dark it is _lighter_ (brighter blue) so
  hover/headings still read as emphasis.
- `--color-brand-soft` is a tinted surface; the dark value is a muted dark blue.
- `--color-on-accent` was added during implementation to satisfy WCAG AA. The
  dark-mode `accent-green` is bright, so white text on the solid green primary
  button only reached 2.54:1. `on-accent` is the button/skip-link foreground:
  white in light (4.72:1 on the darker light-green), dark in dark (7.45:1 on the
  bright dark-green). `accent-green` used as _text_ on dark surfaces stays light
  and already passes (7.45:1), so it was not changed.

### Implementation deltas (beyond the original token-swap assumption)

The original assumption that "no component restyling is required" held for most of
the UI but not entirely:

- Three surfaces hardcoded `bg-white` (`ArticleCard`, `InstructorCard`, the
  secondary `Button`) and were switched to the `bg-bg-base` token (identical in
  light, dark in dark).
- The home final-CTA band used the themed `brand-deep`/`brand` tokens for its
  gradient, so it lightened in dark mode and white text fell to ~2.5:1. It is now
  pinned to fixed deep-blue (`#0a4d7a`/`#0b6fb0` — the same values as the light
  tokens, so light is unchanged) with the button label pinned to `#0a4d7a` and
  body text bumped to `text-white/90`. All CTA pairings are ≥ 4.5:1.

## Toggle UI

New component `components/ThemeToggle.tsx` (`'use client'`, uses
`next-themes` `useTheme()`).

- Renders a sun/moon icon button. Clicking opens a small dropdown menu with three
  items: **Light**, **Dark**, **System**. The active mode shows a check mark.
- Inline SVG icons — no icon-library dependency.
- Accessibility: button has `aria-haspopup="menu"` and an `aria-label` (translated,
  e.g. "Theme"); menu items are buttons; supports keyboard (Enter/Space to open,
  Escape to close) and closes on outside click and on selection.
- Avoid hydration mismatch: render a stable placeholder (icon button, no active
  state) until mounted, then reflect the resolved theme (standard next-themes
  `mounted` guard).

### Placement

Mirror `LangSwitcher`:

- Desktop: in `components/Nav.tsx`, beside `LangSwitcher` inside the
  desktop-only span / control cluster.
- Mobile: inside `components/MobileMenu.tsx`, alongside the mobile language
  control.

Because `Nav` is a server component and `ThemeToggle` is a client component,
`ThemeToggle` is imported and rendered directly (client components can be
children of server components).

## i18n

Add a `theme` namespace to `messages/en.json` and `messages/nl.json`:

| key      | en     | nl      |
| -------- | ------ | ------- |
| `label`  | Theme  | Thema   |
| `light`  | Light  | Licht   |
| `dark`   | Dark   | Donker  |
| `system` | System | Systeem |

(Translations are a starting point; refine wording during implementation.)

## Testing

- **e2e (Playwright):**
  - Selecting **Dark** adds `dark` class to `<html>` and persists across a reload.
  - Selecting **Light** sets the light class and persists.
  - **System** mode follows an emulated `prefers-color-scheme` (toggle the
    emulation, assert the resolved class).
  - The toggle is reachable and operable on mobile via the menu.
- **Manual / visual:** spot-check key pages (home, articles, trainings, contact)
  in dark mode for contrast and any element that may have relied on light-only
  assumptions.

## Affected files

- `package.json` — add `next-themes`.
- `app/globals.css` — add `:root.dark` token override block.
- `app/[locale]/layout.tsx` — `suppressHydrationWarning` on `<html>`, mount `ThemeProvider`.
- `components/ThemeProvider.tsx` — new client wrapper.
- `components/ThemeToggle.tsx` — new toggle component.
- `components/Nav.tsx` — mount toggle (desktop).
- `components/MobileMenu.tsx` — mount toggle (mobile).
- `messages/en.json`, `messages/nl.json` — `theme` namespace.
- `e2e/` — theme switching coverage (spec + page object as needed).
