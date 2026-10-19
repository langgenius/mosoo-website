// 1 Hero (BRIEF §4 row 1). STUB from the system agent: the hero + stage agent replaces the body and fills
// ./hero.css. Keep the wrapper (id, data-section, aria-labelledby) and the engine declarations listed in
// ./README.md; the system components below (two-tone H1, keycap sentence, lime + ink buttons) come from
// ../system.css and ../ui.ts.

import type { HomeCopy, HomeLocale } from "../copy.ts";
import { LINKS, localeLinks } from "../copy.ts";
import { button, esc, keycap, stubLabel, twoTone } from "../ui.ts";

export function render(locale: HomeLocale, copy: HomeCopy): string {
  const h = copy.hero;
  const links = localeLinks(locale);
  const [k1, k2, k3, k4] = h.harnesses.map(keycap);
  // "{pre} [1] [2] [3] {or} [4] {post}": the keycaps sit on the sentence's baseline (.v5-keys sets the pitch).
  const lead = `${esc(h.lead.pre)} ${k1} ${k2} ${k3} ${esc(h.lead.or)} ${k4} ${esc(h.lead.post)}`;
  return `<section id="hero" data-section="hero" class="v5-sec v5-hero v5-stub" aria-labelledby="hero-title">
<div class="v5-wrap v5-stub-hero">
<h1 id="hero-title" class="v5-h1" data-rise-load="title">${twoTone(h.h1a, h.h1b, ' data-rise-load="line"')}</h1>
<p class="v5-lead v5-keys" data-rise-load="fade">${lead}</p>
<div class="v5-actions" data-rise-load="fade">${button(LINKS.console, h.primary, "lime", " data-nav-cta-watch")}${button(links.quickstart, h.secondary, "ink")}</div>
<div class="v5-stub-box v5-stub-board">${stubLabel("hero board · T1 plate + T2 line field + T4 Session (call state) · hero + stage agent")}</div>
</div>
</section>`;
}
