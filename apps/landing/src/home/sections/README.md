# Home sections: the contract

The v5 home is one static page rendered by `../markup.ts` from one module per section. The build writes it into
`/en`, `/zh` and `/ja` (`scripts/landing-home.mjs`); `src/main.tsx` renders the same string in dev and starts the
motion (`../effects.ts`). Three section agents work in parallel, each on its own files; the system / integrator
agents own everything shared.

| Section | Module | Styles | Copy | Owner | Wrapper |
| --- | --- | --- | --- | --- | --- |
| 0 Nav | `nav.ts` | `nav.css` | `../copy/nav.json` | system | `<a class="v5-skip">` + `<header class="v5-nav" data-nav>`; inside, `<nav id="v5-nav-menu" popover>` holds the row (Products and the language list as `popover` panels, staging `v5/polish/nav/DESIGN.md`), which up to 860px is the sheet the menu button opens |
| 1 Hero | `hero.ts` | `hero.css` | `../copy/hero.json` | hero + stage agent | `<section id="hero" data-section="hero" class="v5-sec v5-hero">` |
| 2 Stage | `stage.ts` | `stage.css` | `../copy/stage.json` | hero + stage agent | `<section id="how-it-works" data-section="stage" class="v5-sec v5-stage" data-stage>` |
| 2b Spec table | `spec.ts` | `spec.css` | `../copy/spec.json` | spec agent (graft 2026-10-20) | `<section id="parts" data-section="spec" class="v5-sec v5-spec" data-portal data-switch-run>` |
| 3 Full lime screen | `accent.ts` | `accent.css` | `../copy/accent.json` | accent agent | `<section id="session" data-section="accent" class="v5-sec v5-accent">` |
| 4 FAQ | `faq.ts` | `faq.css` | `../copy/faq.json` | faq + closing agent | `<section id="faq" data-section="faq" class="v5-sec v5-faq">` |
| 5 Closing | `closing.ts` | `closing.css` | `../copy/closing.json` | faq + closing agent | `<section id="start" data-section="closing" class="v5-sec v5-closing">` |
| 6 Footer | `footer.ts` | `footer.css` | `../copy/footer.json` | system | `<footer class="v5-ft" data-footer>` |

All six content sections have landed (UI lock: X placeholders of realistic length in the copy files; the slot table
and the evidence are in staging `v5/UI-LOCK.md`; the spec table joined in the 2026-10-20 graft, staging
`v5/graft/INTEGRATION.md`). The hero ends at its CTA row: the plate under it is the stage's.

## What a module is

```ts
import type { HomeCopy, HomeLocale } from "../copy.ts";

export function render(locale: HomeLocale, copy: HomeCopy): string; // exactly one root element
```

- Receives the locale and the whole page's copy for it (`copy.hero`, `copy.stage`, ...; the hero may read the
  stage's kit props, since the plate under the hero shows the stage's first state, laptop).
