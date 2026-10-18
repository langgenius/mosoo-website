// Bamboo geometry derived from the mosoo mark, and the scenes built from it.
//
// Source of truth: apps/landing/public/brand/brand-mark.svg (the same proportions
// as the mark inside logo-wordmark-*.svg). In mark units (width 45.68):
//   internode  0..36.32, sides pinched inward by 1.31 at mid-height
//              (cubic: c .83,5.28 1.31,11.5 1.31,18.16, then mirrored)
//   gap        36.32..41.09
//   node ring  41.09..45.68 (a full-width band)
// (The favicon logo-mark.svg uses a tighter gap 0.0705 and a heavier ring 0.1345,
// an optical variant for small sizes; the culms follow the lockup proportions.)

import { Field, clamp01, noise2, rng, smoothstep } from "./raster.mjs";

const MARK_WIDTH = 45.68;
export const NODE = {
  internode: 36.32 / MARK_WIDTH, // 0.795: the mark's internode is squat; culms stretch it
  waist: 1.31 / MARK_WIDTH, // 0.0287 of the width, per side, at mid-height
  c1: [0.83 / 1.31, 5.28 / 36.32], // first control point (x: fraction of the waist, y: of the internode)
  c2: [1, 11.5 / 36.32],
  gap: 4.77 / MARK_WIDTH, // 0.104
  band: 4.59 / MARK_WIDTH, // 0.100
};

/** Pinch of the internode side at relative height t (0 top .. 1 bottom), 0..1 of NODE.waist. */
export const waistProfile = (() => {
  const pts = [];
  const [c1x, c1y] = NODE.c1;
  const [c2x, c2y] = NODE.c2;
  for (let i = 0; i <= 64; i++) {
    const s = i / 64;
    const m = 1 - s;
    pts.push([3 * m * m * s * c1y + 3 * m * s * s * c2y + s * s * s * 0.5, 3 * m * m * s * c1x + 3 * m * s * s * c2x + s * s * s]);
  }
  return (t) => {
    const h = t > 0.5 ? 1 - t : t;
    for (let i = 1; i < pts.length; i++) {
      if (pts[i][0] >= h) {
        const [y0, x0] = pts[i - 1];
        const [y1, x1] = pts[i];
        return x0 + ((x1 - x0) * (h - y0)) / (y1 - y0 || 1);
      }
    }
    return 1;
  };
})();

/**
 * Vertical layout of a culm from its base upward. Each node is gap + ring + gap
 * (the mark's gap on both sides, so stacked marks read as rings). Heights are
 * measured upward from the base: { kind: "gap" | "ring" | "internode", from, to }.
 * `minGap` and `minBand` (px) open up thin culms optically, so their nodes
 * survive the halftone screen; pass values proportional to the render scale to
 * keep narrow renders true crops of wide ones.
 */
export function culmSegments(width, internodes, { minGap = 1, minBand = 1 } = {}) {
  const gap = Math.max(minGap, NODE.gap * width);
  const band = Math.max(minBand, NODE.band * width);
  const segs = [];
  let y = 0;
  for (const length of internodes) {
    segs.push({ kind: "gap", from: y, to: (y += gap) });
    segs.push({ kind: "ring", from: y, to: (y += band) });
    segs.push({ kind: "gap", from: y, to: (y += gap) });
    segs.push({ kind: "internode", from: y, to: (y += length) });
  }
  return segs;
}

/** Internode lengths (in widths): shorter near the base, longer toward mid-culm. */
export function internodeRun(rand, width, count, { min = 2.6, max = 4.6 } = {}) {
  return Array.from({ length: count }, (_, i) => width * (min + (max - min) * Math.min(1, i / 6)) * rand.range(0.92, 1.08));
}

/**
 * Paint a culm. `c` = { x, base, top, width, lean, bow, tone, ringTone, shade,
 * internodes, offset, seed, fade, minGap, minBand } in pixels. `lean` shifts x
 * per px of height, `bow` adds a quadratic curve, `offset` slides the node
 * pattern, `seed` varies the internode tints, `fade` dissolves the top over that
 * many px instead of cutting it flat, `minGap`/`minBand` see culmSegments. Gaps
 * stay unpainted, as in the mark. Returns ring positions (image y, top y0 and
 * bottom y1) and the centre-line function.
 */
