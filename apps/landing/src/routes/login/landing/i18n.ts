import { locale } from "@/shared/locale";

// Strings for the home page below the first screen: the supply-side wall,
// the app/mosoo ledger, proof, limits, FAQ and the final call to action. Copy
// source: v1 copy deck §4 to §11 and §18, checked against the main repo
// (README, docs/SPEC.md, docs/prd). The FAQ questions and answers are the
// same strings the FAQPage JSON-LD and llms.txt use, so humans and crawlers
// read identical answers; change them together.
//
// "|" in a Chinese or Japanese string marks a phrase edge where a heading,
// label or button may wrap (Phrases in ui.tsx). t() strips the marks; tp()
// keeps them. FAQ strings carry no marks: they must match the JSON-LD.
const ZH_MESSAGES = {
  "Every Session runs one of 4 runtimes on your own model key.":
    "每个 Session 选用 4 个 runtime 之一，|使用你自己的|模型密钥。",
  "Pick the runtime and model per Session. Models run on your keys for the providers below, or on a custom OpenAI-compatible endpoint at a public HTTPS URL. mosoo checks that the runtime, model, and protocol fit before anything runs.":
    "每个 Session 单独选择 runtime 和模型。模型使用你自己的密钥，可选下列模型供应商，也可以接入公网 HTTPS 地址上的自定义 OpenAI 兼容端点。mosoo 会在执行前检查 runtime、模型和协议是否匹配。",
  "Runtimes and the model protocols they accept": "runtime 与|可接受的|模型协议",
  Runtime: "Runtime",
  "API id": "API id",
  Accepted: "支持",
  "Not accepted": "不支持",
  "Claude Agent SDK runs Anthropic models only.": "Claude Agent SDK 只运行 Anthropic 模型。",
  "Pi takes text input only. Files reach it through the Session workspace.":
    "Pi 只接受文本输入，文件通过 Session 工作区传给它。",
  "Model providers (your keys)": "模型供应商|（使用你的密钥）",
  "Custom OpenAI-compatible endpoint (public HTTPS)": "自定义 OpenAI 兼容端点|（公网 HTTPS）",
  "Provider keys belong to your Project, and the provider bills your account directly.":
    "模型供应商密钥属于你的项目，费用由供应商直接向你的账户收取。",
  "Names and logos identify compatible services and don’t imply a partnership or endorsement.":
    "名称和标志仅用于标明兼容的服务，不代表合作或背书。",
  "Your app keeps its users. mosoo runs the Agent.": "你的应用管用户，|mosoo 运行 Agent。",
  "Your app keeps": "你的应用负责",
  "mosoo runs": "mosoo 负责",
  "Your app": "你的应用",
  "Calls the API from your backend": "从你的后端调用 API",
  "Holds provider keys and MCP credentials": "保管模型供应商密钥和 MCP 凭据",
  "Session sandbox": "Session 的 sandbox",
  "One per Session. Keys never enter it.": "每个 Session 一个，密钥从不进入。",
  "Project API key": "Project API 密钥",
  "Expiring grants only": "只有会过期的授权",
  "Business logic": "业务逻辑",
  "What the task is for and what happens to the result": "任务为什么做，结果怎么用",
  "End-user authentication": "终端用户|认证",
  "mosoo never signs your users in": "mosoo 不替你的用户登录",
  "Business queues": "业务队列",
  "When work starts and in what order": "什么时候开始、按什么顺序",
  "Result validation": "结果校验",
  "You decide whether the report is right": "报告对不对，由你判断",
  "Business storage": "业务存储",
  "Keep the `thread.id` and whatever you extract": "保存 `thread.id` 和你提取的结果",
  UI: "界面",
  "The screens your users see": "用户看到的页面",
  "Agent execution": "Agent 执行",
  "The harness runs each turn: model calls, code, tools": "harness 运行每个 turn：模型调用、代码、工具",
  "Inline configuration needs no saved Agent. A runtime and protocol that don’t match are rejected before anything runs.":
    "inline 配置不需要事先保存 Agent。runtime 与协议不匹配时，会在执行前被拒绝。",
  Sandboxing: "sandbox 隔离",
  "One sandbox per Session, never shared": "每个 Session 一个 sandbox，从不共享",
  "Provider keys and MCP credentials stay outside it. Code inside can read Environment variables.":
    "模型供应商密钥和 MCP 凭据留在它之外。sandbox 里的代码可以读取环境变量。",
  "Durable continuation": "持久续接",
  "Follow-ups restore the last checkpoint": "后续消息从最近一次检查点恢复",
  "A reply 1 minute or 7 days later has the same semantics. If the checkpoint can’t be restored, the follow-up fails with an error.":
    "1 分钟后或 7 天后回复，语义相同。检查点无法恢复时，后续消息会明确报错。",
  "Input files and artifacts": "输入文件|与产出物",
  "Attachments mount read-only. Files written under `outputs/` become artifacts.":
    "附件只读挂载，写到 `outputs/` 下的文件成为产出物",
  "Other workspace files come back with the checkpoint but aren’t listed for download.":
    "其他工作区文件会随检查点恢复，但不会列为可下载文件。",
  Events: "事件",
  "Saved first, then streamed over SSE": "先保存，再通过 SSE 推送",
  "Stable event IDs let a client reconnect without duplicates. There are no Webhooks.":
    "稳定的事件 ID 让客户端重连时不会收到重复事件。mosoo 不提供 Webhook。",
  "Usage measurement": "用量计量",
  "One record per model call": "每次模型调用一条记录",
  "Measured tokens and cost estimates. They are not invoices.": "实测的 token 数和估算成本，不是账单。",
  "Runtime cleanup": "运行时|清理",
  "Idle sandboxes are reclaimed; the Session’s state stays": "闲置的 sandbox 会被回收，Session 的状态保留",
  "A turn succeeds only once its events, usage, and a checkpoint are committed. Until then, the sandbox is not reclaimed.":
    "事件、用量和检查点一起提交后，turn 才算成功。在那之前，sandbox 不会被回收。",
  "mosoo doesn’t authenticate your end users. If your MCP servers need to know who asked, label the Thread with your own `userId`.":
    "mosoo 不认证你的终端用户。如果你的 MCP 服务器需要知道是谁发起的请求，可以给 Thread 标上你自己的 `userId`。",
  "The source, the releases, and production status are public.": "源码、|版本发布|和生产状态|都是公开的。",
  "The claims on this page come from the main repository: its README, product spec, and OpenAPI documents. mosoo is in Alpha.":
    "本页的说法都来自主仓库：README、产品规格和 OpenAPI 文档。mosoo 目前处于 Alpha 阶段。",
  "Read the product spec": "阅读产品规格",
  Source: "源码",
  Releases: "版本发布",
  "Production status": "生产状态",
  Postmortems: "事故复盘",
  "The runtime, console, and API are Apache 2.0 on GitHub. The stack: Cloudflare Workers, Durable Objects, D1, R2, and Containers.":
    "runtime、控制台和 API 以 Apache 2.0 许可证开源在 GitHub 上。技术栈：Cloudflare Workers、Durable Objects、D1、R2 和 Containers。",
  "mosoo.ai/health is built from production Worker outcomes and real Run completions. A runtime without production samples shows Unknown.":
    "mosoo.ai/health 根据生产环境 Worker 的调用结果和真实的 Run 完成情况生成。没有生产样本的 runtime 显示为“未知”。",
  "6 incident postmortems from July to September 2026 are in the repo. Newer incidents are tracked as GitHub issues.":
    "仓库里有 6 篇事故复盘，时间从 2026 年 7 月到 9 月。之后的事故改在 GitHub issue 中跟踪。",
  "View source": "查看源码",
  "View all releases": "查看全部版本",
  "Open the status page": "打开状态页",
  "Read the postmortems": "阅读事故复盘",
  Latest: "最新版本",
  "Smaller codebase. The public Thread API v1 and v2 did not change.": "代码库瘦身，公开 Thread API v1 和 v2 没有变化。",
  "Pi joins as the fourth runtime.": "Pi 成为第 4 个 runtime。",
  "Sessions start straight from a Project, with no Agent required.": "可直接从项目启动 Session，无需 Agent。",
  "Built by the mosoo team.": "由 mosoo 团队构建。",
  "An uploaded avatar comes back as a validated ZIP with all 9 Codex pet animation states. The backend calls mosoo through the Thread API, and the token never reaches the browser.":
    "上传一张头像，返回一个通过校验的 ZIP，包含 Codex 宠物全部 9 种动画状态。后端通过 Thread API 调用 mosoo，令牌从不进入浏览器。",
  "Built by AsperforMias.": "由 AsperforMias 构建。",
  "For each public GitHub repository, ghfind’s Go worker starts a Thread and turns the 3 artifacts the Agent saves (analysis JSON, evidence JSON, and a Markdown report) into its own result page.":
    "针对每个公开的 GitHub 仓库，ghfind 的 Go worker 会启动一个 Thread，并把 Agent 保存的 3 个产出物（分析 JSON、证据 JSON 和一份 Markdown 报告）渲染成自己的结果页。",
  "Read the Codex Pet use case": "查看 Codex Pet 用例",
  "Read the ghfind use case": "查看 ghfind 用例",
  "Open ghfind": "打开 ghfind",
  "See all use cases": "查看全部用例",
  "What codex-pet.zip holds: a spritesheet of 8 columns and 9 rows, one row per animation state (idle, running-right, running-left, waving, jumping, failed, waiting, running, and review), plus a manifest and QA files.":
    "codex-pet.zip 的内容：一张 8 列 9 行的精灵图，每行一种动画状态（idle、running-right、running-left、waving、jumping、failed、waiting、running 和 review），另有 manifest 和 QA 文件。",
  "spritesheet, 8 columns × 9 rows": "精灵图，8 列 × 9 行",
  "The ghfind Projects page, where a mosoo Agent evaluates public GitHub repositories.":
    "ghfind 的 Projects 页面，mosoo Agent 在这里评估公开的 GitHub 仓库。",
  "mosoo has no Webhooks, tool approvals, or billing.": "mosoo 不提供 Webhook、|工具审批|和计费。",
  "Plan around these before you build. Each row says what to use instead.":
    "开始构建前，先把这些考虑进去。每一行都写了可以改用什么。",
  "Not included": "不包含",
  "Use instead": "可以改用",
  "Instead:": "改用：",
  Webhooks: "Webhook",
  "Stream events over SSE, or read the saved history.": "通过 SSE 接收事件，或读取已保存的历史。",
  "Interactive tool approvals": "交互式|工具审批",
  "Agents run with full access inside the Session’s own sandbox.": "Agent 在该 Session 自己的 sandbox 内以完全权限运行。",
  "Models, credits, billing, or a spending cap": "模型、|充值、|计费|或花费上限",
  "Use your own provider key. The provider bills you, and the usage API lists every model call.":
    "使用你自己的模型供应商密钥。费用由供应商直接收取，用量 API 会列出每次模型调用。",
  "Git mounting, private repository access, or branch and PR workflows":
    "Git 挂载、|私有仓库授权，|以及分支和 PR 工作流",
  "Pass a public URL with an exact commit, or upload the files.": "传入公开 URL 和确切的 commit，或直接上传文件。",
  "Your own runtimes, a connector marketplace, or local MCP servers":
    "自带 runtime、|连接器市场|或本地 MCP 服务器",
  "Pick one of the 4 runtimes and connect remote HTTPS MCP servers.": "从 4 个 runtime 中选一个，并接入远程 HTTPS MCP 服务器。",
  "An online file editor or file manager": "在线文件编辑器|或文件管理器",
  "Upload inputs and download artifacts through the API.": "通过 API 上传输入文件、下载产出物。",
  "Chat channels or a personal cloud computer": "聊天渠道|或个人|云端计算机",
  "That’s Mosoo Computer, a separate product.": "这属于另一款产品 Mosoo Computer。",
  "Questions to ask before you build on mosoo": "开始构建前|值得问的问题",
  "Start your first Session": "启动你的|第一个 Session",
  "In the console": "在控制台中",
  "Sign in with email or Google. Your first sign-in creates a Default Project.":
    "用邮箱或 Google 登录。首次登录会自动创建默认项目。",
  "Add a provider key.": "添加模型供应商密钥。",
  "Start a Session.": "启动 Session。",
  "Try mosoo": "试用 mosoo",
  "In your coding agent": "在编码智能体中",
  "Paste the setup prompt into Codex, Claude Code, OpenCode, Cursor, or Cline. It installs the CLI, then asks you to add a provider key in the console, the one step it can’t do for you.":
    "把设置提示粘贴到 Codex、Claude Code、OpenCode、Cursor 或 Cline。它会安装 CLI，然后请你在控制台添加模型供应商密钥，这是它唯一无法替你完成的一步。",
  "Copy setup prompt": "复制|设置提示",
  "Setup prompt copied": "设置提示已复制",
  "Copy failed. Open the prompt below and copy it by hand.": "复制失败。请展开下方的提示，手动复制。",
  "Read the setup prompt": "查看|设置提示",
  "Copy command": "复制命令",
  "Command copied": "命令已复制",
  "Copy failed.": "复制失败。",
  "Read the install script": "查看安装脚本",
  "mosoo is in Alpha. Public APIs may still change.": "mosoo 目前处于 Alpha 阶段，|公开 API 仍可能变化。",
  "What is mosoo?": "mosoo 是什么？",
  "mosoo is an open-source, API-first managed Agent runtime for application backends. It runs OpenAI Codex, Claude Agent SDK, OpenCode, and Pi behind one API, and each Session runs in its own sandbox. Your backend starts the work and reads the results. mosoo handles execution, files, events, and usage. mosoo is in Alpha.":
    "mosoo 是开源、API 优先的托管 Agent runtime，面向应用后端。它用一个 API 运行 OpenAI Codex、Claude Agent SDK、OpenCode 和 Pi，每个 Session 都在自己的 sandbox 中执行。你的后端发起任务、读取结果，执行、文件、事件和用量由 mosoo 负责。mosoo 目前处于 Alpha 阶段。",
  "Do I need to create or publish an Agent first?": "需要先创建或发布 Agent 吗？",
  "No. On /api/v2, one request carries the harness, provider, model, instructions, and input, and mosoo starts a durable Session without creating an Agent. Saved Agent presets are optional. You need one to attach Skills, MCP servers, or a non-default Environment.":
    "不需要。在 /api/v2 上，一个请求就能带上 harness、模型供应商、模型、指令和输入，mosoo 会直接启动持久 Session，不会创建 Agent。保存的 Agent 预设是可选的，挂载技能、MCP 服务器或使用非默认环境时才需要它。",
  "Which runtimes and models can I use?": "可以用哪些 runtime 和模型？",
  "There are 4 runtimes: OpenAI Codex, Claude Agent SDK, OpenCode, and Pi. Models run on your own keys for Anthropic, OpenAI, DeepSeek, Gemini, Qwen, Kimi, Zhipu, MiniMax, or OpenCode Zen, or on a custom OpenAI-compatible HTTPS endpoint. Each runtime accepts specific model protocols, and mosoo rejects a mismatched pair before anything runs.":
    "共有 4 个 runtime：OpenAI Codex、Claude Agent SDK、OpenCode 和 Pi。模型使用你自己的密钥，可选 Anthropic、OpenAI、DeepSeek、Gemini、Qwen、Kimi、Zhipu、MiniMax 和 OpenCode Zen，也可以接入自定义的 OpenAI 兼容 HTTPS 端点。每个 runtime 只接受特定的模型协议，不匹配的组合会在执行前被拒绝。",
  "Who pays for model usage?": "模型费用由谁支付？",
  "You do, directly. Model keys belong to your Project, and the provider bills your account. mosoo supplies no models and sets no spending cap. The usage API and the Usage page show measured tokens and cost estimates. They are not invoices.":
    "由你直接支付。模型密钥属于你的项目，由模型供应商向你的账户计费。mosoo 不提供模型，也不设花费上限。用量 API 和用量页面显示实测的 token 数和估算成本，它们不是账单。",
  "What happens when I reply hours or days later?": "隔几小时或几天再回复，会怎样？",
  "The reply continues the same Session. A follow-up 1 minute or 7 days after a completed turn has the same semantics, even after the sandbox was reclaimed, though a cold start can take longer. mosoo restores the working directory, the harness’s native conversation, the frozen configuration, and recorded artifacts from the last committed checkpoint. Live processes are not carried over. If the checkpoint can’t be restored, the follow-up fails with an error instead of starting empty.":
    "回复会在同一个 Session 里继续。在一个 turn 完成 1 分钟后还是 7 天后回复，语义完全相同，即使 sandbox 已被回收也是如此，只是冷启动可能更慢。mosoo 会从最近一次提交的检查点恢复工作目录、harness 的原生对话、冻结的配置和已记录的产出物。运行中的进程不会保留。检查点无法恢复时，后续消息会明确报错，不会从空白状态开始。",
  "Do my API keys enter the sandbox?": "我的 API 密钥会进入 sandbox 吗？",
  "No. Provider keys and MCP credentials stay outside the sandbox. The runtime reaches models and MCP servers through mosoo’s proxies, which add the credential on each request. Environment variables are different. Code in the sandbox can read them, so keep model keys in Providers and tool tokens in MCP connections.":
    "不会。模型供应商密钥和 MCP 凭据留在 sandbox 之外，runtime 通过 mosoo 的代理访问模型和 MCP 服务器，代理在每次请求时注入凭据。环境变量则不同，sandbox 里的代码可以读取它们，所以模型密钥请放在模型供应商设置里，工具令牌请放在 MCP 连接里。",
  "How do I follow progress and get results?": "怎样跟踪进度、拿到结果？",
  "Read the Thread’s status and saved event history, or open an SSE stream that starts with the latest saved events. Stable event IDs let a reconnecting client skip what it already has. Files the Agent writes under outputs/ become downloadable artifacts. There are no Webhooks.":
    "读取 Thread 的状态和已保存的事件历史，或者打开 SSE 流，它会先发送最新的已保存事件。稳定的事件 ID 让重连的客户端可以跳过已经收到的事件。Agent 写到 outputs/ 下的文件会成为可下载的产出物。mosoo 不提供 Webhook。",
  "How long can a turn run?": "一个 turn 最长能运行多久？",
  "Up to 2 hours. A Session runs one turn at a time. Input sent to a busy Session is rejected, and there is no input queue. If a turn needs a new sandbox and no capacity is free, it fails at once: its Run ends with the retryable runtime.capacity_exhausted error, and mosoo does not queue it.":
    "最长 2 小时。一个 Session 同一时间只运行一个 turn。Session 忙碌时发来的输入会被拒绝，也没有输入队列。如果某个 turn 需要新的 sandbox 而没有空闲容量，它会立即失败：对应的 Run 以可重试的 runtime.capacity_exhausted 错误结束，mosoo 不会把它排队。",
  "Can I retry a request without running the work twice?": "重试请求会不会让任务执行两次？",
  "Yes, for creation and follow-ups. Send an Idempotency-Key header. For 24 hours, the same key and body return the original result without new work, and a changed body is rejected. Idempotency does not make side effects in external tools exactly-once.":
    "创建请求和后续消息都不会，前提是带上 Idempotency-Key 请求头。24 小时内，相同的 key 和请求体会返回原来的结果，不会产生新的执行；请求体变了则会被拒绝。幂等不保证外部工具的副作用只发生一次。",
  "Is mosoo open source, and is it ready for production?": "mosoo 开源吗？可以用于生产环境吗？",
  "mosoo is licensed under Apache 2.0, and the source is on GitHub. It is in Alpha, so public APIs and product behavior may still change. /api/v1 stays wire-compatible, and a change that can’t stay compatible ships as a new API version. The quickest way to try mosoo is the hosted console at cloud.mosoo.ai. The README explains how to run it locally for development.":
    "mosoo 以 Apache 2.0 许可证开源，源码在 GitHub 上。它目前处于 Alpha 阶段，公开 API 和产品行为仍可能变化。/api/v1 保持线上兼容，无法兼容的改动会作为新的 API 版本发布。最快的试用方式是托管控制台 cloud.mosoo.ai。README 也说明了如何在本地运行，方便开发。",
} as const;

