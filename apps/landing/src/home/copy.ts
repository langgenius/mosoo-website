// Home copy for the v4c "Stage" layout, keyed by the slots in
// mosoo-website-redesign-staging/v4c/UI-LOCK.md (slot ids in the comments).
//
// Written last, to the slot sizes of the locked UI: a string that does not fit is rewritten, never given a
// new slot. Product statements are checked against langgenius/mosoo (file:line in the v4c CHANGELOG);
// the feed is the SPEC's own acceptance story (docs/SPEC.md L82, CSV analysis, multi-turn) and its event
// names are the contract's (pkgs/contracts/src/session/session.contract.ts L138-L152). zh and ja use the
// same slots, as short as they allow; names (runtimes, events, files, assistants) are not translated.

export type HomeLocale = "en" | "zh" | "ja";

export type FaqItem = { q: string; a: string };

export type FeedCard = {
  /** C: relative time, 1x8, Fragment Mono 12. */
  time: string;
  /** D: event name from MAIN pkgs/contracts/src/session/session.contract.ts, 1x22. */
  event: string;
  /** E: 1x42, Inter 15/600. */
  title: string;
  /** F: 1x48, Inter 13. */
  result: string;
  live?: boolean;
};

export type HomeCopy = {
  /** title: the page title. description: the README L8-L9 positioning (meta description, JSON-LD). */
  meta: { title: string; description: string };
  /** N1-N3. docsHref is the localized docs root (not a slot). */
  nav: { docs: string; docsHref: string; github: string; cta: string; skip: string };
  hero: {
    /** S1-A / S1-B: H1, two lines, 1x22 each, display 78. */
    lineA: string;
    lineB: string;
    /** S1-C: 2x44 (<=14 words), Inter 19. */
    lead: string;
    /** S1-D: 1x12, ink pill. */
    cta: string;
  };
  act1: {
    /** S2.1-A: 2x36 two-value title, display 40 (second part ink-3). */
    titleA: string;
    titleB: string;
    /** S2.1-B: row labels x5, 1x12. */
    rows: readonly [string, string, string, string, string];
    /** S2.1-C: harness names, 1x18 each, rotated in this order. */
    harnesses: readonly [string, string, string, string];
    /** S2.1-D: the other four values, 1x40 each (Files is one mono token). */
    model: string;
    sandbox: string;
    files: string;
    resume: string;
  };
  act2: {
    /** S2.2-A: 1x13, display 64. S2.2-B: 1x17. */
    halfA: string;
    halfB: string;
    /** S2.2-C..F: five cards, newest first (at most 14 object words a card, UI-FORMS §g.2). */
    cards: readonly FeedCard[];
  };
  act3: {
    /** S2.3-A: 2x36 two-value title, display 40 on night. */
    titleA: string;
    titleB: string;
    /** S2.3-L: tick labels x5, 1x10, Fragment Mono 11 uppercase. */
    ticks: readonly [string, string, string, string, string];
    /** S2.3-B: 1x60; the first sentence is set in 500. */
    noteStrong: string;
    note: string;
  };
  statement: {
    /** S3-A: 3x26 (<=84 chars, <=16 words) around four glyph circles (G). Each of the first four parts is
     *  followed by its glyph; a trailing comma (, 、) moves after the glyph. */
    parts: readonly [string, string, string, string, string];
  };
  faq: {
    /** S4-A: 1x10, display 44. */
    title: string;
    /** S4-B: question 1-2x44; S4-C: answer <=40 words. Exactly six. */
    items: readonly FaqItem[];
  };
  closing: {
    /** S5-A: 2x18, display 48. */
    lineA: string;
    lineB: string;
    /** S5-B legend 1x18; S5-C instruction 1x56; S5-D button 1x8; S5-E fine print 1x40. */
    legend: string;
    prompt: string;
    copy: string;
    copied: string;
    fine: string;
  };
  footer: {
    /** S6-A: 1x24, display 32. S6-B: 2x55. S6-C: assistant pills, 1x14 each. */
    askTitle: string;
    askNote: string;
    askPrompt: string;
    links: readonly { label: string; href: string }[];
    languageLabel: string;
    credit: string;
  };
};