export function paintCulm(field, c) {
  const segs = culmSegments(c.width, c.internodes, { minGap: c.minGap, minBand: c.minBand });
  const half = c.width / 2;
  const span = c.base - c.top;
  const offset = c.offset ?? 0;
  const fade = c.fade ?? 0;
  const centre = (py) => {
    const h = (c.base - py) / span;
    return c.x + c.lean * (c.base - py) + (c.bow ?? 0) * h * h * span;
  };
  const reach = (Math.abs(c.lean) + Math.abs(c.bow ?? 0)) * span + half + 2;
  const jitter = rng(c.seed ?? 1);
  for (const s of segs) s.jitter = s.kind === "internode" ? jitter.range(0.92, 1.06) : 1;
  let cursor = 0;
  const segmentAt = (h) => {
    if (h < 0) return null;
    while (cursor > 0 && segs[cursor].from > h) cursor--;
    while (cursor < segs.length - 1 && segs[cursor].to <= h) cursor++;
    const s = segs[cursor];
    return h >= s.from && h < s.to ? s : null;
  };
  // Rows are visited top to bottom; cache the per-row lookups.
  let rowY = Number.NaN;
  let rowSeg = null;
  let rowCx = 0;
  let rowHw = 0;
  let rowTone = 0;
  let rowAy = 0;
  const row = (py) => {
    if (py === rowY) return;
    rowY = py;
    const h = c.base - py + offset;
    rowSeg = segmentAt(h);
    rowCx = centre(py);
    rowHw = half;
    if (!rowSeg || rowSeg.kind === "gap") return;
    const t = (rowSeg.to - h) / (rowSeg.to - rowSeg.from); // 0 at the segment top
    let tone = c.tone * rowSeg.jitter;
    if (rowSeg.kind === "internode") {
      rowHw -= NODE.waist * c.width * waistProfile(t);
      tone *= 0.8 + 0.2 * smoothstep(0, 0.28, t); // the pale band under each node
    } else {
      tone = c.ringTone ?? c.tone;
    }
    rowTone = tone;
    rowAy = clamp01(Math.min(h - rowSeg.from, rowSeg.to - h) + 0.5) * (fade ? smoothstep(c.top, c.top + fade, py) : 1);
  };
  const shade = c.shade ?? 0;
  field.paint(
    [c.x - reach, c.top, c.x + reach, c.base],
    (px, py) => {
      row(py);
      if (!rowSeg || rowSeg.kind === "gap") return 0;
      return clamp01(rowHw - Math.abs(px - rowCx) + 0.5) * rowAy;
    },
    (px) => {
      const u = (px - rowCx) / half; // -1..1 across the culm
      return rowTone * (1 + shade * (u * u - 0.33) + shade * 0.4 * u); // rims darker, light from the left
    },
  );
  const rings = segs
    .filter((s) => s.kind === "ring")
    .map((s) => ({ y0: c.base - s.to + offset, y1: c.base - s.from + offset }));
  return { rings, centre };
}

/** Paint one node ring of a culm (from paintCulm) into a separate field: the lime plate. */
export function paintRing(field, ring, centre, width) {
  field.paint(
    [centre(ring.y0) - width, ring.y0 - 2, centre(ring.y0) + width, ring.y1 + 2],
    (px, py) => clamp01(width / 2 - Math.abs(px - centre(py)) + 0.5) * clamp01(Math.min(py - ring.y0, ring.y1 - py) + 0.5),
    1,
  );
}

/** Node-pattern offset that puts a ring's lower edge exactly at image y `at`. */
export function offsetForRing(width, internodes, base, at) {
  const want = base - at;
  return culmSegments(width, internodes).find((s) => s.kind === "ring" && s.from >= want).from - want;
}

/**
 * Paint a lanceolate leaf from (x, y) along `angle` (radians, y down), with a
 * blade `length`, max `width` and `droop` bending the tip toward the ground.
 */
