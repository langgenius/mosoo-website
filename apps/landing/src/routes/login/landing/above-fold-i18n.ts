import { locale } from "@/shared/locale";

// Strings for the first screen of the home page: the hero and its product
// stage. Kept apart from the below-the-fold dictionary so the initial bundle
// carries only these. Copy source: v1 copy deck §2 and §18; the stage label
// and caption retell the product kit's CSV story, and the line under the CTA
// is built from README facts (see the v3 CHANGELOG, 文案偏离).
const ZH_MESSAGES = {
  "An open-source, API-first managed Agent runtime": "开源、|API 优先的|托管 Agent runtime，",
  "for application backends.": "面向应用后端。",
  "mosoo runs OpenAI Codex, Claude Agent SDK, OpenCode, and Pi behind one API, each Session in its own sandbox.":
    "mosoo 用一个 API 运行 OpenAI Codex、Claude Agent SDK、OpenCode 和 Pi，每个 Session 都在自己的 sandbox 中执行。",
  "Try mosoo": "试用 mosoo",
  "Read the quickstart": "阅读快速开始",
  "mosoo is in Alpha. Public APIs may still change.":
    "mosoo 目前处于 Alpha 阶段，公开 API 仍可能变化。",
  "Hosted at cloud.mosoo.ai. Apache-2.0 source on GitHub. Bring your own model key.":
    "托管在 cloud.mosoo.ai。Apache-2.0 源码在 GitHub。模型使用你自己的密钥。",
} as const;

type Message = keyof typeof ZH_MESSAGES;

const JA_MESSAGES = {
  "An open-source, API-first managed Agent runtime":
    "オープンソースで API ファーストな|マネージド Agent runtime、",
  "for application backends.": "アプリケーションの|バックエンドのために。",
  "mosoo runs OpenAI Codex, Claude Agent SDK, OpenCode, and Pi behind one API, each Session in its own sandbox.":
    "mosoo は OpenAI Codex、Claude Agent SDK、OpenCode、Pi を 1 つの API で実行します。Session ごとに専用の sandbox が割り当てられます。",
  "Try mosoo": "mosoo を試す",
  "Read the quickstart": "クイックスタートを読む",
  "mosoo is in Alpha. Public APIs may still change.":
    "mosoo は現在 Alpha 版です。公開 API は変更される可能性があります。",
  "Hosted at cloud.mosoo.ai. Apache-2.0 source on GitHub. Bring your own model key.":
    "cloud.mosoo.ai でホスト。Apache-2.0 のソースは GitHub に。モデルのキーはご自身で。",
} satisfies Record<Message, string>;

const MESSAGES = { zh: ZH_MESSAGES, ja: JA_MESSAGES };

export function t(message: Message): string {
  return locale === "en" ? message : MESSAGES[locale][message];
}
