import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fetchArticleImage, isTrusted, loadTrusted } from '@/scripts/fetch-article-images';

const playwrightMocks = vi.hoisted(() => {
  const getAttribute = vi.fn<(name: string) => Promise<string | null>>();
  const first = vi.fn(() => ({ getAttribute }));
  const locator = vi.fn(() => ({ first }));
  const goto = vi.fn();
  const pageClose = vi.fn();
  const page = { goto, locator, close: pageClose };
  const newPage = vi.fn(async () => page);
  const browserClose = vi.fn();
  const browser = { newPage, close: browserClose };
  const launch = vi.fn(async () => browser);
  return { launch, newPage, goto, locator, first, getAttribute, browserClose, pageClose };
});

vi.mock('playwright', () => ({
  chromium: { launch: playwrightMocks.launch },
}));

function makeWorkspace(trusted: string[]) {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'fetch-img-test-'));
  const outputDir = path.join(base, 'output');
  const trustedFile = path.join(base, 'trusted.json');
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(trustedFile, JSON.stringify(trusted));
  return { base, outputDir, trustedFile };
}

function mockImageFetch(
  responses: Array<{
    url: string | RegExp;
    status?: number;
    headers?: Record<string, string>;
    body?: Buffer;
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
    const headersMap = new Map(
      Object.entries(match.headers ?? {}).map(([k, v]) => [k.toLowerCase(), v]),
    );
    return {
      ok: status >= 200 && status < 300,
      status,
      headers: { get: (k: string) => headersMap.get(k.toLowerCase()) ?? null },
      arrayBuffer: async () => {
        const buf = match.body ?? Buffer.alloc(0);
        return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
      },
    };
  });
}

beforeEach(() => {
  playwrightMocks.launch.mockClear();
  playwrightMocks.newPage.mockClear();
  playwrightMocks.goto.mockReset();
  playwrightMocks.goto.mockResolvedValue(undefined);
  playwrightMocks.locator.mockClear();
  playwrightMocks.first.mockClear();
  playwrightMocks.getAttribute.mockReset();
  playwrightMocks.browserClose.mockClear();
  playwrightMocks.browserClose.mockResolvedValue(undefined);
  playwrightMocks.pageClose.mockClear();
  playwrightMocks.pageClose.mockResolvedValue(undefined);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('isTrusted', () => {
  it('matches exact hostname', () => {
    expect(isTrusted('medium.com', ['medium.com'])).toBe(true);
  });

  it('matches subdomain via suffix rule', () => {
    expect(isTrusted('cdn.medium.com', ['medium.com'])).toBe(true);
  });

  it('does not partial-match a sibling domain', () => {
    expect(isTrusted('evilmedium.com', ['medium.com'])).toBe(false);
  });

  it('returns false when list is empty', () => {
    expect(isTrusted('medium.com', [])).toBe(false);
  });
});

describe('loadTrusted', () => {
  it('returns [] when file does not exist', () => {
    expect(loadTrusted('/nonexistent/path/trusted.json')).toEqual([]);
  });

  it('parses array of strings from JSON file', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'trusted-test-'));
    const file = path.join(dir, 'trusted.json');
    fs.writeFileSync(file, JSON.stringify(['medium.com', 'geekwire.com']));
    expect(loadTrusted(file)).toEqual(['medium.com', 'geekwire.com']);
  });
});

