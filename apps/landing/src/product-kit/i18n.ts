// Two kinds of text live in the kit:
// - Console strings, quoted verbatim from the console catalogs
//   (apps/web/src/shared/i18n/translations/{en,zh-CN,ja}.json) through
//   data/console-strings.snapshot.json. Regenerate, never hand-edit.
// - Kit copy: website copy a product moment needs that the console does not
//   have. Most of it is quoted from the v1 copy deck (section noted per key);
//   the rest is listed under "Copy deviations" in README.md with its reason.

import snapshot from "./data/console-strings.snapshot.json";

export type KitLocale = "en" | "zh" | "ja";

export const KIT_LOCALES: readonly KitLocale[] = ["en", "zh", "ja"];

const CONSOLE_STRINGS = snapshot.strings;

export type ConsoleKey = keyof typeof snapshot.strings.en;

export const CONSOLE_CONSTANTS = snapshot.constants;

// provider.tsx t(): plain {{name}} replacement, no plural rules.
export function interpolate(text: string, variables?: Record<string, string>): string {
  return Object.entries(variables ?? {}).reduce(
    (result, [name, replacement]) => result.replaceAll(`{{${name}}}`, replacement),
    text,
  );
}

export function consoleText(
  locale: KitLocale,
  key: ConsoleKey,
  variables?: Record<string, string>,
): string {
  return interpolate(CONSOLE_STRINGS[locale][key], variables);
}

const KIT_COPY = {
  // Copy deck §18 microcopy, verbatim.
  exampleValues: { en: "Example values", zh: "示例数据", ja: "サンプル値" },
  copyRequest: { en: "Copy request", zh: "复制请求", ja: "リクエストをコピー" },
  requestCopied: { en: "Request copied", zh: "请求已复制", ja: "リクエストをコピーしました" },
  commandCopied: { en: "Command copied", zh: "命令已复制", ja: "コマンドをコピーしました" },
  startSession: { en: "Start a Session", zh: "启动 Session", ja: "Session を開始" },

  // Copy deck §3 panel labels, verbatim.
  sandboxReclaimed: {
    en: "Sandbox reclaimed while idle",
    zh: "sandbox 闲置后已回收",
    ja: "アイドル中に sandbox を回収",
  },
  restoredFromCheckpoint: {
    en: "Restored from the last checkpoint",
    zh: "从最近一次检查点恢复",
    ja: "最後のチェックポイントから復元",
  },
  sameThreadId: { en: "Same thread.id", zh: "同一个 thread.id", ja: "同じ thread.id" },

  // Copy deck F5, the feature title, verbatim.
  boundaryOutside: {
    en: "Keys stay outside the sandbox",
    zh: "密钥留在 sandbox 之外",
    ja: "キーは sandbox の外に",
  },
  // Copy deck FAQ 6, the Environment variables sentences, verbatim. Each
  // starts with the console's environments.envVars label.
  boundaryEnvException: {
    en: "Environment variables are different. Code in the sandbox can read them, so keep model keys in Providers and tool tokens in MCP connections.",
    zh: "环境变量则不同，sandbox 里的代码可以读取它们，所以模型密钥请放在模型供应商设置里，工具令牌请放在 MCP 连接里。",
    ja: "環境変数は例外で、sandbox 内のコードから読み取れます。モデルのキーはプロバイダー設定に、ツールのトークンは MCP 接続に保存してください。",
  },

  // Kit copy (README "Copy deviations").
  daysLater: { en: "7 days later", zh: "7 天后", ja: "7 日後" },
  thread: { en: "Thread", zh: "Thread", ja: "Thread" },
  response: { en: "Response", zh: "响应", ja: "レスポンス" },
  uploadInputCsv: { en: "Upload input.csv", zh: "上传 input.csv", ja: "input.csv をアップロード" },
  projectKeys: {
    en: "Project with Anthropic and OpenAI keys",
    zh: "项目已配置 Anthropic 和 OpenAI 密钥",
    ja: "Anthropic と OpenAI のキーを設定したプロジェクト",
  },
  sameNonceHash: {
    en: "Same private_nonce_sha256",
    zh: "private_nonce_sha256 相同",
    ja: "同じ private_nonce_sha256",
  },
  priorCommitKept: {
    en: "Turn 2 stays the last committed checkpoint.",
    zh: "第 2 轮仍是最近一次提交的检查点。",
    ja: "最後にコミットされたチェックポイントは 2 ターンのままです。",
  },
  boundaryTitle: {
    en: "Credential boundary",
    zh: "凭据边界",
    ja: "認証情報の境界",
  },
  boundarySandbox: { en: "Session sandbox", zh: "Session sandbox", ja: "Session sandbox" },
  boundaryHarness: { en: "harness", zh: "harness", ja: "harness" },
  boundaryDriver: { en: "Agent Driver", zh: "Agent Driver", ja: "Agent Driver" },
  boundaryWorkspace: { en: "working directory", zh: "工作目录", ja: "作業ディレクトリ" },
  boundaryGrant: {
    en: "expiring grants only",
    zh: "只拿到会过期的授权",
    ja: "期限付きの権限のみ",
  },
  boundaryWorker: { en: "mosoo Worker", zh: "mosoo Worker", ja: "mosoo Worker" },
  boundaryLlmProxy: { en: "LLM proxy", zh: "LLM 代理", ja: "LLM プロキシ" },
  boundaryMcpProxy: { en: "MCP proxy", zh: "MCP 代理", ja: "MCP プロキシ" },
  boundaryProviderKeys: { en: "Provider keys", zh: "模型供应商密钥", ja: "プロバイダーキー" },
  boundaryMcpCredentials: { en: "MCP credentials", zh: "MCP 凭据", ja: "MCP 認証情報" },
  boundaryKeysNote: {
    en: "encrypted, read on every request",
    zh: "加密存储，每次请求时读取",
    ja: "暗号化、リクエストごとに読み取り",
  },
  boundaryAddsKey: {
    en: "adds the key",
    zh: "注入密钥",
    ja: "キーを付与",
  },
  boundaryAddsCredential: {
    en: "adds the credential",
    zh: "注入凭据",
    ja: "認証情報を付与",
  },
  boundaryProvider: { en: "Model provider", zh: "模型供应商", ja: "モデルプロバイダー" },
  boundaryMcpServer: { en: "Your MCP server", zh: "你的 MCP 服务器", ja: "自社の MCP サーバー" },
  boundaryEnvNote: {
    en: "readable inside the sandbox",
    zh: "在 sandbox 内可读",
    ja: "sandbox 内で読み取れる",
  },
} as const satisfies Record<string, Record<KitLocale, string>>;

export type KitCopyKey = keyof typeof KIT_COPY;

export function kitText(locale: KitLocale, key: KitCopyKey): string {
  return KIT_COPY[key][locale];
}

/** "{action}: {subject}" with the locale's colon, for unique control names. */
export function withSubject(locale: KitLocale, action: string, subject: string): string {
  return locale === "en" ? `${action}: ${subject}` : `${action}：${subject}`;
}

/** A moment's accessible name: what it shows, and that its data are examples. */
export function momentLabel(locale: KitLocale, name: string, example = true): string {
  if (!example) {
    return name;
  }

  const values = kitText(locale, "exampleValues");
  return locale === "en" ? `${name} (${values})` : `${name}（${values}）`;
}
