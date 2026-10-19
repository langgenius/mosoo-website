// Home page copy for the crawlable static HTML in /en, /zh and /ja: the
// fallback that non-JS crawlers and coding agents read inside #root, and the
// JSON-LD @graph. React replaces #root on mount, so this is what a reader sees
// without JavaScript.
//
// Copy source: the v1 copy deck (sections 1 to 16), drawn from
// langgenius/mosoo @ 7cb9866 (README, docs/SPEC.md). The FAQ strings are the
// exact strings the FAQPage JSON-LD carries, and the React FAQ must show the
// same text. Do not add facts here that the main repo does not state.

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

// The two calls that start a Session with a file attached (mosoo docs,
// quickstart and api-reference-v2): upload input.csv, then start the
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

function renderHeader(locale, copy) {
  const languages = LANGUAGES.map(
    (language) =>
      `<li>${link(
        `/${language.locale}`,
        language.label,
        ` hreflang="${language.lang}" lang="${language.lang}"${language.locale === locale ? ' aria-current="page"' : ""}`,
      )}</li>`,
  ).join("");

  // The React topbar's Products menu (copy deck section 1) as a native
  // disclosure, so it opens without JavaScript and crawlers read both entries.
  const products = [
    [LINKS.console, "mosoo", copy.nav.productMosoo],
    [LINKS.computer, "Mosoo Computer", copy.nav.productComputer],
  ]
    .map(
      ([href, name, description]) =>
        `<li>${link(href, name, ' translate="no"')} <span class="mf-muted">${inline(description)}</span></li>`,
    )
    .join("");

  return `<header class="mf-bar">
<a href="/${locale}" aria-label="${escapeAttribute(copy.nav.home)}"><img src="/brand/logo-wordmark-onlight.svg" alt="mosoo" width="102" height="22" /></a>
<nav aria-label="Primary site links">
<ul class="mf-row">
<li><details class="mf-menu"><summary>${inline(copy.nav.products)}</summary><ul>${products}</ul></details></li>
<li>${link(copy.docs, copy.nav.docs)}</li>
<li>${link(`/${locale}/use-cases`, copy.nav.useCases)}</li>
<li>${link(copy.blog, copy.nav.blog)}</li>
<li>${link(LINKS.github, "GitHub", ` aria-label="${escapeAttribute(copy.nav.github)}"`)}</li>
<li>${link(LINKS.signIn, copy.nav.signIn)}</li>
<li>${link(LINKS.console, copy.cta.primary, ' class="mf-btn"')}</li>
</ul>
<ul class="mf-row mf-languages" aria-label="${escapeAttribute(copy.nav.language)}">${languages}</ul>
</nav>
</header>`;
}

function renderHero(copy) {
  // Keep the category noun on one line in every locale; the text is unchanged.
  const title = inline(copy.hero.title).replace(
    "Agent runtime",
    '<span class="mf-nowrap">Agent runtime</span>',
  );
  return `<section class="mf-hero" aria-labelledby="mf-title">
<h1 id="mf-title">${title}</h1>
<p class="mf-lead">${inline(copy.hero.subhead)}</p>
<p class="mf-row mf-actions">${link(LINKS.console, copy.cta.primary, ' class="mf-btn"')} ${link(copy.quickstart, copy.cta.quickstart)}</p>
<p>${inline(copy.hero.hosted)}</p>
<p class="mf-muted">${inline(copy.alpha)}</p>
</section>`;
}

function renderWall(copy) {
  const wall = copy.wall;
  const rows = RUNTIMES.map(
    (runtime) =>
      `<tr><td>${inline(runtime.name)}</td><td><code translate="no">${runtime.id}</code></td><td>${inline(wall.protocolsByRuntime[runtime.id])}</td></tr>`,
  ).join("\n");
  const providers = [...PROVIDERS, wall.customProvider].map((name) => `<li>${inline(name)}</li>`).join("");
  const protocols = PROTOCOLS.map((name) => `<li>${inline(name)}</li>`).join("");

  return `<section id="runtimes" aria-labelledby="mf-runtimes">
<h2 id="mf-runtimes">${inline(wall.title)}</h2>
<p class="mf-intro">${inline(wall.intro)}</p>
<h3>${inline(wall.runtimes)}</h3>
<div class="mf-table"><table>
<thead><tr>${wall.columns.map((column) => `<th scope="col">${inline(column)}</th>`).join("")}</tr></thead>
<tbody>
${rows}
</tbody>
</table></div>
<h3>${inline(wall.providers)}</h3>
<ul class="mf-row mf-chips">${providers}</ul>
<h3>${inline(wall.protocols)}</h3>
<ul class="mf-row mf-chips">${protocols}</ul>
${wall.notes.map((note) => `<p class="mf-muted">${inline(note)}</p>`).join("\n")}
</section>`;
}

