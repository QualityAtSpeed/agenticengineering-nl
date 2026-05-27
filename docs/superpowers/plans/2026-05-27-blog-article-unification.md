# Blog/article unification — implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Collapse the separate blog system into the articles system. Single `news/*.md` source with a `type: 'blog' | 'article'` discriminator (defaulting to `'article'`), a corner badge on each card, and a URL-driven filter bar on the index page.

**Architecture:** One schema (`lib/articles.ts`) with a Zod-defaulted `type` field and an optional `source_url`. Server-side filtering on `app/[locale]/articles/page.tsx` via `searchParams.type`. New `ArticleFilterBar` server component renders bracketed mono links. og-image scraper skips entries without `source_url`. Blog code (`lib/blogs.ts`, `components/BlogCard.tsx`, `blogs/`, all blog fixtures + tests, blog translations) is deleted entirely.

**Tech Stack:** Next.js 15 App Router (server components), TypeScript, Zod, next-intl (NL/EN), Tailwind v4, Vitest, Testing Library, Playwright.

**Spec:** `docs/superpowers/specs/2026-05-27-blog-article-unification-design.md`

**Branch:** `blogs-as-external-links` (already checked out).

---

## File map

**Modified**

- `lib/articles.ts` — schema (`type` default + `source_url` optional), `Article` interface
- `components/ArticleCard.tsx` — corner badge over image
- `app/[locale]/articles/page.tsx` — drop blogs section, accept `searchParams`, render `ArticleFilterBar`, filter in-process
- `messages/en.json` — drop `blogs` block, add `articles.filter` and `articles.type`
- `messages/nl.json` — same
- `scripts/fetch-article-images.ts` — skip entries without `source_url`
- `tests/lib/articles.test.ts` — `type` default, blog round-trip, invalid `type` rejected, optional `source_url`
- `tests/scripts/fetch-article-images.test.ts` — adjust the missing-source-url path
- `e2e/pages/articles-page.ts` — expose filter locators
- `e2e/articles.spec.ts` — filter click flow

**Added**

- `components/ArticleFilterBar.tsx`
- `tests/components/ArticleCard.test.tsx`
- `tests/components/ArticleFilterBar.test.tsx`
- `tests/app/articles-page.test.tsx`
- `tests/lib/fixtures/news-blog/2026-05-12-blog.md`
- `tests/lib/fixtures/news-bad-type/2026-05-12-bad.md`

**Deleted**

- `lib/blogs.ts`
- `components/BlogCard.tsx`
- `blogs/` (incl. `.gitkeep`)
- `tests/lib/blogs.test.ts`
- `tests/components/BlogCard.test.tsx`
- `tests/lib/fixtures/blogs-author-mismatch/`
- `tests/lib/fixtures/blogs-date-mismatch/`
- `tests/lib/fixtures/blogs-empty/`
- `tests/lib/fixtures/blogs-image-mismatch/`
- `tests/lib/fixtures/blogs-missing-field/`
- `tests/lib/fixtures/blogs-missing-locale/`
- `tests/lib/fixtures/blogs-no-frontmatter/`
- `tests/lib/fixtures/blogs-tags-mismatch/`
- `tests/lib/fixtures/blogs-valid/`
- `tests/lib/fixtures/news-missing-source-url/`

---

## Task 1: Add blog + bad-type fixtures

**Files:**

- Create: `tests/lib/fixtures/news-blog/2026-05-12-blog.md`
- Create: `tests/lib/fixtures/news-bad-type/2026-05-12-bad.md`

- [ ] **Step 1: Create the blog fixture**

`tests/lib/fixtures/news-blog/2026-05-12-blog.md`:

```markdown
---
title_nl: 'blog NL'
title_en: 'blog EN'
url: 'https://example.com/blog'
type: 'blog'
date: '2026-05-12'
summary_nl: 'nl samenvatting'
summary_en: 'en summary'
---
```

(No `source_url`, no `image`. The test relies on both being absent for the blog path.)

- [ ] **Step 2: Create the bad-type fixture**

`tests/lib/fixtures/news-bad-type/2026-05-12-bad.md`:

```markdown
---
title_nl: 'bad NL'
title_en: 'bad EN'
url: 'https://example.com/bad'
source_url: 'https://example.com/bad'
type: 'podcast'
date: '2026-05-12'
summary_nl: 'nl'
summary_en: 'en'
---
```

- [ ] **Step 3: Commit**

```bash
git add tests/lib/fixtures/news-blog tests/lib/fixtures/news-bad-type
git commit -m "test: add fixtures for blog type + invalid type"
```

---

## Task 2: Schema changes (type default + optional source_url)

**Files:**

- Modify: `tests/lib/articles.test.ts`
- Modify: `lib/articles.ts`
- Delete: `tests/lib/fixtures/news-missing-source-url/`

- [ ] **Step 1: Write the failing tests**

