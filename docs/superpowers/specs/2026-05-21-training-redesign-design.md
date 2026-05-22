# Training catalogue redesign — Basic 2d + Advanced 1d

**Date:** 2026-05-21
**Site:** agenticengineering.nl
**Status:** Design — pending review

## 1. Goal

Restructure the agenticengineering.nl training catalogue from the current asymmetric pair
(Basic 1d / Advanced 2d) to an inverted pair:

- **Basic — 2 days — "Adopt agentic engineering"**
- **Advanced — 1 day — "Scale to team"**

The redesign reframes Advanced away from deeper individual-IC tooling and toward
team-scale operating model (rollout, governance, parallel agents, cost & observability).
Basic gets the additional day so hands-on labs become real labs rather than demos
(≥60% lab time, all attendees ship a feature end-to-end by end of Day 2).

## 2. Positioning

### 2.1 Basic — 2 days — "Adopt agentic engineering"

- **Audience:** whole DevOps team — developers, QA / test engineers, ops / platform.
  Designed for mixed-role cohorts where every attendee leaves able to use
  Claude Code or Codex on their own repo.
- **Outcome:** every attendee ships a working feature end-to-end with tests and
  hooks in place on a starter repo, plus a configured CLAUDE.md/AGENTS.md for
  their own project.

### 2.2 Advanced — 1 day — "Scale to team"

- **Audience:** tech leads, engineering managers, staff+ engineers, platform /
  QA leads — the people responsible for rolling agentic workflows out across
  multiple teams.
- **Prerequisite:** Basic training or equivalent hands-on Claude Code / Codex
  experience.
- **Outcome:** leave with a rollout playbook for own org, parallel-agent
  orchestration patterns, CI-enforced team policy, and cost / observability
  guardrails.

### 2.3 Trade-offs accepted

Advanced no longer covers deep individual-IC content:

- Building custom MCP servers
- Deep skill / rule authoring
- Advanced TDD patterns (contract, property-based, mutation)
- Agents in every SDLC phase (overlaps with Basic Day 2)

These modules are removed from the active catalogue. They may return later as
optional follow-on workshops if demand emerges — out of scope for this redesign.

## 3. Curriculum

### 3.1 Basic — Day 1: Foundations + first feature

| #   | Module                                  | Time | Format              |
| --- | --------------------------------------- | ---- | ------------------- |
| 1   | Fundamentals of an agent                | 60m  | Lecture + demo      |
| 2   | Context architecture                    | 90m  | Lab on own repo     |
| 3   | Context window mechanics                | 60m  | Short lecture + lab |
| 4   | Build your first feature (extended lab) | 3.5h | Lab w/ checkpoints  |

Lab ratio Day 1: ~70%.

### 3.2 Basic — Day 2: Tools + quality loop + capstone

| #   | Module                            | Time | Format                |
| --- | --------------------------------- | ---- | --------------------- |
| 5   | Using MCP servers                 | 90m  | Lab — connect 2 srv.  |
| 6   | Intro to Skills & Rules           | 90m  | Lab — author 1 skill  |
| 7   | Test-first strategy — intro       | 90m  | Lab — TDD with agent  |
| 8   | Basic hooks & quality gates       | 90m  | Lab — pre-commit + tc |
| 9   | Capstone: ship feature end-to-end | 90m  | Lab on starter repo   |

Lab ratio Day 2: ~85%.

All 8 modules from the current Basic 1d curriculum are retained 1:1. The doubled
duration converts demos into hands-on labs and adds the Day 2 capstone.

### 3.3 Advanced — 1 day (≥60% labs)

| #   | Module                        | Time | Format                     |
| --- | ----------------------------- | ---- | -------------------------- |
| 1   | Team rollout playbook         | 60m  | Lecture + group discussion |
| 2   | Agent harnessing for teams    | 120m | Lab — subagents + parallel |
| 3   | Governance + policy gates     | 120m | Lab — CI policy via hooks  |
| 4   | Observability + cost-at-scale | 90m  | Lab — usage telemetry      |
| 5   | Capstone rollout tabletop     | 90m  | Group exercise             |

