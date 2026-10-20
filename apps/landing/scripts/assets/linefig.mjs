// Thin-line spatial figures for the v5 lime screen: one structural metaphor per Session part.
// Run: node apps/landing/scripts/assets/linefig.mjs
//
// Reverse-engineered from elevenlabs.io "Safety, built in" (captured 2026-10-20). Ported from and extending the
// staging study prototype refs/elevenlabs/v5/scripts/linefig.mjs, which is our own code written from the
// measurements in refs/elevenlabs/v5/STUDY.md §2. No reference asset or code is copied; only the grammar is used:
//   - viewBox == display size (1 unit = 1 CSS px). Never scale the <img>: the strokes would scale with it.
//   - solid .75; dotted 1.25 with dasharray "0.01 4" + round caps (a 1.25 px dot every 4 px); bevel joins.
//   - one ink; far or secondary lines at stroke-opacity .35; hidden parts covered by fills in the card colour.
//   - three projections: edge-on discs (rx/ry .26), oblique (receding 32.4°, depth .373), isometric (±30°).
//   - exact tangents: solved in the circle's own frame and mapped back (tangency survives affine maps).
//   - closed dotted curves get a whole number of dots, so no two dots crowd at the seam.
//   - motion: at most one comet on an orbit (dashoffset, 10.5 s a lap, parked when reduced motion is set).
//     Tail 13% of the lap with a linear fade, measured on the /safety hero recording
//     (staging v5/tools/linefig/scripts/measure-comet.ts: median 64° of orbit, fade to ~.1 at ~48°).
//
// Options:
//   --out <dir>      output folder (default apps/landing/public/landing/v5/figures)
//   --set parts|ref  parts (default): five Session parts x (pick, alternate) x sizes, plus the picks' MORE sizes
//                    ref: ElevenLabs' three figures rebuilt from measured numbers, for the proof only; refused inside the repo
//   --sizes 202,160  --ink #161815  --fill #FFFFFF   (passing --sizes writes exactly those sizes, without MORE)
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const LANDING = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const REPO = resolve(LANDING, "../..");
const argv = process.argv.slice(2);
const opt = (k, d) => {
  const i = argv.indexOf(`--${k}`);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : d;
};
const SET = opt("set", "parts");
const OUT = resolve(opt("out", join(LANDING, "public/landing/v5/figures")));
const INK = opt("ink", "#161815");
const FILL = opt("fill", "#FFFFFF");
const SIZES = opt("sizes", "202,160").split(",").map(Number);
// The full lime screen also shows three picks at sizes of their own (sections/accent.ts; staging
// v5/polish/lime/NOTES.md): Files at 296 in the wide middle card, and all three at 96 beside the text on phones.
// Picks only, and only in the default batch; the 202 and 160 files stay as they were, byte for byte.
const MORE = argv.includes("--sizes") ? {} : { sandbox: [96], files: [296, 96], resume: [96] };

// ---------- grammar (measured; refs/elevenlabs/v5/STUDY.md §2.2, §2.5) ----------
const G = {
  solid: 0.75,
  dot: 1.25,
  dotStep: 4,
  faint: 0.35,
  edgeOn: 0.26, // disc rx / ry (a disc turned ~75°)
  rise: 0.6, // edge-on disc centre sits .6 ry above its cone apex (Moderation)
  obliqueDeg: 32.4,
  obliqueDepth: 0.373,
  comet: { lap: 10.5, width: 1.2, share: 13, steps: 5, head: 0.95, end: 0.12 },
};
const RAD = Math.PI / 180;
const TAN30 = Math.tan(30 * RAD);

// ---------- geometry ----------
const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const onE = (e, t) => [e.c[0] + e.rx * Math.cos(t), e.c[1] + e.ry * Math.sin(t)];
const ell = (c, rx, ry = rx) => ({ c, rx, ry });
/** Edge-on disc: radius r seen at the measured .26 squash. */
const disc = (c, r) => ell(c, r * G.edgeOn, r);
/** Horizontal circle in the isometric view. */
const isoDisc = (c, r) => ell(c, r, r * TAN30);

