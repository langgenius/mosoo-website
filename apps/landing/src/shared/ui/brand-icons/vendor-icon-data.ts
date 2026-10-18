import anthropicSvgUrl from "@lobehub/icons-static-svg/icons/anthropic.svg";
import deepseekSvgUrl from "@lobehub/icons-static-svg/icons/deepseek-color.svg";
import geminiSvgUrl from "@lobehub/icons-static-svg/icons/gemini-color.svg";
import kimiSvgUrl from "@lobehub/icons-static-svg/icons/kimi.svg";
import minimaxSvgUrl from "@lobehub/icons-static-svg/icons/minimax-color.svg";
import openaiSvgUrl from "@lobehub/icons-static-svg/icons/openai.svg";
import opencodeSvgUrl from "@lobehub/icons-static-svg/icons/opencode.svg";
import qwenSvgUrl from "@lobehub/icons-static-svg/icons/qwen-color.svg";
import zhipuSvgUrl from "@lobehub/icons-static-svg/icons/zhipu-color.svg";

// The nine preset model providers, keyed by their catalog icon key, with the
// same icon files the mosoo console uses (apps/web brand-icons
// vendor-icon-data.ts).
export const VENDOR_ICON_URL: Record<string, string> = {
  anthropic: anthropicSvgUrl,
  deepseek: deepseekSvgUrl,
  gemini: geminiSvgUrl,
  kimi: kimiSvgUrl,
  minimax: minimaxSvgUrl,
  openai: openaiSvgUrl,
  opencode: opencodeSvgUrl,
  qwen: qwenSvgUrl,
  zhipu: zhipuSvgUrl,
};

export function hasVendorIcon(vendorId: string): boolean {
  return vendorId in VENDOR_ICON_URL;
}
