# Brand Pivot — Agentic AI Quality Engineering — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Pivot site positioning copy from "agentic engineering" to "agentic AI quality engineering" via copy-only edits in EN+NL, with e2e regression guard.

**Architecture:** Copy-only patch. Edit `messages/en.json` + `messages/nl.json`. Loosen 3 e2e regex assertions pinning the old hero phrase; add 1 new e2e assertion that forward-pins the new "quality engineering" phrase. No component, route, schema, or data changes.

**Tech Stack:** Next.js (App Router), next-intl (i18n), Playwright (e2e), Vitest (unit/component), pnpm.

**Spec:** `docs/superpowers/specs/2026-05-23-brand-pivot-quality-engineering-design.md`

---

### Task 0: Create feature branch

**Files:** none

- [ ] **Step 1: Confirm clean tree on main**

Run:

```bash
git status
git branch --show-current
```

Expected: clean tree, branch `main`.

- [ ] **Step 2: Pull latest main**

Run:

```bash
git pull origin main
```

Expected: up-to-date or fast-forward.

- [ ] **Step 3: Create + check out feature branch**

Run:

```bash
git checkout -b feat/brand-pivot-quality-engineering
```

Expected: switched to new branch.

---

### Task 1: Loosen e2e regex + add forward-pin assertion

**Files:**

- Modify: `e2e/home.spec.ts` (line 7 regex + add new assertion below)
- Modify: `e2e/smoke.spec.ts` (lines 29 and 39 regex)

- [ ] **Step 1: Inspect current state**

Run:

```bash
rg -n "agentic engineering" e2e/
```

Expected output:

```
e2e/home.spec.ts:7:  await expect(home.heroHeading).toContainText(/agentic engineering/i);
e2e/smoke.spec.ts:29:  await expect(home.heroHeading).toContainText(/agentic engineering/i);
e2e/smoke.spec.ts:39:  await expect(home.heroHeading).toContainText(/agentic engineering/i);
```

- [ ] **Step 2: Loosen home.spec.ts regex + add forward-pin**

In `e2e/home.spec.ts`, change line 7 from:

```ts
await expect(home.heroHeading).toContainText(/agentic engineering/i);
```

to:

```ts
await expect(home.heroHeading).toContainText(/agentic.*engineering/i);
await expect(home.heroHeading).toContainText(/quality engineering/i);
```

The first assertion matches both old ("agentic engineering") and new ("agentic AI quality engineering"). The second forward-pins the pivot so accidental rollback fails.

- [ ] **Step 3: Loosen smoke.spec.ts regex (both NL + EN)**

In `e2e/smoke.spec.ts`, change line 29 and line 39 from:

```ts
await expect(home.heroHeading).toContainText(/agentic engineering/i);
```

to:

```ts
await expect(home.heroHeading).toContainText(/agentic.*engineering/i);
```

