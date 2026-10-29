// The home's motion, started by src/main.tsx once the static HTML is in the DOM. The engines are T6's
// (src/effects/v5/, README.md there is the API) plus T2's line field and two small home modules; each reads its
// data-* declarations and is a no-op when they are missing, so a page without that part costs nothing.
//
//   <html data-damp>         damped wheel scrolling           src/effects/v5/damp-scroll.ts
//   [data-nav]               nav morph, CTA, theme zones      src/effects/v5/nav.ts (range: min(400px, 45vh))
//   [data-stage]             pinned stage, data-step          src/effects/v5/stage.ts
//   [data-portal]            the mark's window opens a screen src/effects/v5/portal.ts (the spec table)
//   [data-switch]            one harness at a time, rolling   src/effects/v5/harness-switch.ts (the spec table)
//   [data-rise]              title rise, card entrance        src/effects/v5/rise.ts
//   [data-footer]            links, brand from the seam       src/effects/v5/footer.ts
//   .bm-* in the footer mark draw, ink fill, hover redraw    ./footer-mark.ts (T5 variant A)
//   [data-linefield]         line field canvas, 4.5 s runs    src/effects/v5/linefield.ts (T2)
//   [data-play-for]          short motion bursts (the comet)  src/effects/v5/play-for.ts
//   [data-copy]              copy the setup prompt            ./copy-prompt.ts (v4c)
//   [data-v5-home]           Halloween accents, date-gated    ./halloween/halloween.ts (seasonal)
//
// The same list as initMotion() in src/effects/v5/index.ts, except that the nav gets its range first
// (TOOLS-REVIEW T6: min(400px, 45vh); the engine reads data-nav-range once, at init).

import {
  initDampScroll,
  initFooter,
  initHarnessSwitch,
  initNav,
  initPortal,
  initRise,
  initStage,
} from "../effects/v5/index.ts";
import { initLinefields } from "../effects/v5/linefield.ts";
import { initPlayFor } from "../effects/v5/play-for.ts";
import { initCopyPrompt } from "./copy-prompt.ts";
import { initFooterMark } from "./footer-mark.ts";
import { initHalloween } from "./halloween/halloween.ts";

const NAV_RANGE_MAX_PX = 400;
const NAV_RANGE_VIEWPORT = 0.45;

/**
 * min(400px, 45vh). The height is the initial containing block's (documentElement.clientHeight), which a phone's
 * collapsing URL bar does not change, so the morph does not jump mid-scroll.
 */
function navRange(): number {
  return Math.round(Math.min(NAV_RANGE_MAX_PX, NAV_RANGE_VIEWPORT * document.documentElement.clientHeight));
}

/** initNav with the range written first, and started again when a resize changes the range. */
function initNavWithRange(root: ParentNode): () => void {
  const nav = root.querySelector<HTMLElement>("[data-nav]");
  if (!nav) {
    return () => {};
  }
  let range = navRange();
  nav.dataset["navRange"] = String(range);
  let stop = initNav(root);
  let timer = 0;
  const onResize = (): void => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      const next = navRange();
      if (next !== range) {
        range = next;
        stop();
        nav.dataset["navRange"] = String(range);
        stop = initNav(root);
      }
    }, 150);
  };
  window.addEventListener("resize", onResize, { passive: true });
  return () => {
    window.clearTimeout(timer);
    window.removeEventListener("resize", onResize);
    stop();
  };
}

/** Starts every effect declared in root. Returns one cleanup. */
export function initHomeEffects(root: ParentNode = document): () => void {
  const stops = [
    document.documentElement.hasAttribute("data-damp") ? initDampScroll() : () => {},
    initNavWithRange(root),
    initStage(root), // before initRise: the rise engine reads the pinned stage's layout
    initPortal(root), // also before initRise: a live host is taller, and moves everything below it
    initHarnessSwitch(root), // after the stage and the portal: its scroll driver reads their pinned layout
    initRise(root),
    initFooter(root),
    initFooterMark(root), // after initFooter: it follows the state the footer engine writes
    initLinefields(root),
    initPlayFor(root),
    initCopyPrompt(root),
    initHalloween(root),
  ];
  return () => {
    for (const stop of stops) {
      stop();
    }
  };
}
