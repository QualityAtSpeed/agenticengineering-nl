import { setRequestLocale, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getBlogs, getBlogBySlug } from '@/lib/blogs';
import { routing, type Locale } from '@/i18n/routing';

export const dynamicParams = false;

export function generateStaticParams() {
  const blogs = getBlogs();
  return routing.locales.flatMap((locale) => blogs.map((b) => ({ locale, slug: b.slug })));
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('blogs');
  const blog = getBlogBySlug(slug);
  if (!blog) notFound();
  const content = blog[locale];

  return (
    <main className="px-6 py-20">
      <article className="mx-auto max-w-3xl">
        <Link
          href={`/${locale}/articles`}
          className="text-accent-blue font-mono text-sm hover:underline"
        >
          {t('backLink')}
        </Link>
        <p className="text-text-muted mt-12 font-mono text-xs tracking-[0.2em] uppercase">
          {blog.date}
          {blog.author ? ` · ${blog.author}` : ''}
        </p>
        <h1 className="text-text-primary mt-3 font-mono text-4xl">
          <span className="text-accent-green">&gt;</span> {content.title}
        </h1>
        <p className="text-text-muted mt-6 text-lg">{content.summary}</p>
        <div className="prose prose-invert mt-12 max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content.body}</ReactMarkdown>
        </div>
      </article>
    </main>
  );
}
