// Runtime, vendor and coding-agent marks, mapped by the console's icon keys
// (apps/web/src/shared/ui/brand-icons/*-data.ts at 7cb9866cfc). Files come from
// @lobehub/icons-static-svg (MIT), already a landing dependency; the console's
// Pi mark ships only in 1.94.0, so assets/pi.svg is a verbatim copy of that
// version's icons/pi.svg. Marks keep their own colours and sit in a neutral
// tile; they state a "works with" fact, not a partnership.

import claudeCodeUrl from "@lobehub/icons-static-svg/icons/claudecode-color.svg";
import clineUrl from "@lobehub/icons-static-svg/icons/cline.svg";
import codexUrl from "@lobehub/icons-static-svg/icons/codex-color.svg";
import cursorUrl from "@lobehub/icons-static-svg/icons/cursor.svg";
import anthropicUrl from "@lobehub/icons-static-svg/icons/anthropic.svg";
import deepseekUrl from "@lobehub/icons-static-svg/icons/deepseek-color.svg";
import geminiUrl from "@lobehub/icons-static-svg/icons/gemini-color.svg";
import kimiUrl from "@lobehub/icons-static-svg/icons/kimi.svg";
import minimaxUrl from "@lobehub/icons-static-svg/icons/minimax-color.svg";
import openaiUrl from "@lobehub/icons-static-svg/icons/openai.svg";
import opencodeUrl from "@lobehub/icons-static-svg/icons/opencode.svg";
import qwenUrl from "@lobehub/icons-static-svg/icons/qwen-color.svg";
import zhipuUrl from "@lobehub/icons-static-svg/icons/zhipu-color.svg";
import type { ReactElement } from "react";

import piUrl from "../assets/pi.svg";

const RUNTIME_MARK_URL: Readonly<Record<string, string>> = {
  "claude-code": claudeCodeUrl,
  cline: clineUrl,
  codex: codexUrl,
  cursor: cursorUrl,
  openai: openaiUrl,
  opencode: opencodeUrl,
  pi: piUrl,
};

const VENDOR_MARK_URL: Readonly<Record<string, string>> = {
  anthropic: anthropicUrl,
  deepseek: deepseekUrl,
  gemini: geminiUrl,
  kimi: kimiUrl,
  minimax: minimaxUrl,
  openai: openaiUrl,
  opencode: opencodeUrl,
  qwen: qwenUrl,
  zhipu: zhipuUrl,
};

function Mark({ className, url }: { className: string; url: string | undefined }): ReactElement | null {
  if (url === undefined) {
    return null;
  }

  return (
    <img
      alt=""
      aria-hidden
      className={`inline-block object-contain ${className}`}
      decoding="async"
      height={24}
      src={url}
      width={24}
    />
  );
}

export function RuntimeMark({ className, iconKey }: { className: string; iconKey: string }) {
  return <Mark className={className} url={RUNTIME_MARK_URL[iconKey]} />;
}

export function VendorMark({ className, iconKey }: { className: string; iconKey: string }) {
  return <Mark className={className} url={VENDOR_MARK_URL[iconKey]} />;
}

/**
 * apps/web/src/routes/agent/components/runtime-icon.tsx: the mark fills a card
 * tile whose corner follows its size (8px up to 30px, then 10px).
 */
export function RuntimeTile({ iconKey, size = 32 }: { iconKey: string; size?: number }): ReactElement {
  const radius = size <= 30 ? 8 : 10;

  return (
    <div
      className="bg-card flex shrink-0 items-center justify-center overflow-hidden"
      style={{ borderRadius: radius, height: size, width: size }}
    >
      <RuntimeMark className="size-full shrink-0" iconKey={iconKey} />
    </div>
  );
}
