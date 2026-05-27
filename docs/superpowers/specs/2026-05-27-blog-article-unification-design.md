# Blog/article unification — design

Status: draft, awaiting implementation plan.
Owner: jorick.
Date: 2026-05-27.
Branch: `blogs-as-external-links`.

## Purpose

Collapse the separate "blogs" system into the existing articles system. Every entry under `/[locale]/articles` is now one of two kinds — a curated external `article` (third-party site, scraped og-image) or an authored `blog` (link out to an external blog URL we control). A `type` field on each entry drives a visible corner badge on the card and a filter bar on the index page. The dual schema and the on-site blog detail page are gone.

Background: the blog system was originally introduced to host on-site posts. It evolved into a redirect-only model (markdown without bodies, internal route, then external link). Maintaining two schemas, two card components, two fixture sets, and a defunct detail route is no longer justified. Unifying into a single articles index removes that drift while preserving the distinction visually.

## Decisions (locked)

| #   | Decision             | Choice                                                                                                          |
| --- | -------------------- | --------------------------------------------------------------------------------------------------------------- |
| 1   | Single source        | `news/*.md` (one file per entry). No `blogs/` directory.                                                        |
| 2   | Discriminator field  | `type: 'blog' \| 'article'` in frontmatter. **Defaults to `'article'`** when absent — only blog entries set it. |
| 3   | source_url           | Optional. Articles set it (used by og-image scraper). Blogs omit it (no scrape).                                |
| 4   | image                | Optional, existing fallback `/qas-icon.svg` retained.                                                           |
| 5   | Card badge placement | Floating corner tag, top-left over the image area.                                                              |
| 6   | Badge colors         | `accent-green` for blog, `accent-orange` for article. Backdrop `bg-base` at 85% alpha. All existing tokens.     |
| 7   | List behaviour       | Single filterable list, sorted by date desc.                                                                    |
| 8   | Filter bar style     | Bracketed mono: `[ all \| blogs \| articles ]`. Active item = `accent-green`, pipes = `border-subtle`.          |
| 9   | Filter state         | URL query param `?type=blog` / `?type=article`. Absent or any other value → all.                                |
| 10  | Filter rendering     | Server component reads `searchParams`, filters server-side. Filter bar = small client component for the link.   |
| 11  | Detail page          | Removed. No on-site detail route for either kind.                                                               |
| 12  | Sitemap              | Unchanged — only `/[locale]/articles` (no filter variants).                                                     |

## Architecture

### Data layer

`lib/articles.ts` is the single source. Schema diff:

```diff
 const frontmatterSchema = z.object({
   title_nl: z.string().min(1),
   title_en: z.string().min(1),
   url: z.string().regex(/^https?:\/\//, 'url must start with http(s)://'),
-  source_url: z.string().regex(/^https?:\/\//, 'source_url must start with http(s)://'),
+  source_url: z
+    .string()
+    .regex(/^https?:\/\//, 'source_url must start with http(s)://')
+    .optional(),
+  type: z.enum(['blog', 'article']).default('article'),
   date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD'),
   summary_nl: z.string().min(1),
   summary_en: z.string().min(1),
   image: z.string().optional(),
   tags: z.array(z.string()).optional(),
   author: z.string().optional(),
 });
```

`Article` interface gains `type: 'blog' | 'article'`. `sourceUrl` becomes `string | undefined`.

`getArticles()` continues to sort by date desc. No new public functions.

`lib/blogs.ts` is deleted in full.

### Route

`app/[locale]/articles/page.tsx`:

- Stays an async server component.
- Accepts `searchParams: Promise<{ type?: string }>`.
- Awaits both `params` and `searchParams`.
- Validates `type` against `'blog' | 'article'`. Anything else (including `'all'`, missing, or junk) → `currentType = 'all'`.
- Calls `getArticles()` once, filters in-process:
  - `currentType === 'all'` → all items.
  - otherwise → `items.filter(a => a.type === currentType)`.
- Renders `<h1>articles</h1>`, intro paragraph, `<ArticleFilterBar currentType={...} locale={...} />`, then the grid. No "blogs" heading anywhere on the page.
- Empty filtered result → renders `articles.emptyState` translation (`no articles yet` / `nog geen artikelen`). Same key currently used for the empty articles state.

### Filter bar component

New file `components/ArticleFilterBar.tsx`. Server component (no interactivity beyond `<Link>`, no hooks).

Renders bracketed mono row:

```
[ all | blogs | articles ]
```

- Three `<Link>` elements from `next/link`.
- `all` → `/${locale}/articles`.
- `blogs` → `/${locale}/articles?type=blog`.
- `articles` → `/${locale}/articles?type=article`.
- Active item: `text-accent-green`, plus `aria-current="page"`.
- Inactive items: `text-text-muted hover:text-text-primary`.
- Pipes (`|`) and brackets (`[`, `]`): `text-text-muted` (non-interactive spans).
- Container: `mt-12 mb-12 font-mono text-sm tracking-[0.1em]`.
- Item labels come from `articles.filter.{all,blogs,articles}` translations (lowercase).

`aria-current="page"` on the active item satisfies a11y; the green color is not the only signal.

### Card

`components/ArticleCard.tsx` gains a corner badge inside the image container, top-left:

