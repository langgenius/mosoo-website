// Deterministic hand-drawn strokes (an original, seeded implementation of the
// familiar "sketchy" look: every line is drawn twice with slightly different
// wobble, corners overshoot a little, fills are hatched).
// No randomness escapes the seed, so exports are byte-stable.
import { rng } from "./prng.mjs";
import { el, n } from "./svg.mjs";

export function createRough({ seed, stroke = "#141713", width = 4.2, roughness = 1 }) {
  let counter = 0;
  const next = (key) => rng(`${seed}:rough:${key ?? counter++}`);

  function linePass(r, x1, y1, x2, y2, amount) {
    const len = Math.hypot(x2 - x1, y2 - y1);
    const off = Math.min(amount, len / 10) * roughness;
    const j = (k = 1) => r.range(-off, off) * k;
    const bow = r.range(-1, 1) * off * 1.6;
    const nx = -(y2 - y1) / (len || 1);
    const ny = (x2 - x1) / (len || 1);
    const d1 = 0.28 + r.range(0, 0.18);
    const d2 = 0.62 + r.range(0, 0.18);
    const sx = x1 + j();
    const sy = y1 + j();
    const ex = x2 + j();
    const ey = y2 + j();
    return `M${n(sx)} ${n(sy)}C${n(x1 + (x2 - x1) * d1 + nx * bow + j(0.6))} ${n(y1 + (y2 - y1) * d1 + ny * bow + j(0.6))} ${n(x1 + (x2 - x1) * d2 + nx * bow + j(0.6))} ${n(
      y1 + (y2 - y1) * d2 + ny * bow + j(0.6),
    )} ${n(ex)} ${n(ey)}`;
  }

  /** Path data for a sketched straight line (two passes). */
  function lineD(x1, y1, x2, y2, { key = null, passes = 2, amount = 3.2 } = {}) {
    const r = next(key);
    let d = "";
    for (let p = 0; p < passes; p += 1) d += linePass(r, x1, y1, x2, y2, amount * (p === 0 ? 1 : 0.7));
    return d;
  }

  function polylineD(points, opts = {}) {
    let d = "";
    for (let i = 1; i < points.length; i += 1) d += lineD(points[i - 1][0], points[i - 1][1], points[i][0], points[i][1], { ...opts, key: opts.key ? `${opts.key}:${i}` : null });
    return d;
  }

  /** Closed loop through points, smoothed, drawn twice with a little overshoot. */
  function loopD(points, { key = null, amount = 2.6, passes = 2 } = {}) {
    const r = next(key);
    let d = "";
    for (let p = 0; p < passes; p += 1) {
      const pts = points.map(([x, y]) => [x + r.range(-amount, amount) * roughness, y + r.range(-amount, amount) * roughness]);
      const len = pts.length;
      const shift = r.int(0, len - 1);
      const seq = [];
      for (let i = 0; i <= len + 1; i += 1) seq.push(pts[(i + shift) % len]);
      d += `M${n(seq[0][0])} ${n(seq[0][1])}`;
      for (let i = 0; i < seq.length - 1; i += 1) {
        const p0 = seq[Math.max(0, i - 1)];
        const p1 = seq[i];
        const p2 = seq[i + 1];
        const p3 = seq[Math.min(seq.length - 1, i + 2)];
        const k = 1 / 6;
        d += `C${n(p1[0] + (p2[0] - p0[0]) * k)} ${n(p1[1] + (p2[1] - p0[1]) * k)} ${n(p2[0] - (p3[0] - p1[0]) * k)} ${n(p2[1] - (p3[1] - p1[1]) * k)} ${n(p2[0])} ${n(p2[1])}`;
      }
    }
    return d;
  }

  const ellipsePoints = (cx, cy, rx, ry, count = 14) => Array.from({ length: count }, (_, i) => [cx + Math.cos((i / count) * Math.PI * 2) * rx, cy + Math.sin((i / count) * Math.PI * 2) * ry]);

  function roundedRectPoints(x, y, w, h, radius) {
    const rr = Math.min(radius, w / 2, h / 2);
    const pts = [];
    const corner = (cx, cy, start) => {
      for (let i = 0; i <= 3; i += 1) {
        const a = start + (i / 3) * (Math.PI / 2);
        pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
      }
    };
    const edge = (x1, y1, x2, y2, steps) => {
      for (let i = 1; i < steps; i += 1) pts.push([x1 + ((x2 - x1) * i) / steps, y1 + ((y2 - y1) * i) / steps]);
    };
    corner(x + w - rr, y + rr, -Math.PI / 2);
    edge(x + w, y + rr, x + w, y + h - rr, Math.max(2, Math.round(h / 90)));
    corner(x + w - rr, y + h - rr, 0);
    edge(x + w - rr, y + h, x + rr, y + h, Math.max(2, Math.round(w / 90)));
    corner(x + rr, y + h - rr, Math.PI / 2);
    edge(x, y + h - rr, x, y + rr, Math.max(2, Math.round(h / 90)));
    corner(x + rr, y + rr, Math.PI);
    edge(x + rr, y, x + w - rr, y, Math.max(2, Math.round(w / 90)));
    return pts;
  }

  /** Hatch a convex-ish polygon with parallel sketched lines. */
  function hachureD(polygon, { key = null, angle = -0.72, gap = 13, amount = 1.6, inset = 3 } = {}) {
    const r = next(key);
    const cos = Math.cos(-angle);
    const sin = Math.sin(-angle);
    const rot = polygon.map(([x, y]) => [x * cos - y * sin, x * sin + y * cos]);
    const ys = rot.map((p) => p[1]);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    let d = "";
    for (let y = minY + gap * 0.6; y < maxY; y += gap) {
      const xs = [];
      for (let i = 0; i < rot.length; i += 1) {
        const a = rot[i];
        const b = rot[(i + 1) % rot.length];
        if ((a[1] <= y && b[1] > y) || (b[1] <= y && a[1] > y)) xs.push(a[0] + ((y - a[1]) / (b[1] - a[1])) * (b[0] - a[0]));
      }
      xs.sort((p, q) => p - q);
      for (let i = 0; i + 1 < xs.length; i += 2) {
        const x1 = xs[i] + inset;
        const x2 = xs[i + 1] - inset;
        if (x2 - x1 < 6) continue;
        const back = (px, py) => [px * Math.cos(angle) - py * Math.sin(angle), px * Math.sin(angle) + py * Math.cos(angle)];
        const [ax, ay] = back(x1, y);
        const [bx, by] = back(x2, y);
        d += linePass(r, ax, ay, bx, by, amount);
      }
    }
    return d;
  }

  const style = (d, { color = stroke, w = width, opacity = null, hook = null, dash = null, attrs = {} } = {}) =>
    el("path", { d, fill: "none", stroke: color, "stroke-width": w, "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-opacity": opacity, "stroke-dasharray": dash, "data-el": hook, ...attrs });

  // ---- drawable primitives (return SVG markup) -------------------------------
  const line = (x1, y1, x2, y2, o = {}) => style(lineD(x1, y1, x2, y2, o), o);
  const polyline = (points, o = {}) => style(polylineD(points, o), o);
  const ellipse = (cx, cy, rx, ry, o = {}) => style(loopD(ellipsePoints(cx, cy, rx, ry, o.points ?? 14), o), o);
  const loop = (points, o = {}) => style(loopD(points, o), o);

  function rect(x, y, w, h, o = {}) {
    const { radius = 0, fill = null, fillOpacity = 1, hatch = null, hatchGap = 13, hatchAngle = -0.72, hatchWidth = 2.4, hatchOpacity = 0.9 } = o;
    const pts = radius > 0 ? roundedRectPoints(x, y, w, h, radius) : [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
    const outline = radius > 0 ? loopD(pts, o) : polylineD([...pts, pts[0]], o);
    return [
      fill ? el("path", { d: `M${pts.map((p) => `${n(p[0])} ${n(p[1])}`).join("L")}Z`, fill, "fill-opacity": fillOpacity }) : "",
      hatch ? style(hachureD(pts, { key: o.key ? `${o.key}:hatch` : null, gap: hatchGap, angle: hatchAngle }), { color: hatch, w: hatchWidth, opacity: hatchOpacity }) : "",
      style(outline, o),
    ].join("");
  }

  function arrow(points, o = {}) {
    const { head = 20 } = o;
    const [px, py] = points[points.length - 2];
    const [ex, ey] = points[points.length - 1];
    const ang = Math.atan2(ey - py, ex - px);
    const h1 = [ex + Math.cos(ang + Math.PI - 0.46) * head, ey + Math.sin(ang + Math.PI - 0.46) * head];
    const h2 = [ex + Math.cos(ang + Math.PI + 0.46) * head, ey + Math.sin(ang + Math.PI + 0.46) * head];
    const d = polylineD(points, o) + lineD(h1[0], h1[1], ex, ey, { passes: 1, key: o.key ? `${o.key}:h1` : null }) + lineD(h2[0], h2[1], ex, ey, { passes: 1, key: o.key ? `${o.key}:h2` : null });
    return style(d, o);
  }

  /** Smooth open curve through points (used for wires, swooshes). */
  function curve(points, o = {}) {
    const r = next(o.key);
    let d = "";
    for (let p = 0; p < 2; p += 1) {
      const pts = points.map(([x, y]) => [x + r.range(-2.2, 2.2) * roughness, y + r.range(-2.2, 2.2) * roughness]);
      d += `M${n(pts[0][0])} ${n(pts[0][1])}`;
      for (let i = 0; i < pts.length - 1; i += 1) {
        const p0 = pts[Math.max(0, i - 1)];
        const p1 = pts[i];
        const p2 = pts[i + 1];
        const p3 = pts[Math.min(pts.length - 1, i + 2)];
        const k = 1 / 6;
        d += `C${n(p1[0] + (p2[0] - p0[0]) * k)} ${n(p1[1] + (p2[1] - p0[1]) * k)} ${n(p2[0] - (p3[0] - p1[0]) * k)} ${n(p2[1] - (p3[1] - p1[1]) * k)} ${n(p2[0])} ${n(p2[1])}`;
      }
    }
    return style(d, o);
  }

  return { line, polyline, rect, ellipse, loop, arrow, curve, lineD, polylineD, loopD, hachureD, style, roundedRectPoints, ellipsePoints };
}
