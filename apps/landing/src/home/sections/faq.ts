// 4 FAQ (BRIEF §4 row 4). STUB from the system agent: the faq + closing agent replaces the body and fills ./faq.css
// (v4b's two columns, Frame's 350 ms answer, the + turning 180°). The contract the SEO tests read:
// - the section keeps id="faq" (the FAQPage JSON-LD's @id fragment) and data-section="faq";
// - one native <details name="faq"> per item, the first one open; inside it the question is the <summary>'s text
//   and the answer is the rest of the <details> (in the DOM even when closed). Decorations in the summary are
//   aria-hidden and carry no text.

import type { HomeCopy, HomeLocale } from "../copy.ts";
import { esc, stubLabel, twoTone } from "../ui.ts";

export function render(_locale: HomeLocale, copy: HomeCopy): string {
  const f = copy.faq;
  const items = f.items
    .map(
      (item, i) =>
        `<details name="faq"${i === 0 ? " open" : ""}><summary>${esc(item.q)}</summary><p>${esc(item.a)}</p></details>`,
    )
    .join("\n");
  return `<section id="faq" data-section="faq" class="v5-sec v5-faq v5-stub" aria-labelledby="faq-title">
<div class="v5-wrap v5-stub-faq">
${stubLabel("faq · two columns, title left, accordion right · faq + closing agent")}
<div data-rise="block"><h2 id="faq-title" class="v5-h2" data-rise="title">${twoTone(f.a, f.b, ' data-rise="line"')}</h2></div>
<div class="v5-stub-faq-list">
${items}
</div>
</div>
</section>`;
}
