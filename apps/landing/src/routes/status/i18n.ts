import { locale } from "@/shared/locale";

const ZH_MESSAGES = {
  "System status": "系统状态",
  "Production traffic, observed.": "生产流量，持续观测。",
  "Status is derived from Cloudflare Worker outcomes and Mosoo Run terminal events. No synthetic Agent calls, no model-token spend.":
    "状态来自 Cloudflare Worker 执行结果与 Mosoo Run 终态事件。不发起 synthetic Agent 调用，也不消耗模型 token。",
  "Checking current status…": "正在读取当前状态…",
  "Production services are responding": "生产服务响应正常",
  "Production failures are being observed": "已观测到生产失败",
  "Awaiting production signals": "等待生产信号",
  "Last observed": "最近观测",
  "No production signal yet": "尚无生产信号",
  "Service availability": "服务可用性",
  "Cloudflare reports whether the production API and control plane complete their invocations successfully.":
    "Cloudflare 记录生产 API 与控制面的每次调用是否成功完成。",
  "Mosoo API & control plane": "Mosoo API 与控制面",
  "Waiting for a fresh Worker invocation": "等待新的 Worker 调用",
  "Worker invocations are succeeding": "Worker 调用运行正常",
  "A production invocation failed": "一次生产调用失败",
  "90-day invocation success": "90 天调用成功率",
  invocations: "次调用",
  "No observations yet": "暂无观测数据",
  "Latest outcome": "最近结果",
  "HTTP status": "HTTP 状态",
  "Runtime Run stability": "Runtime 任务稳定性",
  "Completion rate is based only on real user-facing UI and Public API Runs. Preview traffic and cancellations are excluded.":
    "完成率只统计真实用户触发的 UI 与 Public API Run；不包含 Preview 流量和主动取消。",
  "No recent production Runs": "近期没有生产 Run",
  "Three consecutive observed Runs failed": "已连续观测到三次 Run 失败",
  "Latest observed Run completed": "最近观测到的 Run 已完成",
  "Recent Run failed; incident threshold not reached": "最近一次 Run 失败，尚未达到事故阈值",
  "90-day Run completion rate": "90 天 Run 完成率",
  Runs: "次 Run",
  "Latest Run": "最近 Run",
  Duration: "耗时",
  Error: "错误",
  Operational: "正常",
  Degraded: "降级",
  Unknown: "未知",
  "Signal source": "信号来源",
  "Cloudflare + Mosoo": "Cloudflare + Mosoo",
  "Cloudflare supplies invocation outcomes; Mosoo's existing structured business log supplies runtime, terminal status, duration, and error code.":
    "Cloudflare 提供调用结果；Mosoo 现有结构化业务日志提供 runtime、终态、耗时与错误码。",
  "Synthetic traffic": "Synthetic 流量",
  "0 Agent Runs": "0 次 Agent Run",
  "The status pipeline does not create Threads, invoke models, or consume tokens. Runtime status becomes Unknown after 24 hours without real traffic.":
    "状态链路不会创建 Thread、调用模型或消耗 token。某 runtime 24 小时没有真实流量后会显示为未知。",
  "Incident record": "事故记录",
  "Resolved · 29 Jul 2026 — OpenAI Runtime runs failed before producing a response. Production hotfixes restored sandbox startup, provider routing, and lifecycle recovery.":
    "已恢复 · 2026 年 7 月 29 日 — OpenAI Runtime 在生成回复前失败。生产热修已恢复 sandbox 启动、provider 路由和生命周期收敛。",
  "Read the OpenAI Runtime incident postmortem": "查看 OpenAI Runtime 事故复盘",
  "How this is measured": "测量方法",
  "The API Worker is observed continuously through Cloudflare Tail events. Runtime completion rates update whenever a real user-facing Run reaches completed, failed, or expired.":
    "通过 Cloudflare Tail 事件持续观测 API Worker；每当真实用户 Run 进入 completed、failed 或 expired，runtime 完成率就会更新。",
} as const;

type Message = keyof typeof ZH_MESSAGES;

