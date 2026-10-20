// 2b The spec table (graft 2026-10-20; staging v5/graft/INTEGRATION.md, the spec screen). Styles: ./spec.css; copy:
// ../copy/spec.json.
//
// What the owner kept from v4c (staging production/briefs/owner-notes.md, 2026-10-20): its spec table as a screen of
// its own (「这一页还是得留着吧？」: "One Session, five parts. / Pick one of four harnesses.", five typed rows after
// a13n's spec sheet, staging refs/devices/crops/a13n-spec-table.jpg), the scroll motion that opens it (the mark's
// outline opening like a door, redesign/v4c src/effects/stage.ts) and a Harness value that changes as you scroll
// (「加一个 Harness 切换的那个动效」). v4c's night timeline is not kept.
//
// Composition: on the stage's T1 field (../v5-fields.css .v5-field--hero), the two-tone H2 (v4a's use) over one white
// card (v4b's clean component on a background) that is the table, title over table as in v4c and a13n: Harness
// (runtime glyph and name in the display face; the four names small under it), Model (the console's key glyph),
// Sandbox (its environment cube), Files (one mono token, a keycap), Resume.
//
// Engines (src/effects/v5/README.md "Portal" and "Harness switch"; wired in ../effects.ts):
//   portal.ts          this section is the host (data-portal), [data-portal-pin] its sticky layer, holding the window
//                      layer (data-portal-window: the field and the card, an opaque ground) and the 1 px frame. The
//                      closed window frames the first Harness value (data-portal-focus) and opens while the section
//                      comes in, finishing a tenth of a screen into the pin (PORTAL_RANGE).
//   harness-switch.ts  the Harness value (data-switch="scroll"; its run is this host, data-switch-run): one name at a
//                      time, rolling at three points of the pinned run once the door is open (SWITCH_SPAN).
// Both run where the section pins (SPEC_MEDIA, the stage's). Elsewhere (phones, tablets, short screens) there is no
// pin and no door, and the switch plays its time driver (one pass, under 5 s). Reduced motion and no JS: the card on
// its plate in the flow, the first harness large and the other three small, v4c's still look. No data-rise in the
// window: the portal shows the content from its first frame.
//
// The four names reach a screen reader once, from the visually hidden list; the rolling slot and the small list are
// aria-hidden. The table is a drawn product object (data-product-ui, as v4c's): its words count as object words in
// tools/budget.ts.

import type { HomeCopy, HomeLocale } from "../copy.ts";
import { HARNESS_IDS } from "../copy.ts";
import { glyph, runtimeGlyph } from "../kit/index.ts";
import { esc, twoTone } from "../ui.ts";

/** Where the section pins, the door opens and the switch scrolls: the stage's media (sections/stage.ts STAGE_MEDIA). */
const SPEC_MEDIA = "(min-width: 901px) and (min-height: 680px)";

/**
 * The door, in screens of scroll from the moment the section's top reaches the viewport's top (portal.ts). The closed
 * window comes up whole first (whole from -0.355 at 1440 x 900; at -0.25 its bottom is 20 px above the fold even at
 * 901 x 680, the shortest screen that pins, measured), then opens, and is open 0.1 screens into the pin: most of it
 * plays while the section comes in, and no pinned frame shows a small window alone.
 */
const PORTAL_RANGE = "-0.25,0.1";

/**
 * The switch, as a share of the pinned run (one screen: the section is 200vh live, spec.css). From the open door to the
 * end: OpenAI Codex until 0.325, Claude Agent SDK until 0.55, OpenCode until 0.775, then Pi; about 200 px of scroll
 * each at 1440 x 900, and Codex has the whole door too.
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
  // One value per harness, in HARNESS_IDS order: the first is where the door looks and where the time driver rests.
  const values = HARNESS_IDS.map((id, i) => {
    const focus = i === 0 ? " data-portal-focus" : "";
    return `<span class="v5-spec-val" data-switch-item${focus}>${runtimeGlyph(id, "v5-spec-glyph")}<span>${esc(names[i] ?? "")}</span></span>`;
  }).join("");
  const list = names.map((name) => `<li>${esc(name)}</li>`).join("");
  const index = names.map((name) => `<span>${esc(name)}</span>`).join(" ");
  const harness = `<dd class="v5-spec-value v5-spec-harness" data-switch="scroll" data-switch-span="${SWITCH_SPAN}" data-switch-media="${SPEC_MEDIA}" translate="no"><ul class="v5-sr" role="list">${list}</ul><span class="v5-spec-slot" aria-hidden="true">${values}</span><span class="v5-spec-idx" aria-hidden="true">${index}</span></dd>`;
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
  return `<section id="parts" data-section="spec" class="v5-sec v5-spec" aria-labelledby="spec-title" data-portal data-portal-range="${PORTAL_RANGE}" data-portal-media="${SPEC_MEDIA}" data-switch-run>
<div class="v5-spec-pin" data-portal-pin>
<div class="v5-spec-window v5-field v5-field--hero" data-portal-window>
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
