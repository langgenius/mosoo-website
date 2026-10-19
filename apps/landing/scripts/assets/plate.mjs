#!/usr/bin/env node
// Gesso plate + paper grain for the v4b "Paper" home (proposal b-paper §10 #1 and #2).
//
//   node apps/landing/scripts/assets/plate.mjs [outDir=apps/landing/public/landing/paper] [seed=23]
//
// Outputs (deterministic for a given seed; re-running writes byte-identical files):
//   plate-2400.webp  2400x1300, budget <= 180,000 B (hero + stage plate at 2x)
//   plate-1200.webp  1200x650, phones and 1x
//   grain-128.png    128x128 tiling paper grain, 16-colour palette PNG, budget <= 12,000 B
//
// The b-paper proposal's first plate (an feTurbulence stack, baseFrequency 0.0011 x 0.0105) read as ink-wash fog
// or water: long soft horizontal bands faded into each other. This version paints a primed board instead, the way
// the Harvey hero plate reads (refs/harvey/www.harvey.ai-hero.jpg): a warm graphite ground, a pale gesso coat
// brushed over its top with a hard, broken dry-brush edge, bristle striations inside both coats, board tooth and
// a little spatter near the edge. Every value is computed here from seeded noise; nothing is sampled from the
// reference.
import { mkdirSync, statSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const outDir = process.argv[2] ?? "apps/landing/public/landing/paper";
const seed = Number(process.argv[3] ?? 23);
const W = 2400;
const H = 1300;
const PLATE_BUDGET = 180_000;
const GRAIN_BUDGET = 12_000;

// Warm neutrals only (hue 70-85, PROPOSAL.md §2.1); no green anywhere in the asset.
const GROUND = [106, 100, 93]; // warm graphite primer
const GESSO = [231, 227, 219]; // pale gesso coat, a step below --paper #f8f7f4 so the white sheet still reads

function mulberry32(a) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Seeded 2D gradient noise (Perlin), output roughly in [0, 1].
function makeNoise(s) {
  const rand = mulberry32(s);
  const perm = new Uint8Array(512);
  const p = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
  const gx = new Float32Array(256);
  const gy = new Float32Array(256);
  for (let i = 0; i < 256; i++) {
    const a = rand() * Math.PI * 2;
    gx[i] = Math.cos(a);
    gy[i] = Math.sin(a);
  }
  const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
  return (x, y) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = x - xi;
    const yf = y - yi;
    const X = xi & 255;
    const Y = yi & 255;
    const g00 = perm[X + perm[Y]];
    const g10 = perm[X + 1 + perm[Y]];
    const g01 = perm[X + perm[Y + 1]];
    const g11 = perm[X + 1 + perm[Y + 1]];
    const n00 = gx[g00] * xf + gy[g00] * yf;
    const n10 = gx[g10] * (xf - 1) + gy[g10] * yf;
    const n01 = gx[g01] * xf + gy[g01] * (yf - 1);
    const n11 = gx[g11] * (xf - 1) + gy[g11] * (yf - 1);
    const u = fade(xf);
    const v = fade(yf);
    const a = n00 + u * (n10 - n00);
    const b = n01 + u * (n11 - n01);
    return 0.5 + 0.72 * (a + v * (b - a));
  };
}

function fbm(noise, x, y, octaves) {
  let sum = 0;
  let amp = 0.5;
  let norm = 0;
  for (let o = 0; o < octaves; o++) {
    sum += amp * noise(x, y);
    norm += amp;
    x *= 2.03;
    y *= 2.03;
    amp *= 0.5;
  }
  return sum / norm;
}

const smoothstep = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

