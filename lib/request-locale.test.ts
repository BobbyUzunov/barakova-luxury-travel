import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getLocaleFromPathname, resolveCookieBannerLocale } from "./request-locale";

describe("request locale helpers", () => {
  it("resolves locale from pathname segments", () => {
    assert.equal(getLocaleFromPathname("/bg"), "bg");
    assert.equal(getLocaleFromPathname("/en"), "en");
    assert.equal(getLocaleFromPathname("/en/destinations/maldives"), "en");
    assert.equal(getLocaleFromPathname("/privacy"), "bg");
    assert.equal(getLocaleFromPathname(null), "bg");
  });

  it("prefers pathname locale for cookie banner on direct locale visits", () => {
    assert.equal(resolveCookieBannerLocale("/bg", "en"), "bg");
    assert.equal(resolveCookieBannerLocale("/en", "bg"), "en");
    assert.equal(resolveCookieBannerLocale("/en/cruises", "bg"), "en");
    assert.equal(resolveCookieBannerLocale("/privacy", "en"), "en");
    assert.equal(resolveCookieBannerLocale("/", "en"), "en");
  });
});
