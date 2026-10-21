// One-shot reveal: marks an element data-in="true" the first time it is
// 30% visible, and stops watching. The motion itself is CSS on that
// attribute (clip-path / transform / opacity only), so no-JS and reduced
// motion get the end state from the same stylesheet.

export function revealOnce(el: HTMLElement, threshold = 0.3): () => void {
  if (el.dataset["in"] === "true") {
    return () => {};
  }
  if (typeof IntersectionObserver === "undefined") {
    el.dataset["in"] = "true";
    return () => {};
  }
  el.dataset["in"] = "false";
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        el.dataset["in"] = "true";
        observer.disconnect();
      }
    },
    { threshold },
  );
  observer.observe(el);
  return () => observer.disconnect();
}
