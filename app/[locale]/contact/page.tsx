import { setRequestLocale, getTranslations } from 'next-intl/server';
import { ContactForm } from '@/components/ContactForm';
import type { Locale } from '@/i18n/routing';

type Props = {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ training?: 'basic' | 'advanced' }>;
};

export default async function ContactPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { training } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations('contact');

  return (
    <main className="px-6 py-20">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-text-primary font-mono text-4xl">
          <span className="text-accent-green">&gt;</span> {t('title')}
        </h1>
        <p className="text-text-muted mt-4">{t('intro')}</p>
        <div className="mt-10">
          <ContactForm defaultTraining={training === 'advanced' ? 'advanced' : 'basic'} />
        </div>
      </div>
    </main>
  );
}
