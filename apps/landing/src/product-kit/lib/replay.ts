// One replay per mount: a component renders its final state first, then, only
// when `animate` is on and the visitor has not asked for reduced motion, plays
// a short timeline the first time it is at least half visible. The Replay
// control restarts it. Components derive everything they draw from `elapsed`
// (null = final state), so every frame is a pure function of time and a still
// can be rendered with `replayAt`.

import { useCallback, useRef, useState, useSyncExternalStore } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const VISIBLE_RATIO = 0.5;

function subscribeReducedMotion(onChange: () => void): () => void {
  const query = globalThis.matchMedia?.(REDUCED_MOTION_QUERY);
  query?.addEventListener("change", onChange);
  return () => query?.removeEventListener("change", onChange);
}

function readReducedMotion(): boolean {
  return globalThis.matchMedia?.(REDUCED_MOTION_QUERY).matches ?? true;
}

// Without a window (prerendering), assume reduced motion: the final state.
function readServerReducedMotion(): boolean {
  return true;
}

export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribeReducedMotion, readReducedMotion, readServerReducedMotion);
}

export interface ReplayOptions {
  animate: boolean;
  durationMs: number;
  replayAt?: number | undefined;
}

export interface Replay {
  /** Milliseconds into the replay, or null for the final state. */
  elapsed: number | null;
  /** Whether a Replay control should show. */
  canReplay: boolean;
  /** Attach to the component root; watches visibility for the first replay. */
  ref: (node: HTMLElement | null) => (() => void) | undefined;
  replay: () => void;
}

export function useReplay({ animate, durationMs, replayAt }: ReplayOptions): Replay {
  const reducedMotion = useReducedMotion();
  const enabled = animate && !reducedMotion && replayAt === undefined;
  const [elapsed, setElapsed] = useState<number | null>(null);
  const frame = useRef<number | null>(null);
  const played = useRef(false);

  const stop = useCallback((): void => {
    if (frame.current !== null) {
      globalThis.cancelAnimationFrame(frame.current);
      frame.current = null;
    }
  }, []);

  const start = useCallback((): void => {
    stop();
    played.current = true;
    const startedAt = globalThis.performance.now();

    const tick = (now: number): void => {
      const time = now - startedAt;

      if (time >= durationMs) {
        frame.current = null;
        setElapsed(null);
        return;
      }

      setElapsed(time);
      frame.current = globalThis.requestAnimationFrame(tick);
    };

    setElapsed(0);
    frame.current = globalThis.requestAnimationFrame(tick);
  }, [durationMs, stop]);

  const ref = useCallback(
    (node: HTMLElement | null): (() => void) | undefined => {
      if (node === null || !enabled || typeof IntersectionObserver === "undefined") {
        return undefined;
      }

      // Half visible, or filling half the viewport when taller than two
      // viewports (its ratio could then never reach one half).
      const observer = new IntersectionObserver(
        (entries) => {
          const seen = entries.some(
            (entry) =>
              entry.intersectionRatio >= VISIBLE_RATIO ||
              entry.intersectionRect.height >= (entry.rootBounds?.height ?? Infinity) * VISIBLE_RATIO,
          );

          if (!played.current && seen) {
            observer.disconnect();
            start();
          }
        },
        { threshold: [0, 0.25, VISIBLE_RATIO, 0.75, 1] },
      );
      observer.observe(node);

      return () => {
        observer.disconnect();
        stop();
      };
    },
    [enabled, start, stop],
  );

  if (replayAt !== undefined) {
    return {
      canReplay: false,
      elapsed: Math.min(Math.max(replayAt, 0), durationMs),
      ref,
      replay: () => {},
    };
  }

  return {
    canReplay: enabled,
    elapsed: enabled ? elapsed : null,
    ref,
    replay: start,
  };
}

/** 0 → 1 progress of `elapsed` through [from, to]; 1 once past, and for the final state. */
export function progress(elapsed: number | null, from: number, to: number): number {
  if (elapsed === null || elapsed >= to) {
    return 1;
  }

  if (elapsed <= from) {
    return 0;
  }

  return (elapsed - from) / (to - from);
}

/** Whether the timeline has reached `at` (always true in the final state). */
export function reached(elapsed: number | null, at: number): boolean {
  return elapsed === null || elapsed >= at;
}
