// The v5 motion system (BRIEF §3.4; tool T6). One init wires every engine by its data attributes; the API, the
// parameters with their sources, the CSS each engine expects and the reduced-motion / no-JS behaviour are in
// README.md next to this file.
//
//   <html data-damp>          damp-scroll.ts  damped wheel scrolling (Frame)
//   [data-rise]               rise.ts         title float (Frame) and card entrance (Intent)
//   [data-nav]                nav.ts          loose bar → floating glass bar, CTA growth, theme zones (ramp.design,
//                                             Save.design, savee.com, Ramp)
//   [data-stage]              stage.ts        sticky section → progress → data-step (CTRL)
//   [data-switch]             harness-switch.ts  one value at a time, rolling by scroll or time (a13n, v4a, v4c)
//   [data-footer]             footer.ts       links rise, brand rises from a seam, mark draws, replays (Intent)
//
// Every engine is a no-op when its elements are missing, and every one of them leaves the authored end state for
// no JS and for prefers-reduced-motion.

import { initDampScroll } from "./damp-scroll.ts";
import { initFooter } from "./footer.ts";
import { initHarnessSwitch } from "./harness-switch.ts";
import { initNav } from "./nav.ts";
import { initRise } from "./rise.ts";
import { initStage } from "./stage.ts";

export { initDampScroll, initFooter, initHarnessSwitch, initNav, initRise, initStage };

/** Starts every engine declared in root. Returns one cleanup for all of them. */
export function initMotion(root: ParentNode = document): () => void {
  const stops = [
    document.documentElement.hasAttribute("data-damp") ? initDampScroll() : () => {},
    initNav(root),
    initStage(root),
    initHarnessSwitch(root),
    initRise(root),
    initFooter(root),
  ];
  return () => {
    for (const stop of stops) {
      stop();
    }
  };
}