Replace the body of `tests/lib/articles.test.ts` with:

```typescript
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
    expect(first.titleNl).toBe('agent loops verschepen');
    expect(first.titleEn).toBe('shipping agent loops');
    expect(first.url).toBe('https://example.com/post');
    expect(first.sourceUrl).toBe('https://example.com/post');
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

  it('defaults type to "article" when frontmatter omits it', () => {
    const [first] = getArticles(path.join(fixturesRoot, 'news-valid'));
    expect(first.type).toBe('article');
  });

  it('maps explicit type: "blog" into Article.type', () => {
    const [first] = getArticles(path.join(fixturesRoot, 'news-blog'));
    expect(first.type).toBe('blog');
  });

  it('rejects a type value that is not "blog" or "article"', () => {
    expect(() => getArticles(path.join(fixturesRoot, 'news-bad-type'))).toThrow(/type/i);
  });

  it('accepts a missing source_url (sourceUrl is undefined)', () => {
    const [first] = getArticles(path.join(fixturesRoot, 'news-blog'));
    expect(first.sourceUrl).toBeUndefined();
  });

  it('falls back to /qas-icon.svg when frontmatter has no image field', () => {
    const [first] = getArticles(path.join(fixturesRoot, 'news-valid'));
    expect(first.image).toBe('/qas-icon.svg');
  });

  it('uses the frontmatter image field when provided', () => {
    const [first] = getArticles(path.join(fixturesRoot, 'news-image-override'));
    expect(first.image).toBe('/custom/override.jpg');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test -- tests/lib/articles.test.ts`

Expected: FAIL — `type` doesn't exist on `Article`; the new fixture-based tests fail because the schema still requires `source_url`.

- [ ] **Step 3: Update the schema and Article interface**

Replace `lib/articles.ts` with:

```typescript
import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import { parseFrontmatter } from './parseFrontmatter';

const frontmatterSchema = z.object({
  title_nl: z.string().min(1),
  title_en: z.string().min(1),
  url: z.string().regex(/^https?:\/\//, 'url must start with http(s)://'),
  source_url: z
    .string()
    .regex(/^https?:\/\//, 'source_url must start with http(s)://')
    .optional(),
  type: z.enum(['blog', 'article']).default('article'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD'),
  summary_nl: z.string().min(1),
  summary_en: z.string().min(1),
  image: z.string().optional(),
  tags: z.array(z.string()).optional(),
  author: z.string().optional(),
});

export interface Article {
  slug: string;
  titleNl: string;
  titleEn: string;
  url: string;
  sourceUrl: string | undefined;
  type: 'blog' | 'article';
  date: string;
  summaryNl: string;
  summaryEn: string;
  image: string;
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
      titleNl: d.title_nl,
      titleEn: d.title_en,
      url: d.url,
      sourceUrl: d.source_url,
      type: d.type,
      date: d.date,
      summaryNl: d.summary_nl,
      summaryEn: d.summary_en,
      image: d.image ?? '/qas-icon.svg',
    };
    if (d.tags !== undefined) article.tags = d.tags;
    if (d.author !== undefined) article.author = d.author;
    return article;
  });

  articles.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  return articles;
}
```

- [ ] **Step 4: Delete the obsolete fixture**

The `news-missing-source-url` fixture asserted an error path that no longer exists.

```bash
rm -rf tests/lib/fixtures/news-missing-source-url
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm test -- tests/lib/articles.test.ts`

Expected: PASS — all `getArticles` tests green.

- [ ] **Step 6: Commit**

```bash
git add lib/articles.ts tests/lib/articles.test.ts tests/lib/fixtures/news-missing-source-url
git commit -m "feat(articles): add type discriminator and make source_url optional"
```

---

## Task 3: og-image scraper skips entries without source_url

**Files:**

- Modify: `tests/scripts/fetch-article-images.test.ts`
- Modify: `scripts/fetch-article-images.ts`

The current behaviour of `fetchArticleImage` already accepts a `sourceUrl: string` argument and was always called with a string. The change is at the _caller_ level — entries without `source_url` are skipped before they reach the function. The function itself stays unchanged; only its CLI/console-error invocation needs to skip.

Inspect `scripts/fetch-article-images.ts:142-169` — the CLI entry point already requires `<url>` as `process.argv[2]`. The CI/manual workflow today is: a human runs `tsx scripts/fetch-article-images.ts <source_url> <slug>` for each article. We will add a guard in the CLI entry that prints `skipped: no source_url (blog)` and exits 0 if `url` is empty, so it is safe to wire into a future batch script. For now, the only behavioural test we owe is that the function itself rejects "invalid source_url" already covers a missing/empty path — but the spec calls for a structural log. Implement and test the empty-string path through the CLI guard.

- [ ] **Step 1: Write the failing test**

Append to `tests/scripts/fetch-article-images.test.ts` inside the `describe('fetchArticleImage', ...)` block (just before its closing brace):

