import Image from "next/image";
import type { SiteContent } from "../../../constants/content";
import {
  contactPhoneDisplay,
  contactPhoneHref,
  contactWhatsAppHref,
} from "../../../constants/site";

type MobileFloatingContactProps = {
  content: SiteContent;
};

export function MobileFloatingContact({ content }: MobileFloatingContactProps) {
  return (
    <div
      aria-label={content.floatingContact.groupAriaLabel}
      className="floating-contact-buttons"
    >
      <a
        aria-label={content.floatingContact.whatsappAriaLabel}
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
        aria-label={content.floatingContact.callAriaLabel}
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
