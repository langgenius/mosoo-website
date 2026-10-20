// The v5 home as static HTML, the single source of the page: scripts/landing-home.mjs writes it into /en, /zh and
// /ja at build time, and src/main.tsx renders the same string in dev (the dev server's index.html has no static
// markup). The page works without JavaScript; src/home/effects.ts only adds motion.
//
// renderHome() is the frame and the section order (owned by the system / integrator agents); every section is a
// module in ./sections/ with render(locale, copy) -> one root element, its copy in ./copy/<section>.json and its
// styles in ./sections/<section>.css. The contract (data attributes, CSS scope, what a module may import) is
// ./sections/README.md. Erasable TypeScript, relative imports only, no DOM: Node imports this file as is.

import type { HomeLocale } from "./copy.ts";
import { HOME_COPY } from "./copy.ts";
import * as accent from "./sections/accent.ts";
import * as closing from "./sections/closing.ts";
import * as faq from "./sections/faq.ts";
import * as footer from "./sections/footer.ts";
import * as hero from "./sections/hero.ts";
import * as nav from "./sections/nav.ts";
import * as spec from "./sections/spec.ts";
import * as stage from "./sections/stage.ts";

/** The content sections in page order (BRIEF §4; the spec table since the 2026-10-20 graft): hero, stage, the spec
 *  table, the full lime screen, FAQ, closing. */
export const SECTIONS = ["hero", "stage", "spec", "accent", "faq", "closing"] as const;

const MAIN = [hero, stage, spec, accent, faq, closing];

/** The whole home body (inside #root): skip link, nav, the paper with the six sections, the footer. */
export function renderHome(locale: HomeLocale): string {
  const copy = HOME_COPY[locale];
  return `<div class="v5" data-v5-home>
${nav.render(locale, copy)}
<div class="v5-paper">
<main id="main" tabindex="-1">
${MAIN.map((section) => section.render(locale, copy)).join("\n")}
</main>
</div>
${footer.render(locale, copy)}
</div>`;
}