```typescript
it('returns a "no source_url" skip without launching the browser', async () => {
  const { outputDir, trustedFile } = makeWorkspace(['medium.com']);
  const fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);

  const result = await fetchArticleImage('', 'slug', { outputDir, trustedFile });

  expect(result.ok).toBe(false);
  expect(result.reason).toBe('no source_url (blog)');
  expect(result.imagePath).toBe('/qas-icon.svg');
  expect(playwrightMocks.launch).not.toHaveBeenCalled();
  expect(fetchMock).not.toHaveBeenCalled();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- tests/scripts/fetch-article-images.test.ts`

Expected: FAIL — the empty-string branch currently returns `invalid source_url`, not `no source_url (blog)`.

- [ ] **Step 3: Update the scraper guard**

In `scripts/fetch-article-images.ts`, replace the function preamble (lines 38–45 in the current file, the block from `let srcUrl: URL;` through the `if (!isTrusted...)` check is unchanged — insert above it):

Find this block in `scripts/fetch-article-images.ts`:

```typescript
let srcUrl: URL;
try {
  srcUrl = new URL(sourceUrl);
} catch {
  return { imagePath: FALLBACK, ok: false, reason: 'invalid source_url' };
}
```

Replace with:

```typescript
if (!sourceUrl) {
  return { imagePath: FALLBACK, ok: false, reason: 'no source_url (blog)' };
}

let srcUrl: URL;
try {
  srcUrl = new URL(sourceUrl);
} catch {
  return { imagePath: FALLBACK, ok: false, reason: 'invalid source_url' };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- tests/scripts/fetch-article-images.test.ts`

Expected: PASS — all `fetchArticleImage` tests green, including the new skip.

- [ ] **Step 5: Commit**

```bash
git add scripts/fetch-article-images.ts tests/scripts/fetch-article-images.test.ts
git commit -m "feat(scraper): skip entries without source_url"
```

---

## Task 4: Add filter and type translation keys

**Files:**

- Modify: `messages/en.json`
- Modify: `messages/nl.json`

Translations are added alongside the existing `articles` block. Blog translations stay for now and are removed in Task 8 after their consumers are gone, so we never have a state where the build references a missing key.

- [ ] **Step 1: Add EN keys**

In `messages/en.json`, find the `"articles": { ... }` block:

```json
  "articles": {
    "title": "articles",
    "intro": "External articles we wrote or recommend. Each one links out to its original home.",
    "readExternal": "read on external site ↗",
    "emptyState": "no articles yet"
  },
```

Replace with:

```json
  "articles": {
    "title": "articles",
    "intro": "External articles we wrote or recommend. Each one links out to its original home.",
    "readExternal": "read on external site ↗",
    "emptyState": "no articles yet",
    "filter": {
      "all": "all",
      "blogs": "blogs",
      "articles": "articles"
    },
    "type": {
      "blog": "blog",
      "article": "article"
    }
  },
```

- [ ] **Step 2: Add NL keys**

In `messages/nl.json`, find the `"articles": { ... }` block:

```json
  "articles": {
    "title": "artikelen",
    "intro": "Externe artikelen die wij schreven of aanraden. Elke link wijst naar het origineel.",
    "readExternal": "lees op externe site ↗",
    "emptyState": "nog geen artikelen"
  },
```

Replace with:

```json
  "articles": {
    "title": "artikelen",
    "intro": "Externe artikelen die wij schreven of aanraden. Elke link wijst naar het origineel.",
    "readExternal": "lees op externe site ↗",
    "emptyState": "nog geen artikelen",
    "filter": {
      "all": "alle",
      "blogs": "blogs",
      "articles": "artikelen"
    },
    "type": {
      "blog": "blog",
      "article": "artikel"
    }
  },
```

- [ ] **Step 3: Run the locale parity check**

Run: `pnpm verify:i18n`

Expected output: `i18n integrity OK`.

- [ ] **Step 4: Commit**

```bash
git add messages/en.json messages/nl.json
git commit -m "i18n: add articles.filter and articles.type keys"
```

---

## Task 5: ArticleCard corner badge

**Files:**

- Create: `tests/components/ArticleCard.test.tsx`
- Modify: `components/ArticleCard.tsx`

We add tests first because no `ArticleCard` component test exists today. The badge keys off `article.type` and uses the translations from Task 4.

- [ ] **Step 1: Write the failing tests**