/** Tangent points from an outside point to an axis-aligned ellipse: map to the unit circle, t = phi ± acos(1/d). */
function tangentsFrom(P, e) {
  const u = (P[0] - e.c[0]) / e.rx, v = (P[1] - e.c[1]) / e.ry, d = Math.hypot(u, v);
  if (d <= 1) throw new Error("tangent point is inside the ellipse");
  const phi = Math.atan2(v, u), a = Math.acos(1 / d);
  return [onE(e, phi - a), onE(e, phi + a)];
}

/** Outer common tangents of two ellipses with one rx/ry ratio (two circles under one affine map). */
function outerTangents(e1, e2) {
  const k = e1.rx / e1.ry;
  const c1 = [e1.c[0], e1.c[1] * k], c2 = [e2.c[0], e2.c[1] * k];
  const base = Math.atan2(c2[1] - c1[1], c2[0] - c1[0]), g = Math.acos((e1.rx - e2.rx) / Math.hypot(c2[0] - c1[0], c2[1] - c1[1]));
  return [base + g, base - g].map((t) => [
    [c1[0] + e1.rx * Math.cos(t), (c1[1] + e1.rx * Math.sin(t)) / k],
    [c2[0] + e2.rx * Math.cos(t), (c2[1] + e2.rx * Math.sin(t)) / k],
  ]);
}

/** Ellipse perimeter (Ramanujan II; error far below a pixel at these sizes). */
function perimeter(e) {
  const h = ((e.rx - e.ry) / (e.rx + e.ry)) ** 2;
  return Math.PI * (e.rx + e.ry) * (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h)));
}

/** Arc length along the ellipse from parameter t0 to t1 (clockwise on screen), Simpson's rule. */
function arcLen(e, t0, t1, steps = 720) {
  const f = (t) => Math.hypot(e.rx * Math.sin(t), e.ry * Math.cos(t));
  const h = (t1 - t0) / steps;
  let s = f(t0) + f(t1);
  for (let i = 1; i < steps; i++) s += f(t0 + i * h) * (i % 2 ? 4 : 2);
  return (s * h) / 3;
}

// Projections (world y up). Oblique: z recedes up-right at 32.4°, foreshortened to .373; viewer above-right-front.
// Isometric: x runs down-right, z down-left, both at 30°; viewer above, on the +x +z side.
const oblique = (o) => {
  const ax = Math.cos(G.obliqueDeg * RAD) * G.obliqueDepth, ay = Math.sin(G.obliqueDeg * RAD) * G.obliqueDepth;
  return ([x, y, z]) => [o[0] + x + z * ax, o[1] - y - z * ay];
};
const iso = (o) => {
  const c = Math.cos(30 * RAD);
  return ([x, y, z]) => [o[0] + (x - z) * c, o[1] + (x + z) * 0.5 - y];
};

// Boxes are {x: [x0, x1], y: [y0, y1], z: [z0, z1]}; corner i takes bit 1 = x, 2 = y, 4 = z.
const corners = (b) => Array.from({ length: 8 }, (_, i) => [b.x[i & 1 ? 1 : 0], b.y[i & 2 ? 1 : 0], b.z[i & 4 ? 1 : 0]]);
const EDGES = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]];
const box = (x0, x1, y0, y1, z0, z1) => ({ x: [x0, x1], y: [y0, y1], z: [z0, z1] });
/** One face of a box as 4 world points in ring order. */
function face(b, axis, side) {
  const [u, v] = { x: ["y", "z"], y: ["x", "z"], z: ["x", "y"] }[axis];
  return [[0, 0], [1, 0], [1, 1], [0, 1]].map(([i, j]) => {
    const p = { [axis]: b[axis][side], [u]: b[u][i], [v]: b[v][j] };
    return [p.x, p.y, p.z];
  });
}

