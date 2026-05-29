import { setRequestLocale, getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { TrainingId } from '@/data/trainings';
import { TrainingDetail } from '@/components/TrainingDetail';

export default async function TrainingDetailPage({
  params,
}: {
  params: Promise<{ locale: Locale; trainingId: TrainingId }>;
}) {
  const { locale, trainingId } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('trainings');

  return (
    <main className="px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-brand-deep text-3xl font-bold sm:text-4xl">{t('sectionTitle')}</h1>
        <TrainingDetail trainingId={trainingId} locale={locale} />
      </div>
    </main>
  );
}
