import { locale } from "@/shared/locale";

// Strings for the first screen of the home page: the hero and its product
// stage. Kept apart from the below-the-fold dictionary so the initial bundle
// carries only these. Copy source: v1 copy deck §2 and §18; the stage label
// and caption retell the product kit's CSV story (see the v2a CHANGELOG,
// 文案偏离).
const ZH_MESSAGES = {
  "An open-source, API-first managed Agent runtime": "开源、API 优先的托管 Agent runtime，",
  "for application backends.": "面向应用后端。",
  "mosoo runs OpenAI Codex, Claude Agent SDK, OpenCode, and Pi behind one API, each Session in its own sandbox.":
    "mosoo 用一个 API 运行 OpenAI Codex、Claude Agent SDK、OpenCode 和 Pi，每个 Session 都在自己的 sandbox 中执行。",
  "Try mosoo": "试用 mosoo",
  "Read the quickstart": "阅读快速开始",
  "mosoo is in Alpha. Public APIs may still change.":
    "mosoo 目前处于 Alpha 阶段，公开 API 仍可能变化。",
  "The same Session, seven days apart": "同一个 Session，相隔 7 天",
  "The CSV story: turn 1 totals 230. Seven days later the sandbox is gone, and turn 2 continues from the checkpoint to 250 with the same private nonce hash.":
    "CSV 示例：第 1 轮的 grand_total 是 230。7 天后 sandbox 已被回收，第 2 轮从检查点继续，得到 250，private nonce 的哈希不变。",
} as const;

type Message = keyof typeof ZH_MESSAGES;

const JA_MESSAGES = {
  "An open-source, API-first managed Agent runtime":
    "オープンソースで API ファーストなマネージド Agent runtime",
  "for application backends.": "アプリケーションのバックエンドのための、",
  "mosoo runs OpenAI Codex, Claude Agent SDK, OpenCode, and Pi behind one API, each Session in its own sandbox.":
    "mosoo は OpenAI Codex、Claude Agent SDK、OpenCode、Pi を 1 つの API で実行します。Session ごとに専用の sandbox が割り当てられます。",
  "Try mosoo": "mosoo を試す",
  "Read the quickstart": "クイックスタートを読む",
  "mosoo is in Alpha. Public APIs may still change.":
    "mosoo は現在 Alpha 版です。公開 API は変更される可能性があります。",
  "The same Session, seven days apart": "7 日をはさんだ同じ Session",
  "The CSV story: turn 1 totals 230. Seven days later the sandbox is gone, and turn 2 continues from the checkpoint to 250 with the same private nonce hash.":
    "CSV の例：ターン 1 の grand_total は 230 です。7 日後には sandbox が回収されていますが、ターン 2 はチェックポイントから続きを実行して 250 になり、private nonce のハッシュも同じです。",
} satisfies Record<Message, string>;

const MESSAGES = { zh: ZH_MESSAGES, ja: JA_MESSAGES };

export function t(message: Message): string {
  return locale === "en" ? message : MESSAGES[locale][message];
}
