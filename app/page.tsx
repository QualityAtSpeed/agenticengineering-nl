import { Hero } from '@/components/Hero';

export default function Page() {
  return (
    <main>
      <Hero
        kicker="AGENTIC ENGINEERING · NL"
        title="Train je team in agentic engineering."
        subtitle="Twee praktijkgerichte trainingen in Claude Code. Eén dag basis, twee dagen advanced."
        primaryCta={{ label: 'book training', href: '/contact' }}
        secondaryCta={{ label: 'view curriculum', href: '#trainings' }}
      />
    </main>
  );
}
