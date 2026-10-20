import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import test from "node:test";

// The brand is lowercase, even at the start of a sentence (langgenius/mosoo docs/design/console-design-contract.md
// §10), and so is the second product's name (owner 2026-10-20 21:57: 「mosoo computer 一律小写」). URLs, slugs and
// file names keep their spelling; they are lowercase already.
const DIR = new URL("../apps/blog/src/content/blog/", import.meta.url);
const posts = () =>
  readdirSync(DIR)
    .filter((name) => /\.mdx?$/.test(name) && name !== "README.md")
    .map((name) => [name, readFileSync(new URL(name, DIR), "utf8")]);
// What a reader sees: link text and alt text stay, link targets and image paths go.
const prose = (source) => source.replace(/\]\([^)]*\)/g, "]");

test("blog posts write the brand in lowercase, mosoo computer included", () => {
  for (const [name, source] of posts()) {
    const text = prose(source);
    assert.doesNotMatch(text, /\bMosoo\b/, `${name} writes mosoo in lowercase`);
    assert.doesNotMatch(text, /\bmosoo Computer\b/, `${name} writes mosoo computer in lowercase`);
  }
});

test("the mosoo computer post names the product in lowercase in its title, card and description", () => {
  const entries = posts().filter(([name]) => name.startsWith("introducing-mosoo-computer"));
  assert.equal(entries.length, 3, "en, zh and ja");
  for (const [name, source] of entries) {
    assert.match(source, /^title: "mosoo computer[:：]/m, `${name} title`);
    assert.match(source, /^cardTitle: "mosoo computer[.。]"$/m, `${name} card title`);
    assert.match(source, /^description: "mosoo computer /m, `${name} description`);
  }
});
