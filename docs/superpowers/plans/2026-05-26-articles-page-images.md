# Articles page images Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add og:image thumbnails to article cards — fetched at build time, cached locally, QAS logo fallback — with horizontal card layout (image-left ~38%).

**Architecture:** A prebuild script (`scripts/fetch-article-images.ts`) fetches og:image for each `news/*.md` article keyed by `source_url`, saves images to `public/news/`, and writes a cache manifest. `getArticles()` reads the manifest at build time to resolve each article's final image path. `ArticleCard` renders a horizontal flex card with `next/image`.

**Tech Stack:** Node 18 native fetch, tsx (already in devDeps), zod, next/image, Vitest, Playwright.

---

## File map

| Action | Path                                                                               | Responsibility                                                                |
| ------ | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Modify | `news/2026-05-13-microsoft-mdash-tops-anthropic-mythos-cybersecurity-benchmark.md` | Add `source_url`                                                              |
| Modify | `news/2026-05-13-two-weeks-after-context-is-the-new-code.md`                       | Add `source_url`                                                              |
| Modify | `news/2026-05-03-graphify-knowledge-graph-token-tax.md`                            | Add `source_url`                                                              |
| Modify | `tests/lib/fixtures/news-valid/2026-05-12-foo.md`                                  | Add `source_url`                                                              |
| Modify | `tests/lib/fixtures/news-valid/2026-04-28-bar.md`                                  | Add `source_url`                                                              |
| Modify | `tests/lib/fixtures/news-bad-url/2026-05-12-baduri.md`                             | Add `source_url`                                                              |
| Modify | `tests/lib/fixtures/news-missing-field/2026-05-12-missing.md`                      | Add `source_url` (summary_en stays absent)                                    |
| Create | `tests/lib/fixtures/news-missing-source-url/2026-05-12-no-source.md`               | Fixture missing `source_url`                                                  |
| Create | `tests/lib/fixtures/news-image-override/2026-05-12-override.md`                    | Fixture with `image` override field                                           |
| Modify | `lib/articles.ts`                                                                  | Add `source_url` to schema; `image: string` resolved; `imageAlt`; `sourceUrl` |
| Modify | `tests/lib/articles.test.ts`                                                       | New tests for schema + image resolution                                       |
| Create | `scripts/fetch-article-images.ts`                                                  | Build-time og:image fetch + cache                                             |
| Create | `tests/scripts/fetch-article-images.test.ts`                                       | Unit tests for fetch script                                                   |
| Modify | `components/ArticleCard.tsx`                                                       | Horizontal flex layout + next/image                                           |
| Modify | `app/[locale]/articles/page.tsx`                                                   | Grid → single-column flex                                                     |
| Modify | `e2e/pages/articles-page.ts`                                                       | Add `cardImages`, `cardContainers` locators                                   |
| Modify | `e2e/articles.spec.ts`                                                             | Assert image present, alt set, hover border                                   |
| Modify | `package.json`                                                                     | Add `prebuild` script                                                         |
| Create | `public/news/.gitkeep`                                                             | Track directory in git                                                        |

---

## Task 1: Add `source_url` to articles and fixtures

**Files:**

- Modify: `news/2026-05-13-microsoft-mdash-tops-anthropic-mythos-cybersecurity-benchmark.md`
- Modify: `news/2026-05-13-two-weeks-after-context-is-the-new-code.md`
- Modify: `news/2026-05-03-graphify-knowledge-graph-token-tax.md`
- Modify: `tests/lib/fixtures/news-valid/2026-05-12-foo.md`
- Modify: `tests/lib/fixtures/news-valid/2026-04-28-bar.md`
- Modify: `tests/lib/fixtures/news-bad-url/2026-05-12-baduri.md`
- Modify: `tests/lib/fixtures/news-missing-field/2026-05-12-missing.md`
- Create: `tests/lib/fixtures/news-missing-source-url/2026-05-12-no-source.md`
- Create: `tests/lib/fixtures/news-image-override/2026-05-12-override.md`

- [ ] **Step 1: Update `news/2026-05-13-microsoft-mdash-tops-anthropic-mythos-cybersecurity-benchmark.md`**

Add `source_url` after `url`:

