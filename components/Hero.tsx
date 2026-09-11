import { Button } from '@/components/Button';
import styles from './HeroBackground.module.css';

type HeroProps = {
  kicker: string;
  title: string;
  subtitle: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
};

const ArrowIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" className="shrink-0">
    <path
      d="M1 7h12M8 2l5 5-5 5"
      stroke="currentColor"
      strokeWidth="1.8"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export function Hero({ kicker, title, subtitle, primaryCta, secondaryCta }: HeroProps) {
  return (
    <section className="relative overflow-hidden px-6 py-24 sm:py-28 lg:py-32">
      <div aria-hidden className={`pointer-events-none opacity-60 ${styles.fade}`}>
        <div className={styles.background} />
      </div>
      <div className="relative mx-auto max-w-4xl">
        <p className="text-text-muted text-xs font-medium tracking-[0.12em] uppercase">{kicker}</p>
        <h1 className="text-brand-deep mt-5 max-w-[20ch] text-4xl leading-[1.1] font-bold tracking-tight sm:text-5xl lg:text-[3.25rem]">
          {title}
        </h1>
        <p className="text-text-soft mt-6 max-w-[56ch] text-lg">{subtitle}</p>
        <div className="mt-9 flex flex-wrap items-center gap-3">
          <Button href={primaryCta.href} data-testid="hero-cta-primary">
            {primaryCta.label}
            <ArrowIcon />
          </Button>
          {secondaryCta && (
            <Button variant="secondary" href={secondaryCta.href} data-testid="hero-cta-secondary">
              {secondaryCta.label}
              <ArrowIcon />
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
