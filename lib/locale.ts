import { routing, type Locale } from '@/i18n/routing';

// Narrows an untrusted value to a supported locale, falling back to the default.
// Keeps user-supplied input out of redirect URLs unless it's a known locale.
export function toLocale(value: unknown): Locale {
  return routing.locales.includes(value as Locale) ? (value as Locale) : routing.defaultLocale;
}
