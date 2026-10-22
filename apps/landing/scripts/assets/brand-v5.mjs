// T5 brand footer tool (v5, 2026-10-20): the one source for public/brand/v5/*.
//
// Run (one command, from the repo root; deterministic, no randomness):
//   node apps/landing/scripts/assets/brand-v5.mjs
// Optional: --ts <file> also writes the inline path data as a TS module (off by default).
//
// What it reverse-engineers (staging = $MOSOO_STAGING, the redesign staging folder):
// - Intent's footer reveal (staging refs/intent/v5/STUDY.md §1): a giant mark + wordmark rise 120px from an
//   overflow:clip seam, the mark draws itself from the middle of each stroke outward, one colour token.
//   Intent's spark stroke is 23px at 264px (8.7% of the mark width, measured on
//   refs/intent/v5/trace-footer-1440-light/shots/end-2x.png); its letter stems are 40.5px.
// - The owner's logo rule (production/briefs/owner-notes.md, 10-19 15:04): Enter Pro style, keep the logo's
//   outline and fill the inside freely; v5 BRIEF §3.1: the logo is ink (#161815), enlarged only in the footer.
//
// Input: public/brand/logo-wordmark-onlight.svg (the lockup: block + bar + five letters). Every number below is
// parsed from it, not typed in. The mark here is the lockup's own mark (bar 10% of its width, gap 10.4%), which
// differs from public/brand/logo-mark.svg (bar 13.5%, gap 7%) used by scripts/assets/outline.mjs.
//
// Outputs (public/brand/v5/):
//   mark-draw-260.svg     the drawable mark for a 260px-high display (inline it; as <img> it shows the solid mark):
//                           .bm-fill   the solid block (end state; animate its clip from the bottom, or hide it for
//                                      the outline-only variant)
//                           .bm-block  the block outline, one closed path, pathLength=1, start point = top centre, so a
//                                      dash grown from the middle of its length starts at the bottom centre and closes
//                                      at the top; inset by half the stroke, so its outer edge is the solid edge
//                           .bm-bar    the bar as one line, pathLength=1, drawn from its centre outward
//   mark-draw-64.svg      the same for a 64px-high display
//   mosoo-letters.svg     the five letters only, tight viewBox, ink fill (mask-image or <img>)
//   mark-solid.svg        the lockup mark, solid ink
//   logo-nav.svg          the whole lockup in ink at 20px height (nav)
//
// Decisions (evidence in staging v5/tools/brand/NOTES.md):
//   stroke = the lockup bar's own thickness = 10.06% of the mark height at every size (26.16px at 260, 6.44px at
//   64): the outline keeps the solid mark's silhouette and its bar unchanged. Fill: ink, after the draw.
//
// The draw keyframes this geometry is built for (CSS or WAAPI), from the Intent study recipe §1.7:
//   from { stroke-dasharray: 0 1; stroke-dashoffset: -.5 }  to { stroke-dasharray: 1 0; stroke-dashoffset: 0 }

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
export const LANDING = resolve(here, "..", "..");
export const OUT = join(LANDING, "public", "brand", "v5");
export const INK = "#161815";

const r3 = (n) => +(+n).toFixed(3);
const f = (n) => String(r3(n));

// ------------------------------------------------------------------ path parsing (absolute cubic segments)

