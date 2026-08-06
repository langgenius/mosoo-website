import { locale } from "@/shared/locale";

const ZH_MESSAGES = {
  Pricing: "定价",
  "Start free. Grow when your agents do.": "免费起步，随你的 Agent 一同生长。",
  "Run agents on mosoo Cloud with a free tier that's ready today. Paid plans land soon, and self-hosting stays free and open source, forever.":
    "mosoo Cloud 免费档今天即可使用。付费方案即将上线，而自托管永远免费且开源。",
  "Billing isn't implemented yet. During the alpha, everything runs free.":
    "计费尚未实装，alpha 期间全部免费。",
  Free: "免费",
  Pro: "Pro",
  Enterprise: "企业",
  "$0 / month": "$0 / 月",
  "Pricing to be announced": "价格待公布",
  "Custom pricing": "定制价格",
  "Coming Soon": "即将上线",
  "Get Started": "立即开始",
  "For individual developers and weekend agents.": "适合个人开发者与业余项目。",
  "For teams shipping production agents.": "适合将 Agent 投入生产的团队。",
  "For platforms operating agent fleets.": "适合运营 Agent 集群的平台。",
  "3 agents in one App": "1 个 App，3 个 Agent",
  "OpenAI Codex · Claude Agent SDK · OpenCode": "OpenAI Codex · Claude Agent SDK · OpenCode",
  "10 sandbox hours every month": "每月 10 小时 sandbox 时长",
  "Concurrent sandboxes: 3 per Agent · 10 per App · 20 per account":
    "并发 sandbox：每个 Agent 3 个 · 每个 App 10 个 · 每个账户 20 个",
  "Durable Threads and session replay": "持久 Threads 与 session 重放",
  "BYOK provider keys": "BYOK 自带 Provider 密钥",
  "Everything in Free": "包含免费档全部能力",
  "More sandbox hours and concurrency": "更多 sandbox 时长与并发",
  "Longer runs, kept warm": "更长的 Run 时限，保持热启动",
  "All chat channels": "全部聊天 Channels",
  "Priority support": "优先支持",
  "Custom sandbox pool and concurrency": "自定义 sandbox 资源池与并发",
  "SSO / SAML and audit logs": "SSO / SAML 与审计日志",
  "VPC or on-prem deployment": "VPC 或本地部署",
  "Dedicated support": "专属支持",
  "What the meter counts.": "计费只看这些。",
  "mosoo Cloud runs on Cloudflare. The meter tracks the resources a run actually consumes, never seats or idle servers.":
    "mosoo Cloud 运行在 Cloudflare 上。计费只跟随每次 Run 实际消耗的资源，不按席位，也不为闲置买单。",
  "Sandbox compute": "Sandbox 算力",
  "Per-second while a sandbox is mounted for a run. Idle time is never billed.":
    "sandbox 挂载运行期间按秒计量，闲置时间从不计费。",
  Storage: "存储",
  "Files your Apps keep in R2, plus Threads and metadata in D1.":
    "App 存放在 R2 的文件，以及 D1 中的 Threads 与元数据。",
  Requests: "请求",
  "Agent API calls served by Workers.": "由 Workers 承载的 Agent API 调用。",
  "Model tokens": "模型 Tokens",
  "BYOK: your provider bills you directly. mosoo adds no markup.":
    "BYOK：由你的 Provider 直接向你收费，mosoo 不加价。",
  "Self-host": "自托管",
  "Or run it on your own cloud, free.": "或部署在你自己的云上，免费。",
  "mosoo is open source. Deploy Workers, D1, R2, and KV into your own Cloudflare account. BYOK, no per-seat fee, no meter.":
    "mosoo 是开源项目。将 Workers、D1、R2 与 KV 部署到你自己的 Cloudflare 账户。BYOK，无席位费，也不计量。",
  "Deploy to Cloudflare": "部署到 Cloudflare",
  "Star on GitHub": "在 GitHub 上加 Star",
  "Star mosoo on GitHub": "在 GitHub 上为 mosoo 加 Star",
  "mosoo Cloud is in alpha. Plan limits are indicative and may change before general availability.":
    "mosoo Cloud 目前处于 alpha 阶段。方案限额仅供参考，正式发布前可能调整。",
} as const;

type Message = keyof typeof ZH_MESSAGES;

