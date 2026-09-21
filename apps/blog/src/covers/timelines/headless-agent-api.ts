// Timeline for "From model calls to agent tasks".
// One transition: a submitted task becomes a finished, named artifact.
// The card itself never moves; detail arrives through time instead of extra panels.
import type { CoverTimeline } from "../runtime";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

const timeline: CoverTimeline = {
  // Submitted · Running · Result
  stages: [0, 0.6, 3.3],
  build({ one }) {
    const check = (i: number, at: number) => [one(`check-${i}`), { opacity: [0, 1], scale: [0.6, 1] }, { at, duration: 0.36, ease: EASE_OUT }] as const;
    return [
      // submitted → running
      [one("state-queued"), { opacity: [1, 0] }, { at: 0.55, duration: 0.2 }],
      [one("state-running"), { opacity: [0, 1] }, { at: 0.65, duration: 0.2 }],
      [one("dot-live"), { opacity: [0, 1] }, { at: 0.65, duration: 0.2 }],

      // the runtime does its three jobs, one after another
      check(0, 1.05),
      check(1, 1.95),
      check(2, 2.85),

      // running → completed, and the artifact arrives
      [one("result"), { opacity: [0, 1], y: [30, 0] }, { at: 3.3, duration: 0.65, ease: EASE_OUT }],
      [one("state-running"), { opacity: [1, 0] }, { at: 3.55, duration: 0.2 }],
      [one("state-completed"), { opacity: [0, 1] }, { at: 3.7, duration: 0.25 }],
    ];
  },
};

export default timeline;