function renderFeatures(copy) {
  const features = copy.features;
  const items = features.items
    .map(
      (item) => `<li>
<h3>${inline(item.title)}</h3>
<p>${inline(item.body)}</p>
<p class="mf-muted">${inline(item.proof)}</p>
</li>`,
    )
    .join("\n");

  return `<section id="features" aria-labelledby="mf-features">
<h2 id="mf-features">${inline(features.title)}</h2>
<ul class="mf-grid">
${items}
</ul>
<p>${link(LINKS.spec, features.spec)}</p>
</section>`;
}

function renderSteps(copy) {
  const steps = copy.steps;
  const items = steps.items
    .map(
      (item) => `<li>
<h3>${inline(item.title)}</h3>
<p>${inline(item.body)}</p>
<p class="mf-muted">${inline(item.io)}</p>
</li>`,
    )
    .join("\n");

  return `<section id="how-it-works" aria-labelledby="mf-steps">
<h2 id="mf-steps">${inline(steps.title)}</h2>
<p class="mf-intro">${inline(steps.intro)}</p>
<ol class="mf-steps">
${items}
</ol>
<figure class="mf-code">
<figcaption>${inline(steps.uploadLabel)}</figcaption>
${codeBlock(UPLOAD_REQUEST)}
</figure>
<figure class="mf-code">
<figcaption>${inline(steps.codeLabel)}</figcaption>
${codeBlock(START_SESSION_REQUEST)}
</figure>
<p class="mf-muted">${inline(steps.note)}</p>
<p>${link(copy.apiReferenceV2, steps.apiReference)}</p>
</section>`;
}

function renderSplit(copy) {
  const split = copy.split;
  const list = (rows) =>
    rows.map(([term, detail]) => `<dt>${inline(term)}</dt><dd>${inline(detail)}</dd>`).join("\n");

  return `<section id="your-app-and-mosoo" aria-labelledby="mf-split">
<h2 id="mf-split">${inline(split.title)}</h2>
<div class="mf-cols">
<div>
<h3>${inline(split.app)}</h3>
<dl>
${list(split.appRows)}
</dl>
</div>
<div>
<h3>${inline(split.mosoo)}</h3>
<dl>
${list(split.mosooRows)}
</dl>
</div>
</div>
<p>${inline(split.path)}</p>
<p class="mf-muted">${inline(split.footnote)}</p>
</section>`;
}

