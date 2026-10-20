import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { renderLandingLocale } from "../scripts/landing-locales.mjs";

// The way back to the products and the language (owner 2026-10-20 17:15: 「多语言切换不明显，原先product 入口没了」, the
// NEW announcement over the headline 「这个不能没」, 「product 入口没了 意味着原先的computer 用户就不知道如何访问了」; 21:57:
// 「mosoo computer 一律小写」; staging v5/polish/nav/DESIGN.md). Checked in the static home as served at /en, /zh and
// /ja, which is also what a reader without JavaScript gets: the bar's Products panel and language list are native
// popovers (popover + popovertarget), so every link is real markup in the page, and the browser opens and closes them
// without a script.

const LOCALES = ["en", "zh", "ja"];
const HTML_LANG = { en: "en", zh: "zh-CN", ja: "ja" };
const COMPUTER = "https://computer.mosoo.ai";
const CLOUD = "https://cloud.mosoo.ai";
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const home = (locale) => renderLandingLocale(read("apps/landing/index.html"), locale);
const NAV = JSON.parse(read("apps/landing/src/home/copy/nav.json"));
const HERO = JSON.parse(read("apps/landing/src/home/copy/hero.json"));
const FOOTER = JSON.parse(read("apps/landing/src/home/copy/footer.json"));

const decode = (value) =>
  value
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&amp;", "&");
const textOf = (html) =>
  decode(html.replace(/<[^>]+>/g, ""))
    .replace(/\s+/g, " ")
    .trim();
/** The first element <tag ...attrs...>…</tag> whose start tag matches, with its inner HTML (no nesting of the same tag). */
const element = (html, tag, attrs) =>
  new RegExp(`<${tag}\\b[^>]*${attrs}[^>]*>([\\s\\S]*?)</${tag}>`).exec(html)?.[0] ?? "";
const header = (html) => element(html, "header", 'class="v5-nav"');
const panel = (html, id) => {
  // a popover panel: <div ... id="…" popover> … </div> holding one <ul>
  const start = html.indexOf(`id="${id}"`);
  assert.ok(start > 0, `#${id} is in the page`);
  const open = html.lastIndexOf("<div", start);
  const end = html.indexOf("</ul>", start);
  return html.slice(open, html.indexOf("</div>", end) + 6);
};
const anchors = (html) =>
  [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)].map((m) => ({
    attrs: m[1],
    href: decode(/\bhref="([^"]+)"/.exec(m[1])?.[1] ?? ""),
    text: textOf(m[2]),
  }));

test("the hero announces mosoo computer over the H1, as chrome, in every locale", () => {
  for (const locale of LOCALES) {
    const html = home(locale);
    const hero = element(html, "section", 'data-section="hero"');
    const pill = /<a class="v5-hero-news"[^>]*>[\s\S]*?<\/a>/.exec(hero)?.[0] ?? "";
    assert.ok(pill, `${locale}: the announcement is in the hero`);
    assert.ok(hero.indexOf(pill) < hero.indexOf("<h1"), `${locale}: it comes before the H1`);
    assert.match(pill, new RegExp(`href="${COMPUTER}"`), `${locale}: it links mosoo computer`);
    assert.doesNotMatch(pill, /target=/, `${locale}: same tab, like production's pill`);
    assert.match(pill, /data-budget="chrome"/, `${locale}: tools/budget.ts leaves it out of the marketing words`);
    assert.match(pill, /data-rise-load="fade"/, `${locale}: it enters with the hero`);
    assert.equal(
      textOf(pill),
      `${HERO[locale].news.tag} ${HERO[locale].news.text}`.replace(/\s+/g, " "),
      `${locale}: chip and line`,
    );
    assert.match(pill, /<svg [^>]*aria-hidden="true"/, `${locale}: the arrow is drawn and hidden from readers`);
  }
  // production's strings (origin/main apps/landing/src/shared/i18n.ts L19 / L47; landing/hero.tsx L63-66) with the
  // product's name in lowercase (owner 2026-10-20 21:57)
  assert.deepEqual(
    LOCALES.map((locale) => HERO[locale].news.text),
    ["mosoo computer is live", "mosoo computer 已上线", "mosoo computer をリリースしました"],
  );
  for (const locale of LOCALES)
    assert.equal(HERO[locale].news.tag, "New", `${locale}: the chip says New, as production's`);
});

