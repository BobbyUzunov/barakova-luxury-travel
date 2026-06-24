import type { Locale } from "./content";

type LocaleMetadata = {
  title: string;
  description: string;
  openGraphLocale: string;
};

export const localeMetadata: Record<Locale, LocaleMetadata> = {
  bg: {
    title: "Barakova Luxury Travel | Луксозни пътувания",
    description:
      "Персонални туристически консултации, луксозни почивки, бутикови хотели, круизи и внимателно подбрани дестинации по целия свят.",
    openGraphLocale: "bg_BG",
  },
  en: {
    title: "Barakova Luxury Travel | Luxury Travel Consulting",
    description:
      "Personal travel consulting for luxury holidays, boutique hotels, cruises, and carefully selected destinations worldwide.",
    openGraphLocale: "en_US",
  },
};
