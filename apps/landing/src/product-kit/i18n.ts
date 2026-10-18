// Two kinds of text live in the kit:
// - Console strings, quoted verbatim from the console catalogs
//   (apps/web/src/shared/i18n/translations/{en,zh-CN,ja}.json) through
//   data/console-strings.snapshot.json. Regenerate, never hand-edit.
// - Kit copy: the few captions a product moment needs that the console does
//   not have (the gap between turns, diagram labels, "Example"). These are
//   website copy; align them with the copy deck when it lands.

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
  example: { en: "Example", zh: "示例", ja: "例" },
  thread: { en: "Thread", zh: "Thread", ja: "Thread" },
  exampleProjectKeys: {
    en: "Example Project with Anthropic and OpenAI keys",
    zh: "示例 Project，已配置 Anthropic 和 OpenAI 密钥",
    ja: "Anthropic と OpenAI のキーを設定した例の Project",
  },
  gapReclaimed: {
    en: "+7 days · sandbox reclaimed",
    zh: "+7 天 · sandbox 已回收",
    ja: "+7 日 · sandbox は回収済み",
  },
  restoredFromCheckpoint: {
    en: "Restored from checkpoint",
    zh: "从检查点恢复",
    ja: "チェックポイントから復元",
  },
  sameNonceHash: {
    en: "Same private_nonce_sha256",
    zh: "private_nonce_sha256 相同",
    ja: "private_nonce_sha256 は同一",
  },
  priorCommitKept: {
    en: "Turn 2 stays the last committed checkpoint.",
    zh: "第 2 轮仍是最近一次提交的检查点。",
    ja: "最後にコミットされたチェックポイントは 2 ターンのままです。",
  },
  request: { en: "Request", zh: "请求", ja: "リクエスト" },
  response: { en: "Response", zh: "响应", ja: "レスポンス" },
  copyRequest: { en: "Copy request", zh: "复制请求", ja: "リクエストをコピー" },
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
    zh: "只拿到短时效 grant",
    ja: "期限付きの grant のみ",
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
  boundaryEnvException: {
    en: "Readable inside the sandbox. Keep model keys in Providers and tool tokens in MCP connections.",
    zh: "在 sandbox 内可读。模型密钥请放在 Providers，工具 token 放在 MCP 连接里。",
    ja: "sandbox 内で読み取れます。モデルのキーは Providers に、ツールのトークンは MCP 接続に置いてください。",
  },
  boundaryOutside: {
    en: "Keys never enter the sandbox",
    zh: "密钥从不进入 sandbox",
    ja: "キーは sandbox に入りません",
  },
} as const satisfies Record<string, Record<KitLocale, string>>;

export type KitCopyKey = keyof typeof KIT_COPY;

export function kitText(locale: KitLocale, key: KitCopyKey): string {
  return KIT_COPY[key][locale];
}
