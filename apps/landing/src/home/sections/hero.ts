// 1 Hero (staging production/v5/BRIEF.md §4 row 1). Styles: ./hero.css; copy: ../copy/hero.json.
//
// v4d's centred first screen (9e92312 d-object.css .d-hero / .d-h1 / .d-lead / .d-actions): the two-tone serif H1
// (v4a's use: second line in ink-3), one lead sentence with the four harnesses drawn as Frame keycaps on its
// baseline, the lime primary CTA (Frame glow) and the secondary CTA as a 1px ink line. The plate under it is the stage's
// (./stage.ts): the first screen shows its first state (Call), and the same plate pins and changes state as the
// reader scrolls, so the hero ends at the CTA row.
//
// Keycaps carry no runtime glyph: staging v5/sections/hero-stage/NOTES.md §2 has the with / without screenshots
// and the reasons. KEYCAP_GLYPHS = true draws the 12px ink glyph (src/home/runtime-glyphs.ts) before each name.
//
// Engines: the H1 floats on first paint (data-rise-load="title", its second line "line"), the lead and the CTA row
// fade in ("fade"), CSS only (src/effects/v5/README.md "Rise"); the lime CTA is the nav's watch target
// (data-nav-cta-watch: the floating bar grows its own CTA once this one has scrolled under it).

import type { HarnessId, HomeCopy, HomeLocale } from "../copy.ts";
import { HARNESS_IDS, LINKS, localeLinks } from "../copy.ts";
import { RUNTIME_GLYPHS } from "../runtime-glyphs.ts";
import { button, esc, keycap, twoTone } from "../ui.ts";

const KEYCAP_GLYPHS = false;

/** A keycap with the harness's 12px ink glyph before the name (the T7 inline variant). */
function glyphKeycap(id: HarnessId, label: string): string {
  const glyph = RUNTIME_GLYPHS.find((g) => g.id === id);
  if (!glyph) throw new Error(`unknown runtime glyph ${id}`);
  const svg = `<svg class="v5-hero-kc-g" viewBox="${glyph.viewBox}" fill="currentColor" fill-rule="evenodd" aria-hidden="true" focusable="false">${glyph.body}</svg>`;
  return `<span class="v5-kc v5-hero-kc--g" data-product-ui translate="no">${svg}${esc(label)}</span>`;
}

export function render(locale: HomeLocale, copy: HomeCopy): string {
  const h = copy.hero;
  const links = localeLinks(locale);
  const keys = h.harnesses.map((name, i) => {
    const id = HARNESS_IDS[i];
    return KEYCAP_GLYPHS && id ? glyphKeycap(id, name) : keycap(name);
  });
  const [k1, k2, k3, k4] = keys;
  // "{pre} [1] [2] [3] {or} [4] {post}": the keycaps sit on the sentence's baseline (.v5-keys sets the pitch).
  const lead = `${esc(h.lead.pre)} ${k1} ${k2} ${k3} ${esc(h.lead.or)} ${k4} ${esc(h.lead.post)}`;
  return `<section id="hero" data-section="hero" class="v5-sec v5-hero" aria-labelledby="hero-title">
<div class="v5-wrap v5-hero-in">
<h1 id="hero-title" class="v5-h1 v5-hero-h1" data-rise-load="title">${twoTone(h.h1a, h.h1b, ' data-rise-load="line"')}</h1>
<p class="v5-lead v5-keys v5-hero-lead" data-rise-load="fade">${lead}</p>
<div class="v5-actions v5-hero-actions" data-rise-load="fade">${button(LINKS.console, h.primary, "lime", " data-nav-cta-watch")}${button(links.quickstart, h.secondary, "line")}</div>
</div>
</section>`;
}
