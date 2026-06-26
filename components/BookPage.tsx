import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { BookingForm } from '@/components/BookingForm';
import { trainings } from '@/data/trainings';
import type { BookingInput } from '@/lib/validation';
import type { Locale } from '@/i18n/routing';

// Alleen boekbare trainingen hebben een /book-route (zelfde set als het boeking-schema).
type BookableTrainingId = BookingInput['trainingId'];

// Gedeelde boekpagina-body voor elke boekbare training. De sold-out-guard is
// generiek — hij kijkt naar `trainings[trainingId].soldOut`, niet naar een
// hardcoded cohort. Zo gaat elke /book-route automatisch dicht zodra zijn eigen
// training is uitverkocht; een nieuwe boekbare training erbij vereist geen losse
// guard meer, alleen de juiste `trainingId` doorgeven.
export async function BookPage({
  trainingId,
  locale,
}: {
  trainingId: BookableTrainingId;
  locale: Locale;
}) {
  const t = await getTranslations('booking');
  const tTrainings = await getTranslations('trainings');
  const trainingName = tTrainings(`${trainingId}.name`);
  const isSoldOut = trainings[trainingId].soldOut === true;

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
              <BookingForm locale={locale} trainingId={trainingId} />
            </div>
          </>
        )}
      </div>
    </main>
  );
}
