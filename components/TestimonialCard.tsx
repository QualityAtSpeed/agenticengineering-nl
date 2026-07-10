import type { Testimonial } from '@/data/testimonials';
import { useLocale, useTranslations } from 'next-intl';

export function TestimonialCard({
  quoteNL,
  quoteEN,
  name,
  role,
  translatedFrom,
}: Omit<Testimonial, 'id'>) {
  const locale = useLocale();
  const t = useTranslations('testimonials');
  const quote = locale === 'nl' ? quoteNL : quoteEN;
  const isTranslated = translatedFrom !== undefined && locale !== translatedFrom;
  const translatedFromKey = translatedFrom === 'nl' ? 'translatedFromNL' : 'translatedFromEN';

  return (
    <article className="border-border-subtle border-l-accent-green bg-bg-elevated flex h-full flex-col justify-between rounded-md border border-l-4 p-8">
      <blockquote className="text-text-primary text-lg leading-relaxed">{quote}</blockquote>
      <cite className="mt-6 font-mono text-sm not-italic">
        <span className="block">
          <span className="text-accent-green">+ </span>
          <span className="text-text-soft">{name}</span>
        </span>
        <span className="text-text-muted block">{role}</span>
        {isTranslated && <span className="text-text-muted mt-1 block">{t(translatedFromKey)}</span>}
      </cite>
    </article>
  );
}
