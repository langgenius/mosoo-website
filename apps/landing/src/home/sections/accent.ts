// 3 The full lime screen (staging production/v5/BRIEF.md §4 row 3). Styles: ./accent.css; copy: ../copy/accent.json.
//
// Frame's white-to-lime screen (staging refs/frame/v5/motion/STUDY.md §4, layout/STUDY.md §3), in two parts:
// 1. The white gap: a stretch of near-empty paper with a tab label and a short line in the display face, then
//    130 px of nothing before the edge (Frame: "Our Mission Statement" + "Be focused.").
// 2. The lime panel: a hard edge (no shadow, no gradient at the top), as wide as the paper (full bleed on phones),
//    solid for at least one screen and 40 px, then a long linear fade that ends transparent so the paper comes back
//    without a seam. On it: the two-tone H2, a sub, and three white cards in one row (Mintlify's 1 + 1 + 1 row) that
//    tell a Session's life between turns: the sandbox goes, the files and the conversation stay, the Session comes
//    back on a fresh sandbox. Each card has its T3 line figure and, at the bottom-left, a label and one line (v4a's
//    spec-row type; Mintlify's bento label). The five parts themselves (harness, model, sandbox, files, resume) are
//    the spec table's screen; here they would say the same thing twice (graft, staging v5/graft/lime/NOTES.md).
//
// Engines (src/effects/v5/README.md): the gap block and the title block rise (Frame a-15; the gap line, the H2's
// second line and the sub fade in 300 ms later, a-14); the cards enter with the rise engine (Intent): they come into
// view in one frame, so they start 100 ms apart, left to right, in the order the life cycle reads. The nav turns
// lime while .v5-acc-zone is under its centre line: data-theme-zone sits on that box, which covers the solid stretch
// and the first half of the fade, so the bar is white glass again over the pale end and never over the white gap.
// The Resume comet is the group's only motion: ./accent.css runs it (T3's keyframes) only while its figure carries
// data-playing, one 4.5 s burst each time it comes into view (src/effects/v5/play-for.ts; WCAG 2.2.2), and stops it
// under reduced motion.
//
// The gap line is a paragraph set as a display line, not a heading: the panel's H2 names the section
// (aria-labelledby), so the outline does not get an empty heading before it. The card list keeps role="list":
// Safari drops list semantics from a list styled list-style: none (../system.css).

import type { HomeCopy, HomeLocale } from "../copy.ts";
import { esc, tabLabel, twoTone } from "../ui.ts";

/** The three cards in reading order, a Session between turns: what goes, what stays, how it comes back. */
const PARTS = ["sandbox", "files", "resume"] as const;
type Part = (typeof PARTS)[number];

/** T3 renders every figure at two sizes, viewBox = CSS px; lines and dot pitch keep their width at both. */
const SIZES = [202, 160] as const;
type FigureSize = (typeof SIZES)[number];

/*
 * Verbatim copies of public/landing/v5/figures/<part>-<size>.svg, the picks of T3
 * (apps/landing/scripts/assets/linefig.mjs). Inline, not <img>, so the page's CSS can pause the Resume comet while
 * it is off-screen (TOOLS-REVIEW T3); its class, keyframes and mask id are per size (lfc202 / lfc160), so both
 * sizes can sit in the page. render() drops the XML comment and the Resume figure's <style> (./accent.css carries
 * the same keyframes, so the page keeps its one stylesheet) and adds a class. After re-running linefig.mjs,
 * paste the files again (each between backticks, trailing newline dropped); tests/home-figures.test.mjs checks
 * that they still match. The generator also draws harness and model-key figures, for the five-part grid this
 * screen had before the spec table came back; they are not on the page.
 */
