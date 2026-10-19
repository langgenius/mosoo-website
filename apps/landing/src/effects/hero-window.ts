// Hero window: the 1 px outline draws once and the S2 ripple runs inside it (both pure CSS in
// home.css, so they also run without this file). This only bounds the ripple, per brand/outline
// README §5.1: it pauses while the window is off screen and stops for good after two cycles
// (2 x 7.2 s), leaving the rings at staggered mid phases. Under prefers-reduced-motion home.css shows
// the static mid-phase rings and no draw.

const CYCLES_MS = 2 * 7200;

export function initHeroWindow(): void {
  const win = document.querySelector<HTMLElement>("[data-hero-window]");
  if (!win) return;
  let visibleMs = 0;
  let since = performance.now();
  let visible = true;
  let done = false;

  const stop = (): void => {
    done = true;
    win.dataset["paused"] = "";
    observer.disconnect();
  };

  const observer = new IntersectionObserver(([entry]) => {
    if (done || !entry) return;
    const now = performance.now();
    if (visible) visibleMs += now - since;
    since = now;
    visible = entry.isIntersecting;
    if (visibleMs >= CYCLES_MS) return stop();
    if (visible) delete win.dataset["paused"];
    else win.dataset["paused"] = "";
  });
  observer.observe(win);

  const check = (): void => {
    if (done) return;
    const now = performance.now();
    if (visible) visibleMs += now - since;
    since = now;
    if (visibleMs >= CYCLES_MS) stop();
    else window.setTimeout(check, Math.max(200, CYCLES_MS - visibleMs));
  };
  window.setTimeout(check, CYCLES_MS);
}
