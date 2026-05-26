import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { Blog } from '@/lib/blogs';
import type { Locale } from '@/i18n/routing';

export function BlogCard({ blog, locale }: { blog: Blog; locale: Locale }) {
  const t = useTranslations('blogs');
  const content = blog[locale];

  return (
    <article className="border-border-subtle bg-bg-elevated flex h-full flex-col rounded-sm border p-6">
      <p className="text-text-muted font-mono text-xs tracking-[0.2em] uppercase">{blog.date}</p>
      <h3 className="text-text-primary mt-3 font-mono text-2xl">
        <span className="text-accent-green">&gt;</span> {content.title}
      </h3>
      <p className="text-text-muted mt-3 flex-1 text-sm">{content.summary}</p>
      <Link
        href={`/${locale}/articles/${blog.slug}`}
        data-testid={`blog-link-${blog.slug}`}
        className="text-accent-blue mt-6 inline-flex items-center gap-1 font-mono text-sm hover:underline"
      >
        → {t('readMore')}
      </Link>
    </article>
  );
}