/** Parse SVG path data into absolute segments: M, L, C, Z (H/V/S/Q/T and relative forms converted). */
export function parsePath(d) {
  const tok = d.match(/[a-zA-Z]|[-+]?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?/g) ?? [];
  const segs = [];
  let i = 0, cmd = "", x = 0, y = 0, sx = 0, sy = 0, lastC = null, lastQ = null;
  const n = () => parseFloat(tok[i++]);
  while (i < tok.length) {
    if (/^[a-zA-Z]$/.test(tok[i])) cmd = tok[i++];
    const rel = cmd !== cmd.toUpperCase();
    const ox = rel ? x : 0, oy = rel ? y : 0;
    switch (cmd.toUpperCase()) {
      case "M": {
        x = n() + ox; y = n() + oy; sx = x; sy = y;
        segs.push({ c: "M", p: [x, y] });
        cmd = rel ? "l" : "L"; lastC = lastQ = null; break;
      }
      case "L": { const nx = n() + ox, ny = n() + oy; segs.push({ c: "L", from: [x, y], p: [nx, ny] }); x = nx; y = ny; lastC = lastQ = null; break; }
      case "H": { const nx = n() + ox; segs.push({ c: "L", from: [x, y], p: [nx, y] }); x = nx; lastC = lastQ = null; break; }
      case "V": { const ny = n() + oy; segs.push({ c: "L", from: [x, y], p: [x, ny] }); y = ny; lastC = lastQ = null; break; }
      case "C": {
        const a = [n() + ox, n() + oy, n() + ox, n() + oy, n() + ox, n() + oy];
        segs.push({ c: "C", from: [x, y], p: a }); lastC = [a[2], a[3]]; lastQ = null; x = a[4]; y = a[5]; break;
      }
      case "S": {
        const a = [n() + ox, n() + oy, n() + ox, n() + oy];
        const c1 = lastC ? [2 * x - lastC[0], 2 * y - lastC[1]] : [x, y];
        segs.push({ c: "C", from: [x, y], p: [...c1, ...a] }); lastC = [a[0], a[1]]; lastQ = null; x = a[2]; y = a[3]; break;
      }
      case "Q": case "T": {
        const q = cmd.toUpperCase() === "Q" ? [n() + ox, n() + oy] : lastQ ? [2 * x - lastQ[0], 2 * y - lastQ[1]] : [x, y];
        const e = [n() + ox, n() + oy];
        const c1 = [x + (2 / 3) * (q[0] - x), y + (2 / 3) * (q[1] - y)];
        const c2 = [e[0] + (2 / 3) * (q[0] - e[0]), e[1] + (2 / 3) * (q[1] - e[1])];
        segs.push({ c: "C", from: [x, y], p: [...c1, ...c2, ...e] }); lastQ = q; lastC = null; x = e[0]; y = e[1]; break;
      }
      case "Z": { segs.push({ c: "Z", from: [x, y], p: [sx, sy] }); x = sx; y = sy; lastC = lastQ = null; break; }
      default: throw new Error(`unsupported path command ${cmd} in ${d.slice(0, 40)}`);
    }
  }
  return segs;
}

const cubicAt = (p0, p1, p2, p3, t) => { const u = 1 - t; return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3; };
function cubicExtrema(p0, p1, p2, p3) {
  const a = -p0 + 3 * p1 - 3 * p2 + p3, b = 2 * (p0 - 2 * p1 + p2), c = p1 - p0;
  const ts = [];
  if (Math.abs(a) < 1e-12) { if (Math.abs(b) > 1e-12) ts.push(-c / b); }
  else { const disc = b * b - 4 * a * c; if (disc >= 0) { const s = Math.sqrt(disc); ts.push((-b + s) / (2 * a), (-b - s) / (2 * a)); } }
  return ts.filter((t) => t > 0 && t < 1).map((t) => cubicAt(p0, p1, p2, p3, t));
}

/** Exact bounding box of parsed segments (cubic extrema included). */
export function bbox(segs) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  const add = (x, y) => { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); };
  for (const s of segs) {
    if (s.c === "C") {
      const [ax, ay] = s.from; const [b, c, d, e, g, h] = s.p;
      add(g, h); add(ax, ay);
      // each axis' extrema are paired with the start point's other coordinate (a point on the curve), so neither
      // range can be over-extended
      for (const v of cubicExtrema(ax, b, d, g)) add(v, ay);
      for (const v of cubicExtrema(ay, c, e, h)) add(ax, v);
    } else add(s.p[0], s.p[1]);
  }
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0, x1, y1 };
}

// ------------------------------------------------------------------ the lockup