Create `tests/components/ArticleCard.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { ArticleCard } from '@/components/ArticleCard';
import type { Article } from '@/lib/articles';
import messagesEn from '@/messages/en.json';
import messagesNl from '@/messages/nl.json';

const baseArticle: Article = {
  slug: '2026-05-12-sample',
  titleNl: 'titel NL',
  titleEn: 'title EN',
  url: 'https://example.com/post',
  sourceUrl: 'https://example.com/post',
  type: 'article',
  date: '2026-05-12',
  summaryNl: 'NL samenvatting',
  summaryEn: 'EN summary',
  image: '/qas-icon.svg',
};

function renderWith(article: Article, locale: 'nl' | 'en') {
  const messages = locale === 'nl' ? messagesNl : messagesEn;
  return render(
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ArticleCard article={article} locale={locale} />
    </NextIntlClientProvider>,
  );
}

describe('ArticleCard', () => {
  it('renders EN title and summary when locale=en', () => {
    renderWith(baseArticle, 'en');
    expect(screen.getByText('title EN')).toBeInTheDocument();
    expect(screen.getByText('EN summary')).toBeInTheDocument();
  });

  it('renders NL title and summary when locale=nl', () => {
    renderWith(baseArticle, 'nl');
    expect(screen.getByText('titel NL')).toBeInTheDocument();
    expect(screen.getByText('NL samenvatting')).toBeInTheDocument();
  });

  it('renders the external link with target=_blank and rel=noopener', () => {
    renderWith(baseArticle, 'en');
    const link = screen.getByTestId('article-link-2026-05-12-sample');
    expect(link).toHaveAttribute('href', 'https://example.com/post');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', expect.stringMatching(/noopener/));
  });

  it('renders an "article" badge in EN with accent-orange when type=article', () => {
    renderWith(baseArticle, 'en');
    const badge = screen.getByTestId('article-badge-2026-05-12-sample');
    expect(badge).toHaveTextContent('article');
    expect(badge.className).toContain('text-accent-orange');
    expect(badge.className).toContain('border-accent-orange');
  });

  it('renders an "artikel" badge in NL when type=article', () => {
    renderWith(baseArticle, 'nl');
    const badge = screen.getByTestId('article-badge-2026-05-12-sample');
    expect(badge).toHaveTextContent('artikel');
  });

  it('renders a "blog" badge in EN with accent-green when type=blog', () => {
    renderWith({ ...baseArticle, type: 'blog' }, 'en');
    const badge = screen.getByTestId('article-badge-2026-05-12-sample');
    expect(badge).toHaveTextContent('blog');
    expect(badge.className).toContain('text-accent-green');
    expect(badge.className).toContain('border-accent-green');
  });

  it('renders a "blog" badge in NL when type=blog', () => {
    renderWith({ ...baseArticle, type: 'blog' }, 'nl');
    const badge = screen.getByTestId('article-badge-2026-05-12-sample');
    expect(badge).toHaveTextContent('blog');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test -- tests/components/ArticleCard.test.tsx`

Expected: FAIL — `article-badge-…` testid does not exist.

- [ ] **Step 3: Add the badge to ArticleCard**

Replace `components/ArticleCard.tsx` with:

```tsx
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import type { Article } from '@/lib/articles';

const BADGE_COLOR: Record<Article['type'], string> = {
  blog: 'border-accent-green text-accent-green',
  article: 'border-accent-orange text-accent-orange',
};

export function ArticleCard({ article, locale }: { article: Article; locale: string }) {
  const t = useTranslations('articles');
  const rawSummary = locale === 'nl' ? article.summaryNl : article.summaryEn;
  const summary = rawSummary.length > 400 ? `${rawSummary.slice(0, 400).trimEnd()}…` : rawSummary;
  const title = locale === 'nl' ? article.titleNl : article.titleEn;
  const isFallback = article.image === '/qas-icon.svg';
  const imageAlt = title;
  const badgeColor = BADGE_COLOR[article.type];

  return (
    <article
      data-testid={`article-card-${article.slug}`}
      className="border-border-subtle bg-bg-elevated hover:border-accent-blue flex h-full flex-col overflow-hidden rounded-sm border transition-colors duration-150"
    >
      <div className="bg-bg-base border-border-subtle relative aspect-[2/1] w-full border-b">
        <Image
          src={article.image}
          alt={imageAlt}
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className={isFallback ? 'object-contain p-6' : 'object-cover'}
          loading="lazy"
        />
        <div
          data-testid={`article-badge-${article.slug}`}
          className={`${badgeColor} bg-bg-base/85 absolute top-3 left-3 rounded-sm border px-2.5 py-1 font-mono text-[10px] tracking-[0.2em] uppercase backdrop-blur-sm`}
        >
          {t(`type.${article.type}`)}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="text-text-muted font-mono text-xs tracking-[0.2em] uppercase">
          {article.date}
        </p>
        <h3 className="text-text-primary mt-3 font-mono text-2xl">
          <span className="text-accent-green">&gt;</span> {title}
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
      </div>
    </article>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test -- tests/components/ArticleCard.test.tsx`

Expected: PASS — all six assertions green.

- [ ] **Step 5: Commit**

```bash
git add components/ArticleCard.tsx tests/components/ArticleCard.test.tsx
git commit -m "feat(articles): render type badge over card image"
```

---

## Task 6: ArticleFilterBar component

