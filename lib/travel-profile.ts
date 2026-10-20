import type { Locale } from "../constants/content";

export const maxProfileStringLength = 120;
export const maxProfileListItems = 8;
export const maxChildrenAges = 6;

export type BudgetScope = "total" | "per_person";

export type TravelBudget = {
  amount: number | null;
  min: number | null;
  max: number | null;
  currency: string | null;
  scope: BudgetScope | null;
};

export type TravelProfile = {
  destinations: string[];
  period: string | null;
  year: number | null;
  dateFlexibility: string | null;
  duration: string | null;
  adults: number | null;
  children: number | null;
  childrenAges: number[] | null;
  budget: TravelBudget | null;
  departure: string | null;
  tripType: string | null;
  preferences: string[];
  constraints: string[];
  locale: Locale;
  updatedAt: string;
};

export type FieldUpdateAction = "keep" | "set" | "clear";

export type StringFieldUpdate = {
  action: FieldUpdateAction;
  value: string;
};

export type NumberFieldUpdate = {
  action: FieldUpdateAction;
  value: number;
};

export type StringListFieldUpdate = {
  action: FieldUpdateAction;
  value: string[];
};

export type NumberListFieldUpdate = {
  action: FieldUpdateAction;
  value: number[];
};

export type BudgetFieldUpdate = {
  action: FieldUpdateAction;
  value: TravelBudget;
};

export type TravelProfileUpdate = {
  destinations: StringListFieldUpdate;
  period: StringFieldUpdate;
  year: NumberFieldUpdate;
  dateFlexibility: StringFieldUpdate;
  duration: StringFieldUpdate;
  adults: NumberFieldUpdate;
  children: NumberFieldUpdate;
  childrenAges: NumberListFieldUpdate;
  budget: BudgetFieldUpdate;
  departure: StringFieldUpdate;
  tripType: StringFieldUpdate;
  preferences: StringListFieldUpdate;
  constraints: StringListFieldUpdate;
};

const emptyBudget = (): TravelBudget => ({
  amount: null,
  min: null,
  max: null,
  currency: null,
  scope: null,
});

export function createEmptyTravelProfile(locale: Locale): TravelProfile {
  return {
    destinations: [],
    period: null,
    year: null,
    dateFlexibility: null,
    duration: null,
    adults: null,
    children: null,
    childrenAges: null,
    budget: null,
    departure: null,
    tripType: null,
    preferences: [],
    constraints: [],
    locale,
    updatedAt: new Date(0).toISOString(),
  };
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function sanitizeString(value: unknown, maxLength = maxProfileStringLength) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim().slice(0, maxLength);
  return trimmed.length > 0 ? trimmed : null;
}

function sanitizeStringList(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  const items: string[] = [];

  for (const entry of value) {
    const sanitized = sanitizeString(entry);
    if (sanitized && !items.includes(sanitized)) {
      items.push(sanitized);
    }
    if (items.length >= maxProfileListItems) {
      break;
    }
  }

  return items;
}

function sanitizeFiniteNumber(value: unknown, min: number, max: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  if (value < min || value > max) {
    return null;
  }

  return value;
}

/** Whole traveler counts / years — reject fractions instead of rounding. */
function sanitizeInteger(value: unknown, min: number, max: number) {
  if (typeof value !== "number" || !Number.isFinite(value) || !Number.isInteger(value)) {
    return null;
  }

  if (value < min || value > max) {
    return null;
  }

  return value;
}

function sanitizeNumberList(value: unknown, min: number, max: number, limit: number) {
  if (!Array.isArray(value)) {
    return null;
  }

  const items: number[] = [];

  for (const entry of value) {
    const sanitized = sanitizeInteger(entry, min, max);
    if (sanitized !== null) {
      items.push(sanitized);
    }
    if (items.length >= limit) {
      break;
    }
  }

  return items;
}

function sanitizeBudgetScope(value: unknown): BudgetScope | null {
  return value === "total" || value === "per_person" ? value : null;
}

type OptionalParseResult<T> =
  | { ok: true; value: T }
  | { ok: false };

/** Distinguishes allowed null/undefined from an explicitly invalid value. */
function parseOptionalBudgetNumber(
  value: unknown,
  min: number,
  max: number,
): OptionalParseResult<number | null> {
  if (value === null || value === undefined) {
    return { ok: true, value: null };
  }

  const sanitized = sanitizeFiniteNumber(value, min, max);
  if (sanitized === null) {
    return { ok: false };
  }

  return { ok: true, value: sanitized };
}

