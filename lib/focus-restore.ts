export function getFocusRestoreTarget(
  restoreFocusRef: { current: HTMLElement | null } | undefined,
  previouslyFocused: Element | null,
): HTMLElement | null {
  if (restoreFocusRef?.current) {
    return restoreFocusRef.current;
  }

  if (
    previouslyFocused &&
    "focus" in previouslyFocused &&
    typeof previouslyFocused.focus === "function"
  ) {
    return previouslyFocused as HTMLElement;
  }

  return null;
}