const FIGURES: Readonly<Record<Part, Readonly<Record<FigureSize, string>>>> = {
  "sandbox": {
    202: `<svg xmlns="http://www.w3.org/2000/svg" width="202" height="202" viewBox="0 0 202 202" fill="none" stroke="#161815" stroke-linejoin="bevel">
<!-- sandbox · a cube inside its own cube · node apps/landing/scripts/assets/linefig.mjs -->
<path stroke-width="1.25" stroke-dasharray=".01 4" stroke-linecap="round" d="M8.95 184.99L66.02 132.92M148.95 184.99L119.22 132.92M8.95 44.99L66.02 79.72M148.95 44.99L119.22 79.72M53.05 157.01L82.78 122.28M193.05 157.01L135.98 122.28M53.05 17.01L82.78 69.08M193.05 17.01L135.98 69.08"/>
<path stroke-width=".75" d="M8.95 184.99L148.95 184.99M8.95 44.99L148.95 44.99M53.05 157.01L193.05 157.01M53.05 17.01L193.05 17.01M8.95 184.99L8.95 44.99M148.95 184.99L148.95 44.99M53.05 157.01L53.05 17.01M193.05 157.01L193.05 17.01M8.95 184.99L53.05 157.01M148.95 184.99L193.05 157.01M8.95 44.99L53.05 17.01M148.95 44.99L193.05 17.01M66.02 132.92L119.22 132.92M66.02 79.72L119.22 79.72M82.78 122.28L135.98 122.28M82.78 69.08L135.98 69.08M66.02 132.92L66.02 79.72M119.22 132.92L119.22 79.72M82.78 122.28L82.78 69.08M135.98 122.28L135.98 69.08M66.02 132.92L82.78 122.28M119.22 132.92L135.98 122.28M66.02 79.72L82.78 69.08M119.22 79.72L135.98 69.08"/>
</svg>`,
    160: `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160" fill="none" stroke="#161815" stroke-linejoin="bevel">
<!-- sandbox · a cube inside its own cube · node apps/landing/scripts/assets/linefig.mjs -->
<path stroke-width="1.25" stroke-dasharray=".01 4" stroke-linecap="round" d="M7.09 146.53L52.3 105.28M117.98 146.53L94.43 105.28M7.09 35.64L52.3 63.14M117.98 35.64L94.43 63.14M42.02 124.36L65.57 96.86M152.91 124.36L107.7 96.86M42.02 13.47L65.57 54.72M152.91 13.47L107.7 54.72"/>
<path stroke-width=".75" d="M7.09 146.53L117.98 146.53M7.09 35.64L117.98 35.64M42.02 124.36L152.91 124.36M42.02 13.47L152.91 13.47M7.09 146.53L7.09 35.64M117.98 146.53L117.98 35.64M42.02 124.36L42.02 13.47M152.91 124.36L152.91 13.47M7.09 146.53L42.02 124.36M117.98 146.53L152.91 124.36M7.09 35.64L42.02 13.47M117.98 35.64L152.91 13.47M52.3 105.28L94.43 105.28M52.3 63.14L94.43 63.14M65.57 96.86L107.7 96.86M65.57 54.72L107.7 54.72M52.3 105.28L52.3 63.14M94.43 105.28L94.43 63.14M65.57 96.86L65.57 54.72M107.7 96.86L107.7 54.72M52.3 105.28L65.57 96.86M94.43 105.28L107.7 96.86M52.3 63.14L65.57 54.72M94.43 63.14L107.7 54.72"/>
</svg>`,
  },
  "files": {
    202: `<svg xmlns="http://www.w3.org/2000/svg" width="202" height="202" viewBox="0 0 202 202" fill="none" stroke="#161815" stroke-linejoin="bevel">
<!-- files · a page lifted off the stack · node apps/landing/scripts/assets/linefig.mjs -->
<path stroke-width=".75" fill="#FFFFFF" d="M177.21 147L177.21 144L114.86 180L114.86 183Z"/>
<path stroke-width=".75" fill="#FFFFFF" d="M24.79 131L114.86 183L114.86 180L24.79 128Z"/>
<path stroke-width=".75" fill="#FFFFFF" d="M87.14 92L177.21 144L114.86 180L24.79 128Z"/>
<path stroke-width=".75" fill="#FFFFFF" d="M177.21 138L177.21 135L114.86 171L114.86 174Z"/>
<path stroke-width=".75" fill="#FFFFFF" d="M24.79 122L114.86 174L114.86 171L24.79 119Z"/>
<path stroke-width=".75" fill="#FFFFFF" d="M87.14 83L177.21 135L114.86 171L24.79 119Z"/>
<path stroke-width=".75" fill="#FFFFFF" d="M177.21 129L177.21 126L114.86 162L114.86 165Z"/>
<path stroke-width=".75" fill="#FFFFFF" d="M24.79 113L114.86 165L114.86 162L24.79 110Z"/>
<path stroke-width=".75" fill="#FFFFFF" d="M87.14 74L177.21 126L114.86 162L24.79 110Z"/>
<path stroke-width="1.25" stroke-dasharray=".01 4" stroke-linecap="round" d="M87.14 74L87.14 22M24.79 110L24.79 58M114.86 162L114.86 110M177.21 126L177.21 74"/>
<path stroke-width=".75" fill="#FFFFFF" d="M177.21 74L177.21 71L114.86 107L114.86 110Z"/>
<path stroke-width=".75" fill="#FFFFFF" d="M24.79 58L114.86 110L114.86 107L24.79 55Z"/>
<path stroke-width=".75" fill="#FFFFFF" d="M87.14 19L177.21 71L114.86 107L24.79 55Z"/>
</svg>`,
    160: `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160" fill="none" stroke="#161815" stroke-linejoin="bevel">
<!-- files · a page lifted off the stack · node apps/landing/scripts/assets/linefig.mjs -->
<path stroke-width=".75" fill="#FFFFFF" d="M140.36 116.44L140.36 114.06L90.98 142.57L90.98 144.95Z"/>
<path stroke-width=".75" fill="#FFFFFF" d="M19.64 103.76L90.98 144.95L90.98 142.57L19.64 101.39Z"/>
<path stroke-width=".75" fill="#FFFFFF" d="M69.02 72.87L140.36 114.06L90.98 142.57L19.64 101.39Z"/>
<path stroke-width=".75" fill="#FFFFFF" d="M140.36 109.31L140.36 106.93L90.98 135.45L90.98 137.82Z"/>
<path stroke-width=".75" fill="#FFFFFF" d="M19.64 96.63L90.98 137.82L90.98 135.45L19.64 94.26Z"/>
<path stroke-width=".75" fill="#FFFFFF" d="M69.02 65.74L140.36 106.93L90.98 135.45L19.64 94.26Z"/>
<path stroke-width=".75" fill="#FFFFFF" d="M140.36 102.18L140.36 99.8L90.98 128.32L90.98 130.69Z"/>
<path stroke-width=".75" fill="#FFFFFF" d="M19.64 89.5L90.98 130.69L90.98 128.32L19.64 87.13Z"/>
<path stroke-width=".75" fill="#FFFFFF" d="M69.02 58.61L140.36 99.8L90.98 128.32L19.64 87.13Z"/>
<path stroke-width="1.25" stroke-dasharray=".01 4" stroke-linecap="round" d="M69.02 58.61L69.02 17.43M19.64 87.13L19.64 45.94M90.98 128.32L90.98 87.13M140.36 99.8L140.36 58.61"/>
<path stroke-width=".75" fill="#FFFFFF" d="M140.36 58.61L140.36 56.24L90.98 84.75L90.98 87.13Z"/>
<path stroke-width=".75" fill="#FFFFFF" d="M19.64 45.94L90.98 87.13L90.98 84.75L19.64 43.56Z"/>
<path stroke-width=".75" fill="#FFFFFF" d="M69.02 15.05L140.36 56.24L90.98 84.75L19.64 43.56Z"/>
</svg>`,
  },
  "resume": {
    202: `<svg xmlns="http://www.w3.org/2000/svg" width="202" height="202" viewBox="0 0 202 202" fill="none" stroke="#161815" stroke-linejoin="bevel">
<!-- resume · the ring keeps turning · node apps/landing/scripts/assets/linefig.mjs -->
<defs><mask id="lfc202-m" maskUnits="userSpaceOnUse" x="0" y="0" width="202" height="202"><rect width="202" height="202" fill="#fff"/><path fill="#000" stroke="none" d="M80.22 64L101 52L121.78 64L121.78 118L80.22 118Z"/></mask></defs>
<style>@keyframes lfc202{from{stroke-dashoffset:0}to{stroke-dashoffset:-100}}.lfc202{animation:lfc202 10.5s linear infinite}@media (prefers-reduced-motion:reduce){.lfc202{animation:none}}</style>
<path stroke-width=".75" stroke-opacity=".35" d="M17 118A84 48.5 0 0 1 101 69.5A84 48.5 0 0 1 185 118"/>
<path stroke-width=".75" fill="#FFFFFF" d="M121.78 176L121.78 64L101 76L101 188Z"/>
<path stroke-width=".75" fill="#FFFFFF" d="M80.22 176L101 188L101 76L80.22 64Z"/>
<path stroke-width=".75" fill="#FFFFFF" d="M101 52L121.78 64L101 76L80.22 64Z"/>
<path stroke-width="1.25" stroke-dasharray=".01 4" stroke-linecap="round" d="M101 64L101 4"/>
<path stroke-width=".75" stroke-opacity=".35" d="M185 118A84 48.5 0 0 1 101 166.5A84 48.5 0 0 1 17 118"/>
<g mask="url(#lfc202-m)"><path class="lfc202" pathLength="100" stroke-width="1.2" stroke-linecap="round" stroke-dasharray="2.6 97.4" stroke-dashoffset="-35.77" stroke-opacity="0.806" style="animation-delay:-1.092s" d="M101 69.5A84 48.5 0 0 1 173.75 142.25A84 48.5 0 0 1 28.25 142.25A84 48.5 0 0 1 101 69.5"/><path class="lfc202" pathLength="100" stroke-width="1.2" stroke-linecap="round" stroke-dasharray="5.2 94.8" stroke-dashoffset="-33.17" stroke-opacity="0.446" style="animation-delay:-0.819s" d="M101 69.5A84 48.5 0 0 1 173.75 142.25A84 48.5 0 0 1 28.25 142.25A84 48.5 0 0 1 101 69.5"/><path class="lfc202" pathLength="100" stroke-width="1.2" stroke-linecap="round" stroke-dasharray="7.8 92.2" stroke-dashoffset="-30.57" stroke-opacity="0.309" style="animation-delay:-0.546s" d="M101 69.5A84 48.5 0 0 1 173.75 142.25A84 48.5 0 0 1 28.25 142.25A84 48.5 0 0 1 101 69.5"/><path class="lfc202" pathLength="100" stroke-width="1.2" stroke-linecap="round" stroke-dasharray="10.4 89.6" stroke-dashoffset="-27.97" stroke-opacity="0.236" style="animation-delay:-0.273s" d="M101 69.5A84 48.5 0 0 1 173.75 142.25A84 48.5 0 0 1 28.25 142.25A84 48.5 0 0 1 101 69.5"/><path class="lfc202" pathLength="100" stroke-width="1.2" stroke-linecap="round" stroke-dasharray="13 87" stroke-dashoffset="-25.37" stroke-opacity="0.12" d="M101 69.5A84 48.5 0 0 1 173.75 142.25A84 48.5 0 0 1 28.25 142.25A84 48.5 0 0 1 101 69.5"/></g>
</svg>`,
    160: `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160" fill="none" stroke="#161815" stroke-linejoin="bevel">
<!-- resume · the ring keeps turning · node apps/landing/scripts/assets/linefig.mjs -->
<defs><mask id="lfc160-m" maskUnits="userSpaceOnUse" x="0" y="0" width="160" height="160"><rect width="160" height="160" fill="#fff"/><path fill="#000" stroke="none" d="M63.54 50.69L80 41.19L96.46 50.69L96.46 93.47L63.54 93.47Z"/></mask></defs>
<style>@keyframes lfc160{from{stroke-dashoffset:0}to{stroke-dashoffset:-100}}.lfc160{animation:lfc160 10.5s linear infinite}@media (prefers-reduced-motion:reduce){.lfc160{animation:none}}</style>
<path stroke-width=".75" stroke-opacity=".35" d="M13.47 93.47A66.53 38.41 0 0 1 80 55.05A66.53 38.41 0 0 1 146.53 93.47"/>
<path stroke-width=".75" fill="#FFFFFF" d="M96.46 139.41L96.46 50.69L80 60.2L80 148.91Z"/>
<path stroke-width=".75" fill="#FFFFFF" d="M63.54 139.41L80 148.91L80 60.2L63.54 50.69Z"/>
<path stroke-width=".75" fill="#FFFFFF" d="M80 41.19L96.46 50.69L80 60.2L63.54 50.69Z"/>
<path stroke-width="1.25" stroke-dasharray=".01 4" stroke-linecap="round" d="M80 50.69L80 3.17"/>
<path stroke-width=".75" stroke-opacity=".35" d="M146.53 93.47A66.53 38.41 0 0 1 80 131.88A66.53 38.41 0 0 1 13.47 93.47"/>
<g mask="url(#lfc160-m)"><path class="lfc160" pathLength="100" stroke-width="1.2" stroke-linecap="round" stroke-dasharray="2.6 97.4" stroke-dashoffset="-35.77" stroke-opacity="0.806" style="animation-delay:-1.092s" d="M80 55.05A66.53 38.41 0 0 1 137.62 112.67A66.53 38.41 0 0 1 22.38 112.67A66.53 38.41 0 0 1 80 55.05"/><path class="lfc160" pathLength="100" stroke-width="1.2" stroke-linecap="round" stroke-dasharray="5.2 94.8" stroke-dashoffset="-33.17" stroke-opacity="0.446" style="animation-delay:-0.819s" d="M80 55.05A66.53 38.41 0 0 1 137.62 112.67A66.53 38.41 0 0 1 22.38 112.67A66.53 38.41 0 0 1 80 55.05"/><path class="lfc160" pathLength="100" stroke-width="1.2" stroke-linecap="round" stroke-dasharray="7.8 92.2" stroke-dashoffset="-30.57" stroke-opacity="0.309" style="animation-delay:-0.546s" d="M80 55.05A66.53 38.41 0 0 1 137.62 112.67A66.53 38.41 0 0 1 22.38 112.67A66.53 38.41 0 0 1 80 55.05"/><path class="lfc160" pathLength="100" stroke-width="1.2" stroke-linecap="round" stroke-dasharray="10.4 89.6" stroke-dashoffset="-27.97" stroke-opacity="0.236" style="animation-delay:-0.273s" d="M80 55.05A66.53 38.41 0 0 1 137.62 112.67A66.53 38.41 0 0 1 22.38 112.67A66.53 38.41 0 0 1 80 55.05"/><path class="lfc160" pathLength="100" stroke-width="1.2" stroke-linecap="round" stroke-dasharray="13 87" stroke-dashoffset="-25.37" stroke-opacity="0.12" d="M80 55.05A66.53 38.41 0 0 1 137.62 112.67A66.53 38.41 0 0 1 22.38 112.67A66.53 38.41 0 0 1 80 55.05"/></g>
</svg>`,
  },
};

