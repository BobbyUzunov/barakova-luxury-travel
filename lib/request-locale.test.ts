import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getLocaleFromHeaders,
  getLocaleFromPathname,
  resolveCookieBannerLocale,
} from "./request-locale.ts";

describe("request locale helpers", () => {
  it("resolves locale from pathname segments", () => {
    assert.equal(getLocaleFromPathname("/bg"), "bg");
    assert.equal(getLocaleFromPathname("/en"), "en");
    assert.equal(getLocaleFromPathname("/en/destinations/maldives"), "en");
    assert.equal(getLocaleFromPathname("/privacy"), "bg");
    assert.equal(getLocaleFromPathname(null), "bg");
  });

  it("resolves the locale header used by the global 404 document", () => {
    assert.equal(
      getLocaleFromHeaders((name) => (name === "x-locale" ? "en" : null)),
      "en",
    );
    assert.equal(getLocaleFromHeaders(() => null), "bg");
    assert.equal(
      getLocaleFromHeaders((name) => (name === "x-locale" ? "fr" : null)),
      "bg",
    );
  });

  it("prefers pathname locale for cookie banner on direct locale visits", () => {
    assert.equal(resolveCookieBannerLocale("/bg", "en"), "bg");
    assert.equal(resolveCookieBannerLocale("/en", "bg"), "en");
    assert.equal(resolveCookieBannerLocale("/en/cruises", "bg"), "en");
    assert.equal(resolveCookieBannerLocale("/privacy", "en"), "en");
    assert.equal(resolveCookieBannerLocale("/", "en"), "en");
  });
});
