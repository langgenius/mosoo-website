// Damped wheel scrolling (v5 BRIEF §3.4 「阻尼滚动」). Declared with <html data-damp>.
//
// Reverse-engineered from Frame (framelp.webflow.io), which runs Lenis 1.0.29 with { lerp: 0.1, wheelMultiplier:
// 0.7 }. Ported from the dependency-free recipe in staging refs/frame/v5/motion/STUDY.md §1 (our own code, written
// from those measurements): each wheel tick moves a target by deltaY × 0.7, and every frame the page closes
// 1 − e^(−λ·dt) of the distance left (λ = 6 s⁻¹, τ = 167 ms). Frame, one 100 px tick: 50 / 90 / 99 % at
// 97 / 364 / 813 ms, no overshoot (refs/frame/v5/motion/rec/damping/frame.json).
//
// Beyond Frame (study §1 「适用条件」):
// - mounts only with (hover: hover) and (pointer: fine) and prefers-reduced-motion: no-preference, so touch,
//   reduced motion and no JS all keep native scrolling;
// - handles deltaMode (lines, pages);
// - lets nested scroll areas, [data-damp-prevent] subtrees, zoom (ctrl / ⌘) and horizontal gestures through;
// - keyboard, scrollbar, anchors and find-in-page stay native: a scroll the engine did not make cancels the glide.
//
// The wheel handler reads no layout. Scroll range, viewport height, scroll position and the nested scroll areas
// are cached outside it (resize, ResizeObserver, scroll and pointerover handlers, or a frame later).
//
// Tuning without code: <html data-damp data-damp-multiplier="0.7" data-damp-lambda="6">.

const MULTIPLIER = 0.7; // Frame: wheelMultiplier 0.7 (index.raw.html inline Lenis config)
const LAMBDA = 6; // Frame: 60 × lerp 0.1, per second
const SNAP_PX = 0.5; // stop within half a pixel (Lenis snaps once Math.round(value) === target)
const LINE_PX = 100 / 6; // one line of deltaMode 1: our choice (Frame's Lenis 1.0.29 ignores deltaMode, study §1)
const MAX_DT_S = 0.1; // a frame gap longer than this (hidden tab) integrates as 0.1 s
const MEDIA = "(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)";

interface Edge {
  top: number;
  max: number;
}

