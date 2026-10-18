# Bamboo kit: asset manifest

Shared brand ingredients for the v2 redesign directions: a self-hosted Literata,
and code-generated bamboo assets drawn from the mosoo mark's node geometry. No page
references them yet; each direction opts in.

Every file the kit adds is listed below with its size, origin and licence. An asset
that is not in this manifest must not appear on a page.

## Regenerate

```sh
node scripts/brand-assets/generate.mjs                     # all assets -> apps/landing/public/landing/bamboo/
node scripts/brand-assets/generate.mjs --only landscape    # plate-paper | landscape | plate-pixel | contours | symbols
node scripts/brand-assets/generate.mjs --out /tmp/check    # render elsewhere to compare
```

- Toolchain: Node >= 22.12 (uses `zlib.deflateSync` and `zlib.crc32`). There are no
  dependencies, no network calls and no browser. A full run took 4.2 s (Node 25.9,
  Apple silicon).
- Deterministic: a fresh render matches the committed files byte for byte (SHA-256
  compared, 2026-10-19). Every random choice comes from a seeded generator, and the narrow
  renders re-screen the same design space rather than resampling the wide ones.
- Fonts are not regenerated; they are downloaded files, recorded with source URLs
  and hashes below. `font-metrics.mjs` re-derives the fallback metrics in
  `literata.css`.

## Files

