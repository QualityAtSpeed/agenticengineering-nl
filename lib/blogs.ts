import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import { parseFrontmatter } from './parseFrontmatter';

const FILENAME_RE = /^(.+)\.(nl|en)\.md$/;

const frontmatterSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD'),
  image: z.string().optional(),
  tags: z.array(z.string()).optional(),
  author: z.string().optional(),
});

type Frontmatter = z.infer<typeof frontmatterSchema>;

interface LocaleContent {
  title: string;
  summary: string;
  body: string;
}

export interface Blog {
  slug: string;
  date: string;
  image?: string;
  tags?: string[];
  author?: string;
  nl: LocaleContent;
  en: LocaleContent;
}

const DEFAULT_BLOGS_DIR = path.join(process.cwd(), 'blogs');

const SHARED_FIELDS = ['date', 'image', 'tags', 'author'] as const satisfies ReadonlyArray<
  keyof Frontmatter
>;

function sharedFieldEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((v, i) => v === b[i]);
  }
  return false;
}

let cache: { dir: string; blogs: Blog[] } | null = null;

function parseBlogFile(filePath: string, filename: string): { fm: Frontmatter; body: string } {
  const raw = fs.readFileSync(filePath, 'utf8');
  const { fm, body } = parseFrontmatter(raw, filename);
  const result = frontmatterSchema.safeParse(fm);
  if (!result.success) {
    const issue = result.error.issues[0];
    const field = issue.path.join('.') || '(root)';
    throw new Error(`Invalid frontmatter in ${filename}: field "${field}" — ${issue.message}`);
  }
  return { fm: result.data, body };
}

export function getBlogs(blogsDir: string = DEFAULT_BLOGS_DIR): Blog[] {
  if (cache && cache.dir === blogsDir) return cache.blogs;
  if (!fs.existsSync(blogsDir)) {
    cache = { dir: blogsDir, blogs: [] };
    return [];
  }
  const entries = fs.readdirSync(blogsDir).filter((f) => FILENAME_RE.test(f));
  if (entries.length === 0) {
    cache = { dir: blogsDir, blogs: [] };
    return [];
  }

  const bySlug = new Map<
    string,
    { nl?: { fm: Frontmatter; body: string }; en?: { fm: Frontmatter; body: string } }
  >();

  for (const filename of entries) {
    const m = filename.match(FILENAME_RE);
    if (!m) continue;
    const slug = m[1];
    const locale = m[2] as 'nl' | 'en';
    const parsed = parseBlogFile(path.join(blogsDir, filename), filename);
    const existing = bySlug.get(slug) ?? {};
    existing[locale] = parsed;
    bySlug.set(slug, existing);
  }

  const blogs: Blog[] = [];
  for (const [slug, { nl, en }] of bySlug) {
    if (!nl || !en) {
      throw new Error(`Blog "${slug}" is missing one locale file (need both .nl.md and .en.md)`);
    }
    for (const field of SHARED_FIELDS) {
      if (!sharedFieldEqual(nl.fm[field], en.fm[field])) {
        throw new Error(
          `Blog "${slug}" ${field} mismatch between locales: nl=${JSON.stringify(nl.fm[field])}, en=${JSON.stringify(en.fm[field])}`,
        );
      }
    }
    const blog: Blog = {
      slug,
      date: nl.fm.date,
      nl: { title: nl.fm.title, summary: nl.fm.summary, body: nl.body },
      en: { title: en.fm.title, summary: en.fm.summary, body: en.body },
    };
    if (nl.fm.image !== undefined) blog.image = nl.fm.image;
    if (nl.fm.tags !== undefined) blog.tags = nl.fm.tags;
    if (nl.fm.author !== undefined) blog.author = nl.fm.author;
    blogs.push(blog);
  }

  blogs.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  cache = { dir: blogsDir, blogs };
  return blogs;
}

export function getBlogBySlug(slug: string, blogsDir: string = DEFAULT_BLOGS_DIR): Blog | null {
  return getBlogs(blogsDir).find((b) => b.slug === slug) ?? null;
}
