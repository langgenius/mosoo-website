import type { ReactElement } from "react";

import { locale } from "@/shared/locale";
import { RUNTIME_ICON_URL } from "@/shared/ui/brand-icons/runtime-icon-data";

// Between the two values: a space in English, none after CJK punctuation.
const VALUE_GAP = { en: " ", zh: "", ja: "" } as const;

/**
 * A two-value statement heading (the second value softer) with a 10px, 1px
 * right-angle bracket after its first phrase: ACE Studio's bracketed headline
 * (issue #96, refs/devices/crops/issue-96-bracket-headline-corner-frame.jpg),
 * set in the display serif and without its colour.
 */
export function Bracketed({
  lines,
}: {
  lines: readonly string[];
}): ReactElement {
  return (
    <>
      {lines.map((line, index) => (
        <span
          key={line}
          className={index === 0 ? "i-phrase" : "i-phrase i-soft"}
        >
          {line}
          {/* One corner per heading, on the first value's line end: two
              corners followed the ragged line ends (UI review P2-5). */}
          {index === 0 ? <i className="i-bracket" aria-hidden="true" /> : null}
          {index < lines.length - 1 ? VALUE_GAP[locale] : null}
        </span>
      ))}
    </>
  );
}

/** Four 9px crosses on the corners of a framed block (ACE's corner frame). */
export function CornerCrosses(): ReactElement {
  return (
    <span className="i-crosses" aria-hidden="true">
      <i />
      <i />
      <i />
      <i />
    </span>
  );
}

/**
 * A runtime's mark, desaturated to the page ink (UI-FORMS c.0: runtime glyphs
 * are inked on the site; colour is kept for the plates). Pi has no mark in
 * the icon package, so it is a text mark.
 */
export function RuntimeGlyph({
  runtimeId,
  size,
}: {
  runtimeId: string;
  size: number;
}): ReactElement {
  const url = RUNTIME_ICON_URL[runtimeId];
  if (url === undefined) {
    return (
      <span
        className="i-glyph-text"
        style={{ width: size, height: size }}
        aria-hidden="true"
      >
        Pi
      </span>
    );
  }
  return (
    <img
      className="i-glyph"
      src={url}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      decoding="async"
    />
  );
}

// Two of the console's sidebar glyphs, copied from the main repo
// (apps/web/src/shared/ui/sidebar-icons.tsx: "providers" L152-L163,
// "environments" L170-L174), drawn in the page ink.
export function ProviderKeyGlyph(): ReactElement {
  return (
    <svg className="i-row-glyph" viewBox="0 0 24 24" aria-hidden="true">
      <circle
        cx={7.25}
        cy={12}
        r={4.25}
        fill="currentColor"
        fillOpacity={0.12}
        stroke="none"
      />
      <circle cx={7.25} cy={12} r={4.25} />
      <path d="M11.5 12H21M17.25 12V15.5M21 12V14.5" />
    </svg>
  );
}

export function EnvironmentGlyph(): ReactElement {
  return (
    <svg className="i-row-glyph" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 2.75L20 7.25L12 11.75L4 7.25Z"
        fill="currentColor"
        fillOpacity={0.12}
        stroke="none"
      />
      <path d="M12 2.75L20 7.25V16.75L12 21.25L4 16.75V7.25Z" />
      <path d="M4 7.25L12 11.75L20 7.25M12 11.75V21.25" />
    </svg>
  );
}
