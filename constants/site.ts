import type { Locale } from "./content";

export const siteUrl = "https://barakovaluxurytravel.com";
export const siteName = "Barakova Luxury Travel";
export const contactEmail = "info@barakovaluxurytravel.com";
export const contactEmailHref = `mailto:${contactEmail}`;
export const resendFromEmailDefault = `Barakova Luxury Travel <${contactEmail}>`;
export const contactPhone = "+359883770909";
export const contactPhoneDisplay = "0883 770 909";
export const contactPhoneHref = `tel:${contactPhone}`;

export function getEmailAriaLabel(locale: Locale) {
  return locale === "bg"
    ? `Изпратете имейл на ${contactEmail}`
    : `Send an email to ${contactEmail}`;
}

export function getCallAriaLabel(locale: Locale) {
  return locale === "bg"
    ? `Обадете се на ${contactPhoneDisplay}`
    : `Call ${contactPhoneDisplay}`;
}
