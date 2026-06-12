import Image from 'next/image';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';

export async function Footer({ locale }: { locale: Locale }) {
  const t = await getTranslations('footer');
  const tNav = await getTranslations('nav');
  return (
    <footer className="border-border-subtle bg-bg-elevated border-t">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 sm:grid-cols-4">
        <div>
          <div className="text-text-primary inline-flex items-center gap-2 text-sm font-bold">
            <Image src="/brand-icon.svg" alt="" width={22} height={22} aria-hidden />
            agentic·engineering
          </div>
          <p className="text-text-muted mt-3 text-sm">{t('tagline')}</p>
          <p className="text-text-muted mt-2 text-sm">
            <a
              href={`https://qualityatspeed.nl/${locale}`}
              data-testid="footer-qas"
              className="hover:text-brand underline"
            >
              {t('qasAttribution')}
            </a>
          </p>
        </div>
        <div>
          <p className="text-text-muted text-xs font-bold tracking-wider uppercase">
            {t('pagesHeading')}
          </p>
          <ul className="mt-3 space-y-1.5 text-sm">
            <li>
              <Link
                href={`/${locale}/about`}
                data-testid="footer-about"
                className="text-text-soft hover:text-brand"
              >
                {tNav('about')}
              </Link>
            </li>
            <li>
              <Link
                href={`/${locale}/contact`}
                data-testid="footer-contact"
                className="text-text-soft hover:text-brand"
              >
                {tNav('contact')}
              </Link>
            </li>
            <li>
              <Link
                href={`/${locale}/impressum`}
                data-testid="footer-impressum"
                className="text-text-soft hover:text-brand inline-flex items-center gap-1.5"
              >
                <Image src="/qas-icon.svg" alt="" width={14} height={14} aria-hidden />
                {t('impressumLink')}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-text-muted text-xs font-bold tracking-wider uppercase">
            {t('socialsHeading')}
          </p>
          <ul className="mt-3 space-y-1.5 text-sm">
            <li>
              <a
                href="https://github.com/QualityAtSpeed"
                rel="noopener noreferrer"
                target="_blank"
                data-testid="footer-github"
                className="text-text-soft hover:text-brand"
              >
                {t('github')}
              </a>
            </li>
            <li>
              <a
                href="https://linkedin.com/company/quality-speed-nl"
                rel="noopener noreferrer"
                target="_blank"
                data-testid="footer-linkedin"
                className="text-text-soft hover:text-brand"
              >
                {t('linkedin')}
              </a>
            </li>
          </ul>
        </div>
        <div className="text-text-muted text-xs sm:text-right">
          <p>{t('rights')}</p>
        </div>
      </div>
    </footer>
  );
}
