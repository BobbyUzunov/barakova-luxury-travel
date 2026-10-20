import { maxMessageLength } from "./contact";
import { parseIsoDate, validateTravelDates } from "./contact-dates";
import {
  profileHasClientPreferences,
  type TravelBudget,
  type TravelProfile,
} from "./travel-profile";
import type { Locale } from "../constants/content";

export const summaryBlockStartMarker = "<<<barakova-summary:v1>>>";
export const summaryBlockEndMarker = "<<<end-barakova-summary>>>";
export const summaryFingerprintPrefix = "fp:";

export type ContactHandoffFields = {
  destination?: string;
  travelStartDate?: string;
  travelEndDate?: string;
  datesFlexible?: boolean;
  travelers?: string;
  budget?: string;
};

export type TravelSummaryResult = {
  lines: string[];
  text: string;
  fingerprint: string;
  hasUsefulData: boolean;
  fields: ContactHandoffFields;
  periodNotes: string[];
};

type SummaryLabels = {
  title: string;
  destinations: string;
  period: string;
  year: string;
  flexibility: string;
  duration: string;
  adults: string;
  children: string;
  childrenAges: string;
  budget: string;
  budgetTotal: string;
  budgetPerPerson: string;
  budgetScopeUnknown: string;
  budgetRange: string;
  departure: string;
  tripType: string;
  preferences: string;
  constraints: string;
};

const labelsByLocale: Record<Locale, SummaryLabels> = {
  bg: {
    title: "Резюме от разговора",
    destinations: "Дестинации",
    period: "Период",
    year: "Година",
    flexibility: "Гъвкавост на датите",
    duration: "Продължителност",
    adults: "Възрастни",
    children: "Деца",
    childrenAges: "Потвърдени възрасти на деца",
    budget: "Бюджет",
    budgetTotal: "общо",
    budgetPerPerson: "на човек",
    budgetScopeUnknown: "обхват неуточнен",
    budgetRange: "обхват",
    departure: "Отправна точка",
    tripType: "Тип пътуване",
    preferences: "Предпочитания",
    constraints: "Ограничения",
  },
  en: {
    title: "Conversation summary",
    destinations: "Destinations",
    period: "Period",
    year: "Year",
    flexibility: "Date flexibility",
    duration: "Duration",
    adults: "Adults",
    children: "Children",
    childrenAges: "Confirmed children ages",
    budget: "Budget",
    budgetTotal: "total",
    budgetPerPerson: "per person",
    budgetScopeUnknown: "scope unspecified",
    budgetRange: "range",
    departure: "Departure",
    tripType: "Trip type",
    preferences: "Preferences",
    constraints: "Constraints",
  },
};

/**
 * Interprets free-text date flexibility for the contact checkbox.
 * - true: clearly flexible
 * - false: clearly fixed / not flexible
 * - null: unknown / ambiguous — do not touch the checkbox
 */
export function interpretDateFlexibility(
  value: string | null | undefined,
): boolean | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  const fixedPatterns = [
    /\bfixed\b/,
    /\bexact\b/,
    /\bspecific\b/,
    /\bconfirmed dates?\b/,
    /\binflexible\b/,
    /\bnot\s+flexible\b/,
    /\bno\s+flexibility\b/,
    /\bwithout\s+flexibility\b/,
    /\brigid\b/,
    /фиксиран/,
    /точн(?:а|и|о)?\s+дат/,
    /точни\s+дат/,
    /без\s+гъвкав/,
    /не\s+са\s+гъвкав/,
    /не\s+е\s+гъвкав/,
    /негъвкав/,
  ];

  const flexiblePatterns = [
    /\bflexible\b/,
    /\bflexibility\b/,
    /\bapprox/,
    /\broughly\b/,
    /\b\+\/-/,
    /±/,
    /гъвкав/,
    /приблизит/,
    /\+\/-/,
  ];

  // Check fixed / negated phrases first — they often contain the word
  // "flexible"/"гъвкав" and must not be treated as flexible.
  if (fixedPatterns.some((pattern) => pattern.test(normalized))) {
    return false;
  }
  if (flexiblePatterns.some((pattern) => pattern.test(normalized))) {
    return true;
  }

  // Unrecognized wording stays unknown.
  return null;
}

function formatNumber(value: number, locale: Locale) {
  return new Intl.NumberFormat(locale === "bg" ? "bg-BG" : "en-GB").format(
    value,
  );
}

function simpleFingerprint(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `${summaryFingerprintPrefix}${(hash >>> 0).toString(16)}`;
}

