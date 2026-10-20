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
| `nav.ts` | `[data-nav]`, `[data-nav-cta]`, `[data-nav-cta-watch]`, `[data-theme-zone]` | `--nav-p`, `data-nav-mode/state/cta-state/theme`, `inert` | ramp.design progress morph, Save.design float bar, savee.com CTA, Ramp theme switch | `refs/ramp-design/v5/STUDY.md` §1, §3.1, §4.1, §5.5 |
| `stage.ts` | `[data-stage]`, `[data-stage-pin]`, `[data-stage-step="k"]` | `data-stage-mode/ready`, `data-step`, `--stage-p`, `data-stage-state`, `--step-p` | CTRL product-frame narrative; v4c `effects/stage.ts` | `refs/ctrl/v5/STUDY.md` §1.6 |
| `footer.ts` | `[data-footer]`, `[data-footer-links/link/brand/rise]`, `[data-draw]` | inline hidden state, WAAPI, `data-footer-state` | Intent footer (`Footer.astro`, GSAP + Lottie) | `refs/intent/v5/STUDY.md` §1 |
| `play-for.ts` | `[data-play-for="ms"]` | `data-playing` for at most `ms` (≤ 5000) each time the element comes into view | WCAG 2.2.2 (motion that starts by itself stops within 5 s) | staging `v5/review/motion-a11y-perf.md` P1-2 |
| `portal.ts` | `[data-portal]`, `[data-portal-pin]`, `[data-portal-window]`, `[data-portal-frame]`, `[data-portal-focus]` | `data-portal-mode/state`, `--portal-p`, inline `clip-path`, the frame's `d` | Enter Pro's door mask; v4c `effects/stage.ts` | "Portal" below; staging `v5/graft/portal/NOTES.md` |
| `harness-switch.ts` | `[data-switch="scroll \| time"]`, `[data-switch-item]`, `[data-switch-run]` | `data-switch-mode/driver/at/ready/pass`, `data-switch-state` | a13n's spec-sheet slot; v4a `flip-slot.ts`; v4c act 1 | "Harness switch" below; staging `v5/graft/switch/NOTES.md` |

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
| Portal | not live: no clip, no frame, the content in the flow | the same |
| Harness switch | not mounted: the section's still row | the same |

A media-query change at runtime is followed: reduce → everything revealed and
unpinned; damping and the pinned stage also return when it flips back.

## On the v5 page (BRIEF §4)

| Section | Declarations |
| --- | --- |
| `<html>` | `data-damp`; head: the `js` class line above |
| 0 Nav | `<header data-nav>`; CTA slot `<span data-nav-cta>` around the lime 「Try mosoo」 |
| 1 Hero | H1 `data-rise-load="title"`, its second line `data-rise-load="line"`; sub line and CTA row `data-rise-load="fade"`; the lime CTA `data-nav-cta-watch` |
| 2 Stage | `<section data-stage>`, sticky layer `data-stage-pin`; per step k: label, component state and sentence each `data-stage-step="k"` |
| 2b Spec table | `<section data-portal data-switch-run>` (range `-0.25,0.1`, 200vh live), `data-portal-pin` > `data-portal-window` + `data-portal-frame`, `data-portal-focus` on the first Harness value; the Harness `<dd data-switch="scroll">` (span `0.1,1`), one `data-switch-item` per harness |
| 3 Full lime screen | the section `data-theme-zone="accent"`; its title wrapper `data-rise="block"`, H2 `data-rise="title"`, second line `data-rise="line"`; the three cards `data-rise="card"` |
| Section titles elsewhere (FAQ, closing) | `data-rise="block"` / `"title"` / `"line"` |
| 6 Footer | `<footer data-footer>`; link columns `data-footer-link` inside `data-footer-links`; brand row `data-footer-brand` with the mark and the letters-only wordmark `data-footer-rise` (mark first); the mark's outline path `data-draw`, its line `data-draw="grow-x"` |

Not here: the full lime screen itself is CSS only (Frame's hard edge,
`linear-gradient(var(--accent) 0 calc(100svh + 40px), #fff 100%)`), hover is
CSS, and the line field is T2's `linefield.ts`.

