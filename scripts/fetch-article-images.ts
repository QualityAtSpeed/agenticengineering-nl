import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const TRUSTED_FILE = path.join(process.cwd(), 'data', 'trusted-domains.json');

export function loadTrusted(file: string = TRUSTED_FILE): string[] {
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file, 'utf8')) as string[];
}

export function isTrusted(hostname: string, trusted: string[]): boolean {
  return trusted.some((t) => hostname === t || hostname.endsWith('.' + t));
}

export interface FetchResult {
  imagePath: string;
  ok: boolean;
  reason?: string;
}

export interface FetchOptions {
  outputDir?: string;
  trustedFile?: string;
}

const FALLBACK = '/qas-icon.svg';
const GOTO_TIMEOUT_MS = 20_000;
const ALLOWED_EXTS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif']);

export async function fetchArticleImage(
  sourceUrl: string,
  slug: string,
  options: FetchOptions = {},
): Promise<FetchResult> {
  const outputDir = options.outputDir ?? path.join(process.cwd(), 'public', 'news');
  const trusted = loadTrusted(options.trustedFile);

  let srcUrl: URL;
  try {
    srcUrl = new URL(sourceUrl);
  } catch {
    return { imagePath: FALLBACK, ok: false, reason: 'invalid source_url' };
  }
  if (!isTrusted(srcUrl.hostname, trusted)) {
    return {
      imagePath: FALLBACK,
      ok: false,
      reason: `source host not trusted: ${srcUrl.hostname}`,
    };
  }

  fs.mkdirSync(outputDir, { recursive: true });

  let browser: Awaited<ReturnType<typeof chromium.launch>>;
  try {
    browser = await chromium.launch({ headless: false });
  } catch (err) {
    return {
      imagePath: FALLBACK,
      ok: false,
      reason: `chromium launch failed: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
  try {
    const page = await browser.newPage();
    let rawOgImage: string | null;
    try {
      await page.goto(sourceUrl, { waitUntil: 'domcontentloaded', timeout: GOTO_TIMEOUT_MS });
      rawOgImage = await page.locator('meta[property="og:image"]').first().getAttribute('content');
    } catch (err) {
      return {
        imagePath: FALLBACK,
        ok: false,
        reason: err instanceof Error ? err.message : String(err),
      };
    }

    if (!rawOgImage) {
      return { imagePath: FALLBACK, ok: false, reason: 'og:image not found' };
    }

    let imgUrl: URL;
    try {
      imgUrl = new URL(rawOgImage, sourceUrl);
    } catch {
      return { imagePath: FALLBACK, ok: false, reason: `bad og:image url: ${rawOgImage}` };
    }
    if (!['http:', 'https:'].includes(imgUrl.protocol)) {
      return {
        imagePath: FALLBACK,
        ok: false,
        reason: `bad scheme: ${imgUrl.protocol}`,
      };
    }
    if (!isTrusted(imgUrl.hostname, trusted)) {
      return {
        imagePath: FALLBACK,
        ok: false,
        reason: `og:image host not trusted: ${imgUrl.hostname}`,
      };
    }

    try {
      const imgRes = await fetch(imgUrl.toString(), {
        headers: { 'User-Agent': 'agenticengineering-bot/1.0' },
      });
      if (!imgRes.ok) {
        return { imagePath: FALLBACK, ok: false, reason: `img HTTP ${imgRes.status}` };
      }
      const buf = Buffer.from(await imgRes.arrayBuffer());
      const ct = (imgRes.headers.get('content-type') ?? '').toLowerCase();
      const urlExt = path.extname(imgUrl.pathname).slice(1).toLowerCase();
      const ctExt = ct.includes('png')
        ? 'png'
        : ct.includes('webp')
          ? 'webp'
          : ct.includes('gif')
            ? 'gif'
            : ct.includes('jpeg') || ct.includes('jpg')
              ? 'jpg'
              : '';
      const ext = ALLOWED_EXTS.has(urlExt) ? urlExt : ctExt || 'jpg';
      const filename = `${slug}.${ext}`;
      const tmp = path.join(outputDir, `${filename}.tmp`);
      fs.writeFileSync(tmp, buf);
      fs.renameSync(tmp, path.join(outputDir, filename));
      return { imagePath: `/news/${filename}`, ok: true };
    } catch (err) {
      return {
        imagePath: FALLBACK,
        ok: false,
        reason: err instanceof Error ? err.message : String(err),
      };
    }
  } finally {
    await browser.close();
  }
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  const [, , url, slug] = process.argv;
  if (!url || !slug) {
    console.error('usage: tsx scripts/fetch-article-images.ts <url> <slug>');
    process.exit(2);
  }
  console.error(
    '[notice] A Chromium browser window will open to load the article. ' +
      'This is required to bypass anti-bot challenges on sources like Medium and GeekWire. ' +
      'Do not interact with the window — it closes automatically when the fetch finishes.',
  );
  fetchArticleImage(url, slug)
    .then((r) => {
      console.log(JSON.stringify(r));
      process.exit(r.ok ? 0 : 1);
    })
    .catch((err) => {
      console.log(
        JSON.stringify({
          imagePath: FALLBACK,
          ok: false,
          reason: err instanceof Error ? err.message : String(err),
        }),
      );
      process.exit(1);
    });
}
