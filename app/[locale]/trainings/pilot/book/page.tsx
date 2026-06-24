import Link from 'next/link';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { BookingForm } from '@/components/BookingForm';
import { trainings } from '@/data/trainings';
import type { Locale } from '@/i18n/routing';

type Props = { params: Promise<{ locale: Locale }> };

export default async function BookingPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('booking');
  const tTrainings = await getTranslations('trainings');
  const trainingName = tTrainings('pilot.name');
  const isSoldOut = trainings.pilot.soldOut === true;

  return (
    <main className="px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-brand-deep text-3xl font-bold sm:text-4xl">
          {isSoldOut ? t('soldOutHeading') : t('title', { trainingName })}
        </h1>
        {isSoldOut ? (
          <>
            <p className="text-text-soft mt-3 text-lg">{t('soldOutBody')}</p>
            <Link href={`/${locale}/trainings`} className="text-brand mt-6 inline-block underline">
              {t('soldOutBack')}
            </Link>
          </>
        ) : (
          <>
            <p className="text-text-soft mt-3 text-lg">{t('intro', { trainingName })}</p>
            <div className="mt-10">
              <BookingForm locale={locale} />
            </div>
          </>
        )}
      </div>
    </main>
  );
}
