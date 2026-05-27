import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { BlogCard } from '@/components/BlogCard';
import type { Blog } from '@/lib/blogs';
import messagesEn from '@/messages/en.json';
import messagesNl from '@/messages/nl.json';

const blog: Blog = {
  slug: 'sample-slug',
  date: '2026-05-12',
  nl: { title: 'NL titel', summary: 'NL samenvatting' },
  en: { title: 'EN title', summary: 'EN summary' },
};

function renderWith(locale: 'nl' | 'en') {
  const messages = locale === 'nl' ? messagesNl : messagesEn;
  return render(
    <NextIntlClientProvider locale={locale} messages={messages}>
      <BlogCard blog={blog} locale={locale} />
    </NextIntlClientProvider>,
  );
}

describe('BlogCard', () => {
  it('renders NL title and summary when locale=nl', () => {
    renderWith('nl');
    expect(screen.getByText('NL titel')).toBeInTheDocument();
    expect(screen.getByText('NL samenvatting')).toBeInTheDocument();
    expect(screen.getByText('2026-05-12')).toBeInTheDocument();
  });

  it('renders EN title and summary when locale=en', () => {
    renderWith('en');
    expect(screen.getByText('EN title')).toBeInTheDocument();
    expect(screen.getByText('EN summary')).toBeInTheDocument();
  });

  it('link points to /{locale}/articles/{slug}', () => {
    renderWith('en');
    const link = screen.getByTestId('blog-link-sample-slug');
    expect(link).toHaveAttribute('href', '/en/articles/sample-slug');
  });

  it('uses locale-specific readMore label', () => {
    renderWith('nl');
    expect(screen.getByTestId('blog-link-sample-slug')).toHaveTextContent('lees post');
  });
});
