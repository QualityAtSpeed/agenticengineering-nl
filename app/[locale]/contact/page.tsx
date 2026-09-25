import { setRequestLocale, getTranslations } from 'next-intl/server';
import { ContactForm } from '@/components/ContactForm';
import { PageHeader } from '@/components/PageHeader';
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
    <main>
      <PageHeader title={t('title')} intro={t('intro')} width="max-w-2xl" />
      <div className="px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl">
          <ContactForm defaultTraining={training === 'advanced' ? 'advanced' : 'basic'} />
        </div>
      </div>
    </main>
  );
}
