# v5 motion engines (T6)

The page's motion system: five small engines that read `data-*` declarations,
write attributes, custom properties and short WAAPI animations, and leave the
look to CSS. No dependencies, no layout reads in wheel handlers, and every
engine is a no-op when its elements are missing.

```ts
import { initMotion } from "./effects/v5/index.ts";

initMotion(); // after the static HTML is in the DOM; returns a cleanup
```

The page head needs one inline line before first paint. Only the nav reads
it: the CTA slot starts closed under `.js`, so the bar never shows a second
CTA before the engine runs, while a page without JS keeps the CTA visible:

```html
<script>document.documentElement.classList.add("js")</script>
```

Every value below was measured on the reference and re-measured on our
sandbox with the same tools and settings. The proof (recordings, numbers,
side-by-side images, one regenerating command) lives in staging
`v5/tools/motion/` (`NOTES.md` there); the full reference CSS is
`v5/tools/motion/sandbox/sandbox.css`.

| Engine | Declare | Writes | Reverse-engineered from | Study |
| --- | --- | --- | --- | --- |
| `damp-scroll.ts` | `<html data-damp>` | `scrollTo` per frame | Frame (Lenis 1.0.29, `lerp .1`, `wheelMultiplier .7`) | staging `refs/frame/v5/motion/STUDY.md` §1 |
| `rise.ts` | `data-rise="block \| title \| line \| card"` | inline hidden state, WAAPI, `data-rise-state` | Frame IX2 a-15 / a-13 / a-14; Intent feature carousel | Frame §2; `refs/intent/v5/STUDY.md` §2.6 |
| `nav.ts` | `[data-nav]`, `[data-nav-cta]`, `[data-nav-cta-watch]`, `[data-theme-zone]` | `--nav-p`, `data-nav-mode/state/cta-state/theme`, `inert` | ramp.design progress morph, Save.design float bar, savee.com CTA, Ramp theme switch | `refs/ramp-design/v5/STUDY.md` §1, §3.1, §4.1, §5.5 |
| `stage.ts` | `[data-stage]`, `[data-stage-pin]`, `[data-stage-step="k"]` | `data-stage-mode/ready`, `data-step`, `--stage-p`, `data-stage-state`, `--step-p` | CTRL product-frame narrative; v4c `effects/stage.ts` | `refs/ctrl/v5/STUDY.md` §1.6 |
| `footer.ts` | `[data-footer]`, `[data-footer-links/link/brand/rise]`, `[data-draw]` | inline hidden state, WAAPI, `data-footer-state` | Intent footer (`Footer.astro`, GSAP + Lottie) | `refs/intent/v5/STUDY.md` §1 |

## Damped scroll — `<html data-damp>`

