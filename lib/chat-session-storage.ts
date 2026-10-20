import type { Locale } from "../constants/content";
import {
  createEmptyTravelProfile,
  sanitizeTravelProfile,
  type TravelProfile,
} from "./travel-profile";

export const chatSessionStorageKey = "barakova-inquiry-chat-v1";
export const chatSessionStorageVersion = 1;
export const maxChatSessionStorageBytes = 48_000;
export const maxStoredChatMessages = 40;

export type StoredChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  source?: "faq" | "ai" | "fallback";
};

export type StoredChatSession = {
  version: number;
  locale: Locale;
  messages: StoredChatMessage[];
  profile: TravelProfile;
  updatedAt: string;
};

type SnapshotCache = {
  raw: string | null;
  locale: Locale | null;
  session: StoredChatSession | null;
};

let snapshotCache: SnapshotCache = {
  raw: null,
  locale: null,
  session: null,
};

let snapshotCacheInitialized = false;

function canAccessSessionStorageReadOnly() {
  try {
    if (typeof window === "undefined" || !window.sessionStorage) {
      return false;
    }
    // Read-only probe: getItem does not mutate storage.
    window.sessionStorage.getItem(chatSessionStorageKey);
    return true;
  } catch {
    return false;
  }
}

export function invalidateChatSessionSnapshotCache() {
  snapshotCache = {
    raw: null,
    locale: null,
    session: null,
  };
  snapshotCacheInitialized = false;
}

export function sanitizeStoredMessages(value: unknown): StoredChatMessage[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const messages: StoredChatMessage[] = [];

  for (const entry of value) {
    if (typeof entry !== "object" || entry === null) {
      continue;
    }

    const record = entry as Record<string, unknown>;
    const role = record.role;
    const content = typeof record.content === "string" ? record.content.trim() : "";
    const id = typeof record.id === "string" ? record.id.slice(0, 80) : "";

    if ((role !== "user" && role !== "assistant") || !content || !id) {
      continue;
    }

    const source =
      record.source === "faq" ||
      record.source === "ai" ||
      record.source === "fallback"
        ? record.source
        : undefined;

    messages.push({
      id,
      role,
      content: content.slice(0, 1000),
      ...(source ? { source } : {}),
    });
  }

  return messages.slice(-maxStoredChatMessages);
}

export function sanitizeStoredChatSession(
  value: unknown,
  expectedLocale?: Locale,
): StoredChatSession | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const record = value as Record<string, unknown>;
  if (record.version !== chatSessionStorageVersion) {
    return null;
  }

  const locale = record.locale === "en" || record.locale === "bg" ? record.locale : null;
  if (!locale) {
    return null;
  }

  if (expectedLocale && locale !== expectedLocale) {
    return null;
  }

  const profile = sanitizeTravelProfile(record.profile, locale);
  if (!profile) {
    return null;
  }

  const messages = sanitizeStoredMessages(record.messages);
  if (messages.length === 0) {
    return null;
  }

  const updatedAt =
    typeof record.updatedAt === "string" && !Number.isNaN(Date.parse(record.updatedAt))
      ? record.updatedAt
      : new Date().toISOString();

  return {
    version: chatSessionStorageVersion,
    locale,
    messages,
    profile: { ...profile, locale },
    updatedAt,
  };
}

/** Read-only snapshot for useSyncExternalStore. Stable identity via Object.is when unchanged. */
export function getChatSessionSnapshot(locale: Locale): StoredChatSession | null {
  if (!canAccessSessionStorageReadOnly()) {
    if (
      snapshotCacheInitialized &&
      snapshotCache.locale === locale &&
      snapshotCache.raw === null
    ) {
      return snapshotCache.session;
    }
    snapshotCache = { raw: null, locale, session: null };
    snapshotCacheInitialized = true;
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(chatSessionStorageKey);

    if (
      snapshotCacheInitialized &&
      snapshotCache.locale === locale &&
      snapshotCache.raw === raw
    ) {
      return snapshotCache.session;
    }

    let session: StoredChatSession | null = null;
    if (raw && raw.length <= maxChatSessionStorageBytes) {
      try {
        session = sanitizeStoredChatSession(JSON.parse(raw), locale);
      } catch {
        session = null;
      }
    }

    snapshotCache = { raw, locale, session };
    snapshotCacheInitialized = true;
    return session;
  } catch {
    snapshotCache = { raw: null, locale, session: null };
    snapshotCacheInitialized = true;
    return null;
  }
}

export function readChatSession(locale: Locale): StoredChatSession | null {
  return getChatSessionSnapshot(locale);
}

function serializeSessionPayload(payload: StoredChatSession) {
  return JSON.stringify(payload);
}

function trimMessagesToByteLimit(
  payload: StoredChatSession,
): { serialized: string; messages: StoredChatMessage[] } | null {
  let messages = payload.messages;

  while (messages.length > 0) {
    const candidate = { ...payload, messages };
    const serialized = serializeSessionPayload(candidate);
    if (serialized.length <= maxChatSessionStorageBytes) {
      return { serialized, messages };
    }
    messages = messages.slice(1);
  }

  return null;
}

export function writeChatSession(session: {
  locale: Locale;
  messages: StoredChatMessage[];
  profile: TravelProfile;
}): boolean {
  if (!canAccessSessionStorageReadOnly()) {
    return false;
  }

  const payload: StoredChatSession = {
    version: chatSessionStorageVersion,
    locale: session.locale,
    messages: sanitizeStoredMessages(session.messages),
    profile:
      sanitizeTravelProfile(session.profile, session.locale) ??
      createEmptyTravelProfile(session.locale),
    updatedAt: new Date().toISOString(),
  };

  const trimmed = trimMessagesToByteLimit(payload);
  if (!trimmed) {
    return false;
  }

  try {
    window.sessionStorage.setItem(chatSessionStorageKey, trimmed.serialized);
    snapshotCache = {
      raw: trimmed.serialized,
      locale: session.locale,
      session: {
        ...payload,
        messages: trimmed.messages,
      },
    };
    snapshotCacheInitialized = true;
    return true;
  } catch {
    invalidateChatSessionSnapshotCache();
    return false;
  }
}

export function clearChatSession() {
  if (!canAccessSessionStorageReadOnly()) {
    invalidateChatSessionSnapshotCache();
    return;
  }

  try {
    window.sessionStorage.removeItem(chatSessionStorageKey);
  } catch {
    // Ignore storage failures.
  }

  invalidateChatSessionSnapshotCache();
}