export function paintLeaf(field, { x, y, angle, length, width, droop = 0.08, tone, halo = 0 }) {
  const ca = Math.cos(angle);
  const sa = Math.sin(angle);
  const pad = width + length * Math.abs(droop) + halo + 2;
  const ex = x + ca * length;
  const ey = y + sa * length;
  const side = ca >= 0 ? 1 : -1; // bend toward the ground whichever way the blade points
  const bbox = [Math.min(x, ex) - pad, Math.min(y, ey) - pad, Math.max(x, ex) + pad, Math.max(y, ey) + pad];
  const blade = (grow) => (px, py) => {
    const dx = px - x;
    const dy = py - y;
    const s = dx * ca + dy * sa;
    if (s < -grow || s > length + grow) return 0;
    const t = clamp01(s / length);
    const n = -dx * sa + dy * ca;
    const bend = droop * length * t * t * side;
    const prof = Math.pow(Math.sin(Math.PI * Math.pow(t, 0.55)), 1.2) * (1 - 0.25 * t); // short stalk, long tip
    return clamp01((width / 2) * prof + grow - Math.abs(n - bend) + 0.5);
  };
  // A paper keyline first, so overlapping blades and culms stay legible.
  if (halo > 0) field.paint(bbox, blade(halo), 0);
  field.paint(bbox, blade(0), tone);
}

/** Thin twig, tapering toward its end. */
export function paintTwig(field, { x0, y0, x1, y1, width, tone }) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const len2 = dx * dx + dy * dy || 1;
  const pad = width + 2;
  field.paint(
    [Math.min(x0, x1) - pad, Math.min(y0, y1) - pad, Math.max(x0, x1) + pad, Math.max(y0, y1) + pad],
    (px, py) => {
      const t = clamp01(((px - x0) * dx + (py - y0) * dy) / len2);
      return clamp01((width * (1 - 0.4 * t)) / 2 - Math.hypot(x0 + dx * t - px, y0 + dy * t - py) + 0.5);
    },
    tone,
  );
}

/**
 * A leaf group in the classic arrangement (the 个 / 介 shapes of ink bamboo):
 * 3-4 blades radiating from one twig tip, hanging around `angle`.
 */
export function paintLeafGroup(field, rand, { x, y, angle, size, tone, count, halo = 0 }) {
  const n = count ?? 3 + Math.floor(rand() * 2);
  const fan = rand.range(1.5, 2.1);
  // Uneven slots: one long lead blade, the others shorter and splayed.
  const lead = Math.floor(rand() * n);
  for (let i = 0; i < n; i++) {
    const slot = n === 1 ? 0 : i / (n - 1) - 0.5;
    const spread = slot * fan + rand.range(-0.12, 0.12) * fan;
    const length = size * (i === lead ? rand.range(0.98, 1.1) : rand.range(0.62, 0.9));
    const along = rand.range(0, 0.1) * size; // blades leave the twig from staggered points
    paintLeaf(field, {
      x: x + Math.cos(angle) * along,
      y: y + Math.sin(angle) * along,
      angle: angle + spread,
      length,
      width: length * rand.range(0.14, 0.17),
      droop: rand.range(0.04, 0.14),
      tone: tone * rand.range(0.94, 1.06),
      halo,
    });
  }
}

/**
 * A spray: a jointed twig from (x, y) along `angle`, with a leaf group hanging
 * from each joint and from the tip.
 */
export function paintSpray(field, rand, { x, y, angle, length, size, tone, groups = 3, halo = 0 }) {
  let px = x;
  let py = y;
  let a = angle;
  const toward = Math.cos(angle) >= 0 ? 1 : -1;
  for (let j = 1; j <= groups; j++) {
    a += rand.range(-0.22, 0.22) + 0.06 * toward; // joints kink and sag
    const seg = (length / groups) * rand.range(0.85, 1.15);
    const nx = px + Math.cos(a) * seg;
    const ny = py + Math.sin(a) * seg;
    paintTwig(field, { x0: px, y0: py, x1: nx, y1: ny, width: Math.max(1.4, size * 0.03), tone });
    px = nx;
    py = ny;
    const hang = Math.PI / 2 - toward * rand.range(0.25, 0.6); // down, a little toward the twig's heading
    paintLeafGroup(field, rand, { x: px, y: py, angle: hang, size: size * (1 - 0.1 * (j - 1)), tone, halo });
  }
}

