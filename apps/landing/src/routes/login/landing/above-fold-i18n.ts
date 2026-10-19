import { locale } from "@/shared/locale";

// Strings for the first screen of the home page: the hero and the product
// stage, plus the copy-button feedback both use. Kept apart from the
// below-the-fold dictionary so the initial bundle carries only these.
//
// "|" in a Chinese or Japanese string marks a phrase edge where a heading,
// label or button may wrap (rendered as <wbr> by Phrases in ui.tsx). t()
// strips the marks for running text and attributes; tp() keeps them.
const ZH_MESSAGES = {
  "An open-source, API-first managed Agent runtime": "开源、|API 优先的|托管 Agent runtime，|",
  "for application backends.": "面向|应用后端。",
  "Start an agent task with one API call, then continue the same Session a minute or 7 days later.":
    "一次 API 调用启动 Agent 任务，|1 分钟后或 7 天后|都能在同一个 Session 里|接着做。",
  "Try mosoo": "试用 mosoo",
  "Read the quickstart": "阅读|快速开始",
  "Using a coding agent?": "在用编码智能体？",
  "One API, 4 runtimes:": "一个 API，4 个 runtime：",
  "mosoo is in Alpha. Public APIs may still change.": "mosoo 目前处于 Alpha 阶段，|公开 API 仍可能变化。",
  "Copy setup prompt": "复制|设置提示",
  "Setup prompt copied": "设置提示已复制",
  "Copy failed.": "复制失败。",
  "One request starts a Session. A follow-up continues it 2 days later.":
    "一个请求|启动 Session，|2 天后|再发一条消息，|接着做。",
  "Example values. Field names and event types come from the v2 OpenAPI document.":
    "示例数据。字段名和事件类型来自 v2 OpenAPI 文档。",
  "Start a Session": "启动 Session",
  "Your backend": "你的后端",
  "With a provider key in your Project, one request starts the Session. Keep the `thread.id` it returns.":
    "项目里有模型供应商密钥后，一个请求就能启动 Session。保存返回的 `thread.id`。",
  "mosoo runs the turn": "mosoo 执行|这个 turn",
  "Event stream (SSE)": "事件流（SSE）",
  "The Agent runs code in the Session’s own sandbox, and your keys stay outside it. Events are saved, then streamed. The turn ends with artifacts, usage, and a checkpoint.":
    "Agent 在这个 Session 自己的 sandbox 里运行代码，你的密钥始终在 sandbox 之外。事件先保存再推送。turn 结束时留下产出物、用量和检查点。",
  "Artifacts in outputs/": "outputs/ 里的|产出物",
  "2 days later": "2 天后",
  "Turn committed": "turn 已提交",
  "Sandbox reclaimed while idle": "sandbox 闲置后|已回收",
  "Restored from the last checkpoint": "从最近一次|检查点|恢复",
  "Reply whenever you’re ready. A follow-up to the same `thread.id` continues the Session, and `sales.csv`, copied into the working directory on day 1, comes back with the checkpoint.":
    "准备好了再回复。向同一个 `thread.id` 发送后续消息，Session 就会继续；第 1 天复制到工作目录的 `sales.csv` 会随检查点一起恢复。",
  "Follow-up": "后续消息",
  "Same thread.id": "同一个 thread.id",
  "Show the full request": "查看|完整请求",
  "Show all 12 events": "查看|全部 12 个事件",
  "Show all 7 events": "查看|全部 7 个事件",
  "Copy request": "复制|请求",
  "Open the v2 API reference": "查看 v2 API 参考",
  "Request copied": "请求已复制",
  "A Project API key. It starts with `msp_`, is shown once, and stays on your backend.":
    "Project API 密钥。它以 `msp_` 开头，只显示一次，只放在你的后端。",
  "The runtime for this Session: openai-runtime, claude-agent-sdk, acp-fallback, or pi.":
    "这个 Session 使用的 runtime：openai-runtime、claude-agent-sdk、acp-fallback 或 pi。",
  "A model your provider key can use. Model IDs change often, so check your Project first.":
    "你的模型供应商密钥可用的模型。模型 ID 经常变化，请先在项目里确认。",
  "What the Agent does in this Session.": "Agent 在这个 Session 里要做的事。",
  "Files uploaded first with POST /api/v2/projects/{projectId}/files.":
    "先通过 POST /api/v2/projects/{projectId}/files 上传的文件。",
  "Retry with the same key for 24 hours without running the work twice.":
    "24 小时内用同一个 key 重试，不会重复执行。",
  "Which regions grew fastest last quarter?": "上个季度哪些地区增长最快？",
  "Now split it by sales channel. Keep the same chart style.":
    "再按销售渠道拆分一下，图表样式保持不变。",
} as const;

type Message = keyof typeof ZH_MESSAGES;

