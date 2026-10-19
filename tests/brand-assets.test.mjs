import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

// Guards for the brand type: CJK headings keep their own punctuation.

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const literataCss = readFileSync(join(root, "apps/landing/src/shared/styles/literata.css"), "utf8");

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
