import { setRequestLocale, getTranslations } from 'next-intl/server';
import { TrainingCard } from '@/components/TrainingCard';
import { metadataFor } from '@/lib/page-metadata';
import type { Locale } from '@/i18n/routing';
import type { TrainingId } from '@/data/trainings';

export const generateMetadata = metadataFor('/trainings', 'pages.trainings');

// Zichtbare trainings op /trainings, in volgorde. Basic blijft in de data (detail-route +
// template voor de cohorts), maar staat niet meer als kaart — discount-aug-26 neemt z'n plek in.
const DISPLAYED_TRAININGS: TrainingId[] = ['pilot', 'discount-aug-26', 'advanced'];

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
