import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { BREAK, plain } from "../apps/landing/src/home/markup.ts";
import { renderLandingLocale } from "../scripts/landing-locales.mjs";

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
  // system: the bar's labels must fit the 840px floating bar next to the CTA (staging v5/polish/nav/NOTES.md: the
  // widest row, ja with the CTA in, needs 828 at 24px gaps)
  "nav.skip": 24,
  "nav.home": 24,
  "nav.label": 24,
  "nav.products.label": 14,
  "nav.products.new": 6, // the New chip
  "nav.products.items.*.name": 16, // product names: "mosoo computer" is the longest
  "nav.products.items.*.line": 54, // one line in the 464px panel at 1440 (390px text column; ja mosoo 378px)
  "nav.docs": 14,
  "nav.useCases": 14,
  "nav.github": 14,
  "nav.language": 14, // the language list's heading (shown in the phone sheet)
  "nav.languageButton": 24, // aria-label; {lang} is langShort
  "nav.langShort": 8, // EN / 中文 / 日本語 on the bar's switch
  "nav.signIn": 14,
  "nav.menu": 14, // aria-label of the phone menu button
  "nav.cta": 14,
  // the announcement over the H1 (data-budget="chrome": not first-screen marketing words): one line at 390 in en, zh
  // and ja (ja 'mosoo computer をリリースしました' is 16.5 wide, so the en budget is 34)
  "hero.news.tag": 6,
  "hero.news.text": 34,
  // hero: H1 two lines of a 72px two-tone serif (one line each at 1440); lead "{pre} {name}, {name}, {name} {or} {name}
  // {post}" (the names joined with 、 in zh and ja)
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
  // 1440, at most two at 390). NEW CLAIM: the rows are the Agent preset's parts, no mono token among them. The Harness
  // row's names are hero.harnesses.
  "spec.h2a": 28,
  "spec.h2b": 30,
  "spec.labels.*": 12,
  "spec.values.*": 40,
  // the full lime screen; three unequal cards in one row, 1fr 2fr 1fr, rows on phones (staging v5/polish/lime/NOTES.md:
  // a 24-character label stays on one line and a 48-character line takes at most two from 1199 to 1440, in the tablet
  // rows and in the phone rows from 375 to 720; at 1024 a narrow card's label line holds about 23 characters)
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

