"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import type { Locale } from "../constants/content";
import { localePath } from "../constants/i18n";
import {
  cookieConsentCopy,
  cookieConsentStorageKey,
  getStoredCookieConsent,
  getStoredLocale,
  type CookieConsentValue,
} from "../constants/privacy";

function subscribeToConsentStore(onStoreChange: () => void) {
  const handleChange = () => onStoreChange();

  window.addEventListener("barakova-cookie-consent", handleChange);
  window.addEventListener("storage", handleChange);

  return () => {
    window.removeEventListener("barakova-cookie-consent", handleChange);
    window.removeEventListener("storage", handleChange);
  };
}

function getConsentStoreSnapshot() {
  return JSON.stringify({
    consent: getStoredCookieConsent(),
    locale: getStoredLocale(),
  });
}

function getConsentStoreServerSnapshot() {
  return JSON.stringify({
    consent: null,
    locale: "bg" as Locale,
  });
}

export function CookieConsent() {
  const storeValue = useSyncExternalStore(
    subscribeToConsentStore,
    getConsentStoreSnapshot,
    getConsentStoreServerSnapshot,
  );
  const { consent, locale } = JSON.parse(storeValue) as {
    consent: CookieConsentValue | null;
    locale: Locale;
  };

  const saveConsent = (value: CookieConsentValue) => {
    window.localStorage.setItem(cookieConsentStorageKey, value);
    window.dispatchEvent(
      new CustomEvent("barakova-cookie-consent", { detail: value }),
    );
  };

  if (consent) {
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
