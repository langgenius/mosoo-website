# Bamboo kit: asset manifest

> 2026-10-19 (d-object redesign): the owner dropped the bamboo motif. The
> generated files under `apps/landing/public/landing/bamboo/` are deleted from
> the site; their rows below are history, and `generate.mjs` can still rebuild
> them into a scratch folder with `--out`. The site's brand play now goes
> through the logo outline (`apps/landing/scripts/assets/README.md`).
>
> 2026-10-21 (#143): Literata is deleted too (its four files, its licence and
> `literata.css`): no page ever imported it. Its rows, Fonts and Usage below are
> history; `font-metrics.mjs` still fits a fallback for any face.

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
  dependencies, no network calls and no browser. A full run took 5.1 s (Node 25.9,
  Apple silicon).
- Deterministic: a fresh render matches the committed files byte for byte (SHA-256
  compared, 2026-10-19). Every random choice comes from a seeded generator, and the narrow
  renders re-screen the same design space rather than resampling the wide ones.
- Fonts are not regenerated; they are downloaded files, recorded with source URLs
  and hashes below. `font-metrics.mjs` re-derives the fallback metrics in
  `literata.css`.

## Checks

`tests/brand-assets.test.mjs` runs with `npm run test:seo`, so `npm run validate` covers it:

- The bamboo folder adds no Tailwind utilities. Tailwind's automatic source detection
  scans `apps/landing/public`, so a word in a generated SVG that names a utility
  becomes CSS on every page: the sprite's comment once said "ring" and emitted `.ring`.
  The test compiles Tailwind with only this folder's candidates. With the folder, the
  landing build's CSS is byte-identical to main's (SHA-1 `1b73c837…`, 2026-10-19).
- (Until 2026-10-21, with Literata: the zh and ja Literata stacks left U+00B7 and
  the quotes, dashes, ellipsis and U+2027 to the CJK serif faces, and every kit
  file had a row below with its current byte count. Both checks left with the
  files.)
- The stage plates carry no lime, and the pixel plate's accent overlay is lime only.

## Files

