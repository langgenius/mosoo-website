import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

// Guards for the brand kit (scripts/brand-assets/MANIFEST.md): the generated
// files stay out of the website's CSS, CJK headings keep their own punctuation,
// the stage plates carry no lime, and the manifest matches the files.

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const bamboo = join(root, "apps/landing/public/landing/bamboo");
const fonts = join(root, "apps/landing/public/fonts");
const literataCss = readFileSync(join(root, "apps/landing/src/shared/styles/literata.css"), "utf8");

test("the bamboo kit folder adds no Tailwind utilities to the website build", async (t) => {
  let compile;
  let Scanner;
  try {
    ({ compile } = await import("@tailwindcss/node"));
    ({ Scanner } = await import("@tailwindcss/oxide"));
  } catch {
    t.skip("Tailwind's node packages are not installed");
    return;
  }
  // Tailwind's automatic source detection scans apps/landing/public, so a word
  // in a generated SVG that names a utility (once: "ring") becomes global CSS.
  const fresh = () => compile('@import "tailwindcss";', { base: join(root, "apps/landing/src/shared/styles"), onDependency() {} });
  const candidates = new Scanner({ sources: [{ base: bamboo, pattern: "**/*", negated: false }] }).scan();
  const without = (await fresh()).build([]);
  if ((await fresh()).build(candidates) !== without) {
    const live = [];
    for (const candidate of candidates) if ((await fresh()).build([candidate]) !== without) live.push(candidate);
    assert.deepEqual(live, [], "candidates from apps/landing/public/landing/bamboo that emit CSS");
  }
});

/** Parse "U+0000-00B6, U+2013" into [[start, end], ...]. */
const parseRanges = (value) =>
  value.split(",").map((part) => {
    const [start, end = start] = part.trim().replace(/^U\+/i, "").split("-");
    return [Number.parseInt(start, 16), Number.parseInt(end, 16)];
  });

test("zh and ja Literata stacks leave CJK punctuation to the CJK serif faces", () => {
  const faces = [...literataCss.matchAll(/@font-face\s*{([^}]*)}/g)].map(([, body]) => ({
    family: body.match(/font-family:\s*"([^"]+)"/)[1],
    ranges: body.match(/unicode-range:\s*([^;]+);/)?.[1],
  }));
  // Middle dot, quotes, dashes, ellipsis, hyphenation point: full width in CJK text.
  const punctuation = [0x00b7, 0x2014, 0x2018, 0x2019, 0x201c, 0x201d, 0x2026, 0x2027];
  for (const variable of ["--font-literata-zh", "--font-literata-ja"]) {
    const stack = literataCss.match(new RegExp(`${variable}:\\s*([^;]+);`))[1];
    const families = [...stack.matchAll(/"([^"]+)"/g)].map(([, family]) => family);
    const cjk = families.findIndex((family) => /Songti|STSong|Mincho|CJK|Serif SC|Serif JP/.test(family));
    assert.ok(cjk > 0, `${variable} names a CJK serif face after its Latin faces`);
    for (const family of families.slice(0, cjk)) {
      const own = faces.filter((face) => face.family === family);
      assert.ok(own.length > 0, `${variable}: "${family}" is declared in literata.css`);
      for (const face of own) {
        assert.ok(face.ranges, `${variable}: every "${family}" face has a unicode-range`);
        const ranges = parseRanges(face.ranges);
        for (const cp of punctuation) {
          const hit = ranges.some(([start, end]) => cp >= start && cp <= end);
          assert.equal(hit, false, `${variable}: "${family}" covers U+${cp.toString(16).toUpperCase().padStart(4, "0")}`);
        }
      }
    }
  }
});

/** Palette entries of an indexed PNG (PLTE chunk), as hex strings. */
function pngPalette(file) {
  const buf = readFileSync(file);
  for (let o = 8; o < buf.length; ) {
    const length = buf.readUInt32BE(o);
    if (buf.toString("latin1", o + 4, o + 8) === "PLTE") {
      const body = buf.subarray(o + 8, o + 8 + length);
      return Array.from({ length: length / 3 }, (_, i) => `#${body.subarray(i * 3, i * 3 + 3).toString("hex")}`);
    }
    o += 12 + length;
  }
  return [];
}

// v4: the bamboo kit left the site (owner notes 2026-10-19; decision 10). Its generator stays in
// scripts/brand-assets, but nothing it made may ship or be referenced again.
test("the site ships no bamboo: the kit folder is gone and no landing source loads it", () => {
  assert.equal(existsSync(bamboo), false, "apps/landing/public/landing/bamboo is deleted");
  const sources = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) walk(path);
      else if (/\.(tsx?|css|html|mjs)$/.test(name)) sources.push(path);
    }
  };
  walk(join(root, "apps/landing/src"));
  for (const page of readdirSync(join(root, "apps/landing")).filter((name) => name.endsWith(".html"))) {
    sources.push(join(root, "apps/landing", page));
  }
  for (const path of sources) {
    assert.doesNotMatch(readFileSync(path, "utf8"), /landing\/bamboo|bamboo-(plate|node|sea|sky|grove)/i, path);
  }
});

test("MANIFEST.md lists every brand kit file with its current size", () => {
  const manifest = readFileSync(join(root, "scripts/brand-assets/MANIFEST.md"), "utf8");
  // The bamboo rows describe the generator's output, which the site no longer ships (see above).
  const files = [
    ...readdirSync(fonts).filter((name) => name.startsWith("Literata")).map((name) => `apps/landing/public/fonts/${name}`),
    "apps/landing/src/shared/styles/literata.css",
  ];
  for (const path of files) {
    const row = manifest.split("\n").find((line) => line.startsWith(`| \`${path}\` |`));
    assert.ok(row, `${path} has a row in MANIFEST.md`);
    const bytes = statSync(join(root, path)).size.toLocaleString("en-US");
    assert.ok(row.includes(`| ${bytes} |`), `${path}: MANIFEST.md says ${row.split("|")[2].trim()}, the file has ${bytes} bytes`);
  }
});
