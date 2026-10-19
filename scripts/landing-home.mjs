// Home page copy for the crawlable static HTML in /en, /zh and /ja: the
// fallback that non-JS crawlers and coding agents read inside #root, and the
// JSON-LD @graph. React replaces #root on mount, so this is what a reader sees
// without JavaScript, and what everyone sees for the first moments on a slow
// network: its first screen mirrors the React hero's geometry (centered
// headline in the display face, the same buttons, a one-row header) so the
// page does not re-lay itself out when React takes over.
//
// Copy source: the v1 copy deck (sections 1 to 16) as revised in review,
// drawn from langgenius/mosoo @ 7cb9866 (README, docs/SPEC.md, docs/prd).
// The strings match the React dictionaries (routes/login/landing/*i18n.ts).
// The FAQ strings are the exact strings the FAQPage JSON-LD carries, and the
// React FAQ must show the same text. Do not add facts here that the main repo
// does not state.
//
// "|" in a Chinese or Japanese heading or label marks a phrase edge; inline()
// renders it as <wbr>, and the stylesheet keeps those elements from breaking
// anywhere else (the same rule as .cjk-phrase in app.css).

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

// The product stage's one example (product-visual.tsx): a CSV analysis on
// Claude Agent SDK. Code stays ASCII; the user messages are localized.
const THREAD_ID = "01JC9W8Q4N7K2M5R3T6V8X0Y1Z";
const FILE_ID = "01JC9W2D5F8H1K4M7P0R3T6V9X";
const INSTRUCTIONS = "Analyze the CSV and save the results in outputs/.";
const DAY_ONE_COMMAND = "cp session-files/sales.csv . && python analyze.py sales.csv";
const FOLLOW_UP_COMMAND = "python analyze.py sales.csv --by channel";

function startSessionRequest(message) {
  return [
    "curl https://cloud.mosoo.ai/api/v2/projects/$MOSOO_PROJECT_ID/threads \\",
    '  -H "Authorization: Bearer $MOSOO_API_TOKEN" \\',
    '  -H "Content-Type: application/json" \\',
    '  -H "Idempotency-Key: sales-q3-analysis" \\',
    "  -d '{",
    '    "configuration": {',
    '      "type": "inline",',
    '      "harness": "claude-agent-sdk",',
    '      "provider": "anthropic",',
    '      "model": "claude-sonnet-5",',
    `      "instructions": "${INSTRUCTIONS}"`,
    "    },",
    '    "input": {',
    '      "type": "user.message",',
    '      "content": [{',
    '        "type": "text",',
    `        "text": "${message}"`,
    "      }]",
    "    },",
    '    "resources": [',
    `      { "type": "file", "file_id": "${FILE_ID}" }`,
    "    ]",
    "  }'",
  ].join("\n");
}

const PROTOCOLS = ["Chat Completions", "Responses", "Anthropic Messages", "Google Gemini"];

