# Training Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Flip the agenticengineering.nl training catalogue from Basic 1d / Advanced 2d to Basic 2d ("Adopt agentic engineering") / Advanced 1d ("Scale to team"), per `docs/superpowers/specs/2026-05-21-training-redesign-design.md`.

**Architecture:** Catalogue data lives in `data/trainings.ts` (`ModuleId` union + per-training records). All copy lives in `messages/{nl,en}.json` and is read by `TrainingCard`, `TrainingDetail`, and `ContactForm` via `next-intl`. The day-split rendering currently keys off `training.id === 'advanced'`; we change it to key off `durationDays === 2` so it survives the inversion without further edits.

**Tech Stack:** Next.js 15 + App Router, React 19, TypeScript, `next-intl` v4, Vitest + Testing Library, Playwright E2E, Tailwind v4, lefthook pre-commit (prettier).

**Spec defaults applied (override before execution if undesired):**

- Basic 2d price: **€1399**
- Advanced 1d price: **€999**
- Removed Advanced modules are hard-deleted from types + i18n (recoverable from git history).
- Capstone "starter repo" reuses whatever the current `build-first-feature` lab uses (no new repo built inside this plan).

All work happens in `<repo>`. All commands assume that working directory (use `git -C <repo>` when invoking from elsewhere).

---

## File Map

| File                                             | Why                                                                                                    |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| `data/trainings.ts`                              | `ModuleId` union, `trainings.basic`, `trainings.advanced` (duration, modules, prices).                 |
| `messages/en.json`                               | EN copy: hero, duration labels, day labels, per-training audience/outcomes/tagline, module copy.       |
| `messages/nl.json`                               | NL mirror of EN edits.                                                                                 |
| `components/TrainingDetail.tsx`                  | Day-split condition currently hard-codes `training.id === 'advanced'`. Switch to `durationDays === 2`. |
| `tests/i18n-integrity.test.ts`                   | Untouched — but must still pass (NL+EN key parity).                                                    |
| `tests/components/TrainingCard.test.tsx`         | Currently asserts `"1 dag"` for Basic. Update to `"2 dagen"`.                                          |
| `tests/components/TrainingDetail.test.tsx` (new) | New unit test pinning day-split behaviour to duration, not training id.                                |
| `tests/data/trainings.test.ts` (new)             | New unit test pinning the new catalogue shape (durations, module IDs, day tags).                       |
| `scripts/verify-i18n.ts`                         | Untouched — sanity-only script that mirrors the vitest test.                                           |
| `e2e/smoke.spec.ts`                              | No day-string assertions; smoke run must stay green.                                                   |

The above is the entire surface area. Anything else that turns up in Task 6 (audit step) is a fix-on-discovery.

---

## Task 1: Pin day-split behaviour to `durationDays`

We do this first so the data swap in Task 2 doesn't change the rendered output mid-flight.

**Files:**

- Create: `tests/components/TrainingDetail.test.tsx`
- Modify: `components/TrainingDetail.tsx:71` (the `training.id === 'advanced'` branch)

- [ ] **Step 1: Write the failing test**

