import type { Locale } from "../constants/content";
import { getSiteContent } from "../constants/content-by-locale";

export function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const aiRoutingPatterns: Record<Locale, RegExp[]> = {
  bg: [
    /препоръч/u,
    /предлож/u,
    /сравн/u,
    /разлик/u,
    /между\s+.+\s+и\s+/u,
    /кое\s+.+\s+по[- ]доб/u,
    /коя\s+.+\s+по[- ]доб/u,
    /какъв\s+.+\s+по[- ]подход/u,
    /каква\s+.+\s+по[- ]подход/u,
    /какво\s+би/u,
    /какво\s+бихте/u,
    /имам\s+.+\s+и\s+искам/u,
    /искам\s+.+\s+но/u,
    /без\s+.+\s+но/u,
    /около\s+\d+/u,
    /\d+\s*лева/u,
    /\d+\s*евро/u,
    /за\s+двама/u,
    /за\s+двойка/u,
    /двама\s+възрастни/u,
    /баланс\s+между/u,
    /колко\s+време/u,
    /колко\s+често/u,
    /подготв/u,
    /планирам\s+.+\s+изненад/u,
    /виза/u,
    /визи/u,
    /или\s+.+\s+или/u,
  ],
  en: [
    /recommend/i,
    /suggest/i,
    /compar/i,
    /difference/i,
    /which\s+.+\sbetter/i,
    /what\s+would\s+you/i,
    /i\s+have\s+.+\sand\s+want/i,
    /without\s+.+\bbut/i,
    /around\s+\d+/i,
    /\d+\s*(bgn|eur|usd|euro|leva)\b/i,
    /for\s+two/i,
    /couple/i,
    /balance\s+between/i,
    /how\s+long/i,
    /prepare\s+.+\bconsultation/i,
    /visa/i,
    /\bor\b.+\bor\b/i,
  ],
};

function getDestinationAliases(name: string) {
  const normalized = normalizeText(name);
  const aliases = new Set<string>([normalized]);

  if (normalized.length > 4 && normalized.endsWith("ите")) {
    aliases.add(normalized.slice(0, -3));
  }

  if (normalized.length > 4 && normalized.endsWith("и")) {
    aliases.add(normalized.slice(0, -1));
  }

  if (normalized.length > 4 && normalized.endsWith("а")) {
    aliases.add(normalized.slice(0, -1));
  }

  return [...aliases].filter((alias) => alias.length >= 2);
}

export function destinationMentionedIn(message: string, destinationName: string) {
  const normalizedMessage = normalizeText(message);

  return getDestinationAliases(destinationName).some((alias) => {
    const pattern = new RegExp(
      `(^|\\s)${alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(\\s|$|[.,!?])`,
      "u",
    );

    return pattern.test(normalizedMessage) || normalizedMessage.includes(alias);
  });
}

export function countMentionedDestinations(message: string, locale: Locale) {
  const content = getSiteContent(locale);

  return content.destinations.reduce((count, destination) => {
    return destinationMentionedIn(message, destination.name) ? count + 1 : count;
  }, 0);
}

export function shouldPreferAiReply(message: string, locale: Locale) {
  const normalizedMessage = normalizeText(message);
  const words = normalizedMessage.split(/\s+/).filter(Boolean);

  if (!normalizedMessage) {
    return false;
  }

  if (words.length >= 12 || normalizedMessage.length >= 72) {
    return true;
  }

  if (aiRoutingPatterns[locale].some((pattern) => pattern.test(normalizedMessage))) {
    return true;
  }

  if (countMentionedDestinations(message, locale) >= 2) {
    return true;
  }

  const constraintCount = [
    /бюджет/u,
    /budget/i,
    /около/u,
    /around/i,
    /през\s+(януари|февруари|март|април|май|юни|юли|август|септември|октомври|ноември|декември)/u,
    /in\s+(january|february|march|april|may|june|july|august|september|october|november|december)/i,
    /без/u,
    /without/i,
    /(^|\s)но(\s|$|[.,!?])/u,
    /(^|\s)but(\s|$|[.,!?])/i,
    /двойка/u,
    /couple/i,
    /семейство/u,
    /family/i,
  ].filter((pattern) => pattern.test(normalizedMessage)).length;

  if (constraintCount >= 2 && words.length >= 8) {
    return true;
  }

  return false;
}

