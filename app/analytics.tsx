"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import {
  getStoredCookieConsent,
  type CookieConsentValue,
} from "../constants/privacy";

const googleAnalyticsId = process.env.NEXT_PUBLIC_GA_ID;

export function Analytics() {
  const [consent, setConsent] = useState<CookieConsentValue | null>(null);

  useEffect(() => {
    setConsent(getStoredCookieConsent());

    const handleConsentChange = (event: Event) => {
      const customEvent = event as CustomEvent<CookieConsentValue>;
      setConsent(customEvent.detail);
    };

    window.addEventListener("barakova-cookie-consent", handleConsentChange);
    return () => {
      window.removeEventListener("barakova-cookie-consent", handleConsentChange);
    };
  }, []);

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
