// Title float and card entrance (v5 BRIEF §3.4 「标题浮起」「卡片进场」), declared with data-rise.
//
//   data-rise="block"  Frame IX2 a-15 (the .text-animation wrapper: tab label + heading): translate 0 100px,
//                      scale .95, opacity 0.
//   data-rise="title"  Frame IX2 a-13 (the H1 / H2 itself): translate 0 150px, scale .9, opacity 0.
//   data-rise="line"   Frame IX2 a-14 on the heading's second line (an inline span): opacity only, 150 ms later.
//       Movement 1000 ms on IX2 outQuad = cubic-bezier(1/3, 2/3, 2/3, 1) exactly, as Frame. Opacity 500 ms, not
//       Frame's 1500: the float stays, the unreadable part goes (YC review P1-4: a heading already 40% into the
//       viewport was still at 0-7% opacity; v4d had no fade at all). Source of the move: staging
//       refs/frame/v5/motion/STUDY.md §2 (ix2-payload.json; rec/samples/float-fixes.json).
//       Below 992 px, block and title only fade (Frame runs a-15 at ≥ 992 px only; BRIEF: 手机只做透明度).
//   data-rise="card"   Intent's feature carousel: translate 0 120px, opacity 0; 700 ms GSAP power3.out ≈
//                      cubic-bezier(.25, 1, .5, 1), opacity in 400 ms; cards that enter in the same frame start
//                      100 ms apart, in document order. Source: refs/intent/v5/STUDY.md §2.6 (ScrollTrigger.batch,
//                      stagger .1).
//   data-rise-delay="ms" adds a delay to any of them.
//
// Trigger: when the element's untransformed top reaches 90% of the viewport, measured with an IntersectionObserver
// whose bottom margin cancels the push-down (dy - 10% of the viewport height). Frame and ScrollTrigger fire on the
// pushed-down edge instead, 100-250 px later, which left a title invisible after it had come into view (design
// review P2-7, YC P1-4). An element that plays takes its waiting descendants with it (the heading in a block, its
// second line), so one visual unit starts on one frame; the inner heading then only moves, its block fades the
// unit (two fades would multiply), and the second line keeps its own late fade. Each element plays once.
//
// End states. Only elements that start below the fold are hidden, by inline styles set here, so no JS, reduced
// motion and anything already on screen at load stay as authored. The animation runs from the hidden values to the
// element's own CSS values (implicit end keyframe), then nothing is left behind. Focus entering a hidden element
// reveals it at once. The hero is not this engine's: it floats on first paint with the CSS keyframes in README.md
// (data-rise-load) and never waits for JS (study §2 「不要学」: Frame's H1 waits for IX2, LCP 2.3 s).

interface Preset {
  dy: number;
  scale: number;
  moveMs: number;
  fadeMs: number;
  ease: string;
  delayMs: number;
  staggerMs: number;
  /** Below this viewport width, only the opacity moves (0 = never). */
  fadeOnlyBelow: number;
}

interface Waiting {
  preset: Preset;
  fadeOnly: boolean;
  extraMs: number;
}

const OUT_QUAD = "cubic-bezier(0.3333, 0.6667, 0.6667, 1)";
const OUT_QUART = "cubic-bezier(0.25, 1, 0.5, 1)";

const PRESETS: Record<string, Preset> = {
  block: {
    dy: 100,
    scale: 0.95,
    moveMs: 1000,
    fadeMs: 500,
    ease: OUT_QUAD,
    delayMs: 0,
    staggerMs: 0,
    fadeOnlyBelow: 992,
  },
  title: {
    dy: 150,
    scale: 0.9,
    moveMs: 1000,
    fadeMs: 500,
    ease: OUT_QUAD,
    delayMs: 0,
    staggerMs: 0,
    fadeOnlyBelow: 992,
  },
  line: { dy: 0, scale: 1, moveMs: 0, fadeMs: 500, ease: OUT_QUAD, delayMs: 150, staggerMs: 0, fadeOnlyBelow: 0 },
  card: { dy: 120, scale: 1, moveMs: 700, fadeMs: 400, ease: OUT_QUART, delayMs: 0, staggerMs: 100, fadeOnlyBelow: 0 },
};

/** Where the untransformed top edge triggers, as a share of the viewport height from the top. */
const TRIGGER_AT = 0.9;

const HIDDEN = ["opacity", "translate", "scale"] as const;

function clearHidden(el: HTMLElement): void {
  for (const prop of HIDDEN) {
    el.style.removeProperty(prop);
  }
}

function inDocumentOrder(a: Element, b: Element): number {
  return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
}

