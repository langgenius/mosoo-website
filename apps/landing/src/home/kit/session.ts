// The Session object in the stage's three states (round 3b, the new claim: staging narrative/CHANGES.md §2, §3, §10 A1;
// the words: narrative/DECK.md §2.3). One markup draws all three, so the stage moves the same object from state to
// state in place (kit.css: every part reads --kit-cloud and --kit-app; no card ever travels from the laptop to the
// Session, staging narrative/judge-truth:.md L32):
//   laptop  the first plate. Two white cards side by side, row for row, no arrow and no line: Laptop (You, Codex,
//           report.md done) and Session (Your backend, Codex, report.md done), two more Sessions fanned behind the
//           second, their top and right edges showing (phones: straight up, their tops; round 3c: 0 of 10 readers saw
//           the 12px lower edges as more Sessions at first glance). The two rows that differ (where it runs, who
//           drives it) come first and read as one block, ink 500; the two it shares follow under a hairline, ink-2 400
//           and a step smaller (round 3c: 3 of 5 readers at 1440 still hunted for the difference when the driver row
//           came last).
//   cloud   the laptop card stays, at half strength; the Session card's driver row closes and its rows turn, row by
//           row, into the Agent preset's parts: Codex, Instructions, Skills, Remote MCP, Environment with a "pinned"
//           chip.
//   app     the laptop card is gone; the stack spreads into a column of three Sessions (the front one keeps
//           report.md); Your app calls them, and Teammate and Customer use your app. 1px ink lines say only who calls
//           whom (committee O1: lines are structure); the line into the Sessions carries the request, POST …/threads,
//           in Fragment Mono. No arrowheads: the request names the direction.
// Card heads carry neutral glyphs, never the mosoo mark; nothing says Pending; three Sessions, not more (an account
// runs at most five sandboxes at once, MAIN record-store L74). Glyphs: ./glyphs.ts (sources in its header).

import { esc, glyph, root, runtimeGlyph } from "./parts.ts";
import type { KitGlyphId } from "./glyphs.ts";
import type { SessionProps } from "./types.ts";

/** A glyph before a card's name or a row's words: bare, in the words' colour (no tile: committee O1, few shapes). */
function mark(svg: string): string {
  return `<span class="kit-ic">${svg}</span>`;
}

function head(id: KitGlyphId, text: string): string {
  return `<p class="kit-head-row" data-kit-part="head">${mark(glyph(id))}${words(text)}</p>`;
}

/** One row's face. "key": a row that differs between the cards (ink 500); "same": a row they share (ink-2 400). */
function face(svg: string, words: string, tone: "key" | "same", side = ""): string {
  return `<span class="kit-row kit-row--${tone}${side}">${mark(svg)}${words}</span>`;
}

/** A row's or a chip's words (the file name passes `mono`: Fragment Mono, the object's one file name). */
function words(text: string, mono = false): string {
  return `<span class="kit-t${mono ? " kit-mono" : ""}">${esc(text)}</span>`;
}

const DONE = `<span class="kit-done">${glyph("check")}</span>`;

export function renderSession(props: SessionProps): string {
  const { app, cloud, file, harness, laptop, session } = props;
  const codex = face(runtimeGlyph(harness.runtime), words(harness.name), "same");
  const result = (side = ""): string => face(glyph("file"), `${words(file, true)}${DONE}`, "same", side);
  // A card's rows; each slot is named for what it holds in the first state (kit.css opens and closes them by name).
  const rows = (cells: readonly (readonly [string, string])[]): string => {
    const items = cells.map(([slot, cell]) => `<li class="kit-slot kit-slot--${slot}">${cell}</li>`);
    return `<ul class="kit-rows">${items.join("")}</ul>`;
  };
  const sessionHead = head("runs", session.place);
  const pinned = `<span class="kit-pin">${esc(cloud.pinned)}</span>`;
  const laptopCard =
    `<div class="kit-card kit-laptop" data-kit-part="laptop">${head("laptop", laptop.place)}` +
    rows([
      ["driver", face(glyph("user"), words(laptop.driver), "key")],
      ["harness", codex],
      ["file", result()],
    ]) +
    `</div>`;
  // The front Session's six slots: what each shows in laptop | cloud | app (kit.css .kit-slot--*).
  //   driver   Your backend | - | -          harness  Codex | Codex | -
  //   file     report.md | Instructions | report.md
  //   skills   - | Skills | -    mcp  - | Remote MCP | -    env  - | Environment pinned | -
  const front =
    `<div class="kit-card kit-front" data-kit-part="session">${sessionHead}` +
    rows([
      ["driver", face(glyph("server"), words(session.driver), "key")],
      ["harness", codex],
      ["file", result(" kit-row--a") + face(glyph("note"), words(cloud.rows[0] ?? ""), "key", " kit-row--b")],
      ["skills", face(glyph("skills"), words(cloud.rows[1] ?? ""), "key")],
      ["mcp", face(glyph("mcp"), words(cloud.rows[2] ?? ""), "key")],
      ["env", face(glyph("cube"), `${words(cloud.rows[3] ?? "")}${pinned}`, "key")],
    ]) +
    `</div>`;
  // The two Sessions behind it: fanned (their top and right edges show), then spread under it with their heads.
  const backs = [2, 1].map((n) => `<div class="kit-card kit-back kit-back--${n}" data-kit-part="back">${sessionHead}</div>`);
  // Your app and who uses it, and the lines of who calls whom (drawn by kit.css from the layout's numbers).
  const sources = app.sources
    .map((name, i) => `<span class="kit-src kit-src--${i + 1}" data-kit-part="source">${mark(glyph("user"))}${words(name)}</span>`)
    .join("");
  const calls =
    `<div class="kit-calls" data-kit-part="calls">` +
    `<i class="kit-ln kit-ln--use kit-ln--use-1"></i><i class="kit-ln kit-ln--use kit-ln--use-2"></i>` +
    `<i class="kit-ln kit-ln--trunk"></i><i class="kit-ln kit-ln--bus"></i>` +
    `<i class="kit-ln kit-ln--tap kit-ln--tap-0"></i><i class="kit-ln kit-ln--tap kit-ln--tap-1"></i>` +
    sources +
    `<div class="kit-card kit-app" data-kit-part="app">${head("server", app.app)}</div>` +
    `<span class="kit-call" data-kit-part="call"><span class="kit-mono">${esc(app.call)}</span></span>` +
    `</div>`;
  return (
    `<div ${root(props, "session", "kit-scene")} data-kit-state="${props.state}">` +
    laptopCard +
    `<div class="kit-sessions">${backs.join("")}${front}</div>` +
    calls +
    `</div>`
  );
}