Lab ratio: ~65%.

## 4. Module catalogue changes

### 4.1 Retained (unchanged copy)

`fundamentals-of-agent`, `context-architecture`, `context-window-mechanics`,
`build-first-feature`, `intro-skills-rules`, `using-mcp-servers`,
`test-first-intro`, `basic-hooks-quality-gates`, `agent-harnessing`.

### 4.2 Removed from active catalogue

`building-custom-mcp`, `skills-rules-deep`, `agents-sdlc-phases`,
`test-first-advanced`.

Open decision (see §7): hard delete from i18n + types, or keep copy archived
behind a feature flag for a future optional-workshop section.

### 4.3 Merged

`team-workflows-governance` + `advanced-hooks-quality-gates`
→ new `governance-and-policy-gates`.
The merge unifies "what policy do we want" with "how do we enforce it in CI."
Old IDs are removed; new ID and copy block added.

### 4.4 Added

- `team-rollout-playbook` — adoption stages, role design, onboarding paths,
  rollout sequencing.
- `observability-and-cost` — usage telemetry, cost guardrails, anomaly triage,
  per-team budgeting patterns.
- `capstone-rollout-tabletop` — guided group exercise: attendees design a
  90-day rollout plan for their own org; peer review.

### 4.5 Reframed (copy-only)

`agent-harnessing` — landing copy reframed to a team-scale framing. Module ID
unchanged to minimise churn in `data/trainings.ts` and the `ModuleId` union;
the i18n `modules.agent-harnessing.title` changes from "Agent harnessing" to
"Agent harnessing for teams" (NL: "Agent harnessing voor teams") and bullets
are rewritten to emphasise team-scale orchestration. Listed under §5.2 as a
copy update, not a structural change.

## 5. Site changes — agenticengineering.nl

### 5.1 `data/trainings.ts`

- `ModuleId` union: remove `building-custom-mcp`, `skills-rules-deep`,
  `agents-sdlc-phases`, `test-first-advanced`, `advanced-hooks-quality-gates`,
  `team-workflows-governance`. Add `governance-and-policy-gates`,
  `team-rollout-playbook`, `observability-and-cost`,
  `capstone-rollout-tabletop`. (8 retained module IDs unchanged.)
- `trainings.basic.durationDays`: `1` → `2`.
- `trainings.basic.modules[]`: add `day` field to all entries; Day 1 = modules
  1–4 from §3.1, Day 2 = modules 5–9 from §3.2.
- `trainings.basic.priceEUR`: see §7 open decision.
- `trainings.advanced.durationDays`: `2` → `1`.
- `trainings.advanced.modules[]`: replace with 5 modules from §3.3, drop
  `day` field (single-day training).
- `trainings.advanced.priceEUR`: see §7 open decision.
- `deliveryFormats`: unchanged (`inCompany`, `publicCohort`, `remote`).

### 5.2 `messages/{nl,en}.json`

- `hero.subtitle`: "One day foundations, two days advanced" →
  "Two days foundations, one day advanced." NL mirror change.
- `trainings.duration.basic`: "1 day" → "2 days" / "1 dag" → "2 dagen".
- `trainings.duration.advanced`: "2 days" → "1 day" / "2 dagen" → "1 dag".
- `trainings.labels.day1` / `day2`: current labels are
  "Day 1 — integration" / "Day 2 — automation". Replace with
  "Day 1 — Foundations" / "Day 2 — Quality loop + capstone"
  (NL: "Dag 1 — Fundamenten" / "Dag 2 — Kwaliteitsloop + capstone").
- `trainings.basic.tagline`: rewrite to make the 2-day shift visible.
  Suggested copy (final wording subject to user copy review during
  implementation):
  EN: "Two days of hands-on adoption — every attendee ships a feature."
  NL: "Twee dagen hands-on adoptie — iedereen levert een feature op."
