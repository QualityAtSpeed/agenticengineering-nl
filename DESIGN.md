---
name: agenticengineering.nl
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
typography:
  display:
    fontFamily: 'Rubik, system-ui, -apple-system, sans-serif'
    fontSize: 'clamp(2.25rem, 5vw, 3.75rem)'
    fontWeight: 700
    lineHeight: '1.1'
    letterSpacing: '-0.01em'
  headline:
    fontFamily: 'Rubik, system-ui, -apple-system, sans-serif'
    fontSize: '1.875rem'
    fontWeight: 700
    lineHeight: '1.2'
  title:
    fontFamily: 'Rubik, system-ui, -apple-system, sans-serif'
    fontSize: '1.125rem'
    fontWeight: 600
    lineHeight: '1.35'
  body:
    fontFamily: 'Rubik, system-ui, -apple-system, sans-serif'
    fontSize: '1rem'
    fontWeight: 400
    lineHeight: '1.6'
  body-lede:
    fontFamily: 'Rubik, system-ui, -apple-system, sans-serif'
    fontSize: '1.125rem'
    fontWeight: 400
    lineHeight: '1.55'
  body-muted:
    fontFamily: 'Rubik, system-ui, -apple-system, sans-serif'
    fontSize: '0.9375rem'
    fontWeight: 400
    lineHeight: '1.55'
  label:
    fontFamily: 'Rubik, system-ui, -apple-system, sans-serif'
    fontSize: '0.75rem'
    fontWeight: 700
    lineHeight: '1.3'
    letterSpacing: '0.08em'
rounded:
  sm: '6px'
  md: '8px'
  lg: '12px'
  xl: '16px'
  full: '9999px'
spacing:
  xs: '8px'
  sm: '16px'
  md: '24px'
  lg: '40px'
  xl: '64px'
  xxl: '96px'
components:
  button-primary:
    backgroundColor: '{colors.accent-green}'
    textColor: '#ffffff'
    typography: '{typography.title}'
    rounded: '{rounded.sm}'
    padding: '10px 20px'
  button-primary-hover:
    backgroundColor: '{colors.accent-green-hover}'
    textColor: '#ffffff'
  button-secondary:
    backgroundColor: '{colors.bg-base}'
    textColor: '{colors.brand}'
    borderColor: '{colors.border-strong}'
    rounded: '{rounded.sm}'
    padding: '10px 20px'
  card:
    backgroundColor: '{colors.bg-base}'
    borderColor: '{colors.border-subtle}'
    rounded: '{rounded.md}'
    padding: '24px'
  input:
    backgroundColor: '{colors.bg-base}'
    borderColor: '{colors.border-strong}'
    textColor: '{colors.text-primary}'
    rounded: '{rounded.sm}'
    padding: '10px 12px'
  nav:
    backgroundColor: '{colors.band-base}'
    borderColor: '{colors.border-subtle}'
    rounded: '{rounded.xl}'
    shadow: '0 8px 24px -12px rgb(0 0 0 / 0.35)'
  link-default:
    textColor: '{colors.brand}'
    textDecoration: 'underline inside running text'
---

## 1. Overview

A calm marketing site for agentic-engineering trainings. The page surface is a muted green-grey (`#cdd3cd`); dark-green bands (`#0f3b25`) alternate with light sections to structure the page. Headings are antraciet, action is green.

**Color strategy: Restrained, two surfaces.** Light sections use the `@theme` tokens. Dark bands use `.surface-dark`, which redefines the same tokens (white text, light green action). Components never pick band colours themselves; placement decides.

**Theme: One theme.** No dark mode, no toggle.

**Density.** Section padding `py-16` to `py-24`; body prose `max-w-2xl` (about 65ch).

**Locale-aware.** NL is primary (`html lang="nl"`). EN is parity-complete. Curriculum module IDs stay English even on the NL page; titles localize.

## 2. Colors

See frontmatter. Light tokens live in `@theme` (`app/globals.css`); band tokens in `.surface-dark` inside `@layer components` (so utilities still win over it).

