# `/[locale]/articles` page — images (v2)

Status: draft, awaiting implementation plan.
Owner: jorick.
Date: 2026-05-26.

Extends: [`2026-05-20-articles-page-design.md`](./2026-05-20-articles-page-design.md). All v1 decisions remain locked. This spec adds the image layer only.

## Purpose

Make article cards visually distinct by including a real image sourced from each article's og:image. Adds editorial weight without decorative noise. QAS brand logo (`/public/qas-icon.svg`) serves as fallback so the layout never shows a broken-image state.

## Decisions (locked)

| #   | Decision             | Choice                                                                                 |
| --- | -------------------- | -------------------------------------------------------------------------------------- |
| 10  | Layout               | Single-column horizontal cards (image-left ~38%, text-right ~62%); max-w-2xl preserved |
| 11  | Image source         | Build-time fetch of `og:image` from each article's source URL                          |
| 12  | Image fallback       | `/qas-icon.svg` (1080×1080 brand asset in `/public/`); no broken-image state possible  |
| 13  | Image override       | Optional `image` frontmatter field (path under `/public/news/`) takes priority         |
| 14  | New required field   | `source_url` added to frontmatter schema (the URL that is scraped for og:image)        |
| 15  | Image alt text       | Resolved at data layer: `imageAlt` field defaults to article title in render locale    |
| 16  | Cache strategy       | ETag/Last-Modified keyed per `source_url` in `public/news/.cache.json`                 |
| 17  | Build failure policy | Fetch/parse failure prints warning and uses fallback; build does NOT fail              |
| 18  | Grid change          | v1 `md:grid-cols-2` removed; replaced by single-column flex stack                      |
| 19  | Border hover         | Card `border-border-subtle` → `border-accent-blue` on hover (0.15s transition)         |

## Architecture

### 1. Frontmatter schema (`lib/articles.ts`)

Add `source_url` as a required field. `image` remains optional (manual override).

```ts
const frontmatterSchema = z.object({
  title_nl: z.string().min(1),
  title_en: z.string().min(1),
  url: z.string().regex(/^https?:\/\//),
  source_url: z.string().regex(/^https?:\/\//), // NEW — required
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  summary_nl: z.string().min(1),
  summary_en: z.string().min(1),
  image: z.string().optional(), // manual override path
  tags: z.array(z.string()).optional(),
  author: z.string().optional(),
});
```

### 2. `Article` interface (`lib/articles.ts`)

`image` becomes a guaranteed resolved string (never `undefined` at render time). New `imageAlt` field.

```ts
export interface Article {
  slug: string;
  titleNl: string;
  titleEn: string;
  url: string;
  sourceUrl: string; // NEW
  date: string;
  summaryNl: string;
  summaryEn: string;
  image: string; // CHANGED: was optional, now always resolved
  imageAlt: string; // NEW: title in primary locale (nl), falls back to en
  tags?: string[];
  author?: string;
}
```

Resolution order for `image`:

1. Frontmatter `image` field present → use as-is (path under `/public/`).
2. Cached file for this `source_url` in `public/news/<slug>.<ext>` → use that path.
3. Neither found → `/qas-icon.svg`.

`imageAlt` is always `titleNl` (non-empty by schema). The component passes it directly to `<Image alt={article.imageAlt} />`.

### 3. Build-time image fetch script (`scripts/fetch-article-images.ts`)

New Node script, TypeScript, executed via `pnpm tsx scripts/fetch-article-images.ts`.

Responsibilities:

- For each article file in `news/*.md`:
  1. Parse frontmatter, extract `source_url` and `slug`.
  2. Skip if frontmatter `image` is set (manual override, no fetch needed).
  3. Read `public/news/.cache.json`. If entry for `source_url` exists and local file still present, skip unless ETag/Last-Modified changed.
  4. Fetch `source_url` with `HEAD` first to read ETag/Last-Modified. If nothing changed, skip.
  5. Fetch page with `GET`. Parse `<meta property="og:image" content="..." />` from HTML body.
  6. If og:image URL found, download image to `public/news/<slug>.<ext>` (extension from URL or Content-Type).
  7. Update `.cache.json` entry `{ source_url, etag, lastModified, localPath }`.
  8. On any fetch/parse/write error: print `[warn] <slug>: <reason>` to stderr. Do not throw. Do not write that entry to cache. `getArticles()` will resolve fallback.
- Script creates `public/news/` if it does not exist (first run).
- Cache file `public/news/.cache.json` committed to repo so CI does not re-fetch unchanged articles.
- Script is called in `package.json` `prebuild` hook: `"prebuild": "tsx scripts/fetch-article-images.ts"`.

Dependencies needed: `tsx ^4.21.0` (already in `devDependencies`), no new prod deps. Uses native `fetch` (Node 18+). Script goes in existing `scripts/` directory alongside `metrics.ts` and `verify-i18n.ts`.

