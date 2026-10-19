// The v4c signature effect: the hero window opens into a pinned three-act stage. The hero is layer 0 of
// the pinned stage, so the hero window and the portal mask are one window (brand/outline README L131):
//
//   hero    0.00-0.07  a short hold, then the hero's words and tiles leave; the window glides to the centre
//   portal  0.07-0.17  the acts show through the logo block (clip-path: path()), which grows from the hero
//                      window's 112 px to past the viewport (ease-out). Until the block is about as wide as
//                      the act, the window holds only the S2 bands (the veil), never a crop of a sentence
//   act 1   0.10-0.37  U10 spec table, static
//   act 2   0.37-0.65  U04 feed: act 1 leaves first, then act 2 enters (never two titles at once);
//                      scrolling walks the feed from the first event to the newest
//   act 3   0.65-1.00  iris to night (clip-path: circle()), then the ruler's live dot travels to +7 days
//
// Sources: a13n pinned acts and night act (refs/a13n/cdp/d1440-y01554 / y02589 / y03165.jpg); Enter Pro
// portal mask (refs/enter-pro notes §2, crops/enter-pro-hero-portal.jpg); Ploy feed push
// (crops/ploy-feed-cards-live.jpg). One rAF loop with exponential smoothing (a13n:
// sp += (u - sp)(1 - e^(-9t))); it writes only transform, opacity and clip-path.
//
// End states without the effect: no JS, prefers-reduced-motion, <= 900 px, or a capture that sets the pin
// to position: static (tools/capture-v4.ts UNSTICK) all get the stacked layout home.css draws by default.

import { OUTLINE } from "../home/outline-geometry.ts";

const SMOOTHING = 9;
const WINDOW_W = 112;
/** The hero window's line sits this far below the block centre, in units of the block width. */
const LINE_DROP = (45.79 - 21.68) / OUTLINE.w;

const T = {
  // The words are gone before the gliding window reaches the H1, so the window never crosses a sentence.
  heroText: [0.015, 0.045],
  glide: [0.03, 0.07],
  portal: [0.07, 0.17],
  act1Out: [0.34, 0.37],
  act2In: [0.37, 0.41],
  feed: [0.4, 0.62],
  iris: [0.65, 0.75],
  travel: [0.77, 0.95],
} as const;

const clamp = (v: number, lo = 0, hi = 1): number => Math.min(hi, Math.max(lo, v));
const span = (p: number, a: number, b: number): number => clamp((p - a) / (b - a));
const easeOut = (t: number): number => 1 - (1 - t) ** 3;
const easeInOut = (t: number): number => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);

/** The logo block (concave sides) as an SVG path of width w, centred on (cx, cy). */
function blockPath(cx: number, cy: number, w: number): string {
  const k = w / OUTLINE.w;
  const h = OUTLINE.h * k;
  const s = OUTLINE.sag * k;
  const x = cx - w / 2;
  const y = cy - h / 2;
  const hh = h / 2;
  const f = (n: number): string => n.toFixed(1);
  return (
    `M${f(x)} ${f(y)}H${f(x + w)}` +
    `C${f(x + w - OUTLINE.k1 * s)} ${f(y + OUTLINE.k2 * hh)} ${f(x + w - s)} ${f(y + OUTLINE.k3 * hh)} ${f(x + w - s)} ${f(y + hh)}` +
    `C${f(x + w - s)} ${f(y + h - OUTLINE.k3 * hh)} ${f(x + w - OUTLINE.k1 * s)} ${f(y + h - OUTLINE.k2 * hh)} ${f(x + w)} ${f(y + h)}` +
    `H${f(x)}` +
    `C${f(x + OUTLINE.k1 * s)} ${f(y + h - OUTLINE.k2 * hh)} ${f(x + s)} ${f(y + h - OUTLINE.k3 * hh)} ${f(x + s)} ${f(y + hh)}` +
    `C${f(x + s)} ${f(y + OUTLINE.k3 * hh)} ${f(x + OUTLINE.k1 * s)} ${f(y + OUTLINE.k2 * hh)} ${f(x)} ${f(y)}Z`
  );
}

function setStyle(
  el: HTMLElement | SVGElement,
  prop: "transform" | "opacity" | "clipPath" | "visibility",
  value: string,
): void {
  if (el.style[prop] !== value) el.style[prop] = value;
}

function setAttr(el: Element, name: string, value: string): void {
  if (el.getAttribute(name) !== value) el.setAttribute(name, value);
}

