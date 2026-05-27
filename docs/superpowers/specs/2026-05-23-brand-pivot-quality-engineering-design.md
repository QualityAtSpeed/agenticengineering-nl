# Brand pivot — agentic AI quality engineering

**Date:** 2026-05-23
**Status:** Approved, ready for implementation plan
**Scope:** Sub-project A of a 3-part initiative (A: brand pivot, B: Basic Day-1 curriculum rewrite, C: Training-detail site sections)

## Problem

External advisor feedback (summarised):

- Current positioning leads with agents/subagents/MCP. Quality themes (testing, reliability, failure modes, governance, regression, stress) appear as side topics, not core promise.
- Recommendation: reposition from "agentic AI engineering startup" to "agentic AI **quality** engineering".
- This spec covers the positioning copy pivot only. Curriculum rewrite (B) and site-section additions (C) follow as separate specs.

## Decisions

| Question                  | Decision                                                                                                                                     |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Primary buyer after pivot | Unchanged — same dev/eng audience (engineering managers, tech leads adopting agents), re-framed around quality outcomes. No ICP shift.       |
| Pivot depth               | Medium. "Quality" inserted as defining modifier in hero h1, meta, footer tagline, training intros. Body copy mostly intact.                  |
| Wordmark (`nav.brand`)    | Unchanged — "Agentic·engineering" stays. Domain `agenticengineering.nl` is the brand asset.                                                  |
| Hero h1                   | "Train your team in agentic AI quality engineering." (literal pivot, mirrors advisor wording)                                                |
| Hero subtitle             | "Two hands-on trainings in Claude Code or Codex. Two days foundations + quality loop, one day rollout + governance."                         |
| Implementation            | Copy-only patch — edit `messages/en.json` + `messages/nl.json`, update 3 e2e regex assertions. No new components, no i18n token abstraction. |

## Copy diffs

### EN — `messages/en.json`

| Key                          | Current                                                                                                                 | New                                                                                                                                |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `meta.description`           | Agentic engineering trainings with Claude Code or Codex.                                                                | Agentic AI quality engineering trainings with Claude Code or Codex.                                                                |
| `hero.kicker`                | AGENTIC ENGINEERING · EN                                                                                                | AGENTIC AI QUALITY ENGINEERING · EN                                                                                                |
| `hero.title`                 | Train your team in agentic engineering.                                                                                 | Train your team in agentic AI quality engineering.                                                                                 |
| `hero.subtitle`              | Two hands-on trainings in Claude Code or Codex. Two days foundations, one day advanced.                                 | Two hands-on trainings in Claude Code or Codex. Two days foundations + quality loop, one day rollout + governance.                 |
| `footer.tagline`             | Agentic engineering trainings.                                                                                          | Agentic AI quality engineering trainings.                                                                                          |
| `about.intro`                | We train engineering teams in agentic engineering with Claude Code or Codex. Hands-on, production-focused, in NL or EN. | We train engineering teams in agentic AI quality engineering with Claude Code or Codex. Hands-on, production-focused, in NL or EN. |
| `trainings.advanced.tagline` | One day to scale agentic engineering across your teams.                                                                 | One day to scale agentic AI quality engineering across your teams.                                                                 |

### NL — `messages/nl.json`

| Key                          | Current                                                                                                                 | New                                                                                                                                |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `meta.description`           | Agentic engineering trainingen met Claude Code of Codex.                                                                | Agentic AI quality engineering trainingen met Claude Code of Codex.                                                                |
| `hero.kicker`                | AGENTIC ENGINEERING · NL                                                                                                | AGENTIC AI QUALITY ENGINEERING · NL                                                                                                |
| `hero.title`                 | Train je team in agentic engineering.                                                                                   | Train je team in agentic AI quality engineering.                                                                                   |
| `hero.subtitle`              | Twee praktijkgerichte trainingen in Claude Code of Codex. Twee dagen basis, één dag advanced.                           | Twee praktijkgerichte trainingen in Claude Code of Codex. Twee dagen basis + kwaliteitsloop, één dag rollout + governance.         |
| `footer.tagline`             | Agentic engineering trainingen.                                                                                         | Agentic AI quality engineering trainingen.                                                                                         |
| `about.intro`                | We trainen engineering-teams in agentic engineering met Claude Code of Codex. Hands-on, productie-gericht, in NL of EN. | We trainen engineering-teams in agentic AI quality engineering met Claude Code of Codex. Hands-on, productie-gericht, in NL of EN. |
| `trainings.advanced.tagline` | Eén dag om agentic engineering team-breed uit te rollen.                                                                | Eén dag om agentic AI quality engineering team-breed uit te rollen.                                                                |

NL keeps "agentic AI quality engineering" untranslated — consistent with current handling of "agentic engineering" as a brand/discipline term.

### Unchanged

- `meta.title` — domain string, no pivot.
- `nav.brand` — "Agentic·engineering" wordmark stays (matches domain).
- `trainings.basic.tagline` — already outcome-led ("Two days of hands-on adoption — every attendee ships a feature."), fits new positioning without edits.
- `about.instructors.*.bio` — personal copy.

## Test updates

3 e2e specs pin hero h1 via `/agentic engineering/i`. New h1 contains "agentic AI quality engineering", which does NOT match the literal substring "agentic engineering". Regex must loosen.

| File                | Line | Current                  | New                       |
| ------------------- | ---- | ------------------------ | ------------------------- |
| `e2e/home.spec.ts`  | 7    | `/agentic engineering/i` | `/agentic.*engineering/i` |
| `e2e/smoke.spec.ts` | 29   | `/agentic engineering/i` | `/agentic.*engineering/i` |
| `e2e/smoke.spec.ts` | 39   | `/agentic engineering/i` | `/agentic.*engineering/i` |

New regex matches both old and new wording. No new tests; existing assertions (h1 present, no NL/EN bleed) still hold.

## Out of scope

Explicitly deferred to follow-up sub-projects:

- Day-1 module list / curriculum rewrite (sub-project B)
- New training-detail sections — identity, proof-of-identity, explicit 2-day agenda, code/demo, testimonials/outcomes (sub-project C)
- Hero visual redesign / new components
- `data/trainings.ts` changes
- `DESIGN.md` / `PRODUCT.md` revisions (likely follow once B lands)
- SEO/structured-data beyond `meta.description`
- Social card (og:image) refresh

## Rollback

Single PR. Revert reverts to current copy. No data migrations, no component renames, no schema changes.

## Verification

- `pnpm test` — unit/component tests pass.
- `pnpm test:e2e` — e2e (home, smoke, articles, a11y) pass with loosened regex.
- Manual: `pnpm dev`; visit `/en` and `/nl`; confirm hero h1, kicker, subtitle, footer tagline, `/about` intro all show new copy. Confirm Basic tagline unchanged, Advanced tagline updated.
