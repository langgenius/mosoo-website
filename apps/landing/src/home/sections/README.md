# Home sections: the contract

The v5 home is one static page rendered by `../markup.ts` from one module per section. The build writes it into
`/en`, `/zh` and `/ja` (`scripts/landing-home.mjs`); `src/main.tsx` renders the same string in dev and starts the
motion (`../effects.ts`). Three section agents work in parallel, each on its own files; the system / integrator
agents own everything shared.

| Section | Module | Styles | Copy | Owner | Wrapper |
| --- | --- | --- | --- | --- | --- |
| 0 Nav | `nav.ts` | `nav.css` | `../copy/nav.json` | system | `<a class="v5-skip">` + `<header class="v5-nav" data-nav>` |
| 1 Hero | `hero.ts` | `hero.css` | `../copy/hero.json` | hero + stage agent | `<section id="hero" data-section="hero" class="v5-sec v5-hero">` |
| 2 Stage | `stage.ts` | `stage.css` | `../copy/stage.json` | hero + stage agent | `<section id="how-it-works" data-section="stage" class="v5-sec v5-stage" data-stage>` |
| 3 Full lime screen | `accent.ts` | `accent.css` | `../copy/accent.json` | accent agent | `<section id="session" data-section="accent" class="v5-sec v5-accent">` |
| 4 FAQ | `faq.ts` | `faq.css` | `../copy/faq.json` | faq + closing agent | `<section id="faq" data-section="faq" class="v5-sec v5-faq">` |
| 5 Closing | `closing.ts` | `closing.css` | `../copy/closing.json` | faq + closing agent | `<section id="start" data-section="closing" class="v5-sec v5-closing">` |
| 6 Footer | `footer.ts` | `footer.css` | `../copy/footer.json` | system | `<footer class="v5-ft" data-footer>` |

All five content sections have landed (UI lock: X placeholders of realistic length in the copy files; the slot table
and the evidence are in staging `v5/UI-LOCK.md`). The hero ends at its CTA row: the plate under it is the stage's.

## What a module is

```ts
import type { HomeCopy, HomeLocale } from "../copy.ts";

export function render(locale: HomeLocale, copy: HomeCopy): string; // exactly one root element
```

- Receives the locale and the whole page's copy for it (`copy.hero`, `copy.stage`, ...; the hero may read the
  stage's kit props, since the hero board shows the Call state).
