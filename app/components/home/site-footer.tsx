import Link from "next/link";
import type { Locale, SiteContent } from "../../../constants/content";
import { localePath } from "../../../constants/i18n";
import {
  contactEmail,
  contactEmailHref,
  contactPhoneDisplay,
  contactPhoneHref,
  getCallAriaLabel,
  getEmailAriaLabel,
} from "../../../constants/site";

type SiteFooterProps = {
  content: SiteContent;
  locale: Locale;
};

export function SiteFooter({ content, locale }: SiteFooterProps) {
  return (
    <footer className="site-footer px-5 pb-8 sm:px-8 lg:px-12">
      <div className="footer-divider mx-auto max-w-7xl" />
      <p className="footer-quote mx-auto max-w-4xl">{content.footer.quote}</p>

      <div className="footer-panel mx-auto max-w-7xl">
        <div className="footer-brand">
          <h2>{content.brand.name}</h2>
          <p>{content.footer.brandText}</p>
        </div>

        <div className="footer-column">
          <h3>{content.footer.navigationTitle}</h3>
          <div className="footer-links">
            {content.navItems.map((item) => (
              <a href={item.href} key={item.label}>
                {item.label}
              </a>
            ))}
          </div>
        </div>

        <div className="footer-column">
          <h3>{content.footer.contactsTitle}</h3>
          <div className="footer-contact-meta">
            <a
              aria-label={getEmailAriaLabel(locale)}
              className="footer-contact-link"
              href={contactEmailHref}
            >
              {contactEmail}
            </a>
            <a
              aria-label={getCallAriaLabel(locale)}
              className="footer-contact-link"
              href={contactPhoneHref}
            >
              {contactPhoneDisplay}
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom mx-auto max-w-7xl">
        <div>
          <p>{content.footer.copyright}</p>
          <p>{content.footer.rights}</p>
          <Link className="footer-privacy-link" href={localePath(locale, "/privacy")}>
            {locale === "bg" ? "Политика за поверителност" : "Privacy Policy"}
          </Link>
        </div>
        <a
          className="developer-credit"
          href="https://github.com/BobbyUzunov"
          rel="noreferrer"
          target="_blank"
        >
          {content.footer.developerCredit}
        </a>
      </div>
    </footer>
  );
}
