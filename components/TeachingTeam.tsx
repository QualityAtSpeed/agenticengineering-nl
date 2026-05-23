import { useTranslations } from 'next-intl';
import { InstructorCard } from '@/components/InstructorCard';
import type { InstructorId } from '@/data/instructors';

export function TeachingTeam({ ids }: { ids: InstructorId[] }) {
  const t = useTranslations('trainings.labels');
  return (
    <div>
      <h3 className="text-text-muted font-mono text-xs tracking-[0.2em] uppercase">
        {t('taughtBy')}
      </h3>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {ids.map((id) => (
          <InstructorCard key={id} id={id} />
        ))}
      </div>
    </div>
  );
}
