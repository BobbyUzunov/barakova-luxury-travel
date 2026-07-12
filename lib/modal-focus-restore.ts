export function shouldRestoreModalFocus(
  wasEverOpen: boolean,
  isOpen: boolean,
): boolean {
  return wasEverOpen && !isOpen;
}