```yaml
---
title_nl: 'Multi-agent AI-systeem van Microsoft klopt Mythos van Anthropic op cybersecurity-benchmark'
title_en: "Microsoft's multi-agent AI system tops Anthropic's Mythos on cybersecurity benchmark"
url: 'https://www.geekwire.com/2026/microsofts-multi-agent-ai-system-tops-anthropics-mythos-on-cybersecurity-benchmark/'
source_url: 'https://www.geekwire.com/2026/microsofts-multi-agent-ai-system-tops-anthropics-mythos-on-cybersecurity-benchmark/'
date: '2026-05-13'
author: 'Todd Bishop'
summary_nl: 'MDASH, het nieuwe scansysteem van Microsoft, scoorde 88,45% op de CyberGym-benchmark voor cybersecurity en liet daarmee losse modellen als Mythos van Anthropic en GPT-5.5 van OpenAI achter zich. Het systeem laat ruim 100 gespecialiseerde AI-agents samenwerken, verdeeld over meerdere modellen: één set agents speurt code af op kwetsbaarheden, een volgende groep beoordeelt of een vondst echt misbruikt kan worden en een laatste stap bouwt proof-of-concept-exploits ter bevestiging. Microsoft gebruikte MDASH meteen om 16 nieuwe Windows-kwetsbaarheden te melden, waaronder vier kritieke remote-code-executionfouten die in de Patch Tuesday van mei zijn gedicht.'
summary_en: "Microsoft's new MDASH (multi-model agentic scanning harness) scored 88.45% on the CyberGym cybersecurity benchmark, surpassing single-model systems including Anthropic's Mythos and OpenAI's GPT-5.5. It runs more than 100 specialized AI agents across multiple models in a staged pipeline that finds, debates and proves vulnerabilities with proof-of-concept exploits. Microsoft used MDASH to disclose 16 new Windows vulnerabilities, including four critical remote code execution flaws fixed in May's Patch Tuesday."
---
```

- [ ] **Step 2: Update `news/2026-05-13-two-weeks-after-context-is-the-new-code.md`**

```yaml
---
title_nl: "Twee weken na 'Context Is the New Code' op AIE London: dit had ik niet zien aankomen"
title_en: 'Two Weeks After "Context Is the New Code" at AIE London: I Did Not See This Coming'
url: 'https://www.jedi.be/blog/2026/two-weeks-after-context-is-the-new-code/'
source_url: 'https://www.jedi.be/blog/2026/two-weeks-after-context-is-the-new-code/'
date: '2026-05-13'
author: 'Patrick Debois'
summary_nl: "Patrick Debois reflecteert op de onverwachte virale impact van zijn keynote 'Context Is the New Code': 60k+ views, community-vertalingen en uitbreidingen van de Context Development Lifecycle (CDLC) binnen twee weken. Praktijkmensen rekten het model op van 4 naar 7 fases en introduceerden begrippen als 'context debt'. Conclusie: de diversiteit aan framings doet het werk dat één talk niet kan."
summary_en: "Patrick Debois reflects on the unexpected viral pull of his 'Context Is the New Code' keynote: 60k+ views, community translations and extensions of the Context Development Lifecycle (CDLC) within two weeks. Practitioners expanded the model from 4 to 7 stages and introduced ideas like 'context debt'. His takeaway: the diversity of framings is doing work a single talk cannot."
---
```

- [ ] **Step 3: Update `news/2026-05-03-graphify-knowledge-graph-token-tax.md`**

```yaml
---
title_nl: "Graphify: de knowledge graph die de 'token tax' van je codebase afschaft"
title_en: "Graphify: The Knowledge Graph That Ends Your Codebase's Token Tax"
url: 'https://medium.com/jin-system-architect/graphify-the-knowledge-graph-that-ends-your-codebases-token-tax-819b77f2ec58'
source_url: 'https://medium.com/jin-system-architect/graphify-the-knowledge-graph-that-ends-your-codebases-token-tax-819b77f2ec58'
date: '2026-05-03'
author: 'Edward Low'
summary_nl: 'Graphify is een open-source tool die expliciete knowledge graphs bouwt van codebases om tokenverbruik bij LLM-queries terug te dringen. In plaats van semantisch vergelijkbare snippets op te halen via RAG, parseert het de code één keer naar een gestructureerde graph via AST-extractie (tree-sitter), lokale transcriptie en semantische analyse. Relaties worden getagd op betrouwbaarheid (EXTRACTED, INFERRED, AMBIGUOUS) en het proces draait in drie privacy-passes, waarbij broncode volledig lokaal blijft. De headline-benchmark claimt 71,5× tokenreductie; in de praktijk levert het 7-8% besparing op typische codeersessies, met grotere winst op grote, gemixte repositories.'
summary_en: 'Graphify is an open-source tool that builds explicit knowledge graphs of codebases to cut token consumption in LLM queries. Instead of retrieving semantically similar snippets via RAG, it parses code once into a structured graph using AST extraction (tree-sitter), local transcription and semantic analysis. Relationships are tagged by confidence (EXTRACTED, INFERRED, AMBIGUOUS) and the pipeline runs in three privacy-bounded passes, keeping source code fully local. Headline benchmarks claim a 71.5× token reduction; real-world testing shows 7-8% savings on typical coding sessions, scaling on large mixed-media repos.'
---
```