export function isPreferenceStatement(message: string, locale: Locale) {
  const normalizedMessage = normalizeText(message);

  if (!normalizedMessage) {
    return false;
  }

  const preferencePatterns =
    locale === "bg"
      ? [
          /(^|[^\p{L}])искам([^\p{L}]|$)/u,
          /(^|[^\p{L}])искаме([^\p{L}]|$)/u,
          /(^|[^\p{L}])планирам([^\p{L}]|$)/u,
          /(^|[^\p{L}])търся([^\p{L}]|$)/u,
          /(^|[^\p{L}])предпочитам([^\p{L}]|$)/u,
          /(^|[^\p{L}])за\s+двама([^\p{L}]|$)/u,
          /(^|[^\p{L}])двойка([^\p{L}]|$)/u,
          /(^|[^\p{L}])семейство([^\p{L}]|$)/u,
          /(^|[^\p{L}])бюджет([^\p{L}]|$)/u,
          /(^|[^\p{L}])около\s+\d+/u,
          /(^|[^\p{L}])през\s+(януари|февруари|март|април|май|юни|юли|август|септември|октомври|ноември|декември)([^\p{L}]|$)/u,
          /(^|[^\p{L}])всъщност([^\p{L}]|$)/u,
          /(^|[^\p{L}])по-скоро([^\p{L}]|$)/u,
          /(^|[^\p{L}])вместо([^\p{L}]|$)/u,
          /(^|[^\p{L}])второто([^\p{L}]|$)/u,
          /(^|[^\p{L}])първото([^\p{L}]|$)/u,
        ]
      : [
          /\bi\s+want\b/i,
          /\bwe\s+want\b/i,
          /\bi\s+am\s+planning\b/i,
          /\blooking\s+for\b/i,
          /\bprefer\b/i,
          /\bfor\s+two\b/i,
          /\bcouple\b/i,
          /\bfamily\b/i,
          /\bbudget\b/i,
          /\baround\s+\d+/i,
          /\bin\s+(january|february|march|april|may|june|july|august|september|october|november|december)\b/i,
          /\bactually\b/i,
          /\brather\b/i,
          /\binstead\b/i,
          /\bthe\s+second\b/i,
          /\bthe\s+first\b/i,
        ];

  return preferencePatterns.some((pattern) => pattern.test(normalizedMessage));
}

export function isClearStandaloneFaqIntent(message: string, locale: Locale) {
  const normalizedMessage = normalizeText(message);

  if (!normalizedMessage) {
    return false;
  }

  const patterns =
    locale === "bg"
      ? [
          /как\s+да\s+се\s+свържа/u,
          /какъв\s+(е\s+)?телефон/u,
          /(^|[^\p{L}])телефон([^\p{L}]|$)/u,
          /(^|[^\p{L}])имейл([^\p{L}]|$)/u,
          /(^|[^\p{L}])email([^\p{L}]|$)/u,
          /какви\s+услуги/u,
          /как\s+работи\s+(процес|консултац)/u,
          /безплатна\s+ли\s+(е\s+)?консултац/u,
          /кои\s+дестинации/u,
          /имате\s+ли\s+круизи/u,
          /кой\s+(е\s+)?(barakova|богдана)/u,
        ]
      : [
          /how\s+can\s+i\s+contact/i,
          /what\s+is\s+your\s+phone/i,
          /\bphone\b/i,
          /\bemail\b/i,
          /what\s+services/i,
          /how\s+does\s+the\s+process/i,
          /is\s+the\s+consultation\s+free/i,
          /which\s+destinations/i,
          /do\s+you\s+offer\s+cruises/i,
          /who\s+is\s+(barakova|bogdana)/i,
        ];

  return patterns.some((pattern) => pattern.test(normalizedMessage));
}

export function isConversationalFollowUp(
  message: string,
  history: { role: string; content: string }[],
) {
  const normalizedMessage = normalizeText(message);
  const words = normalizedMessage.split(/\s+/).filter(Boolean);
  const priorUserTurns = history.filter((entry) => entry.role === "user").length;

  if (!normalizedMessage || priorUserTurns === 0) {
    return false;
  }

  if (words.length <= 6) {
    return true;
  }

  return /^(и\s+|а\s+|also\s+|and\s+|the\s+second|второто|първото|всъщност|actually)/u.test(
    normalizedMessage,
  );
}

export function isSimpleDestinationQuestion(message: string, locale: Locale) {
  const normalizedMessage = normalizeText(message);
  const words = normalizedMessage.split(/\s+/).filter(Boolean);

  if (shouldPreferAiReply(message, locale)) {
    return false;
  }

  if (isPreferenceStatement(message, locale)) {
    return false;
  }

  if (countMentionedDestinations(message, locale) !== 1) {
    return false;
  }

  if (words.length > 10) {
    return false;
  }

  const simpleIntentPatterns =
    locale === "bg"
      ? [
          /^разкажи/,
          /^информация/,
          /^какво\s+е\b/,
          /^какво\s+предлага/,
          /^за\s+/,
          /^малдив/,
          /^сейшел/,
          /^дубай/,
          /^маврици/,
          /^занзибар/,
          /^сицил/,
          /^япон/,
          /^китай/,
          /^сингапур/,
          /^мексик/,
          /^доминикан/,
        ]
      : [
          /^tell\s+me\b/,
          /^what\s+is\b/,
          /^about\b/,
          /^maldives\b/,
          /^seychelles\b/,
          /^dubai\b/,
          /^mauritius\b/,
        ];

  return simpleIntentPatterns.some((pattern) => pattern.test(normalizedMessage));
}
