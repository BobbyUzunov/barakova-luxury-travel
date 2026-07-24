import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import {
  getTurnstileClientRequirement,
  isTurnstileMisconfigured,
  isTurnstileSecretConfigured,
  isTurnstileSiteKeyConfigured,
} from "./turnstile-config.ts";

const originalSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const originalSecretKey = process.env.TURNSTILE_SECRET_KEY;

afterEach(() => {
  if (originalSiteKey === undefined) {
    delete process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  } else {
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = originalSiteKey;
  }

  if (originalSecretKey === undefined) {
    delete process.env.TURNSTILE_SECRET_KEY;
  } else {
    process.env.TURNSTILE_SECRET_KEY = originalSecretKey;
  }
});

describe("turnstile configuration matrix", () => {
  it("requires a client token only when the site key is configured", () => {
    delete process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    delete process.env.TURNSTILE_SECRET_KEY;

    assert.equal(isTurnstileSiteKeyConfigured(), false);
    assert.equal(isTurnstileSecretConfigured(), false);
    assert.equal(isTurnstileMisconfigured(), false);
    assert.deepEqual(getTurnstileClientRequirement(), {
      siteKeyConfigured: false,
      secretConfigured: false,
      requiresClientToken: false,
      verifiesOnServer: false,
      isMisconfigured: false,
    });
  });

  it("flags site key only as misconfigured", () => {
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = "site-key";
    delete process.env.TURNSTILE_SECRET_KEY;

    assert.equal(isTurnstileMisconfigured(), true);
    assert.deepEqual(getTurnstileClientRequirement(), {
      siteKeyConfigured: true,
      secretConfigured: false,
      requiresClientToken: true,
      verifiesOnServer: false,
      isMisconfigured: true,
    });
  });

  it("supports secret key only", () => {
    delete process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    process.env.TURNSTILE_SECRET_KEY = "secret-key";

    assert.equal(isTurnstileMisconfigured(), false);
    assert.deepEqual(getTurnstileClientRequirement(), {
      siteKeyConfigured: false,
      secretConfigured: true,
      requiresClientToken: false,
      verifiesOnServer: true,
      isMisconfigured: false,
    });
  });

  it("supports both keys", () => {
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = "site-key";
    process.env.TURNSTILE_SECRET_KEY = "secret-key";

    assert.equal(isTurnstileMisconfigured(), false);
    assert.deepEqual(getTurnstileClientRequirement(), {
      siteKeyConfigured: true,
      secretConfigured: true,
      requiresClientToken: true,
      verifiesOnServer: true,
      isMisconfigured: false,
    });
  });
});
