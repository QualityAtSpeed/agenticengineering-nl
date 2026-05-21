---
name: agenticengineering.nl
description: Terminal-aesthetic marketing site for two Claude Code trainings, NL/EN.
colors:
  bg-base: '#0d1117'
  bg-elevated: '#161b22'
  border-subtle: '#30363d'
  text-primary: '#c9d1d9'
  text-muted: '#8b949e'
  accent-green: '#7ee787'
  accent-blue: '#58a6ff'
  accent-orange: '#f0883e'
  accent-red: '#ff7b72'
typography:
  display:
    fontFamily: 'JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace'
    fontSize: 'clamp(2rem, 6vw, 4.5rem)'
    fontWeight: 700
    lineHeight: '1.05'
    letterSpacing: 'normal'
  headline:
    fontFamily: 'JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace'
    fontSize: '2.25rem'
    fontWeight: 600
    lineHeight: '1.15'
    letterSpacing: 'normal'
  title:
    fontFamily: 'JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace'
    fontSize: '1.125rem'
    fontWeight: 500
    lineHeight: '1.3'
  body:
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    fontSize: '1rem'
    fontWeight: 400
    lineHeight: '1.6'
  body-muted:
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    fontSize: '0.875rem'
    fontWeight: 400
    lineHeight: '1.6'
  label:
    fontFamily: 'JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace'
    fontSize: '0.75rem'
    fontWeight: 400
    lineHeight: '1.4'
    letterSpacing: '0.2em'
rounded:
  none: '0px'
  sm: '2px'
spacing:
  xs: '8px'
  sm: '16px'
  md: '24px'
  lg: '40px'
  xl: '64px'
  xxl: '120px'
components:
  button-primary:
    backgroundColor: '{colors.accent-green}'
    textColor: '{colors.bg-base}'
    typography: '{typography.label}'
    rounded: '{rounded.sm}'
    padding: '12px 20px'
  button-primary-hover:
    backgroundColor: '{colors.accent-green}'
    textColor: '{colors.bg-base}'
  button-secondary:
    backgroundColor: '{colors.bg-base}'
    textColor: '{colors.text-primary}'
    rounded: '{rounded.sm}'
    padding: '12px 20px'
  button-secondary-hover:
    backgroundColor: '{colors.bg-base}'
    textColor: '{colors.accent-blue}'
  card:
    backgroundColor: '{colors.bg-elevated}'
    textColor: '{colors.text-primary}'
    rounded: '{rounded.sm}'
    padding: '24px'
  card-hover:
    backgroundColor: '{colors.bg-elevated}'
    textColor: '{colors.text-primary}'
  input:
    backgroundColor: '{colors.bg-elevated}'
    textColor: '{colors.text-primary}'
    rounded: '{rounded.sm}'
    padding: '8px 12px'
  nav:
    backgroundColor: '{colors.bg-base}'
    textColor: '{colors.text-primary}'
    padding: '16px 24px'
  link-default:
    textColor: '{colors.text-muted}'
  link-hover:
    textColor: '{colors.accent-blue}'
  prompt-marker:
    textColor: '{colors.accent-green}'
    typography: '{typography.display}'
---

## 1. Overview

A dark terminal-aesthetic site for selling agentic-engineering trainings to developers. The visual system mirrors the audience: monospace headings, generous whitespace, semantic glyphs (`>`, `$`, `→`, `//`) carry meaning, and a single accent green earns attention rather than decorating every surface.

**Color strategy: Restrained.** Tinted near-black neutrals (GitHub-dark-derived hues) plus one carrier color (terminal green `#7ee787`) used in <10% of pixels for primary CTAs and focal glyphs. Secondary accents (blue for hover/links, orange for warnings/day-markers, red for errors) appear only at semantic moments.

**Theme: Dark, always.** Audience is engineers reading dense technical specifications during the workday on developer monitors. Dark theme is not a style choice; it matches the IDEs they live in and the registry of the brand register.

**Density.** Headings are bold and prominent (`clamp(2rem, 6vw, 4.5rem)` for hero, monospace) but body text breathes — `max-w-2xl` constraint keeps reading width near 65ch. Section padding stacks at `py-20` to `py-40`, large enough that sections feel like discrete chapters.

**Locale-aware.** NL is primary (`html lang="nl"`). EN is parity-complete. Curriculum module IDs stay English even on the NL page; titles localize. This is deliberate — engineers speak English about MCP/SDLC even in Dutch sentences.

## 2. Colors