/** Shift a projection so the bounding box of the given world points sits centred in the 202 frame. */
function centred(proj, pts, at = [101, 101]) {
  const q = pts.map(proj), xs = q.map((v) => v[0]), ys = q.map((v) => v[1]);
  const d = [at[0] - (Math.min(...xs) + Math.max(...xs)) / 2, at[1] - (Math.min(...ys) + Math.max(...ys)) / 2];
  return (w) => add(proj(w), d);
}

/** Convex hull (monotone chain), for occlusion masks. */
function hull(pts) {
  const p = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const half = (list) => {
    const h = [];
    for (const q of list) {
      while (h.length >= 2 && cross(h[h.length - 2], h[h.length - 1], q) <= 0) h.pop();
      h.push(q);
    }
    return h.slice(0, -1);
  };
  return [...half(p), ...half([...p].reverse())];
}

/** Keep the part of a polygon with y <= Y (Sutherland–Hodgman, one edge). */
function clipAbove(poly, Y) {
  const out = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length], ina = a[1] <= Y, inb = b[1] <= Y;
    if (ina) out.push(a);
    if (ina !== inb) out.push(lerp(a, b, (Y - a[1]) / (b[1] - a[1])));
  }
  return out;
}

// ---------- drawing ----------
// Figures are written in 202-space; the pen scales to the target size, so the geometry is identical at 160 while the
// stroke widths and the 4 px dot step stay absolute (that is the measured rule: lines never scale).
function pen(S) {
  const k = S / 202;
  const num = (v) => String(+(v * k).toFixed(2)).replace(/^(-?)0\./, "$1.");
  const raw = (v) => String(+v.toFixed(2)).replace(/^(-?)0\./, "$1.");
  const xy = (p) => `${num(p[0])} ${num(p[1])}`;
  const arcTo = (e, t) => `A${num(e.rx)} ${num(e.ry)} 0 0 1 ${xy(onE(e, t))}`;
  return {
    S, k, num, raw, xy,
    seg: (a, b) => `M${xy(a)}L${xy(b)}`,
    poly: (pts, close = true) => `M${pts.map(xy).join("L")}${close ? "Z" : ""}`,
    /** Closed ellipse starting at parameter t0, clockwise on screen. */
    ellipse: (e, t0 = 0) => {
      let d = `M${xy(onE(e, t0))}`;
      for (let i = 1; i <= 3; i++) d += arcTo(e, t0 + (i * 2 * Math.PI) / 3);
      return d;
    },
    /** Open arc from t0 to t1 (t1 > t0), clockwise on screen, in pieces under 180°. */
    arc: (e, t0, t1) => {
      const n = Math.ceil((t1 - t0) / (0.9 * Math.PI));
      let d = `M${xy(onE(e, t0))}`;
      for (let i = 1; i <= n; i++) d += arcTo(e, t0 + ((t1 - t0) * i) / n);
      return d;
    },
  };
}

// Items: {k, d} strokes (k: s solid, d dotted, f faint solid, fd faint dotted); {fill: true} occluders;
// {len} closed dotted curves (whole number of dots); {raw} verbatim markup. Consecutive plain strokes of one kind
// merge into one <path>, so paint order is exactly item order.
const short = (v) => String(+v.toFixed(3)).replace(/^0\./, ".");
const solidAttrs = (faint) => `stroke-width="${short(G.solid)}"${faint ? ` stroke-opacity="${short(G.faint)}"` : ""}`;
const dotAttrs = (faint, gap = G.dotStep) =>
  `stroke-width="${short(G.dot)}" stroke-dasharray=".01 ${short(gap)}" stroke-linecap="round"${faint ? ` stroke-opacity="${short(G.faint)}"` : ""}`;
