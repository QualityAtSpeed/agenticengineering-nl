---
name: agenticengineering.nl
description: Friendly-formal white/blue/green marketing site for two Claude Code trainings, NL/EN.
colors:
  bg-base: '#ffffff'
  bg-elevated: '#f5f8fb'
  bg-tint: '#eef3f8'
  border-subtle: '#dde4ea'
  border-strong: '#c6d0d8'
  text-primary: '#0f141a'
  text-soft: '#2a323a'
  text-muted: '#5b6772'
  brand: '#0b6fb0'
  brand-deep: '#0a4d7a'
  brand-soft: '#e8f1f8'
  accent-green: '#1c8449'
  accent-green-hover: '#167040'
  accent-orange: '#c87a1a'
  accent-red: '#c8431b'
typography:
  display:
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    fontSize: 'clamp(2.25rem, 5vw, 3.75rem)'
    fontWeight: 700
    lineHeight: '1.1'
    letterSpacing: '-0.01em'
  headline:
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    fontSize: '1.875rem'
    fontWeight: 700
    lineHeight: '1.2'
  title:
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    fontSize: '1.125rem'
    fontWeight: 600
    lineHeight: '1.35'
  body:
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    fontSize: '1rem'
    fontWeight: 400
    lineHeight: '1.6'
  body-lede:
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    fontSize: '1.125rem'
    fontWeight: 400
    lineHeight: '1.55'
  body-muted:
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    fontSize: '0.9375rem'
    fontWeight: 400
    lineHeight: '1.55'
  label:
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    fontSize: '0.75rem'
    fontWeight: 700
    lineHeight: '1.3'
    letterSpacing: '0.08em'
rounded:
  sm: '6px'
  md: '8px'
  lg: '12px'
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
    borderColor: '{colors.brand}'
    rounded: '{rounded.sm}'
    padding: '10px 20px'
  button-secondary-hover:
    backgroundColor: '{colors.brand-soft}'
    textColor: '{colors.brand-deep}'
  card:
    backgroundColor: '{colors.bg-base}'
    borderColor: '{colors.border-subtle}'
    rounded: '{rounded.md}'
    padding: '24px'
  card-hover:
    borderColor: '{colors.brand}'
  input:
    backgroundColor: '{colors.bg-base}'
    borderColor: '{colors.border-subtle}'
    textColor: '{colors.text-primary}'
    rounded: '{rounded.sm}'
    padding: '10px 12px'
  nav:
    backgroundColor: '{colors.bg-base}'
    borderColor: '{colors.border-subtle}'
    textColor: '{colors.text-soft}'
    padding: '14px 24px'
  link-default:
    textColor: '{colors.brand}'
  link-hover:
    textColor: '{colors.brand-deep}'
---

## 1. Overview

A bright, white-surface marketing site for selling agentic-engineering trainings to developers. Friendly enough to read like a Dutch training portal, restrained enough to keep the formal credibility engineers expect when evaluating a paid course.

**Color strategy: Restrained.** White surface, tinted neutrals, and two carrier colors used semantically: brand blue (`#0b6fb0` / `#0a4d7a`) for identity, headlines, and links; action green (`#1f8f50`) for primary CTAs and success states. Together they sit under 15% of pixels. Secondary accents (orange, red) appear only at semantic moments (warnings, validation errors).

**Theme: Light, always.** Audience is engineers and tech leads evaluating a credible training during the workday on bright monitors. The site has to read as a trustworthy training catalog, not as a developer tool. White surface signals "this is the catalog you read"; brand blue carries the institutional confidence; green CTA earns the eye when an action is available.

**Density.** Headlines are bold and prominent (`clamp(2.25rem, 5vw, 3.75rem)` for hero), body text breathes at `max-w-2xl` (≈ 65ch). Section padding stacks at `py-16` to `py-24`. Sections feel like discrete chapters but the surface is continuous and welcoming, not slabbed.

**Locale-aware.** NL is primary (`html lang="nl"`). EN is parity-complete. Curriculum module IDs stay English even on the NL page; titles localize. This is deliberate: engineers speak English about MCP/SDLC even in Dutch sentences.

## 2. Colors

The palette is anchored in a near-white surface with a faint cool tint, brand blue carrying identity, and a single green for action.