- [ ] **Step 4: Update `tests/lib/fixtures/news-valid/2026-05-12-foo.md`**

```yaml
---
title_nl: 'agent loops verschepen'
title_en: 'shipping agent loops'
url: 'https://example.com/post'
source_url: 'https://example.com/post'
date: '2026-05-12'
summary_nl: 'nl samenvatting'
summary_en: 'en summary'
---
```

- [ ] **Step 5: Update `tests/lib/fixtures/news-valid/2026-04-28-bar.md`**

```yaml
---
title_nl: 'ouder bericht'
title_en: 'older post'
url: 'https://example.com/older'
source_url: 'https://example.com/older'
date: '2026-04-28'
summary_nl: 'oudere samenvatting'
summary_en: 'older summary'
---
```

- [ ] **Step 6: Update `tests/lib/fixtures/news-bad-url/2026-05-12-baduri.md`**

```yaml
---
title_nl: 'slechte url'
title_en: 'bad url'
url: 'not-a-url'
source_url: 'https://example.com/bad'
date: '2026-05-12'
summary_nl: 'nl'
summary_en: 'en'
---
```

- [ ] **Step 7: Update `tests/lib/fixtures/news-missing-field/2026-05-12-missing.md`**

```yaml
---
title_nl: 'ontbrekende samenvatting'
title_en: 'missing summary'
url: 'https://example.com/missing'
source_url: 'https://example.com/missing'
date: '2026-05-12'
summary_nl: 'nl only'
---
```

- [ ] **Step 8: Create `tests/lib/fixtures/news-missing-source-url/2026-05-12-no-source.md`**

```yaml
---
title_nl: 'geen source url'
title_en: 'no source url'
url: 'https://example.com/no-source'
date: '2026-05-12'
summary_nl: 'nl'
summary_en: 'en'
---
```

- [ ] **Step 9: Create `tests/lib/fixtures/news-image-override/2026-05-12-override.md`**

```yaml
---
title_nl: 'artikel met afbeelding'
title_en: 'article with image'
url: 'https://example.com/with-image'
source_url: 'https://example.com/with-image'
date: '2026-05-12'
summary_nl: 'nl samenvatting'
summary_en: 'en summary'
image: '/custom/override.jpg'
---
```

- [ ] **Step 10: Commit**

```bash
git add news/ tests/lib/fixtures/
git commit -m "feat(articles): add source_url to articles and test fixtures"
```

---

## Task 2: TDD — articles schema and image resolution

**Files:**

- Modify: `tests/lib/articles.test.ts`
- Modify: `lib/articles.ts`

### Step 1 — write failing tests

- [ ] **Replace `tests/lib/articles.test.ts` with this content:**

