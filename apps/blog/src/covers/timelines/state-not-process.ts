// Timeline for "An agent's state is not its process".
// One moment: the process is wiped away, the state stays, a new process is drawn.
import type { CoverTimeline } from "../runtime";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

const timeline: CoverTimeline = {
  // Running · Process gone · Next run
  stages: [0, 0.9, 2.7],
  build({ one }) {
    return [
      // the process disappears: outline wiped, word gone, thread let go
      [one("box"), { strokeDashoffset: [0, 1] }, { at: 0.9, duration: 0.8, ease: [0.5, 0, 0.75, 0] }],
      [one("box-word"), { opacity: [1, 0] }, { at: 0.9, duration: 0.45 }],
      [one("box-plate"), { opacity: [1, 0] }, { at: 1.2, duration: 0.4 }],
      [one("thread"), { strokeDashoffset: [0, 1] }, { at: 1.15, duration: 0.5, ease: "linear" }],
      [one("ghost"), { opacity: [0, 1] }, { at: 1.35, duration: 0.5 }],
      // the state does not move; its joint answers once
      [one("joint"), { scale: [1, 1.5, 1] }, { at: 1.95, duration: 0.6, ease: EASE_OUT }],
      // the next run is drawn from the same facts
      [one("thread"), { strokeDashoffset: [1, 0] }, { at: 2.7, duration: 0.5, ease: EASE_OUT }],
      [one("box-plate"), { opacity: [0, 1] }, { at: 3.0, duration: 0.5 }],
      [one("box"), { strokeDashoffset: [1, 0] }, { at: 3.0, duration: 1.1, ease: EASE_OUT }],
      [one("box-word"), { opacity: [0, 1] }, { at: 3.7, duration: 0.45 }],
    ];
  },
};

export default timeline;
