# Articles Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> **Project rule (CLAUDE.md):** No git or `gh` commands may be run by the agent. Show every git/gh command in a fenced block with a one-line reason; Chef executes them. Every file edit is shown for approval before writing.

**Goal:** Ship a public `/[locale]/articles` index page that lists external articles authored or curated by the operator, with NL/EN parity, sourced from `news/*.md` frontmatter.

**Architecture:** Static Next.js server component reads `news/*.md` at build time, extracts frontmatter via a regex, parses YAML with `js-yaml`, validates with `zod`, and renders `ArticleCard`s in a two-column grid that mirrors the existing `TrainingCard` shape. External links open in a new tab via `rel="noopener noreferrer"`.

**Tech Stack:** Next.js 15 (App Router), React 19, next-intl 4, `js-yaml` (new), zod, TypeScript, Tailwind, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-05-20-articles-page-design.md`.

---

## Task 1: Add `js-yaml` dependency and scaffold `news/` directory

**Files:**

- Modify: `package.json` (via pnpm CLI; do not hand-edit)
- Create: `news/.gitkeep`

- [ ] **Step 1: Show the install commands**

```bash
pnpm add js-yaml
pnpm add -D @types/js-yaml
```

Reason: `js-yaml` is the runtime YAML parser used by `lib/articles.ts`. `@types/js-yaml` provides TypeScript types — js-yaml ships JS only.

Wait for Chef to run both. After they confirm success, proceed.

- [ ] **Step 2: Verify the install**

```bash
pnpm list js-yaml @types/js-yaml
```

Expected: both packages listed with versions. Pin nothing manually; whatever `pnpm add` resolved is fine.

- [ ] **Step 3: Create the `news/` scaffold**

Use the Write tool to create `news/.gitkeep` with empty content. Reason: keeps the directory in git so `getArticles()` finds it even before any article is published; prevents the `new-article` skill from silently creating a new top-level dir.

- [ ] **Step 4: Show the staging/commit commands**

```bash
git add package.json pnpm-lock.yaml news/.gitkeep
git status
git commit -m "chore(articles): add js-yaml and scaffold news/"
```

Reason: small, focused commit for the dependency and the empty directory. Chef runs each.

---

## Task 2: Frontmatter parser — failing test

**Files:**

- Create: `tests/lib/parseFrontmatter.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/lib/parseFrontmatter.test.ts` with:

```ts
import { describe, it, expect } from 'vitest';
import { parseFrontmatter } from '@/lib/parseFrontmatter';

const validFile = `---
title: 'shipping agent loops'
url: 'https://example.com/post'
date: '2026-05-12'
summary_nl: 'korte samenvatting'
summary_en: 'short summary'
---
`;