**Files:**

- Create: `components/ArticleFilterBar.tsx`
- Create: `tests/components/ArticleFilterBar.test.tsx`

Server component. Renders `[ all | blogs | articles ]` as three `<Link>` elements with one set active via class + `aria-current="page"`.

- [ ] **Step 1: Write the failing tests**

Create `tests/components/ArticleFilterBar.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { ArticleFilterBar } from '@/components/ArticleFilterBar';
import messagesEn from '@/messages/en.json';
import messagesNl from '@/messages/nl.json';

function renderBar(currentType: 'all' | 'blog' | 'article', locale: 'nl' | 'en') {
  const messages = locale === 'nl' ? messagesNl : messagesEn;
  return render(
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ArticleFilterBar currentType={currentType} locale={locale} />
    </NextIntlClientProvider>,
  );
}

describe('ArticleFilterBar', () => {
  it('renders three links: all, blogs, articles (EN labels)', () => {
    renderBar('all', 'en');
    const all = screen.getByTestId('filter-all');
    const blogs = screen.getByTestId('filter-blogs');
    const articles = screen.getByTestId('filter-articles');
    expect(all).toHaveTextContent('all');
    expect(blogs).toHaveTextContent('blogs');
    expect(articles).toHaveTextContent('articles');
  });

  it('uses NL labels when locale=nl', () => {
    renderBar('all', 'nl');
    expect(screen.getByTestId('filter-all')).toHaveTextContent('alle');
    expect(screen.getByTestId('filter-blogs')).toHaveTextContent('blogs');
    expect(screen.getByTestId('filter-articles')).toHaveTextContent('artikelen');
  });

  it('uses correct hrefs per locale', () => {
    renderBar('all', 'en');
    expect(screen.getByTestId('filter-all')).toHaveAttribute('href', '/en/articles');
    expect(screen.getByTestId('filter-blogs')).toHaveAttribute('href', '/en/articles?type=blog');
    expect(screen.getByTestId('filter-articles')).toHaveAttribute(
      'href',
      '/en/articles?type=article',
    );
  });

  it('marks "all" active when currentType="all"', () => {
    renderBar('all', 'en');
    const all = screen.getByTestId('filter-all');
    expect(all).toHaveAttribute('aria-current', 'page');
    expect(all.className).toContain('text-accent-green');
    expect(screen.getByTestId('filter-blogs')).not.toHaveAttribute('aria-current');
  });

  it('marks "blogs" active when currentType="blog"', () => {
    renderBar('blog', 'en');
    const blogs = screen.getByTestId('filter-blogs');
    expect(blogs).toHaveAttribute('aria-current', 'page');
    expect(blogs.className).toContain('text-accent-green');
    expect(screen.getByTestId('filter-all')).not.toHaveAttribute('aria-current');
  });

  it('marks "articles" active when currentType="article"', () => {
    renderBar('article', 'en');
    const articles = screen.getByTestId('filter-articles');
    expect(articles).toHaveAttribute('aria-current', 'page');
    expect(articles.className).toContain('text-accent-green');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test -- tests/components/ArticleFilterBar.test.tsx`

Expected: FAIL — module `@/components/ArticleFilterBar` does not exist.

- [ ] **Step 3: Implement ArticleFilterBar**

Create `components/ArticleFilterBar.tsx`:

```tsx
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export type FilterType = 'all' | 'blog' | 'article';

interface Item {
  id: FilterType;
  testId: string;
  labelKey: 'all' | 'blogs' | 'articles';
  href: (locale: string) => string;
}

const ITEMS: Item[] = [
  { id: 'all', testId: 'filter-all', labelKey: 'all', href: (l) => `/${l}/articles` },
  {
    id: 'blog',
    testId: 'filter-blogs',
    labelKey: 'blogs',
    href: (l) => `/${l}/articles?type=blog`,
  },
  {
    id: 'article',
    testId: 'filter-articles',
    labelKey: 'articles',
    href: (l) => `/${l}/articles?type=article`,
  },
];

export function ArticleFilterBar({
  currentType,
  locale,
}: {
  currentType: FilterType;
  locale: string;
}) {
  const t = useTranslations('articles.filter');

  return (
    <nav
      aria-label="article filter"
      className="text-text-muted mt-12 mb-12 font-mono text-sm tracking-[0.1em]"
    >
      <span aria-hidden="true">[ </span>
      {ITEMS.map((item, idx) => {
        const active = item.id === currentType;
        const className = active ? 'text-accent-green' : 'text-text-muted hover:text-text-primary';
        return (
          <span key={item.id}>
            <Link
              href={item.href(locale)}
              data-testid={item.testId}
              className={className}
              {...(active ? { 'aria-current': 'page' as const } : {})}
            >
              {t(item.labelKey)}
            </Link>
            {idx < ITEMS.length - 1 && <span aria-hidden="true"> | </span>}
          </span>
        );
      })}
      <span aria-hidden="true"> ]</span>
    </nav>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test -- tests/components/ArticleFilterBar.test.tsx`