/** Read the lockup SVG: first path = block, second = bar, the rest = letters (checked by fill colour). */
export function readLockup(file = join(LANDING, "public", "brand", "logo-wordmark-onlight.svg")) {
  const src = readFileSync(file, "utf8");
  const paths = [...src.matchAll(/<path\s+d="([^"]+)"\s+fill="([^"]+)"/g)].map((m) => ({ d: m[1], fill: m[2] }));
  if (paths.length !== 7) throw new Error(`expected 7 paths in ${file}, got ${paths.length}`);
  const [block, bar, ...letters] = paths;
  if (block.fill !== bar.fill || letters.some((l) => l.fill === block.fill)) throw new Error("mark/letter split by colour failed");
  const bS = parsePath(block.d), barS = parsePath(bar.d);
  const lS = letters.map((l) => parsePath(l.d));
  const lb = bbox(lS.flat()), mb = bbox(bS), barB = bbox(barS);
  // Block = top edge, left side (2 cubics), bottom edge, right side (2 cubics); the sides bulge inward by `sag`
  const cs = bS.filter((s) => s.c === "C");
  if (cs.length !== 4) throw new Error("block: expected 4 cubics");
  // The top edge is drawn at y=.008 but its right corner touches y=0; the bbox top (0) is used (0.06px at 260px).
  const top = mb.y;
  const bottom = mb.y1, W = mb.w, H = bottom - top, hh = H / 2;
  const sag = cs[0].p[4] - mb.x; // left side bulges inward by this much
  // control-point ratios, averaged over the four half-sides (they agree to 0.002)
  const k = cs.map((s, i) => {
    const [ax, ay] = s.from; const [c1x, c1y, c2x, c2y, ex, ey] = s.p;
    // orient every half-side as "corner -> mid": corner end is the one with the extreme x
    const corner = i % 2 === 0 ? [ax, ay] : [ex, ey];
    const near = i % 2 === 0 ? [c1x, c1y] : [c2x, c2y];
    const far = i % 2 === 0 ? [c2x, c2y] : [c1x, c1y];
    const mid = i % 2 === 0 ? [ex, ey] : [ax, ay];
    const span = Math.abs(mid[1] - corner[1]), dx = Math.abs(mid[0] - corner[0]);
    return { k1: Math.abs(near[0] - corner[0]) / dx, k2: Math.abs(near[1] - corner[1]) / span, k3: Math.abs(far[1] - corner[1]) / span, k4: Math.abs(far[0] - corner[0]) / dx };
  });
  const avg = (key) => k.reduce((a, b) => a + b[key], 0) / k.length;
  const mark = {
    x: mb.x, top, bottom, W, H, hh, sag,
    K1: avg("k1"), K2: avg("k2"), K3: avg("k3"), K4: avg("k4"),
    barTop: barB.y, barBottom: barB.y1, barH: barB.h, gap: barB.y - bottom,
    boxH: barB.y1 - top, // whole mark height (block + gap + bar)
  };
  const letterBox = { ...lb, baseline: bottom };
  const lockup = bbox([...bS, ...barS, ...lS.flat()]);
  return { src: file, block, bar, letters, mark, letterBox, lockup, kSpread: k };
}

// ------------------------------------------------------------------ block outline (inset)

function sideCubic(m, x0, top, sag, hh, dir) {
  // corner (x0, top) -> mid (x0 + dir*sag, top + hh), with the lockup's own control-point ratios K1-K4
  return [x0, top, x0 + dir * m.K1 * sag, top + m.K2 * hh, x0 + dir * m.K4 * sag, top + m.K3 * hh, x0 + dir * sag, top + hh];
}

/** Sample the true offset (inward by s) of the original left side, top half. Returns points (y ascending). */
function offsetLeftTop(m, s, N = 400) {
  const [ax, ay, b, c, d, e, g, h] = sideCubic(m, m.x, m.top, m.sag, m.hh, 1);
  const pts = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N, u = 1 - t;
    const px = cubicAt(ax, b, d, g, t), py = cubicAt(ay, c, e, h, t);
    const tx = 3 * (u * u * (b - ax) + 2 * u * t * (d - b) + t * t * (g - d));
    const ty = 3 * (u * u * (c - ay) + 2 * u * t * (e - c) + t * t * (h - e));
    const L = Math.hypot(tx, ty);
    pts.push([px + (s * ty) / L, py - (s * tx) / L]); // normal (ty, -tx) points to +x (inward) for a downward tangent
  }
  return pts;
}

