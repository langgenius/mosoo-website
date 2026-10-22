// Short bursts of decorative motion, declared with data-play-for="ms". Each time the element comes into view it gets
// data-playing for at most that many milliseconds, and the page's CSS runs its animation only under [data-playing]:
// motion that starts by itself stops within 5 s (WCAG 2.2.2, "Pause, Stop, Hide"; staging v5 motion review P1-2).
// Leaving the viewport ends the burst; coming back starts a new one. Reduced motion and no JS: never set, the CSS
// keeps the still frame. Used by the Resume comet on the full lime screen (sections/accent.css).

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

/** Wires every [data-play-for] in root. Returns a cleanup. */
export function initPlayFor(root: ParentNode = document): () => void {
  const els = [...root.querySelectorAll<HTMLElement>("[data-play-for]")];
  if (els.length === 0 || typeof IntersectionObserver === "undefined" || window.matchMedia(REDUCED_MOTION).matches) {
    return () => {};
  }
  const timers = new Map<HTMLElement, number>();
  const end = (el: HTMLElement): void => {
    window.clearTimeout(timers.get(el));
    timers.delete(el);
    delete el.dataset["playing"];
  };
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const el = entry.target as HTMLElement;
      if (!entry.isIntersecting) {
        end(el);
      } else if (!timers.has(el)) {
        const ms = Number.parseFloat(el.dataset["playFor"] ?? "");
        el.dataset["playing"] = "";
        timers.set(
          el,
          window.setTimeout(() => {
            delete el.dataset["playing"]; // the burst is over; the timer entry stays until the element leaves
          }, Number.isFinite(ms) ? Math.min(Math.max(0, ms), 5000) : 4500),
        );
      }
    }
  });
  for (const el of els) {
    io.observe(el);
  }
  return () => {
    io.disconnect();
    for (const el of [...timers.keys()]) {
      end(el);
    }
  };
}
