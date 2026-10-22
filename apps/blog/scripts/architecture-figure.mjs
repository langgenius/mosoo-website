#!/usr/bin/env node
// The architecture figure of the three introducing-mosoo-computer posts (en, zh, ja; the zh and ja posts show it as
// the English version and say so). Redrawn from the bitmap architecture-en.png (no source file existed) with the same
// content and the brand in lowercase (owner 2026-10-20 21:57: 「mosoo computer 一律小写」): "mosoo computer",
// "mosoo Agent Driver". Light, in the v5 tokens (staging production/v5/BRIEF.md §3.1; apps/blog/src/styles/
// global.css --v5-*): white paper, ink and ink-2 text, ink-3-text for the smallest notes, white cards with a
// 10% ink hairline, the computer as a #F4F4F4 frame plate holding two of them (a plate with clean white parts on
// it, as the home's stage), 1px ink arrows (the home's connecting lines). No dot texture.
// Text is real text in Hanken Grotesk, the site's text face, embedded as the landing's own latin file (SIL OFL 1.1,
// apps/landing/public/fonts/HankenGrotesk-OFL.txt; an <img> SVG cannot load web fonts, a data: URL it can), with
// Arial as the fallback (Hanken is sized to Arial on the site, so a fallback never runs wider). Labels are 17px
// on a 1000px canvas, about 12px in the 712px article column.
//
// Run from the repo root: node apps/blog/scripts/architecture-figure.mjs
// Writes apps/blog/public/blog/introducing-mosoo-computer/architecture-en.svg; same input, same bytes
// (tests/blog-brand-case.test.mjs compares the file with architectureFigure()).

import { readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const FONT = new URL("../../landing/public/fonts/HankenGrotesk-latin.woff2", import.meta.url);
const OUT = new URL("../public/blog/introducing-mosoo-computer/architecture-en.svg", import.meta.url);

const C = { paper: "#ffffff", frame: "#f4f4f4", ink: "#161815", ink2: "#515350", ink3: "#6b6d6a" };

// The words of the original figure, in its order; only the brand changed case. A caption's lines are where the
// original broke it, or at one of its middle dots (the dot itself is dropped at the break).
const COPY = {
  title: "mosoo computer",
  subtitle: "Connecting chat channels, agent harnesses, and model subscriptions",
  kind: "Conceptual architecture",
  channels: { name: "Chat channels", note: ["Slack · Telegram", "Discord · …"] },
  sdk: { name: "Vercel Chat SDK", note: ["Unified channel messages", "and replies"] },
  computer: {
    name: "Cloudflare Computer",
    note: "Cloud workspace and execution environment",
    base: ["Persistent filesystem · Shell", "On-demand Linux containers"],
  },
  driver: { name: "mosoo Agent Driver", note: ["Unified input", "Events · Sessions"] },
  harness: { name: "Agent Harness", note: ["Reasoning · Tools", "Task loop"] },
  subscriptions: {
    title: ["Your existing", "subscriptions"],
    names: ["xAI", "GitHub Copilot", "ChatGPT"],
    note: ["Authorize where supported", "by the harness"],
  },
  points: [
    ["Decoupled channels", "Chat SDK handles channel differences"],
    ["Harness-neutral", "Driver unifies access to different runtimes"],
    ["Optional subscriptions", "Connect your existing model subscriptions"],
  ],
  flow: "Requests flow left to right. Results return along the same path.",
  alt: "mosoo computer conceptual architecture: chat channels connect through Chat SDK and Agent Driver to a cloud harness and model subscriptions",
};

// Geometry (px on the canvas).
const W = 1000;
const M = 40; // side margin
const ROW = { y: 214, h: 52 }; // the node row
const MID = ROW.y + ROW.h / 2;
const GAP = 28; // between two cards joined by an arrow
const PAD = 16; // the plate's side padding
const NODE = { channels: 140, sdk: 164, driver: 186, harness: 146 };
const SUB = { w: 140, h: 38, gap: 10 };

const x1 = M;
const x2 = x1 + NODE.channels + GAP;
const plate = { x: x2 + NODE.sdk + GAP, y: 136, w: PAD + NODE.driver + GAP + NODE.harness + PAD, h: 256 };
const x3 = plate.x + PAD;
const x4 = x3 + NODE.driver + GAP;
const subX = W - M - SUB.w;
const subTop = 194;
const subCentres = COPY.subscriptions.names.map((_, i) => subTop + i * (SUB.h + SUB.gap) + SUB.h / 2);
const spine = subX - 24;
const rule = plate.y + plate.h + 34;
const H = rule + 128;

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const r = (n) => Math.round(n * 100) / 100;

/** A text line; cls sets size, weight and colour (see the style block), anchor "s" (start) or "e" (end) its
 *  alignment (a class: the style block's centring would override a text-anchor attribute). */
const text = (x, y, s, cls, anchor = "") =>
  `<text x="${r(x)}" y="${r(y)}" class="${anchor ? `${cls} ${anchor}` : cls}">${esc(s)}</text>`;

/** Lines centred on cx, `step` px apart. */
const lines = (cx, y, list, cls, step = 18) => list.map((s, i) => text(cx, y + i * step, s, cls)).join("");

/** A white card with a hairline and its name centred (the baseline sits .35em under the centre). */
const card = (x, y, w, h, name, cls, size) =>
  `<rect x="${r(x + 0.5)}" y="${r(y + 0.5)}" width="${w - 1}" height="${h - 1}" rx="10" class="card"/>` +
  text(x + w / 2, y + h / 2 + size * 0.35, name, cls);

/** A 1px ink arrow from (ax, y) to (bx, y), its open head at b. */
const arrow = (ax, bx, y) =>
  `<path d="M${r(ax)} ${r(y)}H${r(bx - 0.6)}M${r(bx - 6)} ${r(y - 4.5)}L${r(bx - 0.6)} ${r(y)}L${r(bx - 6)} ${r(y + 4.5)}" class="ln"/>`;

/** The figure as SVG source. */
export function architectureFigure() {
  const font = readFileSync(FONT).toString("base64");

  const parts = [];
  // Heading: the title and its line on the left, what kind of figure on the right.
  parts.push(text(M, 64, COPY.title, "h1", "s"));
  parts.push(text(M, 94, COPY.subtitle, "sub", "s"));
  parts.push(text(W - M, 64, COPY.kind, "kind", "e"));

  // The computer: a frame plate, its name and line on top, its base under the two cards.
  const pc = plate.x + plate.w / 2;
  parts.push(`<rect x="${plate.x}" y="${plate.y}" width="${plate.w}" height="${plate.h}" rx="16" fill="${C.frame}"/>`);
  parts.push(text(pc, plate.y + 34, COPY.computer.name, "h2"));
  parts.push(text(pc, plate.y + 56, COPY.computer.note, "note"));
  parts.push(lines(pc, plate.y + plate.h - 40, COPY.computer.base, "note"));

  // The row: channels -> SDK -> driver -> harness, each with its note.
  const nodes = [
    [x1, NODE.channels, COPY.channels],
    [x2, NODE.sdk, COPY.sdk],
    [x3, NODE.driver, COPY.driver],
    [x4, NODE.harness, COPY.harness],
  ];
  for (const [x, w, n] of nodes) {
    parts.push(card(x, ROW.y, w, ROW.h, n.name, "node", 17));
    parts.push(lines(x + w / 2, ROW.y + ROW.h + 26, n.note, "note"));
  }
  parts.push(arrow(x1 + NODE.channels + 6, x2 - 6, MID));
  parts.push(arrow(x2 + NODE.sdk + 6, x3 - 6, MID));
  parts.push(arrow(x3 + NODE.driver + 6, x4 - 6, MID));

  // Subscriptions: a two-line title over three cards, fed from the harness through one spine; the note under them.
  const sc = subX + SUB.w / 2;
  parts.push(lines(sc, plate.y + 21, COPY.subscriptions.title, "h3", 20));
  COPY.subscriptions.names.forEach((name, i) => {
    parts.push(card(subX, subTop + i * (SUB.h + SUB.gap), SUB.w, SUB.h, name, "sub-node", 15));
  });
  parts.push(
    `<path d="M${r(x4 + NODE.harness + 6)} ${MID}H${spine}M${spine} ${subCentres[0]}V${subCentres.at(-1)}" class="ln"/>`,
  );
  for (const y of subCentres) parts.push(arrow(spine, subX - 6, y));
  parts.push(lines(sc, subTop + 3 * SUB.h + 2 * SUB.gap + 26, COPY.subscriptions.note, "small"));

  // What the split buys, in three columns under a rule; the reading direction last.
  parts.push(`<path d="M${M} ${rule + 0.5}H${W - M}" class="rule"/>`);
  const colW = (W - 2 * M) / 3;
  COPY.points.forEach(([head, line], i) => {
    parts.push(text(M + i * colW, rule + 40, head, "h3", "s"));
    parts.push(text(M + i * colW, rule + 64, line, "note", "s"));
  });
  parts.push(text(M, rule + 104, COPY.flow, "small", "s"));

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="t">
<title id="t">${esc(COPY.alt)}</title>
<!-- Generated by apps/blog/scripts/architecture-figure.mjs. Text face: Hanken Grotesk, Copyright 2021 The Hanken Grotesk Project Authors, SIL Open Font License 1.1 (https://openfontlicense.org; apps/landing/public/fonts/HankenGrotesk-OFL.txt). -->
<style>
@font-face{font-family:"Hanken Grotesk";font-style:normal;font-weight:100 900;src:url(data:font/woff2;base64,${font}) format("woff2")}
text{font-family:"Hanken Grotesk",Arial,Helvetica,sans-serif;text-anchor:middle;font-kerning:normal}
.h1{font-size:28px;font-weight:600;fill:${C.ink};letter-spacing:-0.01em}
.sub{font-size:16px;font-weight:400;fill:${C.ink2}}
.kind{font-size:13px;font-weight:500;fill:${C.ink3}}
.h2{font-size:17px;font-weight:600;fill:${C.ink}}
.h3{font-size:15px;font-weight:600;fill:${C.ink}}
.node{font-size:17px;font-weight:500;fill:${C.ink}}
.sub-node{font-size:15px;font-weight:500;fill:${C.ink}}
.note{font-size:14px;font-weight:400;fill:${C.ink2}}
.small{font-size:13px;font-weight:400;fill:${C.ink3}}
.s{text-anchor:start}
.e{text-anchor:end}
.card{fill:${C.paper};stroke:${C.ink};stroke-opacity:0.1;stroke-width:1}
.ln{fill:none;stroke:${C.ink};stroke-width:1;stroke-linecap:round;stroke-linejoin:round}
.rule{fill:none;stroke:${C.ink};stroke-opacity:0.1;stroke-width:1}
</style>
<rect width="${W}" height="${H}" fill="${C.paper}"/>
${parts.join("\n")}
</svg>
`;
  return svg;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const svg = architectureFigure();
  writeFileSync(OUT, svg);
  console.log(`wrote ${OUT.pathname} (${Buffer.byteLength(svg)} bytes, ${W} x ${H})`);
}
