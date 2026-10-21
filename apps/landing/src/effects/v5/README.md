# v5 motion engines (T6)

The page's motion system: small engines that read `data-*` declarations,
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
| `nav.ts` | `[data-nav]`, `[data-nav-cta]`, `[data-nav-cta-watch]`, `[data-theme-zone]`; `[popover]` panels inside the bar; same-origin `a[hreflang]` to `/en`, `/zh`, `/ja` | `--nav-p`, `data-nav-mode/state/cta-state/theme`, `inert`; `hidePopover()`; the `mosoo_locale` cookie | ramp.design progress morph, Save.design float bar, savee.com CTA, Ramp theme switch; production's language menu (cookie) | `refs/ramp-design/v5/STUDY.md` §1, §3.1, §4.1, §5.5; staging `v5/polish/nav/DESIGN.md` |
| `stage.ts` | `[data-stage]`, `[data-stage-pin]`, `[data-stage-step="k"]` | `data-stage-mode/ready/started`, `data-step`, `--stage-p`, `--stage-fill`, `data-stage-state`, `--step-p`, `aria-current="step"` on the lit `<li>` | CTRL product-frame narrative; v4c `effects/stage.ts` | `refs/ctrl/v5/STUDY.md` §1.6 |
| `footer.ts` | `[data-footer]`, `[data-footer-links/link/brand/rise]`, `[data-draw]` | inline hidden state, WAAPI, `data-footer-state` | Intent footer (`Footer.astro`, GSAP + Lottie) | `refs/intent/v5/STUDY.md` §1 |
| `play-for.ts` | `[data-play-for="ms"]` | `data-playing` for at most `ms` (≤ 5000) each time the element comes into view | WCAG 2.2.2 (motion that starts by itself stops within 5 s) | staging `v5/review/motion-a11y-perf.md` P1-2 |
| `portal.ts` | `[data-portal]`, `[data-portal-pin]`, `[data-portal-window]`, `[data-portal-frame]`, `[data-portal-door]`, `[data-portal-reveal]` | `data-portal-mode/state`, `--portal-p`, inline `clip-path`, the frame's `d` and opacity, `data-portal-shown` | Enter Pro's door mask; v4c `effects/stage.ts` | "Portal" below; staging `v5/graft/portal/NOTES.md`, `v5/round3/door/NOTES.md` |
| `harness-switch.ts` | `[data-switch="scroll \| time"]`, `[data-switch-item]`, `[data-switch-run]` | `data-switch-mode/driver/at/ready/pass`, `data-switch-state` | a13n's spec-sheet slot; v4a `flip-slot.ts`; v4c act 1 | "Harness switch" below; staging `v5/graft/switch/NOTES.md`, `v5/round3/door/NOTES.md` |

