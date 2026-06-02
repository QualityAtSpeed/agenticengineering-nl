import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { instructors, type InstructorId } from '@/data/instructors';

export function InstructorCard({ id }: { id: InstructorId }) {
  const t = useTranslations(`about.instructors.${id}`);
  const name = t('name');
  const photo = instructors.find((i) => i.id === id)?.photo;
  return (
    <article className="border-border-subtle hover:border-brand bg-bg-base flex items-start gap-4 rounded-md border p-5 transition-colors">
      {photo && (
        <Image
          src={photo}
          alt={name}
          width={64}
          height={64}
          className="ring-brand-soft h-16 w-16 shrink-0 rounded-full object-cover ring-4"
        />
      )}
      <div>
        <h3 className="text-text-primary text-base font-bold">{name}</h3>
        <p className="text-text-muted text-sm">{t('role')}</p>
        <p className="text-text-soft mt-2 text-sm">{t('bio')}</p>
      </div>
    </article>
  );
}
