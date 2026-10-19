// The Harness slot of the spec table (UI-FORMS U10): the value turns over on
// its top edge every 2.4s, rotateX(-90deg) to 0, like a13n's spec rows
// (refs/devices/crops/a13n-spec-table.jpg, mid-flip in refs/a13n/cdp/
// d1440-y01554.jpg).
//
// DOM contract: [data-flip] holds one [data-flip-item] per value; the first
// is shown, the rest carry [hidden]. End state (no JavaScript, reduced
// motion): the first value, with the other names listed under the table.

import { prefersReducedMotion, watchVisibility } from "./motion";

const HOLD_MS = 2400;
const TURN_MS = 520;
const EASE = "cubic-bezier(.16,1,.3,1)";

export function mountFlipSlot(root: HTMLElement): () => void {
  const items = Array.from(
    root.querySelectorAll<HTMLElement>("[data-flip-item]"),
  );
  if (items.length < 2 || prefersReducedMotion()) {
    return () => {};
  }

  let index = 0;
  let timer: number | undefined;
  // Hides the static list of the other names (CSS: [data-live] + .i-flip-rest).
  root.dataset["live"] = "";

  const turn = (): void => {
    const out = items[index];
    index = (index + 1) % items.length;
    const next = items[index];
    if (!out || !next) {
      return;
    }
    out.animate(
      [
        { transform: "rotateX(0deg)", opacity: 1 },
        { transform: "rotateX(90deg)", opacity: 0 },
      ],
      { duration: TURN_MS / 2, easing: "ease-in", fill: "forwards" },
    ).onfinish = () => {
      out.hidden = true;
      next.hidden = false;
      next.animate(
        [
          { transform: "rotateX(-90deg)", opacity: 0 },
          { transform: "rotateX(0deg)", opacity: 1 },
        ],
        { duration: TURN_MS, easing: EASE, fill: "none" },
      );
    };
  };

  const stop = (): void => {
    if (timer !== undefined) {
      window.clearInterval(timer);
      timer = undefined;
    }
  };

  const unwatch = watchVisibility(root, (visible) => {
    if (visible && timer === undefined) {
      timer = window.setInterval(turn, HOLD_MS);
    } else if (!visible) {
      stop();
    }
  });

  return () => {
    unwatch();
    stop();
    delete root.dataset["live"];
  };
}
