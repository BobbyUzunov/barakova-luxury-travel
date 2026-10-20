import type { Locale } from "../constants/content";
import {
  createEmptyTravelProfile,
  sanitizeTravelProfile,
  type TravelProfile,
} from "./travel-profile";

export type ChatMessageRole = "user" | "assistant";

export type ChatHistoryMessage = {
  role: ChatMessageRole;
  content: string;
};

export type ChatRequestBody = {
  message?: string;
  faqId?: string;
  locale?: string;
  history?: ChatHistoryMessage[];
  profile?: unknown;
};

export type ChatReplySource = "faq" | "ai" | "fallback";

export const maxChatMessageLength = 1000;
export const maxChatHistoryLength = 12;

export function resolveChatLocale(locale?: string): Locale {
  return locale === "en" ? "en" : "bg";
}

export function normalizeChatBody(body: ChatRequestBody) {
  const locale = resolveChatLocale(body.locale);
  const sanitizedProfile = sanitizeTravelProfile(body.profile, locale);
  const profile: TravelProfile = sanitizedProfile
    ? { ...sanitizedProfile, locale }
    : createEmptyTravelProfile(locale);

  return {
    message: (body.message ?? "").trim().slice(0, maxChatMessageLength),
    faqId: (body.faqId ?? "").trim().slice(0, 80),
    locale,
    history: Array.isArray(body.history)
      ? body.history
          .filter(
            (entry): entry is ChatHistoryMessage =>
              (entry.role === "user" || entry.role === "assistant") &&
              typeof entry.content === "string",
          )
          .slice(-maxChatHistoryLength)
          .map((entry) => ({
            role: entry.role,
            content: entry.content.trim().slice(0, maxChatMessageLength),
          }))
          .filter((entry) => entry.content.length > 0)
      : [],
    profile,
  };
}

export function validateChatBody(body: ReturnType<typeof normalizeChatBody>) {
  if (body.faqId) {
    return { ok: true as const };
  }

  if (!body.message) {
    return { ok: false as const, error: "empty-message" as const };
  }

  return { ok: true as const };
}
