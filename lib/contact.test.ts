import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildEmailHtml,
  escapeHtml,
  normalizeBody,
  validateContactBody,
} from "./contact.ts";

describe("contact helpers", () => {
  it("normalizes and truncates fields", () => {
    const body = normalizeBody({
      fullName: "  Богдана Баракова  ",
      email: "test@example.com",
      phone: "0883770909",
      message: "a".repeat(5000),
    });

    assert.equal(body.fullName, "Богдана Баракова");
    assert.equal(body.message?.length, 4000);
  });

  it("rejects honeypot submissions", () => {
    const result = validateContactBody(
      normalizeBody({
        fullName: "Test",
        email: "test@example.com",
        phone: "123",
        website: "https://spam.test",
      }),
    );

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.error, "honeypot");
    }
  });

  it("requires core fields and valid email", () => {
    const missing = validateContactBody(normalizeBody({ email: "bad" }));
    assert.equal(missing.ok, false);

    const invalidEmail = validateContactBody(
      normalizeBody({
        fullName: "Test",
        email: "not-an-email",
        phone: "123",
      }),
    );
    assert.equal(invalidEmail.ok, false);
    if (!invalidEmail.ok) {
      assert.equal(invalidEmail.error, "invalid-email");
    }

    const valid = validateContactBody(
      normalizeBody({
        fullName: "Test User",
        email: "test@example.com",
        phone: "0883770909",
      }),
    );
    assert.equal(valid.ok, true);
  });

  it("escapes html in email output", () => {
    const html = buildEmailHtml(
      normalizeBody({
        fullName: "<script>alert(1)</script>",
        email: "test@example.com",
        phone: "0883770909",
        message: 'He said "hello"',
      }),
    );

    assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
    assert.doesNotMatch(html, /<script>alert\(1\)<\/script>/);
    assert.match(escapeHtml(`Tom's "boat"`), /&#039;/);
  });
});
