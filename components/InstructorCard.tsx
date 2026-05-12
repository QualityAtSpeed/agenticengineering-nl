import { useTranslations } from 'next-intl';
import type { InstructorId } from '@/data/instructors';

function Initials({ name }: { name: string }) {
  const letters = name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <div className="border-border-subtle bg-bg-base text-accent-green flex h-24 w-24 items-center justify-center rounded-sm border font-mono text-2xl">
      {letters}
    </div>
  );
}

export function InstructorCard({ id }: { id: InstructorId }) {
  const t = useTranslations(`about.instructors.${id}`);
  const name = t('name');
  return (
    <article className="border-border-subtle bg-bg-elevated flex gap-6 rounded-sm border p-6">
      <Initials name={name} />
      <div>
        <h3 className="text-text-primary font-mono text-lg">{name}</h3>
        <p className="text-text-muted font-mono text-xs tracking-[0.2em] uppercase">{t('role')}</p>
        <p className="text-text-muted mt-3 text-sm">{t('bio')}</p>
      </div>
    </article>
  );
}
