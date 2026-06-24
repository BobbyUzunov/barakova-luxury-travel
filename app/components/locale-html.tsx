"use client";

import { useEffect } from "react";
import type { Locale } from "../../constants/content";
import { localeStorageKey } from "../../constants/privacy";

export function LocaleHtml({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: Locale;
}) {
  useEffect(() => {
    document.documentElement.lang = locale;
    window.localStorage.setItem(localeStorageKey, locale);
  }, [locale]);

  return children;
}