(Smoke specs stay loose only — they don't forward-pin. Home spec carries that guarantee.)

- [ ] **Step 4: Run affected e2e (expect new home assertion to FAIL)**

Run:

```bash
pnpm test:e2e -- e2e/home.spec.ts e2e/smoke.spec.ts
```

Expected: home.spec.ts new `/quality engineering/i` assertion **FAILS** (copy not yet pivoted). Loosened assertions PASS because the new regex permits the current text.

- [ ] **Step 5: Commit failing-test step**

Run:

```bash
git add e2e/home.spec.ts e2e/smoke.spec.ts
git commit -m "test(e2e): loosen hero regex and forward-pin /quality engineering/"
```

---

### Task 2: Update EN copy

**Files:**

- Modify: `messages/en.json` (7 keys)

Reference: spec section "Copy diffs — EN".

- [ ] **Step 1: Edit `messages/en.json`**

Apply these exact replacements (Edit tool, one per key):

1. `meta.description`: `"Agentic engineering trainings with Claude Code or Codex."` → `"Agentic AI quality engineering trainings with Claude Code or Codex."`
2. `hero.kicker`: `"AGENTIC ENGINEERING · EN"` → `"AGENTIC AI QUALITY ENGINEERING · EN"`
3. `hero.title`: `"Train your team in agentic engineering."` → `"Train your team in agentic AI quality engineering."`
4. `hero.subtitle`: `"Two hands-on trainings in Claude Code or Codex. Two days foundations, one day advanced."` → `"Two hands-on trainings in Claude Code or Codex. Two days foundations + quality loop, one day rollout + governance."`
5. `footer.tagline`: `"Agentic engineering trainings."` → `"Agentic AI quality engineering trainings."`
6. `about.intro`: `"We train engineering teams in agentic engineering with Claude Code or Codex. Hands-on, production-focused, in NL or EN."` → `"We train engineering teams in agentic AI quality engineering with Claude Code or Codex. Hands-on, production-focused, in NL or EN."`
7. `trainings.advanced.tagline`: `"One day to scale agentic engineering across your teams."` → `"One day to scale agentic AI quality engineering across your teams."`

Leave `meta.title`, `nav.brand`, `trainings.basic.tagline`, `about.instructors.*` untouched.

- [ ] **Step 2: Run EN e2e (expect PASS)**

Run:

```bash
pnpm test:e2e -- e2e/home.spec.ts e2e/smoke.spec.ts -g "EN"
```

Expected: PASS. The forward-pin assertion `/quality engineering/i` now matches.

- [ ] **Step 3: Run unit + component tests**

Run:

```bash
pnpm test
```

Expected: PASS. No unit/component test pins these literal strings (verified during spec).

- [ ] **Step 4: Commit EN copy**

Run:

```bash
git add messages/en.json
git commit -m "i18n(en): pivot positioning copy to agentic AI quality engineering"
```

---

### Task 3: Update NL copy

**Files:**

- Modify: `messages/nl.json` (7 keys, mirroring EN)

Reference: spec section "Copy diffs — NL".

- [ ] **Step 1: Edit `messages/nl.json`**

Apply these exact replacements:

1. `meta.description`: `"Agentic engineering trainingen met Claude Code of Codex."` → `"Agentic AI quality engineering trainingen met Claude Code of Codex."`
2. `hero.kicker`: `"AGENTIC ENGINEERING · NL"` → `"AGENTIC AI QUALITY ENGINEERING · NL"`
3. `hero.title`: `"Train je team in agentic engineering."` → `"Train je team in agentic AI quality engineering."`
4. `hero.subtitle`: `"Twee praktijkgerichte trainingen in Claude Code of Codex. Twee dagen basis, één dag advanced."` → `"Twee praktijkgerichte trainingen in Claude Code of Codex. Twee dagen basis + kwaliteitsloop, één dag rollout + governance."`
5. `footer.tagline`: `"Agentic engineering trainingen."` → `"Agentic AI quality engineering trainingen."`
6. `about.intro`: `"We trainen engineering-teams in agentic engineering met Claude Code of Codex. Hands-on, productie-gericht, in NL of EN."` → `"We trainen engineering-teams in agentic AI quality engineering met Claude Code of Codex. Hands-on, productie-gericht, in NL of EN."`
7. `trainings.advanced.tagline`: `"Eén dag om agentic engineering team-breed uit te rollen."` → `"Eén dag om agentic AI quality engineering team-breed uit te rollen."`

NL keeps the English brand term "agentic AI quality engineering" untranslated — consistent with current treatment of "agentic engineering".

- [ ] **Step 2: Run NL e2e**

Run:

```bash
pnpm test:e2e -- e2e/home.spec.ts e2e/smoke.spec.ts -g "NL"
```

Expected: PASS.

- [ ] **Step 3: Run full e2e suite**

Run:

```bash
pnpm test:e2e
```

Expected: PASS for home, smoke, articles, a11y.

- [ ] **Step 4: Commit NL copy**

Run:

```bash
git add messages/nl.json
git commit -m "i18n(nl): pivot positioning copy to agentic AI quality engineering"
```

---

### Task 4: Manual verification + PR

**Files:** none (verification + push)

- [ ] **Step 1: Start dev server in background**

Run:

```bash
pnpm dev
```

(Background; wait until `Ready on http://localhost:3000`.)

- [ ] **Step 2: Visual check EN at `http://localhost:3000/en`**

Verify each:

- Hero kicker reads `AGENTIC AI QUALITY ENGINEERING · EN`
- Hero h1 reads `Train your team in agentic AI quality engineering.`
- Hero subtitle contains `quality loop` and `rollout + governance`
- Footer tagline reads `Agentic AI quality engineering trainings.`
- `/en/about` intro contains `agentic AI quality engineering`
- Basic training card tagline **unchanged** (still "Two days of hands-on adoption — every attendee ships a feature.")
- Advanced training card tagline reads `One day to scale agentic AI quality engineering across your teams.`

- [ ] **Step 3: Visual check NL at `http://localhost:3000/nl`**

Verify each:

- Hero kicker reads `AGENTIC AI QUALITY ENGINEERING · NL`
- Hero h1 reads `Train je team in agentic AI quality engineering.`
- Hero subtitle contains `kwaliteitsloop` and `rollout + governance`
- Footer tagline reads `Agentic AI quality engineering trainingen.`
- `/nl/about` intro contains `agentic AI quality engineering`
- Advanced card tagline reads `Eén dag om agentic AI quality engineering team-breed uit te rollen.`

- [ ] **Step 4: Stop dev server**

Kill the background process.

- [ ] **Step 5: Push branch**

Run:

```bash
git push -u origin feat/brand-pivot-quality-engineering
```

- [ ] **Step 6: Open PR**

Run:

```bash
gh pr create --title "feat(brand): pivot positioning to agentic AI quality engineering" --body "$(cat <<'EOF'
## Summary
- Pivot positioning copy from "agentic engineering" to "agentic AI quality engineering" across EN + NL
- Hero h1, kicker, subtitle, meta description, footer tagline, about intro, advanced tagline updated
- Wordmark (`Agentic·engineering`), domain, basic tagline, instructor bios unchanged
- e2e: loosened 3 hero-regex assertions; added forward-pin `/quality engineering/i` on home spec

## Spec
- docs/superpowers/specs/2026-05-23-brand-pivot-quality-engineering-design.md

## Test plan
- [ ] `pnpm test` — unit + component pass
- [ ] `pnpm test:e2e` — all e2e suites pass (home, smoke, articles, a11y)
- [ ] Manual `/en` + `/nl` confirm hero, subtitle, footer, about, advanced tagline reflect new positioning
- [ ] Manual confirm Basic tagline + wordmark unchanged

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

Expected: PR URL printed.

---

## Verification summary

- `pnpm test` — green
- `pnpm test:e2e` — green (existing assertions still pass via loosened regex; new forward-pin passes via new copy)
- Manual EN + NL smoke per Task 4 steps 2–3 — all keys reflect new positioning, unchanged keys still original

## Rollback

Single feature branch, three commits. Revert PR or `git revert <merge-sha>` on main reverts to current copy. No data, no schema, no component renames.
