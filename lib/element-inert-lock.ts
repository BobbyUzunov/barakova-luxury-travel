type InertLockState = {
  lockCount: number;
  previousInert: boolean;
};

const inertLocks = new WeakMap<HTMLElement, InertLockState>();

export function lockElementInert(element: HTMLElement) {
  let state = inertLocks.get(element);

  if (!state) {
    state = {
      lockCount: 0,
      previousInert: element.inert,
    };
    inertLocks.set(element, state);
  }

  if (state.lockCount === 0) {
    state.previousInert = element.inert;
    element.inert = true;
  }

  state.lockCount += 1;

  return () => {
    const currentState = inertLocks.get(element);

    if (!currentState) {
      return;
    }

    currentState.lockCount = Math.max(0, currentState.lockCount - 1);

    if (currentState.lockCount === 0) {
      element.inert = currentState.previousInert;
      inertLocks.delete(element);
    }
  };
}

export function resetElementInertLockForTests(element: HTMLElement) {
  inertLocks.delete(element);
}
