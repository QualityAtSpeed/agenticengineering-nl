import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { Blog } from '@/lib/blogs';
import type { Locale } from '@/i18n/routing';

export function BlogCard({ blog, locale }: { blog: Blog; locale: Locale }) {
  const t = useTranslations('blogs');
  const content = blog[locale];

  return (
    <article className="border-border-subtle hover:border-brand group flex h-full flex-col gap-2 rounded-md border bg-white p-5 transition-colors">
      <p className="text-brand text-xs font-bold tracking-wider uppercase">{blog.date}</p>
      <h3 className="text-text-primary group-hover:text-brand text-lg font-bold">
        {content.title}
      </h3>
      <p className="text-text-soft flex-1 text-sm">{content.summary}</p>
      <Link
        href={`/${locale}/articles/${blog.slug}`}
        data-testid={`blog-link-${blog.slug}`}
        className="text-brand hover:text-brand-deep mt-auto inline-flex items-center gap-1 text-sm font-semibold"
      >
        {t('readMore')} →
      </Link>
    </article>
  );
}
