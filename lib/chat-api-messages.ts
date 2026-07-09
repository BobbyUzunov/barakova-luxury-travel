import type { Locale } from "../constants/content";

const messages = {
  rateLimit: {
    bg: "Твърде много съобщения за кратко време. Моля, изчакайте малко.",
    en: "Too many messages in a short time. Please wait a moment.",
  },
  invalidBody: {
    bg: "Невалидна заявка. Моля, опитайте отново.",
    en: "Invalid request. Please try again.",
  },
  emptyMessage: {
    bg: "Моля, напишете съобщение.",
    en: "Please enter a message.",
  },
  serverError: {
    bg: "Възникна проблем. Моля, опитайте отново или се свържете с нас директно.",
    en: "Something went wrong. Please try again or contact us directly.",
  },
} as const;

export function chatApiMessage(
  key: keyof typeof messages,
  locale: Locale = "bg",
) {
  return messages[key][locale];
}
