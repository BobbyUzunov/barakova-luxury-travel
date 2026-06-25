import Image from "next/image";
import type { Locale, SiteContent } from "../../../constants/content";
import {
  contactPhoneHref,
  contactWhatsAppHref,
  getCallAriaLabel,
  getWhatsappAriaLabel,
} from "../../../constants/site";

type MobileFloatingContactProps = {
  content: SiteContent;
  locale: Locale;
};

export function MobileFloatingContact({ content, locale }: MobileFloatingContactProps) {
  return (
    <div
      aria-label={content.floatingContact.groupAriaLabel}
      className="floating-contact-buttons"
    >
      <a
        aria-label={getWhatsappAriaLabel(locale)}
        className="floating-contact-button"
        href={contactWhatsAppHref}
        rel="noreferrer"
        target="_blank"
      >
        <Image
          alt=""
          aria-hidden="true"
          height={47}
          src="/icons/whatsapp.svg"
          width={47}
        />
      </a>
      <a
        aria-label={getCallAriaLabel(locale)}
        className="floating-contact-button floating-contact-button-call"
        href={contactPhoneHref}
      >
        <Image
          alt=""
          aria-hidden="true"
          height={47}
          src="/icons/phone.svg"
          width={47}
        />
      </a>
    </div>
  );
}
