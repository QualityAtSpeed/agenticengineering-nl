import { useTranslations } from 'next-intl';
import { testimonials } from '@/data/testimonials';
import { testimonialsEnabled } from '@/lib/flags';
import { TestimonialCard } from '@/components/TestimonialCard';

export function TestimonialsSection() {
  const t = useTranslations('testimonials');
  if (!testimonialsEnabled() || testimonials.length === 0) return null;

  return (
    <section className="border-border-subtle border-b px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 max-w-2xl">
          <h2 className="text-brand text-2xl font-bold sm:text-3xl">{t('title')}</h2>
          <p className="text-text-soft mt-2 text-base">{t('lede')}</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {testimonials.map((tm) => (
            <TestimonialCard key={tm.id} quote={tm.quote} name={tm.name} role={tm.role} />
          ))}
        </div>
      </div>
    </section>
  );
}
