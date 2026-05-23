# Day-agenda pill strip — scannable rhythm above the dense curriculum

**Date:** 2026-05-23
**Status:** Approved, ready for implementation plan
**Scope:** Sub-sub-project C2 of the 3-part brand initiative (A merged, B merged, C = training-detail site sections decomposed into C1–C4; C1 + C3 merged, C4 deferred on content)

## Problem

Advisor feedback for sub-project C flagged missing site sections: identity, proof-of-identity, **explicit 2-day agenda**, code/demo, testimonials. C decomposes into C1–C4. C1 (TeachingTeam) and C3 (ProofStrip) merged. This spec covers **C2 — visual 2-day agenda timeline inside each training-detail block**.

Rationale: Basic currently renders Day 1 / Day 2 as two parallel columns of full `CurriculumList` items (sketch icon + title + 3 bullets per module). 11 modules × 4 lines each is dense. A visitor evaluating the offer wants to see "what is the rhythm over the two days" in seconds before deciding whether to read the deep bullets. Advanced's 5-module single column has the same problem at smaller scale.

A compressed pill strip per day, sitting above the existing dense curriculum, gives a 5-second rhythm scan without removing the depth.

## Decisions

| Question                             | Decision                                                                                                                                                                                                                                    |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Strip shape                          | Compressed pill row per day. Numbered (`01 · 02 · …`), `·` separator, mono. No icons, no hover-reveal, no time-of-day grouping.                                                                                                             |
| Advanced training                    | Gets one single-row strip for symmetry. Same component, no day label.                                                                                                                                                                       |
| Pill text source                     | New `modules.<id>.short` i18n key. Hand-picked 2-4 word labels per locale (16 modules × 2 = 32 new strings).                                                                                                                                |
| Placement inside `<TrainingDetail>`  | Inside the existing modules block, between the `MODULES` `<h3>` and the dense 2-col Day-1/Day-2 curriculum. Strip = fast scan, curriculum below = deep read.                                                                                |
| Implementation shape                 | New `components/DayAgenda.tsx` with props `{ label?: string; modules: Module[] }`. `TrainingDetail` mounts it 2× for Basic (Day 1, Day 2 with filtered modules), 1× for Advanced (no label, all modules).                                   |
| Day labels                           | Reuse existing `trainings.labels.day1` / `day2` (the same strings the dense curriculum uses). No new label i18n.                                                                                                                            |
| Numbering scope                      | Per-strip (Basic Day-2 restarts numbering from `01`). Matches the existing `CurriculumList` per-day numbering.                                                                                                                              |
| Test-count drift on module catalogue | Add a new sweep test `tests/i18n/module-short-keys.test.ts` that iterates every `ModuleId` and asserts `en.modules[id].short` + `nl.modules[id].short` exist. Closes the gap noted in issue #11 follow-ups.                                 |
| Brand-term policy in NL pills        | `MCP`, `SDLC`, `governance`, `Agent harnessing`, `Team rollout`, `Window mechanics`, `Skills`, `rules` stay English. Only `Regressie + gov`, `Capstone-lab`, `Feature opleveren`, `Context architecture` diverge for natural Dutch reading. |

## Component shape

- **File:** `components/DayAgenda.tsx`
- **Props:** `{ label?: string; modules: Module[] }` — caller supplies pre-localized row label (omit for Advanced single-row). `modules` is the already-filtered array.
- **Structure:**

```tsx
import { useTranslations } from 'next-intl';
import type { Module } from '@/data/trainings';

export function DayAgenda({ label, modules }: { label?: string; modules: Module[] }) {
  const t = useTranslations('modules');
  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2 font-mono text-sm">
      {label && (
        <span className="text-accent-orange shrink-0 text-xs tracking-[0.2em] uppercase">
          {label}
        </span>
      )}
      {modules.map((m, i) => (
        <span key={m.id} className="text-text-primary">
          {i > 0 && <span className="text-accent-green mr-3">·</span>}
          <span className="text-text-muted mr-1">{String(i + 1).padStart(2, '0')}</span>
          {t(`${m.id}.short`)}
        </span>
      ))}
    </div>
  );
}
```

Single flex row, wraps on narrow viewports. Mono + green-dot separator pattern matches the `ProofStrip` rhythm. Label styled like the existing `text-accent-orange font-mono text-xs` day-label in the dense curriculum so visual hierarchy holds.

## i18n keys

New `short` field added as sibling of `title` and `bullets` inside each existing `modules.<id>` block. 16 ids × 2 locales = 32 new strings. Both files updated in the same commit so `scripts/verify-i18n.ts` parity check stays green.

### EN — `messages/en.json`

**Basic Day 1**

- `agents-in-sdlc.short`: `Agents in SDLC`
- `failure-modes-ai-code.short`: `Failure modes`
- `test-first-with-agents.short`: `Test-first`
- `hooks-and-quality-gates.short`: `Hooks + gates`
- `build-first-feature.short`: `Capstone lab`
- `regression-and-governance.short`: `Regression + gov`

