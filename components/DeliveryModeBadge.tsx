import { useTranslations } from 'next-intl';

// Zichtbaar label dat aangeeft of een training online, op locatie, of allebei
// wordt gegeven. Gestuurd door `schedule.courseMode` ('online' / 'inPerson') —
// dezelfde bron als de schema.org-data. Trainingen zonder vaste modus (de
// evergreen Basic/Advanced) hebben geen courseMode en tonen dus niets.
export function DeliveryModeBadge({ courseMode }: { courseMode?: string[] }) {
  const t = useTranslations('trainings.labels');
  const online = courseMode?.includes('online') ?? false;
  const inPerson = courseMode?.includes('inPerson') ?? false;
  if (!online && !inPerson) return null;
  const key =
    online && inPerson ? 'deliveryOnlineOnsite' : online ? 'deliveryOnline' : 'deliveryOnsite';
  return (
    <span
      className="bg-brand-soft text-brand-deep inline-block rounded-full px-2.5 py-0.5 text-xs font-bold tracking-wider uppercase"
      data-testid="delivery-mode-badge"
    >
      {t(key)}
    </span>
  );
}
