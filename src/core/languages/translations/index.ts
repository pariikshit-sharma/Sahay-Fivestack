import { en } from "./en";
import { hi } from "./hi";
import { TranslationStrings } from "./types";

export const translations: Record<string, TranslationStrings> = {
  hi,
  en,
};

export function getTranslations(lang: string = "hi"): TranslationStrings {
  return translations[lang] || translations["hi"];
}

export * from "./types";
