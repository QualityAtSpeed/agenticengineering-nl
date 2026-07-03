import type { Testimonial } from '@/data/testimonials';

export function TestimonialCard({ quote, name, role }: Omit<Testimonial, 'id'>) {
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
