import { setRequestLocale, getTranslations } from 'next-intl/server';
import { InstructorCard } from '@/components/InstructorCard';
import { instructors } from '@/data/instructors';
import { buildPageMetadata } from '@/lib/page-metadata';
import type { Locale } from '@/i18n/routing';

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return buildPageMetadata({
    locale,
    path: '/about',
    title: t('pages.about.title'),
    description: t('pages.about.description'),
  });
}

export default async function About({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('about');

  return (
    <main className="px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-brand-deep text-3xl font-bold sm:text-4xl">{t('title')}</h1>
        <p className="text-text-soft mt-3 text-lg">{t('intro')}</p>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {instructors.map((i) => (
            <InstructorCard key={i.id} id={i.id} />
          ))}
        </div>
      </div>
    </main>
  );
}