```ts
import { describe, it, expect } from 'vitest';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { getArticles } from '@/lib/articles';

const fixturesRoot = path.resolve(__dirname, 'fixtures');

// Helper: create a temp dir with a .cache.json
function makeTempImagesDir(cacheEntries: Record<string, { localPath: string }>): string {
  const dir = path.join(os.tmpdir(), `articles-test-${Date.now()}`);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, '.cache.json'), JSON.stringify(cacheEntries));
  return dir;
}

describe('getArticles', () => {
  it('returns articles sorted by date descending', () => {
    const articles = getArticles(path.join(fixturesRoot, 'news-valid'), '/nonexistent');
    expect(articles).toHaveLength(2);
    expect(articles[0].slug).toBe('2026-05-12-foo');
    expect(articles[1].slug).toBe('2026-04-28-bar');
  });

  it('maps snake_case frontmatter to camelCase fields', () => {
    const [first] = getArticles(path.join(fixturesRoot, 'news-valid'), '/nonexistent');
    expect(first.summaryNl).toBe('nl samenvatting');
    expect(first.summaryEn).toBe('en summary');
    expect(first.titleNl).toBe('agent loops verschepen');
    expect(first.titleEn).toBe('shipping agent loops');
    expect(first.url).toBe('https://example.com/post');
    expect(first.sourceUrl).toBe('https://example.com/post');
    expect(first.date).toBe('2026-05-12');
    expect(first.imageAlt).toBe('agent loops verschepen');
  });

  it('returns [] when the news directory does not exist', () => {
    expect(getArticles(path.join(fixturesRoot, 'does-not-exist'), '/nonexistent')).toEqual([]);
  });

  it('returns [] when the news directory exists but has no .md files', () => {
    expect(getArticles(path.join(fixturesRoot, 'news-empty'), '/nonexistent')).toEqual([]);
  });

  it('throws when an article has a non-http(s) url', () => {
    expect(() => getArticles(path.join(fixturesRoot, 'news-bad-url'), '/nonexistent')).toThrow(
      /url/i,
    );
  });

  it('throws when an article is missing a required field', () => {
    expect(() =>
      getArticles(path.join(fixturesRoot, 'news-missing-field'), '/nonexistent'),
    ).toThrow(/summary_en/i);
  });

  it('throws when source_url is missing', () => {
    expect(() =>
      getArticles(path.join(fixturesRoot, 'news-missing-source-url'), '/nonexistent'),
    ).toThrow(/source_url/i);
  });

  it('resolves image to /qas-icon.svg when no cache entry exists', () => {
    const [first] = getArticles(path.join(fixturesRoot, 'news-valid'), '/nonexistent');
    expect(first.image).toBe('/qas-icon.svg');
  });

  it('resolves image to localPath from cache when cache entry exists', () => {
    const imagesDir = makeTempImagesDir({
      'https://example.com/post': { localPath: '/news/2026-05-12-foo.jpg' },
    });
    const [first] = getArticles(path.join(fixturesRoot, 'news-valid'), imagesDir);
    expect(first.image).toBe('/news/2026-05-12-foo.jpg');
  });

  it('uses frontmatter image override instead of cache', () => {
    const imagesDir = makeTempImagesDir({
      'https://example.com/with-image': { localPath: '/news/2026-05-12-override.jpg' },
    });
    const [first] = getArticles(path.join(fixturesRoot, 'news-image-override'), imagesDir);
    expect(first.image).toBe('/custom/override.jpg');
  });
});
```

- [ ] **Step 2: Run tests — expect failures**

```bash
pnpm test tests/lib/articles.test.ts
```

Expected: multiple FAIL — `sourceUrl` undefined, `imageAlt` undefined, `source_url` not in schema, `image` not always defined.

- [ ] **Step 3: Replace `lib/articles.ts` with the updated implementation**

```ts
import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import { parseFrontmatter } from './parseFrontmatter';

const frontmatterSchema = z.object({
  title_nl: z.string().min(1),
  title_en: z.string().min(1),
  url: z.string().regex(/^https?:\/\//, 'url must start with http(s)://'),
  source_url: z.string().regex(/^https?:\/\//, 'source_url must start with http(s)://'),
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
  sourceUrl: string;
  date: string;
  summaryNl: string;
  summaryEn: string;
  image: string;
  imageAlt: string;
  tags?: string[];
  author?: string;
}

interface CacheEntry {
  etag?: string;
  lastModified?: string;
  localPath: string;
}

const DEFAULT_NEWS_DIR = path.join(process.cwd(), 'news');
const DEFAULT_IMAGES_DIR = path.join(process.cwd(), 'public', 'news');

function loadCacheMap(imagesDir: string): Record<string, CacheEntry> {
  const cacheFile = path.join(imagesDir, '.cache.json');
  if (!fs.existsSync(cacheFile)) return {};
  try {
    return JSON.parse(fs.readFileSync(cacheFile, 'utf8')) as Record<string, CacheEntry>;
  } catch {
    return {};
  }
}

export function getArticles(
  newsDir: string = DEFAULT_NEWS_DIR,
  imagesDir: string = DEFAULT_IMAGES_DIR,
): Article[] {
  if (!fs.existsSync(newsDir)) return [];

  const entries = fs.readdirSync(newsDir).filter((f) => f.endsWith('.md'));
  if (entries.length === 0) return [];

  const cache = loadCacheMap(imagesDir);

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

    let image = '/qas-icon.svg';
    if (d.image) {
      image = d.image;
    } else {
      const entry = cache[d.source_url];
      if (entry?.localPath) image = entry.localPath;
    }

    const article: Article = {
      slug: filename.replace(/\.md$/, ''),
      titleNl: d.title_nl,
      titleEn: d.title_en,
      url: d.url,
      sourceUrl: d.source_url,
      date: d.date,
      summaryNl: d.summary_nl,
      summaryEn: d.summary_en,
      image,
      imageAlt: d.title_nl,
    };
    if (d.tags !== undefined) article.tags = d.tags;
    if (d.author !== undefined) article.author = d.author;
    return article;
  });

  articles.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  return articles;
}
```

