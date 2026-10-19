// T4 product-vector kit for the v5 home (staging production/v5/BRIEF.md §5 T4).
//
// What it is: mosoo's product objects redrawn in the site's own language by the rules reverse-engineered
// from Apollo's illustrations (staging refs/apollo/v5/STUDY.md §2 and the rules in §4): one structural
// sentence per object, two or three parts, real words, a neutral palette, exactly one lit element (an offset
// textured underlay from T1, the lime running dot, or one ink action), 2px-at-1000 connectors, shadows only on
// layers that sit on something, rows fading 1 / .6 / .2, bleed for "there is more". Static: nothing here
// moves, so reduced motion and no-JS show the drawn state; an engine can animate the `data-kit-part` hooks.
//
// Use: import a render function, pass every visible string as props (en / zh / ja come from the copy file),
// put the HTML string in the page, and load ./kit.css (plus src/home/v5-fields.css for the T1 underlay
// texture; without it the underlay falls back to a CSS placeholder in the same colours).
//   renderSession({ state: "watch", size: "stage", status: "Running", action: "Writing {file} ...", ... })
//   renderHarnessStrip({ tiles: [...], picked: 0, eyebrow: "Harness" })
// Scale: `size: "card"` is 14px (Apollo's scale), `size: "stage"` is up to 20px; `--kit-size` overrides both.
//
// Generated part: ./glyphs.ts (inline SVG data for runtime marks, the mosoo sidebar glyph family and the
// console's Hugeicons). Regenerate it, the gallery and every proof image with one command:
//   bun $MOSOO_STAGING/v5/tools/kit/build.ts
// (proof folder: staging v5/tools/kit; NOTES.md there lists sources, outputs and what is unverified).

export { renderFileChipRow, renderHarnessStrip, renderKeyRow, renderResumeChip, renderSandboxCell } from "./objects.ts";
export { chip, DOTTED_WALL, esc, eventRows, fileChip, glyph, keycap, LIVE_DOT, runtimeGlyph, underlay, wire } from "./parts.ts";
export { renderSession, renderSessionCall, renderSessionReturn, renderSessionWatch } from "./session.ts";
export type { KitGlyphId } from "./glyphs.ts";
export type {
  EventKind,
  EventRow,
  FileChipRowProps,
  HarnessRef,
  HarnessStripProps,
  KeyRowProps,
  KitBase,
  KitSize,
  ResumeChipProps,
  RuntimeId,
  SandboxCellProps,
  SessionCallProps,
  SessionProps,
  SessionReturnProps,
  SessionWatchProps,
  UnderlayStrip,
} from "./types.ts";
