import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import messagesEn from '@/messages/en.json';
import type { Article } from '@/lib/articles';
import { getArticles } from '@/lib/articles';
import ArticlesPage from '@/app/[locale]/articles/page';

vi.mock('next-intl/server', () => ({
  setRequestLocale: vi.fn(),
  getTranslations: async (ns: string) => {
    const root = messagesEn as unknown as Record<string, unknown>;
    const branch = (ns ? (root[ns] as Record<string, unknown>) : root) ?? {};
    return (key: string) => {
      const segments = key.split('.');
      let cur: unknown = branch;
      for (const seg of segments) {
        if (cur && typeof cur === 'object') cur = (cur as Record<string, unknown>)[seg];
        else return key;
      }
      return typeof cur === 'string' ? cur : key;
    };
  },
}));

vi.mock('@/lib/articles', async () => {
  const actual = await vi.importActual<typeof import('@/lib/articles')>('@/lib/articles');
  return {
    ...actual,
    getArticles: vi.fn(),
  };
});

const sample: Article[] = [
  {
    slug: '2026-05-12-blog-one',
    titleNl: 'blog NL',
    titleEn: 'blog EN',
    url: 'https://example.com/blog',
    sourceUrl: 'https://example.com/blog',
    type: 'blog',
    date: '2026-05-12',
    summaryNl: 'NL b',
    summaryEn: 'EN b',
    image: '/qas-icon.svg',
  },
  {
    slug: '2026-05-10-article-one',
    titleNl: 'artikel NL',
    titleEn: 'article EN',
    url: 'https://example.com/article',
    sourceUrl: 'https://example.com/article',
    type: 'article',
    date: '2026-05-10',
    summaryNl: 'NL a',
    summaryEn: 'EN a',
    image: '/qas-icon.svg',
  },
];

async function renderPage(searchParams: Record<string, string> = {}) {
  vi.mocked(getArticles).mockReturnValue(sample);
  const ui = await ArticlesPage({
    params: Promise.resolve({ locale: 'en' as const }),
    searchParams: Promise.resolve(searchParams),
  });
  return render(
    <NextIntlClientProvider locale="en" messages={messagesEn}>
      {ui}
    </NextIntlClientProvider>,
  );
}

describe('ArticlesPage', () => {
  it('renders both cards when no type param is set', async () => {
    await renderPage();
    expect(screen.getByTestId('article-card-2026-05-12-blog-one')).toBeInTheDocument();
    expect(screen.getByTestId('article-card-2026-05-10-article-one')).toBeInTheDocument();
  });

  it('shows only blog cards when ?type=blog', async () => {
    await renderPage({ type: 'blog' });
    expect(screen.getByTestId('article-card-2026-05-12-blog-one')).toBeInTheDocument();
    expect(screen.queryByTestId('article-card-2026-05-10-article-one')).toBeNull();
  });

  it('shows only article cards when ?type=article', async () => {
    await renderPage({ type: 'article' });
    expect(screen.queryByTestId('article-card-2026-05-12-blog-one')).toBeNull();
    expect(screen.getByTestId('article-card-2026-05-10-article-one')).toBeInTheDocument();
  });

  it('ignores unknown type values and shows everything', async () => {
    await renderPage({ type: 'podcast' });
    expect(screen.getByTestId('article-card-2026-05-12-blog-one')).toBeInTheDocument();
    expect(screen.getByTestId('article-card-2026-05-10-article-one')).toBeInTheDocument();
  });

  it('renders the empty state when filter yields nothing', async () => {
    vi.mocked(getArticles).mockReturnValue([{ ...sample[1] }]);
    const ui = await ArticlesPage({
      params: Promise.resolve({ locale: 'en' as const }),
      searchParams: Promise.resolve({ type: 'blog' }),
    });
    render(
      <NextIntlClientProvider locale="en" messages={messagesEn}>
        {ui}
      </NextIntlClientProvider>,
    );
    expect(screen.getByText('no articles yet')).toBeInTheDocument();
  });
});
