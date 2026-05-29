import { setRequestLocale, getTranslations } from 'next-intl/server';
import { TrainingCard } from '@/components/TrainingCard';
import type { Locale } from '@/i18n/routing';

export default async function TrainingsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('trainings');

  return (
    <main className="px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-brand-deep text-3xl font-bold sm:text-4xl">{t('sectionTitle')}</h1>
        <TrainingCard trainingId="basic" locale={locale} />
        <TrainingCard trainingId="advanced" locale={locale} />
      </div>
    </main>
  );
}
