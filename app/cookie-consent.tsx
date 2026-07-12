"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useSyncExternalStore } from "react";
import type { Locale } from "../constants/content";
import { localePath } from "../constants/i18n";
import { resolveCookieBannerLocale } from "../lib/request-locale";
import { lockElementInert } from "../lib/element-inert-lock";
import { useModalAccessibility } from "../lib/use-modal-accessibility";
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
  const pathname = usePathname();
  const dialogRef = useRef<HTMLDivElement>(null);
  const acceptButtonRef = useRef<HTMLButtonElement>(null);
  const storeValue = useSyncExternalStore(
    subscribeToConsentStore,
    getConsentStoreSnapshot,
    getConsentStoreServerSnapshot,
  );
  const { consent, locale: storedLocale } = JSON.parse(storeValue) as {
    consent: CookieConsentValue | null;
    locale: Locale;
  };
  const locale = resolveCookieBannerLocale(pathname, storedLocale);
  const isVisible = !consent;

  useModalAccessibility({
    containerRef: dialogRef,
    initialFocusRef: acceptButtonRef,
    isOpen: isVisible,
    lockScroll: true,
    onClose: () => {},
  });

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    const appContent = document.getElementById("app-content");
    const inquiryAgentShell = document.getElementById("inquiry-agent-shell");
    const unlockAppContent = appContent ? lockElementInert(appContent) : () => {};
    const unlockInquiryAgent = inquiryAgentShell
      ? lockElementInert(inquiryAgentShell)
      : () => {};

    return () => {
      unlockInquiryAgent();
      unlockAppContent();
    };
  }, [isVisible]);

  const saveConsent = (value: CookieConsentValue) => {
    window.localStorage.setItem(cookieConsentStorageKey, value);
    window.dispatchEvent(
      new CustomEvent("barakova-cookie-consent", { detail: value }),
    );

    window.requestAnimationFrame(() => {
      document.getElementById("app-content")?.querySelector<HTMLElement>("a, button")?.focus();
    });
  };

  if (!isVisible) {
    return null;
  }

  const copy = cookieConsentCopy[locale];

  return (
    <div
      aria-labelledby="cookie-consent-title"
      aria-modal="true"
      className="cookie-consent"
      ref={dialogRef}
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
            ref={acceptButtonRef}
            type="button"
          >
            {copy.accept}
          </button>
        </div>
      </div>
    </div>
  );
}
