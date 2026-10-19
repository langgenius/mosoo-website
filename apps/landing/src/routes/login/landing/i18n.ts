import { locale } from "@/shared/locale";

// Strings for the home page below the first screen: the supply-side wall,
// features, how it works, the app/mosoo split, proof, limits, FAQ and the
// final call to action. Copy source: v1 copy deck §4 to §11 and §18. The FAQ
// questions and answers are the same strings the FAQPage JSON-LD and llms.txt
// use, so humans and crawlers read identical answers; change them together.
const ZH_MESSAGES = {
  "Pick a runtime. Use your own model key.":
    "选一个 runtime，用你自己的模型密钥。",
  "4 runtimes, the providers below, or any OpenAI-compatible HTTPS endpoint. mosoo checks the runtime, model, and protocol before anything runs.":
    "4 个 runtime、下列模型供应商，或任何兼容 OpenAI 的 HTTPS 端点。mosoo 会在执行前检查 runtime、模型和协议是否匹配。",
  "Runtimes":
    "Runtime",
  "Model providers (your keys)":
    "模型供应商（使用你的密钥）",
  "Model protocols":
    "模型协议",
  "Name":
    "名称",
  "API id":
    "API id",
  "All 4":
    "全部 4 种",
  "All 4 (text input)":
    "全部 4 种（仅文本输入）",
  "Anthropic Messages (Anthropic models)":
    "Anthropic Messages（Anthropic 模型）",
  "Custom OpenAI-compatible endpoint":
    "自定义 OpenAI 兼容端点",
  "Provider keys belong to your Project, and the provider bills your account directly.":
    "模型供应商密钥属于你的项目，费用由供应商直接向你的账户收取。",
  "Names and logos identify compatible services and don’t imply a partnership or endorsement.":
    "名称和标志仅用于标明兼容的服务，不代表合作或背书。",
  "What mosoo runs for your backend":
    "mosoo 为你的后端承担的工作",
  "Each of these is a promise in the product spec. The spec is linked below.":
    "下面每一项都是产品规格里的承诺，规格链接在下方。",
  "Read the product spec":
    "阅读产品规格",
  "Start a Session without creating an Agent":
    "无需创建 Agent，直接启动 Session",
  "Put the harness, provider, model, and instructions in one request. mosoo starts a durable Session and creates no Agent.":
    "在一个请求里写明 harness、模型供应商、模型和指令，mosoo 就会启动持久 Session，不会创建 Agent。",
  "`configuration.type: \"inline\"` on `POST /api/v2/projects/{projectId}/threads`. Saved presets are optional.":
    "在 `POST /api/v2/projects/{projectId}/threads` 中使用 `configuration.type: \"inline\"`。保存的 Agent 预设是可选项。",
  "Choose the runtime per Session":
    "每个 Session 单独选择 runtime",
  "Run OpenAI Codex, Claude Agent SDK, OpenCode, or Pi. Each Session freezes its runtime, model, and protocol, and nothing falls back silently.":
    "可选 OpenAI Codex、Claude Agent SDK、OpenCode 或 Pi。每个 Session 会固定自己的 runtime、模型和协议，不会悄悄回退。",
  "A runtime and model protocol that don’t match are rejected before anything runs.":
    "runtime 与模型协议不匹配时，会在执行前被拒绝。",
  "Reply 1 minute or 7 days later":
    "1 分钟后或 7 天后回复，都能接着做",
  "Follow-ups continue the same Session, even after the sandbox was reclaimed. The working directory, conversation, and files return from the last checkpoint.":
    "后续消息会在同一个 Session 里继续，即使 sandbox 已被回收。工作目录、对话和文件都会从最近一次检查点恢复。",
  "If that checkpoint can’t be restored, the follow-up fails with an error. API Sessions have no inactivity deadline.":
    "检查点无法恢复时，后续消息会明确报错。API Session 不会因闲置而过期。",
  "A turn succeeds only when its results are saved":
    "结果保存好，turn 才算成功",
  "Completion means the events, usage, and a checkpoint were committed together. A failed or cancelled turn never overwrites the last good state.":
    "完成意味着事件、用量和检查点已经一起提交。失败或取消的 turn 不会覆盖上一次成功的状态。",
  "From the product spec: “Model or tool execution ending is not success.”":
    "产品规格原文：“Model or tool execution ending is not success.”（模型或工具执行结束，不等于成功。）",
  "Keys stay outside the sandbox":
    "密钥留在 sandbox 之外",
  "Provider keys and MCP credentials never enter the sandbox. The runtime reaches models and tools through mosoo’s proxies, which add the credential per request.":
    "模型供应商密钥和 MCP 凭据不会进入 sandbox。runtime 通过 mosoo 的代理访问模型和工具，代理在每次请求时注入凭据。",
  "The sandbox only gets expiring grants. Environment variables are different. Code in the sandbox can read them.":
    "sandbox 只拿到会过期的授权。环境变量则不同，sandbox 里的代码可以读取它们。",
  "Attach files, stream events, download results":
    "附件进，结果出，事件实时可见",
  "Attachments mount read-only. Anything the Agent writes under `outputs/` becomes a downloadable artifact. Watch progress over SSE or read the saved history.":
    "附件以只读方式挂载。Agent 写到 `outputs/` 下的文件会成为可下载的产出物。进度可以通过 SSE 实时查看，也可以读取已保存的历史。",
  "Events are saved before they’re sent, and stable IDs let a client reconnect without duplicates. There are no Webhooks.":
    "事件先保存再推送，稳定的 ID 让客户端重连时不会收到重复事件。mosoo 不提供 Webhook。",
  "From one request to a finished report":
    "从一个请求到一份完成的报告",
  "Say your backend needs a research report. It calls mosoo over HTTPS with a Project API key, and the report comes back as a file.":
    "假设你的后端需要一份调研报告。它用 Project API 密钥通过 HTTPS 调用 mosoo，报告最后以文件的形式返回。",
  "Add your model key.":
    "添加模型密钥。",
  "Add a provider key to your Project, then create a Project API key. It starts with `msp_` and is shown once.":
    "在项目里添加模型供应商密钥，再创建 Project API 密钥。它以 `msp_` 开头，只显示一次。",
  "your provider key":
    "你的模型供应商密钥",
  "a Project API key":
    "Project API 密钥",
  "Start a Session.":
    "启动 Session。",
  "Send one request with the harness, provider, model, instructions, input, and any files. Save the `thread.id` you get back.":
    "发送一个请求，带上 harness、模型供应商、模型、指令、输入和可选文件。保存返回的 `thread.id`。",
  "one request":
    "一个请求",
  "a `thread.id`":
    "`thread.id`",
  "mosoo runs the turn.":
    "mosoo 执行这个 turn。",
  "The harness writes code and runs tools in the Session’s own sandbox. Your keys stay outside it.":
    "harness 在该 Session 自己的 sandbox 里写代码、运行工具。你的密钥始终在 sandbox 之外。",
  "the turn":
    "这个 turn",
  "events, artifacts, usage, and a checkpoint":
    "事件、产出物、用量和检查点",
  "Follow, download, continue.":
    "跟进、下载、继续。",
  "Stream events over SSE, download files from `outputs/`, and read the usage of every model call. Reply to the same Thread whenever you’re ready.":
    "通过 SSE 接收事件，下载 `outputs/` 里的文件，查看每次模型调用的用量。准备好后，再向同一个 Thread 发送后续消息。",
  "a follow-up, now or days later":
    "后续消息，现在或几天后都可以",
  "the next turn in the same Session":
    "同一个 Session 里的下一个 turn",
  "In":
    "输入",
  "Out":
    "输出",
  "Start a Session":
    "启动 Session",
  "Copy request":
    "复制请求",
  "Request copied":
    "请求已复制",
  "Open the v2 API reference":
    "查看 v2 API 参考",
  "Model IDs change often. Check the models available in your Project before you copy this.":
    "模型 ID 经常变化，复制前请先确认你的项目里有哪些可用模型。",
  "Copy failed.":
    "复制失败。",
  "Your app keeps its users. mosoo runs the Agent.":
    "你的应用管用户，mosoo 运行 Agent。",
  "This split comes straight from the product spec.":
    "这个分工直接来自产品规格。",
  "Your app keeps":
    "你的应用负责",
  "mosoo runs":
    "mosoo 负责",
  "Business logic":
    "业务逻辑",
  "What the task is for and what happens to the result":
    "任务为什么做，结果怎么用",
  "End-user authentication":
    "终端用户认证",
  "mosoo never signs your users in":
    "mosoo 不替你的用户登录",
  "Business queues":
    "业务队列",
  "When work starts and in what order":
    "什么时候开始、按什么顺序",
  "Result validation":
    "结果校验",
  "You decide whether the report is right":
    "报告对不对，由你判断",
  "Business storage":
    "业务存储",
  "Keep the `thread.id` and whatever you extract":
    "保存 `thread.id` 和你提取的结果",
  "UI":
    "界面",
  "Your product, your screens":
    "你的产品，你的页面",
  "Agent execution":
    "Agent 执行",
  "The harness runs each turn: model calls, code, tools":
    "harness 运行每个 turn：模型调用、代码、工具",
  "Sandboxing":
    "sandbox 隔离",
  "One sandbox per Session, never shared":
    "每个 Session 一个 sandbox，从不共享",
  "Durable continuation":
    "持久续接",
  "Follow-ups restore the last checkpoint":
    "后续消息从最近一次检查点恢复",
  "Input files and artifacts":
    "输入文件与产出物",
  "Attachments in, `outputs/` out":
    "附件进，`outputs/` 出",
  "Events":
    "事件",
  "Saved first, then streamed over SSE":
    "先保存，再通过 SSE 推送",
  "Usage measurement":
    "用量计量",
  "One record per model call":
    "每次模型调用一条记录",
  "Runtime cleanup":
    "运行时清理",
  "Idle sandboxes are reclaimed; the Session’s state stays":
    "闲置的 sandbox 会被回收，Session 的状态保留",
  "mosoo doesn’t authenticate your end users. If your MCP servers need to know who asked, label the Thread with your own `userId`.":
    "mosoo 不认证你的终端用户。如果你的 MCP 服务器需要知道是谁发起的请求，可以给 Thread 标上你自己的 `userId`。",
  "What you can check for yourself":
    "你可以亲自核实的内容",
  "mosoo is in Alpha. What you can check today is the code, the releases, production status, and two projects built on it.":
    "mosoo 目前处于 Alpha 阶段。今天能核实的，是代码、版本发布、生产状态，以及两个基于它构建的项目。",
  "Source":
    "源码",
  "Releases":
    "版本发布",
  "Production status":
    "生产状态",
  "Postmortems":
    "事故复盘",
  "The runtime, console, and API are Apache 2.0 on GitHub. The stack: Cloudflare Workers, Durable Objects, D1, R2, and Containers.":
    "runtime、控制台和 API 以 Apache 2.0 许可证开源在 GitHub 上。技术栈：Cloudflare Workers、Durable Objects、D1、R2 和 Containers。",
  "Latest: v0.7.0 (Alpha), October 9, 2026. v0.5.0 added Pi as the fourth runtime. v0.4.0 made Sessions startable without an Agent.":
    "最新版本：v0.7.0（Alpha），2026 年 10 月 9 日。v0.5.0 加入了第 4 个 runtime：Pi。从 v0.4.0 起，无需 Agent 即可启动 Session。",
  "mosoo.ai/health is built from production Worker outcomes and real Run completions. A runtime without production samples shows Unknown.":
    "mosoo.ai/health 根据生产环境 Worker 的调用结果和真实的 Run 完成情况生成。没有生产样本的 runtime 显示为“未知”。",
  "6 incident postmortems from July to September 2026 are in the repo. Newer incidents are tracked as GitHub issues.":
    "仓库里有 6 篇事故复盘，时间从 2026 年 7 月到 9 月。之后的事故改在 GitHub issue 中跟踪。",
  "View source":
    "查看源码",
  "View all releases":
    "查看全部版本",
  "Open the status page":
    "打开状态页",
  "Read the postmortems":
    "阅读事故复盘",
  "Latest":
    "最新版本",
  "Smaller codebase. The public Thread API v1 and v2 did not change.":
    "代码库瘦身，公开 Thread API v1 和 v2 没有变化。",
  "Custom providers declare a model protocol, and mismatched runtime and model pairs are rejected before a run.":
    "自定义模型供应商需声明模型协议，runtime 与模型不匹配的组合会在运行前被拒绝。",
  "Pi joins as the fourth runtime.":
    "Pi 成为第 4 个 runtime。",
  "Sessions start straight from a Project, with no Agent required.":
    "可直接从项目启动 Session，无需 Agent。",
  "Built by the mosoo team.":
    "由 mosoo 团队构建。",
  "An uploaded avatar comes back as a validated ZIP with all 9 Codex pet animation states. The backend calls mosoo through the Thread API, and the token never reaches the browser.":
    "上传一张头像，返回一个通过校验的 ZIP，包含 Codex 宠物全部 9 种动画状态。后端通过 Thread API 调用 mosoo，令牌从不进入浏览器。",
  "Built by AsperforMias.":
    "由 AsperforMias 构建。",
  "For each public GitHub repository, ghfind’s Go worker starts a Thread and turns the 3 artifacts the Agent saves (analysis JSON, evidence JSON, and a Markdown report) into its own result page.":
    "针对每个公开的 GitHub 仓库，ghfind 的 Go worker 会启动一个 Thread，并把 Agent 保存的 3 个产出物（分析 JSON、证据 JSON 和一份 Markdown 报告）渲染成自己的结果页。",
  "Read the Codex Pet use case":
    "查看 Codex Pet 用例",
  "Read the ghfind use case":
    "查看 ghfind 用例",
  "Open ghfind":
    "打开 ghfind",
  "See all use cases":
    "查看全部用例",
  "The Codex Pet app turning one uploaded avatar into 9 animation states.":
    "Codex Pet 应用把一张上传的头像变成 9 种动画状态。",
  "The ghfind Projects page, where a mosoo Agent evaluates public GitHub repositories.":
    "ghfind 的 Projects 页面，mosoo Agent 在这里评估公开的 GitHub 仓库。",
  "What mosoo doesn’t do":
    "mosoo 不做的事",
  "The product spec lists these on purpose. Plan around them before you build.":
    "这些是产品规格里明确写下的取舍。开始构建前，先把它们考虑进去。",
  "Not included":
    "不包含",
  "Do this instead":
    "可以这样做",
  "Webhooks":
    "Webhook",
  "Stream events over SSE, or read the saved history.":
    "通过 SSE 接收事件，或读取已保存的历史。",
  "Interactive tool approvals":
    "交互式工具审批",
  "Agents run with full access inside the Session’s own sandbox.":
    "Agent 在该 Session 自己的 sandbox 内以完全权限运行。",
  "Models, credits, billing, or a spending cap":
    "模型、充值、计费或花费上限",
  "Use your own provider key. The provider bills you, and the usage API lists every model call.":
    "使用你自己的模型供应商密钥。费用由供应商直接收取，用量 API 会列出每次模型调用。",
  "Git mounting, private repository access, or branch and PR workflows":
    "Git 挂载、私有仓库授权，以及分支和 PR 工作流",
  "Pass a public URL with an exact commit, or upload the files.":
    "传入公开 URL 和确切的 commit，或直接上传文件。",
  "Your own runtimes, a connector marketplace, or local MCP servers":
    "自带 runtime、连接器市场或本地 MCP 服务器",
  "Pick one of the 4 runtimes and connect remote HTTPS MCP servers.":
    "从 4 个 runtime 中选一个，并接入远程 HTTPS MCP 服务器。",
  "An online file editor or file manager":
    "在线文件编辑器或文件管理器",
  "Upload inputs and download artifacts through the API.":
    "通过 API 上传输入文件、下载产出物。",
  "Chat channels or a personal cloud computer":
    "聊天渠道或个人云端计算机",
  "That’s Mosoo Computer, a separate product.":
    "这属于另一款产品 Mosoo Computer。",
  "Questions to ask before you build on mosoo":
    "开始构建前值得问的问题",
  "Start your first Session":
    "启动你的第一个 Session",
  "In the console":
    "在控制台中",
  "Sign in with email or Google. Your first sign-in creates a Default Project. Add a provider key, then start a Session.":
    "用邮箱或 Google 登录。首次登录会自动创建默认项目。添加模型供应商密钥后，就可以启动 Session。",
  "Try mosoo":
    "试用 mosoo",
  "In your coding agent":
    "在编码智能体中",
  "Paste the setup prompt into Codex, Claude Code, OpenCode, Cursor, or Cline. It installs the CLI, then asks you to add a provider key in the console, the one step it can’t do for you.":
    "把设置提示粘贴到 Codex、Claude Code、OpenCode、Cursor 或 Cline。它会安装 CLI，然后请你在控制台添加模型供应商密钥，这是它唯一无法替你完成的一步。",
  "Copy setup prompt":
    "复制设置提示",
  "Setup prompt copied":
    "设置提示已复制",
  "Copy failed. Select and copy the prompt above.":
    "复制失败。请手动选择并复制上方提示。",
  "Copy command":
    "复制命令",
  "Command copied":
    "命令已复制",
  "Read the install script":
    "查看安装脚本",
  "mosoo is in Alpha. Public APIs may still change.":
    "mosoo 目前处于 Alpha 阶段，公开 API 仍可能变化。",
  "What is mosoo?":
    "mosoo 是什么？",
  "mosoo is an open-source, API-first managed Agent runtime for application backends. It runs OpenAI Codex, Claude Agent SDK, OpenCode, and Pi behind one API, and each Session runs in its own sandbox. Your backend starts the work and reads the results. mosoo handles execution, files, events, and usage. mosoo is in Alpha.":
    "mosoo 是开源、API 优先的托管 Agent runtime，面向应用后端。它用一个 API 运行 OpenAI Codex、Claude Agent SDK、OpenCode 和 Pi，每个 Session 都在自己的 sandbox 中执行。你的后端发起任务、读取结果，执行、文件、事件和用量由 mosoo 负责。mosoo 目前处于 Alpha 阶段。",
  "Do I need to create or publish an Agent first?":
    "需要先创建或发布 Agent 吗？",
  "No. On /api/v2, one request carries the harness, provider, model, instructions, and input, and mosoo starts a durable Session without creating an Agent. Saved Agent presets are optional. You need one to attach Skills, MCP servers, or a non-default Environment.":
    "不需要。在 /api/v2 上，一个请求就能带上 harness、模型供应商、模型、指令和输入，mosoo 会直接启动持久 Session，不会创建 Agent。保存的 Agent 预设是可选的，挂载技能、MCP 服务器或使用非默认环境时才需要它。",
  "Which runtimes and models can I use?":
    "可以用哪些 runtime 和模型？",
  "There are 4 runtimes: OpenAI Codex, Claude Agent SDK, OpenCode, and Pi. Models run on your own keys for Anthropic, OpenAI, DeepSeek, Gemini, Qwen, Kimi, Zhipu, MiniMax, or OpenCode Zen, or on a custom OpenAI-compatible HTTPS endpoint. Each runtime accepts specific model protocols, and mosoo rejects a mismatched pair before anything runs.":
    "共有 4 个 runtime：OpenAI Codex、Claude Agent SDK、OpenCode 和 Pi。模型使用你自己的密钥，可选 Anthropic、OpenAI、DeepSeek、Gemini、Qwen、Kimi、Zhipu、MiniMax 和 OpenCode Zen，也可以接入自定义的 OpenAI 兼容 HTTPS 端点。每个 runtime 只接受特定的模型协议，不匹配的组合会在执行前被拒绝。",
  "Who pays for model usage?":
    "模型费用由谁支付？",
  "You do, directly. Model keys belong to your Project, and the provider bills your account. mosoo supplies no models and sets no spending cap. The usage API and the Usage page show measured tokens and cost estimates. They are not invoices.":
    "由你直接支付。模型密钥属于你的项目，由模型供应商向你的账户计费。mosoo 不提供模型，也不设花费上限。用量 API 和用量页面显示实测的 token 数和估算成本，它们不是账单。",
  "What happens when I reply hours or days later?":
    "隔几小时或几天再回复，会怎样？",
  "The reply continues the same Session. A follow-up 1 minute or 7 days after a completed turn has the same semantics, even after the sandbox was reclaimed, though a cold start can take longer. mosoo restores the working directory, the harness’s native conversation, the frozen configuration, and recorded artifacts from the last committed checkpoint. Live processes are not carried over. If the checkpoint can’t be restored, the follow-up fails with an error instead of starting empty.":
    "回复会在同一个 Session 里继续。在一个 turn 完成 1 分钟后还是 7 天后回复，语义完全相同，即使 sandbox 已被回收也是如此，只是冷启动可能更慢。mosoo 会从最近一次提交的检查点恢复工作目录、harness 的原生对话、冻结的配置和已记录的产出物。运行中的进程不会保留。检查点无法恢复时，后续消息会明确报错，不会从空白状态开始。",
  "Do my API keys enter the sandbox?":
    "我的 API 密钥会进入 sandbox 吗？",
  "No. Provider keys and MCP credentials stay outside the sandbox. The runtime reaches models and MCP servers through mosoo’s proxies, which add the credential on each request. Environment variables are different. Code in the sandbox can read them, so keep model keys in Providers and tool tokens in MCP connections.":
    "不会。模型供应商密钥和 MCP 凭据留在 sandbox 之外，runtime 通过 mosoo 的代理访问模型和 MCP 服务器，代理在每次请求时注入凭据。环境变量则不同，sandbox 里的代码可以读取它们，所以模型密钥请放在模型供应商设置里，工具令牌请放在 MCP 连接里。",
  "How do I follow progress and get results?":
    "怎样跟踪进度、拿到结果？",
  "Read the Thread’s status and saved event history, or open an SSE stream that starts with the latest saved events. Stable event IDs let a reconnecting client skip what it already has. Files the Agent writes under outputs/ become downloadable artifacts. There are no Webhooks.":
    "读取 Thread 的状态和已保存的事件历史，或者打开 SSE 流，它会先发送最新的已保存事件。稳定的事件 ID 让重连的客户端可以跳过已经收到的事件。Agent 写到 outputs/ 下的文件会成为可下载的产出物。mosoo 不提供 Webhook。",
  "How long can a turn run?":
    "一个 turn 最长能运行多久？",
  "Up to 2 hours. A Session runs one turn at a time. Input sent to a busy Session is rejected, and there is no input queue. If a turn needs a new sandbox and no capacity is free, it fails at once: its Run ends with the retryable runtime.capacity_exhausted error, and mosoo does not queue it.":
    "最长 2 小时。一个 Session 同一时间只运行一个 turn。Session 忙碌时发来的输入会被拒绝，也没有输入队列。如果某个 turn 需要新的 sandbox 而没有空闲容量，它会立即失败：对应的 Run 以可重试的 runtime.capacity_exhausted 错误结束，mosoo 不会把它排队。",
  "Can I retry a request without running the work twice?":
    "重试请求会不会让任务执行两次？",
  "Yes, for creation and follow-ups. Send an Idempotency-Key header. For 24 hours, the same key and body return the original result without new work, and a changed body is rejected. Idempotency does not make side effects in external tools exactly-once.":
    "创建请求和后续消息都不会，前提是带上 Idempotency-Key 请求头。24 小时内，相同的 key 和请求体会返回原来的结果，不会产生新的执行；请求体变了则会被拒绝。幂等不保证外部工具的副作用只发生一次。",
  "Is mosoo open source, and is it ready for production?":
    "mosoo 开源吗？可以用于生产环境吗？",
  "mosoo is licensed under Apache 2.0, and the source is on GitHub. It is in Alpha, so public APIs and product behavior may still change. /api/v1 stays wire-compatible, and a change that can’t stay compatible ships as a new API version. The quickest way to try mosoo is the hosted console at cloud.mosoo.ai. The README explains how to run it locally for development.":
    "mosoo 以 Apache 2.0 许可证开源，源码在 GitHub 上。它目前处于 Alpha 阶段，公开 API 和产品行为仍可能变化。/api/v1 保持线上兼容，无法兼容的改动会作为新的 API 版本发布。最快的试用方式是托管控制台 cloud.mosoo.ai。README 也说明了如何在本地运行，方便开发。",
  "Anthropic models":
    "Anthropic 模型",
  "text input":
    "文本输入",
  "Accepted":
    "支持",
  "Not accepted":
    "不支持",
  "mosoo handles execution, files, events, and usage.":
    "执行、文件、事件和用量由 mosoo 负责。",
  "One request starts a Session. A follow-up continues it.":
    "一个请求启动 Session，后续消息让它接着做。",
  "Say your backend needs a report on a CSV file. It calls mosoo over HTTPS with a Project API key, and the report comes back as files under `outputs/`.":
    "假设你的后端需要一份 CSV 数据报告。它用 Project API 密钥通过 HTTPS 调用 mosoo，报告以 `outputs/` 下的文件返回。",
  "Change":
    "变化",
  "The key is stored with your Project, outside every sandbox.":
    "密钥保存在你的项目中，不进入任何 sandbox。",
  "mosoo creates a durable Session, a Thread in the API, and runs the first turn.":
    "mosoo 创建一个持久的 Session（API 中称为 Thread），并运行第一个 turn。",
  "Events, usage, and a checkpoint are committed together.":
    "事件、用量和检查点一起提交。",
  "mosoo restores the working directory and the conversation from the last checkpoint.":
    "mosoo 从最近一次检查点恢复工作目录和对话。",
  "The code, the releases, and the incident postmortems are public.":
    "代码、版本发布和事故复盘都是公开的。",
  "mosoo leaves these out on purpose.":
    "这些是 mosoo 有意不做的事。",
  "Start your first Session.":
    "启动你的第一个 Session。",
  "Reply in a minute or in seven days.":
    "1 分钟后或 7 天后回复都可以。",
  "From your backend to a Session sandbox":
    "从你的后端到 Session sandbox",
  "Your backend":
    "你的后端",
  "HTTPS and a Project API key":
    "HTTPS 和 Project API 密钥",
} as const;