| Token                | Hex       | Use                                                                           |
| -------------------- | --------- | ----------------------------------------------------------------------------- |
| `bg-base`            | `#ffffff` | Page background, cards, nav, form inputs.                                     |
| `bg-elevated`        | `#f5f8fb` | Banded sections (proof strip, training detail bands, footer).                 |
| `bg-tint`            | `#eef3f8` | Image placeholders, soft fills inside cards.                                  |
| `border-subtle`      | `#dde4ea` | Default 1px borders on cards, dividers, inputs.                               |
| `border-strong`      | `#c6d0d8` | Hover borders, emphasis dividers.                                             |
| `text-primary`       | `#0f141a` | Body text default, card titles, dense reading.                                |
| `text-soft`          | `#2a323a` | Lede paragraphs, secondary body.                                              |
| `text-muted`         | `#5b6772` | Meta lines, helper text, captions. Passes AA at body sizes against `bg-base`. |
| `brand`              | `#0b6fb0` | H2 headlines, links, kicker eyebrows, primary identity color.                 |
| `brand-deep`         | `#0a4d7a` | H1 headlines, link hover, gradient anchor for final-CTA band.                 |
| `brand-soft`         | `#e8f1f8` | DayMarker pill background, secondary button hover fill, image ring.           |
| `accent-green`       | `#1f8f50` | Primary CTA fill, success state, logo glyph. Reserved; not decorative.        |
| `accent-green-hover` | `#167040` | Primary CTA hover only.                                                       |
| `accent-orange`      | `#c87a1a` | Warning state, future use for limited-seat alerts. No decorative use.         |
| `accent-red`         | `#c8431b` | Form validation errors, 404 page emphasis. No decorative use.                 |

**Do not** introduce a new color without first asking whether one of the existing roles already carries that meaning. The palette is closed; that is the point.

## 3. Typography

One family. Inter for everything, since the design no longer leans on monospace as a brand signal. Hierarchy is built with weight contrast (400 vs 700) and a ≥1.25× size ratio.

| Token        | Family | Size                             | Weight                        | Use                                                      |
| ------------ | ------ | -------------------------------- | ----------------------------- | -------------------------------------------------------- |
| `display`    | Inter  | `clamp(2.25rem, 5vw, 3.75rem)`   | 700, `letter-spacing -0.01em` | Hero H1 only. One per page.                              |
| `headline`   | Inter  | `1.875rem` (sm:`2.25rem`)        | 700                           | Section H2 (`Trainingen`, `Over`, `Contact`).            |
| `title`      | Inter  | `1.125rem`                       | 600                           | Card titles, module titles, form section heads.          |
| `body`       | Inter  | `1rem`                           | 400                           | Default paragraph text.                                  |
| `body-lede`  | Inter  | `1.125rem`                       | 400                           | Hero subtitle, page intros below H1.                     |
| `body-muted` | Inter  | `0.9375rem`                      | 400                           | Card descriptions, secondary copy.                       |
| `label`      | Inter  | `0.75rem`, `0.08em`, `uppercase` | 700                           | Kickers, eyebrows, meta lines, button text on icon-meta. |

**Scale ratio.** Steps move by ≥1.25×: `0.75rem → 0.9375rem → 1rem → 1.125rem → 1.875rem → clamp display`. Avoid intermediate sizes.

**Line-length cap.** Body prose is constrained to `max-w-2xl` (~ 42rem ≈ 65ch) regardless of viewport width.

## 4. Elevation

Effectively flat. Three surface layers, all light:

1. `bg-base` (the page, cards, nav, inputs).
2. `bg-elevated` (banded sections, footer).
3. `bg-tint` (image placeholders, soft fills inside cards).

No drop shadows except `shadow-sm` on primary CTA buttons (subtle, functional). Separation is done with **borders** (`border-subtle` 1px) and **surface tonality** (the three light tiers).

The nav uses a solid `bg-base` background with a 1px `border-subtle` bottom border. A 3px gradient strip (`brand-deep → brand → accent-green`) sits above it as the only decorative flourish on the page chrome.

## 5. Components

### Hero

A single full-width `<section>` with `px-6 py-20 sm:py-28`. Anatomy:

1. **Background.** Subtle dot-grid via a radial gradient at low opacity, white base.
2. **Kicker** (label typography, `text-brand`) — eyebrow text like `AGENTIC ENGINEERING · NL`.
3. **H1** (display typography, `text-brand-deep`) — bold, no leading glyph.
4. **Subtitle** (`body-lede`, `text-text-soft`, `max-w-2xl`).
5. **Two CTAs** — primary green filled with white text + ArrowIcon, secondary outlined in brand blue.

### Training Row (TrainingCard)

A full-width row (no side-by-side card grid). Anatomy: 4-column grid on desktop:

