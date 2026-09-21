// Timeline for "From API to CLI + Skill".
// One moment: the cursor walks the development loop once and comes back to line 1.
import type { CoverTimeline, Segment } from "../runtime";

// Cursor offsets per line, relative to its resting place after "API" (from the generator).
const STOPS = [
  [0, 0],
  [27.6, 80],
  [496.8, 160],
  [579.6, 240],
  [386.4, 320],
  [552, 400],
  [717.6, 480],
] as const;
const STEP = 0.55;
const START = 0.5;

const timeline: CoverTimeline = {
  // API + spec · CLI + tests · Repeat
  stages: [0, START + STEP * 2, START + STEP * 6.4],
  build({ one }) {
    const segments: Segment[] = [];
    const cursor = one("cursor");
    for (let i = 1; i < STOPS.length; i += 1) {
      const at = START + (i - 1) * STEP;
      // the cursor jumps between lines the way a terminal cursor does: no easing, no travel
      segments.push([cursor, { x: [STOPS[i - 1][0], STOPS[i][0]], y: [STOPS[i - 1][1], STOPS[i][1]] }, { at, duration: 0.01, ease: "linear" }]);
      segments.push([one(`row-${i - 1}`), { opacity: [1, 0] }, { at, duration: 0.18 }]);
      segments.push([one(`row-${i}`), { opacity: [0, 1] }, { at, duration: 0.18 }]);
    }
    const back = START + (STOPS.length - 1) * STEP + 0.35;
    segments.push([cursor, { x: [STOPS[6][0], 0], y: [STOPS[6][1], 0] }, { at: back, duration: 0.01, ease: "linear" }]);
    segments.push([one("row-6"), { opacity: [1, 0] }, { at: back, duration: 0.18 }]);
    segments.push([one("row-0"), { opacity: [0, 1] }, { at: back, duration: 0.18 }]);
    segments.push([one("repeat"), { rotate: [0, -360] }, { at: back - 0.25, duration: 0.9, ease: [0.23, 1, 0.32, 1] }]);
    // a terminal cursor blinks; two blinks at rest, then it holds
    segments.push([cursor, { opacity: [1, 0, 1, 0, 1] }, { at: back + 0.2, duration: 1.1, times: [0, 0.2, 0.45, 0.7, 1], ease: "linear" }]);
    return segments;
  },
};

export default timeline;
