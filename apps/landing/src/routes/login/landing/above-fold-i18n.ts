import { locale } from "@/shared/locale";

// Strings for the first screen of the home page: the hero and its product
// stage. Kept apart from the below-the-fold dictionary so the initial bundle
// carries only these. Copy source: v1 copy deck §2; the stage caption and the
// chart description are v2c copy (see the v2c CHANGELOG, 文案偏离).
const ZH_MESSAGES = {
  "An open-source, API-first managed Agent runtime": "开源、API 优先的托管 Agent runtime，",
  "for application backends.": "面向应用后端。",
  "mosoo runs OpenAI Codex, Claude Agent SDK, OpenCode, and Pi behind one API, each Session in its own sandbox.":
    "mosoo 用一个 API 运行 OpenAI Codex、Claude Agent SDK、OpenCode 和 Pi，每个 Session 都在自己的 sandbox 中执行。",
  "Try mosoo": "试用 mosoo",
  "Read the quickstart": "阅读快速开始",
  "mosoo is in Alpha. Public APIs may still change.":
    "mosoo 目前处于 Alpha 阶段，公开 API 仍可能变化。",
  "Turn 1 in the console Preview: the Agent reads input.csv and saves a report and a chart.":
    "控制台预览里的第 1 轮：Agent 读取 input.csv，保存一份报告和一张图表。",
  "Revenue by region: north 150, south 80, grand_total 230.":
    "按地区汇总的收入：north 150，south 80，grand_total 230。",
  "Saved files":
    "已保存的文件",
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
  "Turn 1 in the console Preview: the Agent reads input.csv and saves a report and a chart.":
    "コンソールのプレビューで見る 1 ターン目：Agent が input.csv を読み、レポートとグラフを保存します。",
  "Revenue by region: north 150, south 80, grand_total 230.":
    "地域別の売上：north 150、south 80、grand_total 230。",
  "Saved files":
    "保存されたファイル",
} satisfies Record<Message, string>;

const MESSAGES = { zh: ZH_MESSAGES, ja: JA_MESSAGES };

export function t(message: Message): string {
  return locale === "en" ? message : MESSAGES[locale][message];
}
