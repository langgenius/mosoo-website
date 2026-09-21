// Timeline for "The journey begins with an Imagine If."
// One moment: Agent Work crosses the threshold, and the upper side comes alive.
import type { CoverTimeline } from "../runtime";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;
const TRAVEL = 884; // px the marker rides along the scale (from the generator)
const LIFT = 18;

const timeline: CoverTimeline = {
  // One-off · Threshold · Lifecycle
  stages: [0, 1.5, 2.3],
  build({ all, one }) {
    const lifted = all("lifted");
    return [
      // the marker starts on the dark side and rides up the scale
      [one("marker"), { x: [-TRAVEL, 0] }, { at: 0.35, duration: 2.5, ease: [0.45, 0, 0.2, 1] }],
      // crossing: the slit answers once
      [one("slit"), { scaleY: [1, 1.12, 1] }, { at: 1.55, duration: 0.6, ease: EASE_OUT }],
      // above the threshold the steps lift, one after another
      ...lifted.map((step, i) => [step, { y: [LIFT, 0] }, { at: 1.75 + i * 0.09, duration: 0.5, ease: EASE_OUT }] as const),
      [one("lifecycle"), { opacity: [0.45, 1] }, { at: 2.1, duration: 0.4 }],
      [one("verbs"), { opacity: [0, 1], y: [16, 0] }, { at: 2.75, duration: 0.6, ease: EASE_OUT }],
    ];
  },
};

export default timeline;
