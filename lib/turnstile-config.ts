export function isTurnstileSiteKeyConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
}

export function isTurnstileSecretConfigured() {
  return Boolean(process.env.TURNSTILE_SECRET_KEY);
}

export function getTurnstileClientRequirement() {
  return {
    siteKeyConfigured: isTurnstileSiteKeyConfigured(),
    secretConfigured: isTurnstileSecretConfigured(),
    requiresClientToken: isTurnstileSiteKeyConfigured(),
    verifiesOnServer: isTurnstileSecretConfigured(),
  };
}
