// Home page copy for the crawlable static HTML in /en, /zh and /ja: the
// fallback that non-JS crawlers and coding agents read inside #root, and the
// JSON-LD @graph. React replaces #root on mount, so this is what a reader sees
// without JavaScript.
//
// It mirrors the instrument home (v4a): the same sections, anchors and copy as
// apps/landing/src/routes/login/landing/home-copy.ts, in the same order, and
// the same slots (v4a/UI-LOCK.md §3). The FAQ strings are the exact strings
// the FAQPage JSON-LD and llms.txt carry, and the React FAQ shows the same
// text (tests/site-seo.test.mjs). Do not add facts here that the main repo
// does not state.

const SITE = "https://mosoo.ai";
const CONSOLE = "https://cloud.mosoo.ai";
const GITHUB = "https://github.com/langgenius/mosoo";

const LINKS = {
  console: CONSOLE,
  signIn: `${CONSOLE}/login`,
  github: GITHUB,
  releases: `${GITHUB}/releases`,
  license: `${GITHUB}/blob/main/LICENSE`,
  llms: `${SITE}/llms.txt`,
  x: "https://x.com/mosooagent",
};

// The four harnesses by runtime catalog id (langgenius/mosoo
// pkgs/runtime-catalog/src/catalog.ts), with the README's display names.
const RUNTIMES = [
  { name: "OpenAI Codex", id: "openai-runtime" },
  { name: "Claude Agent SDK", id: "claude-agent-sdk" },
  { name: "OpenCode", id: "acp-fallback" },
  { name: "Pi", id: "pi" },
];

const LANGUAGES = [
  { locale: "en", lang: "en", label: "English" },
  { locale: "zh", lang: "zh-CN", label: "简体中文" },
  { locale: "ja", lang: "ja", label: "日本語" },
];

// The assistants of the footer's "short version" row, each opened with a
// prefilled question (the same list as footer.tsx).
const ASSISTANTS = [
  ["ChatGPT", (q) => `https://chatgpt.com/?q=${q}`],
  ["Claude", (q) => `https://claude.ai/new?q=${q}`],
  ["Perplexity", (q) => `https://www.perplexity.ai/search?q=${q}`],
  ["Gemini", (q) => `https://www.google.com/search?udm=50&q=${q}`],
];

const WINDOW_NAME = "claude-agent-sdk";

const FAQ = {
  en: [
    {
      q: "What is mosoo?",
      a: "An open-source, API-first managed Agent runtime for application backends. One API runs OpenAI Codex, Claude Agent SDK, OpenCode or Pi, each Session in its own sandbox.",
    },
    {
      q: "Is mosoo open source?",
      a: "Yes, under Apache 2.0, with the source on GitHub. The hosted console runs at cloud.mosoo.ai, and the README explains local development. mosoo is in Alpha, so public APIs may still change.",
    },
    {
      q: "Do I need to create an Agent first?",
      a: "No. On /api/v2 one request carries the harness, provider, model, instructions and input, and starts a durable Session. A saved Agent preset is optional; it also carries Skills, MCP servers and an Environment.",
    },
    {
      q: "What happens when I reply days later?",
      a: "The reply continues the same Session. If the sandbox was reclaimed, mosoo restores the working directory and the native conversation from the last committed checkpoint. Live processes are not carried over.",
    },
    {
      q: "Do my provider keys enter the sandbox?",
      a: "No. Provider keys and MCP credentials stay outside; the sandbox gets only expiring grants for them. Environment variables are different: code in the sandbox can read them.",
    },
    {
      q: "Who pays for model usage?",
      a: "You do, directly. Provider keys belong to your Project, and the provider bills your account. mosoo supplies no models and sets no spending cap. Usage shows measured tokens and cost estimates, not invoices.",
    },
  ],
  zh: [
    {
      q: "mosoo 是什么？",
      a: "面向应用后端的开源、API 优先托管 Agent runtime。一个 API 运行 OpenAI Codex、Claude Agent SDK、OpenCode 或 Pi，每个 Session 都有自己的 sandbox。",
    },
    {
      q: "mosoo 开源吗？",
      a: "开源，采用 Apache 2.0 许可证，源码在 GitHub。托管控制台在 cloud.mosoo.ai，README 说明了本地开发。mosoo 处于 Alpha 阶段，公开 API 仍可能变化。",
    },
    {
      q: "需要先创建 Agent 吗？",
      a: "不需要。在 /api/v2 上，一个请求带上 harness、模型供应商、模型、指令和输入，就启动持久 Session。Agent 预设可选，可再带上技能、MCP 服务器和环境。",
    },
    {
      q: "隔几天再回复，会怎样？",
      a: "回复会在同一个 Session 里继续。如果 sandbox 已被回收，mosoo 会从最近一次提交的检查点恢复工作目录和 harness 的原生对话。运行中的进程不会保留。",
    },
    {
      q: "模型密钥会进入 sandbox 吗？",
      a: "不会。模型供应商密钥和 MCP 凭据留在 sandbox 之外，sandbox 只拿到会过期的授权。环境变量不同：sandbox 里的代码可以读取它们。",
    },
    {
      q: "模型费用由谁支付？",
      a: "由你直接支付。模型密钥属于你的项目，由模型供应商向你的账户计费。mosoo 不提供模型，也不设花费上限。用量显示实测 token 和估算成本，不是账单。",
    },
  ],
  ja: [
    {
      q: "mosoo とは何ですか？",
      a: "バックエンド向けの、オープンソースで API ファーストなマネージド Agent runtime です。OpenAI Codex、Claude Agent SDK、OpenCode、Pi を 1 つの API で動かし、Session ごとに専用の sandbox を使います。",
    },
    {
      q: "mosoo はオープンソースですか？",
      a: "はい。Apache 2.0 ライセンスで、ソースは GitHub にあります。ホスト版のコンソールは cloud.mosoo.ai、ローカル開発の手順は README にあります。mosoo は Alpha 版で、公開 API は変わる可能性があります。",
    },
    {
      q: "先に Agent を作る必要はありますか？",
      a: "いいえ。/api/v2 では、harness、プロバイダー、モデル、指示、入力を 1 つのリクエストに含めるだけで、永続的な Session が始まります。保存済みの Agent プリセットは任意で、スキル、MCP サーバー、Environment も持てます。",
    },
    {
      q: "数日後に返信するとどうなりますか？",
      a: "同じ Session で続きます。sandbox が回収されていれば、最後のチェックポイントから作業ディレクトリと harness の会話を復元します。実行中のプロセスは引き継がれません。",
    },
    {
      q: "プロバイダーキーは sandbox に入りますか？",
      a: "入りません。プロバイダーキーと MCP の認証情報は sandbox の外にあり、sandbox が受け取るのは期限付きの許可だけです。環境変数は別で、sandbox 内のコードから読めます。",
    },
    {
      q: "モデルの利用料金は誰が払いますか？",
      a: "お客様が直接支払います。キーはプロジェクトに属し、プロバイダーが請求します。mosoo はモデルを提供せず、支出上限もありません。表示されるコストは推定で、請求書ではありません。",
    },
  ],
};

