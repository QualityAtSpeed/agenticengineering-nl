import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { Locale } from '@/i18n/routing';

const REPO_URL = 'https://github.com/QualityAtSpeed/agenticengineering-nl';

export function ProofStrip({ locale: _locale }: { locale: Locale }) {
  const t = useTranslations('proof');
  const pills = t.raw('pills') as string[];

  return (
    <section className="border-border-subtle border-t px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-text-primary font-mono text-3xl">
          <span className="text-accent-green">&gt;</span> {t('heading')}
        </h2>
        <p className="text-text-muted mt-3 max-w-2xl">{t('subhead')}</p>

        <ul className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-sm">
          {pills.map((p, i) => (
            <li key={p} className="text-text-primary">
              {i > 0 && <span className="text-accent-green mr-3">·</span>}
              {p}
            </li>
          ))}
        </ul>

        <Link
          href={REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="proof-github-link"
          className="bg-accent-green text-bg-base mt-10 inline-flex items-center gap-2 rounded-sm px-5 py-3 font-mono text-sm font-semibold hover:brightness-110"
        >
          {t('ctaLabel')} →
        </Link>
      </div>
    </section>
  );
}
