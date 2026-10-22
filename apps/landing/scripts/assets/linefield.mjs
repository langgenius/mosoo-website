// Line-field posters (v5 tool T2). Reads per-instance params from
// public/landing/v5/lines/params.json and writes one SVG poster per instance: the t0 frame
// the runtime (src/effects/v5/linefield.ts) starts from, for no-JS, reduced motion and first paint.
// The maths is imported from that runtime module, so poster and canvas cannot drift apart.
// Provenance: Mintlify's card "Waves" reversed in staging refs/mintlify/v5/STUDY.md §2.3; ported from
// the study prototype refs/mintlify/v5/scripts/wavefield.ts (our own code), plus its pinch window (§3.2).
//
// Run (repo root, Node >= 23.6 for the .ts import; .nvmrc is 24):
//   node apps/landing/scripts/assets/linefield.mjs
// Options (proof renders; posters are only written without --t):
//   --only hero,card-wide   some instances
//   --params <file>         another params file (same shape)
//   --t 0,3,6 --out <dir>   frames at these times (s) as <id>@t<t>.svg in <dir>
//   --proof                 add the instance's ground and assumed object boxes (never in posters)
//   --png                   also rasterise each SVG to PNG at 1x (sharp)

import { statSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { gzipSync } from "node:zlib";

import { computeFrame, prepareField } from "../../src/effects/v5/linefield.ts";
import { LANDING, sharp } from "./lib.mjs";

export const LINES_DIR = join(LANDING, "public", "landing", "v5", "lines");
export const PARAMS_FILE = join(LINES_DIR, "params.json");

/** Tenths of a pixel as a short SVG number: 123 -> "12.3", -5 -> "-.5". */
function num(tenths) {
  const sign = tenths < 0 ? "-" : "";
  const a = Math.abs(tenths);
  const whole = Math.floor(a / 10);
  const frac = a % 10;
  return sign + (frac === 0 ? String(whole) : `${whole === 0 ? "" : whole}.${frac}`);
}

/** Polyline as "M x y l dx dy ...", trimmed to the points that can touch the box. */
function pathData(xy, offset, points, w, h, pad) {
  const inside = (j) => {
    const x = xy[offset + 2 * j];
    const y = xy[offset + 2 * j + 1];
    return x >= -pad && x <= w + pad && y >= -pad && y <= h + pad;
  };
  let first = -1;
  let last = -1;
  for (let j = 0; j < points; j++) {
    if (inside(j)) {
      if (first < 0) first = j;
      last = j;
    }
  }
  if (first < 0) return "";
  first = Math.max(0, first - 1);
  last = Math.min(points - 1, last + 1);
  // Deltas between rounded absolute points, so rounding never accumulates.
  const at = (j) => [Math.round(xy[offset + 2 * j] * 10), Math.round(xy[offset + 2 * j + 1] * 10)];
  let [px, py] = at(first);
  let d = `M${num(px)} ${num(py)}l`;
  for (let j = first + 1; j <= last; j++) {
    const [x, y] = at(j);
    const dx = num(x - px);
    const dy = num(y - py);
    d += `${j === first + 1 || dx.startsWith("-") ? "" : " "}${dx}${dy.startsWith("-") ? "" : " "}${dy}`;
    px = x;
    py = y;
  }
  return d;
}

/** The SVG for one instance at time t (s). proof adds the ground and the assumed object boxes. */
export function lineSvg(params, { t = params.t0 ?? 0, proof = false } = {}) {
  const field = prepareField(params);
  const xy = new Float64Array(field.lines * field.points * 2);
  computeFrame(field, t, xy);
  const { w, h } = params;
  const paths = [];
  for (let i = 0; i < field.lines; i++) {
    const d = pathData(xy, i * field.points * 2, field.points, w, h, params.stroke);
    if (d) paths.push(`<path stroke="${field.colors[i]}" d="${d}"/>`);
  }
  const ground = proof && params.ground ? `<rect width="${w}" height="${h}" fill="${params.ground}"/>` : "";
  const objects = proof
    ? (params.objects ?? [])
        .map((o) => `<rect x="${o.x + 0.5}" y="${o.y + 0.5}" width="${o.w - 1}" height="${o.h - 1}" rx="${o.r}" fill="#fff" stroke="#161815" stroke-opacity=".12"/>`)
        .join("")
    : "";
  const opacity = (params.opacity ?? 1) === 1 ? "" : ` opacity="${params.opacity}"`;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">` +
    `<style>path{vector-effect:non-scaling-stroke}</style>${ground}` +
    `<g fill="none" stroke-width="${params.stroke}" stroke-linecap="round" stroke-linejoin="round"${opacity}>${paths.join("")}</g>` +
    `${objects}</svg>`
  );
}

// WCAG relative luminance and contrast, to check the ramp reads on its ground.
const channel = (c) => {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
};
const luminance = (hex) => {
  const v = Number.parseInt(hex.slice(1), 16);
  return 0.2126 * channel((v >> 16) & 255) + 0.7152 * channel((v >> 8) & 255) + 0.0722 * channel(v & 255);
};
export const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

export function readParams(file = PARAMS_FILE) {
  return JSON.parse(readFileSync(file, "utf8")).instances;
}

async function main(argv) {
  const opt = (name) => {
    const i = argv.indexOf(`--${name}`);
    return i >= 0 ? argv[i + 1] : undefined;
  };
  const instances = readParams(opt("params") ? resolve(opt("params")) : PARAMS_FILE);
  const only = opt("only")?.split(",");
  const times = opt("t")?.split(",").map(Number);
  const proof = argv.includes("--proof");
  if ((times || proof) && !opt("out")) {
    throw new Error("--t and --proof write proof frames: pass --out <dir> (posters are the t0 frames)");
  }
  const outDir = opt("out") ? resolve(opt("out")) : LINES_DIR;
  mkdirSync(outDir, { recursive: true });
  for (const [id, params] of Object.entries(instances)) {
    if (only && !only.includes(id)) continue;
    for (const t of times ?? [params.t0 ?? 0]) {
      const svg = lineSvg(params, { t, proof });
      const file = join(outDir, times ? `${id}@t${t}.svg` : `${id}.svg`);
      writeFileSync(file, svg);
      if (argv.includes("--png")) {
        await sharp(Buffer.from(svg)).png().toFile(file.replace(/\.svg$/, ".png"));
      }
      const colors = prepareField(params).colors;
      const ground = params.ground ?? "#ffffff";
      const readable = colors.filter((c) => contrast(c, ground) >= 2).length;
      console.log(
        `${file.slice(file.lastIndexOf("/") + 1).padEnd(22)} ${params.w}x${params.h} ${String(colors.length).padStart(2)} lines ` +
          `${String(statSync(file).size).padStart(6)} B (gzip ${gzipSync(svg, { level: 9 }).length} B)  ` +
          `vs ${ground}: ${colors[0]} ${contrast(colors[0], ground).toFixed(2)}:1 .. ${colors.at(-1)} ${contrast(colors.at(-1), ground).toFixed(2)}:1, ` +
          `${readable}/${colors.length} lines >= 2:1`,
      );
    }
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  await main(process.argv.slice(2));
}