// Per-locale copy, slot for slot the strings of home-copy.ts. `join` is the
// separator between the two values of a heading: a space in English, none
// after CJK punctuation.
const COPY = {
  en: {
    lang: "en",
    join: " ",
    docs: `${SITE}/docs/`,
    quickstart: `${SITE}/docs/quickstart/`,
    apiReferenceV2: `${SITE}/docs/api-reference-v2/`,
    blog: `${SITE}/blog`,
    health: "/health",
    // README L8, the positioning line the meta and JSON-LD descriptions lead with.
    positioning: "An open-source, API-first managed Agent runtime for application backends.",
    nav: {
      home: "mosoo home",
      docs: "Docs",
      blog: "Blog",
      github: "mosoo on GitHub",
      signIn: "Sign in",
      try: "Try mosoo",
      skip: "Skip to content",
    },
    hero: {
      title: ["The Agent runtime", "for your backend."],
      lead: "One API call starts a sandboxed Session. Codex, Claude Agent SDK, OpenCode or Pi.",
    },
    transcript: {
      prompt: "Total the revenue in input.csv.",
      followUp: "Add south,20 and run it again.",
      rows: "3 rows",
    },
    stage: {
      title: ["Reply in a minute", "or in seven days."],
      lead: "The sandbox may be reclaimed. Files and conversation come back from the last checkpoint.",
    },
    spec: {
      title: ["One Session, five parts.", "Choose the harness per Session."],
      rows: ["Harness", "Model", "Sandbox", "Files", "Resume"],
      model: "Your provider key",
      sandbox: "Isolated, one per Session",
      resume: "A minute or seven days later",
    },
    faqTitle: ["Questions", "before you wire it in."],
    closing: {
      title: ["Start a Session", "from your agent."],
      legend: "Paste to any agent",
      prompt: "Read mosoo.ai/llms.txt, then set up mosoo here.",
      note: "You sign in and add a provider key.",
    },
    end: { status: "waiting for the next turn" },
    footer: {
      askTitle: "Want the short version?",
      askLead: "Ask an assistant to sum up mosoo: one API that runs your agent in a sandboxed Session.",
      askPrompt: "Summarize mosoo (https://mosoo.ai), the open-source Agent runtime for app backends.",
      columns: ["Product", "Source", "Company"],
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
      language: "Language",
    },
    jsonLd: {
      description:
        "An open-source, API-first managed Agent runtime for application backends. It runs OpenAI Codex, Claude Agent SDK, OpenCode, and Pi behind one API, each Session in its own sandbox.",
      help: `${SITE}/docs/`,
      features: [
        "Start a Session without creating an Agent",
        "Choose OpenAI Codex, Claude Agent SDK, OpenCode, or Pi per Session",
        "Continue the same Session minutes or days later",
        "A turn succeeds only when its events, usage, and a checkpoint are committed",
        "Provider keys and MCP credentials stay outside the sandbox",
        "Input attachments, downloadable artifacts, and SSE event streams",
        "Bring your own model provider keys",
        "Usage recorded for every model call",
      ],
    },
  },
  zh: {
    lang: "zh-CN",
    join: "",
    docs: `${SITE}/docs/zh-Hans/`,
    quickstart: `${SITE}/docs/zh-Hans/quickstart/`,
    apiReferenceV2: `${SITE}/docs/zh-Hans/api-reference-v2/`,
    blog: `${SITE}/blog/zh`,
    health: "/zh/health",
    positioning: "开源、API 优先的托管 Agent runtime，面向应用后端。",
    nav: {
      home: "mosoo 首页",
      docs: "文档",
      blog: "博客",
      github: "GitHub 上的 mosoo",
      signIn: "登录",
      try: "试用 mosoo",
      skip: "跳到正文",
    },
    hero: {
      title: ["面向后端的", "Agent runtime。"],
      lead: "一次 API 调用，启动一个带 sandbox 的 Session。Codex、Claude Agent SDK、OpenCode 或 Pi。",
    },
    transcript: {
      prompt: "汇总 input.csv 里的收入。",
      followUp: "加上 south,20，再跑一遍。",
      rows: "3 行",
    },
    stage: {
      title: ["一分钟后回复，", "七天后也行。"],
      lead: "sandbox 可能已被回收。文件和对话会从最近的检查点恢复。",
    },
    spec: {
      title: ["一个 Session，五个部分。", "harness 按 Session 选择。"],
      rows: ["Harness", "模型", "Sandbox", "文件", "继续"],
      model: "你自己的模型密钥",
      sandbox: "隔离，每个 Session 一个",
      resume: "一分钟后或七天后",
    },
    faqTitle: ["接入之前，", "先问清楚。"],
    closing: {
      title: ["从你的 agent", "启动 Session。"],
      legend: "粘贴给任意 agent",
      prompt: "阅读 mosoo.ai/llms.txt，然后在这里设置 mosoo。",
      note: "你来登录并添加模型密钥。",
    },
    end: { status: "等待下一轮" },
    footer: {
      askTitle: "想看简短版？",
      askLead: "让助手概括 mosoo：一个 API，在带 sandbox 的 Session 里运行你的 agent。",
      askPrompt: "用中文概括 mosoo（https://mosoo.ai）：面向应用后端的开源 Agent runtime。",
      columns: ["产品", "源码", "公司"],
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
      language: "语言",
    },
    jsonLd: {
      description:
        "开源、API 优先的托管 Agent runtime，面向应用后端。它用一个 API 运行 OpenAI Codex、Claude Agent SDK、OpenCode 和 Pi，每个 Session 都在自己的 sandbox 中执行。",
      help: `${SITE}/docs/zh-Hans/`,
      features: [
        "无需创建 Agent 即可启动 Session",
        "每个 Session 可选 OpenAI Codex、Claude Agent SDK、OpenCode 或 Pi",
        "几分钟或几天后在同一个 Session 中继续",
        "事件、用量和检查点一起提交后，turn 才算成功",
        "模型供应商密钥和 MCP 凭据留在 sandbox 之外",
        "输入附件、可下载的产出物和 SSE 事件流",
        "使用你自己的模型供应商密钥",
        "每次模型调用都记录用量",
      ],
    },
  },
  ja: {
    lang: "ja",
    join: "",
    docs: `${SITE}/docs/ja/`,
    quickstart: `${SITE}/docs/ja/quickstart/`,
    apiReferenceV2: `${SITE}/docs/ja/api-reference-v2/`,
    blog: `${SITE}/blog/ja`,
    health: "/ja/health",
    positioning:
      "アプリケーションのバックエンドのための、オープンソースで API ファーストなマネージド Agent runtime。",
    nav: {
      home: "mosoo ホーム",
      docs: "Docs",
      blog: "ブログ",
      github: "GitHub の mosoo",
      signIn: "ログイン",
      try: "mosoo を試す",
      skip: "本文へ移動",
    },
    hero: {
      title: ["バックエンド用の", "Agent runtime。"],
      lead: "API 1 回で、sandbox 付きの Session が始まる。Codex、Claude Agent SDK、OpenCode、Pi。",
    },
    transcript: {
      prompt: "input.csv の売上を合計して。",
      followUp: "south,20 を足して、もう一度。",
      rows: "3 行",
    },
    stage: {
      title: ["返信は 1 分後でも", "7 日後でも。"],
      lead: "sandbox が回収されていても、ファイルと会話は最後のチェックポイントから戻ります。",
    },
    spec: {
      title: ["1 つの Session、5 つの部品。", "harness は Session ごとに選ぶ。"],
      rows: ["Harness", "モデル", "Sandbox", "ファイル", "再開"],
      model: "ご自身のプロバイダーキー",
      sandbox: "Session ごとに隔離",
      resume: "1 分後でも 7 日後でも",
    },
    faqTitle: ["組み込む前に", "確かめたいこと。"],
    closing: {
      title: ["あなたの agent から", "Session を始める。"],
      legend: "agent に貼り付け",
      prompt: "mosoo.ai/llms.txt を読み、mosoo をセットアップして。",
      note: "サインインとキーの追加はご自身で。",
    },
    end: { status: "次の turn を待っています" },
    footer: {
      askTitle: "要点だけ知りたい？",
      askLead:
        "アシスタントに mosoo を要約してもらう：sandbox 付きの Session で agent を動かす 1 つの API。",
      askPrompt:
        "mosoo（https://mosoo.ai）を日本語で要約して：アプリのバックエンド向けオープンソース Agent runtime。",
      columns: ["製品", "ソース", "会社"],
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
      language: "言語",
    },
    jsonLd: {
      description:
        "アプリケーションのバックエンドのための、オープンソースで API ファーストなマネージド Agent runtime。OpenAI Codex、Claude Agent SDK、OpenCode、Pi を 1 つの API で実行し、Session ごとに専用の sandbox を使います。",
      help: `${SITE}/docs/ja/`,
      features: [
        "Agent を作成せずに Session を開始",
        "Session ごとに OpenAI Codex、Claude Agent SDK、OpenCode、Pi から選択",
        "数分後でも数日後でも同じ Session で続行",
        "イベント、使用量、チェックポイントがコミットされて初めて turn が成功",
        "プロバイダーキーと MCP の認証情報は sandbox の外",
        "入力の添付ファイル、ダウンロードできる成果物、SSE イベントストリーム",
        "ご自身のモデルプロバイダーキーを使用",
        "モデル呼び出しごとに使用量を記録",
      ],
    },
  },
};

