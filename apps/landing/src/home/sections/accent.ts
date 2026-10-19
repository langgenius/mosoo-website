// 3 The full lime screen (BRIEF §4 row 3). STUB from the system agent: the accent agent replaces the body and fills
// ./accent.css (Frame's hard edge, the solid stretch of at least one screen, the long fade back to white, the
// five white cards with the T3 figures). Kept here because the engines need them:
// - data-theme-zone="accent" on the lime element (not on the white gap before it): the nav turns its glass lime
//   and its CTA ink while that box is under the bar's centre line;
// - the title wrapper data-rise="block", the H2 data-rise="title", its second line data-rise="line", and each
//   card data-rise="card".
// .v5-on-lime (../system.css) sets the on-lime tokens: ink text, the second line at ink 70%, no lime buttons.

import type { HomeCopy, HomeLocale } from "../copy.ts";
import { esc, stubLabel, tabLabel, twoTone } from "../ui.ts";

const FIGURES = ["harness", "model-key", "sandbox", "files", "resume"];

export function render(_locale: HomeLocale, copy: HomeCopy): string {
  const a = copy.accent;
  const cards = a.cards
    .map(
      (card, i) =>
        `<li class="v5-stub-card" data-rise="card">${stubLabel(`card ${i + 1} · T3 figure ${FIGURES[i] ?? ""}-202.svg`)}<p class="v5-stub-card-label">${esc(card.label)}</p><p>${esc(card.line)}</p></li>`,
    )
    .join("\n");
  return `<section id="session" data-section="accent" class="v5-sec v5-accent v5-stub" aria-labelledby="accent-title">
<div class="v5-wrap v5-stub-gap">
${tabLabel(a.tab)}
<h2 class="v5-h2 v5-h2--xl">${esc(a.gap)}</h2>
</div>
<div class="v5-stub-lime v5-on-lime" data-theme-zone="accent">
<div class="v5-wrap">
${stubLabel("full lime screen · solid >= 100svh + 40px, then the fade · accent agent")}
<div data-rise="block"><h2 id="accent-title" class="v5-h2 v5-h2--lg" data-rise="title">${twoTone(a.h2a, a.h2b, ' data-rise="line"')}</h2></div>
<p class="v5-stub-sub">${esc(a.sub)}</p>
<ul class="v5-stub-cards">
${cards}
</ul>
</div>
</div>
</section>`;
}
