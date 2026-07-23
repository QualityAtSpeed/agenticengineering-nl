// Maps app locales to full BCP-47 tags so month names render in the right
// language and order (e.g. "21 September" for en-GB, not US "September 21").
const LOCALE_TAG: Record<string, string> = { nl: 'nl-NL', en: 'en-GB' };

// Formats an ISO date (YYYY-MM-DD) as "D MMMM" in the given app locale, e.g.
// "21 september" (nl) / "21 September" (en). Parsed in UTC so a date-only string
// never shifts a day due to the host timezone.
export function formatTrainingDate(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(LOCALE_TAG[locale] ?? locale, {
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  }).format(new Date(iso));
}
