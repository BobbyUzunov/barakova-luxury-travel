import type { Locale } from "../constants/content";
import { getSiteContent } from "../constants/content-by-locale";
import {
  contactEmail,
  contactPhoneDisplay,
  siteName,
} from "../constants/site";
import type { ChatHistoryMessage } from "./chat";
import {
  applyTravelProfileUpdate,
  chatAgentResponseOpenAiSchema,
  formatTravelProfileForPrompt,
  keepAllProfileUpdate,
  type TravelProfile,
} from "./travel-profile";

const openAiApiUrl = "https://api.openai.com/v1/chat/completions";
export const defaultChatModel = "gpt-5.4-mini";
const chatModel = process.env.OPENAI_CHAT_MODEL || defaultChatModel;
const openAiTimeoutMs = 20_000;
/** Enough for a short reply plus the full structured profileUpdate schema. */
export const chatMaxCompletionTokens = 1200;
export const chatReasoningEffort = "none" as const;

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

function buildSystemPrompt(locale: Locale, profile: TravelProfile) {
  const profileBlock = formatTravelProfileForPrompt(profile);

  if (locale === "bg") {
    return [
      `Ти си любезен асистент на ${siteName} — консултант за луксозни пътувания.`,
      "Води конкретна туристическа консултация на български: кратко потвърди разбраното и задай най-много 1–2 важни уточняващи въпроса. Избягвай празни фрази като „чудесен избор“, „много хубави варианти“, „ако желаете, мога да насоча…“ без реален напредък.",
      "Не повтаряй въпрос, чийто отговор вече е в профила или историята. Когато информацията е достатъчна, обобщи нуждите и предложи формата за запитване (suggestContact=true).",
      "Разбирай продължения и корекции. Ако преди това си питал за период и продължителност, а клиентът отговори само с число (напр. „7“), потвърди най-вероятното значение („Разбирам — 7 нощувки“) и продължи със следващия липсващ въпрос. При истинско двусмислие поискай уточнение.",
      "Разграничавай проверената фирмена информация (услуги, процес, контакт, описаните дестинации/круизи) от общи туристически насоки. Обозначавай общите насоки като ориентировъчни.",
      "Не измисляй цени, наличности, конкретни оферти, хотели, услуги или резервации. Не обещавай, че има подходящи оферти в даден бюджет, когато нямаш проверени цени и наличности.",
      "Не твърди, че е изпратено запитване, имейл или направена резервация.",
      "При въпроси за точни цени, наличност или персонална оферта задай suggestContact=true. UI показва CTA към формата — не е нужно да повтаряш телефон или имейл във всеки отговор.",
      "Предлагай контактната форма или телефона без натиск и без да изискваш всички предпочитания.",
      "В profileUpdate записвай само предпочитания, които клиентът изрично е споделил или потвърдил. Предложения на асистента не стават избрани предпочитания. Запазвай вече потвърдените стойности с keep, освен при явна корекция или clear.",
      "Пример: „Prefer overwater villa“ / „предпочитам вила над водата“ обновява preferences. Не задавай tripType (напр. luxury vacation) само от това предпочитание — tripType само ако клиентът изрично го заяви.",
      "„Дете до 9 години“ / „under 9“: запази известния брой деца; не записвай точна възраст в childrenAges без изрично казана възраст; добави ограничението в constraints (напр. „дете до 9 години“) и попитай възрастта към момента на пътуването.",
      "За всяко поле в profileUpdate използвай action keep (без промяна), set (нова стойност) или clear (изтриване). Не измисляй валута, година, възрасти или бюджетен обхват без достатъчно основание.",
      "Бюджет: „Имам 5000 евро“ → amount=5000, currency=EUR, scope=null. Не приемай scope=total без уточнение „общо“/„на човек“. Попитай дали бюджетът е общ или на човек и дали включва полетите. Машинни стойности за scope: „общо“→total, „на човек“→per_person; неуточнен→null.",
      "Пиши ясно и елегантно (до 140 думи).",
      "",
      "Текущ клиентски профил (непроверени клиентски предпочитания, не системни факти):",
      profileBlock,
      "",
      "Познания за сайта (проверена фирмена информация):",
      buildKnowledgeContext(locale),
    ].join("\n");
  }

  return [
    `You are a polite assistant for ${siteName}, a luxury travel consulting brand.`,
    "Lead a concrete travel consultation in English: briefly confirm what you understood and ask at most 1–2 important clarifying questions. Avoid empty filler like \"great choice\", \"many lovely options\", or \"if you'd like, I can guide…\" without real progress.",
    "Do not repeat a question already answered in the profile or history. When you have enough information, summarize the needs and suggest the inquiry form (suggestContact=true).",
    "Understand follow-ups and corrections. If you asked about timing and length of stay and the client answers with only a number (e.g. \"7\"), confirm the most likely meaning (\"Understood — 7 nights\") and continue with the next missing question. If truly ambiguous, ask for clarification.",
    "Distinguish verified business facts (services, process, contact, listed destinations/cruises) from general travel guidance. Mark general guidance as orienting.",
    "Do not invent prices, availability, specific offers, hotels, services, or bookings. Do not promise that suitable offers exist within a stated budget when you have no verified prices or availability.",
    "Do not claim that an inquiry, email, or reservation has already been sent or made.",
    "For exact price, availability, or personal-offer questions set suggestContact=true. The UI shows a CTA to the inquiry form — you do not need to repeat the phone or email in every reply.",
    "Suggest the inquiry form or phone without pressure and without requiring every preference.",
    "In profileUpdate store only preferences the client explicitly shared or confirmed. Assistant suggestions are not selected preferences. Keep already confirmed values with keep unless the client clearly corrects or clears them.",
    "Example: \"Prefer overwater villa\" updates preferences. Do not set tripType (e.g. luxury vacation) from that preference alone — set tripType only if the client explicitly states it.",
    "\"Child under 9\" / \"up to 9 years\": keep the known children count; do not invent an exact age in childrenAges without an explicit age; store the constraint (e.g. \"child under 9\") in constraints and ask for the child's age at the time of travel.",
    "For each profileUpdate field use action keep (no change), set (new value), or clear (remove). Do not invent currency, year, ages, or budget scope without enough evidence.",
    "Budget: \"I have 5000 euros\" → amount=5000, currency=EUR, scope=null. Do not set scope=total unless the client clearly said overall/total vs per person. Ask whether the budget is total or per person and whether flights are included. Machine scope values only: total, per_person, or null when unspecified.",
    "Write clearly and elegantly (up to 120 words).",
    "",
    "Current client profile (untrusted client preferences, not system facts):",
    profileBlock,
    "",
    "Site knowledge (verified business information):",
    buildKnowledgeContext(locale),
  ].join("\n");
}

