import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

// The v5 home copy: one file per section in apps/landing/src/home/copy/, each with en, zh and ja in the same
// shape (keys starting with "$" are notes for writers). en is checked against the slot budgets below, in
// characters; the Session object's states (stage.kit) in object words. zh and ja must fill every en slot, no more
// and no fewer; their widths are the content phase's (it writes them to the same visual widths as en).
//
// Budgets: the main thread's slot table for v5 (2026-10-20). Rows marked "system" are the system agent's, for
// slots the table does not list (nav and footer chrome, button states, aria labels). A section agent that adds a
// slot declares its budget in its own file: "$slots": { "<path without the file name>": { "chars": n } }; a path
// budgeted here cannot be re-budgeted there.

const SECTIONS = ["nav", "hero", "stage", "accent", "faq", "closing", "footer"];
const LOCALES = ["en", "zh", "ja"];
const COPY = Object.fromEntries(
  SECTIONS.map((name) => [
    name,
    JSON.parse(readFileSync(new URL(`../apps/landing/src/home/copy/${name}.json`, import.meta.url), "utf8")),
  ]),
);

// path (section.slot; * = every array item or object value) -> max characters (en)
const BUDGETS = {
  // system: the bar's labels must fit the 720px floating bar next to the CTA
  "nav.skip": 24,
  "nav.home": 24,
  "nav.label": 24,
  "nav.docs": 14,
  "nav.useCases": 14,
  "nav.github": 14,
  "nav.signIn": 14,
  "nav.cta": 14,
  // hero: H1 two lines of a 72px two-tone serif (one line each at 1440); lead "{pre} [keys] {or} [key] {post}"
  "hero.h1a": 32,
  "hero.h1b": 28,
  "hero.lead.pre": 34,
  "hero.lead.or": 4, // system
  "hero.lead.post": 30,
  "hero.harnesses.*": 16, // system: product names, "Claude Agent SDK" is the longest
  "hero.primary": 14,
  "hero.secondary": 22,
  // stage: three step tags, three captions (title + one line)
  "stage.steps.*.tag": 8,
  "stage.steps.*.title": 34,
  "stage.steps.*.line": 70,
  "stage.kit.harness": 16, // system: a product name
  // the full lime screen
  "accent.tab": 22,
  "accent.gap": 16,
  "accent.h2a": 24,
  "accent.h2b": 26,
  "accent.sub": 110,
  "accent.cards.*.label": 14,
  "accent.cards.*.line": 48,
  // FAQ
  "faq.a": 20,
  "faq.b": 20,
  "faq.items.*.q": 48,
  "faq.items.*.a": 220,
  // closing (h2a + h2b: 30 together, checked below)
  "closing.h2a": 30,
  "closing.h2b": 30,
  "closing.prompt": 60,
  "closing.legend": 40,
  "closing.copy": 8, // system: button states
  "closing.copied": 8, // system
  "closing.primary": 14,
  "closing.caption": 50,
  // footer
  "footer.columns.*.title": 14,
  "footer.columns.*.links.*": 22,
  "footer.columns.harnesses.names.*": 22,
  "footer.ask.title": 28,
  "footer.ask.prompt": 200, // system: only in the assistant links' query
  "footer.label": 14, // system: aria-label
  "footer.home": 24, // system: aria-label
  "footer.languages": 24, // system: aria-label
  "footer.copyright": 40, // system
};

// The Session object's states (src/home/kit renderSession): visible words per state, at most 14 (object words,
// counted as tools/budget.ts does: the object's text split at spaces; {file} stands for the file).
const KIT_STATE_WORDS = 14;
const kitStates = (kit) => ({
  call: [kit.harness, kit.call.instruction, kit.call.attachment],
  watch: [kit.watch.status, kit.watch.action.replace("{file}", kit.watch.file), kit.watch.stream, ...kit.watch.events],
  return: [kit.return.turn, kit.return.after, kit.return.restored],
});

const words = (value) => value.split(/\s+/).filter(Boolean).length;

/** Every string leaf under node as [path, value], arrays and objects as "*"-able segments. */
function leaves(node, path = []) {
  if (typeof node === "string") return [[path, node]];
  if (Array.isArray(node)) return node.flatMap((item, i) => leaves(item, [...path, String(i)]));
  if (node && typeof node === "object") {
    return Object.entries(node)
      .filter(([key]) => !key.startsWith("$"))
      .flatMap(([key, value]) => leaves(value, [...path, key]));
  }
  return [[path, node]];
}

const matches = (pattern, path) => {
  const parts = pattern.split(".");
  return parts.length === path.length && parts.every((part, i) => part === "*" || part === path[i]);
};

