import Image from 'next/image';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { LangSwitcher } from './LangSwitcher';
import type { Locale } from '@/i18n/routing';

export async function Nav({ locale }: { locale: Locale }) {
  const t = await getTranslations('nav');
  return (
    <nav className="border-border-subtle bg-bg-base/90 sticky top-0 z-10 border-b backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href={`/${locale}`}
          className="text-text-primary inline-flex items-center gap-2 font-mono text-sm"
        >
          <Image src="/brand-icon.svg" alt="" width={20} height={20} aria-hidden />
          {t('brand')}
        </Link>
        <div className="flex items-center gap-6 font-mono text-sm">
          <Link href={`/${locale}/about`} className="text-text-muted hover:text-accent-blue">
            {t('about')}
          </Link>
          <Link href={`/${locale}/contact`} className="text-text-muted hover:text-accent-blue">
            {t('contact')}
          </Link>
          <LangSwitcher currentLocale={locale} />
        </div>
      </div>
    </nav>
  );
}
