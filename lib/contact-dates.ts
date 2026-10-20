import type { Locale } from "../constants/content";

const isoDatePattern = /^(\d{4})-(\d{2})-(\d{2})$/;

export type ParsedIsoDate = {
  year: number;
  month: number;
  day: number;
  iso: string;
};

/** Local calendar YYYY-MM-DD without UTC day shift. */
export function localTodayIso(now = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Parses and validates a calendar YYYY-MM-DD value (no localized Date.parse). */
export function parseIsoDate(value: unknown): ParsedIsoDate | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  const match = isoDatePattern.exec(trimmed);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const candidate = new Date(year, month - 1, day);

  if (
    candidate.getFullYear() !== year ||
    candidate.getMonth() !== month - 1 ||
    candidate.getDate() !== day
  ) {
    return null;
  }

  return { year, month, day, iso: trimmed };
}

export function compareIsoDates(a: ParsedIsoDate, b: ParsedIsoDate) {
  if (a.year !== b.year) {
    return a.year - b.year;
  }
  if (a.month !== b.month) {
    return a.month - b.month;
  }
  return a.day - b.day;
}

export type TravelDatesInput = {
  travelStartDate?: string;
  travelEndDate?: string;
  datesFlexible?: boolean;
};

export type TravelDatesValidationError =
  | "invalid-start"
  | "invalid-end"
  | "end-before-start"
  | "start-in-past";

export function validateTravelDates(
  input: TravelDatesInput,
  todayIso = localTodayIso(),
): { ok: true } | { ok: false; error: TravelDatesValidationError } {
  const startRaw = input.travelStartDate?.trim() || "";
  const endRaw = input.travelEndDate?.trim() || "";

  const start = startRaw ? parseIsoDate(startRaw) : null;
  const end = endRaw ? parseIsoDate(endRaw) : null;

  if (startRaw && !start) {
    return { ok: false, error: "invalid-start" };
  }

  if (endRaw && !end) {
    return { ok: false, error: "invalid-end" };
  }

  if (start) {
    const today = parseIsoDate(todayIso);
    if (today && compareIsoDates(start, today) < 0) {
      return { ok: false, error: "start-in-past" };
    }
  }

  if (start && end && compareIsoDates(end, start) < 0) {
    return { ok: false, error: "end-before-start" };
  }

  return { ok: true };
}

const travelPeriodLabels: Record<
  Locale,
  {
    flexible: string;
    startOnly: (start: string) => string;
    endOnly: (end: string) => string;
    range: (start: string, end: string) => string;
  }
> = {
  bg: {
    flexible: "Датите са гъвкави / още не са уточнени",
    startOnly: (start) => `От ${start} (крайна дата неуточнена)`,
    endOnly: (end) => `До ${end} (начална дата неуточнена)`,
    range: (start, end) => `${start} – ${end}`,
  },
  en: {
    flexible: "Dates are flexible / not yet confirmed",
    startOnly: (start) => `From ${start} (end date not set)`,
    endOnly: (end) => `Until ${end} (start date not set)`,
    range: (start, end) => `${start} – ${end}`,
  },
};

/** Builds a readable, unambiguous travelPeriod string for email display. */
export function formatTravelPeriodForEmail(
  input: TravelDatesInput,
  locale: Locale,
): string | undefined {
  const labels = travelPeriodLabels[locale];
  const startParsed = parseIsoDate(input.travelStartDate);
  const endParsed = parseIsoDate(input.travelEndDate);
  const start = startParsed?.iso || "";
  const end = endParsed?.iso || "";
  const flexible = input.datesFlexible === true;

  if (flexible && !start && !end) {
    return labels.flexible;
  }

  if (start && end) {
    const range = labels.range(start, end);
    return flexible ? `${labels.flexible}; ${range}` : range;
  }

  if (start) {
    const text = labels.startOnly(start);
    return flexible ? `${labels.flexible}; ${text}` : text;
  }

  if (end) {
    const text = labels.endOnly(end);
    return flexible ? `${labels.flexible}; ${text}` : text;
  }

  if (flexible) {
    return labels.flexible;
  }

  return undefined;
}

/** Keeps a trimmed date field for validation; does not invent or coerce invalid values. */
export function normalizeOptionalIsoDate(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim().slice(0, 10);
  return trimmed.length > 0 ? trimmed : undefined;
}

export function normalizeDatesFlexible(value: unknown): boolean {
  return value === true || value === "true" || value === "on" || value === 1;
}