### 4. Component (`components/ArticleCard.tsx`)

Horizontal flex layout. Image pane left (~38%), body right.

```tsx
<article className="border-border-subtle bg-bg-elevated flex rounded-sm border transition-colors duration-150 hover:border-accent-blue overflow-hidden">
  {/* Image pane */}
  <div className="relative flex-[0_0_38%] border-r border-border-subtle bg-bg-base">
    <Image
      src={article.image}
      alt={article.imageAlt}
      width={400}
      height={225}
      className={`h-full w-full ${isFallback ? 'object-contain p-6' : 'object-cover'}`}
      loading="lazy"
    />
  </div>

  {/* Body */}
  <div className="flex flex-1 flex-col p-6">
    <p className="text-text-muted font-mono text-xs tracking-[0.2em] uppercase">{article.date}</p>
    <h3 className="text-text-primary mt-3 font-mono text-lg">
      <span className="text-accent-green">&gt;</span> {title}
    </h3>
    <p className="text-text-muted mt-3 flex-1 text-sm">{summary}</p>
    <a href={article.url} target="_blank" rel="noopener noreferrer" ... className="text-accent-blue mt-6 font-mono text-sm hover:underline">
      → {t('readExternal')}
    </a>
  </div>
</article>
```

QAS fallback detection: `article.image === '/qas-icon.svg'` → apply `object-contain p-6` to centre the square logo; otherwise `object-cover`.

`next/image` requires the domain of fetched images to be listed in `next.config.ts` `images.remotePatterns` if served from an external URL — but all fetched images are saved locally to `public/news/`, so they are served as `/news/<slug>.<ext>`. No remote pattern needed.

### 5. Page (`app/[locale]/articles/page.tsx`)

Change grid to single-column:

```tsx
// before
<div className="mt-12 grid gap-6 md:grid-cols-2">

// after
<div className="mt-12 flex flex-col gap-6">
```

No other changes to the page file.

### 6. `next.config.ts` — image domains

All resolved images are local paths (`/news/...` or `/qas-icon.svg`). No `remotePatterns` entry needed.

## Data flow

```
news/2026-05-13-foo.md  (source_url: https://example.com/post)
        │
        ▼
scripts/fetch-article-images.ts  (prebuild)
  ├─ HEAD example.com/post → ETag unchanged? skip
  ├─ GET example.com/post → parse og:image URL
  ├─ download → public/news/2026-05-13-foo.jpg
  └─ update public/news/.cache.json
        │
        ▼
lib/articles.ts::getArticles()
  ├─ read frontmatter (source_url, image override)
  ├─ resolve image: override → cached file → /qas-icon.svg
  └─ Article { image: "/news/2026-05-13-foo.jpg", imageAlt: "Foo title" }
        │
        ▼
app/[locale]/articles/page.tsx
        │
        ▼
<ArticleCard article={...} locale={...} />
  └─ <Image src="/news/2026-05-13-foo.jpg" alt="Foo title" ... />
        │
        ▼
  click → external href (target=_blank)
```

## Error handling additions (extends v1)

| Scenario                              | Behaviour                                                      |
| ------------------------------------- | -------------------------------------------------------------- |
| `source_url` missing from frontmatter | Zod throws at build; CI catches it on PR                       |
| Fetch of `source_url` fails (network) | Warning printed; `/qas-icon.svg` fallback used                 |
| og:image not found in HTML            | Warning printed; `/qas-icon.svg` fallback used                 |
| Image download fails                  | Warning printed; `/qas-icon.svg` fallback used                 |
| `public/news/.cache.json` malformed   | Script treats cache as empty, re-fetches all; overwrites cache |
| Local cached file deleted manually    | Script re-fetches on next prebuild run                         |

## Testing scope

- **`lib/articles.test.ts`** (extend existing): assert `source_url` required; assert `image` resolves to cached path when present; assert fallback to `/qas-icon.svg` when no cache entry and no override.
- **`scripts/fetch-article-images.test.ts`** (new): mock `fetch`; assert og:image parsed from HTML; assert no-op when ETag unchanged; assert warning on fetch failure; assert cache written correctly.
- **`e2e/articles.spec.ts`** (extend existing): assert `<img>` present in each card; assert `alt` attribute set; assert card border becomes `accent-blue` on hover; assert external link still works.

## Design constraints satisfied

- No shadows, no gradients on card itself. ✓
- No nested cards. ✓
- `accent-green` used only on `>` glyph (< 10% of pixels). ✓
- `>` glyph on title preserved. ✓
- `→` link preserved. ✓
- `max-w-2xl` reading width preserved (page constraint, not card constraint). ✓
- `rounded-sm` only. ✓

## Out of scope

- Serving images from a CDN. Local `public/` is sufficient at current traffic.
- Generating per-article Open Graph images for the `/articles` index. Static OG image covers the page.
- On-site article detail pages. Still v1 decision #3.
- Animated or hover-zoom effects on the card image.
