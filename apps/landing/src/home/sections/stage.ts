// 2 Stage (BRIEF §4 row 2). STUB from the system agent: the hero + stage agent replaces the body and fills
// ./stage.css. It already runs the stage engine (src/effects/v5/stage.ts): the section is [data-stage], the sticky
// layer [data-stage-pin], and every part of step k carries data-stage-step="k" (tag, screen, caption). The pinned
// layering of .v5-stage-frame > .v5-stage-screen and the scrubbed .v5-stage-say > * is the engine contract in
// ../system.css (the README's sandbox structure: tags, one clipped frame holding every screen, the sentences).
// The screens render the kit's Session (src/home/kit) from the stage copy, only to prove the pipeline; the board,
// the frame and the placement are the section agent's.

import type { HomeCopy, HomeLocale } from "../copy.ts";
import { HARNESS_IDS } from "../copy.ts";
import { renderSession } from "../kit/index.ts";
import type { EventKind } from "../kit/index.ts";
import { esc, stubLabel } from "../ui.ts";

/** Wire names the three event rows stand for (MAIN pkgs/contracts/src/session/session.contract.ts L138-152). */
const EVENTS: readonly { kind: EventKind; event: string }[] = [
  { kind: "file", event: "file.changed" },
  { kind: "tool", event: "tool.use.completed" },
  { kind: "run", event: "run.started" },
];

const KIT_LANG = { en: undefined, zh: "zh-CN", ja: "ja" } as const;

export function render(locale: HomeLocale, copy: HomeCopy): string {
  const s = copy.stage;
  const k = s.kit;
  const harness = { runtime: HARNESS_IDS[0], name: k.harness };
  const base = { lang: KIT_LANG[locale], size: "stage" as const };
  const screens = [
    renderSession({ state: "call", ...base, harness, instruction: k.call.instruction, attachment: k.call.attachment }),
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
  const names = ["call", "watch", "return"];
  const tags = s.steps
    .map((step, i) => `<li class="v5-stage-tag" data-stage-step="${i}">${esc(step.tag)}</li>`)
    .join("");
  const frame = screens
    .map(
      (screen, i) =>
        `<div class="v5-stage-screen" data-stage-step="${i}">${stubLabel(`screen ${i} · kit renderSession(${names[i] ?? ""})`)}${screen}</div>`,
    )
    .join("\n");
  const say = s.steps
    .map(
      (step, i) =>
        `<div data-stage-step="${i}"><h3 class="v5-stub-h3">${esc(step.title)}</h3><p>${esc(step.line)}</p></div>`,
    )
    .join("\n");
  return `<section id="how-it-works" data-section="stage" class="v5-sec v5-stage v5-stub" data-stage data-stage-at="0,0.34,0.67">
<div class="v5-stage-pin" data-stage-pin>
<div class="v5-wrap v5-stub-stage">
${stubLabel("stage · pinned 350vh at 901px and wider with motion allowed; stacked otherwise · hero + stage agent")}
<ol class="v5-stub-tags">${tags}</ol>
<div class="v5-stage-frame">
${frame}
</div>
<div class="v5-stage-say">
${say}
</div>
</div>
</div>
</section>`;
}