1. **Numeral column** — `01` / `02` in label typography, `text-brand`, tabular-nums.
2. **Title + tagline column** — `title` typography for the name, `body-muted` for the tagline.
3. **Icon meta-list column** — three rows (duration, audience, outcome), each with a small SVG icon + label.
4. **Price + CTA column** — price in `text-brand-deep`, label-style VAT suffix in `text-muted`, "Plan training" primary green button.

Rows separate with a 1px `border-subtle` divider. No card carrier; rows are the structural unit.

### TrainingDetail

A full-width banded section in `bg-elevated` separated from neighbors by `border-subtle` top-border. Anatomy:

1. **H2** in `headline` typography, `text-brand-deep`.
2. **Tagline** in `body-lede`, `text-text-soft`.
3. **Facts `<dl>`** — three rows (audience, prerequisites, outcomes), each with an icon `<dt>` + bullet list `<dd>`.
4. **Curriculum.** Advanced is a single numbered list (`01`, `02`, …). Basic splits into two days; each day starts with a `DayMarker` pill (`bg-brand-soft text-brand-deep`).
5. **Each module line** has a circular num-badge (40px disc, `border-border-subtle`, tabular-nums), a `title` H4, and a `body-muted` description.
6. **Book CTA** — primary green button, label-style text.

### Nav

Sticky top, full-width, solid `bg-base`, `border-subtle` bottom border. Above the nav, a 3px gradient strip (`brand-deep → brand → accent-green`). Inside: max-w-6xl row with brand on left (`28×28` brand-icon SVG + bold wordmark `agentic·engineering`), links on right (`Over ons` / `Contact` / `LangSwitcher`). Links are `text-text-soft` default, `text-brand-deep` on hover with underline. Active locale in switcher is `text-brand`.

### Form fields

Each field is a `<label>` block with three children:

1. Label (`title` typography, `text-text-soft`).
2. Input/textarea/select (`bg-base`, `border-subtle` 1px, `rounded-sm`, body typography, `px-3 py-2.5`, focus ring `brand` 2px).
3. Validation error (`text-accent-red`, `body-muted`, no leading glyph).

Submit button is identical to hero primary CTA. Disabled state is `opacity-60`.

### Banners / status messages

Inline only, never modals. Pattern: full border + tinted background panel.

- **Success.** `border-accent-green` + `bg-brand-soft`-equivalent tint, `text-text-primary`.
- **Error.** `border-accent-red` + soft red tint, `text-text-primary`.

No side-stripe borders (absolute ban). No leading `//` glyph.

### Footer

`bg-bg-elevated`, `border-subtle` top border, sans-serif throughout. Brand-icon + wordmark on left, link columns on right, copyright row below.

## 6. Do's and Don'ts

### Do

- **Use `text-brand-deep` on H1, `text-brand` on H2.** Identity color carries hierarchy.
- **Constrain body width to `max-w-2xl`** even when the section is full-bleed. Reading width over fashion.
- **Pair every accent color with a semantic role.** `accent-green` is always action; `accent-red` is always error; `brand` is always identity. No decorative use.
- **Keep CTAs short and direct.** `Plan training`, `Book training`, `Bekijk programma`, `Verzenden`. Sentence-case, no marketing exclamations.
- **Bake locale awareness into every component.** Don't hard-code `Days`. Use `t('duration.basic')` or pass `locale` in props.
- **Use `border-subtle` 1px borders as the dominant separator.** They read as quiet structural division.
- **Use icons (inline SVG) for meta lines instead of glyphs.** Duration icon next to duration label, audience icon next to audience label.

### Don't

- **Don't reintroduce monospace anywhere.** Inter sans-serif is the only family. JetBrains Mono has been retired from the stack.
- **Don't add the `>`, `$`, `//`, `›` carrier glyphs.** They belonged to the terminal aesthetic; they are not part of this design language.
- **Don't introduce a 5th accent.** If a new state needs color, repurpose orange or red semantically.
- **Don't add box-shadows beyond `shadow-sm` on primary CTAs.** Flat surfaces with borders IS the brand.
- **Don't put text on `accent-green` except white.** Other combinations fail AA.
- **Don't use side-stripe borders.** `border-left` or `border-right` > 1px as a colored accent is banned. Use full borders + tinted backgrounds instead.
- **Don't nest cards.** Card grids are exactly one level deep.
- **Don't gradient anything visible except the 3px nav top-strip and the final-CTA band.** No gradient text, no gradient buttons.
- **Don't animate layout.** Transitions are on `color`, `border-color`, `background-color`, `opacity` only, never `width`, `height`, `top`, `padding`. Respect `prefers-reduced-motion` (already clamped to `0.01ms` in `app/globals.css`).
- **Don't use em dashes.** Use commas, colons, semicolons, periods, or parentheses.
