// The home page in /en, /zh and /ja, as static HTML: the v4b "Paper" page
// itself (no React on the home; apps/landing/src/main.tsx only adds styles and
// the effect engines), and the JSON-LD @graph.
//
// Copy source: the v1 copy deck (sections 1 to 16), drawn from
// langgenius/mosoo @ 7cb9866 (README, docs/SPEC.md). The FAQ strings are the
// exact strings the FAQPage JSON-LD carries, and the React FAQ must show the
// same text. Do not add facts here that the main repo does not state.

import { OUTLINE } from "../apps/landing/src/shared/chrome/outline-geometry.mjs";
import { renderPaperFooter, renderPaperNav } from "../apps/landing/src/shared/chrome/paper-chrome.mjs";

const SITE = "https://mosoo.ai";
const CONSOLE = "https://cloud.mosoo.ai";
const GITHUB = "https://github.com/langgenius/mosoo";

const LINKS = {
  console: CONSOLE,
  signIn: `${CONSOLE}/login`,
  computer: "https://computer.mosoo.ai",
  github: GITHUB,
  spec: `${GITHUB}/blob/main/docs/SPEC.md`,
  releases: `${GITHUB}/releases`,
  license: `${GITHUB}/blob/main/LICENSE`,
  security: `${GITHUB}/security`,
  issues: `${GITHUB}/issues`,
  incidents: `${GITHUB}/tree/main/docs/operations/incidents`,
  driver: "https://github.com/langgenius/mosoo-agent-driver",
  openApiV2: `${CONSOLE}/api/v2/openapi.json`,
  openApiV1: `${CONSOLE}/api/v1/openapi.json`,
  changelog: `${SITE}/docs/changelog/`,
  llms: `${SITE}/llms.txt`,
  installScript: "https://install.mosoo.ai/install.sh",
  ghfind: "https://ghfind.com",
  x: "https://x.com/mosooagent",
};

const INSTALL_COMMAND = "curl -fsSL https://install.mosoo.ai/install.sh | bash";

// The two calls that start a Session with a file attached (MAIN
// apps/api/openapi/public-api-v2.generated.json, /projects/{projectId}/files
// and /projects/{projectId}/threads): upload input.csv, then start the
// Session with it attached. Code stays ASCII.
const UPLOAD_REQUEST = [
  "curl https://cloud.mosoo.ai/api/v2/projects/$MOSOO_PROJECT_ID/files \\",
  '  -H "Authorization: Bearer $MOSOO_API_TOKEN" \\',
  '  -F "file=@input.csv"',
].join("\n");

const START_SESSION_REQUEST = [
  "curl https://cloud.mosoo.ai/api/v2/projects/$MOSOO_PROJECT_ID/threads \\",
  '  -H "Authorization: Bearer $MOSOO_API_TOKEN" \\',
  '  -H "Content-Type: application/json" \\',
  '  -H "Idempotency-Key: csv-report-create" \\',
  "  -d '{",
  '    "configuration": {',
  '      "type": "inline",',
  '      "harness": "openai-runtime",',
  '      "provider": "openai",',
  '      "model": "gpt-5.5",',
  '      "instructions": "Use tools to analyze files, verify results and retain private working state for follow-up."',
  "    },",
  '    "input": {',
  '      "type": "user.message",',
  '      "content": [{ "type": "text", "text": "Use real Python tools to read the attached input.csv and copy it into the working directory for analysis. Generate a random private nonce in .private/nonce outside outputs. Write outputs/initial.json with grand_total and private_nonce_sha256 (hash the raw file bytes). Save outputs/report.md and outputs/chart.svg. Keep input.csv and the nonce for our next turn. Do not return success if any tool fails." }]',
  "    },",
  '    "resources": [',
  '      { "type": "file", "file_id": "01M4QP7S669BBSX12Z2564J5F7" }',
  "    ]",
  "  }'",
].join("\n");

const RUNTIMES = [
  { name: "OpenAI Codex", id: "openai-runtime" },
  { name: "Claude Agent SDK", id: "claude-agent-sdk" },
  { name: "OpenCode", id: "acp-fallback" },
  { name: "Pi", id: "pi" },
];

const PROVIDERS = [
  "Anthropic",
  "OpenAI",
  "DeepSeek",
  "Gemini",
  "Qwen",
  "Kimi",
  "Zhipu",
  "MiniMax",
  "OpenCode Zen",
];

const PROTOCOLS = ["Chat Completions", "Responses", "Anthropic Messages", "Google Gemini"];

const LANGUAGES = [
  { locale: "en", lang: "en", label: "English" },
  { locale: "zh", lang: "zh-CN", label: "简体中文" },
  { locale: "ja", lang: "ja", label: "日本語" },
];

const RELEASE_DATES = {
  "v0.7.0": "2026-10-09",
  "v0.5.1": "2026-10-08",
  "v0.5.0": "2026-10-08",
  "v0.4.0": "2026-09-30",
};

// PROVISIONAL (proposal b-paper §6, checked there against MAIN): six
// questions for the U16 rows; the content stage rewrites and translates them.
// The page, the FAQPage JSON-LD and llms.txt all read this one list.
const FAQ_EN = [
  {
    q: "Is it hosted or open source?",
    a: "Both. The hosted console at cloud.mosoo.ai is the quickest way to try mosoo. The source is Apache-2.0 on GitHub, and the README explains how to run it locally for development.",
  },
  {
    q: "Whose Agent does it run?",
    a: "Yours. On /api/v2, one request carries the harness, provider, model, instructions, and input, and mosoo starts a durable Session without creating an Agent. Saved Agent presets are optional.",
  },
  {
    q: "Why not call a model API directly?",
    a: "You can. Then you also build a sandbox per task, tool execution, file storage, an event stream, and resume after idle. mosoo handles execution, files, events, and usage behind one API.",
  },
  {
    q: "What is Pi?",
    a: "Pi is one of the four harnesses mosoo runs, next to OpenAI Codex, Claude Agent SDK, and OpenCode. In mosoo it works with multiple model providers and accepts text input only.",
  },
  {
    q: "Who pays for model usage?",
    a: "You do, directly. Model keys belong to your Project, and the provider bills your account. mosoo supplies no models and sets no spending cap.",
  },
  {
    q: "What happens when I reply days later?",
    a: "The same Session continues, even after its sandbox was reclaimed. mosoo restores the working directory, the harness’s native conversation, and recorded artifacts from the last committed checkpoint. If that fails, the follow-up returns an error.",
  },
];
const FAQ = { en: FAQ_EN, zh: FAQ_EN, ja: FAQ_EN };

