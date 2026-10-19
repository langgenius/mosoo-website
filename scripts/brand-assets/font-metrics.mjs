#!/usr/bin/env node
// Inspect a .woff2 / .ttf (axes, version, vertical metrics) and derive @font-face
// overrides for a metric-matched local fallback, so a font swap shifts less.
//
//   node scripts/brand-assets/font-metrics.mjs <webfont> [<fallback.ttf>]
//
// Example (values used in apps/landing/src/shared/styles/literata.css):
//   node scripts/brand-assets/font-metrics.mjs apps/landing/public/fonts/Literata-Variable-latin.woff2 \
//     /System/Library/Fonts/Supplemental/Georgia.ttf
//
// Widths are the default instance's advances (Literata: opsz 12, wght 400), weighted
// by English letter frequency with space at 17.5%, the method Capsize documents.

import { readFileSync } from "node:fs";
import { brotliDecompressSync } from "node:zlib";

const WOFF2_TAGS = ["cmap", "head", "hhea", "hmtx", "maxp", "name", "OS/2", "post", "cvt ", "fpgm", "glyf", "loca", "prep", "CFF ", "VORG", "EBDT", "EBLC", "gasp", "hdmx", "kern", "LTSH", "PCLT", "VDMX", "vhea", "vmtx", "BASE", "GDEF", "GPOS", "GSUB", "EBSC", "JSTF", "MATH", "CBDT", "CBLC", "COLR", "CPAL", "SVG ", "sbix", "acnt", "avar", "bdat", "bloc", "bsln", "cvar", "fdsc", "feat", "fmtx", "fvar", "gvar", "hsty", "just", "lcar", "mort", "morx", "opbd", "prop", "trak", "Zapf", "Silf", "Glat", "Gloc", "Feat", "Sill"];
const LETTERS = { a: 8.2, b: 1.5, c: 2.8, d: 4.3, e: 12.7, f: 2.2, g: 2.0, h: 6.1, i: 7.0, j: 0.15, k: 0.77, l: 4.0, m: 2.4, n: 6.7, o: 7.5, p: 1.9, q: 0.095, r: 6.0, s: 6.3, t: 9.1, u: 2.8, v: 0.98, w: 2.4, x: 0.15, y: 2.0, z: 0.074 };

/** Return a map of table tag -> Buffer for a TTF/OTF or WOFF2 file. */
export function readTables(buf) {
  const tables = {};
  if (buf.toString("latin1", 0, 4) === "wOF2") {
    const count = buf.readUInt16BE(12);
    const compressed = buf.readUInt32BE(20);
    let p = 48;
    const base128 = () => {
      let v = 0;
      for (let i = 0; i < 5; i++) {
        const b = buf[p++];
        v = (v << 7) | (b & 0x7f);
        if (!(b & 0x80)) return v >>> 0;
      }
      throw new Error("bad UIntBase128");
    };
    const dir = [];
    for (let i = 0; i < count; i++) {
      const flags = buf[p++];
      let tag = WOFF2_TAGS[flags & 0x3f];
      if ((flags & 0x3f) === 63) {
        tag = buf.toString("latin1", p, p + 4);
        p += 4;
      }
      const xform = (flags >> 6) & 3;
      const orig = base128();
      const transformed = tag === "glyf" || tag === "loca" ? xform !== 3 : xform !== 0;
      dir.push({ tag, length: transformed ? base128() : orig, transformed });
    }
    const data = brotliDecompressSync(buf.subarray(p, p + compressed));
    let off = 0;
    for (const t of dir) {
      if (!t.transformed) tables[t.tag] = data.subarray(off, off + t.length);
      off += t.length;
    }
    return tables;
  }
  const count = buf.readUInt16BE(4);
  for (let i = 0; i < count; i++) {
    const r = 12 + i * 16;
    tables[buf.toString("latin1", r, r + 4)] = buf.subarray(buf.readUInt32BE(r + 8), buf.readUInt32BE(r + 8) + buf.readUInt32BE(r + 12));
  }
  return tables;
}

