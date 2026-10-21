// T4 product-vector kit for the v5 home (staging production/v5/BRIEF.md §5 T4).
//
// What it is: mosoo's product objects redrawn in the site's own language by the rules reverse-engineered
// from Apollo's illustrations (staging refs/apollo/v5/STUDY.md §2 and the rules in §4): one structural
// sentence per object, two or three parts, real words, a neutral palette, white cards on the plate with the kit's
// shadow, shadows only on layers that sit on something, 1px ink lines only for who calls whom (committee O1, 2026-10-21:
// no outlined objects). Static by default: reduced motion and no-JS show the drawn state; the stage engine moves the
// Session object between its states in place (kit.css: --kit-cloud, --kit-app).
//
// Use: import a render function, pass every visible string as props (en / zh / ja come from the copy file),
// put the HTML string in the page, and load ./kit.css (plus src/home/v5-fields.css for the T1 underlay
// texture of ./objects.ts; without it the underlay falls back to a CSS placeholder in the same colours).
//   renderSession({ state: "laptop", size: "stage", harness, file, laptop, session, cloud, app })
//   renderHarnessStrip({ tiles: [...], picked: 0, eyebrow: "Harness" })
// Scale: `size: "card"` is 14px (Apollo's scale), `size: "stage"` is up to 20px; `--kit-size` overrides both.
//
// The Session object (./session.ts, round 3b): the first plate and the stage's three states, laptop / cloud / app
// (staging narrative/CHANGES.md §2, §3). ./objects.ts: five small objects no page renders today (kept for the lime
// screen's cards; see its header).
//
// Generated part: ./glyphs.ts (inline SVG data for runtime marks, the mosoo sidebar glyph family and the
// console's Hugeicons, with their sources and licences). Regenerate it with:
//   MOSOO_MAIN=<mosoo checkout> node apps/landing/scripts/assets/kit-glyphs.mjs

export { renderFileChipRow, renderHarnessStrip, renderKeyRow, renderResumeChip, renderSandboxCell } from "./objects.ts";
export { DOTTED_WALL, esc, glyph, LIVE_DOT, runtimeGlyph, underlay, wire } from "./parts.ts";
export { renderSession } from "./session.ts";
export type { KitGlyphId } from "./glyphs.ts";
export type {
  FileChipRowProps,
  HarnessRef,
  HarnessStripProps,
  KeyRowProps,
  KitBase,
  KitSize,
  ResumeChipProps,
  RuntimeId,
  SandboxCellProps,
  SessionProps,
  SessionSide,
  SessionState,
  UnderlayStrip,
} from "./types.ts";
