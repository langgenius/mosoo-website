import claudeCodeSvgUrl from "@lobehub/icons-static-svg/icons/claudecode-color.svg";
import codexSvgUrl from "@lobehub/icons-static-svg/icons/codex-color.svg";
import cursorAgentSvgUrl from "@lobehub/icons-static-svg/icons/cursor.svg";
import deepseekSvgUrl from "@lobehub/icons-static-svg/icons/deepseek-color.svg";
import geminiSvgUrl from "@lobehub/icons-static-svg/icons/gemini-color.svg";
import hermesSvgUrl from "@lobehub/icons-static-svg/icons/hermesagent.svg";
import kimiSvgUrl from "@lobehub/icons-static-svg/icons/kimi-color.svg";
import minimaxSvgUrl from "@lobehub/icons-static-svg/icons/minimax-color.svg";
import openaiSvgUrl from "@lobehub/icons-static-svg/icons/openai.svg";
import piSvgUrl from "@lobehub/icons-static-svg/icons/inflection.svg";
import openclawSvgUrl from "@lobehub/icons-static-svg/icons/openclaw-color.svg";
import opencodeSvgUrl from "@lobehub/icons-static-svg/icons/opencode.svg";
import glmSvgUrl from "@lobehub/icons-static-svg/icons/glmv-color.svg";
import qwenSvgUrl from "@lobehub/icons-static-svg/icons/qwen-color.svg";

export const RUNTIME_ICON_URL: Record<string, string> = {
  "acp-fallback": opencodeSvgUrl,
  "claude-agent-sdk": claudeCodeSvgUrl,
  "cursor-agent": cursorAgentSvgUrl,
  chatgpt: openaiSvgUrl,
  deepseek: deepseekSvgUrl,
  gemini: geminiSvgUrl,
  hermes: hermesSvgUrl,
  glm: glmSvgUrl,
  kimi: kimiSvgUrl,
  minimax: minimaxSvgUrl,
  openai: openaiSvgUrl,
  "openai-runtime": codexSvgUrl,
  openclaw: openclawSvgUrl,
  opencode: opencodeSvgUrl,
  pi: piSvgUrl,
  qwen: qwenSvgUrl,
};

export function hasRuntimeIcon(runtimeId: string): boolean {
  return runtimeId in RUNTIME_ICON_URL;
}