Expected: PASS — all six assertions green.

- [ ] **Step 5: Commit**

```bash
git add components/ArticleFilterBar.tsx tests/components/ArticleFilterBar.test.tsx
git commit -m "feat(articles): add ArticleFilterBar component"
```

---

## Task 7: Articles page — drop blogs, add filter

**Files:**

- Create: `tests/app/articles-page.test.tsx`
- Modify: `app/[locale]/articles/page.tsx`

Tests cover the filter behaviour at the page level (search-param parsing + filtered grid). The page becomes server-side filtered with the new filter bar.

- [ ] **Step 1: Write the failing tests**

Create `tests/app/articles-page.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import path from 'node:path';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import messagesEn from '@/messages/en.json';
import type { Article } from '@/lib/articles';
import { getArticles } from '@/lib/articles';
import ArticlesPage from '@/app/[locale]/articles/page';

vi.mock('next-intl/server', () => ({
  setRequestLocale: vi.fn(),
  getTranslations: async (ns: string) => {
    const root = messagesEn as unknown as Record<string, unknown>;
    const branch = (ns ? (root[ns] as Record<string, unknown>) : root) ?? {};
    return (key: string) => {
      const segments = key.split('.');
      let cur: unknown = branch;
      for (const seg of segments) {
        if (cur && typeof cur === 'object') cur = (cur as Record<string, unknown>)[seg];
        else return key;
      }
      return typeof cur === 'string' ? cur : key;
    };
  },
}));

vi.mock('@/lib/articles', async () => {
  const actual = await vi.importActual<typeof import('@/lib/articles')>('@/lib/articles');
  return {
    ...actual,
    getArticles: vi.fn(),
  };
});

const sample: Article[] = [
  {
    slug: '2026-05-12-blog-one',
    titleNl: 'blog NL',
    titleEn: 'blog EN',
    url: 'https://example.com/blog',
    sourceUrl: undefined,
    type: 'blog',
    date: '2026-05-12',
    summaryNl: 'NL b',
    summaryEn: 'EN b',
    image: '/qas-icon.svg',
  },
  {
    slug: '2026-05-10-article-one',
    titleNl: 'artikel NL',
    titleEn: 'article EN',
    url: 'https://example.com/article',
    sourceUrl: 'https://example.com/article',
    type: 'article',
    date: '2026-05-10',
    summaryNl: 'NL a',
    summaryEn: 'EN a',
    image: '/qas-icon.svg',
  },
];

async function renderPage(searchParams: Record<string, string> = {}) {
  vi.mocked(getArticles).mockReturnValue(sample);
  const ui = await ArticlesPage({
    params: Promise.resolve({ locale: 'en' as const }),
    searchParams: Promise.resolve(searchParams),
  });
  return render(
    <NextIntlClientProvider locale="en" messages={messagesEn}>
      {ui}
    </NextIntlClientProvider>,
  );
}

describe('ArticlesPage', () => {
  it('renders both cards when no type param is set', async () => {
    await renderPage();
    expect(screen.getByTestId('article-card-2026-05-12-blog-one')).toBeInTheDocument();
    expect(screen.getByTestId('article-card-2026-05-10-article-one')).toBeInTheDocument();
  });

  it('shows only blog cards when ?type=blog', async () => {
    await renderPage({ type: 'blog' });
    expect(screen.getByTestId('article-card-2026-05-12-blog-one')).toBeInTheDocument();
    expect(screen.queryByTestId('article-card-2026-05-10-article-one')).toBeNull();
  });

  it('shows only article cards when ?type=article', async () => {
    await renderPage({ type: 'article' });
    expect(screen.queryByTestId('article-card-2026-05-12-blog-one')).toBeNull();
    expect(screen.getByTestId('article-card-2026-05-10-article-one')).toBeInTheDocument();
  });

  it('ignores unknown type values and shows everything', async () => {
    await renderPage({ type: 'podcast' });
    expect(screen.getByTestId('article-card-2026-05-12-blog-one')).toBeInTheDocument();
    expect(screen.getByTestId('article-card-2026-05-10-article-one')).toBeInTheDocument();
  });

  it('renders the empty state when filter yields nothing', async () => {
    vi.mocked(getArticles).mockReturnValue([
      { ...sample[1] }, // only an article
    ]);
    const ui = await ArticlesPage({
      params: Promise.resolve({ locale: 'en' as const }),
      searchParams: Promise.resolve({ type: 'blog' }),
    });
    render(
      <NextIntlClientProvider locale="en" messages={messagesEn}>
        {ui}
      </NextIntlClientProvider>,
    );
    expect(screen.getByText('no articles yet')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test -- tests/app/articles-page.test.tsx`

Expected: FAIL — page still imports `BlogCard` and `getBlogs`, and does not accept `searchParams`.

