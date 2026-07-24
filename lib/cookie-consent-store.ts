import {
  getStoredCookieConsent,
  type CookieConsentValue,
} from "../constants/privacy";

export function subscribeToCookieConsent(onStoreChange: () => void) {
  const handleChange = () => onStoreChange();

  window.addEventListener("barakova-cookie-consent", handleChange);
  window.addEventListener("storage", handleChange);

  return () => {
    window.removeEventListener("barakova-cookie-consent", handleChange);
    window.removeEventListener("storage", handleChange);
  };
}

export function getCookieConsentSnapshot(): CookieConsentValue | null {
  return getStoredCookieConsent();
}

export function getCookieConsentServerSnapshot(): CookieConsentValue | null {
  return null;
}