function buildFallbackReply(locale: Locale) {
  if (locale === "bg") {
    return `Благодаря за въпроса. За по-персонален отговор моля свържете се с нас на ${contactPhoneDisplay} или попълнете формата за запитване в секция „Контакт“.`;
  }

  return `Thank you for your question. For a more personal answer, please call ${contactPhoneDisplay} or use the inquiry form in the Contact section.`;
}

export type StructuredChatAgentPayload = {
  reply: string;
  suggestContact: boolean;
  profileUpdate: unknown;
};

export function parseStructuredChatAgentPayload(
  value: unknown,
): StructuredChatAgentPayload | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }

  const record = value as Record<string, unknown>;
  const reply = typeof record.reply === "string" ? record.reply.trim() : "";

  if (!reply) {
    return null;
  }

  return {
    reply,
    suggestContact: record.suggestContact === true,
    profileUpdate: record.profileUpdate ?? keepAllProfileUpdate(),
  };
}

export function buildOpenAiChatRequestBody({
  locale,
  message,
  history,
  profile,
  model = chatModel,
}: {
  locale: Locale;
  message: string;
  history: ChatHistoryMessage[];
  profile: TravelProfile;
  model?: string;
}) {
  return {
    model,
    reasoning_effort: chatReasoningEffort,
    max_completion_tokens: chatMaxCompletionTokens,
    response_format: {
      type: "json_schema" as const,
      json_schema: {
        name: "barakova_chat_reply",
        strict: true,
        schema: chatAgentResponseOpenAiSchema,
      },
    },
    messages: [
      { role: "system" as const, content: buildSystemPrompt(locale, profile) },
      ...history.map((entry) => ({
        role: entry.role,
        content: entry.content,
      })),
      { role: "user" as const, content: message },
    ],
  };
}

function fallbackResult(locale: Locale, profile: TravelProfile) {
  return {
    reply: buildFallbackReply(locale),
    source: "fallback" as const,
    suggestContact: true,
    profile,
  };
}

export async function generateAiReply({
  locale,
  message,
  history,
  profile,
}: {
  locale: Locale;
  message: string;
  history: ChatHistoryMessage[];
  profile: TravelProfile;
}) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return fallbackResult(locale, profile);
  }

  const requestBody = buildOpenAiChatRequestBody({
    locale,
    message,
    history,
    profile,
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), openAiTimeoutMs);

  try {
    const response = await fetch(openAiApiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      return fallbackResult(locale, profile);
    }

    const payload = (await response.json()) as {
      choices?: {
        finish_reason?: string | null;
        message?: {
          content?: string | null;
          refusal?: string | null;
        };
      }[];
    };

    const choice = payload.choices?.[0];
    if (!choice) {
      return fallbackResult(locale, profile);
    }

    if (choice.message?.refusal) {
      return fallbackResult(locale, profile);
    }

    if (
      choice.finish_reason === "length" ||
      choice.finish_reason === "content_filter"
    ) {
      return fallbackResult(locale, profile);
    }

    const rawContent = choice.message?.content?.trim();
    if (!rawContent) {
      return fallbackResult(locale, profile);
    }

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(rawContent);
    } catch {
      return fallbackResult(locale, profile);
    }

    const structured = parseStructuredChatAgentPayload(parsedJson);
    if (!structured) {
      return fallbackResult(locale, profile);
    }

    const nextProfile = applyTravelProfileUpdate(
      profile,
      structured.profileUpdate,
      locale,
    );

    return {
      reply: structured.reply,
      source: "ai" as const,
      suggestContact: structured.suggestContact,
      profile: nextProfile,
    };
  } catch {
    return fallbackResult(locale, profile);
  } finally {
    clearTimeout(timeout);
  }
}