function hash(x, y, s) {
  let h = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(s, 2147483647);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function renderPlate(s) {
  const lowN = makeNoise(s);
  const strokeN = makeNoise(s + 1);
  const bristleN = makeNoise(s + 2);
  const warpN = makeNoise(s + 3);
  const tintN = makeNoise(s + 4);
  const toothN = makeNoise(s + 5);
  const px = Buffer.alloc(W * H * 3);
  const theta0 = (-7 * Math.PI) / 180; // brush travel: a shallow diagonal, never level (level bands read as water)
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const u = x / W;
      const v = y / H;
      // The stroke direction bends slowly, as a hand-held brush does.
      const theta = theta0 + 0.35 * (warpN(x / 900, y / 900) - 0.5);
      const c = Math.cos(theta);
      const sn = Math.sin(theta);
      const xr = x * c + y * sn;
      const yr = -x * sn + y * c;
      // Where the gesso coat was laid: a broad pass over the top, thinner toward both sides and the bottom.
      const reach = 0.5 + 0.2 * (lowN(x / 1400, 3.7) - 0.5) * 2;
      const side = 1 - 0.55 * Math.pow(Math.abs(u - 0.47) * 2, 2.2);
      const cover = side * (1 - smoothstep(reach - 0.42, reach + 0.18, v));
      // Stroke-scale lumps (long along the stroke, 3:1, not the old 10:1 bands), bristle striations, board tooth.
      const stroke = fbm(strokeN, xr / 520, yr / 170, 4);
      const bristle = fbm(bristleN, xr / 260, yr / 3.2, 3);
      // Board tooth: ~2px grains (gradient noise, so WebP keeps it as texture instead of mush).
      const tooth = toothN(x / 2.2, y / 2.2);
      const field = cover + 0.42 * (stroke - 0.5) + 0.24 * (bristle - 0.5) + 0.26 * (tooth - 0.5);
      // Hard threshold: the dry-brush edge breaks along bristles and tooth instead of fading out.
      let a = smoothstep(0.47, 0.53, field);
      // Spatter: sparse pale flecks thrown just past the edge onto the ground.
      if (a < 0.5 && field > 0.3) {
        const fleck = hash(x >> 1, y >> 1, s + 9);
        if (fleck > 0.985 - 0.06 * smoothstep(0.3, 0.47, field)) a = Math.max(a, 0.75);
      }
      // Coat-internal variation: bristle marks lighten/darken each coat a little; a slow tint drift avoids flatness.
      const drift = tintN(x / 1100, y / 700) - 0.5;
      const mark = bristle - 0.5;
      const g = 1 + 0.08 * mark + 0.07 * drift + 0.1 * (stroke - 0.5) + 0.34 * (tooth - 0.5);
      const k = 1 + 0.03 * mark + 0.025 * drift + 0.05 * (tooth - 0.5);
      const o = (y * W + x) * 3;
      for (let ch = 0; ch < 3; ch++) {
        const ground = GROUND[ch] * g;
        const gesso = GESSO[ch] * k;
        px[o + ch] = Math.max(0, Math.min(255, Math.round(ground + (gesso - ground) * a)));
      }
    }
  }
  return px;
}

// Paper grain tile for the page background (multiply at ~5%), seamless via stitchTiles.
const grainSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128">
<filter id="g" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="5" stitchTiles="stitch"/>
<feColorMatrix type="saturate" values="0"/></filter>
<rect width="128" height="128" filter="url(#g)"/></svg>`;

mkdirSync(outDir, { recursive: true });
const raw = renderPlate(seed);
const plate = sharp(raw, { raw: { width: W, height: H, channels: 3 } });
const png = await plate.png().toBuffer();
let chosen = 0;
for (const q of [62, 56, 50, 45, 40]) {
  const buf = await sharp(png).webp({ quality: q, effort: 6, smartSubsample: true }).toBuffer();
  if (buf.length <= PLATE_BUDGET || q === 40) {
    writeFileSync(`${outDir}/plate-2400.webp`, buf);
    chosen = q;
    break;
  }
}
await sharp(png).resize(1200).webp({ quality: 64, effort: 6, smartSubsample: true }).toFile(`${outDir}/plate-1200.webp`);
const grain = await sharp(Buffer.from(grainSvg))
  .greyscale()
  .png({ palette: true, colours: 16, compressionLevel: 9, effort: 10 })
  .toBuffer();
writeFileSync(`${outDir}/grain-128.png`, grain);
console.log(`plate-2400 webp quality ${chosen}`);
for (const f of ["plate-2400.webp", "plate-1200.webp", "grain-128.png"]) {
  console.log(f, statSync(`${outDir}/${f}`).size, "B");
}
if (statSync(`${outDir}/plate-2400.webp`).size > PLATE_BUDGET) console.log("plate-2400 over budget");
if (grain.length > GRAIN_BUDGET) console.log("grain over budget");