function formatBudgetLine(budget: TravelBudget, locale: Locale, labels: SummaryLabels) {
  const currency = budget.currency?.trim() || null;
  const parts: string[] = [];

  if (budget.amount !== null) {
    parts.push(
      currency
        ? `${formatNumber(budget.amount, locale)} ${currency}`
        : formatNumber(budget.amount, locale),
    );
  } else if (budget.min !== null || budget.max !== null) {
    const min =
      budget.min !== null ? formatNumber(budget.min, locale) : null;
    const max =
      budget.max !== null ? formatNumber(budget.max, locale) : null;
    const range =
      min && max
        ? `${min} – ${max}`
        : min
          ? `≥ ${min}`
          : max
            ? `≤ ${max}`
            : null;
    if (range) {
      parts.push(
        currency ? `${range} ${currency}` : range,
      );
      parts.push(`(${labels.budgetRange})`);
    }
  }

  if (parts.length === 0 && currency) {
    parts.push(currency);
  }

  if (budget.scope === "total") {
    parts.push(`(${labels.budgetTotal})`);
  } else if (budget.scope === "per_person") {
    parts.push(`(${labels.budgetPerPerson})`);
  } else if (parts.length > 0) {
    parts.push(`(${labels.budgetScopeUnknown})`);
  }

  return parts.length > 0 ? parts.join(" ") : null;
}

function formatBudgetField(budget: TravelBudget, locale: Locale, labels: SummaryLabels) {
  const currency = budget.currency?.trim() || null;
  const chunks: string[] = [];

  if (budget.amount !== null) {
    chunks.push(
      currency
        ? `${formatNumber(budget.amount, locale)} ${currency}`
        : formatNumber(budget.amount, locale),
    );
  } else if (budget.min !== null || budget.max !== null) {
    const min =
      budget.min !== null ? formatNumber(budget.min, locale) : null;
    const max =
      budget.max !== null ? formatNumber(budget.max, locale) : null;
    const range =
      min && max
        ? `${min} – ${max}`
        : min
          ? `≥ ${min}`
          : max
            ? `≤ ${max}`
            : null;
    if (range) {
      chunks.push(currency ? `${range} ${currency}` : range);
    }
  } else if (currency) {
    chunks.push(currency);
  }

  if (chunks.length === 0) {
    return undefined;
  }

  if (budget.scope === "total") {
    chunks.push(`(${labels.budgetTotal})`);
  } else if (budget.scope === "per_person") {
    chunks.push(`(${labels.budgetPerPerson})`);
  }
  // Unknown scope: keep currency/amount without claiming total/per person.

  return chunks.join(" ");
}

function parseExactDateRange(period: string | null): {
  start?: string;
  end?: string;
} {
  if (!period) {
    return {};
  }

  const trimmed = period.trim();
  const single = parseIsoDate(trimmed);
  if (single) {
    return { start: single.iso };
  }

  const rangeMatch = trimmed.match(
    /^(\d{4}-\d{2}-\d{2})\s*(?:–|-|—|to|до)\s*(\d{4}-\d{2}-\d{2})$/i,
  );
  if (!rangeMatch) {
    return {};
  }

  const start = parseIsoDate(rangeMatch[1]);
  const end = parseIsoDate(rangeMatch[2]);
  if (!start || !end) {
    return {};
  }

  return { start: start.iso, end: end.iso };
}

function buildPeriodNotes(profile: TravelProfile, labels: SummaryLabels) {
  const notes: string[] = [];

  // Always keep the known period wording in the summary text (calendar fields
  // are filled separately only for unambiguous ISO dates).
  if (profile.period) {
    notes.push(`${labels.period}: ${profile.period}`);
  }
  if (profile.year !== null) {
    notes.push(`${labels.year}: ${profile.year}`);
  }
  if (profile.dateFlexibility) {
    notes.push(`${labels.flexibility}: ${profile.dateFlexibility}`);
  }
  if (profile.duration) {
    notes.push(`${labels.duration}: ${profile.duration}`);
  }

  return notes;
}

function mapTravelers(profile: TravelProfile): string | undefined {
  // Only invent a total when adults are known and children are known (including 0).
  if (profile.adults === null || profile.children === null) {
    return undefined;
  }

  const total = profile.adults + profile.children;
  if (!Number.isFinite(total) || total <= 0) {
    return undefined;
  }

  return String(total);
}

function mapDates(profile: TravelProfile): Pick<
  ContactHandoffFields,
  "travelStartDate" | "travelEndDate" | "datesFlexible"
