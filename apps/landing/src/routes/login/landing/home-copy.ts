import { locale } from "@/shared/locale";
import type { Locale } from "@/shared/locale";

// Copy for the instrument home (v4a). Every string sits in a slot whose size
// is locked in v4a/UI-LOCK.md §3 and was written to that size: when a line did
// not fit, it was rewritten, never given a new slot. Product claims are
// checked against langgenius/mosoo (file:line in v4a/CHANGELOG.md).
//
// The FAQ strings are the exact strings scripts/landing-home.mjs puts in the
// static page, the FAQPage JSON-LD and llms.txt (tests/site-seo.test.mjs
// checks they match).
//
// The two transcripts render the main repo's Session acceptance workflow
// (scripts/public-api-session-workflow.ts): input.csv with three rows sums to
// 230; after a follow-up appends south,20 it sums to 250. Verbs are the
// console's built-in tool names; event names are the contract's.

export type TranscriptLine =
  | { kind: "prompt"; text: string; at: number; rulerAt: number }
  | {
      kind: "step";
      verb: string;
      arg: string;
      result?: string;
      at: number;
      rulerAt: number;
    }
  | { kind: "gap"; at: number; rulerAt: number };

export type FaqItem = { question: string; answer: string };

// Words inside the product objects that change per locale; tool names,
// file names, JSON keys and event names stay as they are.
type TranscriptWords = {
  prompt: string;
  followUp: string;
  rows: string;
};

const WINDOW_NAME = "claude-agent-sdk";

function heroLines(words: TranscriptWords): TranscriptLine[] {
  return [
    { kind: "prompt", text: words.prompt, at: 0, rulerAt: 0 },
    {
      kind: "step",
      verb: "Read",
      arg: "input.csv",
      result: words.rows,
      at: 0,
      rulerAt: 0,
    },
    { kind: "step", verb: "Bash", arg: "python report.py", at: 0, rulerAt: 0 },
  ];
}

// [data-at] is the scroll progress at which a line prints; [data-ruler-at]
// is the dot's place on the U14 ruler (0 = +0, 0.96 = +7 days).
function stageLines(words: TranscriptWords): TranscriptLine[] {
  return [
    { kind: "prompt", text: words.prompt, at: 0, rulerAt: 0 },
    {
      kind: "step",
      verb: "Read",
      arg: "input.csv",
      result: words.rows,
      at: 0.07,
      rulerAt: 0.04,
    },
    {
      kind: "step",
      verb: "Bash",
      arg: "python report.py",
      result: "grand_total 230",
      at: 0.15,
      rulerAt: 0.12,
    },
    {
      kind: "step",
      verb: "Write",
      arg: "outputs/report.md",
      result: "session_files.updated",
      at: 0.23,
      rulerAt: 0.22,
    },
    { kind: "gap", at: 0.33, rulerAt: 0.44 },
    { kind: "prompt", text: words.followUp, at: 0.7, rulerAt: 0.96 },
    {
      kind: "step",
      verb: "Bash",
      arg: "python report.py",
      result: "grand_total 250",
      at: 0.79,
      rulerAt: 0.965,
    },
    {
      kind: "step",
      verb: "Write",
      arg: "outputs/report.md",
      result: "run.completed",
      at: 0.88,
      rulerAt: 0.97,
    },
  ];
}

const EN_WORDS: TranscriptWords = {
  prompt: "Total the revenue in input.csv.",
  followUp: "Add south,20 and run it again.",
  rows: "3 rows",
};

