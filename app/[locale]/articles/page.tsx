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
    <main className="px-6 py-20">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-text-primary font-mono text-4xl">
          <span className="text-accent-green">&gt;</span> {t('title')}
        </h1>
        <p className="text-text-muted mt-6 max-w-2xl">{t('intro')}</p>
        {entries.length === 0 ? (
          <p className="text-text-muted mt-12 font-mono text-sm">{t('emptyState')}</p>
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
