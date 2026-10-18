// Raster primitives for the bamboo kit: a float tone field (optionally a layer
// with coverage), shape painting, AM halftone and ordered-dither screens, and an
// indexed-colour PNG encoder. Pure Node (zlib only); deterministic for a seed.

import { crc32, deflateSync } from "node:zlib";

// ---------------------------------------------------------------------------
// Seeded randomness and smooth value noise
// ---------------------------------------------------------------------------

export function rng(seed) {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  next.range = (lo, hi) => lo + (hi - lo) * next();
  return next;
}

/** 2D value noise in [-1, 1] with quintic interpolation; `.fbm` sums octaves. */
export function noise2(seed) {
  const hash = (ix, iy) => {
    let h = Math.imul(ix, 374761393) ^ Math.imul(iy, 668265263) ^ Math.imul(seed, 2246822519);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 2147483648 - 1;
  };
  const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
  const value = (x, y) => {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const fx = fade(x - ix);
    const fy = fade(y - iy);
    const a = hash(ix, iy) + (hash(ix + 1, iy) - hash(ix, iy)) * fx;
    const b = hash(ix, iy + 1) + (hash(ix + 1, iy + 1) - hash(ix, iy + 1)) * fx;
    return a + (b - a) * fy;
  };
  value.fbm = (x, y, octaves = 4) => {
    let sum = 0;
    let amp = 0.5;
    let norm = 0;
    for (let o = 0; o < octaves; o++) {
      sum += amp * value(x, y);
      norm += amp;
      x = x * 2.03 + 17.1;
      y = y * 2.03 + 31.7;
      amp *= 0.5;
    }
    return sum / norm;
  };
  return value;
}

export const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
export const smoothstep = (a, b, v) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

// ---------------------------------------------------------------------------
// Tone field: 0 = bare paper, 1 = solid ink. A layer also tracks coverage and
// stores premultiplied tone, so it can be blurred (depth) and composited.
// ---------------------------------------------------------------------------

export class Field {
  constructor(width, height, { layer = false } = {}) {
    this.width = width;
    this.height = height;
    this.data = new Float32Array(width * height);
    this.alpha = layer ? new Float32Array(width * height) : null;
  }

  /** Set every pixel from fn(x, y), evaluated at pixel centres. */
  fill(fn) {
    const { width, height, data } = this;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) data[y * width + x] = fn(x + 0.5, y + 0.5);
    }
    return this;
  }

  /**
   * Paint a shape "over" the field. `coverage(x, y)` returns 0..1 (anti-aliased
   * edge); `tone` is a number or fn(x, y). Only the bounding box is visited.
   */
  paint(bbox, coverage, tone) {
    const { width, height, data, alpha } = this;
    const x0 = Math.max(0, Math.floor(bbox[0]));
    const y0 = Math.max(0, Math.floor(bbox[1]));
    const x1 = Math.min(width, Math.ceil(bbox[2]));
    const y1 = Math.min(height, Math.ceil(bbox[3]));
    const toneFn = typeof tone === "function" ? tone : null;
    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        const a = coverage(x + 0.5, y + 0.5);
        if (a <= 0) continue;
        const i = y * width + x;
        const t = toneFn ? toneFn(x + 0.5, y + 0.5) : tone;
        data[i] = data[i] * (1 - a) + t * a;
        if (alpha) alpha[i] = alpha[i] * (1 - a) + a;
      }
    }
    return this;
  }

  /** Multiply by fn(x, y): tone for a plain field, tone and coverage (a fade) for a layer. */
  scale(fn) {
    const { width, height, data, alpha } = this;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const f = fn(x + 0.5, y + 0.5);
        data[y * width + x] *= f;
        if (alpha) alpha[y * width + x] *= f;
      }
    }
    return this;
  }

  /** Separable box blur run `passes` times (3 passes is close to Gaussian). */
  blur(radius, passes = 3) {
    const r = Math.max(0, Math.round(radius));
    if (!r) return this;
    this.data = boxBlur(this.data, this.width, this.height, r, passes);
    if (this.alpha) this.alpha = boxBlur(this.alpha, this.width, this.height, r, passes);
    return this;
  }

  /** Composite a layer (premultiplied) over this field or layer. */
  composite(layer) {
    const { data, alpha } = this;
    for (let i = 0; i < data.length; i++) {
      const a = layer.alpha[i];
      data[i] = data[i] * (1 - a) + layer.data[i];
      if (alpha) alpha[i] = alpha[i] * (1 - a) + a;
    }
    return this;
  }
}

