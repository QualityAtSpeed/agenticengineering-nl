import { setRequestLocale, getTranslations } from 'next-intl/server';
import { InstructorCard } from '@/components/InstructorCard';
import { instructors } from '@/data/instructors';
import type { Locale } from '@/i18n/routing';

export default async function About({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('about');

  return (
    <main className="px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-text-primary font-mono text-4xl">
          <span className="text-accent-green">&gt;</span> {t('title')}
        </h1>
        <p className="text-text-muted mt-6 max-w-2xl">{t('intro')}</p>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {instructors.map((i) => (
            <InstructorCard key={i.id} id={i.id} />
          ))}
        </div>
      </div>
    </main>
  );
}
