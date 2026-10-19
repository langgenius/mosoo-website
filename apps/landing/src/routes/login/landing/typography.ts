import type { CSSProperties } from "react";

export const DISPLAY_FONT = '"Cabinet Grotesk", "Geist", ui-sans-serif, system-ui, sans-serif';

export const sectionHeadingStyle: CSSProperties = {
  fontFamily: DISPLAY_FONT,
  fontSize: "clamp(28px, 3.4vw, 44px)",
  fontWeight: 500,
  letterSpacing: "-0.028em",
  lineHeight: 1.08,
};

/** v2c product stage: Geist only, set at 600 with slightly tight tracking. */
export const STAGE_DISPLAY_FONT = '"Geist", ui-sans-serif, system-ui, sans-serif';

export const stageHeadingStyle: CSSProperties = {
  fontFamily: STAGE_DISPLAY_FONT,
  fontSize: "clamp(28px, 2.6vw, 38px)",
  fontWeight: 600,
  letterSpacing: "-0.025em",
  lineHeight: 1.12,
};