type Message = keyof typeof ZH_MESSAGES;

const JA_MESSAGES = {
  "Every Session runs one of 4 runtimes on your own model key.":
    "Session ごとに 4 つの runtime から|選び、|ご自身の|モデルキーで|実行します。",
  "Pick the runtime and model per Session. Models run on your keys for the providers below, or on a custom OpenAI-compatible endpoint at a public HTTPS URL. mosoo checks that the runtime, model, and protocol fit before anything runs.":
    "runtime とモデルは Session ごとに選べます。モデルはご自身のキーで、以下のプロバイダーか、公開 HTTPS URL にある OpenAI 互換のカスタムエンドポイントを利用します。mosoo は実行前に runtime、モデル、プロトコルの組み合わせを確認します。",
  "Runtimes and the model protocols they accept": "runtime と|対応する|モデルプロトコル",
  Runtime: "runtime",
  "API id": "API id",
  Accepted: "対応",
  "Not accepted": "非対応",
  "Claude Agent SDK runs Anthropic models only.": "Claude Agent SDK は Anthropic のモデルのみ実行します。",
  "Pi takes text input only. Files reach it through the Session workspace.":
    "Pi はテキスト入力のみに対応し、ファイルは Session のワークスペース経由で渡ります。",
  "Model providers (your keys)": "モデルプロバイダー|（ご自身のキー）",
  "Custom OpenAI-compatible endpoint (public HTTPS)": "OpenAI 互換の|カスタムエンドポイント|（公開 HTTPS）",
  "Provider keys belong to your Project, and the provider bills your account directly.":
    "プロバイダーキーはプロジェクトに属し、料金はプロバイダーからお客様のアカウントに直接請求されます。",
  "Names and logos identify compatible services and don’t imply a partnership or endorsement.":
    "名称とロゴは互換性のあるサービスを示すもので、提携や推奨を意味するものではありません。",
  "Your app keeps its users. mosoo runs the Agent.": "ユーザーはアプリが持ち、|Agent は mosoo が動かす",
  "Your app keeps": "アプリが担うこと",
  "mosoo runs": "mosoo が担うこと",
  "Your app": "あなたのアプリ",
  "Calls the API from your backend": "バックエンドから API を呼び出す",
  "Holds provider keys and MCP credentials": "プロバイダーキーと MCP の認証情報を保管",
  "Session sandbox": "Session の sandbox",
  "One per Session. Keys never enter it.": "Session ごとに 1 つ。キーは入りません。",
  "Project API key": "Project API キー",
  "Expiring grants only": "期限付きの権限だけ",
  "Business logic": "ビジネスロジック",
  "What the task is for and what happens to the result": "タスクの目的と、結果の使い道",
  "End-user authentication": "エンドユーザー|認証",
  "mosoo never signs your users in": "mosoo がユーザーをログインさせることはありません",
  "Business queues": "業務キュー",
  "When work starts and in what order": "いつ、どの順で始めるか",
  "Result validation": "結果の検証",
  "You decide whether the report is right": "レポートが正しいかを判断する",
  "Business storage": "業務データの|保存",
  "Keep the `thread.id` and whatever you extract": "`thread.id` と抽出した結果を保存する",
  UI: "UI",
  "The screens your users see": "ユーザーが見る画面",
  "Agent execution": "Agent の実行",
  "The harness runs each turn: model calls, code, tools": "harness が turn ごとにモデル呼び出し、コード、ツールを実行",
  "Inline configuration needs no saved Agent. A runtime and protocol that don’t match are rejected before anything runs.":
    "inline 設定なら保存済みの Agent は不要です。runtime とプロトコルが合わない組み合わせは、実行前に拒否されます。",
  Sandboxing: "sandbox による|分離",
  "One sandbox per Session, never shared": "Session ごとに 1 つ、共有しない",
  "Provider keys and MCP credentials stay outside it. Code inside can read Environment variables.":
    "プロバイダーキーと MCP の認証情報は sandbox の外に置かれます。環境変数は sandbox 内のコードから読み取れます。",
  "Durable continuation": "永続的な|継続",
  "Follow-ups restore the last checkpoint": "フォローアップは最後のチェックポイントから復元",
  "A reply 1 minute or 7 days later has the same semantics. If the checkpoint can’t be restored, the follow-up fails with an error.":
    "1 分後でも 7 日後でも、返信の意味は同じです。チェックポイントを復元できない場合、フォローアップはエラーになります。",
  "Input files and artifacts": "入力ファイルと|成果物",
  "Attachments mount read-only. Files written under `outputs/` become artifacts.":
    "添付ファイルは読み取り専用、`outputs/` のファイルは成果物に",
  "Other workspace files come back with the checkpoint but aren’t listed for download.":
    "それ以外のワークスペースのファイルはチェックポイントから戻りますが、ダウンロード一覧には出ません。",
  Events: "イベント",
  "Saved first, then streamed over SSE": "保存してから SSE で配信",
  "Stable event IDs let a client reconnect without duplicates. There are no Webhooks.":
    "安定したイベント ID により、再接続しても重複しません。Webhook はありません。",
  "Usage measurement": "使用量の|計測",
  "One record per model call": "モデル呼び出しごとに 1 件",
  "Measured tokens and cost estimates. They are not invoices.": "計測したトークン数と推定コストです。請求書ではありません。",
  "Runtime cleanup": "runtime の|後片付け",
  "Idle sandboxes are reclaimed; the Session’s state stays": "アイドルの sandbox は回収し、Session の状態は残す",
  "A turn succeeds only once its events, usage, and a checkpoint are committed. Until then, the sandbox is not reclaimed.":
    "イベント、使用量、チェックポイントがコミットされて初めて turn は成功します。それまで sandbox は回収されません。",
  "mosoo doesn’t authenticate your end users. If your MCP servers need to know who asked, label the Thread with your own `userId`.":
    "mosoo はエンドユーザーを認証しません。MCP サーバーが依頼者を知る必要がある場合は、Thread に独自の `userId` を付けてください。",
  "The source, the releases, and production status are public.":
    "ソースコード、|リリース、|本番環境の|ステータスは|すべて公開されています。",
  "The claims on this page come from the main repository: its README, product spec, and OpenAPI documents. mosoo is in Alpha.":
    "このページの記述は、メインリポジトリの README、製品仕様、OpenAPI ドキュメントに基づいています。mosoo は現在 Alpha 版です。",
  "Read the product spec": "製品仕様を読む",
  Source: "ソースコード",
  Releases: "リリース",
  "Production status": "本番環境の|ステータス",
  Postmortems: "事後分析",
  "The runtime, console, and API are Apache 2.0 on GitHub. The stack: Cloudflare Workers, Durable Objects, D1, R2, and Containers.":
    "runtime、コンソール、API は Apache 2.0 ライセンスで GitHub に公開されています。技術スタックは Cloudflare Workers、Durable Objects、D1、R2、Containers です。",
  "mosoo.ai/health is built from production Worker outcomes and real Run completions. A runtime without production samples shows Unknown.":
    "mosoo.ai/health は、本番環境の Worker の呼び出し結果と、実際の Run の完了状況から作られています。本番環境のサンプルがない runtime は「不明」と表示されます。",
  "6 incident postmortems from July to September 2026 are in the repo. Newer incidents are tracked as GitHub issues.":
    "2026 年 7 月から 9 月までの 6 件のインシデント事後分析がリポジトリにあります。それ以降のインシデントは GitHub issue で管理しています。",
  "View source": "ソースコードを見る",
  "View all releases": "すべてのリリースを見る",
  "Open the status page": "ステータスページを開く",
  "Read the postmortems": "事後分析を読む",
  Latest: "最新",
  "Smaller codebase. The public Thread API v1 and v2 did not change.":
    "コードベースを整理。公開 Thread API の v1 と v2 は変わっていません。",
  "Pi joins as the fourth runtime.": "4 つ目の runtime として Pi が加わりました。",
  "Sessions start straight from a Project, with no Agent required.":
    "プロジェクトから直接 Session を開始でき、Agent は不要になりました。",
  "Built by the mosoo team.": "mosoo チームが作成。",
  "An uploaded avatar comes back as a validated ZIP with all 9 Codex pet animation states. The backend calls mosoo through the Thread API, and the token never reaches the browser.":
    "アップロードしたアバター 1 枚から、Codex ペットの 9 つのアニメーション状態をすべて含む検証済みの ZIP が返ってきます。バックエンドは Thread API で mosoo を呼び出し、トークンがブラウザに渡ることはありません。",
  "Built by AsperforMias.": "AsperforMias が作成。",
  "For each public GitHub repository, ghfind’s Go worker starts a Thread and turns the 3 artifacts the Agent saves (analysis JSON, evidence JSON, and a Markdown report) into its own result page.":
    "公開されている GitHub リポジトリごとに ghfind の Go ワーカーが Thread を開始し、Agent が保存した 3 つの成果物（分析 JSON、エビデンス JSON、Markdown レポート）を自前の結果ページに表示します。",
  "Read the Codex Pet use case": "Codex Pet のユースケースを読む",
  "Read the ghfind use case": "ghfind のユースケースを読む",
  "Open ghfind": "ghfind を開く",
  "See all use cases": "すべてのユースケースを見る",
  "What codex-pet.zip holds: a spritesheet of 8 columns and 9 rows, one row per animation state (idle, running-right, running-left, waving, jumping, failed, waiting, running, and review), plus a manifest and QA files.":
    "codex-pet.zip の中身：8 列 9 行のスプライトシート（1 行に 1 つのアニメーション状態：idle、running-right、running-left、waving、jumping、failed、waiting、running、review）と、マニフェストと QA ファイル。",
  "spritesheet, 8 columns × 9 rows": "スプライトシート、8 列 × 9 行",
  "The ghfind Projects page, where a mosoo Agent evaluates public GitHub repositories.":
    "mosoo の Agent が公開 GitHub リポジトリを評価する、ghfind の Projects ページ。",
  "mosoo has no Webhooks, tool approvals, or billing.": "mosoo には Webhook、|ツールの承認、|課金は|ありません。",
  "Plan around these before you build. Each row says what to use instead.":
    "作り始める前に、これらを前提にしてください。各行に代わりの方法があります。",
  "Not included": "含まれないもの",
  "Use instead": "代わりに使うもの",
  "Instead:": "代わりに：",
  Webhooks: "Webhook",
  "Stream events over SSE, or read the saved history.": "SSE でイベントを受け取るか、保存済みの履歴を読み取ってください。",
  "Interactive tool approvals": "ツール実行の|対話的な承認",
  "Agents run with full access inside the Session’s own sandbox.": "Agent は Session 専用の sandbox 内で、フルアクセス権限で動作します。",
  "Models, credits, billing, or a spending cap": "モデルの提供、|チャージ、|課金、|支出上限",
  "Use your own provider key. The provider bills you, and the usage API lists every model call.":
    "ご自身のプロバイダーキーを使います。料金はプロバイダーから直接請求され、使用量 API でモデル呼び出しごとに確認できます。",
  "Git mounting, private repository access, or branch and PR workflows":
    "Git のマウント、|プライベートリポジトリの|認可、|ブランチや PR のワークフロー",
  "Pass a public URL with an exact commit, or upload the files.": "公開 URL と正確なコミットを渡すか、ファイルをアップロードしてください。",
  "Your own runtimes, a connector marketplace, or local MCP servers":
    "独自 runtime の|持ち込み、|コネクタの|マーケットプレイス、|ローカル MCP サーバー",
  "Pick one of the 4 runtimes and connect remote HTTPS MCP servers.":
    "4 つの runtime から選び、リモートの HTTPS MCP サーバーを接続してください。",
  "An online file editor or file manager": "オンラインの|ファイルエディターや|ファイルマネージャー",
  "Upload inputs and download artifacts through the API.": "API で入力ファイルをアップロードし、成果物をダウンロードしてください。",
  "Chat channels or a personal cloud computer": "チャットチャネルや|個人用の|クラウドコンピューター",
  "That’s Mosoo Computer, a separate product.": "それは別のプロダクト、Mosoo Computer の領域です。",
  "Questions to ask before you build on mosoo": "使い始める前に|確認したいこと",
  "Start your first Session": "最初の Session を|始める",
  "In the console": "コンソールで",
  "Sign in with email or Google. Your first sign-in creates a Default Project.":
    "メールアドレスまたは Google でログインします。初回ログインでデフォルトプロジェクトが作成されます。",
  "Add a provider key.": "プロバイダーキーを追加します。",
  "Start a Session.": "Session を開始します。",
  "Try mosoo": "mosoo を試す",
  "In your coding agent": "コーディング|エージェントで",
  "Paste the setup prompt into Codex, Claude Code, OpenCode, Cursor, or Cline. It installs the CLI, then asks you to add a provider key in the console, the one step it can’t do for you.":
    "セットアッププロンプトを Codex、Claude Code、OpenCode、Cursor、Cline のいずれかに貼り付けます。CLI をインストールしたあと、コンソールでプロバイダーキーを追加するよう求めます。エージェントが代わりにできない唯一の手順です。",
  "Copy setup prompt": "セットアップ|プロンプトを|コピー",
  "Setup prompt copied": "セットアッププロンプトをコピーしました",
  "Copy failed. Open the prompt below and copy it by hand.":
    "コピーに失敗しました。下のプロンプトを開いて、手動でコピーしてください。",
  "Read the setup prompt": "セットアップ|プロンプトを|読む",
  "Copy command": "コマンドを|コピー",
  "Command copied": "コマンドをコピーしました",
  "Copy failed.": "コピーに失敗しました。",
  "Read the install script": "インストールスクリプトを確認する",
  "mosoo is in Alpha. Public APIs may still change.": "mosoo は現在 Alpha 版です。|公開 API は|変更される可能性があります。",
  "What is mosoo?": "mosoo とは何ですか？",
  "mosoo is an open-source, API-first managed Agent runtime for application backends. It runs OpenAI Codex, Claude Agent SDK, OpenCode, and Pi behind one API, and each Session runs in its own sandbox. Your backend starts the work and reads the results. mosoo handles execution, files, events, and usage. mosoo is in Alpha.":
    "mosoo は、アプリケーションのバックエンドのための、オープンソースで API ファーストなマネージド Agent runtime です。OpenAI Codex、Claude Agent SDK、OpenCode、Pi を 1 つの API で実行し、Session ごとに専用の sandbox を使います。バックエンドはタスクを開始して結果を受け取り、実行、ファイル、イベント、使用量は mosoo が担います。mosoo は現在 Alpha 版です。",
  "Do I need to create or publish an Agent first?": "先に Agent を作成または公開する必要はありますか？",
  "No. On /api/v2, one request carries the harness, provider, model, instructions, and input, and mosoo starts a durable Session without creating an Agent. Saved Agent presets are optional. You need one to attach Skills, MCP servers, or a non-default Environment.":
    "いいえ。/api/v2 では、harness、プロバイダー、モデル、指示、入力を 1 つのリクエストに含めるだけで、mosoo は Agent を作成せずに永続的な Session を開始します。保存済みの Agent プリセットは任意で、スキルや MCP サーバーを使う場合、またはデフォルト以外の Environment を使う場合に必要です。",
  "Which runtimes and models can I use?": "どの runtime とモデルを使えますか？",
  "There are 4 runtimes: OpenAI Codex, Claude Agent SDK, OpenCode, and Pi. Models run on your own keys for Anthropic, OpenAI, DeepSeek, Gemini, Qwen, Kimi, Zhipu, MiniMax, or OpenCode Zen, or on a custom OpenAI-compatible HTTPS endpoint. Each runtime accepts specific model protocols, and mosoo rejects a mismatched pair before anything runs.":
    "runtime は OpenAI Codex、Claude Agent SDK、OpenCode、Pi の 4 つです。モデルはご自身のキーで利用し、Anthropic、OpenAI、DeepSeek、Gemini、Qwen、Kimi、Zhipu、MiniMax、OpenCode Zen のほか、OpenAI 互換のカスタム HTTPS エンドポイントも使えます。runtime ごとに対応するモデルプロトコルが決まっており、合わない組み合わせは実行前に拒否されます。",
  "Who pays for model usage?": "モデルの利用料金は誰が支払いますか？",
  "You do, directly. Model keys belong to your Project, and the provider bills your account. mosoo supplies no models and sets no spending cap. The usage API and the Usage page show measured tokens and cost estimates. They are not invoices.":
    "お客様が直接支払います。モデルのキーはプロジェクトに属し、プロバイダーがお客様のアカウントに請求します。mosoo はモデルを提供せず、支出上限も設けません。使用量 API と使用量ページには計測したトークン数と推定コストが表示されますが、請求書ではありません。",
  "What happens when I reply hours or days later?": "数時間後や数日後に返信するとどうなりますか？",
  "The reply continues the same Session. A follow-up 1 minute or 7 days after a completed turn has the same semantics, even after the sandbox was reclaimed, though a cold start can take longer. mosoo restores the working directory, the harness’s native conversation, the frozen configuration, and recorded artifacts from the last committed checkpoint. Live processes are not carried over. If the checkpoint can’t be restored, the follow-up fails with an error instead of starting empty.":
    "同じ Session で続きが実行されます。turn の完了から 1 分後でも 7 日後でも、sandbox が回収された後でも、返信の意味は変わりません。ただし、コールドスタートでは開始まで時間がかかることがあります。mosoo は最後にコミットされたチェックポイントから、作業ディレクトリ、harness のネイティブな会話、固定された設定、記録済みの成果物を復元します。実行中のプロセスは引き継がれません。チェックポイントを復元できない場合は、空の状態で始めずに明示的なエラーになります。",
  "Do my API keys enter the sandbox?": "API キーは sandbox に入りますか？",
  "No. Provider keys and MCP credentials stay outside the sandbox. The runtime reaches models and MCP servers through mosoo’s proxies, which add the credential on each request. Environment variables are different. Code in the sandbox can read them, so keep model keys in Providers and tool tokens in MCP connections.":
    "入りません。プロバイダーキーと MCP の認証情報は sandbox の外に置かれ、runtime は mosoo のプロキシ経由でモデルや MCP サーバーにアクセスします。認証情報はプロキシがリクエストごとに付与します。環境変数は例外で、sandbox 内のコードから読み取れます。モデルのキーはプロバイダー設定に、ツールのトークンは MCP 接続に保存してください。",
  "How do I follow progress and get results?": "進捗の確認と結果の取得はどうしますか？",
  "Read the Thread’s status and saved event history, or open an SSE stream that starts with the latest saved events. Stable event IDs let a reconnecting client skip what it already has. Files the Agent writes under outputs/ become downloadable artifacts. There are no Webhooks.":
    "Thread のステータスと保存済みのイベント履歴を読み取るか、SSE ストリームを開きます。SSE は最新の保存済みイベントから送信され、安定したイベント ID によって、再接続したクライアントは受信済みのイベントをスキップできます。Agent が outputs/ に書き込んだファイルは、ダウンロードできる成果物になります。Webhook はありません。",
  "How long can a turn run?": "1 つの turn はどのくらい実行できますか？",
  "Up to 2 hours. A Session runs one turn at a time. Input sent to a busy Session is rejected, and there is no input queue. If a turn needs a new sandbox and no capacity is free, it fails at once: its Run ends with the retryable runtime.capacity_exhausted error, and mosoo does not queue it.":
    "最長 2 時間です。1 つの Session で同時に実行できる turn は 1 つだけです。実行中の Session に送った入力は拒否され、入力キューはありません。turn に新しい sandbox が必要で空き容量がない場合、その turn はすぐに失敗し、Run は再試行可能な runtime.capacity_exhausted エラーで終わります。mosoo はその turn をキューに入れません。",
  "Can I retry a request without running the work twice?": "リクエストを再試行すると、処理が二重に実行されませんか？",
  "Yes, for creation and follow-ups. Send an Idempotency-Key header. For 24 hours, the same key and body return the original result without new work, and a changed body is rejected. Idempotency does not make side effects in external tools exactly-once.":
    "作成とフォローアップでは、Idempotency-Key ヘッダーを付ければ二重に実行されません。24 時間以内に同じキーと同じ本文を送ると、新しい処理を行わずに元の結果が返り、本文が異なる場合は拒否されます。ただし、外部ツールの副作用が 1 回だけになることまでは保証しません。",
  "Is mosoo open source, and is it ready for production?": "mosoo はオープンソースですか？本番環境で使えますか？",
  "mosoo is licensed under Apache 2.0, and the source is on GitHub. It is in Alpha, so public APIs and product behavior may still change. /api/v1 stays wire-compatible, and a change that can’t stay compatible ships as a new API version. The quickest way to try mosoo is the hosted console at cloud.mosoo.ai. The README explains how to run it locally for development.":
    "mosoo は Apache 2.0 ライセンスのオープンソースで、ソースコードは GitHub にあります。現在は Alpha 版のため、公開 API や製品の動作は変わる可能性があります。/api/v1 は互換性を維持し、互換性を保てない変更は新しい API バージョンとして公開されます。すぐに試すなら、ホスト版のコンソール cloud.mosoo.ai が最も手軽です。開発用にローカルで動かす手順は README にあります。",
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

/** FAQ entries in page order (copy deck §10). */
export const FAQ_MESSAGES = [
  { q: "What is mosoo?", a: "mosoo is an open-source, API-first managed Agent runtime for application backends. It runs OpenAI Codex, Claude Agent SDK, OpenCode, and Pi behind one API, and each Session runs in its own sandbox. Your backend starts the work and reads the results. mosoo handles execution, files, events, and usage. mosoo is in Alpha." },
  { q: "Do I need to create or publish an Agent first?", a: "No. On /api/v2, one request carries the harness, provider, model, instructions, and input, and mosoo starts a durable Session without creating an Agent. Saved Agent presets are optional. You need one to attach Skills, MCP servers, or a non-default Environment." },
  { q: "Which runtimes and models can I use?", a: "There are 4 runtimes: OpenAI Codex, Claude Agent SDK, OpenCode, and Pi. Models run on your own keys for Anthropic, OpenAI, DeepSeek, Gemini, Qwen, Kimi, Zhipu, MiniMax, or OpenCode Zen, or on a custom OpenAI-compatible HTTPS endpoint. Each runtime accepts specific model protocols, and mosoo rejects a mismatched pair before anything runs." },
  { q: "Who pays for model usage?", a: "You do, directly. Model keys belong to your Project, and the provider bills your account. mosoo supplies no models and sets no spending cap. The usage API and the Usage page show measured tokens and cost estimates. They are not invoices." },
  { q: "What happens when I reply hours or days later?", a: "The reply continues the same Session. A follow-up 1 minute or 7 days after a completed turn has the same semantics, even after the sandbox was reclaimed, though a cold start can take longer. mosoo restores the working directory, the harness’s native conversation, the frozen configuration, and recorded artifacts from the last committed checkpoint. Live processes are not carried over. If the checkpoint can’t be restored, the follow-up fails with an error instead of starting empty." },
  { q: "Do my API keys enter the sandbox?", a: "No. Provider keys and MCP credentials stay outside the sandbox. The runtime reaches models and MCP servers through mosoo’s proxies, which add the credential on each request. Environment variables are different. Code in the sandbox can read them, so keep model keys in Providers and tool tokens in MCP connections." },
  { q: "How do I follow progress and get results?", a: "Read the Thread’s status and saved event history, or open an SSE stream that starts with the latest saved events. Stable event IDs let a reconnecting client skip what it already has. Files the Agent writes under outputs/ become downloadable artifacts. There are no Webhooks." },
  { q: "How long can a turn run?", a: "Up to 2 hours. A Session runs one turn at a time. Input sent to a busy Session is rejected, and there is no input queue. If a turn needs a new sandbox and no capacity is free, it fails at once: its Run ends with the retryable runtime.capacity_exhausted error, and mosoo does not queue it." },
  { q: "Can I retry a request without running the work twice?", a: "Yes, for creation and follow-ups. Send an Idempotency-Key header. For 24 hours, the same key and body return the original result without new work, and a changed body is rejected. Idempotency does not make side effects in external tools exactly-once." },
  { q: "Is mosoo open source, and is it ready for production?", a: "mosoo is licensed under Apache 2.0, and the source is on GitHub. It is in Alpha, so public APIs and product behavior may still change. /api/v1 stays wire-compatible, and a change that can’t stay compatible ships as a new API version. The quickest way to try mosoo is the hosted console at cloud.mosoo.ai. The README explains how to run it locally for development." },
] as const satisfies readonly { q: Message; a: Message }[];
