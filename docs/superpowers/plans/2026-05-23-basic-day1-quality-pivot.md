# Basic Day-1 Curriculum Pivot — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Invert the Basic training curriculum so Day 1 leads with quality engineering (failure modes, test-first, hooks, regression, governance) and Day 2 carries agent mechanics + capstone. Total 11 modules (was 9): 2 new, 3 renames, 0 deletes.

**Architecture:** Single PR on `feat/basic-day1-quality-pivot`. Update the type union and module array in `data/trainings.ts` first (TDD), then mirror the rename across `messages/en.json` + `messages/nl.json` (module copy, day labels, training outcomes), update the one component-test fixture that pins a renamed module ID, and refresh the inline day-label example in `DESIGN.md`. No new components, no schema changes.

**Tech Stack:** TypeScript, next-intl (i18n), Vitest (unit/component), Playwright (e2e), pnpm.

**Spec:** `docs/superpowers/specs/2026-05-23-basic-day1-quality-pivot-design.md`

---

### Task 0: Confirm branch + clean tree

**Files:** none

- [ ] **Step 1: Confirm on feature branch + clean tree**

Run:

```bash
git status
git branch --show-current
```

Expected: clean tree, branch `feat/basic-day1-quality-pivot`. If on `main`, run `git checkout feat/basic-day1-quality-pivot`. The spec commit should already be in this branch's log (`git log --oneline -1` shows `docs(spec): Basic Day-1 curriculum pivot to quality engineering`).

---

### Task 1: TDD red — update the trainings catalogue test

**Files:**

- Modify: `tests/data/trainings.test.ts`

- [ ] **Step 1: Read current state**

Run: `git show HEAD:tests/data/trainings.test.ts | head -25`

Expected: the test asserts 9 modules with old IDs (`fundamentals-of-agent`, `test-first-intro`, `basic-hooks-quality-gates`).

- [ ] **Step 2: Rewrite the first test in `tests/data/trainings.test.ts`**

Replace the body of the `'Basic is a 2-day training with the 8 retained modules + capstone, split across 2 days'` test (lines 5–23) with this new test:

```ts
it('Basic is a 2-day training with 11 modules split 6 / 5 across two days', () => {
  const basic = trainings.basic;
  expect(basic.durationDays).toBe(2);
  expect(basic.priceEUR).toBe(1399);

  const expected: { id: ModuleId; day: 1 | 2 }[] = [
    { id: 'agents-in-sdlc', day: 1 },
    { id: 'failure-modes-ai-code', day: 1 },
    { id: 'test-first-with-agents', day: 1 },
    { id: 'hooks-and-quality-gates', day: 1 },
    { id: 'build-first-feature', day: 1 },
    { id: 'regression-and-governance', day: 1 },
    { id: 'context-architecture', day: 2 },
    { id: 'context-window-mechanics', day: 2 },
    { id: 'using-mcp-servers', day: 2 },
    { id: 'intro-skills-rules', day: 2 },
    { id: 'capstone-ship-feature', day: 2 },
  ];

  expect(basic.modules).toEqual(expected);
});
```

Leave the Advanced test and the delivery-formats test untouched.

- [ ] **Step 3: Run the test (expect FAIL)**

Run: `pnpm test tests/data/trainings.test.ts`

Expected: the first test FAILS (`AssertionError: expected [Array(9)] to deeply equal [Array(11)]`) AND/OR TypeScript errors on the new module IDs because the union doesn't include them yet. This is the intended RED state. Do NOT update `data/trainings.ts` yet — that happens in Task 2.

- [ ] **Step 4: Commit failing test**

Run:

```bash
git add tests/data/trainings.test.ts
git commit -m "test(trainings): pin new 11-module catalogue (Day-1 quality pivot)"
```

Note: lefthook's pre-commit may run prettier; let it. If the commit fails on a hook other than prettier, re-stage and re-commit. Do NOT use `--no-verify`.

---

### Task 2: Update `data/trainings.ts` + fixture (atomic for TypeScript)

**Files:**

- Modify: `data/trainings.ts`
- Modify: `tests/components/TrainingDetail.test.tsx` (line 63 fixture references a removed ID)

These two changes ship in one commit because removing IDs from the `ModuleId` union immediately breaks the fixture; keeping them together keeps `tsc --noEmit` green at every commit.

- [ ] **Step 1: Read current `data/trainings.ts`**

Run: `cat data/trainings.ts`

Expected: 9-module Basic array, `ModuleId` union with old IDs.

- [ ] **Step 2: Replace the entire contents of `data/trainings.ts`**