const KIND = { s: solidAttrs(false), f: solidAttrs(true), d: dotAttrs(false), fd: dotAttrs(true) };
/** A closed dotted curve of length len: the gap is stretched so the dots divide the curve exactly. */
const dottedClosed = (k, d, len) => {
  const gap = len / Math.max(3, Math.round(len / (G.dotStep + 0.01))) - 0.01;
  return `<path ${dotAttrs(k === "fd", gap)} d="${d}"/>`;
};

function render(p, items, { name, defs = "", style = "" }) {
  const out = [];
  let cur = null;
  const flush = () => {
    if (cur) out.push(`<path ${KIND[cur.k]} d="${cur.d}"/>`);
    cur = null;
  };
  for (const it of items) {
    if (it.raw || it.fill || it.len) {
      flush();
      if (it.raw) out.push(it.raw);
      else if (it.fill) out.push(`<path ${KIND[it.k ?? "s"]} fill="${FILL}" d="${it.d}"/>`);
      else out.push(dottedClosed(it.k, it.d, it.len * p.k));
      continue;
    }
    if (cur && cur.k === it.k) cur.d += it.d;
    else {
      flush();
      cur = { k: it.k, d: it.d };
    }
  }
  flush();
  const head = `<svg xmlns="http://www.w3.org/2000/svg" width="${p.S}" height="${p.S}" viewBox="0 0 ${p.S} ${p.S}" fill="none" stroke="${INK}" stroke-linejoin="bevel">`;
  const note = `<!-- ${name} · node apps/landing/scripts/assets/linefig.mjs -->`;
  return [head, note, defs && `<defs>${defs}</defs>`, style && `<style>${style}</style>`, ...out, "</svg>", ""].filter(Boolean).join("\n");
}

/** Box helpers that return items. */
const boxItems = (p, pr, b, k = "s") => [{ k, d: EDGES.map(([i, j]) => p.seg(pr(corners(b)[i]), pr(corners(b)[j]))).join("") }];
const solidBox = (p, pr, b, faces) => faces.map(([axis, side]) => ({ fill: true, d: p.poly(face(b, axis, side).map(pr)) }));

/**
 * Comet on an orbit (the only moving construction). One dash per lap (pathLength 100); the tail is `steps` dashes that
 * share one keyframe and differ by a negative delay, so all heads meet; stroke-opacity per dash composes a linear fade.
 * Reduced motion parks the head at parameter `park` (static stroke-dashoffset attributes).
 */
function comet(p, e, { id, start, park, mask }) {
  const C = G.comet, L = C.share, step = L / C.steps;
  const total = perimeter(e);
  const d = p.ellipse(e, start);
  // Target alpha per band from the head; dash j covers bands 0..j, so solve from the longest dash inwards.
  const A = Array.from({ length: C.steps }, (_, j) => C.head + ((C.end - C.head) * j) / (C.steps - 1));
  const parkAt = (arcLen(e, start, park < start ? park + 2 * Math.PI : park) / total) * 100;
  const tails = [];
  for (let j = 0; j < C.steps; j++) {
    const len = step * (j + 1);
    const o = j === C.steps - 1 ? A[j] : 1 - (1 - A[j]) / (1 - A[j + 1]);
    // A shorter dash runs ahead in time by (L - len) of the lap, so its head lands on the longest dash's head.
    const ahead = ((L - len) * C.lap) / 100;
    const delay = ahead ? ` style="animation-delay:-${+ahead.toFixed(3)}s"` : "";
    tails.push(
      `<path class="${id}" pathLength="100" stroke-width="${C.width}" stroke-linecap="round" stroke-dasharray="${p.raw(len)} ${p.raw(100 - len)}" stroke-dashoffset="${p.raw(len - parkAt)}" stroke-opacity="${+o.toFixed(3)}"${delay} d="${d}"/>`,
    );
  }
  const style = `@keyframes ${id}{from{stroke-dashoffset:0}to{stroke-dashoffset:-100}}.${id}{animation:${id} ${C.lap}s linear infinite}@media (prefers-reduced-motion:reduce){.${id}{animation:none}}`;
  const g = mask ? `<g mask="url(#${id}-m)">${tails.join("")}</g>` : tails.join("");
  const defs = mask
    ? `<mask id="${id}-m" maskUnits="userSpaceOnUse" x="0" y="0" width="${p.S}" height="${p.S}"><rect width="${p.S}" height="${p.S}" fill="#fff"/><path fill="#000" stroke="none" d="${p.poly(mask)}"/></mask>`
    : "";
  return { items: [{ raw: g }], style, defs };
}

