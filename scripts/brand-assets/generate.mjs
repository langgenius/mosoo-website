#!/usr/bin/env node
// Generate the bamboo kit assets: halftone stage plate, footer landscape, pixel
// plate and its optional accent overlay, optional contour overlay and culm
// symbols. Pure Node (zlib only): no dependencies, no network, no browser; the
// output is byte-for-byte deterministic.
//
//   node scripts/brand-assets/generate.mjs [--out <dir>] [--only plate-paper,landscape,plate-pixel,contours,symbols]
//
// Default output: apps/landing/public/landing/bamboo/. See MANIFEST.md.

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { bambooLandscape, grovePlate } from "./bamboo.mjs";
import { contourOverlay } from "./contours.mjs";
import { encodeIndexedPng, halftone, hexToRgb, pixelDither, quantiseInks } from "./raster.mjs";
import { culmSymbols } from "./symbols.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const outDir = resolve(flag("--out") ?? join(here, "../../apps/landing/public/landing/bamboo"));
const only = flag("--only")?.split(",");
mkdirSync(outDir, { recursive: true });

// Inks. Paper itself is never painted: every raster is transparent where no ink falls.
const INK = {
  sage: "#6d786a", // warm sage between landing --ink-300 #97a095 and --ink-400 #667065
  lime: "#6fd305", // the mark's green: one ring in the footer landscape, and the pixel plate's optional overlay
  greys: ["#ebebeb", "#d6d6d6", "#b8b8b8"], // console ink-100 / 200 / 300, for the cool plate
};

const write = (name, buffer) => {
  writeFileSync(join(outDir, name), buffer);
  console.log(`${name.padEnd(34)} ${String(buffer.length).padStart(7)} B`);
};

/**
 * Halftone a field (and an optional lime accent on its own screen angle) to PNG.
 * The ink gets `steps` alpha levels; the accent one opaque step (crisp dots), so
 * with two ink steps the palette fits in 2 bits.
 */
function halftonePng(field, { pitch, steps, color, accent }) {
  const layers = [{ coverage: halftone(field, { pitch, angle: 45 }), color, steps }];
  if (accent) layers.push({ coverage: halftone(accent, { pitch, angle: 0, maxTone: 0.62 }), color: INK.lime, steps: 1 });
  const { indices, palette } = quantiseInks(field.width, field.height, layers);
  return encodeIndexedPng(field.width, field.height, indices, palette);
}

const jobs = {
  // (a) Hero product-stage plate for the warm paper direction (v2a).
  "plate-paper": () => {
    for (const [w, h, pitch] of [[2400, 1500, 8], [1200, 750, 6]]) {
      const { field } = grovePlate({ width: w, height: h });
      write(`bamboo-plate-paper-${w}.png`, halftonePng(field, { pitch, steps: 3, color: INK.sage }));
    }
  },
  // (b) Footer landscape. Narrow renders are re-screened, never squeezed: 1440 is
  // the whole design space at half scale (1x desktops), 1200 a crop from x 1280
  // (phones). Pitch follows the scale (8 k), so dots keep their size in CSS px.
  // Two alpha steps where the dots are big enough not to need a third (measured:
  // no visible difference at 1:1, 11 KB less on the 2880 file); the 1440 file's
  // small dots keep three, or mid-tones turn into a pixel checkerboard at 1x.
  landscape: () => {
    for (const [w, h, pitch, steps, window] of [[2880, 800, 8, 2, [0]], [1440, 400, 4, 3, [0]], [1200, 600, 6, 2, [1280]]]) {
      const { ink, accent } = bambooLandscape({ width: w, height: h, window });
      for (let i = 0; i < ink.data.length; i++) ink.data[i] *= 1 - accent.data[i]; // knock out under the lime plate
      write(`bamboo-landscape-${w}.png`, halftonePng(ink, { pitch, steps, color: INK.sage, accent }));
    }
  },
  // (d) Pixel / ordered-dither plate for the cool product-stage direction (v2c).
  // Tints sit exactly on the grey steps, so only gradients (ground mist, shading,
  // the pale band under each node, soft far edges) dither. The plate carries no
  // lime: the stage it sits on already has the page's accent. The one lime node
  // ring is a separate overlay on the same pixel grid, for a direction that wants it.
  "plate-pixel": () => {
    const levels = INK.greys.length;
    const tones = { mist: 0.3, far: 1 / levels, mid: 2 / levels, near: 1, leaf: 2 / levels };
    for (const [w, h, pixel] of [[2400, 1500, 8], [1200, 750, 6]]) {
      const { field, accent } = grovePlate({ width: w, height: h, tones, calm: 0, accentRing: true });
      const greys = [[0, 0, 0, 0], ...INK.greys.map((g) => [...hexToRgb(g), 255])];
      write(`bamboo-plate-pixel-${w}.png`, encodeIndexedPng(w, h, pixelDither(field, { pixel, levels }), greys));
      const ring = pixelDither(accent, { pixel, levels: 1, ordered: false });
      write(`bamboo-plate-pixel-accent-${w}.png`, encodeIndexedPng(w, h, ring, [[0, 0, 0, 0], [...hexToRgb(INK.lime), 255]]));
    }
  },
  // Optional contour overlay for the stage plate (owner issue #98).
  contours: () => write("bamboo-contours.svg", Buffer.from(contourOverlay())),
  // (c) Culm segment symbols for the Session-as-culm diagram.
  symbols: () => {
    for (const [name, svg] of Object.entries(culmSymbols())) write(name, Buffer.from(svg));
  },
};

for (const [name, job] of Object.entries(jobs)) {
  if (only && !only.includes(name)) continue;
  const t = performance.now();
  job();
  console.log(`  ${name}: ${(performance.now() - t).toFixed(0)} ms`);
}
