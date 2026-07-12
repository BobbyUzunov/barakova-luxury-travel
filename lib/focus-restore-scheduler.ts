export type FocusRestoreStrategy = "immediate" | "deferred";

export function scheduleFocusRestore(
  target: HTMLElement | null,
  strategy: FocusRestoreStrategy = "immediate",
) {
  if (!target) {
    return () => {};
  }

  if (strategy === "immediate") {
    target.focus({ preventScroll: true });
    return () => {};
  }

  let timeoutId = 0;
  let cancelled = false;

  // Run after the originating click/keyboard event has finished. A timer is
  // deliberate here: animation frames can be throttled indefinitely in a
  // background tab, which would leave focus on <body> after closing a dialog.
  timeoutId = window.setTimeout(() => {
    if (cancelled || !document.contains(target)) {
      return;
    }

    target.focus({ preventScroll: true });
  }, 0);

  return () => {
    cancelled = true;
    window.clearTimeout(timeoutId);
  };
}