export const HOME_LOCALES = Object.keys(COPY);

function copyFor(locale) {
  const copy = COPY[locale];
  if (!copy) throw new Error(`Unsupported home locale: ${locale}`);
  return copy;
}

export function homeFaq(locale) {
  copyFor(locale);
  return FAQ[locale];
}

/** The h1 as a reader sees it: its two values. */
export function homeHeadline(locale) {
  return copyFor(locale).hero.title.join(" ");
}

/** README L8 in the locale: what the descriptions lead with. */
export function homePositioning(locale) {
  return copyFor(locale).positioning;
}

// The two transcripts render the main repo's Session acceptance workflow
// (scripts/public-api-session-workflow.ts), as transcript-card.tsx does.
function heroTranscript(copy) {
  const words = copy.transcript;
  return [
    ["prompt", words.prompt],
    ["step", "Read", "input.csv", words.rows],
    ["step", "Bash", "python report.py"],
  ];
}

function stageTranscript(copy) {
  const words = copy.transcript;
  return [
    ["prompt", words.prompt],
    ["step", "Read", "input.csv", words.rows],
    ["step", "Bash", "python report.py", "grand_total 230"],
    ["step", "Write", "outputs/report.md", "session_files.updated"],
    ["gap"],
    ["prompt", words.followUp],
    ["step", "Bash", "python report.py", "grand_total 250"],
    ["step", "Write", "outputs/report.md", "run.completed"],
  ];
}

