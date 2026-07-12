export function resetTurnstileChallenge(
  clearToken: () => void,
  resetWidget?: () => void,
) {
  clearToken();
  resetWidget?.();
}
