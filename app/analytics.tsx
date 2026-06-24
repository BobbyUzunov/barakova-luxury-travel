"use client";

import Script from "next/script";
import { useSyncExternalStore } from "react";
import {
  getStoredCookieConsent,
  type CookieConsentValue,
} from "../constants/privacy";

const googleAnalyticsId = process.env.NEXT_PUBLIC_GA_ID;

function subscribeToConsentChanges(onStoreChange: () => void) {
  const handleConsentChange = () => onStoreChange();

  window.addEventListener("barakova-cookie-consent", handleConsentChange);
  window.addEventListener("storage", handleConsentChange);

  return () => {
    window.removeEventListener("barakova-cookie-consent", handleConsentChange);
    window.removeEventListener("storage", handleConsentChange);
  };
}

function getConsentSnapshot() {
  return getStoredCookieConsent();
}

function getConsentServerSnapshot() {
  return null;
}

export function Analytics() {
  const consent = useSyncExternalStore(
    subscribeToConsentChanges,
    getConsentSnapshot,
    getConsentServerSnapshot,
  );

  if (!googleAnalyticsId || consent !== "accepted") {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${googleAnalyticsId}', { anonymize_ip: true });
        `}
      </Script>
    </>
  );
}
