import Link from 'next/link';
import { useTranslations } from 'next-intl';

export type FilterType = 'all' | 'blog' | 'article';

interface Item {
  id: FilterType;
  testId: string;
  labelKey: 'all' | 'blogs' | 'articles';
  href: (locale: string) => string;
}

const ITEMS: Item[] = [
  { id: 'all', testId: 'filter-all', labelKey: 'all', href: (l) => `/${l}/articles` },
  {
    id: 'blog',
    testId: 'filter-blogs',
    labelKey: 'blogs',
    href: (l) => `/${l}/articles?type=blog`,
  },
  {
    id: 'article',
    testId: 'filter-articles',
    labelKey: 'articles',
    href: (l) => `/${l}/articles?type=article`,
  },
];

export function ArticleFilterBar({
  currentType,
  locale,
}: {
  currentType: FilterType;
  locale: string;
}) {
  const t = useTranslations('articles.filter');

  return (
    <nav
      aria-label="article filter"
      className="text-text-muted mt-12 mb-12 font-mono text-sm tracking-[0.1em]"
    >
      <span aria-hidden="true">[ </span>
      {ITEMS.map((item, idx) => {
        const active = item.id === currentType;
        const className = active ? 'text-accent-green' : 'text-text-muted hover:text-text-primary';
        return (
          <span key={item.id}>
            <Link
              href={item.href(locale)}
              data-testid={item.testId}
              className={className}
              {...(active ? { 'aria-current': 'page' as const } : {})}
            >
              {t(item.labelKey)}
            </Link>
            {idx < ITEMS.length - 1 && <span aria-hidden="true"> | </span>}
          </span>
        );
      })}
      <span aria-hidden="true"> ]</span>
    </nav>
  );
}