Decorative loops stop within 5 s: the line field (`linefield.ts`) runs 4.5 s per start (on entering the view, and
on each step switch of a pinned stage), easing to a stop over its last 1.5 s; the Resume comet runs under
`data-playing` only.

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
| `block` (wrapper: tab label + heading) | `translate 0 100px`, `scale .95`, opacity 0 | move 1000 ms, opacity 500 ms, `cubic-bezier(1/3, 2/3, 2/3, 1)` (IX2 outQuad, exact) | Frame a-15 (opacity was 1500 ms) |
| `title` (the H1 / H2) | `translate 0 150px`, `scale .9`, opacity 0 | same | Frame a-13 |
| `line` (heading's second line, inline span) | opacity 0 | 500 ms, 150 ms delay | Frame a-14 (1500 ms, 300 ms) |
| `card` | `translate 0 120px`, opacity 0 | move 700 ms, opacity 400 ms, `cubic-bezier(.25, 1, .5, 1)` (power3.out, max err .006); cards entering in one frame start 100 ms apart in document order | Intent `ScrollTrigger.batch` |

- `data-rise-delay="ms"` adds a delay. Below 992 px, `block` and `title` only
  fade (Frame runs a-15 at ≥ 992 px; BRIEF: 手机只做透明度).
- Trigger: the untransformed top edge at 90% of the viewport (an
  IntersectionObserver whose bottom margin is the push-down minus 10% of the
  viewport height). IX2 and ScrollTrigger fire on the pushed-down edge
  touching the viewport bottom, 100–250 px later, which left headings
  invisible after they had come into view (staging v5 design review P2-7, YC
  review P1-4); the fades are shorter for the same reason. An element that
  plays takes its waiting `data-rise` descendants with it (block → heading →
  second line start on one frame). Plays once. The move still matches Frame
  (measured with the same 12-tick input before this change: transform done at
  1000 ms, every curve within .002 of outQuad).
- Only elements that start below the fold are hidden (inline style); anything
  on screen or above at load stays as authored. Focus entering a hidden
  element reveals it at once. `data-rise-state` is `wait`, then `in`.
- Animates the `translate`, `scale` and `opacity` properties to the element's
  own CSS values. Do not put `data-rise` on an element that uses `translate` or
  `scale` for layout; wrap it.
- The hero is not this engine's: it floats on first paint with CSS, never
  waiting for JS (Frame's H1 waits for IX2; its LCP is 2.3 s):

```css
/* The breakpoint sets the move's distance, never the animation list: a list that changed at 992px would replay
   the move each time the width crossed it (a tablet turning, a window resize). */
@keyframes rise-title-move { from { translate: 0 var(--rise-title-y); scale: var(--rise-title-s); } }
@keyframes rise-fade { from { opacity: 0; } }
[data-rise-load="title"] {
  --rise-title-y: 0px;
  --rise-title-s: 1;
  animation: rise-title-move 1s cubic-bezier(.3333, .6667, .6667, 1) both,
             rise-fade .6s cubic-bezier(.3333, .6667, .6667, 1) both;
}
@media (min-width: 992px) { [data-rise-load="title"] { --rise-title-y: 150px; --rise-title-s: .9; } }
[data-rise-load="line"] { animation: rise-fade .6s cubic-bezier(.3333, .6667, .6667, 1) .15s both; }
[data-rise-load="fade"] { animation: rise-fade .6s cubic-bezier(.25, 1, .5, 1) both; }
@media (prefers-reduced-motion: reduce) { [data-rise-load] { animation: none; } }
```

## Nav — `[data-nav]`

| Piece | Declare | Engine writes | Value | Source |
| --- | --- | --- | --- | --- |
| Morph | `[data-nav]`, `data-nav-range="400"` | `--nav-p` = clamp(scrollY / range), `data-nav-state="top \| morph \| float"`, `data-nav-mode="live"` | linear in scroll; p = 1 is the float bar (centred, top 12 px, rounded, glass) | ramp.design (p = scrollTop / 504, linear); Save.design end state |
| CTA | `[data-nav-cta]` slot in the bar; `[data-nav-cta-watch]` on the hero CTA; `data-nav-clear="68"` | `data-nav-cta-state="on \| off"`, `inert` on a closed slot | on once the hero CTA's bottom has passed the float bar's bottom edge (12 + 56 px); no watch element: `scrollY > 80` | savee.com (`max-width 0 → 200px`, 180 ms) |
| Theme | `[data-theme-zone="accent"]` on sections | `data-nav-theme="accent"` while a zone is under the bar's centre line (`data-nav-line="40"`) | glass colour in 0.1 s `cubic-bezier(.4, 0, .2, 1)` | Ramp's footer switch |
| Popovers | `popover` elements inside `[data-nav]`, each opened by a `popovertarget` button in the bar | `hidePopover()` when focus lands outside the panel and its button (`focusin`: focus has already moved, so it is never sent back to the button), and on resize when its button is no longer shown | the browser still opens them, and closes them on Esc and a click outside, with or without the engine | WCAG 2.4.11: Tab past the phone sheet's last link must not land under the open sheet |
| Language | same-origin `a[hreflang]` whose path starts with `/en`, `/zh` or `/ja`, anywhere on the page | the `mosoo_locale` cookie on click (`shared/locale.ts` `rememberLocale`) | the worker's `/` redirect reads it before Accept-Language | production's language menu; the subpages' footer |

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

Since O1 (committee 2026-10-21) it also writes, on the section,
`data-stage-started` while `--stage-p` is above 0 (the run has begun: the v5
page keeps its step row out of sight until then, so the first screen shows no
step word) and `--stage-fill` = (k + the lit step's `--step-p`) / n, the run
told by steps (a progress line filled by it reaches step k's share as step k
lights; filled by `--stage-p`, Resume was lit for 87% of its stretch before the
line got under it, staging `committee/challenge/128.md` §3); and
`aria-current="step"` on the lit step when that element is an `<li>` (the step
row is a list of the three names). Leaving the pin clears all three.

No empty frame, by construction: the incoming layer is stacked over the
outgoing one, which stays opaque and visible for the whole 0.9 s; layers
bleed 8 px past the clip so the blurred edges stay outside. Measured with a
magenta backdrop: 0 uncovered pixels in 850 pinned frames, down and back up
(a leave-before-enter control shows up to 100 %; CTRL itself shows one empty
frame in its 540 pinned frames, at a switch).

Since round 3b the v5 home's stage does not slide layers: it moves one object
through its states in place (staging `narrative/CHANGES.md` §3: no card
travels from the laptop to the Session). `sections/stage.css` reads the
engine's `data-step` and sets the kit's two registered state numbers,
`--kit-cloud` and `--kit-app`, which transition on the switch's 0.9 s curve;
the captions still switch on `data-stage-state`. The engine is unchanged.
No empty frame there either, measured frame by frame (0 in 379–407 frames at
1440, 1280 and 1024, down through the three states and back; staging
`v5/round3/b-objects/NOTES.md` §5.4). The layer contract below stays the
engine's documented default.

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
| Nav | held at p = 1 (the float bar) with no transitions; CTA and theme still switch, instantly; panels open and close at once | the bar stays in the page at the top (`position: absolute`), CTA shown; the popovers open and close (HTML); a language link leads to its page without the cookie |
| Stage | not pinned: the CSS default, all steps stacked | stacked |
| Footer | nothing hidden; mark fully drawn | composed |
| Portal | not live: no clip, no frame, nothing hidden, the content in the flow | the same |
| Harness switch | not mounted: the section's still row, the first value | the same |

A media-query change at runtime is followed: reduce → everything revealed and
unpinned; damping and the pinned stage also return when it flips back.

## On the v5 page (BRIEF §4)

| Section | Declarations |
| --- | --- |
| `<html>` | `data-damp`; head: the `js` class line above |
| 0 Nav | `<header data-nav>`; CTA slot `<span data-nav-cta>` around the lime 「Try mosoo」; `<nav id="v5-nav-menu" popover>` (the row; the sheet up to 860px) with the Products and language `popover` panels |
| 1 Hero | H1 `data-rise-load="title"`, its second line `data-rise-load="line"`; sub line and CTA row `data-rise-load="fade"`; the lime CTA `data-nav-cta-watch` |
| 2 Stage | `<section data-stage>`, sticky layer `data-stage-pin`; per step k: its name in the step row (an `<li>`), component state and sentence each `data-stage-step="k"`; the row shows only while pinned and once `data-stage-started` is set, its 132px line filled by `--stage-fill` |
| 2b Spec table | `<section data-portal data-switch-run>` (range `-0.4,0`, 120vh live in A, 200vh in B), `data-portal-pin` > `data-portal-window` (the field alone) + `data-portal-frame` + the content: the H2, `<span data-portal-door>` (the closed mark's box, under the H2) and the card `<dl data-portal-reveal>`; the Harness `<dd data-switch="time">` (A; B: `"scroll"`, span `0.1,1`), one `data-switch-item` per harness |
| 3 Full lime screen | the section `data-theme-zone="accent"`; its title wrapper `data-rise="block"`, H2 `data-rise="title"`, second line `data-rise="line"`; the three cards `data-rise="card"` |
| Section titles elsewhere (FAQ, closing) | `data-rise="block"` / `"title"` / `"line"` |
| 6 Footer | `<footer data-footer>`; link columns `data-footer-link` inside `data-footer-links`; brand row `data-footer-brand` with the mark and the letters-only wordmark `data-footer-rise` (mark first); the mark's outline path `data-draw`, its line `data-draw="grow-x"` |

Not here: the full lime screen itself is CSS only (Frame's hard edge,
`linear-gradient(var(--accent) 0 calc(100svh + 40px), #fff 100%)`), hover is
CSS, and the line field is T2's `linefield.ts`.

## Portal — `[data-portal]`

`portal.ts`, the v5 graft of v4c's scroll motion (owner 10-20: 「滚动的动效我觉得是有说法的」): a sticky host whose
ground is seen through the mosoo mark. Closed, the window is the whole mark, its block (the concave-sided window of
the logo outline) with the bar's line under it and a calm surface inside; with the scroll it grows down and out from
its top edge, shows the host's content once it holds it whole, rises behind the heading to cover the host, and is
taken away. Wire it with `initPortal(root)` from `./portal.ts`. Proof: staging `v5/graft/portal/` (the first engine)
and `v5/round3/door/` (this one; `NOTES.md` there).

Round 3a (staging `v5/round3/door/NOTES.md`): the first engine showed live content through a narrow window from the
first frame; five of five readers took the half-open door for a distortion (a phone mock-up, an hourglass, macOS's
genie), four of five for a rendering bug, because its concave edges cropped the heading ("ne Session") and the rows,
and the mark's bar never reached the screen (staging `v5/polish/personas/spec-A-answers.json`). Now nothing is ever
seen through part of the window: the content sits above the ground, and what the window must hold is shown only
once it holds all of it.

| Piece | Value | Source |
| --- | --- | --- |
| Shape | the v5 lockup mark's block, `BRAND_MARK.fill` (`brand-v5.generated.ts`), redrawn in px as `clip-path: path()` on the ground every frame; sides concave by 2.87 % of the width at mid-height | Enter Pro door mask (staging `refs/enter-pro/notes.md` §3); v4c `stage.ts` (the block redrawn per size, not scaled) |
| Frame (optional) | 1 px ink outline of the same path, plus the mark's bar as a 1 px line at the mark's own gap under it, as `public/brand/outline/outline-*.svg` draw the mark; fades out (over 6 % of the zoom) from where the window starts to hold the content, and always before the top edge rises; hidden once open | v4c `.portal-frame`; BRIEF §3.3 line language |
| Closed window | the box of `[data-portal-door]`: its width, its top edge and its centre (the block's height follows the mark); without one, `data-portal-width` px (default 240) centred in the host | round 3a: the whole mark on screen, on the page's axis |
| Start | the range's start, but never before the whole closed mark, bar line included, is 24 px above the viewport's bottom | round 3a: the bar was 56 px below the fold when the door started |
| Motion | the size is geometric in the squared progress, `w = w0 · (w1 / w0)^(p²)`: small steps while the mark is small (halfway through, the bar's line is still on screen), a brisk end; the top edge stays put (the window grows down and out) until the zoom's last 15 %, when it rises to the host's top (an ease-in: no sliver) | round 3a: the closed mark reads as the mark before it grows; the top edge passes the heading only at the end, and with no line |
| Reveal | every `[data-portal-reveal]` gets `data-portal-shown` while the window holds them all with 24 px to spare on every side (the sides' deepest point counted on every row), and once open; the section's CSS fades them in on time, not with the scroll | round 3a: no content is ever seen through part of the window |
| Open window | covers the host with 2 px to spare (its narrowest width, at mid-height, spans the host), its top edge just above the host's; the clip is then removed | — |
| Range | `data-portal-range="-0.5,0.5"`: in screens of scroll from the moment the host's top reaches the viewport's top (negative: while the host is still coming in) | ours |
| Gate | `data-portal-media`, default `(min-width: 901px) and (min-height: 680px)` (where the stage pins), and no reduced motion | stage.ts |

Per frame it writes `data-portal-mode="live"`, `data-portal-state="closed | opening | open"` and `--portal-p` (0–1 over
the range, from the guarded start) on the host, the inline `clip-path` on `[data-portal-window]` (none once open), the
frame's `opacity` and the `d` of `[data-portal-outline]` / `[data-portal-line]`, and `data-portal-shown` on every
`[data-portal-reveal]`.

No cropped line and no empty screen, by construction: the content is never under the clip (only the ground is), a
reveal shows only whole, and the host's heading stays on the page above the closed mark (v4c's empty frames, REVIEW-v4
§3.3, were a lone window and nothing else on screen). Between the bar's line leaving the screen and the reveal, the
window shows the ground alone, 72–80 px of scroll at every size measured.

Measured on the v5 page (round 3a; scroll in px from the section's top at the viewport's top; staging
`v5/round3/door/data/phases-*.json`):

| Viewport | Door starts | Bar's line off screen | Card shown | Top edge rises | Open | H2 under the bar |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 1920 × 1080 | −396 | −156 | −76 | −28 | 0 | 420 |
| 1440 × 900 | −316 | −120 | −40 | −20 | 0 | 290 |
| 1280 × 800 | −272 | −104 | −24 | −20 | 0 | 240 |
| 1024 × 768 | −264 | −84 | −4 | −20 | 0 | 220 |
| 901 × 680 | −244 | −72 | 0 | −16 | 0 | 160 |

Where the card is nearly as wide as the screen (1024 and below), the window holds it only at the end, so the frame
fades and the top edge rises before the card shows.

```css
/* Not live (no JS, reduced motion, outside data-portal-media): the CSS default, the content in the flow. */
[data-portal-frame] { display: none; }
[data-portal][data-portal-mode="live"] {
  height: 250vh; /* the pin's screen + the range's end + the time the open content stays pinned; a section sets its own */
}
[data-portal][data-portal-mode="live"] [data-portal-pin] { position: sticky; top: 0; height: 100vh; overflow: clip; }
[data-portal][data-portal-mode="live"] [data-portal-window] { position: absolute; inset: 0; }
[data-portal][data-portal-mode="live"] [data-portal-frame] {
  display: block; position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible;
  pointer-events: none; fill: none; stroke: var(--ink); stroke-width: 1px;
}
[data-portal][data-portal-state="open"] [data-portal-frame] { visibility: hidden; }
@media print { /* the end state, as for the other engines */
  [data-portal][data-portal-mode] { height: auto !important; }
  [data-portal-pin] { position: static !important; height: auto !important; overflow: visible !important; }
  [data-portal-window] { position: relative !important; inset: auto !important; clip-path: none !important; }
  [data-portal-frame] { display: none !important; }
}
/* The section's own (sections/spec.css): the content over the ground, and a reveal hidden until shown. */
[data-portal][data-portal-mode="live"] [data-portal-reveal] { transition: opacity .32s var(--ease-expo); }
[data-portal][data-portal-mode="live"] [data-portal-reveal]:not([data-portal-shown]) { opacity: 0; pointer-events: none; }
```

- Markup: `[data-portal]` > `[data-portal-pin]` (first, at the host's top) > the ground `[data-portal-window]` (an
  opaque ground, empty or decorative: it covers the host once open), then
  `<svg data-portal-frame aria-hidden="true"><path data-portal-outline/><path data-portal-line/></svg>`, then the
  content, painted over both (the v5 page: `.v5-spec-in`, `position: relative`). In the content, an empty
  `<span data-portal-door aria-hidden="true">` laid out where the closed mark goes (the v5 page: on the axis, 40 px
  under the H2, `clamp(200px, 30vh, 280px)` wide), and `data-portal-reveal` on what the window must hold before it
  shows (the v5 page: the card). Measured on the v5 page: the closed block is 270 × 214 at 1440 × 900, 240 × 190 at
  1280 × 800, 230 × 182 at 1024 × 768, 204 × 162 at 901 × 680 and 280 × 222 at 1920 × 1080.
- The ground owns its `clip-path`; do not style one on it. No `data-rise` in the pin: the rise engine hides what
  starts below the fold, and the heading must be on the page from its first frame.
- Hidden reveals keep their place and stay in the accessibility tree (opacity, not `visibility`), and take no pointer.
- Sizes are re-measured when the page, the host, the door or a reveal resizes and when web fonts finish loading.
  Boxes come from layout offsets (`offsetLeft` / `offsetTop` up to the pin), not `getBoundingClientRect()`, so a
  `translate` on the way (the harness switch rolls its values with it) does not move them.
- The host's live height is the pin's screen, plus the range's end, plus the time the open content stays pinned.
- Keyboard focus inside the pin opens the door at once (`open`: everything shown), while focus stays inside; focus that
  comes from a pointer press does not, since a press lands on what is shown.
- With the harness switch (`harness-switch.ts`) on the same screen, two ways (REVIEW-v5 §6-4):
  - time driver (`data-switch="time"`, the v5 page's default, A): the pass waits until the door is open or the card
    that holds the slot is shown, so nothing rolls unseen; the host needs no pinned time for it (A: 120vh, range
    `-0.4,0`: open as the pin starts, pinned for a fifth of a screen);
  - scroll driver (`data-switch="scroll"`, B): put `data-switch-run` on the portal host; its run starts at the pin, so
    the door is open at `b × 100vh / (host height − 100vh)` of it (0 with the range above), and `data-switch-span`
    should start after that.
- Reduced motion, no JS, phones and 1024 × 600, a pin a capture tool sets to `position: static`
  (`tools/capture-v4.ts` UNSTICK): not live, no clip, nothing hidden, the content in the flow. A runtime change of the
  media query or of reduced motion is followed both ways.

## Harness switch — `[data-switch]`

`harness-switch.ts` (2026-10-20, the v4c / v4a graft; proof, recordings and one regenerating command in staging
`v5/graft/switch/`, `NOTES.md` there). One slot shows one of several values and rolls to the next: on the v5 page,
the spec table's Harness value (runtime glyph and name in the display serif). `initMotion()` and the home's
`src/home/effects.ts` start it after `initStage` and `initPortal` (the scroll driver reads their pinned layout).

| Piece | Value | Source |
| --- | --- | --- |
| Roll out | to `translate 0 -55%`, opacity 0, `blur(5px)` in 460 ms | a13n's spec-sheet slot, `k()` in staging `refs/a13n/downloads/stars-B_4FTUjC.js.txt` (the source of v4a `flip-slot.ts` and of v4c's first act-1 flip) |
| Roll in | from `translate 0 70%`, opacity 0, `blur(5px)` in 640 ms, 80 ms after the roll out starts | same |
| Curve | `cubic-bezier(.16, 1, .3, 1)` both ways | a13n's `c`; the same curve as Intent's expo.out (`--ease-expo`, BRIEF §3.4) |
| Width | every value stacked in one grid cell (`overflow: clip`): the cell is as wide as the widest value, so the row never changes width | a13n `.slot { display: grid; overflow: clip }` |
| `data-switch="scroll"` | the run's progress picks the value; `data-switch-span="a,b"` (default `0,1`) spreads the values evenly over that share of the run; crossing a threshold starts the roll in the scroll's direction; going back, a value holds until 32 px above its threshold | v4c design review P2-4 (the timed flip and the scroll were two clocks); `stage.ts` hysteresis |
| Run | the closest `[data-switch-run]`, else the closest `[data-stage]`: a tall section around a sticky layer | `stage.ts` |
| Scroll driver when | `data-switch-media`, default the run's `data-stage-media`, else `(min-width: 901px) and (min-height: 680px)`; outside it, and without a run, the time driver runs | `sections/stage.ts` `STAGE_MEDIA` |
| `data-switch="time"` | one pass per page view, while in view: the first value shows for `data-switch-lead` ms (default 2100), then every other value in turn and the first again, one roll every `data-switch-hold` ms (default 1400; both clamped 1000–6000). Four values take four rolls: 3 × 1.4 s + 0.72 s = 4.92 s of motion, inside WCAG 2.2.2's 5 s like `play-for.ts` and `linefield.ts` (the lead is still). Pauses while the slot is outside the middle 70 % of the viewport, under a mouse, focused within, in a hidden tab, or, inside a live `[data-portal]`, while that door is neither `open` nor shows the slot's `[data-portal-reveal]`. Rests on the first value for good: leaving and coming back does not play it again, nor does a driver restart (reduced motion off and on) | a13n rolls every 2.4 s forever (not kept); v4a turned once; the door gate: staging `v5/review/graft-yc.md` P1-1; first value first and no replay: round 3a (staging `v5/polish/verify-metrics.md` §15-3: it replayed on every return; owner-notes 21:57 「门开后 Harness 按时间转一轮」; the door showed Claude Agent SDK first) |

Writes: on `[data-switch]` `data-switch-mode="live"`, `data-switch-driver="scroll | time"`, `data-switch-at="k"`,
`data-switch-ready` (two frames after going live), and for the time driver `data-switch-pass="play | hold | done"`;
on every `[data-switch-item]` `data-switch-state="past | active | next"`.

With the portal on the same screen (see "Portal" above), either driver:

- time (the v5 page, A; REVIEW-v5 §6-4): the pass waits until the door is open or the card that holds the slot is
  shown, so the host needs no pinned time for it (120vh). Measured on the v5 page (round 3a, staging
  `v5/round3/door/data/pass-*.json`), 1440 × 900: OpenAI Codex, then rolls 1,400–1,420 ms apart to Claude Agent SDK,
  OpenCode, Pi and OpenAI Codex (`pass=done`), the last ending about 4.9 s after the first starts; scrolled 2,500 px
  away and back, it stays on OpenAI Codex, `done`. 390 × 844 (no door): the same pass once the cell is in the band,
  and no replay. The four names stay readable while the slot shows one: on the v5 page a list under the slot names
  all four and marks the current one (`sections/spec.ts`).
- scroll (B, the integrator's `redesign/v5-pin`): `data-switch-run` on the portal host; the door is open at 1/3 of
  its run with the portal's defaults, so start the span after that (`0.4,0.95` there). Give each value about
  300–400 px of scroll (the sandbox: a 300vh run, span `0.1,0.9`, 360 px per value at 900 px tall); with the
  portal's 250vh host that span leaves about 185 px per value, so make the host taller rather than the span wider.

Why the scroll driver triggers a timed roll instead of scrubbing it: the reader decides which name shows and never
comes to rest between two (a 40 px arrow-key step would stop a scrubbed roll half way: two half-clipped names). Why
the time driver ends: a13n's loop is the motion review's P1-2 (motion that never stops); one pass shows each name
once, then the row is still.

Markup. The four names reach a screen reader once, from a visually hidden list; the animated slot is `aria-hidden`.
Glyphs are `../home/runtime-glyphs.ts`, as in the footer's Harnesses column; values in `HARNESS_IDS` order (the
first value is where the time driver rests: OpenAI Codex, the harness the stage's cards name, Codex):

```html
<dt>Harness</dt>
<dd data-switch="scroll" data-switch-span="0.1,0.9" translate="no">
  <ul class="v5-sr"><li>OpenAI Codex</li><li>Claude Agent SDK</li><li>OpenCode</li><li>Pi</li></ul>
  <span class="hs" aria-hidden="true">
    <span class="hs-item" data-switch-item><svg class="hs-glyph" viewBox="0 0 24 24" fill="currentColor"
      fill-rule="evenodd" aria-hidden="true" focusable="false">…</svg><span>OpenAI Codex</span></span>
    <!-- one [data-switch-item] per value -->
  </span>
</dd>
```

CSS. The static layout (no JS, reduced motion: every value in the row, wrapping) is the section's; this is what the
engine needs (`.hs` / `.hs-item` are the sandbox's class names; the full sandbox CSS is staging
`v5/graft/switch/sandbox/sandbox.css`). Keep it inside the media query: turning reduced motion on then shows the
static row at the very next style recalc, a frame before the engine hears the change:

```css
@media (prefers-reduced-motion: no-preference) {
  [data-switch-mode="live"] .hs { display: inline-grid; overflow: clip; overflow-clip-margin: 8px; }
  [data-switch-mode="live"] [data-switch-item] { grid-area: 1 / 1; }
  [data-switch-mode="live"] [data-switch-state="past"] { translate: 0 -55%; opacity: 0; filter: blur(5px); visibility: hidden; }
  [data-switch-mode="live"] [data-switch-state="next"] { translate: 0 70%; opacity: 0; filter: blur(5px); visibility: hidden; }
  [data-switch-ready] [data-switch-state="active"] {
    transition: translate .64s var(--ease-expo) .08s, opacity .64s var(--ease-expo) .08s, filter .64s var(--ease-expo) .08s;
  }
  [data-switch-ready] [data-switch-state="past"],
  [data-switch-ready] [data-switch-state="next"] {
    transition: translate .46s var(--ease-expo), opacity .46s var(--ease-expo), filter .46s var(--ease-expo),
                visibility 0s linear .46s; /* a leaving value stays visible until it is gone */
  }
}
```

Measured on the sandbox (1440×900 and 390×844, headless Chrome; `data/` there):

- Time driver (the 2026-10-20 sandbox: three rolls of 2.1 s from the second value; the v5 page now runs four rolls of
  1.4 s after a 2.1 s lead, measured above): rolls 2102 / 4203 / 6304 ms after the slot entered the band; the last
  value is whole at 7029 ms, so the motion lasts 4927 ms. Hover (3004 ms), focus (2503 ms) and a hidden tab
  (simulated, 2002 ms) push the next roll back by exactly that long; leaving the view keeps the remaining time
  (1591 ms). (The sandbox also replayed a whole pass after the slot had left the viewport; the engine no longer does.)
- Scroll driver, keyboard: switches at y 721 / 1086 / 1444 going down (thresholds 720 / 1080 / 1440) and
  1407 / 1041 / 683 going back (688 / 1048 / 1408); all 86 rests after ArrowDown, ArrowUp, PageDown and PageUp show
  exactly one whole value. A jump over three values rolls once.
- The slot is 351.77 px wide and the row 46 px tall in every frame of every roll (1440).
- A roll: the brighter of the two values dips to opacity 0.22 at 83–100 ms after the switch (a13n's 80 ms gap; six
  frames under 0.5); the new value is whole after 566–584 ms.
- CPU (Chrome's own counters, medians of three, engine on vs the same page with it off): the engine's script time
  is 0.2–0.3 ms for a whole pass, and once the pass is over the page is as idle as without it (0.1 ms per 7.5 s).
  The rolls cost 179 style recalcs per pass (7–14 ms of main thread per roll over two runs): with the blur and the
  delayed visibility switch Chrome restyles every frame; with neither, 52 (a plain div transition: 5). Kept for
  a13n's look; dropping both is the fallback if a phone stutters.
- Every harness name is in the accessibility tree once per table, live, under reduced motion and without JS.

| | `prefers-reduced-motion: reduce` | No JS |
| --- | --- | --- |
| Harness switch | not mounted: every value in the row (the CSS default). Turned on at runtime: the engine clears its attributes and cancels a roll in flight, the gated CSS is static at once | the same |
