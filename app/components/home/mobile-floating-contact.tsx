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
      <span aria-hidden="true">📞</span>
      {content.hero.phoneLinkLabel}
    </a>
  );
}