| Path | Bytes | Size | Origin | Licence | Intended use |
|---|---:|---|---|---|---|
| `apps/landing/public/fonts/Literata-Variable-latin.woff2` | 85,780 | variable | Google Fonts, see Fonts | OFL-1.1 | Literata roman, Latin subset |
| `apps/landing/public/fonts/Literata-Variable-latin-ext.woff2` | 70,736 | variable | Google Fonts | OFL-1.1 | Literata roman, Latin-ext subset (loads only when such characters appear) |
| `apps/landing/public/fonts/Literata-Italic-Variable-latin.woff2` | 88,632 | variable | Google Fonts | OFL-1.1 | Literata italic, Latin |
| `apps/landing/public/fonts/Literata-Italic-Variable-latin-ext.woff2` | 71,628 | variable | Google Fonts | OFL-1.1 | Literata italic, Latin-ext |
| `apps/landing/public/fonts/Literata-LICENSE.txt` | 4,389 | text | google/fonts `ofl/literata/OFL.txt` | OFL-1.1 | Licence text shipped next to the fonts (repo convention, like `Inter-LICENSE.txt`) |
| `apps/landing/src/shared/styles/literata.css` | 3,957 | text | hand-written; metric values from `font-metrics.mjs` | repository | `@font-face` rules, metric-matched Georgia fallback, `--font-literata*` stacks. Not imported anywhere yet |
| `apps/landing/public/landing/bamboo/bamboo-plate-paper-2400.png` | 46,429 | 2400 x 1500 | `generate.mjs` job `plate-paper` | repository (original) | (a) v2a hero product-stage plate, desktop and 2x |
| `apps/landing/public/landing/bamboo/bamboo-plate-paper-1200.png` | 14,380 | 1200 x 750 | `generate.mjs` job `plate-paper` | repository (original) | (a) same scene, re-screened for phones and 1x |
| `apps/landing/public/landing/bamboo/bamboo-landscape-2880.png` | 37,470 | 2880 x 800 | `generate.mjs` job `landscape` | repository (original) | (b) footer landscape (#127), wide screens |
| `apps/landing/public/landing/bamboo/bamboo-landscape-1200.png` | 11,918 | 1200 x 600 | `generate.mjs` job `landscape` | repository (original) | (b) footer landscape, narrow screens (crop of the same landscape, x >= 1280) |
| `apps/landing/public/landing/bamboo/bamboo-culm.svg` | 2,070 | sprite | `generate.mjs` job `symbols` | repository (original) | (c) culm segment symbols for the Session-as-culm diagram |
| `apps/landing/public/landing/bamboo/bamboo-plate-pixel-2400.png` | 17,146 | 2400 x 1500 | `generate.mjs` job `plate-pixel` | repository (original) | (d) v2c product-stage plate, desktop and 2x |
| `apps/landing/public/landing/bamboo/bamboo-plate-pixel-1200.png` | 6,610 | 1200 x 750 | `generate.mjs` job `plate-pixel` | repository (original) | (d) same, phones and 1x |
| `apps/landing/public/landing/bamboo/bamboo-contours.svg` | 8,810 | 1600 x 1000 viewBox | `generate.mjs` job `contours` | repository (original) | Optional contour overlay (#98) for the plate or a quiet section |
| `scripts/brand-assets/generate.mjs` | 4,634 | | | repository | CLI: renders every generated asset |
| `scripts/brand-assets/bamboo.mjs` | 19,056 | | | repository | Mark geometry, culm and leaf painters, the two scenes |
| `scripts/brand-assets/raster.mjs` | 13,547 | | | repository | Tone fields, halftone and Bayer screens, indexed PNG encoder |
| `scripts/brand-assets/symbols.mjs` | 2,749 | | | repository | Culm sprite writer |
| `scripts/brand-assets/contours.mjs` | 5,338 | | | repository | Contour overlay (marching squares, RDP, Catmull-Rom) |
| `scripts/brand-assets/font-metrics.mjs` | 6,655 | | | repository | Font inspector and fallback-metric calculator |
| `scripts/brand-assets/MANIFEST.md` | | | | repository | This file |

"Repository (original)" means the asset was drawn by the scripts above and contains no
third-party material. The culm geometry is the mosoo mark's, so these files are brand
assets: use them for mosoo only. All decorative rasters take `alt=""` in every locale.

## Fonts: provenance

- Family: Literata 3.103 (TypeTogether; `name` table: "Version 3.103;gftools[0.9.29]";
  copyright "2017 The Literata Project Authors"), upstream https://github.com/googlefonts/literata
- Licence: SIL Open Font License 1.1, from
  https://raw.githubusercontent.com/google/fonts/main/ofl/literata/OFL.txt
  (SHA-256 `8742963604cd89dc81437811a850018fc03b2bfad686d7422c8235967c87614e`).
  It declares no Reserved Font Name, so the subset files keep the name "Literata".
- CSS API request (2026-10-19, Chrome 140 user agent):
  `https://fonts.googleapis.com/css2?family=Literata:ital,opsz,wght@0,7..72,400..700;1,7..72,400..700&display=swap`.
  Google serves this as a `wght 400..900` instance with the full `opsz 7..72` axis.
  This was verified by reading the downloaded files' `fvar` table with `font-metrics.mjs`.

| File | Source URL | SHA-256 |
|---|---|---|
| `Literata-Variable-latin.woff2` | https://fonts.gstatic.com/s/literata/v40/or3PQ6P12-iJxAIgLa78DkTtAoDhk0oVpaK3YLanFLHpPf2TbLi4J_HWTEKVt8k.woff2 | `33b49c485e21a38bbfe68de764cc5b329b82c74e6ae4dc0cd9ace5b349da25fe` |
| `Literata-Variable-latin-ext.woff2` | https://fonts.gstatic.com/s/literata/v40/or3PQ6P12-iJxAIgLa78DkTtAoDhk0oVpaK3YLanFLHpPf2TbLi4J__WTEKVt8m1ow.woff2 | `3f1abb33549406163ab6f4984f4a5e2e1199bd59377ecf927da0c7484c7ad43d` |
| `Literata-Italic-Variable-latin.woff2` | https://fonts.gstatic.com/s/literata/v40/or3NQ6P12-iJxAIgLYT1PLs1a-t7PU0AbeE9KPxYzNiCp1OUedn8VrLmTkiSlcuFog.woff2 | `8552d197eb02bdc753fc5355ad317d508b80a65acfa85a0cb58cf91aa2425dd5` |
| `Literata-Italic-Variable-latin-ext.woff2` | https://fonts.gstatic.com/s/literata/v40/or3NQ6P12-iJxAIgLYT1PLs1a-t7PU0AbeE9KPxYzNiCp1OUedn8VrLmQEiSlcuFojBg.woff2 | `4b65b11f69183ab2be9e027314bf3105aab66578bd7dc7df92115a344d1a1a6f` |

- Why 400 to 900: the full 200 to 900 range costs 110,296 B for the Latin roman file
  against 85,780 B, and the v2 directions use regular to bold. The full-range Latin
  file, if a light weight is ever wanted, is
  https://fonts.gstatic.com/s/literata/v40/or3hQ6P12-iJxAIgLYTwJrUXnTPm.woff2.
- Fallback metrics (`node scripts/brand-assets/font-metrics.mjs <woff2> <Georgia.ttf>`).
  Literata: UPM 1000, hhea and typo ascent 1177, descent -308, line gap 0,
  USE_TYPO_METRICS on. Average advance, weighted by English letter frequency with
  17.5% spaces: 476.5 (roman). macOS `Georgia.ttf`: UPM 2048, average 902.0.
  Result for roman: `size-adjust 108.21%`, `ascent-override 108.77%`,
  `descent-override 28.46%`, `line-gap-override 0%`. Italic, against
  `Georgia Italic.ttf`: 99.7%, 118.05%, 30.89%, 0%.

## Generated assets: how they are made

**Geometry from the mark.** The source is `apps/landing/public/brand/brand-mark.svg`,
which has the same proportions as the mark in `logo-wordmark-*.svg`. Per 1 unit of
culm width:

- internode 0.795, with sides pinched by 0.0287 at mid-height along the mark's own
  cubic (control points at 0.634 and 1.0 of the pinch, at 0.145 and 0.317 of the
  height)
- gap 0.1044
- node ring 0.1005

Culms stack gap, ring, gap between internodes, so every node reads as the mark's
ring. Internodes are stretched to 3.4 to 5.2 widths, short near the base. The
favicon `logo-mark.svg` uses a tighter gap (0.0705) and a heavier ring (0.1345); the
kit follows the lockup.

**Screens.**
- Halftone (a, b): amplitude-modulated round dots on a pixel-periodic 45 degree
  lattice. Dot centres sit at (p, p) and (-p, p), giving a cell of p times the square
  root of 2. Each pixel is inked against its own local tone, so sharp edges cut
  through dots as on a printed plate.
- Below the smallest printable dot (radius 1.1 px), cells drop out stochastically
  instead of all at one threshold, so mists thin out like stipple.
- Tone is quantised to 48 levels and dot edges to 3 alpha steps. The result is a
  2-bit indexed PNG with a transparent background and the sage ink `#6d786a`.
- The lime accent is a second plate: dots on a 0 degree screen, with the sage ink
  knocked out underneath.
- Pixel (d): an 8x8 Bayer ordered dither on square pixels. Flat tints sit exactly on
  the grey steps, so only gradients dither.

**Parameters.**

| Asset | Scene and parameters |
|---|---|
| plate-paper 2400 / 1200 | `grovePlate({ seed: 7, calm: 0.55 })`. Tones: mist 0.034, far 0.09, mid 0.17, near 0.27, leaves 0.25. Far culms blurred 2.5 px and mid culms 1 px (per 1600 design px); centre lightened for the shell. Halftone pitch 8 / 6 px (cell 11.3 / 8.5 px), 3 steps. No lime. |
| landscape 2880 / 1200 | `bambooLandscape({ seed: 23 })`, design space 2880 x 800. Four ridges with crown-scalloped crests, each densest at its crest and fading into mist. Five framing culms. Everything thins into paper toward the top. The 1200 file is the window x >= 1280 at 0.75 scale. Pitch 8 / 6. Lime: one ring of the right-edge culm at 66% height (bbox 92 x 11 px in the 2880 file). |
| plate-pixel 2400 / 1200 | Same grove (`seed: 7`, `calm: 0`) with tones on the grey steps: far 1/3, mid and leaves 2/3, near 1, mist up to 0.3. Pixel 8 / 6 px. Greys `#ebebeb #d6d6d6 #b8b8b8` (console ink-100/200/300). Lime: one ring of the right-edge culm (bbox 144 x 16 px in the 2400 file). |
| contours | `contourOverlay({ seed: 7, levels: 9 })`. Isolines of `fbm(x/620, y/420) * 0.55 + 1.1 * y/H` on a 10 px grid, simplified (RDP 0.25 cells), Catmull-Rom smoothed. Stroke `#6d786a`, 1 px non-scaling. |
| culm sprite | Symbols `culm-segment` (viewBox 100 x 110.44: internode, gap, ring, trailing gap), `culm-segment-reclaimed` (dashed), `culm-internode` and `culm-internode-reclaimed` (100 x 100, `preserveAspectRatio="none"`), `culm-ring` (100 x 10.05). |

**Lime audit** (counted from the decoded PNGs): plate-paper 0 px. Landscape 2880:
one ring. Landscape 1200: one ring. Pixel 2400 and 1200: one ring each.

**Format decision, measured.**
- The candidates were Chromium's canvas WebP encoder at quality 1.0 (which is
  lossless) and lossy WebP. Against an indexed PNG of the same plate:
  - plate: WebP lossless 128,460 B against 137,151 B for PNG (6% smaller)
  - landscape: WebP lossless 156,435 B, larger than the PNG's 137,484 B
  - lossy WebP at q 0.9: 2 to 3 times larger than the PNG
- PNG it is, which also keeps a browser out of the generator. (These are first-draft
  scenes.)
- The pixel-periodic lattice and quantised tones came in together with a scene
  rework, which took the draft plate from 137,151 B to 51,705 B. No controlled
  comparison was run.
- Going from 4 alpha steps to 3, on the same final scene, halves the bit depth:
  61,370 B down to 46,466 B, with no visible difference at 1:1.

## Usage

**Fonts.** Opt in per page from its entry: `import "./shared/styles/literata.css";`
next to the existing `import "./shared/styles/app.css";`. Adding it to `app.css` would load it on all
nine landing pages. Preload only where Literata renders above the fold.

```html
<link rel="preload" href="/fonts/Literata-Variable-latin.woff2" as="font" type="font/woff2" crossorigin>
```

```css
.display { font-family: var(--font-literata); font-weight: 400; letter-spacing: -0.015em; }
:lang(zh) .display { font-family: var(--font-literata-zh); }
:lang(ja) .display { font-family: var(--font-literata-ja); }
```

`font-optical-sizing: auto` is the browser default, so opsz follows font-size. CJK
glyphs fall through to platform serif faces. In Vite, link the raw file as
`/src/shared/styles/literata.css?direct` only when testing outside the app bundle.

**(a) Hero plate.** The plate is transparent, so the stage's paper shows through.
Put it behind the product shell only, never behind text.

```html
<figure class="stage">
  <img src="/landing/bamboo/bamboo-plate-paper-2400.png"
       srcset="/landing/bamboo/bamboo-plate-paper-1200.png 1200w, /landing/bamboo/bamboo-plate-paper-2400.png 2400w"
       sizes="(max-width: 768px) calc(100vw - 32px), 56vw"
       width="2400" height="1500" alt="" decoding="async">
  <!-- product shell -->
</figure>
```

```css
.stage { position: relative; aspect-ratio: 16 / 10; border-radius: 20px; overflow: hidden;
         background: var(--paper-100); box-shadow: inset 0 0 0 1px var(--border-default); }
.stage > img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
```

Keep `srcset` so phones get the re-screened 1200 file. Downscaling the 2400 file far
below about 600 CSS px blurs the screen into grey.

**(b) Footer landscape.**

```html
<picture>
  <source media="(max-width: 640px)" srcset="/landing/bamboo/bamboo-landscape-1200.png" width="1200" height="600">
  <img src="/landing/bamboo/bamboo-landscape-2880.png" width="2880" height="800" alt="" loading="lazy" decoding="async">
</picture>
```

```css
footer picture img { display: block; width: 100%; height: clamp(200px, 26vw, 400px); object-fit: cover; object-position: 50% 100%; }
```

The top 40% is empty paper, so a large wordmark may overlap it.

**(c) Culm symbols.** External `<use>` needs the same origin (fine on mosoo.ai, not
from `file://`); otherwise inline the sprite once per page.

```html
<svg width="64" height="71" aria-hidden="true">
  <use href="/landing/bamboo/bamboo-culm.svg#culm-segment" style="--culm-ring: #6fd305"/>
</svg>
<svg width="40" height="160" aria-hidden="true">
  <use href="/landing/bamboo/bamboo-culm.svg#culm-internode-reclaimed" width="40" height="160"/>
</svg>
```

- Colour hooks on `<use>`: `color` (default), `--culm-fill`, `--culm-ring`,
  `--culm-stroke`, `--culm-stroke-width` (1.25px), `--culm-dash` (4px 3px).
- Composing by hand, per width w: gap 0.1044 w, ring 0.1005 w, mark internode
  0.795 w.
- Lime is fill only (1.76:1 on paper). Pair it with the visible label ("committed")
  and never use it for text.
- For a horizontal culm, rotate the group 90 degrees.

**(d) Pixel plate (v2c).** Same markup as (a) with
`bamboo-plate-pixel-{1200,2400}.png` on `#fafafa`. Leave `image-rendering` at its
default; srcset keeps pixels at about 3 to 4 CSS px.

**Contour overlay (optional).** Use it either as an image or as a token-coloured
mask:

```html
<img src="/landing/bamboo/bamboo-contours.svg" alt="" style="position:absolute; inset:0; width:100%; height:100%; object-fit:cover; opacity:.35">
```

```css
.contours { mask: url(/landing/bamboo/bamboo-contours.svg) center / cover; background: var(--ink-300); }
```

## Known gaps

- Footer landscape has no leaves. Sprays tested in front of the ridges lost their
  outline, and over open sky the upward mist erased them. The bamboo reads through
  the framing culms' nodes. A fuller grove would need its own composition pass.
- No dark-mode variants. Every raster is sage ink meant for light paper.
- The Literata fallback overrides are computed for the default instance
  (opsz 12, wght 400); display sizes run slightly narrower. `local("Georgia")` is
  missing on Android and Linux, where the generic serif fallback has no overrides.
- Weights below 400 are not shipped (see Fonts).
- No AVIF or WebP (measured above); a later build-step encoder could revisit this.
- The Session-as-culm semantics (which ring is "committed", where the reclaimed
  interval sits) belong to the page. The sprite gives shapes, not a diagram.
