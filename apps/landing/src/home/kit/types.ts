// Public types of the T4 product-vector kit (see ./index.ts for what the kit is and how to regenerate it).
// Every visible string is a prop, so the content pass writes copy into these slots without touching markup.

/** The four harnesses, keyed by the runtime catalog id (MAIN pkgs/runtime-catalog/src/catalog.ts L426-472). */
export type RuntimeId = "openai-runtime" | "claude-agent-sdk" | "acp-fallback" | "pi";

/**
 * Root scale. Every length in kit.css is a multiple of the root size, so one object serves both places:
 * - "card": 14px, Apollo's own display scale (main row 14px in a 600px tile, refs/apollo/v5/STUDY.md §2.4);
 * - "stage": up to 20px (v4b's large fragment, chip text 20px), clamped down on narrow screens.
 * Any other size: set `--kit-size` on the object or an ancestor.
 */
export type KitSize = "card" | "stage";

/** Which T1 underlay strip lights the element (public/landing/v5/fields/underlay-*.webp). */
export type UnderlayStrip = "a" | "b" | "c";

export interface KitBase {
  /** Language of the strings: sets `lang` and the CJK font stack and line breaking. Omit to inherit the page's. */
  lang?: string | undefined;
  size?: KitSize | undefined;
  /** Accessible summary. Given: `role="img"` + `aria-label`. Omitted: `aria-hidden` (a caption says it). */
  label?: string | undefined;
  /** Extra classes on the root, for placement only. */
  className?: string | undefined;
}

export interface HarnessRef {
  runtime: RuntimeId;
  /** The name as the page writes it, e.g. "Codex" (README L9 says "OpenAI Codex"). */
  name: string;
}

/**
 * The first plate's three states (round 3b; staging narrative/CHANGES.md §2, §3; the stage's steps):
 *   laptop  the laptop card and the Session card side by side, row for row, two more Sessions behind the second
 *   cloud   the laptop card at half strength; the Session card's rows become the Agent preset's parts
 *   app     the sources call your app, your app calls one Session per job (the stack spread into a column)
 */
export type SessionState = "laptop" | "cloud" | "app";

/** A card's place and who drives it: "Laptop" + "You", "Session" + "Your backend". */
export interface SessionSide {
  place: string;
  driver: string;
}

/**
 * The Session object (renderSession). Every visible string is a prop (copy/stage.json kit); the same markup draws all
 * three states, `state` picks the one shown, and a stage can move the object between them in place (the CSS reads
 * --kit-cloud / --kit-app, kit.css).
 */
export interface SessionProps extends KitBase {
  state: SessionState;
  /** The harness both cards run, e.g. Codex after the OpenAI mark. */
  harness: HarnessRef;
  /** The file both cards made, e.g. report.md (Fragment Mono, the object's one file name). */
  file: string;
  laptop: SessionSide;
  session: SessionSide;
  /** The Agent preset's rows after the harness (Instructions, Skills, Remote MCP, Environment) and the chip after the
   *  last one ("pinned"). */
  cloud: { rows: readonly string[]; pinned: string };
  /** Who uses your app (Teammate, Customer), your app, and the call it makes (POST …/threads, Fragment Mono). */
  app: { sources: readonly string[]; app: string; call: string };
}

/** Harness card: four tiles, the Session's pick lifted and lit. */
export interface HarnessStripProps extends KitBase {
  eyebrow?: string | undefined;
  /** Names are not drawn (tiles are marks only); they go to `title` for pointer users. */
  tiles: readonly HarnessRef[];
  /** Index of the lit tile; omit for none. */
  picked?: number | undefined;
  underlay?: UnderlayStrip | undefined;
}

/** Model-key card: the key stays on your side of the sandbox wall; inside there is only a grant. */
export interface KeyRowProps extends KitBase {
  keyName: string;
  /** Masked secret, e.g. "••••••••" (no real-looking key or hash). */
  mask: string;
  /** Label inside the wall, e.g. "Sandbox". */
  wall: string;
  grant: string;
}

/** Sandbox card: one dotted cell per Session, the harness working inside it. */
export interface SandboxCellProps extends KitBase {
  eyebrow: string;
  harness: HarnessRef;
  /** The command running inside (the object's one mono token). */
  command: string;
  /** Status next to the lime dot, e.g. "Full access inside". */
  status: string;
}

/** Files card: the outputs folder and its first files, faded and running off the edge. */
export interface FileChipRowProps extends KitBase {
  /** The folder (the object's one mono token), e.g. "outputs/". */
  folder: string;
  /** First is lit; the rest fade .6 / .2 / .08. */
  files: readonly string[];
  underlay?: UnderlayStrip | undefined;
}

/** Resume card: the earlier turn, the gap, and the turn that picks it up. */
export interface ResumeChipProps extends KitBase {
  from: string;
  /** The gap on the connector, e.g. "+7 days". */
  gap: string;
  to: string;
  /** Optional note after the turn, e.g. "Resumed". */
  note?: string | undefined;
  underlay?: UnderlayStrip | undefined;
}