/**
 * Every visible string of the static home that home-copy.ts must carry too
 * (the drift check in tests/site-seo.test.mjs).
 */
export function homeCopyStrings(locale) {
  const copy = copyFor(locale);
  return [
    ...copy.hero.title,
    copy.hero.lead,
    ...Object.values(copy.transcript),
    ...copy.stage.title,
    copy.stage.lead,
    ...copy.spec.title,
    ...copy.spec.rows,
    copy.spec.model,
    copy.spec.sandbox,
    copy.spec.resume,
    ...copy.faqTitle,
    ...copy.closing.title,
    copy.closing.legend,
    copy.closing.prompt,
    copy.closing.note,
    copy.end.status,
    copy.footer.askTitle,
    copy.footer.askLead,
    copy.footer.askPrompt,
    ...copy.footer.columns,
    ...Object.values(copy.footer.links),
    ...Object.values(copy.nav),
  ];
}

// ---------------------------------------------------------------------------
// HTML

const escapeText = (value) =>
  String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const escapeAttribute = (value) => escapeText(value).replaceAll('"', "&quot;");

// FAQ answers stay plain text so the visible answer and the FAQPage JSON-LD
// carry identical text content; code styling and one link are markup only.
const FAQ_CODE = /\/api\/v[12]\b|outputs\//g;
function faqAnswer(value) {
  return escapeText(value)
    .replace(FAQ_CODE, (token) => `<code translate="no">${token}</code>`)
    .replace("cloud.mosoo.ai", `<a href="${LINKS.console}">cloud.mosoo.ai</a>`);
}

