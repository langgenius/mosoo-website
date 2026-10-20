// T1 colour-field generator v2: directional colour fields + one shared film-grain tile, for the v5 home.
// Run (repo root): node apps/landing/scripts/assets/fields.mjs
// Writes every file in apps/landing/public/landing/v5/fields/ and apps/landing/src/home/v5-fields.css,
// and prints a JSON report (sizes, bytes, tile statistics, compensated colours) on stdout.
// Deterministic: seeded mulberry32 noise; the same inputs give the same bytes.
//
// Reverse-engineered from the ElevenLabs bento "frosted" cards (staging refs/elevenlabs/v5/STUDY.md §1):
//   1. field: a smooth, directional streak bitmap made in OKLCH; no grain baked in;
//   2. grain: one 256 px tile shared by every field: black RGB + Gaussian alpha (mean .403, sd .169,
//      lag-1 ~.11, lag-2 ~-.16), drawn with mix-blend-mode overlay, 1 texel = 1 device pixel
//      (256 px tile at 1x, 128 px at 2x, image-rendering pixelated);
//   3. scrim: optional 16-stop black gradient, only under white text.
// Overlay with a black source of alpha a gives, per sRGB channel, c' = c - a * min(c, 1 - c): white stays
// white, mid tones darken most. Every bitmap here is pre-compensated for the grain opacity its CSS class
// uses, so the displayed mean equals the designed colour (that is also how the lime section keeps its mean
// equal to --accent under grain).
// Ported from refs/elevenlabs/v5/scripts/grain-proto.mjs (our own study code, 2026-10-20): mulberry32 noise
// tile, OKLCH light ramp along a light direction, streaks across a streak direction. New here: the band-pass
// that matches the reference tile's autocorrelation, AVIF/PNG made pixel-identical, anisotropic streak noise,
// CSS radial-gradient layers (to regenerate the v4d closing field), domain-warped strips (Apollo underlay),
// grain compensation, and the generated CSS.
// The v4d paper grain (grain.mjs -> /landing/grain.webp, multiply .14) stays as the second tier: the
// `.v5-field--paper` modifier swaps the layer, and `grain: { tier: "paper" }` compensates for it.
// Formats: fields are lossless WebP (lossy WebP/AVIF put blotchy contours of up to 7 levels into these shallow
// gradients); smooth plates are stored at 0.5x and strips at 1x, and every export is checked against a 2x
// raster (upscaleErrorVs2x in the report; > 2 levels prints a warning). Noise tile: AVIF + an identical PNG.

import { mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { LANDING, oklchToOklab, rng, sharp, tileNoise } from "./lib.mjs";

const OUT = join(LANDING, "public", "landing", "v5", "fields");
const CSS_OUT = join(LANDING, "src", "home", "v5-fields.css");
const URL = "/landing/v5/fields";
const PAPER_TILE = join(LANDING, "public", "landing", "grain.webp");
const PAPER_URL = "/landing/grain.webp";
const PAPER_OPACITY = 0.14; // d-object.css .d-grain::before
const MOBILE = "(max-width: 720px)"; // the v4d phone breakpoint (d-object.css)

// ------------------------------------------------------------------------------------------- the spec
// Colours are what the reader sees (after grain). OKLCH stops are [t, L, C, h].
const LIGHT_DEG = 125; // one light for the page: from the upper left (0 = from the right, 90 = from the top)
const STREAK = { deg: 132, along: 380, across: 64, octaves: 2 }; // light-beam streaks, CSS px

const NOISE = {
  size: 256,
  seed: 20261020,
  mean: 103, // alpha levels: the reference tile measured mean .403, sd .169 (p5 33 / p50 102 / p95 175)
  sd: 43.1,
  // Separable 5-tap kernel [-p, q, 1, q, -p] (circular): reproduces the reference lag-1 .10-.12 and
  // lag-2 -.16/-.17 (a slightly crisp, band-passed grain rather than pure white noise). Fitted after the
  // AVIF round trip, which smooths a little (q 30: 17.5 KB; q 40 costs 4 KB more for no visible change).
  bandpass: { p: 0.087, q: 0.054 },
  avif: { quality: 30, effort: 9 },
};

const FIELDS = [
  {
    // Hero plate that later pins as the stage: v4d mist family pushed into mid tones so the grain reads,
    // light from the upper left, faint beams; most of the area stays light (shape > 1).
    cls: "hero",
    kind: "ramp",
    shape: 1.2,
    stops: [
      [0.0, 0.958, 0.008, 228],
      [0.3, 0.928, 0.013, 236],
      [0.56, 0.878, 0.02, 246],
      [0.8, 0.8, 0.029, 256],
      [1.0, 0.7, 0.036, 264],
    ],
    streaks: { ...STREAK, amp: 0.1, seed: 7 }, // amp in ramp units (t)
    blur: 5,
    grain: { tier: "film", opacity: 0.8 },
    sizes: [
      { css: [1120, 520], scale: 0.5 },
      { css: [358, 460], scale: 0.5, media: MOBILE },
    ],
  },
  {
    // The v4d closing field (d-object.css .d-plate-field, approved by the owner at 9e92312): #eeece8 with a
    // mist-b layer top left and a clay layer bottom right, composited like the browser does (sRGB,
    // premultiplied); then the page light and faint beams added in OKLab L.
    cls: "closing",
    kind: "layers",
    base: "#eeece8",
    layers: [
      // CSS order (first = on top): radial-gradient(<size> at <at>, <color> 0%, transparent <fade>)
      { size: [0.6, 0.8], at: [0.12, 0.18], oklch: [0.865, 0.022, 250], fade: 0.7 }, // --d-mist-b
      { size: [0.55, 0.75], at: [0.88, 0.82], oklch: [0.915, 0.028, 60], fade: 0.7 }, // --d-clay
    ],
    // The v4d paper grain (multiply .14 over grain.webp, mean .8123) darkened the plate by this factor; the
    // regenerated field keeps that displayed tone (checked against the tile at run time).
    tone: 0.9737,
    light: { amp: 0.012 }, // OKLab L: +amp at the lit corner, -amp at the far corner (the composition stays)
    streaks: { ...STREAK, amp: 0.01, seed: 7 }, // amp in OKLab L
    blur: 5,
    grain: { tier: "film", opacity: 1 },
    sizes: [
      { css: [1120, 480], scale: 0.5 },
      // 390: the plate is the content width (342) and 468 tall with the closing's placeholders (staging
      // v5/sections/faq-closing/NOTES.md §2), so cover keeps the bitmap at 1:1 there.
      { css: [342, 472], scale: 0.5, media: MOBILE },
    ],
  },
  {
    // Underlay strips (Apollo's lit-element underlay, our colours): lime end, then a fluid run through the
    // tint and a pale mint to a cool mist end. All three are cut from one domain-warped noise field.
    cls: "underlay",
    kind: "fluid",
    stops: [
      [0.0, 0.9107, 0.1772, 129.2], // --accent #BCF870
      [0.28, 0.9107, 0.1772, 129.2],
      [0.46, 0.9587, 0.1015, 127.7], // --accent-tint #DEFFB5
      [0.64, 0.95, 0.06, 168],
      [0.82, 0.935, 0.034, 214],
      [1.0, 0.925, 0.028, 236],
    ],
    fluid: { scale: 92, octaves: 3, warp: 1.6, amount: 0.2, seed: 11 },
    blur: 2,
    grain: { tier: "film", opacity: 0.5 },
    size: "100% 100%",
    variants: [
      { id: "a", css: [640, 40], scale: 1, offset: [0, 0], limeAt: "end" },
      { id: "b", css: [640, 120], scale: 1, offset: [410, 260], limeAt: "start" },
      { id: "c", css: [360, 120], scale: 1, offset: [930, 120], limeAt: "end" },
    ],
  },
  {
    // The full-screen lime section: no bitmap, a very light grain; the base is compensated so the mean
    // the reader sees equals --accent.
    cls: "lime",
    kind: "flat",
    color: "#bcf870",
    grain: { tier: "film", opacity: 0.2 },
  },
  {
    // The spec screen's ground (sections/spec.ts, the window the portal opens; v5 fix round 2026-10-20, staging
    // REVIEW-v5.md §6-5 and v5/review/graft-design.md P1-1): the hero ramp's light, shape, beams, blur and film
    // grain with the chroma taken out, so the lime screen is again the page's one large colour, and lighter (L
    // .980 -> .855; the hero runs .958 -> .70), so the lit corner sits near the frame (#f4f4f4) and the paper and
    // the door reads by its 1px ink outline. Not flat --frame (graft-design mock A: the light and the beams go)
    // and not the hero bitmap greyed (mock B: a dark grey far corner). Chosen from four T1 candidates (staging
    // v5/polish/spec/NOTES.md §1). Desktop: the live window is a full screen (1440 x 900 here, cover keeps the lit
    // corner at other sizes), and the still plate is 1120 wide; phones: the plate is the content width.
    cls: "spec",
    kind: "ramp",
    shape: 1.2,
    stops: [
      [0.0, 0.98, 0, 250],
      [0.3, 0.963, 0, 250],
      [0.56, 0.938, 0, 250],
      [0.8, 0.903, 0, 250],
      [1.0, 0.855, 0, 250],
    ],
    streaks: { ...STREAK, amp: 0.1, seed: 7 },
    blur: 5,
    grain: { tier: "film", opacity: 0.9 },
    sizes: [
      { css: [1440, 900], scale: 0.5 },
      { css: [358, 720], scale: 0.5, media: MOBILE },
    ],
  },
];

// ------------------------------------------------------------------------------------- colour (float)
const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toGamma = (x) => (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(Math.max(0, x), 1 / 2.4) - 0.055);

/** OKLab -> sRGB 0..1 floats, unclamped (matrices as lib.mjs oklabToSrgb). */
function oklabToRgb(L, a, b) {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    toGamma(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    toGamma(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    toGamma(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ];
}

/** sRGB 0..1 -> OKLab. */
function rgbToOklab(r, g, b) {
  const R = toLinear(r), G = toLinear(g), B = toLinear(b);
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

const hexToRgb = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};
const toHex = (rgb) => "#" + rgb.map((v) => Math.round(Math.max(0, Math.min(1, v)) * 255).toString(16).padStart(2, "0")).join("");
const oklchToRgb = ([L, C, h]) => oklabToRgb(...oklchToOklab(L, C, h));

/** Monotone cubic (Fritsch-Carlson) through stops [t, v]; flat runs stay flat, no overshoot. */
function pchip(ts, vs) {
  const n = ts.length, d = [], m = new Array(n).fill(0);
  for (let i = 0; i < n - 1; i++) d.push((vs[i + 1] - vs[i]) / (ts[i + 1] - ts[i]));
  m[0] = d[0];
  m[n - 1] = d[n - 2];
  for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (3 * d[i - 1] * d[i]) / (2 * d[i - 1] + d[i] + Math.max(d[i - 1], d[i]) - Math.min(d[i - 1], d[i]));
  for (let i = 0; i < n - 1; i++) if (d[i] === 0) m[i] = m[i + 1] = 0;
  return (t) => {
    if (t <= ts[0]) return vs[0];
    if (t >= ts[n - 1]) return vs[n - 1];
    let i = 0;
    while (t > ts[i + 1]) i++;
    const h = ts[i + 1] - ts[i], s = (t - ts[i]) / h, s2 = s * s, s3 = s2 * s;
    return (2 * s3 - 3 * s2 + 1) * vs[i] + (s3 - 2 * s2 + s) * h * m[i] + (-2 * s3 + 3 * s2) * vs[i + 1] + (s3 - s2) * h * m[i + 1];
  };
}

/** OKLCH ramp -> t in [0,1] -> OKLab. Hue follows the shorter arc; L, C, h are interpolated monotonically. */
function makeRamp(stops) {
  const ts = stops.map((s) => s[0]);
  const hs = [stops[0][3]];
  for (let i = 1; i < stops.length; i++) {
    let h = stops[i][3];
    while (h - hs[i - 1] > 180) h -= 360;
    while (h - hs[i - 1] < -180) h += 360;
    hs.push(h);
  }
  const L = pchip(ts, stops.map((s) => s[1])), C = pchip(ts, stops.map((s) => s[2])), H = pchip(ts, hs);
  return (t) => oklchToOklab(L(t), C(t), H(t));
}

// --------------------------------------------------------------------------------------------- noise
/** Fractal value noise in [-1, 1] on lib.mjs's wrapping lattice (256 cells: no visible repeat). */
function fbm(seed, octaves) {
  const random = rng(seed);
  const layers = Array.from({ length: octaves }, () => tileNoise(random, 256, 256));
  let norm = 0;
  for (let o = 0; o < octaves; o++) norm += 0.5 ** o;
  return (x, y) => {
    let v = 0;
    for (let o = 0; o < octaves; o++) v += 0.5 ** o * layers[o]((x * 2 ** o) / 256, (y * 2 ** o) / 256);
    return v / norm;
  };
}

/** Streak noise: fbm stretched along `deg` (long features, `along` px) and short across (`across` px). */
function streakNoise({ deg, along, across, octaves, seed }) {
  const n = fbm(seed, octaves);
  const r = (deg * Math.PI) / 180, ux = Math.cos(r), uy = -Math.sin(r); // along-streak unit, y down
  return (x, y) => n((x * ux + y * uy) / along, (-x * uy + y * ux) / across);
}

/** 0 at the lit corner -> 1 at the far corner, for light from `deg` over a w x h box (CSS px). */
function lightT(deg, w, h) {
  const r = (deg * Math.PI) / 180, lx = Math.cos(r), ly = -Math.sin(r);
  const reach = Math.abs(lx) * w / 2 + Math.abs(ly) * h / 2;
  return (x, y) => 0.5 - ((x - w / 2) * lx + (y - h / 2) * ly) / (2 * reach);
}

// ---------------------------------------------------------------------------------------------- grain
/** The grain's mean effect: field value c (sRGB 0..1) -> the mean the reader sees. */
function grainMean(grain, tiles) {
  if (!grain || grain.opacity === 0) return (c) => c;
  if (grain.tier === "paper") return (c) => c * (1 - grain.opacity * (1 - tiles.paperMean));
  const a = grain.opacity * tiles.filmMean;
  return (c) => c - a * Math.min(c, 1 - c);
}

/** Inverse of the grain's mean effect: the field value whose displayed mean is `t` (sRGB 0..1). */
function compensator(grain, tiles) {
  if (!grain || grain.opacity === 0) return (t) => t;
  if (grain.tier === "paper") {
    const f = 1 - grain.opacity * (1 - tiles.paperMean); // multiply: c' = c * (1 - k(1 - g))
    return (t) => Math.min(1, t / f);
  }
  const a = grain.opacity * tiles.filmMean; // overlay, black source: c' = c - a * min(c, 1 - c)
  return (t) => (t <= 0.5 - a / 2 ? t / (1 - a) : (t + a) / (1 + a));
}

// ----------------------------------------------------------------------------------------------- blur
function boxesForGauss(sigma, n = 3) {
  const wIdeal = Math.sqrt((12 * sigma * sigma) / n + 1);
  let wl = Math.floor(wIdeal);
  if (wl % 2 === 0) wl--;
  const wu = wl + 2;
  const mIdeal = (12 * sigma * sigma - n * wl * wl - 4 * n * wl - 3 * n) / (-4 * wl - 4);
  const m = Math.round(mIdeal);
  return Array.from({ length: n }, (_, i) => ((i < m ? wl : wu) - 1) / 2);
}

function boxPass(src, dst, w, h, ch, r, horizontal) {
  const len = horizontal ? w : h, lines = horizontal ? h : w, stride = horizontal ? ch : w * ch, step = horizontal ? w * ch : ch;
  const inv = 1 / (2 * r + 1);
  for (let line = 0; line < lines; line++) {
    for (let c = 0; c < ch; c++) {
      const base = line * step + c, at = (i) => src[base + Math.min(len - 1, Math.max(0, i)) * stride];
      let acc = 0;
      for (let i = -r; i <= r; i++) acc += at(i);
      for (let i = 0; i < len; i++) {
        dst[base + i * stride] = acc * inv;
        acc += at(i + r + 1) - at(i - r);
      }
    }
  }
}

function gaussBlur(buf, w, h, ch, sigma) {
  if (sigma <= 0.3) return buf;
  let a = buf, b = new Float32Array(buf.length);
  for (const r of boxesForGauss(sigma)) {
    boxPass(a, b, w, h, ch, r, true);
    boxPass(b, a, w, h, ch, r, false);
  }
  return a;
}

// --------------------------------------------------------------------------------------- field kinds
/** Returns colour(x, y) -> sRGB 0..1 floats (displayed target, before compensation). x, y in CSS px. */
function painter(spec, w, h, variant = {}) {
  if (spec.kind === "ramp") {
    const ramp = makeRamp(spec.stops), lt = lightT(LIGHT_DEG, w, h), sn = streakNoise(spec.streaks);
    return (x, y) => {
      const t = Math.max(0, Math.min(1, Math.pow(lt(x, y), spec.shape) + spec.streaks.amp * sn(x, y)));
      return oklabToRgb(...ramp(t));
    };
  }
  if (spec.kind === "layers") {
    const base = hexToRgb(spec.base);
    const layers = spec.layers.map((l) => ({ ...l, rgb: oklchToRgb(l.oklch) })).reverse(); // paint bottom first
    const lt = lightT(LIGHT_DEG, w, h), sn = streakNoise(spec.streaks);
    return (x, y) => {
      let c = base;
      for (const l of layers) {
        const d = Math.hypot((x - l.at[0] * w) / (l.size[0] * w), (y - l.at[1] * h) / (l.size[1] * h));
        const a = Math.max(0, Math.min(1, 1 - d / l.fade));
        c = c.map((v, i) => v * (1 - a) + l.rgb[i] * a);
      }
      const [L, A, B] = rgbToOklab(...c.map((v) => v * (spec.tone ?? 1)));
      return oklabToRgb(L + spec.light.amp * (1 - 2 * lt(x, y)) + spec.streaks.amp * sn(x, y), A, B);
    };
  }
  if (spec.kind === "fluid") {
    const ramp = makeRamp(spec.stops), f = spec.fluid;
    const n0 = fbm(f.seed, f.octaves), n1 = fbm(f.seed + 1, f.octaves), n2 = fbm(f.seed + 2, f.octaves);
    const [ox, oy] = variant.offset ?? [0, 0];
    return (x, y) => {
      const X = (x + ox) / f.scale, Y = (y + oy) / f.scale;
      const v = n0(X + f.warp * n1(X, Y), Y + f.warp * n2(X + 5.2, Y + 1.3));
      const p = variant.limeAt === "end" ? 1 - x / w : x / w;
      return oklabToRgb(...ramp(Math.max(0, Math.min(1, p + f.amount * v))));
    };
  }
  throw new Error(`unknown kind ${spec.kind}`);
}

/** The displayed-target field as float sRGB (W x H x 3), blurred, before grain compensation. */
export function rasterize(spec, sz, variant = {}) {
  const [w, h] = sz.css, s = sz.scale, W = Math.round(w * s), H = Math.round(h * s);
  const paint = painter(spec, w, h, variant);
  const px = new Float32Array(W * H * 3);
  for (let j = 0; j < H; j++) {
    for (let i = 0; i < W; i++) {
      const c = paint(((i + 0.5) * w) / W, ((j + 0.5) * h) / H), o = (j * W + i) * 3;
      px[o] = c[0];
      px[o + 1] = c[1];
      px[o + 2] = c[2];
    }
  }
  return { W, H, px: gaussBlur(px, W, H, 3, spec.blur * s) };
}

/**
 * Density check: upsample the exported bitmap the way a browser does (bilinear, pixel centres) to a 2x
 * reference raster and report the error in 8-bit levels. Smooth plates are stored at 0.5x: in Chrome they
 * render within 1 level of a native 2x / 3x bitmap (proof ab/), at a fifth of the bytes.
 */
function upscaleError(spec, sz, variant, comp, out, W, H) {
  const ref = rasterize(spec, { ...sz, scale: 2 }, variant);
  const at = (x, y, c) => out[(Math.min(H - 1, Math.max(0, y)) * W + Math.min(W - 1, Math.max(0, x))) * 3 + c];
  const errs = [];
  let sum = 0;
  for (let j = 0; j < ref.H; j++) {
    const v = ((j + 0.5) * H) / ref.H - 0.5, y0 = Math.floor(v), fy = v - y0;
    for (let i = 0; i < ref.W; i++) {
      const u = ((i + 0.5) * W) / ref.W - 0.5, x0 = Math.floor(u), fx = u - x0;
      for (let c = 0; c < 3; c++) {
        const top = at(x0, y0, c) * (1 - fx) + at(x0 + 1, y0, c) * fx;
        const bottom = at(x0, y0 + 1, c) * (1 - fx) + at(x0 + 1, y0 + 1, c) * fx;
        const want = comp(Math.max(0, Math.min(1, ref.px[(j * ref.W + i) * 3 + c]))) * 255;
        const e = Math.abs(top * (1 - fy) + bottom * fy - want);
        sum += e;
        if ((i + j + c) % 5 === 0) errs.push(e);
      }
    }
  }
  errs.sort((a, b) => a - b);
  return { mean: +(sum / (ref.W * ref.H * 3)).toFixed(3), p999: +errs[Math.floor(errs.length * 0.999)].toFixed(2), max: +errs[errs.length - 1].toFixed(2) };
}

async function renderField(spec, sz, variant, tiles, file) {
  const [w, h] = sz.css;
  const { W, H, px } = rasterize(spec, sz, variant);
  // Displayed-target statistics (before compensation), then compensate and quantise.
  const comp = compensator(spec.grain, tiles);
  const out = Buffer.alloc(W * H * 3);
  const mean = [0, 0, 0], target = [0, 0, 0];
  let Lmin = 1, Lmax = 0, Cmax = 0, clipped = 0;
  for (let k = 0; k < W * H; k++) {
    const t = [px[k * 3], px[k * 3 + 1], px[k * 3 + 2]];
    if (k % 7 === 0) {
      const [L, A, B] = rgbToOklab(...t.map((v) => Math.max(0, Math.min(1, v))));
      Lmin = Math.min(Lmin, L);
      Lmax = Math.max(Lmax, L);
      Cmax = Math.max(Cmax, Math.hypot(A, B));
    }
    for (let c = 0; c < 3; c++) {
      const tv = Math.max(0, Math.min(1, t[c])), v = comp(tv);
      if (v > 1 || t[c] > 1.002 || t[c] < -0.002) clipped++;
      out[k * 3 + c] = Math.round(Math.max(0, Math.min(1, v)) * 255);
      mean[c] += out[k * 3 + c];
      target[c] += tv;
    }
  }
  // Lossless: lossy WebP/AVIF turn these shallow gradients into blotchy contours (up to 7 levels in Chrome,
  // proof ab/); lossless keeps only the 8-bit steps, which the grain dithers.
  await sharp(out, { raw: { width: W, height: H, channels: 3 } })
    .webp({ lossless: true, effort: 6 })
    .toFile(join(OUT, file));
  const upscale = sz.scale < 2 ? upscaleError(spec, sz, variant, comp, out, W, H) : null;
  if (upscale && upscale.max > 2) console.warn(`warning: ${file} upsampled to 2x is off by up to ${upscale.max} levels; raise its scale`);
  return {
    file: `${URL}/${file}`,
    css: [w, h],
    px: [W, H],
    bytes: statSync(join(OUT, file)).size,
    baseHex: toHex(mean.map((v) => v / (W * H) / 255)),
    displayedMeanHex: toHex(target.map((v) => v / (W * H))),
    oklab: { L: [+Lmin.toFixed(3), +Lmax.toFixed(3)], Cmax: +Cmax.toFixed(3) },
    clippedChannels: clipped,
    upscaleErrorVs2x: upscale,
  };
}

// ---------------------------------------------------------------------------------------- noise tile
async function alphaStats(rgba, n) {
  const a = (x, y) => rgba[(((y + n) % n) * n + ((x + n) % n)) * 4 + 3];
  let s = 0, s2 = 0, rgbMax = 0;
  for (let i = 0; i < n * n; i++) {
    s += rgba[i * 4 + 3];
    s2 += rgba[i * 4 + 3] ** 2;
    rgbMax = Math.max(rgbMax, rgba[i * 4], rgba[i * 4 + 1], rgba[i * 4 + 2]);
  }
  const m = s / (n * n), v = s2 / (n * n) - m * m;
  const corr = (dx, dy) => {
    let t = 0;
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) t += (a(x, y) - m) * (a(x + dx, y + dy) - m);
    return +(t / (n * n) / v).toFixed(3);
  };
  const vals = Array.from({ length: n * n }, (_, i) => rgba[i * 4 + 3]).sort((p, q) => p - q);
  const pct = (p) => vals[Math.floor(p * (vals.length - 1))];
  return {
    mean: +(m / 255).toFixed(4),
    sd: +(Math.sqrt(v) / 255).toFixed(4),
    sdLevels: +Math.sqrt(v).toFixed(2),
    p5: pct(0.05),
    p50: pct(0.5),
    p95: pct(0.95),
    lag1: [corr(1, 0), corr(0, 1)],
    lag2: corr(2, 0),
    rgbMax,
  };
}

async function noiseTile() {
  const { size: N, seed, mean, sd, bandpass, avif } = NOISE;
  const random = rng(seed);
  const gauss = () => {
    let u = 0, v = 0;
    while (u === 0) u = random();
    while (v === 0) v = random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
  const white = Float64Array.from({ length: N * N }, gauss);
  const k = [-bandpass.p, bandpass.q, 1, bandpass.q, -bandpass.p];
  const tmp = new Float64Array(N * N), f = new Float64Array(N * N);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    let s = 0;
    for (let i = -2; i <= 2; i++) s += k[i + 2] * white[y * N + ((x + i + N) % N)];
    tmp[y * N + x] = s;
  }
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    let s = 0;
    for (let i = -2; i <= 2; i++) s += k[i + 2] * tmp[((y + i + N) % N) * N + x];
    f[y * N + x] = s;
  }
  let fm = 0, fv = 0;
  for (const z of f) fm += z;
  fm /= f.length;
  for (const z of f) fv += (z - fm) ** 2;
  const fs = Math.sqrt(fv / f.length);
  // The AVIF is lossy: encode, decode, and re-scale until the decoded tile has the target sd. The PNG is
  // written from the decoded AVIF, so both formats render the same pixels.
  let gain = 1, avifBuf, decoded, stats;
  for (let iter = 0; iter < 5; iter++) {
    const rgba = Buffer.alloc(N * N * 4);
    for (let i = 0; i < N * N; i++) rgba[i * 4 + 3] = Math.max(0, Math.min(255, Math.round(mean + gain * sd * ((f[i] - fm) / fs))));
    avifBuf = await sharp(rgba, { raw: { width: N, height: N, channels: 4 } }).avif(avif).toBuffer();
    decoded = await sharp(avifBuf).ensureAlpha().raw().toBuffer();
    for (let i = 0; i < N * N; i++) decoded[i * 4] = decoded[i * 4 + 1] = decoded[i * 4 + 2] = 0;
    stats = await alphaStats(decoded, N);
    if (Math.abs(stats.sdLevels - sd) < 0.4) break;
    gain *= sd / stats.sdLevels;
  }
  writeFileSync(join(OUT, "noise-256.avif"), avifBuf);
  // Indexed PNG: the tile has at most 256 colours (black at 256 alphas), so the palette is exact.
  await sharp(decoded, { raw: { width: N, height: N, channels: 4 } })
    .png({ palette: true, colours: 256, dither: 0, effort: 10, compressionLevel: 9 })
    .toFile(join(OUT, "noise-256.png"));
  // Same pixels as the decoded AVIF, compared premultiplied (RGB under alpha 0 does not paint).
  const back = await sharp(join(OUT, "noise-256.png")).ensureAlpha().raw().toBuffer();
  let differ = 0;
  for (let i = 0; i < N * N * 4; i++) if (Math.round((back[i] * back[i | 3]) / 255) !== Math.round((decoded[i] * decoded[i | 3]) / 255)) differ++;
  return {
    gain: +gain.toFixed(4),
    stats,
    pngEqualsDecodedAvif: differ === 0,
    bytes: { avif: statSync(join(OUT, "noise-256.avif")).size, png: statSync(join(OUT, "noise-256.png")).size },
  };
}

async function paperMean() {
  const { data, info } = await sharp(PAPER_TILE).greyscale().raw().toBuffer({ resolveWithObject: true });
  let s = 0;
  for (let i = 0; i < info.width * info.height; i++) s += data[i * info.channels];
  return s / (info.width * info.height) / 255;
}

// ------------------------------------------------------------------------------------------------ CSS
const SCRIM = [
  [0.35, 0], [0.345, 8.07], [0.333, 15.54], [0.314, 22.5], [0.29, 29.04], [0.26, 35.26], [0.227, 41.25], [0.192, 47.1],
  [0.157, 52.9], [0.12, 58.75], [0.09, 64.74], [0.063, 70.96], [0.035, 77.5], [0.016, 84.46], [0.004, 91.93], [0, 100],
];

function css(report) {
  const rule = (sel, decls) => `${sel} {\n${decls.map((d) => `  ${d};`).join("\n")}\n}\n`;
  const media = (m, inner) => `@media ${m} {\n${inner.replace(/^(?=.)/gm, "  ")}}\n`;
  const note = (im) => `/* ${im.file.split("/").pop()}: ${im.css.join("x")} CSS, ${im.bytes} B, displayed mean ${im.displayedMeanHex} */\n`;
  const blocks = [];
  for (const f of report.fields) {
    const grain = `--v5-field-grain: ${f.grain.opacity}`;
    const size = f.size ? [`--v5-field-size: ${f.size}`] : [];
    if (f.images.length) {
      const [first, ...rest] = f.images;
      blocks.push(note(first) + rule(`.v5-field--${f.cls}`, [`--v5-field-img: url("${first.file}")`, `--v5-field-base: ${first.baseHex}`, grain, ...size]));
      for (const im of rest) blocks.push(note(im) + media(im.media, rule(`.v5-field--${f.cls}`, [`--v5-field-img: url("${im.file}")`, `--v5-field-base: ${im.baseHex}`])));
    }
    if (f.kind === "flat") {
      blocks.push(`/* Flat ${f.displayedMeanHex} under a ${f.grain.opacity} grain: base ${f.baseHex}, predicted mean ${f.predictedMeanHex}. */\n` +
        rule(`.v5-field--${f.cls}`, ["--v5-field-img: none", `--v5-field-base: ${f.baseHex}`, grain]));
    }
    for (const v of f.variants) {
      blocks.push(note(v) + rule(`.v5-field--${f.cls}-${v.id}`, [`--v5-field-img: url("${v.file}")`, `--v5-field-base: ${v.baseHex}`, grain, ...size]));
    }
  }
  const noise = `${URL}/noise-256`;
  return `/* v5 colour fields + film grain (tool T1). GENERATED by apps/landing/scripts/assets/fields.mjs; do not edit.
   Change the spec there and re-run: node apps/landing/scripts/assets/fields.mjs
   Layers, bottom to top (reverse-engineered from the ElevenLabs bento cards):
   1. field: the element's own background, a smooth bitmap made in OKLCH (no grain baked in);
   2. grain (::before): one shared 256 px tile, black + Gaussian alpha, mix-blend-mode overlay,
      1 texel = 1 device pixel. Overlay leaves white alone and darkens mid tones most;
   3. scrim (::after, .v5-field--scrim): 16-stop black gradient, only under white text.
   Each bitmap is pre-compensated for its grain opacity, so the mean the reader sees is the designed colour.
   Content inside a .v5-field paints above both layers (they sit at z-index -1 in its own stacking context).
   The element's ::before and ::after are taken. Nothing moves, so reduced motion and no-JS need nothing. */

/* Base rules use :where() (zero specificity), so a section can still pin the element (position: sticky) or
   size it without fighting this file. Knobs: --v5-field-img, --v5-field-base (shown while the bitmap loads,
   and if it fails), --v5-field-grain (layer opacity the bitmap was compensated for), --v5-field-size,
   --v5-field-pos (default 0 0 keeps the lit top-left corner in view when cover crops). */
:where(.v5-field) {
  position: relative;
  isolation: isolate;
  background-color: var(--v5-field-base, transparent);
  background-image: var(--v5-field-img, none);
  background-position: var(--v5-field-pos, 0 0);
  background-repeat: no-repeat;
  background-size: var(--v5-field-size, cover);
}

:where(.v5-field)::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  border-radius: inherit;
  pointer-events: none;
  background-image: url("${noise}.png");
  background-image: image-set(url("${noise}.avif") type("image/avif"), url("${noise}.png") type("image/png"));
  background-size: 256px 256px;
  image-rendering: pixelated;
  mix-blend-mode: overlay;
  opacity: var(--v5-field-grain, 1);
}

/* 1 texel = 1 device pixel on 2x screens (the reference keeps 128 px for every density >= 2). */
@media (min-resolution: 2dppx) {
  :where(.v5-field)::before {
    background-size: 128px 128px;
  }
}

/* Second tier: the v4d paper grain (grain.mjs), multiply at ${PAPER_OPACITY}, for plates that should read as paper.
   Bitmaps made for the film tier are compensated for overlay, so pair this with a field generated with
   grain: { tier: "paper" } (or a flat colour). */
.v5-field--paper::before {
  background-image: url("${PAPER_URL}");
  background-size: 256px 256px;
  image-rendering: auto;
  mix-blend-mode: multiply;
  opacity: ${PAPER_OPACITY};
}

:where(.v5-field--scrim)::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  border-radius: inherit;
  pointer-events: none;
  background: linear-gradient(to top, ${SCRIM.map(([a, p]) => `rgb(0 0 0 / ${a}) ${p}%`).join(", ")});
}

@media (forced-colors: active) {
  .v5-field::before,
  .v5-field::after {
    display: none;
  }
}

/* Instances (one per bitmap; phones switch at the v4d breakpoint ${MOBILE}). */

${blocks.join("\n")}`;
}

// ----------------------------------------------------------------------------------------------- main
export { FIELDS, LIGHT_DEG, compensator, oklabToRgb, rgbToOklab, hexToRgb, toHex };

async function main() {
  mkdirSync(OUT, { recursive: true });
  mkdirSync(join(LANDING, "src", "home"), { recursive: true });

  const noise = await noiseTile();
  const tiles = { filmMean: noise.stats.mean, paperMean: await paperMean() };
  const paperTone = 1 - PAPER_OPACITY * (1 - tiles.paperMean);
  for (const spec of FIELDS) if (spec.tone && Math.abs(spec.tone - paperTone) > 0.001) console.warn(`warning: ${spec.cls} tone ${spec.tone} != v4d paper tone ${paperTone.toFixed(4)}`);
  const report = { noise, tiles: { filmMean: tiles.filmMean, paperMean: +tiles.paperMean.toFixed(4) }, fields: [] };

  for (const spec of FIELDS) {
    const entry = { cls: spec.cls, kind: spec.kind, grain: spec.grain, size: spec.size, images: [], variants: [] };
    if (spec.kind === "flat") {
      const comp = compensator(spec.grain, tiles), t = hexToRgb(spec.color);
      entry.baseHex = toHex(t.map(comp));
      entry.displayedMeanHex = spec.color;
      // What the 8-bit base really yields under the grain (rounding to 8 bits costs up to half a level).
      entry.predictedMeanHex = toHex(hexToRgb(entry.baseHex).map(grainMean(spec.grain, tiles)));
    }
    for (const sz of spec.sizes ?? []) {
      const file = `${spec.cls}-${sz.css.join("x")}@${sz.scale}x.webp`;
      entry.images.push({ ...(await renderField(spec, sz, {}, tiles, file)), media: sz.media });
    }
    for (const v of spec.variants ?? []) {
      const file = `${spec.cls}-${v.id}-${v.css.join("x")}@${v.scale}x.webp`;
      entry.variants.push({ id: v.id, ...(await renderField(spec, v, v, tiles, file)) });
    }
    report.fields.push(entry);
  }

  // The folder belongs to this tool: drop anything a previous spec produced and this one did not.
  const produced = new Set(["noise-256.avif", "noise-256.png"]);
  for (const f of report.fields) for (const im of [...f.images, ...f.variants]) produced.add(im.file.split("/").pop());
  report.removed = readdirSync(OUT).filter((f) => !produced.has(f));
  for (const f of report.removed) rmSync(join(OUT, f));

  writeFileSync(CSS_OUT, css(report));
  report.css = { file: "apps/landing/src/home/v5-fields.css", bytes: statSync(CSS_OUT).size };
  console.log(JSON.stringify(report, null, 1));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) await main();
