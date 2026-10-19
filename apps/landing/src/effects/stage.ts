// The v4c signature effect: the hero window opens into a pinned three-act stage.
//
//   portal  0.00-0.14  the acts show through the logo block (clip-path: path()), which grows from the hero
//                      window's 112 px to past the viewport (progress squared, brand/outline README §3)
//   act 1   0.14-0.40  U10 spec table; the Harness slot flips every 2.4 s (rotateX, a13n first act)
//   act 2   0.40-0.66  U04 feed; scrolling walks the feed from the first event to the newest
//   act 3   0.66-1.00  iris to night (clip-path: circle()), then the ruler's live dot travels to +7 days
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
const FLIP_MS = 2400;
const WINDOW_W = 112;

const clamp = (v: number, lo = 0, hi = 1): number => Math.min(hi, Math.max(lo, v));
const span = (p: number, a: number, b: number): number => clamp((p - a) / (b - a));
const easeOut = (t: number): number => 1 - (1 - t) ** 3;

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

function setStyle(el: HTMLElement | SVGElement, prop: "transform" | "opacity" | "clipPath", value: string): void {
  if (el.style[prop] !== value) el.style[prop] = value;
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
  const veil = stage?.querySelector<HTMLElement>("[data-portal-veil]");
  if (!stage || !pin || !acts || !act1 || !act2 || !act3 || !feed || !ruler || !now || !frame || !veil) return;
  const nav = document.querySelector<HTMLElement>("[data-nav]");
  const faces = [...stage.querySelectorAll<HTMLElement>("[data-face]")];
  const cards = [...feed.querySelectorAll<HTMLElement>("[data-card]")];

  const wide = matchMedia("(min-width: 901px)");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");

  let pinned = false;
  let raf = 0;
  let last = 0;
  let sp = 0;
  let top = 0;
  let run = 1;
  let face = 0;
  let flipTimer = 0;

  const progress = (): number => clamp((window.scrollY - top) / run);

  function measure(): void {
    top = stage!.getBoundingClientRect().top + window.scrollY;
    run = Math.max(1, stage!.offsetHeight - window.innerHeight);
  }

  function flip(on: boolean): void {
    if (on && !flipTimer && faces.length > 1) {
      stage!.dataset["flip"] = "";
      flipTimer = window.setInterval(() => {
        const prev = faces[face];
        face = (face + 1) % faces.length;
        const next = faces[face];
        faces.forEach((f) => f.classList.remove("is-off"));
        prev?.classList.replace("is-on", "is-off");
        prev?.setAttribute("aria-hidden", "true");
        next?.classList.add("is-on");
        next?.removeAttribute("aria-hidden");
      }, FLIP_MS);
    } else if (!on && flipTimer) {
      window.clearInterval(flipTimer);
      flipTimer = 0;
    }
  }

  function render(p: number): void {
    const w = pin!.clientWidth;
    const h = pin!.clientHeight;

    // Portal: the logo block grows from the hero window's width to well past the viewport.
    const open = span(p, 0, 0.14) ** 2;
    const reach = Math.max(w, (h / (OUTLINE.h / OUTLINE.w)) * 1.02) * 1.35;
    const blockW = WINDOW_W + (reach - WINDOW_W) * open;
    setStyle(acts!, "clipPath", open >= 1 ? "none" : `path("${blockPath(w / 2, h / 2 - 4, blockW)}")`);
    setStyle(frame!, "transform", `scale(${(blockW / WINDOW_W).toFixed(4)})`);
    setStyle(frame!, "opacity", (1 - span(open, 0, 0.35)).toFixed(3));
    setStyle(veil!, "opacity", (1 - span(span(p, 0, 0.14), 0.05, 0.55)).toFixed(3));

    // Act 1 -> act 2: crossfade with a short lift.
    const x12 = easeOut(span(p, 0.38, 0.46));
    setStyle(act1!, "opacity", (1 - x12).toFixed(3));
    setStyle(act1!, "transform", `translateY(${(-28 * x12).toFixed(1)}px)`);
    setStyle(act2!, "opacity", x12.toFixed(3));
    setStyle(act2!, "transform", `translateY(${(28 * (1 - x12)).toFixed(1)}px)`);
    flip(p > 0.02 && p < 0.42);

    // Act 2: walk the feed from the oldest event (last card) to the newest (first card).
    const col = feed!.parentElement?.clientHeight ?? 0;
    const first = cards[0];
    const second = cards[1];
    if (first && second && col) {
      const pitch = second.offsetTop - first.offsetTop;
      const f = (cards.length - 1) * (1 - easeOut(span(p, 0.44, 0.64)));
      setStyle(feed!, "transform", `translateY(${(col / 2 - (first.offsetTop + f * pitch + first.offsetHeight / 2)).toFixed(1)}px)`);
    }

    // Act 3: iris to night from the centre, then the live dot travels along the ruler.
    const iris = easeOut(span(p, 0.66, 0.76));
    setStyle(act3!, "clipPath", iris >= 1 ? "none" : `circle(${(iris * Math.hypot(w, h) * 0.52).toFixed(1)}px at 50% 52%)`);
    const travel = easeOut(span(p, 0.78, 0.95));
    setStyle(now!, "transform", `translateX(${(travel * ruler!.clientWidth * 0.96).toFixed(1)}px)`);
    if (nav) {
      // Night while the dark act still sits under the nav.
      const night = iris > 0.5 && stage!.getBoundingClientRect().bottom > nav.offsetHeight;
      if ((nav.dataset["tone"] === "night") !== night) {
        if (night) nav.dataset["tone"] = "night";
        else delete nav.dataset["tone"];
      }
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
    for (const el of [acts!, act1!, act2!, act3!, feed!, now!, frame!, veil!]) {
      el.style.removeProperty("clip-path");
      el.style.removeProperty("opacity");
      el.style.removeProperty("transform");
    }
    flip(false);
    delete stage!.dataset["flip"];
    faces.forEach((f, i) => {
      f.classList.toggle("is-on", i === 0);
      f.classList.remove("is-off");
    });
    face = 0;
    if (nav) delete nav.dataset["tone"];
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
