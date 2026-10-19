// Coding-agent marks, rescued from the deleted product kit (brand-marks.tsx).
// Files come from @lobehub/icons-static-svg (MIT), already a landing
// dependency, and are the ones the mosoo console uses for its coding-agent
// harness tiles. Runtime marks live in ./runtime-icon; this module only keeps
// the coding-agent tiles, which the site's brand-icons module does not have.

import claudeCodeUrl from "@lobehub/icons-static-svg/icons/claudecode-color.svg";
import clineUrl from "@lobehub/icons-static-svg/icons/cline.svg";
import codexUrl from "@lobehub/icons-static-svg/icons/codex-color.svg";
import cursorUrl from "@lobehub/icons-static-svg/icons/cursor.svg";
import opencodeUrl from "@lobehub/icons-static-svg/icons/opencode.svg";
import type { ReactElement } from "react";

import { cn } from "@/shared/lib/class-names";

// The coding agents that can run the setup prompt (the console's
// CODING_AGENT_HARNESSES), keyed by the console's IDs.
const CODING_AGENT_MARK_URL: Readonly<Record<string, string>> = {
  "claude-code": claudeCodeUrl,
  cline: clineUrl,
  codex: codexUrl,
  cursor: cursorUrl,
  opencode: opencodeUrl,
};

/** A coding agent's mark, for the setup prompt's harness tiles. Decorative. */
export function CodingAgentMark({ agentId, className }: { agentId: string; className: string }): ReactElement | null {
  const url = CODING_AGENT_MARK_URL[agentId];
  if (url === undefined) {
    return null;
  }

  return (
    <img
      alt=""
      aria-hidden
      className={cn("inline-block object-contain", className)}
      decoding="async"
      height={24}
      src={url}
      width={24}
    />
  );
}
