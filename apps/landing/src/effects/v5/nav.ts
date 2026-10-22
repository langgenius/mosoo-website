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
// - Popovers ([popover] inside the bar: the Products panel, the language list and the phone sheet, which is the
//   <nav> itself; src/home/sections/nav.ts). The browser opens them from their popovertarget buttons and closes them
//   on Esc (focus back on the button) and on a click outside, with or without this script. The engine adds what the
//   browser leaves out: an open one closes once keyboard focus has moved off it and its button (Tab past its last
//   link), so focus never lands on the page under an open phone sheet (WCAG 2.4.11), and once its button is no
//   longer shown (a tablet turned to landscape with the sheet open: the bar is a row again).
// - Language: a click on a link to one of the site's locales (a same-origin a[hreflang] whose path starts /en, /zh
//   or /ja: the bar's list and the footer's) remembers it in the mosoo_locale cookie, which the worker's "/"
//   redirect reads before Accept-Language (shared/locale.ts rememberLocale, as the subpages' footer and production's
//   language menu do). The links lead to their page with or without it.
//
// Also written: data-nav-mode="live" (the CSS fixes the bar only then, so a failed or missing script leaves it in
// the page) and data-nav-state="top" | "morph" | "float". Reduced motion holds p at 1 (ramp.design gives its
// compact bar directly under reduced motion, nav-css.json) and the CSS drops the transitions.
// Options: data-nav-range="400" (px of scroll for the morph), data-nav-line="40" (px from the viewport top to the
// bar's centre line, used for the theme zones), data-nav-clear="68" (px from the viewport top to the floating bar's
// bottom edge, used for the CTA). Keep the last two in step with the CSS bar size.

import { isLocale, rememberLocale } from "../../shared/locale";

const RANGE_PX = 400;
const LINE_PX = 40; // 12 px top + half of a 56 px floating bar
const CTA_CLEAR_PX = 68; // the hero CTA counts as gone once its bottom passes the float bar (12 + 56 px)
const CTA_FALLBACK_Y = 80; // savee.com: scrollY > 80 (save-design/v5/savee-com-nav/threshold.json)
const BELOW_PX = 100000; // the CTA observer's box reaches this far below the viewport (see "CTA" in initNav)

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

  // CTA: the watched hero CTA is "gone" when it has left through the top, behind the floating bar. The observed box
  // runs from the bar's bottom edge to far below the viewport, so the one change it reports is the CTA crossing that
  // edge: a jump from below the fold to above it (an anchor link, End, a short phone where the hero CTA starts below
  // the fold) is still seen. With the viewport alone as the box, below and above were both "not intersecting", no
  // entry came, and the bar's CTA stayed off (en at 320 x 640 after the announcement moved the hero down 40px).
  const ctaIo =
    watch && canObserve
      ? new IntersectionObserver(
          ([entry]) => {
            if (entry) {
              const top = entry.rootBounds?.top ?? clear;
              setCta(!entry.isIntersecting && entry.boundingClientRect.bottom <= top + 1);
            }
          },
          { rootMargin: `-${clear}px 0px ${BELOW_PX}px 0px` },
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

  // Popovers: close an open one when focus lands outside it and its button, or when its button is not shown.
  const popovers = [...nav.querySelectorAll<HTMLElement>("[popover]")].map((panel) => ({
    panel,
    button: nav.querySelector(`[popovertarget="${CSS.escape(panel.id)}"]`),
  }));
  const isOpen = (panel: HTMLElement): boolean => panel.matches(":popover-open");
  // focusin, not focusout: focus has already moved, so closing never sends it back to the button.
  const onFocusIn = (event: FocusEvent): void => {
    const target = event.target;
    if (!(target instanceof Node)) {
      return;
    }
    for (const { panel, button } of popovers) {
      if (isOpen(panel) && !panel.contains(target) && !button?.contains(target)) {
        panel.hidePopover();
      }
    }
  };
  const closeUnreachable = (): void => {
    for (const { panel, button } of popovers) {
      if (isOpen(panel) && button && button.getClientRects().length === 0) {
        panel.hidePopover();
      }
    }
  };

  // Language: remember the reader's pick for the worker's "/" redirect.
  const onClick = (event: MouseEvent): void => {
    const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[hreflang]") : null;
    if (!link) {
      return;
    }
    const url = new URL(link.href, window.location.href);
    const code = url.pathname.split("/")[1] ?? "";
    if (url.origin === window.location.origin && isLocale(code)) {
      rememberLocale(code);
    }
  };

  const onResize = (): void => {
    buildThemeIo();
    closeUnreachable();
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
  document.addEventListener("focusin", onFocusIn);
  document.addEventListener("click", onClick);

  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onResize);
    reduce.removeEventListener("change", onScroll);
    document.removeEventListener("focusin", onFocusIn);
    document.removeEventListener("click", onClick);
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