function numberAttr(el: Element, name: string, fallback: number): number {
  const value = Number.parseFloat(el.getAttribute(name) ?? "");
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

/** Mounts the damping while the media conditions hold. Returns a cleanup. */
export function initDampScroll(): () => void {
  const html = document.documentElement;
  const media = window.matchMedia(MEDIA);
  const multiplier = numberAttr(html, "data-damp-multiplier", MULTIPLIER);
  const lambda = numberAttr(html, "data-damp-lambda", LAMBDA);
  let unmount: (() => void) | null = null;
  const sync = (): void => {
    if (media.matches && !unmount) {
      unmount = mount(multiplier, lambda);
    } else if (!media.matches && unmount) {
      unmount();
      unmount = null;
    }
  };
  sync();
  media.addEventListener("change", sync);
  return () => {
    media.removeEventListener("change", sync);
    unmount?.();
    unmount = null;
  };
}

function mount(multiplier: number, lambda: number): () => void {
  const html = document.documentElement;
  let y = window.scrollY;
  let target = y;
  let known = y; // the scroll position as last seen by a scroll event or set by the tick
  let ours = Math.round(y); // where the tick last scrolled to
  let running = false;
  let last = 0;
  let frame = 0;
  let viewH = window.innerHeight;
  let maxY = Math.max(0, html.scrollHeight - viewH);

  // Nested scroll areas: event target -> nearest scrollable ancestor (null = none). Filled a frame after a
  // pointerover or an unknown wheel target, never inside the wheel handler.
  let scrollerOf = new WeakMap<Element, Element | null>();
  const edges = new WeakMap<Element, Edge>();
  const watched = new Set<Element>();
  const pending = new Set<Element>();
  let scanFrame = 0;

  const edgeOf = (el: Element): Edge => ({ top: el.scrollTop, max: el.scrollHeight - el.clientHeight });
  const onNestedScroll = (event: Event): void => {
    if (event.currentTarget instanceof Element) {
      edges.set(event.currentTarget, edgeOf(event.currentTarget));
    }
  };

  const scan = (): void => {
    scanFrame = 0;
    for (const start of pending) {
      if (scrollerOf.has(start)) {
        continue;
      }
      const path: Element[] = [];
      let found: Element | null = null;
      for (let el: Element | null = start; el && el !== document.body && el !== html; el = el.parentElement) {
        const cached = scrollerOf.get(el);
        if (cached !== undefined) {
          found = cached;
          break;
        }
        path.push(el);
        const overflow = getComputedStyle(el).overflowY;
        if ((overflow === "auto" || overflow === "scroll") && el.scrollHeight > el.clientHeight + 1) {
          found = el;
          break;
        }
      }
      scrollerOf.set(start, found);
      for (const el of path) {
        scrollerOf.set(el, found);
      }
      if (found && !watched.has(found)) {
        watched.add(found);
        found.addEventListener("scroll", onNestedScroll, { passive: true });
      }
      if (found) {
        edges.set(found, edgeOf(found));
      }
    }
    pending.clear();
  };

  const queue = (el: EventTarget | null): void => {
    if (!(el instanceof Element) || scrollerOf.has(el)) {
      return;
    }
    pending.add(el);
    if (!scanFrame) {
      scanFrame = requestAnimationFrame(scan);
    }
  };

  /** True when a nested area under the pointer can still scroll this way (the browser handles the wheel). */
  const nestedTakes = (el: EventTarget | null, dy: number): boolean => {
    if (!(el instanceof Element)) {
      return false;
    }
    const scroller = scrollerOf.get(el);
    if (scroller === undefined) {
      queue(el);
      return false;
    }
    if (!scroller) {
      return false;
    }
    const edge = edges.get(scroller);
    if (!edge) {
      return true;
    }
    return dy < 0 ? edge.top > 0.5 : edge.top < edge.max - 0.5;
  };

  // A scroll lock (inline overflow: hidden on <html> or <body>, or <html data-damp-stop>) wins.
  const locked = (): boolean =>
    html.style.overflow === "hidden" ||
    document.body.style.overflow === "hidden" ||
    html.hasAttribute("data-damp-stop");

  const stop = (at: number): void => {
    running = false;
    cancelAnimationFrame(frame);
    frame = 0;
    y = at;
    target = at;
  };

  const tick = (now: number): void => {
    // The first frame integrates a whole frame, like Lenis (Frame measures 17 ms ahead of the closed form).
    const dt = last ? Math.min((now - last) / 1000, MAX_DT_S) : 1 / 60;
    last = now;
    y += (target - y) * (1 - Math.exp(-lambda * dt));
    if (Math.abs(target - y) < SNAP_PX) {
      y = target;
      running = false;
    }
    ours = Math.round(y);
    known = y;
    window.scrollTo({ top: y, behavior: "instant" });
    frame = running ? requestAnimationFrame(tick) : 0;
  };

  const onWheel = (event: WheelEvent): void => {
    if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.deltaY === 0) {
      return;
    }
    if (Math.abs(event.deltaX) > Math.abs(event.deltaY) || locked()) {
      return;
    }
    const el = event.target;
    if (el instanceof Element && el.closest("[data-damp-prevent]")) {
      return;
    }
    if (nestedTakes(el, event.deltaY)) {
      return;
    }
    event.preventDefault();
    const unit = event.deltaMode === 1 ? LINE_PX : event.deltaMode === 2 ? viewH : 1;
    if (!running) {
      y = known;
      target = known;
    }
    target = Math.round(Math.min(maxY, Math.max(0, target + event.deltaY * unit * multiplier)));
    if (!running) {
      running = true;
      last = 0;
      frame = requestAnimationFrame(tick);
    }
  };

  const onScroll = (): void => {
    const now = window.scrollY;
    known = now;
    if (running && Math.abs(now - ours) > 1) {
      stop(now); // keyboard, scrollbar, anchor or find-in-page: native wins
    }
  };

  const measure = (): void => {
    viewH = window.innerHeight;
    maxY = Math.max(0, html.scrollHeight - viewH);
    target = Math.min(target, maxY);
    scrollerOf = new WeakMap();
  };

  const onPointerOver = (event: PointerEvent): void => queue(event.target);

  const resize = new ResizeObserver(measure);
  resize.observe(html);
  resize.observe(document.body);
  window.addEventListener("wheel", onWheel, { passive: false });
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", measure, { passive: true });
  document.addEventListener("pointerover", onPointerOver, { passive: true });

  return () => {
    stop(window.scrollY);
    cancelAnimationFrame(scanFrame);
    resize.disconnect();
    window.removeEventListener("wheel", onWheel);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", measure);
    document.removeEventListener("pointerover", onPointerOver);
    for (const el of watched) {
      el.removeEventListener("scroll", onNestedScroll);
    }
  };
}