**Basic Day 2**

- `context-architecture.short`: `Context arch`
- `context-window-mechanics.short`: `Window mechanics`
- `using-mcp-servers.short`: `MCP servers`
- `intro-skills-rules.short`: `Skills + rules`
- `capstone-ship-feature.short`: `Ship feature`

**Advanced**

- `team-rollout-playbook.short`: `Team rollout`
- `agent-harnessing.short`: `Agent harnessing`
- `governance-and-policy-gates.short`: `Governance gates`
- `observability-and-cost.short`: `Observability + cost`
- `capstone-rollout-tabletop.short`: `Rollout tabletop`

### NL — `messages/nl.json`

**Basic Day 1**

- `agents-in-sdlc.short`: `Agents in SDLC`
- `failure-modes-ai-code.short`: `Failure modes`
- `test-first-with-agents.short`: `Test-first`
- `hooks-and-quality-gates.short`: `Hooks + gates`
- `build-first-feature.short`: `Capstone-lab`
- `regression-and-governance.short`: `Regressie + gov`

**Basic Day 2**

- `context-architecture.short`: `Context architecture`
- `context-window-mechanics.short`: `Window mechanics`
- `using-mcp-servers.short`: `MCP servers`
- `intro-skills-rules.short`: `Skills + rules`
- `capstone-ship-feature.short`: `Feature opleveren`

**Advanced**

- `team-rollout-playbook.short`: `Team rollout`
- `agent-harnessing.short`: `Agent harnessing`
- `governance-and-policy-gates.short`: `Governance gates`
- `observability-and-cost.short`: `Observability + cost`
- `capstone-rollout-tabletop.short`: `Rollout tabletop`

## Placement

`components/TrainingDetail.tsx`, inside the existing modules block (the `<div className="mt-14">` wrapping the `MODULES` heading and the dense curriculum). Insert the agenda wrapper between the `<h3>` and the dense curriculum branching:

```tsx
<div className="mt-14">
  <h3 className="text-text-muted font-mono text-sm tracking-[0.2em] uppercase">
    {tCommon('modules')}
  </h3>

  <div data-testid={`agenda-${trainingId}`} className="mt-6 space-y-3">
    {training.durationDays === 2 ? (
      <>
        <DayAgenda label={tCommon('day1')} modules={modulesDay1} />
        <DayAgenda label={tCommon('day2')} modules={modulesDay2} />
      </>
    ) : (
      <DayAgenda modules={training.modules} />
    )}
  </div>

  {/* existing dense curriculum, unchanged */}
  {training.durationDays === 2 ? (
    <div className="mt-6 grid gap-12 lg:grid-cols-2">…</div>
  ) : (
    <div className="mt-6">…</div>
  )}
</div>
```

- Wrapper div carries `data-testid="agenda-${trainingId}"` so e2e can scope to Basic vs Advanced without conflating with dense-curriculum text.
- `space-y-3` stacks the two Basic rows; Advanced renders one row only.
- `modulesDay1` and `modulesDay2` are already computed at the top of `TrainingDetail` (existing `training.modules.filter((m) => m.day === 1 …)`).
- Imports gain `DayAgenda` from `@/components/DayAgenda`.

## Tests

### Unit / component — new `tests/components/DayAgenda.test.tsx`

- Renders no label when `label` prop omitted.
- Renders the supplied label as an uppercase mono prefix when provided.
- With 3 modules, renders 3 numbered items (`01`, `02`, `03`).
- Looks up `t('${id}.short')` per module — assert one EN short (`Failure modes`) appears under EN provider when given `[{ id: 'failure-modes-ai-code', day: 1 }]`.
- Renders the NL short (`Feature opleveren` for `capstone-ship-feature`) under NL provider.

5 test cases. Setup mirrors `tests/components/TeachingTeam.test.tsx` provider pattern.

### Unit — `tests/components/TrainingDetail.test.tsx`

Add 2 new `it()` blocks as siblings inside the existing `describe`:

- **Basic renders two agenda rows** — assert both day labels (`Dag 1 —`, `Dag 2 —`) appear at the agenda position, AND assert one Day-1 NL short (`Failure modes`) and one Day-2 NL short (`Feature opleveren`) appear. Confirms wire-in mounts twice with correct module split.
- **Advanced renders one agenda row** — assert one Advanced NL short (`Team rollout`) appears. Confirms single-row branch.

`renderDetail` helper (NL locale) is reused; no new imports. Existing day-split assertions already match `/Dag 1 —/i` and `/Dag 2 —/i` against the dense curriculum's `<p>` labels — the new agenda labels reuse the same strings (`tCommon('day1')`), so existing tests still pass without becoming ambiguous because they use `getByText` and both occurrences resolve identically — see Risk note below.