## Portal — `[data-portal]`

`portal.ts`, the v5 graft of v4c's scroll motion (owner 10-20: 「滚动的动效我觉得是有说法的」): a sticky host whose
content is seen through the mosoo mark's block, the concave-sided window of the logo outline. The window starts
small, grows with the scroll until it covers the host, and is then taken away. Wire it with
`initPortal(root)` from `./portal.ts`. Proof (sandbox, recordings, checks, one command): staging
`v5/graft/portal/` (`NOTES.md` there).

| Piece | Value | Source |
| --- | --- | --- |
| Shape | the v5 lockup mark's block, `BRAND_MARK.fill` (`brand-v5.generated.ts`), redrawn in px as `clip-path: path()` every frame; sides concave by 2.87 % of the width at mid-height | Enter Pro door mask (staging `refs/enter-pro/notes.md` §3, a masked full-size scene); v4c `stage.ts` (the block redrawn per size, not scaled) |
| Frame (optional) | 1 px ink outline of the same path, plus the mark's bar as a 1 px line under it (the mark's gap kept); hidden once open | v4c `.portal-frame`; BRIEF §3.3 line language |
| Closed window | `data-portal-width` (default 240 px), or wider when that is needed to show `[data-portal-focus]` whole with 16 px to spare; centred on the focus, else on the host | brief: about 240 px, centred |
| Open window | centred, covers the host with 2 px to spare (its narrowest width, at mid-height, spans the host); the clip is then removed | — |
| Motion | one zoom about the fixed point that maps the closed window onto the open one; scale geometric in the progress, `w = w0 · (w1 / w0)^p` | ours: what the closed window shows stays put; a smoothstep left 1–35 px slivers along the screen edges over the last tenth |
| Range | `data-portal-range="-0.5,0.5"`: in screens of scroll from the moment the host's top reaches the viewport's top (negative: while the host is still coming in) | ours |
| Gate | `data-portal-media`, default `(min-width: 901px) and (min-height: 680px)` (where the stage pins), and no reduced motion | stage.ts |

Per frame it writes `data-portal-mode="live"`, `data-portal-state="closed | opening | open"` and `--portal-p` (0–1 over
the range) on the host, the inline `clip-path` on `[data-portal-window]` (none once open), and `d` on
`[data-portal-outline]` / `[data-portal-line]` inside `[data-portal-frame]`.

No empty frame, by construction: the window always shows the content behind it, and the engine hides nothing in the
host (no veil, no opacity, no leave-then-enter; v4c's empty frames at p = .05–.06 and .37, REVIEW-v4 §3.3, came
from those). Measured with `tools/motion.ts --step 30` on the sandbox, the host's ground outside the window painted
magenta: 770 frames, 0 with the window on screen but no ink in it, 0 with no ink on screen; the least ink in the
window while it opens is 1,075 px at 0.5 scale. The same check with v4c's veil put back (positive control): 225 and
86 such frames of 767. Recorded the same way, v4c's own build has 13 of 191 frames with under 100 ink pixels on
screen outside the nav, 7 of them with none (p ≈ .11 and .37–.39). Frame cost (headless Chrome, 1440 × 900): 456
rAF intervals through the door, p95 16.7 ms, none over 20 ms, no long animation frame; 0.2–0.4 ms of main-thread
work per frame over the same page without the engine (four runs).

```css
/* Not live (no JS, reduced motion, outside data-portal-media): the CSS default, the content in the flow. */
[data-portal-frame] { display: none; }
[data-portal][data-portal-mode="live"] {
  height: 250vh; /* the pin's screen + the range's end (0.5) + one screen with the door open */
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
```

