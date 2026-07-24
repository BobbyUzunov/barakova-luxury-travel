"use client";

import Script from "next/script";
import { useSyncExternalStore } from "react";
import {
  getCookieConsentServerSnapshot,
  getCookieConsentSnapshot,
  subscribeToCookieConsent,
} from "../lib/cookie-consent-store";

const googleAnalyticsId = process.env.NEXT_PUBLIC_GA_ID;

export function Analytics() {
  const consent = useSyncExternalStore(
    subscribeToCookieConsent,
    getCookieConsentSnapshot,
    getCookieConsentServerSnapshot,
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
