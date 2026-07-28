import { locale } from "@/shared/locale";

const ZH_MESSAGES = {
  Pricing: "定价",
  Blog: "博客",
  "API docs": "API 文档",
  "mosoo on X": "mosoo 的 X 主页",
  "mosoo on GitHub": "mosoo 的 GitHub 主页",
  "Log in": "登录",
  "Star on GitHub": "在 GitHub 上加 Star",
  "Star mosoo on GitHub": "在 GitHub 上为 mosoo 加 Star",
  "# deploy an agent from the CLI": "# 从 CLI 部署一个 Agent",
  "1,284 docs": "1,284 篇文档",
  ok: "成功",
  Agents: "Agents",
  "Support copilot": "客服助手",
  "Contract reviewer": "合同审核员",
  "IT helpdesk": "IT 服务台",
  Live: "已上线",
  Draft: "草稿",
  "Deploy to Cloudflare": "部署到 Cloudflare",
  "provisions Workers · D1 · R2 · KV, no infra to wire up":
    "自动配置 Workers · D1 · R2 · KV，无需手动连接基础设施",
  CLI: "CLI",
  "Run it from the terminal": "从终端运行",
  "Script the whole lifecycle. mosoo agents deploy and it's live: version, publish, roll back from CI.":
    "用脚本覆盖完整生命周期。执行 mosoo agents deploy 即可上线：可在 CI 中完成版本管理、发布与回滚。",
  "Web UI": "Web UI",
  "Or click through the console": "也可在控制台中操作",
  "Manage agents, files, credentials, and cost from a console you can operate, no terminal required.":
    "在控制台中管理 Agents、文件、凭据与成本，无需终端。",
  "Self-host": "自托管",
  "Ship to your own Cloudflare": "部署到你自己的 Cloudflare",
  "Workers, D1, R2, and KV provision themselves on your account, so prompts and traffic never leave your edge and there is nothing to invoice or operate but your own.":
    "Workers、D1、R2 与 KV 会在你的账户中自动配置，因此 prompt 与流量不会离开你的 edge；你只需承担并运维自己的基础设施。",
  "Manage everything from the CLI or the console.": "通过 CLI 或控制台管理一切。",
  "Spin up, deploy, and run agents from the terminal or the web UI, and self-host the whole platform on your own Cloudflare in a single click.":
    "从终端或 Web UI 启动、部署并运行 Agents，还可一键将整个平台自行托管到你的 Cloudflare。",
  "Streaming + tool calls": "流式输出 + tool calls",
  "Native resume": "原生恢复",
  "MCP tools & permissions": "MCP tools 与权限",
  "Session replay": "session 重放",
  Available: "可用",
  "Resolves one Provider credential at launch": "启动时解析一组 Provider 凭据",
  "Normalized interface": "统一接口",
  "One Agent. Any runtime.": "一个 Agent，任意 runtime。",
  "A mosoo agent is harness-neutral. Configure it once, then run it on the Claude Agent SDK or any driver: the runtime is a swappable harness, not a rewrite. Same interface, same session model, every time.":
    "mosoo Agent 与 harness 解耦。只需配置一次，即可在 Claude Agent SDK 或任意 driver 上运行：runtime 是可替换的 harness，无需重写。每次都使用同一接口、同一 session 模型。",
  "Agent runtimes": "Agent runtimes",
  "Preview {runtime}": "预览 {runtime}",
  "Agent sandbox": "Agent sandbox",
  "claude-agent-sdk · ephemeral": "claude-agent-sdk · 临时",
  mounted: "已挂载",
  "▸ mounting sandbox 27fe1193af5a …": "▸ 正在挂载 sandbox 27fe1193af5a …",
  "✓ sandbox ready in 0.4s · /workspace mounted":
    "✓ sandbox 已就绪，用时 0.4s · /workspace 已挂载",
  "▸ pulling runtime · Claude Agent SDK": "▸ 正在拉取 runtime · Claude Agent SDK",
  "✓ runtime online · claude-opus-4.8 · streaming + tools":
    "✓ runtime 已上线 · claude-opus-4.8 · 流式输出 + tools",
  "▸ mounting session files · support-kb, runbooks (ro)":
    "▸ 正在挂载 session 文件 · support-kb、runbooks（只读）",
  "✓ 12 MCP tools · BYOK credentials resolved": "✓ 12 个 MCP tools · BYOK 凭据已解析",
  "▸ booting agent · memory + context restored":
    "▸ 正在启动 Agent · memory + context 已恢复",
  "✓ support-agent live · full cloud agent ready":
    "✓ support-agent 已上线 · 完整云端 Agent 已就绪",
  "agent · support-agent": "Agent · support-agent",
  "ephemeral sandbox": "临时 sandbox",
  "No always-on agent cloud.": "无需常驻的 Agent 云。",
  "mosoo mounts a fresh sandbox the instant an agent runs, then tears it down when the turn ends. No standing fleet to pay for or babysit: compute appears on demand, scoped to the session, and disappears.":
    "Agent 开始运行时，mosoo 会立即挂载一个全新的 sandbox，并在本轮结束后销毁。无需为常驻集群付费或值守：算力按需出现，仅作用于当前 session，用完即消失。",
  "Runs on Claude Code": "运行于 Claude Code",
  "Pixel-art bamboo reaching into a bright sky": "伸向明亮天空的像素风竹林",
  "Run exported Skill.md": "运行导出的 Skill.md",
  "Grounded support": "有依据的客服支持",
  "Legal redlines": "法务修订",
  "Internal IT": "内部 IT",
  "Reset my 2FA": "重置我的 2FA",
  Connected: "已连接",
  "Reuse as Skill.md": "复用为 Skill.md",
  "Export the App to one Skill.md, then reuse it as a /skill inside Claude Code or any compatible CLI: no context-switching, no glue code.":
    "将 App 导出为一个 Skill.md，再在 Claude Code 或任意兼容 CLI 中作为 /skill 复用：无需切换上下文，也无需胶水代码。",
  "Call it over the API": "通过 API 调用",
  "Every App-local Agent gets a typed HTTP endpoint. Wire it into your backend, a cron job, or another agent.":
    "每个 App 内 Agent 都会获得带类型的 HTTP endpoint。可接入你的 backend、cron job 或另一个 Agent。",
  "Live in your channels": "接入你的聊天 Channels",
  "Connect Slack, Lark, Discord, Telegram, or WeChat. Your users talk to the agent without leaving chat.":
    "连接 Slack、Lark、Discord、Telegram 或 WeChat。用户无需离开聊天即可与 Agent 对话。",
  "Build one App.": "构建一个 App。",
  "Invoke its agents anywhere.": "随处调用其中的 Agents。",
  "Export the App for Skill.md reuse, expose an App-local Agent through a typed API, or bind that Agent to the chat tools your users already live in: one App, every surface.":
    "将 App 导出以复用 Skill.md，通过带类型的 API 暴露 App 内 Agent，或把该 Agent 绑定到用户常用的聊天工具：一个 App，覆盖所有触点。",
  "Total spend": "总支出",
  Requests: "请求数",
  Tokens: "Tokens",
  "94% cache hit": "cache 命中率 94%",
  "Active apps": "活跃 App",
  "of 9": "共 9 个",
  Jan: "1月",
  Feb: "2月",
  Mar: "3月",
  Apr: "4月",
  May: "5月",
  Jun: "6月",
  Production: "生产",
  Debug: "调试",
  Preview: "预览",
  "Spend over time": "支出趋势",
  "Production vs debug · last 6 months": "生产 vs. 调试 · 近 6 个月",
  "Spend by model": "按模型查看支出",
  "Where the budget goes": "预算去向",
  "30 days": "30 天",
  "Know the unit cost of every run.": "掌握每次 Run 的单位成本。",
  "See exactly where spend goes: by app, by agent, by model. Roll cost up to an app or a run, compare against last period, and know the unit economics of every agent you ship.":
    "准确查看支出流向：按 App、Agent 或模型拆分。可汇总到 App 或 Run，与上期对比，掌握每个已发布 Agent 的单位经济性。",
  Breakdown: "明细",
  "Pivot the same spend by app, agent, or model": "按 App、Agent 或模型切换查看同一笔支出",
  "Export CSV": "导出 CSV",
  "By Agent": "按 Agent",
  "By App": "按 App",
  "By Model": "按模型",
  Agent: "Agent",
  Owner: "负责人",
  "Run mix": "Run 构成",
  "vs. prev": "较上期",
  Cost: "成本",
  App: "App",
  "Top agent": "主要 Agent",
  "External · API-triggered": "外部 · API 触发",
  Model: "模型",
  Vendor: "厂商",
  "Cache hit": "cache 命中率",
  "Sales researcher": "销售研究助手",
  "Onboarding bot": "入门引导机器人",
  "Support Console": "客服控制台",
  "Customer Ops": "客户运营",
  "Contract Desk": "合同工作台",
  "Legal Ops": "法务运营",
  "IT Intake": "IT 工单入口",
  "Internal Tools": "内部工具",
  "Sales Research": "销售研究",
  Revenue: "营收",
  "Onboarding Hub": "入门中心",
  "Frequently asked questions": "常见问题",
  "What developers ask before they build on mosoo.": "开发者在基于 mosoo 构建前常问的问题。",
  "What is mosoo?": "mosoo 是什么？",
  "mosoo is an open-source agent runtime and API for coding agents. It runs OpenAI Codex, Claude Agent SDK, and OpenCode in isolated sandboxes, keeps Threads and files across Runs, and is self-hostable in your own Cloudflare account. mosoo is currently alpha.":
    "mosoo 是面向 Coding Agent 的开源 Agent runtime 与 API。它在隔离 sandbox 中运行 OpenAI Codex、Claude Agent SDK 和 OpenCode，在 Runs 之间持久保存 Threads 与文件，并可自行托管到你的 Cloudflare 账户。mosoo 目前处于 alpha 阶段。",
  "Who is mosoo built for?": "mosoo 为谁而构建？",
  "Developers extending OpenAI Codex, Claude Agent SDK, or OpenCode into products and automations who don't want to operate a separate agent runtime, sandbox service, session store, file pipeline, and Agent API for every integration.":
    "面向把 OpenAI Codex、Claude Agent SDK 或 OpenCode 扩展到产品和自动化中的开发者；他们不想为每个集成都单独运维 Agent runtime、sandbox 服务、session 存储、文件管线和 Agent API。",
  "Why a backend instead of just running Claude Code or Codex locally?":
    "为什么需要 backend，而不只是本地运行 Claude Code 或 Codex？",
  "For a one-off problem, a local agent or a single Skill is the right, minimal tool — no need to abstract anything. The moment you have to build, evaluate, deploy, and run agents for other people, concurrently and for longer, the tooling fragments and you end up gluing point solutions across the whole lifecycle. mosoo is the backend that covers that lifecycle, so you build the product instead of the plumbing.":
    "解决一次性问题时，本地 Agent 或单个 Skill 就是正确且最小的工具，无需抽象。可一旦要为其他人构建、评测、部署并长期并发运行 Agents，工具链就会碎片化，最后不得不在整个生命周期中拼接各种点状方案。mosoo 覆盖这套生命周期，让你专注产品，而不是管道。",
  "Where does my data live, and does mosoo support BYOK?":
    "我的数据存在哪里？mosoo 支持 BYOK 吗？",
  "mosoo is open source and self-hostable, so data, knowledge, and run history live in infrastructure you control. There's no mosoo-operated data plane you're forced to route through. It's BYOK: you bring your own model and provider keys, held at the production plane rather than scattered across individual machines and accounts.":
    "mosoo 开源且可自行托管，因此数据、Knowledge 和运行历史都保存在你控制的基础设施中。不会强制经过 mosoo 运营的数据平面。它支持 BYOK：模型与 Provider keys 由你提供，并集中保存在生产平面，而不是散落在每台机器和各个账户里。",
  "What happens to an agent once it moves off my laptop?": "Agent 离开我的电脑后会怎样？",
  "A local agent only reproduces if the same files, session history, context, MCP tools, and Skills are available again. mosoo makes the agent, its Skills, and its Knowledge first-class App resources instead of fragments on a personal machine, so a run reproduces from the API rather than a copy of your disk. mosoo is alpha, so expect rough edges and breaking changes.":
    "本地 Agent 只有在同样的文件、session 历史、context、MCP tools 和 Skills 再次可用时才能复现。mosoo 把 Agent、Skills 和 Knowledge 变成一等 App 资源，而不是个人电脑上的零散片段，因此可通过 API 复现 Run，而不是复制整块磁盘。mosoo 仍处于 alpha 阶段，请预期会有不完善之处和 breaking changes。",
  "Which runtimes does mosoo support, and am I locked to one vendor?":
    "mosoo 支持哪些 runtime？会被锁定到某个厂商吗？",
  "In the current alpha the Claude Agent SDK, OpenAI runtime, and OpenCode fallback runtime are live, and every harness is normalized to the same interface: streaming, tool calls, native resume, MCP permissions, and session replay. OpenClaw, Hermes, and Gemini are on the roadmap. Because the runtime is a swappable harness, an agent is configured once and resolves a single provider credential at launch, so you can move between vendors without touching the agent definition.":
    "当前 alpha 中，Claude Agent SDK、OpenAI runtime 和 OpenCode fallback runtime 已可用；每种 harness 都统一为同一接口：流式输出、tool calls、原生恢复、MCP 权限与 session 重放。OpenClaw、Hermes 和 Gemini 已列入 roadmap。runtime 是可替换的 harness，因此 Agent 只需配置一次，启动时解析单个 Provider 凭据；切换厂商无需改动 Agent 定义。",
  "When should I use a deterministic workflow versus a general agent?":
    "何时该用确定性工作流，何时该用通用 Agent？",
  "Use a deterministic workflow when the steps are known and you want repeatability; use a general agent when the path is open-ended and you want it to reason its way through. mosoo's job is to run both behind one production and lifecycle API, rather than forcing every scenario into a single engine.":
    "步骤已知且重视可重复性时，使用确定性工作流；路径开放、希望由它自行推理时，使用通用 Agent。mosoo 的职责是让两者共用一套生产与生命周期 API，而不是强迫所有场景使用同一种引擎。",
  "What does the dashboard show me?": "Dashboard 会显示什么？",
  "An App overview with agent lifecycle status, recent threads, provider keys, runtime dependencies, and App usage broken down by agent and model with token and cache details. These are shipping views, not mockups; deeper per-run failure diagnostics are still being filled in during alpha.":
    "App 概览、Agent 生命周期状态、最近 Threads、Provider keys、runtime 依赖，以及按 Agent 和模型拆分的 App 用量（含 token 与 cache 明细）。这些是已上线页面，不是 mockup；更深入的单 Run 失败诊断仍在 alpha 阶段补全。",
  "How do my users reach an agent once it's published?": "Agent 发布后，用户如何使用它？",
  "Through whichever surface you bind to it: a typed HTTP API, a /skill in Claude Code, Web Threads, Slack, Lark, GitHub, or your own app. An agent is a managed endpoint inside an App, so you call it where your product already lives.":
    "可通过你绑定的任意触点：带类型的 HTTP API、Claude Code 中的 /skill、Web Threads、Slack、Lark、GitHub 或你自己的 App。Agent 是 App 内受管理的 endpoint，因此可在产品原本所在的位置调用。",
  "What does a developer configure when building an agent, and how do changes go live?":
    "构建 Agent 时需要配置什么？改动如何上线？",
  "You set the agent's runtime, attach Skills, connect Knowledge, bind Channels, and wire in API integrations, and changes accumulate in a Draft that only takes effect when you publish, so callers always reach a published version rather than in-progress edits. In the current alpha the builder binds existing Skills, MCP servers, and environments; first-class creation of those assets from inside the builder is still being filled in.":
    "你需要设置 Agent 的 runtime、挂载 Skills、连接 Knowledge、绑定 Channels，并接入 API integrations。改动先累积在 Draft 中，只有发布后才生效，因此调用方始终访问已发布版本，而不是尚未完成的编辑。当前 alpha 中，builder 可绑定已有的 Skills、MCP servers 与 environments；直接在 builder 中创建这些资源的一等能力仍在补全。",
  "How is mosoo different from Dify, n8n, OpenClaw, Claude Code, or building this in-house?":
    "mosoo 与 Dify、n8n、OpenClaw、Claude Code 或自建方案有何不同？",
  "Dify and n8n are strong at deterministic workflows; OpenClaw, Claude Code, and Hermes are strong as general agent runtimes. mosoo doesn't replace them. It sits above them as the backend that runs both kinds as deployable services with versioning, sandboxing, and App usage handled for you instead of you rebuilding that plane yourself.":
    "Dify 和 n8n 擅长确定性工作流；OpenClaw、Claude Code 和 Hermes 擅长通用 Agent runtime。mosoo 不替代它们，而是作为上层 backend，把两类方案都作为可部署服务运行，并代为处理版本管理、sandbox 与 App 用量，避免你自行重建整个平台层。",
  "What's the license and cost, and is it production-ready?":
    "许可证和成本如何？可以用于生产了吗？",
  "mosoo is open source, self-hostable, and BYOK, so there's no per-seat fee for running it yourself. It's alpha: the open runtime and lifecycle API work today, but expect rough edges and breaking changes, with the inventory, deploy, and channel surfaces designed to scale from a handful of agents to thousands.":
    "mosoo 开源、可自行托管并支持 BYOK，因此自行运行无需按席位付费。它仍处于 alpha：开放 runtime 与生命周期 API 已可用，但请预期会有不完善之处和 breaking changes。inventory、deploy 与 channel 界面已按从少量 Agents 扩展到数千个 Agents 的目标设计。",
  "Get started": "开始使用",
  "Take root in your stack.": "扎根你的技术栈。",
  "Log in to build on your agents, or star the repo and self-host in minutes.":
    "登录以构建你的 Agents，或为 repo 加 Star，几分钟内完成自托管。",
  "Take root, and grow a bamboo sea.": "扎下根，长成一片竹海。",
  "Open-source agent runtime and API for coding agents.":
    "面向 Coding Agent 的开源 Agent runtime 与 API。",
  Resources: "资源",
  Docs: "文档",
  Releases: "版本发布",
  License: "许可证",
  Security: "安全",
  "Self-hostable · BYOK": "可自行托管 · BYOK",
} as const;