function link(href, label, attributes = "") {
  return `<a href="${escapeAttribute(href)}"${attributes}>${escapeText(label)}</a>`;
}

// A two-value heading: the second value in the softer ink.
function twoValues([first, second], join) {
  return `${escapeText(first)}${join}<span class="mf-soft">${escapeText(second)}</span>`;
}

function renderHeader(locale, copy) {
  return `<header class="mf-bar">
<a href="/${locale}" aria-label="${escapeAttribute(copy.nav.home)}"><span class="mf-mark" aria-hidden="true"></span></a>
<nav aria-label="Primary site links">
<ul class="mf-row">
<li>${link(copy.docs, copy.nav.docs)}</li>
<li>${link(copy.blog, copy.nav.blog)}</li>
<li>${link(LINKS.github, "GitHub", ` aria-label="${escapeAttribute(copy.nav.github)}"`)}</li>
<li>${link(LINKS.signIn, copy.nav.signIn)}</li>
<li>${link(LINKS.console, copy.nav.try, ' class="mf-btn"')}</li>
</ul>
</nav>
</header>`;
}

function renderTranscript(lines) {
  const items = lines
    .map(([kind, a, b, result]) => {
      if (kind === "gap") return '<li class="mf-gap" aria-hidden="true"></li>';
      if (kind === "prompt") return `<li class="mf-prompt-line">${escapeText(a)}</li>`;
      const done = result === undefined ? "" : ` <span class="mf-result">${escapeText(result)}</span>`;
      return `<li><span class="mf-verb">${escapeText(a)}</span> ${escapeText(b)}${done}</li>`;
    })
    .join("\n");
  return `<figure class="mf-term" translate="no">
<figcaption>${WINDOW_NAME}</figcaption>
<ol>
${items}
</ol>
</figure>`;
}

function renderHero(locale, copy) {
  return `<section class="mf-hero" aria-labelledby="mf-title">
<h1 id="mf-title">${twoValues(copy.hero.title, " ")}</h1>
<p class="mf-lead">${escapeText(copy.hero.lead)}</p>
<p class="mf-actions">${link(LINKS.console, copy.nav.try, ' class="mf-btn"')}</p>
${renderTranscript(heroTranscript(copy))}
</section>`;
}

function renderStage(copy) {
  return `<section id="session" aria-labelledby="mf-session">
<h2 id="mf-session">${twoValues(copy.stage.title, copy.join)}</h2>
<p class="mf-intro">${escapeText(copy.stage.lead)}</p>
${renderTranscript(stageTranscript(copy))}
</section>`;
}

function renderSpec(copy) {
  const spec = copy.spec;
  const harnesses = RUNTIMES.map(
    (runtime) => `<span translate="no">${escapeText(runtime.name)}</span>`,
  ).join(" · ");
  const values = [
    harnesses,
    escapeText(spec.model),
    escapeText(spec.sandbox),
    '<code translate="no">outputs/report.md</code>',
    escapeText(spec.resume),
  ];
  const rows = spec.rows
    .map((label, index) => `<div><dt>${escapeText(label)}</dt><dd>${values[index]}</dd></div>`)
    .join("\n");
  return `<section id="parts" aria-labelledby="mf-parts">
<h2 id="mf-parts">${twoValues(spec.title, copy.join)}</h2>
<dl class="mf-spec">
${rows}
</dl>
</section>`;
}

// Native disclosure rows, the first one open; every answer stays in the DOM.
function renderFaq(locale, copy) {
  const items = FAQ[locale]
    .map(
      ({ q, a }, index) => `<details name="faq"${index === 0 ? " open" : ""}>
<summary>${escapeText(q)}</summary>
<p>${faqAnswer(a)}</p>
</details>`,
    )
    .join("\n");

  return `<section id="faq" aria-labelledby="mf-faq">
<h2 id="mf-faq">${twoValues(copy.faqTitle, copy.join)}</h2>
${items}
</section>`;
}

function renderClosing(copy) {
  const closing = copy.closing;
  return `<section id="start" aria-labelledby="mf-start">
<h2 id="mf-start">${twoValues(closing.title, " ")}</h2>
<figure class="mf-card">
<figcaption>${escapeText(closing.legend)}</figcaption>
<p class="mf-prompt">${escapeText(closing.prompt)}</p>
<p class="mf-muted">${escapeText(closing.note)}</p>
</figure>
</section>`;
}

