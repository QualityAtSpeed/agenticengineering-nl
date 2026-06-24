import type { Testimonial } from '@/data/testimonials';

export function TestimonialCard({ quote, name, role }: Omit<Testimonial, 'id'>) {
  return (
    <article className="border-border-subtle hover:border-brand bg-bg-base flex flex-col rounded-md border p-5 transition-colors">
      <blockquote className="text-text-primary text-base leading-relaxed">{quote}</blockquote>
      <cite className="text-text-muted mt-4 text-sm font-medium not-italic">
        {name} — {role}
      </cite>
    </article>
  );
}
