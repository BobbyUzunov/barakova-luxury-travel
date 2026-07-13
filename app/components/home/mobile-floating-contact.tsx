"use client";

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import type { Locale, SiteContent } from "../../../constants/content";
import { contactPhoneHref, getCallAriaLabel } from "../../../constants/site";

type MobileFloatingContactProps = {
  content: SiteContent;
  locale: Locale;
};

export function MobileFloatingContact({
  content,
  locale,
}: MobileFloatingContactProps) {
  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const callButton = (
    <a
      aria-label={getCallAriaLabel(locale)}
      className="mobile-sticky-call"
      href={contactPhoneHref}
    >
      <span aria-hidden="true" className="mobile-sticky-call-icon">
        <svg
          fill="none"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M7.1 3.5H4.9c-.77 0-1.4.63-1.4 1.4 0 8.62 6.98 15.6 15.6 15.6.77 0 1.4-.63 1.4-1.4v-2.2a1.4 1.4 0 0 0-1.05-1.36l-2.17-.54a1.4 1.4 0 0 0-1.45.48l-.48.62a1.4 1.4 0 0 1-1.67.42 13.2 13.2 0 0 1-6.2-6.2 1.4 1.4 0 0 1 .42-1.67l.62-.48A1.4 1.4 0 0 0 9 6.72l-.54-2.17A1.4 1.4 0 0 0 7.1 3.5Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.7"
          />
        </svg>
      </span>
      <span className="mobile-sticky-call-label">{content.hero.phoneLinkLabel}</span>
    </a>
  );

  if (!isMounted) {
    return null;
  }

  return createPortal(callButton, document.body);
}