test("the bar's Products panel links both products, mosoo computer marked New, in every locale", () => {
  for (const locale of LOCALES) {
    const bar = header(home(locale));
    const button = /<button type="button" class="v5-nav-tg" popovertarget="v5-nav-products">([\s\S]*?)<\/button>/.exec(
      bar,
    );
    assert.ok(button, `${locale}: a Products button opens the panel`);
    assert.equal(textOf(button[1]), NAV[locale].products.label, `${locale}: labelled ${NAV[locale].products.label}`);
    const products = panel(bar, "v5-nav-products");
    assert.match(products, /<div class="v5-nav-pop v5-nav-pop--products" id="v5-nav-products" popover>/);
    const rows = anchors(products);
    assert.deepEqual(
      rows.map((row) => row.href),
      [CLOUD, COMPUTER],
      `${locale}: mosoo (the console), then mosoo computer`,
    );
    for (const row of rows) assert.doesNotMatch(row.attrs, /target=/, `${locale}: same tab`);
    const [mosoo, computer] = rows;
    const p = NAV[locale].products.items;
    assert.equal(mosoo.text, `${p.mosoo.name} ${p.mosoo.line} cloud.mosoo.ai`.replace(/\s+/g, " "));
    assert.equal(
      computer.text,
      `${p.computer.name} ${NAV[locale].products.new} ${p.computer.line} computer.mosoo.ai`.replace(/\s+/g, " "),
    );
    assert.equal(products.match(/class="v5-nav-new/g)?.length, 1, `${locale}: one New chip, on mosoo computer`);
    assert.match(products, /aria-labelledby="v5-nav-products-h"/, `${locale}: the list is named by its heading`);
  }
  // both names lowercase in every locale, as everywhere on this site (owner 2026-10-20 21:57: 「mosoo computer 一律小写」)
  for (const locale of LOCALES) {
    assert.equal(NAV[locale].products.items.mosoo.name, "mosoo", `${locale}: the runtime's name`);
    assert.equal(NAV[locale].products.items.computer.name, "mosoo computer", `${locale}: the computer's name`);
    assert.equal(NAV[locale].products.new, NAV.en.products.new, `${locale}: the chip`);
  }
  // production's line for the computer (origin/main apps/landing/src/shared/i18n.ts L8 / L36)
  assert.deepEqual(
    LOCALES.map((locale) => NAV[locale].products.items.computer.line),
    [
      "A persistent cloud computer for agents.",
      "为 Agent 准备的持久云端计算机。",
      "Agent のための永続的なクラウドコンピューター。",
    ],
  );
});

test("the bar's language switch lists the three home pages with hreflang, the current one marked", () => {
  for (const locale of LOCALES) {
    const bar = header(home(locale));
    const button =
      /<button type="button" class="v5-nav-tg" popovertarget="v5-nav-lang" aria-label="([^"]+)">([\s\S]*?)<\/button>/.exec(
        bar,
      );
    assert.ok(button, `${locale}: a language button opens the list`);
    assert.equal(textOf(button[2]), NAV[locale].langShort, `${locale}: it shows the current language's short name`);
    assert.ok(
      decode(button[1]).includes(NAV[locale].langShort),
      `${locale}: its name holds what it shows (WCAG 2.5.3)`,
    );
    assert.match(button[2], /class="v5-nav-globe"/, `${locale}: with the globe`);
    const list = panel(bar, "v5-nav-lang");
    assert.match(list, /<div class="v5-nav-pop v5-nav-pop--lang" id="v5-nav-lang" popover>/);
    const links = anchors(list);
    assert.deepEqual(
      links.map((link) => [link.href, /hreflang="([^"]+)"/.exec(link.attrs)?.[1]]),
      [
        ["/en", "en"],
        ["/zh", "zh-CN"],
        ["/ja", "ja"],
      ],
      `${locale}: real links to /en, /zh, /ja`,
    );
    assert.deepEqual(
      links.map((link) => link.text),
      ["English", "简体中文", "日本語"],
      `${locale}: each language in its own words`,
    );
    const current = links.filter((link) => /aria-current="true"/.test(link.attrs));
    assert.deepEqual(
      current.map((link) => link.href),
      [`/${locale}`],
      `${locale}: the current one is marked`,
    );
    for (const link of links) {
      assert.match(link.attrs, new RegExp(`lang="${/hreflang="([^"]+)"/.exec(link.attrs)?.[1]}"`), "lang = hreflang");
    }
  }
  assert.deepEqual(
    LOCALES.map((locale) => NAV[locale].langShort),
    ["EN", "中文", "日本語"],
  );
});