const EN = {
  hero: {
    // H-A / H-B: 1 x 18 each (phones: the H1 is 38px so 18 still fits).
    title: ["The Agent runtime", "for your backend."],
    // H-L: 2 x 44, at most 14 words.
    lead: "One API call starts a sandboxed Session. Your app keeps its users and UI.",
    primary: "Try mosoo",
    windowName: WINDOW_NAME,
    lines: heroLines(EN_WORDS),
  },
  stage: {
    title: ["Reply in a minute", "or in seven days."],
    lead: "The sandbox may be reclaimed. Files and conversation come back from the last checkpoint.",
    windowName: WINDOW_NAME,
    ruler: ["+0", "+1 min", "+1 hour", "+1 day", "+7 days"],
    lines: stageLines(EN_WORDS),
  },
  spec: {
    title: ["One Session, five parts.", "Choose the harness per Session."],
    rows: {
      harness: "Harness",
      model: "Model",
      sandbox: "Sandbox",
      files: "Files",
      resume: "Resume",
    },
    model: "Your provider key",
    sandbox: "Isolated, one per Session",
    file: "outputs/report.md",
    resume: "A minute or seven days later",
  },
  faq: {
    title: ["Questions", "before you wire it in."],
    items: [
      {
        question: "What is mosoo?",
        answer:
          "An open-source, API-first managed Agent runtime for application backends. One API runs OpenAI Codex, Claude Agent SDK, OpenCode or Pi, each Session in its own sandbox.",
      },
      {
        question: "Do I need to create an Agent first?",
        answer:
          "No. On /api/v2 one request carries the harness, provider, model, instructions and input, and starts a durable Session. A saved Agent preset is optional; it also carries Skills, MCP servers and an Environment.",
      },
      {
        question: "What happens when I reply days later?",
        answer:
          "The reply continues the same Session. If the sandbox was reclaimed, mosoo restores the working directory and the native conversation from the last committed checkpoint. Live processes are not carried over.",
      },
      {
        question: "Do my provider keys enter the sandbox?",
        answer:
          "No. Provider keys and MCP credentials stay outside; the sandbox gets only expiring grants for them. Environment variables are different: code in the sandbox can read them.",
      },
      {
        question: "Who pays for model usage?",
        answer:
          "You do, directly. Provider keys belong to your Project, and the provider bills your account. mosoo supplies no models and sets no spending cap. Usage shows measured tokens and cost estimates, not invoices.",
      },
      {
        question: "Is mosoo open source?",
        answer:
          "Yes, under Apache 2.0, with the source on GitHub. The hosted console runs at cloud.mosoo.ai, and the README explains local development. mosoo is in Alpha, so public APIs may still change.",
      },
    ] satisfies FaqItem[],
  },
  closing: {
    title: ["Start a Session", "from your agent."],
    legend: "Paste to any agent",
    // C-C: 1 x 52 (phones: 2 x 26). What the card shows is what Copy copies.
    prompt: "Read mosoo.ai/llms.txt, then set up mosoo here.",
    copy: "Copy",
    copied: "Copied",
    note: "You sign in and add a provider key.",
  },
  end: {
    event: "run.completed",
    status: "waiting for the next turn",
  },
  footer: {
    askTitle: "Want the short version?",
    askLead:
      "Ask an assistant to sum up mosoo: one API that runs your agent in a sandboxed Session.",
    askPrompt:
      "Summarize mosoo (https://mosoo.ai), the open-source Agent runtime for app backends.",
    columns: {
      product: "Product",
      source: "Source",
      company: "Company",
    },
    links: {
      docs: "Docs",
      quickstart: "Quickstart",
      api: "API reference",
      pricing: "Pricing",
      status: "Status",
      github: "GitHub",
      releases: "Releases",
      license: "Apache-2.0",
      blog: "Blog",
      useCases: "Use cases",
      llms: "llms.txt",
    },
    credit: "© 2026 LangGenius, Inc.",
    language: "Language",
  },
  nav: {
    home: "mosoo home",
    docs: "Docs",
    blog: "Blog",
    github: "mosoo on GitHub",
    signIn: "Sign in",
    try: "Try mosoo",
    skip: "Skip to content",
  },
};

export type HomeCopy = typeof EN;

const ZH_WORDS: TranscriptWords = {
  prompt: "汇总 input.csv 里的收入。",
  followUp: "加上 south,20，再跑一遍。",
  rows: "3 行",
};

