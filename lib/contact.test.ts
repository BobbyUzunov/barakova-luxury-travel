import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildEmailHtml,
  escapeHtml,
  normalizeBody,
  validateContactBody,
} from "./contact";

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

  it("normalizes travel dates into a readable travelPeriod for email", () => {
    const ranged = normalizeBody({
      fullName: "Test User",
      email: "test@example.com",
      phone: "0883770909",
      travelStartDate: "2027-03-15",
      travelEndDate: "2027-03-22",
      locale: "bg",
    });
    assert.equal(ranged.travelPeriod, "2027-03-15 – 2027-03-22");
    assert.match(
      buildEmailHtml(ranged),
      /2027-03-15 – 2027-03-22/,
    );

    const flexible = normalizeBody({
      fullName: "Test User",
      email: "test@example.com",
      phone: "0883770909",
      datesFlexible: true,
      locale: "en",
    });
    assert.equal(
      flexible.travelPeriod,
      "Dates are flexible / not yet confirmed",
    );

    const startOnly = normalizeBody({
      fullName: "Test User",
      email: "test@example.com",
      phone: "0883770909",
      travelStartDate: "2027-03-15",
      locale: "en",
    });
    assert.equal(
      startOnly.travelPeriod,
      "From 2027-03-15 (end date not set)",
    );
  });

  it("rejects invalid or reversed travel dates on the server", () => {
    const reversed = validateContactBody(
      normalizeBody({
        fullName: "Test User",
        email: "test@example.com",
        phone: "0883770909",
        travelStartDate: "2027-03-22",
        travelEndDate: "2027-03-15",
      }),
    );
    assert.equal(reversed.ok, false);
    if (!reversed.ok) {
      assert.equal(reversed.error, "end-before-start");
    }

    const invalid = validateContactBody({
      fullName: "Test User",
      email: "test@example.com",
      phone: "0883770909",
      travelStartDate: "2027-02-30",
      datesFlexible: false,
    });
    assert.equal(invalid.ok, false);
    if (!invalid.ok) {
      assert.equal(invalid.error, "invalid-start");
    }
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
