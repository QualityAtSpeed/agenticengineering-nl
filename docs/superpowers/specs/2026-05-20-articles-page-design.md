# `/[locale]/articles` page — design

Status: draft, awaiting implementation plan.
Owner: jorick.
Date: 2026-05-20.

## Purpose

Add a public-facing index page at `/[locale]/articles` that lists external articles ("news items") authored or curated by the operator. Each item is a link out to a third-party site (LinkedIn, dev.to, conference page, etc.) with a short summary. Goal: build trust by showing the operator publishes and reads in the field, without locking the site into hosting full blog posts. Future blog posts (rendered on-site) are out of scope here, but the route name `/articles` is chosen to accommodate them later.

## Decisions (locked)

| #   | Decision           | Choice                                                                                                                                   |
| --- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Route              | `/[locale]/articles`                                                                                                                     |
| 2   | Content source     | `news/*.md` at repo root, frontmatter-only markdown (written by the `new-article` skill)                                                 |
| 3   | Click target       | External URL from frontmatter; index links out, no on-site detail pages                                                                  |
| 4   | NL/EN parity       | Single file per article with both `summary_nl` and `summary_en` in frontmatter — covered by the existing `new-article` skill             |
| 5   | Categories / tags  | Out of scope for v1. Optional `tags` field accepted on the schema but unused on render                                                   |
| 6   | Layout             | Two-column card grid (mirrors existing `TrainingCard` pattern)                                                                           |
| 7   | Frontmatter parser | `js-yaml` npm dependency (server-side only). Frontmatter block extracted with a small regex; YAML body passed to `yaml.load`             |
| 8   | Empty state        | Render page with `// no articles yet` muted line; nav link stays live                                                                    |
| 9   | Caching            | Standard Next static generation. `news/*.md` read at `next build`. New articles require a redeploy via the `new-article` skill's PR flow |

## Architecture

### Route

- File: `app/[locale]/articles/page.tsx`.
- Shape mirrors `app/[locale]/about/page.tsx`:
  - Async server component.
  - `params: Promise<{ locale: Locale }>`.
  - Calls `setRequestLocale(locale)` and `getTranslations('articles')`.
- No client components needed. Cards are static markup.

### Data layer

- New module: `lib/articles.ts`.
- Public API:

  ```ts
  export interface Article {
    slug: string; // filename without .md
    title: string;
    url: string; // external, validated http(s)
    date: string; // YYYY-MM-DD
    summaryNl: string;
    summaryEn: string;
    image?: string;
    tags?: string[];
    author?: string;
  }

  export function getArticles(): Article[];
  ```

- Behaviour:
  - Resolves `news/` relative to `process.cwd()` (repo root at build time).
  - If `news/` does not exist or contains no `*.md` files: returns `[]`.
  - For each `*.md`:
    1. Read with `fs.readFileSync(path, 'utf8')`.
    2. Extract frontmatter block. The `new-article` skill writes frontmatter-only files with leading `---` and trailing `---\n`. Match: `^---\n([\s\S]*?)\n---\s*$`. If the match fails, throw with the filename.
    3. Parse the captured YAML body with `yaml.load(captured)` from `js-yaml`. The result is an unknown JS object.
    4. Validate with a `zod` schema (already a project dep). Required: `title` (string), `url` (string matching `/^https?:\/\//`), `date` (string matching `/^\d{4}-\d{2}-\d{2}$/`), `summary_nl` (string), `summary_en` (string). Optional: `image` (string), `tags` (`string[]`), `author` (string).
    5. Map snake_case frontmatter keys (`summary_nl`, `summary_en`) to camelCase TS fields (`summaryNl`, `summaryEn`). `slug` is derived from the filename (basename without `.md`).
  - Sort by `date` descending (newest first).
- File is server-only (uses `fs`). Never imported into a client component.

### Component

- New file: `components/ArticleCard.tsx`.
- Props: `{ article: Article; locale: Locale }`.
- Markup (same shape as `TrainingCard`):
  - Outer: `<article>` with `bg-bg-elevated border-border-subtle rounded-sm border p-6`.
  - Top label line: `<div class="text-text-muted font-mono text-xs">// {date}</div>`.
  - Title: `<h3 class="font-mono text-lg">` containing `<span class="text-accent-green">&gt;</span> {title}`.
  - Body: `<p class="text-text-muted mt-3 text-sm">{locale === 'nl' ? summaryNl : summaryEn}</p>`.
  - Footer link: `<a href={url} target="_blank" rel="noopener noreferrer" class="text-accent-blue mt-4 inline-flex font-mono text-sm hover:underline">→ {t('readExternal')}</a>`.
