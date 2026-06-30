import { NextResponse } from "next/server";
import { contactEmail as defaultRecipientEmail, resendFromEmailDefault } from "../../../constants/site";
import { contactApiMessage } from "../../../lib/contact-api-messages";
import {
  buildEmailHtml,
  getClientIp,
  getContactEmailSubject,
  normalizeBody,
  type ContactRequestBody,
  validateContactBody,
} from "../../../lib/contact";
import { isContactRateLimited } from "../../../lib/rate-limit";
import {
  isTurnstileEnabled,
  verifyTurnstileToken,
} from "../../../lib/verify-turnstile";

const resendApiUrl = "https://api.resend.com/emails";
const recipientEmail = process.env.CONTACT_RECIPIENT_EMAIL || defaultRecipientEmail;
const senderEmail = process.env.RESEND_FROM_EMAIL || resendFromEmailDefault;

export async function POST(request: Request) {
  const ip = getClientIp(request);

  try {
    if (await isContactRateLimited(ip)) {
      return NextResponse.json(
        { message: contactApiMessage("rateLimit") },
        { status: 429 },
      );
    }
  } catch {
    // Fail open when rate limiting is unavailable.
  }

  let body: ContactRequestBody;

  try {
    body = normalizeBody((await request.json()) as ContactRequestBody);
  } catch {
    return NextResponse.json(
      { message: contactApiMessage("invalidBody") },
      { status: 400 },
    );
  }

  const validation = validateContactBody(body);

  if (!validation.ok) {
    if (validation.error === "honeypot") {
      return NextResponse.json({ ok: true });
    }

    if (validation.error === "missing-fields") {
      return NextResponse.json(
        { message: contactApiMessage("missingFields", body.locale) },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { message: contactApiMessage("invalidEmail", body.locale) },
      { status: 400 },
    );
  }

  if (isTurnstileEnabled()) {
    let isHuman = false;

    try {
      isHuman = await verifyTurnstileToken(body.turnstileToken, ip);
    } catch {
      return NextResponse.json(
        { message: contactApiMessage("serverError", body.locale) },
        { status: 503 },
      );
    }

    if (!isHuman) {
      return NextResponse.json(
        { message: contactApiMessage("captchaFailed", body.locale) },
        { status: 400 },
      );
    }
  }

  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    return NextResponse.json(
      { message: contactApiMessage("notConfigured", body.locale) },
      { status: 500 },
    );
  }

  try {
    const resendResponse = await fetch(resendApiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: senderEmail,
        to: recipientEmail,
        subject: getContactEmailSubject(body.locale),
        reply_to: body.email,
        html: buildEmailHtml(body),
      }),
    });

    if (!resendResponse.ok) {
      return NextResponse.json(
        { message: contactApiMessage("deliveryFailed", body.locale) },
        { status: 502 },
      );
    }
  } catch {
    return NextResponse.json(
      { message: contactApiMessage("deliveryFailed", body.locale) },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
