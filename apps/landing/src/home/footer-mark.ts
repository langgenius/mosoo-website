// T5 variant A on the page (staging production/v5/TOOLS-REVIEW.md, T5): while the footer mark rises out of the
// seam, its outline draws itself from the bottom centre and closes at the top, the bar draws from its centre, and
// then ink fills the block from the ground up; on desktop, hovering the brand row retracts the mark into the same
// points and draws it again (Intent's spark hover, staging refs/intent/v5/STUDY.md §1).
//
// Timeline: T5's (staging v5/tools/brand/scripts/timeline.ts; NOTES §2.2), relative to the mark's rise:
//   .bm-block  +0 ms    1000 ms  cubic-bezier(.33, 1, .68, 1)   Intent's hook curve (.001, .41, 0, 1) suits its
//   .bm-bar    +100 ms   600 ms  cubic-bezier(.25, 1, .5, 1)    100px strokes, not this 824px outline (NOTES §4.2),
//   .bm-fill   +800 ms   800 ms  cubic-bezier(.65, 0, .35, 1)   so the engine's data-draw "trim" is not used here
// The strokes carry pathLength="1"; the draw is stroke-dasharray 0 1 / offset -.5 -> 1 0 / 0 (STUDY §1.7), the fill
// clip-path inset(100% 0 0 0) -> inset(0) on the fill box (without fill-box Chrome measures it on the viewBox).
//
// The footer engine (src/effects/v5/footer.ts) owns the rise, the trigger, the replay and focus. This module only
// follows its data-footer-state: on "in" it starts the draw with the delay of the mark's own rise animation, so the
// two stay in step at any scroll speed; on "wait" (re-armed out of view) it drops its animations. Nothing is hidden
// by default, so no JS, reduced motion and a footer already in view at load all show the solid mark.

const EASE_BLOCK = "cubic-bezier(0.33, 1, 0.68, 1)";
const EASE_BAR = "cubic-bezier(0.25, 1, 0.5, 1)";
const EASE_FILL = "cubic-bezier(0.65, 0, 0.35, 1)";
const RETRACT_MS = 300;

const STROKE_OFF: Keyframe = { strokeDasharray: "0 1", strokeDashoffset: "-0.5" };
const STROKE_ON: Keyframe = { strokeDasharray: "1 0", strokeDashoffset: "0" };
const FILL_OFF: Keyframe = { clipPath: "inset(100% 0 0 0) fill-box" };
const FILL_ON: Keyframe = { clipPath: "inset(0 0 0 0) fill-box" };

/** Wires the T5 draw to the first [data-footer] in root. Returns a cleanup. */
export function initFooterMark(root: ParentNode = document): () => void {
  const footer = root.querySelector<HTMLElement>("[data-footer]");
  const brand = footer?.querySelector<HTMLElement>("[data-footer-brand]");
  const mark = footer?.querySelector<HTMLElement>("[data-footer-rise]");
  const blockPath = mark?.querySelector<SVGElement>(".bm-block");
  const barPath = mark?.querySelector<SVGElement>(".bm-bar");
  const fillPath = mark?.querySelector<SVGElement>(".bm-fill");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (!footer || !brand || !mark || !blockPath || !barPath || !fillPath || reduce.matches) {
    return () => {};
  }
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
  const running: Animation[] = [];
  let state = footer.dataset["footerState"];

  const drop = (): void => {
    for (const animation of running.splice(0)) {
      animation.cancel();
    }
  };
  const busy = (): boolean => running.some((animation) => animation.playState === "running");

  const reveal = (delay: number): void => {
    drop();
    const at = (offset: number, duration: number, easing: string): KeyframeAnimationOptions => ({
      delay: delay + offset,
      duration,
      easing,
      fill: "backwards",
    });
    running.push(
      blockPath.animate([STROKE_OFF, STROKE_ON], at(0, 1000, EASE_BLOCK)),
      barPath.animate([STROKE_OFF, STROKE_ON], at(100, 600, EASE_BAR)),
      fillPath.animate([FILL_OFF, FILL_ON], at(800, 800, EASE_FILL)),
    );
  };

  // Hover: retract into the draw's own start points (block: bottom centre, bar: centre; the ink drains to the
  // ground) in 300 ms, then the reveal's timeline. One animation per path, so nothing jumps between the two.
  const redraw = (): void => {
    drop();
    const k = (offset: number, total: number): number => offset / total;
    const block1 = RETRACT_MS + 1000;
    const bar1 = RETRACT_MS + 100 + 600;
    const fill1 = RETRACT_MS + 800 + 800;
    running.push(
      blockPath.animate(
        [
          { ...STROKE_ON, offset: 0, easing: EASE_FILL },
          { ...STROKE_OFF, offset: k(RETRACT_MS, block1), easing: EASE_BLOCK },
          { ...STROKE_ON, offset: 1 },
        ],
        { duration: block1 },
      ),
      barPath.animate(
        [
          { ...STROKE_ON, offset: 0, easing: EASE_FILL },
          { ...STROKE_OFF, offset: k(RETRACT_MS, bar1) },
          { ...STROKE_OFF, offset: k(RETRACT_MS + 100, bar1), easing: EASE_BAR },
          { ...STROKE_ON, offset: 1 },
        ],
        { duration: bar1 },
      ),
      fillPath.animate(
        [
          { ...FILL_ON, offset: 0, easing: EASE_FILL },
          { ...FILL_OFF, offset: k(RETRACT_MS, fill1) },
          { ...FILL_OFF, offset: k(RETRACT_MS + 800, fill1), easing: EASE_FILL },
          { ...FILL_ON, offset: 1 },
        ],
        { duration: fill1 },
      ),
    );
  };

  const follow = new MutationObserver(() => {
    const next = footer.dataset["footerState"];
    if (next === state) {
      return;
    }
    state = next;
    if (next === "wait") {
      drop();
    } else if (next === "in") {
      // The engine has just started the mark's rise (fill: backwards, delayed so the brand trails the links). A
      // reveal without a running rise (focus, reduced motion, already in view) keeps the solid end state.
      const rise = mark.getAnimations().find((animation) => animation.playState === "running");
      if (rise) {
        reveal(Number(rise.effect?.getTiming().delay ?? 0));
      }
    }
  });
  follow.observe(footer, { attributes: true, attributeFilter: ["data-footer-state"] });

  const onEnter = (): void => {
    const rising = mark.getAnimations().some((animation) => animation.playState === "running");
    if (fine.matches && !reduce.matches && state === "in" && !rising && !busy()) {
      redraw();
    }
  };
  const onReduce = (): void => {
    if (reduce.matches) {
      for (const animation of running.splice(0)) {
        animation.finish();
      }
    }
  };
  brand.addEventListener("pointerenter", onEnter);
  reduce.addEventListener("change", onReduce);

  return () => {
    follow.disconnect();
    brand.removeEventListener("pointerenter", onEnter);
    reduce.removeEventListener("change", onReduce);
    drop();
  };
}
