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
import {
  applyTravelProfileUpdate,
  extractHeuristicProfileUpdate,
} from "../../../lib/travel-profile";

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
    return NextResponse.json(
      { message: chatApiMessage("serverError") },
      { status: 503 },
    );
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
      const profile = applyTravelProfileUpdate(
        normalizedBody.profile,
        extractHeuristicProfileUpdate(
          normalizedBody.message || faqEntry.quickReply || "",
          normalizedBody.locale,
        ),
        normalizedBody.locale,
      );

      return NextResponse.json({
        reply: faqEntry.answer,
        source: "faq",
        faqId: faqEntry.id,
        suggestContact: faqEntry.id === "contact" || faqEntry.id === "budget",
        profile,
      });
    }
  }

  const faqMatch = matchFaqAnswer(
    normalizedBody.locale,
    normalizedBody.message,
    normalizedBody.history,
  );

  if (faqMatch) {
    const profile = applyTravelProfileUpdate(
      normalizedBody.profile,
      extractHeuristicProfileUpdate(
        normalizedBody.message,
        normalizedBody.locale,
      ),
      normalizedBody.locale,
    );

    return NextResponse.json({
      reply: faqMatch.answer,
      source: "faq",
      faqId: faqMatch.id,
      suggestContact:
        faqMatch.id === "contact" ||
        faqMatch.id === "budget" ||
        faqMatch.id === "consultation",
      profile,
    });
  }

  const aiResult = await generateAiReply({
    locale: normalizedBody.locale,
    message: normalizedBody.message,
    history: normalizedBody.history,
    profile: normalizedBody.profile,
  });

  return NextResponse.json({
    reply: aiResult.reply,
    source: aiResult.source,
    suggestContact: aiResult.suggestContact,
    profile: aiResult.profile,
  });
}
