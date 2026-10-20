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

const SECTIONS = ["nav", "hero", "stage", "spec", "accent", "faq", "closing", "footer"];
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
  // the spec table (graft 2026-10-20, staging v5/graft/INTEGRATION.md, the spec screen): the two-tone H2 over the
  // card (48px, one line each at 1440), five row labels (sans 14), the values (sans 17 after a 20px glyph: one line at
  // 1440, at most two at 390); Files is one mono token in a keycap. The Harness row's names are hero.harnesses.
  "spec.h2a": 28,
  "spec.h2b": 30,
  "spec.labels.*": 12,
  "spec.values.files": 24,
  "spec.values.*": 40,
  // the full lime screen; three cards in one row (staging v5/graft/lime/NOTES.md: a 24-character label stays on one
  // line and a 48-character line takes at most two, 360-1440)
  "accent.tab": 22,
  "accent.gap": 16,
  "accent.h2a": 24,
  "accent.h2b": 26,
  "accent.sub": 110,
  "accent.cards.*.label": 24,
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

// The full lime screen tells a Session's life between turns in three cards, in this order (sections/accent.ts PARTS:
// sandbox, files, resume); the five parts themselves are the spec table's. zh and ja follow en's shape (below).
test("the lime screen has three cards (en)", () => {
  assert.equal(COPY.accent.en.cards.length, 3, "accent.cards: Sandbox, Files and conversation, Resume");
});

// The spec table (sections/spec.ts): one row per part, in this order, and the Harness row's four names are the hero's
// (the switch rolls them in HARNESS_IDS order). The title reads as a pick of one of four, never as a Session changing
// harness: harness and model are frozen at creation and a Session never changes harness (MAIN docs/SPEC.md §3 L31;
// staging v5/graft/switch/NOTES.md §5.4: v4c's earlier "Swap the harness, keep the rest." is out).
test("the spec table has five parts, picks one harness of four, and keeps its token (en, zh, ja)", () => {
  for (const locale of LOCALES) {
    const spec = COPY.spec[locale];
    assert.deepEqual(Object.keys(spec.labels), ["harness", "model", "sandbox", "files", "resume"], `${locale} rows`);
    assert.deepEqual(Object.keys(spec.values), ["model", "sandbox", "files", "resume"], `${locale} values`);
    assert.equal(spec.values.files, COPY.spec.en.values.files, `${locale} file token`);
  }
  assert.equal(COPY.hero.en.harnesses.length, 4, "four harness names to roll");
  assert.doesNotMatch(`${COPY.spec.en.h2a} ${COPY.spec.en.h2b}`, /\b(swap|switch|change)/i, "a pick, not a swap");
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

// The first screen also shows the stage plate's first state (Call, sections/stage.ts): its words and the four
// keycaps are the first screen's object words, at most 16 in tools/budget.ts (staging v5/sections/hero-stage/NOTES.md
// §6: keycaps 6 + Call 7 = 13 with today's placeholders).
test("the keycaps and the Call state fit the first screen's object words (en)", () => {
  const keycaps = COPY.hero.en.harnesses.reduce((sum, value) => sum + words(value), 0);
  const call = kitStates(COPY.stage.en.kit).call.reduce((sum, value) => sum + words(value), 0);
  assert.ok(keycaps + call <= 16, `first-screen object words: keycaps ${keycaps} + Call ${call} > 16`);
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

// zh and ja are written to en's visual widths, by v4d's rule (9e92312 tests/home-copy-slots.test.mjs): a CJK
// character is as wide as two Latin ones, so a slot of n en characters holds n / 2 full-width characters, a Latin
// character or a space counting as half. The hero lead and the closing title are one run of text each, so their parts
// share one budget (word order differs between the languages). The Session object's strings have no en character
// budget (object words instead): their widths keep each on the line it takes in en (staging v5/content/NOTES.md).
// Line breaks themselves are checked in the browser (staging v5/content/NOTES.md, the slot probe at 360-1440).
const cjkWidth = (value) => [...value].reduce((sum, char) => sum + (char.charCodeAt(0) < 0x2e80 ? 0.5 : 1), 0);
const CJK_GROUPS = [
  { name: "hero.lead", paths: ["hero.lead.pre", "hero.lead.or", "hero.lead.post"] },
  { name: "closing.h2a + h2b", paths: ["closing.h2a", "closing.h2b"], width: 15 },
];
const KIT_CJK = {
  "kit.call.instruction": 25, // set in Fragment Mono since v5 FIXES: the plate cuts it at 1440 from about 51 en characters
  "kit.watch.action": 24, // with the file keycap in it: one line at 1440 and 1024, two at 390, as en
  "kit.watch.status": 8,
  "kit.watch.stream": 12,
  "kit.watch.events.*": 10,
  "kit.return.turn": 8,
  "kit.return.after": 6,
  "kit.return.restored": 16,
};

test("zh and ja fit en's visual widths (full-width characters, Latin counting half)", () => {
  const overflow = [];
  const grouped = new Set(CJK_GROUPS.flatMap((group) => group.paths));
  const at = (node, path) => path.split(".").reduce((value, key) => value[key], node);
  for (const locale of ["zh", "ja"]) {
    for (const section of SECTIONS) {
      for (const [path, value] of leaves(COPY[section][locale])) {
        const where = [section, ...path].join(".");
        if (grouped.has(where)) continue;
        if (section === "stage" && path[0] === "kit") {
          const kit = Object.entries(KIT_CJK).find(([pattern]) => matches(pattern, path));
          const text = path[2] === "action" ? value.replace("{file}", COPY.stage[locale].kit.watch.file) : value;
          if (kit && cjkWidth(text) > kit[1]) overflow.push(`${locale} ${where}: ${cjkWidth(text)} > ${kit[1]} wide: ${text}`);
          continue;
        }
        const budget = budgetFor(section, path);
        if (budget && cjkWidth(value) > budget.chars / 2) {
          overflow.push(`${locale} ${where}: ${cjkWidth(value)} > ${budget.chars / 2} wide: ${value}`);
        }
      }
    }
    for (const group of CJK_GROUPS) {
      const width = group.paths.reduce((sum, path) => {
        const [section, ...rest] = path.split(".");
        return sum + cjkWidth(at(COPY[section][locale], rest.join(".")));
      }, 0);
      const limit =
        group.width ??
        group.paths.reduce((sum, path) => {
          const [section, ...rest] = path.split(".");
          return sum + (budgetFor(section, rest)?.chars ?? 0) / 2;
        }, 0);
      if (width > limit) overflow.push(`${locale} ${group.name}: ${width} > ${limit} wide`);
    }
  }
  assert.deepEqual(overflow, []);
});

test("product names and machine tokens are spelled the same in every locale", () => {
  for (const locale of ["zh", "ja"]) {
    assert.deepEqual(COPY.hero[locale].harnesses, COPY.hero.en.harnesses, `${locale} hero harness names`);
    assert.equal(COPY.stage[locale].kit.harness, COPY.stage.en.kit.harness, `${locale} stage harness`);
    assert.equal(COPY.stage[locale].kit.call.attachment, COPY.stage.en.kit.call.attachment, `${locale} attached file`);
    assert.equal(COPY.stage[locale].kit.watch.file, COPY.stage.en.kit.watch.file, `${locale} file being written`);
    assert.deepEqual(
      COPY.footer[locale].columns.harnesses.names,
      COPY.footer.en.columns.harnesses.names,
      `${locale} footer harness names`,
    );
    assert.match(COPY.stage[locale].kit.watch.action, /\{file\}/, `${locale} watch action marks the file`);
  }
});
