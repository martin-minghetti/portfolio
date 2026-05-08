export const locales = ["en", "es"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function detectLocaleFromAcceptLanguage(header: string | null): Locale {
  if (!header) return defaultLocale;
  const preferred = header
    .split(",")
    .map((entry) => entry.trim().split(";")[0].toLowerCase())
    .find((tag) => tag.startsWith("es") || tag.startsWith("en"));
  if (!preferred) return defaultLocale;
  if (preferred.startsWith("es")) return "es";
  return "en";
}