**Risk note + mitigation:** the existing `<p className="text-accent-orange font-mono text-xs">{tCommon('day1')}</p>` inside the dense curriculum and the new `<span>{tCommon('day1')}</span>` inside `DayAgenda` will both contain the string `Dag 1 —`. Existing tests use `screen.getByText(/Dag 1 —/i)` which is single-element — `getByText` throws when multiple matches exist. Mitigation: the two existing 2-day-split tests that look up `Dag 1 —` / `Dag 2 —` (`renders a day split when durationDays === 2` and `uses durationDays to gate the day split`) change to `screen.getAllByText(/Dag 1 —/i).length >= 1` (or equivalent). The third existing test (`does NOT render a day split when durationDays === 1`) is unaffected — Advanced renders 0 day labels (still 0 with the new agenda since Advanced calls `<DayAgenda>` without a label). This is a deliberate, localized loosening — the tests still prove "Dag 1 label is present in the rendered DOM"; they just stop pinning "exactly one occurrence". An alternative (changing the dense curriculum's day label to a different string) is rejected because it would break visual consistency.

### i18n integration sweep — new `tests/i18n/module-short-keys.test.ts`

Iterate over every `ModuleId` referenced by `trainings` in `data/trainings.ts`. Assert `en.modules[id].short` and `nl.modules[id].short` exist and are non-empty strings. Failure mode: adding a module to `data/trainings.ts` without `short` keys in both locales fails CI. This also addresses the integration-test gap originally flagged in issue #11 follow-ups (scoped here only to `short`; `title` / `bullets` parity stays out of scope).

### E2E — `e2e/smoke.spec.ts`

Both NL and EN home tests gain 4 assertions:

```ts
const basicAgenda = page.getByTestId('agenda-basic');
await expect(basicAgenda).toBeVisible();
await expect(basicAgenda).toContainText('Failure modes');

const advancedAgenda = page.getByTestId('agenda-advanced');
await expect(advancedAgenda).toBeVisible();
await expect(advancedAgenda).toContainText('Team rollout');
```

`Failure modes` is identical EN/NL (brand-term retained), so the same string works in both locale tests. `Team rollout` likewise.

### A11y

No new spec. `e2e/a11y.spec.ts` axe scan on `/en` and `/nl` covers home; new strip is plain text in a flex container — no new axe surface.

### i18n parity

`scripts/verify-i18n.ts` enforces NL/EN key-set parity. All 32 new `short` entries added to both locale files in the same commit; no separate guard required.

## Out of scope

Explicitly deferred:

- Time-of-day slots / morning–afternoon split on `Module` data.
- Expandable / collapsible curriculum (strip replacing dense view) — both views stay.
- Hover-revealed full titles or tooltips on pills.
- Per-pill icons (sketch icons stay only in the dense `CurriculumList`).
- Sticky / scrollspy interaction.
- DESIGN.md / PRODUCT.md updates (defer; revisit if pattern recurs).
- Hero / meta / footer / final-CTA copy changes.
- `Module` type changes in `data/trainings.ts`.
- New external dependencies.
- C4 (testimonials / customer outcomes) — separate sub-sub-project, blocked on real content.

## Rollback

Single PR. Revert removes:

- `components/DayAgenda.tsx`
- 32 `modules.<id>.short` entries (16 EN + 16 NL) in `messages/{en,nl}.json`
- 1-line import + agenda wrapper-div block in `components/TrainingDetail.tsx`
- `tests/components/DayAgenda.test.tsx`
- 2 added test cases + `getByText` → `getAllByText` loosening in `tests/components/TrainingDetail.test.tsx`
- `tests/i18n/module-short-keys.test.ts`
- E2E assertions in `e2e/smoke.spec.ts`

No data, schema, or shared-dep changes.

## Verification

- `pnpm typecheck` — green
- `pnpm lint` — green
- `pnpm test` — all unit + component pass; new `DayAgenda` test (5), new `TrainingDetail` cases (2), new `module-short-keys` sweep (1)
- `pnpm test:e2e` — all e2e pass, including new smoke assertions
- `pnpm verify:i18n` — `i18n integrity OK` (32 new keys mirror EN/NL)
- Manual `pnpm dev`:
  - `/en` Basic detail: under MODULES heading, two pill rows (`DAY 1 — 01 Agents in SDLC · 02 Failure modes · 03 Test-first · 04 Hooks + gates · 05 Capstone lab · 06 Regression + gov`, `DAY 2 — 01 Context arch · 02 Window mechanics · 03 MCP servers · 04 Skills + rules · 05 Ship feature`) sit above the existing dense Day-1/Day-2 columns. Existing dense curriculum, audience/prereq/outcomes, TeachingTeam, Book CTA all unchanged.
  - `/en` Advanced detail: single pill row (`01 Team rollout · 02 Agent harnessing · 03 Governance gates · 04 Observability + cost · 05 Rollout tabletop`) above the existing single-column curriculum.
  - `/nl` mirrors with Dutch shorts where they differ (`Feature opleveren`, `Regressie + gov`, `Capstone-lab`, `Context architecture`).
