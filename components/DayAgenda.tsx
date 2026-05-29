import { useTranslations } from 'next-intl';
import type { Module } from '@/data/trainings';

export function DayAgenda({ label, modules }: { label?: string; modules: Module[] }) {
  const t = useTranslations('modules');
  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2 text-sm">
      {label && (
        <span className="text-brand shrink-0 text-xs font-bold tracking-wider uppercase">
          {label}
        </span>
      )}
      {modules.map((m, i) => (
        <span key={m.id} className="text-text-primary">
          {i > 0 && <span className="text-text-muted mr-3">·</span>}
          <span className="text-text-muted mr-1 tabular-nums">
            {String(i + 1).padStart(2, '0')}
          </span>
          {t(`${m.id}.short`)}
        </span>
      ))}
    </div>
  );
}