// ---------------------------------------------------------------------------
// Scenes. Geometry is authored in design units and scaled by k.
// ---------------------------------------------------------------------------

const PAPER_TONES = { mist: 0.034, far: 0.09, mid: 0.17, near: 0.27, leaf: 0.25 };

/**
 * Hero product-stage plate (16:10, design space 1600 x 1000): a calm grove with
 * culms gathered at the left and right edges, leaf sprays hanging into the top
 * corners, a quiet dot-field mist along the ground, the centre kept light for a
 * product shell. Returns { field, accent } (accent: one ring, when `accentRing`).
 */
export function grovePlate({ width, height, seed = 7, tones = PAPER_TONES, calm = 0.55, accentRing = false }) {
  const k = width / 1600;
  const rand = rng(seed);
  const n = noise2(seed + 11);
  const field = new Field(width, height);
  const accent = new Field(width, height);
  // Quiet dot field: a ground mist that thins upward and swells organically.
  field.fill((x, y) => tones.mist * smoothstep(0.3 * height, height, y) * (0.75 + 0.5 * n.fbm(x / (420 * k), y / (300 * k), 3)));

  const centre = (px) => Math.exp(-(((px / k - 800) / 340) ** 2));
  const culm = (layer, x, w, tone, extra = {}) =>
    paintCulm(layer, {
      x: x * k,
      base: height + 30 * k,
      top: -30 * k,
      width: w * k,
      lean: rand.range(-0.014, 0.014),
      bow: rand.range(-0.02, 0.02),
      tone,
      ringTone: tone * 1.08,
      shade: 0,
      internodes: internodeRun(rand, w * k, 40, { min: 3.6, max: 5.2 }),
      offset: rand.range(0, 5) * w * k,
      seed: Math.round(x * 31 + w * 7), // design units: every render size gets the same tints
      ...extra,
    });

  // Far: thin culms in loose clumps (bamboo grows from running rhizomes), softened,
  // quieter in the centre.
  const far = new Field(width, height, { layer: true });
  for (const [cx, count, spread] of [[110, 3, 70], [340, 2, 50], [560, 3, 90], [790, 2, 60], [1010, 3, 80], [1220, 2, 50], [1440, 3, 70]]) {
    for (let i = 0; i < count; i++) {
      const fx = cx + rand.range(-spread, spread);
      const depth = rand.range(0.55, 1);
      culm(far, fx, rand.range(7, 19) * depth, tones.far * depth * (1 - 0.4 * calm * centre(fx * k)), { lean: rand.range(-0.022, 0.022) });
    }
  }
  far.blur(2.5 * k);
  field.composite(far);

  // Mid: a few culms toward each side, lightly softened, with small sprays.
  const mid = new Field(width, height, { layer: true });
  for (const [x, w] of [[152, 34], [264, 22], [428, 18], [1120, 20], [1234, 30], [1404, 24]]) {
    const tone = tones.mid * rand.range(0.92, 1.06) * (1 - calm * 0.5 * centre(x * k));
    const { rings, centre: cx } = culm(mid, x, w, tone);
    const ring = rings.find((r) => r.y1 > 150 * k && r.y1 < 320 * k);
    if (ring && (x < 300 || x > 1200)) {
      const toward = x < 800 ? 1 : -1;
      paintSpray(mid, rand, {
        x: cx(ring.y1) + toward * w * k * 0.4,
        y: ring.y1,
        angle: toward > 0 ? rand.range(0.15, 0.4) : Math.PI - rand.range(0.15, 0.4),
        length: rand.range(70, 100) * k,
        size: rand.range(62, 74) * k,
        tone: tone * 0.95,
        groups: 2,
      });
    }
  }
  mid.blur(1 * k);
  field.composite(mid);

  // Near: crisp culms cropped by the frame, sprays hanging into the top corners.
  const near = new Field(width, height, { layer: true });
  const nearCulms = [[30, 86, 1], [1338, 42, 0.86], [1532, 96, 1]].map(([x, w, d]) => [x, w, culm(near, x, w, tones.near * d * rand.range(0.96, 1.04), { shade: 0.22 })]);
  for (const [x, y, angle, length, size, groups] of [
    [-40, -30, 0.38, 330, 124, 3], [170, -50, 0.92, 210, 108, 2], [330, -26, 0.6, 150, 92, 2],
    [1660, -24, Math.PI - 0.42, 350, 130, 3], [1480, -54, Math.PI - 0.9, 230, 112, 2], [1300, -20, Math.PI - 0.62, 150, 90, 2],
  ]) {
    paintSpray(near, rand, { x: x * k, y: y * k, angle, length: length * k, size: size * k, tone: tones.leaf, groups, halo: 4 * k });
  }
  field.composite(near);

  if (accentRing) {
    // One ring of the right-edge culm, about a third of the way down.
    const [, w, { rings, centre: cx }] = nearCulms[2];
    const ring = rings.find((r) => r.y0 > height * 0.28 && r.y1 < height * 0.5);
    if (ring) paintRing(accent, ring, cx, w * k);
  }
  return { field, accent };
}

