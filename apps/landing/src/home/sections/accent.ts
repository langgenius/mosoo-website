// 3 The full lime screen (staging production/v5/BRIEF.md §4 row 3). Styles: ./accent.css; copy: ../copy/accent.json.
//
// Frame's white-to-lime screen (staging refs/frame/v5/motion/STUDY.md §4, layout/STUDY.md §3), in two parts:
// 1. The white gap: a stretch of near-empty paper with a tab label and a short line in the display face, then
//    130 px of nothing before the edge (Frame: "Our Mission Statement" + "Be focused.").
// 2. The lime panel: a hard edge (no shadow, no gradient at the top), as wide as the paper (full bleed on phones),
//    solid for at least one screen and 40 px, then a long linear fade that ends transparent so the paper comes back
//    without a seam. On it: the two-tone H2, a sub, and one row of three unequal white cards, 1fr 2fr 1fr (Frame's
//    own lime bento is unequal; three equal cards were the template, staging v5/review/graft-design.md P1-2). The
//    cards are a Session between turns and each label is a change of state: the sandbox is reclaimed, the working
//    directory is kept with the conversation (the wide middle card: what the H2's second line says stays), the
//    Session ID does not change. Each card has its T3 line figure, a label and one line (v4a's spec-row type,
//    Mintlify's bento label in the bottom-left corner); the wide card sets its text on the left and a larger figure
//    on the right (Frame's Fast Nav card). The five parts themselves (harness, model, sandbox, files, resume) are the
//    spec table's screen, so the labels do not repeat its row names (staging v5/review/graft-yc.md P2-1).
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

/** The three cards in reading order, a Session between turns: what goes, what stays, what does not change. */
const PARTS = ["sandbox", "files", "resume"] as const;
type Part = (typeof PARTS)[number];

/** The wide middle card: the working directory and the conversation, what "The Session stays." is made of. */
const WIDE: Part = "files";

/**
 * Each figure at the three sizes the screen shows, one at a time (./accent.css): lg from 1200 px wide, md below that
 * and on tablets, sm beside the text on phones. The wide card's Files figure is larger than the narrow cards' (296,
 * as tall as the row lets it be, and 202, against 202 and 160); all three are 96 on phones. T3 draws every size
 * itself, viewBox = CSS px, so the lines and the dot pitch keep their width: a figure is never scaled with CSS (T3
 * NOTES §2).
 */
type Role = "lg" | "md" | "sm";
const ROLES: readonly Role[] = ["lg", "md", "sm"];

/*
 * Verbatim copies of public/landing/v5/figures/<part>-<size>.svg, the picks of T3
 * (apps/landing/scripts/assets/linefig.mjs). Inline, not <img>, so the page's CSS can pause the Resume comet while
 * it is off-screen (TOOLS-REVIEW T3); its class, keyframes and mask id are per size (lfc202 / lfc160 / lfc96), so
 * every size can sit in the page. render() drops the XML comment and the Resume figure's <style> (./accent.css
 * carries the same keyframes, so the page keeps its one stylesheet) and adds a class. After re-running linefig.mjs,
 * paste the files again (each between backticks, trailing newline dropped); tests/home-figures.test.mjs checks
 * that they still match. The generator also draws harness and model-key figures, for the five-part grid this
 * screen had before the spec table came back, and files at 160; they are not on the page.
 */
