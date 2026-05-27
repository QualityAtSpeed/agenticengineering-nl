import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { ArticleFilterBar } from '@/components/ArticleFilterBar';
import messagesEn from '@/messages/en.json';
import messagesNl from '@/messages/nl.json';

function renderBar(currentType: 'all' | 'blog' | 'article', locale: 'nl' | 'en') {
  const messages = locale === 'nl' ? messagesNl : messagesEn;
  return render(
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ArticleFilterBar currentType={currentType} locale={locale} />
    </NextIntlClientProvider>,
  );
}

describe('ArticleFilterBar', () => {
  it('renders three links: all, blogs, articles (EN labels)', () => {
    renderBar('all', 'en');
    const all = screen.getByTestId('filter-all');
    const blogs = screen.getByTestId('filter-blogs');
    const articles = screen.getByTestId('filter-articles');
    expect(all).toHaveTextContent('all');
    expect(blogs).toHaveTextContent('blogs');
    expect(articles).toHaveTextContent('articles');
  });

  it('uses NL labels when locale=nl', () => {
    renderBar('all', 'nl');
    expect(screen.getByTestId('filter-all')).toHaveTextContent('alle');
    expect(screen.getByTestId('filter-blogs')).toHaveTextContent('blogs');
    expect(screen.getByTestId('filter-articles')).toHaveTextContent('artikelen');
  });

  it('uses correct hrefs per locale', () => {
    renderBar('all', 'en');
    expect(screen.getByTestId('filter-all')).toHaveAttribute('href', '/en/articles');
    expect(screen.getByTestId('filter-blogs')).toHaveAttribute('href', '/en/articles?type=blog');
    expect(screen.getByTestId('filter-articles')).toHaveAttribute(
      'href',
      '/en/articles?type=article',
    );
  });

  it('marks "all" active when currentType="all"', () => {
    renderBar('all', 'en');
    const all = screen.getByTestId('filter-all');
    expect(all).toHaveAttribute('aria-current', 'page');
    expect(all.className).toContain('text-accent-green');
    expect(screen.getByTestId('filter-blogs')).not.toHaveAttribute('aria-current');
  });

  it('marks "blogs" active when currentType="blog"', () => {
    renderBar('blog', 'en');
    const blogs = screen.getByTestId('filter-blogs');
    expect(blogs).toHaveAttribute('aria-current', 'page');
    expect(blogs.className).toContain('text-accent-green');
    expect(screen.getByTestId('filter-all')).not.toHaveAttribute('aria-current');
  });

  it('marks "articles" active when currentType="article"', () => {
    renderBar('article', 'en');
    const articles = screen.getByTestId('filter-articles');
    expect(articles).toHaveAttribute('aria-current', 'page');
    expect(articles.className).toContain('text-accent-green');
  });
});