const CONSOLE = "https://cloud.mosoo.ai";
const GITHUB = "https://github.com/langgenius/mosoo";
const DOCS = "https://mosoo.ai/docs/";

const footerLinks = (docs: string, blog: string, labels: readonly string[]) =>
  [
    { label: labels[0] ?? "", href: docs },
    { label: labels[1] ?? "", href: `${docs}api-reference-v2/` },
    { label: labels[2] ?? "", href: GITHUB },
    { label: labels[3] ?? "", href: blog },
    { label: labels[4] ?? "", href: "/use-cases" },
    { label: labels[5] ?? "", href: "/pricing" },
    { label: labels[6] ?? "", href: "/status" },
  ] as const;

const EN: HomeCopy = {
  meta: {
    title: "Open-source Agent runtime for application backends | mosoo",
    // README L8-L9 (decision 7).
    description:
      "An open-source, API-first managed Agent runtime for application backends. Run OpenAI Codex, Claude Agent SDK, OpenCode, and Pi behind one API, each Session in its own sandbox.",
  },
  nav: { docs: "Docs", docsHref: DOCS, github: "GitHub", cta: "Try mosoo", skip: "Skip to content" },
  hero: {
    lineA: "Agent Sessions",
    lineB: "for your backend.",
    lead: "One request starts a Session in its own sandbox. Events and files come back.",
    cta: "Try mosoo",
  },
  act1: {
    titleA: "One Session, five parts.",
    titleB: "Pick one of four harnesses.",
    rows: ["Harness", "Model", "Sandbox", "Files", "Resume"],
    harnesses: ["OpenAI Codex", "Claude Agent SDK", "OpenCode", "Pi"],
    model: "Your pick, on your own provider key",
    sandbox: "Its own. Provider keys stay outside.",
    files: "outputs/report.md",
    resume: "A minute or seven days later",
  },
  act2: {
    halfA: "Same Session,",
    halfB: "a week later.",
    cards: [
      { time: "+7 days", event: "run.started", title: "Follow-up: add Q3", result: "Files and conversation restored.", live: true },
      { time: "+3 min", event: "run.completed", title: "Turn 1 done", result: "Checkpoint saved. The sandbox can be reclaimed." },
      { time: "+2 min", event: "session_files.updated", title: "outputs/report.md written", result: "Ready to download as an artifact." },
      { time: "+1 min", event: "tool.use.completed", title: "python analyze.py", result: "Exit code 0." },
      { time: "+0", event: "run.started", title: "Analyze input.csv", result: "OpenAI Codex starts in a fresh sandbox." },
    ],
  },
  act3: {
    titleA: "Reply a minute or seven days later.",
    titleB: "Same Session.",
    ticks: ["+0", "+1 min", "+1 hour", "+1 day", "+7 days"],
    noteStrong: "Sandbox gone, Session kept.",
    note: "Files and conversation return.",
  },
  statement: {
    parts: ["Run Codex,", "Claude Agent SDK,", "OpenCode", "or Pi", "behind one API, one sandbox each."],
  },
  faq: {
    title: "FAQs",
    items: [
      {
        q: "Is it hosted, or do I run it myself?",
        a: "The quickest way is the hosted console at cloud.mosoo.ai. The source is on GitHub under Apache-2.0, and the README explains how to run it locally for development.",
      },
      {
        q: "Do I need to create an Agent first?",
        a: "No. On /api/v2 one request carries the harness, provider, model, instructions and input. A saved Agent preset is optional; you need one to attach Skills, MCP servers or a non-default Environment.",
      },
      {
        q: "Why not call a model API directly?",
        a: "A model call returns tokens. A Session runs a whole Agent turn: the harness, its tools and files in a sandbox, saved events, and a checkpoint you can continue from.",
      },
      {
        q: "What is Pi?",
        a: "One of the four runtimes, next to OpenAI Codex, Claude Agent SDK and OpenCode. Its API id is pi and it takes text input only. You pick the runtime per Session.",
      },
      {
        q: "Who pays for model usage?",
        a: "You do, directly. Model keys belong to your Project and the provider bills your account. mosoo supplies no models and sets no spending cap.",
      },
      {
        q: "Do my keys enter the sandbox?",
        a: "No. Provider keys and MCP credentials never enter it; the sandbox gets only expiring grants for them. Environment variables are different: code in the sandbox can read them.",
      },
    ],
  },
  closing: {
    lineA: "Start a Session",
    lineB: "from your agent.",
    legend: "Paste to any agent",
    prompt: "Read https://mosoo.ai/llms.txt and set up mosoo here.",
    copy: "Copy",
    copied: "Copied",
    fine: "Works in Claude Code, Codex and Cursor.",
  },
  footer: {
    askTitle: "Want the short version?",
    askNote: "Ask an assistant to summarize mosoo, with links back to the docs and the repo.",
    askPrompt:
      "Summarize mosoo (https://mosoo.ai) for a backend developer: what it runs, how a Session works, and where the docs are.",
    links: footerLinks(DOCS, "https://mosoo.ai/blog", [
      "Docs",
      "API reference",
      "GitHub",
      "Blog",
      "Use cases",
      "Pricing",
      "Status",
    ]),
    languageLabel: "Language",
    credit: "© 2026 LangGenius, Inc.",
  },
};

