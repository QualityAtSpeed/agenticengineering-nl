import { setRequestLocale, getTranslations } from 'next-intl/server';
import { InstructorCard } from '@/components/InstructorCard';
import { PageHeader } from '@/components/PageHeader';
import { instructors } from '@/data/instructors';
import { metadataFor } from '@/lib/page-metadata';
import type { Locale } from '@/i18n/routing';

export const generateMetadata = metadataFor('/about', 'pages.about');

export default async function About({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('about');

  return (
    <main>
      <PageHeader title={t('title')} intro={t('intro')} width="max-w-3xl" />
      <div className="px-6 py-16 sm:py-20">
        <div className="mx-auto grid max-w-3xl gap-6 md:grid-cols-2">
          {instructors.map((i) => (
            <InstructorCard key={i.id} id={i.id} />
          ))}
        </div>
      </div>
    </main>
  );
}
