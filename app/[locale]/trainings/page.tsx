import { setRequestLocale, getTranslations } from 'next-intl/server';
import { TrainingCard } from '@/components/TrainingCard';
import { buildPageMetadata } from '@/lib/page-metadata';
import type { Locale } from '@/i18n/routing';
import { trainings, type TrainingId } from '@/data/trainings';

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return buildPageMetadata({
    locale,
    path: '/trainings',
    title: t('pages.trainings.title'),
    description: t('pages.trainings.description'),
  });
}

export default async function TrainingsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('trainings');

  return (
    <main className="px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-brand-deep text-3xl font-bold sm:text-4xl">{t('sectionTitle')}</h1>
        {Object.keys(trainings).map((id) => (
          <TrainingCard key={id} trainingId={id as TrainingId} locale={locale} />
        ))}
      </div>
    </main>
  );
}
