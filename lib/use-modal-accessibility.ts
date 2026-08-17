"use client";

import { type RefObject, useEffect, useLayoutEffect, useRef } from "react";
import { lockBodyScroll } from "./body-scroll-lock";
import { getFocusRestoreTarget } from "./focus-restore";
import {
  shouldRestoreModalFocus,
  shouldRestoreModalFocusOnUnmount,
} from "./modal-focus-restore";
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
  const wasOpenRef = useRef(false);
  const isOpenRef = useRef(isOpen);
  const restoreFocusRefRef = useRef(restoreFocusRef);
  const restoreFocusStrategyRef = useRef(restoreFocusStrategy);

  useEffect(() => {
    restoreFocusRefRef.current = restoreFocusRef;
    restoreFocusStrategyRef.current = restoreFocusStrategy;
  });

  useEffect(() => {
    return () => {
      if (
        !shouldRestoreModalFocusOnUnmount(
          wasOpenRef.current,
          isOpenRef.current,
        )
      ) {
        pendingRestoreCancelRef.current?.();
        pendingRestoreCancelRef.current = null;
        return;
      }

      const restoreTarget = getFocusRestoreTarget(
        restoreFocusRefRef.current,
        previouslyFocusedRef.current,
      );

      pendingRestoreCancelRef.current?.();
      pendingRestoreCancelRef.current = scheduleFocusRestore(
        restoreTarget,
        restoreFocusStrategyRef.current,
      );
    };
  }, []);

  useLayoutEffect(() => {
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
  ]);

  useEffect(() => {
    isOpenRef.current = isOpen;

    if (isOpen) {
      wasOpenRef.current = true;
      return;
    }

    if (!shouldRestoreModalFocus(wasOpenRef.current, isOpen)) {
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
    wasOpenRef.current = false;

    return () => {
      pendingRestoreCancelRef.current?.();
      pendingRestoreCancelRef.current = null;
    };
  }, [isOpen, restoreFocusRef, restoreFocusStrategy]);
}