/** Hides every [data-rise] below the fold and plays it once when it scrolls in. Returns a cleanup. */
export function initRise(root: ParentNode = document): () => void {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reduce.matches || typeof IntersectionObserver === "undefined") {
    return () => {};
  }
  const waiting = new Map<HTMLElement, Waiting>();
  // One observer per bottom margin (an element's push-down decides its margin), rebuilt when the viewport resizes.
  let observers = new Map<number, IntersectionObserver>();

  const unobserve = (el: HTMLElement): void => {
    for (const io of observers.values()) {
      io.unobserve(el);
    }
  };

  // `inner`: started by a waiting ancestor that already fades the unit in, so it only moves (a second fade would
  // multiply with the ancestor's); a heading's second line keeps its own late fade, Frame's a-14 beat.
  const play = (el: HTMLElement, staggerMs: number, inner = false): void => {
    const item = waiting.get(el);
    if (!item) {
      return;
    }
    waiting.delete(el);
    unobserve(el);
    const { preset, fadeOnly, extraMs } = item;
    const timing: KeyframeAnimationOptions = {
      delay: preset.delayMs + extraMs + staggerMs,
      easing: preset.ease,
      fill: "backwards",
    };
    if (!fadeOnly && preset.moveMs > 0) {
      const from: Keyframe = { offset: 0, translate: `0 ${preset.dy}px` };
      if (preset.scale !== 1) {
        from["scale"] = String(preset.scale);
      }
      el.animate([from], { ...timing, duration: preset.moveMs });
    }
    if (!inner || preset.moveMs === 0) {
      el.animate([{ offset: 0, opacity: 0 }], { ...timing, duration: preset.fadeMs });
    }
    // The backwards fill holds the hidden values through the delay, so the inline ones can go now.
    clearHidden(el);
    el.dataset["riseState"] = "in";
    // The unit's inner parts (the heading in its block, the heading's second line) start with it.
    for (const part of el.querySelectorAll<HTMLElement>("[data-rise]")) {
      play(part, 0, true);
    }
  };

  const onEnter = (entries: IntersectionObserverEntry[]): void => {
    const entering = entries
      .filter((entry) => entry.isIntersecting && entry.target instanceof HTMLElement)
      .map((entry) => entry.target as HTMLElement)
      .sort(inDocumentOrder);
    let batch = 0;
    for (const el of entering) {
      const stagger = waiting.get(el)?.preset.staggerMs ?? 0;
      play(el, stagger > 0 ? batch++ * stagger : 0);
    }
  };

  /** Bottom margin that makes the observer fire when the element's untransformed top is at TRIGGER_AT. */
  const marginFor = (item: Waiting): number => {
    const dy = !item.fadeOnly && item.preset.moveMs > 0 ? item.preset.dy : 0;
    return Math.round(dy - (1 - TRIGGER_AT) * window.innerHeight);
  };

  const observeAll = (): void => {
    for (const io of observers.values()) {
      io.disconnect();
    }
    observers = new Map();
    // A batch of cards entering together must share an observer callback to stagger: same preset, same margin.
    for (const [el, item] of waiting) {
      const margin = marginFor(item);
      let io = observers.get(margin);
      if (!io) {
        io = new IntersectionObserver(onEnter, { rootMargin: `0px 0px ${margin}px 0px` });
        observers.set(margin, io);
      }
      io.observe(el);
    }
  };

  // One layout pass for every element, then the writes.
  const els = [...root.querySelectorAll<HTMLElement>("[data-rise]")];
  const viewH = window.innerHeight;
  const viewW = window.innerWidth;
  const tops = els.map((el) => el.getBoundingClientRect().top);
  els.forEach((el, index) => {
    const preset = PRESETS[el.dataset["rise"] ?? ""];
    if (!preset || (tops[index] ?? 0) < viewH) {
      return; // unknown preset, on screen or above: leave it as authored
    }
    const fadeOnly = preset.fadeOnlyBelow > 0 && viewW < preset.fadeOnlyBelow;
    const extra = Number.parseFloat(el.dataset["riseDelay"] ?? "");
    waiting.set(el, { preset, fadeOnly, extraMs: Number.isFinite(extra) ? Math.max(0, extra) : 0 });
    el.style.opacity = "0";
    if (!fadeOnly && preset.moveMs > 0) {
      el.style.setProperty("translate", `0 ${preset.dy}px`);
      if (preset.scale !== 1) {
        el.style.setProperty("scale", String(preset.scale));
      }
    }
    el.dataset["riseState"] = "wait";
  });
  observeAll();

  let resizeTimer = 0;
  const onResize = (): void => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      if (waiting.size > 0) {
        observeAll();
      }
    }, 150);
  };

  const onFocus = (event: FocusEvent): void => {
    const start = event.target instanceof Element ? event.target : null;
    for (
      let el = start?.closest<HTMLElement>("[data-rise]");
      el;
      el = el.parentElement?.closest<HTMLElement>("[data-rise]")
    ) {
      play(el, 0);
    }
  };

  const revealAll = (): void => {
    for (const io of observers.values()) {
      io.disconnect();
    }
    observers.clear();
    for (const el of waiting.keys()) {
      clearHidden(el);
      el.dataset["riseState"] = "in";
    }
    waiting.clear();
  };

  const onReduce = (): void => {
    if (reduce.matches) {
      revealAll();
    }
  };

  document.addEventListener("focusin", onFocus);
  reduce.addEventListener("change", onReduce);
  window.addEventListener("resize", onResize, { passive: true });
  return () => {
    document.removeEventListener("focusin", onFocus);
    reduce.removeEventListener("change", onReduce);
    window.removeEventListener("resize", onResize);
    window.clearTimeout(resizeTimer);
    revealAll();
  };
}