> {
  const exact = parseExactDateRange(profile.period);
  const fields: Pick<
    ContactHandoffFields,
    "travelStartDate" | "travelEndDate" | "datesFlexible"
  > = {};

  if (exact.start || exact.end) {
    const validated = validateTravelDates({
      travelStartDate: exact.start ?? "",
      travelEndDate: exact.end ?? "",
      datesFlexible: false,
    });

    if (validated.ok) {
      if (exact.start) {
        fields.travelStartDate = exact.start;
      }
      if (exact.end) {
        fields.travelEndDate = exact.end;
      }
    }
  }

  const flexibility = interpretDateFlexibility(profile.dateFlexibility);
  if (flexibility === true) {
    fields.datesFlexible = true;
  } else if (flexibility === false) {
    fields.datesFlexible = false;
  }

  return fields;
}

export function buildTravelSummary(profile: TravelProfile): TravelSummaryResult {
  const locale = profile.locale === "en" ? "en" : "bg";
  const labels = labelsByLocale[locale];
  const lines: string[] = [];
  const periodNotes = buildPeriodNotes(profile, labels);

  if (profile.destinations.length > 0) {
    lines.push(`${labels.destinations}: ${profile.destinations.join(", ")}`);
  }

  for (const note of periodNotes) {
    lines.push(note);
  }

  if (profile.adults !== null) {
    lines.push(`${labels.adults}: ${profile.adults}`);
  }
  if (profile.children !== null) {
    lines.push(`${labels.children}: ${profile.children}`);
  }
  if (profile.childrenAges !== null && profile.childrenAges.length > 0) {
    lines.push(
      `${labels.childrenAges}: ${profile.childrenAges.join(", ")}`,
    );
  }

  if (profile.budget) {
    const budgetLine = formatBudgetLine(profile.budget, locale, labels);
    if (budgetLine) {
      lines.push(`${labels.budget}: ${budgetLine}`);
    }
  }

  if (profile.departure) {
    lines.push(`${labels.departure}: ${profile.departure}`);
  }
  if (profile.tripType) {
    lines.push(`${labels.tripType}: ${profile.tripType}`);
  }
  if (profile.preferences.length > 0) {
    lines.push(`${labels.preferences}: ${profile.preferences.join(", ")}`);
  }
  if (profile.constraints.length > 0) {
    lines.push(`${labels.constraints}: ${profile.constraints.join(", ")}`);
  }

  const text = lines.join("\n");
  const fields: ContactHandoffFields = {
    ...mapDates(profile),
  };

  if (profile.destinations.length > 0) {
    fields.destination = profile.destinations.join(", ");
  }

  const travelers = mapTravelers(profile);
  if (travelers) {
    fields.travelers = travelers;
  }

  if (profile.budget) {
    const budgetField = formatBudgetField(profile.budget, locale, labels);
    if (budgetField) {
      fields.budget = budgetField;
    }
  }

  return {
    lines,
    text,
    fingerprint: simpleFingerprint(text),
    hasUsefulData: profileHasClientPreferences(profile) && lines.length > 0,
    fields,
    periodNotes,
  };
}

export function formatTravelSummaryBlock(summary: TravelSummaryResult, locale: Locale) {
  const labels = labelsByLocale[locale === "en" ? "en" : "bg"];
  const body = [labels.title, summary.text].filter(Boolean).join("\n");
  return [
    summaryBlockStartMarker,
    summary.fingerprint,
    body,
    summaryBlockEndMarker,
  ].join("\n");
}

/** True when the auto-summary block markers are intact and fingerprint matches body text. */
export function isSummaryBlockIntact(message: string, locale: Locale) {
  const extracted = extractSummaryBlock(message);
  if (!extracted.block || !extracted.fingerprint || extracted.body == null) {
    return false;
  }

  const labels = labelsByLocale[locale === "en" ? "en" : "bg"];
  const titlePrefix = `${labels.title}\n`;
  if (!extracted.body.startsWith(titlePrefix) && extracted.body !== labels.title) {
    return false;
  }

  const summaryText = extracted.body.startsWith(titlePrefix)
    ? extracted.body.slice(titlePrefix.length)
    : "";
  return simpleFingerprint(summaryText) === extracted.fingerprint;
}

