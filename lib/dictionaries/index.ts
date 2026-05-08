import type { Locale } from "../i18n";
import { en, type Dictionary } from "./en";
import { es } from "./es";

const dictionaries: Record<Locale, Dictionary> = { en, es };

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale];
}

export type { Dictionary };
