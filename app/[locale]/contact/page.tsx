import { setRequestLocale, getTranslations } from 'next-intl/server';
import { ContactForm } from '@/components/ContactForm';
import { metadataFor } from '@/lib/page-metadata';
import type { Locale } from '@/i18n/routing';

type Props = {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ training?: 'basic' | 'advanced' }>;
};

export const generateMetadata = metadataFor('/contact', 'pages.contact');

export default async function ContactPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { training } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations('contact');

  return (
    <main className="px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-brand-deep text-3xl font-bold sm:text-4xl">{t('title')}</h1>
        <p className="text-text-soft mt-3 text-lg">{t('intro')}</p>
        <div className="mt-10">
          <ContactForm defaultTraining={training === 'advanced' ? 'advanced' : 'basic'} />
        </div>
      </div>
    </main>
  );
}
