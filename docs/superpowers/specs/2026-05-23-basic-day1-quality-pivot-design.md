# Basic Day-1 curriculum pivot — quality engineering with agents

**Date:** 2026-05-23
**Status:** Approved, ready for implementation plan
**Scope:** Sub-project B of a 3-part initiative (A: brand pivot — merged; B: this; C: training-detail site sections)

## Problem

Advisor feedback: current Basic Day 1 leads with agent fundamentals (what an agent is, context architecture, context window mechanics, build first feature). Quality themes (testing, failure modes, governance, regression, stress, reliability) appear only on Day 2.

Recommendation: invert the emphasis. Day 1 should teach quality engineering with agents; agent mechanics move to Day 2 as enablers for the capstone.

## Decisions

| Question           | Decision                                                                                                                                                                                                                                                                               |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Day-1 pivot depth  | Quality-first hybrid. Brief agent fundamentals (90 min) on Day 1 morning so attendees aren't lost; rest of Day 1 = quality engineering for AI-assisted code. Day 2 = deeper agent mechanics (context, MCP, skills/rules) + capstone.                                                   |
| Module ID strategy | Rename IDs whose semantics changed. Misleading IDs are a forever cost; one-time rename pays for itself.                                                                                                                                                                                |
| Day labels         | EN `Day 1 — Quality engineering with agents` / `Day 2 — Agent mechanics + capstone`. NL `Dag 1 — Quality engineering met agents` / `Dag 2 — Agent mechanics + capstone`.                                                                                                               |
| Basic tagline      | Unchanged. "Two days of hands-on adoption — every attendee ships a feature." still fits.                                                                                                                                                                                               |
| Basic outcomes     | Rewritten EN+NL to lead with quality outcomes (tests, hooks, CI green, failure-mode recognition, governance starter). Audience + prerequisites unchanged.                                                                                                                              |
| Lab vs. capstone   | Day-1 module `build-first-feature` is a constrained mid-day lab (~120 min) applying the day's quality stack. Day-2 `capstone-ship-feature` is the larger end-of-training capstone, applying full Day-1 + Day-2 stack. Both are retained.                                               |
| Implementation     | Single-PR patch — `data/trainings.ts` (type union + Basic module array), `messages/*.json` (module copy + labels + outcomes), `DESIGN.md` (day-label inline example), tests (`tests/data/trainings.test.ts`, `tests/components/TrainingDetail.test.tsx`). Advanced training untouched. |

## Module list

### Basic Day 1 — 6 modules (NEW)

| #   | Module ID                   | Title                                                 | Source                                   |
| --- | --------------------------- | ----------------------------------------------------- | ---------------------------------------- |
| 1   | `agents-in-sdlc`            | Agents in your SDLC: where they fit, where they break | renamed from `fundamentals-of-agent`     |
| 2   | `failure-modes-ai-code`     | Failure modes of AI-generated code                    | NEW                                      |
| 3   | `test-first-with-agents`    | Test-first with agents                                | renamed from `test-first-intro`          |
| 4   | `hooks-and-quality-gates`   | Hooks + quality gates                                 | renamed from `basic-hooks-quality-gates` |
| 5   | `build-first-feature`       | Lab: build your first feature with quality discipline | kept ID, retitled                        |
| 6   | `regression-and-governance` | Regression strategy + governance basics               | NEW                                      |

### Basic Day 2 — 5 modules (unchanged IDs)

| #   | Module ID                  | Title                                | Source                                                               |
| --- | -------------------------- | ------------------------------------ | -------------------------------------------------------------------- |
| 1   | `context-architecture`     | Context architecture                 | kept (moved from Day 1)                                              |
| 2   | `context-window-mechanics` | Context window mechanics             | kept (moved from Day 1)                                              |
| 3   | `using-mcp-servers`        | Using MCP servers                    | kept                                                                 |
| 4   | `intro-skills-rules`       | Intro to Skills + Rules              | kept                                                                 |
| 5   | `capstone-ship-feature`    | Capstone — ship a feature end-to-end | kept ID + title; bullets reframed to apply Day-1 stack + Day-2 tools |

Total: 11 modules (was 9). Net +2 new, 3 renames, 0 deletes.

### `data/trainings.ts` `ModuleId` union changes

- **Remove:** `fundamentals-of-agent`, `test-first-intro`, `basic-hooks-quality-gates`
- **Add:** `agents-in-sdlc`, `failure-modes-ai-code`, `test-first-with-agents`, `hooks-and-quality-gates`, `regression-and-governance`
- Advanced module IDs untouched.

