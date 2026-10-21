// Primitives of the T4 kit: escaping, the root element, glyphs and the relation pieces Apollo uses
// (refs/apollo/v5/STUDY.md §2.8) that ./objects.ts draws with: connector, lit underlay, dotted wall, running dot. The
// Session object (./session.ts) builds its cards, rows and lines from these and kit.css.
// Everything returns an HTML string; kit.css draws it. Erasable TypeScript only, so Node and Bun can import
// this file as is at build time.

import { KIT_GLYPHS } from "./glyphs.ts";
import type { KitGlyphId } from "./glyphs.ts";
import type { KitBase, RuntimeId, UnderlayStrip } from "./types.ts";

export function esc(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

/** An inline glyph in currentColor. `kit-g--lit` paints a mosoo glyph's one plane in the accent. */
export function glyph(id: KitGlyphId, cls = ""): string {
  const g = KIT_GLYPHS[id];
  return `<svg class="kit-g${cls ? ` ${cls}` : ""}" viewBox="${g.viewBox}" ${g.attrs} aria-hidden="true" focusable="false">${g.body}</svg>`;
}

// Runtime id -> mark, as the console maps them (MAIN pkgs/runtime-catalog/src/catalog.ts display.iconKey).
const RUNTIME_GLYPH: Readonly<Record<RuntimeId, KitGlyphId>> = {
  "acp-fallback": "opencode",
  "claude-agent-sdk": "claude-code",
  "openai-runtime": "openai",
  pi: "pi",
};

export function runtimeGlyph(runtime: RuntimeId, cls = ""): string {
  return glyph(RUNTIME_GLYPH[runtime], cls);
}

/**
 * Root attributes of every object: the scale class, the product-object marker the word budget counts
 * (UI-FORMS §g), the language and the accessibility contract (label -> one image; no label -> hidden).
 */
export function root(base: KitBase, kind: string, cls: string): string {
  const classes = ["kit", base.size === "stage" ? "kit--stage" : "", cls, base.className ?? ""]
    .filter((part) => part !== "")
    .join(" ");
  const lang = base.lang === undefined ? "" : ` lang="${esc(base.lang)}"`;
  const a11y = base.label === undefined ? ' aria-hidden="true"' : ` role="img" aria-label="${esc(base.label)}"`;
  return `class="${classes}" data-kit="${kind}" data-product-ui${lang}${a11y}`;
}

/** The running mark: a lime dot circled by 1px of ink (BRIEF §3.1, the only solid lime inside an object). */
export const LIVE_DOT = '<i class="kit-live"></i>';

/**
 * The lit underlay: a T1 strip (with T1's grain) inside a box that kit.css offsets from the lit element.
 * The box itself carries a CSS placeholder of the same colours, which shows when v5-fields.css is absent.
 */
export function underlay(strip: UnderlayStrip, cls: string): string {
  return `<i class="kit-underlay kit-underlay--${strip} ${cls}" data-kit-part="underlay"><i class="kit-underlay-tex v5-field v5-field--underlay-${strip}"></i></i>`;
}

/** Apollo's connector: 2px at the 1000 art-board (about 1.2px at 14px), neutral, no arrowhead. */
export function wire(direction: "across" | "down"): string {
  return `<i class="kit-wire kit-wire--${direction}" data-kit-part="wire"></i>`;
}

/** The dotted wall (ElevenLabs dotted line: 1.25px, dasharray .01 4, round caps) drawn around a box. */
export const DOTTED_WALL = '<svg class="kit-dots" aria-hidden="true" focusable="false"><rect class="kit-dots-r"/></svg>';