function parseOptionalBudgetCurrency(
  value: unknown,
): OptionalParseResult<string | null> {
  if (value === null || value === undefined) {
    return { ok: true, value: null };
  }

  if (typeof value !== "string") {
    return { ok: false };
  }

  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return { ok: true, value: null };
  }

  return { ok: true, value: trimmed.slice(0, 8).toUpperCase() };
}

function parseOptionalBudgetScope(
  value: unknown,
): OptionalParseResult<BudgetScope | null> {
  if (value === null || value === undefined) {
    return { ok: true, value: null };
  }

  if (value === "total" || value === "per_person") {
    return { ok: true, value };
  }

  return { ok: false };
}

/**
 * Strict budget parse for profileUpdate set.
 * Returns null when the object is empty (all allowed nulls).
 * Returns undefined when any field is invalid or min > max — caller must keep.
 */
function parseBudgetSetValue(value: unknown): TravelBudget | null | undefined {
  if (value === null) {
    return null;
  }

  if (!isPlainObject(value)) {
    return undefined;
  }

  const amount = parseOptionalBudgetNumber(value.amount, 0, 10_000_000);
  const min = parseOptionalBudgetNumber(value.min, 0, 10_000_000);
  const max = parseOptionalBudgetNumber(value.max, 0, 10_000_000);
  const currency = parseOptionalBudgetCurrency(value.currency);
  const scope = parseOptionalBudgetScope(value.scope);

  if (!amount.ok || !min.ok || !max.ok || !currency.ok || !scope.ok) {
    return undefined;
  }

  if (
    min.value !== null &&
    max.value !== null &&
    min.value > max.value
  ) {
    return undefined;
  }

  if (
    amount.value === null &&
    min.value === null &&
    max.value === null &&
    currency.value === null &&
    scope.value === null
  ) {
    return null;
  }

  return {
    amount: amount.value,
    min: min.value,
    max: max.value,
    currency: currency.value,
    scope: scope.value,
  };
}

function sanitizeBudget(value: unknown): TravelBudget | null {
  if (value === null) {
    return null;
  }

  if (!isPlainObject(value)) {
    return null;
  }

  const amount = sanitizeFiniteNumber(value.amount, 0, 10_000_000);
  const min = sanitizeFiniteNumber(value.min, 0, 10_000_000);
  const max = sanitizeFiniteNumber(value.max, 0, 10_000_000);
  const currency = sanitizeString(value.currency, 8)?.toUpperCase() ?? null;
  const scope = sanitizeBudgetScope(value.scope);

  if (
    amount === null &&
    min === null &&
    max === null &&
    currency === null &&
    scope === null
  ) {
    return null;
  }

  return { amount, min, max, currency, scope };
}

function sanitizeFieldAction(value: unknown): FieldUpdateAction {
  return value === "set" || value === "clear" || value === "keep" ? value : "keep";
}

export function sanitizeTravelProfile(
  value: unknown,
  fallbackLocale: Locale = "bg",
): TravelProfile | null {
  if (!isPlainObject(value)) {
    return null;
  }

  const locale = value.locale === "en" || value.locale === "bg" ? value.locale : fallbackLocale;
  const updatedAt =
    typeof value.updatedAt === "string" && !Number.isNaN(Date.parse(value.updatedAt))
      ? value.updatedAt
      : new Date().toISOString();

  return {
    destinations: sanitizeStringList(value.destinations),
    period: sanitizeString(value.period),
    year: sanitizeInteger(value.year, 2024, 2100),
    dateFlexibility: sanitizeString(value.dateFlexibility),
    duration: sanitizeString(value.duration),
    adults: sanitizeInteger(value.adults, 1, 30),
    children: sanitizeInteger(value.children, 0, 20),
    childrenAges: sanitizeNumberList(value.childrenAges, 0, 17, maxChildrenAges),
    budget: sanitizeBudget(value.budget),
    departure: sanitizeString(value.departure),
    tripType: sanitizeString(value.tripType),
    preferences: sanitizeStringList(value.preferences),
    constraints: sanitizeStringList(value.constraints),
    locale,
    updatedAt,
  };
}

function sanitizeStringFieldUpdate(value: unknown): StringFieldUpdate {
  if (!isPlainObject(value)) {
    return { action: "keep", value: "" };
  }

  const action = sanitizeFieldAction(value.action);
  if (action === "set") {
    const sanitized = sanitizeString(value.value);
    if (!sanitized) {
      return { action: "keep", value: "" };
    }
    return { action: "set", value: sanitized };
  }

  return {
    action,
    value: sanitizeString(value.value) ?? "",
  };
}

