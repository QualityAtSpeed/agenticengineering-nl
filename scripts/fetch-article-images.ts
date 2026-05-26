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

      // Reject non-http(s) schemes and loopback addresses to prevent SSRF
      let imageUrlObj: URL;
      try {
        imageUrlObj = new URL(imageUrl);
      } catch {
        console.warn(`[warn] ${slug}: og:image is not a valid URL: ${imageUrl}`);
        continue;
      }
      if (!['http:', 'https:'].includes(imageUrlObj.protocol)) {
        console.warn(`[warn] ${slug}: og:image scheme not allowed: ${imageUrlObj.protocol}`);
        continue;
      }
      if (/^(localhost|127\.|169\.254\.|::1|\[::1\])/.test(imageUrlObj.hostname)) {
        console.warn(`[warn] ${slug}: og:image points to loopback/link-local address`);
        continue;
      }

      const imgRes = await fetch(imageUrl);
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
      // Atomic write: write to .tmp, then rename
      const tempCacheFile = `${cacheFile}.tmp`;
      fs.writeFileSync(tempCacheFile, JSON.stringify(cache, null, 2));
      fs.renameSync(tempCacheFile, cacheFile);

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
