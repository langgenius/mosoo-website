import type { CSSProperties } from "react";

/**
 * Titles on the use-case pages, in the display token (app.css --font-display:
 * Roboto Serif, the face of the home's two-tone serif). It replaced Cabinet
 * Grotesk, which shipped without a licence file (REVIEW-v4 §6.3). The face
 * ships one weight per language (the static 440 file for en, 400 for zh / ja),
 * which a 400 request selects; no synthesized bold.
 */
export function displayStyle(fontSize: string, letterSpacing = "-0.022em", lineHeight = 1.06): CSSProperties {
  return { fontFamily: "var(--font-display)", fontSize, fontSynthesis: "none", fontWeight: 400, letterSpacing, lineHeight };
}

export const sectionHeadingStyle = displayStyle("clamp(28px, 3.4vw, 44px)", "-0.022em", 1.08);
