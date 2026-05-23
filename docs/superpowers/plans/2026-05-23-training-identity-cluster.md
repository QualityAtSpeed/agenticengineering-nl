# Training Identity Cluster Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `<TeachingTeam />` cluster (heading + Pascal + Inico `<InstructorCard>`s) inside each `<TrainingDetail>` block, between the curriculum block and the Book CTA, so visitors evaluating a specific training meet the instructors at the decision moment without scrolling past.

**Architecture:** New `<TeachingTeam />` React component taking `{ ids: InstructorId[] }`, reusing the existing `<InstructorCard>` for each id and a new `trainings.labels.taughtBy` i18n key for the heading. Mounted twice in `<TrainingDetail>` (once per training) wrapped in a `<div data-testid="teaching-team-${trainingId}" className="mt-14">` so the testid lives on the call-site (keeps `TeachingTeam` generic). Existing dedicated instructors `<section>` on the home page stays untouched.

**Tech Stack:** Next.js 15 App Router (RSC), next-intl, Tailwind CSS v4, Vitest + Testing Library, Playwright.

**Spec:** `docs/superpowers/specs/2026-05-23-training-identity-cluster-design.md`

---

### Task 0: Confirm branch + clean tree

**Files:** none

- [ ] **Step 1: Confirm on feature branch + clean tree**

Run:

```bash
git status
git branch --show-current
```

Expected: clean tree, branch `feat/teaching-team`. The spec commit should already be in this branch (`git log --oneline -1` shows `docs(spec): training identity cluster — taught by inside training-detail`).

---

### Task 1: Add EN + NL i18n key (atomic for parity)

**Files:**

- Modify: `messages/en.json`
- Modify: `messages/nl.json`

Both files updated in one commit so `scripts/verify-i18n.ts` parity check stays green.

- [ ] **Step 1: Confirm current location of `bookCta`**

Run:

```bash
grep -n 'bookCta' messages/en.json messages/nl.json
```

Expected: both files show `bookCta` on line 45 (line number may have shifted if file changed; use the actual line). `bookCta` is the last entry of `trainings.labels` — `taughtBy` will be inserted as a new sibling immediately after it.

- [ ] **Step 2: Insert EN `taughtBy` key**

In `messages/en.json`, locate the line:

```json
      "bookCta": "Book this training"
```

Replace it with these two lines (add the trailing comma to `bookCta`, then a new line for `taughtBy`):

```json
      "bookCta": "Book this training",
      "taughtBy": "Taught by"
```

- [ ] **Step 3: Insert NL `taughtBy` key**

In `messages/nl.json`, locate the line:

```json
      "bookCta": "Plan deze training"
```

Replace it with:

```json
      "bookCta": "Plan deze training",
      "taughtBy": "Gegeven door"
```

- [ ] **Step 4: Validate both JSON files parse**

Run:

```bash
node -e "JSON.parse(require('fs').readFileSync('messages/en.json'))" && echo "en ok"
node -e "JSON.parse(require('fs').readFileSync('messages/nl.json'))" && echo "nl ok"
```

Expected: `en ok` then `nl ok`. If parse fails, fix the comma/brace and re-run.

- [ ] **Step 5: Run i18n parity check**

Run: `pnpm verify:i18n`

Expected: `i18n integrity OK`.

- [ ] **Step 6: Commit**

Run:

```bash
git add messages/en.json messages/nl.json
git commit -m "i18n: add trainings.labels.taughtBy for TeachingTeam (EN + NL)"
```

---

### Task 2: TDD red — write the failing `TeachingTeam` component test

**Files:**

- Create: `tests/components/TeachingTeam.test.tsx`

- [ ] **Step 1: Create `tests/components/TeachingTeam.test.tsx`**

Use the Write tool to create the file with this EXACT content:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import en from '@/messages/en.json';
import nl from '@/messages/nl.json';
import { TeachingTeam } from '@/components/TeachingTeam';

function renderTeam(locale: 'nl' | 'en', ids: ('pascal' | 'inico')[] = ['pascal', 'inico']) {
  const messages = locale === 'nl' ? nl : en;
  return render(
    <NextIntlClientProvider locale={locale} messages={messages}>
      <TeachingTeam ids={ids} />
    </NextIntlClientProvider>,
  );
}

