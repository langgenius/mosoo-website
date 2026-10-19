// Shared helpers for the v4d asset pipelines: a seeded PRNG, OKLCH -> sRGB,
// tileable value noise, and the sharp import (the repo's own copy, no new dependency).

import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const LANDING = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
export const REPO = resolve(LANDING, "../..");
const require = createRequire(resolve(REPO, "package.json"));
export const sharp = require("sharp");

/** mulberry32: small, fast, deterministic. */
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** OKLCH (L 0–1, C, h degrees) -> OKLab. */
export function oklchToOklab(l, c, h) {
  const r = (h * Math.PI) / 180;
  return [l, c * Math.cos(r), c * Math.sin(r)];
}

const toSrgb = (x) => {
  const v = x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055;
  return Math.max(0, Math.min(255, Math.round(v * 255)));
};

/** OKLab -> sRGB 0–255 (Björn Ottosson's matrices). */
export function oklabToSrgb(L, a, b) {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;
  return [
    toSrgb(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    toSrgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    toSrgb(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ];
}

/** Tileable value noise on a cellsX × cellsY lattice that wraps, smoothstep-interpolated, in [-1, 1]. */
export function tileNoise(random, cellsX, cellsY) {
  const lattice = Float64Array.from({ length: cellsX * cellsY }, () => random() * 2 - 1);
  const at = (x, y) => lattice[((y % cellsY) + cellsY) % cellsY * cellsX + (((x % cellsX) + cellsX) % cellsX)];
  const smooth = (t) => t * t * (3 - 2 * t);
  return (u, v) => {
    // u, v in [0, 1): position across the tile.
    const x = u * cellsX;
    const y = v * cellsY;
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const sx = smooth(x - x0);
    const sy = smooth(y - y0);
    const top = at(x0, y0) + (at(x0 + 1, y0) - at(x0, y0)) * sx;
    const bottom = at(x0, y0 + 1) + (at(x0 + 1, y0 + 1) - at(x0, y0 + 1)) * sx;
    return top + (bottom - top) * sy;
  };
}
