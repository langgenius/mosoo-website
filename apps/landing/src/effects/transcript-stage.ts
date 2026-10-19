// The signature effect of the instrument page: a pinned transcript (UI-FORMS
// U12) that prints one line at a time as the page scrolls, beside a vertical
// time ruler (U14) whose dot walks from +0 to +7 days.
//
// Sources: Enter Code's transcript card (refs/devices/crops/
// enter-code-transcript-card.jpg), AnyCap's fixed-height replay with a faded
// top (crops/anycap-terminal-replay.jpg), ElevenLabs' tick ruler (crops/
// elevenlabs-tick-ruler-timeline.jpg), turned upright.
//
// DOM contract:
//   [data-stage]            the runway; CSS makes it tall and the frame sticky
//                           only while [data-live] is set
//   [data-stage-frame]      the sticky frame
//   [data-stage-track]      the lines in a fixed-height body: bottom-anchored
//                           in the end state, top-anchored while live
//   [data-at]               a line, revealed once progress reaches its value
//   [data-ruler-at]         that line's place on the ruler (0..1)
//   [data-ruler-dot]        the dot on the ruler
//   [data-ruler]            the ruler (its height scales the dot)
//
// End state (no JavaScript, reduced motion, narrow screens, or a frame that
// cannot pin): every line printed, the last one current, the dot at +7 days.
// The markup renders exactly that.

import { clamp01, prefersReducedMotion } from "./motion";

const WIDE = "(min-width: 901px)";

type Line = {
  element: HTMLElement;
  at: number;
  rulerAt: number;
  top: number;
  height: number;
};

export function mountTranscriptStage(root: HTMLElement): () => void {
  const frame = root.querySelector<HTMLElement>("[data-stage-frame]");
  const track = root.querySelector<HTMLElement>("[data-stage-track]");
  const body = track?.parentElement;
  const ruler = root.querySelector<HTMLElement>("[data-ruler]");
  const dot = root.querySelector<HTMLElement>("[data-ruler-dot]");
  if (!frame || !track || !body || !ruler || !dot) {
    return () => {};
  }

  const lines: Line[] = Array.from(
    track.querySelectorAll<HTMLElement>("[data-at]"),
  ).map((element) => ({
    element,
    at: Number(element.dataset["at"] ?? 0),
    rulerAt: Number(element.dataset["rulerAt"] ?? 0),
    top: 0,
    height: 0,
  }));
  const wide = window.matchMedia(WIDE);
  let raf = 0;
  let current = -1;
  let rulerHeight = 0;

  const measure = (): void => {
    for (const line of lines) {
      line.top = line.element.offsetTop;
      line.height = line.element.offsetHeight;
    }
    rulerHeight = ruler.offsetHeight;
  };

  const setEndState = (): void => {
    delete root.dataset["live"];
    track.style.transform = "";
    dot.style.transform = "";
    for (const line of lines) {
      line.element.removeAttribute("data-hidden");
      line.element.toggleAttribute(
        "data-current",
        line === lines[lines.length - 1],
      );
    }
    current = lines.length - 1;
  };

  const render = (): void => {
    raf = 0;
    // A frame that does not pin (a capture tool, an ancestor with overflow)
    // would leave the runway empty: show the end state instead.
    if (getComputedStyle(frame).position !== "sticky") {
      setEndState();
      return;
    }
    const box = root.getBoundingClientRect();
    const travel = box.height - window.innerHeight;
    const progress = travel > 0 ? clamp01(-box.top / travel) : 1;

    let last = 0;
    for (const [index, line] of lines.entries()) {
      if (progress >= line.at) {
        last = index;
      }
    }

    if (last !== current) {
      current = last;
      for (const [index, line] of lines.entries()) {
        line.element.toggleAttribute("data-hidden", index > last);
        line.element.toggleAttribute("data-current", index === last);
      }
      // While live, the body is top-anchored: lines print from the top and
      // the track only moves up once the printed lines overflow the body.
      const shown = lines[last];
      const style = getComputedStyle(body);
      const room =
        body.clientHeight -
        parseFloat(style.paddingTop) -
        parseFloat(style.paddingBottom);
      const overflow = shown ? shown.top + shown.height - room : 0;
      track.style.transform = `translate3d(0, ${-Math.max(0, overflow)}px, 0)`;
    }

    // The dot walks between the ruler places of the printed line and the
    // next one, so the long wait (+1 day to +7 days) is travelled by scrolling.
    const from = lines[last];
    const to = lines[last + 1];
    let place = from?.rulerAt ?? 0;
    if (from && to && to.at > from.at) {
      const t = clamp01((progress - from.at) / (to.at - from.at));
      place = from.rulerAt + (to.rulerAt - from.rulerAt) * t;
    }
    dot.style.transform = `translate3d(0, ${(place * rulerHeight).toFixed(1)}px, 0)`;
  };

  const schedule = (): void => {
    if (raf === 0) {
      raf = window.requestAnimationFrame(render);
    }
  };

  const onResize = (): void => {
    if (!wide.matches || prefersReducedMotion()) {
      stop();
      setEndState();
      return;
    }
    start();
  };

  let running = false;
  const start = (): void => {
    if (!running) {
      running = true;
      root.dataset["live"] = "";
      window.addEventListener("scroll", schedule, { passive: true });
    }
    measure();
    current = -1;
    schedule();
  };
  const stop = (): void => {
    running = false;
    window.removeEventListener("scroll", schedule);
    if (raf !== 0) {
      window.cancelAnimationFrame(raf);
      raf = 0;
    }
  };

  window.addEventListener("resize", onResize);
  wide.addEventListener("change", onResize);
  // Someone else may unpin the frame (a capture tool sets position: static);
  // re-check at once so the runway collapses before the page is measured.
  const styleWatch = new MutationObserver(schedule);
  styleWatch.observe(frame, { attributes: true, attributeFilter: ["style"] });
  onResize();

  return () => {
    stop();
    styleWatch.disconnect();
    window.removeEventListener("resize", onResize);
    wide.removeEventListener("change", onResize);
    setEndState();
  };
}
