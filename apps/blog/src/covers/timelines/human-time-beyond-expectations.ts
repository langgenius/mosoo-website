// The curtain opens to reveal half of the work, then rests.
// Shared runtime supplies hover/pause/resume, controls and reduced motion.
import type { CoverTimeline } from "../runtime";

const timeline: CoverTimeline = {
  stages: [0, 0.25, 2.15],
  build({ one }) {
    return [
      [one("curtain"), { x: [-235, 0] }, { at: 0.25, duration: 1.9, ease: [0.32, 0.72, 0, 1] }],
      [one("seen"), { opacity: [0.35, 1] }, { at: 0.25, duration: 1.9, ease: "linear" }],
      // Holds the completed picture; also gives the reduced-motion fade a
      // complete final stage without adding any positional animation.
      [one("seen"), { opacity: [1, 1] }, { at: 2.15, duration: 0.35 }],
    ];
  },
};

export default timeline;