// ---------- the five Session parts: two metaphors each (pick first) ----------
// Facts behind each metaphor (mosoo docs/SPEC.md, docs/prd): four runtimes behind one Session API (runtime-catalog §7);
// provider keys never enter the sandbox, which only gets expiring grants (SPEC §5); every Session gets its own
// sandbox, and a checkpoint is never shared (SPEC §3, §4); files under outputs/ become downloadable artifacts
// (session-files §9); a reply a minute or seven days later continues the same Session, after the sandbox is
// reclaimed (SPEC §4 Continuation).
const PARTS = {
  harness: {
    pick: {
      name: "harness · one cone, four discs",
      why: "the same two lines from one apex touch all four discs (exact tangents): one API, and any of the four harnesses behind it fits",
      draw(p) {
        // Discs are homothetic about the apex (ratio q), so all four are tangent to the same two lines.
        const O = [12, 140], q = 1.45, r0 = 26.5, c0 = [O[0] + 52, O[1] - G.rise * r0];
        const discs = [0, 1, 2, 3].map((i) => disc(lerp(O, c0, q ** i), r0 * q ** i));
        const far = discs[3], [t1, t2] = tangentsFrom(O, far);
        const axisEnd = lerp(O, far.c, (201 - O[0]) / (far.c[0] - O[0]));
        return [
          { k: "d", d: p.seg(O, [201, O[1]]) + p.seg(O, axisEnd) },
          { k: "s", d: discs.map((e) => p.ellipse(e, -Math.PI / 2)).join("") + p.seg(O, t1) + p.seg(O, t2) },
        ];
      },
    },
    alt: {
      name: "harness · four discs, one chosen",
      why: "one apex reaches the solid disc; three dotted discs wait on the same axis: one harness chosen per Session",
      draw(p) {
        const O = [12, 150], r = 58, y = O[1] - G.rise * r;
        const xs = [74, 110, 146, 182];
        const discs = xs.map((x) => disc([x, y], r));
        const chosen = discs[1], [t1, t2] = tangentsFrom(O, chosen);
        const len = perimeter(discs[0]);
        return [
          { k: "d", d: p.seg(O, [201, O[1]]) },
          ...discs.filter((_, i) => i !== 1).map((e) => ({ k: "d", d: p.ellipse(e, -Math.PI / 2), len })),
          { k: "s", d: p.ellipse(chosen, -Math.PI / 2) + p.seg(O, t1) + p.seg(O, t2) },
        ];
      },
    },
  },
  "model-key": {
    pick: {
      name: "model key · touches, never enters",
      why: "the key circle touches the sandbox at one point and stays outside; only its dotted mirror (the expiring grant) is inside",
      draw(p) {
        const R = 74, r = 23, T = [52, 101];
        const sandbox = ell([T[0] + R, T[1]], R), key = ell([T[0] - r, T[1]], r), grant = ell([T[0] + r, T[1]], r);
        return [
          { k: "d", d: [[T[0], T[1] - 64], [T[0], T[1] + 64], [1, T[1]], [201, T[1]]].map((q) => p.seg(T, q)).join("") },
          { k: "d", d: p.ellipse(grant, Math.PI), len: 2 * Math.PI * r },
          { k: "s", d: p.ellipse(sandbox, Math.PI) + p.ellipse(key, 0) },
        ];
      },
    },
    alt: {
      name: "model key · outside the box",
      why: "the solid key disc stands outside the sandbox box; only a dotted line and a dotted disc (the grant) go in",
      draw(p) {
        const s = 88, b = box(0, s, 0, s, 0, s), keyAt = [-56, s / 2, s / 2], R = 38, rx = R * G.edgeOn;
        // Centre on the drawn extents: the box corners and the key disc's bounding box (at a fixed depth the
        // oblique view maps world x, y 1:1, so the disc's box is two world points at the key's depth).
        const keyBox = [[keyAt[0] - rx, keyAt[1] - R, keyAt[2]], [keyAt[0] + rx, keyAt[1] + R, keyAt[2]]];
        const pr = centred(oblique([0, 0]), [...corners(b), ...keyBox]);
        const key = disc(pr(keyAt), R), mid = pr([s / 2, s / 2, s / 2]), grant = disc(mid, 22);
        return [
          ...boxItems(p, pr, b),
          { k: "d", d: p.seg(key.c, mid) },
          { k: "d", d: p.ellipse(grant, -Math.PI / 2), len: perimeter(grant) },
          { fill: true, d: p.ellipse(key, -Math.PI / 2) },
        ];
      },
    },
  },
  sandbox: {
    pick: {
      name: "sandbox · a cube inside its own cube",
      why: "one inner cube floats inside an outer cube, touching nothing; dotted diagonals only locate it: isolated, one per Session",
      draw(p) {
        const s = 140, outer = box(0, s, 0, s, 0, s), m = s * 0.31, inner = box(m, s - m, m, s - m, m, s - m);
        const pr = centred(oblique([0, 0]), corners(outer));
        const oc = corners(outer).map(pr), ic = corners(inner).map(pr);
        return [
          { k: "d", d: oc.map((c, i) => p.seg(c, ic[i])).join("") },
          ...boxItems(p, pr, outer),
          ...boxItems(p, pr, inner),
        ];
      },
    },
    alt: {
      name: "sandbox · cells pulled apart",
      why: "a 2x2 cell block exploded into four separate cubes, each with its own diagonal: nothing shared between Sessions",
      draw(p) {
        const s = 62, gap = 16, W = 2 * s + gap;
        const pr = centred(oblique([0, 0]), corners(box(0, W, 0, W, 0, s)));
        const items = [];
        for (const [i, j] of [[0, 1], [1, 1], [0, 0], [1, 0]]) {
          const b = box(i * (s + gap), i * (s + gap) + s, j * (s + gap), j * (s + gap) + s, 0, s);
          items.push(...boxItems(p, pr, b));
          items.push({ k: "d", d: p.seg(pr([b.x[0], b.y[0], 0]), pr([b.x[1], b.y[1], s])) });
        }
        return items;
      },
    },
  },
  files: {
    pick: {
      name: "files · a page lifted off the stack",
      why: "thin pages stack up where the run wrote them; the top one rises on dotted guides: an output you can take (lighter than the tray, and it shares the isometric grammar)",
      draw(p) {
        const a = 104, b = 72, t = 3, gap = 9, n = 4, lift = 46;
        const slab = (y) => box(-a / 2, a / 2, y, y + t, -b / 2, b / 2);
        const top = (n - 1) * gap + lift, yTop = (n - 2) * gap + t;
        const pr = centred(iso([0, 0]), [...corners(slab(0)), ...corners(slab(top))]);
        const items = [];
        for (let i = 0; i < n - 1; i++) items.push(...solidBox(p, pr, slab(i * gap), [["x", 1], ["z", 1], ["y", 1]]));
        const guides = [[-a / 2, -b / 2], [-a / 2, b / 2], [a / 2, b / 2], [a / 2, -b / 2]];
        items.push({ k: "d", d: guides.map(([x, z]) => p.seg(pr([x, yTop, z]), pr([x, top, z]))).join("") });
        items.push(...solidBox(p, pr, slab(top), [["x", 1], ["z", 1], ["y", 1]])); // the lifted page hides what is behind it
        return items;
      },
    },
    alt: {
      name: "files · one sheet lifted from the tray",
      why: "sheets stand in an open tray (outputs/); the front one is lifted out along dotted guides: written by the run, fetched by you",
      draw(p) {
        const W = 124, h = 30, Dp = 150, H = 74, m = 16, lift = 62;
        const tray = box(0, W, 0, h, 0, Dp);
        const pr = centred(oblique([0, 0]), [...corners(tray), [m, H + lift, 0], [W - m, H + lift, Dp]]);
        const zs = [0.16, 0.38, 0.6, 0.82].map((t) => t * Dp);
        const sheet = (z, up = 0) => [[m, up, z], [W - m, up, z], [W - m, H + up, z], [m, H + up, z]].map(pr);
        const lifted = 0; // the front sheet: nothing stands in front of its guides
        const items = [{ k: "s", d: p.poly([pr([0, h, 0]), pr([0, h, Dp]), pr([W, h, Dp])], false) }];
        for (let i = zs.length - 1; i >= 0; i--) {
          if (i === lifted) {
            items.push({ k: "d", d: p.seg(pr([m, h, zs[i]]), pr([m, lift, zs[i]])) + p.seg(pr([W - m, h, zs[i]]), pr([W - m, lift, zs[i]])) });
            items.push({ fill: true, d: p.poly(sheet(zs[i], lift)) });
          } else items.push({ fill: true, d: p.poly(sheet(zs[i])) });
        }
        items.push(...solidBox(p, pr, tray, [["x", 1], ["z", 0]]));
        return items;
      },
    },
  },
  resume: {
    pick: {
      name: "resume · the ring keeps turning",
      why: "a comet circles one fixed column: the run comes back around and the Session it serves stays put (the only motion)",
      draw(p) {
        const B = [101, 176], pr = iso(B), a = 24, hgt = 112, yo = 58;
        const col = box(-a / 2, a / 2, 0, hgt, -a / 2, a / 2);
        const orbit = isoDisc(pr([0, yo, 0]), 84);
        const sil = hull(corners(col).map(pr));
        const id = `lfc${p.S}`;
        const c = comet(p, orbit, { id, start: -Math.PI / 2, park: 55 * RAD, mask: clipAbove(sil, orbit.c[1]) });
        return {
          items: [
            { k: "f", d: p.arc(orbit, Math.PI, 2 * Math.PI) },
            ...solidBox(p, pr, col, [["x", 1], ["z", 1], ["y", 1]]),
            { k: "d", d: p.seg(pr([0, hgt, 0]), [B[0], 4]) },
            { k: "f", d: p.arc(orbit, 0, Math.PI) },
            ...c.items,
          ],
          style: c.style,
          defs: c.defs,
        };
      },
    },
    alt: {
      name: "resume · the tube runs through the gap",
      why: "the dotted disc (the sandbox, gone) and the solid one (a new sandbox, days later) sit on one unbroken tube: the Session",
      draw(p) {
        const y = 101, r = 46, gone = disc([62, y], r), next = disc([150, y], r);
        const [[a1, a2], [b1, b2]] = outerTangents(gone, next);
        const ext = (u, v, x) => lerp(u, v, (x - u[0]) / (v[0] - u[0]));
        return [
          { k: "d", d: p.seg([1, y], [201, y]) },
          { k: "d", d: p.ellipse(gone, -Math.PI / 2), len: perimeter(gone) },
          { k: "s", d: p.ellipse(next, -Math.PI / 2) + p.seg(ext(a1, a2, 8), ext(a1, a2, 194)) + p.seg(ext(b1, b2, 8), ext(b1, b2, 194)) },
        ];
      },
    },
  },
};

