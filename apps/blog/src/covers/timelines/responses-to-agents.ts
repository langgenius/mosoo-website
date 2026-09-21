// Timeline for "From responses to agents: the API becomes a runtime".
// One moment: the rings grow out of the response disc, one after another.
import type { CoverTimeline } from "../runtime";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;
// Each ring starts at the size of the ring inside it (ratios from the generator).
const FROM = { 1: 0.4406, 2: 0.619, 3: 0.7043 } as const;

const timeline: CoverTimeline = {
  // Response · State + tools · Agents
  stages: [0, 0.5, 2.3],
  build({ one }) {
    const grow = (i: 1 | 2 | 3, at: number) =>
      [
        [one(`ring-${i}`), { scale: [FROM[i], 1], opacity: [0, 1] }, { at, duration: 0.9, ease: EASE_OUT }],
        [one(`word-${i}`), { opacity: [0, 1] }, { at: at + 0.45, duration: 0.4 }],
      ] as const;
    return [
      ...grow(1, 0.5),
      ...grow(2, 1.4),
      ...grow(3, 2.3),
    ];
  },
};

export default timeline;
