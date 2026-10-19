# Landing assets (d-object)

Deterministic pipelines for every asset the home page draws. Run from the
repo root; outputs are committed.

| Asset | Pipeline | Output | Provenance |
| --- | --- | --- | --- |
| Logo outline (window, line, nested three, portal mask, FAQ indicator) | `node apps/landing/scripts/assets/outline.mjs` | `apps/landing/public/brand/outline/*.svg`, `apps/landing/src/shared/ui/outline-paths.generated.ts` | Port of the staging study `brand/outline/src/gen.mjs` (2026-10-19). Geometry read off `public/brand/logo-mark.svg`: block 51.51 x 40.96 with sides concave by 1.47, gap 3.63, bar 6.93. The bar becomes a 1px line. |
| Grain tile | `node apps/landing/scripts/assets/grain.mjs` | `apps/landing/public/landing/grain.webp` (256 px, grayscale) | Seeded per-pixel noise (mulberry32, seed 20261019) + one wrapping 3x3 blur, so it tiles. Multiplied over low-chroma plates at 16% (UI-FORMS c.0). Replaces feTurbulence, which sharp cannot rasterize reliably. |
| Plates (stone, mist, the closing field) | CSS gradients in `src/shared/styles/d-object.css` | — | oklch chroma <= 0.03 (brand/outline rule 5). |
| Fonts | copied from staging `refs/fonts/candidates/` (Google Fonts woff2, latin subsets) | `apps/landing/public/fonts/HedvigLettersSerif-Regular-latin.woff2` (34,796 B), `Inter-Variable-latin.woff2` (73,016 B), `FragmentMono-Regular-latin.woff2` (15,176 B) | All SIL OFL 1.1: `HedvigLettersSerif-OFL.txt`, `FragmentMono-OFL.txt`, `Inter-LICENSE.txt`. Hedvig Letters Serif stands in for ABC Arizona Mix (commercial); swap `--font-display` in `app.css` (subpages) and `src/home/system.css` (the v5 home) when licensed. |

## v5 (2026-10-20)

Tools T1–T7 of staging `production/v5/BRIEF.md` §5; proof folders in staging `v5/tools/<tool>/` (NOTES.md there).
Paths outside this repo come from the environment: `MOSOO_STAGING` (the redesign staging folder), `MOSOO_MAIN`
(a checkout of the mosoo main repo).

| Asset | Pipeline | Output | Provenance |
| --- | --- | --- | --- |
| Colour fields + film grain (T1) | `node apps/landing/scripts/assets/fields.mjs` | `public/landing/v5/fields/*`, `src/home/v5-fields.css` (generated) | ElevenLabs frosted cards (three layers, overlay grain); v4d closing plate rebuilt; Apollo underlays. |
| Line fields (T2) | `node apps/landing/scripts/assets/linefield.mjs` | `public/landing/v5/lines/{hero,hero-mobile,card-narrow,card-wide}.svg` from `params.json`; runtime `src/effects/v5/linefield.ts` | Mintlify card "Waves" maths (staging `refs/mintlify/v5/STUDY.md` §2.3), pinch window §3.2. |
| Thin-line figures (T3) | `node apps/landing/scripts/assets/linefig.mjs` | `public/landing/v5/figures/*.svg` (5 parts x 2 metaphors x 202 / 160) | ElevenLabs "Safety, built in" drawing grammar, rebuilt and checked against the originals. |
| Kit glyphs (T4) | `MOSOO_MAIN=… node apps/landing/scripts/assets/kit-glyphs.mjs` | `src/home/kit/glyphs.ts` | @lobehub/icons-static-svg 1.94.0 and @hugeicons/core-free-icons 4.2.3 (MIT) from bun's cache (`BUN_INSTALL_CACHE_DIR`, default `~/.bun/install/cache`), MAIN `docs/design/assets/sidebar-icons`. The glyph step of staging `v5/tools/kit/build.ts`, same bytes. |
| Footer brand (T5) | `node apps/landing/scripts/assets/brand-v5.mjs --ts apps/landing/src/shared/ui/brand-v5.generated.ts` | `public/brand/v5/*.svg`, `src/shared/ui/brand-v5.generated.ts` (path data the home inlines: nav lockup, footer mark and letters) | Parsed from `public/brand/logo-wordmark-onlight.svg`; Intent's footer reveal. |
| Runtime glyphs (T7) | `MOSOO_STAGING=… MOSOO_MAIN=… node apps/landing/scripts/assets/runtime-glyphs.mjs` | `src/home/runtime-glyphs.ts` | @lobehub/icons-static-svg (MIT, a landing dependency) mono files, Pi from the staging copy of 1.94.0; port of v4c's pipeline (redesign/v4c 69d1c01), same bytes. Footer Harnesses column: 12px ink glyphs on 20px lime tiles (Dub variant C). |

`lib.mjs` holds the shared helpers (seeded PRNG, OKLCH, sharp from the repo's
own `node_modules`; no new dependency).