- Returns one root element, the wrapper in the table, with its `id`, `data-section` and `class` unchanged: the ids
  are anchors (`#faq` is the FAQPage JSON-LD's `@id`), `data-section` is how `tools/budget.ts` and the tests find
  sections.
- Pure string rendering: no DOM, no `Date`, no randomness (the build must be deterministic). It runs in Node at
  build time and in the browser in dev, so: erasable TypeScript only, relative imports with the `.ts` extension, no
  `@/` alias, no JSON import except through `../copy.ts`.
- May import: `../copy.ts` (copy, `LINKS`, `localeLinks`, `LANGUAGES`, `HARNESS_IDS`), `../ui.ts` (`esc`,
  `twoTone`, `keycap`, `button`, `tabLabel`), `../kit/index.ts` (the product objects), `../runtime-glyphs.ts`,
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
  the page leaves out (`tests/worker.test.mjs`); change both together.

## Styles

- Scope every rule under your section class (`.v5-hero`, `.v5-stage`, ...). No element selectors at the top level,
  no `:root` changes, no `!important`.
- Use the tokens and components of `../system.css`: `--ink`, `--ink-2`, `--ink-3` (24px and up only),
  `--ink-3-text` (small muted text), `--paper`, `--frame`, `--accent`, `--accent-tint`, `--accent-shadow`,
  `--on-lime-2`, `--font-display` / `--font-sans` / `--font-mono`, `--w` (content width), `--sec-gap`, the
  `--ease-*` curves; `.v5-wrap`, `.v5-h1`, `.v5-h2` (`--lg` 64px, `--xl` 72px), `.v5-tone-b`, `.v5-lead`,
  `.v5-keys` + `.v5-kc` (keycaps), `.v5-tab` (tab label; set `--tab-bg` to your ground), `.v5-btn--lime` /
  `--ink`, `.v5-actions`, `.v5-on-lime` (ink text, ink 70% second line, no lime on lime), `.v5-sr`.
- Overridable defaults are zero-specificity (`:where()`), for example the gap between sections
  (`main > .v5-sec + .v5-sec`); set your own `margin-top` on your section.
- T1 fields: `../v5-fields.css` (`.v5-field`, `.v5-field--hero`, `--closing`, `--lime`, `--underlay-a|b|c`); it
  owns `::before` / `::after` of the element it is on. T4 kit: `../kit/kit.css`.
- Phones switch at 720px (T1's plates, the paper inset; up to there the floating nav trades its links for the CTA
  once the CTA is in); the nav hides its wide links at 600px; the stage pins from 901px wide and 680px tall.
- Colour rules: no white text on lime, no lime text or lime hairlines on white, focus ring 2px ink (from the
  system), text contrast at least 4.5:1 under 24px and 3:1 from 24px.

## Engine declarations (src/effects/v5/README.md; wired in `../effects.ts`)

| Section | Must carry |
| --- | --- |
| `<html>` | `data-damp` (index.html) and the head's `js` class line (index.html) |
| Hero | H1 `data-rise-load="title"`, its second line `data-rise-load="line"`; lead and CTA row `data-rise-load="fade"`; the lime CTA `data-nav-cta-watch` (exactly one on the page) |
| Stage | the section `data-stage` (`data-stage-at="0,0.2,0.6"`, `data-stage-media` = where it pins: 901px wide and 680px tall), its sticky layer `data-stage-pin`, every part of step k `data-stage-step="k"`. Pinned layering is the contract in `../system.css` (`.v5-stage-screen`, one per step; the section's height there is 350vh, `stage.css` sets 220vh); the captions switch with the object instead of the scrubbed `.v5-stage-say`. Unpinned (smaller screens, reduced motion, no JS) is the CSS default and reads as three stacked plates. Line field hosts, in the first step's plate (the plate is the stage): `<div data-linefield="hero" class="v5-lf--wide">` and `<div data-linefield="hero-mobile" class="v5-lf--phone">`, each with its `<img data-linefield-poster src="/landing/v5/lines/<id>.svg" alt="">`. `../effects.ts` starts the stage engine before the rise engine, which reads the pinned layout |
| Accent | `data-theme-zone="accent"` on `.v5-acc-zone` only: an absolutely positioned box inside the lime panel over the solid stretch and the first half of the fade (not the white gap before the edge, not the pale end): the nav turns lime glass with an ink CTA while that box is under the bar's centre line. Title wrapper `data-rise="block"`, H2 `data-rise="title"`, its second line `data-rise="line"`, each card `data-rise="card"`. The full lime screen itself is CSS (Frame: `linear-gradient(var(--accent) 0 calc(100svh + 40px), transparent 100%)`). The three figures (sandbox, files, resume) are inline copies of `public/landing/v5/figures/*.svg` (`tests/home-figures.test.mjs` keeps them equal) |
| FAQ | one native `<details name="faq">` per item, the first `open`; the question is the `<summary>`'s text, the answer the rest of the `<details>` (decorations aria-hidden, no text). Title `data-rise="block"` / `"title"` / `"line"` |
| Closing | the copy engine: `<button type="button" data-copy data-copied-label="…">` with a `[data-copy-label]` span, in the same `[data-product-ui]` card as the `[data-prompt]` sentence and a polite `[data-copy-status]` region (hidden without JS by the system). Title rise as above |
| Footer | `data-footer`, `data-footer-links` around the columns, `data-footer-link` on each column, `data-footer-brand` on the seam, `data-footer-rise` on the mark then the letters; the mark's `.bm-fill` / `.bm-block` / `.bm-bar` paths (`../footer-mark.ts`: draw, ink fill, desktop hover redraw) |

- Product objects carry `data-product-ui` (the kit does; keycaps do): their words count as object words in
  `tools/budget.ts` (first screen at most 16, page at most 160); everything else counts as marketing words (first
  screen at most 25, page at most 400).
- Do not put `data-rise` on an element that uses `translate` or `scale` for layout; wrap it.
- Reduced motion and no JS must show the complete end state. The engines only hide what they will animate, and
  only when motion is allowed.

## Shared files (system / integrator only)

`../markup.ts` (frame, section order), `../copy.ts`, `../ui.ts`, `../system.css`, `../v5.css`, `../effects.ts`,
`../footer-mark.ts`, `../copy-prompt.ts`, `nav.*`, `footer.*`, `apps/landing/index.html`,
`src/main.tsx`, `scripts/landing-home.mjs`, `scripts/landing-locales.mjs`, the tests. A section agent who needs a
change there writes it down as a request for the integrator.
