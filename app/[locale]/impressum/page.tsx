import { setRequestLocale, getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { metadataFor } from '@/lib/page-metadata';

export const generateMetadata = metadataFor('/impressum', 'pages.impressum');

export default async function Impressum({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('impressum');

  return (
    <main className="px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-brand-deep text-3xl font-bold sm:text-4xl">{t('title')}</h1>
        <dl className="mt-10 space-y-3">
          <Row label="Business" value={t('businessName')} />
          <Row label="Address" value={t('address')} />
          <Row label="KVK" value={t('kvk')} />
          <Row label="VAT" value={t('vat')} />
          <Row label="Email" value={t('email')} />
        </dl>
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap gap-x-4">
      <dt className="text-text-muted w-32">{label}</dt>
      <dd className="text-text-primary">{value}</dd>
    </div>
  );
}