function boxBlur(input, width, height, r, passes) {
  let src = input;
  let dst = new Float32Array(src.length);
  const run = (len, stride, count, step) => {
    const norm = 1 / (2 * r + 1);
    for (let line = 0; line < count; line++) {
      const base = line * step;
      let acc = 0;
      for (let k = -r; k <= r; k++) acc += src[base + Math.min(len - 1, Math.max(0, k)) * stride];
      for (let i = 0; i < len; i++) {
        dst[base + i * stride] = acc * norm;
        acc += src[base + Math.min(len - 1, i + r + 1) * stride] - src[base + Math.max(0, i - r) * stride];
      }
    }
    [src, dst] = [dst, src];
  };
  for (let p = 0; p < passes; p++) {
    run(width, 1, height, width);
    run(height, width, width, 1);
  }
  return src;
}

// ---------------------------------------------------------------------------
// Screens
// ---------------------------------------------------------------------------

/**
 * Amplitude-modulated round-dot halftone on a pixel-periodic lattice: dot
 * centres sit at integer multiples of `pitch` (45 degrees: (p, p) and (-p, p),
 * the classic black-ink screen angle; 0 degrees: a square grid). Each pixel is
 * inked when it lies inside its cell's dot, whose radius follows the *local*
 * tone, so sharp edges in the field cut through dots as on a printed plate.
 * Tone is quantised to `levels` so equal tints repeat byte-for-byte (cheap PNG).
 * Returns per-pixel ink coverage (0..1).
 */
export function halftone(field, { pitch, angle = 45, maxTone = 0.7, levels = 48, minDot = 1.1 }) {
  const { width, height, data } = field;
  const out = new Float32Array(width * height);
  const diagonal = angle === 45;
  const cellArea = diagonal ? 2 * pitch * pitch : pitch * pitch;
  const rScale = Math.sqrt(cellArea / Math.PI);
  const radius = Float32Array.from({ length: levels + 1 }, (_, q) => rScale * Math.sqrt((q / levels) * maxTone));
  // Highlights: below the smallest printable dot (radius minDot px), cells keep a
  // minimum dot with probability tone / minTone instead of all vanishing at one
  // threshold, so light tints thin out like a stipple rather than ending in a line.
  const minTone = (Math.PI * minDot * minDot) / cellArea;
  const qMin = Math.max(1, Math.ceil((minTone / maxTone) * levels));
  const cellHash = (u, v) => {
    let h = Math.imul(u, 73856093) ^ Math.imul(v, 19349663);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  };
  for (let y = 0; y < height; y++) {
    const py = y + 0.5;
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const t = data[i];
      if (t <= 0) continue;
      const px = x + 0.5;
      let u;
      let v;
      let cx;
      let cy;
      if (diagonal) {
        u = Math.round((px + py) / (2 * pitch));
        v = Math.round((py - px) / (2 * pitch));
        cx = pitch * (u - v);
        cy = pitch * (u + v);
      } else {
        u = Math.round(px / pitch);
        v = Math.round(py / pitch);
        cx = pitch * u;
        cy = pitch * v;
      }
      // Tone is ink coverage, clamped at maxTone and quantised over [0, maxTone].
      let q = Math.round((Math.min(t, maxTone) / maxTone) * levels);
      if (t < minTone) q = cellHash(u, v) < t / minTone ? qMin : 0;
      if (!q) continue;
      const d = Math.hypot(px - cx, py - cy);
      const a = radius[q] - d + 0.5;
      out[i] = a <= 0 ? 0 : a >= 1 ? 1 : a;
    }
  }
  return out;
}

const BAYER8 = (() => {
  let cur = [[0]];
  for (let n = 1; n < 8; n *= 2) {
    const next = Array.from({ length: n * 2 }, () => new Array(n * 2));
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        const v = cur[y][x] * 4;
        next[y][x] = v;
        next[y][x + n] = v + 2;
        next[y + n][x] = v + 3;
        next[y + n][x + n] = v + 1;
      }
    }
    cur = next;
  }
  return cur.map((row) => row.map((v) => (v + 0.5) / 64));
})();

/**
 * Ordered (Bayer 8x8) dither of the field into `levels` steps on a coarse grid
 * of `pixel` px. Returns per-pixel step indices (0 = paper) at full size.
 * With `ordered: false` each block is simply rounded (crisp, for flat marks).
 */
