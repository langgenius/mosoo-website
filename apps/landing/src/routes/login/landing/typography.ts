import type { CSSProperties } from "react";

import { locale } from "@/shared/locale";

// Chinese and Japanese characters fall through Cabinet Grotesk to a CJK face.
// "mosoo CJK SC" and "mosoo CJK JP" (app.css) pin that face's weight, so the
// ideographs and kana sit at the display weight of the Latin around them
// instead of whatever weight the system font picks for 500.
const CJK_DISPLAY_FACE = locale === "ja" ? '"mosoo CJK JP"' : '"mosoo CJK SC"';

export const DISPLAY_FONT = `"Cabinet Grotesk", ${CJK_DISPLAY_FACE}, "Geist", ui-sans-serif, system-ui, sans-serif`;

/** Negative tracking tightens Latin display type but crowds ideographs and kana. */
export function displayTracking(latin: string): string {
  return locale === "en" ? latin : "0";
}

export const sectionHeadingStyle: CSSProperties = {
  fontFamily: DISPLAY_FONT,
  fontSize: "clamp(28px, 3.4vw, 44px)",
  fontWeight: 500,
  letterSpacing: displayTracking("-0.028em"),
  lineHeight: locale === "en" ? 1.08 : 1.25,
};

/*
 * The home page's rhythm: evidence sections (supply, proof, limits, FAQ)
 * speak quietly, and the one statement section (the app/mosoo split) speaks
 * loudest, so the page is not one uniform column of equal headings.
 */
export const evidenceHeadingStyle: CSSProperties = {
  ...sectionHeadingStyle,
  fontSize: "clamp(26px, 2.9vw, 38px)",
};

export const statementHeadingStyle: CSSProperties = {
  ...sectionHeadingStyle,
  fontSize: "clamp(32px, 4.6vw, 60px)",
  letterSpacing: displayTracking("-0.032em"),
  lineHeight: locale === "en" ? 1.02 : 1.2,
};