- Optional `image`, `tags`, `author` ignored in v1. Spec documents this so future work can reintroduce them without renaming fields.

### Page composition

```
<main>
  <JsonLd ... />                          // Blog + BlogPosting[]
  <section class="px-6 py-20">
    <div class="mx-auto max-w-5xl">
      <h1 ...>&gt; {t('title')}</h1>
      <p class="text-text-muted mt-6 max-w-2xl">{t('intro')}</p>

      // when articles.length === 0:
      <p class="text-text-muted mt-10 font-mono text-sm">// {t('emptyState')}</p>

      // when articles.length > 0:
      <div class="mt-10 grid gap-6 md:grid-cols-2">
        {articles.map(a => <ArticleCard article={a} locale={locale} />)}
      </div>
    </div>
  </section>
</main>
```

### i18n strings

Add an `articles` namespace to `messages/en.json` and `messages/nl.json`:

```json
"articles": {
  "title": "articles" / "artikelen",
  "intro": "...short blurb...",
  "readExternal": "read on external site ↗" / "lees op externe site ↗",
  "emptyState": "no articles yet" / "nog geen artikelen"
}
```

Extend the existing `nav` namespace with `nav.articles` so the new nav link picks up its label from translations:

```json
"nav": {
  ...,
  "articles": "articles" / "artikelen"
}
```

Parity is enforced automatically by `scripts/verify-i18n.ts`.

### Navigation

- `components/Nav.tsx`: insert `<Link href={\`/${locale}/articles\`}>{t('articles')}</Link>`between`Over ons`and`Contact`.
- `components/MobileMenu.tsx`: same insertion in the mobile menu list.

### Sitemap

- `app/sitemap.ts`: append `/articles` for each locale (`/nl/articles`, `/en/articles`). External URLs of individual articles are not listed (they belong to other origins).

### `news/` directory

- Create `news/.gitkeep` so the directory exists before any article is published. Without it, `getArticles()` returns `[]` gracefully but the skill's `Write` to `news/<file>.md` would otherwise create the dir on first run with no review.

### Dependency

- `pnpm add js-yaml` plus `pnpm add -D @types/js-yaml`.
- Server-side only — imported only from `lib/articles.ts`. No client bundle impact.

## Data flow

```
news/2026-05-12-foo.md
        │
        ▼
fs.readFileSync ──▶ regex extracts frontmatter block ──▶ yaml.load
                                                            │
                                                            ▼
                                                       zod.parse
                                                            │
                                                            ▼
                                                       Article[]
                                                            │
                                                            ▼
                                              getArticles() (sorted desc)
                                                            │
                                                            ▼
                                              app/[locale]/articles/page.tsx
                                                            │
                                                            ▼
                                  <ArticleCard article={...} locale={...} />
                                                            │
                                                            ▼
                                       click → external href (target=_blank)
```

## Error handling

- **Missing `news/` directory**: return `[]`, render empty state.
- **`news/` exists but contains no `*.md`**: return `[]`, render empty state.
- **Frontmatter block missing or malformed delimiters**: throw with filename. Build fails. CI catches it on PR.
- **YAML parse error (`yaml.load` throws)**: bubble with filename context.
- **Schema validation failure (missing required field, bad URL, bad date)**: `zod` throws with field path and filename. Build fails. CI catches it on PR.
- **Duplicate slugs**: not possible — slugs are filenames and the filesystem rejects duplicates.
- **Future-dated articles**: rendered as normal. The skill already prompts the user to confirm future dates.

## Testing scope (called out, not implemented in this spec)

- `e2e/articles.spec.ts` — Playwright smoke: page loads, `<h1>` contains `articles`/`artikelen`, card count matches `news/*.md` count, external links carry `rel="noopener noreferrer"` and `target="_blank"`.
- `e2e/a11y.spec.ts` — extend route list to include `/nl/articles` and `/en/articles`.
- `lib/articles.test.ts` — Vitest: fixture `news/` dir; assert sort order, schema rejection on missing required fields, schema rejection on bad URL, empty-dir behaviour, frontmatter-missing-delimiters rejection.

## Out of scope

- On-site detail pages (`/[locale]/articles/[slug]`). Decision #3.
- Category/tag chips, filtering, search. Decision #5.
- Pagination. Not warranted at expected post volumes.
- RSS / Atom feed. Add when there's a reader to serve.
- Open Graph image generation per article. Static OG image on the index is enough for v1.
- Hosted blog posts (full bodies). Different skill, different spec.

## Open questions

None at the time of writing. Resolve by adding to "Decisions" if any arise during implementation review.
