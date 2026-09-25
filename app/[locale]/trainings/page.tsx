import { setRequestLocale, getTranslations } from 'next-intl/server';
import { TrainingCard } from '@/components/TrainingCard';
import { PageHeader } from '@/components/PageHeader';
import { metadataFor } from '@/lib/page-metadata';
import type { Locale } from '@/i18n/routing';
import type { TrainingId } from '@/data/trainings';

export const generateMetadata = metadataFor('/trainings', 'pages.trainings');

// Prices are time-dependent (early-bird deadlines enforced against `now`).
// Revalidate hourly so the shown price stays in sync with the checkout.
export const revalidate = 3600;

//hardcoded order of trainings. Basic is temporarily hidden for now.
const DISPLAYED_TRAININGS: TrainingId[] = ['basic-nov-26', 'advanced'];

export default async function TrainingsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('trainings');

  return (
    <main>
      <PageHeader title={t('sectionTitle')} />
      <div className="px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl">
          {DISPLAYED_TRAININGS.map((id) => (
            <TrainingCard key={id} trainingId={id} locale={locale} />
          ))}
        </div>
      </div>
    </main>
  );
}
