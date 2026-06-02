import { setRequestLocale, getTranslations } from 'next-intl/server';
import { TimelineEntryRow } from '@/components/TimelineEntry';
import { ArticleFilterBar, type FilterType } from '@/components/ArticleFilterBar';
import { getArticles } from '@/lib/articles';
import { blogsEnabled } from '@/lib/flags';
import type { Locale } from '@/i18n/routing';

function normaliseType(raw: string | undefined): FilterType {
  if (raw === 'blog' || raw === 'article') return raw;
  return 'all';
}

export default async function ArticlesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ type?: string }>;
}) {
  const { locale } = await params;
  const { type } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations('articles');
  const showBlogs = blogsEnabled();
  const currentType = normaliseType(type);
  const allArticles = getArticles();
  const articles = showBlogs ? allArticles : allArticles.filter((a) => a.type === 'article');

  const visible = currentType === 'all' ? articles : articles.filter((a) => a.type === currentType);

  return (
    <main className="px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-brand-deep text-3xl font-bold sm:text-4xl">
          {t('title')}{' '}
          <span className="text-text-soft text-xl font-normal sm:text-2xl">{t('intro')}</span>
        </h1>
        <ArticleFilterBar currentType={currentType} locale={locale} showBlogs={showBlogs} />
        {visible.length === 0 ? (
          <p className="text-text-muted mt-12 text-sm">{t('emptyState')}</p>
        ) : (
          <ol className="border-border-subtle mt-12 ml-3 border-l pl-6">
            {visible.map((article) => (
              <TimelineEntryRow key={article.slug} article={article} locale={locale} />
            ))}
          </ol>
        )}
      </div>
    </main>
  );
}
