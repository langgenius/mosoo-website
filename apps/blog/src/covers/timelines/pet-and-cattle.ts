// Timeline for "Two kinds of agents: Pet and Cattle".
// One idea, two beats: the Pet grows; the Cattle is replaced.
import type { CoverTimeline } from "../runtime";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

const timeline: CoverTimeline = {
  // Cultivated · Replaced · Both
  stages: [0, 2.0, 4.3],
  build({ one }) {
    return [
      // Pet: one more leaf is drawn, then filled
      [one("new-leaf"), { opacity: [0, 1] }, { at: 0.5, duration: 0.2 }],
      [one("new-leaf-line"), { strokeDashoffset: [1, 0] }, { at: 0.5, duration: 1.2, ease: EASE_OUT }],

      // Cattle: the middle crate is wiped, the old one lifts away, a fresh one is drawn
      [one("fresh-hatch"), { opacity: [1, 0] }, { at: 2.0, duration: 0.3 }],
      [one("fresh-band"), { strokeDashoffset: [0, 1] }, { at: 2.0, duration: 0.35, ease: "linear" }],
      [one("fresh-line"), { strokeDashoffset: [0, 1] }, { at: 2.1, duration: 0.6, ease: [0.5, 0, 0.75, 0] }],
      [one("discarded"), { opacity: [0, 1], y: [70, 0] }, { at: 2.45, duration: 0.7, ease: EASE_OUT }],
      [one("fresh-line"), { strokeDashoffset: [1, 0] }, { at: 3.3, duration: 0.9, ease: EASE_OUT }],
      [one("fresh-band"), { strokeDashoffset: [1, 0] }, { at: 3.9, duration: 0.4, ease: EASE_OUT }],
      [one("fresh-hatch"), { opacity: [0, 1] }, { at: 4.1, duration: 0.5 }],
    ];
  },
};

export default timeline;
