// 1 Hero (staging production/v5/BRIEF.md §4 row 1). Styles: ./hero.css; copy: ../copy/hero.json.
//
// v4d's centred first screen (9e92312 d-object.css .d-hero / .d-h1 / .d-lead / .d-actions): the two-tone serif H1
// (v4a's use: second line in ink-3), one lead sentence that names the four harnesses in its own words, the lime
// primary CTA (Frame glow) and the grey secondary. The plate under it is the stage's (./stage.ts): the first screen
// shows its first state (laptop: the laptop card and the Session card, row for row; round 3b), and the same plate
// pins and changes state as the reader scrolls, so the hero ends at the CTA row.
//
// The names are plain text (ui.ts nameList: Hanken 500 ink, commas, "or"), not keycaps, and carry no glyph tile
// (O1, committee 2026-10-21, staging committee/PLAN.md §3 1-2: the outlined keycaps, the outlined secondary and the
// lone Call tab were the owner's "线框态" of 22:28; tiles stay in the lists, the spec table and the footer, not in the
// sentence). Any lead copy fits: "{pre} {names} {post}", the names joined in the locale's way.
//
// Engines: the H1 floats on first paint (data-rise-load="title", its second line "line"), the lead and the CTA row
// fade in ("fade"), CSS only (src/effects/v5/README.md "Rise"); the lime CTA is the nav's watch target
// (data-nav-cta-watch: the floating bar grows its own CTA once this one has scrolled under it).
//
// Above the H1, the announcement (owner 2026-10-20 17:15: the NEW pill must stay; 21:57: the product's name in
// lowercase, 「mosoo computer 一律小写」): one centred link, the lime New chip, the line ("mosoo computer is live") and
// a drawn arrow; same tab to computer.mosoo.ai, as production's (origin/main routes/login/landing/hero.tsx L59-71).
// It fades in with the lead (data-rise-load="fade"); it is site chrome, not the hero's copy, so data-budget="chrome"
// keeps it out of tools/budget.ts's word counts.

import type { HomeCopy, HomeLocale } from "../copy.ts";
import { LINKS, localeLinks } from "../copy.ts";
import { button, esc, nameList, twoTone } from "../ui.ts";

/** The announcement's arrow: a 1.3px line, not a font's own → (it nudges right on hover, hero.css). */
const ARROW =
  '<svg class="v5-hero-news-arrow" viewBox="0 0 12 12" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M2 6h8M6.5 2.5L10 6l-3.5 3.5"/></svg>';

/** zh / ja set no space after their own punctuation (a pre that ends in 「，」 runs into the first name); a Latin word
 *  keeps one. */
const CJK_STOP = /[，、。：；]$/;

export function render(locale: HomeLocale, copy: HomeCopy): string {
  const h = copy.hero;
  const links = localeLinks(locale);
  const cjk = locale !== "en";
  // "{pre} {names} {post}": "Set up the same OpenAI Codex, Claude Agent SDK, OpenCode or Pi agent behind one API."
  const pre = esc(h.lead.pre);
  const lead = `${pre}${cjk && CJK_STOP.test(h.lead.pre) ? "" : " "}${nameList(h.harnesses, h.lead.or, cjk)} ${esc(h.lead.post)}`;
  return `<section id="hero" data-section="hero" class="v5-sec v5-hero" aria-labelledby="hero-title">
<div class="v5-wrap v5-hero-in">
<a class="v5-hero-news" href="${LINKS.computer}" data-budget="chrome" data-rise-load="fade"><span class="v5-new">${esc(h.news.tag)}</span> <span class="v5-hero-news-t">${esc(h.news.text)}</span>${ARROW}</a>
<h1 id="hero-title" class="v5-h1 v5-hero-h1" data-rise-load="title">${twoTone(h.h1a, h.h1b, ' data-rise-load="line"')}</h1>
<p class="v5-lead v5-hero-lead" data-rise-load="fade">${lead}</p>
<div class="v5-actions v5-hero-actions" data-rise-load="fade">${button(LINKS.console, h.primary, "lime", " data-nav-cta-watch")}${button(links.quickstart, h.secondary, "grey")}</div>
</div>
</section>`;
}