Use the Write tool to overwrite with this exact content:

```ts
export type ModuleId =
  // Basic Day 1 — quality engineering with agents (6 modules)
  | 'agents-in-sdlc'
  | 'failure-modes-ai-code'
  | 'test-first-with-agents'
  | 'hooks-and-quality-gates'
  | 'build-first-feature'
  | 'regression-and-governance'
  // Basic Day 2 — agent mechanics + capstone (5 modules)
  | 'context-architecture'
  | 'context-window-mechanics'
  | 'using-mcp-servers'
  | 'intro-skills-rules'
  | 'capstone-ship-feature'
  // Advanced (5 modules)
  | 'team-rollout-playbook'
  | 'agent-harnessing'
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
      { id: 'agents-in-sdlc', day: 1 },
      { id: 'failure-modes-ai-code', day: 1 },
      { id: 'test-first-with-agents', day: 1 },
      { id: 'hooks-and-quality-gates', day: 1 },
      { id: 'build-first-feature', day: 1 },
      { id: 'regression-and-governance', day: 1 },
      { id: 'context-architecture', day: 2 },
      { id: 'context-window-mechanics', day: 2 },
      { id: 'using-mcp-servers', day: 2 },
      { id: 'intro-skills-rules', day: 2 },
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

- [ ] **Step 3: Update `tests/components/TrainingDetail.test.tsx` fixture**

Locate line 63 (current: `{ id: 'fundamentals-of-agent', day: 1 },`). Replace with: `{ id: 'agents-in-sdlc', day: 1 },`. Leave the `{ id: 'context-architecture', day: 2 }` line below it unchanged.

- [ ] **Step 4: Run typecheck**

Run: `pnpm typecheck`

Expected: PASS. If it fails, an old `ModuleId` literal is still referenced somewhere. Search with `rg "fundamentals-of-agent|test-first-intro|basic-hooks-quality-gates" --type ts --type tsx --type-add 'tsx:*.tsx'` and fix the offender. None should exist outside i18n JSON (which is not type-checked).

- [ ] **Step 5: Run trainings test (now expect PASS)**

Run: `pnpm test tests/data/trainings.test.ts`

Expected: all 3 trainings tests PASS. The pin from Task 1 now matches the array.

- [ ] **Step 6: Note expected component test failures**

Run: `pnpm test tests/components/TrainingDetail.test.tsx`

Expected: tests may PASS or FAIL depending on whether they read i18n keys for removed modules. If they fail, the failure is "missing translation" — this is expected because `messages/*.json` still has old keys. Task 3 + Task 4 fix this. Do NOT modify component logic.

- [ ] **Step 7: Commit**

Run:

```bash
git add data/trainings.ts tests/components/TrainingDetail.test.tsx
git commit -m "feat(trainings): invert Basic curriculum — Day 1 quality, Day 2 agent mechanics"
```

---

### Task 3: Update EN module copy + labels + outcomes

**Files:**

- Modify: `messages/en.json`

Reference: spec sections "Day labels — i18n", "Basic outcomes — EN", "Module copy — EN".

- [ ] **Step 1: Update day labels in `messages/en.json`**

Find `trainings.labels.day1` and `trainings.labels.day2`. Apply these exact replacements:

- `"day1": "Day 1 — Foundations"` → `"day1": "Day 1 — Quality engineering with agents"`
- `"day2": "Day 2 — Quality loop + capstone"` → `"day2": "Day 2 — Agent mechanics + capstone"`

- [ ] **Step 2: Replace `trainings.basic.outcomes` array**

Locate the `outcomes` array under `trainings.basic` (currently 5 items). Replace the entire array with exactly these 6 items, in order:

```json
[
  "Ship a working feature on a starter repo — tests, hooks, CI green from minute one",
  "Recognise the failure modes of AI-generated code in your own work",
  "Practise test-first with an agent without writing fake-passing tests",
  "Set up hooks and quality gates that survive the next sprint",
  "Use existing MCP servers in real workflows",
  "Leave with a governance starter your team can actually use"
]
```

- [ ] **Step 3: Remove obsolete `modules.*` entries**

Delete these three top-level entries inside the `"modules": { ... }` object:

- `"fundamentals-of-agent": { ... }`
- `"test-first-intro": { ... }`
- `"basic-hooks-quality-gates": { ... }`

- [ ] **Step 4: Add six new / retitled `modules.*` entries**

Inside the `"modules": { ... }` object, insert these entries (location does not affect semantics, but for readability place the 6 Day-1 modules first, then the Day-2 capstone reframe near the existing `capstone-ship-feature`). Replace the existing `build-first-feature` entry and the existing `capstone-ship-feature` entry; add the four others alongside.

```json
"agents-in-sdlc": {
  "title": "Agents in your SDLC: where they fit, where they break",
  "bullets": [
    "Where an agent earns its place in the SDLC, and where it doesn't",
    "What an agent actually is vs. chat vs. automation",
    "Quality stakes: every agent change is a code change that ships"
  ]
},
"failure-modes-ai-code": {
  "title": "Failure modes of AI-generated code",
  "bullets": [
    "Hallucination, silent regression, false-green builds",
    "Scope drift and undeclared rewrites",
    "How to spot each before they ship"
  ]
},
"test-first-with-agents": {
  "title": "Test-first with agents",
  "bullets": [
    "The TDD loop with an agent driver",
    "When tests precede code, when they don't, why it matters",
    "Tests that prove behaviour vs. tests that satisfy the model"
  ]
},
"hooks-and-quality-gates": {
  "title": "Hooks + quality gates",
  "bullets": [
    "Pre-commit checks: lint, format, type-check",
    "Custom hooks for agent-specific risks",
    "Fast feedback loops that don't get bypassed"
  ]
},
"build-first-feature": {
  "title": "Lab: build your first feature with quality discipline",
  "bullets": [
    "End-to-end on a starter repo: brief → tests → code → review",
    "Run today's quality stack against your own changes",
    "Cohort feedback before Day 2"
  ]
},
"regression-and-governance": {
  "title": "Regression strategy + governance basics",
  "bullets": [
    "Golden tests, snapshot guards, property-based checks",
    "Stress-testing agent output on real edges",
    "What a sensible team review policy looks like"
  ]
}
```

Also replace the existing `capstone-ship-feature` entry with:

```json
"capstone-ship-feature": {
  "title": "Capstone — ship a feature end-to-end",
  "bullets": [
    "Implement a feature on a starter repo from a brief",
    "Apply Day-1 quality stack + Day-2 context tooling (MCP, skills, rules)",
    "Demo and review with the cohort"
  ]
}
```

`context-architecture`, `context-window-mechanics`, `using-mcp-servers`, `intro-skills-rules`, `agent-harnessing`, `team-rollout-playbook`, `governance-and-policy-gates`, `observability-and-cost`, `capstone-rollout-tabletop` — leave untouched.

- [ ] **Step 5: Validate JSON**

Run: `node -e "JSON.parse(require('fs').readFileSync('messages/en.json'))" && echo ok`

Expected: `ok`. If parse error, fix the trailing comma / missing brace.

- [ ] **Step 6: Commit EN copy**

Run:

```bash
git add messages/en.json
git commit -m "i18n(en): Basic Day-1 quality modules + day labels + outcomes"
```

---

### Task 4: Update NL module copy + labels + outcomes (mirror)

**Files:**

- Modify: `messages/nl.json`

Reference: spec sections "Day labels — i18n" (NL columns), "Basic outcomes — NL", "Module copy — NL".

- [ ] **Step 1: Update NL day labels in `messages/nl.json`**

- `"day1": "Dag 1 — Fundamenten"` → `"day1": "Dag 1 — Quality engineering met agents"`
- `"day2": "Dag 2 — Kwaliteitsloop + capstone"` → `"day2": "Dag 2 — Agent mechanics + capstone"`

- [ ] **Step 2: Replace `trainings.basic.outcomes` array (NL)**

Replace the entire array with these 6 entries, in order:

```json
[
  "Lever een werkende feature op een starter repo — tests, hooks, CI groen vanaf minuut één",
  "Herken failure modes van AI-gegenereerde code in je eigen werk",
  "Oefen test-first met een agent zonder schijnpassende tests te schrijven",
  "Zet hooks en quality gates op die de volgende sprint overleven",
  "Gebruik bestaande MCP servers in echte workflows",
  "Stap naar buiten met een governance-starter die je team echt kan gebruiken"
]
```

Preserve the diacritic `é` in `minuut één`.

- [ ] **Step 3: Remove obsolete `modules.*` entries (NL)**

Delete from `"modules": { ... }`:

- `"fundamentals-of-agent": { ... }`
- `"test-first-intro": { ... }`
- `"basic-hooks-quality-gates": { ... }`

- [ ] **Step 4: Add six new / retitled `modules.*` entries (NL)**

```json
"agents-in-sdlc": {
  "title": "Agents in je SDLC: waar ze passen, waar ze breken",
  "bullets": [
    "Waar een agent zijn plek verdient in de SDLC, en waar niet",
    "Wat een agent is vs. chat vs. automatisering",
    "Quality stakes: elke agent-wijziging is code die in productie komt"
  ]
},
"failure-modes-ai-code": {
  "title": "Failure modes van AI-gegenereerde code",
  "bullets": [
    "Hallucinaties, stille regressies, false-green builds",
    "Scope drift en onaangekondigde rewrites",
    "Hoe je ze herkent voordat ze in productie staan"
  ]
},
"test-first-with-agents": {
  "title": "Test-first met agents",
  "bullets": [
    "De TDD-loop met een agent als driver",
    "Wanneer tests vóór code komen, wanneer niet, waarom het uitmaakt",
    "Tests die gedrag bewijzen vs. tests die het model tevreden stellen"
  ]
},
"hooks-and-quality-gates": {
  "title": "Hooks + quality gates",
  "bullets": [
    "Pre-commit checks: lint, format, type-check",
    "Custom hooks voor agent-specifieke risico's",
    "Snelle feedback-loops die niet omzeild worden"
  ]
},
"build-first-feature": {
  "title": "Lab: bouw je eerste feature met quality-discipline",
  "bullets": [
    "End-to-end op een starter repo: brief → tests → code → review",
    "Pas de quality stack van vandaag toe op je eigen wijzigingen",
    "Feedback van het cohort vóór Dag 2"
  ]
},
"regression-and-governance": {
  "title": "Regressie-strategie + governance basics",
  "bullets": [
    "Golden tests, snapshot guards, property-based checks",
    "Stress-test agent-output op echte randen",
    "Hoe een verstandig team-review-beleid eruitziet"
  ]
}
```

Replace the existing NL `capstone-ship-feature` with:

```json
"capstone-ship-feature": {
  "title": "Capstone — lever een feature op",
  "bullets": [
    "Implementeer een feature op een starter repo vanaf een brief",
    "Pas de Dag-1 quality stack + Dag-2 context tooling (MCP, skills, rules) toe",
    "Demo en review met de cohort"
  ]
}
```

Untouched NL modules: `context-architecture`, `context-window-mechanics`, `using-mcp-servers`, `intro-skills-rules`, `agent-harnessing`, `team-rollout-playbook`, `governance-and-policy-gates`, `observability-and-cost`, `capstone-rollout-tabletop`.

- [ ] **Step 5: Validate JSON**

Run: `node -e "JSON.parse(require('fs').readFileSync('messages/nl.json'))" && echo ok`

Expected: `ok`.

- [ ] **Step 6: Run i18n parity check**

Run: `pnpm verify:i18n`

Expected: `i18n integrity OK`. This script (scripts/verify-i18n.ts) compares the full key set between EN and NL.

- [ ] **Step 7: Run full unit + component test suite**

Run: `pnpm test`

Expected: all tests PASS. Component tests for TrainingDetail now find translations for the new module IDs in both locales.

- [ ] **Step 8: Commit NL copy**

Run:

```bash
git add messages/nl.json
git commit -m "i18n(nl): Basic Day-1 quality modules + day labels + outcomes"
```

---

### Task 5: Update DESIGN.md day-label example

**Files:**

- Modify: `DESIGN.md:191`

- [ ] **Step 1: Read current line**

Run: `sed -n '191p' DESIGN.md`

Expected output (one line):

```
5. **Curriculum** — for Advanced, a single numbered list (`01`, `02`, …); for Basic, a 2-column split with `Dag 1 — Fundamenten` and `Dag 2 — Kwaliteitsloop + capstone` markers in orange.
```

- [ ] **Step 2: Edit the line**

Replace `Dag 1 — Fundamenten` with `Dag 1 — Quality engineering met agents`. Replace `Dag 2 — Kwaliteitsloop + capstone` with `Dag 2 — Agent mechanics + capstone`. Keep the rest of the sentence (including the surrounding markdown) intact.

- [ ] **Step 3: Commit**

Run:

```bash
git add DESIGN.md
git commit -m "docs(design): refresh day-label example to new Basic Day-1 quality pivot"
```

---

### Task 6: Full verification + push + PR

**Files:** none (verification + push)

- [ ] **Step 1: Run typecheck**

Run: `pnpm typecheck`

Expected: no errors. If any old `ModuleId` literal still appears in code, search with `rg "fundamentals-of-agent|test-first-intro|basic-hooks-quality-gates" --type ts` and fix. None should remain in source code (JSON is not type-checked, but should already be updated by Tasks 3–4).

- [ ] **Step 2: Run lint**

Run: `pnpm lint`

Expected: no errors.

- [ ] **Step 3: Run unit + component tests**

Run: `pnpm test`

Expected: all tests PASS.

- [ ] **Step 4: Run e2e tests**

Run: `pnpm test:e2e`

Expected: all PASS. No e2e spec pins module names, so the renames don't affect e2e behavior. Hero regex from sub-project A (`/agentic.*engineering/i` + `/quality engineering/i` forward-pin) still satisfied because hero copy is unchanged in this PR.

- [ ] **Step 5: Manual visual check (EN)**

Run: `pnpm dev` (background; wait for `Ready on http://localhost:3000`).

Open http://localhost:3000/en/trainings/basic and verify:

- Day-1 column shows 6 modules in order: `Agents in your SDLC…`, `Failure modes of AI-generated code`, `Test-first with agents`, `Hooks + quality gates`, `Lab: build your first feature with quality discipline`, `Regression strategy + governance basics`.
- Day-2 column shows 5 modules in order: `Context architecture`, `Context window mechanics`, `Using MCP servers`, `Intro to Skills + Rules`, `Capstone — ship a feature end-to-end`.
- Day-1 label reads `Day 1 — Quality engineering with agents`.
- Day-2 label reads `Day 2 — Agent mechanics + capstone`.
- The outcomes list at the top of the page shows the 6 new outcomes (starting with `Ship a working feature on a starter repo — tests, hooks, CI green from minute one`).
- Capstone bullets mention `Apply Day-1 quality stack + Day-2 context tooling`.

- [ ] **Step 6: Manual visual check (NL)**

Open http://localhost:3000/nl/trainings/basic and verify the NL mirrors of the above (e.g., `Dag 1 — Quality engineering met agents`, `Failure modes van AI-gegenereerde code`, `Stap naar buiten met een governance-starter…`).

- [ ] **Step 7: Manual visual check (Advanced unchanged)**

Open http://localhost:3000/en/trainings/advanced and http://localhost:3000/nl/trainings/advanced. Confirm 5-module Advanced list is exactly as it was (no renames, no copy changes).

- [ ] **Step 8: Stop dev server**

Kill the background `pnpm dev` process.

- [ ] **Step 9: Push branch**

Run:

```bash
git push -u origin feat/basic-day1-quality-pivot
```

- [ ] **Step 10: Open PR**

Run:

```bash
gh pr create --title "feat(trainings): Basic Day-1 pivot — quality engineering with agents" --body "$(cat <<'EOF'
## Summary
- Invert Basic curriculum: Day 1 leads with quality engineering (failure modes, test-first, hooks, regression, governance); Day 2 carries agent mechanics + capstone
- 11 modules total (was 9): 2 new, 3 renames, 0 deletes
- `ModuleId` union, Basic outcomes, day labels, and module copy all updated (EN + NL)
- `DESIGN.md` day-label example refreshed
- Advanced training untouched

Sub-project **B** of a 3-part initiative. Follow-up: **C** — training-detail site sections (identity, proof-of-identity, explicit 2-day agenda, code/demo, testimonials).

## Spec + Plan
- docs/superpowers/specs/2026-05-23-basic-day1-quality-pivot-design.md
- docs/superpowers/plans/2026-05-23-basic-day1-quality-pivot.md

## Test plan
- [x] `pnpm typecheck` — no stale ModuleId references
- [x] `pnpm test` — unit + component pass
- [x] `pnpm test:e2e` — all e2e suites pass
- [x] `pnpm verify:i18n` — EN/NL parity holds
- [ ] Manual `/en/trainings/basic` + `/nl/trainings/basic` reflect new Day-1 / Day-2 layout, outcomes, capstone reframe
- [ ] Manual `/en/trainings/advanced` + `/nl/trainings/advanced` unchanged

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

Expected: PR URL printed.

---

## Verification summary

- `pnpm typecheck` — green
- `pnpm lint` — green
- `pnpm test` — 48+ tests pass (existing 48 plus any kept; pinning test now asserts 11 modules)
- `pnpm test:e2e` — green
- `pnpm verify:i18n` — `i18n integrity OK`
- Manual: Day-1 column has 6 new modules in order, Day-2 has 5, day labels updated, outcomes refreshed, capstone bullets mention Day-1 quality stack + Day-2 tooling. Advanced unchanged.

## Rollback

Single feature branch. Revert the merge commit on `main` to restore the 9-module catalogue, old day labels, old outcomes, and old `DESIGN.md` example in one operation. Module ID renames cascade safely via the `ModuleId` union — `tsc --noEmit` blocks any stale reference both during this work and during a revert.
