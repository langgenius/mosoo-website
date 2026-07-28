import { locale } from "./locale";

const ZH_MESSAGES = {
  Language: "语言",
  Pricing: "定价",
  Blog: "博客",
  "API docs": "API 文档",
  "mosoo on X": "mosoo 的 X 主页",
  "mosoo on GitHub": "mosoo 的 GitHub 主页",
  "Log in": "登录",
  "Open source · Agent runtime and API": "开源 · Agent runtime 与 API",
  "Open-source agent runtime": "开源 Agent runtime",
  "for coding agents.": "专为 Coding Agent 而生。",
  "Run OpenAI Codex, Claude Agent SDK, and OpenCode behind one Agent API in isolated sandboxes. Stream work, keep durable Threads, and resume across Runs.":
    "通过统一的 Agent API，在隔离 sandbox 中运行 OpenAI Codex、Claude Agent SDK 和 OpenCode。实时流式传输任务，持久保存 Threads，并可跨 Runs 恢复。",
  "Star on GitHub": "在 GitHub 上加 Star",
  "Star mosoo on GitHub": "在 GitHub 上为 mosoo 加 Star",
  "Open source · Self-hostable · BYOK": "开源 · 可自行托管 · BYOK",
} as const;

type Message = keyof typeof ZH_MESSAGES;

const JA_MESSAGES = {
  Language: "言語",
  Pricing: "料金",
  Blog: "ブログ",
  "API docs": "API ドキュメント",
  "mosoo on X": "mosoo の X",
  "mosoo on GitHub": "mosoo の GitHub",
  "Log in": "ログイン",
  "Open source · Agent runtime and API": "オープンソース · Agent runtime と API",
  "Open-source agent runtime": "オープンソースの Agent runtime",
  "for coding agents.": "Coding Agent のために。",
  "Run OpenAI Codex, Claude Agent SDK, and OpenCode behind one Agent API in isolated sandboxes. Stream work, keep durable Threads, and resume across Runs.":
    "OpenAI Codex、Claude Agent SDK、OpenCode を、隔離された sandbox 上で 1 つの Agent API 経由で実行。作業をストリーミングし、Threads を永続化して、Runs をまたいで再開できます。",
  "Star on GitHub": "GitHub で Star",
  "Star mosoo on GitHub": "GitHub で mosoo に Star",
  "Open source · Self-hostable · BYOK": "オープンソース · セルフホスト可能 · BYOK",
} satisfies Record<Message, string>;

const MESSAGES = { zh: ZH_MESSAGES, ja: JA_MESSAGES };

export function t(message: Message): string {
  return locale === "en" ? message : MESSAGES[locale][message];
}
