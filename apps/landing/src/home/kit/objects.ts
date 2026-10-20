// Five small objects, drawn (T4) for the white cards BRIEF §4 row 3 planned on the lime screen (Harness / Model key /
// Sandbox / Files / Resume). No page renders them: those cards took T3's line figures (TOOLS-REVIEW), and since the
// 2026-10-20 graft the five parts are the spec table's (sections/spec.ts). One structural sentence each, Apollo's
// relation grammar only:
//   harness strip   four tiles in a strip; the Session's pick lifted, with an offset underlay
//                   (Apollo CONNECTED SOURCE strip + "Access email" underlay, STUDY §2.4)
//   key row         the key card, a connector that stops at the dotted sandbox wall, a grant inside
//   sandbox cell    a dotted cell (the sandbox is temporary) with the harness working inside it
//   file chip row   outputs/ and its files, faded .6 / .2 and running off the edge; the first one lit
//   resume chip     the earlier turn, a connector carrying the gap, the turn that picks it up (lit)
// Words stay under 14 per object and each object has at most one mono token (a file, a command).
// Chip and tile underlays default to T1 strip b, whose lime end sits on the left, where the down-left offset shows.

import { DOTTED_WALL, esc, glyph, LIVE_DOT, root, runtimeGlyph, underlay, wire } from "./parts.ts";
import type { FileChipRowProps, HarnessStripProps, KeyRowProps, ResumeChipProps, SandboxCellProps } from "./types.ts";

export function renderHarnessStrip(props: HarnessStripProps): string {
  const tiles = props.tiles
    .map((tile, index) => {
      const lit = index === props.picked;
      return (
        `<span class="kit-tile${lit ? " kit-tile--lit" : ""}" title="${esc(tile.name)}" data-kit-part="tile">` +
        (lit ? underlay(props.underlay ?? "b", "kit-underlay--chip") : "") +
        `<span class="kit-tile-face">${runtimeGlyph(tile.runtime)}</span></span>`
      );
    })
    .join("");
  const eyebrow = props.eyebrow === undefined ? "" : `<span class="kit-eyebrow">${esc(props.eyebrow)}</span>`;
  return `<div ${root(props, "harness", "kit-strip")}>${eyebrow}<span class="kit-strip-tiles">${tiles}</span></div>`;
}

export function renderKeyRow(props: KeyRowProps): string {
  return (
    `<div ${root(props, "key", "kit-keyrow")}>` +
    `<span class="kit-keycard" data-kit-part="key">` +
    `<span class="kit-icon">${glyph("key", "kit-g--lit")}</span>` +
    `<span class="kit-keycard-t"><span class="kit-keycard-n">${esc(props.keyName)}</span>` +
    `<span class="kit-mask">${esc(props.mask)}</span></span></span>` +
    wire("across") +
    `<span class="kit-cell kit-cell--wall" data-kit-part="wall">${DOTTED_WALL}` +
    `<span class="kit-eyebrow">${glyph("cube")}${esc(props.wall)}</span>` +
    `<span class="kit-pill">${glyph("clock")}<span>${esc(props.grant)}</span></span></span>` +
    `</div>`
  );
}

export function renderSandboxCell(props: SandboxCellProps): string {
  return (
    `<div ${root(props, "sandbox", "kit-cell kit-cell--box")}>${DOTTED_WALL}` +
    `<span class="kit-eyebrow">${glyph("cube")}${esc(props.eyebrow)}</span>` +
    `<span class="kit-proc" data-kit-part="proc">` +
    `<span class="kit-icon">${runtimeGlyph(props.harness.runtime)}</span>` +
    `<span class="kit-mono">${esc(props.command)}</span></span>` +
    `<span class="kit-cell-status">${LIVE_DOT}<span>${esc(props.status)}</span></span>` +
    `</div>`
  );
}

export function renderFileChipRow(props: FileChipRowProps): string {
  const chips = props.files
    .map(
      (name, index) =>
        `<span class="kit-fchip${index === 0 ? " kit-fchip--lit" : ""}" data-kit-part="file">` +
        (index === 0 ? underlay(props.underlay ?? "b", "kit-underlay--chip") : "") +
        `<span class="kit-fchip-face">${glyph("file")}<span>${esc(name)}</span></span></span>`,
    )
    .join("");
  return (
    `<div ${root(props, "files", "kit-files")}>` +
    `<span class="kit-folder">${glyph("folder")}<span class="kit-mono">${esc(props.folder)}</span></span>` +
    `<span class="kit-files-row">${chips}</span></div>`
  );
}

export function renderResumeChip(props: ResumeChipProps): string {
  const note = props.note === undefined ? "" : `<span class="kit-rchip-note">${esc(props.note)}</span>`;
  return (
    `<div ${root(props, "resume", "kit-resume")}>` +
    `<span class="kit-rchip kit-rchip--from" data-kit-part="from">${glyph("check")}<span>${esc(props.from)}</span></span>` +
    `<span class="kit-resume-gap">${wire("down")}<span class="kit-resume-t">${esc(props.gap)}</span></span>` +
    `<span class="kit-rchip kit-rchip--to" data-kit-part="to">${underlay(props.underlay ?? "b", "kit-underlay--chip")}` +
    `<span class="kit-rchip-face">${glyph("refresh")}<span>${esc(props.to)}</span>${note}</span></span>` +
    `</div>`
  );
}
