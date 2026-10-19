// U01 (UI-FORMS §c U01): a two-line sentence fills with ink as it scrolls
// through the screen, like Ploy's question (refs/devices/crops/
// ploy-wordfill-midscroll.jpg). Ploy paints a gradient through
// background-clip:text; here each line carries an aria-hidden ink copy over a
// pale base and only that copy's clip-path moves, left to right, line 1 then
// line 2. Start: the block's top at 85% of the viewport; end: its centre at
// 55%, so the sentence is whole by the time it reaches the middle of the
// screen (Ploy's range ended later and left "The Session st|ays." half-filled
// where people stop to read; review P2-2 / YC P1-3). No JavaScript or reduced
// motion: the base stays full ink, which is the end state.
import { clamp01, prefersReducedMotion, registerSeek } from "./frame";

export function mountWordFill(root: HTMLElement): void {
  const inks = [...root.querySelectorAll<HTMLElement>("[data-fill-ink]")];
  if (inks.length === 0 || prefersReducedMotion()) {
    return;
  }

  const render = (progress: number): void => {
    inks.forEach((ink, i) => {
      const line = clamp01(progress * inks.length - i);
      ink.style.clipPath = `inset(0 ${((1 - line) * 100).toFixed(2)}% 0 0)`;
    });
  };
  const measure = (): number => {
    const box = root.getBoundingClientRect();
    const vh = window.innerHeight;
    return clamp01((0.85 * vh - box.top) / (0.3 * vh + box.height / 2));
  };

  root.dataset["fx"] = "on";
  let frame = 0;
  let pinned = false;
  const onScroll = (): void => {
    if (frame === 0 && !pinned) {
      frame = requestAnimationFrame(() => {
        frame = 0;
        render(measure());
      });
    }
  };
  registerSeek("fill", (progress) => {
    pinned = true;
    render(progress);
  });
  new IntersectionObserver(([entry]) => {
    if (entry?.isIntersecting) {
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    } else {
      window.removeEventListener("scroll", onScroll);
      if (!pinned) {
        render(measure());
      }
    }
  }).observe(root);
  render(measure());
}