- Markup: `[data-portal]` > `[data-portal-pin]` (first, at the host's top) > the window layer `[data-portal-window]`
  (the real content, with an opaque ground: it covers the host once open) and, after it,
  `<svg data-portal-frame aria-hidden="true"><path data-portal-outline/><path data-portal-line/></svg>`.
- The window owns its `clip-path`; do not style one on it. No `data-rise` inside the window: the rise engine hides
  what starts below the fold, and the window must show its content from the first frame.
- Sizes are re-measured when the page, the host or the focus resizes and when web fonts finish loading (without the
  last two, the closed window was framed on the fallback face's box in 3 of 4 sandbox loads).
- The focus is measured from layout offsets (`offsetLeft` / `offsetTop` up to the window layer), not from
  `getBoundingClientRect()`: on the v5 page it is a Harness value the switch rolls away with `translate`, and a
  re-measure while it was rolled away (a FAQ item opening resizes the body) framed the closed window 24 px off it.
- The host's live height is the pin's screen, plus the range's end, plus the time the open content stays pinned.
- Focus inside the window opens it while focus stays inside (measured with Tab: `open`, the focused link
  `:focus-visible`, on screen and topmost), unless the focus came from a pointer press: `clip-path` also clips
  hit-testing, so a press can only land on the visible part (a `mask-image` would still take the click; measured).
  Screen readers get the whole content either way: with the window small, Chrome's accessibility tree still holds
  every string of the sandbox's table, none ignored (measured).
- With the harness switch (`harness-switch.ts`) on the same screen: put `data-switch-run` on the portal host; its
  run starts at the pin, so the door is open at `b × 100vh / (host height − 100vh)` of it (1/3 with the defaults
  above), and `data-switch-span` should start after that.
- Reduced motion, no JS, phones and 1024 × 600, a pin a capture tool sets to `position: static`
  (`tools/capture-v4.ts` UNSTICK): not live, no mask, the content in the flow. A runtime change of the media query
  or of reduced motion is followed both ways.

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
| `data-switch="time"` | while in view, one pass: second value → … → first value, one roll every `data-switch-hold` ms (default 2100, clamped 1000–6000). Four values take three rolls: 4.9 s of motion, inside WCAG 2.2.2's 5 s like `play-for.ts` and `linefield.ts`. Pauses while the slot is outside the middle 70 % of the viewport, under a mouse, focused within, or in a hidden tab. Rests on the first value; plays again after the slot has left the viewport entirely | a13n rolls every 2.4 s forever (not kept); v4a turned once |

Writes: on `[data-switch]` `data-switch-mode="live"`, `data-switch-driver="scroll | time"`, `data-switch-at="k"`,
`data-switch-ready` (two frames after going live), and for the time driver `data-switch-pass="play | hold | done"`;
on every `[data-switch-item]` `data-switch-state="past | active | next"`.

With the portal on the same screen (see "Portal" above): `data-switch-run` on the portal host; the door is open at
1/3 of its run with the portal's defaults, so start the span after that (`0.4,0.95` there). Give each value about
300–400 px of scroll (the sandbox: a 300vh run, span `0.1,0.9`, 360 px per value at 900 px tall); with the portal's
250vh host that span leaves about 185 px per value, so make the host taller rather than the span wider.

Why the scroll driver triggers a timed roll instead of scrubbing it: the reader decides which name shows and never
comes to rest between two (a 40 px arrow-key step would stop a scrubbed roll half way: two half-clipped names). Why
the time driver ends: a13n's loop is the motion review's P1-2 (motion that never stops); one pass shows each name
once, then the row is still.

Markup. The four names reach a screen reader once, from a visually hidden list; the animated slot is `aria-hidden`.
Glyphs are `../home/runtime-glyphs.ts`, rendered as the hero's keycaps render them; values in `HARNESS_IDS` order (the
first value is where the time driver rests: OpenAI Codex, the harness the stage's Call names):

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

- Time driver: rolls 2102 / 4203 / 6304 ms after the slot entered the band; the last value is whole at 7029 ms, so
  the motion lasts 4927 ms. Hover (3004 ms), focus (2503 ms) and a hidden tab (simulated, 2002 ms) push the next roll
  back by exactly that long; leaving the view keeps the remaining time (1591 ms); after a whole pass, leaving the
  viewport resets it unseen and coming back plays a whole pass again.
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
