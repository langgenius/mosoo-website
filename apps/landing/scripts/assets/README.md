# Landing assets (d-object)

Deterministic pipelines for every asset the home page draws. Run from the
repo root; outputs are committed.

| Asset | Pipeline | Output | Provenance |
| --- | --- | --- | --- |
| Logo outline (window, line, nested three, portal mask, FAQ indicator) | `node apps/landing/scripts/assets/outline.mjs` | `apps/landing/public/brand/outline/*.svg`, `apps/landing/src/shared/ui/outline-paths.generated.ts` | Port of the staging study `brand/outline/src/gen.mjs` (2026-10-19). Geometry read off `public/brand/logo-mark.svg`: block 51.51 x 40.96 with sides concave by 1.47, gap 3.63, bar 6.93. The bar becomes a 1px line. |
| Grain tile | `node apps/landing/scripts/assets/grain.mjs` | `apps/landing/public/landing/grain.webp` (256 px, grayscale) | Seeded per-pixel noise (mulberry32, seed 20261019) + one wrapping 3x3 blur, so it tiles. Multiplied over low-chroma plates at 16% (UI-FORMS c.0). Replaces feTurbulence, which sharp cannot rasterize reliably. |
| Plates (stone, mist, the closing field) | CSS gradients in `src/shared/styles/d-object.css` | — | oklch chroma <= 0.03 (brand/outline rule 5). |
| Fonts | copied from staging `refs/fonts/candidates/` (Google Fonts woff2, latin subsets) | `apps/landing/public/fonts/HedvigLettersSerif-Regular-latin.woff2` (34,796 B), `Inter-Variable-latin.woff2` (73,016 B), `FragmentMono-Regular-latin.woff2` (15,176 B) | All SIL OFL 1.1: `HedvigLettersSerif-OFL.txt`, `FragmentMono-OFL.txt`, `Inter-LICENSE.txt`. Hedvig Letters Serif stands in for ABC Arizona Mix (commercial); swap `--font-display` in `app.css` when licensed. |

`lib.mjs` holds the shared helpers (seeded PRNG, OKLCH, sharp from the repo's
own `node_modules`; no new dependency).