function sanitizeNumberFieldUpdate(
  value: unknown,
  min: number,
  max: number,
): NumberFieldUpdate {
  if (!isPlainObject(value)) {
    return { action: "keep", value: 0 };
  }

  const action = sanitizeFieldAction(value.action);
  if (action === "set") {
    const sanitized = sanitizeInteger(value.value, min, max);
    if (sanitized === null) {
      return { action: "keep", value: 0 };
    }
    return { action: "set", value: sanitized };
  }

  return {
    action,
    value: 0,
  };
}

function sanitizeStringListFieldUpdate(value: unknown): StringListFieldUpdate {
  if (!isPlainObject(value)) {
    return { action: "keep", value: [] };
  }

  const action = sanitizeFieldAction(value.action);
  if (action === "set") {
    if (!Array.isArray(value.value)) {
      return { action: "keep", value: [] };
    }
    const sanitized = sanitizeStringList(value.value);
    if (sanitized.length === 0 && value.value.length > 0) {
      return { action: "keep", value: [] };
    }
    return { action: "set", value: sanitized };
  }

  return {
    action,
    value: sanitizeStringList(value.value),
  };
}

function sanitizeNumberListFieldUpdate(
  value: unknown,
  min: number,
  max: number,
  limit: number,
): NumberListFieldUpdate {
  if (!isPlainObject(value)) {
    return { action: "keep", value: [] };
  }

  const action = sanitizeFieldAction(value.action);
  if (action === "set") {
    if (!Array.isArray(value.value)) {
      return { action: "keep", value: [] };
    }
    const sanitized = sanitizeNumberList(value.value, min, max, limit) ?? [];
    if (sanitized.length === 0 && value.value.length > 0) {
      return { action: "keep", value: [] };
    }
    return { action: "set", value: sanitized };
  }

  return {
    action,
    value: sanitizeNumberList(value.value, min, max, limit) ?? [],
  };
}

function sanitizeBudgetFieldUpdate(value: unknown): BudgetFieldUpdate {
  if (!isPlainObject(value)) {
    return { action: "keep", value: emptyBudget() };
  }

  const action = sanitizeFieldAction(value.action);
  if (action === "set") {
    const parsed = parseBudgetSetValue(value.value);
    // undefined = invalid field / contradictory bounds → keep previous budget
    if (parsed === undefined || parsed === null) {
      return { action: "keep", value: emptyBudget() };
    }
    return { action: "set", value: parsed };
  }

  return {
    action,
    value: sanitizeBudget(value.value) ?? emptyBudget(),
  };
}

export function sanitizeTravelProfileUpdate(value: unknown): TravelProfileUpdate {
  const source = isPlainObject(value) ? value : {};

  return {
    destinations: sanitizeStringListFieldUpdate(source.destinations),
    period: sanitizeStringFieldUpdate(source.period),
    year: sanitizeNumberFieldUpdate(source.year, 2024, 2100),
    dateFlexibility: sanitizeStringFieldUpdate(source.dateFlexibility),
    duration: sanitizeStringFieldUpdate(source.duration),
    adults: sanitizeNumberFieldUpdate(source.adults, 1, 30),
    children: sanitizeNumberFieldUpdate(source.children, 0, 20),
    childrenAges: sanitizeNumberListFieldUpdate(
      source.childrenAges,
      0,
      17,
      maxChildrenAges,
    ),
    budget: sanitizeBudgetFieldUpdate(source.budget),
    departure: sanitizeStringFieldUpdate(source.departure),
    tripType: sanitizeStringFieldUpdate(source.tripType),
    preferences: sanitizeStringListFieldUpdate(source.preferences),
    constraints: sanitizeStringListFieldUpdate(source.constraints),
  };
}

function applyStringUpdate(current: string | null, update: StringFieldUpdate) {
  if (update.action === "keep") {
    return current;
  }
  if (update.action === "clear") {
    return null;
  }
  return update.value || null;
}

function applyNumberUpdate(current: number | null, update: NumberFieldUpdate) {
  if (update.action === "keep") {
    return current;
  }
  if (update.action === "clear") {
    return null;
  }
  return update.value;
}

function applyStringListUpdate(current: string[], update: StringListFieldUpdate) {
  if (update.action === "keep") {
    return current;
  }
  if (update.action === "clear") {
    return [];
  }
  return update.value;
}

