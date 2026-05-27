import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { Article } from '@/lib/articles';
import type { Blog } from '@/lib/blogs';
import type { Locale } from '@/i18n/routing';

export type TimelineEntry =
  | { kind: 'article'; date: string; data: Article }
  | { kind: 'blog'; date: string; data: Blog };

const FALLBACK_IMAGE = '/qas-icon.svg';

export function TimelineEntryRow({ entry, locale }: { entry: TimelineEntry; locale: Locale }) {
  const tArticles = useTranslations('articles');
  const tBlogs = useTranslations('blogs');

  if (entry.kind === 'blog') {
    const blog = entry.data;
    const content = blog[locale];
    const image = blog.image ?? FALLBACK_IMAGE;
    const isFallback = image === FALLBACK_IMAGE;
    return (
      <li className="relative pb-12 pl-6 last:pb-0" data-testid={`blog-card-${blog.slug}`}>
        <Link
          href={`/${locale}/articles/${blog.slug}`}
          data-testid={`blog-link-${blog.slug}`}
          className="group block"
        >
          <p className="text-text-muted font-mono text-xs tracking-[0.2em] uppercase">
            {blog.date} <span className="text-text-muted">// blog</span>
          </p>
          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="relative aspect-[1.91/1] w-full overflow-hidden rounded-sm sm:w-72 sm:flex-shrink-0">
              <Image
                src={image}
                alt={content.title}
                fill
                sizes="(min-width: 640px) 18rem, 100vw"
                className={isFallback ? 'object-contain p-6' : 'object-cover'}
              />
            </div>
            <div className="flex-1">
              <h3 className="text-text-primary group-hover:text-accent-blue font-mono text-xl transition-colors">
                <span className="text-accent-green">&gt;</span> {content.title}
              </h3>
              <p className="text-text-muted mt-3 max-w-2xl text-sm">{content.summary}</p>
              <span className="text-accent-blue mt-4 inline-block font-mono text-sm group-hover:underline">
                → {tBlogs('readMore')}
              </span>
            </div>
          </div>
        </Link>
      </li>
    );
  }

  const article = entry.data;
  const title = locale === 'nl' ? article.titleNl : article.titleEn;
  const summary = locale === 'nl' ? article.summaryNl : article.summaryEn;
  const image = article.image ?? FALLBACK_IMAGE;
  const isFallback = image === FALLBACK_IMAGE;
  return (
    <li className="relative pb-12 pl-6 last:pb-0" data-testid={`article-card-${article.slug}`}>
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        data-testid={`article-link-${article.slug}`}
        className="group block"
      >
        <p className="text-text-muted font-mono text-xs tracking-[0.2em] uppercase">
          {article.date} <span className="text-text-muted">// article</span>
        </p>
        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="relative aspect-[1.91/1] w-full overflow-hidden rounded-sm sm:w-72 sm:flex-shrink-0">
            <Image
              src={image}
              alt={title}
              fill
              sizes="(min-width: 640px) 18rem, 100vw"
              className={isFallback ? 'object-contain p-6' : 'object-cover'}
            />
          </div>
          <div className="flex-1">
            <h3 className="text-text-primary group-hover:text-accent-blue font-mono text-xl transition-colors">
              <span className="text-accent-green">&gt;</span> {title}
            </h3>
            <p className="text-text-muted mt-3 max-w-2xl text-sm">{summary}</p>
            <span className="text-accent-blue mt-4 inline-block font-mono text-sm group-hover:underline">
              → {tArticles('readExternal')}
            </span>
          </div>
        </div>
      </a>
    </li>
  );
}
