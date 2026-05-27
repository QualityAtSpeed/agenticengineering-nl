import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { ArticleCard } from '@/components/ArticleCard';
import type { Article } from '@/lib/articles';
import messagesEn from '@/messages/en.json';
import messagesNl from '@/messages/nl.json';

const baseArticle: Article = {
  slug: '2026-05-12-sample',
  titleNl: 'titel NL',
  titleEn: 'title EN',
  url: 'https://example.com/post',
  sourceUrl: 'https://example.com/post',
  type: 'article',
  date: '2026-05-12',
  summaryNl: 'NL samenvatting',
  summaryEn: 'EN summary',
  image: '/qas-icon.svg',
};

function renderWith(article: Article, locale: 'nl' | 'en') {
  const messages = locale === 'nl' ? messagesNl : messagesEn;
  return render(
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ArticleCard article={article} locale={locale} />
    </NextIntlClientProvider>,
  );
}

describe('ArticleCard', () => {
  it('renders EN title and summary when locale=en', () => {
    renderWith(baseArticle, 'en');
    expect(screen.getByText('title EN')).toBeInTheDocument();
    expect(screen.getByText('EN summary')).toBeInTheDocument();
  });

  it('renders NL title and summary when locale=nl', () => {
    renderWith(baseArticle, 'nl');
    expect(screen.getByText('titel NL')).toBeInTheDocument();
    expect(screen.getByText('NL samenvatting')).toBeInTheDocument();
  });

  it('renders the external link with target=_blank and rel=noopener', () => {
    renderWith(baseArticle, 'en');
    const link = screen.getByTestId('article-link-2026-05-12-sample');
    expect(link).toHaveAttribute('href', 'https://example.com/post');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', expect.stringMatching(/noopener/));
  });

  it('renders an "article" badge in EN with accent-orange when type=article', () => {
    renderWith(baseArticle, 'en');
    const badge = screen.getByTestId('article-badge-2026-05-12-sample');
    expect(badge).toHaveTextContent('article');
    expect(badge.className).toContain('text-accent-orange');
    expect(badge.className).toContain('border-accent-orange');
  });

  it('renders an "artikel" badge in NL when type=article', () => {
    renderWith(baseArticle, 'nl');
    const badge = screen.getByTestId('article-badge-2026-05-12-sample');
    expect(badge).toHaveTextContent('artikel');
  });

  it('renders a "blog" badge in EN with accent-green when type=blog', () => {
    renderWith({ ...baseArticle, type: 'blog' }, 'en');
    const badge = screen.getByTestId('article-badge-2026-05-12-sample');
    expect(badge).toHaveTextContent('blog');
    expect(badge.className).toContain('text-accent-green');
    expect(badge.className).toContain('border-accent-green');
  });

  it('renders a "blog" badge in NL when type=blog', () => {
    renderWith({ ...baseArticle, type: 'blog' }, 'nl');
    const badge = screen.getByTestId('article-badge-2026-05-12-sample');
    expect(badge).toHaveTextContent('blog');
  });
});
