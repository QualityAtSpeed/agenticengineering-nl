# Proof strip — "we ship what we teach" signals on home page

**Date:** 2026-05-23
**Status:** Approved, ready for implementation plan
**Scope:** Sub-sub-project C3 of the 3-part brand initiative (A merged, B merged, C = training-detail site sections decomposed into C1–C4)

## Problem

Advisor feedback for sub-project C identified missing site sections: identity, proof-of-identity, explicit 2-day agenda, code/demo, testimonials. C decomposes into 4 sub-sub-projects (C1–C4). This spec covers **C3 — code/demo proof signals**.

Rationale: the audience is engineering teams evaluating a training operator. The single most convincing piece of evidence the operator is competent is the site itself — it runs the stack the training teaches (TypeScript strict, CI green, axe a11y AA, NL/EN locale parity). Surface that evidence in a compact strip and link the repository so prospects can inspect.

## Decisions

| Question                | Decision                                                                                                                                                            |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Section name            | Proof strip                                                                                                                                                         |
| Scope                   | Static text pills + GitHub CTA. No live badges (shields.io rejected). No screenshots. No syntax-highlighted code.                                                   |
| Placement               | Home page, between the two `<TrainingDetail />` blocks and the Instructors section. Single instance, generic across trainings.                                      |
| New component           | `components/ProofStrip.tsx`                                                                                                                                         |
| GitHub URL              | Hard-coded `https://github.com/QualityAtSpeed/agenticengineering-nl` (locale-agnostic, NOT i18n'd)                                                                  |
| Test-count drift policy | Accept manual sweep when test counts change substantially. Counts live in i18n strings, one edit per locale.                                                        |
| Implementation          | New component + i18n keys + one home-page insertion + new unit test + small e2e addition. No external dependencies. No `data/` changes. No DESIGN.md changes (yet). |

## Component shape

- **File:** `components/ProofStrip.tsx`
- **Props:** `{ locale: Locale }` (mirrors `TrainingDetail` shape)
- **Structure:**

```tsx
<section className="border-border-subtle border-t px-6 py-20">
  <div className="mx-auto max-w-5xl">
    <h2 className="text-text-primary font-mono text-3xl">
      <span className="text-accent-green">&gt;</span> {t('heading')}
    </h2>
    <p className="text-text-muted mt-3 max-w-2xl">{t('subhead')}</p>

    <ul className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-sm">
      {pills.map((p, i) => (
        <li key={p} className="text-text-primary">
          {i > 0 && <span className="text-accent-green mr-3">·</span>}
          {p}
        </li>
      ))}
    </ul>

    <Link
      href="https://github.com/QualityAtSpeed/agenticengineering-nl"
      target="_blank"
      rel="noopener noreferrer"
      data-testid="proof-github-link"
      className="bg-accent-green text-bg-base mt-10 inline-flex items-center gap-2 rounded-sm px-5 py-3 font-mono text-sm font-semibold hover:brightness-110"
    >
      {t('ctaLabel')} →
    </Link>
  </div>
</section>
```

## Placement

`app/[locale]/page.tsx`, inserted between the two `TrainingDetail` calls and the existing Instructors `<section>`:

```tsx
<TrainingDetail trainingId="basic" locale={locale} />
<TrainingDetail trainingId="advanced" locale={locale} />

<ProofStrip locale={locale} />          {/* new */}

<section …instructors…>
…
```

## i18n keys

New top-level `proof` object in both `messages/en.json` and `messages/nl.json`.

### EN

```json
"proof": {
  "heading": "We ship what we teach.",
  "subhead": "This site runs the stack you'll learn. Source open, CI live, parity enforced.",
  "pills": [
    "CI green",
    "48 unit + 64 e2e tests",
    "WCAG 2.1 AA",
    "TypeScript strict",
    "NL/EN locale parity enforced"
  ],
  "ctaLabel": "view source on GitHub"
}
```

### NL

```json
"proof": {
  "heading": "We leveren wat we trainen.",
  "subhead": "Deze site draait op de stack die je leert. Source open, CI live, pariteit afgedwongen.",
  "pills": [
    "CI groen",
    "48 unit + 64 e2e tests",
    "WCAG 2.1 AA",
    "TypeScript strict",
    "NL/EN locale-pariteit afgedwongen"
  ],
  "ctaLabel": "bekijk source op GitHub"
}
```

Brand-term policy: `CI`, `TypeScript`, `WCAG`, `GitHub`, `e2e` stay English (consistent with sub-projects A + B).

## Tests

### Unit / component — new `tests/components/ProofStrip.test.tsx`

- Renders heading + subhead text (EN provider).
- Renders exactly 5 pills (`<li>` elements) from the i18n array.
- GitHub CTA link present with:
  - `href="https://github.com/QualityAtSpeed/agenticengineering-nl"`
  - `target="_blank"`
  - `rel="noopener noreferrer"`
- Repeat with NL provider — assert NL heading text shows.

### E2E — addition to `e2e/smoke.spec.ts`

In both EN and NL home tests, assert:

```ts
const link = page.getByTestId('proof-github-link');
await expect(link).toBeVisible();
await expect(link).toHaveAttribute(
  'href',
  'https://github.com/QualityAtSpeed/agenticengineering-nl',
);
```

No new test file; extend existing tests.

### A11y

No new spec. `e2e/a11y.spec.ts` axe scan on `/en` and `/nl` already covers the home route. New section is text + button — axe will validate contrast + landmarks automatically.

### i18n parity

`scripts/verify-i18n.ts` runs in CI and compares EN/NL key sets. New `proof.*` keys added to both files in the same commit; no separate guard needed.

## Out of scope

Explicitly deferred:

- C1 (identity + proof cluster on training detail) — separate sub-sub-project spec
- C2 (visual 2-day agenda timeline) — separate sub-sub-project spec
- C4 (testimonials / customer outcomes) — separate sub-sub-project, blocked on real content
- Live shields.io badges
- Screenshots / image assets
- Dynamic test-count fetching at build time
- Hero / meta / footer copy changes
- `data/trainings.ts` changes
- Module copy changes
- New external dependencies
- Test-count drift automation
- PRODUCT.md / DESIGN.md doc updates (defer; this section is one-off; if pattern recurs, document then)

## Rollback

Single PR. Revert removes:

- `components/ProofStrip.tsx`
- `proof.*` keys from `messages/en.json` and `messages/nl.json`
- `<ProofStrip />` insertion in `app/[locale]/page.tsx`
- `tests/components/ProofStrip.test.tsx`
- e2e additions in `e2e/smoke.spec.ts`

No data migrations, no schema changes, no shared dep changes.

## Verification

- `pnpm typecheck` — green
- `pnpm lint` — green
- `pnpm test` — all unit + component pass, new ProofStrip test included
- `pnpm test:e2e` — all e2e suites pass, new smoke assertions included
- `pnpm verify:i18n` — `i18n integrity OK` (new `proof.*` keys mirror EN/NL)
- Manual `pnpm dev`:
  - `/en` shows the proof strip between TrainingDetail and Instructors with heading, subhead, 5 pills with `·` separators, and a green "view source on GitHub →" button that opens `https://github.com/QualityAtSpeed/agenticengineering-nl` in a new tab.
  - `/nl` mirrors with Dutch copy.
  - Existing TrainingDetail, Instructors, and final CTA sections unchanged.