const ZH_DOCS = "https://mosoo.ai/docs/zh-Hans/";

const ZH: HomeCopy = {
  meta: {
    title: "面向应用后端的开源 Agent runtime | mosoo",
    description:
      "开源、API 优先的托管 Agent runtime，面向应用后端。用一个 API 运行 OpenAI Codex、Claude Agent SDK、OpenCode 和 Pi，每个 Session 都在自己的 sandbox 里。",
  },
  nav: { docs: "文档", docsHref: ZH_DOCS, github: "GitHub", cta: "试用 mosoo", skip: "跳到正文" },
  hero: {
    lineA: "Agent Session，",
    lineB: "给你的后端。",
    lead: "一个请求启动一个 Session，运行在它自己的 sandbox 里。事件和文件随后返回。",
    cta: "试用 mosoo",
  },
  act1: {
    titleA: "一个 Session，五个部分。",
    titleB: "四种 harness 任选其一。",
    rows: ["Harness", "模型", "Sandbox", "文件", "续跑"],
    harnesses: ["OpenAI Codex", "Claude Agent SDK", "OpenCode", "Pi"],
    model: "自选模型，用你自己的服务商密钥",
    sandbox: "独享一个，服务商密钥留在外面",
    files: "outputs/report.md",
    resume: "一分钟后或七天后都可以",
  },
  act2: {
    halfA: "同一个 Session，",
    halfB: "一周之后。",
    cards: [
      { time: "+7 天", event: "run.started", title: "追问：补上 Q3", result: "文件和对话都已恢复。", live: true },
      { time: "+3 分钟", event: "run.completed", title: "第 1 轮完成", result: "检查点已保存，sandbox 可以回收。" },
      { time: "+2 分钟", event: "session_files.updated", title: "已写入 outputs/report.md", result: "可作为产物下载。" },
      { time: "+1 分钟", event: "tool.use.completed", title: "python analyze.py", result: "退出码 0。" },
      { time: "+0", event: "run.started", title: "分析 input.csv", result: "OpenAI Codex 在新的 sandbox 里启动。" },
    ],
  },
  act3: {
    titleA: "一分钟后或七天后回复，",
    titleB: "还是同一个 Session。",
    ticks: ["+0", "+1 分钟", "+1 小时", "+1 天", "+7 天"],
    noteStrong: "sandbox 已回收，Session 还在。",
    note: "文件和对话都会回来。",
  },
  statement: {
    parts: ["用一个 API 运行 Codex、", "Claude Agent SDK、", "OpenCode", " 或 Pi", "，各有自己的 sandbox。"],
  },
  faq: {
    title: "常见问题",
    items: [
      {
        q: "是托管服务，还是要自己运行？",
        a: "最快的方式是使用 cloud.mosoo.ai 的托管控制台。源码以 Apache-2.0 发布在 GitHub，README 说明了如何在本地运行以便开发。",
      },
      {
        q: "需要先创建 Agent 吗？",
        a: "不需要。在 /api/v2 上，一个请求就带上 harness、服务商、模型、指令和输入。保存的 Agent 预设是可选的；要挂 Skills、MCP 服务器或非默认 Environment 时才需要。",
      },
      {
        q: "为什么不直接调用模型 API？",
        a: "模型调用只返回 token。Session 运行完整的一轮 Agent：harness、它在 sandbox 里的工具和文件、保存下来的事件，以及可以接着跑的检查点。",
      },
      {
        q: "Pi 是什么？",
        a: "四个 runtime 之一，另外三个是 OpenAI Codex、Claude Agent SDK 和 OpenCode。它的 API id 是 pi，只接受文本输入。runtime 按 Session 选择。",
      },
      {
        q: "模型用量由谁付费？",
        a: "你直接付费。模型密钥属于你的 Project，由服务商向你的账户计费。mosoo 不提供模型，也不设消费上限。",
      },
      {
        q: "我的密钥会进入 sandbox 吗？",
        a: "不会。服务商密钥和 MCP 凭据从不进入 sandbox，它只拿到会过期的授权。Environment 变量不同：sandbox 里的代码可以读取。",
      },
    ],
  },
  closing: {
    lineA: "在你的编码助手里",
    lineB: "开始一个 Session。",
    legend: "粘贴给编码助手",
    prompt: "读取 https://mosoo.ai/llms.txt，在这里配置 mosoo。",
    copy: "复制",
    copied: "已复制",
    fine: "适用于 Claude Code、Codex 和 Cursor。",
  },
  footer: {
    askTitle: "想看简短版本？",
    askNote: "让 AI 助手概括 mosoo，并附上文档和代码仓库的链接。",
    askPrompt: "请为后端开发者概括 mosoo（https://mosoo.ai）：它运行什么、Session 如何工作、文档在哪里。",
    links: footerLinks(ZH_DOCS, "https://mosoo.ai/blog/zh", [
      "文档",
      "API 参考",
      "GitHub",
      "博客",
      "使用案例",
      "定价",
      "状态",
    ]),
    languageLabel: "语言",
    credit: "© 2026 LangGenius, Inc.",
  },
};