The palette is anchored in GitHub's dark mode hue family. All neutrals share a faint cool-blue undertone so the surface reads as "developer terminal" rather than "OLED black-and-white".

| Token                     | Hex                                                                                           | Use                                                                                                                     |
| ------------------------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `bg-base`                 | `#0d1117`                                                                                     | Page background, body, nav background (with 90% alpha + backdrop-blur for stickiness).                                  |
| `bg-elevated`             | `#161b22`                                                                                     | Cards, form inputs, footer, final-CTA band. The only elevation step.                                                    |
| `border-subtle`           | `#30363d`                                                                                     | All borders. Used as a single-pixel boundary; never as a fill.                                                          |
| `text-primary`            | `#c9d1d9`                                                                                     | All body text, headings, primary content. Never used on `accent-green` (use `bg-base` instead for contrast).            |
| `text-muted`              | `#8b949e`                                                                                     | Labels, kickers, meta text, secondary copy. Contrast ratio 4.5:1 against `bg-base` (AA body), passes for ≥18px or bold. |
| `accent-green` `#7ee787`  | Primary CTA fill, `>` prompt markers, success state, focus-adjacent emphasis. ≤10% of pixels. |
| `accent-blue` `#58a6ff`   | Hover state for links and secondary buttons. Focus-ring color. Never used as fill.            |
| `accent-orange` `#f0883e` | Day-1/Day-2 markers in the Basic curriculum split. Rate-limit warning state. Price display.   |
| `accent-red` `#ff7b72`    | Form validation errors. The 404 page glyph. Never used decoratively.                          |

**Do not** introduce a new color without first asking whether one of the four accents already carries that meaning. The palette is closed; that is the point.

## 3. Typography

Two families. JetBrains Mono for everything structural — headings, labels, CTAs, prompt-prefixes — because monospace IS the brand. Inter for body prose where ligature-correct, proportional letterforms aid reading at small sizes.

| Token        | Family         | Size                       | Weight                                    | Use                                           |
| ------------ | -------------- | -------------------------- | ----------------------------------------- | --------------------------------------------- |
| `display`    | JetBrains Mono | `clamp(2rem, 6vw, 4.5rem)` | 700                                       | Hero H1 only. One per page.                   |
| `headline`   | JetBrains Mono | `2.25rem` (lg)             | 600                                       | Section H2 — "Trainings", "About", "Contact". |
| `title`      | JetBrains Mono | `1.125rem`                 | 500                                       | Module title (H4) in curriculum list.         |
| `body`       | Inter          | `1rem`                     | 400                                       | Default paragraph text.                       |
| `body-muted` | Inter          | `0.875rem`                 | 400                                       | Card descriptions, form helper text.          |
| `label`      | JetBrains Mono | `0.75rem`                  | 400, `letter-spacing: 0.2em`, `uppercase` | Kickers, section eyebrows, button text.       |

**Scale ratio.** Steps move by ≥1.25× — `0.75rem → 1rem → 1.125rem → 2.25rem → clamp display`. Avoid intermediate sizes; the scale should feel quantized like a terminal grid.

**Line-length cap.** Body prose is constrained to `max-w-2xl` (~ 42rem ≈ 65ch) regardless of viewport width.

## 4. Elevation

Effectively flat. Two surface layers:

1. `bg-base` (the page).
2. `bg-elevated` (cards, footer, final-CTA, form inputs).

No drop shadows. Separation is done with **borders** (`border-subtle` 1px) and **surface tonality** (`bg-elevated` is ~3.5% lighter than `bg-base`).

The nav uses `bg-bg-base/90 backdrop-blur` to float over content while scrolling — the only effect beyond the two-tier surface scheme. This is rare and purposeful, not a glassmorphism habit.

## 5. Components

### Hero

A single full-width `<section>` with `px-6 py-24 sm:py-32 lg:py-40`. Anatomy:

1. **Kicker** (label typography, `text-muted`) — eyebrow text like `AGENTIC ENGINEERING · NL`.
2. **H1** (display typography) — starts with green `>` glyph + space, then the headline. The `>` is functional: it signals the prompt-like brand metaphor.
3. **Subtitle** (`text-lg`, `text-muted`, `max-w-2xl`).
4. **Two CTAs** — primary green ($ prefix), secondary outlined (→ prefix).

### Trainings Overview Card

Card surface with internal vertical stack:

- Label (duration, `1 dag` / `2 dagen`).
- Title (`>` green prefix + name).
- Body description (tagline, flex-1).
- Price (`accent-orange`, mono, with small `excl. BTW` suffix in muted).
- Link `→ {viewDetails}` (`accent-blue`).