- [ ] **Step 3: Rewrite the page**

Replace `app/[locale]/articles/page.tsx` with:

```tsx
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { ArticleCard } from '@/components/ArticleCard';
import { ArticleFilterBar, type FilterType } from '@/components/ArticleFilterBar';
import { getArticles } from '@/lib/articles';
import type { Locale } from '@/i18n/routing';

function normaliseType(raw: string | undefined): FilterType {
  if (raw === 'blog' || raw === 'article') return raw;
  return 'all';
}

export default async function ArticlesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ type?: string }>;
}) {
  const { locale } = await params;
  const { type } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations('articles');
  const currentType = normaliseType(type);
  const all = getArticles();
  const visible = currentType === 'all' ? all : all.filter((a) => a.type === currentType);

  return (
    <main className="px-6 py-20">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-text-primary font-mono text-4xl">
          <span className="text-accent-green">&gt;</span> {t('title')}
        </h1>
        <p className="text-text-muted mt-6 max-w-2xl">{t('intro')}</p>
        <ArticleFilterBar currentType={currentType} locale={locale} />
        {visible.length === 0 ? (
          <p className="text-text-muted mt-12 font-mono text-sm">{t('emptyState')}</p>
        ) : (
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {visible.map((a) => (
              <ArticleCard key={a.slug} article={a} locale={locale} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test -- tests/app/articles-page.test.tsx`

Expected: PASS — all five page tests green.

- [ ] **Step 5: Run the full vitest suite to surface any breakage from the page rewrite**

Run: `pnpm test`

Expected: PASS for every test outside the `blogs` namespace (which still references the now-unused but still-existing `lib/blogs.ts`). If anything else fails, fix it before moving on.

- [ ] **Step 6: Commit**

```bash
git add app/[locale]/articles/page.tsx tests/app/articles-page.test.tsx
git commit -m "feat(articles): server-side filter by type and drop blogs section"
```

---

## Task 8: Delete the blog system

**Files:**

- Delete: `lib/blogs.ts`
- Delete: `components/BlogCard.tsx`
- Delete: `blogs/` (incl. `.gitkeep`)
- Delete: `tests/lib/blogs.test.ts`
- Delete: `tests/components/BlogCard.test.tsx`
- Delete: `tests/lib/fixtures/blogs-*/`
- Modify: `messages/en.json` (remove `blogs` block)
- Modify: `messages/nl.json` (remove `blogs` block)

At this point nothing imports `lib/blogs.ts`, `components/BlogCard.tsx`, or the `blogs` translation namespace.

- [ ] **Step 1: Sanity check there are no remaining imports**

Run: `grep -rn 'lib/blogs\|BlogCard\|getBlogs' app components lib tests e2e scripts 2>/dev/null`

Expected output: empty (no matches).

If any match remains, stop and fix the leftover reference before deleting.

- [ ] **Step 2: Delete the blog source files**

```bash
rm -rf lib/blogs.ts components/BlogCard.tsx blogs
rm -f tests/lib/blogs.test.ts tests/components/BlogCard.test.tsx
rm -rf tests/lib/fixtures/blogs-author-mismatch \
  tests/lib/fixtures/blogs-date-mismatch \
  tests/lib/fixtures/blogs-empty \
  tests/lib/fixtures/blogs-image-mismatch \
  tests/lib/fixtures/blogs-missing-field \
  tests/lib/fixtures/blogs-missing-locale \
  tests/lib/fixtures/blogs-no-frontmatter \
  tests/lib/fixtures/blogs-tags-mismatch \
  tests/lib/fixtures/blogs-valid
```

- [ ] **Step 3: Remove the EN `blogs` translation block**

In `messages/en.json`, locate:

```json
  "blogs": {
    "title": "blogs",
    "intro": "Blogs written by us for you",
    "emptyState": "No blogs yet",
    "readMore": "read post",
    "backLink": "← back to articles"
  },
```

Delete that entire block (including its trailing comma — verify the previous `articles` block still ends with a comma and the following `contact` block is correctly preceded by one).

- [ ] **Step 4: Remove the NL `blogs` translation block**

In `messages/nl.json`, locate:

```json
  "blogs": {
    "title": "blogs",
    "intro": "Blog posts geschreven door ons voor jou",
    "emptyState": "Nog geen blogs",
    "readMore": "lees post",
    "backLink": "← terug naar artikelen"
  },
```

Delete that entire block, preserving surrounding commas.

- [ ] **Step 5: Run typecheck, parity, and tests**

Run each:

```bash
pnpm typecheck
pnpm verify:i18n
pnpm test
```

