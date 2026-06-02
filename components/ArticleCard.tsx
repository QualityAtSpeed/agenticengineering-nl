import Image from 'next/image';
import { useTranslations } from 'next-intl';
import type { Article } from '@/lib/articles';

export function ArticleCard({ article, locale }: { article: Article; locale: string }) {
  const t = useTranslations('articles');
  const rawSummary = locale === 'nl' ? article.summaryNl : article.summaryEn;
  const summary = rawSummary.length > 400 ? `${rawSummary.slice(0, 400).trimEnd()}…` : rawSummary;
  const title = locale === 'nl' ? article.titleNl : article.titleEn;
  const isFallback = article.image === '/qas-icon.svg';
  const imageAlt = title;

  return (
    <article
      data-testid={`article-card-${article.slug}`}
      className="border-border-subtle hover:border-brand bg-bg-base flex h-full flex-col overflow-hidden rounded-md border transition-colors"
    >
      <div className="bg-bg-tint border-border-subtle relative aspect-[2/1] w-full border-b">
        <Image
          src={article.image}
          alt={imageAlt}
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className={isFallback ? 'object-contain p-6' : 'object-cover'}
          loading="lazy"
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-brand text-xs font-bold tracking-wider uppercase">{article.date}</p>
        <h3 className="text-text-primary mt-2 text-lg font-bold">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-brand"
          >
            {title}
          </a>
        </h3>
        <p className="text-text-soft mt-2 flex-1 text-sm">{summary}</p>
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          data-testid={`article-link-${article.slug}`}
          className="text-brand hover:text-brand-deep mt-4 inline-flex items-center gap-1 text-sm font-semibold"
        >
          {t('readExternal')} →
        </a>
      </div>
    </article>
  );
}
