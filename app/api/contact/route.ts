import { NextResponse } from "next/server";
import { contactEmail as defaultRecipientEmail } from "../../../constants/site";
import { isContactRateLimited } from "../../../lib/rate-limit";
import {
  isTurnstileEnabled,
  verifyTurnstileToken,
} from "../../../lib/verify-turnstile";

type ContactRequestBody = {
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

const resendApiUrl = "https://api.resend.com/emails";
const recipientEmail = process.env.CONTACT_RECIPIENT_EMAIL || defaultRecipientEmail;
const senderEmail =
  process.env.RESEND_FROM_EMAIL ||
  "Barakova Luxury Travel <onboarding@resend.dev>";
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const maxFieldLength = 500;
const maxMessageLength = 4000;

const fieldLabels: Record<keyof Omit<ContactRequestBody, "website" | "turnstileToken">, string> = {
  fullName: "Име и фамилия",
  email: "Email",
  phone: "Телефон",
  destination: "Желана дестинация",
  travelPeriod: "Период на пътуване",
  travelers: "Брой пътуващи",
  budget: "Приблизителен бюджет",
  message: "Съобщение",
  locale: "Език",
};

function getClientIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeText(value: unknown, maxLength = maxFieldLength) {
  if (typeof value !== "string") {
    return undefined;
  }

  return value.trim().slice(0, maxLength);
}

function normalizeBody(body: ContactRequestBody): ContactRequestBody {
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

function buildEmailHtml(body: ContactRequestBody) {
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
          <h1 style="margin: 0; font-size: 24px;">Ново запитване от сайта</h1>
        </div>
        <table style="width: 100%; border-collapse: collapse;">
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>
  `;
}

export async function POST(request: Request) {
  const ip = getClientIp(request);

  if (await isContactRateLimited(ip)) {
    return NextResponse.json(
      { message: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  let body: ContactRequestBody;

  try {
    body = normalizeBody((await request.json()) as ContactRequestBody);
  } catch {
    return NextResponse.json(
      { message: "Invalid request body." },
      { status: 400 },
    );
  }

  if (body.website) {
    return NextResponse.json({ ok: true });
  }

  if (isTurnstileEnabled()) {
    const isHuman = await verifyTurnstileToken(body.turnstileToken, ip);

    if (!isHuman) {
      return NextResponse.json(
        { message: "Captcha verification failed." },
        { status: 400 },
      );
    }
  }

  if (!body.fullName || !body.email || !body.phone) {
    return NextResponse.json(
      { message: "Missing required fields." },
      { status: 400 },
    );
  }

  if (!emailPattern.test(body.email)) {
    return NextResponse.json(
      { message: "Invalid email address." },
      { status: 400 },
    );
  }

  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    return NextResponse.json(
      { message: "Email delivery is not configured." },
      { status: 500 },
    );
  }

  const resendResponse = await fetch(resendApiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: senderEmail,
      to: recipientEmail,
      subject: "Ново запитване от сайта",
      reply_to: body.email,
      html: buildEmailHtml(body),
    }),
  });

  if (!resendResponse.ok) {
    return NextResponse.json(
      { message: "Email delivery failed." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