| Path | Bytes | Size | Origin | Licence | Intended use |
|---|---:|---|---|---|---|
| `apps/landing/public/fonts/Literata-Variable-latin.woff2` | 85,780 | variable | Google Fonts, see Fonts | OFL-1.1 | Literata roman, Latin subset |
| `apps/landing/public/fonts/Literata-Variable-latin-ext.woff2` | 70,736 | variable | Google Fonts | OFL-1.1 | Literata roman, Latin-ext subset (loads only when such characters appear) |
| `apps/landing/public/fonts/Literata-Italic-Variable-latin.woff2` | 88,632 | variable | Google Fonts | OFL-1.1 | Literata italic, Latin |
| `apps/landing/public/fonts/Literata-Italic-Variable-latin-ext.woff2` | 71,628 | variable | Google Fonts | OFL-1.1 | Literata italic, Latin-ext |
| `apps/landing/public/fonts/Literata-LICENSE.txt` | 4,389 | text | google/fonts `ofl/literata/OFL.txt` | OFL-1.1 | Licence text shipped next to the fonts (repo convention, like `HankenGrotesk-OFL.txt`) |
| `apps/landing/src/shared/styles/literata.css` | 7,255 | text | hand-written; metric values from `font-metrics.mjs` | repository | `@font-face` rules ("Literata", and "Literata Latin" for CJK pages), metric-matched Georgia fallbacks, `--font-literata*` stacks. Not imported anywhere yet |
| `apps/landing/public/landing/bamboo/bamboo-plate-paper-2400.png` | 46,429 | 2400 x 1500 | `generate.mjs` job `plate-paper` | repository (original) | (a) v2a hero product-stage plate, desktop and 2x |
| `apps/landing/public/landing/bamboo/bamboo-plate-paper-1200.png` | 14,380 | 1200 x 750 | `generate.mjs` job `plate-paper` | repository (original) | (a) same scene, re-screened for phones and 1x |
| `apps/landing/public/landing/bamboo/bamboo-landscape-2880.png` | 52,002 | 2880 x 800 | `generate.mjs` job `landscape` | repository (original) | (b) footer landscape (#127), 2x desktops and 1x screens wider than 1440 CSS px |
| `apps/landing/public/landing/bamboo/bamboo-landscape-1440.png` | 21,412 | 1440 x 400 | `generate.mjs` job `landscape` | repository (original) | (b) the same landscape re-screened at half scale, 1x desktops up to 1440 CSS px |
| `apps/landing/public/landing/bamboo/bamboo-landscape-1200.png` | 18,124 | 1200 x 600 | `generate.mjs` job `landscape` | repository (original) | (b) footer landscape, narrow screens (crop of the same landscape, x >= 1280) |
| `apps/landing/public/landing/bamboo/bamboo-culm.svg` | 2,112 | sprite | `generate.mjs` job `symbols` | repository (original) | (c) culm segment symbols for the Session-as-culm diagram |
| `apps/landing/public/landing/bamboo/bamboo-plate-pixel-2400.png` | 12,587 | 2400 x 1500 | `generate.mjs` job `plate-pixel` | repository (original) | (d) v2c product-stage plate, desktop and 2x. No lime |
| `apps/landing/public/landing/bamboo/bamboo-plate-pixel-1200.png` | 5,430 | 1200 x 750 | `generate.mjs` job `plate-pixel` | repository (original) | (d) same, phones and 1x. No lime |
| `apps/landing/public/landing/bamboo/bamboo-plate-pixel-accent-2400.png` | 569 | 2400 x 1500 | `generate.mjs` job `plate-pixel` | repository (original) | (d) optional overlay: the one lime node ring, on the 2400 plate's pixel grid |
| `apps/landing/public/landing/bamboo/bamboo-plate-pixel-accent-1200.png` | 237 | 1200 x 750 | `generate.mjs` job `plate-pixel` | repository (original) | (d) optional overlay for the 1200 plate |
| `apps/landing/public/landing/bamboo/bamboo-contours.svg` | 8,810 | 1600 x 1000 viewBox | `generate.mjs` job `contours` | repository (original) | Optional contour overlay (#98) for the plate or a quiet section |
| `scripts/brand-assets/generate.mjs` | 5,469 | | | repository | CLI: renders every generated asset |
| `scripts/brand-assets/bamboo.mjs` | 24,707 | | | repository | Mark geometry, culm and leaf painters, the two scenes and the grove band |
| `scripts/brand-assets/raster.mjs` | 13,547 | | | repository | Tone fields, halftone and Bayer screens, indexed PNG encoder |
| `scripts/brand-assets/symbols.mjs` | 3,186 | | | repository | Culm sprite writer |
| `scripts/brand-assets/contours.mjs` | 5,338 | | | repository | Contour overlay (marching squares, RDP, Catmull-Rom) |
| `scripts/brand-assets/font-metrics.mjs` | 6,655 | | | repository | Font inspector and fallback-metric calculator |
| `scripts/brand-assets/MANIFEST.md` | | | | repository | This file |
| `tests/brand-assets.test.mjs` | 5,434 | | | repository | The checks above |

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
- Two families over the same four files. "Literata" uses Google's unicode-ranges,
  which include U+0000-00FF and U+2000-206F. "Literata Latin" drops U+00B7 and
  U+2000-206F (and U+2020 from Latin-ext), and its Georgia fallback is restricted the
  same way. The zh and ja stacks start with "Literata Latin", so Latin words in a CJK
  heading are Literata while “ ” ‘ ’ … · ‧ — come from Songti or Mincho at full width.
  Measured in Chrome (`CSS.getPlatformFontsForNode`, macOS, 2026-10-19): with the old
  stack, zh “ ” …… · —— ‘ ’ and ja “ ” …… · —— rendered in Literata; now they render in
  Songti SC and Hiragino Mincho ProN, "mosoo" stays Literata, and en is unchanged. The
  browser fetches each file once for both families.

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
ring. Internodes are stretched to 3.2 to 5.2 widths, short near the base. The
favicon `logo-mark.svg` uses a tighter gap (0.0705) and a heavier ring (0.1345); the
kit follows the lockup. The thin culms of the footer's grove band (21 to 30 design
units wide) open their gaps to at least 4 and their rings to at least 2.5 design
units, an optical correction like the favicon's, so the nodes survive the screen.

**Screens.**
- Halftone (a, b): amplitude-modulated round dots on a pixel-periodic 45 degree
  lattice. Dot centres sit at (p, p) and (-p, p), giving a cell of p times the square
  root of 2. Each pixel is inked against its own local tone, so sharp edges cut
  through dots as on a printed plate.
- Below the smallest printable dot (radius 1.1 px), cells drop out stochastically
  instead of all at one threshold, so mists thin out like stipple.
- Tone is quantised to 48 levels and dot edges to 3 alpha steps (2 on the 2880 and
  1200 landscapes, see Format). The result is an indexed PNG with a transparent
  background and the sage ink `#6d786a`.
- The lime accent is a second plate: dots on a 0 degree screen in one opaque step,
  with the sage ink knocked out underneath.
- Pixel (d): an 8x8 Bayer ordered dither on square pixels. Flat tints sit exactly on
  the grey steps, so only gradients dither.

**Parameters.**

| Asset | Scene and parameters |
|---|---|
| plate-paper 2400 / 1200 | `grovePlate({ seed: 7, calm: 0.55 })`. Tones: mist 0.034, far 0.09, mid 0.17, near 0.27, leaves 0.25. Far culms blurred 2.5 px and mid culms 1 px (per 1600 design px); centre lightened for the shell. Halftone pitch 8 / 6 px (cell 11.3 / 8.5 px), 3 steps. No lime. |
| landscape 2880 / 1440 / 1200 | `bambooLandscape({ seed: 23 })`, design space 2880 x 800. Four ridges with crown-scalloped crests, each densest at its crest and fading into mist. On the nearest ridge, a grove band between x 250 and 2560 (layout seed `23 * 53 + 7`, one generator per culm): 8 clumps, 33 culms (3 to 5 per clump, 21 to 30 units wide, tone 0.35 to 0.42) fanning out and rising 72 to 218 units above the crest, each with a light leaf tip and sprays from two or three upper nodes (leaf groups up to 100 units, tone 0.45 to 0.52), the leaf mass cut out of the ridge behind it by a paper keyline (its alpha blurred 3 units), all dissolving to 35% over the 230 units below the crest. Five framing culms. Everything thins into paper toward the top. Pitch follows scale (8 k): 2880 at pitch 8 with 2 steps; 1440 is the whole design space at k 0.5, pitch 4, 3 steps; 1200 is the window x >= 1280 at k 0.75, pitch 6, 2 steps. Lime: one ring of the right-edge culm at 66% height. |
| plate-pixel 2400 / 1200 | Same grove (`seed: 7`, `calm: 0`) with tones on the grey steps: far 1/3, mid and leaves 2/3, near 1, mist up to 0.3. Pixel 8 / 6 px. Greys `#ebebeb #d6d6d6 #b8b8b8` (console ink-100/200/300). No lime. The accent overlays hold one ring of the right-edge culm about a third of the way down, dithered on the same pixel grid (`ordered: false`), as a 1-bit PNG. |
| contours | `contourOverlay({ seed: 7, levels: 9 })`. Isolines of `fbm(x/620, y/420) * 0.55 + 1.1 * y/H` on a 10 px grid, simplified (RDP 0.25 cells), Catmull-Rom smoothed. Stroke `#6d786a`, 1 px non-scaling. |
| culm sprite | Symbols `culm-segment` (viewBox 100 x 110.44: internode, gap, ring, trailing gap), `culm-segment-reclaimed` (dashed), `culm-internode` and `culm-internode-reclaimed` (100 x 100, `preserveAspectRatio="none"`), `culm-ring` (100 x 10.05). |

**Lime audit** (counted from the decoded PNGs, 2026-10-19):

| File | Lime px | Bounding box |
|---|---:|---|
| plate-paper 2400 / 1200 | 0 | |
| plate-pixel 2400 / 1200 | 0 | |
| plate-pixel-accent-2400 | 2,304 | 144 x 16 at (2224, 696) |
| plate-pixel-accent-1200 | 792 | 66 x 12 at (1116, 348) |
| landscape-2880 | 713 | 92 x 11 at (2788, 517), one ring |
| landscape-1440 | 184 | 46 x 5 at (1394, 259), one ring |
| landscape-1200 | 391 | 69 x 8 at (1131, 388), one ring |

The pixel plate with its overlay stacked decodes to exactly the earlier plate that had
the ring painted in (0 differing bytes at 2400 and 1200, compared on a canvas in Chrome).

**Footer at each screen** (Chrome, the markup in Usage (b), 2026-10-19). The browser
picks the 1440 file on 1x screens up to 1440 CSS px, so the screen is shown at 1:1
there; before, 1x desktops got the 2880 file at 0.5 (1440 px) or 0.44 (1280 px),
which clumped the dots into moiré bands.

| Viewport | File | Device px per file px |
|---|---|---:|
| 1440 at 1x | 1440 | 1 |
| 1280 at 1x | 1440 | 0.89 |
| 1024 at 1x | 1440 | 0.71 |
| 1920 at 1x | 2880 | 0.67 |
| 1440 at 2x | 2880 | 1 |
| 390 at 2x | 1200 | 0.67 |
| 390 at 3x | 1200 | 1 |

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
- The grove band took the 2880 landscape from 37,470 B to 69,341 B at 3 steps. Two
  steps bring it to 58,432 B with no visible difference at 1:1, and a one-step lime
  plate (the palette then fits in 2 bits) to 52,002 B. The 1440 file keeps 3 steps:
  with 2, its pitch-4 dots turn into a pixel checkerboard at 1x (17,470 B against
  21,427 B). Tone levels barely matter (48 to 16 levels: 69,341 to 65,121 B).

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
glyphs and CJK punctuation fall through to platform serif faces. In Vite, link the raw file as
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
  <img src="/landing/bamboo/bamboo-landscape-2880.png"
       srcset="/landing/bamboo/bamboo-landscape-1440.png 1440w, /landing/bamboo/bamboo-landscape-2880.png 2880w"
       sizes="100vw" width="2880" height="800" alt="" loading="lazy" decoding="async">
</picture>
```

```css
footer picture img { display: block; width: 100%; height: clamp(200px, 26vw, 400px); object-fit: cover; object-position: 50% 100%; }
```

`sizes="100vw"` holds because the image spans the viewport. Between the framing culms
the top 27% of the file is bare paper; the far ridge's light stipple runs from there,
and the grove band starts at 42% of the height. A large wordmark may overlap the upper
third.

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
default; srcset keeps pixels at about 3 to 4 CSS px. The plate has no lime, because
the stage already carries the page's accent (the primary button and the product's
own lime). Where a direction wants the node ring lit, for example at the moment a
turn commits, stack the overlay as a second image with the same `srcset` descriptors,
`sizes` and CSS, so both resolve to the same width and pixel grid:

```html
<img class="accent" src="/landing/bamboo/bamboo-plate-pixel-accent-2400.png"
     srcset="/landing/bamboo/bamboo-plate-pixel-accent-1200.png 1200w, /landing/bamboo/bamboo-plate-pixel-accent-2400.png 2400w"
     sizes="(max-width: 768px) calc(100vw - 32px), 56vw" width="2400" height="1500" alt="" decoding="async">
```

Keep it to one lime accent per viewport: show the overlay only where nothing else in
view is lime.

**Contour overlay (optional).** Use it either as an image or as a token-coloured
mask:

```html
<img src="/landing/bamboo/bamboo-contours.svg" alt="" style="position:absolute; inset:0; width:100%; height:100%; object-fit:cover; opacity:.35">
```

```css
.contours { mask: url(/landing/bamboo/bamboo-contours.svg) center / cover; background: var(--ink-300); }
```

## Known gaps

- No dark-mode variants. Every raster is sage ink meant for light paper.
- The footer's 1x renders cover up to 1440 CSS px; wider 1x screens get the 2880 file
  at 0.5 to 1 (0.67 at 1920, checked: no banding). Phones at 2x get the 1200 crop at
  0.67, as before.
- The accent overlay lines up with the plate only when both images resolve to the same
  `srcset` candidate (they do with identical descriptors and `sizes`; Chrome, 1440 at
  1x and 2x, 390 at 2x). The 1200 and 2400 renders use different pixel grids.
- "Literata Latin" leaves only U+00B7 and U+2000-206F to the CJK faces. Other Latin-1
  signs that CJK fonts set at full width (× ° ± §) still come from Literata in zh and
  ja headings.
- The Literata fallback overrides are computed for the default instance
  (opsz 12, wght 400); display sizes run slightly narrower. `local("Georgia")` is
  missing on Android and Linux, where the generic serif fallback has no overrides.
- Weights below 400 are not shipped (see Fonts).
- No AVIF or WebP (measured above); a later build-step encoder could revisit this.
- The Session-as-culm semantics (which ring is "committed", where the reclaimed
  interval sits) belong to the page. The sprite gives shapes, not a diagram.