| Role                   | Light     | Band      | Use                                            |
| ---------------------- | --------- | --------- | ---------------------------------------------- |
| `bg-page`              | `#cdd3cd` | `#0f3b25` | Page / band background.                        |
| `bg-base`              | `#e1e5e1` | `#144a2f` | Cards, inputs, pills, nav islands.             |
| `bg-elevated`          | `#c5cbc4` | `#12432b` | ProofStrip, testimonial cards.                 |
| `bg-tint`              | `#bcc4bc` | `#185536` | Callouts, price box, image placeholders.       |
| `border-subtle`        | `#b0b7b0` | `#2c5e43` | 1px dividers and card borders.                 |
| `border-strong`        | `#6b736d` | `#6b9a82` | Input and secondary-button borders (UI ≥ 3:1). |
| `text-primary`         | `#121714` | `#ffffff` | Body text.                                     |
| `text-soft`            | `#2c342f` | `#e2ece5` | Ledes, secondary body.                         |
| `text-muted`           | `#434d47` | `#a9c2b2` | Meta lines, captions.                          |
| `brand` / `brand-deep` | `#2f3a34` | `#ffffff` | Headings, links, icons.                        |
| `brand-soft`           | `#d8ddd8` | `#1d5a3a` | Badge / DayMarker background.                  |
| `accent-green`         | `#1c8449` | `#3fb950` | Primary CTA fill, success. Reserved.           |
| `accent-green-hover`   | `#0f5a32` | `#56d364` | CTA hover, green text (early-bird, success).   |
| `accent-orange`        | `#734105` | `#f2b877` | Warnings (rate limit).                         |
| `accent-red`           | `#8f2a0e` | `#ff9b8f` | Validation errors.                             |
| `on-accent`            | `#ffffff` | `#0d1117` | Text on `accent-green` fills.                  |

All text/UI pairs used in code meet WCAG 2.1 AA. `border-strong` on `bg-tint` is 2.74: never place inputs or secondary buttons on `bg-tint`. Measure contrast before adding a colour.

## 3. Typography

Rubik for everything (variable weight via `next/font/google`). Hierarchy by weight (400 / 600 / 700) and a ≥ 1.25× size ratio. Headings and links use `brand` (antraciet in light sections, white in bands). Links inside running text are always underlined (WCAG 1.4.1: colour alone does not distinguish them).

## 4. Elevation

Flat surfaces separated by 1px `border-subtle` and by the light/dark band rhythm. Exception: the floating nav islands use `0 8px 24px -12px rgb(0 0 0 / 0.35)`. The primary CTA keeps `shadow-sm`.

## 5. Components

- **Nav.** Sticky, zero-height, floats over the first section. One centred `rounded-2xl` pill on `bg-base/95` + blur (95%, not lower: the inactive language link stays AA over light sections) holding brand, links and the language switch (after a 1px divider). The pill has its own surface so it stays readable over light sections. Mobile: the same pill full-width with brand + menu button; the panel is its own card.
- **Surfaces per page.** Homepage: Hero dark → Why light → Trainings dark → (Testimonials light) → ProofStrip light (`bg-elevated`) → Instructors dark → Final CTA light → Footer dark. Subpages: `PageHeader` (dark, `pt-36` for the nav) → content light → Footer dark. 404 is fully dark.
- **Callouts / testimonial cards.** Full 1px border, tinted fill, `rounded-2xl`. No side stripes.
- **Forms.** Inputs `bg-base`, `border-strong`, focus ring `brand`. Errors `accent-red`; banners `accent-*/10` fill + `/30` border.

## 6. Do's and Don'ts

### Do

- Put a section in a band with `.surface-dark`; don't hand-pick band colours.
- Keep body text at `max-w-2xl`.
- Underline inline links.
- Keep CTAs short and direct (`Boek training`, `Bekijk programma`, `Verzenden`).
- Bake locale awareness into every component.

### Don't

- No monospace, no `>`, `$`, `//`, `›`, `+` carrier glyphs in new UI.
- No side-stripe borders.
- No gradients (the old nav strip and final-CTA gradient are gone).
- No new colours without checking an existing role first.
- Don't animate layout; respect `prefers-reduced-motion`.
- Don't use em dashes in new copy.
