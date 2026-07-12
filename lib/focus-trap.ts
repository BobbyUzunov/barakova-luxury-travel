export const focusableSelector =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function getFocusableElements(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>(focusableSelector)).filter(
    (element) =>
      !element.hasAttribute("disabled") &&
      element.getAttribute("aria-hidden") !== "true" &&
      element.tabIndex !== -1,
  );
}

export function getFocusWrapTarget(
  focusableCount: number,
  activeIndex: number,
  shiftKey: boolean,
) {
  if (focusableCount === 0) {
    return null;
  }

  if (shiftKey && activeIndex <= 0) {
    return focusableCount - 1;
  }

  if (!shiftKey && activeIndex >= focusableCount - 1) {
    return 0;
  }

  return null;
}

export function handleFocusTrapKeyDown(
  container: HTMLElement,
  event: Pick<KeyboardEvent, "key" | "shiftKey" | "preventDefault">,
) {
  if (event.key !== "Tab") {
    return false;
  }

  const focusableElements = getFocusableElements(container);

  if (focusableElements.length === 0) {
    return false;
  }

  const activeIndex = focusableElements.indexOf(
    document.activeElement as HTMLElement,
  );
  const wrapTarget = getFocusWrapTarget(
    focusableElements.length,
    activeIndex,
    event.shiftKey,
  );

  if (wrapTarget === null) {
    return false;
  }

  event.preventDefault();
  focusableElements[wrapTarget]?.focus();
  return true;
}