- Returns one root element, the wrapper in the table, with its `id`, `data-section` and `class` unchanged: the ids
  are anchors (`#faq` is the FAQPage JSON-LD's `@id`), `data-section` is how `tools/budget.ts` and the tests find
  sections.
- Pure string rendering: no DOM, no `Date`, no randomness (the build must be deterministic). It runs in Node at
  build time and in the browser in dev, so: erasable TypeScript only, relative imports with the `.ts` extension, no
  `@/` alias, no JSON import except through `../copy.ts`.
- May import: `../copy.ts` (copy, `LINKS`, `localeLinks`, `LANGUAGES`, `HARNESS_IDS`), `../ui.ts` (`esc`,
  `twoTone`, `harnessName`, `nameList`, `button`), `../kit/index.ts` (the product objects), `../runtime-glyphs.ts`,
  `../../shared/ui/brand-v5.generated.ts`. Not React, not `src/shared/styles/app.css`.
- Every visible string comes from the copy file. Product names stay as data in the copy files; URLs come from
  `../copy.ts`. Escape every string (`esc`).

## Copy

- `../copy/<section>.json` holds `en`, `zh` and `ja` in the same shape. Keys starting with `$` are notes
  (`$comment`, `$temporary` for carried-over real strings, `$slots`). Types are inferred from `en` in `../copy.ts`,
  so adding a slot is a JSON edit; the compiler checks that zh and ja have it.
- Budgets (en, characters) are in `tests/home-copy-slots.test.mjs`. A new slot needs a budget: declare it in your
  own file as `"$slots": { "<path>": { "chars": n } }` (paths without the locale, `*` for every item). The test
  fails on an unbudgeted slot and refuses to re-budget a path it already budgets.
- Visual first: slots hold X placeholders of realistic length (en: X/x, zh/ja: fullwidth Ｘ with the punctuation
  real copy would carry, so CJK lines can break). The content phase writes the words.
- The FAQ items must stay equal to the first llms.txt "Direct answers" in `src/worker.js`, which then adds answers
  the page leaves out (`tests/worker.test.mjs`); change both together. The pricing page reads the FAQ's cost question
  by its index (item 5 since round 3b: `scripts/landing-locales.mjs` `PRICING_QUESTION`, `routes/pricing/
  pricing-page.tsx` `COST_QUESTION`); move them with it.
- zh and ja headings and labels may carry the line-break mark `|` (#141, `../markup.ts` `BREAK`): `renderHome`
  writes each as `<wbr>`, `plain()` drops it for machine text, and no budget counts it. Put one after a comma or
  between phrases where a keep-all line may break, never inside a word; never in en, the FAQ (it is JSON-LD and
  llms.txt text too) or a string that also feeds an attribute (the kit's words are its `aria-label`).

## Styles

- Scope every rule under your section class (`.v5-hero`, `.v5-stage`, ...). No element selectors at the top level,
  no `:root` changes, no `!important`.
- Use the tokens and components of `../system.css`: `--ink`, `--ink-2`, `--ink-3` (24px and up only),
  `--ink-3-text` (small muted text, from 15px: `.v5-small`; 14px text that cannot grow uses `--ink-2`), `--paper`,
  `--frame`, `--frame-2` (a `--frame` fill under the pointer), `--accent`, `--accent-tint`, `--accent-shadow`,
  `--on-lime-2`, `--font-display` / `--font-sans` / `--font-mono`, `--w` (content width), `--sec-gap`, the
  `--ease-*` curves; `.v5-wrap`, `.v5-h1`, `.v5-h2` (`--lg` 64px, `--xl` 72px), `.v5-tone-b`, `.v5-lead`,
  `.v5-hn` (a harness name in a sentence: `ui.ts` `harnessName` / `nameList`), `.v5-new` (the New chip),
  `.v5-btn--lime` / `--grey` (the secondary) / `--ink`, `.v5-actions`, `.v5-on-lime` (ink text, ink 70% second line,
  no lime on lime), `.v5-sr`.
- The display face (`--font-display`, every heading on the site) is Roboto Serif (OFL, by Commercial Type): a serif
  family of its own, not the Roboto sans that hallmark item 1 names. en headings load its wght 440 file, the Latin in
  zh / ja headings its wght 400 file (`"Roboto Serif Display CJK"`); kanji and kana stay in Songti / Mincho.
- 1px ink lines draw structure only (the FAQ rules, the spec table's top rule, the door's frame, the stage's
  progress line, and in the stage's last state who calls whom), never around words: names, buttons, tabs, file
  names and pills carry no outline, and mono is for code, paths, hosts and events (on the home: the file name and the
  request line, `POST …/threads`) (committee O1, 2026-10-21; the keycap `.v5-kc`, the tab label `.v5-tab` and the
  line button `.v5-btn--line` are gone).
- Overridable defaults are zero-specificity (`:where()`), for example the gap between sections
  (`main > .v5-sec + .v5-sec`); set your own `margin-top` on your section.
- T1 fields: `../v5-fields.css` (`.v5-field`, `.v5-field--hero`, `--spec` (the stage's light and grain at chroma 0),
  `--closing`, `--lime`, `--underlay-a|b|c`); it owns `::before` / `::after` of the element it is on. T4 kit:
  `../kit/kit.css`.
- zh and ja pages set the Latin in their lines in Hanken at the CJK face's own Latin x-height (`../system.css`:
  `"Hanken Grotesk SC"` 104.87 %, `"Hanken Grotesk JP"` 110.55 %, the same file, Hanken's line box kept); measure
  zh / ja widths on the built page, not by scaling en.
- Phones switch at 720px (T1's plates, the paper inset); the nav gives its row to the menu button and its sheet up to
  860px (the floating bar is 840px wide, the ja row needs 828); the stage pins from 901px wide and 680px tall.
- Colour rules: no white text on lime, no lime text or lime hairlines on white, focus ring 2px ink (from the
  system), text contrast at least 4.5:1 under 24px and 3:1 from 24px.

## Engine declarations (src/effects/v5/README.md; wired in `../effects.ts`)

| Section | Must carry |
| --- | --- |
| `<html>` | `data-damp` (index.html) and the head's `js` class line (index.html) |
| Nav | `<header data-nav>`, the CTA slot `data-nav-cta`; its `popover` panels (Products, the language list, the phone sheet) open and close without a script, and the nav engine also closes one when focus moves off it and its button, or when its button is hidden. A same-origin `a[hreflang]` to `/en`, `/zh` or `/ja` anywhere on the page (the bar's list, the footer's) writes the `mosoo_locale` cookie on click (`shared/locale.ts` `rememberLocale`, read by the worker's `/` redirect) |
| Hero | H1 `data-rise-load="title"`, its second line `data-rise-load="line"`; lead and CTA row `data-rise-load="fade"`; the lime CTA `data-nav-cta-watch` (exactly one on the page); the announcement over the H1 `data-budget="chrome"` (site chrome: `tools/budget.ts` leaves its words out) and `data-rise-load="fade"` |
| Stage | the section `data-stage` (`data-stage-at="0,0.2,0.6"`, `data-stage-media` = where it pins: 901px wide and 680px tall), its sticky layer `data-stage-pin`, every part of step k `data-stage-step="k"`; the step row's names are `<li data-stage-step="k">` (the engine marks the lit one `aria-current="step"`, sets `data-stage-started` once the run begins and `--stage-fill` for the progress line; `stage.css` keeps the row out of sight until the run starts, so the first screen has no step word, and the stacked plates carry none; since round 3b the row sits over the caption, the object fills the plate's top). Since round 3b the stage does not use the slide contract in `../system.css` (`.v5-stage-screen`, `.v5-stage-say`: no home section uses them now; the section's sticky pin and 350vh are still there, `stage.css` sets 220vh): each step is one `<article>` with its object layer `.v5-step-screen[data-stage-step="k"]` and its caption; pinned, the first article's object (the kit's Session object) changes in place, as `stage.css` turns the engine's `data-step` into the kit's `--kit-cloud` / `--kit-app` (registered numbers, transitioned on the switch's 0.9 s), and the other two objects stay in the page at opacity 0 for screen readers; the captions switch with it. Unpinned (smaller screens, reduced motion, no JS) is the CSS default and reads as three stacked plates. Line field hosts, in the first step's plate (the plate is the stage): `<div data-linefield="hero" class="v5-lf--wide">` and `<div data-linefield="hero-mobile" class="v5-lf--phone">`, each with its `<img data-linefield-poster src="/landing/v5/lines/<id>.svg" alt="">`. `../effects.ts` starts the stage engine before the rise engine, which reads the pinned layout |
| Spec table | the section is the portal's host (`data-portal`, `data-portal-range`, `data-portal-media` = where the stage pins) and the switch's run (`data-switch-run`); its first child `data-portal-pin` holds `data-portal-window` (the T1 field `.v5-field--spec` alone, an opaque ground the portal clips), `<svg data-portal-frame>` and the content over both (`.v5-spec-in`: the H2, never clipped; `<span data-portal-door>`, the closed mark's box under the H2; the card, `data-portal-reveal`, shown once the window holds it; no `data-rise` in the pin). The Harness `<dd>` is the switch: `data-switch="time"` on redesign/v5 (A: the 120vh host is not pinned for the switch; one timed pass per page view once the card is shown, OpenAI Codex first and last), `"scroll"` with `data-switch-span` and a 200vh host on redesign/v5-pin (B); `data-switch-media`. Inside: a visually hidden list with the four names, then an aria-hidden slot with one `data-switch-item` per harness (HARNESS_IDS order, names from `hero.harnesses`), then an aria-hidden list of the four names, each after a 20px neutral glyph tile, the current one in ink on an inverted tile. Still (no JS, reduced motion, below 901 x 680) it is a plate in the flow: the first harness large and all four listed under it. `../effects.ts` starts the portal and the switch after the stage and before the rise engine |
| Accent | `data-theme-zone="accent"` on `.v5-acc-zone` only: an absolutely positioned box inside the lime panel over the solid stretch and the first half of the fade (not the white gap before the edge, not the pale end): the nav turns lime glass with an ink CTA while that box is under the bar's centre line. Title wrapper `data-rise="block"`, H2 `data-rise="title"`, its second line `data-rise="line"`, each card `data-rise="card"`. The full lime screen itself is CSS (Frame: `linear-gradient(var(--accent) 0 calc(100svh + 40px), transparent 100%)`). The three cards are one row of `1fr 2fr 1fr` (the middle one `v5-acc-card--wide`: text left, figure right), rows of text and figure up to 1023px. Their figures (sandbox, files, resume) are inline copies of `public/landing/v5/figures/*.svg` at three sizes each, large / medium / small (202 / 160 / 96; the wide card's files 296 / 202 / 96), and the CSS shows one (`tests/home-figures.test.mjs` keeps them equal) |
| FAQ | one native `<details name="faq">` per item, the first `open`; the question is the `<summary>`'s text, the answer the rest of the `<details>` (decorations aria-hidden, no text). Title `data-rise="block"` / `"title"` / `"line"` |
| Closing | the copy engine: `<button type="button" data-copy data-copied-label="…">` with a `[data-copy-label]` span, in the same `[data-product-ui]` element as the `[data-prompt]` sentence and a polite `[data-copy-status]` region (hidden without JS by the system): `.v5-closing-setup`, which has no look of its own since #130 but stays, because the engine finds the sentence and the region through `button.closest("[data-product-ui]")` (`tests/home-copy-slots.test.mjs`). Title rise as above |
| Footer | `data-footer`, `data-footer-links` around the columns, `data-footer-link` on each column, `data-footer-brand` on the seam, `data-footer-rise` on the mark then the letters; the mark's `.bm-fill` / `.bm-block` / `.bm-bar` paths (`../footer-mark.ts`: draw, ink fill, desktop hover redraw) |

- Product objects carry `data-product-ui` (the kit does; so do the hero's harness names): their words count as
  object words in `tools/budget.ts` (first screen at most 16, page at most 160); everything else counts as marketing
  words (first screen at most 25, page at most 400).
- Do not put `data-rise` on an element that uses `translate` or `scale` for layout; wrap it.
- Reduced motion and no JS must show the complete end state. The engines only hide what they will animate, and
  only when motion is allowed.

## Shared files (system / integrator only)

`../markup.ts` (frame, section order), `../copy.ts`, `../ui.ts`, `../system.css`, `../v5.css`, `../effects.ts`,
`../footer-mark.ts`, `../copy-prompt.ts`, `nav.*`, `footer.*`, `apps/landing/index.html`,
`src/main.tsx`, `scripts/landing-home.mjs`, `scripts/landing-locales.mjs`, the tests. A section agent who needs a
change there writes it down as a request for the integrator.
