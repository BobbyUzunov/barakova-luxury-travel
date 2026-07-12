"use client";

import { type RefObject, useEffect, useRef } from "react";
import { lockBodyScroll } from "./body-scroll-lock";
import { getFocusRestoreTarget } from "./focus-restore";
import {
  scheduleFocusRestore,
  type FocusRestoreStrategy,
} from "./focus-restore-scheduler";
import { getFocusableElements, handleFocusTrapKeyDown } from "./focus-trap";

type UseModalAccessibilityOptions = {
  containerRef: RefObject<HTMLElement | null>;
  initialFocusRef?: RefObject<HTMLElement | null>;
  isOpen: boolean;
  lockScroll?: boolean;
  onClose: () => void;
  restoreFocusRef?: RefObject<HTMLElement | null>;
  restoreFocusStrategy?: FocusRestoreStrategy;
};

export function useModalAccessibility({
  containerRef,
  initialFocusRef,
  isOpen,
  lockScroll = true,
  onClose,
  restoreFocusRef,
  restoreFocusStrategy = "immediate",
}: UseModalAccessibilityOptions) {
  const pendingRestoreCancelRef = useRef<(() => void) | null>(null);
  const previouslyFocusedRef = useRef<Element | null>(null);

  useEffect(() => {
    return () => {
      pendingRestoreCancelRef.current?.();
      pendingRestoreCancelRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    pendingRestoreCancelRef.current?.();
    pendingRestoreCancelRef.current = null;

    const container = containerRef.current;

    if (!container) {
      return;
    }

    const unlockScroll = lockScroll ? lockBodyScroll() : () => {};
    previouslyFocusedRef.current = document.activeElement;
    const initialTarget =
      initialFocusRef?.current ?? getFocusableElements(container)[0] ?? null;

    initialTarget?.focus({ preventScroll: true });

    const fallbackFocusFrameId = window.requestAnimationFrame(() => {
      if (!container.contains(document.activeElement)) {
        initialTarget?.focus({ preventScroll: true });
      }
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (containerRef.current) {
        handleFocusTrapKeyDown(containerRef.current, event);
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      window.cancelAnimationFrame(fallbackFocusFrameId);
      unlockScroll();
    };
  }, [
    containerRef,
    initialFocusRef,
    isOpen,
    lockScroll,
    onClose,
    restoreFocusRef,
    restoreFocusStrategy,
  ]);

  useEffect(() => {
    if (isOpen) {
      return;
    }

    const restoreTarget = getFocusRestoreTarget(
      restoreFocusRef,
      previouslyFocusedRef.current,
    );

    pendingRestoreCancelRef.current?.();
    pendingRestoreCancelRef.current = scheduleFocusRestore(
      restoreTarget,
      restoreFocusStrategy,
    );

    return () => {
      pendingRestoreCancelRef.current?.();
      pendingRestoreCancelRef.current = null;
    };
  }, [isOpen, restoreFocusRef, restoreFocusStrategy]);
}