const FIGURES: Readonly<Record<Part, Readonly<Record<Role, string>>>> = {
  sandbox: {
    lg: `<svg xmlns="http://www.w3.org/2000/svg" width="202" height="202" viewBox="0 0 202 202" fill="none" stroke="#161815" stroke-linejoin="bevel">
<!-- sandbox · a cube inside its own cube · node apps/landing/scripts/assets/linefig.mjs -->
<path stroke-width="1.25" stroke-dasharray=".01 4" stroke-linecap="round" d="M8.95 184.99L66.02 132.92M148.95 184.99L119.22 132.92M8.95 44.99L66.02 79.72M148.95 44.99L119.22 79.72M53.05 157.01L82.78 122.28M193.05 157.01L135.98 122.28M53.05 17.01L82.78 69.08M193.05 17.01L135.98 69.08"/>
<path stroke-width=".75" d="M8.95 184.99L148.95 184.99M8.95 44.99L148.95 44.99M53.05 157.01L193.05 157.01M53.05 17.01L193.05 17.01M8.95 184.99L8.95 44.99M148.95 184.99L148.95 44.99M53.05 157.01L53.05 17.01M193.05 157.01L193.05 17.01M8.95 184.99L53.05 157.01M148.95 184.99L193.05 157.01M8.95 44.99L53.05 17.01M148.95 44.99L193.05 17.01M66.02 132.92L119.22 132.92M66.02 79.72L119.22 79.72M82.78 122.28L135.98 122.28M82.78 69.08L135.98 69.08M66.02 132.92L66.02 79.72M119.22 132.92L119.22 79.72M82.78 122.28L82.78 69.08M135.98 122.28L135.98 69.08M66.02 132.92L82.78 122.28M119.22 132.92L135.98 122.28M66.02 79.72L82.78 69.08M119.22 79.72L135.98 69.08"/>
</svg>`,
    md: `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160" fill="none" stroke="#161815" stroke-linejoin="bevel">
<!-- sandbox · a cube inside its own cube · node apps/landing/scripts/assets/linefig.mjs -->
<path stroke-width="1.25" stroke-dasharray=".01 4" stroke-linecap="round" d="M7.09 146.53L52.3 105.28M117.98 146.53L94.43 105.28M7.09 35.64L52.3 63.14M117.98 35.64L94.43 63.14M42.02 124.36L65.57 96.86M152.91 124.36L107.7 96.86M42.02 13.47L65.57 54.72M152.91 13.47L107.7 54.72"/>
<path stroke-width=".75" d="M7.09 146.53L117.98 146.53M7.09 35.64L117.98 35.64M42.02 124.36L152.91 124.36M42.02 13.47L152.91 13.47M7.09 146.53L7.09 35.64M117.98 146.53L117.98 35.64M42.02 124.36L42.02 13.47M152.91 124.36L152.91 13.47M7.09 146.53L42.02 124.36M117.98 146.53L152.91 124.36M7.09 35.64L42.02 13.47M117.98 35.64L152.91 13.47M52.3 105.28L94.43 105.28M52.3 63.14L94.43 63.14M65.57 96.86L107.7 96.86M65.57 54.72L107.7 54.72M52.3 105.28L52.3 63.14M94.43 105.28L94.43 63.14M65.57 96.86L65.57 54.72M107.7 96.86L107.7 54.72M52.3 105.28L65.57 96.86M94.43 105.28L107.7 96.86M52.3 63.14L65.57 54.72M94.43 63.14L107.7 54.72"/>
</svg>`,
    sm: `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96" fill="none" stroke="#161815" stroke-linejoin="bevel">
<!-- sandbox · a cube inside its own cube · node apps/landing/scripts/assets/linefig.mjs -->
<path stroke-width="1.25" stroke-dasharray=".01 4" stroke-linecap="round" d="M4.26 87.92L31.38 63.17M70.79 87.92L56.66 63.17M4.26 21.38L31.38 37.89M70.79 21.38L56.66 37.89M25.21 74.62L39.34 58.11M91.74 74.62L64.62 58.11M25.21 8.08L39.34 32.83M91.74 8.08L64.62 32.83"/>
<path stroke-width=".75" d="M4.26 87.92L70.79 87.92M4.26 21.38L70.79 21.38M25.21 74.62L91.74 74.62M25.21 8.08L91.74 8.08M4.26 87.92L4.26 21.38M70.79 87.92L70.79 21.38M25.21 74.62L25.21 8.08M91.74 74.62L91.74 8.08M4.26 87.92L25.21 74.62M70.79 87.92L91.74 74.62M4.26 21.38L25.21 8.08M70.79 21.38L91.74 8.08M31.38 63.17L56.66 63.17M31.38 37.89L56.66 37.89M39.34 58.11L64.62 58.11M39.34 32.83L64.62 32.83M31.38 63.17L31.38 37.89M56.66 63.17L56.66 37.89M39.34 58.11L39.34 32.83M64.62 58.11L64.62 32.83M31.38 63.17L39.34 58.11M56.66 63.17L64.62 58.11M31.38 37.89L39.34 32.83M56.66 37.89L64.62 32.83"/>
</svg>`,
  },
  files: {
    lg: `<svg xmlns="http://www.w3.org/2000/svg" width="296" height="296" viewBox="0 0 296 296" fill="none" stroke="#161815" stroke-linejoin="bevel">
<!-- files · a page lifted off the stack · node apps/landing/scripts/assets/linefig.mjs -->
<path stroke-width=".75" fill="#FFFFFF" d="M259.67 215.41L259.67 211.01L168.3 263.76L168.3 268.16Z"/>
<path stroke-width=".75" fill="#FFFFFF" d="M36.33 191.96L168.3 268.16L168.3 263.76L36.33 187.56Z"/>
<path stroke-width=".75" fill="#FFFFFF" d="M127.7 134.81L259.67 211.01L168.3 263.76L36.33 187.56Z"/>
<path stroke-width=".75" fill="#FFFFFF" d="M259.67 202.22L259.67 197.82L168.3 250.57L168.3 254.97Z"/>
<path stroke-width=".75" fill="#FFFFFF" d="M36.33 178.77L168.3 254.97L168.3 250.57L36.33 174.38Z"/>
<path stroke-width=".75" fill="#FFFFFF" d="M127.7 121.62L259.67 197.82L168.3 250.57L36.33 174.38Z"/>
<path stroke-width=".75" fill="#FFFFFF" d="M259.67 189.03L259.67 184.63L168.3 237.39L168.3 241.78Z"/>
<path stroke-width=".75" fill="#FFFFFF" d="M36.33 165.58L168.3 241.78L168.3 237.39L36.33 161.19Z"/>
<path stroke-width=".75" fill="#FFFFFF" d="M127.7 108.44L259.67 184.63L168.3 237.39L36.33 161.19Z"/>
<path stroke-width="1.25" stroke-dasharray=".01 4" stroke-linecap="round" d="M127.7 108.44L127.7 32.24M36.33 161.19L36.33 84.99M168.3 237.39L168.3 161.19M259.67 184.63L259.67 108.44"/>
<path stroke-width=".75" fill="#FFFFFF" d="M259.67 108.44L259.67 104.04L168.3 156.79L168.3 161.19Z"/>
<path stroke-width=".75" fill="#FFFFFF" d="M36.33 84.99L168.3 161.19L168.3 156.79L36.33 80.59Z"/>
<path stroke-width=".75" fill="#FFFFFF" d="M127.7 27.84L259.67 104.04L168.3 156.79L36.33 80.59Z"/>
</svg>`,
    md: `<svg xmlns="http://www.w3.org/2000/svg" width="202" height="202" viewBox="0 0 202 202" fill="none" stroke="#161815" stroke-linejoin="bevel">
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
    sm: `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96" fill="none" stroke="#161815" stroke-linejoin="bevel">
<!-- files · a page lifted off the stack · node apps/landing/scripts/assets/linefig.mjs -->
<path stroke-width=".75" fill="#FFFFFF" d="M84.22 69.86L84.22 68.44L54.59 85.54L54.59 86.97Z"/>
<path stroke-width=".75" fill="#FFFFFF" d="M11.78 62.26L54.59 86.97L54.59 85.54L11.78 60.83Z"/>
<path stroke-width=".75" fill="#FFFFFF" d="M41.41 43.72L84.22 68.44L54.59 85.54L11.78 60.83Z"/>
<path stroke-width=".75" fill="#FFFFFF" d="M84.22 65.58L84.22 64.16L54.59 81.27L54.59 82.69Z"/>
<path stroke-width=".75" fill="#FFFFFF" d="M11.78 57.98L54.59 82.69L54.59 81.27L11.78 56.55Z"/>
<path stroke-width=".75" fill="#FFFFFF" d="M41.41 39.45L84.22 64.16L54.59 81.27L11.78 56.55Z"/>
<path stroke-width=".75" fill="#FFFFFF" d="M84.22 61.31L84.22 59.88L54.59 76.99L54.59 78.42Z"/>
<path stroke-width=".75" fill="#FFFFFF" d="M11.78 53.7L54.59 78.42L54.59 76.99L11.78 52.28Z"/>
<path stroke-width=".75" fill="#FFFFFF" d="M41.41 35.17L84.22 59.88L54.59 76.99L11.78 52.28Z"/>
<path stroke-width="1.25" stroke-dasharray=".01 4" stroke-linecap="round" d="M41.41 35.17L41.41 10.46M11.78 52.28L11.78 27.56M54.59 76.99L54.59 52.28M84.22 59.88L84.22 35.17"/>
<path stroke-width=".75" fill="#FFFFFF" d="M84.22 35.17L84.22 33.74L54.59 50.85L54.59 52.28Z"/>
<path stroke-width=".75" fill="#FFFFFF" d="M11.78 27.56L54.59 52.28L54.59 50.85L11.78 26.14Z"/>
<path stroke-width=".75" fill="#FFFFFF" d="M41.41 9.03L84.22 33.74L54.59 50.85L11.78 26.14Z"/>
</svg>`,
  },
  resume: {
    lg: `<svg xmlns="http://www.w3.org/2000/svg" width="202" height="202" viewBox="0 0 202 202" fill="none" stroke="#161815" stroke-linejoin="bevel">
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
    md: `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160" fill="none" stroke="#161815" stroke-linejoin="bevel">
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
    sm: `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96" fill="none" stroke="#161815" stroke-linejoin="bevel">
<!-- resume · the ring keeps turning · node apps/landing/scripts/assets/linefig.mjs -->
<defs><mask id="lfc96-m" maskUnits="userSpaceOnUse" x="0" y="0" width="96" height="96"><rect width="96" height="96" fill="#fff"/><path fill="#000" stroke="none" d="M38.12 30.42L48 24.71L57.88 30.42L57.88 56.08L38.12 56.08Z"/></mask></defs>
<style>@keyframes lfc96{from{stroke-dashoffset:0}to{stroke-dashoffset:-100}}.lfc96{animation:lfc96 10.5s linear infinite}@media (prefers-reduced-motion:reduce){.lfc96{animation:none}}</style>
<path stroke-width=".75" stroke-opacity=".35" d="M8.08 56.08A39.92 23.05 0 0 1 48 33.03A39.92 23.05 0 0 1 87.92 56.08"/>
<path stroke-width=".75" fill="#FFFFFF" d="M57.88 83.64L57.88 30.42L48 36.12L48 89.35Z"/>
<path stroke-width=".75" fill="#FFFFFF" d="M38.12 83.64L48 89.35L48 36.12L38.12 30.42Z"/>
<path stroke-width=".75" fill="#FFFFFF" d="M48 24.71L57.88 30.42L48 36.12L38.12 30.42Z"/>
<path stroke-width="1.25" stroke-dasharray=".01 4" stroke-linecap="round" d="M48 30.42L48 1.9"/>
<path stroke-width=".75" stroke-opacity=".35" d="M87.92 56.08A39.92 23.05 0 0 1 48 79.13A39.92 23.05 0 0 1 8.08 56.08"/>
<g mask="url(#lfc96-m)"><path class="lfc96" pathLength="100" stroke-width="1.2" stroke-linecap="round" stroke-dasharray="2.6 97.4" stroke-dashoffset="-35.77" stroke-opacity="0.806" style="animation-delay:-1.092s" d="M48 33.03A39.92 23.05 0 0 1 82.57 67.6A39.92 23.05 0 0 1 13.43 67.6A39.92 23.05 0 0 1 48 33.03"/><path class="lfc96" pathLength="100" stroke-width="1.2" stroke-linecap="round" stroke-dasharray="5.2 94.8" stroke-dashoffset="-33.17" stroke-opacity="0.446" style="animation-delay:-0.819s" d="M48 33.03A39.92 23.05 0 0 1 82.57 67.6A39.92 23.05 0 0 1 13.43 67.6A39.92 23.05 0 0 1 48 33.03"/><path class="lfc96" pathLength="100" stroke-width="1.2" stroke-linecap="round" stroke-dasharray="7.8 92.2" stroke-dashoffset="-30.57" stroke-opacity="0.309" style="animation-delay:-0.546s" d="M48 33.03A39.92 23.05 0 0 1 82.57 67.6A39.92 23.05 0 0 1 13.43 67.6A39.92 23.05 0 0 1 48 33.03"/><path class="lfc96" pathLength="100" stroke-width="1.2" stroke-linecap="round" stroke-dasharray="10.4 89.6" stroke-dashoffset="-27.97" stroke-opacity="0.236" style="animation-delay:-0.273s" d="M48 33.03A39.92 23.05 0 0 1 82.57 67.6A39.92 23.05 0 0 1 13.43 67.6A39.92 23.05 0 0 1 48 33.03"/><path class="lfc96" pathLength="100" stroke-width="1.2" stroke-linecap="round" stroke-dasharray="13 87" stroke-dashoffset="-25.37" stroke-opacity="0.12" d="M48 33.03A39.92 23.05 0 0 1 82.57 67.6A39.92 23.05 0 0 1 13.43 67.6A39.92 23.05 0 0 1 48 33.03"/></g>
</svg>`,
  },
};

/**
 * One card's figure: all three sizes, the CSS shows the one that fits. Decorative: the card's label and line carry
 * the meaning.
 */
function figure(part: Part): string {
  const svgs = ROLES.map((role) =>
    FIGURES[part][role]
      .replace(/<!--[\s\S]*?-->\n?/, "")
      .replace(/<style>[\s\S]*?<\/style>\n?/, "")
      .replace("<svg ", `<svg class="v5-acc-svg v5-acc-svg--${role}" `),
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
    const wide = part === WIDE ? " v5-acc-card--wide" : "";
    return `<li class="v5-acc-card${wide}" data-part="${part}" data-rise="card">${figure(part)}<div class="v5-acc-text"><h3 class="v5-acc-label">${esc(card.label)}</h3><p class="v5-acc-line">${esc(card.line)}</p></div></li>`;
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