function budgetFor(section, path) {
  const full = [section, ...path];
  const own = Object.entries(BUDGETS).find(([pattern]) => matches(pattern, full));
  if (own) return { source: "test", chars: own[1] };
  const declared = Object.entries(COPY[section].$slots ?? {}).find(([pattern]) => matches(pattern, path));
  if (declared) return { source: "$slots", chars: declared[1].chars };
  return null;
}

test("every copy file has en, zh and ja", () => {
  for (const section of SECTIONS) {
    assert.deepEqual(
      Object.keys(COPY[section]).filter((key) => !key.startsWith("$")),
      LOCALES,
      `${section}.json has en, zh, ja`,
    );
  }
});

test("every en slot has a budget and fits it", () => {
  const overflow = [];
  for (const section of SECTIONS) {
    for (const [path, value] of leaves(COPY[section].en)) {
      const where = [section, ...path].join(".");
      assert.equal(typeof value, "string", `${where} is a string`);
      assert.ok(value.trim().length > 0, `${where} is not empty`);
      if (section === "stage" && path[0] === "kit" && path[1] !== "harness") continue; // object words, below
      const budget = budgetFor(section, path);
      assert.ok(budget, `${where} has a budget (add it here or in ${section}.json "$slots")`);
      if ([...value].length > budget.chars) overflow.push(`${where}: ${[...value].length} > ${budget.chars}: ${value}`);
    }
    for (const pattern of Object.keys(COPY[section].$slots ?? {})) {
      const full = `${section}.${pattern}`;
      assert.ok(
        !Object.keys(BUDGETS).some((own) => matches(own, full.split("."))),
        `${full} is budgeted in this test; ${section}.json "$slots" cannot re-budget it`,
      );
    }
  }
  const closing = COPY.closing.en;
  const together = [...closing.h2a].length + [...closing.h2b].length;
  if (together > 30) overflow.push(`closing.h2a + h2b: ${together} > 30 characters together`);
  assert.deepEqual(overflow, []);
});

test("each state of the Session object shows at most 14 words (en)", () => {
  for (const [state, strings] of Object.entries(kitStates(COPY.stage.en.kit))) {
    const count = strings.reduce((sum, value) => sum + words(value), 0);
    assert.ok(count <= KIT_STATE_WORDS, `stage.kit ${state}: ${count} words > ${KIT_STATE_WORDS}`);
  }
  assert.match(COPY.stage.en.kit.watch.action, /\{file\}/, "the watch action marks where the file keycap goes");
});

// tools/budget.ts: at most 25 marketing words on the first screen. The hero's own slots must leave that room; the
// keycaps are drawn objects (data-product-ui), so their names count as object words (first screen: at most 16).
test("the hero's marketing words fit the first-screen budget (en)", () => {
  const h = COPY.hero.en;
  const marketing = [h.h1a, h.h1b, h.lead.pre, h.lead.or, h.lead.post, h.primary, h.secondary].reduce(
    (sum, value) => sum + words(value),
    0,
  );
  assert.ok(marketing <= 25, `hero: ${marketing} marketing words > 25`);
  assert.equal(h.harnesses.length, 4, "four harness keycaps");
});

test("zh and ja fill the same slots as en, no more and no fewer", () => {
  const shape = (node) =>
    Array.isArray(node)
      ? node.map(shape)
      : node && typeof node === "object"
        ? Object.fromEntries(
            Object.entries(node)
              .filter(([key]) => !key.startsWith("$"))
              .map(([k, v]) => [k, shape(v)]),
          )
        : typeof node;
  for (const section of SECTIONS) {
    for (const locale of ["zh", "ja"]) {
      assert.deepEqual(shape(COPY[section][locale]), shape(COPY[section].en), `${section} ${locale} has en's slots`);
      for (const [path, value] of leaves(COPY[section][locale])) {
        assert.ok(
          typeof value === "string" && value.trim().length > 0,
          `${section}.${locale}.${path.join(".")} is filled`,
        );
      }
    }
  }
});

test("product names and machine tokens are spelled the same in every locale", () => {
  for (const locale of ["zh", "ja"]) {
    assert.deepEqual(COPY.hero[locale].harnesses, COPY.hero.en.harnesses, `${locale} hero harness names`);
    assert.equal(COPY.stage[locale].kit.harness, COPY.stage.en.kit.harness, `${locale} stage harness`);
    assert.deepEqual(
      COPY.footer[locale].columns.harnesses.names,
      COPY.footer.en.columns.harnesses.names,
      `${locale} footer harness names`,
    );
    assert.match(COPY.stage[locale].kit.watch.action, /\{file\}/, `${locale} watch action marks the file`);
  }
});
