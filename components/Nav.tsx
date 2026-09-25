import Image from 'next/image';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { LangSwitcher } from './LangSwitcher';
import { MobileMenu } from './MobileMenu';
import { ISLAND } from './nav-styles';
import type { Locale } from '@/i18n/routing';

const LINK =
  'text-text-soft hover:text-brand hover:bg-bg-tint rounded-xl px-3.5 py-2 font-medium transition-colors hover:no-underline';

export async function Nav({ locale }: { locale: Locale }) {
  const t = await getTranslations('nav');
  return (
    // h-0: floats over the first section and takes no height. Every page starts
    // with a dark band (Hero / PageHeader) with enough top padding for it.
    <div className="surface-dark sticky top-0 z-20 h-0 bg-transparent">
      {/* pointer-events-none: the full-width row must not block clicks on content beside the island. */}
      <div className="pointer-events-none flex justify-center px-3 pt-3 sm:pt-3.5">
        {/* One centred island: brand, links and language switch. Mobile: brand + menu button. */}
        <nav
          className={`${ISLAND} pointer-events-auto relative flex w-full items-center justify-between gap-4 px-3 py-1.5 sm:w-auto sm:justify-start sm:gap-2 sm:py-1.5 sm:pr-1.5 sm:pl-4`}
        >
          <Link
            href={`/${locale}`}
            data-testid="nav-brand"
            className="text-text-primary inline-flex shrink-0 items-center gap-2 text-base font-bold hover:no-underline sm:mr-2"
          >
            <Image src="/brand-icon.svg" alt="" width={28} height={28} aria-hidden />
            {t('brand')}
          </Link>
          <div data-testid="nav-links" className="hidden items-center gap-1 text-sm sm:flex">
            <Link href={`/${locale}/articles`} data-testid="nav-articles" className={LINK}>
              {t('articles')}
            </Link>
            <Link href={`/${locale}/trainings`} data-testid="nav-trainings" className={LINK}>
              {t('trainings')}
            </Link>
            <Link href={`/${locale}/about`} data-testid="nav-about" className={LINK}>
              {t('about')}
            </Link>
            <Link href={`/${locale}/faq`} data-testid="nav-faq" className={LINK}>
              {t('faq')}
            </Link>
            <Link href={`/${locale}/contact`} data-testid="nav-contact" className={LINK}>
              {t('contact')}
            </Link>
          </div>
          <div
            data-testid="nav-lang"
            className="border-border-subtle hidden items-center border-l px-3 py-2 sm:inline-flex"
          >
            <LangSwitcher currentLocale={locale} />
          </div>
          <MobileMenu locale={locale} />
        </nav>
      </div>
    </div>
  );
}
