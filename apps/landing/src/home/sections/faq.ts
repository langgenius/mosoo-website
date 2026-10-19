// 4 FAQ (BRIEF §4 row 4). v4b's two columns (U16: renderPaperFaq, the title alone on the left, the rows on the
// right), Enter Pro's indicator (REVIEW-v4 G7: a 6px hollow dot at the row's end that fills and moves 10px in while
// the question moves 10px out), Frame's open and close (350 ms ease, the answer rising from 50% of its own height),
// 1px ink-8% rules. No cards, no corner dots. Styles: ./faq.css; staging v5/sections/faq-closing/NOTES.md.
//
// The contract the SEO tests read (tests/site-seo.test.mjs; sections/README.md):
// - the section keeps id="faq" (the FAQPage JSON-LD's @id fragment) and data-section="faq";
// - one native <details name="faq"> per item, the first one open, so the browser keeps one open at a time, with
//   keyboard, find-in-page and no-JS behaviour built in; the question is the <summary>'s text, the answer the rest
//   of the <details> (in the DOM even when closed); the dot is aria-hidden and has no text;
// - the items are copy/faq.json verbatim, the same strings as the FAQPage JSON-LD and llms.txt "Direct answers".

import type { HomeCopy, HomeLocale } from "../copy.ts";
import { esc, twoTone } from "../ui.ts";

export function render(_locale: HomeLocale, copy: HomeCopy): string {
  const f = copy.faq;
  const rows = f.items
    .map(
      (item, i) =>
        `<details class="v5-faq-item" name="faq"${i === 0 ? " open" : ""}><summary class="v5-faq-q"><span class="v5-faq-qt">${esc(item.q)}</span><span class="v5-faq-dot" aria-hidden="true"></span></summary><div class="v5-faq-a"><p>${esc(item.a)}</p></div></details>`,
    )
    .join("\n");
  return `<section id="faq" data-section="faq" class="v5-sec v5-faq" aria-labelledby="faq-title">
<div class="v5-wrap v5-faq-grid">
<div class="v5-faq-side" data-rise="block"><h2 id="faq-title" class="v5-h2" data-rise="title">${twoTone(f.a, f.b, ' data-rise="line"')}</h2></div>
<div class="v5-faq-list">
${rows}
</div>
</div>
</section>`;
}
