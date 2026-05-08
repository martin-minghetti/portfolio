import type { Locale } from "../i18n";
import { en } from "./en";
import { es } from "./es";
import type { Dictionary } from "./types";

const dictionaries: Record<Locale, Dictionary> = { en, es };

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale];
}

export type { Dictionary };
