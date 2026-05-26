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
  return vi.fn(async (url: string, _init?: RequestInit) => {
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
    const fetchMock = mockFetch([
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
    ]);
    vi.stubGlobal('fetch', fetchMock);

    await fetchArticleImages({ newsDir, outputDir, cacheFile });

    // Verify HEAD was first, GET (for HTML) second, GET (for image) third
    const calls = fetchMock.mock.calls;
    expect(calls[0][0]).toBe('https://example.com/post');
    expect(calls[0][1]).toEqual({ method: 'HEAD' });
    expect(calls[1][0]).toBe('https://example.com/post');
    expect(calls[1][1]).toBeUndefined(); // GET

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
