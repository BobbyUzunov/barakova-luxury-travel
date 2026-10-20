import type { Locale } from "../constants/content";
import {
  type ContactHandoffFields,
  type TravelSummaryResult,
  formatTravelSummaryBlock,
} from "./travel-summary";

export const contactFormDraftStorageKey = "barakova-contact-form-draft-v1";
export const contactFormDraftStorageVersion = 1;
export const contactFormDraftEventName = "barakova:contact-form-draft";
export const maxContactFormDraftBytes = 12_000;
/** Drafts expire after 30 minutes. */
export const contactFormDraftTtlMs = 30 * 60 * 1000;

export type ContactFormDraft = {
  version: number;
  id: string;
  locale: Locale;
  createdAt: string;
  expiresAt: string;
  summaryText: string;
  summaryFingerprint: string;
  summaryBlock: string;
  fields: ContactHandoffFields;
  applied: boolean;
};

function canAccessSessionStorage() {
  try {
    if (typeof window === "undefined" || !window.sessionStorage) {
      return false;
    }
    window.sessionStorage.getItem(contactFormDraftStorageKey);
    return true;
  } catch {
    return false;
  }
}

function createDraftId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `draft-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function isFiniteIso(value: unknown) {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

function sanitizeFields(value: unknown): ContactHandoffFields {
  if (typeof value !== "object" || value === null) {
    return {};
  }

  const record = value as Record<string, unknown>;
  const fields: ContactHandoffFields = {};

  if (typeof record.destination === "string" && record.destination.trim()) {
    fields.destination = record.destination.trim().slice(0, 500);
  }
  if (typeof record.travelStartDate === "string" && record.travelStartDate.trim()) {
    fields.travelStartDate = record.travelStartDate.trim().slice(0, 32);
  }
  if (typeof record.travelEndDate === "string" && record.travelEndDate.trim()) {
    fields.travelEndDate = record.travelEndDate.trim().slice(0, 32);
  }
  if (record.datesFlexible === true) {
    fields.datesFlexible = true;
  } else if (record.datesFlexible === false) {
    fields.datesFlexible = false;
  }
  if (typeof record.travelers === "string" && record.travelers.trim()) {
    fields.travelers = record.travelers.trim().slice(0, 120);
  }
  if (typeof record.budget === "string" && record.budget.trim()) {
    fields.budget = record.budget.trim().slice(0, 500);
  }

  return fields;
}

export function sanitizeContactFormDraft(
  value: unknown,
  expectedLocale?: Locale,
  now = Date.now(),
): ContactFormDraft | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const record = value as Record<string, unknown>;
  if (record.version !== contactFormDraftStorageVersion) {
    return null;
  }

  const locale = record.locale === "bg" || record.locale === "en" ? record.locale : null;
  if (!locale) {
    return null;
  }
  if (expectedLocale && locale !== expectedLocale) {
    return null;
  }

  const id = typeof record.id === "string" ? record.id.slice(0, 80) : "";
  const summaryText =
    typeof record.summaryText === "string" ? record.summaryText.slice(0, 3500) : "";
  const summaryFingerprint =
    typeof record.summaryFingerprint === "string"
      ? record.summaryFingerprint.slice(0, 64)
      : "";
  const summaryBlock =
    typeof record.summaryBlock === "string" ? record.summaryBlock.slice(0, 4000) : "";

  if (!id || !summaryText || !summaryFingerprint || !summaryBlock) {
    return null;
  }

  if (!isFiniteIso(record.createdAt) || !isFiniteIso(record.expiresAt)) {
    return null;
  }

  const expiresAt = record.expiresAt as string;
  if (Date.parse(expiresAt) <= now) {
    return null;
  }

  return {
    version: contactFormDraftStorageVersion,
    id,
    locale,
    createdAt: record.createdAt as string,
    expiresAt,
    summaryText,
    summaryFingerprint,
    summaryBlock,
    fields: sanitizeFields(record.fields),
    applied: record.applied === true,
  };
}

export function createContactFormDraft(options: {
  locale: Locale;
  summary: TravelSummaryResult;
  now?: number;
}): ContactFormDraft {
  const now = options.now ?? Date.now();
  const createdAt = new Date(now).toISOString();
  const expiresAt = new Date(now + contactFormDraftTtlMs).toISOString();

  return {
    version: contactFormDraftStorageVersion,
    id: createDraftId(),
    locale: options.locale,
    createdAt,
    expiresAt,
    summaryText: options.summary.text,
    summaryFingerprint: options.summary.fingerprint,
    summaryBlock: formatTravelSummaryBlock(options.summary, options.locale),
    fields: options.summary.fields,
    applied: false,
  };
}

export function readContactFormDraft(locale: Locale): ContactFormDraft | null {
  if (!canAccessSessionStorage()) {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(contactFormDraftStorageKey);
    if (!raw || raw.length > maxContactFormDraftBytes) {
      return null;
    }

    const draft = sanitizeContactFormDraft(JSON.parse(raw), locale);
    if (!draft) {
      window.sessionStorage.removeItem(contactFormDraftStorageKey);
      return null;
    }

    return draft;
  } catch {
    try {
      window.sessionStorage.removeItem(contactFormDraftStorageKey);
    } catch {
      // ignore
    }
    return null;
  }
}

export function writeContactFormDraft(draft: ContactFormDraft) {
  if (!canAccessSessionStorage()) {
    return false;
  }

  try {
    const payload = JSON.stringify(draft);
    if (payload.length > maxContactFormDraftBytes) {
      return false;
    }
    window.sessionStorage.setItem(contactFormDraftStorageKey, payload);
    notifyContactFormDraftChanged();
    return true;
  } catch {
    return false;
  }
}

export function clearContactFormDraft() {
  if (!canAccessSessionStorage()) {
    return;
  }

  try {
    window.sessionStorage.removeItem(contactFormDraftStorageKey);
    notifyContactFormDraftChanged();
  } catch {
    // ignore
  }
}

export function markContactFormDraftApplied(locale: Locale) {
  const draft = readContactFormDraft(locale);
  if (!draft || draft.applied) {
    return;
  }

  writeContactFormDraft({ ...draft, applied: true });
}

export function notifyContactFormDraftChanged() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(contactFormDraftEventName));
}

export function subscribeContactFormDraft(
  listener: () => void,
): () => void {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  window.addEventListener(contactFormDraftEventName, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(contactFormDraftEventName, listener);
    window.removeEventListener("storage", listener);
  };
}
