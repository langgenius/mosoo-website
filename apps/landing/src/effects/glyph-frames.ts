// Braille glyph frames for the line that is still running (Ploy's three-verb
// icons, refs/devices/crops/ploy-braille-icons-closeup.jpg: about 120ms a
// frame). The element's text is the frame; nothing else moves.
//
// End state (no JavaScript, reduced motion, off screen): the fourth frame,
// which the markup already renders.

import { prefersReducedMotion, watchVisibility } from "./motion";

export const GLYPH_FRAMES = [
  "⠋",
  "⠙",
  "⠹",
  "⠸",
  "⠼",
  "⠴",
  "⠦",
  "⠧",
  "⠇",
  "⠏",
] as const;
export const GLYPH_REST_FRAME = GLYPH_FRAMES[3];
const FRAME_MS = 120;

export function mountGlyphFrames(element: HTMLElement): () => void {
  if (prefersReducedMotion()) {
    element.textContent = GLYPH_REST_FRAME;
    return () => {};
  }

  let frame = 3;
  let timer: number | undefined;

  const stop = (): void => {
    if (timer !== undefined) {
      window.clearInterval(timer);
      timer = undefined;
    }
  };

  const start = (): void => {
    if (timer !== undefined) {
      return;
    }
    timer = window.setInterval(() => {
      frame = (frame + 1) % GLYPH_FRAMES.length;
      element.textContent = GLYPH_FRAMES[frame] ?? GLYPH_REST_FRAME;
    }, FRAME_MS);
  };

  const unwatch = watchVisibility(element, (visible) => {
    if (visible) {
      start();
    } else {
      stop();
    }
  });

  return () => {
    unwatch();
    stop();
    element.textContent = GLYPH_REST_FRAME;
  };
}
