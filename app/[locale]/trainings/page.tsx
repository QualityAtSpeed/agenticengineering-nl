import { setRequestLocale, getTranslations } from 'next-intl/server';
import { TrainingCard } from '@/components/TrainingCard';
import { metadataFor } from '@/lib/page-metadata';
import type { Locale } from '@/i18n/routing';
import type { TrainingId } from '@/data/trainings';

export const generateMetadata = metadataFor('/trainings', 'pages.trainings');

//hardcoded order of trainings. Basic is temporarily hidden for now.
const DISPLAYED_TRAININGS: TrainingId[] = ['discount-aug-26', 'advanced'];

export default async function TrainingsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('trainings');

  return (
    <main className="px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-brand-deep text-3xl font-bold sm:text-4xl">{t('sectionTitle')}</h1>
        {DISPLAYED_TRAININGS.map((id) => (
          <TrainingCard key={id} trainingId={id} locale={locale} />
        ))}
      </div>
    </main>
  );
}
