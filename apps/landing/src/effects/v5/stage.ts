// Scroll stage (v5 BRIEF §3.4 「舞台」, §4 row 2), declared with [data-stage]. One tall section with a sticky
// layer turns scroll into a progress, the progress into a current step, and the CSS does the rest.
//
// Reverse-engineered from CTRL's product-frame narrative (SliceScrollableAppScreens, staging
// refs/ctrl/v5/STUDY.md §1.6): a ~4.5-screen section around a 100vh sticky layer; the step cards follow the
// progress; the frame's screens switch at fixed points (triggered, not scrubbed) in 0.9 s with CTRL's CustomEase,
// fitted as cubic-bezier(.531, .247, .35, 1) (no overshoot, max error .023; the T6 proof folder's
// data/ease-fit.json). Keeps the v4c engine's shape (v4c apps/landing/src/effects/stage.ts): pinned only when wide
// and motion is allowed; otherwise it writes nothing, and the CSS default (all steps stacked) is the end state.
//
// Unlike v4c it draws no motion itself. Per frame it writes:
//   [data-stage]       data-stage-mode="pinned", data-step="k", --stage-p (0–1 over the pinned run), and
//                      data-stage-ready two frames after pinning (the CSS hangs its transitions on it, so the first
//                      pinned paint never animates)
//   [data-stage-step]  data-stage-state="past" | "active" | "next", --step-p (0–1 across that step's span)
// Step k is active from at[k] to at[k + 1] (data-stage-at="0,0.34,0.67"; default k / n). Step 0 is active before
// the pin starts and the last step after it ends, so neither edge has an empty frame; between steps the CSS keeps
// the outgoing layer opaque under the incoming one (README), so no switch has one either. (v4c's empty frames at
// p = .05 and .37 came from leaving before entering.)
// Options: data-stage-media (default "(min-width: 901px)"), data-stage-at.

const WIDE = "(min-width: 901px)";

function thresholds(raw: string | undefined, n: number): number[] {
  const parsed = (raw ?? "").split(",").map((s) => Number.parseFloat(s));
  const valid =
    parsed.length === n &&
    parsed.every((v, i) => Number.isFinite(v) && v >= 0 && v <= 1 && (i === 0 || v >= (parsed[i - 1] ?? 0)));
  return valid ? parsed : Array.from({ length: n }, (_, i) => i / n);
}

const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));

function mountStage(stage: HTMLElement): () => void {
  const groups = new Map<number, HTMLElement[]>();
  for (const el of stage.querySelectorAll<HTMLElement>("[data-stage-step]")) {
    const k = Number(el.dataset["stageStep"]);
    if (Number.isInteger(k) && k >= 0) {
      groups.set(k, [...(groups.get(k) ?? []), el]);
    }
  }
  const n = groups.size ? Math.max(...groups.keys()) + 1 : 0;
  if (n === 0) {
    return () => {};
  }
  const at = thresholds(stage.dataset["stageAt"], n);
  const wide = window.matchMedia(stage.dataset["stageMedia"] ?? WIDE);
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  let pinned = false;
  let top = 0;
  let run = 1;
  let frame = 0;
  let readyFrame = 0;
  let step = -1;
  let lastP = "";
  const lastLocal = new Map<HTMLElement, string>();

  const measure = (): void => {
    top = stage.getBoundingClientRect().top + window.scrollY;
    run = Math.max(1, stage.offsetHeight - window.innerHeight);
  };

  const render = (): void => {
    frame = 0;
    const p = clamp01((window.scrollY - top) / run);
    const value = p.toFixed(4);
    if (value !== lastP) {
      lastP = value;
      stage.style.setProperty("--stage-p", value);
    }
    let k = 0;
    for (let i = 1; i < n; i++) {
      if (p >= (at[i] ?? 1)) {
        k = i;
      }
    }
    if (k !== step) {
      step = k;
      stage.dataset["step"] = String(k);
      for (const [i, els] of groups) {
        const state = i < k ? "past" : i === k ? "active" : "next";
        for (const el of els) {
          el.dataset["stageState"] = state;
        }
      }
    }
    for (const [i, els] of groups) {
      const a = at[i] ?? 0;
      const b = i + 1 < n ? (at[i + 1] ?? 1) : 1;
      const local = (b > a ? clamp01((p - a) / (b - a)) : p >= a ? 1 : 0).toFixed(4);
      for (const el of els) {
        if (lastLocal.get(el) !== local) {
          lastLocal.set(el, local);
          el.style.setProperty("--step-p", local);
        }
      }
    }
  };

  const onScroll = (): void => {
    if (pinned && !frame) {
      frame = requestAnimationFrame(render);
    }
  };

  const clear = (): void => {
    cancelAnimationFrame(frame);
    cancelAnimationFrame(readyFrame);
    frame = 0;
    readyFrame = 0;
    step = -1;
    lastP = "";
    lastLocal.clear();
    delete stage.dataset["stageMode"];
    delete stage.dataset["stageReady"];
    delete stage.dataset["step"];
    stage.style.removeProperty("--stage-p");
    for (const els of groups.values()) {
      for (const el of els) {
        delete el.dataset["stageState"];
        el.style.removeProperty("--step-p");
      }
    }
  };

  const setMode = (): void => {
    const want = wide.matches && !reduce.matches;
    if (want !== pinned) {
      pinned = want;
      if (!pinned) {
        clear();
        return;
      }
      stage.dataset["stageMode"] = "pinned"; // the CSS makes the section tall and the layer sticky from here
      measure();
      render();
      // Frame 1 paints the first pinned state; from frame 2 on, state changes may transition.
      readyFrame = requestAnimationFrame(() => {
        readyFrame = requestAnimationFrame(() => {
          readyFrame = 0;
          stage.dataset["stageReady"] = "";
        });
      });
      return;
    }
    if (pinned) {
      measure();
      render();
    }
  };

  // Content above the stage (fonts, images) moves it; re-measure whenever the page or the stage changes size.
  const resize = new ResizeObserver(setMode);
  resize.observe(stage);
  resize.observe(document.body);
  wide.addEventListener("change", setMode);
  reduce.addEventListener("change", setMode);
  window.addEventListener("resize", setMode, { passive: true });
  window.addEventListener("scroll", onScroll, { passive: true });
  setMode();

  return () => {
    resize.disconnect();
    wide.removeEventListener("change", setMode);
    reduce.removeEventListener("change", setMode);
    window.removeEventListener("resize", setMode);
    window.removeEventListener("scroll", onScroll);
    pinned = false;
    clear();
  };
}

/** Wires every [data-stage] in root. Returns a cleanup. */
export function initStage(root: ParentNode = document): () => void {
  const stops = [...root.querySelectorAll<HTMLElement>("[data-stage]")].map(mountStage);
  return () => {
    for (const stop of stops) {
      stop();
    }
  };
}