const SETUP_PROMPT = {
  "en": "# Set up mosoo\n\nUse this instruction with any coding agent. You are helping the user finish onboarding to mosoo, an open-source agent runtime: add a model provider key, then start a Session through the Thread API. Work through the steps in order and skip any step that is already done. Ask the user for values only they know. Never print or commit secrets.\n\n## Generated variables\n\n```text\nMOSOO_CONSOLE_URL=https://cloud.mosoo.ai\nMOSOO_DOCS_URL=https://mosoo.ai/docs\n```\n\n## 1. Install the mosoo CLI and sign in\n\n```bash\ncurl -fsSL https://install.mosoo.ai/install.sh | bash\n```\n\nThe installer adds the mosoo CLI and the @mosoo skill, then opens a browser sign-in and checks cloud readiness (doctor). The login callback authorizes the CLI and creates an account login credential for it automatically. If no browser can open, show the user the sign-in URL printed in the terminal and wait for them to finish it.\n\n## 2. Add a provider key (required before runs)\n\nSession runs need a model provider credential, for example OpenAI or Anthropic. This is the one step you cannot complete alone: ask the user which provider they want and have them add the key at MOSOO_CONSOLE_URL/providers. Do not start the first run until a provider key is configured.\n\n## 3. Create an API token (optional)\n\nThe CLI sign-in from step 1 already covers CLI usage. If this project calls the Thread API from a backend or script, create a token at MOSOO_CONSOLE_URL/project-settings/api-keys and store it in the project environment as MOSOO_API_TOKEN. Keep it out of source control.\n\n## 4. Run a first session\n\nStart a first session through the v2 Thread API with an inline configuration (harness, provider, model, instructions); no agent is needed. To save a reusable configuration instead, create an agent at MOSOO_CONSOLE_URL/agent?create=1 and start a session from the agent page. The API flow (create a thread, stream events, send follow-ups) is documented at MOSOO_DOCS_URL/quickstart and MOSOO_DOCS_URL/api-reference-v2.\n\n## Done when\n\n- The CLI is signed in and doctor reports the cloud is reachable.\n- A provider key is configured for the active Project.\n- At least one session has run: a Thread under MOSOO_CONSOLE_URL/threads, or a Preview on the agent page.",
  "zh": "# 设置 mosoo\n\n请将以下说明用于任何编码智能体。你在帮助用户完成 mosoo（一个开源智能体运行时）的入门设置：添加模型供应商密钥，然后通过 Thread API 启动一个会话。按顺序完成以下步骤，已完成的步骤可以跳过。只向用户询问只有他们知道的取值。切勿打印或提交密钥。\n\n## 生成的变量\n\n```text\nMOSOO_CONSOLE_URL=https://cloud.mosoo.ai\nMOSOO_DOCS_URL=https://mosoo.ai/docs\n```\n\n## 1. 安装 mosoo CLI 并登录\n\n```bash\ncurl -fsSL https://install.mosoo.ai/install.sh | bash\n```\n\n安装程序会添加 mosoo CLI 和 @mosoo 技能，然后打开浏览器登录并检查云端就绪状态（doctor）。登录回调会自动授权 CLI 并为其创建账号登录凭据。如果无法打开浏览器，请将终端中打印的登录 URL 展示给用户，并等待其完成登录。\n\n## 2. 添加模型供应商密钥（运行前必需）\n\n会话运行需要模型供应商凭据，例如 OpenAI 或 Anthropic。这是你无法独自完成的一步：请询问用户希望使用哪个供应商，并让他们在 MOSOO_CONSOLE_URL/providers 添加密钥。在配置好供应商密钥之前，不要开始首次运行。\n\n## 3. 创建 API 令牌（可选）\n\n第 1 步的 CLI 登录已覆盖 CLI 的使用。如果此项目需要从后端或脚本调用 Thread API，请在 MOSOO_CONSOLE_URL/project-settings/api-keys 创建令牌，并将其作为 MOSOO_API_TOKEN 存入项目环境变量。切勿纳入版本控制。\n\n## 4. 运行第一个会话\n\n通过 v2 Thread API 以 inline 配置（harness、provider、model、instructions）启动第一个会话，无需创建智能体。如果想保存可复用的配置，可以在 MOSOO_CONSOLE_URL/agent?create=1 创建智能体，并从智能体页面开始会话。API 流程（创建线程、流式事件、发送后续消息）的文档位于 MOSOO_DOCS_URL/quickstart 和 MOSOO_DOCS_URL/api-reference-v2。\n\n## 完成条件\n\n- CLI 已登录，doctor 报告云端可达。\n- 已为当前项目配置供应商密钥。\n- 至少运行过一个会话：MOSOO_CONSOLE_URL/threads 下的 Thread，或智能体页面上的预览。",
  "ja": "# mosoo のセットアップ\n\nこの手順は任意のコーディングエージェントで使用してください。ユーザーがオープンソースのエージェントランタイムである mosoo のオンボーディングを完了できるよう支援します：プロバイダーキーを追加し、Thread API からセッションを開始します。手順は順番に進め、すでに完了している手順はスキップしてください。ユーザーだけが知っている値のみをユーザーに尋ねてください。シークレットを印刷したりコミットしたりしないでください。\n\n## 生成される変数\n\n```text\nMOSOO_CONSOLE_URL=https://cloud.mosoo.ai\nMOSOO_DOCS_URL=https://mosoo.ai/docs\n```\n\n## 1. mosoo CLI のインストールとサインイン\n\n```bash\ncurl -fsSL https://install.mosoo.ai/install.sh | bash\n```\n\nインストーラーは mosoo CLI と @mosoo スキルを追加し、ブラウザのサインインを開いてクラウドの準備状態（doctor）を確認します。ログインコールバックが CLI を承認し、アカウントのログイン認証情報を自動的に作成します。ブラウザを開けない場合は、ターミナルに表示されたサインイン URL をユーザーに見せて、完了するまで待ってください。\n\n## 2. プロバイダーキーを追加（実行前に必須）\n\nセッションの実行にはモデルプロバイダーの認証情報が必要です（例：OpenAI、Anthropic）。これはあなただけでは完了できない手順です：ユーザーに希望するプロバイダーを尋ね、MOSOO_CONSOLE_URL/providers でキーを追加してもらってください。プロバイダーキーが設定されるまで最初の実行を開始しないでください。\n\n## 3. API トークンを作成（任意）\n\n手順 1 の CLI サインインで CLI の利用はまかなえます。このプロジェクトがバックエンドやスクリプトから Thread API を呼び出す場合は、MOSOO_CONSOLE_URL/project-settings/api-keys でトークンを作成し、MOSOO_API_TOKEN としてプロジェクトの環境に保存してください。ソース管理には含めないでください。\n\n## 4. 最初のセッションを実行\n\nv2 Thread API で inline 設定（harness、provider、model、instructions）を使い、最初のセッションを開始します。エージェントの作成は不要です。再利用できる設定を保存したい場合は、MOSOO_CONSOLE_URL/agent?create=1 でエージェントを作成し、エージェントページからセッションを開始します。API フロー（スレッドの作成、イベントのストリーミング、フォローアップの送信）のドキュメントは MOSOO_DOCS_URL/quickstart と MOSOO_DOCS_URL/api-reference-v2 にあります。\n\n## 完了条件\n\n- CLI がサインイン済みで、doctor がクラウドへ到達可能と報告している。\n- アクティブなプロジェクトにプロバイダーキーが設定されている。\n- 少なくとも 1 つのセッションが実行されている：MOSOO_CONSOLE_URL/threads の Thread、またはエージェントページのプレビュー。"
};

