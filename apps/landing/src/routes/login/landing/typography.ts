import type { CSSProperties } from "react";

/**
 * The old React home's section heading, still imported by ./ui.tsx (which no page imports any more). It takes the
 * display token now. Its Cabinet Grotesk / Geist stack (DISPLAY_FONT, last used by the plan-based pricing page that
 * #138 deleted) named fonts the site no longer ships (#143).
 */
export const sectionHeadingStyle: CSSProperties = {
  fontFamily: "var(--font-display)",
  fontSize: "clamp(28px, 3.4vw, 44px)",
  fontWeight: 400,
  letterSpacing: "-0.028em",
  lineHeight: 1.08,
};
