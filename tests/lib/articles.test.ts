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
