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

/** Event families with a glyph; the wire names they stand for are in `EventRow.event`. */
export type EventKind = "run" | "tool" | "file";

export interface EventRow {
  kind: EventKind;
  /** Plain words, not the wire name: "File changed". */
  text: string;
  /** The wire name it stands for (MAIN pkgs/contracts/src/session/session.contract.ts L138-152), kept as data only. */
  event?: string | undefined;
}

/** Call: the request going in. */
export interface SessionCallProps extends KitBase {
  harness: HarnessRef;
  /** The instruction, set as the request's input string (ink, Fragment Mono, in quotes). */
  instruction: string;
  /** The attached file (the object's one mono token). */
  attachment: string;
  /** v4b: keep the sentence on one line and let the container's edge cut it. */
  bleed?: boolean | undefined;
}

/** Watch: the same Session, running, its events flowing to the caller. */
export interface SessionWatchProps extends KitBase {
  status: string;
  /** The current action; `{file}` marks where the file being written sits (appended when absent). */
  action: string;
  /** The file being written, drawn as a file path: glyph + mono path, no box (parts.ts filePath; the one mono token). */
  file: string;
  /** Newest first; two or three rows, faded 1 / .6 / .2. */
  events: readonly EventRow[];
  /**
   * Label of the card the events stream into, e.g. "Your backend": the rows move out of the Session card
   * onto that card, joined by a connector (Apollo's "A into B"). Omit for the compact one-card form.
   */
  stream?: string | undefined;
}

/** Return: Turn 2 a week later, on top of the earlier turns, lit by the underlay. */
export interface SessionReturnProps extends KitBase {
  harness: HarnessRef;
  turn: string;
  /** The gap since the last turn, e.g. "+7 days" (sans: BRIEF §3.2 keeps mono for files, events, commands). */
  after: string;
  restored: string;
  /** Optional follow-up instruction (grey sentence). Mind the 14-word budget. */
  line?: string | undefined;
  /** v4d F19 restore track (saved files -> harness), drawn without words. Default true. */
  track?: boolean | undefined;
  underlay?: UnderlayStrip | undefined;
}

export type SessionProps =
  | ({ state: "call" } & SessionCallProps)
  | ({ state: "watch" } & SessionWatchProps)
  | ({ state: "return" } & SessionReturnProps);

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