type Message = keyof typeof ZH_MESSAGES;

const JA_MESSAGES = {
  Pricing: "料金",
  Blog: "ブログ",
  "API docs": "API ドキュメント",
  "mosoo on X": "mosoo の X",
  "mosoo on GitHub": "mosoo の GitHub",
  "Log in": "ログイン",
  "Star on GitHub": "GitHub で Star",
  "Star mosoo on GitHub": "GitHub で mosoo に Star",
  "# deploy an agent from the CLI": "# CLI から Agent をデプロイ",
  "1,284 docs": "1,284 ドキュメント",
  ok: "完了",
  Agents: "Agents",
  "Support copilot": "サポートアシスタント",
  "Contract reviewer": "契約レビュアー",
  "IT helpdesk": "IT ヘルプデスク",
  Live: "公開中",
  Draft: "下書き",
  "Deploy to Cloudflare": "Cloudflare にデプロイ",
  "provisions Workers · D1 · R2 · KV, no infra to wire up":
    "Workers・D1・R2・KV を自動構成。インフラの接続作業は不要",
  CLI: "CLI",
  "Run it from the terminal": "ターミナルから実行",
  "Script the whole lifecycle. mosoo agents deploy and it's live: version, publish, roll back from CI.":
    "ライフサイクル全体をスクリプト化。mosoo agents deploy で公開し、CI からバージョン管理・リリース・ロールバックできます。",
  "Web UI": "Web UI",
  "Or click through the console": "コンソールから操作",
  "Manage agents, files, credentials, and cost from a console you can operate, no terminal required.":
    "ターミナルなしで、コンソールから Agents、ファイル、認証情報、コストを管理できます。",
  "Self-host": "セルフホスト",
  "Ship to your own Cloudflare": "自分の Cloudflare にデプロイ",
  "Workers, D1, R2, and KV provision themselves on your account, so prompts and traffic never leave your edge and there is nothing to invoice or operate but your own.":
    "Workers、D1、R2、KV は自分のアカウントへ自動構成され、prompt とトラフィックは edge の外へ出ません。費用も運用も自分の環境だけです。",
  "Manage everything from the CLI or the console.": "CLI またはコンソールですべてを管理。",
  "Spin up, deploy, and run agents from the terminal or the web UI, and self-host the whole platform on your own Cloudflare in a single click.":
    "ターミナルまたは Web UI から Agents を起動・デプロイ・実行し、ワンクリックでプラットフォーム全体を自分の Cloudflare にセルフホストできます。",
  "Streaming + tool calls": "ストリーミング + tool calls",
  "Native resume": "ネイティブ再開",
  "MCP tools & permissions": "MCP tools と権限",
  "Session replay": "session リプレイ",
  Available: "利用可能",
  "Resolves one Provider credential at launch": "起動時に 1 つの Provider 認証情報を解決",
  "Normalized interface": "正規化されたインターフェース",
  "One Agent. Any runtime.": "1 つの Agent、どの runtime でも。",
  "A mosoo agent is harness-neutral. Configure it once, then run it on the Claude Agent SDK or any driver: the runtime is a swappable harness, not a rewrite. Same interface, same session model, every time.":
    "mosoo Agent は harness に依存しません。一度設定すれば、Claude Agent SDK や任意の driver で実行できます。runtime は交換可能な harness であり、書き直しではありません。常に同じインターフェース、同じ session モデルです。",
  "Agent runtimes": "Agent runtimes",
  "Preview {runtime}": "{runtime} をプレビュー",
  "Agent sandbox": "Agent sandbox",
  "claude-agent-sdk · ephemeral": "claude-agent-sdk · 一時",
  mounted: "マウント済み",
  "▸ mounting sandbox 27fe1193af5a …": "▸ sandbox 27fe1193af5a をマウント中 …",
  "✓ sandbox ready in 0.4s · /workspace mounted":
    "✓ sandbox 準備完了、0.4s · /workspace マウント済み",
  "▸ pulling runtime · Claude Agent SDK": "▸ runtime を取得中 · Claude Agent SDK",
  "✓ runtime online · claude-opus-4.8 · streaming + tools":
    "✓ runtime 稼働中 · claude-opus-4.8 · ストリーミング + tools",
  "▸ mounting session files · support-kb, runbooks (ro)":
    "▸ session ファイルをマウント中 · support-kb、runbooks（読み取り専用）",
  "✓ 12 MCP tools · BYOK credentials resolved": "✓ 12 MCP tools · BYOK 認証情報を解決済み",
  "▸ booting agent · memory + context restored": "▸ Agent を起動中 · memory + context 復元済み",
  "✓ support-agent live · full cloud agent ready":
    "✓ support-agent 稼働中 · フルクラウド Agent 準備完了",
  "agent · support-agent": "Agent · support-agent",
  "ephemeral sandbox": "一時 sandbox",
  "No always-on agent cloud.": "常時稼働の Agent クラウドは不要。",
  "mosoo mounts a fresh sandbox the instant an agent runs, then tears it down when the turn ends. No standing fleet to pay for or babysit: compute appears on demand, scoped to the session, and disappears.":
    "Agent の実行時に mosoo が新しい sandbox を即座にマウントし、ターン終了時に破棄します。常設 fleet の費用も保守も不要です。compute は session 単位で必要なときだけ現れ、使い終わると消えます。",
  "Runs on Claude Code": "Claude Code で動作",
  "Pixel-art bamboo reaching into a bright sky": "明るい空へ伸びるピクセルアートの竹",
  "Run exported Skill.md": "エクスポートした Skill.md を実行",
  "Grounded support": "根拠に基づくサポート",
  "Legal redlines": "法務レッドライン",
  "Internal IT": "社内 IT",
  "Reset my 2FA": "2FA をリセットして",
  Connected: "接続済み",
  "Reuse as Skill.md": "Skill.md として再利用",
  "Export the App to one Skill.md, then reuse it as a /skill inside Claude Code or any compatible CLI: no context-switching, no glue code.":
    "App を 1 つの Skill.md としてエクスポートし、Claude Code または互換 CLI 内で /skill として再利用。コンテキスト切り替えもつなぎ込みコードも不要です。",
  "Call it over the API": "API 経由で呼び出す",
  "Every App-local Agent gets a typed HTTP endpoint. Wire it into your backend, a cron job, or another agent.":
    "App 内の各 Agent に型付き HTTP endpoint が用意されます。backend、cron job、別の Agent に接続できます。",
  "Live in your channels": "いつもの Channels で使う",
  "Connect Slack, Lark, Discord, Telegram, or WeChat. Your users talk to the agent without leaving chat.":
    "Slack、Lark、Discord、Telegram、WeChat に接続。ユーザーはチャットを離れずに Agent と会話できます。",
  "Build one App.": "1 つの App を構築。",
  "Invoke its agents anywhere.": "その Agents をどこからでも呼び出す。",
  "Export the App for Skill.md reuse, expose an App-local Agent through a typed API, or bind that Agent to the chat tools your users already live in: one App, every surface.":
    "App を Skill.md として再利用し、App 内 Agent を型付き API で公開するか、ユーザーが普段使うチャットツールへ接続できます。1 つの App で、あらゆる接点へ。",
  "Total spend": "総支出",
  Requests: "リクエスト",
  Tokens: "Tokens",
  "94% cache hit": "cache ヒット率 94%",
  "Active apps": "アクティブ App",
  "of 9": "全 9 App 中",
  Jan: "1月",
  Feb: "2月",
  Mar: "3月",
  Apr: "4月",
  May: "5月",
  Jun: "6月",
  Production: "本番",
  Debug: "デバッグ",
  Preview: "プレビュー",
  "Spend over time": "支出推移",
  "Production vs debug · last 6 months": "本番 vs. デバッグ · 直近 6 か月",
  "Spend by model": "モデル別支出",
  "Where the budget goes": "予算の配分先",
  "30 days": "30 日",
  "Know the unit cost of every run.": "すべての Run の単価を把握。",
  "See exactly where spend goes: by app, by agent, by model. Roll cost up to an app or a run, compare against last period, and know the unit economics of every agent you ship.":
    "支出先を App、Agent、モデル別に正確に確認。コストを App や Run 単位で集計し、前期と比較して、公開するすべての Agent のユニットエコノミクスを把握できます。",
  Breakdown: "内訳",
  "Pivot the same spend by app, agent, or model": "同じ支出を App、Agent、モデル別に切り替え",
  "Export CSV": "CSV をエクスポート",
  "By Agent": "Agent 別",
  "By App": "App 別",
  "By Model": "モデル別",
  Agent: "Agent",
  Owner: "担当者",
  "Run mix": "Run 構成",
  "vs. prev": "前期比",
  Cost: "コスト",
  App: "App",
  "Top agent": "トップ Agent",
  "External · API-triggered": "外部・API トリガー",
  Model: "モデル",
  Vendor: "ベンダー",
  "Cache hit": "cache ヒット率",
  "Sales researcher": "セールスリサーチャー",
  "Onboarding bot": "オンボーディング Bot",
  "Support Console": "サポートコンソール",
  "Customer Ops": "カスタマーオペレーション",
  "Contract Desk": "契約デスク",
  "Legal Ops": "法務オペレーション",
  "IT Intake": "IT 受付",
  "Internal Tools": "社内ツール",
  "Sales Research": "セールスリサーチ",
  Revenue: "売上",
  "Onboarding Hub": "オンボーディングハブ",
  "Frequently asked questions": "よくある質問",
  "What developers ask before they build on mosoo.":
    "mosoo で構築を始める前によく寄せられる質問です。",
  "What is mosoo?": "mosoo とは？",
  "mosoo is an open-source agent runtime and API for coding agents. It runs OpenAI Codex, Claude Agent SDK, and OpenCode in isolated sandboxes, keeps Threads and files across Runs, and is self-hostable in your own Cloudflare account. mosoo is currently alpha.":
    "mosoo は Coding Agent 向けのオープンソース Agent runtime と API です。隔離された sandbox で OpenAI Codex、Claude Agent SDK、OpenCode を実行し、Runs をまたいで Threads とファイルを保持できます。自分の Cloudflare アカウントにセルフホスト可能です。mosoo は現在 alpha です。",
  "Who is mosoo built for?": "mosoo は誰のためのものですか？",
  "Developers extending OpenAI Codex, Claude Agent SDK, or OpenCode into products and automations who don't want to operate a separate agent runtime, sandbox service, session store, file pipeline, and Agent API for every integration.":
    "OpenAI Codex、Claude Agent SDK、OpenCode を製品や自動化へ組み込みたい開発者向けです。integration ごとに Agent runtime、sandbox サービス、session ストア、ファイルパイプライン、Agent API を個別運用したくない人のために作られています。",
  "Why a backend instead of just running Claude Code or Codex locally?":
    "Claude Code や Codex をローカル実行するだけでなく、なぜ backend が必要ですか？",
  "For a one-off problem, a local agent or a single Skill is the right, minimal tool — no need to abstract anything. The moment you have to build, evaluate, deploy, and run agents for other people, concurrently and for longer, the tooling fragments and you end up gluing point solutions across the whole lifecycle. mosoo is the backend that covers that lifecycle, so you build the product instead of the plumbing.":
    "単発の課題なら、ローカル Agent や 1 つの Skill が正しく最小の手段で、抽象化は不要です。しかし他の人向けに Agents を構築・評価・デプロイし、並行かつ長時間動かす段階になると、ツールは分断され、ライフサイクル全体で個別の仕組みをつなぐことになります。mosoo がそのライフサイクルを担うため、配管ではなく製品に集中できます。",
  "Where does my data live, and does mosoo support BYOK?":
    "データはどこに保存されますか？mosoo は BYOK に対応していますか？",
  "mosoo is open source and self-hostable, so data, knowledge, and run history live in infrastructure you control. There's no mosoo-operated data plane you're forced to route through. It's BYOK: you bring your own model and provider keys, held at the production plane rather than scattered across individual machines and accounts.":
    "mosoo はオープンソースでセルフホスト可能なため、データ、Knowledge、実行履歴は自分が管理するインフラに保存されます。mosoo 運営のデータプレーンを強制的に経由することはありません。BYOK に対応し、モデルと Provider keys は各マシンやアカウントへ分散させず、本番プレーンで管理できます。",
  "What happens to an agent once it moves off my laptop?":
    "Agent が自分の laptop を離れたらどうなりますか？",
  "A local agent only reproduces if the same files, session history, context, MCP tools, and Skills are available again. mosoo makes the agent, its Skills, and its Knowledge first-class App resources instead of fragments on a personal machine, so a run reproduces from the API rather than a copy of your disk. mosoo is alpha, so expect rough edges and breaking changes.":
    "ローカル Agent を再現するには、同じファイル、session 履歴、context、MCP tools、Skills が必要です。mosoo は Agent、Skills、Knowledge を個人マシン上の断片ではなく、第一級の App リソースとして扱います。そのため、ディスクのコピーではなく API から Run を再現できます。mosoo は alpha のため、粗い部分や breaking changes があります。",
  "Which runtimes does mosoo support, and am I locked to one vendor?":
    "mosoo はどの runtime に対応していますか？特定ベンダーにロックインされますか？",
  "In the current alpha the Claude Agent SDK, OpenAI runtime, and OpenCode fallback runtime are live, and every harness is normalized to the same interface: streaming, tool calls, native resume, MCP permissions, and session replay. OpenClaw, Hermes, and Gemini are on the roadmap. Because the runtime is a swappable harness, an agent is configured once and resolves a single provider credential at launch, so you can move between vendors without touching the agent definition.":
    "現在の alpha では Claude Agent SDK、OpenAI runtime、OpenCode fallback runtime が利用可能です。すべての harness は、ストリーミング、tool calls、ネイティブ再開、MCP 権限、session リプレイという同じインターフェースに正規化されています。OpenClaw、Hermes、Gemini は roadmap にあります。runtime は交換可能な harness なので、Agent は一度設定するだけで、起動時に 1 つの Provider 認証情報を解決します。Agent 定義を変えずにベンダーを移行できます。",
  "When should I use a deterministic workflow versus a general agent?":
    "決定論的 workflow と汎用 Agent はどう使い分けますか？",
  "Use a deterministic workflow when the steps are known and you want repeatability; use a general agent when the path is open-ended and you want it to reason its way through. mosoo's job is to run both behind one production and lifecycle API, rather than forcing every scenario into a single engine.":
    "手順が既知で再現性を重視するなら決定論的 workflow、経路がオープンで推論させたいなら汎用 Agent を使います。mosoo はすべてを 1 つの engine に押し込めず、両方を同じ本番・ライフサイクル API の背後で実行します。",
  "What does the dashboard show me?": "Dashboard では何を確認できますか？",
  "An App overview with agent lifecycle status, recent threads, provider keys, runtime dependencies, and App usage broken down by agent and model with token and cache details. These are shipping views, not mockups; deeper per-run failure diagnostics are still being filled in during alpha.":
    "App の概要、Agent のライフサイクル状態、最近の Threads、Provider keys、runtime 依存関係、Agent・モデル別の App 使用量と token・cache の詳細を確認できます。これらは mockup ではなく提供中の画面です。Run ごとの詳細な失敗診断は alpha 期間中に拡充しています。",
  "How do my users reach an agent once it's published?":
    "公開後、ユーザーはどうやって Agent を利用しますか？",
  "Through whichever surface you bind to it: a typed HTTP API, a /skill in Claude Code, Web Threads, Slack, Lark, GitHub, or your own app. An agent is a managed endpoint inside an App, so you call it where your product already lives.":
    "型付き HTTP API、Claude Code 内の /skill、Web Threads、Slack、Lark、GitHub、自分の App など、接続した任意の接点から利用できます。Agent は App 内の管理された endpoint なので、製品が既に存在する場所から呼び出せます。",
  "What does a developer configure when building an agent, and how do changes go live?":
    "Agent の構築時に何を設定し、変更はどう公開されますか？",
  "You set the agent's runtime, attach Skills, connect Knowledge, bind Channels, and wire in API integrations, and changes accumulate in a Draft that only takes effect when you publish, so callers always reach a published version rather than in-progress edits. In the current alpha the builder binds existing Skills, MCP servers, and environments; first-class creation of those assets from inside the builder is still being filled in.":
    "Agent の runtime を設定し、Skills を追加し、Knowledge を接続し、Channels と API integrations を構成します。変更は Draft に蓄積され、公開時にのみ反映されるため、呼び出し側は編集中ではなく常に公開済みバージョンへ到達します。現在の alpha では既存の Skills、MCP servers、environments を builder から接続できますが、builder 内で直接作成する第一級機能は拡充中です。",
  "How is mosoo different from Dify, n8n, OpenClaw, Claude Code, or building this in-house?":
    "mosoo は Dify、n8n、OpenClaw、Claude Code、自社構築と何が違いますか？",
  "Dify and n8n are strong at deterministic workflows; OpenClaw, Claude Code, and Hermes are strong as general agent runtimes. mosoo doesn't replace them. It sits above them as the backend that runs both kinds as deployable services with versioning, sandboxing, and App usage handled for you instead of you rebuilding that plane yourself.":
    "Dify と n8n は決定論的 workflow、OpenClaw、Claude Code、Hermes は汎用 Agent runtime に強みがあります。mosoo はそれらを置き換えません。上位の backend として両方をデプロイ可能なサービスとして実行し、バージョン管理、sandbox、App 使用量を担うため、その基盤を自分で再構築する必要がありません。",
  "What's the license and cost, and is it production-ready?":
    "ライセンスとコストは？本番利用できますか？",
  "mosoo is open source, self-hostable, and BYOK, so there's no per-seat fee for running it yourself. It's alpha: the open runtime and lifecycle API work today, but expect rough edges and breaking changes, with the inventory, deploy, and channel surfaces designed to scale from a handful of agents to thousands.":
    "mosoo はオープンソースでセルフホスト可能、BYOK 対応のため、自分で実行する場合の席数課金はありません。現在は alpha です。オープンな runtime とライフサイクル API は利用できますが、粗い部分や breaking changes があります。inventory、deploy、channel の各画面は、少数から数千の Agents まで拡張できるよう設計されています。",
  "Get started": "はじめる",
  "Take root in your stack.": "あなたのスタックに根を張ろう。",
  "Log in to build on your agents, or star the repo and self-host in minutes.":
    "ログインして Agents を構築するか、repo に Star を付けて数分でセルフホストできます。",
  "Take root, and grow a bamboo sea.": "根を張り、竹の海を育てよう。",
  "Open-source agent runtime and API for coding agents.":
    "Coding Agent 向けのオープンソース Agent runtime と API。",
  Resources: "リソース",
  Docs: "ドキュメント",
  Releases: "リリース",
  License: "ライセンス",
  Security: "セキュリティ",
  "Self-hostable · BYOK": "セルフホスト可能 · BYOK",
} satisfies Record<Message, string>;

const MESSAGES = {
  zh: ZH_MESSAGES,
  ja: JA_MESSAGES,
};

export function t(message: Message): string {
  return locale === "en" ? message : MESSAGES[locale][message];
}
