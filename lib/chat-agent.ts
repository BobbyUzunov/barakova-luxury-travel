import type { Locale } from "../constants/content";
import { getSiteContent } from "../constants/content-by-locale";
import {
  contactEmail,
  contactPhoneDisplay,
  siteName,
} from "../constants/site";
import type { ChatHistoryMessage } from "./chat";

const openAiApiUrl = "https://api.openai.com/v1/chat/completions";
const chatModel = process.env.OPENAI_CHAT_MODEL || "gpt-4o-mini";

function buildKnowledgeContext(locale: Locale) {
  const content = getSiteContent(locale);

  const services = content.services
    .map((service) => `- ${service.title}: ${service.description}`)
    .join("\n");
  const destinations = content.destinations
    .map(
      (destination) =>
        `- ${destination.name}: ${destination.description} ${destination.detail}`,
    )
    .join("\n");
  const cruises = content.cruises
    .map((cruise) => `- ${cruise.name}: ${cruise.description}`)
    .join("\n");
  const steps = content.steps
    .map((step, index) => `${index + 1}. ${step}`)
    .join("\n");

  return [
    `Brand: ${content.brand.name} (${content.brand.subtitle})`,
    `About: ${content.about.intro}`,
    `Mission: ${content.about.mission}`,
    `Services:\n${services}`,
    `Process:\n${steps}`,
    `Destinations:\n${destinations}`,
    `Cruises:\n${cruises}`,
    `Contact phone: ${contactPhoneDisplay}`,
    `Contact email: ${contactEmail}`,
    `Initial consultation: free`,
  ].join("\n\n");
}

function buildSystemPrompt(locale: Locale) {
  if (locale === "bg") {
    return [
      `Ти си любезен асистент на ${siteName} — консултант за луксозни пътувания.`,
      "Отговаряй само на въпроси, свързани с услугите, дестинациите, процеса на консултация и контакт.",
      "При сравнения между дестинации, персонални препоръки или въпроси с бюджет/период/предпочитания — давай ясен, полезен съвет на база познанията за сайта, без да измисляш конкретни цени или наличности.",
      "Не измисляй цени, наличности или конкретни оферти. Насочвай към формата за запитване или телефон за персонално предложение.",
      "Пиши на български, ясно и елегантно (до 140 думи), в тон на луксозна туристическа консултация.",
      "Ако въпросът е извън обхвата, любезно предложи контакт.",
      "",
      "Познания за сайта:",
      buildKnowledgeContext(locale),
    ].join("\n");
  }

  return [
    `You are a polite assistant for ${siteName}, a luxury travel consulting brand.`,
    "Answer only questions related to services, destinations, the consultation process, and contact details.",
    "Do not invent prices, availability, or specific offers. Guide users to the inquiry form or phone for a personal proposal.",
    "Write in English, briefly and elegantly (up to 120 words), in a luxury travel consulting tone.",
    "If the question is out of scope, politely suggest contacting the team.",
    "",
    "Site knowledge:",
    buildKnowledgeContext(locale),
  ].join("\n");
}

function buildFallbackReply(locale: Locale) {
  if (locale === "bg") {
    return `Благодаря за въпроса. За по-персонален отговор моля свържете се с нас на ${contactPhoneDisplay} или попълнете формата за запитване в секция „Контакт“.`;
  }

  return `Thank you for your question. For a more personal answer, please call ${contactPhoneDisplay} or use the inquiry form in the Contact section.`;
}

export async function generateAiReply({
  locale,
  message,
  history,
}: {
  locale: Locale;
  message: string;
  history: ChatHistoryMessage[];
}) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return {
      reply: buildFallbackReply(locale),
      source: "fallback" as const,
      suggestContact: true,
    };
  }

  const messages = [
    { role: "system" as const, content: buildSystemPrompt(locale) },
    ...history.map((entry) => ({
      role: entry.role,
      content: entry.content,
    })),
    { role: "user" as const, content: message },
  ];

  try {
    const response = await fetch(openAiApiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: chatModel,
        temperature: 0.35,
        max_tokens: 420,
        messages,
      }),
    });

    if (!response.ok) {
      return {
        reply: buildFallbackReply(locale),
        source: "fallback" as const,
        suggestContact: true,
      };
    }

    const payload = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const reply = payload.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      return {
        reply: buildFallbackReply(locale),
        source: "fallback" as const,
        suggestContact: true,
      };
    }

    return {
      reply,
      source: "ai" as const,
      suggestContact: /контакт|contact|запитван|inquiry|форма|form/i.test(
        reply,
      ),
    };
  } catch {
    return {
      reply: buildFallbackReply(locale),
      source: "fallback" as const,
      suggestContact: true,
    };
  }
}
