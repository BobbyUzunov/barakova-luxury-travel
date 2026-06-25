import { NextResponse } from "next/server";
import { contactEmail as defaultRecipientEmail, resendFromEmailDefault } from "../../../constants/site";
import {
  buildEmailHtml,
  getClientIp,
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

  const validation = validateContactBody(body);

  if (!validation.ok) {
    if (validation.error === "honeypot") {
      return NextResponse.json({ ok: true });
    }

    if (validation.error === "missing-fields") {
      return NextResponse.json(
        { message: "Missing required fields." },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { message: "Invalid email address." },
      { status: 400 },
    );
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
