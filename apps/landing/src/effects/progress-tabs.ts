// U08 signature (UI-FORMS §c U08, §f b-paper): three tab words above the
// plate; a 2px ink line runs across the current tab in 7.5s (Harvey's product
// tabs, refs/devices/crops/harvey-progress-accordion-texture-frame.jpg), then
// the next fragment replaces the current one on the plate with a 200ms fade
// and 8px rise. Each tab plays once and the stage rests on the last one.
// Hover or focus pauses the line; a click, or Arrow Left/Right, Home or End on
// the tablist (WAI-ARIA tabs, automatic activation), takes over and stops
// autoplay. Reduced motion or no JavaScript: no autoplay, the first tab is
// shown in full and every tab is a working button (the markup's end state).
import { clamp01, isProof, loop, prefersReducedMotion, registerSeek } from "./frame";

const STEP_MS = 7500;
const SWAP_MS = 200;
const SWAP_RISE_PX = 8;

export function mountProgressTabs(root: HTMLElement): void {
  const tabs = [...root.querySelectorAll<HTMLButtonElement>("[data-tab]")];
  const bars = tabs.map((tab) => tab.querySelector<HTMLElement>("[data-tab-bar]"));
  const panels = [...root.querySelectorAll<HTMLElement>("[data-panel]")];
  const frags = [...root.querySelectorAll<HTMLElement>("[data-frag]")];
  if (tabs.length === 0 || panels.length !== tabs.length || frags.length !== tabs.length) {
    return;
  }

  let current = 0;
  const show = (index: number, swap: number): void => {
    tabs.forEach((tab, i) => {
      tab.setAttribute("aria-selected", String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
    });
    panels.forEach((panel, i) => (panel.hidden = i !== index));
    frags.forEach((frag, i) => {
      frag.hidden = i !== index;
      if (i === index) {
        frag.style.opacity = String(swap);
        frag.style.transform = swap < 1 ? `translateY(${(1 - swap) * SWAP_RISE_PX}px)` : "";
      }
    });
    current = index;
  };
  const setBar = (index: number, progress: number): void => {
    bars.forEach((bar, i) => {
      if (bar) {
        bar.style.transform = `scaleX(${i < index ? 1 : i === index ? progress : 0})`;
      }
    });
  };

  // Pure render of the autoplay timeline at t ms.
  const render = (t: number): boolean => {
    const step = Math.min(tabs.length - 1, Math.floor(t / STEP_MS));
    const within = t - step * STEP_MS;
    if (step !== current) {
      show(step, 0);
    }
    show(step, step === 0 ? 1 : clamp01(within / SWAP_MS));
    setBar(step, clamp01(within / STEP_MS));
    return t < tabs.length * STEP_MS;
  };

  // Autoplay starts once half the stage is in view, and pauses while the
  // pointer or focus is inside it or the stage leaves the screen.
  let elapsed = 0;
  let cancel: (() => void) | null = null;
  let held = false;
  let visible = false;
  let done = false;
  const stop = (): void => {
    done = true;
    cancel?.();
    cancel = null;
  };

  root.dataset["fx"] = "on";
  const select = (index: number): void => {
    stop();
    show(index, 1);
    setBar(index, 1);
  };
  tabs.forEach((tab, i) => tab.addEventListener("click", () => select(i)));
  root.querySelector<HTMLElement>('[role="tablist"]')?.addEventListener("keydown", (event) => {
    const last = tabs.length - 1;
    const next =
      event.key === "ArrowRight"
        ? (current + 1) % tabs.length
        : event.key === "ArrowLeft"
          ? (current + last) % tabs.length
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? last
              : -1;
    if (next < 0) {
      return;
    }
    event.preventDefault();
    select(next);
    tabs[next]?.focus();
  });
  registerSeek("tabs", (t) => {
    stop();
    render(t);
  });

  if (prefersReducedMotion() || isProof) {
    show(0, 1);
    setBar(0, 1);
    return;
  }

  const sync = (): void => {
    const run = visible && !held && !done;
    if (run && !cancel) {
      const from = elapsed;
      cancel = loop((dt) => {
        elapsed = from + dt;
        const more = render(elapsed);
        if (!more) {
          done = true;
          cancel = null;
        }
        return more;
      });
    } else if (!run && cancel) {
      cancel();
      cancel = null;
    }
  };
  const hold = (value: boolean) => () => {
    held = value;
    sync();
  };
  root.addEventListener("pointerenter", hold(true));
  root.addEventListener("pointerleave", hold(false));
  root.addEventListener("focusin", hold(true));
  root.addEventListener("focusout", hold(false));
  new IntersectionObserver(
    ([entry]) => {
      visible = entry?.isIntersecting ?? false;
      sync();
    },
    { threshold: 0.5 },
  ).observe(root);
  render(0);
}
