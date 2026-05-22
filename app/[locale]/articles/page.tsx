import { setRequestLocale, getTranslations } from 'next-intl/server';
import { ArticleCard } from '@/components/ArticleCard';
import { getArticles } from '@/lib/articles';
import type { Locale } from '@/i18n/routing';

export default async function ArticlesPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('articles');
  const tBlogs = await getTranslations('blogs');
  const articles = getArticles();

  return (
    <main className="px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-text-primary font-mono text-4xl">
          <span className="text-accent-green">&gt;</span> {t('title')}
        </h1>
        <p className="text-text-muted mt-6 max-w-2xl">{t('intro')}</p>
        {articles.length === 0 ? (
          <p className="text-text-muted mt-12 font-mono text-sm">{t('emptyState')}</p>
        ) : (
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {articles.map((a) => (
              <ArticleCard key={a.slug} article={a} locale={locale} />
            ))}
          </div>
        )}

        <h1 className="text-text-primary mt-24 font-mono text-4xl">
          <span className="text-accent-green">&gt;</span> {tBlogs('title')}
        </h1>
        <p className="text-text-muted mt-6 max-w-2xl">{tBlogs('intro')}</p>
        <p className="text-text-muted mt-12 font-mono text-sm">{tBlogs('emptyState')}</p>
      </div>
    </main>
  );
}