const JA_MESSAGES = {
  "System status": "システムステータス",
  "Production traffic, observed.": "本番トラフィックを、観測する。",
  "Status is derived from Cloudflare Worker outcomes and Mosoo Run terminal events. No synthetic Agent calls, no model-token spend.":
    "ステータスは Cloudflare Worker の実行結果と Mosoo Run の終端イベントから算出します。Synthetic Agent 呼び出しも、モデル token の消費もありません。",
  "Checking current status…": "現在のステータスを確認中…",
  "Production services are responding": "本番サービスは正常に応答しています",
  "Production failures are being observed": "本番環境で失敗を観測しています",
  "Awaiting production signals": "本番シグナルを待機中",
  "Last observed": "最終観測",
  "No production signal yet": "本番シグナルはまだありません",
  "Service availability": "サービス可用性",
  "Cloudflare reports whether the production API and control plane complete their invocations successfully.":
    "Cloudflare は、本番 API とコントロールプレーンの各呼び出しが正常に完了したかを記録します。",
  "Mosoo API & control plane": "Mosoo API とコントロールプレーン",
  "Waiting for a fresh Worker invocation": "新しい Worker 呼び出しを待機中",
  "Worker invocations are succeeding": "Worker 呼び出しは正常です",
  "A production invocation failed": "本番呼び出しが失敗しました",
  "90-day invocation success": "90 日間の呼び出し成功率",
  invocations: "回の呼び出し",
  "No observations yet": "観測データはまだありません",
  "Latest outcome": "直近の結果",
  "HTTP status": "HTTP ステータス",
  "Runtime Run stability": "Runtime Run の安定性",
  "Completion rate is based only on real user-facing UI and Public API Runs. Preview traffic and cancellations are excluded.":
    "完了率は、実ユーザー向け UI と Public API の Run だけを対象にします。Preview とキャンセルは除外します。",
  "No recent production Runs": "最近の本番 Run はありません",
  "Three consecutive observed Runs failed": "観測した Run が 3 回連続で失敗しました",
  "Latest observed Run completed": "直近に観測した Run は完了しました",
  "Recent Run failed; incident threshold not reached": "直近の Run は失敗しましたが、インシデント閾値未満です",
  "90-day Run completion rate": "90 日間の Run 完了率",
  Runs: "Run",
  "Latest Run": "直近の Run",
  Duration: "所要時間",
  Error: "エラー",
  Operational: "正常",
  Degraded: "低下",
  Unknown: "不明",
  "Signal source": "シグナルソース",
  "Cloudflare + Mosoo": "Cloudflare + Mosoo",
  "Cloudflare supplies invocation outcomes; Mosoo's existing structured business log supplies runtime, terminal status, duration, and error code.":
    "Cloudflare が呼び出し結果を、Mosoo の既存構造化ビジネスログが runtime、終端状態、所要時間、エラーコードを提供します。",
  "Synthetic traffic": "Synthetic トラフィック",
  "0 Agent Runs": "Agent Run 0 回",
  "The status pipeline does not create Threads, invoke models, or consume tokens. Runtime status becomes Unknown after 24 hours without real traffic.":
    "ステータス処理は Thread の作成、モデル呼び出し、token 消費を行いません。実トラフィックが 24 時間ない runtime は不明になります。",
  "Incident record": "インシデント記録",
  "Resolved · 29 Jul 2026 — OpenAI Runtime runs failed before producing a response. Production hotfixes restored sandbox startup, provider routing, and lifecycle recovery.":
    "復旧済み · 2026 年 7 月 29 日 — OpenAI Runtime が応答生成前に失敗しました。本番ホットフィックスにより sandbox 起動、provider ルーティング、ライフサイクル復旧を回復しました。",
  "Read the OpenAI Runtime incident postmortem": "OpenAI Runtime のポストモーテムを読む",
  "How this is measured": "測定方法",
  "The API Worker is observed continuously through Cloudflare Tail events. Runtime completion rates update whenever a real user-facing Run reaches completed, failed, or expired.":
    "Cloudflare Tail イベントで API Worker を継続観測し、実ユーザーの Run が completed、failed、expired に達するたびに runtime 完了率を更新します。",
} satisfies Record<Message, string>;

const MESSAGES = { zh: ZH_MESSAGES, ja: JA_MESSAGES };

export function t(message: Message): string {
  return locale === "en" ? message : MESSAGES[locale][message];
}