const JA_MESSAGES = {
  "An open-source, API-first managed Agent runtime":
    "オープンソースで API ファーストな|マネージド Agent runtime",
  "for application backends.": "アプリケーションの|バックエンドのための、|",
  "Start an agent task with one API call, then continue the same Session a minute or 7 days later.":
    "API を 1 回呼ぶだけで Agent のタスクを始め、|1 分後でも 7 日後でも|同じ Session で|続きを実行できます。",
  "Try mosoo": "mosoo を試す",
  "Read the quickstart": "クイックスタートを|読む",
  "Using a coding agent?": "コーディングエージェントを使うなら",
  "One API, 4 runtimes:": "1 つの API で 4 つの runtime：",
  "mosoo is in Alpha. Public APIs may still change.":
    "mosoo は現在 Alpha 版です。|公開 API は|変更される可能性があります。",
  "Copy setup prompt": "セットアップ|プロンプトを|コピー",
  "Setup prompt copied": "セットアッププロンプトをコピーしました",
  "Copy failed.": "コピーに失敗しました。",
  "One request starts a Session. A follow-up continues it 2 days later.":
    "1 つのリクエストで Session を開始。|2 日後の|フォローアップで|続きを実行。",
  "Example values. Field names and event types come from the v2 OpenAPI document.":
    "サンプル値です。フィールド名とイベントタイプは v2 OpenAPI ドキュメントに基づいています。",
  "Start a Session": "Session を|開始",
  "Your backend": "あなたのバックエンド",
  "With a provider key in your Project, one request starts the Session. Keep the `thread.id` it returns.":
    "プロジェクトにプロバイダーキーがあれば、1 つのリクエストで Session が始まります。返ってきた `thread.id` を保存してください。",
  "mosoo runs the turn": "mosoo が turn を実行",
  "Event stream (SSE)": "イベントストリーム（SSE）",
  "The Agent runs code in the Session’s own sandbox, and your keys stay outside it. Events are saved, then streamed. The turn ends with artifacts, usage, and a checkpoint.":
    "Agent はその Session 専用の sandbox でコードを実行し、キーは sandbox の外に置かれたままです。イベントは保存してから配信されます。turn は成果物、使用量、チェックポイントを残して終わります。",
  "Artifacts in outputs/": "outputs/ の|成果物",
  "2 days later": "2 日後",
  "Turn committed": "turn を|コミット",
  "Sandbox reclaimed while idle": "アイドル中に sandbox を|回収",
  "Restored from the last checkpoint": "最後の|チェックポイントから|復元",
  "Reply whenever you’re ready. A follow-up to the same `thread.id` continues the Session, and `sales.csv`, copied into the working directory on day 1, comes back with the checkpoint.":
    "準備ができたら返信してください。同じ `thread.id` にフォローアップを送れば Session が続き、1 日目に作業ディレクトリへコピーした `sales.csv` もチェックポイントから戻ります。",
  "Follow-up": "フォローアップ",
  "Same thread.id": "同じ thread.id",
  "Show the full request": "リクエスト全体を|見る",
  "Show all 12 events": "12 件の|イベントを|すべて見る",
  "Show all 7 events": "7 件の|イベントを|すべて見る",
  "Copy request": "リクエストを|コピー",
  "Open the v2 API reference": "v2 API リファレンスを開く",
  "Request copied": "リクエストをコピーしました",
  "A Project API key. It starts with `msp_`, is shown once, and stays on your backend.":
    "Project API キー。`msp_` で始まり、表示は一度だけで、バックエンドにだけ置きます。",
  "The runtime for this Session: openai-runtime, claude-agent-sdk, acp-fallback, or pi.":
    "この Session の runtime：openai-runtime、claude-agent-sdk、acp-fallback、pi のいずれか。",
  "A model your provider key can use. Model IDs change often, so check your Project first.":
    "プロバイダーキーで使えるモデル。モデル ID はよく変わるので、先にプロジェクトで確認してください。",
  "What the Agent does in this Session.": "この Session で Agent が行うこと。",
  "Files uploaded first with POST /api/v2/projects/{projectId}/files.":
    "先に POST /api/v2/projects/{projectId}/files でアップロードしたファイル。",
  "Retry with the same key for 24 hours without running the work twice.":
    "24 時間以内なら、同じキーで再試行しても処理は二重に実行されません。",
  "Which regions grew fastest last quarter?": "前四半期に最も伸びた地域はどこですか？",
  "Now split it by sales channel. Keep the same chart style.":
    "販売チャネル別にも分けてください。グラフのスタイルはそのままでお願いします。",
} satisfies Record<Message, string>;

const MESSAGES = { zh: ZH_MESSAGES, ja: JA_MESSAGES };

/** The string with its phrase marks, for <Phrases>. */
export function tp(message: Message): string {
  return locale === "en" ? message : MESSAGES[locale][message];
}

/** The string as running text, without phrase marks. */
export function t(message: Message): string {
  return tp(message).replaceAll("|", "");
}
