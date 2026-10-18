// One replay per mount: a component renders its final state first, then, only
// when `animate` is on and the visitor has not asked for reduced motion, plays
// a short timeline the first time it is at least half visible. The Replay
// control restarts it. Components derive everything they draw from `elapsed`
// (null = final state), so every frame is a pure function of time and a still
// can be rendered with `replayAt`.
//
// Two page-level rules (product-presentation §7: one live element at a time):
// - A moment that is already half visible when it mounts starts its timeline
//   before the first paint, so its final state never flashes and rewinds.
// - Replays take turns. While one runs, a moment that comes into view waits;
//   when the running one ends, the next waiting moment that is still half
//   visible plays, and the others keep their final state until they come into
//   view again. A Replay click plays at once and sends the running replay to
//   its final state. `exclusive: false` opts a moment out, for a direction
//   that pairs two moments on purpose.

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

// --- Turn-taking -------------------------------------------------------------

interface ReplaySlot {
  /** Jump to the final state (another replay took the turn). */
  finish: () => void;
  /** Play the timeline from the start. */
  play: () => void;
  /** Whether the moment is at least half visible right now. */
  visible: () => boolean;
}

let running: ReplaySlot | null = null;
const waiting: ReplaySlot[] = [];

function requestTurn(slot: ReplaySlot): void {
  if (running === null) {
    running = slot;
    slot.play();
  } else if (running !== slot && !waiting.includes(slot)) {
    waiting.push(slot);
  }
}

function takeTurn(slot: ReplaySlot): void {
  const previous = running;
  running = slot;

  if (previous !== null && previous !== slot) {
    previous.finish();
  }

  slot.play();
}

function releaseTurn(slot: ReplaySlot): void {
  const index = waiting.indexOf(slot);
  if (index !== -1) {
    waiting.splice(index, 1);
  }

  if (running !== slot) {
    return;
  }

  running = null;
  for (let next = waiting.shift(); next !== undefined; next = waiting.shift()) {
    if (next.visible()) {
      running = next;
      next.play();
      return;
    }
  }
}

// Half visible, or filling half the viewport when taller than two viewports
// (its ratio could then never reach one half).
function isHalfVisible(top: number, height: number, viewportHeight: number): boolean {
  const shown = Math.max(0, Math.min(top + height, viewportHeight) - Math.max(top, 0));
  return height > 0 && (shown / height >= VISIBLE_RATIO || shown >= viewportHeight * VISIBLE_RATIO);
}

// --- The hook ------------------------------------------------------------------

export interface ReplayOptions {
  animate: boolean;
  durationMs: number;
  /** Take turns with the page's other replays (default). */
  exclusive?: boolean | undefined;
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

export function useReplay({ animate, durationMs, exclusive = true, replayAt }: ReplayOptions): Replay {
  const reducedMotion = useReducedMotion();
  const enabled = animate && !reducedMotion && replayAt === undefined;
  const [elapsed, setElapsed] = useState<number | null>(null);
  const frame = useRef<number | null>(null);
  const played = useRef(false);
  const visible = useRef(false);
  const slot = useRef<ReplaySlot | null>(null);

  const stopFrame = useCallback((): void => {
    if (frame.current !== null) {
      globalThis.cancelAnimationFrame(frame.current);
      frame.current = null;
    }
  }, []);

  if (slot.current === null) {
    const own: ReplaySlot = {
      finish: () => {
        stopFrame();
        setElapsed(null);
      },
      play: () => {
        stopFrame();
        played.current = true;
        const startedAt = globalThis.performance.now();

        const tick = (now: number): void => {
          const time = Math.max(0, now - startedAt);

          if (time >= durationMs) {
            frame.current = null;
            setElapsed(null);
            releaseTurn(own);
            return;
          }

          setElapsed(time);
          frame.current = globalThis.requestAnimationFrame(tick);
        };

        setElapsed(0);
        frame.current = globalThis.requestAnimationFrame(tick);
      },
      visible: () => visible.current,
    };
    slot.current = own;
  }

  const ref = useCallback(
    (node: HTMLElement | null): (() => void) | undefined => {
      const own = slot.current;

      if (node === null || own === null || !enabled || typeof IntersectionObserver === "undefined") {
        return undefined;
      }

      const want = (): void => {
        if (played.current) {
          return;
        }

        if (exclusive) {
          requestTurn(own);
        } else {
          own.play();
        }
      };

      // Already in view: start now, in the commit, before the first paint.
      const box = node.getBoundingClientRect();
      if (isHalfVisible(box.top, box.height, globalThis.innerHeight)) {
        visible.current = true;
        want();
      }

      const observer = new IntersectionObserver(
        (entries) => {
          visible.current = entries.some(
            (entry) =>
              entry.intersectionRatio >= VISIBLE_RATIO ||
              entry.intersectionRect.height >= (entry.rootBounds?.height ?? Infinity) * VISIBLE_RATIO,
          );

          if (visible.current) {
            want();
          }

          if (played.current) {
            observer.disconnect();
          }
        },
        { threshold: [0, 0.25, VISIBLE_RATIO, 0.75, 1] },
      );
      observer.observe(node);

      return () => {
        observer.disconnect();
        visible.current = false;

        // Detached mid-replay (StrictMode re-attaches at once): allow a fresh start.
        if (frame.current !== null) {
          stopFrame();
          played.current = false;
          setElapsed(null);
        }

        releaseTurn(own);
      };
    },
    [enabled, exclusive, stopFrame],
  );

  const replay = useCallback((): void => {
    const own = slot.current;
    if (own === null) {
      return;
    }

    if (exclusive) {
      takeTurn(own);
    } else {
      own.play();
    }
  }, [exclusive]);

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
    replay,
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
