// Runtime and coding-agent marks. Files come from @lobehub/icons-static-svg
// (MIT), already a landing dependency, and are the ones the mosoo console uses
// (apps/web/src/shared/ui/brand-icons/*-data.ts at 7cb9866cfc). Runtime marks
// are keyed by runtime ID, like the site's own brand-icons module on
// redesign/v1-truth (runtime-icon-data.ts): Pi has no mark in the icon package
// version this site ships, so it is a text mark there and here, rather than
// another product's logo. At integration, read runtime marks from that module
// and keep only the coding-agent tiles here (the site has none). Marks keep
// their own colours and sit in a neutral tile; they state a "works with" fact,
// not a partnership.

import claudeCodeUrl from "@lobehub/icons-static-svg/icons/claudecode-color.svg";
import clineUrl from "@lobehub/icons-static-svg/icons/cline.svg";
import codexUrl from "@lobehub/icons-static-svg/icons/codex-color.svg";
import cursorUrl from "@lobehub/icons-static-svg/icons/cursor.svg";
import openaiUrl from "@lobehub/icons-static-svg/icons/openai.svg";
import opencodeUrl from "@lobehub/icons-static-svg/icons/opencode.svg";
import type { ReactElement } from "react";

import { cx } from "./island";

// Same keys and files as redesign/v1-truth apps/landing/src/shared/ui/
// brand-icons/runtime-icon-data.ts.
const RUNTIME_MARK_URL: Readonly<Record<string, string>> = {
  "acp-fallback": opencodeUrl,
  "claude-agent-sdk": claudeCodeUrl,
  "openai-runtime": openaiUrl,
};

// Runtimes without a mark in the site's icon package: a text mark.
const RUNTIME_TEXT_MARK: Readonly<Record<string, string>> = {
  pi: "Pi",
};

// The coding agents that can run the setup prompt (the console's
// CODING_AGENT_HARNESSES), keyed by the console's IDs.
const CODING_AGENT_MARK_URL: Readonly<Record<string, string>> = {
  "claude-code": claudeCodeUrl,
  cline: clineUrl,
  codex: codexUrl,
  cursor: cursorUrl,
  opencode: opencodeUrl,
};

function Mark({ className, url }: { className: string; url: string | undefined }): ReactElement | null {
  if (url === undefined) {
    return null;
  }

  return (
    <img
      alt=""
      aria-hidden
      className={cx("inline-block object-contain", className)}
      decoding="async"
      height={24}
      src={url}
      width={24}
    />
  );
}

/** A runtime's mark, or its text mark. Decorative: the name is next to it. */
export function RuntimeMark({ className, runtimeId }: { className: string; runtimeId: string }) {
  const text = RUNTIME_TEXT_MARK[runtimeId];

  if (text !== undefined) {
    return (
      <span
        aria-hidden
        className={cx(
          "bg-ink-900 text-paper-50 inline-flex items-center justify-center rounded-[5px] font-mono text-[10.5px] leading-none font-semibold",
          className,
        )}
      >
        {text}
      </span>
    );
  }

  return <Mark className={className} url={RUNTIME_MARK_URL[runtimeId]} />;
}

/** A coding agent's mark, for the setup prompt's harness tiles. */
export function CodingAgentMark({ agentId, className }: { agentId: string; className: string }) {
  return <Mark className={className} url={CODING_AGENT_MARK_URL[agentId]} />;
}

/**
 * apps/web/src/routes/agent/components/runtime-icon.tsx: the mark fills a card
 * tile whose corner follows its size (8px up to 30px, then 10px).
 */
export function RuntimeTile({ runtimeId, size = 32 }: { runtimeId: string; size?: number }): ReactElement {
  const radius = size <= 30 ? 8 : 10;

  return (
    <div
      className="bg-card flex shrink-0 items-center justify-center overflow-hidden"
      style={{ borderRadius: radius, height: size, width: size }}
    >
      <RuntimeMark className="size-full shrink-0" runtimeId={runtimeId} />
    </div>
  );
}
