// Shared plumbing for the home's effect engines. Every engine writes only
// transform, opacity or clip-path, renders a pure function of time or scroll
// progress, and leaves the markup's own end state alone when it cannot run
// (no JavaScript, or prefers-reduced-motion).

export const EASE_OUT = (t: number): number => 1 - (1 - t) ** 4; // close to cubic-bezier(.16,1,.3,1)
export const clamp01 = (n: number): number => Math.min(1, Math.max(0, n));

export function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Proof hook: with ?fxproof in the URL, engines register a seek function so a
 * capture script can render any moment deterministically (the frames in
 * v4b/proof). Without the flag nothing is exposed.
 */
type Seek = (value: number) => void;
const proof = new URLSearchParams(window.location.search).has("fxproof");

export function registerSeek(name: string, seek: Seek): void {
  if (!proof) {
    return;
  }
  const registry = ((window as unknown as { __paperFx?: Record<string, Seek> }).__paperFx ??= {});
  registry[name] = seek;
}

export const isProof = proof;

/** Runs `render(elapsedMs)` every frame until it returns false. */
export function loop(render: (elapsed: number) => boolean): () => void {
  let id = 0;
  const start = performance.now();
  const tick = (now: number): void => {
    if (render(now - start)) {
      id = requestAnimationFrame(tick);
    }
  };
  id = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(id);
}
