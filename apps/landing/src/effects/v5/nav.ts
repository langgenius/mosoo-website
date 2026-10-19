// Nav morph (v5 BRIEF §3.4 「导航收拢」, §4 row 0), declared with [data-nav].
//
// - Progress, not a trigger (ramp.design, staging refs/ramp-design/v5/STUDY.md §4.1): p = clamp(scrollY / range),
//   range 400 px by default (BRIEF: 约 400; ramp.design measured 504 at 1440 × 900). The engine writes one custom
//   property, --nav-p, and the CSS derives every size from it, the way ramp.design derives its 30 --v2-* variables
//   from one progress (nav-probe/vars-1440.json). p = 0 is the loose full-width bar; p = 1 is Save.design's
//   floating end state: centred, top 12 px, rounded, glass (study §1.3). Linear in scroll, so the damped scroll
//   makes it glide; scrolling back plays it backwards.
// - CTA (savee.com, study §3.1): data-nav-cta-state="on" once the hero CTA ([data-nav-cta-watch]) has gone
//   behind the bar, "off" while it is visible or below. The CSS opens the slot max-width 0 → 200 px, opacity 0 → 1,
//   180 ms cubic-bezier(0, 0, .2, 1). A closed slot is inert, so keyboard focus never lands on an invisible link.
//   With no [data-nav-cta-watch] on the page, savee.com's own rule applies: scrollY > 80.
// - Theme (Ramp, study §5.3 / §5.5): data-nav-theme="<value>" while a [data-theme-zone="<value>"] section is under
//   the bar's centre line. The CSS swaps the glass in 0.1 s cubic-bezier(.4, 0, .2, 1), so white glass never
//   greys the full lime screen.
//
// Also written: data-nav-mode="live" (the CSS fixes the bar only then, so a failed or missing script leaves it in
// the page) and data-nav-state="top" | "morph" | "float". Reduced motion holds p at 1 (ramp.design gives its
// compact bar directly under reduced motion, nav-css.json) and the CSS drops the transitions.
// Options: data-nav-range="400" (px of scroll for the morph), data-nav-line="40" (px from the viewport top to the
// bar's centre line, used for the theme zones), data-nav-clear="68" (px from the viewport top to the floating bar's
// bottom edge, used for the CTA). Keep the last two in step with the CSS bar size.

const RANGE_PX = 400;
const LINE_PX = 40; // 12 px top + half of a 56 px floating bar
const CTA_CLEAR_PX = 68; // the hero CTA counts as gone once its bottom passes the float bar (12 + 56 px)
const CTA_FALLBACK_Y = 80; // savee.com: scrollY > 80 (save-design/v5/savee-com-nav/threshold.json)

function numberAttr(el: Element, name: string, fallback: number): number {
  const value = Number.parseFloat(el.getAttribute(name) ?? "");
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

/** Wires the first [data-nav] in root. Returns a cleanup. */
export function initNav(root: ParentNode = document): () => void {
  const nav = root.querySelector<HTMLElement>("[data-nav]");
  if (!nav) {
    return () => {};
  }
  const range = numberAttr(nav, "data-nav-range", RANGE_PX);
  const line = numberAttr(nav, "data-nav-line", LINE_PX);
  const clear = numberAttr(nav, "data-nav-clear", CTA_CLEAR_PX);
  const slot = nav.querySelector<HTMLElement>("[data-nav-cta]");
  const watch = document.querySelector<HTMLElement>("[data-nav-cta-watch]");
  const zones = [...document.querySelectorAll<HTMLElement>("[data-theme-zone]")];
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const canObserve = typeof IntersectionObserver !== "undefined";

  let frame = 0;
  let lastP = "";
  let ctaOn: boolean | null = null;

  const setCta = (on: boolean): void => {
    if (on === ctaOn) {
      return;
    }
    ctaOn = on;
    nav.dataset["navCtaState"] = on ? "on" : "off";
    if (slot) {
      slot.inert = !on;
    }
  };

  const update = (): void => {
    frame = 0;
    const y = window.scrollY;
    const p = reduce.matches ? 1 : Math.min(1, Math.max(0, y / range));
    const value = p.toFixed(4);
    if (value !== lastP) {
      lastP = value;
      nav.style.setProperty("--nav-p", value);
    }
    const state = p <= 0 ? "top" : p >= 1 ? "float" : "morph";
    if (nav.dataset["navState"] !== state) {
      nav.dataset["navState"] = state;
    }
    if (!watch || !canObserve) {
      setCta(y > CTA_FALLBACK_Y);
    }
  };

  const onScroll = (): void => {
    if (!frame) {
      frame = requestAnimationFrame(update);
    }
  };

  // CTA: the watched hero CTA is "gone" when it has left through the top, behind the floating bar.
  const ctaIo =
    watch && canObserve
      ? new IntersectionObserver(
          ([entry]) => {
            if (entry) {
              const top = entry.rootBounds?.top ?? clear;
              setCta(!entry.isIntersecting && entry.boundingClientRect.bottom <= top + 1);
            }
          },
          { rootMargin: `-${clear}px 0px 0px 0px` },
        )
      : null;
  if (ctaIo && watch) {
    ctaIo.observe(watch);
  }

  // Theme: a 1 px observation band on the bar's centre line; rebuilt when the viewport height changes.
  const under = new Set<HTMLElement>();
  let themeIo: IntersectionObserver | null = null;
  let builtFor = -1;
  const applyTheme = (): void => {
    const zone = zones.filter((z) => under.has(z)).pop();
    const theme = zone?.dataset["themeZone"];
    if (theme) {
      if (nav.dataset["navTheme"] !== theme) {
        nav.dataset["navTheme"] = theme;
      }
    } else if (nav.dataset["navTheme"] !== undefined) {
      delete nav.dataset["navTheme"];
    }
  };
  const buildThemeIo = (): void => {
    const viewH = window.innerHeight;
    if (!zones.length || !canObserve || viewH === builtFor) {
      return;
    }
    builtFor = viewH;
    themeIo?.disconnect();
    under.clear();
    themeIo = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.target instanceof HTMLElement) {
            if (entry.isIntersecting) {
              under.add(entry.target);
            } else {
              under.delete(entry.target);
            }
          }
        }
        applyTheme();
      },
      { rootMargin: `-${line}px 0px -${Math.max(0, viewH - line - 1)}px 0px` },
    );
    for (const zone of zones) {
      themeIo.observe(zone);
    }
  };

  const onResize = (): void => {
    buildThemeIo();
    onScroll();
  };

  nav.dataset["navMode"] = "live";
  if (watch && canObserve) {
    setCta(false);
  }
  update();
  buildThemeIo();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onResize, { passive: true });
  reduce.addEventListener("change", onScroll);

  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onResize);
    reduce.removeEventListener("change", onScroll);
    ctaIo?.disconnect();
    themeIo?.disconnect();
    for (const key of ["navMode", "navState", "navCtaState", "navTheme"]) {
      delete nav.dataset[key];
    }
    nav.style.removeProperty("--nav-p");
    if (slot) {
      slot.inert = false;
    }
  };
}
