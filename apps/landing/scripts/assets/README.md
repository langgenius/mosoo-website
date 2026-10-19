# Landing assets: pipelines and provenance (v4a Instrument)

Every asset the instrument home uses is either a self-hosted OFL font or the
output of a deterministic script in this folder. Run a script again and the
bytes do not change.

| Asset | Pipeline | Output | Provenance |
| --- | --- | --- | --- |
| Logo outline (nested windows, FAQ indicator, inline paths) | `node apps/landing/scripts/assets/outline.mjs` | `public/brand/outline/nested-3.svg`, `public/brand/outline/faq-indicator-{closed,open}.svg`, `src/shared/brand/outline-paths.ts` | Ported from the staging study `brand/outline/src/gen.mjs` (2026-10-19). Geometry read off `public/brand/logo-mark.svg`: block 51.51 x 40.96, sides concave by 1.47, the bar redrawn as a line at the bar's top edge (gap 3.63). Nested: band = 0.22 x block width, shared floor. |
| Display face | copied, not generated | `public/fonts/HedvigLettersSerif-400-latin.woff2` (34,796 B) + `HedvigLettersSerif-OFL.txt` | Google Fonts subset (`fonts.gstatic.com/s/hedviglettersserif/v7/...`), via `refs/fonts/candidates/_manifest.json`. OFL 1.1. Stand-in for ABC Arizona Mix (commercial, not shipped). |
| Text face | copied | `public/fonts/Inter-Variable-latin.woff2` (73,016 B) + existing `Inter-LICENSE.txt` | Google Fonts Inter v20 Latin subset, opsz 14-32, wght 100-900. OFL 1.1. |
| Mono face | copied | `public/fonts/FragmentMono-400-latin.woff2` (15,176 B) + `FragmentMono-OFL.txt` | Google Fonts Fragment Mono v6. OFL 1.1. Stand-in for Aeonik Mono (commercial, not shipped). |

The three faces the home loads total 122,988 bytes (budget 125 KB, ATLAS §1.2).

The instrument canvas uses no bitmap plates and no grain (UI-FORMS §f: "没有底板，没有颗粒"); the
one light effect, the glow inside the page-end window (study S6), is an SVG radial gradient in
`src/routes/login/landing/page-end.tsx`.
