import { useTranslations } from 'next-intl';
import type { Article } from '@/lib/articles';

export function ArticleCard({ article, locale }: { article: Article; locale: string }) {
  const t = useTranslations('articles');
  const summary = locale === 'nl' ? article.summaryNl : article.summaryEn;
  const title = locale === 'nl' ? article.titleNl : article.titleEn;

  return (
    <article className="border-border-subtle bg-bg-elevated flex h-full flex-col rounded-sm border p-6">
      <p className="text-text-muted font-mono text-xs tracking-[0.2em] uppercase">{article.date}</p>
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
    </article>
  );
}
