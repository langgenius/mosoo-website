// 6 Footer (BRIEF §4 row 6; TOOLS-REVIEW T5 / T7). Intent's footer on Intent's 12-column grid (staging
// refs/intent/v5/STUDY.md §1, v5/tools/brand/NOTES.md §2.2):
//   top row     the Ask-AI column in columns 1-3 (over the mark; v4c's Ask-AI, as a column), then four link columns
//               from column 5 (over the letters): Harnesses (20px lime tiles with 12px ink runtime glyphs, Dub
//               variant C, staging refs/dub/v5/STUDY.md §4), Product, Developers, Open source. Headings sans
//               14/20 w500, sentence case. No Pricing link (TOOLS-REVIEW T5).
//   brand row   the T5 mark (variant A: the outline draws, then fills with ink) in columns 1-3 and the letters-only
//               wordmark from column 5, aligned to the first link column; both rise out of the row's overflow:clip
//               seam. A link home.
//   legal row   the language list and the copyright.
// Motion: src/effects/v5/footer.ts (links, then the brand, from the seam; replays) and src/home/footer-mark.ts
// (the draw, the ink fill, the desktop hover redraw). Reduced motion and no JS: the composed end state.

import { BRAND_LETTERS, BRAND_MARK } from "../../shared/ui/brand-v5.generated.ts";
import type { HarnessId, HomeCopy, HomeLocale } from "../copy.ts";
import { HARNESS_IDS, LANGUAGES, LINKS, localeLinks } from "../copy.ts";
import { RUNTIME_GLYPHS } from "../runtime-glyphs.ts";
import { esc } from "../ui.ts";

/** The assistants of the Ask-AI column (v4c src/home/markup.ts renderFooter): each opens with the prompt filled in. */
const ASSISTANTS: readonly { name: string; href: (q: string) => string }[] = [
  { name: "ChatGPT", href: (q) => `https://chatgpt.com/?q=${q}` },
  { name: "Claude", href: (q) => `https://claude.ai/new?q=${q}` },
  { name: "Perplexity", href: (q) => `https://www.perplexity.ai/search?q=${q}` },
  { name: "Gemini", href: (q) => `https://gemini.google.com/app?q=${q}` },
];

function runtimeGlyph(id: HarnessId): string {
  const glyph = RUNTIME_GLYPHS.find((g) => g.id === id);
  if (!glyph) throw new Error(`unknown runtime glyph ${id}`);
  return `<svg class="v5-ft-glyph" viewBox="${glyph.viewBox}" fill="currentColor" fill-rule="evenodd" aria-hidden="true" focusable="false">${glyph.body}</svg>`;
}

/** The drawable T5 mark (public/brand/v5/mark-draw-260.svg, inlined): solid fill, block outline, bar line. */
function markSvg(): string {
  const [x, y, w, h] = BRAND_MARK.vb;
  return (
    `<svg class="v5-ft-mark-svg" viewBox="${x} ${y} ${w} ${h}" fill="none" stroke="currentColor" stroke-linejoin="miter" stroke-miterlimit="4" stroke-linecap="butt" aria-hidden="true" focusable="false">` +
    `<path class="bm-fill" d="${BRAND_MARK.fill}" fill="currentColor" stroke="none"/>` +
    `<path class="bm-block" d="${BRAND_MARK.block}" stroke-width="${BRAND_MARK.stroke}" pathLength="1"/>` +
    `<path class="bm-bar" d="${BRAND_MARK.bar}" stroke-width="${BRAND_MARK.stroke}" pathLength="1"/>` +
    `</svg>`
  );
}

/** The five letters only (public/brand/v5/mosoo-letters.svg, inlined), in currentColor. */
function lettersSvg(): string {
  const [x, y, w, h] = BRAND_LETTERS.vb;
  const paths = BRAND_LETTERS.d.map((d) => `<path d="${d}"/>`).join("");
  return `<svg class="v5-ft-word-svg" viewBox="${x} ${y} ${w} ${h}" fill="currentColor" aria-hidden="true" focusable="false">${paths}</svg>`;
}