const ZH: HomeCopy = {
  hero: {
    title: ["面向后端的", "Agent runtime。"],
    lead: "一次 API 调用，启动一个带 sandbox 的 Session。用户和界面仍归你的应用。",
    primary: "试用 mosoo",
    windowName: WINDOW_NAME,
    lines: heroLines(ZH_WORDS),
  },
  stage: {
    title: ["一分钟后回复，", "七天后也行。"],
    lead: "sandbox 可能已被回收。文件和对话会从最近的检查点恢复。",
    windowName: WINDOW_NAME,
    ruler: ["+0", "+1 分钟", "+1 小时", "+1 天", "+7 天"],
    lines: stageLines(ZH_WORDS),
  },
  spec: {
    title: ["一个 Session，五个部分。", "harness 按 Session 选择。"],
    rows: {
      harness: "Harness",
      model: "模型",
      sandbox: "Sandbox",
      files: "文件",
      resume: "继续",
    },
    model: "你自己的模型密钥",
    sandbox: "隔离，每个 Session 一个",
    file: "outputs/report.md",
    resume: "一分钟后或七天后",
  },
  faq: {
    title: ["接入之前，", "先问清楚。"],
    items: [
      {
        question: "mosoo 是什么？",
        answer:
          "面向应用后端的开源、API 优先托管 Agent runtime。一个 API 运行 OpenAI Codex、Claude Agent SDK、OpenCode 或 Pi，每个 Session 都有自己的 sandbox。",
      },
      {
        question: "需要先创建 Agent 吗？",
        answer:
          "不需要。在 /api/v2 上，一个请求带上 harness、模型供应商、模型、指令和输入，就启动持久 Session。Agent 预设可选，可再带上技能、MCP 服务器和环境。",
      },
      {
        question: "隔几天再回复，会怎样？",
        answer:
          "回复会在同一个 Session 里继续。如果 sandbox 已被回收，mosoo 会从最近一次提交的检查点恢复工作目录和 harness 的原生对话。运行中的进程不会保留。",
      },
      {
        question: "模型密钥会进入 sandbox 吗？",
        answer:
          "不会。模型供应商密钥和 MCP 凭据留在 sandbox 之外，sandbox 只拿到会过期的授权。环境变量不同：sandbox 里的代码可以读取它们。",
      },
      {
        question: "模型费用由谁支付？",
        answer:
          "由你直接支付。模型密钥属于你的项目，由模型供应商向你的账户计费。mosoo 不提供模型，也不设花费上限。用量显示实测 token 和估算成本，不是账单。",
      },
      {
        question: "mosoo 开源吗？",
        answer:
          "开源，采用 Apache 2.0 许可证，源码在 GitHub。托管控制台在 cloud.mosoo.ai，README 说明了本地开发。mosoo 处于 Alpha 阶段，公开 API 仍可能变化。",
      },
    ],
  },
  closing: {
    title: ["从你的 agent", "启动 Session。"],
    legend: "粘贴给任意 agent",
    prompt: "阅读 mosoo.ai/llms.txt，然后在这里设置 mosoo。",
    copy: "复制",
    copied: "已复制",
    note: "你来登录并添加模型密钥。",
  },
  end: {
    event: "run.completed",
    status: "等待下一轮",
  },
  footer: {
    askTitle: "想看简短版？",
    askLead:
      "让助手概括 mosoo：一个 API，在带 sandbox 的 Session 里运行你的 agent。",
    askPrompt:
      "用中文概括 mosoo（https://mosoo.ai）：面向应用后端的开源 Agent runtime。",
    columns: {
      product: "产品",
      source: "源码",
      company: "公司",
    },
    links: {
      docs: "文档",
      quickstart: "快速开始",
      api: "API 参考",
      pricing: "定价",
      status: "状态",
      github: "GitHub",
      releases: "版本发布",
      license: "Apache-2.0",
      blog: "博客",
      useCases: "用例",
      llms: "llms.txt",
    },
    credit: "© 2026 LangGenius, Inc.",
    language: "语言",
  },
  nav: {
    home: "mosoo 首页",
    docs: "文档",
    blog: "博客",
    github: "GitHub 上的 mosoo",
    signIn: "登录",
    try: "试用 mosoo",
    skip: "跳到正文",
  },
};

const JA_WORDS: TranscriptWords = {
  prompt: "input.csv の売上を合計して。",
  followUp: "south,20 を足して、もう一度。",
  rows: "3 行",
};

