// The console's assistant-text cadence, as a deterministic schedule.
// Ported from langgenius/mosoo apps/web/src/domains/runtime/session-stream/
// session-stream-render-scheduler.ts at 7cb9866cfc (#computePacingBudget):
// each frame emits pending * dt / tau graphemes, clamped to [min, max]
// graphemes per second, with a fractional carry; a backlog above the cap is
// delivered whole. The constants come from the console snapshot, so a change
// upstream arrives with `scripts/export-mosoo-product-snapshot.mjs`.

import { CONSOLE_CONSTANTS } from "../i18n";

const PACING = CONSOLE_CONSTANTS.streamPacing;
const FRAME_MS = 1000 / 60;

export interface StreamBatch {
  /** When the batch reaches the browser, in ms from the stream start. */
  atMs: number;
  graphemes: number;
}

export interface StreamSchedule {
  /** Cumulative graphemes shown after each 60 Hz frame. */
  readonly frames: readonly number[];
  readonly startMs: number;
  readonly total: number;
  readonly endMs: number;
}

const segmenter =
  typeof Intl !== "undefined" && typeof Intl.Segmenter === "function"
    ? new Intl.Segmenter(undefined, { granularity: "grapheme" })
    : null;

export function segmentGraphemes(text: string): string[] {
  return segmenter === null
    ? Array.from(text)
    : Array.from(segmenter.segment(text), (part) => part.segment);
}

export function buildStreamSchedule(batches: readonly StreamBatch[]): StreamSchedule {
  const ordered = [...batches].sort((a, b) => a.atMs - b.atMs);
  const total = ordered.reduce((sum, batch) => sum + batch.graphemes, 0);
  const startMs = ordered[0]?.atMs ?? 0;
  const frames: number[] = [];
  let arrived = 0;
  let shown = 0;
  let carry = 0;
  let lastDrainAt: number | null = null;
  let next = 0;

  for (let time = startMs; shown < total; time += FRAME_MS) {
    while (next < ordered.length && (ordered[next]?.atMs ?? Infinity) <= time) {
      // Idle to active: baseline at enqueue, as #schedule does.
      lastDrainAt ??= ordered[next]?.atMs ?? time;
      arrived += ordered[next]?.graphemes ?? 0;
      next += 1;
    }

    const pending = arrived - shown;
    const elapsedMs = Math.max(0, time - (lastDrainAt ?? time));

    if (pending > PACING.maxPendingGraphemes) {
      carry = 0;
      shown = arrived;
    } else if (pending > 0) {
      const elapsedSeconds = elapsedMs / 1000;
      const proportional = (pending * elapsedMs) / PACING.timeConstantMs;
      const paced = Math.min(
        Math.max(proportional, PACING.minGraphemesPerSecond * elapsedSeconds),
        PACING.maxGraphemesPerSecond * elapsedSeconds,
      );
      const budget = carry + paced;
      const whole = Math.floor(budget);
      carry = budget - whole;
      shown += Math.min(whole, pending);
    } else {
      carry = 0;
    }

    // #drainFrame: an emptied queue goes idle until the next batch.
    lastDrainAt = shown < arrived ? time : null;
    frames.push(shown);
  }

  return { endMs: startMs + frames.length * FRAME_MS, frames, startMs, total };
}

/** Graphemes visible `elapsedMs` after the stream start; `total` in the final state. */
export function visibleGraphemes(schedule: StreamSchedule, elapsedMs: number | null): number {
  if (elapsedMs === null) {
    return schedule.total;
  }

  const index = Math.floor((elapsedMs - schedule.startMs) / FRAME_MS);

  if (index < 0) {
    return 0;
  }

  return schedule.frames[Math.min(index, schedule.frames.length - 1)] ?? schedule.total;
}
