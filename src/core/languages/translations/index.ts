import { en } from "./en";
import { hi } from "./hi";
import { bn } from "./bn";
import { ta } from "./ta";
import { te } from "./te";
import { mr } from "./mr";
import { gu } from "./gu";
import { kn } from "./kn";
import { ml } from "./ml";
import { pa } from "./pa";
import { or } from "./or";
import { ur } from "./ur";
import { TranslationStrings } from "./types";

export const translations: Record<string, TranslationStrings> = {
  hi,
  en,
  bn,
  ta,
  te,
  mr,
  gu,
  kn,
  ml,
  pa,
  or,
  ur,
};

export function getTranslations(lang: string = "hi"): TranslationStrings {
  return translations[lang] || translations["hi"];
}

export * from "./types";
