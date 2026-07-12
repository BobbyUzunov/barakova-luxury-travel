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
  return (
    <a
      aria-label={getCallAriaLabel(locale)}
      className="mobile-sticky-call"
      href={contactPhoneHref}
    >
      <span aria-hidden="true" className="mobile-sticky-call-icon">
        <svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M8.86 2.5c.45 0 .86.25 1.06.64l1.28 2.56a1.2 1.2 0 01-.22 1.3l-1.02 1.02a12.2 12.2 0 005.36 5.36l1.02-1.02a1.2 1.2 0 011.3-.22l2.56 1.28c.39.2.64.61.64 1.06v2.56c0 .66-.54 1.2-1.2 1.2C10.4 18.78 5.22 13.6 5.22 7.1c0-.66.54-1.2 1.2-1.2h2.44z"
            fill="currentColor"
          />
        </svg>
      </span>
      <span className="mobile-sticky-call-label">{content.hero.phoneLinkLabel}</span>
    </a>
  );
}
