# Testimonials Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a feature-flagged, server-rendered testimonials section to the homepage, built structure-first with placeholder content.

**Architecture:** A typed `data/testimonials.ts` holds verbatim quotes. A `testimonialsEnabled()` flag plus a non-empty check gate visibility. A presentational `TestimonialCard` renders one quote; a self-contained `TestimonialsSection` (following the `ProofStrip` precedent — a section component using `useTranslations`) renders the heading/lede + card grid and returns `null` when gated off. The homepage renders `<TestimonialsSection />` after the Trainings section.

**Tech Stack:** Next.js 15 (App Router, RSC), React 19, next-intl, Tailwind v4, Vitest + Testing Library, Playwright.

## Global Constraints

- Node 20, pnpm 9. Run unit tests with `pnpm test <path>` or `pnpm exec vitest run <path>`.
- i18n key parity is enforced by `pnpm verify:i18n` — every key added to `messages/en.json` MUST also be added to `messages/nl.json` (and vice versa).
- The `readme-check` pre-commit hook blocks any commit whose staged code introduces files/env/behavior not reflected in `README.md`. Each commit below includes its own README delta. Do NOT use `git commit --no-verify`.
- Design tokens are Tailwind classes only: `text-brand`, `text-text-primary`, `text-text-soft`, `text-text-muted`, `border-border-subtle`, `bg-bg-base`. Do not introduce raw hex colors.
- Quote bodies and attribution (`name`, `role`) are verbatim and live in `data/testimonials.ts` — never in `messages/*.json`. Only the section `title` and `lede` are translated.
- The flag default (unset / anything other than `'true'`) means the section is hidden. Production stays hidden until real content exists.

---

### Task 1: Feature flag + data model

**Files:**
- Modify: `lib/flags.ts`
- Create: `data/testimonials.ts`
- Test: `tests/lib/flags.test.ts`
- Modify: `README.md` (env table, Feature flags section, layout listing)
- Modify: `.env.example`

**Interfaces:**
- Produces: `testimonialsEnabled(): boolean` (from `@/lib/flags`).
- Produces: `type Testimonial = { id: string; quote: string; name: string; role: string }` and `testimonials: Testimonial[]` (from `@/data/testimonials`).

- [ ] **Step 1: Write the failing test**

Create `tests/lib/flags.test.ts`:

```ts
import { describe, it, expect, afterEach } from 'vitest';
import { testimonialsEnabled } from '@/lib/flags';

const original = process.env.TESTIMONIALS_ENABLED;

afterEach(() => {
  if (original === undefined) delete process.env.TESTIMONIALS_ENABLED;
  else process.env.TESTIMONIALS_ENABLED = original;
});

describe('testimonialsEnabled', () => {
  it('returns true only when the env var is exactly "true"', () => {
    process.env.TESTIMONIALS_ENABLED = 'true';
    expect(testimonialsEnabled()).toBe(true);
  });

  it('returns false when unset', () => {
    delete process.env.TESTIMONIALS_ENABLED;
    expect(testimonialsEnabled()).toBe(false);
  });

  it('returns false for any non-"true" value', () => {
    process.env.TESTIMONIALS_ENABLED = '1';
    expect(testimonialsEnabled()).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run tests/lib/flags.test.ts`
Expected: FAIL — `testimonialsEnabled` is not exported from `@/lib/flags`.

- [ ] **Step 3: Add the flag helper**

Edit `lib/flags.ts` to add the function below the existing `blogsEnabled`:

```ts
export function testimonialsEnabled(): boolean {
  return process.env.TESTIMONIALS_ENABLED === 'true';
}
```

- [ ] **Step 4: Create the data model**

Create `data/testimonials.ts`:

```ts
export type Testimonial = {
  id: string; // stable slug
  quote: string; // verbatim quote text
  name: string; // attribution name
  role: string; // free-form attribution, e.g. "Lead Engineer, Acme"
};

// Placeholder content — the section stays gated off (TESTIMONIALS_ENABLED unset)
// until real testimonials replace these.
export const testimonials: Testimonial[] = [
  {
    id: 'placeholder-1',
    quote:
      'The training turned vague "use AI" guidance into a concrete workflow my team actually follows.',
    name: 'Placeholder Name',
    role: 'Engineering Lead, Example Co',
  },
  {
    id: 'placeholder-2',
    quote:
      'Hands-on from the first hour. We shipped a real change with agentic tooling by the end of day one.',
    name: 'Placeholder Name',
    role: 'Senior Engineer, Example BV',
  },
];
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm exec vitest run tests/lib/flags.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 6: Update `.env.example`**

Add below the `BLOGS_ENABLED=false` line:

```bash

# set to true to enable the homepage testimonials section. Stays hidden in
# production until real testimonials replace the placeholder content.
TESTIMONIALS_ENABLED=false
```

- [ ] **Step 7: Update `README.md`**

In the environment-variables table, add a row after the `BLOGS_ENABLED` row:

```
| `TESTIMONIALS_ENABLED`   | server      | Feature flag for the homepage testimonials section. Set to `'true'` to show it; unset/empty hides it. Stays hidden until real content exists.                |
```

In the "Feature flags" section, add a short paragraph after the `BLOGS_ENABLED` table:

```
`TESTIMONIALS_ENABLED` gates the homepage testimonials section (`components/TestimonialsSection.tsx`). Unset/empty (or any value other than `'true'`) hides the section entirely. Content lives in `data/testimonials.ts` (verbatim quotes); the section also self-hides when that array is empty.
```

In the layout/structure block, add under the `data/` listing:

```
  testimonials.ts      # Testimonial quotes (typed, verbatim — name/role not translated)
```

- [ ] **Step 8: Verify typecheck and i18n parity still pass**

Run: `pnpm typecheck && pnpm verify:i18n`
Expected: both succeed (no message changes yet).

- [ ] **Step 9: Commit**

```bash
git add lib/flags.ts data/testimonials.ts tests/lib/flags.test.ts README.md .env.example
git commit -m "feat(testimonials): add TESTIMONIALS_ENABLED flag and data model"
```

---

### Task 2: TestimonialCard component

**Files:**
- Create: `components/TestimonialCard.tsx`
- Test: `tests/components/TestimonialCard.test.tsx`
- Modify: `README.md` (components listing)

**Interfaces:**
- Consumes: `type Testimonial` from `@/data/testimonials` (Task 1).
- Produces: `TestimonialCard` — a React component with props `{ quote: string; name: string; role: string }`.

- [ ] **Step 1: Write the failing test**

Create `tests/components/TestimonialCard.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TestimonialCard } from '@/components/TestimonialCard';

