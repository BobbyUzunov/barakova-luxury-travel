export type FocusRestoreStrategy = "immediate" | "animationFrame";

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

  let frameId = 0;
  let cancelled = false;

  frameId = window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      if (cancelled || !document.contains(target)) {
        return;
      }

      target.focus({ preventScroll: true });
    });
  });

  return () => {
    cancelled = true;
    window.cancelAnimationFrame(frameId);
  };
}
