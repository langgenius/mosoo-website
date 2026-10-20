// Harness switch (v5 graft of v4c's spec table and v4a's flip; staging v5/graft/switch/NOTES.md), declared with
// [data-switch]: a slot that shows one of several values and rolls to the next. On the v5 page it is the Harness value
// of the spec table, the runtime glyph and the name in the display serif (owner 2026-10-20: 「加一个 Harness 切换的那个
// 动效」).
//
// The roll is reverse-engineered from a13n's spec-sheet slot, the source of v4a's flip-slot.ts and of v4c's first
// act-1 flip (staging refs/a13n/downloads/stars-B_4FTUjC.js.txt, function k(); the .slot rules in
// index-DrpEFuYv.css.txt):
//   outgoing   to translate 0 -55%, opacity 0, blur(5px) in 460 ms
//   incoming   from translate 0 70%, opacity 0, blur(5px) in 640 ms, 80 ms later
//   easing     cubic-bezier(.16, 1, .3, 1) for both: a13n's own curve, and Intent's expo.out (BRIEF §3.4)
//   slot       every value stacked in one grid cell with overflow: clip, so the cell is as wide as the widest value and
//              the row never changes width
// The look is CSS (README). This file only decides which value is current, with one of two drivers.
//
//   data-switch="scroll"  Inside a tall section with a sticky layer: the closest [data-switch-run], else the closest
//                         [data-stage]. Its scroll progress picks the value; data-switch-span="a,b" (default 0,1)
//                         spreads the values evenly over that part of the run. Crossing a threshold starts the roll, in
//                         the direction of the scroll: the reader decides which name shows and never comes to rest
//                         between two (a continuous scrub can stop half way, after a single 40 px arrow key). Going
//                         back, a value holds until the scroll is 32 px above its threshold (as stage.ts). Runs while
//                         data-switch-media matches (default: the run's data-stage-media, else where the v5 stage
//                         pins); elsewhere, and when there is no run, the time driver runs.
//   data-switch="time"    One pass per page view: the first value (the first in the markup, the harness the stage's
//                         Call names) shows for data-switch-lead ms (default 2100), then every other value in turn and
//                         the first again, one roll every data-switch-hold ms (default 1400). Four values take four
//                         rolls: 3 × 1.4 s + the 0.72 s roll = 4.92 s of motion, inside the 5 s of WCAG 2.2.2 that
//                         every self-starting motion on the page keeps (play-for.ts, linefield.ts), where a13n loops
//                         forever. It pauses while the slot is outside the middle 70 % of the viewport, under a mouse,
//                         focused within, in a hidden tab, or, inside a live [data-portal] (portal.ts), while that door
//                         neither is open nor shows the slot's [data-portal-reveal] (the pass never starts while the
//                         slot is hidden). It rests on the first value for good: leaving and coming back does not play
//                         it again (round 3a; staging v5/polish/verify-metrics.md §15-3: the replay on every return was
//                         not the owner's one pass, owner-notes 21:57 「门开后 Harness 按时间转一轮」).
//
// Writes on [data-switch]: data-switch-mode="live", data-switch-driver="scroll | time", data-switch-at="k", and, two
// frames after going live, data-switch-ready (the CSS hangs its transitions on it, so the first live paint never
// animates); the time driver also writes data-switch-pass="play | hold | done". On every [data-switch-item]:
// data-switch-state="past | active | next".
//
// No JS, prefers-reduced-motion and a failed init write nothing: the CSS default lays every value out in the row, and a
// visually hidden list next to the aria-hidden slot gives a screen reader each name once (README). A media change at
// runtime is followed: reduce → the static row (a roll in flight is cancelled); scroll ↔ time when data-switch-media
// flips. A finished pass stays finished across those changes.

type Driver = "scroll" | "time";
/** "line": values before the current one wait above, values after it below (scroll). "ring": only the previous value
 *  waits above, so the next value always rolls in from below, round the end too (time; with only two values the
 *  other one is also the previous one, and rolls in from above). */
type Order = "line" | "ring";

/** sections/stage.ts STAGE_MEDIA: where the v5 stage pins. */
const PIN_MEDIA = "(min-width: 901px) and (min-height: 680px)";
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
/** Time driver: how long the first value shows before the pass rolls (it is still, so it is not motion). */
const LEAD_MS = 2100;
/** Time driver: from one roll's start to the next. a13n's period is 2400 ms; 1400 fits four rolls in 5 s. */
const HOLD_MS = 1400;
/** Scroll driver, going back: a value holds until the scroll is this far above its threshold. */
const BACK_PX = 32;
/** Time driver: the slot counts as in view when it is whole inside the middle 70 % of the viewport. */
const BAND = "-15% 0px -15% 0px";