- [ ] **Step 4: Run tests — expect all pass**

```bash
pnpm test tests/lib/articles.test.ts
```

Expected: all 10 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/articles.ts tests/lib/articles.test.ts tests/lib/fixtures/
git commit -m "feat(articles): add source_url, image resolution, imageAlt to Article type"
```

---

## Task 3: TDD — fetch script

**Files:**

- Create: `tests/scripts/fetch-article-images.test.ts`
- Create: `scripts/fetch-article-images.ts`

### Step 1 — write failing tests

- [ ] **Create `tests/scripts/fetch-article-images.test.ts`:**

```ts
import { describe, it, expect, vi, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fetchArticleImages } from '@/scripts/fetch-article-images';

function makeTempDirs() {
  const base = path.join(os.tmpdir(), `fetch-test-${Date.now()}`);
  const newsDir = path.join(base, 'news');
  const outputDir = path.join(base, 'output');
  fs.mkdirSync(newsDir, { recursive: true });
  fs.mkdirSync(outputDir, { recursive: true });
  return { newsDir, outputDir, cacheFile: path.join(outputDir, '.cache.json') };
}

function writeArticle(
  newsDir: string,
  filename: string,
  sourceUrl: string,
  imageOverride?: string,
) {
  const lines = [
    '---',
    `title_nl: 'test artikel'`,
    `title_en: 'test article'`,
    `url: '${sourceUrl}'`,
    `source_url: '${sourceUrl}'`,
    `date: '2026-05-12'`,
    `summary_nl: 'nl'`,
    `summary_en: 'en'`,
  ];
  if (imageOverride) lines.push(`image: '${imageOverride}'`);
  lines.push('---');
  fs.writeFileSync(path.join(newsDir, filename), lines.join('\n'));
}

