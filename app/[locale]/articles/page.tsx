import { setRequestLocale, getTranslations } from 'next-intl/server';
import { TimelineEntryRow, type TimelineEntry } from '@/components/TimelineEntry';
import { getArticles } from '@/lib/articles';
import { getBlogs } from '@/lib/blogs';
import type { Locale } from '@/i18n/routing';

export default async function ArticlesPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('articles');
  const articles = getArticles();
  const blogs = getBlogs();

  const entries: TimelineEntry[] = [
    ...articles.map((a) => ({ kind: 'article' as const, date: a.date, data: a })),
    ...blogs.map((b) => ({ kind: 'blog' as const, date: b.date, data: b })),
  ].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  return (
    <main className="px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-brand-deep text-3xl font-bold sm:text-4xl">{t('title')}</h1>
        <p className="text-text-soft mt-3 max-w-2xl text-lg">{t('intro')}</p>
        {entries.length === 0 ? (
          <p className="text-text-muted mt-12 text-sm">{t('emptyState')}</p>
        ) : (
          <ol className="border-border-subtle mt-12 ml-3 border-l pl-6">
            {entries.map((entry) => (
              <TimelineEntryRow
                key={`${entry.kind}-${entry.data.slug}`}
                entry={entry}
                locale={locale}
              />
            ))}
          </ol>
        )}
      </div>
    </main>
  );
}