/**
 * Crest line of one footer ridge, in design units: a slow fbm swell topped by
 * overlapping domes (bamboo crowns along the skyline). Sampled once per design
 * unit over the whole design width, independent of the render window, so crops
 * match the wide render and the grove band can stand on the same line.
 */
function ridgeCrest(seed, r, [baseline, swell, , , , crown]) {
  const rn = noise2(seed + 100 + r);
  const rand = rng(seed * 31 + r);
  const domes = [];
  for (let x = -120; x < 3000; ) {
    const w = crown * rand.range(0.6, 1.4);
    domes.push({ cx: x + w / 2, half: w / 2, h: w * rand.range(0.2, 0.38) });
    x += w * rand.range(0.5, 0.8);
  }
  const x0 = -200;
  const table = new Float32Array(3300);
  let d0 = 0;
  for (let i = 0; i < table.length; i++) {
    const dx = x0 + i;
    while (d0 < domes.length - 1 && domes[d0].cx + domes[d0].half < dx - crown * 2) d0++;
    let bump = 0;
    for (let d = d0; d < domes.length && domes[d].cx - domes[d].half <= dx; d++) {
      const u = (dx - domes[d].cx) / domes[d].half;
      if (u > -1 && u < 1) bump = Math.max(bump, domes[d].h * Math.sqrt(1 - u * u));
    }
    table[i] = baseline - swell * rn.fbm(dx / 1000 + r * 3.1, r * 1.7, 4) - bump;
  }
  return (dx) => {
    const t = Math.min(table.length - 1.001, Math.max(0, dx - x0));
    const i = Math.floor(t);
    return table[i] + (table[i + 1] - table[i]) * (t - i);
  };
}

/**
 * Grove band on the nearest ridge: clumps of culms fanning out above its crest,
 * leaf sprays from their upper nodes and a crown at each top, so the foreground
 * reads as a bamboo grove rather than a hill. The same painters as the stage
 * plate. Clumps are laid out over the whole design width and every culm has its
 * own seeded generator; ring positions scale exactly with k, so any window and
 * scale draws the same grove. Returns { culms, leaves } as separate layers.
 */
