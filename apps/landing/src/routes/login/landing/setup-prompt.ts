import type { Locale } from "@/shared/locale";

// The console's "Set up with your coding agent" prompt (mosoo
// apps/web/src/shared/i18n/translations/*.json, projectOverview.setupPrompt),
// as adapted in the v1 copy deck §13: it no longer asks the agent to publish an
// Agent, and step 4 starts a Session through the v2 Thread API instead. The
// console origin is fixed to https://cloud.mosoo.ai on the website.
//
// The three locales say the same thing; change them together. The console
// strings in the main repo still carry the publish step (follow-up there).
export const SETUP_PROMPT = {
  en: `# Set up mosoo

Use this instruction with any coding agent. You are helping the user finish onboarding to mosoo, an open-source agent runtime: add a model provider key, then start a Session through the Thread API. Work through the steps in order and skip any step that is already done. Ask the user for values only they know. Never print or commit secrets.

## Generated variables

\`\`\`text
MOSOO_CONSOLE_URL=https://cloud.mosoo.ai
MOSOO_DOCS_URL=https://mosoo.ai/docs
\`\`\`

## 1. Install the mosoo CLI and sign in

\`\`\`bash
curl -fsSL https://install.mosoo.ai/install.sh | bash
\`\`\`

The installer adds the mosoo CLI and the @mosoo skill, then opens a browser sign-in and checks cloud readiness (doctor). The login callback authorizes the CLI and creates an account login credential for it automatically. If no browser can open, show the user the sign-in URL printed in the terminal and wait for them to finish it.

## 2. Add a provider key (required before runs)

Session runs need a model provider credential, for example OpenAI or Anthropic. This is the one step you cannot complete alone: ask the user which provider they want and have them add the key at MOSOO_CONSOLE_URL/providers. Do not start the first run until a provider key is configured.

## 3. Create an API token (optional)

The CLI sign-in from step 1 already covers CLI usage. If this project calls the Thread API from a backend or script, create a token at MOSOO_CONSOLE_URL/project-settings/api-keys and store it in the project environment as MOSOO_API_TOKEN. Keep it out of source control.

## 4. Run a first session

Start a first session through the v2 Thread API with an inline configuration (harness, provider, model, instructions); no agent is needed. To save a reusable configuration instead, create an agent at MOSOO_CONSOLE_URL/agent?create=1 and start a session from the agent page. The API flow (create a thread, stream events, send follow-ups) is documented at MOSOO_DOCS_URL/quickstart and MOSOO_DOCS_URL/api-reference-v2.

## Done when

- The CLI is signed in and doctor reports the cloud is reachable.
- A provider key is configured for the active Project.
- At least one session has run: a Thread under MOSOO_CONSOLE_URL/threads, or a Preview on the agent page.
`,
  zh: `# 设置 mosoo

请将以下说明用于任何编码智能体。你在帮助用户完成 mosoo（一个开源智能体运行时）的入门设置：添加模型供应商密钥，然后通过 Thread API 启动一个会话。按顺序完成以下步骤，已完成的步骤可以跳过。只向用户询问只有他们知道的取值。切勿打印或提交密钥。

## 生成的变量

\`\`\`text
MOSOO_CONSOLE_URL=https://cloud.mosoo.ai
MOSOO_DOCS_URL=https://mosoo.ai/docs
\`\`\`

## 1. 安装 mosoo CLI 并登录

\`\`\`bash
curl -fsSL https://install.mosoo.ai/install.sh | bash
\`\`\`

安装程序会添加 mosoo CLI 和 @mosoo 技能，然后打开浏览器登录并检查云端就绪状态（doctor）。登录回调会自动授权 CLI 并为其创建账号登录凭据。如果无法打开浏览器，请将终端中打印的登录 URL 展示给用户，并等待其完成登录。

## 2. 添加模型供应商密钥（运行前必需）

会话运行需要模型供应商凭据，例如 OpenAI 或 Anthropic。这是你无法独自完成的一步：请询问用户希望使用哪个供应商，并让他们在 MOSOO_CONSOLE_URL/providers 添加密钥。在配置好供应商密钥之前，不要开始首次运行。

## 3. 创建 API 令牌（可选）

第 1 步的 CLI 登录已覆盖 CLI 的使用。如果此项目需要从后端或脚本调用 Thread API，请在 MOSOO_CONSOLE_URL/project-settings/api-keys 创建令牌，并将其作为 MOSOO_API_TOKEN 存入项目环境变量。切勿纳入版本控制。

## 4. 运行第一个会话

通过 v2 Thread API 以 inline 配置（harness、provider、model、instructions）启动第一个会话，无需创建智能体。如果想保存可复用的配置，可以在 MOSOO_CONSOLE_URL/agent?create=1 创建智能体，并从智能体页面开始会话。API 流程（创建线程、流式事件、发送后续消息）的文档位于 MOSOO_DOCS_URL/quickstart 和 MOSOO_DOCS_URL/api-reference-v2。

## 完成条件

- CLI 已登录，doctor 报告云端可达。
- 已为当前项目配置供应商密钥。
- 至少运行过一个会话：MOSOO_CONSOLE_URL/threads 下的 Thread，或智能体页面上的预览。
`,
  ja: `# mosoo のセットアップ

この手順は任意のコーディングエージェントで使用してください。ユーザーがオープンソースのエージェントランタイムである mosoo のオンボーディングを完了できるよう支援します：プロバイダーキーを追加し、Thread API からセッションを開始します。手順は順番に進め、すでに完了している手順はスキップしてください。ユーザーだけが知っている値のみをユーザーに尋ねてください。シークレットを印刷したりコミットしたりしないでください。

## 生成される変数

\`\`\`text
MOSOO_CONSOLE_URL=https://cloud.mosoo.ai
MOSOO_DOCS_URL=https://mosoo.ai/docs
\`\`\`

## 1. mosoo CLI のインストールとサインイン

\`\`\`bash
curl -fsSL https://install.mosoo.ai/install.sh | bash
\`\`\`

インストーラーは mosoo CLI と @mosoo スキルを追加し、ブラウザのサインインを開いてクラウドの準備状態（doctor）を確認します。ログインコールバックが CLI を承認し、アカウントのログイン認証情報を自動的に作成します。ブラウザを開けない場合は、ターミナルに表示されたサインイン URL をユーザーに見せて、完了するまで待ってください。

## 2. プロバイダーキーを追加（実行前に必須）

セッションの実行にはモデルプロバイダーの認証情報が必要です（例：OpenAI、Anthropic）。これはあなただけでは完了できない手順です：ユーザーに希望するプロバイダーを尋ね、MOSOO_CONSOLE_URL/providers でキーを追加してもらってください。プロバイダーキーが設定されるまで最初の実行を開始しないでください。

## 3. API トークンを作成（任意）

手順 1 の CLI サインインで CLI の利用はまかなえます。このプロジェクトがバックエンドやスクリプトから Thread API を呼び出す場合は、MOSOO_CONSOLE_URL/project-settings/api-keys でトークンを作成し、MOSOO_API_TOKEN としてプロジェクトの環境に保存してください。ソース管理には含めないでください。

## 4. 最初のセッションを実行

v2 Thread API で inline 設定（harness、provider、model、instructions）を使い、最初のセッションを開始します。エージェントの作成は不要です。再利用できる設定を保存したい場合は、MOSOO_CONSOLE_URL/agent?create=1 でエージェントを作成し、エージェントページからセッションを開始します。API フロー（スレッドの作成、イベントのストリーミング、フォローアップの送信）のドキュメントは MOSOO_DOCS_URL/quickstart と MOSOO_DOCS_URL/api-reference-v2 にあります。

## 完了条件

- CLI がサインイン済みで、doctor がクラウドへ到達可能と報告している。
- アクティブなプロジェクトにプロバイダーキーが設定されている。
- 少なくとも 1 つのセッションが実行されている：MOSOO_CONSOLE_URL/threads の Thread、またはエージェントページのプレビュー。
`,
} as const satisfies Record<Locale, string>;