/**
 * The block outline as a stroke centre line inset by s (= stroke/2), so the stroke's outer edge is the
 * solid block's edge. Returns the corner, the inset side's cubic (lockup curve ratios) and the max deviation
 * between that cubic and the true offset curve (units).
 */
export function insetBlock(m, s) {
  const off = offsetLeftTop(m, s);
  const yTop = m.top + s;
  // corner: where the offset curve crosses the inset top edge
  let cx = off[0][0];
  for (let i = 1; i < off.length; i++) {
    if (off[i - 1][1] <= yTop && off[i][1] >= yTop) {
      const t = (yTop - off[i - 1][1]) / (off[i][1] - off[i - 1][1]);
      cx = off[i - 1][0] + t * (off[i][0] - off[i - 1][0]);
      break;
    }
  }
  const mid = off.at(-1); // (x + sag + s, top + hh)
  const hh = mid[1] - yTop, sag = mid[0] - cx;
  const cub = sideCubic(m, cx, yTop, sag, hh, 1);
  // deviation: for each true offset point below the corner, distance to the fitted cubic (dense sampling)
  const fit = Array.from({ length: 801 }, (_, i) => [cubicAt(cub[0], cub[2], cub[4], cub[6], i / 800), cubicAt(cub[1], cub[3], cub[5], cub[7], i / 800)]);
  let dev = 0;
  for (const p of off) {
    if (p[1] < yTop) continue;
    let best = Infinity;
    for (const q of fit) best = Math.min(best, Math.hypot(p[0] - q[0], p[1] - q[1]));
    dev = Math.max(dev, best);
  }
  return { s, cornerX: cx, top: yTop, bottom: m.bottom - s, midX: mid[0], sag, hh, dev };
}

/** Closed block path, start = top centre, clockwise; its half-length point is the bottom centre. */
export function blockPathD(m, ins) {
  const L = ins.cornerX, R = m.x + m.W - (ins.cornerX - m.x), cx = m.x + m.W / 2;
  const t = ins.top, b = ins.bottom, hh = ins.hh, sag = ins.sag;
  const yMid = t + hh;
  // right side, top half: corner (R, t) -> mid (R - sag, yMid); bottom half mirrored
  const rT = [R - m.K1 * sag, t + m.K2 * hh, R - m.K4 * sag, t + m.K3 * hh, R - sag, yMid];
  const rB = [R - m.K4 * sag, b - m.K3 * hh, R - m.K1 * sag, b - m.K2 * hh, R, b];
  const lB = [L + m.K1 * sag, b - m.K2 * hh, L + m.K4 * sag, b - m.K3 * hh, L + sag, yMid];
  const lT = [L + m.K4 * sag, t + m.K3 * hh, L + m.K1 * sag, t + m.K2 * hh, L, t];
  const C = (a) => `C${a.map(f).join(" ")}`;
  return `M${f(cx)} ${f(t)}H${f(R)}${C(rT)}${C(rB)}H${f(L)}${C(lB)}${C(lT)}Z`;
}

/** The bar as one stroked line, drawn left to right (its centre is its half-length point). */
export function barLine(m, sw, align = "gap") {
  const y = align === "gap" ? m.barTop + sw / 2 : align === "bottom" ? m.barBottom - sw / 2 : (m.barTop + m.barBottom) / 2;
  return { y, d: `M${f(m.x)} ${f(y)}H${f(m.x + m.W)}` };
}

// ------------------------------------------------------------------ SVG writers

const svgOpen = (vb, w, h, extra = "") =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${f(w)}" height="${f(h)}"${extra}>`;

/**
 * Drawable mark. sizePx = rendered height of the whole mark (block + gap + bar); strokePx = stroke width at that
 * size. withFill adds the solid block under the strokes (class bm-fill). The viewBox is the solid mark's box, so
 * every size and the solid mark align the same.
 */
