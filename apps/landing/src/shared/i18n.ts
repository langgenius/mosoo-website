import { locale } from "./locale";

const ZH_MESSAGES = {
  Language: "语言",
  Pricing: "定价",
  Status: "状态",
  "Use cases": "用例",
  Blog: "博客",
  Docs: "文档",
  "API docs": "API 文档",
  "mosoo on X": "mosoo 的 X 主页",
  "mosoo on GitHub": "mosoo 的 GitHub 主页",
  "Log in": "登录",
  "Get Started": "开始使用",
  "Open source · Agent runtime and API": "开源 · Agent runtime 与 API",
  "Launch your Skill online": "让你的 Skill 上线",
  "for anyone to try.": "供任何人在线体验。",
  "Let anyone use your Skill online with Codex, Claude, or OpenCode in an isolated sandbox.":
    "让任何人都能在隔离 sandbox 中，通过 Codex、Claude 或 OpenCode 在线使用你的 Skill。",
  "Star on GitHub": "在 GitHub 上加 Star",
  "Star mosoo on GitHub": "在 GitHub 上为 mosoo 加 Star",
  "Open source · Self-hostable · BYOK": "开源 · 可自行托管 · BYOK",
} as const;

type Message = keyof typeof ZH_MESSAGES;

const JA_MESSAGES = {
  Language: "言語",
  Pricing: "料金",
  Status: "稼働状況",
  "Use cases": "ユースケース",
  Blog: "ブログ",
  Docs: "ドキュメント",
  "API docs": "API ドキュメント",
  "mosoo on X": "mosoo の X",
  "mosoo on GitHub": "mosoo の GitHub",
  "Log in": "ログイン",
  "Get Started": "始める",
  "Open source · Agent runtime and API": "オープンソース · Agent runtime と API",
  "Launch your Skill online": "あなたの Skill をオンラインへ",
  "for anyone to try.": "誰でも試せるように。",
  "Let anyone use your Skill online with Codex, Claude, or OpenCode in an isolated sandbox.":
    "誰でも隔離された sandbox で、Codex、Claude、OpenCode を使ってあなたの Skill をオンラインで利用できます。",
  "Star on GitHub": "GitHub で Star",
  "Star mosoo on GitHub": "GitHub で mosoo に Star",
  "Open source · Self-hostable · BYOK": "オープンソース · セルフホスト可能 · BYOK",
} satisfies Record<Message, string>;

const MESSAGES = { zh: ZH_MESSAGES, ja: JA_MESSAGES };

export function t(message: Message): string {
  return locale === "en" ? message : MESSAGES[locale][message];
}
