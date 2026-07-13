export function shouldRestoreModalFocus(
  wasEverOpen: boolean,
  isOpen: boolean,
): boolean {
  return wasEverOpen && !isOpen;
}

export function shouldRestoreModalFocusOnUnmount(
  wasEverOpen: boolean,
  isOpen: boolean,
): boolean {
  return wasEverOpen && isOpen;
}
