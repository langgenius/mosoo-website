// Grain tile for the plates (UI-FORMS c.0 "底板"): per-pixel seeded noise,
// softened by one box-blur pass so it reads like feTurbulence fractalNoise at
// baseFrequency ~.85, then stored as a grayscale WebP. Per-pixel noise with a
// wrapping blur tiles seamlessly. The page multiplies it over a low-chroma
// gradient at 14–18% opacity.
// Run: node apps/landing/scripts/assets/grain.mjs

import { join } from "node:path";

import { LANDING, rng, sharp } from "./lib.mjs";

const SIZE = 256;
const SEED = 20261019;

const random = rng(SEED);
const raw = new Float64Array(SIZE * SIZE);
for (let i = 0; i < raw.length; i++) {
  // Sum of two uniforms: a soft triangular distribution around .5.
  raw[i] = (random() + random()) / 2;
}

const at = (x, y) => raw[((y + SIZE) % SIZE) * SIZE + ((x + SIZE) % SIZE)];
const out = Buffer.alloc(SIZE * SIZE);
for (let y = 0; y < SIZE; y++) {
  for (let x = 0; x < SIZE; x++) {
    // Centre-weighted 3x3 blur, wrapping at the edges.
    const v =
      (4 * at(x, y) + 2 * (at(x - 1, y) + at(x + 1, y) + at(x, y - 1) + at(x, y + 1)) +
        at(x - 1, y - 1) + at(x + 1, y - 1) + at(x - 1, y + 1) + at(x + 1, y + 1)) /
      16;
    // Stretch the contrast back after the blur; white = no darkening under multiply.
    const n = Math.max(0, Math.min(1, (v - 0.5) * 3.2 + 0.5));
    out[y * SIZE + x] = Math.round(255 - n * 150);
  }
}

const file = join(LANDING, "public", "landing", "grain.webp");
await sharp(out, { raw: { width: SIZE, height: SIZE, channels: 1 } })
  .webp({ quality: 70, effort: 6 })
  .toFile(file);
const { size } = await sharp(file).metadata().then(async () => (await import("node:fs")).statSync(file));
console.log(`grain.webp ${SIZE}x${SIZE} ${size} B`);