// docs/prd/runtime-catalog.md: OpenCode and Pi accept all four protocols,
// OpenAI Runtime only Responses, Claude Agent SDK only Anthropic Messages.
const RUNTIMES = [
  { name: "OpenAI Codex", id: "openai-runtime", accepts: ["Responses"] },
  { name: "Claude Agent SDK", id: "claude-agent-sdk", accepts: ["Anthropic Messages"] },
  { name: "OpenCode", id: "acp-fallback", accepts: PROTOCOLS },
  { name: "Pi", id: "pi", accepts: PROTOCOLS },
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

const LANGUAGES = [
  { locale: "en", lang: "en", label: "English", short: "EN" },
  { locale: "zh", lang: "zh-CN", label: "简体中文", short: "中" },
  { locale: "ja", lang: "ja", label: "日本語", short: "日" },
];

const RELEASE_DATES = {
  "v0.7.0": "2026-10-09",
  "v0.5.0": "2026-10-08",
  "v0.4.0": "2026-09-30",
};

const FAQ = {
  "en": [
    {
      "q": "What is mosoo?",
      "a": "mosoo is an open-source, API-first managed Agent runtime for application backends. It runs OpenAI Codex, Claude Agent SDK, OpenCode, and Pi behind one API, and each Session runs in its own sandbox. Your backend starts the work and reads the results. mosoo handles execution, files, events, and usage. mosoo is in Alpha."
    },
    {
      "q": "Do I need to create or publish an Agent first?",
      "a": "No. On /api/v2, one request carries the harness, provider, model, instructions, and input, and mosoo starts a durable Session without creating an Agent. Saved Agent presets are optional. You need one to attach Skills, MCP servers, or a non-default Environment."
    },
    {
      "q": "Which runtimes and models can I use?",
      "a": "There are 4 runtimes: OpenAI Codex, Claude Agent SDK, OpenCode, and Pi. Models run on your own keys for Anthropic, OpenAI, DeepSeek, Gemini, Qwen, Kimi, Zhipu, MiniMax, or OpenCode Zen, or on a custom OpenAI-compatible HTTPS endpoint. Each runtime accepts specific model protocols, and mosoo rejects a mismatched pair before anything runs."
    },
    {
      "q": "Who pays for model usage?",
      "a": "You do, directly. Model keys belong to your Project, and the provider bills your account. mosoo supplies no models and sets no spending cap. The usage API and the Usage page show measured tokens and cost estimates. They are not invoices."
    },
    {
      "q": "What happens when I reply hours or days later?",
      "a": "The reply continues the same Session. A follow-up 1 minute or 7 days after a completed turn has the same semantics, even after the sandbox was reclaimed, though a cold start can take longer. mosoo restores the working directory, the harness’s native conversation, the frozen configuration, and recorded artifacts from the last committed checkpoint. Live processes are not carried over. If the checkpoint can’t be restored, the follow-up fails with an error instead of starting empty."
    },
    {
      "q": "Do my API keys enter the sandbox?",
      "a": "No. Provider keys and MCP credentials stay outside the sandbox. The runtime reaches models and MCP servers through mosoo’s proxies, which add the credential on each request. Environment variables are different. Code in the sandbox can read them, so keep model keys in Providers and tool tokens in MCP connections."
    },
    {
      "q": "How do I follow progress and get results?",
      "a": "Read the Thread’s status and saved event history, or open an SSE stream that starts with the latest saved events. Stable event IDs let a reconnecting client skip what it already has. Files the Agent writes under outputs/ become downloadable artifacts. There are no Webhooks."
    },
    {
      "q": "How long can a turn run?",
      "a": "Up to 2 hours. A Session runs one turn at a time. Input sent to a busy Session is rejected, and there is no input queue. If a turn needs a new sandbox and no capacity is free, it fails at once: its Run ends with the retryable runtime.capacity_exhausted error, and mosoo does not queue it."
    },
    {
      "q": "Can I retry a request without running the work twice?",
      "a": "Yes, for creation and follow-ups. Send an Idempotency-Key header. For 24 hours, the same key and body return the original result without new work, and a changed body is rejected. Idempotency does not make side effects in external tools exactly-once."
    },
    {
      "q": "Is mosoo open source, and is it ready for production?",
      "a": "mosoo is licensed under Apache 2.0, and the source is on GitHub. It is in Alpha, so public APIs and product behavior may still change. /api/v1 stays wire-compatible, and a change that can’t stay compatible ships as a new API version. The quickest way to try mosoo is the hosted console at cloud.mosoo.ai. The README explains how to run it locally for development."
    }
  ],
  "zh": [
    {
      "q": "mosoo 是什么？",
      "a": "mosoo 是开源、API 优先的托管 Agent runtime，面向应用后端。它用一个 API 运行 OpenAI Codex、Claude Agent SDK、OpenCode 和 Pi，每个 Session 都在自己的 sandbox 中执行。你的后端发起任务、读取结果，执行、文件、事件和用量由 mosoo 负责。mosoo 目前处于 Alpha 阶段。"
    },
    {
      "q": "需要先创建或发布 Agent 吗？",
      "a": "不需要。在 /api/v2 上，一个请求就能带上 harness、模型供应商、模型、指令和输入，mosoo 会直接启动持久 Session，不会创建 Agent。保存的 Agent 预设是可选的，挂载技能、MCP 服务器或使用非默认环境时才需要它。"
    },
    {
      "q": "可以用哪些 runtime 和模型？",
      "a": "共有 4 个 runtime：OpenAI Codex、Claude Agent SDK、OpenCode 和 Pi。模型使用你自己的密钥，可选 Anthropic、OpenAI、DeepSeek、Gemini、Qwen、Kimi、Zhipu、MiniMax 和 OpenCode Zen，也可以接入自定义的 OpenAI 兼容 HTTPS 端点。每个 runtime 只接受特定的模型协议，不匹配的组合会在执行前被拒绝。"
    },
    {
      "q": "模型费用由谁支付？",
      "a": "由你直接支付。模型密钥属于你的项目，由模型供应商向你的账户计费。mosoo 不提供模型，也不设花费上限。用量 API 和用量页面显示实测的 token 数和估算成本，它们不是账单。"
    },
    {
      "q": "隔几小时或几天再回复，会怎样？",
      "a": "回复会在同一个 Session 里继续。在一个 turn 完成 1 分钟后还是 7 天后回复，语义完全相同，即使 sandbox 已被回收也是如此，只是冷启动可能更慢。mosoo 会从最近一次提交的检查点恢复工作目录、harness 的原生对话、冻结的配置和已记录的产出物。运行中的进程不会保留。检查点无法恢复时，后续消息会明确报错，不会从空白状态开始。"
    },
    {
      "q": "我的 API 密钥会进入 sandbox 吗？",
      "a": "不会。模型供应商密钥和 MCP 凭据留在 sandbox 之外，runtime 通过 mosoo 的代理访问模型和 MCP 服务器，代理在每次请求时注入凭据。环境变量则不同，sandbox 里的代码可以读取它们，所以模型密钥请放在模型供应商设置里，工具令牌请放在 MCP 连接里。"
    },
    {
      "q": "怎样跟踪进度、拿到结果？",
      "a": "读取 Thread 的状态和已保存的事件历史，或者打开 SSE 流，它会先发送最新的已保存事件。稳定的事件 ID 让重连的客户端可以跳过已经收到的事件。Agent 写到 outputs/ 下的文件会成为可下载的产出物。mosoo 不提供 Webhook。"
    },
    {
      "q": "一个 turn 最长能运行多久？",
      "a": "最长 2 小时。一个 Session 同一时间只运行一个 turn。Session 忙碌时发来的输入会被拒绝，也没有输入队列。如果某个 turn 需要新的 sandbox 而没有空闲容量，它会立即失败：对应的 Run 以可重试的 runtime.capacity_exhausted 错误结束，mosoo 不会把它排队。"
    },
    {
      "q": "重试请求会不会让任务执行两次？",
      "a": "创建请求和后续消息都不会，前提是带上 Idempotency-Key 请求头。24 小时内，相同的 key 和请求体会返回原来的结果，不会产生新的执行；请求体变了则会被拒绝。幂等不保证外部工具的副作用只发生一次。"
    },
    {
      "q": "mosoo 开源吗？可以用于生产环境吗？",
      "a": "mosoo 以 Apache 2.0 许可证开源，源码在 GitHub 上。它目前处于 Alpha 阶段，公开 API 和产品行为仍可能变化。/api/v1 保持线上兼容，无法兼容的改动会作为新的 API 版本发布。最快的试用方式是托管控制台 cloud.mosoo.ai。README 也说明了如何在本地运行，方便开发。"
    }
  ],
  "ja": [
    {
      "q": "mosoo とは何ですか？",
      "a": "mosoo は、アプリケーションのバックエンドのための、オープンソースで API ファーストなマネージド Agent runtime です。OpenAI Codex、Claude Agent SDK、OpenCode、Pi を 1 つの API で実行し、Session ごとに専用の sandbox を使います。バックエンドはタスクを開始して結果を受け取り、実行、ファイル、イベント、使用量は mosoo が担います。mosoo は現在 Alpha 版です。"
    },
    {
      "q": "先に Agent を作成または公開する必要はありますか？",
      "a": "いいえ。/api/v2 では、harness、プロバイダー、モデル、指示、入力を 1 つのリクエストに含めるだけで、mosoo は Agent を作成せずに永続的な Session を開始します。保存済みの Agent プリセットは任意で、スキルや MCP サーバーを使う場合、またはデフォルト以外の Environment を使う場合に必要です。"
    },
    {
      "q": "どの runtime とモデルを使えますか？",
      "a": "runtime は OpenAI Codex、Claude Agent SDK、OpenCode、Pi の 4 つです。モデルはご自身のキーで利用し、Anthropic、OpenAI、DeepSeek、Gemini、Qwen、Kimi、Zhipu、MiniMax、OpenCode Zen のほか、OpenAI 互換のカスタム HTTPS エンドポイントも使えます。runtime ごとに対応するモデルプロトコルが決まっており、合わない組み合わせは実行前に拒否されます。"
    },
    {
      "q": "モデルの利用料金は誰が支払いますか？",
      "a": "お客様が直接支払います。モデルのキーはプロジェクトに属し、プロバイダーがお客様のアカウントに請求します。mosoo はモデルを提供せず、支出上限も設けません。使用量 API と使用量ページには計測したトークン数と推定コストが表示されますが、請求書ではありません。"
    },
    {
      "q": "数時間後や数日後に返信するとどうなりますか？",
      "a": "同じ Session で続きが実行されます。turn の完了から 1 分後でも 7 日後でも、sandbox が回収された後でも、返信の意味は変わりません。ただし、コールドスタートでは開始まで時間がかかることがあります。mosoo は最後にコミットされたチェックポイントから、作業ディレクトリ、harness のネイティブな会話、固定された設定、記録済みの成果物を復元します。実行中のプロセスは引き継がれません。チェックポイントを復元できない場合は、空の状態で始めずに明示的なエラーになります。"
    },
    {
      "q": "API キーは sandbox に入りますか？",
      "a": "入りません。プロバイダーキーと MCP の認証情報は sandbox の外に置かれ、runtime は mosoo のプロキシ経由でモデルや MCP サーバーにアクセスします。認証情報はプロキシがリクエストごとに付与します。環境変数は例外で、sandbox 内のコードから読み取れます。モデルのキーはプロバイダー設定に、ツールのトークンは MCP 接続に保存してください。"
    },
    {
      "q": "進捗の確認と結果の取得はどうしますか？",
      "a": "Thread のステータスと保存済みのイベント履歴を読み取るか、SSE ストリームを開きます。SSE は最新の保存済みイベントから送信され、安定したイベント ID によって、再接続したクライアントは受信済みのイベントをスキップできます。Agent が outputs/ に書き込んだファイルは、ダウンロードできる成果物になります。Webhook はありません。"
    },
    {
      "q": "1 つの turn はどのくらい実行できますか？",
      "a": "最長 2 時間です。1 つの Session で同時に実行できる turn は 1 つだけです。実行中の Session に送った入力は拒否され、入力キューはありません。turn に新しい sandbox が必要で空き容量がない場合、その turn はすぐに失敗し、Run は再試行可能な runtime.capacity_exhausted エラーで終わります。mosoo はその turn をキューに入れません。"
    },
    {
      "q": "リクエストを再試行すると、処理が二重に実行されませんか？",
      "a": "作成とフォローアップでは、Idempotency-Key ヘッダーを付ければ二重に実行されません。24 時間以内に同じキーと同じ本文を送ると、新しい処理を行わずに元の結果が返り、本文が異なる場合は拒否されます。ただし、外部ツールの副作用が 1 回だけになることまでは保証しません。"
    },
    {
      "q": "mosoo はオープンソースですか？本番環境で使えますか？",
      "a": "mosoo は Apache 2.0 ライセンスのオープンソースで、ソースコードは GitHub にあります。現在は Alpha 版のため、公開 API や製品の動作は変わる可能性があります。/api/v1 は互換性を維持し、互換性を保てない変更は新しい API バージョンとして公開されます。すぐに試すなら、ホスト版のコンソール cloud.mosoo.ai が最も手軽です。開発用にローカルで動かす手順は README にあります。"
    }
  ]
};

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
      main: "Main",
      menu: "Menu",
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
      footer: "Footer",
    },
    cta: {
      primary: "Try mosoo",
      quickstart: "Read the quickstart",
      source: "View source",
      readScript: "Read the install script",
      apiReference: "Open the v2 API reference",
    },
    alpha: "mosoo is in Alpha. Public APIs may still change.",
    hero: {
      product: "An open-source, API-first managed Agent runtime",
      audience: "for application backends.",
      lead: "Start an agent task with one API call, then continue the same Session a minute or 7 days later.",
      agentQuestion: "Using a coding agent?",
      agentLink: "Read the setup prompt",
      runtimes: "One API, 4 runtimes:",
    },
    stage: {
      title: "One request starts a Session. A follow-up continues it 2 days later.",
      note: "Example values. Field names and event types come from the v2 OpenAPI document.",
      start: "Start a Session",
      backend: "Your backend",
      startCaption:
        "With a provider key in your Project, one request starts the Session. Keep the `thread.id` it returns.",
      fullRequest: "Show the full request",
      requestNotes: [
        ["Authorization", "A Project API key. It starts with `msp_`, is shown once, and stays on your backend."],
        ["harness", "The runtime for this Session: openai-runtime, claude-agent-sdk, acp-fallback, or pi."],
        ["model", "A model your provider key can use. Model IDs change often, so check your Project first."],
        ["instructions", "What the Agent does in this Session."],
        ["resources", "Files uploaded first with POST /api/v2/projects/{projectId}/files."],
        ["Idempotency-Key", "Retry with the same key for 24 hours without running the work twice."],
      ],
      run: "mosoo runs the turn",
      stream: "Event stream (SSE)",
      runCaption:
        "The Agent runs code in the Session’s own sandbox, and your keys stay outside it. Events are saved, then streamed. The turn ends with artifacts, usage, and a checkpoint.",
      artifacts: "Artifacts in outputs/",
      allDayOne: "Show all 12 events",
      later: "2 days later",
      culm: ["Turn committed", "Sandbox reclaimed while idle", "Restored from the last checkpoint"],
      laterCaption:
        "Reply whenever you’re ready. A follow-up to the same `thread.id` continues the Session, and `sales.csv`, copied into the working directory on day 1, comes back with the checkpoint.",
      followUp: "Follow-up",
      sameThread: "Same thread.id",
      allFollowUp: "Show all 7 events",
      firstMessage: "Which regions grew fastest last quarter?",
      followUpMessage: "Now split it by sales channel. Keep the same chart style.",
    },
    wall: {
      title: "Every Session runs one of 4 runtimes on your own model key.",
      intro:
        "Pick the runtime and model per Session. Models run on your keys for the providers below, or on a custom OpenAI-compatible endpoint at a public HTTPS URL. mosoo checks that the runtime, model, and protocol fit before anything runs.",
      matrix: "Runtimes and the model protocols they accept",
      runtime: "Runtime",
      apiId: "API id",
      accepted: "Accepted",
      notAccepted: "Not accepted",
      runtimeNotes: [
        "Claude Agent SDK runs Anthropic models only.",
        "Pi takes text input only. Files reach it through the Session workspace.",
      ],
      providers: "Model providers (your keys)",
      customProvider: "Custom OpenAI-compatible endpoint (public HTTPS)",
      notes: [
        "Provider keys belong to your Project, and the provider bills your account directly.",
        "Names and logos identify compatible services and don’t imply a partnership or endorsement.",
      ],
    },
    split: {
      title: "Your app keeps its users. mosoo runs the Agent.",
      boundary: [
        ["Your app", "Calls the API from your backend"],
        ["mosoo", "Holds provider keys and MCP credentials"],
        ["Session sandbox", "One per Session. Keys never enter it."],
      ],
      boundaryLinks: ["Project API key", "Expiring grants only"],
      app: "Your app keeps",
      mosoo: "mosoo runs",
      appRows: [
        ["Business logic", "What the task is for and what happens to the result"],
        ["End-user authentication", "mosoo never signs your users in"],
        ["Business queues", "When work starts and in what order"],
        ["Result validation", "You decide whether the report is right"],
        ["Business storage", "Keep the `thread.id` and whatever you extract"],
        ["UI", "The screens your users see"],
      ],
      mosooRows: [
        [
          "Agent execution",
          "The harness runs each turn: model calls, code, tools",
          "Inline configuration needs no saved Agent. A runtime and protocol that don’t match are rejected before anything runs.",
        ],
        [
          "Sandboxing",
          "One sandbox per Session, never shared",
          "Provider keys and MCP credentials stay outside it. Code inside can read Environment variables.",
        ],
        [
          "Durable continuation",
          "Follow-ups restore the last checkpoint",
          "A reply 1 minute or 7 days later has the same semantics. If the checkpoint can’t be restored, the follow-up fails with an error.",
        ],
        [
          "Input files and artifacts",
          "Attachments mount read-only. Files written under `outputs/` become artifacts.",
          "Other workspace files come back with the checkpoint but aren’t listed for download.",
        ],
        [
          "Events",
          "Saved first, then streamed over SSE",
          "Stable event IDs let a client reconnect without duplicates. There are no Webhooks.",
        ],
        ["Usage measurement", "One record per model call", "Measured tokens and cost estimates. They are not invoices."],
        [
          "Runtime cleanup",
          "Idle sandboxes are reclaimed; the Session’s state stays",
          "A turn succeeds only once its events, usage, and a checkpoint are committed. Until then, the sandbox is not reclaimed.",
        ],
      ],
      footnote:
        "mosoo doesn’t authenticate your end users. If your MCP servers need to know who asked, label the Thread with your own `userId`.",
    },
    proof: {
      title: "The source, the releases, and production status are public.",
      intro:
        "The claims on this page come from the main repository: its README, product spec, and OpenAPI documents. mosoo is in Alpha.",
      spec: "Read the product spec",
      source: {
        title: "Source",
        body: "The runtime, console, and API are Apache 2.0 on GitHub. The stack: Cloudflare Workers, Durable Objects, D1, R2, and Containers.",
      },
      releases: {
        title: "Releases",
        link: "View all releases",
        latest: "Latest",
        list: [
          ["v0.7.0", "Smaller codebase. The public Thread API v1 and v2 did not change."],
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
        byline: "Built by the mosoo team.",
        body: "An uploaded avatar comes back as a validated ZIP with all 9 Codex pet animation states. The backend calls mosoo through the Thread API, and the token never reaches the browser.",
        link: "Read the Codex Pet use case",
      },
      ghfind: {
        byline: "Built by AsperforMias.",
        body: "For each public GitHub repository, ghfind’s Go worker starts a Thread and turns the 3 artifacts the Agent saves (analysis JSON, evidence JSON, and a Markdown report) into its own result page.",
        link: "Read the ghfind use case",
        app: "Open ghfind",
      },
      allUseCases: "See all use cases",
    },
    limits: {
      title: "mosoo has no Webhooks, tool approvals, or billing.",
      intro: "Plan around these before you build. Each row says what to use instead.",
      columns: ["Not included", "Use instead"],
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
      title: "Start your first Session",
      consoleTitle: "In the console",
      consoleSteps: [
        "Sign in with email or Google. Your first sign-in creates a Default Project.",
        "Add a provider key.",
        "Start a Session.",
      ],
      agentTitle: "In your coding agent",
      agentBody:
        "Paste the setup prompt into Codex, Claude Code, OpenCode, Cursor, or Cline. It installs the CLI, then asks you to add a provider key in the console, the one step it can’t do for you.",
      prompt: "Read the setup prompt",
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
        ["Open source", ["GitHub", "Releases", "Product spec", "Agent Driver", "License", "Incident postmortems"]],
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
      main: "主导航",
      menu: "菜单",
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
      footer: "页脚",
    },
    cta: {
      primary: "试用 mosoo",
      quickstart: "阅读|快速开始",
      source: "查看源码",
      readScript: "查看安装脚本",
      apiReference: "查看 v2 API 参考",
    },
    alpha: "mosoo 目前处于 Alpha 阶段，|公开 API 仍可能变化。",
    hero: {
      product: "开源、|API 优先的|托管 Agent runtime，|",
      audience: "面向|应用后端。",
      lead: "一次 API 调用启动 Agent 任务，|1 分钟后或 7 天后|都能在同一个 Session 里|接着做。",
      agentQuestion: "在用编码智能体？",
      agentLink: "查看|设置提示",
      runtimes: "一个 API，4 个 runtime：",
    },
    stage: {
      title: "一个请求|启动 Session，|2 天后|再发一条消息，|接着做。",
      note: "示例数据。字段名和事件类型来自 v2 OpenAPI 文档。",
      start: "启动 Session",
      backend: "你的后端",
      startCaption: "项目里有模型供应商密钥后，一个请求就能启动 Session。保存返回的 `thread.id`。",
      fullRequest: "查看|完整请求",
      requestNotes: [
        ["Authorization", "Project API 密钥。它以 `msp_` 开头，只显示一次，只放在你的后端。"],
        ["harness", "这个 Session 使用的 runtime：openai-runtime、claude-agent-sdk、acp-fallback 或 pi。"],
        ["model", "你的模型供应商密钥可用的模型。模型 ID 经常变化，请先在项目里确认。"],
        ["instructions", "Agent 在这个 Session 里要做的事。"],
        ["resources", "先通过 POST /api/v2/projects/{projectId}/files 上传的文件。"],
        ["Idempotency-Key", "24 小时内用同一个 key 重试，不会重复执行。"],
      ],
      run: "mosoo 执行|这个 turn",
      stream: "事件流（SSE）",
      runCaption:
        "Agent 在这个 Session 自己的 sandbox 里运行代码，你的密钥始终在 sandbox 之外。事件先保存再推送。turn 结束时留下产出物、用量和检查点。",
      artifacts: "outputs/ 里的|产出物",
      allDayOne: "查看|全部 12 个事件",
      later: "2 天后",
      culm: ["turn 已提交", "sandbox 闲置后|已回收", "从最近一次|检查点|恢复"],
      laterCaption:
        "准备好了再回复。向同一个 `thread.id` 发送后续消息，Session 就会继续；第 1 天复制到工作目录的 `sales.csv` 会随检查点一起恢复。",
      followUp: "后续消息",
      sameThread: "同一个 thread.id",
      allFollowUp: "查看|全部 7 个事件",
      firstMessage: "上个季度哪些地区增长最快？",
      followUpMessage: "再按销售渠道拆分一下，图表样式保持不变。",
    },
    wall: {
      title: "每个 Session 选用 4 个 runtime 之一，|使用你自己的|模型密钥。",
      intro:
        "每个 Session 单独选择 runtime 和模型。模型使用你自己的密钥，可选下列模型供应商，也可以接入公网 HTTPS 地址上的自定义 OpenAI 兼容端点。mosoo 会在执行前检查 runtime、模型和协议是否匹配。",
      matrix: "runtime 与|可接受的|模型协议",
      runtime: "Runtime",
      apiId: "API id",
      accepted: "支持",
      notAccepted: "不支持",
      runtimeNotes: ["Claude Agent SDK 只运行 Anthropic 模型。", "Pi 只接受文本输入，文件通过 Session 工作区传给它。"],
      providers: "模型供应商|（使用你的密钥）",
      customProvider: "自定义 OpenAI 兼容端点|（公网 HTTPS）",
      notes: ["模型供应商密钥属于你的项目，费用由供应商直接向你的账户收取。", "名称和标志仅用于标明兼容的服务，不代表合作或背书。"],
    },
    split: {
      title: "你的应用管用户，|mosoo 运行 Agent。",
      boundary: [
        ["你的应用", "从你的后端调用 API"],
        ["mosoo", "保管模型供应商密钥和 MCP 凭据"],
        ["Session 的 sandbox", "每个 Session 一个，密钥从不进入。"],
      ],
      boundaryLinks: ["Project API 密钥", "只有会过期的授权"],
      app: "你的应用负责",
      mosoo: "mosoo 负责",
      appRows: [
        ["业务逻辑", "任务为什么做，结果怎么用"],
        ["终端用户|认证", "mosoo 不替你的用户登录"],
        ["业务队列", "什么时候开始、按什么顺序"],
        ["结果校验", "报告对不对，由你判断"],
        ["业务存储", "保存 `thread.id` 和你提取的结果"],
        ["界面", "用户看到的页面"],
      ],
      mosooRows: [
        [
          "Agent 执行",
          "harness 运行每个 turn：模型调用、代码、工具",
          "inline 配置不需要事先保存 Agent。runtime 与协议不匹配时，会在执行前被拒绝。",
        ],
        ["sandbox 隔离", "每个 Session 一个 sandbox，从不共享", "模型供应商密钥和 MCP 凭据留在它之外。sandbox 里的代码可以读取环境变量。"],
        ["持久续接", "后续消息从最近一次检查点恢复", "1 分钟后或 7 天后回复，语义相同。检查点无法恢复时，后续消息会明确报错。"],
        [
          "输入文件|与产出物",
          "附件只读挂载，写到 `outputs/` 下的文件成为产出物",
          "其他工作区文件会随检查点恢复，但不会列为可下载文件。",
        ],
        ["事件", "先保存，再通过 SSE 推送", "稳定的事件 ID 让客户端重连时不会收到重复事件。mosoo 不提供 Webhook。"],
        ["用量计量", "每次模型调用一条记录", "实测的 token 数和估算成本，不是账单。"],
        [
          "运行时|清理",
          "闲置的 sandbox 会被回收，Session 的状态保留",
          "事件、用量和检查点一起提交后，turn 才算成功。在那之前，sandbox 不会被回收。",
        ],
      ],
      footnote:
        "mosoo 不认证你的终端用户。如果你的 MCP 服务器需要知道是谁发起的请求，可以给 Thread 标上你自己的 `userId`。",
    },
    proof: {
      title: "源码、|版本发布|和生产状态|都是公开的。",
      intro: "本页的说法都来自主仓库：README、产品规格和 OpenAPI 文档。mosoo 目前处于 Alpha 阶段。",
      spec: "阅读产品规格",
      source: {
        title: "源码",
        body: "runtime、控制台和 API 以 Apache 2.0 许可证开源在 GitHub 上。技术栈：Cloudflare Workers、Durable Objects、D1、R2 和 Containers。",
      },
      releases: {
        title: "版本发布",
        link: "查看全部版本",
        latest: "最新版本",
        list: [
          ["v0.7.0", "代码库瘦身，公开 Thread API v1 和 v2 没有变化。"],
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
        byline: "由 mosoo 团队构建。",
        body: "上传一张头像，返回一个通过校验的 ZIP，包含 Codex 宠物全部 9 种动画状态。后端通过 Thread API 调用 mosoo，令牌从不进入浏览器。",
        link: "查看 Codex Pet 用例",
      },
      ghfind: {
        byline: "由 AsperforMias 构建。",
        body: "针对每个公开的 GitHub 仓库，ghfind 的 Go worker 会启动一个 Thread，并把 Agent 保存的 3 个产出物（分析 JSON、证据 JSON 和一份 Markdown 报告）渲染成自己的结果页。",
        link: "查看 ghfind 用例",
        app: "打开 ghfind",
      },
      allUseCases: "查看全部用例",
    },
    limits: {
      title: "mosoo 不提供 Webhook、|工具审批|和计费。",
      intro: "开始构建前，先把这些考虑进去。每一行都写了可以改用什么。",
      columns: ["不包含", "可以改用"],
      rows: [
        ["Webhook", "通过 SSE 接收事件，或读取已保存的历史。"],
        ["交互式|工具审批", "Agent 在该 Session 自己的 sandbox 内以完全权限运行。"],
        ["模型、|充值、|计费|或花费上限", "使用你自己的模型供应商密钥。费用由供应商直接收取，用量 API 会列出每次模型调用。"],
        ["Git 挂载、|私有仓库授权，|以及分支和 PR 工作流", "传入公开 URL 和确切的 commit，或直接上传文件。"],
        ["自带 runtime、|连接器市场|或本地 MCP 服务器", "从 4 个 runtime 中选一个，并接入远程 HTTPS MCP 服务器。"],
        ["在线文件编辑器|或文件管理器", "通过 API 上传输入文件、下载产出物。"],
        ["聊天渠道|或个人|云端计算机", "这属于另一款产品 Mosoo Computer。"],
      ],
    },
    faqTitle: "开始构建前|值得问的问题",
    final: {
      title: "启动你的|第一个 Session",
      consoleTitle: "在控制台中",
      consoleSteps: ["用邮箱或 Google 登录。首次登录会自动创建默认项目。", "添加模型供应商密钥。", "启动 Session。"],
      agentTitle: "在编码智能体中",
      agentBody:
        "把设置提示粘贴到 Codex、Claude Code、OpenCode、Cursor 或 Cline。它会安装 CLI，然后请你在控制台添加模型供应商密钥，这是它唯一无法替你完成的一步。",
      prompt: "查看|设置提示",
    },
    footer: {
      signoff: "扎下根，|长成一片竹海。",
      descriptor: "开源、API 优先的托管 Agent runtime，面向应用后端。",
      groups: [
        ["产品", ["mosoo 控制台", "Mosoo Computer", "用例", "状态"]],
        ["开发者", ["文档", "快速开始", "API 参考 v2", "OpenAPI v2", "OpenAPI v1", "CLI", "更新日志", "llms.txt"]],
        ["开源", ["GitHub", "版本发布", "产品规格", "Agent Driver", "许可证", "事故复盘"]],
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
      main: "メインナビゲーション",
      menu: "メニュー",
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
      footer: "フッター",
    },
    cta: {
      primary: "mosoo を試す",
      quickstart: "クイックスタートを|読む",
      source: "ソースコードを見る",
      readScript: "インストールスクリプトを確認する",
      apiReference: "v2 API リファレンスを開く",
    },
    alpha: "mosoo は現在 Alpha 版です。|公開 API は|変更される可能性があります。",
    hero: {
      product: "オープンソースで API ファーストな|マネージド Agent runtime",
      audience: "アプリケーションの|バックエンドのための、|",
      lead: "API を 1 回呼ぶだけで Agent のタスクを始め、|1 分後でも 7 日後でも|同じ Session で|続きを実行できます。",
      agentQuestion: "コーディングエージェントを使うなら",
      agentLink: "セットアップ|プロンプトを|読む",
      runtimes: "1 つの API で 4 つの runtime：",
    },
    stage: {
      title: "1 つのリクエストで Session を開始。|2 日後の|フォローアップで|続きを実行。",
      note: "サンプル値です。フィールド名とイベントタイプは v2 OpenAPI ドキュメントに基づいています。",
      start: "Session を|開始",
      backend: "あなたのバックエンド",
      startCaption:
        "プロジェクトにプロバイダーキーがあれば、1 つのリクエストで Session が始まります。返ってきた `thread.id` を保存してください。",
      fullRequest: "リクエスト全体を|見る",
      requestNotes: [
        ["Authorization", "Project API キー。`msp_` で始まり、表示は一度だけで、バックエンドにだけ置きます。"],
        ["harness", "この Session の runtime：openai-runtime、claude-agent-sdk、acp-fallback、pi のいずれか。"],
        ["model", "プロバイダーキーで使えるモデル。モデル ID はよく変わるので、先にプロジェクトで確認してください。"],
        ["instructions", "この Session で Agent が行うこと。"],
        ["resources", "先に POST /api/v2/projects/{projectId}/files でアップロードしたファイル。"],
        ["Idempotency-Key", "24 時間以内なら、同じキーで再試行しても処理は二重に実行されません。"],
      ],
      run: "mosoo が turn を実行",
      stream: "イベントストリーム（SSE）",
      runCaption:
        "Agent はその Session 専用の sandbox でコードを実行し、キーは sandbox の外に置かれたままです。イベントは保存してから配信されます。turn は成果物、使用量、チェックポイントを残して終わります。",
      artifacts: "outputs/ の|成果物",
      allDayOne: "12 件の|イベントを|すべて見る",
      later: "2 日後",
      culm: ["turn を|コミット", "アイドル中に sandbox を|回収", "最後の|チェックポイントから|復元"],
      laterCaption:
        "準備ができたら返信してください。同じ `thread.id` にフォローアップを送れば Session が続き、1 日目に作業ディレクトリへコピーした `sales.csv` もチェックポイントから戻ります。",
      followUp: "フォローアップ",
      sameThread: "同じ thread.id",
      allFollowUp: "7 件の|イベントを|すべて見る",
      firstMessage: "前四半期に最も伸びた地域はどこですか？",
      followUpMessage: "販売チャネル別にも分けてください。グラフのスタイルはそのままでお願いします。",
    },
    wall: {
      title: "Session ごとに 4 つの runtime から|選び、|ご自身の|モデルキーで|実行します。",
      intro:
        "runtime とモデルは Session ごとに選べます。モデルはご自身のキーで、以下のプロバイダーか、公開 HTTPS URL にある OpenAI 互換のカスタムエンドポイントを利用します。mosoo は実行前に runtime、モデル、プロトコルの組み合わせを確認します。",
      matrix: "runtime と|対応する|モデルプロトコル",
      runtime: "runtime",
      apiId: "API id",
      accepted: "対応",
      notAccepted: "非対応",
      runtimeNotes: [
        "Claude Agent SDK は Anthropic のモデルのみ実行します。",
        "Pi はテキスト入力のみに対応し、ファイルは Session のワークスペース経由で渡ります。",
      ],
      providers: "モデルプロバイダー|（ご自身のキー）",
      customProvider: "OpenAI 互換の|カスタムエンドポイント|（公開 HTTPS）",
      notes: [
        "プロバイダーキーはプロジェクトに属し、料金はプロバイダーからお客様のアカウントに直接請求されます。",
        "名称とロゴは互換性のあるサービスを示すもので、提携や推奨を意味するものではありません。",
      ],
    },
    split: {
      title: "ユーザーはアプリが持ち、|Agent は mosoo が動かす",
      boundary: [
        ["あなたのアプリ", "バックエンドから API を呼び出す"],
        ["mosoo", "プロバイダーキーと MCP の認証情報を保管"],
        ["Session の sandbox", "Session ごとに 1 つ。キーは入りません。"],
      ],
      boundaryLinks: ["Project API キー", "期限付きの権限だけ"],
      app: "アプリが担うこと",
      mosoo: "mosoo が担うこと",
      appRows: [
        ["ビジネスロジック", "タスクの目的と、結果の使い道"],
        ["エンドユーザー|認証", "mosoo がユーザーをログインさせることはありません"],
        ["業務キュー", "いつ、どの順で始めるか"],
        ["結果の検証", "レポートが正しいかを判断する"],
        ["業務データの|保存", "`thread.id` と抽出した結果を保存する"],
        ["UI", "ユーザーが見る画面"],
      ],
      mosooRows: [
        [
          "Agent の実行",
          "harness が turn ごとにモデル呼び出し、コード、ツールを実行",
          "inline 設定なら保存済みの Agent は不要です。runtime とプロトコルが合わない組み合わせは、実行前に拒否されます。",
        ],
        [
          "sandbox による|分離",
          "Session ごとに 1 つ、共有しない",
          "プロバイダーキーと MCP の認証情報は sandbox の外に置かれます。環境変数は sandbox 内のコードから読み取れます。",
        ],
        [
          "永続的な|継続",
          "フォローアップは最後のチェックポイントから復元",
          "1 分後でも 7 日後でも、返信の意味は同じです。チェックポイントを復元できない場合、フォローアップはエラーになります。",
        ],
        [
          "入力ファイルと|成果物",
          "添付ファイルは読み取り専用、`outputs/` のファイルは成果物に",
          "それ以外のワークスペースのファイルはチェックポイントから戻りますが、ダウンロード一覧には出ません。",
        ],
        ["イベント", "保存してから SSE で配信", "安定したイベント ID により、再接続しても重複しません。Webhook はありません。"],
        ["使用量の|計測", "モデル呼び出しごとに 1 件", "計測したトークン数と推定コストです。請求書ではありません。"],
        [
          "runtime の|後片付け",
          "アイドルの sandbox は回収し、Session の状態は残す",
          "イベント、使用量、チェックポイントがコミットされて初めて turn は成功します。それまで sandbox は回収されません。",
        ],
      ],
      footnote:
        "mosoo はエンドユーザーを認証しません。MCP サーバーが依頼者を知る必要がある場合は、Thread に独自の `userId` を付けてください。",
    },
    proof: {
      title: "ソースコード、|リリース、|本番環境の|ステータスは|すべて公開されています。",
      intro:
        "このページの記述は、メインリポジトリの README、製品仕様、OpenAPI ドキュメントに基づいています。mosoo は現在 Alpha 版です。",
      spec: "製品仕様を読む",
      source: {
        title: "ソースコード",
        body: "runtime、コンソール、API は Apache 2.0 ライセンスで GitHub に公開されています。技術スタックは Cloudflare Workers、Durable Objects、D1、R2、Containers です。",
      },
      releases: {
        title: "リリース",
        link: "すべてのリリースを見る",
        latest: "最新",
        list: [
          ["v0.7.0", "コードベースを整理。公開 Thread API の v1 と v2 は変わっていません。"],
          ["v0.5.0", "4 つ目の runtime として Pi が加わりました。"],
          ["v0.4.0", "プロジェクトから直接 Session を開始でき、Agent は不要になりました。"],
        ],
      },
      status: {
        title: "本番環境の|ステータス",
        body: "mosoo.ai/health は、本番環境の Worker の呼び出し結果と、実際の Run の完了状況から作られています。本番環境のサンプルがない runtime は「不明」と表示されます。",
        link: "ステータスページを開く",
      },
      postmortems: {
        title: "事後分析",
        body: "2026 年 7 月から 9 月までの 6 件のインシデント事後分析がリポジトリにあります。それ以降のインシデントは GitHub issue で管理しています。",
        link: "事後分析を読む",
      },
      codexPet: {
        byline: "mosoo チームが作成。",
        body: "アップロードしたアバター 1 枚から、Codex ペットの 9 つのアニメーション状態をすべて含む検証済みの ZIP が返ってきます。バックエンドは Thread API で mosoo を呼び出し、トークンがブラウザに渡ることはありません。",
        link: "Codex Pet のユースケースを読む",
      },
      ghfind: {
        byline: "AsperforMias が作成。",
        body: "公開されている GitHub リポジトリごとに ghfind の Go ワーカーが Thread を開始し、Agent が保存した 3 つの成果物（分析 JSON、エビデンス JSON、Markdown レポート）を自前の結果ページに表示します。",
        link: "ghfind のユースケースを読む",
        app: "ghfind を開く",
      },
      allUseCases: "すべてのユースケースを見る",
    },
    limits: {
      title: "mosoo には Webhook、|ツールの承認、|課金は|ありません。",
      intro: "作り始める前に、これらを前提にしてください。各行に代わりの方法があります。",
      columns: ["含まれないもの", "代わりに使うもの"],
      rows: [
        ["Webhook", "SSE でイベントを受け取るか、保存済みの履歴を読み取ってください。"],
        ["ツール実行の|対話的な承認", "Agent は Session 専用の sandbox 内で、フルアクセス権限で動作します。"],
        [
          "モデルの提供、|チャージ、|課金、|支出上限",
          "ご自身のプロバイダーキーを使います。料金はプロバイダーから直接請求され、使用量 API でモデル呼び出しごとに確認できます。",
        ],
        [
          "Git のマウント、|プライベートリポジトリの|認可、|ブランチや PR のワークフロー",
          "公開 URL と正確なコミットを渡すか、ファイルをアップロードしてください。",
        ],
        [
          "独自 runtime の|持ち込み、|コネクタの|マーケットプレイス、|ローカル MCP サーバー",
          "4 つの runtime から選び、リモートの HTTPS MCP サーバーを接続してください。",
        ],
        [
          "オンラインの|ファイルエディターや|ファイルマネージャー",
          "API で入力ファイルをアップロードし、成果物をダウンロードしてください。",
        ],
        ["チャットチャネルや|個人用の|クラウドコンピューター", "それは別のプロダクト、Mosoo Computer の領域です。"],
      ],
    },
    faqTitle: "使い始める前に|確認したいこと",
    final: {
      title: "最初の Session を|始める",
      consoleTitle: "コンソールで",
      consoleSteps: [
        "メールアドレスまたは Google でログインします。初回ログインでデフォルトプロジェクトが作成されます。",
        "プロバイダーキーを追加します。",
        "Session を開始します。",
      ],
      agentTitle: "コーディング|エージェントで",
      agentBody:
        "セットアッププロンプトを Codex、Claude Code、OpenCode、Cursor、Cline のいずれかに貼り付けます。CLI をインストールしたあと、コンソールでプロバイダーキーを追加するよう求めます。エージェントが代わりにできない唯一の手順です。",
      prompt: "セットアップ|プロンプトを|読む",
    },
    footer: {
      signoff: "根を張り、|竹の海を育てよう。",
      descriptor: "アプリケーションのバックエンドのための、オープンソースで API ファーストなマネージド Agent runtime。",
      groups: [
        ["プロダクト", ["mosoo コンソール", "Mosoo Computer", "ユースケース", "稼働状況"]],
        [
          "開発者向け",
          ["ドキュメント", "クイックスタート", "API リファレンス v2", "OpenAPI v2", "OpenAPI v1", "CLI", "更新履歴", "llms.txt"],
        ],
        ["オープンソース", ["GitHub", "リリース", "製品仕様", "Agent Driver", "ライセンス", "インシデントの事後分析"]],
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

const PHRASE_MARK = "|";
const plain = (value) => value.replaceAll(PHRASE_MARK, "");

export function homeFaq(locale) {
  copyFor(locale);
  return FAQ[locale];
}

/** The H1 as text: the two halves of the headline, in reading order. */
export function homeHeadline(locale) {
  const { product, audience } = copyFor(locale).hero;
  if (locale === "ja") return plain(audience + product);
  return plain(locale === "en" ? `${product} ${audience}` : product + audience);
}

// ---------------------------------------------------------------------------
// HTML

const escapeText = (value) =>
  String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const escapeAttribute = (value) => escapeText(value).replaceAll('"', "&quot;");
// A command token with a hyphen ("session-files/…", "--by") wraps as a whole,
// as in the React stage (product-visual.tsx CommandText).
const keepHyphenTokens = (html) => html.replace(/(\S*-\S*)/g, '<span class="mf-nowrap">$1</span>');

// Terms kept on one line wherever they wrap (the same list as ui.tsx).
// ...plus a Latin word and the Japanese particle after it ("Agent のタスク")
// and a number and its counter ("7 天后"), so no line starts with either.
const KEEP_TOGETHER =
  /Agent runtime|API ファースト|open-source|API-first|OpenAI Codex|Claude Agent SDK|Mosoo Computer|[A-Za-z0-9][\w./-]* (?:の|で|を|が|は|に|と|も|へ|や|ごと|から|まで)|\d+ [\u3040-\u30ff\u3400-\u9fff]/g;

// Backticks in the copy mark inline code, as in the copy deck; "|" marks a
// phrase edge in a Chinese or Japanese heading or label. Link labels skip
// the keep-together spans, so a link stays plain text inside its <a>.
function inline(value, { keepTogether = true } = {}) {
  const parts = escapeText(value).split("`");
  if (parts.length % 2 === 0) throw new Error(`Unbalanced inline code in: ${value}`);
  return parts
    .map((part, index) => {
      if (index % 2) return `<code translate="no">${part}</code>`;
      const kept = keepTogether
        ? part.replace(KEEP_TOGETHER, (term) => `<span class="mf-nowrap">${term}</span>`)
        : part;
      return kept.replaceAll(PHRASE_MARK, "<wbr>");
    })
    .join("");
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
  return `<a href="${escapeAttribute(href)}"${attributes}>${inline(label, { keepTogether: false })}</a>`;
}

const codeBlock = (code, className = "") =>
  `<pre${className ? ` class="${className}"` : ""} translate="no"><code>${escapeText(code)}</code></pre>`;

// The header mirrors the React topbar: one row; on wide screens the links sit
// inline, below 1024px they fold into a native disclosure (no JavaScript).
function renderHeader(locale, copy) {
  const languages = LANGUAGES.map(
    (language) =>
      `<li>${link(
        `/${language.locale}`,
        language.label,
        ` hreflang="${language.lang}" lang="${language.lang}"${language.locale === locale ? ' aria-current="page"' : ""}`,
      )}</li>`,
  ).join("");
  const products = [
    [LINKS.console, "mosoo", copy.nav.productMosoo],
    [LINKS.computer, "Mosoo Computer", copy.nav.productComputer],
  ]
    .map(
      ([href, name, description]) =>
        `<li>${link(href, name, ' translate="no"')} <span class="mf-muted">${inline(description)}</span></li>`,
    )
    .join("");
  const pages = [
    `<li>${link(copy.docs, copy.nav.docs)}</li>`,
    `<li>${link(`/${locale}/use-cases`, copy.nav.useCases)}</li>`,
    `<li>${link(copy.blog, copy.nav.blog)}</li>`,
  ].join("");
  const current = LANGUAGES.find((language) => language.locale === locale);

  return `<header class="mf-bar">
<a class="mf-logo" href="/${locale}" aria-label="${escapeAttribute(copy.nav.home)}"><img src="/brand/logo-wordmark-onlight.svg" alt="mosoo" width="102" height="22" /></a>
<nav class="mf-nav" aria-label="${escapeAttribute(copy.nav.main)}">
<ul class="mf-wide mf-links">
<li><details class="mf-pop"><summary>${inline(copy.nav.products)}</summary><ul>${products}</ul></details></li>
${pages}
</ul>
<ul class="mf-actions">
<li class="mf-wide"><details class="mf-pop mf-pop-end"><summary aria-label="${escapeAttribute(copy.nav.language)}">${current.short}</summary><ul>${languages}</ul></details></li>
<li class="mf-wide">${link(LINKS.github, "GitHub", ` aria-label="${escapeAttribute(copy.nav.github)}"`)}</li>
<li class="mf-wide">${link(LINKS.signIn, copy.nav.signIn)}</li>
<li>${link(LINKS.console, copy.cta.primary, ' class="mf-btn mf-btn-small"')}</li>
<li class="mf-narrow"><details class="mf-drawer"><summary>${inline(copy.nav.menu)}</summary>
<div class="mf-drawer-panel">
<p class="mf-label">${inline(copy.nav.products)}</p>
<ul>${products}</ul>
<ul>${pages}<li>${link(LINKS.github, copy.nav.github)}</li><li>${link(LINKS.signIn, copy.nav.signIn)}</li></ul>
<p class="mf-label">${inline(copy.nav.language)}</p>
<ul class="mf-row">${languages}</ul>
</div>
</details></li>
</ul>
</nav>
</header>`;
}

function renderHero(locale, copy) {
  const hero = copy.hero;
  const product = `<span>${inline(hero.product)}</span>`;
  const audience = `<span${locale === "ja" ? "" : ' class="mf-soft"'}>${inline(hero.audience)}</span>`;
  const title = locale === "ja" ? audience + product : product + (locale === "en" ? " " : "") + audience;
  const runtimes = RUNTIMES.map((runtime) => `<li translate="no">${escapeText(runtime.name)}</li>`).join("");
  return `<section class="mf-hero" aria-labelledby="mf-title">
<h1 id="mf-title" class="mf-phrase">${title}</h1>
<p class="mf-lead mf-phrase">${inline(hero.lead)}</p>
<p class="mf-actions-row">${link(LINKS.console, copy.cta.primary, ' class="mf-btn"')} ${link(copy.quickstart, copy.cta.quickstart, ' class="mf-btn mf-btn-line"')}</p>
<p class="mf-agent">${inline(hero.agentQuestion)} ${link("#start", hero.agentLink)}</p>
<p class="mf-muted mf-phrase">${inline(copy.alpha)}</p>
<div class="mf-runtimes"><p id="mf-runtimes">${inline(hero.runtimes)}</p><ul aria-labelledby="mf-runtimes">${runtimes}</ul></div>
</section>`;
}

const EVENT_ROWS = {
  dayOne: (message) => [
    ["user.message", "", message],
    ["run.started", "", "01JC9W8R…", true],
    ["tool.use.started", "write", "analyze.py"],
    ["tool.use.started", "bash", DAY_ONE_COMMAND, true],
    ["tool.use.completed", "bash", DAY_ONE_COMMAND],
    ["file.changed", "", "outputs/chart.png"],
    ["file.changed", "", "outputs/regions.csv"],
    ["tool.use.started", "write", "outputs/report.md"],
    ["file.changed", "", "outputs/report.md", true],
    ["usage.updated", "", "Usage updated."],
    ["session_files.updated", "", "Session files updated."],
    ["run.completed", "", "01JC9W8R…", true],
  ],
  followUp: (message) => [
    ["user.message", "", message],
    ["run.started", "", "01JCF3M2…", true],
    ["tool.use.started", "read", "outputs/report.md"],
    ["tool.use.started", "bash", FOLLOW_UP_COMMAND, true],
    ["file.changed", "", "outputs/chart.png"],
    ["file.changed", "", "outputs/report.md", true],
    ["run.completed", "", "01JCF3M2…", true],
  ],
};

function eventTable(rows, caption) {
  const body = rows
    .map(
      ([type, tool, content]) =>
        `<tr><td>${type}</td><td>${tool}</td><td>${keepHyphenTokens(escapeText(content))}</td></tr>`,
    )
    .join("");
  return `<div class="mf-table"><table translate="no"><caption class="mf-sr">${inline(caption)}</caption><thead class="mf-sr"><tr><th scope="col">type</th><th scope="col">toolName</th><th scope="col">content</th></tr></thead><tbody>${body}</tbody></table></div>`;
}

const field = (name, value) => `<div><dt>${name}</dt><dd>${value}</dd></div>`;
const quoted = (value) => `<span class="mf-str">"${escapeText(value)}"</span>`;

function renderStage(copy) {
  const stage = copy.stage;
  const dayOne = EVENT_ROWS.dayOne(stage.firstMessage);
  const followUp = EVENT_ROWS.followUp(stage.followUpMessage);
  const condensed = (rows) => rows.filter((row) => row[3] === true);
  const notes = stage.requestNotes
    .map(([name, note]) => `<dt translate="no">${name}</dt><dd>${inline(note)}</dd>`)
    .join("");
  const artifacts = ["report.md", "chart.png", "regions.csv"].map((name) => `<li>${name}</li>`).join("");
  const culm = stage.culm.map((label) => `<li>${inline(label)}</li>`).join("");

  return `<section id="how-it-works" aria-labelledby="mf-stage">
<div class="mf-stage-head">
<h2 id="mf-stage" class="mf-phrase mf-stage-title">${inline(stage.title)}</h2>
<p class="mf-note">${inline(stage.note)}</p>
</div>
<div class="mf-beats">
<article aria-labelledby="mf-beat-start">
<div class="mf-panel">
<p class="mf-panel-head"><span id="mf-beat-start" class="mf-h3 mf-phrase">${inline(stage.start)}</span> <span class="mf-muted">${inline(stage.backend)}</span></p>
<p class="mf-code" translate="no"><span class="mf-method">POST</span> /api/v2/projects/<wbr>{projectId}/<wbr>threads</p>
<dl class="mf-fields" translate="no">
${field("harness", quoted("claude-agent-sdk"))}
${field("model", quoted("claude-sonnet-5"))}
${field("instructions", quoted(INSTRUCTIONS))}
${field("input", quoted(stage.firstMessage))}
${field("resources", "sales.csv (file)")}
</dl>
<p class="mf-code mf-response" translate="no"><span class="mf-method">201 Created</span> thread.id <mark>${THREAD_ID}</mark></p>
<details><summary class="mf-phrase">${inline(stage.fullRequest)}</summary>
${codeBlock(startSessionRequest(stage.firstMessage), "mf-dark")}
<dl class="mf-notes">${notes}</dl>
<p>${link(copy.apiReferenceV2, copy.cta.apiReference)}</p>
</details>
</div>
<p class="mf-caption">${inline(stage.startCaption)}</p>
</article>
<article aria-labelledby="mf-beat-run">
<div class="mf-panel">
<p class="mf-panel-head"><span id="mf-beat-run" class="mf-h3 mf-phrase">${inline(stage.run)}</span> <span class="mf-muted">${inline(stage.stream)}</span></p>
<p class="mf-code" translate="no"><span class="mf-method">GET</span> /api/v2/threads/<wbr>{threadId}/<wbr>events/<wbr>stream</p>
${eventTable(condensed(dayOne), stage.stream)}
<p class="mf-label mf-phrase">${inline(stage.artifacts)}</p>
<ul class="mf-chips" translate="no">${artifacts}</ul>
<details><summary class="mf-phrase">${inline(stage.allDayOne)}</summary>${eventTable(dayOne, stage.stream)}</details>
</div>
<p class="mf-caption">${inline(stage.runCaption)}</p>
</article>
<article class="mf-later" aria-labelledby="mf-beat-later">
<div>
<h3 id="mf-beat-later" class="mf-phrase mf-later-title">${inline(stage.later)}</h3>
<ol class="mf-culm">${culm}</ol>
<p class="mf-caption">${inline(stage.laterCaption)}</p>
</div>
<div>
<div class="mf-panel">
<p class="mf-panel-head"><span class="mf-h3 mf-phrase">${inline(stage.followUp)}</span> <span class="mf-muted">${inline(stage.backend)}</span> <span class="mf-tag">${inline(stage.sameThread)}</span></p>
<p class="mf-code" translate="no"><span class="mf-method">POST</span> /api/v2/threads/<wbr><mark>${THREAD_ID}</mark><wbr>/events</p>
<dl class="mf-fields" translate="no">
${field("type", quoted("user_message"))}
${field("text", quoted(stage.followUpMessage))}
</dl>
</div>
<div class="mf-panel">
<p class="mf-panel-head"><span class="mf-h3 mf-phrase">${inline(stage.run)}</span> <span class="mf-muted">${inline(stage.stream)}</span></p>
${eventTable(condensed(followUp), stage.stream)}
<details><summary class="mf-phrase">${inline(stage.allFollowUp)}</summary>${eventTable(followUp, stage.stream)}</details>
</div>
</div>
</article>
</div>
</section>`;
}

function renderWall(copy) {
  const wall = copy.wall;
  const head = PROTOCOLS.map((protocol) => `<th scope="col" translate="no">${protocol}</th>`).join("");
  const rows = RUNTIMES.map((runtime) => {
    const cells = PROTOCOLS.map((protocol) =>
      runtime.accepts.includes(protocol)
        ? `<td class="mf-yes">${inline(wall.accepted)}</td>`
        : `<td class="mf-no">${inline(wall.notAccepted)}</td>`,
    ).join("");
    return `<tr><th scope="row"><span translate="no">${runtime.name}</span> <code translate="no">${runtime.id}</code></th>${cells}</tr>`;
  }).join("\n");
  const providers = [...PROVIDERS, plain(wall.customProvider)].map((name) => `<li>${inline(name)}</li>`).join("");

  return `<section id="runtimes" aria-labelledby="mf-runtimes-title">
<h2 id="mf-runtimes-title" class="mf-phrase">${inline(wall.title)}</h2>
<p class="mf-intro">${inline(wall.intro)}</p>
<div class="mf-cols mf-cols-wall">
<div>
<h3 class="mf-phrase">${inline(wall.matrix)}</h3>
<div class="mf-table"><table>
<thead><tr><th scope="col">${inline(wall.runtime)}</th>${head}</tr></thead>
<tbody>
${rows}
</tbody>
</table></div>
${wall.runtimeNotes.map((note) => `<p class="mf-small">${inline(note)}</p>`).join("\n")}
</div>
<div>
<h3 class="mf-phrase">${inline(wall.providers)}</h3>
<ul class="mf-grid-names">${providers}</ul>
${wall.notes.map((note) => `<p class="mf-small mf-muted">${inline(note)}</p>`).join("\n")}
</div>
</div>
</section>`;
}

function renderSplit(copy) {
  const split = copy.split;
  const boundary = split.boundary
    .map(
      ([name, note], index) =>
        `<li class="mf-zone${index === 1 ? " mf-zone-mosoo" : ""}"><strong class="mf-phrase">${inline(name)}</strong> ${inline(note)}</li>${
          index < split.boundaryLinks.length ? `<li class="mf-link-label">${inline(split.boundaryLinks[index])}</li>` : ""
        }`,
    )
    .join("");
  const list = (rows) =>
    rows
      .map(
        ([term, gloss, proof]) =>
          `<div><dt class="mf-phrase">${inline(term)}</dt><dd>${inline(gloss)}${proof ? `<span class="mf-proof">${inline(proof)}</span>` : ""}</dd></div>`,
      )
      .join("\n");

  return `<section id="your-app-and-mosoo" aria-labelledby="mf-split">
<h2 id="mf-split" class="mf-phrase mf-statement">${inline(split.title)}</h2>
<ol class="mf-boundary">${boundary}</ol>
<div class="mf-cols mf-ledger">
<div>
<h3 class="mf-phrase">${inline(split.app)}</h3>
<dl>
${list(split.appRows)}
</dl>
<p class="mf-small">${inline(split.footnote)}</p>
</div>
<div>
<h3 class="mf-phrase">${inline(split.mosoo)}</h3>
<dl>
${list(split.mosooRows)}
</dl>
</div>
</div>
</section>`;
}

function renderProof(locale, copy) {
  const proof = copy.proof;
  const releases = proof.releases.list
    .map(
      ([version, text], index) =>
        `<li><span translate="no" class="mf-mono">${version}</span> <time datetime="${RELEASE_DATES[version]}">${RELEASE_DATES[version]}</time>${
          index === 0 ? ` <span class="mf-tag">${inline(proof.releases.latest)}</span>` : ""
        }<br>${inline(text)}</li>`,
    )
    .join("");

  return `<section id="proof" aria-labelledby="mf-proof">
<h2 id="mf-proof" class="mf-phrase">${inline(proof.title)}</h2>
<p class="mf-intro">${inline(proof.intro)} ${link(LINKS.spec, proof.spec)}</p>
<div class="mf-checks">
<div>
<h3 class="mf-phrase">${inline(proof.source.title)}</h3>
<p>${inline(proof.source.body)}</p>
<p>${link(LINKS.github, copy.cta.source)}</p>
</div>
<div>
<h3 class="mf-phrase">${inline(proof.releases.title)}</h3>
<ol class="mf-releases">${releases}</ol>
<p>${link(LINKS.releases, proof.releases.link)}</p>
</div>
<div>
<h3 class="mf-phrase">${inline(proof.status.title)}</h3>
<p>${inline(proof.status.body)}</p>
<p>${link(copy.health, proof.status.link)}</p>
</div>
<div>
<h3 class="mf-phrase">${inline(proof.postmortems.title)}</h3>
<p>${inline(proof.postmortems.body)}</p>
<p>${link(LINKS.incidents, proof.postmortems.link)}</p>
</div>
</div>
<div class="mf-cols">
<div class="mf-card">
<h3>Codex Pet</h3>
<p class="mf-muted">${inline(proof.codexPet.byline)}</p>
<p>${inline(proof.codexPet.body)}</p>
<p>${link(`/${locale}/use-cases/codex-pet`, proof.codexPet.link)}</p>
</div>
<div class="mf-card">
<h3>ghfind</h3>
<p class="mf-muted">${inline(proof.ghfind.byline)}</p>
<p>${inline(proof.ghfind.body)}</p>
<p class="mf-row">${link(`/${locale}/use-cases/ghfind`, proof.ghfind.link)} ${link(LINKS.ghfind, proof.ghfind.app)}</p>
</div>
</div>
<p>${link(`/${locale}/use-cases`, proof.allUseCases)}</p>
</section>`;
}

function renderLimits(copy) {
  const limits = copy.limits;
  const rows = limits.rows
    .map(
      ([gap, instead]) =>
        `<tr><th scope="row" class="mf-phrase">${inline(gap)}</th><td>${inline(instead)}</td></tr>`,
    )
    .join("\n");

  return `<section id="limits" aria-labelledby="mf-limits">
<h2 id="mf-limits" class="mf-phrase">${inline(limits.title)}</h2>
<p class="mf-intro">${inline(limits.intro)}</p>
<div class="mf-table"><table class="mf-limits">
<thead><tr>${limits.columns.map((column) => `<th scope="col">${inline(column)}</th>`).join("")}</tr></thead>
<tbody>
${rows}
</tbody>
</table></div>
</section>`;
}

function renderFaq(locale, copy) {
  const items = FAQ[locale]
    .map(({ q, a }) => `<div class="mf-qa">
<h3>${escapeText(q)}</h3>
<p>${faqAnswer(a)}</p>
</div>`)
    .join("\n");

  return `<section id="faq" aria-labelledby="mf-faq">
<h2 id="mf-faq" class="mf-phrase">${inline(copy.faqTitle)}</h2>
<div class="mf-faq">
${items}
</div>
</section>`;
}

function renderFinal(locale, copy) {
  const final = copy.final;
  const steps = final.consoleSteps.map((step) => `<li>${inline(step)}</li>`).join("");
  return `<section id="start" aria-labelledby="mf-start">
<h2 id="mf-start" class="mf-phrase">${inline(final.title)}</h2>
<div class="mf-start">
<div>
<h3 class="mf-phrase">${inline(final.consoleTitle)}</h3>
<ol class="mf-steps">${steps}</ol>
<p>${link(LINKS.console, copy.cta.primary, ' class="mf-btn"')}</p>
</div>
<div>
<h3 class="mf-phrase">${inline(final.agentTitle)}</h3>
<p>${inline(final.agentBody)}</p>
<details><summary class="mf-phrase">${inline(final.prompt)}</summary>
${codeBlock(SETUP_PROMPT[locale], "mf-prompt")}
</details>
${codeBlock(INSTALL_COMMAND)}
<p>${link(LINKS.installScript, copy.cta.readScript)}</p>
</div>
</div>
<p class="mf-muted">${inline(copy.alpha)}</p>
</section>`;
}

function footerHref(locale, copy, index) {
  // Same order as copy.footer.groups.
  return [
    [LINKS.console, LINKS.computer, `/${locale}/use-cases`, copy.health],
    [
      copy.docs,
      copy.quickstart,
      copy.apiReferenceV2,
      LINKS.openApiV2,
      LINKS.openApiV1,
      copy.cli,
      LINKS.changelog,
      LINKS.llms,
    ],
    [LINKS.github, LINKS.releases, LINKS.spec, LINKS.driver, LINKS.license, LINKS.incidents],
    [copy.blog, LINKS.x, LINKS.issues],
  ][index];
}

function renderFooter(locale, copy) {
  const groups = copy.footer.groups
    .map(([label, labels], index) => {
      const hrefs = footerHref(locale, copy, index);
      if (hrefs.length !== labels.length) {
        throw new Error(`Footer group ${label} has ${labels.length} labels for ${hrefs.length} links`);
      }
      const id = `mf-footer-${index}`;
      const items = labels
        .map((text, position) => {
          const href = hrefs[position];
          const english = locale !== "en" && href === LINKS.changelog ? ' hreflang="en"' : "";
          return `<li>${link(href, text, english)}</li>`;
        })
        .join("");
      return `<div><p id="${id}" class="mf-label">${inline(label)}</p><ul aria-labelledby="${id}">${items}</ul></div>`;
    })
    .join("\n");

  return `<footer class="mf-foot">
<p class="mf-signoff mf-phrase">${inline(copy.footer.signoff)}</p>
<p class="mf-muted">${inline(copy.footer.descriptor)}</p>
<nav class="mf-groups" aria-label="${escapeAttribute(copy.nav.footer)}">
${groups}
</nav>
<p class="mf-muted">${inline(copy.footer.copyright)}</p>
</footer>`;
}

export function renderHomeFallback(locale) {
  const copy = copyFor(locale);
  return `<div class="mosoo-fallback">
<a class="mf-skip" href="#main">${inline(copy.nav.skip)}</a>
${renderHeader(locale, copy)}
<main id="main">
${renderHero(locale, copy)}
${renderStage(copy)}
${renderWall(copy)}
${renderSplit(copy)}
${renderProof(locale, copy)}
${renderLimits(copy)}
${renderFaq(locale, copy)}
${renderFinal(locale, copy)}
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
        // One entity across the three pages: its url stays the canonical
        // x-default page, and only the description and inLanguage follow the
        // page's locale.
        "@type": "SoftwareApplication",
        "@id": `${SITE}/#software`,
        name: "mosoo",
        alternateName: "mosoo AI",
        url: `${SITE}/en`,
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
// and forest ink match the landing palette. The first screen copies the React
// hero's measures (app.css is already loaded, so Cabinet Grotesk is the same
// preloaded face), and CJK headings wrap by phrase like .cjk-phrase does.
export const HOME_FALLBACK_STYLE = `<style>
.mosoo-fallback{--mf-paper:#f7f6f1;--mf-panel:#fafaf7;--mf-tint:#efede4;--mf-ink:#0b1a14;--mf-text:#1b231f;--mf-muted:#434c46;--mf-line:rgba(11,26,20,.14);--mf-soft-line:rgba(11,26,20,.08);--mf-link:#086030;--mf-display:"Cabinet Grotesk",Geist,ui-sans-serif,system-ui,sans-serif;min-height:100vh;background:var(--mf-paper);color:var(--mf-text);font:500 16px/1.6 Geist,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;overflow-wrap:break-word}
.mosoo-fallback:lang(zh){--mf-display:"Cabinet Grotesk","mosoo CJK SC",Geist,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","Noto Sans CJK SC",sans-serif;font-family:Geist,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","Noto Sans CJK SC",sans-serif;line-break:strict}
.mosoo-fallback:lang(ja){--mf-display:"Cabinet Grotesk","mosoo CJK JP",Geist,"Hiragino Sans","Hiragino Kaku Gothic ProN","Yu Gothic","Noto Sans CJK JP",sans-serif;font-family:Geist,"Hiragino Sans","Hiragino Kaku Gothic ProN","Yu Gothic","Noto Sans CJK JP",Meiryo,sans-serif;line-break:strict}
.mosoo-fallback *{box-sizing:border-box}
.mosoo-fallback a{color:var(--mf-link);text-decoration:underline;text-decoration-color:rgba(8,96,48,.35);text-underline-offset:4px}
.mosoo-fallback a:focus-visible,.mosoo-fallback summary:focus-visible{outline:2px solid #0c6d3b;outline-offset:2px;border-radius:2px}
.mosoo-fallback .mf-skip{position:absolute;left:-9999px}
.mosoo-fallback .mf-skip:focus{left:16px;top:12px;z-index:60;padding:10px 16px;background:var(--mf-ink);color:var(--mf-paper);border-radius:6px}
.mosoo-fallback .mf-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.mosoo-fallback .mf-nowrap{white-space:nowrap}
.mosoo-fallback :is(.mf-phrase,h1,h2):is(:lang(zh),:lang(ja)){word-break:keep-all;overflow-wrap:anywhere;font-feature-settings:"ss01","halt"}
.mosoo-fallback p,.mosoo-fallback li,.mosoo-fallback dd,.mosoo-fallback td{text-wrap:pretty}
.mosoo-fallback ul,.mosoo-fallback ol{margin:0;padding:0;list-style:none}
.mosoo-fallback p{margin:0}
.mosoo-fallback h1,.mosoo-fallback h2,.mosoo-fallback h3{margin:0;color:var(--mf-ink);text-wrap:balance}
.mosoo-fallback .mf-btn{display:inline-flex;align-items:center;justify-content:center;height:48px;padding:0 28px;border-radius:6px;background:var(--mf-ink);color:var(--mf-paper);font-weight:600;text-decoration:none;white-space:nowrap}
.mosoo-fallback .mf-btn-line{background:transparent;color:var(--mf-ink);box-shadow:inset 0 0 0 1px rgba(11,26,20,.2);padding:0 20px}
.mosoo-fallback .mf-btn-small{height:36px;padding:0 16px;font-size:14px}
.mosoo-fallback .mf-bar{position:sticky;top:0;z-index:50;display:flex;align-items:center;justify-content:space-between;gap:16px;height:64px;padding:0 16px;background:var(--mf-paper);border-bottom:1px solid rgba(11,26,20,.05)}
.mosoo-fallback .mf-logo img{display:block;height:22px;width:auto}
.mosoo-fallback .mf-nav{display:flex;flex:1;align-items:center;justify-content:space-between;gap:16px;font-size:14px;font-weight:600}
.mosoo-fallback .mf-nav a{color:#434c46;text-decoration:none}
.mosoo-fallback .mf-nav .mf-btn{color:var(--mf-paper)}
.mosoo-fallback .mf-links,.mosoo-fallback .mf-actions{display:flex;align-items:center;gap:4px 24px}
.mosoo-fallback .mf-links{padding-left:28px}
.mosoo-fallback .mf-actions{margin-left:auto;gap:4px 20px}
.mosoo-fallback .mf-pop{position:relative}
.mosoo-fallback .mf-pop summary,.mosoo-fallback .mf-drawer summary{cursor:pointer;color:#434c46;list-style:none}
.mosoo-fallback .mf-pop>ul,.mosoo-fallback .mf-drawer-panel{position:absolute;z-index:60;min-width:280px;margin-top:10px;padding:12px 16px;background:var(--mf-panel);border:1px solid var(--mf-line);border-radius:10px}
.mosoo-fallback .mf-pop-end>ul{right:0}
.mosoo-fallback .mf-pop li,.mosoo-fallback .mf-drawer li{padding:4px 0}
.mosoo-fallback .mf-drawer-panel{right:16px;left:16px;top:56px}
.mosoo-fallback .mf-drawer-panel ul{display:flex;flex-direction:column;margin-bottom:12px}
.mosoo-fallback .mf-drawer-panel .mf-row{flex-direction:row;gap:16px}
.mosoo-fallback .mf-narrow{display:none}
@media (max-width:1023px){.mosoo-fallback .mf-wide{display:none}.mosoo-fallback .mf-narrow{display:block}.mosoo-fallback .mf-btn-small{height:44px;font-size:15px}}
.mosoo-fallback main{max-width:1280px;margin:0 auto}
.mosoo-fallback main>section{padding:64px 16px;border-top:1px solid var(--mf-line)}
.mosoo-fallback main>section:first-child{border-top:0}
.mosoo-fallback .mf-hero{display:flex;flex-direction:column;align-items:center;padding:36px 16px 28px;text-align:center}
.mosoo-fallback .mf-hero h1{max-width:1040px;font:500 clamp(34px,4.3vw,60px)/1.04 var(--mf-display);letter-spacing:-.03em;color:var(--mf-ink)}
.mosoo-fallback:is(:lang(zh),:lang(ja)) .mf-hero h1{line-height:1.2;letter-spacing:0}
.mosoo-fallback:lang(ja) .mf-hero h1{font-size:clamp(26px,3.3vw,46px)}
.mosoo-fallback:lang(zh) .mf-hero h1{font-size:clamp(32px,4vw,56px)}
@media (min-width:640px){.mosoo-fallback:lang(zh) .mf-hero h1>span:first-child{display:block}}
.mosoo-fallback .mf-soft{color:var(--mf-muted)}
.mosoo-fallback .mf-lead{max-width:600px;margin-top:20px;font-size:18px;line-height:1.55;color:var(--mf-text);text-wrap:balance}
.mosoo-fallback .mf-actions-row{display:flex;flex-wrap:wrap;justify-content:center;gap:12px;margin-top:24px}
.mosoo-fallback .mf-agent{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;column-gap:12px;margin-top:16px;font-size:15px}
.mosoo-fallback .mf-agent a{display:inline-flex;align-items:center;min-height:44px}
@media (min-width:640px){.mosoo-fallback .mf-agent a{min-height:36px}}
.mosoo-fallback .mf-agent a{font-weight:600}
.mosoo-fallback .mf-hero>.mf-muted{margin-top:12px;font-size:15px;line-height:1.5}
.mosoo-fallback .mf-runtimes{display:flex;flex-wrap:wrap;justify-content:center;gap:10px 20px;margin-top:24px;font-size:15px;font-weight:600;line-height:1.5}
.mosoo-fallback .mf-runtimes p{color:var(--mf-muted)}
.mosoo-fallback .mf-runtimes ul{display:flex;flex-wrap:wrap;justify-content:center;gap:10px 20px;color:var(--mf-ink)}
.mosoo-fallback .mf-muted,.mosoo-fallback .mf-intro{color:var(--mf-muted)}
.mosoo-fallback h2{font:500 clamp(26px,2.9vw,38px)/1.1 var(--mf-display);letter-spacing:-.028em}
.mosoo-fallback:is(:lang(zh),:lang(ja)) h2{line-height:1.25;letter-spacing:0}
.mosoo-fallback .mf-statement{font-size:clamp(32px,4.6vw,60px);line-height:1.02}
.mosoo-fallback h3{font-size:17px;line-height:1.35;font-weight:600}
.mosoo-fallback .mf-intro{max-width:760px;margin-top:16px;font-size:17px}
.mosoo-fallback #how-it-works{padding-top:24px}
.mosoo-fallback .mf-stage-head{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px 40px}
.mosoo-fallback .mf-stage-title{font-size:23px;line-height:1.25;letter-spacing:-.015em}
.mosoo-fallback .mf-note{max-width:420px;font-size:14px}
.mosoo-fallback .mf-beats{display:grid;grid-template-columns:minmax(0,1fr);gap:24px;margin-top:16px}
.mosoo-fallback .mf-panel{min-width:0;padding:12px 16px;background:var(--mf-panel);border:1px solid var(--mf-line);border-radius:12px}
.mosoo-fallback .mf-panel+.mf-panel{margin-top:12px}
.mosoo-fallback .mf-panel-head{display:flex;flex-wrap:wrap;align-items:center;gap:6px 12px;margin:-12px -16px 12px;padding:10px 16px;border-bottom:1px solid var(--mf-soft-line);font-size:14px}
.mosoo-fallback .mf-h3{font-size:15px;font-weight:600;color:var(--mf-ink)}
.mosoo-fallback .mf-code,.mosoo-fallback .mf-fields,.mosoo-fallback .mf-panel table{font-family:"Geist Mono",ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:14px;line-height:1.6}
.mosoo-fallback .mf-method{font-weight:600;color:var(--mf-link)}
.mosoo-fallback .mf-fields div{display:grid;grid-template-columns:7.5rem minmax(0,1fr);gap:0 12px}
.mosoo-fallback .mf-fields dt{color:var(--mf-muted);font-weight:500}
.mosoo-fallback .mf-fields dd{margin:0}
.mosoo-fallback .mf-str{color:var(--mf-link)}
.mosoo-fallback mark{background:#c8ff00;color:var(--mf-ink);border-radius:3px;padding:0 2px}
.mosoo-fallback .mf-response{margin-top:12px;padding-top:12px;border-top:1px dashed var(--mf-line)}
.mosoo-fallback .mf-caption{margin-top:12px;max-width:560px;font-size:15px}
.mosoo-fallback .mf-chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;font-family:"Geist Mono",ui-monospace,monospace;font-size:14px}
.mosoo-fallback .mf-chips li{padding:1px 8px;border-radius:5px;background:#f4ece2;color:#5b3c22}
.mosoo-fallback .mf-later{display:grid;grid-template-columns:minmax(0,1fr);gap:20px 32px}
.mosoo-fallback .mf-later-title{font:500 36px/1.1 var(--mf-display)}
.mosoo-fallback .mf-culm{margin-top:16px;font-weight:600}
.mosoo-fallback .mf-culm li{padding:10px 0 10px 18px;border-left:6px solid #086030}
.mosoo-fallback .mf-culm li:nth-child(2){border-left-style:dashed;border-left-color:#97a095;color:var(--mf-muted)}
.mosoo-fallback .mf-tag{display:inline-block;padding:0 10px;border-radius:999px;background:#c8ff00;color:var(--mf-ink);font-size:14px;font-weight:600}
.mosoo-fallback .mf-releases .mf-tag{background:transparent;box-shadow:inset 0 0 0 1px var(--mf-ink)}
.mosoo-fallback details{margin-top:12px}
.mosoo-fallback .mf-bar details{margin-top:0}
.mosoo-fallback summary{cursor:pointer;color:var(--mf-text);font-size:14px;font-weight:600}
.mosoo-fallback pre{margin:12px 0 0;padding:14px 16px;overflow-x:auto;border:1px solid var(--mf-line);border-radius:10px;background:var(--mf-panel);font:14px/1.6 "Geist Mono",ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;white-space:pre-wrap;overflow-wrap:anywhere}
.mosoo-fallback pre code{font-size:inherit}
.mosoo-fallback .mf-dark{background:var(--mf-ink);color:#f7f6f1;border-color:var(--mf-ink);white-space:pre;overflow-wrap:normal}
.mosoo-fallback .mf-prompt{max-height:420px}
.mosoo-fallback code{font-family:"Geist Mono",ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:.92em}
.mosoo-fallback :not(pre)>code{overflow-wrap:anywhere}
.mosoo-fallback .mf-notes{display:grid;grid-template-columns:auto minmax(0,1fr);gap:6px 16px;margin-top:12px;font-size:15px}
.mosoo-fallback .mf-notes dt{font-family:"Geist Mono",ui-monospace,monospace;font-size:14px;font-weight:600}
.mosoo-fallback .mf-notes dd{margin:0}
.mosoo-fallback .mf-table{margin-top:12px;overflow-x:auto}
.mosoo-fallback table{width:100%;border-collapse:collapse;font-size:15px}
.mosoo-fallback th,.mosoo-fallback td{padding:8px 12px 8px 0;border-top:1px solid var(--mf-soft-line);text-align:left;vertical-align:top}
.mosoo-fallback th{font-weight:600}
.mosoo-fallback .mf-yes{color:var(--mf-link);font-weight:600}
.mosoo-fallback .mf-no{color:#667065}
.mosoo-fallback .mf-cols{display:grid;grid-template-columns:minmax(0,1fr);gap:32px 48px;margin-top:32px}
.mosoo-fallback .mf-small{margin-top:8px;font-size:15px}
.mosoo-fallback .mf-grid-names{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));margin-top:12px;border-top:1px solid var(--mf-line);border-left:1px solid var(--mf-line)}
.mosoo-fallback .mf-grid-names li{padding:10px 14px;border-right:1px solid var(--mf-line);border-bottom:1px solid var(--mf-line)}
.mosoo-fallback .mf-boundary{display:flex;flex-direction:column;gap:6px;margin-top:32px}
.mosoo-fallback .mf-zone{padding:12px 16px;border:1px solid var(--mf-line);border-radius:12px;background:var(--mf-panel)}
.mosoo-fallback .mf-zone strong{display:block;color:var(--mf-ink)}
.mosoo-fallback .mf-zone-mosoo{border-color:#0c6d3b;background:#e6f2eb}
.mosoo-fallback .mf-link-label{padding:0 12px;color:var(--mf-muted);font-size:14px;font-weight:600}
.mosoo-fallback .mf-ledger>div{padding:20px;border:1px solid var(--mf-line);border-radius:14px;background:var(--mf-panel)}
.mosoo-fallback .mf-ledger>div+div{background:#e6f2eb}
.mosoo-fallback .mf-ledger dl{margin:12px 0 0}
.mosoo-fallback .mf-ledger dl>div{padding:12px 0;border-top:1px solid var(--mf-line)}
.mosoo-fallback .mf-ledger dt{font-weight:600;color:var(--mf-ink)}
.mosoo-fallback .mf-ledger dd{margin:2px 0 0}
.mosoo-fallback .mf-proof{display:block;margin-top:4px;font-size:15px;color:var(--mf-muted)}
.mosoo-fallback .mf-checks{display:grid;grid-template-columns:minmax(0,1fr);gap:24px 32px;margin-top:32px;padding-top:24px;border-top:1px solid var(--mf-line)}
.mosoo-fallback .mf-checks p{margin-top:8px}
.mosoo-fallback .mf-releases{margin-top:8px;padding-left:16px;border-left:1px solid var(--mf-line);font-size:15px}
.mosoo-fallback .mf-releases li{padding:4px 0}
.mosoo-fallback .mf-mono,.mosoo-fallback time{font-family:"Geist Mono",ui-monospace,monospace;font-size:14px}
.mosoo-fallback .mf-card{padding:20px;border:1px solid var(--mf-line);border-radius:14px;background:var(--mf-panel)}
.mosoo-fallback .mf-card p{margin-top:8px}
.mosoo-fallback .mf-row{display:flex;flex-wrap:wrap;gap:8px 20px}
.mosoo-fallback #proof>p:last-child{margin-top:24px}
.mosoo-fallback .mf-limits th{width:45%;padding-right:24px}
.mosoo-fallback .mf-faq{margin-top:32px}
.mosoo-fallback .mf-qa{padding:16px 0 20px;border-top:1px solid var(--mf-line);break-inside:avoid}
.mosoo-fallback .mf-qa p{margin-top:8px}
.mosoo-fallback .mf-start{margin-top:32px;border:1px solid var(--mf-line);border-radius:14px;overflow:hidden}
.mosoo-fallback .mf-start>div{padding:24px}
.mosoo-fallback .mf-start>div:first-child{background:var(--mf-panel)}
.mosoo-fallback .mf-start>div+div{border-top:1px solid var(--mf-line)}
.mosoo-fallback .mf-start p{margin-top:12px}
.mosoo-fallback .mf-steps{margin-top:12px;padding-left:1.2em;list-style:decimal}
.mosoo-fallback #start>.mf-muted{margin-top:24px}
.mosoo-fallback .mf-foot{padding:56px 16px 40px;background:#050805;color:#f7f6f1}
.mosoo-fallback .mf-foot a{color:rgba(247,246,241,.85);text-decoration:none}
.mosoo-fallback .mf-foot .mf-muted{margin-top:12px;color:rgba(247,246,241,.7)}
.mosoo-fallback .mf-signoff{max-width:760px;font:500 clamp(32px,4.6vw,56px)/1.06 var(--mf-display);letter-spacing:-.025em;text-wrap:balance}
.mosoo-fallback:is(:lang(zh),:lang(ja)) .mf-signoff{letter-spacing:0;line-height:1.2}
.mosoo-fallback .mf-groups{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:24px;margin-top:40px;padding-top:40px;border-top:1px solid rgba(247,246,241,.15)}
.mosoo-fallback .mf-groups li{margin-top:8px}
.mosoo-fallback .mf-label{margin:0;font-weight:600}
.mosoo-fallback .mf-foot .mf-label{color:#f7f6f1}
@media (max-width:639px){.mosoo-fallback .mf-actions-row{flex-direction:column;align-self:stretch}.mosoo-fallback .mf-actions-row a{width:100%}}
@media (min-width:640px){.mosoo-fallback main{border-left:1px solid var(--mf-line);border-right:1px solid var(--mf-line)}.mosoo-fallback .mf-hero h1{max-width:1040px}}
@media (min-width:768px){.mosoo-fallback .mf-bar{padding:0 max(24px,calc((100% - 1232px) / 2))}.mosoo-fallback main>section{padding:64px max(24px,calc((100% - 1160px) / 2))}.mosoo-fallback .mf-hero{padding:32px 24px 28px}.mosoo-fallback #how-it-works{padding-top:20px}.mosoo-fallback .mf-lead{font-size:19px}.mosoo-fallback .mf-cols{grid-template-columns:repeat(2,minmax(0,1fr))}.mosoo-fallback .mf-checks{grid-template-columns:repeat(2,minmax(0,1fr))}.mosoo-fallback .mf-faq{columns:2;column-gap:56px}.mosoo-fallback .mf-boundary{flex-direction:row;align-items:center}.mosoo-fallback .mf-zone{flex:1}.mosoo-fallback .mf-foot{padding:64px 24px 40px}}
@media (min-width:1024px){.mosoo-fallback .mf-lead{max-width:880px}.mosoo-fallback .mf-beats{grid-template-columns:minmax(0,1.04fr) minmax(0,1fr)}.mosoo-fallback .mf-later{grid-column:1/-1;grid-template-columns:minmax(0,.8fr) minmax(0,1.2fr);padding:20px;border:1px solid var(--mf-line);border-radius:12px}.mosoo-fallback .mf-checks{grid-template-columns:repeat(4,minmax(0,1fr))}.mosoo-fallback .mf-ledger{grid-template-columns:minmax(0,.75fr) minmax(0,1.25fr)}}
@media (min-width:1280px){.mosoo-fallback .mf-cols-wall{grid-template-columns:minmax(0,1.5fr) minmax(0,1fr)}}
</style>`;
