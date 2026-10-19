// 0 Nav (BRIEF §4 row 0; staging production/v5/TOOLS-REVIEW.md T6). The skip link, then one header that the nav
// engine (src/effects/v5/nav.ts) morphs with the scroll: a loose full-width bar at the top (ink logo, Docs,
// Use cases, GitHub, Sign in) into a centred floating glass bar, where the lime "Try mosoo" grows in once the
// hero's lime CTA ([data-nav-cta-watch]) has gone behind the bar. Over [data-theme-zone="accent"] the glass
// turns lime and the CTA turns ink at once. The look is ./nav.css; the morph range is set at runtime
// (src/home/effects.ts: min(400px, 45vh)).
// Without JS the bar stays in the page at the top with the CTA shown; under reduced motion it is the float bar.

import { BRAND_LETTERS, BRAND_MARK } from "../../shared/ui/brand-v5.generated.ts";
import type { HomeCopy, HomeLocale } from "../copy.ts";
import { LINKS, localeLinks } from "../copy.ts";
import { esc } from "../ui.ts";

const r3 = (n: number): number => Math.round(n * 1000) / 1000;

/**
 * The whole lockup (mark + letters) in currentColor: public/brand/v5/logo-nav.svg's geometry, inlined from the
 * generated path data. The bar is drawn as its own centre line at the bar's thickness, which is exactly the
 * lockup's bar (scripts/assets/brand-v5.mjs barLine).
 */
export function lockupSvg(className: string): string {
  const [, , , height] = BRAND_MARK.vb;
  const [lettersX, , lettersW] = BRAND_LETTERS.vb;
  const width = r3(lettersX + lettersW);
  const letters = BRAND_LETTERS.d.map((d) => `<path d="${d}"/>`).join("");
  return (
    `<svg class="${className}" viewBox="0 0 ${width} ${height}" fill="currentColor" aria-hidden="true" focusable="false">` +
    `<path d="${BRAND_MARK.fill}"/>` +
    `<path d="${BRAND_MARK.bar}" fill="none" stroke="currentColor" stroke-width="${BRAND_MARK.stroke}"/>` +
    `${letters}</svg>`
  );
}

export function render(locale: HomeLocale, copy: HomeCopy): string {
  const t = copy.nav;
  const links = localeLinks(locale);
  return `<a class="v5-skip" href="#main">${esc(t.skip)}</a>
<header class="v5-nav" data-nav>
<a class="v5-nav-brand" href="${links.home}" aria-label="${esc(t.home)}">${lockupSvg("v5-nav-logo")}</a>
<div class="v5-nav-end">
<nav class="v5-nav-links" aria-label="${esc(t.label)}">
<a href="${links.docs}">${esc(t.docs)}</a>
<a class="v5-nav-wide" href="${links.useCases}">${esc(t.useCases)}</a>
<a class="v5-nav-wide" href="${LINKS.github}" translate="no">${esc(t.github)}</a>
<a href="${LINKS.signIn}">${esc(t.signIn)}</a>
</nav>
<span class="v5-nav-cta" data-nav-cta><a class="v5-btn v5-btn--lime" href="${LINKS.console}">${esc(t.cta)}</a></span>
</div>
</header>`;
}