// The Session object's states (src/home/kit): visible words per state, at most 14 (object words, counted as
// tools/budget.ts does: the object's text split at spaces).
// NEW CLAIM (staging narrative/CHANGES.md §2): the first plate's three states. laptop = the first screen: the laptop
// card and the Session card, row for row (place, harness, file, who drives it), the Session card's two copies behind
// it carry no words; cloud = the laptop card still on screen at half strength, the Session card's rows become the
// Agent preset's parts; app = the sources call your app, your app calls the Sessions (three cards, one with the file).
const KIT_STATE_WORDS = 14;
const kitStates = (kit) => ({
  laptop: [
    kit.laptop.place,
    kit.harness,
    kit.file,
    kit.laptop.driver,
    kit.session.place,
    kit.harness,
    kit.file,
    kit.session.driver,
  ],
  cloud: [
    kit.laptop.place,
    kit.harness,
    kit.file,
    kit.laptop.driver,
    kit.session.place,
    kit.harness,
    ...kit.cloud.rows,
    kit.cloud.pinned,
  ],
  app: [
    ...kit.app.sources,
    kit.app.app,
    kit.app.call,
    kit.session.place,
    kit.session.place,
    kit.session.place,
    kit.file,
  ],
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
      assert.ok(!value.includes(BREAK), `${where}: en carries no break mark`);
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

// The full lime screen tells a Session between turns in three cards, in this order (sections/accent.ts PARTS: sandbox,
// files, resume). Each label is a change of state, "<thing>: <state>", not a part's name: the five parts themselves
// are the spec table's rows (staging v5/review/graft-yc.md P2-1). zh and ja follow en's shape (below).
test("the lime screen has three cards, each label a change of state (en)", () => {
  const cards = COPY.accent.en.cards;
  assert.equal(cards.length, 3, "accent.cards: the sandbox, the working directory, the Session ID");
  for (const { label } of cards) assert.match(label, /^\S[^:]*: \S/, `"${label}" reads "<thing>: <state>"`);
});

// The spec table (sections/spec.ts): one row per part, in this order, and the Harness row's four names are the hero's
// (the switch rolls them in HARNESS_IDS order). The title reads as a pick of one of four, never as a Session changing
// harness: harness and model are frozen at creation and a Session never changes harness (MAIN docs/SPEC.md §3 L31;
// staging v5/graft/switch/NOTES.md §5.4: v4c's earlier "Swap the harness, keep the rest." is out).
// NEW CLAIM: the five rows are the Agent preset's parts (MAIN README.md L37: harness, model, instructions, Skills, MCP
// servers, Environment; Skills and MCP share a row). The title brings your own agent and freezes all five per Session
// (SPEC L31); it never says the setup is identical to the laptop's or arrives by itself (staging narrative/TRUTH.md C9,
// C10, §3).
test("the spec table has the preset's five parts, picks one harness of four, and claims no copy of the laptop (en, zh, ja)", () => {
  for (const locale of LOCALES) {
    const spec = COPY.spec[locale];
    assert.deepEqual(
      Object.keys(spec.labels),
      ["harness", "model", "instructions", "skills", "environment"],
      `${locale} rows`,
    );
    assert.deepEqual(Object.keys(spec.values), ["model", "instructions", "skills", "environment"], `${locale} values`);
  }
  assert.equal(COPY.hero.en.harnesses.length, 4, "four harness names to roll");
  const title = `${COPY.spec.en.h2a} ${COPY.spec.en.h2b}`;
  assert.doesNotMatch(title, /\b(swap|switch|change)/i, "a pick, not a swap");
  assert.doesNotMatch(title, /\b(identical|exactly|sync|import|upload|migrate)/i, "set up the same agent, not a copy");
  assert.match(COPY.spec.en.values.skills, /remote/i, "MCP servers are remote (docs/prd/mcp-interaction.md L17)");
});

test("each state of the Session object shows at most 14 words (en)", () => {
  for (const [state, strings] of Object.entries(kitStates(COPY.stage.en.kit))) {
    const count = strings.reduce((sum, value) => sum + words(value), 0);
    assert.ok(count <= KIT_STATE_WORDS, `stage.kit ${state}: ${count} words > ${KIT_STATE_WORDS}`);
  }
  // NEW CLAIM: the two cards differ only in where it runs and who drives it (no arrow, no "import"; staging
  // narrative/judge-truth:.md L32); the rows they share are the same strings.
  const { laptop, session } = COPY.stage.en.kit;
  assert.notEqual(laptop.place, session.place, "the place differs");
  assert.notEqual(laptop.driver, session.driver, "who drives it differs");
  assert.match(session.driver, /backend/i, "the Session card is driven by your backend (truth rule 3)");
});

// tools/budget.ts: at most 25 marketing words on the first screen. The hero's own slots must leave that room; the
// harness names are product words (data-product-ui, ui.ts harnessName), so they count as object words (first screen:
// at most 16).
test("the hero's marketing words fit the first-screen budget (en)", () => {
  const h = COPY.hero.en;
  const marketing = [h.h1a, h.h1b, h.lead.pre, h.lead.or, h.lead.post, h.primary, h.secondary].reduce(
    (sum, value) => sum + words(value),
    0,
  );
  assert.ok(marketing <= 25, `hero: ${marketing} marketing words > 25`);
  assert.equal(h.harnesses.length, 4, "four harness names");
});

// The first screen also shows the stage plate's first state (NEW CLAIM: laptop, the two cards): its words and the
// four harness names in the lead are the first screen's object words, at most 16 in tools/budget.ts (counted the same
// way as when the names were keycaps: names 7 + the two cards 9 = 16, no room left). The step row shows no word on
// the first screen (it waits for the run, sections/stage.css).
test("the harness names and the two cards fit the first screen's object words (en)", () => {
  const names = COPY.hero.en.harnesses.reduce((sum, value) => sum + words(value), 0);
  const plate = kitStates(COPY.stage.en.kit).laptop.reduce((sum, value) => sum + words(value), 0);
  assert.ok(names + plate <= 16, `first-screen object words: harness names ${names} + the two cards ${plate} > 16`);
});

// The closing's Copy (#130, committee 2026-10-21): the copy engine (src/home/copy-prompt.ts) finds the sentence and
// the live region through button.closest("[data-product-ui]"), so the button, the [data-prompt] sentence and the
// [data-copy-status] region must share that nearest wrapper (without it Copy writes an empty string and still says
// "Copied"; with the region outside it, readers hear nothing). Checked in the static home of every locale.
const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'" }; // ui.ts esc()

test("the closing's Copy, its sentence and its status region share one [data-product-ui] (en, zh, ja)", () => {
  for (const locale of LOCALES) {
    const html = renderLandingLocale(
      readFileSync(new URL("../apps/landing/index.html", import.meta.url), "utf8"),
      locale,
    );
    const closing = /<section id="start"[\s\S]*?<\/section>/.exec(html)?.[0] ?? "";
    assert.ok(closing, `${locale}: the closing section`);
    assert.equal(closing.match(/\bdata-copy\b(?!-)/g)?.length, 1, `${locale}: one Copy button`);
    const wrapper = nearestProductUi(closing, closing.search(/\bdata-copy\b(?!-)/));
    assert.ok(wrapper, `${locale}: Copy has a [data-product-ui] ancestor`);
    for (const marker of ["data-prompt", "data-copy-status", "data-copy-label"]) {
      assert.match(wrapper, new RegExp(`\\b${marker}\\b`), `${locale}: [${marker}] is inside Copy's [data-product-ui]`);
    }
    const prompt = /<p [^>]*data-prompt[^>]*>([^<]+)<\/p>/.exec(wrapper)?.[1] ?? "";
    const text = prompt.replace(/&(amp|lt|gt|quot|#39);/g, (_, entity) => ENTITIES[entity]);
    assert.equal(text, COPY.closing[locale].prompt, `${locale}: the sentence Copy copies is closing.prompt`);
  }
});

/** The innermost <div …data-product-ui…> element of html that contains index, as html (div elements only). */
function nearestProductUi(html, index) {
  const stack = [];
  let inner = null;
  for (const tag of html.matchAll(/<(\/?)div\b[^>]*>/g)) {
    if (tag[1]) {
      const open = stack.pop();
      if (open && open.ui && open.at < index && tag.index > index && (!inner || open.at > inner.at)) {
        inner = { at: open.at, end: tag.index + tag[0].length };
      }
    } else {
      stack.push({ at: tag.index, ui: /\bdata-product-ui\b/.test(tag[0]) });
    }
  }
  return inner ? html.slice(inner.at, inner.end) : null;
}

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
// Line breaks themselves are checked in the browser (staging v5/content/NOTES.md, the slot probe at 360-1440; round
// 3b: v5/round3/b-copy, Chrome and WebKit). A break mark has no width (it is a <wbr> on the page).
const cjkWidth = (value) => [...plain(value)].reduce((sum, char) => sum + (char.charCodeAt(0) < 0x2e80 ? 0.5 : 1), 0);
const CJK_GROUPS = [
  { name: "hero.lead", paths: ["hero.lead.pre", "hero.lead.or", "hero.lead.post"] },
  { name: "closing.h2a + h2b", paths: ["closing.h2a", "closing.h2b"], width: 15 },
];
// NEW CLAIM: the kit's labels, each kept to the width its en string takes in its row (card header, row label, chip),
// rounded up; harness, file and app.call are machine tokens checked for equality below, not for width.
const KIT_CJK = {
  "kit.laptop.place": 5, // en "Laptop": the narrow card's header
  "kit.laptop.driver": 4, // en "You"
  "kit.session.place": 5, // en "Session"
  "kit.session.driver": 7, // en "Your backend"
  "kit.cloud.rows.*": 7, // en "Environment" is the longest row label
  "kit.cloud.pinned": 4, // en "pinned": a chip after the Environment row
  "kit.app.sources.*": 5, // en "Customer": a source chip
  "kit.app.app": 7, // en "Your app": the app card's header
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
          if (kit && cjkWidth(value) > kit[1]) overflow.push(`${locale} ${where}: ${cjkWidth(value)} > ${kit[1]} wide: ${value}`);
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
    // NEW CLAIM: the file both cards show and the call your app makes are machine tokens
    assert.equal(COPY.stage[locale].kit.file, COPY.stage.en.kit.file, `${locale} the file on the cards`);
    assert.equal(COPY.stage[locale].kit.app.call, COPY.stage.en.kit.app.call, `${locale} the call your app makes`);
    assert.equal(COPY.stage[locale].kit.session.place, COPY.stage.en.kit.session.place, `${locale} Session stays Session`);
    assert.deepEqual(
      COPY.footer[locale].columns.harnesses.names,
      COPY.footer.en.columns.harnesses.names,
      `${locale} footer harness names`,
    );
  }
});

// #141 (staging committee/PLAN.md 2-1, as challenge/141.md amended it): zh and ja headings and labels are keep-all,
// and WebKit's keep-all breaks a CJK line only at a space, so the copy marks where such a line may break (markup.ts
// BREAK) and the page writes each mark as <wbr>, a break opportunity a reader never sees or copies. A mark sits only
// in zh and ja, never inside a word (a judgement for the writer and the native review; the browser probes are in
// staging v5/round3/b-copy), and never in a string that is also JSON-LD, meta or llms.txt text (the FAQ, whose items
// the FAQPage carries verbatim) or an attribute. On the page every mark is a <wbr> and no "|" is left; nothing else on
// the page writes a <wbr>, so the counts match.
test("break marks are zh and ja only, out of the FAQ, and each is a <wbr> on the page (#141)", () => {
  for (const locale of LOCALES) {
    const marks = SECTIONS.flatMap((section) => leaves(COPY[section][locale]).map(([path, value]) => [section, path, value]))
      .filter(([, , value]) => value.includes(BREAK));
    if (locale === "en") assert.deepEqual(marks.map(([s, p]) => [s, ...p].join(".")), [], "en carries no break mark");
    for (const [section, path, value] of marks) {
      const where = [section, ...path].join(".");
      assert.notEqual(section, "faq", `${locale} ${where}: the FAQ is JSON-LD text too`);
      assert.doesNotMatch(value, /^\||\|$|\|\||\s\||\|\s/, `${locale} ${where}: a mark sits between two characters`);
    }
    const html = renderLandingLocale(readFileSync(new URL("../apps/landing/index.html", import.meta.url), "utf8"), locale);
    const root = /<div id="root">([\s\S]*)<\/div>\s*<script/.exec(html)?.[1] ?? "";
    assert.ok(root, `${locale}: the static home`);
    assert.ok(!root.includes(BREAK), `${locale}: no "${BREAK}" is left on the page`);
    const count = marks.reduce((sum, [, , value]) => sum + value.split(BREAK).length - 1, 0);
    assert.equal(root.match(/<wbr>/g)?.length ?? 0, count, `${locale}: one <wbr> per mark`);
    for (const [, , value] of marks) {
      assert.ok(root.includes(value.replaceAll(BREAK, "<wbr>").replaceAll("&", "&amp;")), `${locale}: ${plain(value)} renders its marks`);
    }
  }
});
