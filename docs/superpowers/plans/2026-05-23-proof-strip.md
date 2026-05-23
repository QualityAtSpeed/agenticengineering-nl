# Proof Strip Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "we ship what we teach" proof strip to the home page — static pills (CI, tests, a11y, type-safety, locale parity) plus a GitHub repo CTA — placed between TrainingDetail sections and the Instructors section.

**Architecture:** New `<ProofStrip />` React component (server component via `useTranslations`, mirrors `TrainingCard`/`TrainingDetail` shape). New top-level `proof.*` i18n keys in EN + NL. One insertion in `app/[locale]/page.tsx`. New unit test in `tests/components/`. New e2e assertions appended to existing NL + EN home tests in `e2e/smoke.spec.ts`. No new external dependencies, no `data/` changes.

**Tech Stack:** Next.js App Router (RSC), next-intl, Tailwind CSS v4, Vitest + Testing Library, Playwright.

**Spec:** `docs/superpowers/specs/2026-05-23-proof-strip-design.md`

---

### Task 0: Confirm branch + clean tree

**Files:** none

- [ ] **Step 1: Confirm on feature branch + clean tree**

Run:

```bash
git status
git branch --show-current
```

Expected: clean tree, branch `feat/proof-strip`. The spec commit should already be in this branch (`git log --oneline -1` shows `docs(spec): proof strip — 'we ship what we teach' signals on home`).

---

### Task 1: Add EN + NL i18n keys (atomic for parity)

**Files:**

- Modify: `messages/en.json`
- Modify: `messages/nl.json`

Both files updated in one commit so `scripts/verify-i18n.ts` parity check stays green.

- [ ] **Step 1: Locate top-level objects in `messages/en.json`**

Run: `rg -n '^  "[a-z]+": \\{' messages/en.json | head -20`

