"use client";

import { useEffect } from "react";
import type { Locale } from "../../constants/content";
import { localeStorageKey } from "../../constants/privacy";

export function LocalePersistence({ locale }: { locale: Locale }) {
  useEffect(() => {
    window.localStorage.setItem(localeStorageKey, locale);
  }, [locale]);

  return null;
}
