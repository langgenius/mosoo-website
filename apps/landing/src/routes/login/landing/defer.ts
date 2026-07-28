const INTERACTION_EVENTS = ["scroll", "wheel", "touchstart", "pointerdown", "keydown"] as const;

export function scheduleDeferredWork(
  callback: () => void,
  {
    timeoutMs = 1_200,
    fallbackDelayMs = 400,
    includeInteractionEvents = false,
  }: {
    timeoutMs?: number;
    fallbackDelayMs?: number;
    includeInteractionEvents?: boolean;
  } = {},
): () => void {
  let completed = false;
  let idleHandle: number | null = null;
  let fallbackHandle: ReturnType<typeof globalThis.setTimeout> | null = null;

  const clearSchedule = (): void => {
    if (idleHandle !== null) {
      window.cancelIdleCallback(idleHandle);
      idleHandle = null;
    }
    if (fallbackHandle !== null) {
      globalThis.clearTimeout(fallbackHandle);
      fallbackHandle = null;
    }
  };

  const removeInteractionListeners = (): void => {
    for (const event of INTERACTION_EVENTS) {
      window.removeEventListener(event, run);
    }
  };

  const run = (): void => {
    if (completed) {
      return;
    }

    completed = true;
    clearSchedule();
    removeInteractionListeners();
    callback();
  };

  if ("requestIdleCallback" in window) {
    idleHandle = window.requestIdleCallback(run, { timeout: timeoutMs });
  } else {
    fallbackHandle = globalThis.setTimeout(run, fallbackDelayMs);
  }

  if (includeInteractionEvents) {
    for (const event of INTERACTION_EVENTS) {
      window.addEventListener(event, run, { passive: true });
    }
  }

  return () => {
    completed = true;
    clearSchedule();
    removeInteractionListeners();
  };
}