/** Unicode -> glyph id from a format 4 or 12 cmap subtable (Windows Unicode). */
export function cmapLookup(cmap) {
  const n = cmap.readUInt16BE(2);
  let best = null;
  for (let i = 0; i < n; i++) {
    const platform = cmap.readUInt16BE(4 + i * 8);
    const encoding = cmap.readUInt16BE(6 + i * 8);
    const offset = cmap.readUInt32BE(8 + i * 8);
    const format = cmap.readUInt16BE(offset);
    if ((platform === 3 && (encoding === 1 || encoding === 10)) || platform === 0) {
      if (!best || format === 12) best = { offset, format };
    }
  }
  const t = cmap.subarray(best.offset);
  if (best.format === 12) {
    const groups = t.readUInt32BE(12);
    return (cp) => {
      for (let g = 0; g < groups; g++) {
        const s = t.readUInt32BE(16 + g * 12);
        const e = t.readUInt32BE(20 + g * 12);
        if (cp >= s && cp <= e) return t.readUInt32BE(24 + g * 12) + cp - s;
      }
      return 0;
    };
  }
  if (best.format !== 4) throw new Error(`cmap format ${best.format} unsupported`);
  const segs = t.readUInt16BE(6) / 2;
  const ends = 14;
  const starts = ends + segs * 2 + 2;
  const deltas = starts + segs * 2;
  const ranges = deltas + segs * 2;
  return (cp) => {
    for (let s = 0; s < segs; s++) {
      if (cp > t.readUInt16BE(ends + s * 2)) continue;
      const start = t.readUInt16BE(starts + s * 2);
      if (cp < start) return 0;
      const delta = t.readInt16BE(deltas + s * 2);
      const range = t.readUInt16BE(ranges + s * 2);
      if (!range) return (cp + delta) & 0xffff;
      const g = t.readUInt16BE(ranges + s * 2 + range + (cp - start) * 2);
      return g ? (g + delta) & 0xffff : 0;
    }
    return 0;
  };
}

export function fontMetrics(file) {
  const t = readTables(readFileSync(file));
  const upm = t.head.readUInt16BE(18);
  const hhea = { ascent: t.hhea.readInt16BE(4), descent: t.hhea.readInt16BE(6), lineGap: t.hhea.readInt16BE(8) };
  const os2 = t["OS/2"];
  const typo = { ascent: os2.readInt16BE(68), descent: os2.readInt16BE(70), lineGap: os2.readInt16BE(72), useTypo: Boolean(os2.readUInt16BE(62) & 0x80) };
  const numberOfHMetrics = t.hhea.readUInt16BE(34);
  const advance = (gid) => t.hmtx.readUInt16BE(Math.min(gid, numberOfHMetrics - 1) * 4);
  const glyph = cmapLookup(t.cmap);
  const total = Object.values(LETTERS).reduce((a, b) => a + b, 0);
  let avg = 0.175 * advance(glyph(32));
  for (const [ch, f] of Object.entries(LETTERS)) avg += 0.825 * (f / total) * advance(glyph(ch.charCodeAt(0)));
  const axes = [];
  if (t.fvar) {
    const off = t.fvar.readUInt16BE(4);
    const size = t.fvar.readUInt16BE(10);
    for (let i = 0; i < t.fvar.readUInt16BE(8); i++) {
      const o = off + i * size;
      const fixed = (x) => t.fvar.readInt32BE(x) / 65536;
      axes.push(`${t.fvar.toString("latin1", o, o + 4)} ${fixed(o + 4)}..${fixed(o + 12)} (default ${fixed(o + 8)})`);
    }
  }
  return { file, upm, hhea, typo, avgWidth: avg, axes };
}

const pct = (v) => `${(v * 100).toFixed(2)}%`;

if (import.meta.url === `file://${process.argv[1]}`) {
  const [web, fallback] = process.argv.slice(2);
  const w = fontMetrics(web);
  console.log(JSON.stringify(w, null, 1));
  if (fallback) {
    const f = fontMetrics(fallback);
    console.log(JSON.stringify(f, null, 1));
    const size = w.avgWidth / w.upm / (f.avgWidth / f.upm);
    const m = w.typo.useTypo ? w.typo : w.hhea;
    console.log(`size-adjust: ${pct(size)};`);
    console.log(`ascent-override: ${pct(m.ascent / w.upm / size)};`);
    console.log(`descent-override: ${pct(Math.abs(m.descent) / w.upm / size)};`);
    console.log(`line-gap-override: ${pct(m.lineGap / w.upm / size)};`);
  }
}
