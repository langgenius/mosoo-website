import { locale } from "@/shared/locale";

// Strings for the first screen of the home page: the hero and the product
// visual, plus the copy-button feedback both use. Kept apart from the
// below-the-fold dictionary so the initial bundle carries only these.
// Copy source: v1 copy deck §2, §3 and §18.
const ZH_MESSAGES = {
  "An open-source, API-first managed Agent runtime": "开源、API 优先的托管 Agent runtime，",
  "for application backends.": "面向应用后端。",
  "mosoo runs OpenAI Codex, Claude Agent SDK, OpenCode, and Pi behind one API, each Session in its own sandbox.":
    "mosoo 用一个 API 运行 OpenAI Codex、Claude Agent SDK、OpenCode 和 Pi，每个 Session 都在自己的 sandbox 中执行。",
  "Try mosoo": "试用 mosoo",
  "Read the quickstart": "阅读快速开始",
  "View source": "查看源码",
  "mosoo is in Alpha. Public APIs may still change.":
    "mosoo 目前处于 Alpha 阶段，公开 API 仍可能变化。",
  "Set up with your coding agent": "使用编码智能体设置",
  "Paste the setup prompt into Codex, Claude Code, OpenCode, Cursor, or Cline. It installs the mosoo CLI and the @mosoo skill, then asks you for a provider key.":
    "把设置提示粘贴到 Codex、Claude Code、OpenCode、Cursor 或 Cline。它会安装 mosoo CLI 和 @mosoo 技能，然后请你提供模型供应商密钥。",
  "Copy setup prompt": "复制设置提示",
  "Copy command": "复制命令",
  "Setup prompt copied": "设置提示已复制",
  "Command copied": "命令已复制",
  "Copy failed.": "复制失败。",
  "Read the install script": "查看安装脚本",
  "A CSV analysis, started on day 1 and continued 2 days later in the same Session.":
    "示例：第 1 天开始一项 CSV 分析，2 天后在同一个 Session 里继续。",
  "Example values. Field names and event types come from the v2 OpenAPI document.":
    "示例数据。字段名和事件类型来自 v2 OpenAPI 文档。",
  "Example Session record. Your backend sends one request with a CSV attachment. mosoo streams events while the Agent runs Python in the sandbox and saves a report, a chart, and a data file under outputs/. Two days later the backend sends a follow-up to the same Thread. The sandbox had been reclaimed in between, so mosoo restores the working directory and the conversation from the last checkpoint, and the Agent updates the report.":
    "示例 Session 记录。你的后端发送一个带 CSV 附件的请求。Agent 在 sandbox 中运行 Python，mosoo 实时推送事件，并把报告、图表和数据文件保存到 outputs/ 下。2 天后，后端向同一个 Thread 发送后续消息。这期间 sandbox 已被回收，mosoo 从最近一次检查点恢复工作目录和对话，Agent 随后更新了报告。",
  "Your backend": "你的后端",
  Request: "请求",
  "Event stream (SSE)": "事件流（SSE）",
  Files: "文件",
  "Day 1": "第 1 天",
  "2 days later": "2 天后",
  "Sandbox reclaimed while idle": "sandbox 闲置后已回收",
  "Restored from the last checkpoint": "从最近一次检查点恢复",
  "Same thread.id": "同一个 thread.id",
  "Which regions grew fastest last quarter?": "上个季度哪些地区增长最快？",
  "Now split it by sales channel. Keep the same chart style.":
    "再按销售渠道拆分一下，图表样式保持不变。",
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
  "View source": "ソースコードを見る",
  "mosoo is in Alpha. Public APIs may still change.":
    "mosoo は現在 Alpha 版です。公開 API は変更される可能性があります。",
  "Set up with your coding agent": "コーディングエージェントでセットアップ",
  "Paste the setup prompt into Codex, Claude Code, OpenCode, Cursor, or Cline. It installs the mosoo CLI and the @mosoo skill, then asks you for a provider key.":
    "セットアッププロンプトを Codex、Claude Code、OpenCode、Cursor、Cline のいずれかに貼り付けてください。mosoo CLI と @mosoo スキルをインストールしたあと、プロバイダーキーの入力を求めます。",
  "Copy setup prompt": "セットアッププロンプトをコピー",
  "Copy command": "コマンドをコピー",
  "Setup prompt copied": "セットアッププロンプトをコピーしました",
  "Command copied": "コマンドをコピーしました",
  "Copy failed.": "コピーに失敗しました。",
  "Read the install script": "インストールスクリプトを確認する",
  "A CSV analysis, started on day 1 and continued 2 days later in the same Session.":
    "例：1 日目に始めた CSV 分析を、2 日後に同じ Session で続ける。",
  "Example values. Field names and event types come from the v2 OpenAPI document.":
    "サンプル値です。フィールド名とイベントタイプは v2 OpenAPI ドキュメントに基づいています。",
  "Example Session record. Your backend sends one request with a CSV attachment. mosoo streams events while the Agent runs Python in the sandbox and saves a report, a chart, and a data file under outputs/. Two days later the backend sends a follow-up to the same Thread. The sandbox had been reclaimed in between, so mosoo restores the working directory and the conversation from the last checkpoint, and the Agent updates the report.":
    "Session 記録の例です。バックエンドが CSV を添付したリクエストを 1 つ送ります。Agent が sandbox 内で Python を実行するあいだ、mosoo はイベントを配信し、レポート、グラフ、データファイルを outputs/ に保存します。2 日後、バックエンドは同じ Thread にフォローアップを送ります。その間に sandbox は回収されていたため、mosoo は最後のチェックポイントから作業ディレクトリと会話を復元し、Agent がレポートを更新します。",
  "Your backend": "あなたのバックエンド",
  Request: "リクエスト",
  "Event stream (SSE)": "イベントストリーム（SSE）",
  Files: "ファイル",
  "Day 1": "1 日目",
  "2 days later": "2 日後",
  "Sandbox reclaimed while idle": "アイドル中に sandbox を回収",
  "Restored from the last checkpoint": "最後のチェックポイントから復元",
  "Same thread.id": "同じ thread.id",
  "Which regions grew fastest last quarter?": "前四半期に最も伸びた地域はどこですか？",
  "Now split it by sales channel. Keep the same chart style.":
    "販売チャネル別にも分けてください。グラフのスタイルはそのままでお願いします。",
} satisfies Record<Message, string>;

const MESSAGES = { zh: ZH_MESSAGES, ja: JA_MESSAGES };

export function t(message: Message): string {
  return locale === "en" ? message : MESSAGES[locale][message];
}
