import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

// The home copy is written to the slot sizes locked in staging
// v4d/UI-LOCK.md §3: en as characters (and words) per slot, zh/ja as a
// full-width budget where a Latin character counts as half. A string that
// does not fit is rewritten; the slots never grow.
const COPY = JSON.parse(
  readFileSync(new URL("../apps/landing/src/routes/login/landing/home-copy.json", import.meta.url), "utf8"),
);

// [path, en characters, en words, CJK width]
const SLOTS = [
  ["hero.h1a", 30, 5, 14],
  ["hero.h1b", 30, 5, 14],
  ["hero.lead", 64, 12, 30],
  ["hero.primary", 12, 3, 6],
  ["hero.secondary", 20, 4, 8],
  ["object.line", 16, 3, 7],
  ["object.event", 16, 1, 8],
  ["object.satellites.*.key", 12, 2, 5],
  ["object.satellites.*.value", 16, 2, 7],
  ["verbs.*.verb", 8, 1, 3],
  ["verbs.*.desc", 92, 12, 36],
  ["stack.label", 12, 2, 6],
  ["stack.token", 8, 2, 4],
  ["stack.status", 32, 6, 14],
  ["stack.title", 28, 6, 14],
  ["stack.desc", 64, 12, 30],
  ["supply.a", 22, 4, 10],
  ["supply.b", 22, 4, 10],
  ["supply.cards.*.name", 16, 2, 7],
  ["supply.cards.*.badge", 6, 1, 3],
  ["supply.cards.*.value", 6, 2, 3],
  ["supply.cards.*.label", 24, 5, 11],
  ["supply.cards.*.status", 28, 4, 12],
  ["faq.label", 6, 1, 4],
  ["faq.a", 24, 4, 10],
  ["faq.b", 24, 5, 10],
  ["faq.items.*.q", 88, 10, 44],
  ["faq.items.*.a", 310, 40, 110],
  ["close.a", 18, 4, 8],
  ["close.b", 18, 4, 8],
  ["close.legend", 18, 4, 8],
  ["close.prompt", 56, 12, 28],
  ["close.button", 8, 1, 4],
  ["close.done", 8, 1, 4],
  ["close.fine", 40, 8, 20],
];

const valuesAt = (node, [head, ...rest]) =>
  head === undefined ? [node] : head === "*" ? node.flatMap((item) => valuesAt(item, rest)) : valuesAt(node[head], rest);
const words = (value) => value.split(/\s+/).filter(Boolean).length;
// Full-width budget: a Latin character or space counts as half a CJK one.
const cjkWidth = (value) => [...value].reduce((sum, char) => sum + (char.charCodeAt(0) < 0x2e80 ? 0.5 : 1), 0);

test("every home string fits its locked slot in every locale", () => {
  assert.deepEqual(Object.keys(COPY), ["en", "zh", "ja"]);
  const overflow = [];
  for (const [path, chars, maxWords, width] of SLOTS) {
    for (const locale of ["en", "zh", "ja"]) {
      const values = valuesAt(COPY[locale], path.split("."));
      assert.ok(values.length > 0 && values.every((value) => typeof value === "string" && value.length > 0), `${locale} ${path}`);
      for (const value of values) {
        if (locale === "en") {
          if (value.length > chars) overflow.push(`${path} en: ${value.length} > ${chars} characters: ${value}`);
          if (words(value) > maxWords) overflow.push(`${path} en: ${words(value)} > ${maxWords} words: ${value}`);
        } else if (cjkWidth(value) > width) {
          overflow.push(`${path} ${locale}: ${cjkWidth(value)} > ${width} wide: ${value}`);
        }
      }
    }
  }
  assert.deepEqual(overflow, []);
});

// Greedy word wrap, as a browser breaks Latin text at spaces.
const wrap = (value, width) =>
  value.split(" ").reduce((lines, word) => {
    const last = lines.at(-1);
    if (last !== undefined && `${last} ${word}`.length <= width) lines[lines.length - 1] = `${last} ${word}`;
    else lines.push(word);
    return lines;
  }, []);

test("the copyable prompt shows whole at 390px (2 lines of 28)", () => {
  // UI-LOCK U06-C: the phone clamps the sentence at two lines, so a longer
  // sentence would hide its end, the part a coding agent needs.
  assert.ok(wrap(COPY.en.close.prompt, 28).length <= 2, COPY.en.close.prompt);
});

test("zh and ja fill the same slots as en, no more and no fewer", () => {
  const shape = (node) =>
    Array.isArray(node) ? node.map(shape) : typeof node === "object" ? Object.fromEntries(Object.entries(node).map(([k, v]) => [k, shape(v)])) : typeof node;
  for (const locale of ["zh", "ja"]) assert.deepEqual(shape(COPY[locale]), shape(COPY.en), `${locale} has en's slots`);
  // Machine tokens stay as the main repo spells them.
  for (const locale of ["zh", "ja"]) {
    assert.equal(COPY[locale].object.event, COPY.en.object.event);
    assert.deepEqual(
      COPY[locale].supply.cards.map((card) => card.badge),
      COPY.en.supply.cards.map((card) => card.badge),
    );
  }
});