describe('fetchArticleImage', () => {
  it('rejects untrusted source host without launching the browser', async () => {
    const { outputDir, trustedFile } = makeWorkspace(['medium.com']);
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const result = await fetchArticleImage('https://evil.example/post', 'slug', {
      outputDir,
      trustedFile,
    });

    expect(result.ok).toBe(false);
    expect(result.reason).toMatch(/source host not trusted: evil\.example/);
    expect(result.imagePath).toBe('/qas-icon.svg');
    expect(playwrightMocks.launch).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects invalid source URL without launching the browser', async () => {
    const { outputDir, trustedFile } = makeWorkspace(['medium.com']);
    vi.stubGlobal('fetch', vi.fn());

    const result = await fetchArticleImage('not-a-url', 'slug', { outputDir, trustedFile });

    expect(result.ok).toBe(false);
    expect(result.reason).toBe('invalid source_url');
    expect(playwrightMocks.launch).not.toHaveBeenCalled();
  });

  it('drives chromium to read og:image and downloads it on happy path', async () => {
    const { outputDir, trustedFile } = makeWorkspace(['medium.com']);
    playwrightMocks.getAttribute.mockResolvedValue('https://cdn.medium.com/img.png');
    const imageBytes = Buffer.from('FAKE_PNG_BYTES');
    vi.stubGlobal(
      'fetch',
      mockImageFetch([
        {
          url: 'https://cdn.medium.com/img.png',
          headers: { 'content-type': 'image/png' },
          body: imageBytes,
        },
      ]),
    );

    const result = await fetchArticleImage('https://medium.com/post', '2026-05-12-foo', {
      outputDir,
      trustedFile,
    });

    expect(result.ok).toBe(true);
    expect(result.imagePath).toBe('/news/2026-05-12-foo.png');
    expect(fs.existsSync(path.join(outputDir, '2026-05-12-foo.png'))).toBe(true);

    expect(playwrightMocks.launch).toHaveBeenCalledOnce();
    expect(playwrightMocks.newPage).toHaveBeenCalledOnce();
    expect(playwrightMocks.goto).toHaveBeenCalledWith(
      'https://medium.com/post',
      expect.objectContaining({ waitUntil: 'domcontentloaded' }),
    );
    expect(playwrightMocks.locator).toHaveBeenCalledWith('meta[property="og:image"]');
    expect(playwrightMocks.getAttribute).toHaveBeenCalledWith('content');
    expect(playwrightMocks.browserClose).toHaveBeenCalledOnce();
  });

  it('falls back when og:image meta is missing', async () => {
    const { outputDir, trustedFile } = makeWorkspace(['medium.com']);
    playwrightMocks.getAttribute.mockResolvedValue(null);
    vi.stubGlobal('fetch', vi.fn());

    const result = await fetchArticleImage('https://medium.com/post', 'slug', {
      outputDir,
      trustedFile,
    });

    expect(result.ok).toBe(false);
    expect(result.reason).toBe('og:image not found');
    expect(playwrightMocks.browserClose).toHaveBeenCalledOnce();
  });

  it('rejects when og:image host is not on the trusted list', async () => {
    const { outputDir, trustedFile } = makeWorkspace(['medium.com']);
    playwrightMocks.getAttribute.mockResolvedValue('https://evil-cdn.example/img.jpg');
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const result = await fetchArticleImage('https://medium.com/post', 'slug', {
      outputDir,
      trustedFile,
    });

    expect(result.ok).toBe(false);
    expect(result.reason).toMatch(/og:image host not trusted: evil-cdn\.example/);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(playwrightMocks.browserClose).toHaveBeenCalledOnce();
  });

  it('rejects og:image with a non-http(s) scheme', async () => {
    const { outputDir, trustedFile } = makeWorkspace(['medium.com']);
    playwrightMocks.getAttribute.mockResolvedValue('file:///etc/passwd');
    vi.stubGlobal('fetch', vi.fn());

    const result = await fetchArticleImage('https://medium.com/post', 'slug', {
      outputDir,
      trustedFile,
    });

    expect(result.ok).toBe(false);
    expect(result.reason).toMatch(/bad scheme: file:/);
    expect(playwrightMocks.browserClose).toHaveBeenCalledOnce();
  });

  it('resolves relative og:image URLs against the source URL', async () => {
    const { outputDir, trustedFile } = makeWorkspace(['medium.com']);
    playwrightMocks.getAttribute.mockResolvedValue('/static/img.jpg');
    const imageBytes = Buffer.from('IMG');
    vi.stubGlobal(
      'fetch',
      mockImageFetch([
        {
          url: 'https://medium.com/static/img.jpg',
          headers: { 'content-type': 'image/jpeg' },
          body: imageBytes,
        },
      ]),
    );

    const result = await fetchArticleImage('https://medium.com/post', 'slug', {
      outputDir,
      trustedFile,
    });

    expect(result.ok).toBe(true);
    expect(result.imagePath).toBe('/news/slug.jpg');
  });

  it('falls back when the page navigation throws', async () => {
    const { outputDir, trustedFile } = makeWorkspace(['medium.com']);
    playwrightMocks.goto.mockRejectedValue(new Error('net::ERR_TIMED_OUT'));
    vi.stubGlobal('fetch', vi.fn());

    const result = await fetchArticleImage('https://medium.com/post', 'slug', {
      outputDir,
      trustedFile,
    });

    expect(result.ok).toBe(false);
    expect(result.reason).toMatch(/ERR_TIMED_OUT/);
    expect(playwrightMocks.browserClose).toHaveBeenCalledOnce();
  });

  it('closes the browser even when the image fetch fails', async () => {
    const { outputDir, trustedFile } = makeWorkspace(['medium.com']);
    playwrightMocks.getAttribute.mockResolvedValue('https://cdn.medium.com/img.png');
    vi.stubGlobal(
      'fetch',
      mockImageFetch([
        { url: 'https://cdn.medium.com/img.png', status: 403, body: Buffer.alloc(0) },
      ]),
    );

    const result = await fetchArticleImage('https://medium.com/post', 'slug', {
      outputDir,
      trustedFile,
    });

    expect(result.ok).toBe(false);
    expect(result.reason).toBe('img HTTP 403');
    expect(playwrightMocks.browserClose).toHaveBeenCalledOnce();
  });

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
});