describe('<TestimonialCard />', () => {
  it('renders the quote inside a blockquote element', () => {
    render(<TestimonialCard quote="Great training" name="Jane Doe" role="Lead, Acme" />);
    const quote = screen.getByText('Great training');
    expect(quote.tagName).toBe('BLOCKQUOTE');
  });

  it('renders the attribution name and role inside a cite element', () => {
    render(<TestimonialCard quote="Great training" name="Jane Doe" role="Lead, Acme" />);
    const cite = screen.getByText(/Jane Doe/);
    expect(cite.tagName).toBe('CITE');
    expect(cite).toHaveTextContent('Lead, Acme');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run tests/components/TestimonialCard.test.tsx`
Expected: FAIL — cannot resolve `@/components/TestimonialCard`.

- [ ] **Step 3: Write the component**

Create `components/TestimonialCard.tsx`:

```tsx
import type { Testimonial } from '@/data/testimonials';

export function TestimonialCard({ quote, name, role }: Omit<Testimonial, 'id'>) {
  return (
    <article className="border-border-subtle hover:border-brand bg-bg-base flex flex-col rounded-md border p-5 transition-colors">
      <blockquote className="text-text-primary text-base leading-relaxed">{quote}</blockquote>
      <cite className="text-text-muted mt-4 text-sm font-medium not-italic">
        {name} — {role}
      </cite>
    </article>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec vitest run tests/components/TestimonialCard.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Update `README.md`**

In the `components/` listing comment block, add `TestimonialCard` to the enumerated list (e.g. append `, TestimonialCard` to the component names line, keeping the trailing `…`).

- [ ] **Step 6: Commit**

```bash
git add components/TestimonialCard.tsx tests/components/TestimonialCard.test.tsx README.md
git commit -m "feat(testimonials): add TestimonialCard component"
```

---

### Task 3: TestimonialsSection (gating + i18n)

**Files:**
- Create: `components/TestimonialsSection.tsx`
- Modify: `messages/en.json`, `messages/nl.json`
- Test: `tests/components/TestimonialsSection.test.tsx`
- Modify: `README.md` (i18n namespaces list, components listing)

**Interfaces:**
- Consumes: `testimonials` from `@/data/testimonials` (Task 1), `testimonialsEnabled` from `@/lib/flags` (Task 1), `TestimonialCard` from `@/components/TestimonialCard` (Task 2).
- Consumes: `testimonials` i18n namespace with keys `title` and `lede`.
- Produces: `TestimonialsSection` — a React component with no props. Returns `null` when `!testimonialsEnabled()` or `testimonials.length === 0`; otherwise renders the section.

- [ ] **Step 1: Add the i18n keys**

In `messages/en.json`, add a top-level `"testimonials"` namespace (place it after the `"why"` namespace, before `"home"` — match the existing brace/indentation style):

```json
  "testimonials": {
    "title": "What participants say",
    "lede": "Feedback from engineers and teams who have taken the training."
  },
```

In `messages/nl.json`, add the matching namespace in the same position:

```json
  "testimonials": {
    "title": "Wat deelnemers zeggen",
    "lede": "Reacties van engineers en teams die de training hebben gevolgd."
  },
```

- [ ] **Step 2: Verify i18n parity passes**

Run: `pnpm verify:i18n`
Expected: PASS — NL and EN now both have the `testimonials.title` and `testimonials.lede` keys.

- [ ] **Step 3: Write the failing test**

Create `tests/components/TestimonialsSection.test.tsx`:

```tsx
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import en from '@/messages/en.json';

const h = vi.hoisted(() => ({
  enabled: true,
  list: [
    { id: 'a', quote: 'Quote A', name: 'Alice', role: 'Lead, Acme' },
    { id: 'b', quote: 'Quote B', name: 'Bob', role: 'Eng, Beta' },
  ] as Array<{ id: string; quote: string; name: string; role: string }>,
}));

vi.mock('@/lib/flags', () => ({ testimonialsEnabled: () => h.enabled }));
vi.mock('@/data/testimonials', () => ({
  get testimonials() {
    return h.list;
  },
}));

// Imported after the mocks are registered.
import { TestimonialsSection } from '@/components/TestimonialsSection';

function renderSection() {
  return render(
    <NextIntlClientProvider locale="en" messages={en}>
      <TestimonialsSection />
    </NextIntlClientProvider>,
  );
}

beforeEach(() => {
  h.enabled = true;
  h.list = [
    { id: 'a', quote: 'Quote A', name: 'Alice', role: 'Lead, Acme' },
    { id: 'b', quote: 'Quote B', name: 'Bob', role: 'Eng, Beta' },
  ];
});

describe('<TestimonialsSection />', () => {
  it('renders nothing when the flag is disabled', () => {
    h.enabled = false;
    const { container } = renderSection();
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when there are no testimonials', () => {
    h.list = [];
    const { container } = renderSection();
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the heading, lede, and one card per testimonial when enabled', () => {
    renderSection();
    expect(
      screen.getByRole('heading', { name: 'What participants say' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Feedback from engineers and teams who have taken the training.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Quote A')).toBeInTheDocument();
    expect(screen.getByText('Quote B')).toBeInTheDocument();
  });
});
```

- [ ] **Step 4: Run test to verify it fails**

Run: `pnpm exec vitest run tests/components/TestimonialsSection.test.tsx`
Expected: FAIL — cannot resolve `@/components/TestimonialsSection`.

- [ ] **Step 5: Write the component**

Create `components/TestimonialsSection.tsx`:

```tsx
import { useTranslations } from 'next-intl';
import { testimonials } from '@/data/testimonials';
import { testimonialsEnabled } from '@/lib/flags';
import { TestimonialCard } from '@/components/TestimonialCard';

export function TestimonialsSection() {
  const t = useTranslations('testimonials');
  if (!testimonialsEnabled() || testimonials.length === 0) return null;

  return (
    <section className="border-border-subtle border-b px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 max-w-2xl">
          <h2 className="text-brand text-2xl font-bold sm:text-3xl">{t('title')}</h2>
          <p className="text-text-soft mt-2 text-base">{t('lede')}</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {testimonials.map((tm) => (
            <TestimonialCard key={tm.id} quote={tm.quote} name={tm.name} role={tm.role} />
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `pnpm exec vitest run tests/components/TestimonialsSection.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 7: Update `README.md`**

In the i18n "Namespaces in use" list, add `testimonials` to the enumerated namespaces. In the `components/` listing, add `TestimonialsSection` alongside `TestimonialCard`.

- [ ] **Step 8: Commit**

```bash
git add components/TestimonialsSection.tsx messages/en.json messages/nl.json tests/components/TestimonialsSection.test.tsx README.md
git commit -m "feat(testimonials): add gated TestimonialsSection with i18n heading"
```

---

### Task 4: Wire into the homepage + enable in e2e

**Files:**
- Modify: `app/[locale]/page.tsx`
- Modify: `playwright.config.ts`
- Modify: `tests/e2e/home.spec.ts`

**Interfaces:**
- Consumes: `TestimonialsSection` from `@/components/TestimonialsSection` (Task 3).

- [ ] **Step 1: Add the failing e2e assertion**

Append to `tests/e2e/home.spec.ts` (the NL heading is `Wat deelnemers zeggen`; the e2e server runs with the flag enabled after Step 3):

```ts
test('shows the testimonials section when the flag is enabled', async ({ page }) => {
  await page.goto('/nl');
  await expect(page.getByRole('heading', { name: /Wat deelnemers zeggen/ })).toBeVisible();
});
```

- [ ] **Step 2: Render the section on the homepage**

In `app/[locale]/page.tsx`, add the import alongside the other component imports:

```tsx
import { TestimonialsSection } from '@/components/TestimonialsSection';
```

Then insert `<TestimonialsSection />` immediately after the closing `</section>` of the Trainings block (the `<section id="trainings" …>` … `</section>`) and before `<ProofStrip locale={locale} />`:

```tsx
      </section>

      <TestimonialsSection />

      <ProofStrip locale={locale} />
```

- [ ] **Step 3: Enable the flag for Playwright**

In `playwright.config.ts`, add the flag to `webServer.env` next to `BLOGS_ENABLED`:

```ts
    env: {
      BLOGS_ENABLED: 'true',
      TESTIMONIALS_ENABLED: 'true',
    },
```

- [ ] **Step 4: Verify unit tests, typecheck, lint, and build**

Run: `pnpm test && pnpm typecheck && pnpm lint && pnpm build`
Expected: all pass. (`pnpm build` confirms the server component composes — `TestimonialsSection` returns `null` in build/prod because `TESTIMONIALS_ENABLED` is unset there.)

- [ ] **Step 5: Run the homepage e2e**

Run: `pnpm exec playwright test tests/e2e/home.spec.ts`
Expected: PASS — including the new testimonials assertion (Playwright server has the flag enabled).

- [ ] **Step 6: Commit**

```bash
git add "app/[locale]/page.tsx" playwright.config.ts tests/e2e/home.spec.ts
git commit -m "feat(testimonials): render section on homepage after trainings"
```

---

## Notes for the implementer

- If the `readme-check` hook reports `UPDATE NEEDED` on any commit, read its message and extend the README delta for THAT commit until it reports `OK:`. Do not bypass with `--no-verify`.
- The section is invisible in production by design. To see it locally: `TESTIMONIALS_ENABLED=true pnpm dev`, then open `http://localhost:3000/nl`.
- Replacing placeholders with real testimonials later is a pure `data/testimonials.ts` edit plus flipping `TESTIMONIALS_ENABLED=true` in the relevant Vercel scope — no code change.
