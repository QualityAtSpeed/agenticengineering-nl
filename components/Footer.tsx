import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';

export async function Footer({ locale }: { locale: Locale }) {
  const t = await getTranslations('footer');
  return (
    <footer className="border-border-subtle bg-bg-elevated border-t px-6 py-12">
      <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-4">
        <div>
          <p className="text-text-primary font-mono text-sm">agentic·engineering</p>
          <p className="text-text-muted mt-2 text-xs">{t('tagline')}</p>
        </div>
        <div>
          <p className="text-text-muted font-mono text-xs tracking-[0.2em] uppercase">Pages</p>
          <ul className="mt-3 space-y-1 text-sm">
            <li>
              <Link href={`/${locale}/about`} className="text-text-primary hover:text-accent-blue">
                About
              </Link>
            </li>
            <li>
              <Link
                href={`/${locale}/contact`}
                className="text-text-primary hover:text-accent-blue"
              >
                Contact
              </Link>
            </li>
            <li>
              <Link
                href={`/${locale}/impressum`}
                className="text-text-primary hover:text-accent-blue"
              >
                {t('impressumLink')}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-text-muted font-mono text-xs tracking-[0.2em] uppercase">Socials</p>
          <ul className="mt-3 space-y-1 text-sm">
            <li>
              <a
                href="https://github.com/"
                rel="noopener noreferrer"
                target="_blank"
                className="text-text-primary hover:text-accent-blue"
              >
                {t('github')}
              </a>
            </li>
            <li>
              <a
                href="https://linkedin.com/"
                rel="noopener noreferrer"
                target="_blank"
                className="text-text-primary hover:text-accent-blue"
              >
                {t('linkedin')}
              </a>
            </li>
            <li>
              <a
                href="https://x.com/"
                rel="noopener noreferrer"
                target="_blank"
                className="text-text-primary hover:text-accent-blue"
              >
                {t('x')}
              </a>
            </li>
          </ul>
        </div>
        <div className="text-text-muted font-mono text-xs sm:text-right">
          <p>{t('rights')}</p>
        </div>
      </div>
    </footer>
  );
}