export function pixelDither(field, { pixel, levels, ordered = true }) {
  const { width, height } = field;
  const cols = Math.ceil(width / pixel);
  const out = new Uint8Array(width * height);
  for (let gy = 0; gy * pixel < height; gy++) {
    for (let gx = 0; gx < cols; gx++) {
      let acc = 0;
      let n = 0;
      for (let y = gy * pixel; y < Math.min(height, (gy + 1) * pixel); y++) {
        for (let x = gx * pixel; x < Math.min(width, (gx + 1) * pixel); x++) {
          acc += field.data[y * width + x];
          n++;
        }
      }
      const t = clamp01(acc / n) * levels;
      const base = Math.floor(t);
      const threshold = ordered ? BAYER8[gy % 8][gx % 8] : 0.5;
      const k = Math.min(levels, base + (t - base > threshold ? 1 : 0));
      if (!k) continue;
      for (let y = gy * pixel; y < Math.min(height, (gy + 1) * pixel); y++) {
        out.fill(k, y * width + gx * pixel, y * width + Math.min(width, (gx + 1) * pixel));
      }
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Indexed PNG
// ---------------------------------------------------------------------------

export function hexToRgb(hex) {
  const n = Number.parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function chunk(type, body) {
  const head = Buffer.alloc(8);
  head.writeUInt32BE(body.length, 0);
  head.write(type, 4, "latin1");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([head.subarray(4), body])) >>> 0, 0);
  return Buffer.concat([head, body, crc]);
}

/**
 * Encode palette indices as a PNG (colour type 3). `palette` holds [r, g, b, a].
 * Bit depth is the smallest of 1/2/4/8 that fits; filters None and Up are both
 * tried for the whole image and the smaller stream wins.
 */
export function encodeIndexedPng(width, height, indices, palette) {
  if (palette.length > 256) throw new Error("palette too large");
  const depth = palette.length <= 2 ? 1 : palette.length <= 4 ? 2 : palette.length <= 16 ? 4 : 8;
  const perByte = 8 / depth;
  const rowBytes = Math.ceil(width / perByte);
  const packed = Buffer.alloc(rowBytes * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const byte = y * rowBytes + Math.floor(x / perByte);
      packed[byte] |= indices[y * width + x] << (8 - depth * ((x % perByte) + 1));
    }
  }
  const build = (filter) => {
    const raw = Buffer.alloc((rowBytes + 1) * height);
    for (let y = 0; y < height; y++) {
      const o = y * (rowBytes + 1);
      raw[o] = filter;
      for (let i = 0; i < rowBytes; i++) {
        const cur = packed[y * rowBytes + i];
        raw[o + 1 + i] = filter === 2 && y > 0 ? (cur - packed[(y - 1) * rowBytes + i]) & 255 : cur;
      }
    }
    return deflateSync(raw, { level: 9, memLevel: 9 });
  };
  const [none, up] = [build(0), build(2)];
  const idat = none.length <= up.length ? none : up;
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = depth;
  ihdr[9] = 3;
  const plte = Buffer.alloc(palette.length * 3);
  palette.forEach(([r, g, b], i) => plte.set([r, g, b], i * 3));
  let alphas = palette.length;
  while (alphas > 0 && palette[alphas - 1][3] === 255) alphas--;
  const parts = [Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk("IHDR", ihdr), chunk("PLTE", plte)];
  if (alphas > 0) parts.push(chunk("tRNS", Buffer.from(palette.slice(0, alphas).map((p) => p[3]))));
  parts.push(chunk("IDAT", idat), chunk("IEND", Buffer.alloc(0)));
  return Buffer.concat(parts);
}

/**
 * Quantise ink layers into palette indices. `layers` = [{ coverage, color, steps }]
 * painted in order (later on top); each ink gets `steps` alpha levels and index 0
 * is transparent paper. Returns { indices, palette }.
 */
export function quantiseInks(width, height, layers) {
  const palette = [[0, 0, 0, 0]];
  const offsets = [];
  for (const layer of layers) {
    offsets.push(palette.length);
    const rgb = hexToRgb(layer.color);
    for (let s = 1; s <= layer.steps; s++) palette.push([...rgb, Math.round((s / layer.steps) * 255)]);
  }
  const indices = new Uint8Array(width * height);
  for (let i = 0; i < indices.length; i++) {
    for (let l = layers.length - 1; l >= 0; l--) {
      const s = Math.round(layers[l].coverage[i] * layers[l].steps);
      if (s > 0) {
        indices[i] = offsets[l] + s - 1;
        break;
      }
    }
  }
  return { indices, palette };
}
