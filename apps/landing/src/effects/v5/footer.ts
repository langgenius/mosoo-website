// Footer reveal (v5 BRIEF §3.4 「页底升起」, §4 row 6), declared with [data-footer]: the links rise, then the
// brand row rises out of a seam and the mark draws itself; leaving the footer and coming back plays it again.
//
// Reverse-engineered from Intent's footer (intentapp.dev, Footer.astro: two IntersectionObservers + gsap.to;
// staging refs/intent/v5/STUDY.md §1.3–§1.7):
//   [data-footer-link]  translate 0 40px, opacity 0; 700 ms power3.out ≈ cubic-bezier(.25, 1, .5, 1); 200 ms apart
//   [data-footer-rise]  translate 0 120px, opacity 0; 1000 ms expo.out ≈ cubic-bezier(.16, 1, .3, 1); 200 ms apart
//                       (mark first, then wordmark), out of the overflow: clip seam of [data-footer-brand] (CSS)
//   trigger             [data-footer-links] / [data-footer-brand] top crossing the 85 % line (rootMargin -15 %)
//   replay              once the whole footer has left the viewport, everything resets unseen and plays again
//   timeline            Intent at 100 px / 70 ms: links −200 ms, mark 0, wordmark +200 ms (trace-footer-1440)
// The mark draws itself instead of Intent's Lottie (study §1.9: no lottie / GSAP for a footer):
//   [data-draw] (default "trim")  the stroke opens from the path's midpoint to both ends: Intent's Trim Paths
//                                 50/50 → 0/100, 600 ms cubic-bezier(.001, .41, 0, 1), 200 ms in, 67 ms apart
//   [data-draw="grow-x" | "grow-y"]  the path scales up from its centre / its bottom: Intent's bar, 667 ms
//                                 cubic-bezier(.9, 0, .1, 1), from 0
// Deliberate changes: the brand never starts sooner than 200 ms after the links, so the order holds at any scroll
// speed (on Intent it depends on the speed); no earlier trigger on phones (study §1.9); focus inside the footer
// reveals everything at once. Reduced motion, no JS, and a footer already on screen at load show the end state.

const OUT_QUART = "cubic-bezier(0.25, 1, 0.5, 1)";
const OUT_EXPO = "cubic-bezier(0.16, 1, 0.3, 1)";
const LINK = { dy: 40, ms: 700, ease: OUT_QUART, stagger: 200 };
const BRAND = { dy: 120, ms: 1000, ease: OUT_EXPO, stagger: 200 };
const LEAD_MS = 200; // links lead the brand by at least this much
const TRIM = { ms: 600, delay: 200, stagger: 67, ease: "cubic-bezier(0.001, 0.41, 0, 1)" };
const GROW = { ms: 667, ease: "cubic-bezier(0.9, 0, 0.1, 1)" };
const TRIGGER_MARGIN = "0px 0px -15% 0px";

type Phase = "wait" | "links" | "in";