type Message = keyof typeof ZH_MESSAGES;

const JA_MESSAGES = {
  "Pick a runtime. Use your own model key.":
    "runtime を選び、自分のモデルキーを使う",
  "4 runtimes, the providers below, or any OpenAI-compatible HTTPS endpoint. mosoo checks the runtime, model, and protocol before anything runs.":
    "4 つの runtime、以下のプロバイダー、そして OpenAI 互換の任意の HTTPS エンドポイントに対応します。mosoo は実行前に runtime、モデル、プロトコルの組み合わせを確認します。",
  "Runtimes":
    "runtime",
  "Model providers (your keys)":
    "モデルプロバイダー（ご自身のキー）",
  "Model protocols":
    "モデルプロトコル",
  "Name":
    "名前",
  "API id":
    "API id",
  "All 4":
    "4 種類すべて",
  "All 4 (text input)":
    "4 種類すべて（テキスト入力のみ）",
  "Anthropic Messages (Anthropic models)":
    "Anthropic Messages（Anthropic のモデル）",
  "Custom OpenAI-compatible endpoint":
    "OpenAI 互換のカスタムエンドポイント",
  "Provider keys belong to your Project, and the provider bills your account directly.":
    "プロバイダーキーはプロジェクトに属し、料金はプロバイダーからお客様のアカウントに直接請求されます。",
  "Names and logos identify compatible services and don’t imply a partnership or endorsement.":
    "名称とロゴは互換性のあるサービスを示すもので、提携や推奨を意味するものではありません。",
  "What mosoo runs for your backend":
    "mosoo がバックエンドの代わりに担うこと",
  "Each of these is a promise in the product spec. The spec is linked below.":
    "どれも製品仕様に書かれた約束です。仕様へのリンクは下にあります。",
  "Read the product spec":
    "製品仕様を読む",
  "Start a Session without creating an Agent":
    "Agent を作らずに Session を開始",
  "Put the harness, provider, model, and instructions in one request. mosoo starts a durable Session and creates no Agent.":
    "1 つのリクエストに harness、プロバイダー、モデル、指示を書くだけで、mosoo は永続的な Session を開始します。Agent は作成されません。",
  "`configuration.type: \"inline\"` on `POST /api/v2/projects/{projectId}/threads`. Saved presets are optional.":
    "`POST /api/v2/projects/{projectId}/threads` で `configuration.type: \"inline\"` を指定します。保存済みプリセットは任意です。",
  "Choose the runtime per Session":
    "runtime は Session ごとに選べる",
  "Run OpenAI Codex, Claude Agent SDK, OpenCode, or Pi. Each Session freezes its runtime, model, and protocol, and nothing falls back silently.":
    "OpenAI Codex、Claude Agent SDK、OpenCode、Pi から選べます。各 Session は runtime、モデル、プロトコルを固定し、黙って別のものに切り替わることはありません。",
  "A runtime and model protocol that don’t match are rejected before anything runs.":
    "runtime とモデルプロトコルが合わない組み合わせは、実行前に拒否されます。",
  "Reply 1 minute or 7 days later":
    "1 分後でも 7 日後でも続きから",
  "Follow-ups continue the same Session, even after the sandbox was reclaimed. The working directory, conversation, and files return from the last checkpoint.":
    "フォローアップは、sandbox が回収された後でも同じ Session で続きます。作業ディレクトリ、会話、ファイルは最後のチェックポイントから戻ります。",
  "If that checkpoint can’t be restored, the follow-up fails with an error. API Sessions have no inactivity deadline.":
    "チェックポイントを復元できない場合はエラーになります。API の Session は放置しても期限切れになりません。",
  "A turn succeeds only when its results are saved":
    "結果が保存されて初めて turn は成功",
  "Completion means the events, usage, and a checkpoint were committed together. A failed or cancelled turn never overwrites the last good state.":
    "完了とは、イベント、使用量、チェックポイントがまとめてコミットされたことを意味します。失敗やキャンセルした turn が、直前の正常な状態を上書きすることはありません。",
  "From the product spec: “Model or tool execution ending is not success.”":
    "製品仕様の原文：“Model or tool execution ending is not success.”（モデルやツールの実行が終わっただけでは成功ではない）",
  "Keys stay outside the sandbox":
    "キーは sandbox の外に",
  "Provider keys and MCP credentials never enter the sandbox. The runtime reaches models and tools through mosoo’s proxies, which add the credential per request.":
    "プロバイダーキーと MCP の認証情報は sandbox に入りません。runtime は mosoo のプロキシ経由でモデルやツールにアクセスし、認証情報はプロキシがリクエストごとに付与します。",
  "The sandbox only gets expiring grants. Environment variables are different. Code in the sandbox can read them.":
    "sandbox が受け取るのは期限付きの権限だけです。環境変数は例外で、sandbox 内のコードから読み取れます。",
  "Attach files, stream events, download results":
    "ファイルを渡し、イベントを追い、結果を受け取る",
  "Attachments mount read-only. Anything the Agent writes under `outputs/` becomes a downloadable artifact. Watch progress over SSE or read the saved history.":
    "添付ファイルは読み取り専用でマウントされます。Agent が `outputs/` に書き込んだものは、ダウンロードできる成果物になります。進捗は SSE でも保存済みの履歴でも確認できます。",
  "Events are saved before they’re sent, and stable IDs let a client reconnect without duplicates. There are no Webhooks.":
    "イベントは保存してから送信され、安定した ID によって再接続しても重複しません。Webhook はありません。",
  "From one request to a finished report":
    "1 つのリクエストから、完成したレポートまで",
  "Say your backend needs a research report. It calls mosoo over HTTPS with a Project API key, and the report comes back as a file.":
    "たとえば、バックエンドで調査レポートが必要だとします。バックエンドは Project API キーを使って HTTPS で mosoo を呼び出し、レポートはファイルとして返ってきます。",
  "Add your model key.":
    "モデルのキーを追加する。",
  "Add a provider key to your Project, then create a Project API key. It starts with `msp_` and is shown once.":
    "プロジェクトにプロバイダーキーを追加し、Project API キーを作成します。キーは `msp_` で始まり、表示されるのは一度だけです。",
  "your provider key":
    "プロバイダーキー",
  "a Project API key":
    "Project API キー",
  "Start a Session.":
    "Session を開始する。",
  "Send one request with the harness, provider, model, instructions, input, and any files. Save the `thread.id` you get back.":
    "harness、プロバイダー、モデル、指示、入力、必要なファイルを 1 つのリクエストで送ります。返ってきた `thread.id` を保存してください。",
  "one request":
    "1 つのリクエスト",
  "a `thread.id`":
    "`thread.id`",
  "mosoo runs the turn.":
    "mosoo が turn を実行する。",
  "The harness writes code and runs tools in the Session’s own sandbox. Your keys stay outside it.":
    "harness がその Session 専用の sandbox でコードを書き、ツールを実行します。キーは sandbox の外に置かれたままです。",
  "the turn":
    "turn",
  "events, artifacts, usage, and a checkpoint":
    "イベント、成果物、使用量、チェックポイント",
  "Follow, download, continue.":
    "追跡し、ダウンロードし、続ける。",
  "Stream events over SSE, download files from `outputs/`, and read the usage of every model call. Reply to the same Thread whenever you’re ready.":
    "SSE でイベントを受け取り、`outputs/` のファイルをダウンロードし、モデル呼び出しごとの使用量を確認します。準備ができたら、同じ Thread にフォローアップを送ります。",
  "a follow-up, now or days later":
    "今すぐ、または数日後のフォローアップ",
  "the next turn in the same Session":
    "同じ Session での次の turn",
  "In":
    "入力",
  "Out":
    "出力",
  "Start a Session":
    "Session を開始",
  "Copy request":
    "リクエストをコピー",
  "Request copied":
    "リクエストをコピーしました",
  "Open the v2 API reference":
    "v2 API リファレンスを開く",
  "Model IDs change often. Check the models available in your Project before you copy this.":
    "モデル ID はよく変わります。コピーする前に、プロジェクトで使えるモデルを確認してください。",
  "Copy failed.":
    "コピーに失敗しました。",
  "Your app keeps its users. mosoo runs the Agent.":
    "ユーザーはアプリが持ち、Agent は mosoo が動かす",
  "This split comes straight from the product spec.":
    "この役割分担は、製品仕様そのままです。",
  "Your app keeps":
    "アプリが担うこと",
  "mosoo runs":
    "mosoo が担うこと",
  "Business logic":
    "ビジネスロジック",
  "What the task is for and what happens to the result":
    "タスクの目的と、結果の使い道",
  "End-user authentication":
    "エンドユーザー認証",
  "mosoo never signs your users in":
    "mosoo がユーザーをログインさせることはありません",
  "Business queues":
    "業務キュー",
  "When work starts and in what order":
    "いつ、どの順で始めるか",
  "Result validation":
    "結果の検証",
  "You decide whether the report is right":
    "レポートが正しいかを判断する",
  "Business storage":
    "業務データの保存",
  "Keep the `thread.id` and whatever you extract":
    "`thread.id` と抽出した結果を保存する",
  "UI":
    "UI",
  "Your product, your screens":
    "あなたのプロダクトの画面",
  "Agent execution":
    "Agent の実行",
  "The harness runs each turn: model calls, code, tools":
    "harness が turn ごとにモデル呼び出し、コード、ツールを実行",
  "Sandboxing":
    "sandbox による分離",
  "One sandbox per Session, never shared":
    "Session ごとに 1 つ、共有しない",
  "Durable continuation":
    "永続的な継続",
  "Follow-ups restore the last checkpoint":
    "フォローアップは最後のチェックポイントから復元",
  "Input files and artifacts":
    "入力ファイルと成果物",
  "Attachments in, `outputs/` out":
    "添付ファイルを受け取り、`outputs/` を返す",
  "Events":
    "イベント",
  "Saved first, then streamed over SSE":
    "保存してから SSE で配信",
  "Usage measurement":
    "使用量の計測",
  "One record per model call":
    "モデル呼び出しごとに 1 件",
  "Runtime cleanup":
    "runtime の後片付け",
  "Idle sandboxes are reclaimed; the Session’s state stays":
    "アイドルの sandbox は回収し、Session の状態は残す",
  "mosoo doesn’t authenticate your end users. If your MCP servers need to know who asked, label the Thread with your own `userId`.":
    "mosoo はエンドユーザーを認証しません。MCP サーバーが依頼者を知る必要がある場合は、Thread に独自の `userId` を付けてください。",
  "What you can check for yourself":
    "自分で確かめられること",
  "mosoo is in Alpha. What you can check today is the code, the releases, production status, and two projects built on it.":
    "mosoo は現在 Alpha 版です。今確かめられるのは、コード、リリース、本番環境のステータス、そして mosoo で作られた 2 つのプロジェクトです。",
  "Source":
    "ソースコード",
  "Releases":
    "リリース",
  "Production status":
    "本番環境のステータス",
  "Postmortems":
    "事後分析",
  "The runtime, console, and API are Apache 2.0 on GitHub. The stack: Cloudflare Workers, Durable Objects, D1, R2, and Containers.":
    "runtime、コンソール、API は Apache 2.0 ライセンスで GitHub に公開されています。技術スタックは Cloudflare Workers、Durable Objects、D1、R2、Containers です。",
  "Latest: v0.7.0 (Alpha), October 9, 2026. v0.5.0 added Pi as the fourth runtime. v0.4.0 made Sessions startable without an Agent.":
    "最新は v0.7.0（Alpha）、2026 年 10 月 9 日。v0.5.0 で 4 つ目の runtime として Pi が加わりました。v0.4.0 からは Agent なしで Session を開始できます。",
  "mosoo.ai/health is built from production Worker outcomes and real Run completions. A runtime without production samples shows Unknown.":
    "mosoo.ai/health は、本番環境の Worker の呼び出し結果と、実際の Run の完了状況から作られています。本番環境のサンプルがない runtime は「不明」と表示されます。",
  "6 incident postmortems from July to September 2026 are in the repo. Newer incidents are tracked as GitHub issues.":
    "2026 年 7 月から 9 月までの 6 件のインシデント事後分析がリポジトリにあります。それ以降のインシデントは GitHub issue で管理しています。",
  "View source":
    "ソースコードを見る",
  "View all releases":
    "すべてのリリースを見る",
  "Open the status page":
    "ステータスページを開く",
  "Read the postmortems":
    "事後分析を読む",
  "Latest":
    "最新",
  "Smaller codebase. The public Thread API v1 and v2 did not change.":
    "コードベースを整理。公開 Thread API の v1 と v2 は変わっていません。",
  "Custom providers declare a model protocol, and mismatched runtime and model pairs are rejected before a run.":
    "カスタムプロバイダーはモデルプロトコルを宣言し、合わない runtime とモデルの組み合わせは実行前に拒否されます。",
  "Pi joins as the fourth runtime.":
    "4 つ目の runtime として Pi が加わりました。",
  "Sessions start straight from a Project, with no Agent required.":
    "プロジェクトから直接 Session を開始でき、Agent は不要になりました。",
  "Built by the mosoo team.":
    "mosoo チームが作成。",
  "An uploaded avatar comes back as a validated ZIP with all 9 Codex pet animation states. The backend calls mosoo through the Thread API, and the token never reaches the browser.":
    "アップロードしたアバター 1 枚から、Codex ペットの 9 つのアニメーション状態をすべて含む検証済みの ZIP が返ってきます。バックエンドは Thread API で mosoo を呼び出し、トークンがブラウザに渡ることはありません。",
  "Built by AsperforMias.":
    "AsperforMias が作成。",
  "For each public GitHub repository, ghfind’s Go worker starts a Thread and turns the 3 artifacts the Agent saves (analysis JSON, evidence JSON, and a Markdown report) into its own result page.":
    "公開されている GitHub リポジトリごとに ghfind の Go ワーカーが Thread を開始し、Agent が保存した 3 つの成果物（分析 JSON、エビデンス JSON、Markdown レポート）を自前の結果ページに表示します。",
  "Read the Codex Pet use case":
    "Codex Pet のユースケースを読む",
  "Read the ghfind use case":
    "ghfind のユースケースを読む",
  "Open ghfind":
    "ghfind を開く",
  "See all use cases":
    "すべてのユースケースを見る",
  "The Codex Pet app turning one uploaded avatar into 9 animation states.":
    "アップロードしたアバター 1 枚を 9 つのアニメーション状態に変える Codex Pet アプリ。",
  "The ghfind Projects page, where a mosoo Agent evaluates public GitHub repositories.":
    "mosoo の Agent が公開 GitHub リポジトリを評価する、ghfind の Projects ページ。",
  "What mosoo doesn’t do":
    "mosoo がやらないこと",
  "The product spec lists these on purpose. Plan around them before you build.":
    "以下は製品仕様に明記された判断です。作り始める前に、前提として織り込んでください。",
  "Not included":
    "含まれないもの",
  "Do this instead":
    "代わりの方法",
  "Webhooks":
    "Webhook",
  "Stream events over SSE, or read the saved history.":
    "SSE でイベントを受け取るか、保存済みの履歴を読み取ってください。",
  "Interactive tool approvals":
    "ツール実行の対話的な承認",
  "Agents run with full access inside the Session’s own sandbox.":
    "Agent は Session 専用の sandbox 内で、フルアクセス権限で動作します。",
  "Models, credits, billing, or a spending cap":
    "モデルの提供、チャージ、課金、支出上限",
  "Use your own provider key. The provider bills you, and the usage API lists every model call.":
    "ご自身のプロバイダーキーを使います。料金はプロバイダーから直接請求され、使用量 API でモデル呼び出しごとに確認できます。",
  "Git mounting, private repository access, or branch and PR workflows":
    "Git のマウント、プライベートリポジトリの認可、ブランチや PR のワークフロー",
  "Pass a public URL with an exact commit, or upload the files.":
    "公開 URL と正確なコミットを渡すか、ファイルをアップロードしてください。",
  "Your own runtimes, a connector marketplace, or local MCP servers":
    "独自 runtime の持ち込み、コネクタのマーケットプレイス、ローカル MCP サーバー",
  "Pick one of the 4 runtimes and connect remote HTTPS MCP servers.":
    "4 つの runtime から選び、リモートの HTTPS MCP サーバーを接続してください。",
  "An online file editor or file manager":
    "オンラインのファイルエディターやファイルマネージャー",
  "Upload inputs and download artifacts through the API.":
    "API で入力ファイルをアップロードし、成果物をダウンロードしてください。",
  "Chat channels or a personal cloud computer":
    "チャットチャネルや個人用のクラウドコンピューター",
  "That’s Mosoo Computer, a separate product.":
    "それは別のプロダクト、Mosoo Computer の領域です。",
  "Questions to ask before you build on mosoo":
    "使い始める前に確認したいこと",
  "Start your first Session":
    "最初の Session を始める",
  "In the console":
    "コンソールで",
  "Sign in with email or Google. Your first sign-in creates a Default Project. Add a provider key, then start a Session.":
    "メールアドレスまたは Google でログインします。初回ログイン時にデフォルトプロジェクトが作成されます。プロバイダーキーを追加したら、Session を開始できます。",
  "Try mosoo":
    "mosoo を試す",
  "In your coding agent":
    "コーディングエージェントで",
  "Paste the setup prompt into Codex, Claude Code, OpenCode, Cursor, or Cline. It installs the CLI, then asks you to add a provider key in the console, the one step it can’t do for you.":
    "セットアッププロンプトを Codex、Claude Code、OpenCode、Cursor、Cline のいずれかに貼り付けます。CLI をインストールしたあと、コンソールでプロバイダーキーを追加するよう求めます。エージェントが代わりにできない唯一の手順です。",
  "Copy setup prompt":
    "セットアッププロンプトをコピー",
  "Setup prompt copied":
    "セットアッププロンプトをコピーしました",
  "Copy failed. Select and copy the prompt above.":
    "コピーに失敗しました。上記のプロンプトを選択してコピーしてください。",
  "Copy command":
    "コマンドをコピー",
  "Command copied":
    "コマンドをコピーしました",
  "Read the install script":
    "インストールスクリプトを確認する",
  "mosoo is in Alpha. Public APIs may still change.":
    "mosoo は現在 Alpha 版です。公開 API は変更される可能性があります。",
  "What is mosoo?":
    "mosoo とは何ですか？",
  "mosoo is an open-source, API-first managed Agent runtime for application backends. It runs OpenAI Codex, Claude Agent SDK, OpenCode, and Pi behind one API, and each Session runs in its own sandbox. Your backend starts the work and reads the results. mosoo handles execution, files, events, and usage. mosoo is in Alpha.":
    "mosoo は、アプリケーションのバックエンドのための、オープンソースで API ファーストなマネージド Agent runtime です。OpenAI Codex、Claude Agent SDK、OpenCode、Pi を 1 つの API で実行し、Session ごとに専用の sandbox を使います。バックエンドはタスクを開始して結果を受け取り、実行、ファイル、イベント、使用量は mosoo が担います。mosoo は現在 Alpha 版です。",
  "Do I need to create or publish an Agent first?":
    "先に Agent を作成または公開する必要はありますか？",
  "No. On /api/v2, one request carries the harness, provider, model, instructions, and input, and mosoo starts a durable Session without creating an Agent. Saved Agent presets are optional. You need one to attach Skills, MCP servers, or a non-default Environment.":
    "いいえ。/api/v2 では、harness、プロバイダー、モデル、指示、入力を 1 つのリクエストに含めるだけで、mosoo は Agent を作成せずに永続的な Session を開始します。保存済みの Agent プリセットは任意で、スキルや MCP サーバーを使う場合、またはデフォルト以外の Environment を使う場合に必要です。",
  "Which runtimes and models can I use?":
    "どの runtime とモデルを使えますか？",
  "There are 4 runtimes: OpenAI Codex, Claude Agent SDK, OpenCode, and Pi. Models run on your own keys for Anthropic, OpenAI, DeepSeek, Gemini, Qwen, Kimi, Zhipu, MiniMax, or OpenCode Zen, or on a custom OpenAI-compatible HTTPS endpoint. Each runtime accepts specific model protocols, and mosoo rejects a mismatched pair before anything runs.":
    "runtime は OpenAI Codex、Claude Agent SDK、OpenCode、Pi の 4 つです。モデルはご自身のキーで利用し、Anthropic、OpenAI、DeepSeek、Gemini、Qwen、Kimi、Zhipu、MiniMax、OpenCode Zen のほか、OpenAI 互換のカスタム HTTPS エンドポイントも使えます。runtime ごとに対応するモデルプロトコルが決まっており、合わない組み合わせは実行前に拒否されます。",
  "Who pays for model usage?":
    "モデルの利用料金は誰が支払いますか？",
  "You do, directly. Model keys belong to your Project, and the provider bills your account. mosoo supplies no models and sets no spending cap. The usage API and the Usage page show measured tokens and cost estimates. They are not invoices.":
    "お客様が直接支払います。モデルのキーはプロジェクトに属し、プロバイダーがお客様のアカウントに請求します。mosoo はモデルを提供せず、支出上限も設けません。使用量 API と使用量ページには計測したトークン数と推定コストが表示されますが、請求書ではありません。",
  "What happens when I reply hours or days later?":
    "数時間後や数日後に返信するとどうなりますか？",
  "The reply continues the same Session. A follow-up 1 minute or 7 days after a completed turn has the same semantics, even after the sandbox was reclaimed, though a cold start can take longer. mosoo restores the working directory, the harness’s native conversation, the frozen configuration, and recorded artifacts from the last committed checkpoint. Live processes are not carried over. If the checkpoint can’t be restored, the follow-up fails with an error instead of starting empty.":
    "同じ Session で続きが実行されます。turn の完了から 1 分後でも 7 日後でも、sandbox が回収された後でも、返信の意味は変わりません。ただし、コールドスタートでは開始まで時間がかかることがあります。mosoo は最後にコミットされたチェックポイントから、作業ディレクトリ、harness のネイティブな会話、固定された設定、記録済みの成果物を復元します。実行中のプロセスは引き継がれません。チェックポイントを復元できない場合は、空の状態で始めずに明示的なエラーになります。",
  "Do my API keys enter the sandbox?":
    "API キーは sandbox に入りますか？",
  "No. Provider keys and MCP credentials stay outside the sandbox. The runtime reaches models and MCP servers through mosoo’s proxies, which add the credential on each request. Environment variables are different. Code in the sandbox can read them, so keep model keys in Providers and tool tokens in MCP connections.":
    "入りません。プロバイダーキーと MCP の認証情報は sandbox の外に置かれ、runtime は mosoo のプロキシ経由でモデルや MCP サーバーにアクセスします。認証情報はプロキシがリクエストごとに付与します。環境変数は例外で、sandbox 内のコードから読み取れます。モデルのキーはプロバイダー設定に、ツールのトークンは MCP 接続に保存してください。",
  "How do I follow progress and get results?":
    "進捗の確認と結果の取得はどうしますか？",
  "Read the Thread’s status and saved event history, or open an SSE stream that starts with the latest saved events. Stable event IDs let a reconnecting client skip what it already has. Files the Agent writes under outputs/ become downloadable artifacts. There are no Webhooks.":
    "Thread のステータスと保存済みのイベント履歴を読み取るか、SSE ストリームを開きます。SSE は最新の保存済みイベントから送信され、安定したイベント ID によって、再接続したクライアントは受信済みのイベントをスキップできます。Agent が outputs/ に書き込んだファイルは、ダウンロードできる成果物になります。Webhook はありません。",
  "How long can a turn run?":
    "1 つの turn はどのくらい実行できますか？",
  "Up to 2 hours. A Session runs one turn at a time. Input sent to a busy Session is rejected, and there is no input queue. If a turn needs a new sandbox and no capacity is free, it fails at once: its Run ends with the retryable runtime.capacity_exhausted error, and mosoo does not queue it.":
    "最長 2 時間です。1 つの Session で同時に実行できる turn は 1 つだけです。実行中の Session に送った入力は拒否され、入力キューはありません。turn に新しい sandbox が必要で空き容量がない場合、その turn はすぐに失敗し、Run は再試行可能な runtime.capacity_exhausted エラーで終わります。mosoo はその turn をキューに入れません。",
  "Can I retry a request without running the work twice?":
    "リクエストを再試行すると、処理が二重に実行されませんか？",
  "Yes, for creation and follow-ups. Send an Idempotency-Key header. For 24 hours, the same key and body return the original result without new work, and a changed body is rejected. Idempotency does not make side effects in external tools exactly-once.":
    "作成とフォローアップでは、Idempotency-Key ヘッダーを付ければ二重に実行されません。24 時間以内に同じキーと同じ本文を送ると、新しい処理を行わずに元の結果が返り、本文が異なる場合は拒否されます。ただし、外部ツールの副作用が 1 回だけになることまでは保証しません。",
  "Is mosoo open source, and is it ready for production?":
    "mosoo はオープンソースですか？本番環境で使えますか？",
  "mosoo is licensed under Apache 2.0, and the source is on GitHub. It is in Alpha, so public APIs and product behavior may still change. /api/v1 stays wire-compatible, and a change that can’t stay compatible ships as a new API version. The quickest way to try mosoo is the hosted console at cloud.mosoo.ai. The README explains how to run it locally for development.":
    "mosoo は Apache 2.0 ライセンスのオープンソースで、ソースコードは GitHub にあります。現在は Alpha 版のため、公開 API や製品の動作は変わる可能性があります。/api/v1 は互換性を維持し、互換性を保てない変更は新しい API バージョンとして公開されます。すぐに試すなら、ホスト版のコンソール cloud.mosoo.ai が最も手軽です。開発用にローカルで動かす手順は README にあります。",
  "Anthropic models":
    "Anthropic のモデル",
  "text input":
    "テキスト入力",
  "Accepted":
    "対応",
  "Not accepted":
    "非対応",
  "mosoo handles execution, files, events, and usage.":
    "実行、ファイル、イベント、使用量は mosoo が担います。",
  "One request starts a Session. A follow-up continues it.":
    "1 つのリクエストで Session が始まり、フォローアップで続きを実行します。",
  "Say your backend needs a report on a CSV file. It calls mosoo over HTTPS with a Project API key, and the report comes back as files under `outputs/`.":
    "たとえば、バックエンドで CSV ファイルのレポートが必要だとします。バックエンドは Project API キーを使って HTTPS で mosoo を呼び出し、レポートは `outputs/` 配下のファイルとして返ってきます。",
  "Change":
    "変化",
  "The key is stored with your Project, outside every sandbox.":
    "キーはプロジェクトに保存され、どの sandbox にも入りません。",
  "mosoo creates a durable Session, a Thread in the API, and runs the first turn.":
    "mosoo が永続的な Session（API では Thread）を作成し、最初の turn を実行します。",
  "Events, usage, and a checkpoint are committed together.":
    "イベント、使用量、チェックポイントがまとめてコミットされます。",
  "mosoo restores the working directory and the conversation from the last checkpoint.":
    "mosoo が最後のチェックポイントから作業ディレクトリと会話を復元します。",
  "The code, the releases, and the incident postmortems are public.":
    "コード、リリース、インシデントの事後分析は公開されています。",
  "mosoo leaves these out on purpose.":
    "mosoo はこれらを意図的に提供していません。",
  "Start your first Session.":
    "最初の Session を始めましょう。",
  "Reply in a minute or in seven days.":
    "返信は 1 分後でも 7 日後でもかまいません。",
  "From your backend to a Session sandbox":
    "バックエンドから Session の sandbox まで",
  "Your backend":
    "あなたのバックエンド",
  "HTTPS and a Project API key":
    "HTTPS と Project API キー",
} satisfies Record<Message, string>;

const MESSAGES = { zh: ZH_MESSAGES, ja: JA_MESSAGES };

export function t(message: Message): string {
  return locale === "en" ? message : MESSAGES[locale][message];
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