Create `tests/components/TrainingDetail.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import nl from '@/messages/nl.json';
import { TrainingDetail } from '@/components/TrainingDetail';
import { trainings } from '@/data/trainings';

function renderDetail(id: 'basic' | 'advanced') {
  return render(
    <NextIntlClientProvider locale="nl" messages={nl}>
      <TrainingDetail trainingId={id} locale="nl" />
    </NextIntlClientProvider>,
  );
}

describe('<TrainingDetail /> day-split rendering', () => {
  it('renders a day split when the training has durationDays === 2', () => {
    // Identify the current 2-day training by data, not id — the redesign
    // will move which training is 2-day, and this test should still pass.
    const twoDayId = (Object.values(trainings).find((t) => t.durationDays === 2)?.id ?? null) as
      | 'basic'
      | 'advanced'
      | null;
    expect(twoDayId, 'expected at least one training with durationDays === 2').not.toBeNull();
    renderDetail(twoDayId!);
    expect(screen.getByText(/Dag 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Dag 2/i)).toBeInTheDocument();
  });

  it('does NOT render a day split when the training has durationDays === 1', () => {
    const oneDayId = (Object.values(trainings).find((t) => t.durationDays === 1)?.id ?? null) as
      | 'basic'
      | 'advanced'
      | null;
    expect(oneDayId, 'expected at least one training with durationDays === 1').not.toBeNull();
    renderDetail(oneDayId!);
    expect(screen.queryByText(/Dag 1/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Dag 2/i)).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test, expect the 1-day assertion to fail**

```bash
pnpm vitest run tests/components/TrainingDetail.test.tsx
```

Expected: the first test passes (today's 2-day training is Advanced and its current `id === 'advanced'` branch hits the day-split path); the second test FAILS because `trainings.basic` has `durationDays === 1` today but the component currently does not gate by duration, only by id. (If both pass under the current code, the test suite is still proving the new invariant we need going forward; continue.)

- [ ] **Step 3: Edit `components/TrainingDetail.tsx`**

Replace the condition on line 71. Current:

```tsx
{training.id === 'advanced' ? (
```

New:

```tsx
{training.durationDays === 2 ? (
```

No other change to the file.

- [ ] **Step 4: Run the test, expect both assertions to pass**

```bash
pnpm vitest run tests/components/TrainingDetail.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Run the full vitest suite to confirm no regressions**

```bash
pnpm vitest run
```

Expected: all green.

- [ ] **Step 6: Commit**

```bash
git -C <repo> add \
  components/TrainingDetail.tsx \
  tests/components/TrainingDetail.test.tsx
git -C <repo> commit -m "refactor(training-detail): gate day split on durationDays, not training id"
```

---

## Task 2: Rewrite `data/trainings.ts` to the new catalogue shape

**Files:**

- Modify: `data/trainings.ts`
- Create: `tests/data/trainings.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/data/trainings.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { trainings, type ModuleId } from '@/data/trainings';

describe('trainings catalogue', () => {
  it('Basic is a 2-day training with the 8 retained modules + capstone, split across 2 days', () => {
    const basic = trainings.basic;
    expect(basic.durationDays).toBe(2);
    expect(basic.priceEUR).toBe(1399);

    const expected: { id: ModuleId; day: 1 | 2 }[] = [
      { id: 'fundamentals-of-agent', day: 1 },
      { id: 'context-architecture', day: 1 },
      { id: 'context-window-mechanics', day: 1 },
      { id: 'build-first-feature', day: 1 },
      { id: 'using-mcp-servers', day: 2 },
      { id: 'intro-skills-rules', day: 2 },
      { id: 'test-first-intro', day: 2 },
      { id: 'basic-hooks-quality-gates', day: 2 },
      { id: 'capstone-ship-feature', day: 2 },
    ];

    expect(basic.modules).toEqual(expected);
  });

  it('Advanced is a 1-day training with 5 modules and no day tags', () => {
    const adv = trainings.advanced;
    expect(adv.durationDays).toBe(1);
    expect(adv.priceEUR).toBe(999);

    const expected: { id: ModuleId }[] = [
      { id: 'team-rollout-playbook' },
      { id: 'agent-harnessing' },
      { id: 'governance-and-policy-gates' },
      { id: 'observability-and-cost' },
      { id: 'capstone-rollout-tabletop' },
    ];

    expect(adv.modules).toEqual(expected);
  });

  it('both trainings still support all 3 delivery formats', () => {
    for (const t of Object.values(trainings)) {
      expect(t.deliveryFormats).toEqual(['inCompany', 'publicCohort', 'remote']);
    }
  });
});
```

- [ ] **Step 2: Run the test, expect it to fail**

```bash
pnpm vitest run tests/data/trainings.test.ts
```

Expected: FAIL on the Basic / Advanced shape (durations swapped, modules differ, new IDs not yet in the union).

- [ ] **Step 3: Replace the contents of `data/trainings.ts`**

Overwrite the file with:

```ts
export type ModuleId =
  // Basic — retained from previous catalogue (8 modules)
  | 'fundamentals-of-agent'
  | 'context-architecture'
  | 'context-window-mechanics'
  | 'build-first-feature'
  | 'intro-skills-rules'
  | 'using-mcp-servers'
  | 'test-first-intro'
  | 'basic-hooks-quality-gates'
  // Basic — new for Day 2 capstone
  | 'capstone-ship-feature'
  // Advanced — retained
  | 'agent-harnessing'
  // Advanced — new
  | 'team-rollout-playbook'
  | 'governance-and-policy-gates'
  | 'observability-and-cost'
  | 'capstone-rollout-tabletop';

export type DeliveryFormat = 'inCompany' | 'publicCohort' | 'remote';

export type Module = { id: ModuleId; day?: 1 | 2 };

export type TrainingId = 'basic' | 'advanced';

export type Training = {
  id: TrainingId;
  durationDays: 1 | 2;
  priceEUR: number;
  modules: Module[];
  deliveryFormats: DeliveryFormat[];
};

export const trainings: Record<TrainingId, Training> = {
  basic: {
    id: 'basic',
    durationDays: 2,
    priceEUR: 1399,
    modules: [
      { id: 'fundamentals-of-agent', day: 1 },
      { id: 'context-architecture', day: 1 },
      { id: 'context-window-mechanics', day: 1 },
      { id: 'build-first-feature', day: 1 },
      { id: 'using-mcp-servers', day: 2 },
      { id: 'intro-skills-rules', day: 2 },
      { id: 'test-first-intro', day: 2 },
      { id: 'basic-hooks-quality-gates', day: 2 },
      { id: 'capstone-ship-feature', day: 2 },
    ],
    deliveryFormats: ['inCompany', 'publicCohort', 'remote'],
  },
  advanced: {
    id: 'advanced',
    durationDays: 1,
    priceEUR: 999,
    modules: [
      { id: 'team-rollout-playbook' },
      { id: 'agent-harnessing' },
      { id: 'governance-and-policy-gates' },
      { id: 'observability-and-cost' },
      { id: 'capstone-rollout-tabletop' },
    ],
    deliveryFormats: ['inCompany', 'publicCohort', 'remote'],
  },
};
```

- [ ] **Step 4: Run the test, expect PASS but type errors elsewhere**

```bash
pnpm vitest run tests/data/trainings.test.ts
```

Expected: PASS.

```bash
pnpm typecheck
```

Expected: TS errors in `messages/*.json` consumers because the old module IDs no longer exist in the `ModuleId` union, and the new IDs have no i18n entry yet. **Do not fix typecheck yet.** Tasks 3 and 4 add the missing i18n keys.

- [ ] **Step 5: Commit**

```bash
git -C <repo> add \
  data/trainings.ts \
  tests/data/trainings.test.ts
git -C <repo> commit -m "feat(trainings): invert catalogue — Basic 2d adopt, Advanced 1d scale"
```

Note: lefthook will run prettier on staged files. If it rewrites either file, re-stage and re-run the commit (no `--no-verify`).

---

## Task 3: Rewrite `messages/en.json` for the new catalogue

The strategy: edit one section at a time with `Edit` calls, keeping the JSON valid after every step. After all edits, run `pnpm verify:i18n` (which compares key sets between locales) and the integrity vitest test — both must pass after Task 4 mirrors the changes into NL.

**File:**

- Modify: `messages/en.json`

- [ ] **Step 1: Update `hero.subtitle`**

Find:

```json
"subtitle": "Two hands-on trainings in Claude Code or Codex. One day foundations, two days advanced.",
```

Replace with:

```json
"subtitle": "Two hands-on trainings in Claude Code or Codex. Two days foundations, one day advanced.",
```

- [ ] **Step 2: Update `trainings.duration`**

Find:

```json
    "duration": {
      "basic": "1 day",
      "advanced": "2 days"
    },
```

Replace with:

```json
    "duration": {
      "basic": "2 days",
      "advanced": "1 day"
    },
```

- [ ] **Step 3: Update `trainings.labels.day1` and `day2`**

Find:

```json
      "day1": "Day 1 — integration",
      "day2": "Day 2 — automation",
```

Replace with:

```json
      "day1": "Day 1 — Foundations",
      "day2": "Day 2 — Quality loop + capstone",
```

- [ ] **Step 4: Update `trainings.basic` block**

Find the entire `"basic": { ... }` block under `trainings`:

```json
    "basic": {
      "name": "Basic",
      "tagline": "Foundations + first hands-on with Claude Code or Codex.",
      "audience": [
        "Engineers and tech leads adopting agentic workflows",
        "Junior/mid developers starting with Claude Code or Codex",
        "CTOs and engineering managers training their teams"
      ],
      "prerequisites": [
        "Comfortable with git and the command line",
        "Writes features in at least one language (TS/Python/Go/etc.)"
      ],
      "outcomes": [
        "Ship working features with Claude Code or Codex",
        "Configure structured context (CLAUDE.md / AGENTS.md, rules)",
        "Use existing MCP servers",
        "Work in a basic test-first loop",
        "Set up basic hooks and quality gates"
      ]
    },
```

Replace with:

```json
    "basic": {
      "name": "Basic",
      "tagline": "Two days of hands-on adoption — every attendee ships a feature.",
      "audience": [
        "Whole DevOps teams: developers, QA / test engineers, ops / platform",
        "Mixed-role cohorts adopting agentic workflows together",
        "Engineering managers training their teams alongside them"
      ],
      "prerequisites": [
        "Comfortable with git and the command line",
        "Writes features in at least one language (TS/Python/Go/etc.)"
      ],
      "outcomes": [
        "Ship a working feature end-to-end on a starter repo",
        "Configure structured context (CLAUDE.md / AGENTS.md, rules) for your own project",
        "Use existing MCP servers in real workflows",
        "Practise a test-first loop with an agent",
        "Set up hooks and quality gates that survive the next sprint"
      ]
    },
```

- [ ] **Step 5: Update `trainings.advanced` block**

Find the entire `"advanced": { ... }` block under `trainings` and replace with:

```json
    "advanced": {
      "name": "Advanced",
      "tagline": "One day to scale agentic engineering across your teams.",
      "audience": [
        "Tech leads and staff+ engineers rolling out agentic workflows",
        "Engineering managers and platform / QA leads",
        "Teams responsible for governance, cost, and adoption across orgs"
      ],
      "prerequisites": ["Basic training or equivalent hands-on Claude Code/Codex experience"],
      "outcomes": [
        "Leave with a rollout playbook for your own org",
        "Orchestrate subagents and parallel agents at team scale",
        "Enforce team policy via CI hooks",
        "Set up observability and cost guardrails for agent usage",
        "Walk away with a 90-day rollout plan reviewed by peers"
      ]
    }
```

- [ ] **Step 6: Update `contact.form.trainingOptions`**

Find:

```json
      "trainingOptions": {
        "basic": "Basic (1 day)",
        "advanced": "Advanced (2 days)",
        "both": "Both",
        "other": "Other"
      },
```

Replace with:

```json
      "trainingOptions": {
        "basic": "Basic (2 days)",
        "advanced": "Advanced (1 day)",
        "both": "Both",
        "other": "Other"
      },
```

- [ ] **Step 7: Remove the four deleted module copy blocks**

Delete the entries for `building-custom-mcp`, `skills-rules-deep`, `agents-sdlc-phases`, and `test-first-advanced` from the `modules` block. Each block looks like:

```json
    "building-custom-mcp": {
      "title": "...",
      "bullets": ["...", "...", "..."]
    },
```

Remove all four. Watch the trailing commas — the last sibling in the `modules` object must not have a trailing comma after its closing brace.

- [ ] **Step 8: Remove the two merged module copy blocks**

Delete the entries for `advanced-hooks-quality-gates` and `team-workflows-governance`. Same caveat re trailing commas.

- [ ] **Step 9: Reframe `agent-harnessing`**

Find the existing `agent-harnessing` entry and replace it with:

```json
    "agent-harnessing": {
      "title": "Agent harnessing for teams",
      "bullets": [
        "Subagents and delegation at team scale",
        "Parallel workflows that survive team-sized PR queues",
        "Orchestration patterns and review checkpoints"
      ]
    },
```

- [ ] **Step 10: Add the four new module copy blocks**

Add these four entries to the `modules` object. Place them in the order shown so the JSON diff stays readable; ordering does not affect runtime.

```json
    "capstone-ship-feature": {
      "title": "Capstone — ship a feature end-to-end",
      "bullets": [
        "Implement a small feature on a starter repo from a brief",
        "Drive the work with tests, hooks, and quality gates",
        "Demo and review with the cohort"
      ]
    },
    "team-rollout-playbook": {
      "title": "Team rollout playbook",
      "bullets": [
        "Adoption stages and role design",
        "Onboarding paths for new joiners",
        "Sequencing rollout across multiple teams"
      ]
    },
    "governance-and-policy-gates": {
      "title": "Governance + policy gates",
      "bullets": [
        "Decide what policy your team needs (security, cost, quality)",
        "Enforce policy via CI hooks rather than tribal review",
        "Detect drift and recover quickly"
      ]
    },
    "observability-and-cost": {
      "title": "Observability + cost-at-scale",
      "bullets": [
        "Usage telemetry across teams",
        "Cost guardrails and per-team budgets",
        "Anomaly triage and feedback loops"
      ]
    },
    "capstone-rollout-tabletop": {
      "title": "Capstone — rollout tabletop",
      "bullets": [
        "Design a 90-day rollout plan for your own org",
        "Peer review and stress-test of the plan",
        "Concrete next steps to take home"
      ]
    }
```

- [ ] **Step 11: Confirm the file is valid JSON**

```bash
node -e "JSON.parse(require('fs').readFileSync('messages/en.json', 'utf8')); console.log('en.json valid');"
```

Expected: `en.json valid`.

If `JSON.parse` throws, the error message will pinpoint the offending line — almost always a stray or missing comma from a deleted block.

- [ ] **Step 12: Do NOT commit yet**

Task 4 mirrors all of these edits into NL. The integrity test (Step 4) only passes once both locales line up, so commit at the end of Task 4.

---

## Task 4: Mirror copy changes into `messages/nl.json`

**File:**

- Modify: `messages/nl.json`

- [ ] **Step 1: Update `hero.subtitle`**

Find:

```json
"subtitle": "Twee praktijkgerichte trainingen in Claude Code of Codex. Eén dag basis, twee dagen advanced.",
```

Replace with:

```json
"subtitle": "Twee praktijkgerichte trainingen in Claude Code of Codex. Twee dagen basis, één dag advanced.",
```

- [ ] **Step 2: Update `trainings.duration`**

Find:

```json
      "basic": "1 dag",
      "advanced": "2 dagen"
```

Replace with:

```json
      "basic": "2 dagen",
      "advanced": "1 dag"
```

- [ ] **Step 3: Update `trainings.labels.day1` and `day2`**

Find:

```json
      "day1": "Dag 1 — integratie",
      "day2": "Dag 2 — automatisering",
```

Replace with:

```json
      "day1": "Dag 1 — Fundamenten",
      "day2": "Dag 2 — Kwaliteitsloop + capstone",
```

- [ ] **Step 4: Update `trainings.basic` block**

Replace the existing `trainings.basic` block with:

```json
    "basic": {
      "name": "Basic",
      "tagline": "Twee dagen hands-on adoptie — iedereen levert een feature op.",
      "audience": [
        "Hele DevOps-teams: developers, QA / testers, ops / platform",
        "Gemengde teams die agentic workflows samen adopteren",
        "Engineering managers die met hun team meetrainen"
      ],
      "prerequisites": [
        "Vertrouwd met git en de command line",
        "Schrijft features in minimaal één taal (TS/Python/Go/etc.)"
      ],
      "outcomes": [
        "Lever een werkende feature op op een starter repo",
        "Configureer gestructureerde context (CLAUDE.md / AGENTS.md, rules) voor je eigen project",
        "Gebruik bestaande MCP servers in echte workflows",
        "Oefen met test-first loops met een agent",
        "Zet hooks en quality gates op die de volgende sprint overleven"
      ]
    },
```

- [ ] **Step 5: Update `trainings.advanced` block**

Replace the existing `trainings.advanced` block with:

```json
    "advanced": {
      "name": "Advanced",
      "tagline": "Eén dag om agentic engineering team-breed uit te rollen.",
      "audience": [
        "Tech leads en staff+ engineers die agentic workflows uitrollen",
        "Engineering managers en platform / QA leads",
        "Teams verantwoordelijk voor governance, kosten en adoptie organisatie-breed"
      ],
      "prerequisites": [
        "Basic training of vergelijkbare hands-on ervaring met Claude Code of Codex"
      ],
      "outcomes": [
        "Stap met een rollout-plan voor je eigen organisatie naar buiten",
        "Orchestreer subagents en parallelle agents op team-schaal",
        "Handhaaf teampolicy via CI hooks",
        "Zet observability en cost guardrails op voor agent-gebruik",
        "Vertrek met een 90-dagen rolloutplan dat door peers is getoetst"
      ]
    }
```

- [ ] **Step 6: Update `contact.form.trainingOptions`**

Find:

```json
        "basic": "Basic (1 dag)",
        "advanced": "Advanced (2 dagen)",
```

Replace with:

```json
        "basic": "Basic (2 dagen)",
        "advanced": "Advanced (1 dag)",
```

- [ ] **Step 7: Delete the four removed module copy blocks**

Remove the NL entries for `building-custom-mcp`, `skills-rules-deep`, `agents-sdlc-phases`, `test-first-advanced` from the `modules` block.

- [ ] **Step 8: Delete the two merged module copy blocks**

Remove the NL entries for `advanced-hooks-quality-gates` and `team-workflows-governance`.

- [ ] **Step 9: Reframe `agent-harnessing`**

Replace the NL entry with:

```json
    "agent-harnessing": {
      "title": "Agent harnessing voor teams",
      "bullets": [
        "Subagents en delegatie op team-schaal",
        "Parallelle workflows die team-grote PR-queues overleven",
        "Orchestratiepatronen en review-checkpoints"
      ]
    },
```

- [ ] **Step 10: Add the four new NL module copy blocks**

```json
    "capstone-ship-feature": {
      "title": "Capstone — lever een feature op",
      "bullets": [
        "Implementeer een kleine feature op een starter repo vanaf een brief",
        "Stuur het werk met tests, hooks en quality gates",
        "Demo en review met de cohort"
      ]
    },
    "team-rollout-playbook": {
      "title": "Team rollout playbook",
      "bullets": [
        "Adoptiefases en rolontwerp",
        "Onboarding-paden voor nieuwe collega's",
        "Volgorde van uitrol over meerdere teams"
      ]
    },
    "governance-and-policy-gates": {
      "title": "Governance + policy gates",
      "bullets": [
        "Bepaal welk beleid je team nodig heeft (security, kosten, kwaliteit)",
        "Handhaaf beleid via CI hooks in plaats van tribal review",
        "Detecteer drift en herstel snel"
      ]
    },
    "observability-and-cost": {
      "title": "Observability + cost-at-scale",
      "bullets": [
        "Usage telemetry over teams",
        "Cost guardrails en budgetten per team",
        "Anomaly triage en feedback loops"
      ]
    },
    "capstone-rollout-tabletop": {
      "title": "Capstone — rollout tabletop",
      "bullets": [
        "Ontwerp een 90-dagen rolloutplan voor je eigen organisatie",
        "Peer review en stress-test van het plan",
        "Concrete vervolgstappen voor thuis"
      ]
    }
```

- [ ] **Step 11: Validate NL JSON**

```bash
node -e "JSON.parse(require('fs').readFileSync('messages/nl.json', 'utf8')); console.log('nl.json valid');"
```

Expected: `nl.json valid`.

- [ ] **Step 12: Run the i18n integrity test + script**

```bash
pnpm vitest run tests/i18n-integrity.test.ts
pnpm verify:i18n
```

Expected: both PASS. If either fails with `missingInEn` or `missingInNl`, a key was added or removed in only one locale — fix in place before continuing.

- [ ] **Step 13: Run typecheck**

```bash
pnpm typecheck
```

Expected: PASS. (Task 2's `ModuleId` union now lines up with `messages/*.json` keys.)

- [ ] **Step 14: Commit**

```bash
git -C <repo> add messages/en.json messages/nl.json
git -C <repo> commit -m "i18n(trainings): copy + module catalogue for Basic 2d / Advanced 1d"
```

---

## Task 5: Fix the duration assertion in `TrainingCard.test.tsx`

The existing test asserts `/1 dag/` for Basic, which is no longer true.

**File:**

- Modify: `tests/components/TrainingCard.test.tsx`

- [ ] **Step 1: Run the suite, observe the failure**

```bash
pnpm vitest run tests/components/TrainingCard.test.tsx
```

Expected: the `"renders the training name and duration from i18n"` test FAILS because the rendered duration is now `2 dagen` for Basic.

- [ ] **Step 2: Update the assertion**

In `tests/components/TrainingCard.test.tsx`, find:

```ts
expect(screen.getByText(/1 dag/)).toBeInTheDocument();
```

Replace with:

```ts
expect(screen.getByText(/2 dagen/)).toBeInTheDocument();
```

- [ ] **Step 3: Run the suite, expect PASS**

```bash
pnpm vitest run tests/components/TrainingCard.test.tsx
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git -C <repo> add tests/components/TrainingCard.test.tsx
git -C <repo> commit -m "test(training-card): assert Basic 2-day duration"
```

---

## Task 6: Audit for stragglers

A redesign of this size leaves orphaned references unless we sweep. This task is a search-and-fix pass.

**Files:** Anywhere a stale duration string, removed module ID, or `training.id === 'advanced'` style branch survives.

- [ ] **Step 1: Search for old duration strings**

```bash
git -C <repo> grep -nE '1[[:space:]]*day|1[[:space:]]*dag|2[[:space:]]*days|2[[:space:]]*dagen' -- ':!node_modules' ':!docs' ':!*.lock' ':!pnpm-lock.yaml'
```

Expected matches: only `messages/en.json` and `messages/nl.json` (i18n labels we deliberately set in Tasks 3–4) and possibly the `TrainingDetail.tsx` inline ternary (`training.durationDays === 1 ? 'day' : 'days'`), which is correct. Any other hit (component prose, SEO copy, sitemap, an opengraph-image string, etc.) needs to be fixed in place.

For each unexpected hit, edit the file inline so the duration reads correctly under the new catalogue. Use the same EN/NL strings as in Tasks 3–4.

- [ ] **Step 2: Search for removed module IDs**

```bash
git -C <repo> grep -nE 'building-custom-mcp|skills-rules-deep|agents-sdlc-phases|test-first-advanced|advanced-hooks-quality-gates|team-workflows-governance' -- ':!node_modules' ':!docs' ':!*.lock' ':!pnpm-lock.yaml'
```

Expected matches: none in code (we removed them from types and i18n). If any survive — e.g., a test, a script, the metrics script, a sitemap entry — delete or rename them in place.

- [ ] **Step 3: Search for `training.id === 'advanced'` style branches**

```bash
git -C <repo> grep -nE "trainingId\s*===\s*'advanced'|training\.id\s*===\s*'advanced'" -- ':!node_modules' ':!docs'
```

Expected matches: none. Task 1 removed the only known one. If something else turns up, replace the condition with a duration- or capability-based check (e.g., `training.durationDays === 2`) so it survives further catalogue changes.

- [ ] **Step 4: Run the full vitest suite**

```bash
pnpm vitest run
```

Expected: all green. The previously written tests (Tasks 1, 2, 5) plus the existing suite must all pass.

- [ ] **Step 5: Run typecheck and lint**

```bash
pnpm typecheck
pnpm lint
```

Expected: both clean. If lint flags unused imports in `TrainingDetail.tsx` (e.g., a label translator that we no longer need for Advanced), remove them.

- [ ] **Step 6: Run E2E smoke locally**

```bash
pnpm exec playwright install --with-deps chromium
pnpm test:smoke
```

Expected: all green. The smoke spec does not assert on durations or module IDs, so it should pass; failures here usually mean dev server or env wiring, not the redesign.

- [ ] **Step 7: Commit any fixes from the audit**

If Steps 1–3 surfaced fixes:

```bash
git -C <repo> add -A
git -C <repo> status --short
git -C <repo> commit -m "chore(trainings): sweep stale duration strings and removed module references"
```

If the audit found nothing, skip this step.

---

## Task 7: Visual + final verification

The unit + E2E suites pin behaviour, but a 2d / 1d swap is the kind of change you must also eyeball.

**Files:** None — this is a manual verification pass.

- [ ] **Step 1: Start the dev server**

```bash
pnpm dev
```

Open `http://localhost:3000/nl` and `http://localhost:3000/en` in a browser.

- [ ] **Step 2: Verify the hero strapline**

- NL hero subtitle reads: `Twee dagen basis, één dag advanced.`
- EN hero subtitle reads: `Two days foundations, one day advanced.`

- [ ] **Step 3: Verify the training cards**

- The Basic card shows `2 dagen` / `2 days` and the tagline from Tasks 3.4 / 4.4.
- The Advanced card shows `1 dag` / `1 day` and the tagline from Tasks 3.5 / 4.5.
- The price under each card matches `data/trainings.ts` (€1399 Basic, €999 Advanced).

- [ ] **Step 4: Verify the training detail panels**

- Scroll to the Basic detail panel. It now shows two columns labelled `Dag 1 — Fundamenten` / `Dag 2 — Kwaliteitsloop + capstone` (NL) or `Day 1 — Foundations` / `Day 2 — Quality loop + capstone` (EN), with the 4-then-5 module split from §3.1 / §3.2 of the spec. The capstone tile reads `Capstone — lever een feature op` / `Capstone — ship a feature end-to-end`.
- Scroll to the Advanced detail panel. It is now a single, undivided list of 5 modules in the order from §3.3 (`team-rollout-playbook` first, `capstone-rollout-tabletop` last). No day headings are shown.

- [ ] **Step 5: Verify the contact form**

Visit `/nl/contact` and `/en/contact`. The "training of interest" select shows `Basic (2 dagen)` / `Basic (2 days)` and `Advanced (1 dag)` / `Advanced (1 day)`.

- [ ] **Step 6: Stop the dev server**

Ctrl-C the dev server.

- [ ] **Step 7: Run the full verification stack one more time**

```bash
pnpm typecheck
pnpm lint
pnpm vitest run
pnpm verify:i18n
pnpm test:smoke
```

Expected: all green.

If anything in Steps 2–5 looked wrong, return to the relevant earlier task and fix in place; do not paper over with extra translation strings.

- [ ] **Step 8: Final summary commit (optional)**

No code changes here unless audit / visual checks needed them. If everything is clean, the work is already on the branch in distinct commits from Tasks 1, 2, 4, 5, and possibly 6. Push when the user is ready.

---

## Out of scope (do not do as part of this plan)

- Building a new starter repository for the Day 2 capstone.
- Re-introducing the removed Advanced modules as standalone workshops.
- Marketing copy beyond the i18n strings in `messages/{nl,en}.json`.
- Pricing experiments, A/B tests, or analytics changes.
- Sales collateral or PDF brochures.

If any of these come up during implementation, capture them as follow-ups and keep going.
