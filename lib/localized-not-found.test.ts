import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isKnownLocalizedPath,
  renderLocalizedNotFoundDocument,
} from "./localized-not-found";

describe("localized proxy 404", () => {
  it("recognizes every supported route shape", () => {
    assert.equal(isKnownLocalizedPath("/bg"), true);
    assert.equal(isKnownLocalizedPath("/en/privacy"), true);
    assert.equal(isKnownLocalizedPath("/bg/cookies"), true);
    assert.equal(isKnownLocalizedPath("/en/destinations"), true);
    assert.equal(isKnownLocalizedPath("/bg/cruises"), true);
    assert.equal(isKnownLocalizedPath("/en/blog"), true);
    assert.equal(isKnownLocalizedPath("/bg/destinations/maldives"), true);
    assert.equal(isKnownLocalizedPath("/en/cruises/mediterranean"), true);
    assert.equal(
      isKnownLocalizedPath("/en/blog/how-to-choose-a-luxury-hotel"),
      true,
    );
  });

  it("rejects unknown paths and slugs", () => {
    assert.equal(isKnownLocalizedPath("/en/missing"), false);
    assert.equal(isKnownLocalizedPath("/bg/destinations/not-real"), false);
    assert.equal(isKnownLocalizedPath("/en/blog/not-real"), false);
    assert.equal(isKnownLocalizedPath("/bg/privacy/extra"), false);
  });

  it("renders a localized, non-indexable HTML document", () => {
    const html = renderLocalizedNotFoundDocument("en");

    assert.match(html, /<html lang="en">/);
    assert.match(html, /<meta name="robots" content="noindex, nofollow">/);
    assert.match(html, /Page not found/);
    assert.match(html, /href="\/en"/);
  });
});
