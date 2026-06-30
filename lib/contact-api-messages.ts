import type { Locale } from "../constants/content";

export type ContactApiMessageKey =
  | "rateLimit"
  | "invalidBody"
  | "missingFields"
  | "invalidEmail"
  | "captchaFailed"
  | "notConfigured"
  | "deliveryFailed"
  | "serverError";

const messages: Record<ContactApiMessageKey, Record<Locale, string>> = {
  rateLimit: {
    bg: "Твърде много опити. Моля, опитайте отново след малко.",
    en: "Too many requests. Please try again later.",
  },
  invalidBody: {
    bg: "Невалидна заявка.",
    en: "Invalid request body.",
  },
  missingFields: {
    bg: "Моля, попълнете всички задължителни полета.",
    en: "Missing required fields.",
  },
  invalidEmail: {
    bg: "Моля, въведете валиден имейл адрес.",
    en: "Invalid email address.",
  },
  captchaFailed: {
    bg: "Проверката срещу спам не беше успешна. Моля, опитайте отново.",
    en: "Captcha verification failed.",
  },
  notConfigured: {
    bg: "Изпращането на съобщения временно не е налично.",
    en: "Email delivery is not configured.",
  },
  deliveryFailed: {
    bg: "Съобщението не беше изпратено. Моля, опитайте отново или се обадете.",
    en: "Email delivery failed.",
  },
  serverError: {
    bg: "Възникна грешка. Моля, опитайте отново.",
    en: "Something went wrong. Please try again.",
  },
};

export function resolveRequestLocale(locale?: string): Locale {
  return locale === "en" ? "en" : "bg";
}

export function contactApiMessage(
  key: ContactApiMessageKey,
  locale?: string,
) {
  return messages[key][resolveRequestLocale(locale)];
}