function renderFooter(locale, copy) {
  const footer = copy.footer;
  const { links } = footer;
  const question = encodeURIComponent(footer.askPrompt);
  const assistants = ASSISTANTS.map(
    ([name, href]) => `<li>${link(href(question), name, ' rel="noopener"')}</li>`,
  ).join("");
  const columns = [
    [
      [copy.docs, links.docs],
      [copy.quickstart, links.quickstart],
      [copy.apiReferenceV2, links.api],
      [`/${locale}/pricing`, links.pricing],
      [copy.health, links.status],
    ],
    [
      [LINKS.github, links.github],
      [LINKS.releases, links.releases],
      [LINKS.license, links.license],
    ],
    [
      [copy.blog, links.blog],
      [`/${locale}/use-cases`, links.useCases],
      [LINKS.llms, links.llms],
    ],
  ]
    .map((items, index) => {
      const id = `mf-footer-${index}`;
      const list = items.map(([href, label]) => `<li>${link(href, label)}</li>`).join("");
      return `<div><p id="${id}" class="mf-label">${escapeText(footer.columns[index])}</p><ul aria-labelledby="${id}">${list}</ul></div>`;
    })
    .join("\n");
  const languages = LANGUAGES.map(
    (language) =>
      `<li>${link(
        `/${language.locale}`,
        language.label,
        ` hreflang="${language.lang}" lang="${language.lang}"${language.locale === locale ? ' aria-current="page"' : ""}`,
      )}</li>`,
  ).join("");

  return `<footer class="mf-foot">
<p class="mf-status"><code translate="no">run.completed</code> ${escapeText(copy.end.status)}</p>
<section class="mf-ask" aria-labelledby="mf-ask">
<h2 id="mf-ask">${escapeText(footer.askTitle)}</h2>
<p class="mf-muted">${escapeText(footer.askLead)}</p>
<ul class="mf-row">${assistants}</ul>
</section>
<nav class="mf-groups" aria-label="Footer">
${columns}
</nav>
<div class="mf-bottom">
<p>© 2026 LangGenius, Inc.</p>
<ul class="mf-row" aria-label="${escapeAttribute(footer.language)}">${languages}</ul>
</div>
</footer>`;
}

export function renderHomeFallback(locale) {
  const copy = copyFor(locale);
  return `<div class="mosoo-fallback">
<a class="mf-skip" href="#main">${escapeText(copy.nav.skip)}</a>
${renderHeader(locale, copy)}
<main id="main">
${renderHero(locale, copy)}
${renderStage(copy)}
${renderSpec(copy)}
${renderFaq(locale, copy)}
${renderClosing(copy)}
</main>
${renderFooter(locale, copy)}
</div>`;
}

// ---------------------------------------------------------------------------
// JSON-LD

export function homeStructuredData(locale) {
  const copy = copyFor(locale);
  const url = `${SITE}/${locale}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE}/#organization`,
        name: "LangGenius",
        legalName: "LangGenius, Inc.",
        url: "https://github.com/langgenius",
        sameAs: ["https://github.com/langgenius"],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE}/#website`,
        name: "mosoo",
        alternateName: "mosoo AI",
        url: `${SITE}/`,
        inLanguage: LANGUAGES.map((language) => language.lang),
        publisher: { "@id": `${SITE}/#organization` },
        about: { "@id": `${SITE}/#software` },
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${SITE}/#software`,
        name: "mosoo",
        alternateName: "mosoo AI",
        url,
        inLanguage: copy.lang,
        description: copy.jsonLd.description,
        applicationCategory: "DeveloperApplication",
        applicationSubCategory: "Managed Agent runtime",
        operatingSystem: "Web",
        codeRepository: GITHUB,
        license: LINKS.license,
        softwareHelp: { "@type": "CreativeWork", url: copy.jsonLd.help },
        releaseNotes: LINKS.releases,
        featureList: copy.jsonLd.features,
        publisher: { "@id": `${SITE}/#organization` },
        sameAs: [GITHUB, LINKS.x],
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        url,
        inLanguage: copy.lang,
        isPartOf: { "@id": `${SITE}/#website` },
        about: { "@id": `${SITE}/#software` },
        mainEntity: FAQ[locale].map(({ q, a }) => ({
          "@type": "Question",
          name: q,
          acceptedAnswer: { "@type": "Answer", text: a },
        })),
      },
    ],
  };
}

// Every "<" is written as < so no string can close the script element.
export function renderHomeJsonLd(locale) {
  const json = JSON.stringify(homeStructuredData(locale), null, 2).replaceAll("<", "\\u003c");
  return `<script type="application/ld+json">\n${json}\n</script>`;
}

