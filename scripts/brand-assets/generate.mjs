#!/usr/bin/env node
// Generate the bamboo kit assets: halftone stage plate, footer landscape, pixel
// plate, optional contour overlay and culm symbols. Pure Node (zlib only): no
// dependencies, no network, no browser; the output is byte-for-byte deterministic.
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
  lime: "#6fd305", // the mark's green; at most once per asset
  greys: ["#ebebeb", "#d6d6d6", "#b8b8b8"], // console ink-100 / 200 / 300, for the cool plate
};

const write = (name, buffer) => {
  writeFileSync(join(outDir, name), buffer);
  console.log(`${name.padEnd(34)} ${String(buffer.length).padStart(7)} B`);
};

/** Halftone a field (and an optional accent field on its own screen angle) to PNG. */
function halftonePng(field, { pitch, steps, color, accent }) {
  const layers = [{ coverage: halftone(field, { pitch, angle: 45 }), color, steps }];
  if (accent) layers.push({ coverage: halftone(accent, { pitch, angle: 0, maxTone: 0.62 }), color: INK.lime, steps });
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
  // (b) Footer landscape; the narrow render is a re-screened crop, not a squeeze.
  landscape: () => {
    for (const [w, h, pitch, window] of [[2880, 800, 8, [0]], [1200, 600, 6, [1280]]]) {
      const { ink, accent } = bambooLandscape({ width: w, height: h, window });
      for (let i = 0; i < ink.data.length; i++) ink.data[i] *= 1 - accent.data[i]; // knock out under the lime plate
      write(`bamboo-landscape-${w}.png`, halftonePng(ink, { pitch, steps: 3, color: INK.sage, accent }));
    }
  },
  // (d) Pixel / ordered-dither plate for the cool product-stage direction (v2c).
  // Tints sit exactly on the grey steps, so only gradients (ground mist, shading,
  // the pale band under each node, soft far edges) dither.
  "plate-pixel": () => {
    const levels = INK.greys.length;
    const tones = { mist: 0.3, far: 1 / levels, mid: 2 / levels, near: 1, leaf: 2 / levels };
    for (const [w, h, pixel] of [[2400, 1500, 8], [1200, 750, 6]]) {
      const { field, accent } = grovePlate({ width: w, height: h, tones, calm: 0, accentRing: true });
      const index = pixelDither(field, { pixel, levels });
      const lime = pixelDither(accent, { pixel, levels: 1, ordered: false });
      for (let i = 0; i < index.length; i++) if (lime[i]) index[i] = levels + 1;
      const palette = [[0, 0, 0, 0], ...INK.greys.map((g) => [...hexToRgb(g), 255]), [...hexToRgb(INK.lime), 255]];
      write(`bamboo-plate-pixel-${w}.png`, encodeIndexedPng(w, h, index, palette));
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