// ---------- ElevenLabs' three, rebuilt from the measured numbers (proof of the engine; never shipped) ----------
// Numbers: refs/elevenlabs/v5/STUDY.md §2.2 (scripts/svg-geom.ts output on the downloaded SVGs).
const REF = {
  moderation: {
    w: 203,
    draw(p) {
      const O = [91.48, 154.02];
      const big = ell([162.31, 98.45], 24.22, 93.08), small = ell([47.71, 119.59], 14.87, 57.16);
      const lines = [big, small].flatMap((e) => tangentsFrom(O, e).map((t) => p.seg(O, t))).join("");
      return [
        { k: "d", d: p.seg([202, 154], [1, 154]) + p.seg(O, [O[0], O[1] - 140.17]) + p.seg([47.775, 197.984], O) },
        { k: "s", d: p.ellipse(big, -Math.PI / 2) + lines + p.ellipse(small, -Math.PI / 2) },
      ];
    },
  },
  accountability: {
    w: 202,
    draw(p) {
      const s = 143.957, pr = oblique([5.919, 43.791 + s]);
      const b = box(0, s, 0, s, 0, s / 1.0); // depth s in world units; the projection applies .373
      const items = [...boxItems(p, pr, b)];
      items.push({ k: "s", d: p.poly(face(box(0, s, s / 2, s / 2, 0, s), "y", 0).map(pr)) + p.poly(face(box(s / 2, s / 2, 0, s, 0, s), "x", 0).map(pr)) });
      const c = (x, y, z) => pr([x * s, y * s, z * s]);
      items.push({ k: "d", d: p.seg(c(0, 0, 0), c(1, 1, 1)) + p.seg(c(1, 0, 0), c(0, 1, 1)) + p.seg(c(0, 1, 0), c(1, 0, 1)) });
      return items;
    },
  },
  provenance: {
    w: 202,
    draw(p) {
      const T = [1.4737, 101.5], rs = [0, 1, 2, 3, 4, 5].map((i) => 54.7786 + i * 7.4515);
      const env = ell([1.099 + 99.5, 101.5], 99.5);
      return [
        { k: "s", d: rs.map((r) => p.ellipse(ell([T[0] + r, T[1]], r), 0)).join("") },
        { k: "d", d: p.ellipse(env, 0), len: 2 * Math.PI * 99.5 },
      ];
    },
  },
};