Cards never stack inside cards (absolute ban). Identical-grid card layouts are limited to exactly two side-by-side instances (Basic + Advanced). The instructors snippet on the home uses the same shape but for two instructor cards.

### TrainingDetail

A full-width banded section in `bg-elevated` separated from neighbors by `border-subtle` top-border. Anatomy:

1. **Eyebrow line** combines duration + price + VAT note (mono, label-style, `text-muted`).
2. **H2** with `>` prefix.
3. **Tagline** below.
4. **3-column detail grid** (`audience` / `prerequisites` / `outcomes`) — each item bullets with green `›` glyph instead of generic `·`.
5. **Curriculum** — for Advanced, a single numbered list (`01`, `02`, …); for Basic, a 2-column split with `Dag 1 — integratie` and `Dag 2 — automatisering` markers in orange.
6. Each module line has a numbered prefix, `>` green H4 title, and 3 bullet rows in muted small text.
7. **Book CTA** — primary green button with `$ {bookCta}`.

### Nav

Sticky top, full-width, `bg-bg-base/90 backdrop-blur`, `border-subtle` bottom border. Inside: max-w-6xl row with brand on left (`$ agentic·engineering`, mono), links on right (`Over ons` / `Contact` / `LangSwitcher`). All links are `text-muted` default, `accent-blue` on hover. Active locale in switcher is `accent-green`.

### Form fields

Each field is a `<label>` block with three children:

1. Label (`label` typography, `text-muted`).
2. Input/textarea/select (`bg-elevated`, `border-subtle`, `rounded-sm`, body typography, `px-3 py-2`).
3. Validation error (red, mono-small, prefixed `// `).

Submit button is identical to hero primary CTA. Disabled state is `opacity-60`.

### Banners / status messages

Inline only — never modals. Pattern: `// {label}` in the right semantic color (red for error, orange for rate-limit, green inside an `bg-elevated` rounded panel for success). The `//` prefix is a code-comment metaphor; it earns the design language consistency.

### Glyph vocabulary

These four glyphs carry meaning and recur across the site. They are not decorative:

| Glyph | Color                                         | Meaning                                                                 |
| ----- | --------------------------------------------- | ----------------------------------------------------------------------- |
| `>`   | `accent-green`                                | Prompt prefix on H1/H2/H3 headings — the "page is talking".             |
| `$`   | `accent-green`                                | Shell prefix on primary CTA buttons — the "user is about to act".       |
| `→`   | `text-primary` (or `accent-blue` on hover)    | Secondary link / "more here".                                           |
| `//`  | `text-muted` (or red/orange/green for status) | Comment-style annotation: form helper, status banner, validation error. |
| `›`   | `accent-green`                                | Bullet marker inside detail lists (audience/prereq/outcomes).           |

## 6. Do's and Don'ts

### Do

- **Use `>` on every section H2.** It is the consistent prompt-metaphor anchor.
- **Constrain body width to `max-w-2xl`** even when the section is full-bleed. Reading width over fashion.
- **Pair every accent color with a glyph or icon-position role.** `accent-orange` always means "day marker" or "price"; never "decorative warm tone".
- **Keep CTAs short and lowercase.** `book training`, `view curriculum`, `verzenden`. No title-case marketing verbs.
- **Bake locale awareness into every component.** Don't hard-code "Days". Use `t('duration.basic')` or pass `locale` in props.
- **Use `border-subtle` 1px borders as the dominant separator.** They read as terminal-grid divisions.

### Don't

- **Don't introduce a 5th accent.** If a new state needs color, repurpose blue/orange/red semantically — don't add purple/teal/pink.
- **Don't add box-shadows.** The flat two-layer surface scheme IS the brand. Shadows look like SaaS.
- **Don't use sentence-case marketing exclamations.** `Build the future!` is a banned register.
- **Don't put text on `accent-green` except `bg-base`.** White-on-green fails AA; `text-primary` on green fails AA.
- **Don't nest cards.** The card-grid is exactly one level deep. Detail rows inside a card use indented text + glyphs, not sub-cards.
- **Don't gradient anything.** No gradient backgrounds, no gradient text, no gradient borders. Solids only.
- **Don't animate layout.** Transitions are on `color`, `border-color`, `background-color`, `opacity`, `filter` only — never `width`, `height`, `top`, `padding`. Respect `prefers-reduced-motion` (already clamped to `0.01ms` in `app/globals.css`).
- **Don't replace `>` glyphs with chevrons or arrows.** The glyph is a brand signal; swapping it breaks the metaphor.
