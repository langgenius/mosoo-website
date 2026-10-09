import { n } from "./svg.mjs";

/** Rounded rectangle path (absolute coords). Radius is clamped. */
export function roundedRectPath(x, y, w, h, r) {
  const rr = Math.max(0, Math.min(r, w / 2, h / 2));
  return [
    `M${n(x + rr)} ${n(y)}`,
    `H${n(x + w - rr)}`,
    `A${n(rr)} ${n(rr)} 0 0 1 ${n(x + w)} ${n(y + rr)}`,
    `V${n(y + h - rr)}`,
    `A${n(rr)} ${n(rr)} 0 0 1 ${n(x + w - rr)} ${n(y + h)}`,
    `H${n(x + rr)}`,
    `A${n(rr)} ${n(rr)} 0 0 1 ${n(x)} ${n(y + h - rr)}`,
    `V${n(y + rr)}`,
    `A${n(rr)} ${n(rr)} 0 0 1 ${n(x + rr)} ${n(y)}`,
    "Z",
  ].join("");
}

/**
 * Superellipse ("squircle") path — the large, continuous-curvature corner used for
 * the signature icon tile. exponent 4..5 reads as a soft app-icon shape.
 */
export function squirclePath(cx, cy, size, exponent = 4.6, steps = 72) {
  const a = size / 2;
  const pts = [];
  for (let i = 0; i < steps; i += 1) {
    const t = (i / steps) * Math.PI * 2;
    const ct = Math.cos(t);
    const st = Math.sin(t);
    const x = cx + a * Math.sign(ct) * Math.abs(ct) ** (2 / exponent);
    const y = cy + a * Math.sign(st) * Math.abs(st) ** (2 / exponent);
    pts.push([x, y]);
  }
  return closedSmoothPath(pts, 0.5);
}

/** Closed Catmull-Rom spline through points, emitted as cubic Béziers. */
export function closedSmoothPath(points, tension = 0.5) {
  const len = points.length;
  const k = tension / 3;
  let d = `M${n(points[0][0])} ${n(points[0][1])}`;
  for (let i = 0; i < len; i += 1) {
    const p0 = points[(i - 1 + len) % len];
    const p1 = points[i];
    const p2 = points[(i + 1) % len];
    const p3 = points[(i + 2) % len];
    const c1x = p1[0] + (p2[0] - p0[0]) * k * 2;
    const c1y = p1[1] + (p2[1] - p0[1]) * k * 2;
    const c2x = p2[0] - (p3[0] - p1[0]) * k * 2;
    const c2y = p2[1] - (p3[1] - p1[1]) * k * 2;
    d += `C${n(c1x)} ${n(c1y)} ${n(c2x)} ${n(c2y)} ${n(p2[0])} ${n(p2[1])}`;
  }
  return `${d}Z`;
}

/** Open Catmull-Rom spline through points. */
export function openSmoothPath(points, tension = 0.5) {
  const len = points.length;
  const k = (tension / 3) * 2;
  let d = `M${n(points[0][0])} ${n(points[0][1])}`;
  for (let i = 0; i < len - 1; i += 1) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(len - 1, i + 2)];
    d += `C${n(p1[0] + (p2[0] - p0[0]) * k)} ${n(p1[1] + (p2[1] - p0[1]) * k)} ${n(
      p2[0] - (p3[0] - p1[0]) * k,
    )} ${n(p2[1] - (p3[1] - p1[1]) * k)} ${n(p2[0])} ${n(p2[1])}`;
  }
  return d;
}

/** Organic closed blob around (cx, cy); radii jittered by a seeded rng. */
export function blobPath(random, cx, cy, rx, ry, { points = 9, jitter = 0.22, rotate = 0 } = {}) {
  const pts = [];
  const phase = random.range(0, Math.PI * 2);
  for (let i = 0; i < points; i += 1) {
    const t = phase + (i / points) * Math.PI * 2;
    const k = 1 + random.range(-jitter, jitter);
    const px = Math.cos(t) * rx * k;
    const py = Math.sin(t) * ry * k;
    const cr = Math.cos(rotate);
    const sr = Math.sin(rotate);
    pts.push([cx + px * cr - py * sr, cy + px * sr + py * cr]);
  }
  return closedSmoothPath(pts, 0.5);
}

/** Orthogonal/any polyline with rounded corners. Returns path data. */
export function roundedPolyline(points, radius = 18) {
  if (points.length < 2) return "";
  let d = `M${n(points[0][0])} ${n(points[0][1])}`;
  for (let i = 1; i < points.length - 1; i += 1) {
    const [px, py] = points[i - 1];
    const [cx, cy] = points[i];
    const [nx, ny] = points[i + 1];
    const d1 = Math.hypot(cx - px, cy - py);
    const d2 = Math.hypot(nx - cx, ny - cy);
    const r = Math.min(radius, d1 / 2, d2 / 2);
    const ax = cx - ((cx - px) / d1) * r;
    const ay = cy - ((cy - py) / d1) * r;
    const bx = cx + ((nx - cx) / d2) * r;
    const by = cy + ((ny - cy) / d2) * r;
    d += `L${n(ax)} ${n(ay)}Q${n(cx)} ${n(cy)} ${n(bx)} ${n(by)}`;
  }
  const last = points[points.length - 1];
  return `${d}L${n(last[0])} ${n(last[1])}`;
}

/** Sample a polyline into evenly spaced points (used for motion keyframes). */
export function samplePolyline(points, count) {
  const segs = [];
  let total = 0;
  for (let i = 1; i < points.length; i += 1) {
    const length = Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]);
    segs.push({ from: points[i - 1], to: points[i], length });
    total += length;
  }
  const out = [];
  for (let s = 0; s < count; s += 1) {
    let dist = (s / (count - 1)) * total;
    let seg = segs[0];
    for (const candidate of segs) {
      seg = candidate;
      if (dist <= candidate.length) break;
      dist -= candidate.length;
    }
    const t = seg.length === 0 ? 0 : Math.min(1, dist / seg.length);
    out.push([seg.from[0] + (seg.to[0] - seg.from[0]) * t, seg.from[1] + (seg.to[1] - seg.from[1]) * t]);
  }
  return out;
}

export const lerp = (a, b, t) => a + (b - a) * t;
