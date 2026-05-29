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

  it('falls back sourceUrl to url when frontmatter omits source_url', () => {
    const [first] = getArticles(path.join(fixturesRoot, 'news-blog'));
    expect(first.sourceUrl).toBe(first.url);
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
