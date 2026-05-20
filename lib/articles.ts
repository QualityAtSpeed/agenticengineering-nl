import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import { parseFrontmatter } from './parseFrontmatter';

const frontmatterSchema = z.object({
  title_nl: z.string().min(1),
  title_en: z.string().min(1),
  url: z.string().regex(/^https?:\/\//, 'url must start with http(s)://'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD'),
  summary_nl: z.string().min(1),
  summary_en: z.string().min(1),
  image: z.string().optional(),
  tags: z.array(z.string()).optional(),
  author: z.string().optional(),
});

export interface Article {
  slug: string;
  titleNl: string;
  titleEn: string;
  url: string;
  date: string;
  summaryNl: string;
  summaryEn: string;
  image?: string;
  tags?: string[];
  author?: string;
}

const DEFAULT_NEWS_DIR = path.join(process.cwd(), 'news');

export function getArticles(newsDir: string = DEFAULT_NEWS_DIR): Article[] {
  if (!fs.existsSync(newsDir)) return [];

  const entries = fs.readdirSync(newsDir).filter((f) => f.endsWith('.md'));

  if (entries.length === 0) return [];

  const articles = entries.map((filename) => {
    const filePath = path.join(newsDir, filename);
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = parseFrontmatter(raw, filename);
    const result = frontmatterSchema.safeParse(parsed);

    if (!result.success) {
      const issue = result.error.issues[0];
      const field = issue.path.join('.') || '(root)';
      throw new Error(`Invalid frontmatter in ${filename}: field "${field}" — ${issue.message}`);
    }

    const d = result.data;
    const article: Article = {
      slug: filename.replace(/\.md$/, ''),
      titleNl: d.title_nl,
      titleEn: d.title_en,
      url: d.url,
      date: d.date,
      summaryNl: d.summary_nl,
      summaryEn: d.summary_en,
    };
    if (d.image !== undefined) article.image = d.image;
    if (d.tags !== undefined) article.tags = d.tags;
    if (d.author !== undefined) article.author = d.author;
    return article;
  });

  articles.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  return articles;
}