export function extractSummaryBlock(message: string): {
  before: string;
  block: string | null;
  fingerprint: string | null;
  body: string | null;
  after: string;
} {
  const start = message.indexOf(summaryBlockStartMarker);
  if (start === -1) {
    return {
      before: message,
      block: null,
      fingerprint: null,
      body: null,
      after: "",
    };
  }

  const end = message.indexOf(summaryBlockEndMarker, start);
  if (end === -1) {
    return {
      before: message,
      block: null,
      fingerprint: null,
      body: null,
      after: "",
    };
  }

  const blockEnd = end + summaryBlockEndMarker.length;
  const block = message.slice(start, blockEnd);
  const inner = message
    .slice(start + summaryBlockStartMarker.length, end)
    .replace(/^\n/, "")
    .replace(/\n$/, "");
  const lines = inner.split("\n");
  const fingerprintLine = lines[0]?.startsWith(summaryFingerprintPrefix)
    ? lines[0]
    : null;
  const body = fingerprintLine ? lines.slice(1).join("\n") : inner;

  return {
    before: message.slice(0, start).replace(/\s+$/, ""),
    block,
    fingerprint: fingerprintLine,
    body,
    after: message.slice(blockEnd).replace(/^\s+/, ""),
  };
}

export type MessageMergeStatus =
  | "appended"
  | "replaced"
  | "already-present"
  | "conflict"
  | "too-long"
  | "unchanged";

export type MessageMergeResult = {
  message: string;
  status: MessageMergeStatus;
  /** True only when the summary block was actually written into the message. */
  summaryAdded: boolean;
};

function composeMessage(before: string, block: string, after: string) {
  return [before, block, after].filter((part) => part.trim().length > 0).join("\n\n");
}

export function mergeMessageWithSummary(options: {
  existing: string;
  summaryBlock: string;
  fingerprint: string;
  locale: Locale;
  forceReplace?: boolean;
  maxLength?: number;
}): MessageMergeResult {
  const maxLength = options.maxLength ?? maxMessageLength;
  const existing = options.existing.trim();
  const extracted = extractSummaryBlock(existing);

  if (!extracted.block) {
    const next = composeMessage(existing, options.summaryBlock, "");
    if (next.length > maxLength) {
      return {
        message: existing,
        status: "too-long",
        summaryAdded: false,
      };
    }
    return {
      message: next,
      status: "appended",
      summaryAdded: true,
    };
  }

  if (extracted.fingerprint === options.fingerprint) {
    return {
      message: existing,
      status: "already-present",
      summaryAdded: true,
    };
  }

  const intact = isSummaryBlockIntact(existing, options.locale);
  if (!options.forceReplace && !intact) {
    return {
      message: existing,
      status: "conflict",
      summaryAdded: false,
    };
  }

  const next = composeMessage(
    extracted.before,
    options.summaryBlock,
    extracted.after,
  );
  if (next.length > maxLength) {
    return {
      message: existing,
      status: "too-long",
      summaryAdded: false,
    };
  }

  return {
    message: next,
    status: "replaced",
    summaryAdded: true,
  };
}

export type HandoffFormFieldKey = keyof ContactHandoffFields;

export function applyHandoffFieldsToFormValues<
  T extends {
    destination: string;
    travelStartDate: string;
    travelEndDate: string;
    datesFlexible: boolean;
    travelers: string;
    budget: string;
  },
>(
  current: T,
  fields: ContactHandoffFields,
  touchedKeys: ReadonlySet<string> = new Set(),
): { next: T; filledKeys: HandoffFormFieldKey[] } {
  const next = { ...current };
  const filledKeys: HandoffFormFieldKey[] = [];

  const canFill = (key: HandoffFormFieldKey) => !touchedKeys.has(key);

  if (
    canFill("destination") &&
    fields.destination &&
    next.destination.trim() === ""
  ) {
    next.destination = fields.destination;
    filledKeys.push("destination");
  }
  if (
    canFill("travelStartDate") &&
    fields.travelStartDate &&
    next.travelStartDate.trim() === ""
  ) {
    next.travelStartDate = fields.travelStartDate;
    filledKeys.push("travelStartDate");
  }
  if (
    canFill("travelEndDate") &&
    fields.travelEndDate &&
    next.travelEndDate.trim() === ""
  ) {
    next.travelEndDate = fields.travelEndDate;
    filledKeys.push("travelEndDate");
  }
  if (
    canFill("datesFlexible") &&
    typeof fields.datesFlexible === "boolean" &&
    next.datesFlexible !== fields.datesFlexible
  ) {
    next.datesFlexible = fields.datesFlexible;
    filledKeys.push("datesFlexible");
  }
  if (canFill("travelers") && fields.travelers && next.travelers.trim() === "") {
    next.travelers = fields.travelers;
    filledKeys.push("travelers");
  }
  if (canFill("budget") && fields.budget && next.budget.trim() === "") {
    next.budget = fields.budget;
    filledKeys.push("budget");
  }

  return { next, filledKeys };
}