```tsx
<div className="bg-bg-base/85 border-accent-green text-accent-green absolute top-3 left-3 rounded-sm border px-2.5 py-1 font-mono text-[10px] tracking-[0.2em] uppercase backdrop-blur-sm">
  {t(`type.${article.type}`)}
</div>
```

Color class switches on `article.type`:

- `blog` → `border-accent-green text-accent-green`
- `article` → `border-accent-orange text-accent-orange`

Translations:

- `articles.type.blog` → `blog` / `blog`
- `articles.type.article` → `article` / `artikel`

No other changes to card layout. Card link target is still `article.url` (external `<a target="_blank" rel="noopener noreferrer">`).

### og-image scraper

`scripts/fetch-article-images.ts`:

- If an article has no `source_url`, skip it entirely — no scrape, no fallback overwrite, no console error. Reason logged: `skipped: no source_url (blog)`.
- Articles with `source_url` behave exactly as today.

### News fixtures and current data

Existing `news/*.md` files are **not** modified — they already match the default (`type: 'article'`). New blog entries set `type: 'blog'` explicitly.

## Files

**Delete:**

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

**Modify:**

- `lib/articles.ts` — schema diff above.
- `components/ArticleCard.tsx` — add corner badge.
- `app/[locale]/articles/page.tsx` — drop blogs section, accept searchParams, filter, render filter bar.
- `messages/en.json` — remove `blogs` block, add `articles.filter.{all,blogs,articles}` and `articles.type.{blog,article}`.
- `messages/nl.json` — same.
- `scripts/fetch-article-images.ts` — skip entries without `source_url`.
- `tests/lib/articles.test.ts` — assertions for `type` default, explicit `type: 'blog'`, optional `source_url`, invalid `type` value rejected.
- `tests/components/ArticleCard.test.tsx` — add badge assertions per type and per locale.
- `tests/scripts/fetch-article-images.test.ts` — adjust: missing source_url now skips, not errors.

Existing `news/*.md` and `tests/lib/fixtures/news-*/*.md` files are **not** modified — default `type: 'article'` covers them. Only `tests/lib/fixtures/news-missing-source-url/` is removed (source_url is no longer required, so the fixture no longer exercises an error path).

**Add:**

- `components/ArticleFilterBar.tsx`
- `tests/components/ArticleFilterBar.test.tsx` — covers active state per `currentType`, hrefs, label text.
- `tests/lib/fixtures/news-bad-type/2026-05-12-bad.md` — invalid `type` value (`'podcast'`), used by a new "rejects invalid type" test.
- `tests/lib/fixtures/news-blog/2026-05-12-blog.md` — `type: 'blog'`, no source_url, no image. Used to test the blog code path.

## Testing

### Unit (vitest)

**`lib/articles`:**

- existing fixtures still pass unchanged (no `type` field, defaults to `'article'`).
- `type` defaults to `'article'` when absent → `getArticles()[i].type === 'article'`.
- `type: 'blog'` round-trips correctly (`news-blog/` fixture).
- `type` rejects non-enum value (`'podcast'`) → throws on schema parse.
- `source_url` optional → entry parses with field absent.
- `Article.type` is correctly mapped from frontmatter.

**`ArticleCard`:**

- renders badge with `blog` label when `article.type === 'blog'`, in current locale.
- renders badge with `article`/`artikel` label when `article.type === 'article'`, per locale.
- badge has `accent-green` color class for blog, `accent-orange` for article.
- existing locale, title, summary, link assertions still pass.

**`ArticleFilterBar`:**

- 3 links rendered with correct hrefs.
- active item has `text-accent-green` class + `aria-current="page"` when `currentType` matches.
- `currentType="all"` → "all" is active.

**Articles page (component test):**

- `?type=blog` → only blog items in grid.
- `?type=article` → only article items.
- `?type=foo` → all items (no throw).
- absent type → all items.
- empty filtered set → renders `articles.emptyState`.

### E2E (playwright)

Light addition to existing articles spec:

- click `blogs` filter pill → URL gains `?type=blog`, grid count matches blog count.
- click `all` → URL drops query, full grid restored.

### A11y (axe)

- Filter bar keyboard-reachable.
- `aria-current="page"` on active filter item.
- Existing axe sweep for `/articles` still passes.

### Locale parity

Existing CI parity check covers the new translation keys automatically.

## Out of scope

- Tag-based filtering / multi-axis filtering (only `type` for now).
- Per-type sort orders (always date desc).
- Pagination (count is small).
- Updating the `blog-creator` skill — out of scope here. New blog entries are added by writing `news/<slug>.md` with `type: 'blog'`, following the existing `new-article` flow. Skill update is a follow-up.

## Risks / open items

- **`blog-creator` skill becomes stale.** It still emits the two-file blog schema. Users who invoke it after this change get a broken entry. Mitigation: skill update is the natural follow-up; track it but do not block on it.
- **og-image scraper regression.** Existing articles all have `source_url` so behaviour is unchanged in practice. Test for "missing source_url" needs to flip from "errors" to "skips".
- **SEO loss on deleted detail route.** Detail route was already removed earlier on this branch (commit history under `blogs-as-external-links`). No external links existed because blogs were never published with on-site bodies. No redirect needed.
