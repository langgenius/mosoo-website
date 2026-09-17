import { useEffect, useState } from "react";

export function useIdleReady(timeout = 1200): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (ready) {
      return;
    }

    let cancelled = false;
    const markReady = (): void => {
      if (!cancelled) {
        setReady(true);
      }
    };

    const idleWindow = window as Window & {
      cancelIdleCallback?: Window["cancelIdleCallback"];
      requestIdleCallback?: Window["requestIdleCallback"];
    };

    if (
      typeof idleWindow.requestIdleCallback === "function" &&
      typeof idleWindow.cancelIdleCallback === "function"
    ) {
      const callbackId = idleWindow.requestIdleCallback(markReady, { timeout });
      return () => {
        cancelled = true;
        idleWindow.cancelIdleCallback?.(callbackId);
      };
    }

    const timeoutId = window.setTimeout(markReady, timeout);
    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [ready, timeout]);

  return ready;
}
