import type { Variants } from "motion/react";

export const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

// No embedded transition here: a variant-level transition would replace the
// transition prop Reveal passes (motion resolves variant transitions first),
// silently dropping per-instance delays.
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0 },
};

export const staggerParent: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
};

export const REVEAL_VIEWPORT = { once: true, margin: "-80px" } as const;
