# Day-Agenda Pill Strip Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a scannable pill-strip "day agenda" inside each `<TrainingDetail>` block. Each module renders as a numbered pill with a short i18n label. Basic renders 2 rows (Day 1 + Day 2); Advanced renders 1 row. The strip sits inside the existing modules block, above the dense `CurriculumList`, so visitors get a 5-second rhythm before the deep read.

**Architecture:** New `<DayAgenda />` component takes `{ label?: string; modules: Module[] }` and renders one horizontal flex-wrap row. New `modules.<id>.short` i18n keys (16 modules × 2 locales = 32 strings). A new `tests/i18n/module-short-keys.test.ts` sweep iterates every `ModuleId` and asserts the short keys exist in both locales. `TrainingDetail` mounts `<DayAgenda>` twice for Basic (Day 1 + Day 2 filtered modules), once for Advanced (no label, all modules). Existing dense `CurriculumList` blocks stay unchanged. Two existing unit tests that pin "exactly one occurrence" of `Dag 1 —` / `Dag 2 —` loosen to `getAllByText(...).length >= 1` because the day labels now appear in both the new agenda row AND the existing dense column header.

**Tech Stack:** Next.js 15 App Router (RSC), next-intl, Tailwind CSS v4, Vitest + Testing Library, Playwright.

**Spec:** `docs/superpowers/specs/2026-05-23-day-agenda-timeline-design.md`

---

### Task 0: Confirm branch + clean tree

**Files:** none

- [ ] **Step 1: Confirm on feature branch + clean tree**

Run:

```bash
git status
git branch --show-current
git log --oneline -1
```

Expected: clean tree, branch `feat/day-agenda`, last commit `docs(spec): day-agenda pill strip — scannable rhythm above dense curriculum`.

---

### Task 1: Add 32 `modules.<id>.short` i18n keys (atomic EN + NL commit)

**Files:**

- Modify: `messages/en.json`
- Modify: `messages/nl.json`

Both files updated programmatically in one commit so `scripts/verify-i18n.ts` parity stays green.

- [ ] **Step 1: Add EN short keys via node script**

Run from repo root:

```bash
node -e '
const fs = require("fs");
const path = "messages/en.json";
const data = JSON.parse(fs.readFileSync(path, "utf-8"));
const shorts = {
  "agents-in-sdlc": "Agents in SDLC",
  "failure-modes-ai-code": "Failure modes",
  "test-first-with-agents": "Test-first",
  "hooks-and-quality-gates": "Hooks + gates",
  "build-first-feature": "Capstone lab",
  "regression-and-governance": "Regression + gov",
  "context-architecture": "Context arch",
  "context-window-mechanics": "Window mechanics",
  "using-mcp-servers": "MCP servers",
  "intro-skills-rules": "Skills + rules",
  "capstone-ship-feature": "Ship feature",
  "team-rollout-playbook": "Team rollout",
  "agent-harnessing": "Agent harnessing",
  "governance-and-policy-gates": "Governance gates",
  "observability-and-cost": "Observability + cost",
  "capstone-rollout-tabletop": "Rollout tabletop"
};
Object.entries(shorts).forEach(([id, short]) => {
  if (!data.modules[id]) throw new Error("missing module: " + id);
  data.modules[id].short = short;
});
fs.writeFileSync(path, JSON.stringify(data, null, 2) + "\n");
console.log("en: added " + Object.keys(shorts).length + " short keys");
'
```

Expected: `en: added 16 short keys`. If the script throws `missing module: …`, the EN file is out of sync with `data/trainings.ts` — STOP and report.

- [ ] **Step 2: Add NL short keys via node script**

Run:

```bash
node -e '
const fs = require("fs");
const path = "messages/nl.json";
const data = JSON.parse(fs.readFileSync(path, "utf-8"));
const shorts = {
  "agents-in-sdlc": "Agents in SDLC",
  "failure-modes-ai-code": "Failure modes",
  "test-first-with-agents": "Test-first",
  "hooks-and-quality-gates": "Hooks + gates",
  "build-first-feature": "Capstone-lab",
  "regression-and-governance": "Regressie + gov",
  "context-architecture": "Context architecture",
  "context-window-mechanics": "Window mechanics",
  "using-mcp-servers": "MCP servers",
  "intro-skills-rules": "Skills + rules",
  "capstone-ship-feature": "Feature opleveren",
  "team-rollout-playbook": "Team rollout",
  "agent-harnessing": "Agent harnessing",
  "governance-and-policy-gates": "Governance gates",
  "observability-and-cost": "Observability + cost",
  "capstone-rollout-tabletop": "Rollout tabletop"
};
Object.entries(shorts).forEach(([id, short]) => {
  if (!data.modules[id]) throw new Error("missing module: " + id);
  data.modules[id].short = short;
});
fs.writeFileSync(path, JSON.stringify(data, null, 2) + "\n");
console.log("nl: added " + Object.keys(shorts).length + " short keys");
'
```

