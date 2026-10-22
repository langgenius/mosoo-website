// 2 Stage (staging production/v5/BRIEF.md §4 row 2; round 3b, the new claim: staging narrative/CHANGES.md §2, §3).
// Styles: ./stage.css; copy: ../copy/stage.json.
//
// One plate, three states of one object (the kit's Session object, ../kit/session.ts). The plate is the hero's: it sits
// right under the hero's CTA row, so the first screen shows its first state, laptop: the laptop card and the Session
// card side by side, row for row, two more Sessions fanned behind the second. On wide screens it pins
// (src/effects/v5/stage.ts) and the object changes laptop -> cloud -> app at fixed points, in place: the engine writes
// data-step, stage.css turns it into the kit's two state numbers and the object's parts move with them; no card
// travels from the laptop to the Session (staging narrative/judge-truth:.md L32). Everywhere else the three states
// stack as three plates.
//   plate     T1 hero field (../v5-fields.css .v5-field--hero) with the T2 line field (src/effects/v5/linefield.ts,
//             instances "hero" / "hero-mobile" in public/landing/v5/lines/params.json) threading behind the object; its
//             knot sits behind the Session stack, never in the gap between the two cards (CHANGES §2.3)
//   object    top centre, whole inside the plate; the narrow layout (phones) is the kit's own (kit.css)
//   steps     pinned only: the step names as words (no box, O1), the lit one in ink, the told ones folded to a small grey
//             row, the next ones unseen, a 1px progress line under them, set over the caption at the bottom left (the
//             object fills the plate's top from the first screen on); the row waits for the run to start (the engine's
//             data-stage-started), so the first screen shows no step word, and the lit one is aria-current="step"
//   caption   bottom-left: title + one line per step (Mintlify's bento label position); pinned, the captions roll
//             over each other at the switch, so neither the object nor the caption is ever empty
// Markup per step: one <article> holding its object layer (.v5-step-screen) and its caption. Unpinned (phones, tablets,
// reduced motion, no JS), each article is a plate showing its own state, and its caption names the step: the stacked
// plates carry no step label (committee 2026-10-21, PLAN §3 1-2 item 3). Pinned, the articles are layers of one plate
// under the step row; the first one's object is the one on screen, moved through the states, and the other two stay in
// the page at opacity 0, so a screen reader still meets each state's object (role="img", its words as the label) with
// its caption. The articles carry data-rise="card": unpinned plates below the fold enter with the rise engine.

import type { HomeCopy, HomeLocale, StageCopy } from "../copy.ts";
import { HARNESS_IDS } from "../copy.ts";
import { renderSession } from "../kit/index.ts";
import type { SessionState } from "../kit/index.ts";
import { esc } from "../ui.ts";

const KIT_LANG = { en: undefined, zh: "zh-CN", ja: "ja" } as const;

/** The steps' states, in order (the kit's SessionState; data-kit-state and the article classes use them). */
const STATES: readonly SessionState[] = ["laptop", "cloud", "app"];

/**
 * Where each state takes over, as a share of the pinned run (data-stage-at). The first state has already been on screen
 * since the first screen, so it holds the shortest pinned stretch. The section is 220vh (stage.css): at 1440x900 the run
 * is 1,080 px, laptop 216, cloud 432, app 432 (staging v5/review/design.md P1-2: every pinned pixel moves something).
 */
const STAGE_AT = "0,0.2,0.6";

/** Pinned only where the plate (560-720px) fits under the floating nav: wide, and at least 680px tall. */
const STAGE_MEDIA = "(min-width: 901px) and (min-height: 680px)";

/** The line-field design boxes (public/landing/v5/lines/params.json w x h; the posters are drawn at this size). */
const LINES = {
  hero: { w: 1120, h: 720 },
  "hero-mobile": { w: 720, h: 460 },
} as const;

/** loading="lazy": the host of the other breakpoint is display:none, and a lazy image that is not rendered is not
 *  fetched (motion review P2-6: both posters downloaded at every width). */
function lineHost(id: keyof typeof LINES, cls: string): string {
  const { w, h } = LINES[id];
  return `<div data-linefield="${id}" class="${cls}"><img data-linefield-poster src="/landing/v5/lines/${id}.svg" alt="" width="${w}" height="${h}" loading="lazy" decoding="async"></div>`;
}

/**
 * The object's words for a screen reader, in reading order and in the copy's own words only (no new string to
 * translate): "Laptop: You, Codex, report.md. Session: …" (each card's rows top to bottom: who drives it, then the
 * agent and the file both cards share) and, for the app state, who calls whom with arrows.
 */
function label(locale: HomeLocale, k: StageCopy["kit"], state: SessionState): string {
  const [colon, comma, stop, open, close] = locale === "en" ? [": ", ", ", ". ", " (", ")"] : ["：", "、", "。", "（", "）"];
  const card = (place: string, rows: readonly string[]): string => `${place}${colon}${rows.join(comma)}${stop}`;
  const laptop = card(k.laptop.place, [k.laptop.driver, k.harness, k.file]);
  if (state === "laptop") {
    return `${laptop}${card(k.session.place, [k.session.driver, k.harness, k.file])}`.trim();
  }
  if (state === "cloud") {
    const rows = k.cloud.rows.map((row, i) => (i === k.cloud.rows.length - 1 ? `${row}${open}${k.cloud.pinned}${close}` : row));
    return `${laptop}${card(k.session.place, [k.harness, ...rows])}`.trim();
  }
  const sessions = [`${k.session.place}${open}${k.file}${close}`, k.session.place, k.session.place].join(comma);
  return `${k.app.sources.join(comma)} → ${k.app.app} → ${k.app.call} → ${sessions}`;
}

export function render(locale: HomeLocale, copy: HomeCopy): string {
  const s = copy.stage;
  const k = s.kit;
  const base = {
    lang: KIT_LANG[locale],
    size: "stage" as const,
    harness: { runtime: HARNESS_IDS[0], name: k.harness },
    file: k.file,
    laptop: k.laptop,
    session: k.session,
    cloud: k.cloud,
    app: k.app,
  };
  const lines = `<div class="v5-step-lines" aria-hidden="true">${lineHost("hero", "v5-lf--wide")}${lineHost("hero-mobile", "v5-lf--phone")}</div>`;
  const tags = s.steps.map((step, i) => `<li data-stage-step="${i}">${esc(step.tag)}</li>`).join("");
  const steps = s.steps.map((step, i) => {
    const state = STATES[i] ?? "laptop";
    const id = `stage-${state}`;
    const object = renderSession({ ...base, state, label: label(locale, k, state) });
    return `<article class="v5-step v5-step--${state} v5-field v5-field--hero" data-rise="card" aria-labelledby="${id}">
${i === 0 ? lines : ""}<div class="v5-step-screen" data-stage-step="${i}"><div class="v5-step-obj">${object}</div></div>
<div class="v5-step-cap" data-stage-step="${i}"><div class="v5-step-cap-in"><h2 id="${id}" class="v5-step-title">${esc(step.title)}</h2><p class="v5-step-line">${esc(step.line)}</p></div></div>
</article>`;
  });
  return `<section id="how-it-works" data-section="stage" class="v5-sec v5-stage" data-stage data-stage-at="${STAGE_AT}" data-stage-media="${STAGE_MEDIA}">
<div class="v5-stage-pin" data-stage-pin>
<div class="v5-wrap v5-stage-plate v5-field v5-field--hero">
<ol class="v5-stage-tags">${tags}</ol>
${steps.join("\n")}
</div>
</div>
</section>`;
}