function renderProof(locale, copy) {
  const proof = copy.proof;
  const releases = proof.releases.list
    .map(
      ([version, text]) =>
        `<dt><span translate="no">${version}</span> <time datetime="${RELEASE_DATES[version]}">${RELEASE_DATES[version]}</time></dt><dd>${inline(text)}</dd>`,
    )
    .join("\n");

  return `<section id="proof" aria-labelledby="mf-proof">
<h2 id="mf-proof">${inline(proof.title)}</h2>
<p class="mf-intro">${inline(proof.intro)}</p>
<div class="mf-cols">
<div>
<h3>${inline(proof.source.title)}</h3>
<p>${inline(proof.source.body)}</p>
<p class="mf-row">${link(LINKS.github, copy.cta.source)} ${link(LINKS.spec, copy.features.spec)}</p>
</div>
<div>
<h3>${inline(proof.releases.title)}</h3>
<p>${inline(proof.releases.body)}</p>
<dl class="mf-releases">
${releases}
</dl>
<p>${link(LINKS.releases, proof.releases.link)}</p>
</div>
<div>
<h3>${inline(proof.status.title)}</h3>
<p>${inline(proof.status.body)}</p>
<p>${link(copy.health, proof.status.link)}</p>
</div>
<div>
<h3>${inline(proof.postmortems.title)}</h3>
<p>${inline(proof.postmortems.body)}</p>
<p>${link(LINKS.incidents, proof.postmortems.link)}</p>
</div>
<div>
<h3>Codex Pet</h3>
<p>${inline(proof.codexPet.body)}</p>
<p>${link(`/${locale}/use-cases/codex-pet`, proof.codexPet.link)}</p>
</div>
<div>
<h3>ghfind</h3>
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
    .map(([gap, instead]) => `<tr><th scope="row">${inline(gap)}</th><td>${inline(instead)}</td></tr>`)
    .join("\n");

  return `<section id="limits" aria-labelledby="mf-limits">
<h2 id="mf-limits">${inline(limits.title)}</h2>
<p class="mf-intro">${inline(limits.intro)}</p>
<div class="mf-table"><table>
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
<h2 id="mf-faq">${inline(copy.faqTitle)}</h2>
${items}
</section>`;
}

function renderFinal(locale, copy) {
  const final = copy.final;
  return `<section id="start" aria-labelledby="mf-start">
<h2 id="mf-start">${inline(final.title)}</h2>
<div class="mf-cols">
<div>
<h3>${inline(final.consoleTitle)}</h3>
<p>${inline(final.consoleBody)}</p>
<p>${link(LINKS.console, copy.cta.primary, ' class="mf-btn"')}</p>
</div>
<div>
<h3>${inline(final.agentTitle)}</h3>
<p>${inline(final.agentBody)}</p>
${codeBlock(INSTALL_COMMAND)}
<p>${link(LINKS.installScript, copy.cta.readScript)}</p>
<details>
<summary>${inline(copy.hero.agentLabel)}</summary>
${codeBlock(SETUP_PROMPT[locale], "mf-prompt")}
</details>
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
    [LINKS.github, LINKS.releases, LINKS.spec, LINKS.driver, LINKS.license, LINKS.security, LINKS.incidents],
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
<p class="mf-signoff">${inline(copy.footer.signoff)}</p>
<p class="mf-muted">${inline(copy.footer.descriptor)}</p>
<nav class="mf-groups" aria-label="Footer">
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
${renderHero(copy)}
${renderWall(copy)}
${renderFeatures(copy)}
${renderSteps(copy)}
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
export const HOME_FALLBACK_STYLE = `<style>
.mosoo-fallback{--mf-paper:#f7f6f1;--mf-ink:#0b1a14;--mf-muted:#434c46;--mf-line:rgba(11,26,20,.14);--mf-link:#086030;--mf-panel:#fdfdfb;min-height:100vh;background:var(--mf-paper);color:var(--mf-ink);font:400 16px/1.6 Geist,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;overflow-wrap:break-word}
.mosoo-fallback:lang(zh){font-family:Geist,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","Noto Sans CJK SC",sans-serif}
.mosoo-fallback:lang(ja){font-family:Geist,"Hiragino Sans","Hiragino Kaku Gothic ProN","Yu Gothic","Noto Sans CJK JP",Meiryo,sans-serif;line-break:strict;word-break:auto-phrase}
.mosoo-fallback *{box-sizing:border-box}
.mosoo-fallback a{color:var(--mf-link);text-decoration:underline;text-underline-offset:2px}
.mosoo-fallback a:focus-visible,.mosoo-fallback summary:focus-visible{outline:2px solid var(--mf-link);outline-offset:2px;border-radius:2px}
.mosoo-fallback .mf-btn{display:inline-block;padding:9px 16px;border-radius:8px;background:#6fd305;color:#0f1a02;font-weight:600;text-decoration:none;box-shadow:inset 0 0 0 1px rgba(15,26,2,.16)}
.mosoo-fallback .mf-skip{position:absolute;left:-9999px}
.mosoo-fallback .mf-skip:focus{left:16px;top:16px;z-index:1;padding:8px 12px;background:var(--mf-paper)}
.mosoo-fallback .mf-bar,.mosoo-fallback main,.mosoo-fallback .mf-foot{max-width:1040px;margin:0 auto;padding-left:16px;padding-right:16px}
.mosoo-fallback .mf-bar{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px 24px;padding-top:16px;padding-bottom:16px;border-bottom:1px solid var(--mf-line)}
.mosoo-fallback .mf-bar img{display:block;height:22px;width:auto}
.mosoo-fallback .mf-bar nav{display:flex;flex-wrap:wrap;align-items:center;gap:8px 24px}
.mosoo-fallback .mf-row{display:flex;flex-wrap:wrap;align-items:center;gap:8px 20px;margin:0;padding:0;list-style:none}
.mosoo-fallback .mf-languages{font-size:14px}
.mosoo-fallback .mf-menu summary{color:var(--mf-ink)}
.mosoo-fallback .mf-menu ul{margin:8px 0 0;padding:0;list-style:none}
.mosoo-fallback .mf-menu li{margin-top:4px;max-width:36ch;font-size:15px}
.mosoo-fallback h1,.mosoo-fallback h2,.mosoo-fallback h3{margin:0;color:var(--mf-ink);text-wrap:balance}
.mosoo-fallback h1,.mosoo-fallback h2{font-family:var(--font-literata,Georgia,serif);font-weight:400}
.mosoo-fallback:lang(zh) h1,.mosoo-fallback:lang(zh) h2{font-family:var(--font-literata-zh,"Songti SC",serif);font-weight:600}
.mosoo-fallback:lang(ja) h1,.mosoo-fallback:lang(ja) h2{font-family:var(--font-literata-ja,"Hiragino Mincho ProN",serif);font-weight:600}
.mosoo-fallback h1{max-width:22ch;font-size:clamp(34px,6vw,56px);line-height:1.06;letter-spacing:-.02em}
.mosoo-fallback:lang(zh) h1,.mosoo-fallback:lang(ja) h1{max-width:20em;font-size:clamp(28px,4.6vw,46px);line-height:1.25;letter-spacing:0}
.mosoo-fallback:lang(zh) h1,.mosoo-fallback:lang(zh) h2{word-break:keep-all}
.mosoo-fallback h2{font-size:clamp(24px,3.4vw,34px);line-height:1.2;letter-spacing:-.01em}
.mosoo-fallback h3{margin-top:28px;font-size:18px;line-height:1.35;font-weight:650}
.mosoo-fallback p,.mosoo-fallback dd,.mosoo-fallback li{max-width:70ch}
.mosoo-fallback p{margin:10px 0 0}
.mosoo-fallback main>.mf-hero{padding:56px 0 48px;border-top:0}
.mosoo-fallback .mf-nowrap{white-space:nowrap}
.mosoo-fallback .mf-hero h1{margin-top:0}
.mosoo-fallback .mf-lead{margin-top:20px;font-size:19px;color:var(--mf-muted)}
.mosoo-fallback .mf-actions{margin-top:28px}
.mosoo-fallback .mf-muted,.mosoo-fallback .mf-intro,.mosoo-fallback dd{color:var(--mf-muted)}
.mosoo-fallback .mf-agent{margin-top:32px;padding-top:20px;border-top:1px solid var(--mf-line)}
.mosoo-fallback main>section,.mosoo-fallback .mf-figure{margin:0;padding:56px 0;border-top:1px solid var(--mf-line)}
.mosoo-fallback figcaption{font-weight:600}
.mosoo-fallback .mf-grid{display:grid;grid-template-columns:minmax(0,1fr);gap:0 40px;margin:0;padding:0;list-style:none}
.mosoo-fallback .mf-steps{margin:8px 0 0;padding-left:1.4em;list-style:decimal}
.mosoo-fallback .mf-steps>li::marker{font-weight:650}
.mosoo-fallback .mf-cols{display:grid;grid-template-columns:minmax(0,1fr);gap:0 48px}
.mosoo-fallback .mf-chips{gap:6px 18px;margin-top:10px}
.mosoo-fallback code,.mosoo-fallback pre{font-family:"Geist Mono",ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
.mosoo-fallback code{font-size:.92em}
.mosoo-fallback :not(pre)>code{overflow-wrap:anywhere}
.mosoo-fallback pre{margin:14px 0 0;padding:14px 16px;overflow-x:auto;border:1px solid var(--mf-line);border-radius:8px;background:var(--mf-panel);font-size:14px;line-height:1.6;white-space:pre-wrap;overflow-wrap:anywhere}
.mosoo-fallback pre code{font-size:inherit}
.mosoo-fallback .mf-prompt{max-height:420px}
.mosoo-fallback .mf-code{margin:28px 0 0}
.mosoo-fallback details{margin-top:16px}
.mosoo-fallback summary{cursor:pointer;color:var(--mf-link);font-weight:600}
.mosoo-fallback .mf-table{margin-top:16px;overflow-x:auto}
.mosoo-fallback table{width:100%;border-collapse:collapse;font-size:15px}
.mosoo-fallback th,.mosoo-fallback td{padding:10px 16px 10px 0;border-bottom:1px solid var(--mf-line);text-align:left;vertical-align:top}
.mosoo-fallback th{font-weight:600}
.mosoo-fallback dl{margin:8px 0 0}
.mosoo-fallback dt{margin-top:12px;font-weight:600}
.mosoo-fallback dd{margin:2px 0 0}
.mosoo-fallback .mf-releases dt{font-weight:500}
.mosoo-fallback .mf-qa h3{margin-top:32px}
.mosoo-fallback .mf-foot{padding-top:48px;padding-bottom:48px;border-top:1px solid var(--mf-line)}
.mosoo-fallback .mf-signoff{margin:0;font-size:clamp(22px,3vw,28px);font-weight:650;line-height:1.25}
.mosoo-fallback .mf-groups{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:24px;margin-top:32px}
.mosoo-fallback .mf-groups ul{margin:8px 0 0;padding:0;list-style:none}
.mosoo-fallback .mf-groups li{margin-top:4px}
.mosoo-fallback .mf-label{margin:0;font-weight:600}
@media (min-width:768px){.mosoo-fallback .mf-bar,.mosoo-fallback main,.mosoo-fallback .mf-foot{padding-left:32px;padding-right:32px}.mosoo-fallback .mf-grid,.mosoo-fallback .mf-cols{grid-template-columns:repeat(2,minmax(0,1fr))}}
</style>`;