Expected: `nl: added 16 short keys`.

- [ ] **Step 3: Normalize formatting with Prettier**

Run:

```bash
pnpm exec prettier --write messages/en.json messages/nl.json
```

Expected: `messages/en.json`, `messages/nl.json` reformatted in-place (matches lefthook pre-commit format check).

- [ ] **Step 4: Validate both JSON files parse**

Run:

```bash
node -e "JSON.parse(require('fs').readFileSync('messages/en.json'))" && echo "en ok"
node -e "JSON.parse(require('fs').readFileSync('messages/nl.json'))" && echo "nl ok"
```

Expected: `en ok` then `nl ok`.

- [ ] **Step 5: Spot-check 3 keys**

Run:

```bash
node -e "console.log(JSON.parse(require('fs').readFileSync('messages/en.json')).modules['failure-modes-ai-code'].short)"
node -e "console.log(JSON.parse(require('fs').readFileSync('messages/nl.json')).modules['capstone-ship-feature'].short)"
node -e "console.log(JSON.parse(require('fs').readFileSync('messages/nl.json')).modules['capstone-rollout-tabletop'].short)"
```

Expected output (one per line):

```
Failure modes
Feature opleveren
Rollout tabletop
```

- [ ] **Step 6: Run i18n parity check**

Run: `pnpm verify:i18n`

Expected: `i18n integrity OK`.

- [ ] **Step 7: Commit**

Run:

```bash
git add messages/en.json messages/nl.json
git commit -m "i18n: add modules.<id>.short for DayAgenda (16 modules, EN + NL)"
```

---

### Task 2: Add `tests/i18n/module-short-keys.test.ts` catalogue sweep

**Files:**

- Create: `tests/i18n/module-short-keys.test.ts`

Independent of `<DayAgenda>` — guards the i18n catalogue so adding a future module without `short` keys in both locales fails CI.

- [ ] **Step 1: Create the test file**

Use the Write tool to create `tests/i18n/module-short-keys.test.ts` with this EXACT content:

```ts
import { describe, it, expect } from 'vitest';
import en from '@/messages/en.json';
import nl from '@/messages/nl.json';
import { trainings } from '@/data/trainings';

const moduleIds = Array.from(
  new Set(Object.values(trainings).flatMap((t) => t.modules.map((m) => m.id))),
);

const enModules = en.modules as Record<string, { short?: string }>;
const nlModules = nl.modules as Record<string, { short?: string }>;

describe('module short keys', () => {
  it('finds at least one module to sweep (sanity)', () => {
    expect(moduleIds.length).toBeGreaterThan(0);
  });

  it.each(moduleIds)('en.modules[%s].short exists and is non-empty', (id) => {
    const short = enModules[id]?.short;
    expect(typeof short).toBe('string');
    expect((short ?? '').trim().length).toBeGreaterThan(0);
  });

  it.each(moduleIds)('nl.modules[%s].short exists and is non-empty', (id) => {
    const short = nlModules[id]?.short;
    expect(typeof short).toBe('string');
    expect((short ?? '').trim().length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run the sweep (expect PASS — keys exist from Task 1)**

Run: `pnpm test tests/i18n/module-short-keys.test.ts`

Expected: 33 tests pass (1 sanity + 16 EN + 16 NL).

- [ ] **Step 3: Run full unit + component suite**

Run: `pnpm test`

Expected: all PASS.

- [ ] **Step 4: Commit**

Run:

```bash
git add tests/i18n/module-short-keys.test.ts
git commit -m "test(i18n): sweep asserts modules.<id>.short present in EN + NL"
```

---

### Task 3: TDD red — write the failing `DayAgenda` component test

**Files:**

- Create: `tests/components/DayAgenda.test.tsx`

- [ ] **Step 1: Create the test file**

Use the Write tool to create `tests/components/DayAgenda.test.tsx` with this EXACT content:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import en from '@/messages/en.json';
import nl from '@/messages/nl.json';
import { DayAgenda } from '@/components/DayAgenda';
import type { Module } from '@/data/trainings';

function renderAgenda(locale: 'nl' | 'en', modules: Module[], label?: string) {
  const messages = locale === 'nl' ? nl : en;
  return render(
    <NextIntlClientProvider locale={locale} messages={messages}>
      <DayAgenda label={label} modules={modules} />
    </NextIntlClientProvider>,
  );
}

describe('<DayAgenda />', () => {
  it('renders the label when provided', () => {
    renderAgenda('en', [{ id: 'agents-in-sdlc', day: 1 }], 'Day 1 —');
    expect(screen.getByText('Day 1 —')).toBeInTheDocument();
  });

  it('does NOT render a label when prop omitted', () => {
    renderAgenda('en', [{ id: 'agents-in-sdlc', day: 1 }]);
    expect(screen.queryByText('Day 1 —')).not.toBeInTheDocument();
  });

  it('renders 3 numbered prefixes (01, 02, 03) for 3 modules', () => {
    renderAgenda('en', [
      { id: 'agents-in-sdlc', day: 1 },
      { id: 'failure-modes-ai-code', day: 1 },
      { id: 'test-first-with-agents', day: 1 },
    ]);
    expect(screen.getByText('01')).toBeInTheDocument();
    expect(screen.getByText('02')).toBeInTheDocument();
    expect(screen.getByText('03')).toBeInTheDocument();
  });

  it('resolves EN short title via modules.<id>.short', () => {
    renderAgenda('en', [{ id: 'failure-modes-ai-code', day: 1 }]);
    expect(screen.getByText(/Failure modes/)).toBeInTheDocument();
  });

  it('resolves NL short title via modules.<id>.short', () => {
    renderAgenda('nl', [{ id: 'capstone-ship-feature', day: 2 }]);
    expect(screen.getByText(/Feature opleveren/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test (expect FAIL on missing component)**

Run: `pnpm test tests/components/DayAgenda.test.tsx`

Expected: FAIL with module resolution error (`Failed to resolve import "@/components/DayAgenda"`). RED state. Do NOT create the component — Task 4 does that.

- [ ] **Step 3: Commit the failing test**

Run:

```bash
git add tests/components/DayAgenda.test.tsx
git commit -m "test(day-agenda): failing component test before implementation"
```

---

### Task 4: Implement `<DayAgenda />` component (turn tests green)

**Files:**

- Create: `components/DayAgenda.tsx`

- [ ] **Step 1: Create the component file**

Use the Write tool to create `components/DayAgenda.tsx` with this EXACT content:

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

Notes for the implementer:

- Single flex-wrap row. Per-strip numbering restarts at `01` (Basic Day 2 starts at `01`). Matches existing `CurriculumList` per-day numbering.
- `·` separator only appears between items (skipped for `i === 0`). Mono + green-dot pattern matches `ProofStrip`'s pill rhythm.
- Label uses `text-accent-orange font-mono text-xs tracking-[0.2em] uppercase` — same rank as the existing dense-curriculum day label (`<p className="text-accent-orange font-mono text-xs">{tCommon('day1')}</p>`).
- Component reads short titles itself via `useTranslations('modules')`; caller supplies pre-localized `label` string.

- [ ] **Step 2: Run typecheck**

Run: `pnpm typecheck`

Expected: PASS.

- [ ] **Step 3: Run component test (expect PASS)**

Run: `pnpm test tests/components/DayAgenda.test.tsx`

Expected: 5 tests PASS.

- [ ] **Step 4: Run full unit + component suite**

Run: `pnpm test`

Expected: all PASS (existing + 5 new DayAgenda + 33 short-keys sweep).

- [ ] **Step 5: Commit**

Run:

```bash
git add components/DayAgenda.tsx
git commit -m "feat(day-agenda): DayAgenda component (numbered pill row per day)"
```

---

### Task 5: Wire `<DayAgenda />` into `<TrainingDetail>` + adjust tests

**Files:**

- Modify: `components/TrainingDetail.tsx`
- Modify: `tests/components/TrainingDetail.test.tsx`

The wire-in causes `Dag 1 —` / `Dag 2 —` to appear in BOTH the new agenda row and the existing dense column header. The two existing tests that use `getByText(/Dag 1 —/i)` will throw on multiple matches — they must loosen to `getAllByText` in the same commit. The third existing test (`does NOT render a day split when durationDays === 1`) is unaffected: Advanced renders no day labels (the wrapper passes no `label` to `<DayAgenda>`).

- [ ] **Step 1: Add the `DayAgenda` import to `components/TrainingDetail.tsx`**

Open `components/TrainingDetail.tsx`. The existing imports at the top are:

```tsx
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { trainings, type TrainingId, type Module } from '@/data/trainings';
import { TeachingTeam } from '@/components/TeachingTeam';
```

Add this line immediately after the `TeachingTeam` import:

```tsx
import { DayAgenda } from '@/components/DayAgenda';
```

- [ ] **Step 2: Insert the agenda wrapper inside the modules block**

In `components/TrainingDetail.tsx`, locate the existing modules block:

```tsx
        <div className="mt-14">
          <h3 className="text-text-muted font-mono text-sm tracking-[0.2em] uppercase">
            {tCommon('modules')}
          </h3>
          {training.durationDays === 2 ? (
```

Between the closing `</h3>` and the `{training.durationDays === 2 ? (` ternary, insert this wrapper:

```tsx
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
```

After insertion the modules block reads:

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
  {training.durationDays === 2 ? (
    <div className="mt-6 grid gap-12 lg:grid-cols-2">
      {/* existing dense Day-1 / Day-2 columns — unchanged */}
    </div>
  ) : (
    <div className="mt-6">{/* existing dense single column — unchanged */}</div>
  )}
</div>
```

Use 10-space indentation matching the surrounding JSX (each level adds 2 spaces from the outermost `<section>` at column 4).

- [ ] **Step 3: Run typecheck**

Run: `pnpm typecheck`

Expected: PASS.

- [ ] **Step 4: Loosen the two existing day-label assertions in `tests/components/TrainingDetail.test.tsx`**

Open `tests/components/TrainingDetail.test.tsx`. Two existing test bodies look up `Dag 1 —` / `Dag 2 —` with `getByText`:

- Test at line ~16 (`renders a day split when the training has durationDays === 2`), currently:

```tsx
expect(screen.getByText(/Dag 1 —/i)).toBeInTheDocument();
expect(screen.getByText(/Dag 2 —/i)).toBeInTheDocument();
```

Replace with:

```tsx
expect(screen.getAllByText(/Dag 1 —/i).length).toBeGreaterThanOrEqual(1);
expect(screen.getAllByText(/Dag 2 —/i).length).toBeGreaterThanOrEqual(1);
```

- Test at line ~41 (`uses durationDays (not training id) to gate the day split`), currently:

```tsx
expect(screen.getByText(/Dag 1/i)).toBeInTheDocument();
expect(screen.getByText(/Dag 2/i)).toBeInTheDocument();
```

Replace with:

```tsx
expect(screen.getAllByText(/Dag 1/i).length).toBeGreaterThanOrEqual(1);
expect(screen.getAllByText(/Dag 2/i).length).toBeGreaterThanOrEqual(1);
```

Do NOT change the second test (`does NOT render a day split when durationDays === 1`) — `queryByText` with 0 matches still works, and Advanced renders no day labels in the new agenda either.

- [ ] **Step 5: Add 2 new `it()` blocks for the agenda wire-in**

In `tests/components/TrainingDetail.test.tsx`, inside the existing `describe('<TrainingDetail /> day-split rendering', …)` block, append these new test cases as siblings (after the existing TeachingTeam tests added by C1):

```tsx
it('renders the DayAgenda strip for the 2-day training (Basic)', () => {
  const twoDayId = (Object.values(trainings).find((t) => t.durationDays === 2)?.id ?? null) as
    | 'basic'
    | 'advanced'
    | null;
  expect(twoDayId, 'expected at least one training with durationDays === 2').not.toBeNull();
  renderDetail(twoDayId!);
  const agenda = screen.getByTestId(`agenda-${twoDayId!}`);
  expect(agenda).toBeInTheDocument();
  expect(within(agenda).getByText(/Failure modes/)).toBeInTheDocument();
  expect(within(agenda).getByText(/Feature opleveren/)).toBeInTheDocument();
});

it('renders the DayAgenda strip for the 1-day training (Advanced)', () => {
  const oneDayId = (Object.values(trainings).find((t) => t.durationDays === 1)?.id ?? null) as
    | 'basic'
    | 'advanced'
    | null;
  expect(oneDayId, 'expected at least one training with durationDays === 1').not.toBeNull();
  renderDetail(oneDayId!);
  const agenda = screen.getByTestId(`agenda-${oneDayId!}`);
  expect(agenda).toBeInTheDocument();
  expect(within(agenda).getByText(/Team rollout/)).toBeInTheDocument();
});
```

The new tests use `within()` to scope assertions to the agenda wrapper (via the `data-testid="agenda-${trainingId}"`) so they don't conflate with the dense curriculum text further down.

- [ ] **Step 6: Add `within` to the test file imports**

At the top of `tests/components/TrainingDetail.test.tsx`, the existing import line reads:

```tsx
import { render, screen } from '@testing-library/react';
```

Replace with:

```tsx
import { render, screen, within } from '@testing-library/react';
```

- [ ] **Step 7: Run the TrainingDetail test (expect PASS)**

Run: `pnpm test tests/components/TrainingDetail.test.tsx`

Expected: all PASS (3 existing day-split + 2 existing TeachingTeam from C1 + 2 new DayAgenda = 7).

- [ ] **Step 8: Run full unit + component suite**

Run: `pnpm test`

Expected: all PASS.

- [ ] **Step 9: Commit**

Run:

```bash
git add components/TrainingDetail.tsx tests/components/TrainingDetail.test.tsx
git commit -m "feat(training-detail): mount DayAgenda strip above dense curriculum"
```

---

### Task 6: Add e2e smoke assertions

**Files:**

- Modify: `e2e/smoke.spec.ts`

Adds 4 assertions per locale (Basic agenda visible + `Failure modes`; Advanced agenda visible + `Team rollout`). Both pills are locale-stable (brand-term shorts) so the same string works for NL and EN.

- [ ] **Step 1: Extend NL home test**

In `e2e/smoke.spec.ts`, locate the test `test('NL home renders hero and Dutch training card label without EN bleed', …`. AFTER the existing `await expect(nlAdvancedTeam).toContainText('Inico Veringa');` line (added by C1), append:

```ts
const nlBasicAgenda = page.getByTestId('agenda-basic');
await expect(nlBasicAgenda).toBeVisible();
await expect(nlBasicAgenda).toContainText('Failure modes');
const nlAdvancedAgenda = page.getByTestId('agenda-advanced');
await expect(nlAdvancedAgenda).toBeVisible();
await expect(nlAdvancedAgenda).toContainText('Team rollout');
```

- [ ] **Step 2: Extend EN home test**

In the same file, locate `test('EN home renders hero and English training card label', …`. AFTER the existing `await expect(enAdvancedTeam).toContainText('Inico Veringa');` line (added by C1), append:

```ts
const enBasicAgenda = page.getByTestId('agenda-basic');
await expect(enBasicAgenda).toBeVisible();
await expect(enBasicAgenda).toContainText('Failure modes');
const enAdvancedAgenda = page.getByTestId('agenda-advanced');
await expect(enAdvancedAgenda).toBeVisible();
await expect(enAdvancedAgenda).toContainText('Team rollout');
```

- [ ] **Step 3: Run targeted e2e**

Run: `pnpm test:e2e -- e2e/smoke.spec.ts`

Expected: all smoke tests PASS, including the two extended home tests now asserting both agenda strips.

- [ ] **Step 4: Commit**

Run:

```bash
git add e2e/smoke.spec.ts
git commit -m "test(e2e): smoke-assert DayAgenda strip on Basic + Advanced (EN + NL)"
```

---

### Task 7: Full verification + push + PR

**Files:** none (verification + push)

- [ ] **Step 1: Run typecheck**

Run: `pnpm typecheck`
Expected: green.

- [ ] **Step 2: Run lint**

Run: `pnpm lint`
Expected: green.

- [ ] **Step 3: Run unit + component tests**

Run: `pnpm test`
Expected: green. New tests added by this plan: 5 in `DayAgenda.test.tsx` + 2 in `TrainingDetail.test.tsx` + 33 in `module-short-keys.test.ts` (1 sanity + 16 EN + 16 NL) = 40.

- [ ] **Step 4: Run full e2e suite**

Run: `pnpm test:e2e`
Expected: green. A11y axe spec (`e2e/a11y.spec.ts`) covers `/en` and `/nl` and will automatically scan the new pill strip; no new a11y spec required.

- [ ] **Step 5: Run i18n parity**

Run: `pnpm verify:i18n`
Expected: `i18n integrity OK`.

- [ ] **Step 6: Manual visual check (background dev server)**

Run: `pnpm dev` (background).

Open http://localhost:3000/en and confirm:

- Inside the Basic training section, under the `MODULES` heading, two pill rows render BEFORE the existing dense Day-1/Day-2 columns:
  - `DAY 1 — 01 Agents in SDLC · 02 Failure modes · 03 Test-first · 04 Hooks + gates · 05 Capstone lab · 06 Regression + gov`
  - `DAY 2 — 01 Context arch · 02 Window mechanics · 03 MCP servers · 04 Skills + rules · 05 Ship feature`
- Inside the Advanced training section, under the `MODULES` heading, a single pill row renders before the dense single-column curriculum:
  - `01 Team rollout · 02 Agent harnessing · 03 Governance gates · 04 Observability + cost · 05 Rollout tabletop`
- Existing dense `CurriculumList` blocks render below the agenda strips, unchanged.
- TeachingTeam (Pascal + Inico) and Book CTA further down both render unchanged.

Open http://localhost:3000/nl and confirm the NL mirror with Dutch shorts where they differ (`Capstone-lab`, `Regressie + gov`, `Context architecture`, `Feature opleveren`).

- [ ] **Step 7: Stop dev server**

Kill the background process.

- [ ] **Step 8: Push branch**

Run:

```bash
git push -u origin feat/day-agenda
```

- [ ] **Step 9: Open PR**

Run:

```bash
gh pr create --title "feat(training-detail): DayAgenda — scannable pill strip above dense curriculum" --body "$(cat <<'EOF'
## Summary
- New `<DayAgenda />` renders inside each `<TrainingDetail>` modules block, ABOVE the existing dense curriculum
- Basic shows 2 rows (Day 1 + Day 2), Advanced shows 1 row (no day label)
- 32 new `modules.<id>.short` i18n keys (16 modules × 2 locales)
- New i18n sweep test pins the catalogue: every `ModuleId` must have a `short` in EN + NL
- Existing 2-day `getByText(/Dag 1 —/i)` assertions loosened to `getAllByText(...).length >= 1` because day labels now appear in both agenda + dense column header
- Existing dense `CurriculumList` blocks unchanged

Sub-sub-project **C2** of the brand initiative (A merged in #7, B merged in #10, C1 merged in #14, C3 merged in #12). C4 deferred pending real testimonial content.

## Spec + Plan
- docs/superpowers/specs/2026-05-23-day-agenda-timeline-design.md
- docs/superpowers/plans/2026-05-23-day-agenda-timeline.md

## Test plan
- [x] `pnpm typecheck` — no errors
- [x] `pnpm lint` — clean
- [x] `pnpm test` — adds 40 new tests (5 DayAgenda + 2 TrainingDetail + 33 i18n sweep)
- [x] `pnpm test:e2e` — smoke extended on EN + NL home (agenda-basic + agenda-advanced visible + key short titles present)
- [x] `pnpm verify:i18n` — EN/NL parity holds
- [ ] Manual `/en` + `/nl` show agenda pill strip above dense curriculum on both Basic + Advanced

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

Expected: PR URL printed.

---

## Verification summary

- `pnpm typecheck` — green
- `pnpm lint` — green
- `pnpm test` — all unit + component tests pass, +40 from this plan
- `pnpm test:e2e` — all e2e pass, including extended smoke assertions
- `pnpm verify:i18n` — `i18n integrity OK`
- Manual: home page renders agenda strips above the dense curriculum for both Basic and Advanced, on both locales

## Rollback

Single feature branch. Reverting the merge removes `components/DayAgenda.tsx`, `tests/components/DayAgenda.test.tsx`, `tests/i18n/module-short-keys.test.ts`, 32 `modules.<id>.short` keys in both locale files, the import + wrapper-div in `components/TrainingDetail.tsx`, the loosened day-label assertions + 2 added cases in `tests/components/TrainingDetail.test.tsx`, and the e2e smoke assertions. No data, schema, or shared-dep changes.
