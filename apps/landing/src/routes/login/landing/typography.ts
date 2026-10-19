import type { CSSProperties } from "react";

export const DISPLAY_FONT = "var(--font-display)";

export const sectionHeadingStyle: CSSProperties = {
  fontFamily: DISPLAY_FONT,
  fontSize: "clamp(28px, 3.4vw, 44px)",
  fontWeight: 400,
  letterSpacing: "-0.028em",
  lineHeight: 1.08,
};