export function initStage(): void {
  const stage = document.querySelector<HTMLElement>("[data-stage]");
  const pin = stage?.querySelector<HTMLElement>("[data-pin]");
  const acts = stage?.querySelector<HTMLElement>("[data-portal]");
  const act1 = stage?.querySelector<HTMLElement>('[data-act="1"]');
  const act2 = stage?.querySelector<HTMLElement>('[data-act="2"]');
  const act3 = stage?.querySelector<HTMLElement>('[data-act="3"]');
  const feed = stage?.querySelector<HTMLElement>("[data-feed]");
  const ruler = stage?.querySelector<HTMLElement>("[data-ruler]");
  const now = stage?.querySelector<HTMLElement>("[data-now]");
  const frame = stage?.querySelector<SVGSVGElement>("[data-portal-frame]");
  const frameBlock = frame?.querySelector<SVGPathElement>("[data-frame-block]");
  const frameLine = frame?.querySelector<SVGPathElement>("[data-frame-line]");
  const veil = stage?.querySelector<HTMLElement>("[data-portal-veil]");
  const hero = stage?.querySelector<HTMLElement>("[data-hero]");
  const heroWindow = hero?.querySelector<HTMLElement>("[data-hero-window]");
  if (!stage || !pin || !acts || !act1 || !act2 || !act3 || !feed || !ruler || !now || !frame || !veil) return;
  if (!frameBlock || !frameLine || !hero || !heroWindow) return;
  const heroParts = [...hero.querySelectorAll<HTMLElement>("[data-hero-part]")];
  const nav = document.querySelector<HTMLElement>("[data-nav]");
  const navItems = nav ? [...nav.querySelectorAll<HTMLElement>(".v4-brand, .v4-nav-link, .v4-btn")] : [];
  const cards = [...feed.querySelectorAll<HTMLElement>("[data-card]")];

  const wide = matchMedia("(min-width: 901px)");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");

  let pinned = false;
  let raf = 0;
  let last = 0;
  let sp = 0;
  let top = 0;
  let run = 1;
  // Offset from the hero window's resting centre to the stage centre, where the portal opens.
  let glideX = 0;
  let glideY = 0;
  // Radius at which the night iris reaches each nav item's centre (the item turns light there).
  let navReach: number[] = [];

  const progress = (): number => clamp((window.scrollY - top) / run);

  function measure(): void {
    top = stage!.getBoundingClientRect().top + window.scrollY;
    run = Math.max(1, stage!.offsetHeight - window.innerHeight);
    const kept = heroWindow!.style.transform;
    heroWindow!.style.transform = "none";
    const r = heroWindow!.getBoundingClientRect();
    const box = pin!.getBoundingClientRect();
    heroWindow!.style.transform = kept;
    glideX = box.left + box.width / 2 - (r.left + r.width / 2);
    glideY = box.top + box.height / 2 - (r.top + r.height / 2);
    const cx = pin!.clientWidth / 2;
    const cy = pin!.clientHeight * 0.52;
    navReach = navItems.map((item) => {
      const b = item.getBoundingClientRect();
      return Math.hypot(b.left + b.width / 2 - cx, b.top + b.height / 2 - cy);
    });
  }

  function render(p: number): void {
    const w = pin!.clientWidth;
    const h = pin!.clientHeight;

    // Hero: words and tiles leave; the window glides to the centre and hands over to the portal there.
    const out = span(p, T.heroText[0], T.heroText[1]);
    for (const part of heroParts) {
      setStyle(part, "opacity", (1 - out).toFixed(3));
      setStyle(part, "transform", `translateY(${(-24 * out).toFixed(1)}px)`);
    }
    const glide = easeInOut(span(p, T.glide[0], T.glide[1]));
    setStyle(heroWindow!, "transform", `translate(${(glideX * glide).toFixed(1)}px, ${(glideY * glide).toFixed(1)}px)`);
    const handed = p >= T.glide[1];
    setStyle(hero!, "visibility", handed ? "hidden" : "visible");

    // Portal: the logo block grows from the hero window's width to well past the viewport, fast first and
    // settling (ease-out). The 1 px frame is redrawn at each size (not scaled), so its stroke stays one pixel.
    const grow = span(p, T.portal[0], T.portal[1]);
    const open = easeOut(grow);
    const reach = Math.max(w, (h / (OUTLINE.h / OUTLINE.w)) * 1.02) * 1.35;
    const blockW = WINDOW_W + (reach - WINDOW_W) * open;
    const cx = w / 2;
    const cy = h / 2 - 4;
    setStyle(acts!, "clipPath", !handed ? "inset(50%)" : open >= 1 ? "none" : `path("${blockPath(cx, cy, blockW)}")`);
    setAttr(frameBlock!, "d", blockPath(cx, cy, blockW));
    const lineY = (cy + LINE_DROP * blockW).toFixed(1);
    setAttr(frameLine!, "d", `M${(cx - blockW / 2).toFixed(1)} ${lineY}H${(cx + blockW / 2).toFixed(1)}`);
    // The veil (the window's S2 bands) and the frame follow the block's size: while the block is narrower
    // than the act, the window shows bands only; they clear once the act fits inside.
    setStyle(frame!, "opacity", handed ? (1 - span(open, 0.45, 0.85)).toFixed(3) : "0");
    setStyle(veil!, "opacity", (1 - span(open, 0.55, 0.9)).toFixed(3));

    // Act 1 -> act 2: act 1 leaves first, then act 2 enters, so at most one title is readable at a time.
    const out1 = easeOut(span(p, T.act1Out[0], T.act1Out[1]));
    const in2 = easeOut(span(p, T.act2In[0], T.act2In[1]));
    setStyle(act1!, "opacity", (1 - out1).toFixed(3));
    setStyle(act1!, "transform", `translateY(${(-28 * out1).toFixed(1)}px)`);
    setStyle(act2!, "opacity", in2.toFixed(3));
    setStyle(act2!, "transform", `translateY(${(28 * (1 - in2)).toFixed(1)}px)`);

    // Act 2: walk the feed from the oldest event (last card) to the newest (first card). Each card in turn
    // sits at the list's resting top, so the walk ends exactly on the static end state.
    const first = cards[0];
    const second = cards[1];
    if (first && second) {
      const pitch = second.offsetTop - first.offsetTop;
      const f = (cards.length - 1) * (1 - easeOut(span(p, T.feed[0], T.feed[1])));
      setStyle(feed!, "transform", `translateY(${(-f * pitch).toFixed(1)}px)`);
    }

    // Act 3: iris to night from the centre, then the live dot travels along the ruler.
    const iris = easeOut(span(p, T.iris[0], T.iris[1]));
    const radius = iris * Math.hypot(w, h) * 0.52;
    setStyle(act3!, "clipPath", iris >= 1 ? "none" : `circle(${radius.toFixed(1)}px at 50% 52%)`);
    const travel = easeOut(span(p, T.travel[0], T.travel[1]));
    setStyle(now!, "transform", `translateX(${(travel * ruler!.clientWidth * 0.96).toFixed(1)}px)`);
    if (nav) {
      // While the iris opens, the nav is clear (no plate of its own over a half-night screen); each of its
      // items turns light once the circle covers it, and the night plate returns when the iris is full.
      const under = stage!.getBoundingClientRect().bottom > nav.offsetHeight;
      const tone = !under || iris <= 0 ? "" : iris >= 1 ? "night" : "clear";
      if ((nav.dataset["tone"] ?? "") !== tone) {
        if (tone) nav.dataset["tone"] = tone;
        else delete nav.dataset["tone"];
      }
      navItems.forEach((item, i) => {
        const night = tone === "clear" && radius >= (navReach[i] ?? Infinity);
        if (("night" in item.dataset) !== night) {
          if (night) item.dataset["night"] = "";
          else delete item.dataset["night"];
        }
      });
    }
  }

  function tick(t: number): void {
    const dt = last ? Math.min(0.1, (t - last) / 1000) : 1 / 60;
    last = t;
    const u = progress();
    sp += (u - sp) * (1 - Math.exp(-SMOOTHING * dt));
    if (Math.abs(u - sp) < 0.0005) sp = u;
    render(sp);
    raf = sp === u ? 0 : requestAnimationFrame(tick);
    if (!raf) last = 0;
  }

  function wake(): void {
    if (pinned && !raf) raf = requestAnimationFrame(tick);
  }

  function reset(): void {
    for (const el of [acts!, act1!, act2!, act3!, feed!, now!, frame!, veil!, hero!, heroWindow!, ...heroParts]) {
      el.style.removeProperty("clip-path");
      el.style.removeProperty("opacity");
      el.style.removeProperty("transform");
      el.style.removeProperty("visibility");
    }
    if (nav) delete nav.dataset["tone"];
    navItems.forEach((item) => delete item.dataset["night"]);
  }

  function setMode(): void {
    const want = wide.matches && !reduce.matches && pin!.style.position !== "static";
    if (want === pinned) {
      if (pinned) measure();
      return;
    }
    pinned = want;
    if (pinned) {
      stage!.dataset["mode"] = "pinned";
      measure();
      sp = progress();
      render(sp);
    } else {
      cancelAnimationFrame(raf);
      raf = 0;
      delete stage!.dataset["mode"];
      reset();
    }
  }

  setMode();
  wide.addEventListener("change", setMode);
  reduce.addEventListener("change", setMode);
  window.addEventListener("resize", setMode, { passive: true });
  window.addEventListener("scroll", wake, { passive: true });
  // A capture tool (or anything else) that unsticks the pin gets the stacked end state.
  new MutationObserver(setMode).observe(pin, { attributes: true, attributeFilter: ["style"] });
}
