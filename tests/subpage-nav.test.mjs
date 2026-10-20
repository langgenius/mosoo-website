import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

// The home bar's Products entry and language switch on the subpages (status, use cases; apps/landing/src/shared/ui/
// site-nav.tsx and site-footer.tsx) and the blog (apps/blog/src/components/Header.astro): owner 2026-10-20 17:15
// 「多语言切换不明显，原先product 入口没了」「product 入口没了 意味着原先的computer 用户就不知道如何访问了」; 21:57
// 「mosoo computer 一律小写」; staging v5/polish/nav/DESIGN.md §6-§7. The subpages render in the browser, so these
// checks read the sources: the same panels, ids and links as the home's static bar (tests/home-nav-products.test.mjs),
// the same words as the home's copy (src/home/copy/nav.json), and both products in lowercase.

const LOCALES = ["en", "zh", "ja"];
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const NAV = JSON.parse(read("apps/landing/src/home/copy/nav.json"));

/** The object literal after `marker` in a TypeScript source (strings only), evaluated as plain JavaScript. */
const objectAfter = (source, marker) => {
  const start = source.indexOf("{", source.indexOf(marker));
  assert.ok(start > 0, `${marker} is in the source`);
  let depth = 0;
  let end = start;
  for (; end < source.length; end++) {
    if (source[end] === "{") depth++;
    if (source[end] === "}" && --depth === 0) break;
  }
  return new Function(`return (${source.slice(start, end + 1)});`)();
};

const SITE_NAV = read("apps/landing/src/shared/ui/site-nav.tsx");
const SITE_FOOTER = read("apps/landing/src/shared/ui/site-footer.tsx");
const SITE_CSS = read("apps/landing/src/shared/styles/site-nav.css");
const SHARED_I18N = read("apps/landing/src/shared/i18n.ts");
const PRODUCTS = read("apps/landing/src/routes/login/products.ts");
const HEADER = read("apps/blog/src/components/Header.astro");
const BLOG_I18N = read("apps/blog/src/lib/i18n.ts");

const MESSAGES = {
  zh: objectAfter(SHARED_I18N, "const ZH_MESSAGES ="),
  ja: objectAfter(SHARED_I18N, "const JA_MESSAGES ="),
};
const t = (locale, message) => (locale === "en" ? message : MESSAGES[locale][message]);

