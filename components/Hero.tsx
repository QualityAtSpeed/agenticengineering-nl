import Link from 'next/link';

type HeroProps = {
  kicker: string;
  title: string;
  subtitle: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
};

export function Hero({ kicker, title, subtitle, primaryCta, secondaryCta }: HeroProps) {
  return (
    <section className="px-6 py-24 sm:py-32 lg:py-40">
      <div className="mx-auto max-w-5xl">
        <p className="text-text-muted font-mono text-xs tracking-[0.2em] uppercase">{kicker}</p>
        <h1 className="text-text-primary mt-6 font-mono [font-size:clamp(2rem,6vw,4.5rem)] leading-[1.05] font-bold">
          <span className="text-accent-green">&gt;</span> {title}
        </h1>
        <p className="text-text-muted mt-6 max-w-2xl text-lg">{subtitle}</p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href={primaryCta.href}
            className="bg-accent-green text-bg-base inline-flex items-center gap-2 rounded-sm px-5 py-3 font-mono text-sm font-semibold transition hover:brightness-110"
          >
            {primaryCta.label}
          </Link>
          <Link
            href={secondaryCta.href}
            className="border-border-subtle text-text-primary hover:border-accent-blue hover:text-accent-blue inline-flex items-center gap-2 rounded-sm border px-5 py-3 font-mono text-sm transition"
          >
            → {secondaryCta.label}
          </Link>
        </div>
      </div>
    </section>
  );
}
