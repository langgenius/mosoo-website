#!/usr/bin/env node
// Self-hosted type stack for the v4b "Paper" home (main-thread decision 1, ATLAS §7, proposal b-paper §2.2).
//
//   node apps/landing/scripts/assets/fonts.mjs <candidatesDir> [outDir=apps/landing/public/fonts]
//
// <candidatesDir> is the staging folder refs/fonts/candidates (Google Fonts latin subsets, all SIL OFL 1.1).
// For each family it copies the woff2 under a stable name, writes <Family>-OFL.txt (the copyright line read from
// the font's own name table, nameID 0, plus the OFL 1.1 text), checks that every character the copy uses has a
// glyph, and prints the metric overrides of a local fallback face (via scripts/brand-assets/font-metrics.mjs) for
// apps/landing/src/shared/styles/paper-fonts.css. Exit code 1 if a required glyph is missing.
import { copyFileSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { cmapLookup, fontMetrics, readTables } from "../../../../scripts/brand-assets/font-metrics.mjs";

const [candidates, outDir = "apps/landing/public/fonts"] = process.argv.slice(2);
if (!candidates) throw new Error("usage: fonts.mjs <candidatesDir> [outDir]");

// Hedvig is fitted to ABC Arizona Mix metrics (refs/fonts/notes.md L115): size-adjust 96%, ascent 100%, descent 28.125%.
const FAMILIES = [
  { src: "hedvig-letters-serif-normal-400.woff2", out: "HedvigLettersSerif-Regular-latin.woff2", license: "HedvigLettersSerif-OFL.txt", fallback: "/System/Library/Fonts/Supplemental/Georgia.ttf", fit: 0.96, ascent: 1.0, descent: 0.28125 },
  { src: "inter-normal-100_900.woff2", out: "Inter-Variable-latin.woff2", license: "Inter-OFL.txt", fallback: "/System/Library/Fonts/Supplemental/Arial.ttf" },
  { src: "fragment-mono-normal-400.woff2", out: "FragmentMono-Regular-latin.woff2", license: "FragmentMono-OFL.txt", fallback: "/System/Library/Fonts/Supplemental/Courier New.ttf" },
];

// Every non-ASCII character the en copy, the FAQ and the product strings use, plus the ones the brief names.
// U+2192 (→) is outside every Google Fonts latin subset (it ships U+2191 and U+2193 only), so it is reported, not
// required: draw arrows as SVG icons (shared/ui/console-glyphs.tsx) or let them fall to the system font.
const REQUIRED = "‘’“”–—×·…©";
const REPORT_ONLY = "→";
const OFL_BODY = readFileSync(new URL("./OFL-1.1.txt", import.meta.url), "utf8");

function copyright(tables) {
  const name = tables.name;
  const count = name.readUInt16BE(2);
  const strings = name.readUInt16BE(4);
  for (let i = 0; i < count; i++) {
    const r = 6 + i * 12;
    const [platform, , , nameId, length, offset] = [0, 2, 4, 6, 8, 10].map((o) => name.readUInt16BE(r + o));
    if (nameId !== 0) continue;
    const raw = name.subarray(strings + offset, strings + offset + length);
    if (platform === 3 || platform === 0) return raw.swap16().toString("utf16le");
    return raw.toString("latin1");
  }
  return "";
}

let missing = 0;
for (const f of FAMILIES) {
  const src = join(candidates, f.src);
  const dest = join(outDir, f.out);
  copyFileSync(src, dest);
  const tables = readTables(readFileSync(src));
  const glyph = cmapLookup(tables.cmap);
  const gaps = [...REQUIRED, ...REPORT_ONLY].filter((ch) => !glyph(ch.codePointAt(0)));
  missing += gaps.filter((ch) => !REPORT_ONLY.includes(ch)).length;
  writeFileSync(join(outDir, f.license), `${copyright(tables).trim()}\n\n${OFL_BODY}`);
  const web = fontMetrics(src);
  const local = fontMetrics(f.fallback);
  const fit = f.fit ?? 1;
  const ascent = (f.ascent ?? web.hhea.ascent / web.upm) * fit;
  const descent = (f.descent ?? -web.hhea.descent / web.upm) * fit;
  const sizeAdjust = (fit * (web.avgWidth / web.upm)) / (local.avgWidth / local.upm);
  const pct = (v) => `${(v * 100).toFixed(2)}%`;
  console.log(`${f.out} ${statSync(dest).size} B · missing: ${gaps.length ? gaps.map((c) => `U+${c.codePointAt(0).toString(16).toUpperCase()}`).join(" ") : "none"}`);
  console.log(`  fallback ${f.fallback.split("/").pop()}: size-adjust ${pct(sizeAdjust)}; ascent-override ${pct(ascent / sizeAdjust)}; descent-override ${pct(descent / sizeAdjust)}; line-gap-override 0%`);
}
process.exitCode = missing ? 1 : 0;
