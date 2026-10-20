import type { Locale } from "../constants/content";
import type { ChatHistoryMessage } from "./chat";
import type { TravelProfile } from "./travel-profile";

export type InquiryChatMessage = {
  id?: string;
  role: "user" | "assistant";
  content: string;
};

/** Builds the /api/chat payload snapshots used by the inquiry UI. */
export function buildInquiryChatRequestBody({
  locale,
  message,
  messages,
  profile,
}: {
  locale: Locale;
  message: string;
  messages: InquiryChatMessage[];
  profile: TravelProfile;
}) {
  const history: ChatHistoryMessage[] = messages
    .filter((entry) => entry.id !== "welcome")
    .map((entry) => ({
      role: entry.role,
      content: entry.content,
    }));

  return {
    message,
    locale,
    history,
    profile,
  };
}
