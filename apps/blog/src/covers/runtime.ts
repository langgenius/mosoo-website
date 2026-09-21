// Live cover runtime. One module for every cover on the page.
//
//  · Motion (`motion` package) drives a single staged sequence per cover.
//  · At rest every cover shows its completed picture. Nothing plays on load or on
//    scroll.
//  · Hover plays: the pointer entering the cover's hover zone (the whole card in a
//    listing, the artwork in an article) starts the sequence; leaving pauses it;
//    re-entering resumes, or replays from the start if it had finished. The zone
//    uses pointerenter/pointerleave, which do not fire when the pointer moves
//    between children, so nothing restarts while the pointer travels inside.
//  · Keyboard: focusing the card's link (focus-visible) behaves like hover, and the
//    play / pause / replay buttons are real buttons. Touch: the button is the way.
//  · It still pauses when the cover leaves the viewport or the document is hidden.
//  · prefers-reduced-motion: no hover motion at all; the buttons run an opacity-only
//    version (no travel, no scale).
//  · Without JS the server-rendered SVG is already the completed picture.
import { animate } from "motion";
import { TIMELINES } from "./timelines";

type Keyframes = Record<string, readonly (number | string)[]>;
type SegmentOptions = { at: number; duration: number; ease?: unknown; times?: readonly number[] };
export type Segment = readonly [Element, Keyframes, SegmentOptions];

export interface TimelineHelpers {
  /** Every element with this data-el hook, in document order. */
  all(hook: string): Element[];
  /** The first element with this data-el hook (throws if the cover lacks it). */
  one(hook: string): Element;
  /** Move a light packet along route offsets; fades in, travels, fades out. */
  travel(hook: string, route: number[][], options: { at: number; duration: number }): Segment[];
}

export interface CoverTimeline {
  /** Start time (seconds) of each named stage; labels come from the registry. */
  stages: readonly number[];
  build(helpers: TimelineHelpers): ReadonlyArray<Segment | readonly [Element, Keyframes, SegmentOptions]>;
}

type Playback = ReturnType<typeof animate>;
type State = "static" | "playing" | "paused" | "done";

const EASE_OUT = [0.23, 1, 0.32, 1];
const reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const MOVING = new Set(["x", "y", "scale", "rotate"]);

function helpersFor(root: Element): TimelineHelpers {
  const all = (hook: string) => Array.from(root.querySelectorAll(`[data-el="${hook}"]`));
  const one = (hook: string) => {
    const found = root.querySelector(`[data-el="${hook}"]`);
    if (!found) throw new Error(`cover: missing [data-el="${hook}"]`);
    return found;
  };
  const travel: TimelineHelpers["travel"] = (hook, route, { at, duration }) => {
    const body = one(`${hook}-body`);
    return [
      [body, { x: route.map((p) => p[0]), y: route.map((p) => p[1]) }, { at, duration, ease: EASE_OUT }],
      [body, { opacity: [0, 1, 1, 0] }, { at, duration, times: [0, 0.18, 0.78, 1], ease: "linear" }],
    ];
  };
  return { all, one, travel };
}

/** Reduced motion: keep the order and the fades, drop every positional change. */
function calm(segments: ReadonlyArray<Segment>): Segment[] {
  const out: Segment[] = [];
  for (const [element, keyframes, options] of segments) {
    const kept = Object.fromEntries(Object.entries(keyframes).filter(([prop]) => !MOVING.has(prop)));
    if (Object.keys(kept).length === 0) continue;
    if (element.closest(".cv-packet")) continue;
    out.push([element, kept, { ...options, duration: Math.min(options.duration, 0.12), ease: "linear" }]);
  }
  return out;
}

