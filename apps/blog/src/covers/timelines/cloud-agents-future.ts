// Timeline for "When Cloud Agents become the future".
// One moment: an address becomes a place, and one governed run walks through it.
import type { CoverTimeline } from "../runtime";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

const timeline: CoverTimeline = {
  // Address · Environment · Run
  stages: [0, 0.6, 2.9],
  build({ one }) {
    return [
      [one("plate"), { scale: [1, 1.05, 1] }, { at: 0.15, duration: 0.45, ease: EASE_OUT }],
      // the address resolves into walls
      [one("wall-0"), { strokeDashoffset: [1, 0] }, { at: 0.6, duration: 1.2, ease: EASE_OUT }],
      [one("wall-1"), { strokeDashoffset: [1, 0] }, { at: 1.3, duration: 0.7, ease: EASE_OUT }],
      [one("wall-2"), { strokeDashoffset: [1, 0] }, { at: 1.6, duration: 0.6, ease: EASE_OUT }],
      [one("wall-3"), { strokeDashoffset: [1, 0] }, { at: 1.8, duration: 0.6, ease: EASE_OUT }],
      ...[0, 1, 2, 3].map((i) => [one(`room-${i}`), { opacity: [0, 1] }, { at: 2.0 + i * 0.16, duration: 0.4 }] as const),
      // one run, inside the walls
      [one("run-word"), { opacity: [0, 1] }, { at: 2.9, duration: 0.3 }],
      [one("route"), { strokeDashoffset: [1, 0] }, { at: 2.9, duration: 1.9, ease: [0.4, 0, 0.2, 1] }],
      [one("arrive"), { opacity: [0, 1], scale: [0.4, 1] }, { at: 4.7, duration: 0.4, ease: EASE_OUT }],
    ];
  },
};

export default timeline;
