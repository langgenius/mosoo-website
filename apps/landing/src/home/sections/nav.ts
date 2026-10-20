// 0 Nav (BRIEF §4 row 0; staging production/v5/TOOLS-REVIEW.md T6; the Products entry and the language switch since
// the owner's 2026-10-20 17:15 note, staging v5/polish/nav/DESIGN.md). The skip link, then one header that the nav
// engine (src/effects/v5/nav.ts) morphs with the scroll: a loose full-width bar at the top into a centred floating
// glass bar, where the lime "Try mosoo" grows in once the hero's lime CTA ([data-nav-cta-watch]) has gone behind the
// bar. Over [data-theme-zone="accent"] the glass turns lime and the CTA turns ink at once. The look is ./nav.css; the
// morph range is set at runtime (src/home/effects.ts: min(400px, 45vh)).
//
// The row: logo | Products ▾, Docs, Use cases, GitHub (its mark), the language ▾, Sign in | the CTA slot. Products
// and the language each open a native popover (popover + popovertarget: no script, light dismiss and Esc from the
// browser) holding real links: the two products (cloud.mosoo.ai, computer.mosoo.ai) and the three home pages (/en,
// /zh, /ja with hreflang). Up to 860px wide the whole <nav> is itself a popover, the sheet the menu button opens;
// inside it the two panels show inline. One copy of every link in the HTML, so crawlers and readers without JS get
// them all. Without JS the bar stays in the page at the top with the CTA shown (up to 860px: logo and menu button).

import { BRAND_LETTERS, BRAND_MARK } from "../../shared/ui/brand-v5.generated.ts";
import type { HomeCopy, HomeLocale } from "../copy.ts";
import { LANGUAGES, LINKS, localeLinks } from "../copy.ts";
import { esc } from "../ui.ts";

const r3 = (n: number): number => Math.round(n * 1000) / 1000;

/**
 * The whole lockup (mark + letters) in currentColor: public/brand/v5/logo-nav.svg's geometry, inlined from the
 * generated path data. The bar is drawn as its own centre line at the bar's thickness, which is exactly the
 * lockup's bar (scripts/assets/brand-v5.mjs barLine).
 */
export function lockupSvg(className: string): string {
  const [, , , height] = BRAND_MARK.vb;
  const [lettersX, , lettersW] = BRAND_LETTERS.vb;
  const width = r3(lettersX + lettersW);
  const letters = BRAND_LETTERS.d.map((d) => `<path d="${d}"/>`).join("");
  return (
    `<svg class="${className}" viewBox="0 0 ${width} ${height}" fill="currentColor" aria-hidden="true" focusable="false">` +
    `<path d="${BRAND_MARK.fill}"/>` +
    `<path d="${BRAND_MARK.bar}" fill="none" stroke="currentColor" stroke-width="${BRAND_MARK.stroke}"/>` +
    `${letters}</svg>`
  );
}

const SVG = 'aria-hidden="true" focusable="false"';

/** ▾, drawn in the page's line (1.3px, round ends); it turns over while its panel is open (nav.css). */
const CHEVRON = `<svg class="v5-nav-chev" viewBox="0 0 10 6" width="10" height="6" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" ${SVG}><path d="M1 1l4 4 4-4"/></svg>`;

/** The globe before the current language: a circle, one meridian and the equator, in the same line. */
const GLOBE = `<svg class="v5-nav-globe" viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.2" ${SVG}><circle cx="8" cy="8" r="6.4"/><path d="M1.6 8h12.8M8 1.6c1.7 1.8 2.6 4 2.6 6.4S9.7 12.6 8 14.4C6.3 12.6 5.4 10.4 5.4 8S6.3 3.4 8 1.6z"/></svg>`;

/** GitHub's mark (as production's routes/login/github-mark.tsx draws it), 18px in the bar. */
const GITHUB_MARK = `<svg class="v5-nav-ghm" viewBox="0 0 24 24" width="18" height="18" fill="currentColor" ${SVG}><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56 0-.28-.01-1.01-.02-1.99-3.2.7-3.87-1.54-3.87-1.54-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.74-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.21-1.49 3.18-1.18 3.18-1.18.62 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14 0 1.55-.01 2.8-.01 3.18 0 .31.21.67.8.55C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5Z"/></svg>`;

/** The phone menu button's two lines; they cross into an x while the sheet is open (nav.css). */
const MENU_LINES = `<svg class="v5-nav-burger" viewBox="0 0 18 18" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" ${SVG}><path class="v5-nav-burger-a" d="M2 6.25h14"/><path class="v5-nav-burger-b" d="M2 11.75h14"/></svg>`;

/** The check before the current language in the list. */
const CHECK = `<svg class="v5-nav-check" viewBox="0 0 12 12" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" ${SVG}><path d="M2.5 6.2l2.3 2.3 4.7-5"/></svg>`;

/**
 * The 12px ink glyphs of the product tiles (20px lime tiles, as the footer's Harnesses rows; Dub's resource list).
 * mosoo: its own mark (the block and the bar, public/brand/v5's geometry). mosoo computer has no mark of its own on
 * this site, so a plain line drawing of a screen on a stand stands in: a glyph, not a logo.
 */
