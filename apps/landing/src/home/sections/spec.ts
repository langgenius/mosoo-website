// 2b The spec table (graft 2026-10-20; staging v5/graft/INTEGRATION.md, the spec screen; fix round
// v5/polish/spec/NOTES.md). Styles: ./spec.css; copy: ../copy/spec.json.
//
// What the owner kept from v4c (staging production/briefs/owner-notes.md, 2026-10-20): its spec table as a screen of
// its own (「这一页还是得留着吧？」: "One Session, five parts. / Pick one of four harnesses.", five typed rows after
// a13n's spec sheet, staging refs/devices/crops/a13n-spec-table.jpg), the scroll motion that opens it (the mark's
// outline opening like a door, redesign/v4c src/effects/stage.ts) and a Harness value that changes
// (「加一个 Harness 切换的那个动效」). v4c's night timeline is not kept.
//
// Composition: on a neutral T1 field (../v5-fields.css .v5-field--spec: the stage's light and grain without its
// blue, so the lime screen stays the page's one large colour; REVIEW-v5 §6-5), the two-tone H2 (v4a's use) over one
// white card (v4b's clean component on a background) that is the table, title over table as in v4c and a13n: Harness
// (runtime glyph and name in the display face; under it the four names, each after the footer's 20px glyph tile, the
// current one in ink), Model (the console's key glyph), Sandbox (its environment cube), Files (one mono token, a
// keycap), Resume.
//
// Engines (src/effects/v5/README.md "Portal" and "Harness switch"; wired in ../effects.ts):
//   portal.ts          this section is the host (data-portal), [data-portal-pin] its sticky layer, holding the window
//                      layer (data-portal-window: the field and the card, an opaque ground) and the 1 px frame. The
//                      closed window stands on the page's axis and shows the whole Harness cell (data-portal-focus:
//                      the big name and the four names), hanging from the gap between title and card
//                      (data-portal-room); it opens while the section comes in (PORTAL_RANGE).
//   harness-switch.ts  the Harness value (SWITCH: the time driver): one name at a time, one pass that starts once
//                      the door is open and the cell is in view, and rests on OpenAI Codex.
// The door runs where the section pins (SPEC_MEDIA, the stage's). Elsewhere (phones, tablets, short screens) there is
// no pin and no door, and the switch plays the same pass when the cell comes into view. Reduced motion and no JS: the
// card on its plate in the flow, the first harness large and the four listed under it, v4c's still look. No data-rise
// in the window: the portal shows the content from its first frame.
//
// Two drivers, one markup (REVIEW-v5 §6-4; the integrator's redesign/v5-pin branch is B):
//   A (here)  the host is 110vh live (spec.css): the door opens over the same range, the open table holds a tenth of a
//             screen and scrolls on; the switch runs on time.
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
 * The door, in screens of scroll from the moment the section's top reaches the viewport's top (portal.ts): it starts
 * opening while the section comes in and is open a tenth of a screen into the pin.
 */
const PORTAL_RANGE = "-0.25,0.1";

/**
 * Room above the Harness cell inside the closed window, px: the card's top padding (32) and the row's (18), and half
 * the 72px gap under the title (spec.css), so the window's top edge falls between title and card and cuts no glyph.
 */
const PORTAL_ROOM = 86;

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

/** A value that follows a glyph of the console (kit glyphs: MAIN docs/design/assets/sidebar-icons). */
function glyphValue(id: "key" | "cube", text: string): string {
  return `<dd class="v5-spec-value"><span class="v5-spec-ic">${glyph(id)}</span><span>${esc(text)}</span></dd>`;
}

export function render(_locale: HomeLocale, copy: HomeCopy): string {
  const s = copy.spec;
  const names = copy.hero.harnesses;
  if (names.length !== HARNESS_IDS.length) {
    throw new Error(`hero.harnesses has ${names.length} names; the spec table rolls ${HARNESS_IDS.length}`);
  }
  // One value per harness, in HARNESS_IDS order: the first is the still row's, and where the time driver rests.
  const values = HARNESS_IDS.map(
    (id, i) =>
      `<span class="v5-spec-val" data-switch-item>${runtimeGlyph(id, "v5-spec-glyph")}<span>${esc(names[i] ?? "")}</span></span>`,
  ).join("");
  const list = names.map((name) => `<li>${esc(name)}</li>`).join("");
  // The four names, each after the footer's glyph tile (sections/footer.ts), the current one in ink (spec.css).
  const index = HARNESS_IDS.map(
    (id, i) =>
      `<span class="v5-spec-name"><span class="v5-spec-tile">${runtimeGlyph(id, "v5-spec-tile-g")}</span>${esc(names[i] ?? "")}</span>`,
  ).join("");
  const harness = `<dd class="v5-spec-value v5-spec-harness" data-portal-focus data-switch="${SWITCH}" data-switch-span="${SWITCH_SPAN}" data-switch-media="${SPEC_MEDIA}" translate="no"><ul class="v5-sr" role="list">${list}</ul><span class="v5-spec-slot" aria-hidden="true">${values}</span><span class="v5-spec-idx" aria-hidden="true">${index}</span></dd>`;
  const rows = [
    row("harness", s.labels.harness, harness),
    row("model", s.labels.model, glyphValue("key", s.values.model)),
    row("sandbox", s.labels.sandbox, glyphValue("cube", s.values.sandbox)),
    row(
      "files",
      s.labels.files,
      `<dd class="v5-spec-value"><code class="v5-kc v5-spec-tok" translate="no">${esc(s.values.files)}</code></dd>`,
    ),
    row("resume", s.labels.resume, `<dd class="v5-spec-value"><span>${esc(s.values.resume)}</span></dd>`),
  ];
  return `<section id="parts" data-section="spec" class="v5-sec v5-spec" aria-labelledby="spec-title" data-portal data-portal-range="${PORTAL_RANGE}" data-portal-room="${PORTAL_ROOM}" data-portal-media="${SPEC_MEDIA}" data-switch-run>
<div class="v5-spec-pin" data-portal-pin>
<div class="v5-spec-window v5-field v5-field--spec" data-portal-window>
<div class="v5-spec-in">
<h2 id="spec-title" class="v5-h2 v5-spec-title">${twoTone(s.h2a, s.h2b)}</h2>
<dl class="v5-spec-card" data-product-ui>
${rows.join("\n")}
</dl>
</div>
</div>
<svg class="v5-spec-frame" data-portal-frame aria-hidden="true" focusable="false"><path data-portal-outline/><path data-portal-line/></svg>
</div>
</section>`;
}
