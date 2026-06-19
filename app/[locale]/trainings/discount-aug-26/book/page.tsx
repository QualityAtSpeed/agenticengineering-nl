import { setRequestLocale, getTranslations } from 'next-intl/server';
import { BookingForm } from '@/components/BookingForm';
import type { Locale } from '@/i18n/routing';

type Props = { params: Promise<{ locale: Locale }> };

export default async function DiscountAug26BookingPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('booking');

  return (
    <main className="px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-brand-deep text-3xl font-bold sm:text-4xl">{t('title')}</h1>
        <p className="text-text-soft mt-3 text-lg">{t('intro')}</p>
        <div className="mt-10">
          <BookingForm locale={locale} trainingId="discount-aug-26" />
        </div>
      </div>
    </main>
  );
}