function productGlyph(id: "mosoo" | "computer"): string {
  if (id === "mosoo") {
    const [x, y, w, h] = BRAND_MARK.vb;
    return (
      `<svg class="v5-nav-tile-g" viewBox="${x} ${y} ${w} ${h}" fill="currentColor" ${SVG}>` +
      `<path d="${BRAND_MARK.fill}"/>` +
      `<path d="${BRAND_MARK.bar}" fill="none" stroke="currentColor" stroke-width="${BRAND_MARK.stroke}"/></svg>`
    );
  }
  return `<svg class="v5-nav-tile-g" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" ${SVG}><rect x="1.1" y="1.6" width="9.8" height="6.6" rx="1.2"/><path d="M6 8.2v2.2M3.6 10.4h4.8"/></svg>`;
}

/** The "New" chip: the system's .v5-new, as in the hero's pill (production's landing/hero.tsx L63-65). */
function newChip(label: string): string {
  return `<span class="v5-new">${esc(label)}</span>`;
}

const host = (href: string): string => new URL(href).host;

export function render(locale: HomeLocale, copy: HomeCopy): string {
  const t = copy.nav;
  const p = t.products;
  const links = localeLinks(locale);

  const products = (
    [
      { id: "mosoo", href: LINKS.console, item: p.items.mosoo, fresh: false },
      { id: "computer", href: LINKS.computer, item: p.items.computer, fresh: true },
    ] as const
  )
    // One link per row, read as name, line, host; the grid places the host at the name's right on wide screens
    // and under the line on phones (nav.css). The spaces between the parts are for the link's text (its accessible
    // name, copy and paste, crawlers: "mosoo Open-source …" rather than "mosooOpen-source …"); grid and flex items
    // drop them from the layout.
    .map(
      ({ id, href, item, fresh }) =>
        `<li><a class="v5-nav-prod" href="${esc(href)}">` +
        `<span class="v5-nav-tile" aria-hidden="true">${productGlyph(id)}</span> ` +
        `<span class="v5-nav-prod-name"><span translate="no">${esc(item.name)}</span>${fresh ? ` ${newChip(p.new)}` : ""}</span> ` +
        `<span class="v5-nav-prod-line">${esc(item.line)}</span> ` +
        `<span class="v5-nav-prod-host" translate="no">${esc(host(href))}</span></a></li>`,
    )
    .join("");

  const languages = LANGUAGES.map(
    (l) =>
      `<li><a href="/${l.locale}" hreflang="${l.lang}" lang="${l.lang}"${l.locale === locale ? ' aria-current="true"' : ""}>` +
      `${CHECK}<span>${esc(l.label)}</span></a></li>`,
  ).join("");

  return `<a class="v5-skip" href="#main">${esc(t.skip)}</a>
<header class="v5-nav" data-nav>
<a class="v5-nav-brand" href="${links.home}" aria-label="${esc(t.home)}">${lockupSvg("v5-nav-logo")}</a>
<div class="v5-nav-end">
<nav class="v5-nav-links" id="v5-nav-menu" aria-label="${esc(t.label)}" popover>
<div class="v5-nav-dd v5-nav-dd--products">
<button type="button" class="v5-nav-tg" popovertarget="v5-nav-products">${esc(p.label)}${CHEVRON}</button>
<div class="v5-nav-pop v5-nav-pop--products" id="v5-nav-products" popover>
<p class="v5-nav-pop-h" id="v5-nav-products-h">${esc(p.label)}</p>
<ul class="v5-nav-prods" aria-labelledby="v5-nav-products-h">${products}</ul>
</div>
</div>
<a class="v5-nav-a" href="${links.docs}">${esc(t.docs)}</a>
<a class="v5-nav-a" href="${links.useCases}">${esc(t.useCases)}</a>
<a class="v5-nav-a v5-nav-gh" href="${LINKS.github}" translate="no">${GITHUB_MARK}<span class="v5-nav-gh-t">${esc(t.github)}</span></a>
<div class="v5-nav-dd v5-nav-dd--lang">
<button type="button" class="v5-nav-tg" popovertarget="v5-nav-lang" aria-label="${esc(t.languageButton.replace("{lang}", t.langShort))}">${GLOBE}<span class="v5-nav-cur">${esc(t.langShort)}</span>${CHEVRON}</button>
<div class="v5-nav-pop v5-nav-pop--lang" id="v5-nav-lang" popover>
<p class="v5-nav-pop-h" id="v5-nav-lang-h">${GLOBE}<span>${esc(t.language)}</span></p>
<ul class="v5-nav-langs" aria-labelledby="v5-nav-lang-h">${languages}</ul>
</div>
</div>
<a class="v5-nav-a v5-nav-signin" href="${LINKS.signIn}">${esc(t.signIn)}</a>
</nav>
<span class="v5-nav-cta" data-nav-cta><a class="v5-btn v5-btn--lime" href="${LINKS.console}">${esc(t.cta)}</a></span>
<button type="button" class="v5-nav-menu" popovertarget="v5-nav-menu" aria-label="${esc(t.menu)}">${MENU_LINES}</button>
</div>
</header>`;
}
