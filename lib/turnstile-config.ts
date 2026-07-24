export function isTurnstileSiteKeyConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
}

export function isTurnstileSecretConfigured() {
  return Boolean(process.env.TURNSTILE_SECRET_KEY);
}

/** Site key without secret shows a captcha UI that the server cannot verify. */
export function isTurnstileMisconfigured() {
  return isTurnstileSiteKeyConfigured() && !isTurnstileSecretConfigured();
}

export function getTurnstileClientRequirement() {
  return {
    siteKeyConfigured: isTurnstileSiteKeyConfigured(),
    secretConfigured: isTurnstileSecretConfigured(),
    requiresClientToken: isTurnstileSiteKeyConfigured(),
    verifiesOnServer: isTurnstileSecretConfigured(),
    isMisconfigured: isTurnstileMisconfigured(),
  };
}
