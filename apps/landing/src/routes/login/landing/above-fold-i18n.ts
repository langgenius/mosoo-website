import { locale } from "@/shared/locale";

// Strings for the first screen of the home page: the title block and
// Exhibit 1. Kept apart from the below-the-fold dictionary so the initial
// bundle carries only these. Copy source: v1 copy deck §2 and §18; the
// exhibit caption and the seal are v2b wording, sourced in the v2b CHANGELOG
// (文案偏离).
const ZH_MESSAGES = {
  "An open-source, API-first managed Agent runtime for application backends.":
    "开源、API 优先的托管 Agent runtime，面向应用后端。",
  "mosoo runs OpenAI Codex, Claude Agent SDK, OpenCode, and Pi behind one API, each Session in its own sandbox.":
    "mosoo 用一个 API 运行 OpenAI Codex、Claude Agent SDK、OpenCode 和 Pi，每个 Session 都在自己的 sandbox 中执行。",
  "Try mosoo": "试用 mosoo",
  "Read the quickstart": "阅读快速开始",
  "mosoo is in Alpha. Public APIs may still change.":
    "mosoo 目前处于 Alpha 阶段，公开 API 仍可能变化。",
  "Exhibit 1.": "图 1",
  "Turn 1 of the CSV example, as the console records it. A turn succeeds only when its events, usage, and a checkpoint are committed together.":
    "CSV 示例的第 1 个 turn，按控制台的记录展示。事件、用量和检查点一起提交之后，turn 才算成功。",
  committed: "已提交",
} as const;

type Message = keyof typeof ZH_MESSAGES;

const JA_MESSAGES = {
  "An open-source, API-first managed Agent runtime for application backends.":
    "アプリケーションのバックエンドのための、オープンソースで API ファーストなマネージド Agent runtime",
  "mosoo runs OpenAI Codex, Claude Agent SDK, OpenCode, and Pi behind one API, each Session in its own sandbox.":
    "mosoo は OpenAI Codex、Claude Agent SDK、OpenCode、Pi を 1 つの API で実行します。Session ごとに専用の sandbox が割り当てられます。",
  "Try mosoo": "mosoo を試す",
  "Read the quickstart": "クイックスタートを読む",
  "mosoo is in Alpha. Public APIs may still change.":
    "mosoo は現在 Alpha 版です。公開 API は変更される可能性があります。",
  "Exhibit 1.": "図 1",
  "Turn 1 of the CSV example, as the console records it. A turn succeeds only when its events, usage, and a checkpoint are committed together.":
    "CSV の例の turn 1 を、コンソールの記録どおりに示します。イベント、使用量、チェックポイントがまとめてコミットされて初めて、turn は成功します。",
  committed: "コミット済み",
} satisfies Record<Message, string>;

const MESSAGES = { zh: ZH_MESSAGES, ja: JA_MESSAGES };

export function t(message: Message): string {
  return locale === "en" ? message : MESSAGES[locale][message];
}