const COPY = {
  en: {
    lang: "en",
    docs: `${SITE}/docs/`,
    quickstart: `${SITE}/docs/quickstart/`,
    apiReferenceV2: `${SITE}/docs/api-reference-v2/`,
    cli: `${SITE}/docs/cli/overview/`,
    blog: `${SITE}/blog`,
    health: "/health",
    nav: {
      home: "mosoo home",
      products: "Products",
      productMosoo: "Open-source Agent runtime for application backends.",
      productComputer: "A persistent cloud computer for agents.",
      docs: "Docs",
      useCases: "Use cases",
      blog: "Blog",
      language: "Change language",
      github: "mosoo on GitHub",
      signIn: "Sign in",
      skip: "Skip to content",
    },
    cta: {
      primary: "Try mosoo",
      quickstart: "Read the quickstart",
      source: "View source",
      readScript: "Read the install script",
    },
    alpha: "mosoo is in Alpha. Public APIs may still change.",
    hero: {
      title: "An open-source, API-first managed Agent runtime for application backends.",
      subhead:
        "mosoo runs OpenAI Codex, Claude Agent SDK, OpenCode, and Pi behind one API, each Session in its own sandbox.",
      hosted: "Hosted at cloud.mosoo.ai. Apache-2.0 source on GitHub. Bring your own model key.",
      agentLabel: "Set up with your coding agent",
      agentLine:
        "Paste the setup prompt into Codex, Claude Code, OpenCode, Cursor, or Cline. It installs the mosoo CLI and the @mosoo skill, then asks you for a provider key.",
    },
    wall: {
      title: "Pick a runtime. Use your own model key.",
      intro:
        "4 runtimes, the providers below, or a custom OpenAI-compatible endpoint at a public HTTPS URL. mosoo checks the runtime, model, and protocol before anything runs.",
      runtimes: "Runtimes",
      columns: ["Name", "API id", "Model protocols"],
      protocolsByRuntime: {
        "openai-runtime": "Responses",
        "claude-agent-sdk": "Anthropic Messages (Anthropic models)",
        "acp-fallback": "Chat Completions, Responses, Anthropic Messages, Google Gemini",
        pi: "Chat Completions, Responses, Anthropic Messages, Google Gemini (text input only)",
      },
      providers: "Model providers (your keys)",
      customProvider: "Custom OpenAI-compatible endpoint",
      protocols: "Model protocols",
      notes: [
        "Provider keys belong to your Project, and the provider bills your account directly.",
        "Names and logos identify compatible services and don’t imply a partnership or endorsement.",
      ],
    },
    features: {
      title: "mosoo handles execution, files, events, and usage.",
      spec: "Read the product spec",
      items: [
        {
          title: "Start a Session without creating an Agent",
          body: "Put the harness, provider, model, and instructions in one request. mosoo starts a durable Session and creates no Agent.",
          proof:
            '`configuration.type: "inline"` on `POST /api/v2/projects/{projectId}/threads`. Saved presets are optional.',
        },
        {
          title: "Choose the runtime per Session",
          body: "Run OpenAI Codex, Claude Agent SDK, OpenCode, or Pi. Each Session freezes its runtime, model, and protocol, and nothing falls back silently.",
          proof: "A runtime and model protocol that don’t match are rejected before anything runs.",
        },
        {
          title: "A turn succeeds only when its results are saved",
          body: "Completion means the events, usage, and a checkpoint were committed together. A failed or cancelled turn never overwrites the last good state.",
          proof: "From the product spec: “Model or tool execution ending is not success.”",
        },
        {
          title: "Attach files, stream events, download results",
          body: "Attachments mount read-only. Anything the Agent writes under `outputs/` becomes a downloadable artifact. Watch progress over SSE or read the saved history.",
          proof:
            "Events are saved before they’re sent, and stable IDs let a client reconnect without duplicates. There are no Webhooks.",
        },
      ],
    },
    steps: {
      title: "One request starts a Session. A follow-up continues it.",
      intro:
        "Say your backend needs a report on a CSV file. It calls mosoo over HTTPS with a Project API key, and the report comes back as files under `outputs/`.",
      items: [
        {
          title: "Add your model key.",
          body: "Add a provider key to your Project, then create a Project API key. It starts with `msp_` and is shown once.",
          io: "In: your provider key. Change: the key is stored with your Project, outside every sandbox. Out: a Project API key.",
        },
        {
          title: "Start a Session.",
          body: "Send one request with the harness, provider, model, instructions, input, and any files. Save the `thread.id` you get back.",
          io: "In: one request. Change: mosoo creates a durable Session, a Thread in the API, and runs the first turn. Out: a `thread.id`.",
        },
        {
          title: "mosoo runs the turn.",
          body: "The harness writes code and runs tools in the Session’s own sandbox. Your keys stay outside it.",
          io: "In: the turn. Change: events, usage, and a checkpoint are committed together. Out: events, artifacts, usage, and a checkpoint.",
        },
        {
          title: "Follow, download, continue.",
          body: "Stream events over SSE, download files from `outputs/`, and read the usage of every model call. Reply to the same Thread whenever you’re ready.",
          io: "In: a follow-up, now or days later. Change: mosoo restores the working directory and the conversation from the last checkpoint. Out: the next turn in the same Session.",
        },
      ],
      uploadLabel: "Upload input.csv",
      codeLabel: "Start a Session",
      apiReference: "Open the v2 API reference",
      note: "Model IDs change often. Check the models available in your Project before you copy this.",
    },
    split: {
      path: "Your backend calls the mosoo API over HTTPS with a Project API key, and every Session runs in its own sandbox. Provider keys and MCP credentials stay outside it: mosoo’s proxies add them to each request.",
      title: "Your app keeps its users. mosoo runs the Agent.",
      app: "Your app keeps",
      mosoo: "mosoo runs",
      appRows: [
        ["Business logic", "What the task is for and what happens to the result"],
        ["End-user authentication", "mosoo never signs your users in"],
        ["Business queues", "When work starts and in what order"],
        ["Result validation", "You decide whether the report is right"],
        ["Business storage", "Keep the `thread.id` and whatever you extract"],
        ["UI", "Your product, your screens"],
      ],
      mosooRows: [
        ["Agent execution", "The harness runs each turn: model calls, code, tools"],
        ["Sandboxing", "One sandbox per Session, never shared"],
        ["Durable continuation", "Follow-ups restore the last checkpoint"],
        ["Input files and artifacts", "Attachments in, `outputs/` out"],
        ["Events", "Saved first, then streamed over SSE"],
        ["Usage measurement", "One record per model call"],
        ["Runtime cleanup", "Idle sandboxes are reclaimed; the Session’s state stays"],
      ],
      footnote:
        "mosoo doesn’t authenticate your end users. If your MCP servers need to know who asked, label the Thread with your own `userId`.",
    },
    proof: {
      title: "The code, the releases, and the incident postmortems are public.",
      intro:
        "mosoo is in Alpha. What you can check today is the code, the releases, production status, and two projects built on it.",
      source: {
        title: "Source",
        body: "The runtime, console, and API are Apache 2.0 on GitHub. The stack: Cloudflare Workers, Durable Objects, D1, R2, and Containers.",
      },
      releases: {
        title: "Releases",
        body: "Latest: v0.7.0 (Alpha), October 9, 2026. v0.5.0 added Pi as the fourth runtime. v0.4.0 made Sessions startable without an Agent.",
        link: "View all releases",
        list: [
          ["v0.7.0", "Smaller codebase. The public Thread API v1 and v2 did not change."],
          [
            "v0.5.1",
            "Custom providers declare a model protocol, and mismatched runtime and model pairs are rejected before a run.",
          ],
          ["v0.5.0", "Pi joins as the fourth runtime."],
          ["v0.4.0", "Sessions start straight from a Project, with no Agent required."],
        ],
      },
      status: {
        title: "Production status",
        body: "mosoo.ai/health is built from production Worker outcomes and real Run completions. A runtime without production samples shows Unknown.",
        link: "Open the status page",
      },
      postmortems: {
        title: "Postmortems",
        body: "6 incident postmortems from July to September 2026 are in the repo. Newer incidents are tracked as GitHub issues.",
        link: "Read the postmortems",
      },
      codexPet: {
        body: "Built by the mosoo team. An uploaded avatar comes back as a validated ZIP with all 9 Codex pet animation states. The backend calls mosoo through the Thread API, and the token never reaches the browser.",
        link: "Read the Codex Pet use case",
      },
      ghfind: {
        body: "Built by AsperforMias. For each public GitHub repository, ghfind’s Go worker starts a Thread and turns the 3 artifacts the Agent saves (analysis JSON, evidence JSON, and a Markdown report) into its own result page.",
        link: "Read the ghfind use case",
        app: "Open ghfind",
      },
      allUseCases: "See all use cases",
    },
    limits: {
      title: "mosoo leaves these out on purpose.",
      intro: "Plan around them before you build.",
      columns: ["Not included", "Do this instead"],
      rows: [
        ["Webhooks", "Stream events over SSE, or read the saved history."],
        ["Interactive tool approvals", "Agents run with full access inside the Session’s own sandbox."],
        [
          "Models, credits, billing, or a spending cap",
          "Use your own provider key. The provider bills you, and the usage API lists every model call.",
        ],
        [
          "Git mounting, private repository access, or branch and PR workflows",
          "Pass a public URL with an exact commit, or upload the files.",
        ],
        [
          "Your own runtimes, a connector marketplace, or local MCP servers",
          "Pick one of the 4 runtimes and connect remote HTTPS MCP servers.",
        ],
        ["An online file editor or file manager", "Upload inputs and download artifacts through the API."],
        ["Chat channels or a personal cloud computer", "That’s Mosoo Computer, a separate product."],
      ],
    },
    faqTitle: "Questions to ask before you build on mosoo",
    final: {
      title: "Start your first Session. Reply in a minute or in seven days.",
      consoleTitle: "In the console",
      consoleBody:
        "Sign in with email or Google. Your first sign-in creates a Default Project. Add a provider key, then start a Session.",
      agentTitle: "In your coding agent",
      agentBody:
        "Paste the setup prompt into Codex, Claude Code, OpenCode, Cursor, or Cline. It installs the CLI, then asks you to add a provider key in the console, the one step it can’t do for you.",
    },
    footer: {
      signoff: "Take root, and grow a bamboo sea.",
      descriptor: "An open-source, API-first managed Agent runtime for application backends.",
      groups: [
        ["Product", ["mosoo console", "Mosoo Computer", "Use cases", "Status"]],
        [
          "Developers",
          ["Docs", "Quickstart", "API reference v2", "OpenAPI v2", "OpenAPI v1", "CLI", "Changelog", "llms.txt"],
        ],
        [
          "Open source",
          ["GitHub", "Releases", "Product spec", "Agent Driver", "License", "Security", "Incident postmortems"],
        ],
        ["Community", ["Blog", "X", "GitHub Issues"]],
      ],
      copyright: "© 2026 LangGenius, Inc.",
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
    docs: `${SITE}/docs/zh-Hans/`,
    quickstart: `${SITE}/docs/zh-Hans/quickstart/`,
    apiReferenceV2: `${SITE}/docs/zh-Hans/api-reference-v2/`,
    cli: `${SITE}/docs/zh-Hans/cli/overview/`,
    blog: `${SITE}/blog/zh`,
    health: "/zh/health",
    nav: {
      home: "mosoo 首页",
      products: "产品",
      productMosoo: "面向应用后端的开源 Agent runtime。",
      productComputer: "为 Agent 准备的持久云端计算机。",
      docs: "文档",
      useCases: "用例",
      blog: "博客",
      language: "切换语言",
      github: "mosoo 的 GitHub 主页",
      signIn: "登录",
      skip: "跳到正文",
    },
    cta: {
      primary: "试用 mosoo",
      quickstart: "阅读快速开始",
      source: "查看源码",
      readScript: "查看安装脚本",
    },
    alpha: "mosoo 目前处于 Alpha 阶段，公开 API 仍可能变化。",
    hero: {
      title: "开源、API 优先的托管 Agent runtime，面向应用后端。",
      subhead:
        "mosoo 用一个 API 运行 OpenAI Codex、Claude Agent SDK、OpenCode 和 Pi，每个 Session 都在自己的 sandbox 中执行。",
      hosted: "托管在 cloud.mosoo.ai。Apache-2.0 源码在 GitHub。模型使用你自己的密钥。",
      agentLabel: "使用编码智能体设置",
      agentLine:
        "把设置提示粘贴到 Codex、Claude Code、OpenCode、Cursor 或 Cline。它会安装 mosoo CLI 和 @mosoo 技能，然后请你提供模型供应商密钥。",
    },
    wall: {
      title: "选一个 runtime，用你自己的模型密钥。",
      intro:
        "4 个 runtime、下列模型供应商，或公网 HTTPS 地址上的自定义 OpenAI 兼容端点。mosoo 会在执行前检查 runtime、模型和协议是否匹配。",
      runtimes: "Runtime",
      columns: ["名称", "API id", "模型协议"],
      protocolsByRuntime: {
        "openai-runtime": "Responses",
        "claude-agent-sdk": "Anthropic Messages（Anthropic 模型）",
        "acp-fallback": "Chat Completions、Responses、Anthropic Messages、Google Gemini",
        pi: "Chat Completions、Responses、Anthropic Messages、Google Gemini（仅文本输入）",
      },
      providers: "模型供应商（使用你的密钥）",
      customProvider: "自定义 OpenAI 兼容端点",
      protocols: "模型协议",
      notes: [
        "模型供应商密钥属于你的项目，费用由供应商直接向你的账户收取。",
        "名称和标志仅用于标明兼容的服务，不代表合作或背书。",
      ],
    },
    features: {
      title: "执行、文件、事件和用量由 mosoo 负责。",
      spec: "阅读产品规格",
      items: [
        {
          title: "无需创建 Agent，直接启动 Session",
          body: "在一个请求里写明 harness、模型供应商、模型和指令，mosoo 就会启动持久 Session，不会创建 Agent。",
          proof:
            '在 `POST /api/v2/projects/{projectId}/threads` 中使用 `configuration.type: "inline"`。保存的 Agent 预设是可选项。',
        },
        {
          title: "每个 Session 单独选择 runtime",
          body: "可选 OpenAI Codex、Claude Agent SDK、OpenCode 或 Pi。每个 Session 会固定自己的 runtime、模型和协议，不会悄悄回退。",
          proof: "runtime 与模型协议不匹配时，会在执行前被拒绝。",
        },
        {
          title: "结果保存好，turn 才算成功",
          body: "完成意味着事件、用量和检查点已经一起提交。失败或取消的 turn 不会覆盖上一次成功的状态。",
          proof:
            "产品规格原文：“Model or tool execution ending is not success.”（模型或工具执行结束，不等于成功。）",
        },
        {
          title: "附件进，结果出，事件实时可见",
          body: "附件以只读方式挂载。Agent 写到 `outputs/` 下的文件会成为可下载的产出物。进度可以通过 SSE 实时查看，也可以读取已保存的历史。",
          proof: "事件先保存再推送，稳定的 ID 让客户端重连时不会收到重复事件。mosoo 不提供 Webhook。",
        },
      ],
    },
    steps: {
      title: "一个请求启动 Session，后续消息让它接着做。",
      intro:
        "假设你的后端需要一份 CSV 数据报告。它用 Project API 密钥通过 HTTPS 调用 mosoo，报告以 `outputs/` 下的文件返回。",
      items: [
        {
          title: "添加模型密钥。",
          body: "在项目里添加模型供应商密钥，再创建 Project API 密钥。它以 `msp_` 开头，只显示一次。",
          io: "输入：你的模型供应商密钥。变化：密钥保存在你的项目中，不进入任何 sandbox。输出：Project API 密钥。",
        },
        {
          title: "启动 Session。",
          body: "发送一个请求，带上 harness、模型供应商、模型、指令、输入和可选文件。保存返回的 `thread.id`。",
          io: "输入：一个请求。变化：mosoo 创建一个持久的 Session（API 中称为 Thread），并运行第一个 turn。输出：`thread.id`。",
        },
        {
          title: "mosoo 执行这个 turn。",
          body: "harness 在该 Session 自己的 sandbox 里写代码、运行工具。你的密钥始终在 sandbox 之外。",
          io: "输入：这个 turn。变化：事件、用量和检查点一起提交。输出：事件、产出物、用量和检查点。",
        },
        {
          title: "跟进、下载、继续。",
          body: "通过 SSE 接收事件，下载 `outputs/` 里的文件，查看每次模型调用的用量。准备好后，再向同一个 Thread 发送后续消息。",
          io: "输入：后续消息，现在或几天后都可以。变化：mosoo 从最近一次检查点恢复工作目录和对话。输出：同一个 Session 里的下一个 turn。",
        },
      ],
      uploadLabel: "上传 input.csv",
      codeLabel: "启动 Session",
      apiReference: "查看 v2 API 参考",
      note: "模型 ID 经常变化，复制前请先确认你的项目里有哪些可用模型。",
    },
    split: {
      path: "你的后端用 Project API 密钥通过 HTTPS 调用 mosoo API，每个 Session 都在自己的 sandbox 中运行。模型供应商密钥和 MCP 凭据留在 sandbox 之外，由 mosoo 的代理在每次请求时加上。",
      title: "你的应用管用户，mosoo 运行 Agent。",
      app: "你的应用负责",
      mosoo: "mosoo 负责",
      appRows: [
        ["业务逻辑", "任务为什么做，结果怎么用"],
        ["终端用户认证", "mosoo 不替你的用户登录"],
        ["业务队列", "什么时候开始、按什么顺序"],
        ["结果校验", "报告对不对，由你判断"],
        ["业务存储", "保存 `thread.id` 和你提取的结果"],
        ["界面", "你的产品，你的页面"],
      ],
      mosooRows: [
        ["Agent 执行", "harness 运行每个 turn：模型调用、代码、工具"],
        ["sandbox 隔离", "每个 Session 一个 sandbox，从不共享"],
        ["持久续接", "后续消息从最近一次检查点恢复"],
        ["输入文件与产出物", "附件进，`outputs/` 出"],
        ["事件", "先保存，再通过 SSE 推送"],
        ["用量计量", "每次模型调用一条记录"],
        ["运行时清理", "闲置的 sandbox 会被回收，Session 的状态保留"],
      ],
      footnote:
        "mosoo 不认证你的终端用户。如果你的 MCP 服务器需要知道是谁发起的请求，可以给 Thread 标上你自己的 `userId`。",
    },
    proof: {
      title: "代码、版本发布和事故复盘都是公开的。",
      intro:
        "mosoo 目前处于 Alpha 阶段。今天能核实的，是代码、版本发布、生产状态，以及两个基于它构建的项目。",
      source: {
        title: "源码",
        body: "runtime、控制台和 API 以 Apache 2.0 许可证开源在 GitHub 上。技术栈：Cloudflare Workers、Durable Objects、D1、R2 和 Containers。",
      },
      releases: {
        title: "版本发布",
        body: "最新版本：v0.7.0（Alpha），2026 年 10 月 9 日。v0.5.0 加入了第 4 个 runtime：Pi。从 v0.4.0 起，无需 Agent 即可启动 Session。",
        link: "查看全部版本",
        list: [
          ["v0.7.0", "代码库瘦身，公开 Thread API v1 和 v2 没有变化。"],
          ["v0.5.1", "自定义模型供应商需声明模型协议，runtime 与模型不匹配的组合会在运行前被拒绝。"],
          ["v0.5.0", "Pi 成为第 4 个 runtime。"],
          ["v0.4.0", "可直接从项目启动 Session，无需 Agent。"],
        ],
      },
      status: {
        title: "生产状态",
        body: "mosoo.ai/health 根据生产环境 Worker 的调用结果和真实的 Run 完成情况生成。没有生产样本的 runtime 显示为“未知”。",
        link: "打开状态页",
      },
      postmortems: {
        title: "事故复盘",
        body: "仓库里有 6 篇事故复盘，时间从 2026 年 7 月到 9 月。之后的事故改在 GitHub issue 中跟踪。",
        link: "阅读事故复盘",
      },
      codexPet: {
        body: "由 mosoo 团队构建。上传一张头像，返回一个通过校验的 ZIP，包含 Codex 宠物全部 9 种动画状态。后端通过 Thread API 调用 mosoo，令牌从不进入浏览器。",
        link: "查看 Codex Pet 用例",
      },
      ghfind: {
        body: "由 AsperforMias 构建。针对每个公开的 GitHub 仓库，ghfind 的 Go worker 会启动一个 Thread，并把 Agent 保存的 3 个产出物（分析 JSON、证据 JSON 和一份 Markdown 报告）渲染成自己的结果页。",
        link: "查看 ghfind 用例",
        app: "打开 ghfind",
      },
      allUseCases: "查看全部用例",
    },
    limits: {
      title: "这些是 mosoo 有意不做的事。",
      intro: "开始构建前，先把它们考虑进去。",
      columns: ["不包含", "可以这样做"],
      rows: [
        ["Webhook", "通过 SSE 接收事件，或读取已保存的历史。"],
        ["交互式工具审批", "Agent 在该 Session 自己的 sandbox 内以完全权限运行。"],
        [
          "模型、充值、计费或花费上限",
          "使用你自己的模型供应商密钥。费用由供应商直接收取，用量 API 会列出每次模型调用。",
        ],
        ["Git 挂载、私有仓库授权，以及分支和 PR 工作流", "传入公开 URL 和确切的 commit，或直接上传文件。"],
        ["自带 runtime、连接器市场或本地 MCP 服务器", "从 4 个 runtime 中选一个，并接入远程 HTTPS MCP 服务器。"],
        ["在线文件编辑器或文件管理器", "通过 API 上传输入文件、下载产出物。"],
        ["聊天渠道或个人云端计算机", "这属于另一款产品 Mosoo Computer。"],
      ],
    },
    faqTitle: "开始构建前值得问的问题",
    final: {
      title: "启动你的第一个 Session。1 分钟后或 7 天后回复都可以。",
      consoleTitle: "在控制台中",
      consoleBody: "用邮箱或 Google 登录。首次登录会自动创建默认项目。添加模型供应商密钥后，就可以启动 Session。",
      agentTitle: "在编码智能体中",
      agentBody:
        "把设置提示粘贴到 Codex、Claude Code、OpenCode、Cursor 或 Cline。它会安装 CLI，然后请你在控制台添加模型供应商密钥，这是它唯一无法替你完成的一步。",
    },
    footer: {
      signoff: "扎下根，长成一片竹海。",
      descriptor: "开源、API 优先的托管 Agent runtime，面向应用后端。",
      groups: [
        ["产品", ["mosoo 控制台", "Mosoo Computer", "用例", "状态"]],
        ["开发者", ["文档", "快速开始", "API 参考 v2", "OpenAPI v2", "OpenAPI v1", "CLI", "更新日志", "llms.txt"]],
        ["开源", ["GitHub", "版本发布", "产品规格", "Agent Driver", "许可证", "安全", "事故复盘"]],
        ["社区", ["博客", "X", "GitHub Issues"]],
      ],
      copyright: "© 2026 LangGenius, Inc.",
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
    docs: `${SITE}/docs/ja/`,
    quickstart: `${SITE}/docs/ja/quickstart/`,
    apiReferenceV2: `${SITE}/docs/ja/api-reference-v2/`,
    cli: `${SITE}/docs/ja/cli/overview/`,
    blog: `${SITE}/blog/ja`,
    health: "/ja/health",
    nav: {
      home: "mosoo ホーム",
      products: "プロダクト",
      productMosoo: "アプリケーションのバックエンド向けのオープンソース Agent runtime。",
      productComputer: "Agent のための永続的なクラウドコンピューター。",
      docs: "ドキュメント",
      useCases: "ユースケース",
      blog: "ブログ",
      language: "言語を切り替える",
      github: "mosoo の GitHub",
      signIn: "ログイン",
      skip: "本文へスキップ",
    },
    cta: {
      primary: "mosoo を試す",
      quickstart: "クイックスタートを読む",
      source: "ソースコードを見る",
      readScript: "インストールスクリプトを確認する",
    },
    alpha: "mosoo は現在 Alpha 版です。公開 API は変更される可能性があります。",
    hero: {
      title: "アプリケーションのバックエンドのための、オープンソースで API ファーストなマネージド Agent runtime",
      subhead:
        "mosoo は OpenAI Codex、Claude Agent SDK、OpenCode、Pi を 1 つの API で実行します。Session ごとに専用の sandbox が割り当てられます。",
      hosted: "cloud.mosoo.ai でホスト。Apache-2.0 のソースは GitHub に。モデルのキーはご自身で。",
      agentLabel: "コーディングエージェントでセットアップ",
      agentLine:
        "セットアッププロンプトを Codex、Claude Code、OpenCode、Cursor、Cline のいずれかに貼り付けてください。mosoo CLI と @mosoo スキルをインストールしたあと、プロバイダーキーの入力を求めます。",
    },
    wall: {
      title: "runtime を選び、自分のモデルキーを使う",
      intro:
        "4 つの runtime、以下のプロバイダー、そして公開 HTTPS URL にある OpenAI 互換のカスタムエンドポイントに対応します。mosoo は実行前に runtime、モデル、プロトコルの組み合わせを確認します。",
      runtimes: "runtime",
      columns: ["名前", "API id", "モデルプロトコル"],
      protocolsByRuntime: {
        "openai-runtime": "Responses",
        "claude-agent-sdk": "Anthropic Messages（Anthropic のモデル）",
        "acp-fallback": "Chat Completions、Responses、Anthropic Messages、Google Gemini",
        pi: "Chat Completions、Responses、Anthropic Messages、Google Gemini（テキスト入力のみ）",
      },
      providers: "モデルプロバイダー（ご自身のキー）",
      customProvider: "OpenAI 互換のカスタムエンドポイント",
      protocols: "モデルプロトコル",
      notes: [
        "プロバイダーキーはプロジェクトに属し、料金はプロバイダーからお客様のアカウントに直接請求されます。",
        "名称とロゴは互換性のあるサービスを示すもので、提携や推奨を意味するものではありません。",
      ],
    },
    features: {
      title: "実行、ファイル、イベント、使用量は mosoo が担います。",
      spec: "製品仕様を読む",
      items: [
        {
          title: "Agent を作らずに Session を開始",
          body: "1 つのリクエストに harness、プロバイダー、モデル、指示を書くだけで、mosoo は永続的な Session を開始します。Agent は作成されません。",
          proof:
            '`POST /api/v2/projects/{projectId}/threads` で `configuration.type: "inline"` を指定します。保存済みプリセットは任意です。',
        },
        {
          title: "runtime は Session ごとに選べる",
          body: "OpenAI Codex、Claude Agent SDK、OpenCode、Pi から選べます。各 Session は runtime、モデル、プロトコルを固定し、黙って別のものに切り替わることはありません。",
          proof: "runtime とモデルプロトコルが合わない組み合わせは、実行前に拒否されます。",
        },
        {
          title: "結果が保存されて初めて turn は成功",
          body: "完了とは、イベント、使用量、チェックポイントがまとめてコミットされたことを意味します。失敗やキャンセルした turn が、直前の正常な状態を上書きすることはありません。",
          proof:
            "製品仕様の原文：“Model or tool execution ending is not success.”（モデルやツールの実行が終わっただけでは成功ではない）",
        },
        {
          title: "ファイルを渡し、イベントを追い、結果を受け取る",
          body: "添付ファイルは読み取り専用でマウントされます。Agent が `outputs/` に書き込んだものは、ダウンロードできる成果物になります。進捗は SSE でも保存済みの履歴でも確認できます。",
          proof: "イベントは保存してから送信され、安定した ID によって再接続しても重複しません。Webhook はありません。",
        },
      ],
    },
    steps: {
      title: "1 つのリクエストで Session が始まり、フォローアップで続きを実行します。",
      intro:
        "たとえば、バックエンドで CSV ファイルのレポートが必要だとします。バックエンドは Project API キーを使って HTTPS で mosoo を呼び出し、レポートは `outputs/` 配下のファイルとして返ってきます。",
      items: [
        {
          title: "モデルのキーを追加する。",
          body: "プロジェクトにプロバイダーキーを追加し、Project API キーを作成します。キーは `msp_` で始まり、表示されるのは一度だけです。",
          io: "入力：プロバイダーキー。変化：キーはプロジェクトに保存され、どの sandbox にも入りません。出力：Project API キー。",
        },
        {
          title: "Session を開始する。",
          body: "harness、プロバイダー、モデル、指示、入力、必要なファイルを 1 つのリクエストで送ります。返ってきた `thread.id` を保存してください。",
          io: "入力：1 つのリクエスト。変化：mosoo が永続的な Session（API では Thread）を作成し、最初の turn を実行します。出力：`thread.id`。",
        },
        {
          title: "mosoo が turn を実行する。",
          body: "harness がその Session 専用の sandbox でコードを書き、ツールを実行します。キーは sandbox の外に置かれたままです。",
          io: "入力：turn。変化：イベント、使用量、チェックポイントがまとめてコミットされます。出力：イベント、成果物、使用量、チェックポイント。",
        },
        {
          title: "追跡し、ダウンロードし、続ける。",
          body: "SSE でイベントを受け取り、`outputs/` のファイルをダウンロードし、モデル呼び出しごとの使用量を確認します。準備ができたら、同じ Thread にフォローアップを送ります。",
          io: "入力：今すぐ、または数日後のフォローアップ。変化：mosoo が最後のチェックポイントから作業ディレクトリと会話を復元します。出力：同じ Session での次の turn。",
        },
      ],
      uploadLabel: "input.csv をアップロード",
      codeLabel: "Session を開始",
      apiReference: "v2 API リファレンスを開く",
      note: "モデル ID はよく変わります。コピーする前に、プロジェクトで使えるモデルを確認してください。",
    },
    split: {
      path: "バックエンドは Project API キーを使って HTTPS で mosoo API を呼び出し、Session はそれぞれ専用の sandbox で実行されます。プロバイダーキーと MCP 認証情報は sandbox の外に置かれ、mosoo のプロキシがリクエストごとに付与します。",
      title: "ユーザーはアプリが持ち、Agent は mosoo が動かす",
      app: "アプリが担うこと",
      mosoo: "mosoo が担うこと",
      appRows: [
        ["ビジネスロジック", "タスクの目的と、結果の使い道"],
        ["エンドユーザー認証", "mosoo がユーザーをログインさせることはありません"],
        ["業務キュー", "いつ、どの順で始めるか"],
        ["結果の検証", "レポートが正しいかを判断する"],
        ["業務データの保存", "`thread.id` と抽出した結果を保存する"],
        ["UI", "あなたのプロダクトの画面"],
      ],
      mosooRows: [
        ["Agent の実行", "harness が turn ごとにモデル呼び出し、コード、ツールを実行"],
        ["sandbox による分離", "Session ごとに 1 つ、共有しない"],
        ["永続的な継続", "フォローアップは最後のチェックポイントから復元"],
        ["入力ファイルと成果物", "添付ファイルを受け取り、`outputs/` を返す"],
        ["イベント", "保存してから SSE で配信"],
        ["使用量の計測", "モデル呼び出しごとに 1 件"],
        ["runtime の後片付け", "アイドルの sandbox は回収し、Session の状態は残す"],
      ],
      footnote:
        "mosoo はエンドユーザーを認証しません。MCP サーバーが依頼者を知る必要がある場合は、Thread に独自の `userId` を付けてください。",
    },
    proof: {
      title: "コード、リリース、インシデントの事後分析は公開されています。",
      intro:
        "mosoo は現在 Alpha 版です。今確かめられるのは、コード、リリース、本番環境のステータス、そして mosoo で作られた 2 つのプロジェクトです。",
      source: {
        title: "ソースコード",
        body: "runtime、コンソール、API は Apache 2.0 ライセンスで GitHub に公開されています。技術スタックは Cloudflare Workers、Durable Objects、D1、R2、Containers です。",
      },
      releases: {
        title: "リリース",
        body: "最新は v0.7.0（Alpha）、2026 年 10 月 9 日。v0.5.0 で 4 つ目の runtime として Pi が加わりました。v0.4.0 からは Agent なしで Session を開始できます。",
        link: "すべてのリリースを見る",
        list: [
          ["v0.7.0", "コードベースを整理。公開 Thread API の v1 と v2 は変わっていません。"],
          [
            "v0.5.1",
            "カスタムプロバイダーはモデルプロトコルを宣言し、合わない runtime とモデルの組み合わせは実行前に拒否されます。",
          ],
          ["v0.5.0", "4 つ目の runtime として Pi が加わりました。"],
          ["v0.4.0", "プロジェクトから直接 Session を開始でき、Agent は不要になりました。"],
        ],
      },
      status: {
        title: "本番環境のステータス",
        body: "mosoo.ai/health は、本番環境の Worker の呼び出し結果と、実際の Run の完了状況から作られています。本番環境のサンプルがない runtime は「不明」と表示されます。",
        link: "ステータスページを開く",
      },
      postmortems: {
        title: "事後分析",
        body: "2026 年 7 月から 9 月までの 6 件のインシデント事後分析がリポジトリにあります。それ以降のインシデントは GitHub issue で管理しています。",
        link: "事後分析を読む",
      },
      codexPet: {
        body: "mosoo チームが作成。アップロードしたアバター 1 枚から、Codex ペットの 9 つのアニメーション状態をすべて含む検証済みの ZIP が返ってきます。バックエンドは Thread API で mosoo を呼び出し、トークンがブラウザに渡ることはありません。",
        link: "Codex Pet のユースケースを読む",
      },
      ghfind: {
        body: "AsperforMias が作成。公開されている GitHub リポジトリごとに ghfind の Go ワーカーが Thread を開始し、Agent が保存した 3 つの成果物（分析 JSON、エビデンス JSON、Markdown レポート）を自前の結果ページに表示します。",
        link: "ghfind のユースケースを読む",
        app: "ghfind を開く",
      },
      allUseCases: "すべてのユースケースを見る",
    },
    limits: {
      title: "mosoo はこれらを意図的に提供していません。",
      intro: "作り始める前に、前提として織り込んでください。",
      columns: ["含まれないもの", "代わりの方法"],
      rows: [
        ["Webhook", "SSE でイベントを受け取るか、保存済みの履歴を読み取ってください。"],
        ["ツール実行の対話的な承認", "Agent は Session 専用の sandbox 内で、フルアクセス権限で動作します。"],
        [
          "モデルの提供、チャージ、課金、支出上限",
          "ご自身のプロバイダーキーを使います。料金はプロバイダーから直接請求され、使用量 API でモデル呼び出しごとに確認できます。",
        ],
        [
          "Git のマウント、プライベートリポジトリの認可、ブランチや PR のワークフロー",
          "公開 URL と正確なコミットを渡すか、ファイルをアップロードしてください。",
        ],
        [
          "独自 runtime の持ち込み、コネクタのマーケットプレイス、ローカル MCP サーバー",
          "4 つの runtime から選び、リモートの HTTPS MCP サーバーを接続してください。",
        ],
        [
          "オンラインのファイルエディターやファイルマネージャー",
          "API で入力ファイルをアップロードし、成果物をダウンロードしてください。",
        ],
        ["チャットチャネルや個人用のクラウドコンピューター", "それは別のプロダクト、Mosoo Computer の領域です。"],
      ],
    },
    faqTitle: "使い始める前に確認したいこと",
    final: {
      title: "最初の Session を始めましょう。返信は 1 分後でも 7 日後でもかまいません。",
      consoleTitle: "コンソールで",
      consoleBody:
        "メールアドレスまたは Google でログインします。初回ログイン時にデフォルトプロジェクトが作成されます。プロバイダーキーを追加したら、Session を開始できます。",
      agentTitle: "コーディングエージェントで",
      agentBody:
        "セットアッププロンプトを Codex、Claude Code、OpenCode、Cursor、Cline のいずれかに貼り付けます。CLI をインストールしたあと、コンソールでプロバイダーキーを追加するよう求めます。エージェントが代わりにできない唯一の手順です。",
    },
    footer: {
      signoff: "根を張り、竹の海を育てよう。",
      descriptor: "アプリケーションのバックエンドのための、オープンソースで API ファーストなマネージド Agent runtime。",
      groups: [
        ["プロダクト", ["mosoo コンソール", "Mosoo Computer", "ユースケース", "稼働状況"]],
        [
          "開発者向け",
          [
            "ドキュメント",
            "クイックスタート",
            "API リファレンス v2",
            "OpenAPI v2",
            "OpenAPI v1",
            "CLI",
            "更新履歴",
            "llms.txt",
          ],
        ],
        [
          "オープンソース",
          ["GitHub", "リリース", "製品仕様", "Agent Driver", "ライセンス", "セキュリティ", "インシデントの事後分析"],
        ],
        ["コミュニティ", ["ブログ", "X", "GitHub Issues"]],
      ],
      copyright: "© 2026 LangGenius, Inc.",
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

export function homeHeadline(locale) {
  return copyFor(locale).hero.title;
}

// ---------------------------------------------------------------------------
// HTML

const escapeText = (value) =>
  String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const escapeAttribute = (value) => escapeText(value).replaceAll('"', "&quot;");

// Backticks in the copy mark inline code, as in the copy deck.
function inline(value) {
  const parts = escapeText(value).split("`");
  if (parts.length % 2 === 0) throw new Error(`Unbalanced inline code in: ${value}`);
  return parts.map((part, index) => (index % 2 ? `<code translate="no">${part}</code>` : part)).join("");
}

// FAQ answers stay plain text so the visible answer and the FAQPage JSON-LD
// carry identical text content; code styling and one link are markup only.
const FAQ_CODE = /\/api\/v[12]\b|outputs\/|Idempotency-Key|runtime\.capacity_exhausted/g;
function faqAnswer(value) {
  return escapeText(value)
    .replace(FAQ_CODE, (token) => `<code translate="no">${token}</code>`)
    .replace("cloud.mosoo.ai", `<a href="${LINKS.console}">cloud.mosoo.ai</a>`);
}

function link(href, label, attributes = "") {
  return `<a href="${escapeAttribute(href)}"${attributes}>${inline(label)}</a>`;
}

const codeBlock = (code, className = "") =>
  `<pre${className ? ` class="${className}"` : ""} translate="no"><code>${escapeText(code)}</code></pre>`;

// ---------------------------------------------------------------------------
// The v4b "Paper" home (UI-FORMS §f b-paper; locked slots in v4b/UI-LOCK.md).
//
// UI first, copy last: every string below is PROVISIONAL (UI-FORMS board
// samples and proposal b-paper copy), sized to its slot, and is replaced by
// the content stage. zh and ja reuse the English strings until then. The
// letter in each comment is the slot id in UI-LOCK.md.

const PAPER_EN = {
  hero: {
    // A: line 1 (ink), 1×18. B: lines 2-3 (ink-3), 2×22. H1 total ≤9 words.
    titleInk: "A managed runtime",
    titleSoft: "for the Agents in your backend.",
    // C: 2×34, ≤11 words.
    lead: "One API call starts a Session. Reply days later.",
    // D, E: buttons, 1×12 each.
    primary: "Try mosoo",
    secondary: "Source",
  },
  // U08: three tabs, each with one fragment on the plate and one caption under it.
  stage: [
    {
      tab: "Call.", // A 1×8
      chip: "Codex", // B 1×12, with a runtime glyph
      glyph: "openai-runtime",
      ghost: "Read input.csv, chart the totals and save the report to outputs/", // C 1×56+, cut by the plate edge
      controls: ["Files 2", "Resume ⌄"], // D 2×(1×10)
      title: "One request, one Session.", // E 1×28
      body: "Pick a harness, send a prompt, attach files. The sandbox starts on its own.", // F 2×52
    },
    {
      tab: "Watch.",
      chip: "Running",
      glyph: "live",
      ghost: "Writing outputs/report.md while the events stream back to you",
      controls: ["Events", "Files"],
      title: "Watch it work.",
      body: "Events stream back while the agent runs. Files it writes land in outputs/.",
    },
    {
      tab: "Return.",
      chip: "Same Session",
      glyph: "openai-runtime",
      ghost: "Add last quarter to the report you made on Monday and keep the chart",
      controls: ["Files 2", "Resume ⌄"],
      title: "Come back days later.",
      body: "Send the next turn to the same Session. It picks up where the last one ended.",
    },
  ],
  // U01: A 1×22, B 1×22 (≤5 words each), C 1×50 (≤10 words).
  voice: { a: "Close the laptop.", b: "The session waits.", sub: "Pick it up a minute or seven days later." },
  // U11 ×2: A 1×18 mono caps, B 2×30 (≤10 words), C 2×32 (≤8 words).
  said: [
    {
      cat: "Come back later",
      quote: "“Add last quarter to the report you made on Monday.”",
      result: "Monday’s Session picks it up, files and history intact.",
    },
    {
      cat: "Start from code",
      quote: "“Chart input.csv and save the report.”",
      result: "One request, a fresh sandbox, a file in outputs/.",
    },
  ],
  // U13: A 1×14, B 2×22 (two tones), C ×4 1×18, D ×4 1×14, E 1×44.
  supply: {
    eyebrow: "Harnesses",
    titleInk: "Bring the agent.",
    titleSoft: "We run the Session.",
    cells: [
      { name: "Claude Agent SDK", cat: "Anthropic", glyph: "claude-agent-sdk" },
      { name: "OpenAI Codex", cat: "OpenAI", glyph: "openai-runtime" },
      { name: "OpenCode", cat: "Open source", glyph: "acp-fallback" },
      { name: "Pi", cat: "Open source", glyph: "pi" },
    ],
    wide: "Your provider key, proxied on every request",
  },
  // U16: A 2×18 (two tones); questions 1-2×44; answers ≤40 words (FAQ below).
  faq: { titleInk: "Questions", titleSoft: "before you wire it in." },
  // Close: A 2×26 display 48; buttons reuse the hero's; F fine print 1×52.
  close: { title: "Start your first Session.", fine: "mosoo is in Alpha. Public APIs may still change." },
};

const PAPER = { en: PAPER_EN, zh: PAPER_EN, ja: PAPER_EN };

const GITHUB_MARK =
  '<svg viewBox="0 0 16 16" aria-hidden="true" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>';

const glyph = (id) => `<img class="pp-glyph" src="/brand/runtime/${id}.svg" alt="" width="18" height="18">`;

function renderPaperActions(copy) {
  return `<div class="pp-actions">
<a class="pp-btn pp-btn-ink" href="${LINKS.console}">${escapeText(copy.hero.primary)}</a>
<a class="pp-btn pp-btn-line" href="${LINKS.github}">${GITHUB_MARK}${escapeText(copy.hero.secondary)}</a>
</div>`;
}

function renderPaperHero(copy) {
  const tabs = copy.stage
    .map(
      (step, i) =>
        `<button class="pp-tab" type="button" role="tab" id="pp-tab-${i}" aria-controls="pp-panel-${i}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-tab><span class="pp-tab-track"><span class="pp-tab-bar" data-tab-bar></span></span>${escapeText(step.tab)}</button>`,
    )
    .join("\n");
  const frags = copy.stage
    .map((step, i) => {
      const icon = step.glyph === "live" ? '<span class="pp-live"></span>' : glyph(step.glyph);
      return `<div class="pp-frag" data-frag data-product-ui aria-hidden="true"${i === 0 ? "" : " hidden"}>
<span class="pp-chip"><span class="pp-chip-ic">${icon}</span>${escapeText(step.chip)}</span>
<p class="pp-ghost">${escapeText(step.ghost)}</p>
<div class="pp-ctl"><span class="pp-plus">+</span>${step.controls.map((c) => `<span class="pp-pill">${escapeText(c)}</span>`).join("")}</div>
</div>`;
    })
    .join("\n");
  const panels = copy.stage
    .map(
      (step, i) =>
        `<div class="pp-cap" role="tabpanel" id="pp-panel-${i}" aria-labelledby="pp-tab-${i}" data-panel${i === 0 ? "" : " hidden"}><h2>${escapeText(step.title)}</h2><p>${escapeText(step.body)}</p></div>`,
    )
    .join("\n");
  return `<section class="pp-hero pp-wrap" aria-labelledby="hero-title">
<div class="pp-hero-top">
<h1 id="hero-title" class="pp-h1 pp-display">${escapeText(copy.hero.titleInk)} <span class="pp-soft">${escapeText(copy.hero.titleSoft)}</span></h1>
<div class="pp-hero-side">
<p class="pp-lead">${escapeText(copy.hero.lead)}</p>
${renderPaperActions(copy)}
</div>
</div>
<div class="pp-stage" data-effect="tabs">
<div class="pp-tabs" role="tablist">
${tabs}
</div>
<div class="pp-plate">
${frags}
</div>
${panels}
</div>
</section>`;
}

function renderPaperVoice(copy) {
  const line = (text) =>
    `<span class="pp-fill-line"><span class="pp-fill-base">${escapeText(text)}</span><span class="pp-fill-ink" aria-hidden="true" data-fill-ink>${escapeText(text)}</span></span>`;
  return `<section class="pp-section pp-wrap pp-voice" data-effect="fill" aria-label="${escapeAttribute(`${copy.voice.a} ${copy.voice.b}`)}">
<p class="pp-voice-q pp-display">${line(copy.voice.a)}${line(copy.voice.b)}</p>
<p class="pp-voice-sub">${escapeText(copy.voice.sub)}</p>
</section>`;
}

function renderPaperSaid(copy) {
  const cards = copy.said
    .map(
      (card) => `<figure class="pp-said-card">
<figcaption class="pp-said-cat">${escapeText(card.cat)}</figcaption>
<blockquote>${escapeText(card.quote)}</blockquote>
<p class="pp-said-res">${escapeText(card.result)}</p>
</figure>`,
    )
    .join("\n");
  return `<section class="pp-section pp-wrap pp-said" aria-label="Sessions">
${cards}
</section>`;
}

function renderPaperSupply(copy) {
  const cells = copy.supply.cells
    .map(
      (cell) =>
        `<div><span class="pp-ib">${glyph(cell.glyph)}</span><div><p class="pp-mx-name">${escapeText(cell.name)}</p><p class="pp-mx-cat">${escapeText(cell.cat)}</p></div></div>`,
    )
    .join("\n");
  return `<section id="runtimes" class="pp-section pp-wrap" aria-labelledby="supply-title">
<div class="pp-supply">
<p class="pp-eyebrow"><i></i>${escapeText(copy.supply.eyebrow)}</p>
<h2 id="supply-title" class="pp-h2-40 pp-display">${escapeText(copy.supply.titleInk)}<br><span class="pp-soft">${escapeText(copy.supply.titleSoft)}</span></h2>
<div class="pp-mx" data-product-ui>
<i class="pp-hdl pp-hdl-1"></i><i class="pp-hdl pp-hdl-2"></i><i class="pp-hdl pp-hdl-3"></i><i class="pp-hdl pp-hdl-4"></i>
${cells}
<div class="pp-mx-wide"><span class="pp-ib"><img class="pp-glyph" src="/brand/runtime/key.svg" alt="" width="18" height="18"></span><p class="pp-mx-name">${escapeText(copy.supply.wide)}</p></div>
</div>
</div>
</section>`;
}

function renderPaperFaq(locale, copy) {
  const indicator = `<svg class="pp-ind" viewBox="${OUTLINE.faq.viewBox}" aria-hidden="true"><path d="${OUTLINE.faq.d}" stroke="currentColor" stroke-width="1"/></svg>`;
  const rows = FAQ[locale]
    .map(
      ({ q, a }, i) =>
        `<details class="pp-q" name="faq"${i === 0 ? " open" : ""}><summary>${indicator}${escapeText(q)}</summary><p class="pp-a">${faqAnswer(a)}</p></details>`,
    )
    .join("\n");
  return `<section id="faq" class="pp-section pp-wrap pp-faq" aria-labelledby="faq-title">
<h2 id="faq-title" class="pp-h2-44 pp-display">${escapeText(copy.faq.titleInk)}<br><span class="pp-soft">${escapeText(copy.faq.titleSoft)}</span></h2>
<div class="pp-rows">
${rows}
</div>
</section>`;
}

function renderPaperClose(copy) {
  return `<section id="start" class="pp-section pp-wrap pp-close" aria-labelledby="close-title">
<h2 id="close-title" class="pp-display">${escapeText(copy.close.title)}</h2>
${renderPaperActions(copy)}
<p class="pp-fine">${escapeText(copy.close.fine)}</p>
</section>`;
}

const HOME_LANGUAGE_HREFS = { en: "/en", zh: "/zh", ja: "/ja" };

export function renderHomeFallback(locale) {
  copyFor(locale);
  const copy = PAPER[locale];
  return `<div class="pp-page">
${renderPaperNav({ locale })}
<main id="main" tabindex="-1">
${renderPaperHero(copy)}
${renderPaperVoice(copy)}
${renderPaperSaid(copy)}
${renderPaperSupply(copy)}
${renderPaperFaq(locale, copy)}
${renderPaperClose(copy)}
</main>
${renderPaperFooter({ locale, languageHrefs: HOME_LANGUAGE_HREFS })}
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

// Scoped to .mosoo-fallback, which only exists until React mounts. Warm paper
// and forest ink match the landing palette; no web font beyond Geist, and CJK
// text uses the platform fonts.
// The page's own stylesheet (paper.css) arrives as a <link> from the Vite
// build; this only keeps the first paint on paper instead of white.
export const HOME_FALLBACK_STYLE = `<style>html,body{margin:0;background:#f8f7f4}</style>`;