const JA_DOCS = "https://mosoo.ai/docs/ja/";

const JA: HomeCopy = {
  meta: {
    title: "アプリのバックエンド向けオープンソース Agent runtime | mosoo",
    description:
      "アプリケーションのバックエンドのための、オープンソースで API ファーストなマネージド Agent runtime。OpenAI Codex、Claude Agent SDK、OpenCode、Pi を 1 つの API で実行し、Session ごとに専用の sandbox を使います。",
  },
  nav: { docs: "ドキュメント", docsHref: JA_DOCS, github: "GitHub", cta: "mosoo を試す", skip: "本文へスキップ" },
  hero: {
    lineA: "Agent Session を、",
    lineB: "バックエンドへ。",
    lead: "1 回のリクエストで、専用の sandbox で Session が始まります。イベントとファイルが返ってきます。",
    cta: "mosoo を試す",
  },
  act1: {
    titleA: "1 つの Session、5 つの要素。",
    titleB: "harness は 4 種から選べます。",
    rows: ["Harness", "モデル", "Sandbox", "ファイル", "再開"],
    harnesses: ["OpenAI Codex", "Claude Agent SDK", "OpenCode", "Pi"],
    model: "選んだモデルを自分のプロバイダーキーで",
    sandbox: "専用。プロバイダーキーは外に置く",
    files: "outputs/report.md",
    resume: "1 分後でも 7 日後でも",
  },
  act2: {
    halfA: "同じ Session、",
    halfB: "1 週間後に。",
    cards: [
      { time: "+7 日", event: "run.started", title: "追加の依頼：Q3 を足して", result: "ファイルと会話を復元。", live: true },
      { time: "+3 分", event: "run.completed", title: "ターン 1 完了", result: "チェックポイントを保存。sandbox は回収可。" },
      { time: "+2 分", event: "session_files.updated", title: "outputs/report.md を書き出し", result: "成果物としてダウンロードできます。" },
      { time: "+1 分", event: "tool.use.completed", title: "python analyze.py", result: "終了コード 0。" },
      { time: "+0", event: "run.started", title: "input.csv を分析", result: "OpenAI Codex が新しい sandbox で起動。" },
    ],
  },
  act3: {
    titleA: "1 分後でも 7 日後でも返信できます。",
    titleB: "同じ Session のまま。",
    ticks: ["+0", "+1 分", "+1 時間", "+1 日", "+7 日"],
    noteStrong: "sandbox は回収、Session は継続。",
    note: "ファイルも会話も戻ります。",
  },
  statement: {
    parts: ["1 つの API で Codex、", "Claude Agent SDK、", "OpenCode、", "Pi", "を、それぞれ専用の sandbox で。"],
  },
  faq: {
    title: "よくある質問",
    items: [
      {
        q: "ホスト型ですか、自分で動かすものですか？",
        a: "いちばん早いのは cloud.mosoo.ai のホスト型コンソールです。ソースは Apache-2.0 で GitHub にあり、開発用にローカルで動かす方法は README にあります。",
      },
      {
        q: "先に Agent を作成する必要はありますか？",
        a: "いいえ。/api/v2 では 1 回のリクエストで harness、プロバイダー、モデル、指示、入力を渡せます。保存した Agent プリセットは任意で、Skills や MCP サーバーを付けるときに使います。",
      },
      {
        q: "モデル API を直接呼ぶのと何が違いますか？",
        a: "モデル呼び出しが返すのはトークンです。Session は Agent の 1 ターンを丸ごと実行します。sandbox 内の harness、ツール、ファイル、保存されたイベント、再開できるチェックポイントまで。",
      },
      {
        q: "Pi とは何ですか？",
        a: "4 つの runtime のひとつで、ほかは OpenAI Codex、Claude Agent SDK、OpenCode です。API id は pi で、入力はテキストのみ。runtime は Session ごとに選びます。",
      },
      {
        q: "モデルの利用料は誰が払いますか？",
        a: "あなたが直接支払います。モデルキーはあなたの Project に属し、プロバイダーがあなたのアカウントに請求します。mosoo はモデルを提供せず、利用上限も設けません。",
      },
      {
        q: "キーは sandbox に入りますか？",
        a: "いいえ。プロバイダーキーと MCP の認証情報は sandbox に入らず、渡るのは期限付きの許可だけです。ただし Environment 変数は sandbox 内のコードから読めます。",
      },
    ],
  },
  closing: {
    lineA: "エージェントから",
    lineB: "Session を始める。",
    legend: "エージェントに貼る",
    prompt: "https://mosoo.ai/llms.txt を読んで、ここで mosoo を設定して。",
    copy: "コピー",
    copied: "コピー済み",
    fine: "Claude Code、Codex、Cursor で使えます。",
  },
  footer: {
    askTitle: "要点だけ知りたい？",
    askNote: "AI アシスタントに mosoo を要約してもらえます。ドキュメントとリポジトリへのリンク付き。",
    askPrompt:
      "バックエンド開発者向けに mosoo（https://mosoo.ai）を要約してください：何を動かすのか、Session の仕組み、ドキュメントの場所。",
    links: footerLinks(JA_DOCS, "https://mosoo.ai/blog/ja", [
      "ドキュメント",
      "API リファレンス",
      "GitHub",
      "ブログ",
      "ユースケース",
      "料金",
      "ステータス",
    ]),
    languageLabel: "言語",
    credit: "© 2026 LangGenius, Inc.",
  },
};

export const HOME_COPY: Record<HomeLocale, HomeCopy> = { en: EN, zh: ZH, ja: JA };

export const LINKS = { console: CONSOLE, github: GITHUB, docs: DOCS } as const;
