import { setRequestLocale, getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { JsonLd } from '@/components/JsonLd';
import { buildFaqJsonLd, type FaqItem } from '@/lib/structured-data';
import { metadataFor } from '@/lib/page-metadata';
import type { Locale } from '@/i18n/routing';

export const generateMetadata = metadataFor('/faq', 'pages.faq');

export default async function Faq({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('faq');
  const items = t.raw('items') as FaqItem[];

  return (
    <main className="px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <JsonLd data={buildFaqJsonLd(items)} />
        <h1 className="text-brand-deep text-3xl font-bold sm:text-4xl">{t('title')}</h1>
        <p className="text-text-soft mt-3 text-lg">{t('intro')}</p>
        <div className="divide-border-subtle border-border-subtle mt-12 divide-y border-y">
          {items.map((item) => (
            <details key={item.question} className="group py-4">
              <summary className="text-text-primary flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                {item.question}
                <span
                  aria-hidden
                  className="text-text-muted transition-transform group-open:rotate-90"
                >
                  ›
                </span>
              </summary>
              <p className="text-text-soft mt-3 text-sm leading-relaxed">{item.answer}</p>
            </details>
          ))}
        </div>
        <p className="text-text-soft mt-10">
          {t('ctaLabel')}{' '}
          <Link
            href={`/${locale}/contact`}
            data-testid="faq-contact-link"
            className="text-brand font-medium hover:underline"
          >
            {t('ctaLink')}
          </Link>
        </p>
      </div>
    </main>
  );
}