function paintGroveBand({ seed, k, P, width, height, crest, from, to }) {
  const culms = new Field(width, height, { layer: true });
  const leaves = new Field(width, height, { layer: true });
  const layout = rng(seed * 53 + 7);
  let index = 0;
  for (let cx = from + layout.range(0, 60); cx < to; cx += layout.range(230, 390)) {
    const count = 2 + Math.floor(layout() * 4);
    const spread = layout.range(26, 72);
    const stature = layout.range(0.6, 1);
    const clump = [];
    for (let i = 0; i < count; i++) {
      const rand = rng(seed * 131 + index++);
      clump.push({ rand, depth: rand.range(0.6, 1), dx: cx + rand.range(-spread, spread), id: index });
    }
    clump.sort((a, b) => a.depth - b.depth); // back to front
    for (const { rand, depth, dx, id } of clump) {
      const out = dx >= cx ? 1 : -1; // culms fan away from the clump's centre
      const w = (12 + 16 * depth) * rand.range(0.9, 1.1);
      const top = crest(dx) - rand.range(120, 260) * stature * (0.6 + 0.4 * depth);
      const tone = 0.24 + 0.18 * depth;
      const { rings, centre } = paintCulm(culms, {
        x: P(dx),
        base: height + 30 * k,
        top: top * k,
        width: w * k,
        lean: out * rand.range(0, 0.035),
        bow: out * rand.range(0, 0.03),
        tone,
        ringTone: tone * 1.1,
        shade: 0.18,
        internodes: internodeRun(rand, w * k, 30, { min: 3.2, max: 4.6 }),
        offset: rand.range(0, 4) * w * k,
        seed: seed * 131 + id,
        fade: 30 * k,
        minGap: 4 * k,
        minBand: 2.5 * k,
      });
      const leaf = 0.4 + 0.12 * depth;
      const size = rand.range(70, 100) * k * (0.75 + 0.25 * depth);
      // A light tip, then sprays from two or three upper nodes, mostly outward:
      // the leaves sit along the top third of the culm, not in one crown.
      paintSpray(leaves, rand, {
        x: centre(top * k + 8 * k),
        y: top * k + 8 * k,
        angle: -Math.PI / 2 + out * rand.range(0.3, 0.7),
        length: rand.range(30, 50) * k,
        size: size * 0.75,
        tone: leaf,
        groups: 1 + Math.floor(rand() * 2),
      });
      const upper = rings.filter((r) => r.y1 > top * k + 40 * k && r.y1 < (crest(dx) + 10) * k);
      const picks = Math.min(upper.length, 2 + Math.floor(rand() * 2));
      for (let j = 0; j < picks; j++) {
        const ring = upper.splice(Math.floor(rand() * upper.length), 1)[0];
        const toward = rand() < 0.7 ? out : -out;
        paintSpray(leaves, rand, {
          x: centre(ring.y1) + toward * w * k * 0.4,
          y: ring.y1,
          angle: toward > 0 ? rand.range(-0.15, 0.35) : Math.PI - rand.range(-0.15, 0.35),
          length: rand.range(50, 90) * k,
          size: size * rand.range(0.8, 1),
          tone: leaf * 0.95,
          groups: 2,
        });
      }
    }
  }
  return { culms, leaves };
}

/**
 * Paper keyline: a layer of bare paper covering a layer's shapes dilated by
 * roughly `r` px. Composited under the shapes, it separates a leaf mass from
 * the ridge texture behind it along the mass's outer edge only.
 */
function keyline(layer, r) {
  const halo = new Field(layer.width, layer.height, { layer: true });
  halo.alpha.set(layer.alpha);
  halo.blur(r);
  for (let i = 0; i < halo.alpha.length; i++) halo.alpha[i] = smoothstep(0.03, 0.2, halo.alpha[i]);
  return halo;
}

/**
 * Footer landscape (design space 2880 x 800): ridges of bamboo sea receding in
 * mist (each ridge densest at its crest, dissolving downward, as in ink-wash
 * mountains), a grove band of culms and leaf sprays on the nearest ridge, framed
 * by culms at both edges, everything thinning into paper toward the top.
 * `window` = [x0 in design units] crops the design space, so a narrow render is
 * a true, re-screened crop of the same landscape. Returns { ink, accent };
 * accent holds the one lime node ring.
 */