const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));

function parseSpan(raw: string | undefined): readonly [number, number] {
  const [a, b] = (raw ?? "").split(",").map((s) => Number.parseFloat(s));
  return a !== undefined && b !== undefined && a >= 0 && b <= 1 && a < b ? [a, b] : [0, 1];
}

function parseMs(raw: string | undefined, fallback: number): number {
  const ms = Number.parseFloat(raw ?? "");
  return Number.isFinite(ms) ? Math.min(6000, Math.max(1000, ms)) : fallback;
}

function mountSwitch(root: HTMLElement): () => void {
  const items = [...root.querySelectorAll<HTMLElement>("[data-switch-item]")];
  const n = items.length;
  if (n < 2) {
    return () => {};
  }
  const run = root.dataset["switch"] === "scroll" ? root.closest<HTMLElement>("[data-switch-run], [data-stage]") : null;
  // Inside a [data-stage] run, its own pin media, so the driver and the pin cannot disagree.
  const pin = window.matchMedia(root.dataset["switchMedia"] ?? run?.dataset["stageMedia"] ?? PIN_MEDIA);
  const reduce = window.matchMedia(REDUCED_MOTION);

  let driver: Driver | null = null;
  let stopDriver = (): void => {};
  let readyFrame = 0;
  let at = -1;
  let played = false; // the time driver's one pass is over (for the page view, across driver restarts)

  const show = (k: number, order: Order): void => {
    at = k;
    root.dataset["switchAt"] = String(k);
    items.forEach((item, i) => {
      const before = order === "line" ? i < k : i === (k + n - 1) % n;
      const state = i === k ? "active" : before ? "past" : "next";
      if (item.dataset["switchState"] !== state) {
        item.dataset["switchState"] = state;
      }
    });
  };

  const scrollDriver = (host: HTMLElement): (() => void) => {
    const [a, b] = parseSpan(root.dataset["switchSpan"]);
    let top = 0;
    let travel = 1;
    let frame = 0;
    const measure = (): void => {
      top = host.getBoundingClientRect().top + window.scrollY;
      travel = Math.max(1, host.offsetHeight - window.innerHeight);
    };
    const render = (): void => {
      frame = 0;
      const p = clamp01((window.scrollY - top) / travel);
      let k = Math.min(n - 1, Math.max(0, Math.floor(((p - a) / (b - a)) * n)));
      if (k < at && p > a + ((b - a) * at) / n - BACK_PX / travel) {
        k = at;
      }
      if (k !== at) {
        show(k, "line");
      }
    };
    const onScroll = (): void => {
      if (!frame) {
        frame = requestAnimationFrame(render);
      }
    };
    const onResize = (): void => {
      measure();
      render();
    };
    // Content above the run (fonts, images) moves it; re-measure whenever the page or the run changes size.
    const resize = new ResizeObserver(onResize);
    resize.observe(host);
    resize.observe(document.body);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    measure();
    render();
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  };

  const timeDriver = (): (() => void) => {
    const lead = parseMs(root.dataset["switchLead"], LEAD_MS);
    const hold = parseMs(root.dataset["switchHold"], HOLD_MS);
    // A door around the slot (portal.ts): live, it writes data-portal-state on itself and data-portal-shown on the
    // part it reveals; the pass waits until the door is open or the slot's part is shown.
    const door = root.closest<HTMLElement>("[data-portal]");
    const part = root.closest<HTMLElement>("[data-portal-reveal]");
    const doorOpen = (): boolean =>
      !door ||
      door.dataset["portalMode"] !== "live" ||
      door.dataset["portalState"] === "open" ||
      (part?.hasAttribute("data-portal-shown") ?? false);
    let rolls = 0;
    let timer = 0;
    let due = 0;
    let left = lead;
    let inBand = false;
    let hovered = false;
    let focused = false;

    const setPass = (pass: "play" | "hold" | "done"): void => {
      if (root.dataset["switchPass"] !== pass) {
        root.dataset["switchPass"] = pass;
      }
    };
    const halt = (): void => {
      if (timer) {
        window.clearTimeout(timer);
        timer = 0;
        left = Math.max(0, due - performance.now());
      }
    };
    const update = (): void => {
      if (played) {
        halt();
        setPass("done");
        return;
      }
      const go = inBand && !hovered && !focused && !document.hidden && doorOpen();
      if (go && !timer) {
        due = performance.now() + left;
        timer = window.setTimeout(roll, left);
      } else if (!go) {
        halt();
      }
      setPass(go ? "play" : "hold");
    };
    function roll(): void {
      timer = 0;
      rolls += 1;
      left = hold;
      played = rolls >= n; // every other value once, then the first again
      show((at + 1) % n, "ring");
      update();
    }

    const band = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1];
        if (!entry) {
          return;
        }
        const whole =
          entry.intersectionRatio >= 0.99 ||
          (entry.rootBounds !== null && entry.intersectionRect.height >= entry.rootBounds.height - 1);
        inBand = entry.isIntersecting && whole;
        update();
      },
      { rootMargin: BAND, threshold: [0, 0.5, 0.99, 1] },
    );
    const onPointer = (event: PointerEvent): void => {
      if (event.pointerType !== "touch") {
        hovered = event.type === "pointerenter";
        update();
      }
    };
    const onFocusIn = (): void => {
      focused = true;
      update();
    };
    const onFocusOut = (event: FocusEvent): void => {
      focused = event.relatedTarget instanceof Node && root.contains(event.relatedTarget);
      update();
    };

    // The door changes a few times per pass through it (closed, opening, shown, open): follow it.
    const doorWatch = new MutationObserver(update);
    if (door) {
      doorWatch.observe(door, { attributes: true, attributeFilter: ["data-portal-mode", "data-portal-state"] });
    }
    if (part) {
      doorWatch.observe(part, { attributes: true, attributeFilter: ["data-portal-shown"] });
    }

    // The first value, at rest: where the pass starts, and where a finished one stays.
    show(0, "ring");
    band.observe(root);
    root.addEventListener("pointerenter", onPointer);
    root.addEventListener("pointerleave", onPointer);
    root.addEventListener("focusin", onFocusIn);
    root.addEventListener("focusout", onFocusOut);
    document.addEventListener("visibilitychange", update);
    update();
    return () => {
      window.clearTimeout(timer);
      doorWatch.disconnect();
      band.disconnect();
      root.removeEventListener("pointerenter", onPointer);
      root.removeEventListener("pointerleave", onPointer);
      root.removeEventListener("focusin", onFocusIn);
      root.removeEventListener("focusout", onFocusOut);
      document.removeEventListener("visibilitychange", update);
    };
  };

  const clear = (): void => {
    cancelAnimationFrame(readyFrame);
    readyFrame = 0;
    at = -1;
    for (const key of ["switchMode", "switchDriver", "switchAt", "switchReady", "switchPass"]) {
      delete root.dataset[key];
    }
    for (const item of items) {
      delete item.dataset["switchState"];
      // A roll in flight would otherwise finish into the static row (its end values are the static ones, so the
      // browser keeps it running): reduce → the four names are whole at once, not up to 0.72 s later.
      for (const animation of item.getAnimations?.({ subtree: true }) ?? []) {
        animation.cancel();
      }
    }
  };

  const setMode = (): void => {
    const want: Driver | null = reduce.matches
      ? null
      : run && pin.matches
        ? "scroll"
        : typeof IntersectionObserver === "function"
          ? "time"
          : null;
    if (want === driver) {
      return;
    }
    stopDriver();
    stopDriver = () => {};
    clear();
    driver = want;
    if (!want) {
      return;
    }
    root.dataset["switchMode"] = "live"; // the CSS stacks the values in one cell from here
    root.dataset["switchDriver"] = want;
    stopDriver = want === "scroll" && run ? scrollDriver(run) : timeDriver();
    // Frame 1 paints the first live state; from frame 2 on, state changes may transition.
    readyFrame = requestAnimationFrame(() => {
      readyFrame = requestAnimationFrame(() => {
        readyFrame = 0;
        root.dataset["switchReady"] = "";
      });
    });
  };

  pin.addEventListener("change", setMode);
  reduce.addEventListener("change", setMode);
  setMode();

  return () => {
    pin.removeEventListener("change", setMode);
    reduce.removeEventListener("change", setMode);
    stopDriver();
    stopDriver = () => {};
    driver = null;
    clear();
  };
}

/** Wires every [data-switch] in root. Returns a cleanup. */
export function initHarnessSwitch(root: ParentNode = document): () => void {
  const stops = [...root.querySelectorAll<HTMLElement>("[data-switch]")].map(mountSwitch);
  return () => {
    for (const stop of stops) {
      stop();
    }
  };
}
