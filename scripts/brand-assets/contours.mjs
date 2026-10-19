// Optional contour overlay (owner issue #98: dot field + contour lines): isolines
// of a slow organic field, traced with marching squares, chained, simplified
// (Ramer-Douglas-Peucker), smoothed into Beziers and written as one SVG path.
// The hairline is non-scaling and drawn in the plates' sage ink; inline the SVG
// to restyle the stroke, or use it as a mask-image over any token colour.

import { noise2 } from "./raster.mjs";

/** Trace isolines of f on a grid; returns polylines in grid units. */
function isolines(grid, cols, rows, level) {
  const at = (x, y) => grid[y * (cols + 1) + x];
  const lerp = (a, b) => (level - a) / (b - a);
  const segs = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const tl = at(x, y);
      const tr = at(x + 1, y);
      const br = at(x + 1, y + 1);
      const bl = at(x, y + 1);
      const code = (tl > level ? 8 : 0) | (tr > level ? 4 : 0) | (br > level ? 2 : 0) | (bl > level ? 1 : 0);
      if (code === 0 || code === 15) continue;
      const top = [x + lerp(tl, tr), y];
      const right = [x + 1, y + lerp(tr, br)];
      const bottom = [x + lerp(bl, br), y + 1];
      const left = [x, y + lerp(tl, bl)];
      const table = {
        1: [[left, bottom]], 2: [[bottom, right]], 3: [[left, right]], 4: [[top, right]],
        5: [[left, top], [bottom, right]], 6: [[top, bottom]], 7: [[left, top]], 8: [[left, top]],
        9: [[top, bottom]], 10: [[left, bottom], [top, right]], 11: [[top, right]], 12: [[left, right]],
        13: [[bottom, right]], 14: [[left, bottom]],
      };
      for (const s of table[code]) segs.push(s);
    }
  }
  // Chain segments sharing endpoints into polylines.
  const key = ([x, y]) => `${x.toFixed(4)},${y.toFixed(4)}`;
  const ends = new Map();
  segs.forEach((s, i) => {
    for (const p of s) {
      const k = key(p);
      if (!ends.has(k)) ends.set(k, []);
      ends.get(k).push(i);
    }
  });
  const used = new Uint8Array(segs.length);
  const lines = [];
  for (let i = 0; i < segs.length; i++) {
    if (used[i]) continue;
    used[i] = 1;
    const line = [segs[i][0], segs[i][1]];
    for (const dir of [1, -1]) {
      for (;;) {
        const tip = dir === 1 ? line[line.length - 1] : line[0];
        const next = (ends.get(key(tip)) ?? []).find((j) => !used[j]);
        if (next === undefined) break;
        used[next] = 1;
        const [a, b] = segs[next];
        const p = key(a) === key(tip) ? b : a;
        if (dir === 1) line.push(p);
        else line.unshift(p);
      }
    }
    lines.push(line);
  }
  return lines;
}

function simplify(points, tolerance) {
  if (points.length < 3) return points;
  const [ax, ay] = points[0];
  const [bx, by] = points[points.length - 1];
  const dx = bx - ax;
  const dy = by - ay;
  const len = Math.hypot(dx, dy) || 1;
  let worst = 0;
  let index = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const d = Math.abs((points[i][0] - ax) * dy - (points[i][1] - ay) * dx) / len;
    if (d > worst) {
      worst = d;
      index = i;
    }
  }
  if (worst <= tolerance) return [points[0], points[points.length - 1]];
  return [...simplify(points.slice(0, index + 1), tolerance).slice(0, -1), ...simplify(points.slice(index), tolerance)];
}

/**
 * Contour overlay for a 16:10 stage (viewBox 1600 x 1000), denser toward the
 * ground like the plate's mist. Returns SVG text.
 */
export function contourOverlay({ seed = 7, levels = 9 } = {}) {
  const W = 1600;
  const H = 1000;
  const step = 10;
  const cols = W / step;
  const rows = H / step;
  const n = noise2(seed + 29);
  const grid = new Float32Array((cols + 1) * (rows + 1));
  for (let y = 0; y <= rows; y++) {
    for (let x = 0; x <= cols; x++) {
      const px = x * step;
      const py = y * step;
      // A broad swell plus the ground's slope, so lines run across the lower stage.
      grid[y * (cols + 1) + x] = n.fbm(px / 620, py / 420, 3) * 0.55 + (py / H) * 1.1;
    }
  }
  const paths = [];
  for (let l = 1; l <= levels; l++) {
    const level = 0.3 + (l / (levels + 1)) * 0.9;
    for (const line of isolines(grid, cols, rows, level)) {
      const pts = simplify(line, 0.25).map(([x, y]) => [x * step, y * step]);
      if (pts.length < 2) continue;
      // Catmull-Rom through the simplified points, written as cubic Beziers.
      const p = (i) => pts[Math.max(0, Math.min(pts.length - 1, i))];
      const r = (v) => Math.round(v * 10) / 10;
      let d = `M${r(pts[0][0])} ${r(pts[0][1])}`;
      for (let i = 0; i < pts.length - 1; i++) {
        const [x0, y0] = p(i - 1);
        const [x1, y1] = p(i);
        const [x2, y2] = p(i + 1);
        const [x3, y3] = p(i + 2);
        d += `C${r(x1 + (x2 - x0) / 6)} ${r(y1 + (y2 - y0) / 6)} ${r(x2 - (x3 - x1) / 6)} ${r(y2 - (y3 - y1) / 6)} ${r(x2)} ${r(y2)}`;
      }
      paths.push(d);
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" fill="none">
<!-- Optional contour overlay for the bamboo stage plate (owner issue #98). Generated by scripts/brand-assets/generate.mjs. Sage ink by default; restyle the stroke when inlined, or use the file as a mask-image. -->
<path d="${paths.join("")}" stroke="#6d786a" stroke-width="1" vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;
}