test("the bar's row: Products first, then Docs, Use cases, GitHub, the language, Sign in; one menu button for small screens", () => {
  for (const locale of LOCALES) {
    const bar = header(home(locale));
    const nav =
      /<nav class="v5-nav-links" id="v5-nav-menu" aria-label="[^"]+" popover>([\s\S]*?)<\/nav>/.exec(bar)?.[1] ?? "";
    assert.ok(nav, `${locale}: the primary nav is the sheet's popover`);
    // top-level order of the row
    const order = [
      ...nav.matchAll(/<(?:button[^>]*popovertarget="([^"]+)"|a class="v5-nav-a[^"]*" href="([^"]+)")/g),
    ].map((m) => m[1] ?? m[2]);
    const L = { en: "https://mosoo.ai/docs/", zh: "https://mosoo.ai/docs/zh-Hans/", ja: "https://mosoo.ai/docs/ja/" };
    assert.deepEqual(order, [
      "v5-nav-products",
      L[locale],
      `/${locale}/use-cases`,
      "https://github.com/langgenius/mosoo",
      "v5-nav-lang",
      "https://cloud.mosoo.ai/login",
    ]);
    // GitHub shows its mark; its name stays in the link
    assert.match(
      nav,
      /<a class="v5-nav-a v5-nav-gh" href="https:\/\/github.com\/langgenius\/mosoo" translate="no"><svg [^>]*aria-hidden="true"[\s\S]*?<span class="v5-nav-gh-t">GitHub<\/span><\/a>/,
    );
    assert.match(
      bar,
      new RegExp(
        `<button type="button" class="v5-nav-menu" popovertarget="v5-nav-menu" aria-label="${NAV[locale].menu}">`,
      ),
      `${locale}: the menu button opens the same nav`,
    );
    // the CTA slot is still the engine's, after the nav
    assert.ok(bar.indexOf("data-nav-cta") > bar.indexOf("</nav>"), `${locale}: the CTA slot follows the nav`);
  }
});

test("every popover button points at a popover in the page, and no link is left behind a script", () => {
  for (const locale of LOCALES) {
    const html = home(locale);
    const targets = [...html.matchAll(/popovertarget="([^"]+)"/g)].map((m) => m[1]);
    assert.deepEqual(targets.sort(), ["v5-nav-lang", "v5-nav-menu", "v5-nav-products"]);
    for (const id of targets) {
      assert.match(html, new RegExp(`id="${id}"[^>]*\\bpopover\\b`), `${locale}: #${id} is a popover`);
      assert.equal(html.match(new RegExp(`id="${id}"`, "g"))?.length, 1, `${locale}: #${id} is unique`);
    }
    // the products and the languages are each linked from the bar exactly once (one copy of each link: the phone sheet
    // shows the same panels inline)
    const bar = header(html);
    assert.equal(bar.match(new RegExp(`href="${COMPUTER}"`, "g"))?.length, 1, `${locale}: Computer once in the bar`);
    for (const l of ["/en", "/zh", "/ja"]) {
      assert.equal(bar.match(new RegExp(`href="${l}" hreflang`, "g"))?.length, 1, `${locale}: ${l} once in the bar`);
    }
    assert.match(html, new RegExp(`<html lang="${HTML_LANG[locale]}"`));
  }
});

test("the footer's Product column links mosoo computer, and its languages are one visible control", () => {
  for (const locale of LOCALES) {
    const html = home(locale);
    const footer = element(html, "footer", 'class="v5-ft"');
    const product = [
      ...footer.matchAll(
        /<div class="v5-ft-col" data-footer-link><h2 class="v5-ft-h">([^<]+)<\/h2>([\s\S]*?)<\/ul><\/div>/g,
      ),
    ].find((m) => decode(m[1]) === FOOTER[locale].columns.product.title);
    assert.ok(product, `${locale}: the Product column`);
    const links = anchors(product[2]);
    assert.deepEqual(
      links.slice(0, 2).map((link) => [link.href, link.text]),
      [
        [CLOUD, FOOTER[locale].columns.product.links.console],
        [COMPUTER, "mosoo computer"],
      ],
      `${locale}: the console, then mosoo computer`,
    );
    // the language control: a globe and the three languages in one framed list (footer.css)
    assert.match(
      footer,
      /<div class="v5-ft-lang"><svg class="v5-ft-globe"[^>]*aria-hidden="true"[\s\S]*?<\/svg><ul class="v5-ft-langs" aria-label="[^"]+">/,
    );
    // Harnesses are names, not links (motion-a11y-perf P2-8)
    const harnesses = /<div class="v5-ft-col v5-ft-harnesses"[\s\S]*?<\/ul><\/div>/.exec(footer)?.[0] ?? "";
    assert.equal(harnesses.match(/<li class="v5-ft-rt">/g)?.length, 4);
    assert.doesNotMatch(harnesses, /<a\b/, `${locale}: no links in the Harnesses column`);
  }
});

test("the computer's users find it from every place production had it: bar, first screen, footer", () => {
  for (const locale of LOCALES) {
    const html = home(locale);
    const regions = {
      "the bar's Products panel": header(html),
      "the first screen's announcement": element(html, "section", 'data-section="hero"'),
      "the footer's Product column": element(html, "footer", 'class="v5-ft"'),
    };
    for (const [where, region] of Object.entries(regions)) {
      const links = anchors(region).filter((link) => link.href === COMPUTER);
      assert.equal(links.length, 1, `${locale}: ${where} links it once`);
      // its name in lowercase wherever it shows (owner 2026-10-20 21:57: 「mosoo computer 一律小写」)
      assert.match(links[0].text, /\bmosoo computer\b/, `${locale}: ${where} names it "mosoo computer"`);
      assert.doesNotMatch(links[0].text, /Mosoo|Computer/, `${locale}: ${where} has no capital in the name`);
    }
  }
});
