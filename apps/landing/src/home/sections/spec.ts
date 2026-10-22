// 2b The spec table (graft 2026-10-20; staging v5/graft/INTEGRATION.md, the spec screen; fix round
// v5/polish/spec/NOTES.md; round 3a, the door: staging v5/round3/door/NOTES.md; round 3b, the rows are the Agent
// preset's parts: staging narrative/CHANGES.md §4; round 3c, the card in the closed door: staging
// v5/round3/c-door/NOTES.md). Styles: ./spec.css; copy: ../copy/spec.json.
//
// What the owner kept from v4c (staging production/briefs/owner-notes.md, 2026-10-20): its spec table as a screen of
// its own (「这一页还是得留着吧？」: "One Session, five parts. / Pick one of four harnesses.", five typed rows after
// a13n's spec sheet, staging refs/devices/crops/a13n-spec-table.jpg), the scroll motion that opens it (the mark's
// outline opening like a door, redesign/v4c src/effects/stage.ts) and a Harness value that changes
// (「加一个 Harness 切换的那个动效」). v4c's night timeline is not kept.
//
// Composition: on a neutral T1 field (../v5-fields.css .v5-field--spec: the stage's light and grain without its
// blue, so the lime screen stays the page's one large colour; REVIEW-v5 §6-5), the two-tone H2 (v4a's use) over one
// white card (v4b's clean component on a background) that is the table, title over table as in v4c and a13n. The rows
// are the Agent preset (MAIN README L37; Skills and MCP share a row), each value after the console's own glyph: Harness
// (runtime glyph and name in the display face; under it the four names, each after a neutral glyph tile, the current
// one in ink on an inverted tile), Model (the providers key), Instructions (Hugeicons Note01, CHANGES §4), Skills · MCP
// (the console's skills glyph), Environment (the environments cube). Sandbox, Files and Resume left the table in
// round 3b (the sandbox and the Session that stays are the lime screen's cards; the files, the stage's app state).
//
// Layers, one DOM for every state: [data-portal-pin] holds the ground (data-portal-window: the field alone, a calm
// surface), the door's 1 px frame (data-portal-frame), and the content (.v5-spec-in: the H2, the door's placeholder
// and the card). The content is never inside the clipped ground, so no frame ever crops a line of it, and the card is
// kept whole inside the window at every frame.
//
// Engines (src/effects/v5/README.md "Portal" and "Harness switch"; wired in ../effects.ts):
//   portal.ts          this section is the host (data-portal). Closed, the window is the whole mosoo mark, block and
//                      bar, on the page's axis under the H2 (data-portal-door: its box is the block), with the field
//                      and the card inside: the card is what the window holds (data-portal-hold), whole and scaled to
//                      fit it (an empty window read as an image that did not load, five of five; staging
//                      REVIEW-v5-round3.md §2.4). It starts to open only once the whole mark is on screen, grows down
//                      and out from its top edge with the card growing in it, has the card at its own place and size
//                      as it comes to hold it (data-portal-reveal, then data-portal-shown), then rises behind the H2
//                      to cover the screen (PORTAL_RANGE). The H2 is readable throughout.
//   harness-switch.ts  the Harness value (SWITCH: the time driver): OpenAI Codex first; one pass through the other
//                      three and back once the card is shown and in view, resting on OpenAI Codex for good.
// The door runs where the section pins (SPEC_MEDIA, the stage's). Elsewhere (phones, tablets, short screens) there is
// no pin and no door, and the switch plays the same pass when the cell comes into view. Reduced motion and no JS: the
// card on its plate in the flow, the first harness large and the four listed under it. No data-rise in the pin: the
// H2 must be on the page from its first frame.
//
// Two drivers, one markup (REVIEW-v5 §6-4; the integrator's redesign/v5-pin branch is B):
//   A (here)  the host is 120vh live (spec.css): the door opens while the section comes in and is open when the pin
//             starts; the open table holds a fifth of a screen and scrolls on; the switch runs on time.
//   B         data-switch="scroll" and a 200vh host (spec.css): the table is pinned for one screen and the value
//             rolls at three points of it (SWITCH_SPAN, read by the scroll driver only).
//
// The four names reach a screen reader once, from the visually hidden list; the rolling slot and the visible list
// are aria-hidden. The table is a drawn product object (data-product-ui, as v4c's): its words count as object words
// in tools/budget.ts.

import type { HomeCopy, HomeLocale } from "../copy.ts";
import { HARNESS_IDS } from "../copy.ts";
import { glyph, runtimeGlyph } from "../kit/index.ts";
import { esc, twoTone } from "../ui.ts";