| Parameter | Value | Source |
| --- | --- | --- |
| Wheel multiplier | `0.7` (`data-damp-multiplier`) | Frame's inline Lenis config |
| Follow rate | `λ = 6 s⁻¹`, τ 167 ms (`data-damp-lambda`): each frame closes `1 − e^(−λ·dt)` | Lenis `lerp 0.1` × 60 |
| One 100 px tick | 50 / 90 / 99 % at 98–99 / 365–366 / 815–816 ms over runs (Frame's two runs: 97–99 / 364–366 / 813–816 ms), no overshoot | `damping.ts` on both pages |
| deltaMode | lines × 100/6 px, pages × viewport height | our choice; Frame's Lenis 1.0.29 has no deltaMode handling (study §1). Line-mode wheels (Firefox) not measured |

- Mounts only while `(prefers-reduced-motion: no-preference) and (hover: hover)
  and (pointer: fine)` holds; touch, reduced motion and no JS scroll natively.
- Passes through: ctrl/⌘ + wheel (zoom), horizontal gestures, wheels already
  `defaultPrevented`, `[data-damp-prevent]` subtrees, nested scroll areas that
  can still scroll that way (found a frame after `pointerover`, cached), and a
  scroll lock (inline `overflow: hidden` on `<html>`/`<body>`, or
  `<html data-damp-stop>`).
- Keyboard, scrollbar, anchors and find-in-page stay native; any scroll the
  engine did not make cancels the glide. It scrolls with
  `behavior: "instant"`, so a CSS `scroll-behavior: smooth` cannot double it.
- Measured on the sandbox: a wheel over a nested scroll area scrolls it
  natively while it can move (page still, event not prevented); at its end the
  next 100 px tick moves the page 70 px, damped; ArrowDown and PageDown stay
  native (40 px in 142–146 ms, 860 px in 152–156 ms over runs; Frame 140 /
  150 ms).

## Rise — `data-rise`

| Value | From → to | Timing | Source |
| --- | --- | --- | --- |
| `block` (wrapper: tab label + heading) | `translate 0 100px`, `scale .95`, opacity 0 | move 1000 ms, opacity 1500 ms, `cubic-bezier(1/3, 2/3, 2/3, 1)` (IX2 outQuad, exact) | Frame a-15 |
| `title` (the H1 / H2) | `translate 0 150px`, `scale .9`, opacity 0 | same | Frame a-13 |
| `line` (heading's second line, inline span) | opacity 0 | 1500 ms, 300 ms delay | Frame a-14 |
| `card` | `translate 0 120px`, opacity 0 | 700 ms `cubic-bezier(.25, 1, .5, 1)` (power3.out, max err .006); cards entering in one frame start 100 ms apart in document order | Intent `ScrollTrigger.batch` |

- `data-rise-delay="ms"` adds a delay. Below 992 px, `block` and `title` only
  fade (Frame runs a-15 at ≥ 992 px; BRIEF: 手机只做透明度).
- Trigger: IntersectionObserver threshold 0 on the transformed box, i.e. the
  pushed-down top edge touching the viewport bottom (IX2's and
  ScrollTrigger's point). Plays once. Measured against Frame with the same
  12-tick input: the wrapper starts 495–504 ms into it over runs (Frame 506),
  transform done at 1000 ms, opacity at 1500 ms, line 2 starts 350 ms after
  its heading on both, every curve within .002 of outQuad.
- Only elements that start below the fold are hidden (inline style); anything
  on screen or above at load stays as authored. Focus entering a hidden
  element reveals it at once. `data-rise-state` is `wait`, then `in`.
- Animates the `translate`, `scale` and `opacity` properties to the element's
  own CSS values. Do not put `data-rise` on an element that uses `translate` or
  `scale` for layout; wrap it.
- The hero is not this engine's: it floats on first paint with CSS, never
  waiting for JS (Frame's H1 waits for IX2; its LCP is 2.3 s):

```css
@keyframes rise-title-move { from { translate: 0 150px; scale: .9; } }
@keyframes rise-fade { from { opacity: 0; } }
[data-rise-load="title"] { animation: rise-fade 1.5s cubic-bezier(.3333, .6667, .6667, 1) both; }
@media (min-width: 992px) {
  [data-rise-load="title"] {
    animation: rise-title-move 1s cubic-bezier(.3333, .6667, .6667, 1) both,
               rise-fade 1.5s cubic-bezier(.3333, .6667, .6667, 1) both;
  }
}
[data-rise-load="line"] { animation: rise-fade 1.5s cubic-bezier(.3333, .6667, .6667, 1) .3s both; }
[data-rise-load="fade"] { animation: rise-fade 1s cubic-bezier(.25, 1, .5, 1) both; }
@media (prefers-reduced-motion: reduce) { [data-rise-load] { animation: none; } }
```

## Nav — `[data-nav]`

| Piece | Declare | Engine writes | Value | Source |
| --- | --- | --- | --- | --- |
| Morph | `[data-nav]`, `data-nav-range="400"` | `--nav-p` = clamp(scrollY / range), `data-nav-state="top \| morph \| float"`, `data-nav-mode="live"` | linear in scroll; p = 1 is the float bar (centred, top 12 px, rounded, glass) | ramp.design (p = scrollTop / 504, linear); Save.design end state |
| CTA | `[data-nav-cta]` slot in the bar; `[data-nav-cta-watch]` on the hero CTA; `data-nav-clear="68"` | `data-nav-cta-state="on \| off"`, `inert` on a closed slot | on once the hero CTA's bottom has passed the float bar's bottom edge (12 + 56 px); no watch element: `scrollY > 80` | savee.com (`max-width 0 → 200px`, 180 ms) |
| Theme | `[data-theme-zone="accent"]` on sections | `data-nav-theme="accent"` while a zone is under the bar's centre line (`data-nav-line="40"`) | glass colour in 0.1 s `cubic-bezier(.4, 0, .2, 1)` | Ramp's footer switch |

Measured on the sandbox: the painted bar follows the frame's own scroll
offset within 1.6 px over 140 morph frames (one frame of lag would be
3.3 px); the CTA slot reaches its content width at +50 ms and full opacity
at +183 ms (savee.com: 84 / ≈ 200 ms for a wider button); the glass goes
white → lime in 100 ms.

```css
[data-nav] {
  --p: var(--nav-p, 0);
  position: absolute; /* no JS / failed init: the loose bar stays in the page */
  z-index: 50; top: 16px; left: 0; right: 0; margin-inline: auto;
  width: calc(100% - 32px); height: 72px; padding-inline: 32px;
  display: flex; align-items: center; justify-content: space-between;
  isolation: isolate; border-radius: calc(12px * var(--p));
}
[data-nav][data-nav-mode="live"] {
  position: fixed;
  top: calc(16px - 4px * var(--p));
  width: calc((100% - 32px) * (1 - var(--p)) + min(720px, 100% - 32px) * var(--p));
  height: calc(72px - 16px * var(--p));
  padding-inline: calc(32px - 16px * var(--p)) calc(32px - 24px * var(--p));
}
[data-nav]::before { /* the glass; it leads the geometry so a hero title passing under never shows through */
  content: ""; position: absolute; inset: 0; z-index: -1; border-radius: inherit;
  border: 1px solid rgb(22 24 21 / .1); background-color: rgb(255 255 255 / .78);
  backdrop-filter: blur(12px) saturate(1.08);
  box-shadow: 0 1px 2px rgb(22 24 21 / .06), 0 10px 30px -14px rgb(22 24 21 / .22);
  opacity: clamp(0, var(--p) * 2.5, 1);
  transition: background-color .1s cubic-bezier(.4, 0, .2, 1), border-color .1s cubic-bezier(.4, 0, .2, 1),
              box-shadow .1s cubic-bezier(.4, 0, .2, 1);
}
[data-nav][data-nav-theme="accent"]::before {
  border-color: rgb(22 24 21 / .14); background-color: rgb(188 248 112 / .84);
  box-shadow: 0 1px 2px rgb(61 99 13 / .22), 0 10px 30px -14px rgb(61 99 13 / .22);
}
[data-nav-cta] {
  display: inline-flex; overflow: hidden; max-width: 200px; opacity: 1;
  transition: max-width .18s cubic-bezier(0, 0, .2, 1), opacity .18s cubic-bezier(0, 0, .2, 1),
              margin-left .18s cubic-bezier(0, 0, .2, 1);
}
.js [data-nav]:not([data-nav-cta-state="on"]) [data-nav-cta] {
  max-width: 0; margin-left: -24px /* the bar's flex gap */; opacity: 0;
}
/* .btn-lime is the sandbox's lime button class: on the lime zone the CTA turns ink, never lime on lime */
[data-nav][data-nav-theme="accent"] [data-nav-cta] .btn-lime { background: var(--ink); color: var(--paper); }
@media (prefers-reduced-motion: reduce) {
  [data-nav]::before, [data-nav-cta], [data-nav-cta] * { transition: none; }
}
```

## Stage — `[data-stage]`

| Piece | Value | Source |
| --- | --- | --- |
| Pinned run | section `height: 350vh`, layer `position: sticky; top: 0; height: 100vh`, only under `[data-stage-mode="pinned"]` | CTRL: 4.5 screens, 900 px sticky; BRIEF: 段高约 3 屏 |
| Steps | step k active from `at[k]` (`data-stage-at="0,0.34,0.67"`, default k / n); step 0 before the pin, the last step after it | CTRL switches screens at fixed points, not scrubbed |
| Switch | 0.9 s `cubic-bezier(.531, .247, .35, 1)` | CTRL CustomEase, fitted here (max err .023, no overshoot); the study's guess `(.5, 0, .2, 1)` errs .098 |
| Outgoing layer | `translate 0 -20%`, `blur(5px)`, stays opaque | CTRL |
| Pinned when | `data-stage-media` (default `(min-width: 901px)`) and no reduced motion | v4c |

Per frame the engine writes `--stage-p` (0–1 over the pinned run) and
`data-step` on the section, `data-stage-state="past | active | next"` and
`--step-p` (0–1 across that step's span) on every `[data-stage-step]`, and
`data-stage-ready` two frames after pinning. Any number of elements may share
a step index (label, screen, sentence): discrete parts transition on
`data-stage-state`, scrubbed parts read `--step-p`.

No empty frame, by construction: the incoming layer is stacked over the
outgoing one, which stays opaque and visible for the whole 0.9 s; layers
bleed 8 px past the clip so the blurred edges stay outside. Measured with a
magenta backdrop: 0 uncovered pixels in 850 pinned frames, down and back up
(a leave-before-enter control shows up to 100 %; CTRL itself shows one empty
frame in its 540 pinned frames, at a switch).

```css
/* .frame (the clipped product frame), .screen (one layer per step) and .say are the sandbox's class names */
.stage[data-stage-mode="pinned"] { height: 350vh; }
.stage[data-stage-mode="pinned"] [data-stage-pin] { position: sticky; top: 0; height: 100vh; }
.stage[data-stage-mode="pinned"] .frame { display: grid; overflow: hidden; }
.stage[data-stage-mode="pinned"] .screen { grid-area: 1 / 1; margin: -8px; }
.stage[data-stage-mode="pinned"] .screen[data-stage-state="active"] { z-index: 2; translate: 0 0; filter: none; visibility: visible; }
.stage[data-stage-mode="pinned"] .screen[data-stage-state="next"] { z-index: 3; translate: 0 100%; visibility: hidden; }
.stage[data-stage-mode="pinned"] .screen[data-stage-state="past"] { z-index: 1; translate: 0 -20%; filter: blur(5px); visibility: hidden; }
.stage[data-stage-ready] .screen {
  transition: translate .9s cubic-bezier(.531, .247, .35, 1), filter .9s cubic-bezier(.531, .247, .35, 1),
              visibility 0s linear .9s; /* leaving layers stay visible until covered */
}
.stage[data-stage-ready] .screen[data-stage-state="active"] {
  transition: translate .9s cubic-bezier(.531, .247, .35, 1), filter .9s cubic-bezier(.531, .247, .35, 1), visibility 0s;
}
/* a sentence that passes through, scrubbed: in over the first quarter of its step, out over the last */
.stage[data-stage-mode="pinned"] .say p {
  --in: clamp(0, var(--step-p, 0) * 4, 1); --out: clamp(0, var(--step-p, 0) * 4 - 3, 1);
  opacity: calc(var(--in) - var(--out)); translate: 0 calc((1 - var(--in)) * 120px - var(--out) * 120px);
}
```

## Footer — `[data-footer]`

| Piece | Value | Source |
| --- | --- | --- |
| `[data-footer-link]` | `translate 0 40px`, opacity 0 → 700 ms `cubic-bezier(.25, 1, .5, 1)`, 200 ms apart | Intent links (power3.out) |
| `[data-footer-rise]` | `translate 0 120px`, opacity 0 → 1000 ms `cubic-bezier(.16, 1, .3, 1)` (expo.out, max err .012), 200 ms apart: mark, then wordmark | Intent spark + wordmark |
| Trigger | `[data-footer-links]` / `[data-footer-brand]` top crossing the 85 % line (`rootMargin 0 0 -15% 0`), at every width | Intent; its earlier phone trigger is a 不要学 |
| Order | the brand never starts sooner than 200 ms after the links | Intent's measured −200 / 0 / +200, made speed-proof |
| `[data-draw]` (default `trim`) | stroke opens from the path's midpoint: dasharray `0 1` → `1 0`, offset −.5 → 0 (`pathLength=1` set by the engine), 600 ms `cubic-bezier(.001, .41, 0, 1)`, 200 ms in, 67 ms apart | Intent Lottie Trim Paths 50/50 → 0/100 |
| `[data-draw="grow-x" \| "grow-y"]` | scales up from its centre / bottom, 667 ms `cubic-bezier(.9, 0, .1, 1)`, from 0 | Intent's bar |
| Replay | when the whole footer has left the viewport, everything resets unseen | Intent |

Put `data-footer-link` on each link column (not each link) for Intent's
three-beat rhythm. The midpoint of a closed `data-draw` path is where its `M`
starts plus half its length, so set the start point where the stroke should
close. Measured with Intent's input (100 px / 70 ms) over several full runs:
the first link leads the mark by 216–218 ms on the first pass and 200–219 ms
on the replay, links 200 ms apart, wordmark +200 ms (Intent: 199–203 ms,
wordmark +198–200 ms). Focus inside the footer reveals everything at once.

```css
.ft-brand { /* [data-footer-brand]: the seam */
  overflow: clip;
  overflow-clip-margin: 15px;
}
```

## Reduced motion and no JS

| Engine | `prefers-reduced-motion: reduce` | No JS |
| --- | --- | --- |
| Damped scroll | not mounted: native scrolling (Frame ignores the setting) | native |
| Rise | nothing hidden; `data-rise-load` animations off | everything visible; the hero's CSS float still plays |
| Nav | held at p = 1 (the float bar) with no transitions; CTA and theme still switch, instantly | the bar stays in the page at the top (`position: absolute`), CTA shown |
| Stage | not pinned: the CSS default, all steps stacked | stacked |
| Footer | nothing hidden; mark fully drawn | composed |

A media-query change at runtime is followed: reduce → everything revealed and
unpinned; damping and the pinned stage also return when it flips back.

## On the v5 page (BRIEF §4)

| Section | Declarations |
| --- | --- |
| `<html>` | `data-damp`; head: the `js` class line above |
| 0 Nav | `<header data-nav>`; CTA slot `<span data-nav-cta>` around the lime 「Try mosoo」 |
| 1 Hero | H1 `data-rise-load="title"`, its second line `data-rise-load="line"`; sub line and CTA row `data-rise-load="fade"`; the lime CTA `data-nav-cta-watch` |
| 2 Stage | `<section data-stage>`, sticky layer `data-stage-pin`; per step k: label, component state and sentence each `data-stage-step="k"` |
| 3 Full lime screen | the section `data-theme-zone="accent"`; its title wrapper `data-rise="block"`, H2 `data-rise="title"`, second line `data-rise="line"`; the five cards `data-rise="card"` |
| Section titles elsewhere (FAQ, closing) | `data-rise="block"` / `"title"` / `"line"` |
| 6 Footer | `<footer data-footer>`; link columns `data-footer-link` inside `data-footer-links`; brand row `data-footer-brand` with the mark and the letters-only wordmark `data-footer-rise` (mark first); the mark's outline path `data-draw`, its line `data-draw="grow-x"` |

Not here: the full lime screen itself is CSS only (Frame's hard edge,
`linear-gradient(var(--accent) 0 calc(100svh + 40px), #fff 100%)`), hover is
CSS, and the line field is T2's `linefield.ts`.
