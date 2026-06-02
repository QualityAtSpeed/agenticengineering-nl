import Image from 'next/image';
import { useTranslations } from 'next-intl';
import type { Article } from '@/lib/articles';
import type { Locale } from '@/i18n/routing';

const FALLBACK_IMAGE = '/qas-icon.svg';

export function TimelineEntryRow({ article, locale }: { article: Article; locale: Locale }) {
  const t = useTranslations('articles');
  const title = locale === 'nl' ? article.titleNl : article.titleEn;
  const summary = locale === 'nl' ? article.summaryNl : article.summaryEn;
  const image = article.image ?? FALLBACK_IMAGE;

  return (
    <li className="relative pb-10 last:pb-0" data-testid={`article-card-${article.slug}`}>
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        data-testid={`article-link-${article.slug}`}
        className="group block hover:no-underline"
      >
        <p className="text-brand text-xs font-bold tracking-wider uppercase">
          {article.date} <span className="text-text-muted">// {t(`type.${article.type}`)}</span>
        </p>
        {article.placedBy && (
          <p className="text-text-muted text-xs">
            {t('placedBy')} {article.placedBy}
          </p>
        )}
        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="border-border-subtle bg-bg-tint relative aspect-[1.91/1] w-full overflow-hidden rounded-md border sm:w-72 sm:flex-shrink-0">
            <Image
              src={image}
              alt={title}
              fill
              sizes="(min-width: 640px) 18rem, 100vw"
              className="object-cover"
            />
          </div>
          <div className="flex-1">
            <h3 className="text-text-primary group-hover:text-brand text-xl font-bold transition-colors group-hover:underline">
              {title}
            </h3>
            <p className="text-text-soft mt-2 max-w-2xl text-[0.9375rem]">{summary}</p>
            <span className="text-brand group-hover:text-brand-deep mt-3 inline-block text-sm font-semibold">
              {t('readExternal')} →
            </span>
          </div>
        </div>
      </a>
    </li>
  );
}
