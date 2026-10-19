// Footer outline (UI-FORMS §d "页尾三层嵌套", brand/outline S3): the dot
// field inside the inner window rises from the floor line once, 1.2s, the
// first time the footer comes into view. Only clip-path moves. No JavaScript
// or reduced motion: the field is simply there.
import { EASE_OUT, clamp01, loop, prefersReducedMotion, registerSeek } from "./frame";

const RISE_MS = 1200;

export function mountRiseOnce(root: HTMLElement): void {
  const field = root.querySelector<HTMLElement>("[data-rise]");
  if (!field || prefersReducedMotion()) {
    return;
  }

  const render = (t: number): boolean => {
    const p = EASE_OUT(clamp01(t / RISE_MS));
    field.style.clipPath = p >= 1 ? "" : `inset(${((1 - p) * 100).toFixed(2)}% 0 0 0)`;
    return p < 1;
  };
  let started = false;
  registerSeek("rise", (t) => {
    started = true;
    render(t);
  });
  render(0);
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry?.isIntersecting && !started) {
        started = true;
        observer.disconnect();
        loop(render);
      }
    },
    { threshold: 0.4 },
  );
  observer.observe(root);
}
