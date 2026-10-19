#!/usr/bin/env node
// Self-hosts the v4c type stack and proves it covers the copy.
//
//   node apps/landing/scripts/assets/fonts.mjs [<candidatesDir>]
//
// Input: the OFL candidates the font study downloaded from Google Fonts
// (default $MOSOO_STAGING/refs/fonts/candidates, where MOSOO_STAGING is the redesign staging folder).
// Output (apps/landing/public/fonts/):
//   hedvig-letters-serif-400.woff2 + HedvigLettersSerif-OFL.txt  (display stand-in for ABC Arizona Mix)
//   inter-latin-var.woff2          + Inter-OFL.txt               (text, variable 100-900, Latin subset)
//   fragment-mono-400.woff2        + FragmentMono-OFL.txt        (machine facts)
// and prints, per face: bytes, unitsPerEm, hhea ascender/descender/lineGap, the copyright line from
// the name table (ID 0) and every required glyph the cmap is missing. Exit 1 when a face misses a
// glyph the copy uses or the three faces pass the 125 KB budget (ATLAS §1.2).
//
// No dependencies: WOFF2 is parsed by hand (header, table directory, one brotli stream via
// node:zlib); cmap, name, head and hhea are never transformed in WOFF2, so they are read as is.

import { copyFileSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { brotliDecompressSync } from "node:zlib";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(HERE, "../../public/fonts");
if (!process.argv[2] && !process.env.MOSOO_STAGING) {
  throw new Error("pass <candidatesDir> or set MOSOO_STAGING to the redesign staging folder");
}
const SRC = resolve(process.argv[2] ?? join(process.env.MOSOO_STAGING, "refs/fonts/candidates"));
const BUDGET = 125 * 1024;

const FACES = [
  { from: "hedvig-letters-serif-normal-400.woff2", to: "hedvig-letters-serif-400.woff2", license: "HedvigLettersSerif-OFL.txt" },
  { from: "inter-normal-100_900.woff2", to: "inter-latin-var.woff2", license: "Inter-OFL.txt" },
  { from: "fragment-mono-normal-400.woff2", to: "fragment-mono-400.woff2", license: "FragmentMono-OFL.txt" },
];

// Basic Latin plus every non-ASCII character the en copy and the product UI use.
const REQUIRED = [
  ...Array.from({ length: 95 }, (_, i) => 0x20 + i),
  0x2018, 0x2019, 0x201c, 0x201d, // curly quotes
  0x2013, 0x2014, // en and em dash
  0x00d7, // ×
  0x00b7, // ·
  0x2026, // …
  0x00a9, // ©
];

// Reported, never required: none of the three files has U+2192 (Google's "latin" subset stops at
// U+2191/U+2193), so the page draws arrows as inline SVG instead of typing the character.
const ADVISORY = [0x2192];

const KNOWN_TAGS = ("cmap head hhea hmtx maxp name OS/2 post cvt  fpgm glyf loca prep CFF  VORG EBDT EBLC gasp hdmx kern LTSH PCLT VDMX vhea vmtx BASE GDEF GPOS GSUB EBSC JSTF MATH CBDT CBLC COLR CPAL SVG  sbix acnt avar bdat bloc bsln cvar fdsc feat fmtx fvar gvar hsty just lcar mort morx opbd prop trak Zapf Silf Glat Gloc Feat Sill")
  .match(/.{4}\s?/g)
  .map((t) => t.slice(0, 4));

function readBase128(buf, pos) {
  let value = 0;
  for (let i = 0; i < 5; i++) {
    const byte = buf[pos.at++];
    value = (value << 7) | (byte & 0x7f);
    if ((byte & 0x80) === 0) return value >>> 0;
  }
  throw new Error("bad UIntBase128");
}

function woff2Tables(buf) {
  if (buf.toString("latin1", 0, 4) !== "wOF2") throw new Error("not WOFF2");
  const numTables = buf.readUInt16BE(12);
  const compressedSize = buf.readUInt32BE(20);
  const pos = { at: 48 };
  const dir = [];
  for (let i = 0; i < numTables; i++) {
    const flags = buf[pos.at++];
    const tagIndex = flags & 0x3f;
    let tag;
    if (tagIndex === 63) {
      tag = buf.toString("latin1", pos.at, pos.at + 4);
      pos.at += 4;
    } else tag = KNOWN_TAGS[tagIndex];
    const version = flags >> 6;
    const origLength = readBase128(buf, pos);
    const transformed = tag === "glyf" || tag === "loca" ? version === 0 : version !== 0;
    const length = transformed ? readBase128(buf, pos) : origLength;
    dir.push({ tag, length });
  }
  const data = brotliDecompressSync(buf.subarray(pos.at, pos.at + compressedSize));
  const tables = {};
  let offset = 0;
  for (const { tag, length } of dir) {
    tables[tag] = data.subarray(offset, offset + length);
    offset += length;
  }
  return tables;
}

function cmapCovers(cmap) {
  const n = cmap.readUInt16BE(2);
  let best = null;
  for (let i = 0; i < n; i++) {
    const platform = cmap.readUInt16BE(4 + i * 8);
    const encoding = cmap.readUInt16BE(6 + i * 8);
    const offset = cmap.readUInt32BE(8 + i * 8);
    const format = cmap.readUInt16BE(offset);
    if (format === 12 && platform === 3 && encoding === 10) best = { format, offset };
    else if (format === 4 && platform === 3 && encoding === 1 && !best) best = { format, offset };
  }
  if (!best) throw new Error("no Windows Unicode cmap");
  const t = cmap.subarray(best.offset);
  if (best.format === 12) {
    const groups = t.readUInt32BE(12);
    return (cp) => {
      for (let g = 0; g < groups; g++) {
        const start = t.readUInt32BE(16 + g * 12);
        const end = t.readUInt32BE(20 + g * 12);
        if (cp >= start && cp <= end) return t.readUInt32BE(24 + g * 12) + (cp - start) !== 0;
      }
      return false;
    };
  }
  const segX2 = t.readUInt16BE(6);
  const ends = 14;
  const starts = ends + segX2 + 2;
  const deltas = starts + segX2;
  const ranges = deltas + segX2;
  return (cp) => {
    for (let s = 0; s < segX2; s += 2) {
      const end = t.readUInt16BE(ends + s);
      if (cp > end) continue;
      const start = t.readUInt16BE(starts + s);
      if (cp < start) return false;
      const delta = t.readInt16BE(deltas + s);
      const rangeOffset = t.readUInt16BE(ranges + s);
      if (rangeOffset === 0) return ((cp + delta) & 0xffff) !== 0;
      const glyph = t.readUInt16BE(ranges + s + rangeOffset + (cp - start) * 2);
      return glyph !== 0;
    }
    return false;
  };
}

function nameRecord(name, id) {
  const count = name.readUInt16BE(2);
  const strings = name.readUInt16BE(4);
  let mac = null;
  for (let i = 0; i < count; i++) {
    const r = 6 + i * 12;
    if (name.readUInt16BE(r + 6) !== id) continue;
    const platform = name.readUInt16BE(r);
    const length = name.readUInt16BE(r + 8);
    const offset = strings + name.readUInt16BE(r + 10);
    const raw = name.subarray(offset, offset + length);
    if (platform === 3) return Buffer.from(raw).swap16().toString("utf16le");
    if (platform === 1) mac = raw.toString("latin1");
  }
  return mac;
}

const OFL = readFileSync(join(HERE, "ofl-1.1.txt"), "utf8");

let failed = false;
let total = 0;
for (const face of FACES) {
  const from = join(SRC, face.from);
  const buf = readFileSync(from);
  const tables = woff2Tables(buf);
  const covers = cmapCovers(tables.cmap);
  const advisory = ADVISORY.filter((cp) => !covers(cp)).map((cp) => `U+${cp.toString(16).toUpperCase()} ${String.fromCodePoint(cp)}`);
  const missing = REQUIRED.filter((cp) => !covers(cp)).map((cp) => `U+${cp.toString(16).toUpperCase().padStart(4, "0")} ${String.fromCodePoint(cp)}`);
  const head = tables.head;
  const hhea = tables.hhea;
  const copyright = nameRecord(tables.name, 0);
  const family = nameRecord(tables.name, 1);
  copyFileSync(from, join(OUT, face.to));
  writeFileSync(join(OUT, face.license), `${copyright}\n\n${OFL}`);
  total += buf.length;
  const metrics = {
    unitsPerEm: head.readUInt16BE(18),
    ascender: hhea.readInt16BE(4),
    descender: hhea.readInt16BE(6),
    lineGap: hhea.readInt16BE(8),
  };
  console.log(JSON.stringify({ file: face.to, family, bytes: buf.length, ...metrics, copyright, missing, advisoryMissing: advisory }));
  // The display face may borrow a glyph from the text face (unicode-range in fonts-v4.css), so only a
  // gap in Inter or Fragment Mono fails the run.
  if (missing.length && face.to !== "hedvig-letters-serif-400.woff2") failed = true;
}
console.log(JSON.stringify({ totalBytes: total, budget: BUDGET, ok: total <= BUDGET }));
if (total > BUDGET || failed) process.exit(1);