function applyNumberListUpdate(
  current: number[] | null,
  update: NumberListFieldUpdate,
) {
  if (update.action === "keep") {
    return current;
  }
  if (update.action === "clear") {
    return null;
  }
  return update.value;
}

function applyBudgetUpdate(
  current: TravelBudget | null,
  update: BudgetFieldUpdate,
) {
  if (update.action === "keep") {
    return current;
  }
  if (update.action === "clear") {
    return null;
  }

  const next = update.value;
  if (
    next.amount === null &&
    next.min === null &&
    next.max === null &&
    next.currency === null &&
    next.scope === null
  ) {
    return null;
  }

  return next;
}

export function applyTravelProfileUpdate(
  profile: TravelProfile,
  updateInput: unknown,
  locale: Locale = profile.locale,
): TravelProfile {
  const update = sanitizeTravelProfileUpdate(updateInput);
  const next: TravelProfile = {
    ...profile,
    destinations: applyStringListUpdate(profile.destinations, update.destinations),
    period: applyStringUpdate(profile.period, update.period),
    year: applyNumberUpdate(profile.year, update.year),
    dateFlexibility: applyStringUpdate(profile.dateFlexibility, update.dateFlexibility),
    duration: applyStringUpdate(profile.duration, update.duration),
    adults: applyNumberUpdate(profile.adults, update.adults),
    children: applyNumberUpdate(profile.children, update.children),
    childrenAges: applyNumberListUpdate(profile.childrenAges, update.childrenAges),
    budget: applyBudgetUpdate(profile.budget, update.budget),
    departure: applyStringUpdate(profile.departure, update.departure),
    tripType: applyStringUpdate(profile.tripType, update.tripType),
    preferences: applyStringListUpdate(profile.preferences, update.preferences),
    constraints: applyStringListUpdate(profile.constraints, update.constraints),
    locale,
    updatedAt: new Date().toISOString(),
  };

  return next;
}

export function keepAllProfileUpdate(): TravelProfileUpdate {
  return sanitizeTravelProfileUpdate({});
}

export function profileHasClientPreferences(profile: TravelProfile) {
  return (
    profile.destinations.length > 0 ||
    profile.period !== null ||
    profile.year !== null ||
    profile.dateFlexibility !== null ||
    profile.duration !== null ||
    profile.adults !== null ||
    profile.children !== null ||
    (profile.childrenAges !== null && profile.childrenAges.length > 0) ||
    profile.budget !== null ||
    profile.departure !== null ||
    profile.tripType !== null ||
    profile.preferences.length > 0 ||
    profile.constraints.length > 0
  );
}

export function formatTravelProfileForPrompt(profile: TravelProfile) {
  const lines = [
    `locale: ${profile.locale}`,
    `destinations: ${profile.destinations.join(", ") || "unknown"}`,
    `period: ${profile.period ?? "unknown"}`,
    `year: ${profile.year ?? "unknown"}`,
    `dateFlexibility: ${profile.dateFlexibility ?? "unknown"}`,
    `duration: ${profile.duration ?? "unknown"}`,
    `adults: ${profile.adults ?? "unknown"}`,
    `children: ${profile.children ?? "unknown"}`,
    `childrenAges: ${profile.childrenAges?.join(", ") ?? "unknown"}`,
    `budget: ${
      profile.budget
        ? JSON.stringify(profile.budget)
        : "unknown"
    }`,
    `departure: ${profile.departure ?? "unknown"}`,
    `tripType: ${profile.tripType ?? "unknown"}`,
    `preferences: ${profile.preferences.join(", ") || "unknown"}`,
    `constraints: ${profile.constraints.join(", ") || "unknown"}`,
  ];

  return lines.join("\n");
}

function isNegatedPreferenceContext(normalized: string, matchIndex: number) {
  const prefix = normalized.slice(Math.max(0, matchIndex - 24), matchIndex);
  return /(^|[^\p{L}])(не|няма|без|not|no|without|instead of)\s*$/u.test(
    prefix.trimEnd(),
  );
}

/**
 * Lightweight client-preference hints from the latest user message (FAQ path).
 * Only records clearly expressed travel preferences — not polite English "May I",
 * negations, or incidental month/year mentions.
 */