/**
 * One card's figure: both sizes, the CSS shows 202 on wide screens and 160 on phones (T3 NOTES §2: never scale a
 * figure with CSS). Decorative: the card's label and line carry the meaning.
 */
function figure(part: Part): string {
  const svgs = SIZES.map((size) =>
    FIGURES[part][size]
      .replace(/<!--[\s\S]*?-->\n?/, "")
      .replace(/<style>[\s\S]*?<\/style>\n?/, "")
      .replace("<svg ", `<svg class="v5-acc-svg v5-acc-svg--${size}" `),
  ).join("");
  // The comet's figure plays one burst each time it comes into view (src/effects/v5/play-for.ts, ./accent.css).
  const play = part === "resume" ? ' data-play-for="4500"' : "";
  return `<div class="v5-acc-fig" aria-hidden="true"${play}>${svgs}</div>`;
}

export function render(_locale: HomeLocale, copy: HomeCopy): string {
  const a = copy.accent;
  // One card per part, no more: a card the copy adds would otherwise never reach the page.
  if (a.cards.length !== PARTS.length) {
    throw new Error(`accent.cards has ${a.cards.length} cards; the page draws ${PARTS.length}: ${PARTS.join(", ")}`);
  }
  const cards = PARTS.map((part, i) => {
    const card = a.cards[i];
    if (!card) {
      throw new Error(`accent.cards[${i}] (${part}) is missing: the copy lists the three cards in order`);
    }
    return `<li class="v5-acc-card" data-part="${part}" data-rise="card">${figure(part)}<div class="v5-acc-text"><h3 class="v5-acc-label">${esc(card.label)}</h3><p class="v5-acc-line">${esc(card.line)}</p></div></li>`;
  }).join("\n");
  return `<section id="session" data-section="accent" class="v5-sec v5-accent" aria-labelledby="accent-title">
<div class="v5-wrap v5-acc-gap">
<div data-rise="block">
${tabLabel(a.tab)}
<p class="v5-h2 v5-h2--xl v5-acc-gap-line" data-rise="line">${esc(a.gap)}</p>
</div>
</div>
<div class="v5-acc-lime v5-on-lime">
<div class="v5-acc-zone" data-theme-zone="accent" aria-hidden="true"></div>
<div class="v5-wrap">
<div class="v5-acc-head" data-rise="block"><h2 id="accent-title" class="v5-h2 v5-h2--lg" data-rise="title">${twoTone(a.h2a, a.h2b, ' data-rise="line"')}</h2></div>
<p class="v5-acc-sub" data-rise="line">${esc(a.sub)}</p>
<ul class="v5-acc-grid" role="list">
${cards}
</ul>
</div>
</div>
</section>`;
}
