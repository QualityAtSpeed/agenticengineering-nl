# Testimonials section — design

**Date:** 2026-06-24
**Status:** Approved, pending implementation plan

## Summary

Add a testimonials section to the homepage. It displays short participant quotes with attribution (name + role/company) in a responsive card grid, matching the existing Instructors section. Content is built structure-first: the data model and section ship now with placeholder testimonials, and the section stays hidden behind a feature flag until real content exists.

## Goals

- A homepage section that presents social-proof quotes in a way consistent with the site's text-forward, terminal-native aesthetic.
- A typed data model that is trivial to edit by hand as real testimonials arrive.
- Zero visibility until explicitly enabled, so placeholder content never reaches production.

## Non-goals (YAGNI)

- No avatar photos, company logos, or star ratings.
- No carousel/slider or client-side interactivity — pure server-rendered HTML.
- No schema.org `Review`/`AggregateRating` markup (see Decisions).
- No CMS/admin UI — placeholder and real content are edited directly in the typed data file.
- No per-locale translation of quote bodies.

## Decisions

| Decision | Choice | Rationale |
| --- | --- | --- |
| Content readiness | Structure-first with placeholder content | No real testimonials yet; build the model + section now, swap content in later. |
| Fields per testimonial | Quote + name + role/company | Clean, image-free, matches the developer-focused tone; no asset/permission work. |
| i18n of quotes | Verbatim, identical in NL and EN | Quotes show in the words given. Only section heading/lede are translated, keeping quote bodies out of the `verify:i18n` parity gate. |
| Placement | After Trainings, before `ProofStrip` | Social proof immediately after the offering. |
| Rendering | Static responsive card grid (server component) | Mirrors the Instructors section line-for-line; no client JS; good for crawler discoverability. |
| Structured data | None | Google excludes "self-serving" reviews (about your own org, on your own site) from rich-result eligibility (policy since 2019) and they risk a manual action. Render as semantic `blockquote`/`cite` only. |

## Architecture

The homepage (`app/[locale]/page.tsx`) is a stack of server-rendered `<section>` blocks driven by `next-intl` translations and typed `data/*.ts` records. This feature follows that pattern exactly, adding one data file, one flag helper, one component, one i18n namespace, and one section insertion.

### Data model — `data/testimonials.ts`

Typed array, mirroring `data/instructors.ts`. Content is verbatim (not translated).

```ts
export type Testimonial = {
  id: string; // stable slug, e.g. 'acme-lead'
  quote: string; // verbatim quote text
  name: string; // "Jane Doe"
  role: string; // free-form attribution, e.g. "Lead Engineer, Acme"
};

export const testimonials: Testimonial[] = [
  // 2–3 placeholder entries to ship the structure
];
```

Attribution (`name`, `role`) lives in this file too — verbatim — so nothing testimonial-specific touches the i18n parity gate.

### Feature flag + empty guard — `lib/flags.ts`

Add a sibling to the existing `blogsEnabled()`:

```ts
export function testimonialsEnabled(): boolean {
  return process.env.TESTIMONIALS_ENABLED === 'true';
}
```

The homepage renders the section only when `testimonialsEnabled() && testimonials.length > 0`. Double-gated: hidden until the flag is flipped **and** content exists. Default (unset) = hidden, matching the `BLOGS_ENABLED` convention.

### Component — `components/TestimonialCard.tsx`

Server component, structurally a clone of `InstructorCard` but text-only:

```
<article>
  <blockquote>{quote}</blockquote>
  <cite>{name} — {role}</cite>   // semantic cite, not styled italic
</article>
```

Uses the established card styling (`border-border-subtle hover:border-brand bg-bg-base rounded-md border`) and design tokens.

### Section insertion — `app/[locale]/page.tsx`

Inserted after the Trainings section and before `<ProofStrip/>`. Uses the standard section shell (`border-border-subtle border-b px-6 py-20`, inner `max-w-5xl`), a `text-brand` heading and `text-text-soft` lede from the new `testimonials` namespace, and the same `grid gap-5 md:grid-cols-2` grid as Instructors. The entire section is wrapped in the flag + non-empty guard.

### i18n — new `testimonials` namespace

Add to **both** `messages/nl.json` and `messages/en.json`:

```json
"testimonials": { "title": "...", "lede": "..." }
```

Only these two keys; quote bodies stay in the data file. Add `testimonials` to the namespaces list in the README. `verify:i18n` stays green.

## Data flow

```
data/testimonials.ts (verbatim records)
        │
        ▼
app/[locale]/page.tsx
  ├─ testimonialsEnabled() && testimonials.length > 0  ──false──▶ section omitted
  └─ true ─▶ <section> heading/lede from `testimonials` namespace
              └─ testimonials.map ─▶ <TestimonialCard quote name role />
```

## Error handling / edge cases

- **Flag off or no content:** section is not rendered at all (no empty heading, no layout gap).
- **Long quotes / long names:** card uses normal flow text wrapping; no truncation, consistent with other cards.
- **Single testimonial:** grid renders one card in the first column — acceptable, no special-casing.

## Testing

- `tests/components/TestimonialCard.test.tsx` (Vitest + Testing Library), mirroring existing component tests:
  - Renders the quote text and the attribution (name + role).
  - Uses semantic `blockquote` and `cite` elements (a11y).
- Homepage-level gating assertion: section hidden when the flag is off or `testimonials` is empty; visible when both conditions hold.
- Playwright e2e already enables feature flags via `playwright.config.ts` (as with `BLOGS_ENABLED`); the testimonials flag is enabled there so the section is exercised in e2e/a11y runs.

## Documentation (required, same commit)

The `readme-check` pre-commit hook blocks commits when new env vars / files / behavior are undocumented. The same change set updates `README.md`:

- New `TESTIMONIALS_ENABLED` env var in the environment-variables table and the Feature flags section.
- `.env.example` entry for `TESTIMONIALS_ENABLED`.
- `data/testimonials.ts` and `components/TestimonialCard.tsx` in the layout/structure listing.
- `testimonials` added to the i18n namespaces list.

## Files touched

| File | Change |
| --- | --- |
| `data/testimonials.ts` | New — typed records + placeholders |
| `lib/flags.ts` | Add `testimonialsEnabled()` |
| `components/TestimonialCard.tsx` | New — server component |
| `app/[locale]/page.tsx` | Insert gated section after Trainings |
| `messages/nl.json`, `messages/en.json` | New `testimonials` namespace (title, lede) |
| `tests/components/TestimonialCard.test.tsx` | New — unit tests |
| `playwright.config.ts` | Enable `TESTIMONIALS_ENABLED` for e2e |
| `README.md`, `.env.example` | Document the new flag, files, namespace |
