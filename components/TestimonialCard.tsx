import type { Testimonial } from '@/data/testimonials';
import { useLocale } from 'next-intl';

export function TestimonialCard({ quoteNL, quoteEN, name, role }: Omit<Testimonial, 'id'>) {
  const locale = useLocale();
  const quote = locale === 'nl' ? quoteNL : quoteEN;
  return (
    <article className="border-border-subtle border-l-accent-green bg-bg-elevated flex flex-col rounded-md border border-l-4 p-8">
      <blockquote className="text-text-primary text-lg leading-relaxed">{quote}</blockquote>
      <cite className="mt-6 font-mono text-sm not-italic">
        <span className="text-accent-green">+ </span>
        <span className="text-text-soft">{name}</span>
        <span className="text-text-muted"> · {role}</span>
      </cite>
    </article>
  );
}
