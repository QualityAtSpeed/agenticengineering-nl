import { describe, it, expect, vi, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fetchArticleImages, type LookupFn } from '@/scripts/fetch-article-images';

function makeTempDirs() {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'fetch-test-'));
  const newsDir = path.join(base, 'news');
  const outputDir = path.join(base, 'output');
  fs.mkdirSync(newsDir, { recursive: true });
  fs.mkdirSync(outputDir, { recursive: true });
  const lookup: LookupFn = vi.fn(async () => [{ address: '93.184.216.34', family: 4 }]);
  return {
    newsDir,
    outputDir,
    cacheFile: path.join(outputDir, '.cache.json'),
    lookup,
  };
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
  let cursor = 0;
  return vi.fn(async (url: string, _init?: RequestInit) => {
    const remaining = responses.slice(cursor);
    const idx = remaining.findIndex((r) =>
      typeof r.url === 'string' ? r.url === url : r.url.test(url),
    );
    if (idx === -1) throw new Error(`Unexpected fetch: ${url}`);
    const match = remaining[idx];
    cursor += idx + 1;
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
    const { newsDir, outputDir, cacheFile, lookup } = makeTempDirs();
    writeArticle(newsDir, '2026-05-12-foo.md', 'https://example.com/post');

    const imageBytes = Buffer.from('FAKE_IMAGE_DATA');
    const fetchMock = mockFetch([
      {
        url: 'https://example.com/post',
        headers: { etag: '"abc"' },
        body: '<meta property="og:image" content="https://example.com/img.jpg" />',
      },
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

    await fetchArticleImages({ newsDir, outputDir, cacheFile, lookup });

    const calls = fetchMock.mock.calls;
    expect(calls[0][0]).toBe('https://example.com/post');
    expect(calls[0][1]).toEqual({ method: 'HEAD', redirect: 'manual' });
    expect(calls[1][0]).toBe('https://example.com/post');
    expect(calls[1][1]).toEqual({ redirect: 'manual' });

    expect(fs.existsSync(path.join(outputDir, '2026-05-12-foo.jpg'))).toBe(true);
    const cache = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
    expect(cache['https://example.com/post'].localPath).toBe('/news/2026-05-12-foo.jpg');
    expect(cache['https://example.com/post'].etag).toBe('"abc"');
  });

  it('skips fetch when ETag is unchanged and local file exists', async () => {
    const { newsDir, outputDir, cacheFile, lookup } = makeTempDirs();
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

    await fetchArticleImages({ newsDir, outputDir, cacheFile, lookup });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith('https://example.com/post', {
      method: 'HEAD',
      redirect: 'manual',
    });
  });

  it('skips article that has a frontmatter image override', async () => {
    const { newsDir, outputDir, cacheFile, lookup } = makeTempDirs();
    writeArticle(
      newsDir,
      '2026-05-12-override.md',
      'https://example.com/override',
      '/custom/img.jpg',
    );

    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await fetchArticleImages({ newsDir, outputDir, cacheFile, lookup });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('prints warning and continues when fetch fails', async () => {
    const { newsDir, outputDir, cacheFile, lookup } = makeTempDirs();
    writeArticle(newsDir, '2026-05-12-foo.md', 'https://example.com/post');

    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network error')));
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    await fetchArticleImages({ newsDir, outputDir, cacheFile, lookup });

    expect(warnSpy).toHaveBeenCalledWith(expect.stringMatching(/\[warn\].*2026-05-12-foo/));
    expect(fs.readdirSync(outputDir)).not.toContain('2026-05-12-foo.jpg');
    warnSpy.mockRestore();
  });

  it('prints warning and continues when og:image is not found in HTML', async () => {
    const { newsDir, outputDir, cacheFile, lookup } = makeTempDirs();
    writeArticle(newsDir, '2026-05-12-foo.md', 'https://example.com/post');

    vi.stubGlobal(
      'fetch',
      mockFetch([
        { url: 'https://example.com/post', body: '' },
        { url: 'https://example.com/post', body: '<html><head><title>No OG</title></head></html>' },
      ]),
    );
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    await fetchArticleImages({ newsDir, outputDir, cacheFile, lookup });

    expect(warnSpy).toHaveBeenCalledWith(expect.stringMatching(/og:image not found/));
    warnSpy.mockRestore();
  });

  it('returns immediately when newsDir does not exist', async () => {
    const { outputDir, cacheFile, lookup } = makeTempDirs();
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await fetchArticleImages({ newsDir: '/nonexistent/path', outputDir, cacheFile, lookup });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects og:image pointing to RFC1918 host', async () => {
    const { newsDir, outputDir, cacheFile } = makeTempDirs();
    writeArticle(newsDir, '2026-05-12-foo.md', 'https://example.com/post');

    const lookupStub: LookupFn = vi.fn(async (host: string) => {
      if (host === 'internal.evil') return [{ address: '10.0.0.5', family: 4 }];
      return [{ address: '93.184.216.34', family: 4 }];
    });

    vi.stubGlobal(
      'fetch',
      mockFetch([
        { url: 'https://example.com/post', headers: { etag: '"a"' }, body: '' },
        {
          url: 'https://example.com/post',
          body: '<meta property="og:image" content="https://internal.evil/x.jpg" />',
        },
      ]),
    );
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    await fetchArticleImages({ newsDir, outputDir, cacheFile, lookup: lookupStub });

    expect(warnSpy).toHaveBeenCalledWith(expect.stringMatching(/blocked range: private/));
    expect(fs.readdirSync(outputDir)).not.toContain('2026-05-12-foo.jpg');
    warnSpy.mockRestore();
  });

  it('rejects og:image literal loopback IP', async () => {
    const { newsDir, outputDir, cacheFile, lookup } = makeTempDirs();
    writeArticle(newsDir, '2026-05-12-foo.md', 'https://example.com/post');

    vi.stubGlobal(
      'fetch',
      mockFetch([
        { url: 'https://example.com/post', headers: { etag: '"a"' }, body: '' },
        {
          url: 'https://example.com/post',
          body: '<meta property="og:image" content="http://127.0.0.1/x.jpg" />',
        },
      ]),
    );
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    await fetchArticleImages({ newsDir, outputDir, cacheFile, lookup });

    expect(warnSpy).toHaveBeenCalledWith(expect.stringMatching(/blocked IP range: loopback/));
    warnSpy.mockRestore();
  });

  it('rejects og:image scheme that is not http(s)', async () => {
    const { newsDir, outputDir, cacheFile, lookup } = makeTempDirs();
    writeArticle(newsDir, '2026-05-12-foo.md', 'https://example.com/post');

    vi.stubGlobal(
      'fetch',
      mockFetch([
        { url: 'https://example.com/post', headers: { etag: '"a"' }, body: '' },
        {
          url: 'https://example.com/post',
          body: '<meta property="og:image" content="file:///etc/passwd" />',
        },
      ]),
    );
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    await fetchArticleImages({ newsDir, outputDir, cacheFile, lookup });

    expect(warnSpy).toHaveBeenCalledWith(expect.stringMatching(/scheme not allowed: file:/));
    warnSpy.mockRestore();
  });

  it('rejects redirect chain that lands on internal host', async () => {
    const { newsDir, outputDir, cacheFile } = makeTempDirs();
    writeArticle(newsDir, '2026-05-12-foo.md', 'https://example.com/post');

    const lookupStub: LookupFn = vi.fn(async (host: string) => {
      if (host === 'cdn.evil') return [{ address: '169.254.169.254', family: 4 }];
      return [{ address: '93.184.216.34', family: 4 }];
    });

    vi.stubGlobal(
      'fetch',
      mockFetch([
        { url: 'https://example.com/post', headers: { etag: '"a"' }, body: '' },
        {
          url: 'https://example.com/post',
          body: '<meta property="og:image" content="https://example.com/redir" />',
        },
        {
          url: 'https://example.com/redir',
          status: 302,
          headers: { location: 'https://cdn.evil/x.jpg' },
          body: '',
        },
      ]),
    );
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    await fetchArticleImages({ newsDir, outputDir, cacheFile, lookup: lookupStub });

    expect(warnSpy).toHaveBeenCalledWith(expect.stringMatching(/blocked range: linkLocal/));
    warnSpy.mockRestore();
  });

  it('rejects host when DNS lookup returns no records', async () => {
    const { newsDir, outputDir, cacheFile } = makeTempDirs();
    writeArticle(newsDir, '2026-05-12-foo.md', 'https://example.com/post');

    const lookupStub: LookupFn = vi.fn(async (host: string) => {
      if (host === 'no-records.test') return [];
      return [{ address: '93.184.216.34', family: 4 }];
    });

    vi.stubGlobal(
      'fetch',
      mockFetch([
        { url: 'https://example.com/post', headers: { etag: '"a"' }, body: '' },
        {
          url: 'https://example.com/post',
          body: '<meta property="og:image" content="https://no-records.test/x.jpg" />',
        },
      ]),
    );
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    await fetchArticleImages({ newsDir, outputDir, cacheFile, lookup: lookupStub });

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringMatching(/no DNS records for no-records\.test/),
    );
    warnSpy.mockRestore();
  });

  it('caps redirect chain at maxRedirects', async () => {
    const { newsDir, outputDir, cacheFile, lookup } = makeTempDirs();
    writeArticle(newsDir, '2026-05-12-foo.md', 'https://example.com/post');

    vi.stubGlobal(
      'fetch',
      mockFetch([
        { url: 'https://example.com/post', headers: { etag: '"a"' }, body: '' },
        {
          url: 'https://example.com/post',
          body: '<meta property="og:image" content="https://example.com/a" />',
        },
        {
          url: /example\.com\/[a-z]+/,
          status: 302,
          headers: { location: 'https://example.com/next1' },
          body: '',
        },
        {
          url: /example\.com\/[a-z0-9]+/,
          status: 302,
          headers: { location: 'https://example.com/next2' },
          body: '',
        },
        {
          url: /example\.com\/[a-z0-9]+/,
          status: 302,
          headers: { location: 'https://example.com/next3' },
          body: '',
        },
      ]),
    );
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    await fetchArticleImages({ newsDir, outputDir, cacheFile, lookup, maxRedirects: 2 });

    expect(warnSpy).toHaveBeenCalledWith(expect.stringMatching(/too many redirects/));
    warnSpy.mockRestore();
  });
});
