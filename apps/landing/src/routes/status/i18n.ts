import { locale } from "@/shared/locale";

const ZH_MESSAGES = {
  "System status": "系统状态",
  "Production path, measured.": "生产路径，实测。",
  "Every check runs a real production turn, waits for completion, then sends a follow-up through the same Thread. We publish TTFT and driver continuity—not a shallow ping.":
    "每次检查都会运行一轮真实生产 turn，等待完成，再通过同一 Thread 发送 follow-up。这里公开的是 TTFT 与 driver 连续性，不是浅层 ping。",
  "Checking current status…": "正在读取当前状态…",
  "All monitored runtimes operational": "所有受监控 runtime 运行正常",
  "A production canary is outside its SLO": "生产 canary 已超出 SLO",
  "Current status is unavailable": "当前状态暂不可用",
  "Last checked": "最近检查",
  "No successful check yet": "尚无成功检查",
  "Monitored runtimes": "受监控 runtime",
  "A passing check requires two real turns, both within the TTFT budget, with the follow-up reusing the first turn's driver.":
    "检查通过需要完成两轮真实 turn、两轮 TTFT 都在预算内，并且 follow-up 复用第一轮的 driver。",
  Operational: "正常",
  Degraded: "降级",
  Unknown: "未知",
  "Awaiting fresh canary data": "等待新的 canary 数据",
  "Latest check passed": "最近一次检查通过",
  "Latest check breached the SLO": "最近一次检查未达 SLO",
  "90-day measured availability": "90 天实测可用率",
  checks: "次检查",
  "No measurements yet": "暂无测量数据",
  "First TTFT": "首轮 TTFT",
  "Follow-up": "Follow-up",
  budget: "预算",
  "Same driver": "同一 driver",
  "Driver changed": "driver 已变化",
  "Release policy": "发布策略",
  "Target SLO": "目标 SLO",
  "99.5% of checks pass over a rolling 30-day window. This is a public SLO, not a contractual SLA.":
    "滚动 30 天内 99.5% 的检查通过。这是公开 SLO，不是合同 SLA。",
  "Three consecutive breaches freeze feature releases. The team ships reliability fixes only until a passing canary and incident review clear the freeze.":
    "连续三次破线即冻结功能发布。恢复通过且完成事故审查前，团队只发布可靠性修复。",
  "Release freeze active": "功能发布冻结中",
  "Incident record": "事故记录",
  "Resolved · 29 Jul 2026 — OpenAI Runtime runs failed before producing a response. Production hotfixes restored sandbox startup, provider routing, and lifecycle recovery.":
    "已恢复 · 2026 年 7 月 29 日 — OpenAI Runtime 运行在生成回复前失败。生产热修已恢复 sandbox 启动、provider 路由和生命周期收敛。",
  "Read the OpenAI Runtime incident postmortem": "查看 OpenAI Runtime 事故复盘",
  "How this is measured": "测量方法",
  "Canaries run every five minutes against the public production API for OpenAI Codex, Claude Agent SDK, and OpenCode. Missing two check intervals makes a component Unknown.":
    "Canary 每五分钟通过公开生产 API 检查 OpenAI Codex、Claude Agent SDK 与 OpenCode。连续缺失两个检查周期后，该组件会显示为未知。",
} as const;

type Message = keyof typeof ZH_MESSAGES;

const JA_MESSAGES = {
  "System status": "システムステータス",
  "Production path, measured.": "本番経路を、実測する。",
  "Every check runs a real production turn, waits for completion, then sends a follow-up through the same Thread. We publish TTFT and driver continuity—not a shallow ping.":
    "各チェックは本番で実際の turn を実行し、完了後に同じ Thread から follow-up を送ります。単純な ping ではなく、TTFT と driver の継続性を公開します。",
  "Checking current status…": "現在のステータスを確認中…",
  "All monitored runtimes operational": "監視中の runtime はすべて正常です",
  "A production canary is outside its SLO": "本番 canary が SLO を外れています",
  "Current status is unavailable": "現在のステータスを取得できません",
  "Last checked": "最終チェック",
  "No successful check yet": "成功したチェックはまだありません",
  "Monitored runtimes": "監視中の runtime",
  "A passing check requires two real turns, both within the TTFT budget, with the follow-up reusing the first turn's driver.":
    "合格には、2 回の実 turn がともに TTFT 予算内で完了し、follow-up が最初の turn と同じ driver を再利用する必要があります。",
  Operational: "正常",
  Degraded: "低下",
  Unknown: "不明",
  "Awaiting fresh canary data": "新しい canary データを待機中",
  "Latest check passed": "直近のチェックは合格",
  "Latest check breached the SLO": "直近のチェックは SLO 未達",
  "90-day measured availability": "90 日間の実測可用率",
  checks: "チェック",
  "No measurements yet": "測定データはまだありません",
  "First TTFT": "初回 TTFT",
  "Follow-up": "Follow-up",
  budget: "予算",
  "Same driver": "同じ driver",
  "Driver changed": "driver が変更",
  "Release policy": "リリース方針",
  "Target SLO": "目標 SLO",
  "99.5% of checks pass over a rolling 30-day window. This is a public SLO, not a contractual SLA.":
    "ローリング 30 日で 99.5% のチェック合格を目標とします。これは公開 SLO であり、契約上の SLA ではありません。",
  "Three consecutive breaches freeze feature releases. The team ships reliability fixes only until a passing canary and incident review clear the freeze.":
    "3 回連続で未達になると機能リリースを凍結します。canary の合格とインシデントレビューが完了するまで、信頼性修正のみを出荷します。",
  "Release freeze active": "機能リリースを凍結中",
  "Incident record": "インシデント記録",
  "Resolved · 29 Jul 2026 — OpenAI Runtime runs failed before producing a response. Production hotfixes restored sandbox startup, provider routing, and lifecycle recovery.":
    "復旧済み · 2026 年 7 月 29 日 — OpenAI Runtime の実行が応答生成前に失敗しました。本番ホットフィックスにより、sandbox の起動、provider のルーティング、ライフサイクルの復旧を回復しました。",
  "Read the OpenAI Runtime incident postmortem": "OpenAI Runtime インシデントのポストモーテムを読む",
  "How this is measured": "測定方法",
  "Canaries run every five minutes against the public production API for OpenAI Codex, Claude Agent SDK, and OpenCode. Missing two check intervals makes a component Unknown.":
    "Canary は 5 分ごとに公開本番 API から OpenAI Codex、Claude Agent SDK、OpenCode を確認します。2 回分のチェックが欠けると、そのコンポーネントは不明になります。",
} satisfies Record<Message, string>;

const MESSAGES = { zh: ZH_MESSAGES, ja: JA_MESSAGES };

export function t(message: Message): string {
  return locale === "en" ? message : MESSAGES[locale][message];
}
