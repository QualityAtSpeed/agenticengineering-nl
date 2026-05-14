import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { instructors, type InstructorId } from '@/data/instructors';

export function InstructorCard({ id }: { id: InstructorId }) {
  const t = useTranslations(`about.instructors.${id}`);
  const name = t('name');
  const photo = instructors.find((i) => i.id === id)?.photo;
  return (
    <article className="border-border-subtle bg-bg-elevated flex gap-6 rounded-sm border p-6">
      {photo && (
        <Image
          src={photo}
          alt={name}
          width={96}
          height={96}
          className="border-border-subtle h-24 w-24 shrink-0 rounded-sm border object-cover"
        />
      )}
      <div>
        <h3 className="text-text-primary font-mono text-lg">{name}</h3>
        <p className="text-text-muted font-mono text-xs tracking-[0.2em] uppercase">{t('role')}</p>
        <p className="text-text-muted mt-3 text-sm">{t('bio')}</p>
      </div>
    </article>
  );
}
