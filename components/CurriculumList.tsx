import { useTranslations } from 'next-intl';
import type { Module } from '@/data/trainings';

export function CurriculumList({ modules }: { modules: Module[] }) {
  const t = useTranslations('modules');
  return (
    <ol className="space-y-6">
      {modules.map((m, i) => {
        const titleKey = `${m.id}.title` as const;
        const bulletsKey = `${m.id}.bullets` as const;
        const bullets = (t.raw(bulletsKey) as string[]) ?? [];
        return (
          <li key={m.id} className="border-border-subtle border-l-2 pl-5">
            <p className="text-text-muted font-mono text-xs">{String(i + 1).padStart(2, '0')}</p>
            <h4 className="text-text-primary mt-1 font-mono text-lg">
              <span className="text-accent-green">&gt;</span> {t(titleKey)}
            </h4>
            <ul className="text-text-muted mt-3 space-y-1 text-sm">
              {bullets.map((b) => (
                <li key={b}>· {b}</li>
              ))}
            </ul>
          </li>
        );
      })}
    </ol>
  );
}
