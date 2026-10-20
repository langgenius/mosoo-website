// 5 Closing (BRIEF §4 row 5). v4d's closing (owner-approved at 9e92312: the serif two-line title and the setup
// prompt card on a grain field) on T1's closing plate (.v5-field--closing, 1120x480 / 342x472): the legend and the
// white card with the sentence and Copy sit on the plate itself (#130, committee 2026-10-21: GitBook's glass bezel
// around them is gone, so the closing is two layers, plate > card); below them the lime "Try mosoo" with Frame's glow
// and one line under the button. Styles: ./closing.css; slots and measurements: staging
// v5/sections/faq-closing/NOTES.md.
//
// Engines:
// - copy (../copy-prompt.ts, v4c's): .v5-closing-setup is the [data-product-ui] element that holds the [data-prompt]
//   sentence, the <button data-copy> with its [data-copy-label] and the polite [data-copy-status] region; the engine
//   finds the sentence and the region through button.closest("[data-product-ui]"), so the wrapper stays (without it
//   Copy would put an empty string on the clipboard and still say "Copied"; tests/home-copy-slots.test.mjs keeps the
//   three in it). It also keeps the legend's words object words in tools/budget.ts. Copy puts the sentence on the
//   clipboard and says so (label + live region, 1.6 s); if the clipboard refuses, the sentence is selected instead.
//   Without JS the button is hidden (../system.css) and the sentence is selectable text, and one click selects all of
//   it (user-select: all);
// - rise: the title's data-rise="block" / "title" / "line".

import type { HomeCopy, HomeLocale } from "../copy.ts";
import { LINKS } from "../copy.ts";
import { glyph } from "../kit/index.ts";
import { button, esc, twoTone } from "../ui.ts";

/**
 * The Copy button: the system's grey button (../system.css .v5-btn--grey, the hero's secondary too). Two faces share
 * one grid cell: a hidden one sized for the done state (check + "copied"), so the button never changes width when
 * the engine swaps the label and the sentence beside it never rewraps (in any locale), and the live one the engine
 * writes to. The hidden face is aria-hidden, so the name stays the label.
 */
function copyButton(idle: string, done: string): string {
  const check = glyph("check", "v5-closing-check");
  return `<button type="button" class="v5-btn v5-btn--grey v5-closing-copy" data-copy data-copied-label="${esc(done)}"><span class="v5-closing-face v5-closing-face--size" aria-hidden="true">${check}<span>${esc(done)}</span></span><span class="v5-closing-face">${check}<span data-copy-label>${esc(idle)}</span></span></button>`;
}

export function render(_locale: HomeLocale, copy: HomeCopy): string {
  const c = copy.closing;
  return `<section id="start" data-section="closing" class="v5-sec v5-closing" aria-labelledby="closing-title">
<div class="v5-wrap">
<div class="v5-closing-plate v5-field v5-field--closing">
<div data-rise="block"><h2 id="closing-title" class="v5-h2" data-rise="title">${twoTone(c.h2a, c.h2b, ' data-rise="line"')}</h2></div>
<div class="v5-closing-setup" data-product-ui>
<p class="v5-closing-legend">${esc(c.legend)}</p>
<div class="v5-closing-card">
<p class="v5-closing-prompt" data-prompt>${esc(c.prompt)}</p>
${copyButton(c.copy, c.copied)}
</div>
<span class="v5-sr" role="status" aria-live="polite" data-copy-status></span>
</div>
<div class="v5-actions v5-closing-actions">${button(LINKS.console, c.primary, "lime")}</div>
<p class="v5-closing-caption">${esc(c.caption)}</p>
</div>
</div>
</section>`;
}
