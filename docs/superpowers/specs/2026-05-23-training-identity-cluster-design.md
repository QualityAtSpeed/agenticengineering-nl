# Training identity cluster — "taught by" inside each training-detail block

**Date:** 2026-05-23
**Status:** Approved, ready for implementation plan
**Scope:** Sub-sub-project C1 of the 3-part brand initiative (A merged, B merged, C = training-detail site sections decomposed into C1–C4; C3 merged)

## Problem

Advisor feedback for sub-project C flagged missing site sections: identity, proof-of-identity, explicit 2-day agenda, code/demo, testimonials. C decomposes into C1–C4. C3 (ProofStrip — product proof signals: CI, tests, parity) merged. This spec covers **C1 — identity + proof-of-identity inside each training-detail block**.

Rationale: a visitor evaluating a specific training reads the audience / prerequisites / outcomes / curriculum and lands at the Book CTA without ever meeting the people who teach it. The dedicated instructors `<section>` exists further down the page, but it lives below the ProofStrip and is generic across trainings. Decision-moment credibility belongs inside the training section the visitor is actually evaluating.

## Decisions

| Question                                 | Decision                                                                                                                                                                           |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Flavor of proof                          | Instructor-anchored (face + name + role + bio). Defers track-record badges + per-training credibility blurbs.                                                                      |
| Lineup per training                      | Both Pascal + Inico on both trainings. Mirrors reality (both teach both); symmetric across Basic + Advanced. No per-training lineup data on `Training` yet.                        |
| Placement inside `<TrainingDetail>`      | Between curriculum block and Book CTA. Visitor reads what they buy first, then meets the team, then books.                                                                         |
| Instructor copy depth                    | Reuse `<InstructorCard>` as-is (photo + name + role + full bio). No new bio strings.                                                                                               |
| Existing home `<section>` of instructors | Keep as-is. Slight duplication accepted; deletion would orphan the `/about` "Meet the team →" deep link and remove a credibility anchor for skim-scrollers.                        |
| Implementation shape                     | New `components/TeachingTeam.tsx` wrapper. Matches existing focused-component pattern (`ProofStrip`, `TrainingCard`, `InstructorCard`); keeps `TrainingDetail.tsx` (175 LOC) lean. |
| Heading copy                             | EN `"Taught by"` / NL `"Gegeven door"`. New `trainings.labels.taughtBy` key in both locales.                                                                                       |

## Component shape

- **File:** `components/TeachingTeam.tsx`
- **Props:** `{ ids: InstructorId[] }` — caller supplies the lineup. Today both call sites pass `['pascal', 'inico']`; tomorrow a per-training lineup is a 1-line caller change with no component edit.
- **Structure:**

```tsx
import { useTranslations } from 'next-intl';
import { InstructorCard } from '@/components/InstructorCard';
import type { InstructorId } from '@/data/instructors';

export function TeachingTeam({ ids }: { ids: InstructorId[] }) {
  const t = useTranslations('trainings.labels');
  return (
    <div>
      <h3 className="text-text-muted font-mono text-xs tracking-[0.2em] uppercase">
        {t('taughtBy')}
      </h3>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {ids.map((id) => (
          <InstructorCard key={id} id={id} />
        ))}
      </div>
    </div>
  );
}
```

Component root has no top margin — vertical spacing belongs to the caller (`TrainingDetail`) so the wrapper div can also carry the `data-testid` used by e2e.

Heading uses the same `text-xs uppercase tracking-[0.2em]` rank as the sibling `audience` / `prerequisites` / `outcomes` / `modules` headings inside `TrainingDetail`, so it nests as a content sub-block rather than competing with the training's `<h2>`.

## Placement

`components/TrainingDetail.tsx`, inserted between the curriculum block (currently ends ~line 91) and the Book CTA `<div className="mt-12">`:

```tsx
// …curriculum block…

<div data-testid={`teaching-team-${trainingId}`} className="mt-14">
  <TeachingTeam ids={['pascal', 'inico']} />
</div>

<div className="mt-12">
  <Link …Book CTA…>
```

Imports gain `TeachingTeam` from `@/components/TeachingTeam`. No new prop drilling — `TeachingTeam` reads `useTranslations` itself; `data-testid` lives on the wrapper so `TeachingTeam` stays generic.

Both Basic and Advanced render the same pair because `TrainingDetail` is mounted twice on `app/[locale]/page.tsx`.

## i18n keys

New `taughtBy` key inside the existing `trainings.labels` block in both message files.

### EN — `messages/en.json`