export function outlineMarkSvg(L, { sizePx, strokePx, barAlign = "gap", barStrokePx, comment = true, withFill = false }) {
  const m = L.mark;
  const u = sizePx / m.boxH; // px per unit
  const sw = strokePx / u, bw = (barStrokePx ?? strokePx) / u;
  const ins = insetBlock(m, sw / 2);
  const bar = barLine(m, bw, barAlign);
  const vb = `${f(m.x)} ${f(m.top)} ${f(m.W)} ${f(m.boxH)}`;
  const head = comment
    ? `<!-- Generated by apps/landing/scripts/assets/brand-v5.mjs. mosoo mark, drawable, for a ${sizePx}px-high display: stroke ${r3(strokePx)}px (${r3(sw)} units = the bar's thickness). .bm-block and .bm-bar carry pathLength=1; .bm-block starts at the top centre, so a dash grown from the middle starts at the bottom centre.${withFill ? " .bm-fill is the solid block (end state)." : ""} -->\n`
    : "";
  return (
    head +
    `${svgOpen(vb, m.W * u, m.boxH * u, ` fill="none" stroke="currentColor" color="${INK}" stroke-linejoin="miter" stroke-miterlimit="4" stroke-linecap="butt"`)}\n` +
    (withFill ? `  <path class="bm-fill" d="${L.block.d}" fill="currentColor" stroke="none"/>\n` : "") +
    `  <path class="bm-block" d="${blockPathD(m, ins)}" stroke-width="${f(sw)}" pathLength="1"/>\n` +
    `  <path class="bm-bar" d="${bar.d}" stroke-width="${f(bw)}" pathLength="1"/>\n` +
    `</svg>\n`
  );
}

/** The interior the stroke encloses (stroke centre line), filled, for mask-image (textured-fill trials only; not built). */
export function windowSvg(L, { sizePx, strokePx }) {
  const m = L.mark, u = sizePx / m.boxH, sw = strokePx / u;
  const ins = insetBlock(m, sw / 2);
  const x0 = ins.cornerX, x1 = m.x + m.W - (ins.cornerX - m.x);
  const vb = `${f(x0)} ${f(ins.top)} ${f(x1 - x0)} ${f(ins.bottom - ins.top)}`;
  return (
    `<!-- Generated by apps/landing/scripts/assets/brand-v5.mjs. The block's interior (the outline's stroke centre line at ${sizePx}px / ${r3(strokePx)}px), for mask-image: url(...) 0 0 / 100% 100%. -->\n` +
    `${svgOpen(vb, (x1 - x0) * u, (ins.bottom - ins.top) * u, ` preserveAspectRatio="none"`)}\n` +
    `  <path d="${blockPathD(m, ins)}" fill="#000"/>\n</svg>\n`
  );
}

export function lettersSvg(L) {
  const b = L.letterBox;
  const vb = `${f(b.x)} ${f(b.y)} ${f(b.w)} ${f(b.h)}`;
  return (
    `<!-- Generated by apps/landing/scripts/assets/brand-v5.mjs from logo-wordmark-onlight.svg: the five letters only, tight to the ink. Baseline = viewBox bottom - ${r3(b.y1 - b.baseline)}. -->\n` +
    `${svgOpen(vb, b.w, b.h, ` fill="${INK}"`)}\n` +
    L.letters.map((l) => `  <path d="${l.d}"/>`).join("\n") +
    `\n</svg>\n`
  );
}

export function markSolidSvg(L) {
  const m = L.mark;
  return (
    `<!-- Generated by apps/landing/scripts/assets/brand-v5.mjs: the lockup's mark, solid ink. -->\n` +
    `${svgOpen(`${f(m.x)} ${f(m.top)} ${f(m.W)} ${f(m.boxH)}`, m.W, m.boxH, ` fill="${INK}"`)}\n` +
    `  <path d="${L.block.d}"/>\n  <path d="${L.bar.d}"/>\n</svg>\n`
  );
}

export function navLogoSvg(L, heightPx = 20) {
  const b = L.lockup, u = heightPx / b.h;
  return (
    `<!-- Generated by apps/landing/scripts/assets/brand-v5.mjs: the whole lockup in ink, ${heightPx}px high. -->\n` +
    `${svgOpen(`${f(b.x)} ${f(b.y)} ${f(b.w)} ${f(b.h)}`, b.w * u, heightPx, ` fill="${INK}"`)}\n` +
    [L.block, L.bar, ...L.letters].map((p) => `  <path d="${p.d}"/>`).join("\n") +
    `\n</svg>\n`
  );
}

