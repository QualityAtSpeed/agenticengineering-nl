import { setRequestLocale, getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { TrainingId } from '@/data/trainings';
import { TrainingDetail } from '@/components/TrainingDetail';
import { buildPageMetadata } from '@/lib/page-metadata';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; trainingId: TrainingId }>;
}) {
  const { locale, trainingId } = await params;
  const t = await getTranslations({ locale, namespace: 'trainings' });
  // Per-training title/description from the catalogue copy — high-intent keywords.
  return buildPageMetadata({
    locale,
    path: `/trainings/${trainingId}`,
    title: `${t(`${trainingId}.name`)} · agentic engineering`,
    description: t(`${trainingId}.tagline`),
  });
}

// Prices are time-dependent (early-bird deadlines enforced against `now`).
// Revalidate hourly so the shown price stays in sync with the checkout.
export const revalidate = 3600;

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