- `trainings.basic.audience`: rewrite for whole-DevOps-team framing (devs +
  QA + ops, mixed-role cohorts).
- `trainings.basic.outcomes`: extend with "Ship a feature end-to-end on a
  starter repo" capstone outcome.
- `trainings.advanced.tagline`: rewrite — current framing
  ("custom tooling, full SDLC integration") is contradicted by the new scope.
  Suggested copy (final wording subject to user copy review during
  implementation):
  EN: "One day to scale agentic engineering across your teams."
  NL: "Eén dag om agentic engineering team-breed uit te rollen."
- `trainings.advanced.audience`: rewrite for tech leads / EMs / staff+ /
  platform leads.
- `trainings.advanced.outcomes`: replace with rollout / harnessing /
  governance / observability outcomes per §2.2.
- `contact.form.trainingOptions.basic`: "Basic (1 day)" → "Basic (2 days)" /
  "Basic (1 dag)" → "Basic (2 dagen)".
- `contact.form.trainingOptions.advanced`: "Advanced (2 days)" →
  "Advanced (1 day)" / "Advanced (2 dagen)" → "Advanced (1 dag)".
- `modules.*`: drop the 4 removed entries from §4.2
  (`building-custom-mcp`, `skills-rules-deep`, `agents-sdlc-phases`,
  `test-first-advanced`) and the 2 merged entries from §4.3
  (`team-workflows-governance`, `advanced-hooks-quality-gates`). Add the
  4 new entries (`governance-and-policy-gates`, `team-rollout-playbook`,
  `observability-and-cost`, `capstone-rollout-tabletop`) with EN + NL copy
  per §4. Update `modules.agent-harnessing` title and bullets per §4.5
  (team-scale reframing).

### 5.3 Anywhere else that hard-codes durations or module IDs

- `app/[locale]/` pages rendering trainings — verify nothing hard-codes the
  duration string outside i18n.
- Sitemap and metadata — verify training landing pages aren't keyed off
  removed module IDs.
- Any tests under `tests/` or `e2e/` that assert on duration strings or
  module presence.

This is an audit step in the implementation plan, not a separate design
decision.

## 6. Migration plan (high-level)

The implementation plan (next step) will sequence the work, but the safe order is
roughly:

1. Update `data/trainings.ts` + `ModuleId` union and add new module copy in
   both locales. CI/type-check passes.
2. Update hero + labels + duration strings.
3. Update audience / outcomes / tagline copy for both tiers.
4. Update contact form options.
5. Update any pages / tests that hard-code old durations or removed module IDs.
6. Pricing decision applied (see §7) — single follow-up commit.
7. Decision on archived modules applied (see §7).

## 7. Open decisions (require user input before implementation)

1. **Basic 2d pricing.** Current 1d = €799. Suggested 2d: €1399 or €1499.
   Default if not specified: **€1399**.
2. **Advanced 1d pricing.** Current 2d = €1799. Suggested 1d: €999 or €1099.
   Default if not specified: **€999**.
3. **Removed modules.** Hard delete copy + types, or keep archived behind a
   feature flag as "optional / future workshops"?
   Default if not specified: **hard delete** — clean catalogue beats stale
   copy; modules can be re-introduced from git history if revived.
4. **Capstone repo.** Reuse an existing starter or scope a new one?
   Default if not specified: **reuse existing starter** — out of scope to
   build a new one inside this redesign; document the gap if no starter is
   suitable.

Defaults will be applied if no decision is given before the implementation
plan is executed. Each default is a low-risk, reversible choice.

## 8. Out of scope

- Building a new starter repo for the Day 2 capstone (see §7).
- Optional follow-on workshops for the removed Advanced modules.
- Marketing copy beyond the i18n strings listed in §5.2.
- Sales collateral / PDF brochures.
- Pricing experiments (A/B, regional, currency).
- Analytics or attribution changes.
