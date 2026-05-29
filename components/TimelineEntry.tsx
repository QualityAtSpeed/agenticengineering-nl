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
      <li className="relative pb-10 last:pb-0" data-testid={`blog-card-${blog.slug}`}>
        <Link
          href={`/${locale}/articles/${blog.slug}`}
          data-testid={`blog-link-${blog.slug}`}
          className="group block"
        >
          <p className="text-brand text-xs font-bold tracking-wider uppercase">{blog.date}</p>
          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="border-border-subtle bg-bg-tint relative aspect-[1.91/1] w-full overflow-hidden rounded-md border sm:w-72 sm:flex-shrink-0">
              <Image
                src={image}
                alt={content.title}
                fill
                sizes="(min-width: 640px) 18rem, 100vw"
                className={isFallback ? 'object-contain p-6' : 'object-cover'}
              />
            </div>
            <div className="flex-1">
              <h3 className="text-text-primary group-hover:text-brand text-xl font-bold transition-colors">
                {content.title}
              </h3>
              <p className="text-text-soft mt-2 max-w-2xl text-[0.9375rem]">{content.summary}</p>
              <span className="text-brand group-hover:text-brand-deep mt-3 inline-block text-sm font-semibold">
                {tBlogs('readMore')} →
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
    <li className="relative pb-10 last:pb-0" data-testid={`article-card-${article.slug}`}>
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        data-testid={`article-link-${article.slug}`}
        className="group block"
      >
        <p className="text-brand text-xs font-bold tracking-wider uppercase">{article.date}</p>
        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="border-border-subtle bg-bg-tint relative aspect-[1.91/1] w-full overflow-hidden rounded-md border sm:w-72 sm:flex-shrink-0">
            <Image
              src={image}
              alt={title}
              fill
              sizes="(min-width: 640px) 18rem, 100vw"
              className={isFallback ? 'object-contain p-6' : 'object-cover'}
            />
          </div>
          <div className="flex-1">
            <h3 className="text-text-primary group-hover:text-brand text-xl font-bold transition-colors">
              {title}
            </h3>
            <p className="text-text-soft mt-2 max-w-2xl text-[0.9375rem]">{summary}</p>
            <span className="text-brand group-hover:text-brand-deep mt-3 inline-block text-sm font-semibold">
              {tArticles('readExternal')} →
            </span>
          </div>
        </div>
      </a>
    </li>
  );
}