## Copy diffs

### Day labels — i18n

| Key                     | Current EN                      | New EN                                  | Current NL                        | New NL                                 |
| ----------------------- | ------------------------------- | --------------------------------------- | --------------------------------- | -------------------------------------- |
| `trainings.labels.day1` | Day 1 — Foundations             | Day 1 — Quality engineering with agents | Dag 1 — Fundamenten               | Dag 1 — Quality engineering met agents |
| `trainings.labels.day2` | Day 2 — Quality loop + capstone | Day 2 — Agent mechanics + capstone      | Dag 2 — Kwaliteitsloop + capstone | Dag 2 — Agent mechanics + capstone     |

### Basic outcomes — EN (`trainings.basic.outcomes`)

New list (6 items):

1. `Ship a working feature on a starter repo — tests, hooks, CI green from minute one`
2. `Recognise the failure modes of AI-generated code in your own work`
3. `Practise test-first with an agent without writing fake-passing tests`
4. `Set up hooks and quality gates that survive the next sprint`
5. `Use existing MCP servers in real workflows`
6. `Leave with a governance starter your team can actually use`

### Basic outcomes — NL (`trainings.basic.outcomes`)

1. `Lever een werkende feature op een starter repo — tests, hooks, CI groen vanaf minuut één`
2. `Herken failure modes van AI-gegenereerde code in je eigen werk`
3. `Oefen test-first met een agent zonder niets zeggende tests te schrijven`
4. `Zet hooks en quality gates op die de volgende sprint overleven`
5. `Gebruik bestaande MCP servers in echte workflows`
6. `Stap naar buiten met een governance-starter die je team echt kan gebruiken`

### Module copy — EN

#### Day 1

```jsonc
"agents-in-sdlc": {
  "title": "Agents in your SDLC: where they fit, where they break",
  "bullets": [
    "Where an agent earns its place in the SDLC, and where it doesn't",
    "What an agent actually is vs. chat vs. automation",
    "Quality stakes: every agent change is a code change that ships"
  ]
}
"failure-modes-ai-code": {
  "title": "Failure modes of AI-generated code",
  "bullets": [
    "Hallucination, silent regression, false-green builds",
    "Scope drift and undeclared rewrites",
    "How to spot each before they ship"
  ]
}
"test-first-with-agents": {
  "title": "Test-first with agents",
  "bullets": [
    "The TDD loop with an agent driver",
    "When tests precede code, when they don't, why it matters",
    "Tests that prove behaviour vs. tests that satisfy the model"
  ]
}
"hooks-and-quality-gates": {
  "title": "Hooks + quality gates",
  "bullets": [
    "Pre-commit checks: lint, format, type-check",
    "Custom hooks for agent-specific risks",
    "Fast feedback loops that don't get bypassed"
  ]
}
"build-first-feature": {
  "title": "Lab: build your first feature with quality discipline",
  "bullets": [
    "End-to-end on a starter repo: brief → tests → code → review",
    "Run today's quality stack against your own changes",
    "Cohort feedback before Day 2"
  ]
}
"regression-and-governance": {
  "title": "Regression strategy + governance basics",
  "bullets": [
    "Golden tests, snapshot guards, property-based checks, mutation testing, etc.",
    "Stress-testing agent output on real edges",
    "What a sensible team review policy looks like"
  ]
}
```

#### Day 2

- `context-architecture`, `context-window-mechanics`, `using-mcp-servers`, `intro-skills-rules` — **unchanged**.

```jsonc
"capstone-ship-feature": {
  "title": "Capstone — ship a feature end-to-end",
  "bullets": [
    "Implement a feature on a starter repo from a brief",
    "Apply Day-1 quality stack + Day-2 context tooling (MCP, skills, rules)",
    "Demo and review with the cohort"
  ]
}
```

### Module copy — NL

#### Day 1

