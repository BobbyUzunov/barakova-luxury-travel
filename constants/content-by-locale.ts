import type { Locale } from "./content";
import { contentBg } from "./content-bg";
import { contentEn } from "./content-en";

const contentByLocale = {
  bg: contentBg,
  en: contentEn,
} as const;

export function getSiteContent(locale: Locale) {
  return contentByLocale[locale];
}
