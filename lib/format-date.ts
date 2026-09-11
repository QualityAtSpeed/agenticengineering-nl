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

// Formats a training's date range for the human-facing label, e.g. "29 en 30 juni
// 2026" (nl). A same-month range collapses the first date to its day number; a
// cross-month range spells out both months. The conjunction comes from the locale
// (Intl.ListFormat) and dates are parsed in UTC (see formatTrainingDate).
export function formatTrainingDateRange(startIso: string, endIso: string, locale: string): string {
  const tag = LOCALE_TAG[locale] ?? locale;
  const start = new Date(startIso);
  const end = new Date(endIso);
  const day = new Intl.DateTimeFormat(tag, { day: 'numeric', timeZone: 'UTC' });
  const dayMonth = new Intl.DateTimeFormat(tag, { day: 'numeric', month: 'long', timeZone: 'UTC' });
  const full = new Intl.DateTimeFormat(tag, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
  if (startIso === endIso) return full.format(start);
  const join = (a: string, b: string) =>
    new Intl.ListFormat(tag, { type: 'conjunction' }).format([a, b]);
  const sameYear = start.getUTCFullYear() === end.getUTCFullYear();
  const sameMonth = sameYear && start.getUTCMonth() === end.getUTCMonth();
  if (sameMonth) return join(day.format(start), full.format(end));
  if (sameYear) return join(dayMonth.format(start), full.format(end));
  return join(full.format(start), full.format(end));
}