Identifies the top-level keys order. New `proof` object should be inserted in a stable position — recommend placing it AFTER `trainings` and BEFORE `footer` (logical position: it's content-section copy alongside trainings). The exact ordering doesn't matter functionally, but mirror the same insertion point in `messages/nl.json`.

- [ ] **Step 2: Insert EN `proof` block**

Open `messages/en.json`. Add this top-level entry between the `trainings` block and the `footer` block (i.e., after the closing `}` of `trainings` and before the opening `"footer":`):

```json
"proof": {
  "heading": "We ship what we teach.",
  "subhead": "This site runs the stack you'll learn. Source open, CI live, parity enforced.",
  "pills": [
    "CI green",
    "48 unit + 64 e2e tests",
    "WCAG 2.1 AA",
    "TypeScript strict",
    "NL/EN locale parity enforced"
  ],
  "ctaLabel": "view source on GitHub"
},
```

Watch the trailing comma — required because `footer` follows.

- [ ] **Step 3: Insert NL `proof` block**

In `messages/nl.json`, mirror the insertion (same position between `trainings` and `footer`):

```json
"proof": {
  "heading": "We leveren wat we trainen.",
  "subhead": "Deze site draait op de stack die je leert. Source open, CI live, pariteit afgedwongen.",
  "pills": [
    "CI groen",
    "48 unit + 64 e2e tests",
    "WCAG 2.1 AA",
    "TypeScript strict",
    "NL/EN locale-pariteit afgedwongen"
  ],
  "ctaLabel": "bekijk source op GitHub"
},
```

- [ ] **Step 4: Validate both JSON files**

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
git commit -m "i18n: add proof.* keys for ProofStrip component (EN + NL)"
```

---

### Task 2: TDD red — write the failing component test

**Files:**

- Create: `tests/components/ProofStrip.test.tsx`

- [ ] **Step 1: Create `tests/components/ProofStrip.test.tsx`**

Use the Write tool to create the file with this EXACT content:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import en from '@/messages/en.json';
import nl from '@/messages/nl.json';
import { ProofStrip } from '@/components/ProofStrip';

function renderStrip(locale: 'nl' | 'en') {
  const messages = locale === 'nl' ? nl : en;
  return render(
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ProofStrip locale={locale} />
    </NextIntlClientProvider>,
  );
}

describe('<ProofStrip />', () => {
  it('renders the EN heading and subhead from i18n', () => {
    renderStrip('en');
    expect(screen.getByRole('heading', { name: /We ship what we teach/ })).toBeInTheDocument();
    expect(screen.getByText(/This site runs the stack you'll learn/)).toBeInTheDocument();
  });

  it('renders the NL heading from i18n', () => {
    renderStrip('nl');
    expect(screen.getByRole('heading', { name: /We leveren wat we trainen/ })).toBeInTheDocument();
  });

  it('renders exactly 5 pills as list items', () => {
    renderStrip('en');
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(5);
  });

  it('renders the GitHub CTA with correct href, target, and rel', () => {
    renderStrip('en');
    const link = screen.getByTestId('proof-github-link');
    expect(link).toHaveAttribute('href', 'https://github.com/QualityAtSpeed/agenticengineering-nl');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link).toHaveTextContent(/view source on GitHub/);
  });

  it('renders the NL CTA label', () => {
    renderStrip('nl');
    expect(screen.getByTestId('proof-github-link')).toHaveTextContent(/bekijk source op GitHub/);
  });
});
```

- [ ] **Step 2: Run the test (expect FAIL on missing component)**

Run: `pnpm test tests/components/ProofStrip.test.tsx`

Expected: FAIL with module resolution error (`Failed to resolve import "@/components/ProofStrip"`). This is the intended RED state. Do NOT create the component yet — Task 3 does that.

- [ ] **Step 3: Commit failing test**

Run:

```bash
git add tests/components/ProofStrip.test.tsx
git commit -m "test(proof-strip): failing component test before implementation"
```

---

### Task 3: Implement `<ProofStrip />` component (turn tests green)

**Files:**

- Create: `components/ProofStrip.tsx`

- [ ] **Step 1: Create `components/ProofStrip.tsx`**

Use the Write tool to create the file with this EXACT content:

```tsx
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { Locale } from '@/i18n/routing';

const REPO_URL = 'https://github.com/QualityAtSpeed/agenticengineering-nl';

export function ProofStrip({ locale: _locale }: { locale: Locale }) {
  const t = useTranslations('proof');
  const pills = t.raw('pills') as string[];

  return (
    <section className="border-border-subtle border-t px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-text-primary font-mono text-3xl">
          <span className="text-accent-green">&gt;</span> {t('heading')}
        </h2>
        <p className="text-text-muted mt-3 max-w-2xl">{t('subhead')}</p>

        <ul className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-sm">
          {pills.map((p, i) => (
            <li key={p} className="text-text-primary">
              {i > 0 && <span className="text-accent-green mr-3">·</span>}
              {p}
            </li>
          ))}
        </ul>

        <Link
          href={REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="proof-github-link"
          className="bg-accent-green text-bg-base mt-10 inline-flex items-center gap-2 rounded-sm px-5 py-3 font-mono text-sm font-semibold hover:brightness-110"
        >
          {t('ctaLabel')} →
        </Link>
      </div>
    </section>
  );
}
```

Notes for the implementer:

- The `locale` prop is accepted (mirrors `TrainingDetail`'s signature for symmetry) but not used inside the component — i18n is driven by next-intl's request-scoped locale. The underscore prefix (`_locale`) signals "intentionally unused" to lint. If your eslint config flags unused destructured props differently, name it `locale` and add the appropriate comment.
- `t.raw('pills')` returns the array verbatim (next-intl recommended pattern for arrays of strings; same pattern as `TrainingDetail` uses for `audience`/`outcomes`).
- Uses `next/link` not raw anchor — consistent with the rest of the codebase.

- [ ] **Step 2: Run typecheck**

Run: `pnpm typecheck`

Expected: PASS.

- [ ] **Step 3: Run component test (expect PASS)**

Run: `pnpm test tests/components/ProofStrip.test.tsx`

Expected: 5 tests PASS.

- [ ] **Step 4: Run full unit + component suite to catch regressions**

Run: `pnpm test`

Expected: all PASS.

- [ ] **Step 5: Commit**

Run:

```bash
git add components/ProofStrip.tsx
git commit -m "feat(proof-strip): ProofStrip component (heading, pills, GitHub CTA)"
```

---

### Task 4: Wire `<ProofStrip />` into the home page

**Files:**

- Modify: `app/[locale]/page.tsx`

- [ ] **Step 1: Read current import block + body**

Run: `head -20 app/[locale]/page.tsx`

Expected: imports include `Hero`, `TrainingCard`, `TrainingDetail`, `InstructorCard`, etc.

- [ ] **Step 2: Add the import**

In `app/[locale]/page.tsx`, add this line after the existing `import { TrainingDetail } from '@/components/TrainingDetail';` line (currently line 5):

```tsx
import { ProofStrip } from '@/components/ProofStrip';
```

- [ ] **Step 3: Insert the component in the JSX**

Locate the two consecutive `<TrainingDetail … />` lines (currently lines 67–68). Immediately AFTER them and BEFORE the existing `<section className="border-border-subtle border-t px-6 py-20">` (the Instructors section, currently starting at line 70), insert exactly:

```tsx
<ProofStrip locale={locale} />
```

Use the 6-space indent that matches the surrounding lines.

- [ ] **Step 4: Run typecheck**

Run: `pnpm typecheck`

Expected: PASS.

- [ ] **Step 5: Run full unit + component suite**

Run: `pnpm test`

Expected: PASS.

- [ ] **Step 6: Commit**

Run:

```bash
git add app/[locale]/page.tsx
git commit -m "feat(home): mount ProofStrip between TrainingDetail and Instructors"
```

---

### Task 5: Add e2e smoke assertions

**Files:**

- Modify: `e2e/smoke.spec.ts`

- [ ] **Step 1: Read current home tests in `e2e/smoke.spec.ts`**

Run: `sed -n '26,42p' e2e/smoke.spec.ts`

Expected: shows the `NL home …` and `EN home …` tests.

- [ ] **Step 2: Extend NL home test**

In `e2e/smoke.spec.ts`, locate the test `test('NL home renders hero and Dutch training card label without EN bleed', …`. Inside the body, AFTER the existing `await expect(page.getByText(home.otherLocaleLabel())).toHaveCount(0);` assertion, append these 3 lines:

```ts
const nlProof = page.getByTestId('proof-github-link');
await expect(nlProof).toBeVisible();
await expect(nlProof).toHaveAttribute(
  'href',
  'https://github.com/QualityAtSpeed/agenticengineering-nl',
);
```

- [ ] **Step 3: Extend EN home test**

In the same file, locate `test('EN home renders hero and English training card label', …`. AFTER the existing `await expect(home.viewFullCurriculumLabel.first()).toBeVisible();` line, append:

```ts
const enProof = page.getByTestId('proof-github-link');
await expect(enProof).toBeVisible();
await expect(enProof).toHaveAttribute(
  'href',
  'https://github.com/QualityAtSpeed/agenticengineering-nl',
);
```

- [ ] **Step 4: Run targeted e2e**

Run: `pnpm test:e2e -- e2e/smoke.spec.ts`

Expected: all smoke tests PASS, including the two extended home tests now asserting the proof CTA.

- [ ] **Step 5: Commit**

Run:

```bash
git add e2e/smoke.spec.ts
git commit -m "test(e2e): smoke-assert ProofStrip GitHub CTA on EN + NL home"
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
Expected: green (48 existing + 5 new from ProofStrip = 53).

- [ ] **Step 4: Run full e2e suite**

Run: `pnpm test:e2e`
Expected: green. A11y axe spec covers `/en` and `/nl`; the new text + button section will be scanned automatically.

- [ ] **Step 5: Run i18n parity**

Run: `pnpm verify:i18n`
Expected: `i18n integrity OK`.

- [ ] **Step 6: Manual visual check (background dev server)**

Run: `pnpm dev` (background).

Open http://localhost:3000/en and confirm:

- After Basic + Advanced training detail sections, BEFORE Instructors, a new section appears.
- Heading reads `> We ship what we teach.`
- Subhead reads `This site runs the stack you'll learn. Source open, CI live, parity enforced.`
- 5 pills on one row (wraps on narrow viewports) separated by green `·` dots: `CI green · 48 unit + 64 e2e tests · WCAG 2.1 AA · TypeScript strict · NL/EN locale parity enforced`.
- Green button `view source on GitHub →` opens `https://github.com/QualityAtSpeed/agenticengineering-nl` in a new tab.

Open http://localhost:3000/nl and confirm the NL mirror (`> We leveren wat we trainen.`, etc.).

- [ ] **Step 7: Stop dev server**

Kill the background process.

- [ ] **Step 8: Push branch**

Run:

```bash
git push -u origin feat/proof-strip
```

- [ ] **Step 9: Open PR**

Run:

```bash
gh pr create --title "feat(home): ProofStrip — 'we ship what we teach' signals + GitHub CTA" --body "$(cat <<'EOF'
## Summary
- New `<ProofStrip />` component on home, between TrainingDetail blocks and Instructors
- Static pills: `CI green · 48 unit + 64 e2e tests · WCAG 2.1 AA · TypeScript strict · NL/EN locale parity enforced`
- Green CTA opens this repo on GitHub in a new tab
- EN + NL i18n keys added; locale parity enforced via existing CI script
- New component unit test (5 cases); e2e smoke extended on both locales

Sub-sub-project **C3** of the brand initiative (A merged in #7, B merged in #10). C1 / C2 / C4 deferred per spec.

## Spec + Plan
- docs/superpowers/specs/2026-05-23-proof-strip-design.md
- docs/superpowers/plans/2026-05-23-proof-strip.md

## Test plan
- [x] `pnpm typecheck` — no errors
- [x] `pnpm lint` — clean
- [x] `pnpm test` — 53 unit + component pass (48 existing + 5 new)
- [x] `pnpm test:e2e` — smoke + a11y + articles + home all pass
- [x] `pnpm verify:i18n` — EN/NL parity holds
- [ ] Manual `/en` + `/nl` show proof strip between TrainingDetail and Instructors; GitHub CTA opens repo in new tab

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

Expected: PR URL printed.

---

## Verification summary

- `pnpm typecheck` — green
- `pnpm lint` — green
- `pnpm test` — 53 unit + component tests pass
- `pnpm test:e2e` — all e2e pass, including extended smoke assertions
- `pnpm verify:i18n` — `i18n integrity OK`
- Manual: home page renders the proof strip in the planned position on both locales; CTA opens the repo in a new tab

## Rollback

Single feature branch with five commits. Reverting the merge restores the previous home layout: removes `components/ProofStrip.tsx`, `tests/components/ProofStrip.test.tsx`, the `proof.*` i18n keys (EN + NL), the home-page insertion, and the e2e smoke assertions. No data, schema, or shared-dep changes.