/** x of the left side of an inset block at height y (units), from its cubic (symmetric about the middle). */
function leftEdgeAt(m, ins) {
  const c = sideCubic(m, ins.cornerX, ins.top, ins.sag, ins.hh, 1);
  const pts = Array.from({ length: 401 }, (_, i) => [cubicAt(c[0], c[2], c[4], c[6], i / 400), cubicAt(c[1], c[3], c[5], c[7], i / 400)]);
  const mid = ins.top + ins.hh;
  return (y) => {
    const yy = y > mid ? 2 * mid - y : y; // mirror the bottom half
    if (yy <= pts[0][1]) return pts[0][0];
    for (let i = 1; i < pts.length; i++) if (pts[i][1] >= yy) {
      const t = (yy - pts[i - 1][1]) / (pts[i][1] - pts[i - 1][1]);
      return pts[i - 1][0] + t * (pts[i][0] - pts[i - 1][0]);
    }
    return pts.at(-1)[0];
  };
}

/**
 * Halftone dot field for the block's interior (owner 10-19: keep the logo's outline, fill the inside freely).
 * Dot radius carries a vertical gradient, largest at the ground and gone at `fadeTop` of the height, like the
 * v4d S3 dot field (d-object.css .d-nest-dots: ink dots that fade from the bottom). Hex grid, symmetric about the
 * mark's axis; only whole dots that clear the frame's inner edge by `clearPx`. Coordinates are CSS px of the
 * fill box at sizePx (the same box as mark-window.svg), so the file is exact as a 100% background.
 */
/* Trial only (not built): the textured fills read as a screen inside the frame (NOTES.md). */
export function dotFieldSvg(L, { sizePx, strokePx, pitchPx = 10, rMax = 0.4, fadeTop = 0.18, gamma = 1.25, minR = 0.45, clearPx, clearBottomPx }) {
  const m = L.mark, u = sizePx / m.boxH, sw = strokePx / u;
  const box = insetBlock(m, sw / 2), inner = insetBlock(m, sw);
  const bx0 = box.cornerX, bx1 = m.x + m.W - (box.cornerX - m.x), by0 = box.top, by1 = box.bottom;
  const Wpx = (bx1 - bx0) * u, Hpx = (by1 - by0) * u;
  const edge = leftEdgeAt(m, inner);
  const clear = clearPx ?? pitchPx * 0.45;
  const rowStep = (pitchPx * Math.sqrt(3)) / 2;
  const clearB = clearBottomPx ?? clear;
  const yStart = (inner.bottom - by0) * u - clearB - rMax * pitchPx; // the lowest row's largest dots clear the frame
  const dots = [];
  for (let k = 0; ; k++) {
    const y = yStart - k * rowStep;
    if (y < 0) break;
    const g = Math.max(0, Math.min(1, (y / Hpx - fadeTop) / (1 - fadeTop))) ** gamma;
    const r = rMax * pitchPx * g;
    if (r < minR) continue;
    const Y = by0 + y / u;
    const xl = Math.max(edge(Y - r / u), edge(Y), edge(Y + r / u)); // the concave side is widest inward mid-height
    const off = k % 2 ? pitchPx / 2 : 0;
    for (let j = -60; j <= 60; j++) {
      const x = Wpx / 2 + j * pitchPx + off;
      const X = bx0 + x / u;
      if (X - (r + clear) / u < xl || X + (r + clear) / u > m.x + m.W - (xl - m.x)) continue;
      if (Y - (r + clear) / u < inner.top || Y + (r + clearB) / u > inner.bottom + 1e-9) continue;
      dots.push([x, y, r]);
    }
  }
  const body = dots.map(([x, y, r]) => `<circle cx="${+x.toFixed(2)}" cy="${+y.toFixed(2)}" r="${+r.toFixed(2)}"/>`).join("");
  return {
    count: dots.length,
    svg:
      `<!-- Generated by apps/landing/scripts/assets/brand-v5.mjs: halftone dot field for the mark interior at ${sizePx}px (pitch ${pitchPx}px, r <= ${r3(rMax * pitchPx)}px, ${dots.length} dots). Same box as mark-window.svg. -->\n` +
      `${svgOpen(`0 0 ${f(Wpx)} ${f(Hpx)}`, Wpx, Hpx, ` fill="${INK}"`)}\n${body}\n</svg>\n`,
  };
}

