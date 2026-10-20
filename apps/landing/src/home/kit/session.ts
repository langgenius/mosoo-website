// The Session object in its three stage states (BRIEF §4 row 2). One card, three fillings, so the stage
// reads as the same object changing: chip -> sentence -> body.
//   Call    harness chip, the instruction as the request's string, the attached file  (lit: none; the request
//           has no keys to press: v5's first 5-second test read the console composer's + and send as a chat box)
//   Watch   Running chip, the current action with the file being written as a keycap; a connector down to
//           the card the events stream into, rows fading 1 / .6 / .2     (lit: the lime dot)
//   Return  Turn 2 on two earlier turns, "+7 days", the restore track, restored  (lit: T1 underlay above)
// Sources: v4b fragment (renderPaperHero / .pp-frag*, owner: "传达是清晰的"), v4d F19 stack (.d-stack*),
// Apollo gtm-system / source-of-truth (connector between two parts) and busywork (faded rows), STUDY §2.4.
// The composer's attach and send keys are gone from Call (staging v5/FIXES.md: 5 of 5 personas read them as a chat
// input, not an API call).

import { chip, esc, eventRows, fileChip, glyph, LIVE_DOT, root, runtimeGlyph, sentenceWithFile, underlay, wire } from "./parts.ts";
import type { SessionCallProps, SessionProps, SessionReturnProps, SessionWatchProps } from "./types.ts";

export function renderSessionCall(props: SessionCallProps): string {
  const cls = props.bleed === true ? "kit-session kit-session--call kit-session--bleed" : "kit-session kit-session--call";
  return (
    `<div ${root(props, "session", cls)} data-kit-state="call">` +
    `<div class="kit-head" data-kit-part="head">${chip(runtimeGlyph(props.harness.runtime), props.harness.name)}</div>` +
    `<p class="kit-line kit-line--input" data-kit-part="line">${esc(props.instruction)}</p>` +
    `<div class="kit-ctl" data-kit-part="ctl">${fileChip(props.attachment)}</div></div>`
  );
}

export function renderSessionWatch(props: SessionWatchProps): string {
  const head = `<div class="kit-head" data-kit-part="head">${chip(LIVE_DOT, props.status, "kit-chip--live")}</div>`;
  const line = `<p class="kit-line" data-kit-part="line">${sentenceWithFile(props.action, props.file)}</p>`;
  if (props.stream === undefined) {
    return `<div ${root(props, "session", "kit-session kit-session--watch")} data-kit-state="watch">${head}${line}${eventRows(props.events)}</div>`;
  }
  return (
    `<div ${root(props, "session", "kit-flow")} data-kit-state="watch">` +
    `<div class="kit-session">${head}${line}</div>` +
    wire("down") +
    `<div class="kit-stream" data-kit-part="stream"><span class="kit-eyebrow">${esc(props.stream)}</span>${eventRows(props.events)}</div>` +
    `</div>`
  );
}

/** v4d F19's restore track: the saved files run back into the harness; full, because it is done. */
function restoreTrack(props: SessionReturnProps): string {
  return (
    `<div class="kit-track" data-kit-part="track">` +
    `<span class="kit-track-end">${glyph("file")}</span>` +
    `<span class="kit-track-rail"><i></i></span>` +
    `<span class="kit-track-end">${runtimeGlyph(props.harness.runtime)}</span>` +
    `</div>`
  );
}

export function renderSessionReturn(props: SessionReturnProps): string {
  const line = props.line === undefined ? "" : `<p class="kit-line" data-kit-part="line">${esc(props.line)}</p>`;
  return (
    `<div ${root(props, "session", "kit-stack")} data-kit-state="return">` +
    underlay(props.underlay ?? "a", "kit-underlay--top") +
    `<i class="kit-back kit-back--2" data-kit-part="back"></i>` +
    `<i class="kit-back kit-back--1" data-kit-part="back"></i>` +
    `<div class="kit-session kit-session--front">` +
    `<div class="kit-head" data-kit-part="head">${chip(runtimeGlyph(props.harness.runtime), props.turn)}` +
    `<span class="kit-meta" data-kit-part="meta">${esc(props.after)}</span></div>` +
    line +
    (props.track === false ? "" : restoreTrack(props)) +
    `<p class="kit-status" data-kit-part="status">${glyph("check")}<span>${esc(props.restored)}</span></p>` +
    `</div></div>`
  );
}

/** One entry point for the stage engine: the same props shape with a `state`. */
export function renderSession(props: SessionProps): string {
  switch (props.state) {
    case "call":
      return renderSessionCall(props);
    case "watch":
      return renderSessionWatch(props);
    case "return":
      return renderSessionReturn(props);
  }
}
