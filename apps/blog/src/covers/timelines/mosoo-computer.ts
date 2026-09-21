// Timeline for "Mosoo Computer: a computer your agent can keep working in".
// One moment: the computer sleeps, the workspace stays, one request wakes it.
import type { CoverTimeline } from "../runtime";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

const timeline: CoverTimeline = {
  // Awake · Sleeping · Woken
  stages: [0, 0.6, 2.9],
  build({ one }) {
    return [
      // the request is not here yet
      [one("bubble"), { opacity: [0, 0] }, { at: 0, duration: 0.01 }],
      [one("wire"), { opacity: [0, 0] }, { at: 0, duration: 0.01 }],

      // sleep: the process stops — the frame dims, the moon comes out
      [one("frame"), { opacity: [1, 0.3] }, { at: 0.6, duration: 0.22, ease: "linear" }],
      [one("moon"), { opacity: [0, 1], scale: [0.6, 1] }, { at: 0.6, duration: 0.4, ease: EASE_OUT }],
      [one("state-awake"), { opacity: [1, 0] }, { at: 0.6, duration: 0.2 }],
      [one("state-asleep"), { opacity: [0, 1] }, { at: 0.75, duration: 0.25 }],
      // …and the workspace is still there
      [one("folder"), { scale: [1, 1.12, 1] }, { at: 1.35, duration: 0.7, ease: EASE_OUT }],

      // one request arrives from a familiar channel
      [one("bubble"), { opacity: [0, 1], x: [-46, 0] }, { at: 2.2, duration: 0.6, ease: EASE_OUT }],
      [one("wire"), { opacity: [0, 1] }, { at: 2.55, duration: 0.35 }],

      // wake
      [one("frame"), { opacity: [0.3, 1] }, { at: 2.9, duration: 0.22, ease: "linear" }],
      [one("moon"), { opacity: [1, 0], scale: [1, 0.6] }, { at: 2.9, duration: 0.3 }],
      [one("state-asleep"), { opacity: [1, 0] }, { at: 2.9, duration: 0.2 }],
      [one("state-awake"), { opacity: [0, 1] }, { at: 3.05, duration: 0.25 }],
    ];
  },
};

export default timeline;