export function extractHeuristicProfileUpdate(
  message: string,
  locale: Locale,
): TravelProfileUpdate {
  const update = keepAllProfileUpdate();
  const normalized = message.toLowerCase();

  // English polite openers must not be treated as the month of May.
  if (/\bmay\s+i\b|\bmay\s+we\b|\bmay\s+you\b/i.test(normalized)) {
    // Skip bare-month English extraction entirely for these utterances.
  } else {
    const monthPatterns: Array<[RegExp, string]> =
      locale === "bg"
        ? [
            [/(^|[^\p{L}])през\s+януари([^\p{L}]|$)/u, "януари"],
            [/(^|[^\p{L}])през\s+февруари([^\p{L}]|$)/u, "февруари"],
            [/(^|[^\p{L}])през\s+март([^\p{L}]|$)/u, "март"],
            [/(^|[^\p{L}])през\s+април([^\p{L}]|$)/u, "април"],
            [/(^|[^\p{L}])през\s+май([^\p{L}]|$)/u, "май"],
            [/(^|[^\p{L}])през\s+юни([^\p{L}]|$)/u, "юни"],
            [/(^|[^\p{L}])през\s+юли([^\p{L}]|$)/u, "юли"],
            [/(^|[^\p{L}])през\s+август([^\p{L}]|$)/u, "август"],
            [/(^|[^\p{L}])през\s+септември([^\p{L}]|$)/u, "септември"],
            [/(^|[^\p{L}])през\s+октомври([^\p{L}]|$)/u, "октомври"],
            [/(^|[^\p{L}])през\s+ноември([^\p{L}]|$)/u, "ноември"],
            [/(^|[^\p{L}])през\s+декември([^\p{L}]|$)/u, "декември"],
          ]
        : [
            [/\bin\s+january\b/i, "January"],
            [/\bin\s+february\b/i, "February"],
            [/\bin\s+march\b/i, "March"],
            [/\bin\s+april\b/i, "April"],
            [/\bin\s+may\b/i, "May"],
            [/\bin\s+june\b/i, "June"],
            [/\bin\s+july\b/i, "July"],
            [/\bin\s+august\b/i, "August"],
            [/\bin\s+september\b/i, "September"],
            [/\bin\s+october\b/i, "October"],
            [/\bin\s+november\b/i, "November"],
            [/\bin\s+december\b/i, "December"],
            [/\bduring\s+january\b/i, "January"],
            [/\bduring\s+february\b/i, "February"],
            [/\bduring\s+march\b/i, "March"],
            [/\bduring\s+april\b/i, "April"],
            [/\bduring\s+may\b/i, "May"],
            [/\bduring\s+june\b/i, "June"],
            [/\bduring\s+july\b/i, "July"],
            [/\bduring\s+august\b/i, "August"],
            [/\bduring\s+september\b/i, "September"],
            [/\bduring\s+october\b/i, "October"],
            [/\bduring\s+november\b/i, "November"],
            [/\bduring\s+december\b/i, "December"],
          ];

    for (const [pattern, label] of monthPatterns) {
      const match = pattern.exec(normalized);
      if (!match) {
        continue;
      }
      if (isNegatedPreferenceContext(normalized, match.index)) {
        continue;
      }
      update.period = { action: "set", value: label };
      break;
    }
  }

  if (
    /(^|[^\p{L}])(за\s+двама|двойка)([^\p{L}]|$)/u.test(normalized) ||
    /\bfor\s+two\b|\bas\s+a\s+couple\b|\bcouple\b/i.test(normalized)
  ) {
    if (
      !/(^|[^\p{L}])(не\s+за\s+двама|не\s+двойка)([^\p{L}]|$)/u.test(normalized) &&
      !/\bnot\s+for\s+two\b|\bnot\s+a\s+couple\b/i.test(normalized)
    ) {
      update.adults = { action: "set", value: 2 };
    }
  } else {
    const adultsMatch =
      normalized.match(
        /(^|[^\p{L}])(?:за\s+)?(\d+)\s*(?:души|възрастни|adults?|people|persons?)([^\p{L}]|$)/u,
      ) ||
      normalized.match(
        /\b(?:for\s+)?(\d+)\s*(?:adults?|people|persons?)\b/i,
      );

    if (adultsMatch) {
      const adults = Number(adultsMatch[2] ?? adultsMatch[1]);
      const matchIndex = adultsMatch.index ?? 0;
      if (
        Number.isInteger(adults) &&
        adults >= 1 &&
        adults <= 30 &&
        !isNegatedPreferenceContext(normalized, matchIndex)
      ) {
        update.adults = { action: "set", value: adults };
      }
    }
  }

  const yearMatch =
    normalized.match(
      /(^|[^\p{L}])(?:през|in|during|for)\s+(20[2-9]\d)([^\p{L}]|$)/u,
    ) ||
    (update.period.action === "set"
      ? normalized.match(/(^|[^\p{L}])(20[2-9]\d)([^\p{L}]|$)/u)
      : null);

  if (
    yearMatch &&
    !isNegatedPreferenceContext(normalized, yearMatch.index ?? 0)
  ) {
    update.year = { action: "set", value: Number(yearMatch[2]) };
  }

  return update;
}

