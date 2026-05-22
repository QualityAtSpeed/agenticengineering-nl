import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { z } from 'zod';

const FRONTMATTER_RE = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
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

function parseBlogFile(filePath: string, filename: string): { fm: Frontmatter; body: string } {
  const raw = fs.readFileSync(filePath, 'utf8');
  const match = raw.match(FRONTMATTER_RE);
  if (!match) {
    throw new Error(`Invalid blog file ${filename}: expected --- frontmatter --- followed by body`);
  }
  let parsed: unknown;
  try {
    parsed = yaml.load(match[1], { schema: yaml.CORE_SCHEMA });
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to parse YAML frontmatter in ${filename}: ${reason}`);
  }
  const result = frontmatterSchema.safeParse(parsed);
  if (!result.success) {
    const issue = result.error.issues[0];
    const field = issue.path.join('.') || '(root)';
    throw new Error(`Invalid frontmatter in ${filename}: field "${field}" — ${issue.message}`);
  }
  return { fm: result.data, body: match[2].trim() };
}

export function getBlogs(blogsDir: string = DEFAULT_BLOGS_DIR): Blog[] {
  if (!fs.existsSync(blogsDir)) return [];
  const entries = fs.readdirSync(blogsDir).filter((f) => FILENAME_RE.test(f));
  if (entries.length === 0) return [];

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
    if (nl.fm.date !== en.fm.date) {
      throw new Error(
        `Blog "${slug}" date mismatch between locales: nl=${nl.fm.date}, en=${en.fm.date}`,
      );
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
  return blogs;
}

export function getBlogBySlug(slug: string, blogsDir: string = DEFAULT_BLOGS_DIR): Blog | null {
  return getBlogs(blogsDir).find((b) => b.slug === slug) ?? null;
}