function setup(root: HTMLElement): void {
  const id = root.dataset.cover ?? "";
  const timeline = TIMELINES[id];
  if (!timeline) return;
  const uid = root.dataset.coverUid ?? "";
  const panel = uid ? document.querySelector<HTMLElement>(`[data-cover-controls="${uid}"]`) : null;
  const toggle = panel?.querySelector<HTMLButtonElement>("[data-cover-toggle]") ?? null;
  const replay = panel?.querySelector<HTMLButtonElement>("[data-cover-replay]") ?? null;
  const stageLabel = panel?.querySelector<HTMLElement>("[data-cover-stage]") ?? null;
  const stageNames: string[] = JSON.parse(panel?.dataset.stages ?? "[]");

  let playback: Playback | null = null;
  let state: State = "static";
  let autoPaused = false; // paused by scrolling away or a hidden tab, not by the person
  let engaged = false; // pointer is inside the hover zone, or the card has keyboard focus
  let inView = false;
  let frame = 0;

  const setState = (next: State): void => {
    state = next;
    root.dataset.state = next;
    if (panel) panel.dataset.state = next;
    if (toggle) {
      const playing = next === "playing";
      const again = next === "done" && !replay;
      const label = playing ? panel?.dataset.labelPause : again ? toggle.dataset.labelReplay : panel?.dataset.labelPlay;
      toggle.setAttribute("aria-label", label ?? "");
      toggle.dataset.icon = playing ? "pause" : again ? "replay" : "play";
    }
  };

  const showStage = (): void => {
    if (!stageLabel || stageNames.length === 0) return;
    const time = playback ? Number(playback.time) : 0;
    let index = 0;
    timeline.stages.forEach((start, i) => {
      if (time >= start) index = i;
    });
    const done = state === "done" || state === "static";
    const text = done ? stageNames[stageNames.length - 1] : stageNames[index];
    const label = `${done ? stageNames.length : index + 1}/${stageNames.length} · ${text}`;
    if (stageLabel.textContent !== label) stageLabel.textContent = label;
  };

  const tick = (): void => {
    showStage();
    if (state === "playing") frame = requestAnimationFrame(tick);
  };

  const start = (): void => {
    playback?.cancel();
    const segments = timeline.build(helpersFor(root)) as Segment[];
    const sequence = reduceQuery.matches ? calm(segments) : segments;
    playback = animate(sequence as never);
    autoPaused = false;
    setState("playing");
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(tick);
    const current = playback;
    current.finished
      .then(() => {
        if (playback === current) {
          setState("done");
          showStage();
        }
      })
      .catch(() => undefined);
  };

  const pause = (automatic: boolean): void => {
    if (state !== "playing" || !playback) return;
    playback.pause();
    autoPaused = automatic;
    setState("paused");
    showStage();
  };

  const resume = (): void => {
    if (state !== "paused" || !playback) return;
    playback.play();
    autoPaused = false;
    setState("playing");
    frame = requestAnimationFrame(tick);
  };

  toggle?.addEventListener("click", () => {
    if (state === "playing") pause(false);
    else if (state === "paused") resume();
    else start();
  });
  replay?.addEventListener("click", () => start());

  // At rest: the completed picture.
  setState("done");
  showStage();
  if (panel) panel.hidden = false;

  // ---- hover / focus zone ------------------------------------------------------
  const zone = root.closest<HTMLElement>("[data-cover-zone]") ?? root;
  const engage = (): void => {
    if (engaged || reduceQuery.matches) return;
    engaged = true;
    if (state === "paused") resume();
    else if (state === "done") start();
  };
  const release = (): void => {
    if (!engaged) return;
    engaged = false;
    pause(false);
  };
  zone.addEventListener("pointerenter", (event) => {
    if (event.pointerType === "mouse" || event.pointerType === "pen") engage();
  });
  zone.addEventListener("pointerleave", (event) => {
    if (event.pointerType === "mouse" || event.pointerType === "pen") release();
  });
  // Keyboard users get the same behaviour from focusing the card's link.
  zone.addEventListener("focusin", (event) => {
    const target = event.target as HTMLElement | null;
    if (target?.closest("[data-cover-controls]")) return;
    if (target?.matches(":focus-visible")) engage();
  });
  zone.addEventListener("focusout", (event) => {
    const next = event.relatedTarget as Node | null;
    if (next && zone.contains(next)) return;
    if (!zone.matches(":hover")) release();
  });

  // ---- never animate where nobody is looking ---------------------------------
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        inView = entry.intersectionRatio >= 0.15;
        if (!inView) {
          if (state === "playing") pause(true);
        } else if (autoPaused && engaged && !document.hidden) {
          resume();
        }
      }
    },
    { threshold: [0, 0.15] },
  );
  observer.observe(root);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      if (state === "playing") pause(true);
    } else if (autoPaused && engaged && inView) {
      resume();
    }
  });
}

document.querySelectorAll<HTMLElement>("[data-cover]").forEach(setup);