export const travelProfileOpenAiSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "destinations",
    "period",
    "year",
    "dateFlexibility",
    "duration",
    "adults",
    "children",
    "childrenAges",
    "budget",
    "departure",
    "tripType",
    "preferences",
    "constraints",
  ],
  properties: {
    destinations: {
      type: "object",
      additionalProperties: false,
      required: ["action", "value"],
      properties: {
        action: { type: "string", enum: ["keep", "set", "clear"] },
        value: { type: "array", items: { type: "string" } },
      },
    },
    period: {
      type: "object",
      additionalProperties: false,
      required: ["action", "value"],
      properties: {
        action: { type: "string", enum: ["keep", "set", "clear"] },
        value: { type: "string" },
      },
    },
    year: {
      type: "object",
      additionalProperties: false,
      required: ["action", "value"],
      properties: {
        action: { type: "string", enum: ["keep", "set", "clear"] },
        value: { type: "number" },
      },
    },
    dateFlexibility: {
      type: "object",
      additionalProperties: false,
      required: ["action", "value"],
      properties: {
        action: { type: "string", enum: ["keep", "set", "clear"] },
        value: { type: "string" },
      },
    },
    duration: {
      type: "object",
      additionalProperties: false,
      required: ["action", "value"],
      properties: {
        action: { type: "string", enum: ["keep", "set", "clear"] },
        value: { type: "string" },
      },
    },
    adults: {
      type: "object",
      additionalProperties: false,
      required: ["action", "value"],
      properties: {
        action: { type: "string", enum: ["keep", "set", "clear"] },
        value: { type: "number" },
      },
    },
    children: {
      type: "object",
      additionalProperties: false,
      required: ["action", "value"],
      properties: {
        action: { type: "string", enum: ["keep", "set", "clear"] },
        value: { type: "number" },
      },
    },
    childrenAges: {
      type: "object",
      additionalProperties: false,
      required: ["action", "value"],
      properties: {
        action: { type: "string", enum: ["keep", "set", "clear"] },
        value: { type: "array", items: { type: "number" } },
      },
    },
    budget: {
      type: "object",
      additionalProperties: false,
      required: ["action", "value"],
      properties: {
        action: { type: "string", enum: ["keep", "set", "clear"] },
        value: {
          type: "object",
          additionalProperties: false,
          required: ["amount", "min", "max", "currency", "scope"],
          properties: {
            amount: { type: ["number", "null"] },
            min: { type: ["number", "null"] },
            max: { type: ["number", "null"] },
            currency: { type: ["string", "null"] },
            scope: {
              type: ["string", "null"],
              enum: ["total", "per_person", null],
            },
          },
        },
      },
    },
    departure: {
      type: "object",
      additionalProperties: false,
      required: ["action", "value"],
      properties: {
        action: { type: "string", enum: ["keep", "set", "clear"] },
        value: { type: "string" },
      },
    },
    tripType: {
      type: "object",
      additionalProperties: false,
      required: ["action", "value"],
      properties: {
        action: { type: "string", enum: ["keep", "set", "clear"] },
        value: { type: "string" },
      },
    },
    preferences: {
      type: "object",
      additionalProperties: false,
      required: ["action", "value"],
      properties: {
        action: { type: "string", enum: ["keep", "set", "clear"] },
        value: { type: "array", items: { type: "string" } },
      },
    },
    constraints: {
      type: "object",
      additionalProperties: false,
      required: ["action", "value"],
      properties: {
        action: { type: "string", enum: ["keep", "set", "clear"] },
        value: { type: "array", items: { type: "string" } },
      },
    },
  },
} as const;

export const chatAgentResponseOpenAiSchema = {
  type: "object",
  additionalProperties: false,
  required: ["reply", "suggestContact", "profileUpdate"],
  properties: {
    reply: { type: "string" },
    suggestContact: { type: "boolean" },
    profileUpdate: travelProfileOpenAiSchema,
  },
} as const;