test("the subpages' bar is the home's row: Products and the language as popovers, one <nav> that is the phone sheet", () => {
  // The <nav> is the row on wide screens and the sheet the menu button opens up to 860px (site-nav.css).
  assert.match(SITE_NAV, /<nav aria-label=\{t\("Main"\)\} className="d-nav-row" id="d-nav-menu" popover="auto">/);
  assert.match(
    SITE_NAV,
    /<button type="button" className="d-nav-menu" popoverTarget="d-nav-menu" aria-label=\{t\("Menu"\)\}>/,
  );
  // Products: a button and its panel, the rows from routes/login/products.ts, a list named by its heading.
  assert.match(
    SITE_NAV,
    /<button type="button" className="d-nav-tg" popoverTarget="d-nav-products">\s*\{t\("Products"\)\}/,
  );
  assert.match(SITE_NAV, /className="d-nav-pop d-nav-pop--products" id="d-nav-products" popover="auto"/);
  assert.match(SITE_NAV, /<ul className="d-nav-prods" aria-labelledby="d-nav-products-h">\s*\{PRODUCTS\.map/);
  assert.match(SITE_NAV, /<a className="d-nav-prod" href=\{product\.href\}>/);
  assert.match(SITE_NAV, /<span className="d-nav-new">\{NEW\}<\/span>/, "mosoo computer carries the New chip");
  // The language: a button named with what it shows (WCAG 2.5.3) and this page in each language, the current marked;
  // a pick is remembered for the worker's "/" redirect.
  assert.match(
    SITE_NAV,
    /popoverTarget="d-nav-lang"\s*aria-label=\{t\("Language \(\{lang\}\)"\)\.replace\("\{lang\}", langShort\)\}/,
  );
  assert.match(SITE_NAV, /const LANG_SHORT = \{ en: "EN", zh: "中文", ja: "日本語" \} as const;/);
  assert.deepEqual(
    LOCALES.map((locale) => NAV[locale].langShort),
    ["EN", "中文", "日本語"],
    "the home's short names",
  );
  assert.match(SITE_NAV, /<ul className="d-nav-langs" aria-labelledby="d-nav-lang-h">\s*\{LOCALES\.map/);
  assert.match(
    SITE_NAV,
    /href=\{localeHref\(code\)\}\s*hrefLang=\{htmlLanguage\[code\]\}\s*lang=\{htmlLanguage\[code\]\}\s*aria-current=\{code === locale \? "true" : undefined\}\s*onClick=\{\(\) => rememberLocale\(code\)\}/,
  );
  // Docs, Use cases (current on the use-case pages), GitHub and Sign in, all in the one <nav>; nothing opens a tab.
  for (const href of ["docsUrl()", "pathToUseCases()", "MOSOO_GITHUB_URL", "MOSOO_LOGIN_URL"]) {
    assert.match(SITE_NAV, new RegExp(`href=\\{${href.replace(/[()]/g, "\\$&")}\\}`), `the bar links ${href}`);
  }
  assert.match(SITE_NAV, /aria-current=\{active === "use-cases" \? "page" : undefined\}/);
  assert.doesNotMatch(SITE_NAV, /\btarget=/, "same tab");
  // As the home's engine (src/effects/v5/nav.ts): focus landing outside an open panel closes it (WCAG 2.4.11), and so
  // does its button going out of sight (a tablet turned with the sheet open).
  assert.match(SITE_NAV, /<header className="d-nav" ref=\{wirePopovers\}>/);
  assert.match(SITE_NAV, /document\.addEventListener\("focusin", onFocusIn\);/);
  assert.match(SITE_NAV, /button\.getClientRects\(\)\.length === 0/);
  assert.match(SITE_NAV, /import "@\/shared\/styles\/site-nav\.css";/);
  // The sheet keeps its place and look on the element; only display follows the open state, so it fades out where it
  // was instead of dropping back into the bar (DESIGN.md "22:00" no. 2).
  assert.match(SITE_CSS, /\.d-nav-row:popover-open \{\s*display: flex;\s*\}/);
  assert.doesNotMatch(SITE_CSS, /\.d-nav-row:popover-open \.d-nav-pop|\.d-nav-row:popover-open \{[^}]*position/);
});

test("the subpages' words are the home bar's, in every locale", () => {
  for (const locale of LOCALES) {
    const nav = NAV[locale];
    assert.equal(t(locale, "Products"), nav.products.label, `${locale}: Products`);
    assert.equal(t(locale, "Language"), nav.language, `${locale}: Language`);
    assert.equal(t(locale, "Language ({lang})"), nav.languageButton, `${locale}: the switch's name`);
    assert.equal(t(locale, "Menu"), nav.menu, `${locale}: the menu button's name`);
    assert.equal(t(locale, "Open-source Agent runtime for application backends."), nav.products.items.mosoo.line);
    assert.equal(t(locale, "A persistent cloud computer for agents."), nav.products.items.computer.line);
  }
});

test("both products are lowercase in the subpages' bar and footer (owner 2026-10-20 21:57)", () => {
  // The bar's rows come from routes/login/products.ts; the footer names the computer itself.
  assert.match(PRODUCTS, /name: "mosoo",/);
  assert.match(PRODUCTS, /name: "mosoo computer",/);
  assert.match(SITE_FOOTER, /\{ label: "mosoo computer", href: MOSOO_COMPUTER_URL, noTranslate: true \}/);
  for (const [path, source] of [
    ["site-nav.tsx", SITE_NAV],
    ["site-footer.tsx", SITE_FOOTER],
    ["shared/i18n.ts", SHARED_I18N],
    ["products.ts", PRODUCTS],
    ["Header.astro", HEADER],
    ["blog i18n.ts", BLOG_I18N],
  ]) {
    assert.doesNotMatch(source, /Mosoo Computer|\bMosoo\b/, `${path} writes mosoo and mosoo computer in lowercase`);
  }
});

test("the subpages' footer language switcher is the home footer's: a globe and three framed links", () => {
  assert.match(
    SITE_FOOTER,
    /<div className="d-ft-lang">\s*<Globe className="d-ft-globe" \/>\s*<ul aria-label=\{t\("Change language"\)\} className="d-ft-langs">/,
  );
  assert.match(
    SITE_FOOTER,
    /href=\{localeHref\(code\)\}\s*hrefLang=\{htmlLanguage\[code\]\}\s*lang=\{htmlLanguage\[code\]\}\s*aria-current=\{code === locale \? "true" : undefined\}\s*onClick=\{\(\) => rememberLocale\(code\)\}/,
  );
  assert.match(SITE_FOOTER, /\{LOCALE_LABELS\[code\]\.native\}/, "English, 简体中文, 日本語, each in its own words");
});

test("the blog header carries the same Products panel and language switch, its words the home's", () => {
  // Products: a button and its panel with both products, same tab, the computer marked New.
  assert.match(HEADER, /<nav class="bn-row" id="bn-menu" aria-label=\{nav\.label\} popover>/);
  assert.match(HEADER, /<button type="button" class="bn-menu" popovertarget="bn-menu" aria-label=\{nav\.menu\}>/);
  assert.match(HEADER, /<button type="button" class="bn-tg" popovertarget="bn-products">\s*\{nav\.products\}/);
  assert.match(HEADER, /<div class="bn-pop bn-pop--products" id="bn-products" popover>/);
  assert.match(HEADER, /<ul class="bn-prods" aria-labelledby="bn-products-h">/);
  assert.match(HEADER, /\{ id: "mosoo", href: "https:\/\/cloud\.mosoo\.ai", \.\.\.nav\.mosoo, fresh: false \}/);
  assert.match(HEADER, /\{ id: "computer", href: "https:\/\/computer\.mosoo\.ai", \.\.\.nav\.computer, fresh: true \}/);
  assert.doesNotMatch(HEADER, /\btarget=/, "same tab");
  // The language: shown only when the page has another language; this page in each, the current one marked; named
  // with what it shows; a pick is remembered for the worker's "/" redirect.
  assert.match(HEADER, /const showLanguages = localeOptions\.length > 1;/);
  assert.match(
    HEADER,
    /popovertarget="bn-lang"\s*aria-label=\{nav\.languageButton\.replace\("\{lang\}", currentOption\?\.label \?\? ""\)\}/,
  );
  assert.match(HEADER, /<ul class="bn-langs" aria-labelledby="bn-lang-h">/);
  assert.match(
    HEADER,
    /href=\{option\.href\}\s*hreflang=\{langTags\[option\.locale\]\}\s*lang=\{langTags\[option\.locale\]\}\s*data-locale=\{option\.locale\}\s*aria-current=\{option\.active \? "true" : undefined\}/,
  );
  assert.match(
    HEADER,
    /document\.cookie = `mosoo_locale=\$\{code\}; Path=\/; Max-Age=31536000; SameSite=Lax; Secure`;/,
  );
  assert.match(HEADER, /document\.addEventListener\("focusin",/);
  assert.match(HEADER, /button\.getClientRects\(\)\.length === 0/);
  assert.match(HEADER, /\.bn-row:popover-open \{\s*display: flex;\s*\}/);
  assert.doesNotMatch(HEADER, /\.bn-row:popover-open \.bn-pop|\.bn-row:popover-open \{[^}]*position/);
  // The CTA is the last item of the <nav>: in the row on wide screens, closing the sheet on phones.
  assert.match(HEADER, /<a href="https:\/\/cloud\.mosoo\.ai" class="bn-cta">\{copy\.tryMosoo\}<\/a>\s*<\/nav>/);

  const copy = objectAfter(BLOG_I18N, "export const navCopyByLocale =");
  const names = objectAfter(BLOG_I18N, "export const localeNames");
  for (const locale of LOCALES) {
    const nav = NAV[locale];
    assert.equal(copy[locale].home, nav.home, `${locale}: the logo link's name`);
    assert.equal(copy[locale].label, nav.label, `${locale}: the nav's name`);
    assert.equal(copy[locale].products, nav.products.label, `${locale}: Products`);
    assert.equal(copy[locale].new, nav.products.new, `${locale}: New`);
    assert.deepEqual(copy[locale].mosoo, nav.products.items.mosoo, `${locale}: mosoo`);
    assert.deepEqual(copy[locale].computer, nav.products.items.computer, `${locale}: mosoo computer`);
    assert.equal(copy[locale].language, nav.language, `${locale}: Language`);
    assert.equal(copy[locale].languageButton, nav.languageButton, `${locale}: the switch's name`);
    assert.equal(copy[locale].menu, nav.menu, `${locale}: Menu`);
  }
  assert.deepEqual(names, { en: "English", zh: "简体中文", ja: "日本語" });
});
