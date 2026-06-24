"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { localePath } from "../constants/i18n";
import {
  cookieConsentCopy,
  cookieConsentStorageKey,
  getStoredCookieConsent,
  getStoredLocale,
  type CookieConsentValue,
} from "../constants/privacy";
import type { Locale } from "../constants/content";

export function CookieConsent() {
  const [locale, setLocale] = useState<Locale>("bg");
  const [consent, setConsent] = useState<CookieConsentValue | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setLocale(getStoredLocale());
    setConsent(getStoredCookieConsent());
    setIsReady(true);
  }, []);

  const saveConsent = (value: CookieConsentValue) => {
    window.localStorage.setItem(cookieConsentStorageKey, value);
    setConsent(value);
    window.dispatchEvent(
      new CustomEvent("barakova-cookie-consent", { detail: value }),
    );
  };

  if (!isReady || consent) {
    return null;
  }

  const copy = cookieConsentCopy[locale];

  return (
    <div
      aria-labelledby="cookie-consent-title"
      className="cookie-consent"
      role="dialog"
    >
      <div className="cookie-consent-inner">
        <p id="cookie-consent-title">{copy.message}</p>
        <div className="cookie-consent-actions">
          <Link
            className="cookie-consent-link"
            href={localePath(locale, "/privacy")}
          >
            {copy.privacyLink}
          </Link>
          <button
            className="btn-secondary cookie-consent-reject"
            onClick={() => saveConsent("rejected")}
            type="button"
          >
            {copy.reject}
          </button>
          <button
            className="btn-primary cookie-consent-accept"
            onClick={() => saveConsent("accepted")}
            type="button"
          >
            {copy.accept}
          </button>
        </div>
      </div>
    </div>
  );
}
