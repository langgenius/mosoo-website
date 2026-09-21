// Timeline for "How ghfind turns a Mosoo Agent into a project evaluation feature".
// One moment: a repository is submitted and a four-sided judgment unfolds.
import type { CoverTimeline } from "../runtime";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

const timeline: CoverTimeline = {
  // Repository · Evaluation · Judgment
  stages: [0, 0.55, 1.5],
  build({ one }) {
    return [
      [one("submit"), { scale: [1, 0.96, 1] }, { at: 0.55, duration: 0.32, ease: EASE_OUT }],
      [one("judgment"), { opacity: [0, 1], scale: [0.2, 1] }, { at: 1.5, duration: 1.1, ease: EASE_OUT }],
      ...[0, 1, 2, 3].map((i) => [one(`axis-${i}`), { opacity: [0.45, 1] }, { at: 1.7 + i * 0.22, duration: 0.4 }] as const),
      [one("tag"), { opacity: [0, 1], y: [12, 0] }, { at: 2.9, duration: 0.55, ease: EASE_OUT }],
    ];
  },
};

export default timeline;