// ------------------------------------------------------------------ decisions (see staging v5/tools/brand/NOTES.md)

/** Stroke rule: the outline's weight is the lockup bar's own thickness (10.06% of the mark height, 10.01% of its width), at every size. */
export function strokeFor(L, sizePx) {
  return (L.mark.barH / L.mark.boxH) * sizePx;
}

/** Composition numbers for the footer row, as fractions of the mark height --h (CSS: calc(var(--h) * n)). */
export function composition(L) {
  const m = L.mark, b = L.letterBox, u = 1 / m.boxH;
  return {
    markAspect: r3(m.W / m.boxH), // mark box width / height
    lettersAspect: r3(b.w / b.h), // letters box width / height
    lettersH: +(b.h * u).toFixed(4), // letters ink height / --h
    lettersLift: +((m.top + m.boxH - b.y1) * u).toFixed(4), // lockup baseline: letters' ink bottom above the mark bottom / --h
    lockupGap: +((b.x - (m.x + m.W)) * u).toFixed(4), // mark -> letters gap in the lockup / --h
    lettersW: +(b.w * u).toFixed(4), // letters width / --h
    stroke: +((m.barH / m.boxH)).toFixed(4), // stroke / --h
    rise: +(120 / 260).toFixed(4), // rise distance / --h (Intent: 120px at a 260px logo)
  };
}

// ------------------------------------------------------------------ main

export function build({ ts } = {}) {
  const L = readLockup();
  mkdirSync(OUT, { recursive: true });
  const files = {};
  const put = (name, body) => { writeFileSync(join(OUT, name), body); files[name] = Buffer.byteLength(body); };
  for (const size of [260, 64]) {
    put(`mark-draw-${size}.svg`, outlineMarkSvg(L, { sizePx: size, strokePx: strokeFor(L, size), withFill: true }));
  }
  put("mosoo-letters.svg", lettersSvg(L));
  put("mark-solid.svg", markSolidSvg(L));
  put("logo-nav.svg", navLogoSvg(L, 20));
  if (ts) {
    const m = L.mark, sw = m.barH, ins = insetBlock(m, sw / 2);
    const body =
      "// Generated by apps/landing/scripts/assets/brand-v5.mjs. Do not edit.\n" +
      `export const BRAND_MARK = ${JSON.stringify({ vb: [r3(m.x), r3(m.top), r3(m.W), r3(m.boxH)], fill: L.block.d, block: blockPathD(m, ins), bar: barLine(m, sw).d, stroke: r3(sw) })} as const;\n` +
      `export const BRAND_LETTERS = ${JSON.stringify({ vb: [r3(L.letterBox.x), r3(L.letterBox.y), r3(L.letterBox.w), r3(L.letterBox.h)], d: L.letters.map((l) => l.d) })} as const;\n` +
      `export const BRAND_FOOTER = ${JSON.stringify(composition(L))} as const;\n`;
    writeFileSync(resolve(ts), body);
    files[ts] = Buffer.byteLength(body);
  }
  return { L, files };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const i = process.argv.indexOf("--ts");
  const { L, files } = build({ ts: i > 0 ? process.argv[i + 1] : undefined });
  const ins = insetBlock(L.mark, L.mark.barH / 2);
  console.log(JSON.stringify({ out: OUT, files, mark: Object.fromEntries(Object.entries(L.mark).map(([k, v]) => [k, r3(v)])), letters: Object.fromEntries(Object.entries(L.letterBox).map(([k, v]) => [k, r3(v)])), insetDevUnits: +ins.dev.toFixed(5), composition: composition(L) }, null, 1));
}
