import { setRequestLocale, getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import type { Metadata } from 'next';
import { trainings } from '@/data/trainings';
import { formatTrainingDate } from '@/lib/format-date';

// Transactional confirmation page — keep it out of the index (and out of any
// duplicate-canonical clustering) instead of letting it self-canonicalize.
export const metadata: Metadata = { robots: { index: false } };

type Props = { params: Promise<{ locale: Locale }> };

export default async function BookingSuccessPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('booking');
  // Show the start date of the training that was actually booked, not a hardcoded one.
  const { schedule } = trainings.pilot;
  const date = schedule ? formatTrainingDate(schedule.startDate, locale) : '';

  return (
    <main className="px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-2xl">
        <div
          className="border-accent-green/30 bg-accent-green/10 rounded-md border p-6"
          data-testid="booking-success"
        >
          <h1 className="text-accent-green-hover text-2xl font-bold">{t('success.title')}</h1>
          <p className="text-text-soft mt-2 text-lg">{t('success.body', { date })}</p>
        </div>
      </div>
    </main>
  );
}
