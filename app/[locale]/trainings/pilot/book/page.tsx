import { setRequestLocale } from 'next-intl/server';
import { BookPage } from '@/components/BookPage';
import type { Locale } from '@/i18n/routing';

type Props = { params: Promise<{ locale: Locale }> };

export default async function PilotBookingPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return BookPage({ trainingId: 'pilot', locale });
}