/** The external-link arrow, drawn in the page's line (1px-equivalent stroke, currentColor), not a Unicode glyph that
 *  each font draws its own way (design review P2-10). */
const OUT_ARROW =
  '<svg class="v5-ft-out" viewBox="0 0 10 10" width="10" height="10" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M2.5 7.5L7.5 2.5M3.5 2.5H7.5V6.5"/></svg>';

const item = (href: string, label: string, extra = ""): string =>
  `<li><a href="${esc(href)}"${extra}>${esc(label)}</a></li>`;

function column(title: string, items: string, extraClass = ""): string {
  return `<div class="v5-ft-col${extraClass}" data-footer-link><h2 class="v5-ft-h">${esc(title)}</h2><ul class="v5-ft-list">${items}</ul></div>`;
}

export function render(locale: HomeLocale, copy: HomeCopy): string {
  const f = copy.footer;
  const c = f.columns;
  const links = localeLinks(locale);
  const q = encodeURIComponent(f.ask.prompt);
  const ask = ASSISTANTS.map(
    (a) =>
      `<li><a href="${esc(a.href(q))}" rel="noopener" target="_blank" translate="no">${esc(a.name)}${OUT_ARROW}</a></li>`,
  ).join("");
  const harnesses = c.harnesses.names
    .map((name, i) => {
      const id = HARNESS_IDS[i];
      if (!id) throw new Error(`footer harness ${name} has no runtime id`);
      return `<li class="v5-ft-rt"><span class="v5-ft-tile" aria-hidden="true">${runtimeGlyph(id)}</span><span translate="no">${esc(name)}</span></li>`;
    })
    .join("");
  const product = [
    item(LINKS.console, c.product.links.console),
    item(links.useCases, c.product.links.useCases),
    item(links.blog, c.product.links.blog),
    item(links.status, c.product.links.status),
  ].join("");
  const developers = [
    item(links.docs, c.developers.links.docs),
    item(links.quickstart, c.developers.links.quickstart),
    item(links.apiReference, c.developers.links.apiReference),
    item(LINKS.llms, c.developers.links.llms, ' translate="no"'),
  ].join("");
  const openSource = [
    item(LINKS.github, c.openSource.links.github, ' translate="no"'),
    item(LINKS.releases, c.openSource.links.releases),
    item(LINKS.spec, c.openSource.links.spec),
    item(LINKS.license, c.openSource.links.license),
  ].join("");
  const languages = LANGUAGES.map(
    (l) =>
      `<li><a href="/${l.locale}" hreflang="${l.lang}" lang="${l.lang}"${l.locale === locale ? ' aria-current="true"' : ""}>${esc(l.label)}</a></li>`,
  ).join("");

  return `<footer class="v5-ft" data-footer>
<div class="v5-ft-top" data-footer-links>
${column(f.ask.title, ask, " v5-ft-ask")}
<nav class="v5-ft-cols" aria-label="${esc(f.label)}">
${column(c.harnesses.title, harnesses, " v5-ft-harnesses")}
${column(c.product.title, product)}
${column(c.developers.title, developers)}
${column(c.openSource.title, openSource)}
</nav>
</div>
<a class="v5-ft-brand" href="${links.home}" aria-label="${esc(f.home)}" data-footer-brand>
<span class="v5-ft-mark" data-footer-rise>${markSvg()}</span>
<span class="v5-ft-word" data-footer-rise>${lettersSvg()}</span>
</a>
<div class="v5-ft-legal">
<ul class="v5-ft-langs" aria-label="${esc(f.languages)}">${languages}</ul>
<p class="v5-ft-copy">${esc(f.copyright)}</p>
</div>
</footer>`;
}
