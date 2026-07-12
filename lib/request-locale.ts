import type { Locale } from "../constants/content";
import { defaultLocale, isLocale } from "../constants/i18n";

export function getLocaleFromPathname(pathname: string | null | undefined): Locale {
  const firstSegment = pathname?.split("/").filter(Boolean)[0];

  if (firstSegment && isLocale(firstSegment)) {
    return firstSegment;
  }

  return defaultLocale;
}

export function getLocaleFromHeaders(
  getHeader: (name: string) => string | null,
): Locale {
  const locale = getHeader("x-locale");

  if (locale && isLocale(locale)) {
    return locale;
  }

  return defaultLocale;
}

export function resolveCookieBannerLocale(
  pathname: string | null | undefined,
  storedLocale: Locale,
): Locale {
  const pathLocale = getLocaleFromPathname(pathname);

  if (pathname?.startsWith("/bg") || pathname?.startsWith("/en")) {
    return pathLocale;
  }

  return storedLocale;
}
