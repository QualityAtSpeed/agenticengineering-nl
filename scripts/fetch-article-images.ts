import fs from 'node:fs';
import path from 'node:path';
import dns from 'node:dns/promises';
import { fileURLToPath } from 'node:url';
import ipaddr from 'ipaddr.js';
import { parseFrontmatter } from '../lib/parseFrontmatter';

interface CacheEntry {
  etag?: string;
  lastModified?: string;
  localPath: string;
}
type CacheMap = Record<string, CacheEntry>;

export type LookupFn = (
  hostname: string,
  opts: { all: true },
) => Promise<Array<{ address: string; family: number }>>;

export interface FetchOptions {
  newsDir?: string;
  outputDir?: string;
  cacheFile?: string;
  lookup?: LookupFn;
  maxRedirects?: number;
}

const BLOCKED_RANGES = new Set([
  'unspecified',
  'broadcast',
  'multicast',
  'linkLocal',
  'loopback',
  'carrierGradeNat',
  'private',
  'uniqueLocal',
  'reserved',
]);

async function assertPublicHost(hostname: string, lookup: LookupFn): Promise<void> {
  const stripped = hostname.replace(/^\[|\]$/g, '');
  if (ipaddr.isValid(stripped)) {
    const range = ipaddr.parse(stripped).range();
    if (BLOCKED_RANGES.has(range)) {
      throw new Error(`blocked IP range: ${range} (${stripped})`);
    }
    return;
  }
  const records = await lookup(hostname, { all: true });
  for (const { address } of records) {
    const range = ipaddr.parse(address).range();
    if (BLOCKED_RANGES.has(range)) {
      throw new Error(`host ${hostname} resolves to blocked range: ${range} (${address})`);
    }
  }
}

async function safeFetch(
  rawUrl: string,
  init: RequestInit,
  lookup: LookupFn,
  maxRedirects: number,
): Promise<Response> {
  let current = rawUrl;
  for (let hop = 0; hop <= maxRedirects; hop++) {
    const u = new URL(current);
    if (!['http:', 'https:'].includes(u.protocol)) {
      throw new Error(`scheme not allowed: ${u.protocol}`);
    }
    await assertPublicHost(u.hostname, lookup);

    const res = await fetch(current, { ...init, redirect: 'manual' });
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get('location');
      if (!loc) return res;
      current = new URL(loc, current).toString();
      continue;
    }
    return res;
  }
  throw new Error(`too many redirects (>${maxRedirects})`);
}

export async function fetchArticleImages(options: FetchOptions = {}): Promise<void> {
  const newsDir = options.newsDir ?? path.join(process.cwd(), 'news');
  const outputDir = options.outputDir ?? path.join(process.cwd(), 'public', 'news');
  const cacheFile = options.cacheFile ?? path.join(outputDir, '.cache.json');
  const lookup = options.lookup ?? (dns.lookup as unknown as LookupFn);
  const maxRedirects = options.maxRedirects ?? 3;

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
      frontmatter = parseFrontmatter(raw, filename) as Record<string, unknown>;
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
      const head = await safeFetch(sourceUrl, { method: 'HEAD' }, lookup, maxRedirects);
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
      const res = await safeFetch(sourceUrl, {}, lookup, maxRedirects);
      const html = await res.text();

      const match =
        html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ??
        html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);

      if (!match?.[1]) {
        console.warn(`[warn] ${slug}: og:image not found`);
        continue;
      }

      const imageUrl = match[1];

      const imgRes = await safeFetch(imageUrl, {}, lookup, maxRedirects);
      if (!imgRes.ok) throw new Error(`HTTP ${imgRes.status}`);

      const buf = Buffer.from(await imgRes.arrayBuffer());
      const ct = (imgRes.headers.get('content-type') ?? '').toLowerCase();
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

      const tempImageFile = path.join(outputDir, `${localFilename}.tmp`);
      fs.writeFileSync(tempImageFile, buf);
      fs.renameSync(tempImageFile, path.join(outputDir, localFilename));

      cache[sourceUrl] = {
        ...(etag !== null && { etag }),
        ...(lastModified !== null && { lastModified }),
        localPath: `/news/${localFilename}`,
      };
      const tempCacheFile = `${cacheFile}.tmp`;
      fs.writeFileSync(tempCacheFile, JSON.stringify(cache, null, 2));
      fs.renameSync(tempCacheFile, cacheFile);

      console.log(`[info] ${slug}: saved /news/${localFilename}`);
    } catch (err) {
      console.warn(`[warn] ${slug}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
}

const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  fetchArticleImages().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