Expected: all three pass. Typecheck would fail if anything still imports the deleted modules; parity would fail if the two blocks didn't get removed symmetrically.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor: remove the blog system (collapsed into articles)"
```

---

## Task 9: E2E filter flow

**Files:**

- Modify: `e2e/pages/articles-page.ts`
- Modify: `e2e/articles.spec.ts`

- [ ] **Step 1: Extend the page object**

Replace `e2e/pages/articles-page.ts` with:

```typescript
import { type Page, type Locator } from '@playwright/test';
import { type Locale } from './home-page';

const EMPTY_STATE: Record<Locale, string> = {
  nl: 'nog geen artikelen',
  en: 'no articles yet',
};

const READ_EXTERNAL: Record<Locale, string> = {
  nl: 'lees op externe site',
  en: 'read on external site',
};

export class ArticlesPage {
  readonly heading: Locator;
  readonly intro: Locator;
  readonly emptyState: Locator;
  readonly articleCards: Locator;
  readonly cardContainers: Locator;
  readonly cardImages: Locator;
  readonly readExternalLinks: Locator;
  readonly filterAll: Locator;
  readonly filterBlogs: Locator;
  readonly filterArticles: Locator;

  constructor(
    readonly page: Page,
    readonly locale: Locale,
  ) {
    this.heading = page.getByRole('heading', { level: 1 });
    this.intro = page.getByRole('main').locator('p').first();
    this.emptyState = page.getByText(EMPTY_STATE[locale]);
    this.articleCards = page.locator('[data-testid^="article-link-"]');
    this.cardContainers = page.locator('[data-testid^="article-card-"]');
    this.cardImages = page.locator('[data-testid^="article-card-"] img');
    this.readExternalLinks = page.getByText(READ_EXTERNAL[locale]);
    this.filterAll = page.getByTestId('filter-all');
    this.filterBlogs = page.getByTestId('filter-blogs');
    this.filterArticles = page.getByTestId('filter-articles');
  }

  async goto() {
    await this.page.goto(`/${this.locale}/articles`);
  }
}
```

- [ ] **Step 2: Add a filter spec**

Append at the end of `e2e/articles.spec.ts` (before the closing of the `for (const locale of locales)` loop — i.e. inside the loop, after the last existing test):

```typescript
test(`articles: ${locale} clicking blogs filter narrows the URL and grid`, async ({ page }) => {
  test.skip(!hasArticles, 'no articles in news/ — filter path not exercised');
  const articles = new ArticlesPage(page, locale);
  await articles.goto();
  const allCount = await articles.cardContainers.count();
  await articles.filterBlogs.click();
  await expect(page).toHaveURL(/\?type=blog$/);
  const blogCount = await articles.cardContainers.count();
  expect(blogCount).toBeLessThanOrEqual(allCount);
  await articles.filterAll.click();
  await expect(page).toHaveURL(new RegExp(`/${locale}/articles$`));
  await expect(articles.cardContainers).toHaveCount(allCount);
});
```

- [ ] **Step 3: Run the e2e spec locally to confirm it passes**

Run: `pnpm exec playwright test e2e/articles.spec.ts --project=chromium`

Expected: all articles specs pass, including the new filter test.

(If your local environment can't run Playwright, skip locally and rely on CI to validate.)

- [ ] **Step 4: Commit**

```bash
git add e2e/pages/articles-page.ts e2e/articles.spec.ts
git commit -m "test(e2e): cover article type filter"
```

---

## Task 10: Final verification

- [ ] **Step 1: Lint**

Run: `pnpm lint`

Expected: 0 errors.

- [ ] **Step 2: Typecheck**

Run: `pnpm typecheck`

Expected: 0 errors.

- [ ] **Step 3: i18n parity**

Run: `pnpm verify:i18n`

Expected: `i18n integrity OK`.

- [ ] **Step 4: Unit tests + coverage**

Run: `pnpm test -- --coverage`

Expected: all green.

- [ ] **Step 5: Production build**

Run: `pnpm build`

Expected: build succeeds, `/[locale]/articles` route present, no broken-import warnings.

- [ ] **Step 6: Manual smoke**

Run: `pnpm dev`

Visit, in a browser:

- `http://localhost:3000/en/articles` — full list, badge visible on each card (existing articles show `article` orange).
- `http://localhost:3000/en/articles?type=blog` — empty state visible (no blog entries yet; once one is added it will appear here).
- `http://localhost:3000/en/articles?type=article` — full list.
- `http://localhost:3000/nl/articles` — same, NL labels (`alle | blogs | artikelen`, badge `artikel`).
- `http://localhost:3000/en/articles?type=foo` — full list (junk type is ignored).

Confirm filter active item is `accent-green`, inactive items are muted, hover restores `text-primary`.

Stop the dev server when done.

---

## Out of scope (per spec)

- Updating the `blog-creator` skill — flagged as a follow-up. New blog entries are added by writing `news/<slug>.md` with `type: 'blog'`, following the existing `new-article` flow.
- Tag-based filtering / multi-axis filtering.
- Per-type sort orders (always date desc).
- Pagination.
- SEO redirects from the deleted detail route (no external links existed).