export function bambooLandscape({ width, height, seed = 23, window = [0] }) {
  const k = height / 800;
  const [wx] = window;
  const X = (px) => wx + px / k; // pixel -> design x
  const P = (dx) => (dx - wx) * k; // design x -> pixel
  const n = noise2(seed + 5);
  const ink = new Field(width, height);
  const accent = new Field(width, height);
  const sky = (py) => smoothstep(60 * k, 300 * k, py); // everything thins upward into paper
  // Quiet dot field: haze over the valley floor.
  ink.fill((px, py) => 0.03 * smoothstep(380 * k, 800 * k, py) * (0.7 + 0.6 * n.fbm(X(px) / 420, py / k / 300, 3)));

  // Ridges far to near: [crest baseline, swell, crest tone, mist depth, blur, crown width], design units.
  const ridges = [
    [300, 130, 0.14, 80, 3, 36],
    [405, 120, 0.2, 95, 2, 44],
    [515, 105, 0.27, 115, 1, 52],
    [640, 85, 0.36, 150, 0, 62],
  ];
  const crests = ridges.map((spec, r) => ridgeCrest(seed, r, spec));
  ridges.forEach(([, , tone, mistDepth, blur, crown], r) => {
    const rn = noise2(seed + 100 + r);
    const tops = Float32Array.from({ length: width + 1 }, (_, px) => crests[r](X(px)) * k);
    const layer = new Field(width, height, { layer: true });
    layer.paint(
      [0, 0, width, height],
      (px, py) => clamp01(py - tops[Math.min(width, Math.floor(px))] + 0.5),
      (px, py) => {
        const depth = (py - tops[Math.min(width, Math.floor(px))]) / k;
        const clumps = 0.8 + 0.35 * rn.fbm(X(px) / (crown * 0.9), py / k / (crown * 0.7), 3);
        const mist = 0.12 + 0.88 * smoothstep(mistDepth, 0, depth); // crest dense, then mist
        return tone * clumps * mist * sky(py);
      },
    );
    layer.blur(blur * k);
    ink.composite(layer);
  });

  // Grove band on the nearest ridge, between the framing culms. Below the crest
  // the culms dissolve into the ridge's mist, as the ridge itself does.
  const nearest = crests[crests.length - 1];
  const crestPx = Float32Array.from({ length: width + 1 }, (_, px) => nearest(X(px)) * k);
  const mist = (px, py) => {
    const c = crestPx[Math.min(width, Math.floor(px))];
    return 0.35 + 0.65 * smoothstep(c + 230 * k, c - 10 * k, py);
  };
  const { culms, leaves } = paintGroveBand({ seed, k, P, width, height, crest: nearest, from: 250, to: 2560 });
  const halo = keyline(leaves, 3 * k);
  for (const layer of [culms, halo, leaves]) ink.composite(layer.scale(mist));

  // Framing culms, as on the stage plate: a few wide culms cropped by the frame
  // edges, rising into the mist. Close and cropped, they frame the valley rather
  // than stand in it; their nodes carry the mark. (Leaves are left out here: in
  // front of the ridge texture they lose their outline, and over the open sky the
  // mist erases them.) Each culm has its own seeded generator, so any window
  // renders it the same.
  const framing = [
    // [design x, width, tone]
    [2838, 104, 0.34],
    [2706, 54, 0.28],
    [2622, 26, 0.18],
    [36, 92, 0.33],
    [150, 30, 0.19],
  ];
  const near = new Field(width, height, { layer: true });
  framing.forEach(([dx, w, tone], i) => {
    const rand = rng(seed * 97 + i);
    const cw = w * k;
    const base = height + 30 * k;
    const internodes = internodeRun(rand, cw, 30, { min: 3.4, max: 4.8 });
    // The single lime mark: one ring of the wide right-edge culm, slid to 66% height
    // where the culm is solid.
    const lime = i === 0;
    const offset = lime ? offsetForRing(cw, internodes, base, height * 0.66) : rand.range(0.5, 3) * cw;
    const { rings, centre } = paintCulm(near, {
      x: P(dx),
      base,
      top: -30 * k,
      width: cw,
      lean: rand.range(-0.012, 0.012),
      bow: rand.range(-0.01, 0.01),
      tone,
      ringTone: tone * 1.08,
      shade: 0.22,
      internodes,
      offset,
      seed: seed * 97 + i,
    });
    const ring = lime && rings.find((r) => Math.abs(r.y1 - height * 0.66) < 1);
    if (ring) paintRing(accent, ring, centre, cw);
  });
  near.scale((px, py) => Math.pow(smoothstep(0, 520 * k, py), 0.6)); // rising into the mist
  ink.composite(near);
  return { ink, accent };
}
