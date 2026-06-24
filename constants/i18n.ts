import type { Locale } from "./content";

export const locales = ["bg", "en"] as const satisfies readonly Locale[];
export const defaultLocale: Locale = "bg";

export function isLocale(value: string): value is Locale {
  return value === "bg" || value === "en";
}

export function localePath(locale: Locale, path = "") {
  if (!path || path === "/") {
    return `/${locale}`;
  }

  return `/${locale}${path.startsWith("/") ? path : `/${path}`}`;
}

export function localizedHash(locale: Locale, hash: string) {
  const normalizedHash = hash.startsWith("#") ? hash : `#${hash}`;
  return `${localePath(locale)}${normalizedHash}`;
}

export function getAlternateLanguages(pathWithoutLocale = "") {
  const normalizedPath = pathWithoutLocale.startsWith("/")
    ? pathWithoutLocale
    : pathWithoutLocale
      ? `/${pathWithoutLocale}`
      : "";

  return {
    bg: localePath("bg", normalizedPath),
    en: localePath("en", normalizedPath),
    "x-default": localePath(defaultLocale, normalizedPath),
  };
}
