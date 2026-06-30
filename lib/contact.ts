import type { Locale } from "../constants/content";
import { resolveRequestLocale } from "./contact-api-messages";

export type ContactRequestBody = {
  fullName?: string;
  email?: string;
  phone?: string;
  destination?: string;
  travelPeriod?: string;
  travelers?: string;
  budget?: string;
  message?: string;
  website?: string;
  locale?: string;
  turnstileToken?: string;
};

export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const maxFieldLength = 500;
export const maxMessageLength = 4000;

const fieldLabelsByLocale: Record<
  Locale,
  Record<
    keyof Omit<ContactRequestBody, "website" | "turnstileToken">,
    string
  >
> = {
  bg: {
    fullName: "Име и фамилия",
    email: "Email",
    phone: "Телефон",
    destination: "Желана дестинация",
    travelPeriod: "Период на пътуване",
    travelers: "Брой пътуващи",
    budget: "Приблизителен бюджет",
    message: "Съобщение",
    locale: "Език",
  },
  en: {
    fullName: "Full name",
    email: "Email",
    phone: "Phone",
    destination: "Desired destination",
    travelPeriod: "Travel period",
    travelers: "Number of travelers",
    budget: "Approximate budget",
    message: "Message",
    locale: "Language",
  },
};

const emailSubjects: Record<Locale, string> = {
  bg: "Ново запитване от сайта",
  en: "New inquiry from the website",
};

const emailHeadings: Record<Locale, string> = {
  bg: "Ново запитване от сайта",
  en: "New inquiry from the website",
};

export function getContactEmailSubject(locale?: string) {
  return emailSubjects[resolveRequestLocale(locale)];
}

export function getClientIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function normalizeText(value: unknown, maxLength = maxFieldLength) {
  if (typeof value !== "string") {
    return undefined;
  }

  return value.trim().slice(0, maxLength);
}

export function normalizeBody(body: ContactRequestBody): ContactRequestBody {
  return {
    fullName: normalizeText(body.fullName),
    email: normalizeText(body.email),
    phone: normalizeText(body.phone),
    destination: normalizeText(body.destination),
    travelPeriod: normalizeText(body.travelPeriod),
    travelers: normalizeText(body.travelers),
    budget: normalizeText(body.budget),
    message: normalizeText(body.message, maxMessageLength),
    website: normalizeText(body.website),
    locale: normalizeText(body.locale, 8),
    turnstileToken: normalizeText(body.turnstileToken, 2048),
  };
}

export type ContactValidationError =
  | "missing-fields"
  | "invalid-email"
  | "honeypot";

export function validateContactBody(body: ContactRequestBody) {
  if (body.website) {
    return { ok: false as const, error: "honeypot" as const };
  }

  if (!body.fullName || !body.email || !body.phone) {
    return { ok: false as const, error: "missing-fields" as const };
  }

  if (!emailPattern.test(body.email)) {
    return { ok: false as const, error: "invalid-email" as const };
  }

  return { ok: true as const };
}

export function buildEmailHtml(body: ContactRequestBody) {
  const locale = resolveRequestLocale(body.locale);
  const fieldLabels = fieldLabelsByLocale[locale];
  const heading = emailHeadings[locale];

  const rows = Object.entries(fieldLabels)
    .map(([field, label]) => {
      const value = body[field as keyof ContactRequestBody]?.trim() || "-";

      return `
        <tr>
          <td style="padding: 10px 14px; border-bottom: 1px solid #eee; color: #7A6652; font-weight: 700;">${label}</td>
          <td style="padding: 10px 14px; border-bottom: 1px solid #eee; color: #2D2A26;">${escapeHtml(value)}</td>
        </tr>
      `;
    })
    .join("");

  return `
    <div style="font-family: Arial, sans-serif; background: #F8F3EC; padding: 28px;">
      <div style="max-width: 680px; margin: 0 auto; background: #ffffff; border: 1px solid #E8DCC8; border-radius: 18px; overflow: hidden;">
        <div style="padding: 24px 28px; background: #2D2A26; color: #ffffff;">
          <p style="margin: 0 0 8px; color: #C8A96A; letter-spacing: 0.12em; text-transform: uppercase; font-size: 12px;">Barakova Luxury Travel</p>
          <h1 style="margin: 0; font-size: 24px;">${heading}</h1>
        </div>
        <table style="width: 100%; border-collapse: collapse;">
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>
  `;
}
