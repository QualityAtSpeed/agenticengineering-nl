import Image from 'next/image';
import { useTranslations } from 'next-intl';
import type { Article } from '@/lib/articles';

export function ArticleCard({ article, locale }: { article: Article; locale: string }) {
  const t = useTranslations('articles');
  const rawSummary = locale === 'nl' ? article.summaryNl : article.summaryEn;
  const summary = rawSummary.length > 400 ? `${rawSummary.slice(0, 399).trimEnd()}…` : rawSummary;
  const title = locale === 'nl' ? article.titleNl : article.titleEn;
  const isFallback = article.image === '/qas-icon.svg';

  return (
    <article
      data-testid={`article-card-${article.slug}`}
      className="border-border-subtle bg-bg-elevated hover:border-accent-blue flex h-full flex-col overflow-hidden rounded-sm border transition-colors duration-150"
    >
      <div className="bg-bg-base border-border-subtle relative aspect-[2/1] w-full border-b">
        <Image
          src={article.image}
          alt={article.imageAlt}
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className={isFallback ? 'object-contain p-6' : 'object-cover'}
          loading="lazy"
        />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="text-text-muted font-mono text-xs tracking-[0.2em] uppercase">
          {article.date}
        </p>
        <h3 className="text-text-primary mt-3 font-mono text-2xl">
          <span className="text-accent-green">&gt;</span> {title}
        </h3>
        <p className="text-text-muted mt-3 flex-1 text-sm">{summary}</p>
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          data-testid={`article-link-${article.slug}`}
          className="text-accent-blue mt-6 inline-flex items-center gap-1 font-mono text-sm hover:underline"
        >
          → {t('readExternal')}
        </a>
      </div>
    </article>
  );
}