// Scoped to .mosoo-fallback, which only exists until React mounts. The
// instrument canvas (v4a UI-LOCK §1): dark ground, 1px rails, the three
// self-hosted faces the React page declares (Inter Text, Display Fallback,
// Fragment Mono); CJK text uses the platform fonts. No other web font.
export const HOME_FALLBACK_STYLE = `<style>
.mosoo-fallback{--mf-paper:#0e0f0d;--mf-panel:#141513;--mf-well:#080807;--mf-ink:#eff1ee;--mf-muted:#a9aca8;--mf-soft:#8c8f8b;--mf-label:#737572;--mf-line:#242623;--mf-edge:rgba(255,255,255,.1);min-height:100vh;background:var(--mf-paper);color:var(--mf-ink);font:400 16px/1.6 "Inter Text",ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;overflow-wrap:break-word;-webkit-font-smoothing:antialiased}
.mosoo-fallback:lang(zh){font-family:"Inter Text","PingFang SC","Hiragino Sans GB","Microsoft YaHei","Noto Sans CJK SC",sans-serif}
.mosoo-fallback:lang(ja){font-family:"Inter Text","Hiragino Sans","Hiragino Kaku Gothic ProN","Yu Gothic","Noto Sans CJK JP",Meiryo,sans-serif;line-break:strict}
.mosoo-fallback *{box-sizing:border-box}
.mosoo-fallback a{color:var(--mf-ink);text-decoration:underline;text-decoration-color:rgba(239,241,238,.3);text-underline-offset:3px}
.mosoo-fallback a:focus-visible,.mosoo-fallback summary:focus-visible{outline:2px solid #6fd305;outline-offset:2px;border-radius:2px}
.mosoo-fallback .mf-btn{display:inline-block;padding:9px 16px;border-radius:4px;background:var(--mf-ink);color:var(--mf-paper);font-weight:500;font-size:15px;text-decoration:none}
.mosoo-fallback .mf-skip{position:absolute;left:-9999px}
.mosoo-fallback .mf-skip:focus{left:16px;top:16px;z-index:1;padding:8px 12px;background:var(--mf-paper)}
.mosoo-fallback .mf-bar,.mosoo-fallback main,.mosoo-fallback .mf-foot{max-width:1120px;margin:0 auto;padding-left:28px;padding-right:28px;border-left:1px solid var(--mf-line);border-right:1px solid var(--mf-line)}
.mosoo-fallback .mf-bar{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px 24px;min-height:64px;padding-top:12px;padding-bottom:12px;border-bottom:1px solid var(--mf-line)}
.mosoo-fallback .mf-mark{display:block;width:78px;height:17px;background:var(--mf-ink);-webkit-mask:url("/brand/logo-wordmark-ondark.svg") left center/contain no-repeat;mask:url("/brand/logo-wordmark-ondark.svg") left center/contain no-repeat}
.mosoo-fallback .mf-row{display:flex;flex-wrap:wrap;align-items:center;gap:8px 20px;margin:0;padding:0;list-style:none;font-size:14px}
.mosoo-fallback .mf-bar a:not(.mf-btn){color:var(--mf-muted);text-decoration:none}
.mosoo-fallback h1,.mosoo-fallback h2{margin:0;color:var(--mf-ink);font-family:"Display Fallback",ui-serif,Georgia,serif;font-weight:400;text-wrap:balance}
.mosoo-fallback:lang(zh) h1,.mosoo-fallback:lang(zh) h2{font-family:"Display Fallback","Songti SC","Noto Serif CJK SC",serif;word-break:keep-all}
.mosoo-fallback:lang(ja) h1,.mosoo-fallback:lang(ja) h2{font-family:"Display Fallback","Hiragino Mincho ProN","Noto Serif CJK JP",serif;word-break:auto-phrase}
.mosoo-fallback:lang(ja) p,.mosoo-fallback:lang(ja) summary{word-break:auto-phrase}
.mosoo-fallback:lang(zh) .mf-lead,.mosoo-fallback:lang(zh) .mf-intro{word-break:keep-all}
.mosoo-fallback h1{max-width:600px;font-size:clamp(38px,6vw,68px);line-height:1.02;letter-spacing:-.03em}
.mosoo-fallback h2{max-width:600px;font-size:clamp(30px,4vw,44px);line-height:1.06;letter-spacing:-.02em}
.mosoo-fallback .mf-soft{color:var(--mf-soft)}
.mosoo-fallback h1 .mf-soft,.mosoo-fallback h2 .mf-soft{display:block}
.mosoo-fallback p{margin:12px 0 0;max-width:62ch}
.mosoo-fallback main>section{margin:0 -28px;padding:72px 28px;border-top:1px solid var(--mf-line)}
.mosoo-fallback main>.mf-hero{padding-top:96px;border-top:0}
.mosoo-fallback .mf-lead{max-width:420px;margin-top:24px;font-size:18px;line-height:1.55;color:var(--mf-muted)}
.mosoo-fallback .mf-intro{max-width:320px;color:var(--mf-muted)}
.mosoo-fallback .mf-actions{margin-top:32px}
.mosoo-fallback .mf-muted{color:var(--mf-label);font-size:13px}
.mosoo-fallback code,.mosoo-fallback .mf-term{font-family:"Fragment Mono",ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
.mosoo-fallback code{font-size:.9em;color:var(--mf-muted)}
.mosoo-fallback .mf-term{max-width:640px;margin:48px 0 0;border:1px solid var(--mf-edge);border-radius:8px;background:#0b0c0a;font-size:13px;line-height:1.65}
.mosoo-fallback .mf-term figcaption{padding:10px 20px;border-bottom:1px solid rgba(255,255,255,.08);color:var(--mf-label)}
.mosoo-fallback .mf-term ol{display:grid;gap:12px;margin:0;padding:24px 28px;list-style:none;color:rgba(255,255,255,.62)}
.mosoo-fallback .mf-verb,.mosoo-fallback .mf-prompt-line{color:rgba(255,255,255,.96)}
.mosoo-fallback .mf-result{display:block;padding-left:14px;color:rgba(255,255,255,.4)}
.mosoo-fallback .mf-result::before{content:"└ "}
.mosoo-fallback .mf-gap{height:1px;margin:6px 0;background:repeating-linear-gradient(to right,rgba(255,255,255,.22) 0 3px,transparent 3px 7px)}
.mosoo-fallback .mf-spec{margin:48px 0 0;border-top:1px solid var(--mf-muted)}
.mosoo-fallback .mf-spec div{display:grid;grid-template-columns:minmax(0,1fr);gap:4px;padding:16px 0;border-bottom:1px solid var(--mf-line)}
.mosoo-fallback .mf-spec dt{color:var(--mf-label);font-size:13px}
.mosoo-fallback .mf-spec dd{margin:0}
.mosoo-fallback details{border-bottom:1px solid var(--mf-line)}
.mosoo-fallback #faq h2{margin-bottom:32px}
.mosoo-fallback summary{padding:20px 0;cursor:pointer;font-size:17px;font-weight:500;line-height:1.4}
.mosoo-fallback details p{margin:0;padding:0 0 22px;color:var(--mf-muted);font-size:15.5px;line-height:1.65}
.mosoo-fallback .mf-card{max-width:640px;margin:48px 0 0;padding:24px;border:1px solid var(--mf-edge);border-radius:4px}
.mosoo-fallback .mf-card figcaption{color:var(--mf-label);font:11px/16px "Fragment Mono",ui-monospace,monospace;letter-spacing:.12em;text-transform:uppercase}
.mosoo-fallback .mf-prompt{padding:14px 20px;border:1px solid rgba(255,255,255,.13);border-radius:20px;background:var(--mf-well);font-size:15px}
.mosoo-fallback .mf-foot{padding-top:72px;padding-bottom:40px;border-top:1px solid var(--mf-line)}
.mosoo-fallback .mf-status{margin:0 0 56px;text-align:center;max-width:none;color:var(--mf-label);font-size:13px}
.mosoo-fallback .mf-ask{padding:32px;border-radius:20px;background:var(--mf-panel)}
.mosoo-fallback .mf-ask h2{font-size:32px}
.mosoo-fallback .mf-ask .mf-row{margin-top:20px}
.mosoo-fallback .mf-groups{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:24px;margin-top:56px;font-size:14px}
.mosoo-fallback .mf-groups ul{margin:8px 0 0;padding:0;list-style:none}
.mosoo-fallback .mf-groups li{margin-top:6px}
.mosoo-fallback .mf-groups a{color:var(--mf-muted);text-decoration:none}
.mosoo-fallback .mf-label{margin:0;color:var(--mf-label);font-size:13px}
.mosoo-fallback .mf-bottom{display:flex;flex-wrap:wrap;justify-content:space-between;gap:12px;margin-top:56px;padding-top:20px;border-top:1px solid var(--mf-line);color:var(--mf-label);font-size:13px}
.mosoo-fallback .mf-bottom p{margin:0}
html:has(.mosoo-fallback){background:#0e0f0d;color-scheme:dark}
@media (min-width:901px){.mosoo-fallback .mf-bar,.mosoo-fallback main,.mosoo-fallback .mf-foot{padding-left:48px;padding-right:48px}.mosoo-fallback main>section{margin:0 -48px;padding:120px 48px}.mosoo-fallback .mf-spec div{grid-template-columns:200px minmax(0,1fr);padding:20px 0}}
</style>`;