function mockFetch(
  responses: Array<{
    url: string | RegExp;
    status?: number;
    headers?: Record<string, string>;
    body?: string | Buffer;
  }>,
) {
  return vi.fn(async (url: string, init?: RequestInit) => {
    const match = responses.find((r) =>
      typeof r.url === 'string' ? r.url === url : r.url.test(url),
    );
    if (!match) throw new Error(`Unexpected fetch: ${url}`);
    const status = match.status ?? 200;
    const headersMap = new Map(Object.entries(match.headers ?? {}));
    return {
      ok: status >= 200 && status < 300,
      status,
      headers: { get: (k: string) => headersMap.get(k.toLowerCase()) ?? null },
      text: async () => (match.body instanceof Buffer ? match.body.toString() : (match.body ?? '')),
      arrayBuffer: async () => {
        const buf = match.body instanceof Buffer ? match.body : Buffer.from(match.body ?? '');
        return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
      },
    };
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('fetchArticleImages', () => {
  it('downloads og:image and writes to outputDir + updates cache', async () => {
    const { newsDir, outputDir, cacheFile } = makeTempDirs();
    writeArticle(newsDir, '2026-05-12-foo.md', 'https://example.com/post');

    const imageBytes = Buffer.from('FAKE_IMAGE_DATA');
    vi.stubGlobal(
      'fetch',
      mockFetch([
        {
          url: 'https://example.com/post',
          headers: { etag: '"abc"' },
          body: '<meta property="og:image" content="https://example.com/img.jpg" />',
        },
        {
          url: 'https://example.com/img.jpg',
          headers: { 'content-type': 'image/jpeg' },
          body: imageBytes,
        },
      ]),
    );

    await fetchArticleImages({ newsDir, outputDir, cacheFile });

    expect(fs.existsSync(path.join(outputDir, '2026-05-12-foo.jpg'))).toBe(true);
    const cache = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
    expect(cache['https://example.com/post'].localPath).toBe('/news/2026-05-12-foo.jpg');
    expect(cache['https://example.com/post'].etag).toBe('"abc"');
  });

  it('skips fetch when ETag is unchanged and local file exists', async () => {
    const { newsDir, outputDir, cacheFile } = makeTempDirs();
    writeArticle(newsDir, '2026-05-12-foo.md', 'https://example.com/post');

    const existingCache = {
      'https://example.com/post': { etag: '"abc"', localPath: '/news/2026-05-12-foo.jpg' },
    };
    fs.writeFileSync(cacheFile, JSON.stringify(existingCache));
    fs.writeFileSync(path.join(outputDir, '2026-05-12-foo.jpg'), 'existing');

    const fetchMock = mockFetch([
      { url: 'https://example.com/post', headers: { etag: '"abc"' }, body: '' },
    ]);
    vi.stubGlobal('fetch', fetchMock);

    await fetchArticleImages({ newsDir, outputDir, cacheFile });

    // HEAD was called but GET was not
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith('https://example.com/post', { method: 'HEAD' });
  });

  it('skips article that has a frontmatter image override', async () => {
    const { newsDir, outputDir, cacheFile } = makeTempDirs();
    writeArticle(
      newsDir,
      '2026-05-12-override.md',
      'https://example.com/override',
      '/custom/img.jpg',
    );

    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await fetchArticleImages({ newsDir, outputDir, cacheFile });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('prints warning and continues when fetch fails', async () => {
    const { newsDir, outputDir, cacheFile } = makeTempDirs();
    writeArticle(newsDir, '2026-05-12-foo.md', 'https://example.com/post');

    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network error')));
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    await fetchArticleImages({ newsDir, outputDir, cacheFile });

    expect(warnSpy).toHaveBeenCalledWith(expect.stringMatching(/\[warn\].*2026-05-12-foo/));
    expect(fs.readdirSync(outputDir)).not.toContain('2026-05-12-foo.jpg');
    warnSpy.mockRestore();
  });

  it('prints warning and continues when og:image is not found in HTML', async () => {
    const { newsDir, outputDir, cacheFile } = makeTempDirs();
    writeArticle(newsDir, '2026-05-12-foo.md', 'https://example.com/post');

    vi.stubGlobal(
      'fetch',
      mockFetch([
        { url: 'https://example.com/post', body: '<html><head><title>No OG</title></head></html>' },
      ]),
    );
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    await fetchArticleImages({ newsDir, outputDir, cacheFile });

    expect(warnSpy).toHaveBeenCalledWith(expect.stringMatching(/og:image not found/));
    warnSpy.mockRestore();
  });

  it('returns immediately when newsDir does not exist', async () => {
    const { outputDir, cacheFile } = makeTempDirs();
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await fetchArticleImages({ newsDir: '/nonexistent/path', outputDir, cacheFile });

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL (module not found)**

```bash
pnpm test tests/scripts/fetch-article-images.test.ts
```

Expected: FAIL with "Cannot find module '@/scripts/fetch-article-images'".

- [ ] **Step 3: Create `scripts/fetch-article-images.ts`:**

```ts
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseFrontmatter } from '../lib/parseFrontmatter';

interface CacheEntry {
  etag?: string;
  lastModified?: string;
  localPath: string;
}
type CacheMap = Record<string, CacheEntry>;

export interface FetchOptions {
  newsDir?: string;
  outputDir?: string;
  cacheFile?: string;
}

export async function fetchArticleImages(options: FetchOptions = {}): Promise<void> {
  const newsDir = options.newsDir ?? path.join(process.cwd(), 'news');
  const outputDir = options.outputDir ?? path.join(process.cwd(), 'public', 'news');
  const cacheFile = options.cacheFile ?? path.join(outputDir, '.cache.json');

  if (!fs.existsSync(newsDir)) return;

  fs.mkdirSync(outputDir, { recursive: true });

  let cache: CacheMap = {};
  if (fs.existsSync(cacheFile)) {
    try {
      cache = JSON.parse(fs.readFileSync(cacheFile, 'utf8')) as CacheMap;
    } catch {
      // treat as empty
    }
  }

  const files = fs.readdirSync(newsDir).filter((f) => f.endsWith('.md'));

  for (const filename of files) {
    const slug = filename.replace(/\.md$/, '');
    let frontmatter: Record<string, unknown>;
    try {
      const raw = fs.readFileSync(path.join(newsDir, filename), 'utf8');
      frontmatter = parseFrontmatter(raw, filename);
    } catch {
      continue;
    }

    const sourceUrl = typeof frontmatter.source_url === 'string' ? frontmatter.source_url : null;
    const imageOverride = typeof frontmatter.image === 'string' ? frontmatter.image : null;

    if (!sourceUrl || imageOverride) continue;

    const existing = cache[sourceUrl];

    let etag: string | null = null;
    let lastModified: string | null = null;
    try {
      const head = await fetch(sourceUrl, { method: 'HEAD' });
      etag = head.headers.get('etag');
      lastModified = head.headers.get('last-modified');

      if (existing?.localPath) {
        const localFilePath = path.join(outputDir, path.basename(existing.localPath));
        const unchanged =
          (etag !== null && etag === existing.etag) ||
          (etag === null && lastModified !== null && lastModified === existing.lastModified);
        if (unchanged && fs.existsSync(localFilePath)) continue;
      }
    } catch (err) {
      console.warn(
        `[warn] ${slug}: HEAD failed — ${err instanceof Error ? err.message : String(err)}`,
      );
      continue;
    }

    try {
      const res = await fetch(sourceUrl);
      const html = await res.text();

      const match =
        html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ??
        html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);

      if (!match?.[1]) {
        console.warn(`[warn] ${slug}: og:image not found`);
        continue;
      }

      const imageUrl = match[1];
      const imgRes = await fetch(imageUrl);
      if (!imgRes.ok) throw new Error(`HTTP ${imgRes.status}`);

      const buf = Buffer.from(await imgRes.arrayBuffer());
      const ct = imgRes.headers.get('content-type') ?? '';
      const urlExt = path.extname(new URL(imageUrl).pathname).slice(1).toLowerCase();
      const ext =
        urlExt ||
        (ct.includes('png')
          ? 'png'
          : ct.includes('webp')
            ? 'webp'
            : ct.includes('gif')
              ? 'gif'
              : 'jpg');
      const localFilename = `${slug}.${ext}`;

      fs.writeFileSync(path.join(outputDir, localFilename), buf);

      cache[sourceUrl] = {
        ...(etag !== null && { etag }),
        ...(lastModified !== null && { lastModified }),
        localPath: `/news/${localFilename}`,
      };
      fs.writeFileSync(cacheFile, JSON.stringify(cache, null, 2));

      console.log(`[info] ${slug}: saved /news/${localFilename}`);
    } catch (err) {
      console.warn(`[warn] ${slug}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
}

// Entry point when run directly via tsx
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  fetchArticleImages().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
```

- [ ] **Step 4: Run tests — expect all pass**

```bash
pnpm test tests/scripts/fetch-article-images.test.ts
```

Expected: all 6 tests PASS.

- [ ] **Step 5: Run full test suite — expect no regressions**

```bash
pnpm test
```

Expected: all PASS.

- [ ] **Step 6: Commit**

```bash
git add scripts/fetch-article-images.ts tests/scripts/fetch-article-images.test.ts
git commit -m "feat(articles): add build-time og:image fetch script with caching"
```

---

## Task 4: Update ArticleCard and page

**Files:**

- Modify: `components/ArticleCard.tsx`
- Modify: `app/[locale]/articles/page.tsx`

- [ ] **Step 1: Replace `components/ArticleCard.tsx`**

```tsx
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import type { Article } from '@/lib/articles';

export function ArticleCard({ article, locale }: { article: Article; locale: string }) {
  const t = useTranslations('articles');
  const summary = locale === 'nl' ? article.summaryNl : article.summaryEn;
  const title = locale === 'nl' ? article.titleNl : article.titleEn;
  const isFallback = article.image === '/qas-icon.svg';

  return (
    <article
      data-testid={`article-card-${article.slug}`}
      className="border-border-subtle bg-bg-elevated hover:border-accent-blue flex overflow-hidden rounded-sm border transition-colors duration-150"
    >
      <div className="bg-bg-base border-border-subtle relative flex-[0_0_38%] border-r">
        <Image
          src={article.image}
          alt={article.imageAlt}
          width={400}
          height={225}
          className={`h-full w-full ${isFallback ? 'object-contain p-6' : 'object-cover'}`}
          loading="lazy"
        />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="text-text-muted font-mono text-xs tracking-[0.2em] uppercase">
          {article.date}
        </p>
        <h3 className="text-text-primary mt-3 font-mono text-lg">
          <span className="text-accent-green">&gt;</span> {title}
        </h3>
        <p className="text-text-muted mt-3 flex-1 text-sm">{summary}</p>
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          data-testid={`article-link-${article.slug}`}
          className="text-accent-blue mt-6 font-mono text-sm hover:underline"
        >
          → {t('readExternal')}
        </a>
      </div>
    </article>
  );
}
```

- [ ] **Step 2: Update the grid in `app/[locale]/articles/page.tsx`**

Find the line:

```tsx
<div className="mt-12 grid gap-6 md:grid-cols-2">
```

Replace with:

```tsx
<div className="mt-12 flex flex-col gap-6">
```

- [ ] **Step 3: Commit**

```bash
git add components/ArticleCard.tsx app/[locale]/articles/page.tsx
git commit -m "feat(articles): horizontal card layout with og:image thumbnail"
```

---

## Task 5: Update e2e

**Files:**

- Modify: `e2e/pages/articles-page.ts`
- Modify: `e2e/articles.spec.ts`

- [ ] **Step 1: Replace `e2e/pages/articles-page.ts`**

```ts
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
  }

  async goto() {
    await this.page.goto(`/${this.locale}/articles`);
  }
}
```

- [ ] **Step 2: Replace `e2e/articles.spec.ts`**

```ts
import fs from 'node:fs';
import path from 'node:path';
import { test, expect } from '@playwright/test';
import { ArticlesPage } from './pages/articles-page';
import { type Locale } from './pages/home-page';

const newsDir = path.join(process.cwd(), 'news');
const hasArticles =
  fs.existsSync(newsDir) && fs.readdirSync(newsDir).some((f) => f.endsWith('.md'));

const locales: Locale[] = ['nl', 'en'];

for (const locale of locales) {
  test(`articles: ${locale} page renders heading + intro`, async ({ page }) => {
    const articles = new ArticlesPage(page, locale);
    await articles.goto();
    await expect(articles.heading).toBeVisible();
    await expect(articles.intro).toBeVisible();
  });

  test(`articles: ${locale} shows empty state when news/ has no .md`, async ({ page }) => {
    test.skip(hasArticles, 'news/ contains articles — empty state path not exercised');
    const articles = new ArticlesPage(page, locale);
    await articles.goto();
    await expect(articles.emptyState).toBeVisible();
  });

  test(`articles: ${locale} renders cards with external links`, async ({ page }) => {
    test.skip(!hasArticles, 'no articles in news/ — card render path not exercised');
    const articles = new ArticlesPage(page, locale);
    await articles.goto();
    await expect(articles.articleCards.first()).toBeVisible();
    const firstLink = articles.articleCards.first();
    await expect(firstLink).toHaveAttribute('target', '_blank');
    await expect(firstLink).toHaveAttribute('rel', /noopener/);
    await expect(articles.readExternalLinks.first()).toBeVisible();
  });

  test(`articles: ${locale} card images have src and non-empty alt`, async ({ page }) => {
    test.skip(!hasArticles, 'no articles in news/ — card render path not exercised');
    const articles = new ArticlesPage(page, locale);
    await articles.goto();
    const firstImage = articles.cardImages.first();
    await expect(firstImage).toBeVisible();
    const src = await firstImage.getAttribute('src');
    expect(src).toBeTruthy();
    const alt = await firstImage.getAttribute('alt');
    expect(alt).toBeTruthy();
  });

  test(`articles: ${locale} card border changes on hover`, async ({ page }) => {
    test.skip(!hasArticles, 'no articles in news/ — card render path not exercised');
    const articles = new ArticlesPage(page, locale);
    await articles.goto();
    const card = articles.cardContainers.first();
    await card.hover();
    await expect(card).toHaveCSS('border-color', 'rgb(88, 166, 255)');
  });
}
```

- [ ] **Step 3: Commit**

```bash
git add e2e/pages/articles-page.ts e2e/articles.spec.ts
git commit -m "test(articles): add image and hover assertions to e2e suite"
```

---

## Task 6: Wire up prebuild and track public/news/

**Files:**

- Modify: `package.json`
- Create: `public/news/.gitkeep`

- [ ] **Step 1: Add `prebuild` to `package.json` scripts**

In `package.json`, find:

```json
"build": "next build",
```

Add the `prebuild` line before it:

```json
"prebuild": "tsx scripts/fetch-article-images.ts",
"build": "next build",
```

- [ ] **Step 2: Create `public/news/.gitkeep`**

Create an empty file at `public/news/.gitkeep` so the directory is tracked in git before the first script run.

- [ ] **Step 3: Run the fetch script manually to verify it works**

```bash
pnpm tsx scripts/fetch-article-images.ts
```

Expected: `[info]` lines for each article, or `[warn]` if a source is unreachable. No uncaught exceptions.

- [ ] **Step 4: Confirm `public/news/.cache.json` was created**

```bash
cat public/news/.cache.json
```

Expected: JSON object with entries for each article's `source_url`.

- [ ] **Step 5: Run full test suite**

```bash
pnpm test
```

Expected: all PASS.

- [ ] **Step 6: Verify TypeScript compiles**

```bash
pnpm tsc --noEmit
```

Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add package.json public/news/
git commit -m "feat(articles): wire prebuild image fetch, track public/news/"
```