```jsonc
"agents-in-sdlc": {
  "title": "Agents in je SDLC: waar ze passen, waar ze breken",
  "bullets": [
    "Waar een agent zijn plek verdient in de SDLC, en waar niet",
    "Wat een agent is vs. chat vs. automatisering",
    "Quality stakes: elke agent-wijziging is code die in productie komt"
  ]
}
"failure-modes-ai-code": {
  "title": "Failure modes van AI-gegenereerde code",
  "bullets": [
    "Hallucinaties, stille regressies, false-green builds",
    "Scope drift en onaangekondigde rewrites",
    "Hoe je ze herkent voordat ze in productie staan"
  ]
}
"test-first-with-agents": {
  "title": "Test-first met agents",
  "bullets": [
    "De TDD-loop met een agent als driver",
    "Wanneer tests vóór code komen, wanneer niet, waarom het uitmaakt",
    "Tests die gedrag bewijzen vs. tests die het model tevreden stellen"
  ]
}
"hooks-and-quality-gates": {
  "title": "Hooks + quality gates",
  "bullets": [
    "Pre-commit checks: lint, format, type-check",
    "Custom hooks voor agent-specifieke risico's",
    "Snelle feedback-loops die niet omzeild worden"
  ]
}
"build-first-feature": {
  "title": "Lab: bouw je eerste feature met quality-discipline",
  "bullets": [
    "End-to-end op een starter repo: brief → tests → code → review",
    "Pas de quality stack van vandaag toe op je eigen wijzigingen",
    "Feedback van het cohort vóór Dag 2"
  ]
}
"regression-and-governance": {
  "title": "Regressie-strategie + governance basics",
  "bullets": [
    "Golden tests, snapshot guards, property-based checks, mutation testing, etc.",
    "Stress-test agent-output op echte randen",
    "Hoe een verstandig team-review-beleid eruitziet"
  ]
}
```

#### Day 2

- `context-architecture`, `context-window-mechanics`, `using-mcp-servers`, `intro-skills-rules` — **unchanged**.

```jsonc
"capstone-ship-feature": {
  "title": "Lever een feature op",
  "bullets": [
    "Implementeer een feature op een starter repo vanaf een brief",
    "Pas de Dag-1 quality stack + Dag-2 context tooling (MCP, skills, rules) toe",
    "Demo en review met de groep"
  ]
}
```

## Test updates

### `tests/data/trainings.test.ts`

- Update test name from `"Basic is a 2-day training with the 8 retained modules + capstone, split across 2 days"` → `"Basic is a 2-day training with 11 modules split 6 / 5 across two days"`.
- Update the `expected` array (lines 10–20) to the new 11-module ordering:

  ```ts
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
  ```

- Advanced test untouched.

### `tests/components/TrainingDetail.test.tsx`

- Line 63 fixture uses `{ id: 'fundamentals-of-agent', day: 1 }`. Replace with `{ id: 'agents-in-sdlc', day: 1 }`. Refresh any other entries in the same fixture to use new Day-1 IDs (`failure-modes-ai-code`, `test-first-with-agents`, etc.) so the fixture stays representative.

### CI / i18n parity

- `scripts/verify-i18n.ts` runs at CI; it will catch any EN/NL key drift automatically (no spec change, just discipline during edits).
- `pnpm typecheck` (`tsc --noEmit`) will fail on any stale `ModuleId` reference, blocking accidental drift.

## Docs touched

- `DESIGN.md:191` — inline example currently reads `Dag 1 — Fundamenten` and `Dag 2 — Kwaliteitsloop + capstone`. Update both to match the new NL day labels.
- `PRODUCT.md` — left as-is. Curriculum description there is generic enough not to require a touch in this PR. Future PRODUCT.md refresh tracked separately.

## Out of scope

- Site sections additions: identity, proof-of-identity, explicit visual agenda, code/demo, testimonials/outcomes (sub-project **C**)
- Visual / component redesign of the curriculum block (still uses the 2-column day split per `DESIGN.md`)
- Pricing (Basic stays €1399, Advanced €999)
- Audience copy edits
- Prerequisites edits
- Hero / meta / footer copy (handled by sub-project A)
- Advanced training modules (already governance/observability-leaning)
- New tests beyond updating the existing 2 pins

## Rollback

Single PR. Revert restores 9-module catalogue and old day labels. Module ID renames cascade via type union — `tsc --noEmit` blocks any stale reference. `scripts/verify-i18n.ts` guards EN/NL parity.

## Verification

- `pnpm typecheck` — green (no stale `ModuleId` references).
- `pnpm test` — green (data + component tests updated, i18n parity script passes).
- `pnpm test:e2e` — green (no module-name pins; hero regex from sub-project A still passes since wording around modules doesn't affect hero h1).
- Manual: `pnpm dev`; visit `/en/trainings/basic` and `/nl/trainings/basic`; confirm Day-1 column shows new 6 modules with new titles + bullets, Day-2 column shows 5 modules, day labels updated, outcomes list reflects new copy. Confirm Advanced page unchanged.
