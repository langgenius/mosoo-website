import claudeCodeSvgUrl from "@lobehub/icons-static-svg/icons/claudecode-color.svg";
import openaiSvgUrl from "@lobehub/icons-static-svg/icons/openai.svg";
import opencodeSvgUrl from "@lobehub/icons-static-svg/icons/opencode.svg";

// Keyed by runtime catalog id, with the icon each runtime uses in the mosoo
// console (pkgs/runtime-catalog RUNTIMES[].display.iconKey). Pi has no mark in
// the icon package version this site ships, so it renders as a text mark
// rather than borrowing another product's logo.
export const RUNTIME_ICON_URL: Record<string, string> = {
  "acp-fallback": opencodeSvgUrl,
  "claude-agent-sdk": claudeCodeSvgUrl,
  "openai-runtime": openaiSvgUrl,
};

export function hasRuntimeIcon(runtimeId: string): boolean {
  return runtimeId in RUNTIME_ICON_URL;
}
