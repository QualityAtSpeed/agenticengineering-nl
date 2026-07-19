import { setRequestLocale } from 'next-intl/server';
import { BookPage } from '@/components/BookPage';
import type { Locale } from '@/i18n/routing';
import type { Metadata } from 'next';

// Transactional checkout page — keep it out of the index (and out of any
// duplicate-canonical clustering) instead of letting it self-canonicalize.
export const metadata: Metadata = { robots: { index: false } };

type Props = { params: Promise<{ locale: Locale }> };

export default async function DiscountAug26BookingPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return BookPage({ trainingId: 'discount-aug-26', locale });
}
