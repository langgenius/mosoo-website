// Satellite docking: the d-object signature (UI-FORMS U09, §f). The four
// satellite cards start pushed out from the centre outline window and dock
// against its edges once, one after another, as soon as the reader starts to
// scroll (before section 01 arrives), or after the stage has sat at least 60%
// in view for 700ms once the fonts are ready (a reader who never scrolls).
//
// - Only transform and opacity move (WAAPI); the scroll check runs in rAF.
// - The docked layout is the default in CSS: the static fallback renders the
//   stage without data-dock, so a reader without JavaScript sees the end
//   state. The undocked offsets come from CSS custom properties
//   (--dock-x / --dock-y per satellite and breakpoint).
// - Reduced motion, or a first paint before React mounts: shouldUndock() is
//   false, the stage renders docked.

const EASE = "cubic-bezier(.16,1,.3,1)";
const DURATION = 600;
const STAGGER = 120;
// How far the page must scroll before the satellites dock (px).
const TRIGGER_SCROLL = 24;
// The other trigger: the stage stays this visible for this long.
const DWELL_RATIO = 0.6;
const DWELL_MS = 700;

// Undock only while nothing has been painted yet. On a slow load the static
// page has already shown the docked stage; pushing the satellites out again
// would play the dock backwards (docked, undocked, docked).
export function shouldUndock(): boolean {
  return (
    typeof window !== "undefined" &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
    performance.getEntriesByType("paint").length === 0
  );
}

function offsetOf(el: HTMLElement): [number, number] {
  const style = getComputedStyle(el);
  return [parseFloat(style.getPropertyValue("--dock-x")) || 0, parseFloat(style.getPropertyValue("--dock-y")) || 0];
}

/** Docks the satellites now. Returns the running animations. */
export function dock(stage: HTMLElement): Animation[] {
  if (stage.dataset["dock"] !== "out") {
    return [];
  }
  const satellites = [...stage.querySelectorAll<HTMLElement>("[data-sat]")].filter((el) => el.offsetParent !== null);
  const offsets = satellites.map(offsetOf);
  stage.dataset["dock"] = "in";
  return satellites.map((el, index) => {
    const [x, y] = offsets[index] ?? [0, 0];
    return el.animate(
      [
        { transform: `translate(${x}px, ${y}px)`, opacity: 0.86 },
        { transform: "translate(0, 0)", opacity: 1 },
      ],
      { duration: DURATION, delay: index * STAGGER, easing: EASE, fill: "backwards" },
    );
  });
}

/** Waits for the first scroll or a 700ms dwell, then docks once. Returns a cleanup. */
export function dockOnScroll(stage: HTMLElement): () => void {
  if (stage.dataset["dock"] !== "out") {
    return () => {};
  }
  let frame = 0;
  let dwell = 0;
  let stopped = false;
  const fire = () => {
    stop();
    dock(stage);
  };
  const check = () => {
    frame = 0;
    if (window.scrollY > TRIGGER_SCROLL) {
      fire();
    }
  };
  const observer =
    typeof IntersectionObserver === "undefined"
      ? null
      : new IntersectionObserver(
          ([entry]) => {
            window.clearTimeout(dwell);
            if (entry?.isIntersecting && entry.intersectionRatio >= DWELL_RATIO) {
              dwell = window.setTimeout(fire, DWELL_MS);
            }
          },
          { threshold: [DWELL_RATIO] },
        );
  const onScroll = () => {
    if (frame === 0) {
      frame = requestAnimationFrame(check);
    }
  };
  const stop = () => {
    stopped = true;
    window.removeEventListener("scroll", onScroll);
    observer?.disconnect();
    window.clearTimeout(dwell);
    if (frame !== 0) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  // The dwell clock starts once the fonts settle the layout.
  void document.fonts.ready.then(() => {
    if (!stopped) {
      observer?.observe(stage);
    }
  });
  // A reload can land mid-page: dock straight away.
  check();
  return stop;
}