const JA: HomeCopy = {
  hero: {
    title: ["バックエンド用の", "Agent runtime。"],
    lead: "API 1 回で、sandbox 付きの Session が始まる。ユーザーと UI はアプリ側。",
    primary: "mosoo を試す",
    windowName: WINDOW_NAME,
    lines: heroLines(JA_WORDS),
  },
  stage: {
    title: ["返信は 1 分後でも", "7 日後でも。"],
    lead: "sandbox が回収されていても、ファイルと会話は最後のチェックポイントから戻ります。",
    windowName: WINDOW_NAME,
    ruler: ["+0", "+1 分", "+1 時間", "+1 日", "+7 日"],
    lines: stageLines(JA_WORDS),
  },
  spec: {
    title: ["1 つの Session、5 つの部品。", "harness は Session ごとに選ぶ。"],
    rows: {
      harness: "Harness",
      model: "モデル",
      sandbox: "Sandbox",
      files: "ファイル",
      resume: "再開",
    },
    model: "ご自身のプロバイダーキー",
    sandbox: "Session ごとに隔離",
    file: "outputs/report.md",
    resume: "1 分後でも 7 日後でも",
  },
  faq: {
    title: ["組み込む前に", "確かめたいこと。"],
    items: [
      {
        question: "mosoo とは何ですか？",
        answer:
          "バックエンド向けの、オープンソースで API ファーストなマネージド Agent runtime です。OpenAI Codex、Claude Agent SDK、OpenCode、Pi を 1 つの API で動かし、Session ごとに専用の sandbox を使います。",
      },
      {
        question: "先に Agent を作る必要はありますか？",
        answer:
          "いいえ。/api/v2 では、harness、プロバイダー、モデル、指示、入力を 1 つのリクエストに含めるだけで、永続的な Session が始まります。保存済みの Agent プリセットは任意で、スキル、MCP サーバー、Environment も持てます。",
      },
      {
        question: "数日後に返信するとどうなりますか？",
        answer:
          "同じ Session で続きます。sandbox が回収されていれば、最後のチェックポイントから作業ディレクトリと harness の会話を復元します。実行中のプロセスは引き継がれません。",
      },
      {
        question: "プロバイダーキーは sandbox に入りますか？",
        answer:
          "入りません。プロバイダーキーと MCP の認証情報は sandbox の外にあり、sandbox が受け取るのは期限付きの許可だけです。環境変数は別で、sandbox 内のコードから読めます。",
      },
      {
        question: "モデルの利用料金は誰が払いますか？",
        answer:
          "お客様が直接支払います。キーはプロジェクトに属し、プロバイダーが請求します。mosoo はモデルを提供せず、支出上限もありません。表示されるコストは推定で、請求書ではありません。",
      },
      {
        question: "mosoo はオープンソースですか？",
        answer:
          "はい。Apache 2.0 ライセンスで、ソースは GitHub にあります。ホスト版のコンソールは cloud.mosoo.ai、ローカル開発の手順は README にあります。mosoo は Alpha 版で、公開 API は変わる可能性があります。",
      },
    ],
  },
  closing: {
    title: ["あなたの agent から", "Session を始める。"],
    legend: "agent に貼り付け",
    prompt: "mosoo.ai/llms.txt を読み、mosoo をセットアップして。",
    copy: "コピー",
    copied: "コピー済み",
    note: "サインインとキーの追加はご自身で。",
  },
  end: {
    event: "run.completed",
    status: "次の turn を待っています",
  },
  footer: {
    askTitle: "要点だけ知りたい？",
    askLead:
      "アシスタントに mosoo を要約してもらう：sandbox 付きの Session で agent を動かす 1 つの API。",
    askPrompt:
      "mosoo（https://mosoo.ai）を日本語で要約して：アプリのバックエンド向けオープンソース Agent runtime。",
    columns: {
      product: "製品",
      source: "ソース",
      company: "会社",
    },
    links: {
      docs: "ドキュメント",
      quickstart: "クイックスタート",
      api: "API リファレンス",
      pricing: "料金",
      status: "稼働状況",
      github: "GitHub",
      releases: "リリース",
      license: "Apache-2.0",
      blog: "ブログ",
      useCases: "ユースケース",
      llms: "llms.txt",
    },
    credit: "© 2026 LangGenius, Inc.",
    language: "言語",
  },
  nav: {
    home: "mosoo ホーム",
    docs: "Docs",
    blog: "ブログ",
    github: "GitHub の mosoo",
    signIn: "ログイン",
    try: "mosoo を試す",
    skip: "本文へ移動",
  },
};

const COPY: Record<Locale, HomeCopy> = { en: EN, zh: ZH, ja: JA };

export const copy: HomeCopy = COPY[locale];