/** Wires the first [data-footer] in root. Returns a cleanup. */
export function initFooter(root: ParentNode = document): () => void {
  const footer = root.querySelector<HTMLElement>("[data-footer]");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (!footer || reduce.matches || typeof IntersectionObserver === "undefined") {
    return () => {};
  }
  const links = [...footer.querySelectorAll<HTMLElement>("[data-footer-link]")];
  const rises = [...footer.querySelectorAll<HTMLElement>("[data-footer-rise]")];
  const draws = [...footer.querySelectorAll<SVGGeometryElement>("[data-draw]")];
  const linksBox = footer.querySelector<HTMLElement>("[data-footer-links]") ?? links[0] ?? null;
  const brandBox = footer.querySelector<HTMLElement>("[data-footer-brand]") ?? rises[0] ?? null;
  const running: Animation[] = [];
  let linksAt = -1; // performance.now() at which the links start; -1 = not yet
  let phase: Phase = "in";

  for (const path of draws) {
    path.setAttribute("pathLength", "1");
    const kind = path.dataset["draw"];
    if (kind === "grow-x" || kind === "grow-y") {
      path.style.transformBox = "fill-box";
      path.style.transformOrigin = kind === "grow-x" ? "50% 50%" : "50% 100%";
    }
  }

  const setPhase = (next: Phase): void => {
    phase = next;
    footer.dataset["footerState"] = next;
  };

  const hide = (el: HTMLElement, dy: number): void => {
    el.style.opacity = "0";
    el.style.setProperty("translate", `0 ${dy}px`);
  };

  const show = (el: HTMLElement): void => {
    el.style.removeProperty("opacity");
    el.style.removeProperty("translate");
  };

  const rise = (el: HTMLElement, spec: typeof LINK, delay: number): void => {
    running.push(
      el.animate([{ offset: 0, opacity: 0, translate: `0 ${spec.dy}px` }], {
        duration: spec.ms,
        delay,
        easing: spec.ease,
        fill: "backwards",
      }),
    );
    show(el); // the backwards fill holds the hidden values through the delay
  };

  const draw = (start: number): void => {
    let trim = 0;
    for (const path of draws) {
      const kind = path.dataset["draw"];
      if (kind === "grow-x" || kind === "grow-y") {
        const from = kind === "grow-x" ? "0 1" : "1 0";
        running.push(
          path.animate([{ offset: 0, scale: from }], {
            duration: GROW.ms,
            delay: start,
            easing: GROW.ease,
            fill: "backwards",
          }),
        );
      } else {
        running.push(
          path.animate(
            [
              { strokeDasharray: "0 1", strokeDashoffset: "-0.5" },
              { strokeDasharray: "1 0", strokeDashoffset: "0" },
            ],
            {
              duration: TRIM.ms,
              delay: start + TRIM.delay + trim++ * TRIM.stagger,
              easing: TRIM.ease,
              fill: "backwards",
            },
          ),
        );
      }
    }
  };

  const playLinks = (): void => {
    linksAt = performance.now();
    links.forEach((el, i) => rise(el, LINK, i * LINK.stagger));
    setPhase("links");
  };

  const playBrand = (): void => {
    if (linksAt < 0) {
      playLinks();
    }
    const start = Math.max(0, linksAt + LEAD_MS - performance.now());
    rises.forEach((el, i) => rise(el, BRAND, start + i * BRAND.stagger));
    draw(start);
    setPhase("in");
  };

  const trigger = new IntersectionObserver(
    (entries) => {
      const hit = new Set(entries.filter((entry) => entry.isIntersecting).map((entry) => entry.target));
      if (linksBox && hit.has(linksBox) && linksAt < 0) {
        trigger.unobserve(linksBox);
        playLinks();
      }
      if (brandBox && hit.has(brandBox) && phase !== "in") {
        trigger.unobserve(brandBox);
        playBrand();
      }
    },
    { rootMargin: TRIGGER_MARGIN },
  );

  const arm = (): void => {
    for (const animation of running.splice(0)) {
      animation.cancel();
    }
    links.forEach((el) => hide(el, LINK.dy));
    rises.forEach((el) => hide(el, BRAND.dy));
    linksAt = -1;
    setPhase("wait");
    if (linksBox) {
      trigger.observe(linksBox);
    }
    if (brandBox) {
      trigger.observe(brandBox);
    }
  };

  const revealNow = (): void => {
    trigger.disconnect();
    for (const animation of running.splice(0)) {
      animation.finish();
    }
    [...links, ...rises].forEach(show);
    linksAt = 0;
    setPhase("in");
  };

  // Replay: re-arm only while the whole footer is out of view, so the reset is never seen.
  const away = new IntersectionObserver(([entry]) => {
    if (entry && !entry.isIntersecting && phase !== "wait") {
      arm();
    }
  });

  if (footer.getBoundingClientRect().top >= window.innerHeight) {
    arm();
  } else {
    setPhase("in");
  }
  away.observe(footer);

  const onFocus = (event: FocusEvent): void => {
    if (phase !== "in" && event.target instanceof Node && footer.contains(event.target)) {
      revealNow();
    }
  };
  const onReduce = (): void => {
    if (reduce.matches) {
      away.disconnect();
      revealNow();
    }
  };
  footer.addEventListener("focusin", onFocus);
  reduce.addEventListener("change", onReduce);

  return () => {
    footer.removeEventListener("focusin", onFocus);
    reduce.removeEventListener("change", onReduce);
    away.disconnect();
    revealNow();
    trigger.disconnect();
    delete footer.dataset["footerState"];
  };
}
