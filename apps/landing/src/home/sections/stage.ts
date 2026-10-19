// 2 Stage (staging production/v5/BRIEF.md §4 row 2). Styles: ./stage.css; copy: ../copy/stage.json.
//
// One plate, three states of one object. The plate is the hero's: it sits right under the hero's CTA row, so the
// first screen shows its first state (Call). On wide screens it pins (src/effects/v5/stage.ts) and the object
// switches Call -> Watch -> Return at fixed points; everywhere else the three states stack as three plates.
//   plate     T1 hero field (../v5-fields.css .v5-field--hero) with the T2 line field (src/effects/v5/linefield.ts,
//             instances "hero" / "hero-mobile" in public/landing/v5/lines/params.json) threading behind the object
//   object    the T4 kit Session (../kit): Call bleeds off the plate's right edge like v4b's fragment
//             (kit proof 04); Watch is the stream form (card -> connector -> the backend's event list, kit proof
//             02); Return is the F19 stack with the T1 underlay (kit proof 06)
//   tags      top-left: the step tags; pinned, the past ones collapse into one compact row (CTRL's step cards,
//             staging refs/ctrl/v5/STUDY.md §1.6), the next ones wait unseen
//   caption   bottom-left: title + one line per step (Mintlify's bento label position); pinned, the captions roll
//             over each other at the switch, so neither the object nor the caption is ever empty
// Markup per step: one <article> holding its tag, its object layer (.v5-stage-screen, the engine contract in
// ../system.css) and its caption. Unpinned, each article is a plate. Pinned, the articles are stacked layers of
// one plate and only the tag row above them is shown; the per-article tags are display:none, so no word is shown
// twice. The articles carry data-rise="card": unpinned plates below the fold enter with the rise engine.

import type { HomeCopy, HomeLocale } from "../copy.ts";
import { HARNESS_IDS } from "../copy.ts";
import { renderSession } from "../kit/index.ts";
import type { EventKind } from "../kit/index.ts";
import { esc } from "../ui.ts";

/** Wire names the three event rows stand for (MAIN pkgs/contracts/src/session/session.contract.ts L138-152). */
const EVENTS: readonly { kind: EventKind; event: string }[] = [
  { kind: "file", event: "file.changed" },
  { kind: "tool", event: "tool.use.completed" },
  { kind: "run", event: "run.started" },
];

const KIT_LANG = { en: undefined, zh: "zh-CN", ja: "ja" } as const;

const STATES = ["call", "watch", "return"] as const;

/**
 * Where each state takes over, as a share of the pinned run (data-stage-at). Call has already been on screen since
 * the first screen, so it holds the shortest pinned stretch; at 1440x900 the plate stays pinned for 1,980 px of
 * scroll: Call 574, Watch 666, Return 740 (staging v5/sections/hero-stage/NOTES.md §3).
 */
const STAGE_AT = "0,0.27,0.64";

/** Pinned only where the plate (560-720px) fits under the floating nav: wide, and at least 680px tall. */
const STAGE_MEDIA = "(min-width: 901px) and (min-height: 680px)";

/** The line-field design boxes (public/landing/v5/lines/params.json w x h; the posters are drawn at this size). */
const LINES = {
  hero: { w: 1120, h: 720 },
  "hero-mobile": { w: 720, h: 460 },
} as const;

function lineHost(id: keyof typeof LINES, cls: string): string {
  const { w, h } = LINES[id];
  return `<div data-linefield="${id}" class="${cls}"><img data-linefield-poster src="/landing/v5/lines/${id}.svg" alt="" width="${w}" height="${h}" decoding="async"></div>`;
}

export function render(locale: HomeLocale, copy: HomeCopy): string {
  const s = copy.stage;
  const k = s.kit;
  const harness = { runtime: HARNESS_IDS[0], name: k.harness };
  const base = { lang: KIT_LANG[locale], size: "stage" as const };
  const objects = [
    renderSession({
      state: "call",
      ...base,
      harness,
      instruction: k.call.instruction,
      attachment: k.call.attachment,
      bleed: true,
    }),
    renderSession({
      state: "watch",
      ...base,
      status: k.watch.status,
      action: k.watch.action,
      file: k.watch.file,
      stream: k.watch.stream,
      events: EVENTS.map((e, i) => ({ ...e, text: k.watch.events[i] ?? "" })),
    }),
    renderSession({
      state: "return",
      ...base,
      harness,
      turn: k.return.turn,
      after: k.return.after,
      restored: k.return.restored,
    }),
  ];
  const lines = `<div class="v5-step-lines" aria-hidden="true">${lineHost("hero", "v5-lf--wide")}${lineHost("hero-mobile", "v5-lf--phone")}</div>`;
  const tags = s.steps
    .map((step, i) => `<li class="v5-stage-chip" data-stage-step="${i}">${esc(step.tag)}</li>`)
    .join("");
  const steps = s.steps.map((step, i) => {
    const state = STATES[i] ?? "call";
    const id = `stage-${state}`;
    return `<article class="v5-step v5-step--${state} v5-field v5-field--hero" data-rise="card" aria-labelledby="${id}">
${i === 0 ? lines : ""}<p class="v5-stage-chip v5-step-tag">${esc(step.tag)}</p>
<div class="v5-stage-screen v5-step-screen" data-stage-step="${i}"><div class="v5-step-obj">${objects[i] ?? ""}</div></div>
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