```json
"trainings": {
  "labels": {
    "…": "…existing keys…",
    "taughtBy": "Taught by"
  }
}
```

### NL — `messages/nl.json`

```json
"trainings": {
  "labels": {
    "…": "…existing keys…",
    "taughtBy": "Gegeven door"
  }
}
```

Brand-term policy: pure label, nothing English-fixed. `scripts/verify-i18n.ts` enforces NL/EN parity in CI; both keys are added in the same commit.

No new instructor copy — bios already exist under `about.instructors.{pascal,inico}` and `<InstructorCard>` reads them.

## Tests

### Unit / component — new `tests/components/TeachingTeam.test.tsx`

- Renders EN heading `"Taught by"` when wrapped with EN `<NextIntlClientProvider>`.
- Renders NL heading `"Gegeven door"` when wrapped with NL provider.
- With `ids={['pascal', 'inico']}`, both instructor names appear (`Pascal Dufour`, `Inico Veringa`).
- With `ids={['pascal']}`, only Pascal appears (proves prop wires through).

Setup mirrors `tests/components/ProofStrip.test.tsx` provider pattern.

### Unit — `tests/components/TrainingDetail.test.tsx`

Add 1 assertion: the cluster heading is present in the rendered Basic and Advanced sections (`getByText(/taught by|gegeven door/i)`). No rewrite of the file.

### E2E — `e2e/smoke.spec.ts`

In both NL and EN home tests, assert the cluster renders inside each training-detail section. Use the `data-testid="teaching-team-${trainingId}"` wrapper (defined in the Placement section) to avoid conflating with the dedicated instructors section further down the page that contains the same names.

E2E assertions per locale:

```ts
const basicTeam = page.getByTestId('teaching-team-basic');
await expect(basicTeam).toBeVisible();
await expect(basicTeam).toContainText('Pascal Dufour');
await expect(basicTeam).toContainText('Inico Veringa');

const advancedTeam = page.getByTestId('teaching-team-advanced');
await expect(advancedTeam).toBeVisible();
await expect(advancedTeam).toContainText('Pascal Dufour');
await expect(advancedTeam).toContainText('Inico Veringa');
```

### A11y

No new spec. `e2e/a11y.spec.ts` axe scan on `/en` and `/nl` covers home; new heading + grid of existing `<InstructorCard>`s introduces no new axe surface (cards already pass).

### i18n parity

`scripts/verify-i18n.ts` runs in CI. New `trainings.labels.taughtBy` added to both locale files in the same commit; no separate guard.

## Out of scope

Explicitly deferred:

- Per-training lineup data (`leadInstructorId` field on `Training`) — both trainings hard-code `['pascal', 'inico']`.
- Per-(instructor, training) credibility blurb — bios stay generic from `about.instructors.*`.
- Removing or restructuring the dedicated instructors `<section>` on home.
- Track-record proof badges (orgs trained, talks given, NPS, certifications) — separate sub-project.
- C2 (visual 2-day agenda timeline) — separate sub-sub-project spec.
- C4 (testimonials / customer outcomes) — separate sub-sub-project, blocked on real content.
- Hero / meta / footer copy changes.
- `data/instructors.ts` shape changes.
- New external dependencies.
- `DESIGN.md` / `PRODUCT.md` updates (defer; revisit if cluster pattern recurs).

## Rollback

Single PR. Revert removes:

- `components/TeachingTeam.tsx`
- `trainings.labels.taughtBy` keys in `messages/en.json` and `messages/nl.json`
- 1-line import + wrapper-div insertion in `components/TrainingDetail.tsx`
- `tests/components/TeachingTeam.test.tsx`
- 1 assertion in `tests/components/TrainingDetail.test.tsx`
- E2E assertions in `e2e/smoke.spec.ts`

No data migrations, no schema changes, no shared dep changes.

## Verification

- `pnpm typecheck` — green
- `pnpm lint` — green
- `pnpm test` — all unit + component pass, new `TeachingTeam` test included
- `pnpm test:e2e` — all e2e suites pass, new smoke assertions included
- `pnpm verify:i18n` — `i18n integrity OK`
- Manual `pnpm dev`:
  - `/en` Basic detail shows `"Taught by"` heading + Pascal + Inico cards (photo + name + role + bio) above the green "Plan this training" button. Advanced detail mirrors.
  - `/nl` same with `"Gegeven door"` heading and Dutch UI labels.
  - Existing dedicated instructors section below ProofStrip still present and unchanged.
  - Existing `audience` / `prerequisites` / `outcomes` / curriculum blocks unchanged.
