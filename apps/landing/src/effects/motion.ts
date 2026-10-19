// Shared helpers for the page's effect engines. Every engine animates only
// transform, opacity or clip-path, and every one has a static end state: the
// markup renders that end state without JavaScript, and an engine only adds
// motion when it runs and the visitor allows motion.

export function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/** Calls `onChange(visible)` when the element enters or leaves the viewport. */
export function watchVisibility(
  element: Element,
  onChange: (visible: boolean) => void,
): () => void {
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      onChange(entry.isIntersecting);
    }
  });
  observer.observe(element);
  return () => {
    observer.disconnect();
  };
}