describe('<TeachingTeam />', () => {
  it('renders the EN heading "Taught by"', () => {
    renderTeam('en');
    expect(screen.getByRole('heading', { name: /Taught by/i })).toBeInTheDocument();
  });

  it('renders the NL heading "Gegeven door"', () => {
    renderTeam('nl');
    expect(screen.getByRole('heading', { name: /Gegeven door/i })).toBeInTheDocument();
  });

  it('renders both instructor names when ids=["pascal","inico"]', () => {
    renderTeam('en', ['pascal', 'inico']);
    expect(screen.getByText('Pascal Dufour')).toBeInTheDocument();
    expect(screen.getByText('Inico Veringa')).toBeInTheDocument();
  });

  it('renders only the requested instructor when ids=["pascal"]', () => {
    renderTeam('en', ['pascal']);
    expect(screen.getByText('Pascal Dufour')).toBeInTheDocument();
    expect(screen.queryByText('Inico Veringa')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test (expect FAIL on missing component)**

Run: `pnpm test tests/components/TeachingTeam.test.tsx`

Expected: FAIL with module resolution error (`Failed to resolve import "@/components/TeachingTeam"`). This is the intended RED state. Do NOT create the component yet — Task 3 does that.

- [ ] **Step 3: Commit failing test**

Run:

```bash
git add tests/components/TeachingTeam.test.tsx
git commit -m "test(teaching-team): failing component test before implementation"
```

---

### Task 3: Implement `<TeachingTeam />` component (turn tests green)

**Files:**

- Create: `components/TeachingTeam.tsx`

- [ ] **Step 1: Create `components/TeachingTeam.tsx`**

Use the Write tool to create the file with this EXACT content:

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

Notes for the implementer:

- Component root has NO top margin. Vertical spacing is owned by the caller (`TrainingDetail`) so the wrapper `<div>` there can carry both the `mt-14` and the `data-testid` used by e2e (Task 4).
- Heading uses `text-xs uppercase tracking-[0.2em]` — same rank as the sibling `audience` / `prerequisites` / `outcomes` / `modules` headings inside `TrainingDetail`, so it nests as a content sub-block rather than competing with the training's `<h2>`.
- `InstructorCard` already reads its bio from `about.instructors.${id}` — no new bio strings needed.

- [ ] **Step 2: Run typecheck**

Run: `pnpm typecheck`

Expected: PASS.

- [ ] **Step 3: Run component test (expect PASS)**

Run: `pnpm test tests/components/TeachingTeam.test.tsx`

Expected: 4 tests PASS.

- [ ] **Step 4: Run full unit + component suite to catch regressions**

Run: `pnpm test`

Expected: all PASS (4 new + previously-existing).

- [ ] **Step 5: Commit**

Run:

```bash
git add components/TeachingTeam.tsx
git commit -m "feat(teaching-team): TeachingTeam component (heading + instructor pair)"
```

---

### Task 4: Wire `<TeachingTeam />` into `<TrainingDetail>` + assert in unit test

**Files:**

- Modify: `components/TrainingDetail.tsx`
- Modify: `tests/components/TrainingDetail.test.tsx`

The wrapper `<div>` here owns `mt-14` and the e2e `data-testid`. The unit-test assertion proves the wire-in rendered, not just that the component exists.

- [ ] **Step 1: Add the TeachingTeam import to `components/TrainingDetail.tsx`**

Open `components/TrainingDetail.tsx`. The existing imports at the top of the file are:

```tsx
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { trainings, type TrainingId, type Module } from '@/data/trainings';
```

Add this line immediately after the `@/data/trainings` import:

```tsx
import { TeachingTeam } from '@/components/TeachingTeam';
```

- [ ] **Step 2: Insert the wrapper in the JSX**

In `components/TrainingDetail.tsx`, locate the closing `</div>` of the curriculum block (the `<div className="mt-14">` block ending right before the Book-CTA block `<div className="mt-12">`). Between those two `<div>` blocks, insert:

```tsx
<div data-testid={`teaching-team-${trainingId}`} className="mt-14">
  <TeachingTeam ids={['pascal', 'inico']} />
</div>
```

After insertion, the JSX should read in order:

```tsx
        <div className="mt-14">
          <h3 …>{tCommon('modules')}</h3>
          {/* …curriculum content… */}
        </div>

        <div data-testid={`teaching-team-${trainingId}`} className="mt-14">
          <TeachingTeam ids={['pascal', 'inico']} />
        </div>

        <div className="mt-12">
          <Link …Book CTA…>{tCommon('bookCta')}</Link>
        </div>
```

Use the 8-space indentation that matches the surrounding sibling blocks.

- [ ] **Step 3: Run typecheck**

Run: `pnpm typecheck`

Expected: PASS.

- [ ] **Step 4: Add a `TrainingDetail` unit-test assertion for the cluster**

Open `tests/components/TrainingDetail.test.tsx`. Inside the existing `describe('<TrainingDetail /> day-split rendering', …)` block, append this new `it()` block as a new sibling test (after the existing third test that ends `vi.resetModules();`):

```tsx
it('renders the TeachingTeam cluster for the 2-day training', () => {
  const twoDayId = (Object.values(trainings).find((t) => t.durationDays === 2)?.id ?? null) as
    | 'basic'
    | 'advanced'
    | null;
  expect(twoDayId, 'expected at least one training with durationDays === 2').not.toBeNull();
  renderDetail(twoDayId!);
  expect(screen.getByText(/Gegeven door/i)).toBeInTheDocument();
  expect(screen.getByText('Pascal Dufour')).toBeInTheDocument();
  expect(screen.getByText('Inico Veringa')).toBeInTheDocument();
});

it('renders the TeachingTeam cluster for the 1-day training', () => {
  const oneDayId = (Object.values(trainings).find((t) => t.durationDays === 1)?.id ?? null) as
    | 'basic'
    | 'advanced'
    | null;
  expect(oneDayId, 'expected at least one training with durationDays === 1').not.toBeNull();
  renderDetail(oneDayId!);
  expect(screen.getByText(/Gegeven door/i)).toBeInTheDocument();
  expect(screen.getByText('Pascal Dufour')).toBeInTheDocument();
  expect(screen.getByText('Inico Veringa')).toBeInTheDocument();
});
```

`trainings`, `renderDetail`, and `screen` are already imported at the top of the file — no new imports needed.

- [ ] **Step 5: Run the TrainingDetail test (expect PASS)**

Run: `pnpm test tests/components/TrainingDetail.test.tsx`

Expected: all tests PASS (3 existing + 2 new = 5).

- [ ] **Step 6: Run full unit + component suite**

Run: `pnpm test`

Expected: PASS.

- [ ] **Step 7: Commit**

Run:

```bash
git add components/TrainingDetail.tsx tests/components/TrainingDetail.test.tsx
git commit -m "feat(training-detail): mount TeachingTeam between curriculum and Book CTA"
```

---

### Task 5: Add e2e smoke assertions

**Files:**

- Modify: `e2e/smoke.spec.ts`

Adds 6 assertions per locale (Basic team visible + Pascal + Inico; Advanced team visible + Pascal + Inico).

- [ ] **Step 1: Read current home tests in `e2e/smoke.spec.ts`**

Run: `sed -n '26,55p' e2e/smoke.spec.ts`

Expected: shows the `NL home …` and `EN home …` tests, including the existing `proof-github-link` assertions added by sub-project C3.

- [ ] **Step 2: Extend NL home test**

In `e2e/smoke.spec.ts`, locate the test `test('NL home renders hero and Dutch training card label without EN bleed', …`. Inside the body, AFTER the existing `await expect(nlProof).toHaveAttribute('href', …);` (closing parenthesis + semicolon), append these 8 lines:

```ts
const nlBasicTeam = page.getByTestId('teaching-team-basic');
await expect(nlBasicTeam).toBeVisible();
await expect(nlBasicTeam).toContainText('Pascal Dufour');
await expect(nlBasicTeam).toContainText('Inico Veringa');
const nlAdvancedTeam = page.getByTestId('teaching-team-advanced');
await expect(nlAdvancedTeam).toBeVisible();
await expect(nlAdvancedTeam).toContainText('Pascal Dufour');
await expect(nlAdvancedTeam).toContainText('Inico Veringa');
```

- [ ] **Step 3: Extend EN home test**

In the same file, locate `test('EN home renders hero and English training card label', …`. AFTER the existing `await expect(enProof).toHaveAttribute('href', …);` (closing parenthesis + semicolon), append:

```ts
const enBasicTeam = page.getByTestId('teaching-team-basic');
await expect(enBasicTeam).toBeVisible();
await expect(enBasicTeam).toContainText('Pascal Dufour');
await expect(enBasicTeam).toContainText('Inico Veringa');
const enAdvancedTeam = page.getByTestId('teaching-team-advanced');
await expect(enAdvancedTeam).toBeVisible();
await expect(enAdvancedTeam).toContainText('Pascal Dufour');
await expect(enAdvancedTeam).toContainText('Inico Veringa');
```

- [ ] **Step 4: Run targeted e2e**

Run: `pnpm test:e2e -- e2e/smoke.spec.ts`

Expected: all smoke tests PASS, including the two extended home tests now asserting both Basic + Advanced TeachingTeam clusters.

- [ ] **Step 5: Commit**

Run:

```bash
git add e2e/smoke.spec.ts
git commit -m "test(e2e): smoke-assert TeachingTeam cluster on Basic + Advanced (EN + NL)"
```

---

### Task 6: Full verification + push + PR

**Files:** none (verification + push)

- [ ] **Step 1: Run typecheck**

Run: `pnpm typecheck`
Expected: green.

- [ ] **Step 2: Run lint**

Run: `pnpm lint`
Expected: green.

- [ ] **Step 3: Run unit + component tests**

Run: `pnpm test`
Expected: green. New tests added by this plan: 4 in `TeachingTeam.test.tsx` + 2 in `TrainingDetail.test.tsx` = 6.

- [ ] **Step 4: Run full e2e suite**

Run: `pnpm test:e2e`
Expected: green. A11y axe spec (`e2e/a11y.spec.ts`) covers `/en` and `/nl` and will automatically scan the new heading + InstructorCard grid; no new a11y spec is required.

- [ ] **Step 5: Run i18n parity**

Run: `pnpm verify:i18n`
Expected: `i18n integrity OK`.

- [ ] **Step 6: Manual visual check (background dev server)**

Run: `pnpm dev` (background).

Open http://localhost:3000/en and confirm:

- Inside the Basic training section, between the curriculum (Day 1 / Day 2 columns) and the green "Book this training" button, a new `Taught by` heading appears in muted uppercase mono.
- Below that heading, a 2-column grid renders the Pascal and Inico instructor cards (photo + name + role + bio), matching the cards rendered by the dedicated instructors section further down the page.
- Inside the Advanced training section, the same `Taught by` heading + Pascal + Inico cards appear above the Book CTA.
- The dedicated instructors `<section>` below ProofStrip is still present and still shows the "Meet the team →" link.

Open http://localhost:3000/nl and confirm the NL mirror (`Gegeven door` heading + same cards), with Dutch UI labels everywhere.

- [ ] **Step 7: Stop dev server**

Kill the background process.

- [ ] **Step 8: Push branch**

Run:

```bash
git push -u origin feat/teaching-team
```

- [ ] **Step 9: Open PR**

Run:

```bash
gh pr create --title "feat(training-detail): TeachingTeam — instructor cluster inside each training" --body "$(cat <<'EOF'
## Summary
- New `<TeachingTeam />` component renders inside each `<TrainingDetail>` block, between the curriculum and the Book CTA
- Heading `Taught by` / `Gegeven door` + 2-col grid of existing `<InstructorCard>`s (Pascal + Inico) on both Basic and Advanced
- Reuses existing instructor bios (no new bio copy); single new `trainings.labels.taughtBy` key per locale
- Existing dedicated instructors `<section>` on home kept as-is

Sub-sub-project **C1** of the brand initiative (A merged in #7, B merged in #10, C3 merged in #12). C2 / C4 deferred per spec.

## Spec + Plan
- docs/superpowers/specs/2026-05-23-training-identity-cluster-design.md
- docs/superpowers/plans/2026-05-23-training-identity-cluster.md

## Test plan
- [x] `pnpm typecheck` — no errors
- [x] `pnpm lint` — clean
- [x] `pnpm test` — adds 6 new tests (4 TeachingTeam + 2 TrainingDetail)
- [x] `pnpm test:e2e` — smoke extended on EN + NL home (Basic + Advanced clusters)
- [x] `pnpm verify:i18n` — EN/NL parity holds
- [ ] Manual `/en` + `/nl` show TeachingTeam inside both training-detail blocks above Book CTA; dedicated instructors section below ProofStrip still present

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

Expected: PR URL printed.

---

## Verification summary

- `pnpm typecheck` — green
- `pnpm lint` — green
- `pnpm test` — all unit + component tests pass, +6 from this plan
- `pnpm test:e2e` — all e2e pass, including extended smoke assertions
- `pnpm verify:i18n` — `i18n integrity OK`
- Manual: home page renders TeachingTeam inside both Basic + Advanced detail blocks, above the Book CTA, on both locales; existing dedicated instructors section unchanged

## Rollback

Single feature branch. Reverting the merge removes `components/TeachingTeam.tsx`, `tests/components/TeachingTeam.test.tsx`, the `trainings.labels.taughtBy` key in both locale files, the import + wrapper-div insertion in `components/TrainingDetail.tsx`, the 2 added test cases in `tests/components/TrainingDetail.test.tsx`, and the e2e smoke assertions. No data, schema, or shared-dep changes.