describe('parseFrontmatter', () => {
  it('returns the parsed YAML object for a valid frontmatter-only file', () => {
    const data = parseFrontmatter(validFile, 'fixture.md');
    expect(data).toEqual({
      title: 'shipping agent loops',
      url: 'https://example.com/post',
      date: '2026-05-12',
      summary_nl: 'korte samenvatting',
      summary_en: 'short summary',
    });
  });

  it('throws when the leading --- delimiter is missing', () => {
    const bad = `title: 'no delimiters'\n`;
    expect(() => parseFrontmatter(bad, 'bad.md')).toThrow(/frontmatter/i);
    expect(() => parseFrontmatter(bad, 'bad.md')).toThrow(/bad\.md/);
  });

  it('throws when the closing --- delimiter is missing', () => {
    const bad = `---\ntitle: 'unterminated'\n`;
    expect(() => parseFrontmatter(bad, 'bad.md')).toThrow(/frontmatter/i);
  });

  it('throws when the YAML body is invalid', () => {
    const bad = `---\ntitle: '\n---\n`;
    expect(() => parseFrontmatter(bad, 'bad.md')).toThrow();
  });

  it('handles apostrophes escaped as doubled single quotes (skill convention)', () => {
    const file = `---\ntitle: 'it''s a post'\n---\n`;
    const data = parseFrontmatter(file, 'apo.md') as Record<string, string>;
    expect(data.title).toBe("it's a post");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm vitest run tests/lib/parseFrontmatter.test.ts
```

Expected: FAIL — module `@/lib/parseFrontmatter` not found.

---

## Task 3: Frontmatter parser — implementation

**Files:**

- Create: `lib/parseFrontmatter.ts`

- [ ] **Step 1: Write the implementation**

Create `lib/parseFrontmatter.ts`:

```ts
import yaml from 'js-yaml';

const FRONTMATTER_RE = /^---\n([\s\S]*?)\n---\s*$/;

export function parseFrontmatter(raw: string, filename: string): unknown {
  const match = raw.match(FRONTMATTER_RE);
  if (!match) {
    throw new Error(
      `Invalid frontmatter in ${filename}: expected file to start with --- and end with ---`,
    );
  }
  try {
    return yaml.load(match[1]);
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to parse YAML frontmatter in ${filename}: ${reason}`);
  }
}
```

- [ ] **Step 2: Run test to verify it passes**

```bash
pnpm vitest run tests/lib/parseFrontmatter.test.ts
```

Expected: all 5 tests pass.

- [ ] **Step 3: Show the commit commands**

```bash
git add lib/parseFrontmatter.ts tests/lib/parseFrontmatter.test.ts
git status
git commit -m "feat(articles): add frontmatter parser"
```

Reason: parser is independently useful and testable; small commit.

---

## Task 4: Article schema + `getArticles` — failing test

**Files:**

- Create: `tests/lib/articles.test.ts`
- Create: `tests/lib/fixtures/news-valid/2026-05-12-foo.md`
- Create: `tests/lib/fixtures/news-valid/2026-04-28-bar.md`
- Create: `tests/lib/fixtures/news-bad-url/2026-05-12-baduri.md`
- Create: `tests/lib/fixtures/news-missing-field/2026-05-12-missing.md`
- Create: `tests/lib/fixtures/news-empty/.gitkeep`

- [ ] **Step 1: Create fixture files**

Create `tests/lib/fixtures/news-valid/2026-05-12-foo.md` with:

```
---
title: 'shipping agent loops'
url: 'https://example.com/post'
date: '2026-05-12'
summary_nl: 'nl samenvatting'
summary_en: 'en summary'
---
```

Create `tests/lib/fixtures/news-valid/2026-04-28-bar.md` with:

```
---
title: 'older post'
url: 'https://example.com/older'
date: '2026-04-28'
summary_nl: 'oudere samenvatting'
summary_en: 'older summary'
---
```

Create `tests/lib/fixtures/news-bad-url/2026-05-12-baduri.md` with:

```
---
title: 'bad url'
url: 'not-a-url'
date: '2026-05-12'
summary_nl: 'nl'
summary_en: 'en'
---
```

Create `tests/lib/fixtures/news-missing-field/2026-05-12-missing.md` with:

```
---
title: 'missing summary'
url: 'https://example.com/missing'
date: '2026-05-12'
summary_nl: 'nl only'
---
```

Create empty file `tests/lib/fixtures/news-empty/.gitkeep` (zero bytes).

- [ ] **Step 2: Write the failing test**

Create `tests/lib/articles.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { getArticles } from '@/lib/articles';

const fixturesRoot = path.resolve(__dirname, 'fixtures');

describe('getArticles', () => {
  it('returns articles sorted by date descending', () => {
    const articles = getArticles(path.join(fixturesRoot, 'news-valid'));
    expect(articles).toHaveLength(2);
    expect(articles[0].slug).toBe('2026-05-12-foo');
    expect(articles[1].slug).toBe('2026-04-28-bar');
  });

  it('maps snake_case frontmatter to camelCase fields', () => {
    const [first] = getArticles(path.join(fixturesRoot, 'news-valid'));
    expect(first.summaryNl).toBe('nl samenvatting');
    expect(first.summaryEn).toBe('en summary');
    expect(first.title).toBe('shipping agent loops');
    expect(first.url).toBe('https://example.com/post');
    expect(first.date).toBe('2026-05-12');
  });

  it('returns [] when the news directory does not exist', () => {
    expect(getArticles(path.join(fixturesRoot, 'does-not-exist'))).toEqual([]);
  });

  it('returns [] when the news directory exists but has no .md files', () => {
    expect(getArticles(path.join(fixturesRoot, 'news-empty'))).toEqual([]);
  });

  it('throws when an article has a non-http(s) url', () => {
    expect(() => getArticles(path.join(fixturesRoot, 'news-bad-url'))).toThrow(/url/i);
  });

  it('throws when an article is missing a required field', () => {
    expect(() => getArticles(path.join(fixturesRoot, 'news-missing-field'))).toThrow(/summary_en/i);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

```bash
pnpm vitest run tests/lib/articles.test.ts
```

Expected: FAIL — module `@/lib/articles` not found.

---

## Task 5: Article schema + `getArticles` — implementation

**Files:**

- Create: `lib/articles.ts`

- [ ] **Step 1: Write the implementation**

Create `lib/articles.ts`:

```ts
import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import { parseFrontmatter } from './parseFrontmatter';

const frontmatterSchema = z.object({
  title: z.string().min(1),
  url: z.string().regex(/^https?:\/\//, 'url must start with http(s)://'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD'),
  summary_nl: z.string().min(1),
  summary_en: z.string().min(1),
  image: z.string().optional(),
  tags: z.array(z.string()).optional(),
  author: z.string().optional(),
});

export interface Article {
  slug: string;
  title: string;
  url: string;
  date: string;
  summaryNl: string;
  summaryEn: string;
  image?: string;
  tags?: string[];
  author?: string;
}

const DEFAULT_NEWS_DIR = path.join(process.cwd(), 'news');

export function getArticles(newsDir: string = DEFAULT_NEWS_DIR): Article[] {
  if (!fs.existsSync(newsDir)) return [];

  const entries = fs.readdirSync(newsDir).filter((f) => f.endsWith('.md'));

  if (entries.length === 0) return [];

  const articles = entries.map((filename) => {
    const filePath = path.join(newsDir, filename);
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = parseFrontmatter(raw, filename);
    const result = frontmatterSchema.safeParse(parsed);

    if (!result.success) {
      const issue = result.error.issues[0];
      const field = issue.path.join('.') || '(root)';
      throw new Error(`Invalid frontmatter in ${filename}: field "${field}" — ${issue.message}`);
    }

    const d = result.data;
    const article: Article = {
      slug: filename.replace(/\.md$/, ''),
      title: d.title,
      url: d.url,
      date: d.date,
      summaryNl: d.summary_nl,
      summaryEn: d.summary_en,
    };
    if (d.image !== undefined) article.image = d.image;
    if (d.tags !== undefined) article.tags = d.tags;
    if (d.author !== undefined) article.author = d.author;
    return article;
  });

  articles.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  return articles;
}
```

- [ ] **Step 2: Run test to verify it passes**

```bash
pnpm vitest run tests/lib/articles.test.ts
```

Expected: all 6 tests pass.

- [ ] **Step 3: Run the full vitest suite to make sure nothing regressed**

```bash
pnpm vitest run
```

Expected: all tests pass.

- [ ] **Step 4: Show the commit commands**

```bash
git add lib/articles.ts tests/lib/articles.test.ts tests/lib/fixtures/
git status
git commit -m "feat(articles): add getArticles with zod schema"
```

---

## Task 6: i18n strings — add `articles` namespace and `nav.articles`

**Files:**

- Modify: `messages/en.json`
- Modify: `messages/nl.json`

- [ ] **Step 1: Add `nav.articles` to both locale files**

In `messages/en.json`, inside the `"nav": { ... }` object, after `"contact": "Contact",` add:

```json
    "articles": "Articles",
```

In `messages/nl.json`, inside the `"nav": { ... }` object, after `"contact": "Contact",` add:

```json
    "articles": "Artikelen",
```

- [ ] **Step 2: Add the `articles` namespace to both locale files**

In `messages/en.json`, after the closing `}` of the `"about"` namespace (and before `"contact"`), add a new top-level namespace:

```json
  "articles": {
    "title": "articles",
    "intro": "External articles we wrote or recommend. Each one links out to its original home.",
    "readExternal": "read on external site ↗",
    "emptyState": "no articles yet"
  },
```

In `messages/nl.json`, add the parallel block at the same position:

```json
  "articles": {
    "title": "artikelen",
    "intro": "Externe artikelen die wij schreven of aanraden. Elke link wijst naar het origineel.",
    "readExternal": "lees op externe site ↗",
    "emptyState": "nog geen artikelen"
  },
```

- [ ] **Step 3: Run the i18n integrity check**

```bash
pnpm verify:i18n
```

Expected: `i18n integrity OK`.

Also:

```bash
pnpm vitest run tests/i18n-integrity.test.ts
```

Expected: PASS.

- [ ] **Step 4: Show the commit commands**

```bash
git add messages/en.json messages/nl.json
git status
git commit -m "i18n(articles): add articles namespace and nav.articles"
```

---

## Task 7: `ArticleCard` component

**Files:**

- Create: `components/ArticleCard.tsx`

- [ ] **Step 1: Write the component**

Create `components/ArticleCard.tsx`:

```tsx
import { useTranslations } from 'next-intl';
import type { Article } from '@/lib/articles';
import type { Locale } from '@/i18n/routing';

export function ArticleCard({ article, locale }: { article: Article; locale: Locale }) {
  const t = useTranslations('articles');
  const summary = locale === 'nl' ? article.summaryNl : article.summaryEn;

  return (
    <article className="border-border-subtle bg-bg-elevated flex h-full flex-col rounded-sm border p-6">
      <p className="text-text-muted font-mono text-xs tracking-[0.2em] uppercase">
        // {article.date}
      </p>
      <h3 className="text-text-primary mt-3 font-mono text-lg">
        <span className="text-accent-green">&gt;</span> {article.title}
      </h3>
      <p className="text-text-muted mt-3 flex-1 text-sm">{summary}</p>
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        data-testid={`article-link-${article.slug}`}
        className="text-accent-blue mt-6 inline-flex items-center gap-1 font-mono text-sm hover:underline"
      >
        → {t('readExternal')}
      </a>
    </article>
  );
}
```

Notes for the engineer:

- The `data-testid` lets the e2e suite target individual cards.
- `flex h-full flex-col` plus `flex-1` on the summary keeps the link aligned to the bottom across cards of varying summary length (same trick used by `TrainingCard`).
- Optional `image`, `tags`, `author` are intentionally not rendered yet (v1 scope, see spec decision #5).

- [ ] **Step 2: Smoke-check it type-checks**

```bash
pnpm typecheck
```

Expected: no errors.

- [ ] **Step 3: Show the commit commands**

```bash
git add components/ArticleCard.tsx
git status
git commit -m "feat(articles): add ArticleCard component"
```

---

## Task 8: `/[locale]/articles` page

**Files:**

- Create: `app/[locale]/articles/page.tsx`

- [ ] **Step 1: Write the page**

Create `app/[locale]/articles/page.tsx`:

```tsx
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { ArticleCard } from '@/components/ArticleCard';
import { JsonLd } from '@/components/JsonLd';
import { getArticles } from '@/lib/articles';
import type { Locale } from '@/i18n/routing';

export default async function ArticlesPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('articles');
  const articles = getArticles();

  return (
    <main className="px-6 py-20">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Blog',
          name: `${t('title')} — agenticengineering.nl`,
          inLanguage: locale,
          blogPost: articles.map((a) => ({
            '@type': 'BlogPosting',
            headline: a.title,
            datePublished: a.date,
            url: a.url,
            inLanguage: locale,
          })),
        }}
      />
      <div className="mx-auto max-w-5xl">
        <h1 className="text-text-primary font-mono text-4xl">
          <span className="text-accent-green">&gt;</span> {t('title')}
        </h1>
        <p className="text-text-muted mt-6 max-w-2xl">{t('intro')}</p>

        {articles.length === 0 ? (
          <p className="text-text-muted mt-10 font-mono text-sm" data-testid="articles-empty-state">
            // {t('emptyState')}
          </p>
        ) : (
          <div className="mt-10 grid gap-6 md:grid-cols-2" data-testid="articles-grid">
            {articles.map((article) => (
              <ArticleCard key={article.slug} article={article} locale={locale} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
```

Notes for the engineer:

- `setRequestLocale` is required for next-intl in server components — same call pattern as `app/[locale]/about/page.tsx`.
- `getArticles()` reads from `news/` at the repo root by default; never pass an argument here (the test override is for unit tests only).
- The JSON-LD shape mirrors the existing one on the home page (see `app/[locale]/page.tsx`).

- [ ] **Step 2: Run typecheck and full vitest suite**

```bash
pnpm typecheck
pnpm vitest run
```

Expected: both pass.

- [ ] **Step 3: Run the dev server and visit the page manually**

```bash
pnpm dev
```

Chef visits `http://localhost:3000/nl/articles` and `http://localhost:3000/en/articles`. Both should render an empty state (since `news/` only contains `.gitkeep`).

Stop the dev server once verified.

- [ ] **Step 4: Show the commit commands**

```bash
git add app/[locale]/articles/page.tsx
git status
git commit -m "feat(articles): add /[locale]/articles index page"
```

---

## Task 9: Nav and MobileMenu link

**Files:**

- Modify: `components/Nav.tsx`
- Modify: `components/MobileMenu.tsx`

- [ ] **Step 1: Add the link to `components/Nav.tsx`**

In `components/Nav.tsx`, inside the right-hand link cluster, between the About link and the Contact link, insert:

```tsx
<Link
  href={`/${locale}/articles`}
  data-testid="nav-articles"
  className="text-text-muted hover:text-accent-blue hidden sm:inline"
>
  {t('articles')}
</Link>
```

The block now reads (About → Articles → Contact). The translation key `t('articles')` resolves to the `nav.articles` string added in Task 6.

- [ ] **Step 2: Add the link to `components/MobileMenu.tsx`**

In `components/MobileMenu.tsx`, inside the mobile panel's `<div className="mx-auto flex max-w-6xl flex-col gap-4 ...">`, between the About `<Link>` and the Contact `<Link>`, insert:

```tsx
<Link
  href={`/${locale}/articles`}
  onClick={() => setOpen(false)}
  data-testid="mobile-menu-articles"
  className="text-text-muted hover:text-accent-blue"
>
  {t('articles')}
</Link>
```

- [ ] **Step 3: Verify the dev server still serves and the link is visible**

```bash
pnpm dev
```

Chef visits `http://localhost:3000/nl` and confirms the new "Artikelen" link appears in the top nav between "Over ons" and "Contact". Then `/en`, link reads "Articles". Click each — should land on `/nl/articles` and `/en/articles`. Open the mobile menu (narrow window or devtools mobile mode) — link appears there too.

Stop the dev server.

- [ ] **Step 4: Show the commit commands**

```bash
git add components/Nav.tsx components/MobileMenu.tsx
git status
git commit -m "feat(articles): link articles page from nav and mobile menu"
```

---

## Task 10: Sitemap entry

**Files:**

- Modify: `app/sitemap.ts`

- [ ] **Step 1: Add `/articles` to the `PATHS` constant**

In `app/sitemap.ts`, change line 5 from:

```ts
const PATHS = ['', '/about', '/contact', '/impressum'] as const;
```

to:

```ts
const PATHS = ['', '/about', '/articles', '/contact', '/impressum'] as const;
```

- [ ] **Step 2: Run typecheck**

```bash
pnpm typecheck
```

Expected: no errors.

- [ ] **Step 3: Show the commit commands**

```bash
git add app/sitemap.ts
git status
git commit -m "chore(articles): include /articles in sitemap"
```

---

## Task 11: Playwright a11y coverage

**Files:**

- Modify: `e2e/a11y.spec.ts`

- [ ] **Step 1: Add the two new routes to the `pages` array**

In `e2e/a11y.spec.ts`, change line 4 from:

```ts
const pages = ['/nl', '/en', '/nl/about', '/en/about', '/nl/contact', '/nl/impressum'];
```

to:

```ts
const pages = [
  '/nl',
  '/en',
  '/nl/about',
  '/en/about',
  '/nl/articles',
  '/en/articles',
  '/nl/contact',
  '/nl/impressum',
];
```

- [ ] **Step 2: Run the a11y suite**

```bash
pnpm test:e2e -- e2e/a11y.spec.ts
```

Expected: all tests pass, including the two new `/nl/articles` and `/en/articles` cases. If a11y violations appear on the new page, stop and inspect — do not silence axe rules.

---

## Task 12: Playwright smoke test for articles page

**Files:**

- Create: `e2e/articles.spec.ts`

- [ ] **Step 1: Write the smoke test**

Create `e2e/articles.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test('articles page renders empty state in NL when news/ has no .md files', async ({ page }) => {
  await page.goto('/nl/articles');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/artikelen/i);
  // when news/ is empty (only .gitkeep), the empty state shows
  await expect(page.getByTestId('articles-empty-state')).toBeVisible();
});

test('articles page renders empty state in EN when news/ has no .md files', async ({ page }) => {
  await page.goto('/en/articles');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/articles/i);
  await expect(page.getByTestId('articles-empty-state')).toBeVisible();
});

test('articles nav link is visible and links to /nl/articles', async ({ page }) => {
  await page.goto('/nl');
  const link = page.getByTestId('nav-articles');
  await expect(link).toBeVisible();
  await link.click();
  await expect(page).toHaveURL(/\/nl\/articles$/);
});
```

Notes:

- These tests assume `news/` contains no `.md` files at CI time. When Chef publishes the first article via the `new-article` skill, a follow-up commit will update the assertions OR the empty-state tests will be reframed around test-only fixtures. Both are out of scope for this plan.

- [ ] **Step 2: Run the smoke suite**

```bash
pnpm test:e2e -- e2e/articles.spec.ts
```

Expected: all 3 tests pass.

- [ ] **Step 3: Show the commit commands**

```bash
git add e2e/articles.spec.ts e2e/a11y.spec.ts
git status
git commit -m "test(articles): a11y + smoke coverage for /articles"
```

---

## Task 13: Production build and final manual smoke

**Files:** none.

- [ ] **Step 1: Run the production build**

```bash
pnpm build
```

Expected: build succeeds. Confirm in the output that `/nl/articles` and `/en/articles` appear as statically prerendered routes.

- [ ] **Step 2: Run the production server and re-verify**

```bash
pnpm start
```

Chef visits both `/nl/articles` and `/en/articles` in a browser and confirms:

- empty state renders.
- nav link visible.
- no console errors.
- both locales' page titles and intro text appear correctly.

Stop the server.

- [ ] **Step 3: Run the full test pipeline as a final gate**

```bash
pnpm lint
pnpm typecheck
pnpm verify:i18n
pnpm vitest run
pnpm test:e2e
```

Expected: all green.

- [ ] **Step 4: Push the branch and open the PR**

```bash
git push -u origin <branch-name>
gh pr create --title "feat(articles): add /[locale]/articles index page" --body "$(cat <<'EOF'
## Summary
- Adds /[locale]/articles index page that lists external articles from news/*.md frontmatter
- Adds js-yaml + zod-validated lib/articles.ts data layer
- Adds ArticleCard component (mirrors TrainingCard shape)
- Adds articles namespace + nav.articles in nl + en messages
- Adds /articles to nav, mobile menu, sitemap
- Adds a11y + smoke e2e coverage

## Test plan
- [ ] pnpm vitest run
- [ ] pnpm test:e2e
- [ ] Visit /nl/articles + /en/articles, confirm empty state and nav link
EOF
)"
```

Chef chooses the branch name and runs both commands.

---

## Self-review notes (for the planner)

- **Spec coverage:** Every decision (#1 route, #2 source, #3 external links, #4 NL/EN parity, #5 tags-on-schema-only, #6 grid layout, #7 js-yaml, #8 empty state, #9 build-time caching) maps to at least one task above.
- **Type consistency:** `Article` interface defined once in `lib/articles.ts` and reused by `ArticleCard` and the page. `summary_nl`/`summary_en` (snake_case) lives only in YAML; everywhere else uses `summaryNl`/`summaryEn` (camelCase).
- **No placeholders:** Every code step shows the exact content; every test step shows the assertion.
- **Out of scope:** No on-site detail pages, no RSS, no tags rendering. These are flagged in the spec and not in this plan.
