// 5 Closing (BRIEF §4 row 5). STUB from the system agent: the faq + closing agent replaces the body and fills
// ./closing.css (the T1 closing plate, the setup-prompt card with its 8px glass edge). Wired already:
// - the copy engine (../copy-prompt.ts): a <button data-copy data-copied-label="…"> with a [data-copy-label] span,
//   inside the same [data-product-ui] card as the [data-prompt] text and a polite [data-copy-status] region;
//   without JS the button is hidden (../system.css) and the sentence stays selectable text;
// - the title's data-rise="block" / "title" / "line".

import type { HomeCopy, HomeLocale } from "../copy.ts";
import { LINKS } from "../copy.ts";
import { button, esc, stubLabel, twoTone } from "../ui.ts";

export function render(_locale: HomeLocale, copy: HomeCopy): string {
  const c = copy.closing;
  return `<section id="start" data-section="closing" class="v5-sec v5-closing v5-stub" aria-labelledby="closing-title">
<div class="v5-wrap v5-stub-closing">
${stubLabel("closing · T1 closing plate, setup-prompt card with an 8px glass edge · faq + closing agent")}
<div data-rise="block"><h2 id="closing-title" class="v5-h2" data-rise="title">${twoTone(c.h2a, c.h2b, ' data-rise="line"')}</h2></div>
<div class="v5-stub-prompt" data-product-ui>
<p class="v5-stub-legend">${esc(c.legend)}</p>
<p class="v5-stub-prompt-line"><span data-prompt>${esc(c.prompt)}</span></p>
<button type="button" class="v5-btn v5-btn--ink" data-copy data-copied-label="${esc(c.copied)}"><span data-copy-label>${esc(c.copy)}</span></button>
<span class="v5-sr" data-copy-status aria-live="polite"></span>
</div>
<div class="v5-actions">${button(LINKS.console, c.primary, "lime")}</div>
<p class="v5-stub-caption">${esc(c.caption)}</p>
</div>
</section>`;
}