// ---------- batch ----------
if (SET === "ref" && OUT.startsWith(REPO + "/")) {
  console.error("--set ref rebuilds ElevenLabs' own metaphors for the proof only; pass --out outside the repo");
  process.exit(2);
}
mkdirSync(OUT, { recursive: true });
const written = [];
const emit = (file, svg) => {
  writeFileSync(join(OUT, file), svg);
  written.push([file, Buffer.byteLength(svg)]);
};
if (SET === "ref") {
  for (const [name, f] of Object.entries(REF)) {
    const p = pen(202);
    const svg = render(p, f.draw(p), { name: `ref ${name} (rebuild)` }).replace(/width="202" height="202" viewBox="0 0 202 202"/, `width="${f.w}" height="202" viewBox="0 0 ${f.w} 202"`);
    emit(`ref-${name}.svg`, svg);
  }
} else {
  for (const [part, variants] of Object.entries(PARTS)) {
    for (const [slot, v] of Object.entries(variants)) {
      for (const S of [...SIZES, ...(slot === "pick" ? (MORE[part] ?? []) : [])]) {
        const p = pen(S);
        const r = v.draw(p);
        const fig = Array.isArray(r) ? { items: r } : r;
        emit(`${part}${slot === "alt" ? "-alt" : ""}-${S}.svg`, render(p, fig.items, { name: v.name, defs: fig.defs, style: fig.style }));
      }
    }
  }
}
for (const [f, b] of written) console.log(`${f.padEnd(28)} ${String(b).padStart(5)} B`);
console.log(`${written.length} files -> ${OUT}`);
