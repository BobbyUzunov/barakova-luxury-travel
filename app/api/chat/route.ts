import { NextResponse } from "next/server";
import { generateAiReply } from "../../../lib/chat-agent";
import { chatApiMessage } from "../../../lib/chat-api-messages";
import { findFaqById, matchFaqAnswer } from "../../../lib/chat-faq";
import {
  normalizeChatBody,
  validateChatBody,
  type ChatRequestBody,
} from "../../../lib/chat";
import { getClientIp } from "../../../lib/contact";
import { isChatRateLimited } from "../../../lib/rate-limit";

export async function POST(request: Request) {
  const ip = getClientIp(request);

  try {
    if (await isChatRateLimited(ip)) {
      return NextResponse.json(
        { message: chatApiMessage("rateLimit") },
        { status: 429 },
      );
    }
  } catch {
    // Fail open when rate limiting is unavailable.
  }

  let normalizedBody: ReturnType<typeof normalizeChatBody>;

  try {
    normalizedBody = normalizeChatBody(
      (await request.json()) as ChatRequestBody,
    );
  } catch {
    return NextResponse.json(
      { message: chatApiMessage("invalidBody") },
      { status: 400 },
    );
  }

  const validation = validateChatBody(normalizedBody);

  if (!validation.ok) {
    return NextResponse.json(
      { message: chatApiMessage("emptyMessage", normalizedBody.locale) },
      { status: 400 },
    );
  }

  if (normalizedBody.faqId) {
    const faqEntry = findFaqById(normalizedBody.locale, normalizedBody.faqId);

    if (faqEntry) {
      return NextResponse.json({
        reply: faqEntry.answer,
        source: "faq",
        faqId: faqEntry.id,
        suggestContact: faqEntry.id === "contact" || faqEntry.id === "budget",
      });
    }
  }

  const faqMatch = matchFaqAnswer(
    normalizedBody.locale,
    normalizedBody.message,
  );

  if (faqMatch) {
    return NextResponse.json({
      reply: faqMatch.answer,
      source: "faq",
      faqId: faqMatch.id,
      suggestContact:
        faqMatch.id === "contact" ||
        faqMatch.id === "budget" ||
        faqMatch.id === "consultation",
    });
  }

  const aiResult = await generateAiReply({
    locale: normalizedBody.locale,
    message: normalizedBody.message,
    history: normalizedBody.history,
  });

  return NextResponse.json({
    reply: aiResult.reply,
    source: aiResult.source,
    suggestContact: aiResult.suggestContact,
  });
}