/** Where the section pins and the door opens: the stage's media (sections/stage.ts STAGE_MEDIA). */
const SPEC_MEDIA = "(min-width: 901px) and (min-height: 680px)";

/**
 * The door, in screens of scroll from the moment the section's top reaches the viewport's top (portal.ts). The start
 * is the earliest: the engine holds the door shut until the whole closed mark, bar included, is on screen (measured:
 * -316 px at 1440 x 900, -272 at 1280 x 800, -244 at 901 x 680). Open at 0, as the pin starts, so the open table has
 * the pin and the H2's way up to the bar before it leaves: 290 px of scroll at 1440 x 900 (staging
 * v5/polish/verify-visual.md §0-2: it had about 100).
 */
const PORTAL_RANGE = "-0.4,0";

/** The switch's driver: "time" is A, "scroll" is B (see above). */
const SWITCH = "time";

/**
 * B only (the scroll driver), as a share of the pinned run (one screen: the section is 200vh live in B). From the open
 * door to the end: OpenAI Codex until 0.325, Claude Agent SDK until 0.55, OpenCode until 0.775, then Pi.
 */
const SWITCH_SPAN = "0.1,1";

/** A table row: the label, then its value cell (a <dd>). */
function row(part: string, label: string, value: string): string {
  return `<div class="v5-spec-row v5-spec-row--${part}"><dt class="v5-spec-label">${esc(label)}</dt>${value}</div>`;
}

/** A value that follows a glyph of the console (kit glyphs: MAIN docs/design/assets/sidebar-icons, Hugeicons). */
function glyphValue(id: "key" | "note" | "skills" | "cube", value: string): string {
  return `<dd class="v5-spec-value"><span class="v5-spec-ic">${glyph(id)}</span><span>${esc(value)}</span></dd>`;
}

export function render(_locale: HomeLocale, copy: HomeCopy): string {
  const s = copy.spec;
  const names = copy.hero.harnesses;
  if (names.length !== HARNESS_IDS.length) {
    throw new Error(`hero.harnesses has ${names.length} names; the spec table rolls ${HARNESS_IDS.length}`);
  }
  // One value per harness, in HARNESS_IDS order: the first is the still row's, where the time driver starts and rests.
  const values = HARNESS_IDS.map(
    (id, i) =>
      `<span class="v5-spec-val" data-switch-item>${runtimeGlyph(id, "v5-spec-glyph")}<span>${esc(names[i] ?? "")}</span></span>`,
  ).join("");
  const list = names.map((name) => `<li>${esc(name)}</li>`).join("");
  // The four names, each after a neutral glyph tile (BRIEF T7 B), the current one on an inverted tile (spec.css).
  const index = HARNESS_IDS.map(
    (id, i) =>
      `<span class="v5-spec-name"><span class="v5-spec-tile">${runtimeGlyph(id, "v5-spec-tile-g")}</span>${esc(names[i] ?? "")}</span>`,
  ).join("");
  const harness = `<dd class="v5-spec-value v5-spec-harness" data-switch="${SWITCH}" data-switch-span="${SWITCH_SPAN}" data-switch-media="${SPEC_MEDIA}" translate="no"><ul class="v5-sr" role="list">${list}</ul><span class="v5-spec-slot" aria-hidden="true">${values}</span><span class="v5-spec-idx" aria-hidden="true">${index}</span></dd>`;
  const rows = [
    row("harness", s.labels.harness, harness),
    row("model", s.labels.model, glyphValue("key", s.values.model)),
    row("instructions", s.labels.instructions, glyphValue("note", s.values.instructions)),
    row("skills", s.labels.skills, glyphValue("skills", s.values.skills)),
    row("environment", s.labels.environment, glyphValue("cube", s.values.environment)),
  ];
  return `<section id="parts" data-section="spec" class="v5-sec v5-spec" aria-labelledby="spec-title" data-portal data-portal-range="${PORTAL_RANGE}" data-portal-media="${SPEC_MEDIA}" data-switch-run>
<div class="v5-spec-pin" data-portal-pin>
<div class="v5-spec-window v5-field v5-field--spec" data-portal-window></div>
<svg class="v5-spec-frame" data-portal-frame aria-hidden="true" focusable="false"><path data-portal-outline/><path data-portal-line/></svg>
<div class="v5-spec-in">
<h2 id="spec-title" class="v5-h2 v5-spec-title">${twoTone(s.h2a, s.h2b)}</h2>
<span class="v5-spec-door" data-portal-door aria-hidden="true"></span>
<dl class="v5-spec-card" data-product-ui data-portal-reveal data-portal-hold>
${rows.join("\n")}
</dl>
</div>
</div>
</section>`;
}