const JA_MESSAGES = {
  Pricing: "料金",
  // NBSP after Agent: a plain space is a line-break opportunity, and balanced
  // wrapping would otherwise start the second line with the particle の.
  "Start free. Grow when your agents do.": "無料で始めて、Agent\u00A0の成長に合わせて。",
  "Run agents on mosoo Cloud with a free tier that's ready today. Paid plans land soon, and self-hosting stays free and open source, forever.":
    "mosoo Cloud の無料プランは今日から利用可能。有料プランは近日公開。セルフホストは永久に無料のオープンソースです。",
  "Billing isn't implemented yet. During the alpha, everything runs free.":
    "課金機能はまだ実装されていません。alpha 期間中はすべて無料です。",
  Free: "無料",
  Pro: "Pro",
  Enterprise: "エンタープライズ",
  "$0 / month": "$0 / 月",
  "Pricing to be announced": "価格は近日発表",
  "Custom pricing": "カスタム価格",
  "Coming Soon": "近日公開",
  "Get Started": "無料で始める",
  "For individual developers and weekend agents.": "個人開発者やサイドプロジェクトに。",
  "For teams shipping production agents.": "Agent を本番運用するチームに。",
  "For platforms operating agent fleets.": "Agent フリートを運用するプラットフォームに。",
  "3 agents in one App": "1 App・3 Agent まで",
  "OpenAI Codex · Claude Agent SDK · OpenCode": "OpenAI Codex · Claude Agent SDK · OpenCode",
  "10 sandbox hours every month": "毎月 10 時間の sandbox 実行",
  "Concurrent sandboxes: 3 per Agent · 10 per App · 20 per account":
    "同時 sandbox：Agent ごとに 3 · App ごとに 10 · アカウントごとに 20",
  "Durable Threads and session replay": "永続的な Threads と session の再生",
  "BYOK provider keys": "BYOK の Provider キー",
  "Everything in Free": "無料プランの全機能を含む",
  "More sandbox hours and concurrency": "より多くの sandbox 時間と同時実行",
  "Longer runs, kept warm": "より長い Run をウォームなまま維持",
  "All chat channels": "すべてのチャット Channels",
  "Priority support": "優先サポート",
  "Custom sandbox pool and concurrency": "sandbox プールと同時実行数をカスタム",
  "SSO / SAML and audit logs": "SSO / SAML と監査ログ",
  "VPC or on-prem deployment": "VPC / オンプレミス展開",
  "Dedicated support": "専任サポート",
  "What the meter counts.": "課金対象は、これだけ。",
  "mosoo Cloud runs on Cloudflare. The meter tracks the resources a run actually consumes, never seats or idle servers.":
    "mosoo Cloud は Cloudflare 上で動作します。課金は Run が実際に消費したリソースのみ。シート課金も、アイドルサーバーの支払いもありません。",
  "Sandbox compute": "Sandbox 実行時間",
  "Per-second while a sandbox is mounted for a run. Idle time is never billed.":
    "Run 中に sandbox がマウントされている間のみ、秒単位で計測。アイドル時間には課金されません。",
  Storage: "ストレージ",
  "Files your Apps keep in R2, plus Threads and metadata in D1.":
    "App が R2 に保存するファイルと、D1 上の Threads・メタデータ。",
  Requests: "リクエスト",
  "Agent API calls served by Workers.": "Workers が処理する Agent API 呼び出し。",
  "Model tokens": "モデル Tokens",
  "BYOK: your provider bills you directly. mosoo adds no markup.":
    "BYOK では Provider から直接請求され、mosoo は上乗せしません。",
  "Self-host": "セルフホスト",
  "Or run it on your own cloud, free.": "自分のクラウドなら、無料。",
  "mosoo is open source. Deploy Workers, D1, R2, and KV into your own Cloudflare account. BYOK, no per-seat fee, no meter.":
    "mosoo はオープンソース。Workers・D1・R2・KV を自分の Cloudflare アカウントに展開。BYOK、シート課金なし、メーター\u2060なし。",
  "Deploy to Cloudflare": "Cloudflare にデプロイ",
  "Star on GitHub": "GitHub で Star",
  "Star mosoo on GitHub": "GitHub で mosoo に Star",
  "mosoo Cloud is in alpha. Plan limits are indicative and may change before general availability.":
    "mosoo Cloud は現在 alpha 版です。プランの上限は目安であり、正式リリース前に変更される場合があります。",
} satisfies Record<Message, string>;

const MESSAGES = { zh: ZH_MESSAGES, ja: JA_MESSAGES };

export function t(message: Message): string {
  return locale === "en" ? message : MESSAGES[locale][message];
}

export type { Message as PricingMessage };
