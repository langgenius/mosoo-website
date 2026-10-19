import { recordStatusTailEvents, statusJsonResponse } from "./status.js";

export { StatusStore } from "./status.js";

const CONSOLE_ORIGIN = "https://cloud.mosoo.ai";
// v2 is the Project-key API that runs inline Sessions; v1 stays wire-compatible.
const PUBLIC_API_V2_BASE = `${CONSOLE_ORIGIN}/api/v2`;
const PUBLIC_API_V2_DESCRIPTION = `${PUBLIC_API_V2_BASE}/openapi.json`;
const PUBLIC_API_V2_DOCUMENTATION = "https://mosoo.ai/docs/api-reference-v2/";
const PUBLIC_API_BASE = `${CONSOLE_ORIGIN}/api/v1`;
const PUBLIC_API_DESCRIPTION = `${PUBLIC_API_BASE}/openapi.json`;
const PUBLIC_API_DOCUMENTATION = "https://mosoo.ai/docs/api-reference/";
const PUBLIC_API_STATUS = `${CONSOLE_ORIGIN}/api/health`;
const PROTECTED_RESOURCE_METADATA = `${CONSOLE_ORIGIN}/.well-known/oauth-protected-resource`;
const CONTENT_SIGNAL = "ai-train=no, search=yes, ai-input=yes";
const LOCALE_COOKIE = "mosoo_locale";
const LLMS_LINK_HEADER =
  '</llms.txt>; rel="llms-txt", </docs/llms-full.txt>; rel="llms-full-txt"';
const API_CATALOG_LINK =
  '</.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"';
const SERVICE_LINKS = [
  [PUBLIC_API_V2_DESCRIPTION, PUBLIC_API_V2_DOCUMENTATION],
  [PUBLIC_API_DESCRIPTION, PUBLIC_API_DOCUMENTATION],
]
  .map(
    ([description, documentation]) =>
      `<${description}>; rel="service-desc"; type="application/json", <${documentation}>; rel="service-doc"; type="text/html"`,
  )
  .join(", ");
const DISCOVERY_LINK_HEADER = `${LLMS_LINK_HEADER}, ${API_CATALOG_LINK}, ${SERVICE_LINKS}, </auth.md>; rel="describedby"; type="text/markdown"`;
const API_CATALOG = {
  linkset: [
    [PUBLIC_API_V2_BASE, PUBLIC_API_V2_DESCRIPTION, PUBLIC_API_V2_DOCUMENTATION],
    [PUBLIC_API_BASE, PUBLIC_API_DESCRIPTION, PUBLIC_API_DOCUMENTATION],
  ].map(([anchor, description, documentation]) => ({
    anchor,
    "service-desc": [{ href: description, type: "application/json" }],
    "service-doc": [{ href: documentation, type: "text/html" }],
    status: [{ href: PUBLIC_API_STATUS, type: "application/json" }],
  })),
};
const SUPPORTED_LOCALES = new Set(["en", "zh", "ja"]);
const HOMEPAGE_MARKDOWN = `# mosoo

mosoo is an open-source, API-first managed Agent runtime for application backends. It runs OpenAI Codex, Claude Agent SDK, OpenCode, and Pi behind one API, each Session in its own sandbox. mosoo is in Alpha.

- Start a Session: POST https://cloud.mosoo.ai/api/v2/projects/{projectId}/threads with an inline configuration and a Project API key (msp_). No Agent is required.
- Continue it minutes or days later with POST /api/v2/threads/{threadId}/events.
- Follow events over SSE. There are no Webhooks.
- Bring your own model provider key. mosoo supplies no models.

- API quickstart: https://mosoo.ai/docs/quickstart/
- OpenAPI 3.1 (v2): https://cloud.mosoo.ai/api/v2/openapi.json
- Product and content index: https://mosoo.ai/llms.txt
- Documentation index: https://mosoo.ai/docs/llms.txt
- Source: https://github.com/langgenius/mosoo
`;
// /zh and /ja answer Accept: text/markdown in their own language (copy deck 17).
const HOMEPAGE_MARKDOWN_ZH = `# mosoo

> mosoo 是开源、API 优先的托管 Agent runtime，面向应用后端。它用一个 API 运行 OpenAI Codex、Claude Agent SDK、OpenCode 和 Pi，每个 Session 都在自己的 sandbox 中执行。

mosoo 目前处于 Alpha 阶段，公开 API 和产品行为仍可能变化。它以 Apache 2.0 许可证开源，由 LangGenius, Inc. 维护。

- 鉴权：使用 Project API 密钥，\`Authorization: Bearer msp_...\`。密钥是绑定单个项目的后端密钥，只显示一次，只保存哈希，不要放进浏览器或移动端。
- 启动 Session：\`POST https://cloud.mosoo.ai/api/v2/projects/{projectId}/threads\`，使用 inline 配置（harness、provider、model、instructions），不会创建 Agent。保存返回的 \`thread.id\`。
- runtime：\`openai-runtime\`（OpenAI Codex）、\`claude-agent-sdk\`（Claude Agent SDK）、\`acp-fallback\`（OpenCode）、\`pi\`（Pi）。
- 继续：\`POST /api/v2/threads/{threadId}/events\`，1 分钟后或 7 天后语义相同。
- 跟踪：读取已保存的事件历史，或通过 SSE 接收事件。没有 Webhook。
- 文件：Agent 写到 \`outputs/\` 下的文件会成为可下载的产出物。
- 用量：\`GET /api/v2/threads/{threadId}/usage\`，每次模型调用一条记录，金额是估算，不是账单。
- BYOK：首次运行前，项目里需要有模型供应商密钥。mosoo 不提供模型。

- API 快速开始：https://mosoo.ai/docs/zh-Hans/quickstart/
- API 参考 v2：https://mosoo.ai/docs/zh-Hans/api-reference-v2/
- OpenAPI 3.1（v2）：https://cloud.mosoo.ai/api/v2/openapi.json
- 源码：https://github.com/langgenius/mosoo
`;
const HOMEPAGE_MARKDOWN_JA = `# mosoo

> mosoo は、アプリケーションのバックエンドのための、オープンソースで API ファーストなマネージド Agent runtime です。OpenAI Codex、Claude Agent SDK、OpenCode、Pi を 1 つの API で実行し、Session ごとに専用の sandbox を使います。

mosoo は現在 Alpha 版で、公開 API や製品の動作は変わる可能性があります。Apache 2.0 ライセンスのオープンソースで、LangGenius, Inc. が管理しています。

- 認証：Project API キーを使います（\`Authorization: Bearer msp_...\`）。キーは 1 つのプロジェクトに紐づくバックエンド用のシークレットで、表示は一度だけ、保存されるのはハッシュのみです。ブラウザやモバイルアプリには置かないでください。
- Session の開始：\`POST https://cloud.mosoo.ai/api/v2/projects/{projectId}/threads\` に inline 設定（harness、provider、model、instructions）を送ります。Agent は作成されません。返ってきた \`thread.id\` を保存してください。
- runtime：\`openai-runtime\`（OpenAI Codex）、\`claude-agent-sdk\`（Claude Agent SDK）、\`acp-fallback\`（OpenCode）、\`pi\`（Pi）。
- 続行：\`POST /api/v2/threads/{threadId}/events\`。1 分後でも 7 日後でも意味は同じです。
- 追跡：保存済みのイベント履歴を読むか、SSE で受け取ります。Webhook はありません。
- ファイル：Agent が \`outputs/\` に書き込んだファイルは、ダウンロードできる成果物になります。
- 使用量：\`GET /api/v2/threads/{threadId}/usage\`。モデル呼び出しごとに 1 件の記録で、金額は推定値であり請求書ではありません。
- BYOK：最初の実行の前に、プロジェクトにプロバイダーキーが必要です。mosoo はモデルを提供しません。

- API クイックスタート：https://mosoo.ai/docs/ja/quickstart/
- API リファレンス v2：https://mosoo.ai/docs/ja/api-reference-v2/
- OpenAPI 3.1（v2）：https://cloud.mosoo.ai/api/v2/openapi.json
- ソースコード：https://github.com/langgenius/mosoo
`;
const HOMEPAGE_MARKDOWN_BY_PATH = {
  "/zh": { markdown: HOMEPAGE_MARKDOWN_ZH, language: "zh-CN" },
  "/ja": { markdown: HOMEPAGE_MARKDOWN_JA, language: "ja" },
};
const LLMS_MARKDOWN = `# mosoo

> mosoo is an open-source, API-first managed Agent runtime for application backends. It runs OpenAI Codex, Claude Agent SDK, OpenCode, and Pi behind one API, each Session in its own sandbox.

mosoo is in Alpha. Public APIs and product behavior may still change. It is licensed under Apache 2.0 and maintained by LangGenius, Inc.

## Direct answers

- Is mosoo hosted or open source? Both. The quickest way to try it is the hosted console at cloud.mosoo.ai. The source is Apache-2.0 on GitHub, and the README explains how to run it locally for development.
- Do I need to create an Agent first? No. On /api/v2, one request carries the harness, provider, model, instructions, and input, and mosoo starts a durable Session without creating an Agent. Saved Agent presets are optional.
- Which harnesses can a Session run? OpenAI Codex, Claude Agent SDK, OpenCode, or Pi. Each Session freezes its harness, model, and protocol, and a pair that does not match is rejected before anything runs.
- Do my provider keys enter the sandbox? No. Provider keys and MCP credentials stay outside it, and the sandbox only receives expiring grants for them. Environment variables are different: code in the sandbox can read them.
- Who pays for model usage? You do, directly. Model keys belong to your Project, and the provider bills your account. mosoo supplies no models and sets no spending cap.
- What happens when I reply days later? The same Session continues, even after its sandbox was reclaimed. mosoo restores the working directory, the native conversation, and the recorded artifacts from the last committed checkpoint. If that fails, the follow-up fails with an error.

## Call mosoo from a backend (v2)

- Authenticate with a Project API key: \`Authorization: Bearer msp_...\`. A key is a backend secret bound to one Project. It is shown once and stored only as a hash. Never put it in a browser or mobile app.
- Start a Session: \`POST https://cloud.mosoo.ai/api/v2/projects/{projectId}/threads\` with \`configuration\` \`{"type":"inline","harness":...,"provider":...,"model":...,"instructions":...}\` and optional \`input\` and \`resources\`. No Agent is created. Save the returned \`thread.id\`; it is the only handle you need.
- Harness IDs: \`openai-runtime\` (OpenAI Codex), \`claude-agent-sdk\` (Claude Agent SDK), \`acp-fallback\` (OpenCode), \`pi\` (Pi).
- Saved preset instead of inline: \`{"type":"agent","agent_id":"..."}\`. The two sources are never merged.
- Continue: \`POST /api/v2/threads/{threadId}/events\` with \`{"events":[{"type":"user_message","text":"..."}]}\`.
- Follow: \`GET /api/v2/threads/{threadId}/events\` for saved history, or \`GET /api/v2/threads/{threadId}/events/stream\` for SSE. There are no Webhooks.
- Files: upload with \`POST /api/v2/projects/{projectId}/files\`; \`GET /api/v2/threads/{threadId}/files\` lists attachments and artifacts (files the Agent wrote under \`outputs/\`).
- Usage: \`GET /api/v2/threads/{threadId}/usage\` returns one record per model call. Costs are estimates, not invoices.
- Retries: send \`Idempotency-Key\` on creation and follow-ups; it is kept for 24 hours and scoped to the Project.
- Before the first run, the Project needs a model provider key. mosoo supplies no models.

## Set up with a coding agent

- Install: \`curl -fsSL https://install.mosoo.ai/install.sh | bash\` installs the mosoo CLI and the @mosoo skill, then opens a browser sign-in.
- The user must add the model provider key at https://cloud.mosoo.ai/providers. An agent cannot create it.

## Product

- [Homepage](https://mosoo.ai/en): What mosoo is and how a backend uses it.
- [Console](https://cloud.mosoo.ai): Sign in with email or Google. The first sign-in creates a Default Project.
- [Status](https://mosoo.ai/health): Built from production Worker outcomes and Run completions.
- [Machine-readable status](https://mosoo.ai/status.json): The same data as JSON.
- [Use cases](https://mosoo.ai/en/use-cases): Projects built on mosoo.
- [Mosoo Computer](https://computer.mosoo.ai): A separate product, a persistent cloud computer for agents.

## Build and integrate

- [API quickstart (v2)](https://mosoo.ai/docs/quickstart/): Start a Session with an inline configuration and continue it.
- [Session continuity and API versions](https://mosoo.ai/docs/durable-sessions-v2/): How continuation works across turns and API versions.
- [API reference v2](https://mosoo.ai/docs/api-reference-v2/): Request and response schemas.
- [OpenAPI 3.1, v2](https://cloud.mosoo.ai/api/v2/openapi.json): Machine-readable contract for Project Sessions.
- [OpenAPI 3.1, v1](https://cloud.mosoo.ai/api/v1/openapi.json): The published-Agent contract, kept wire-compatible.
- [Pi runtime](https://mosoo.ai/docs/pi-runtime/): Run Pi with a compatible provider.
- [CLI](https://mosoo.ai/docs/cli/overview/): Install, sign in, and operate mosoo from a terminal or coding agent.
- [Documentation index for LLMs](https://mosoo.ai/docs/llms.txt)
- [Full documentation for LLMs](https://mosoo.ai/docs/llms-full.txt)

## Examples

- [Codex Pet](https://mosoo.ai/en/use-cases/codex-pet): Built by the mosoo team. An uploaded avatar comes back as a validated ZIP with all 9 Codex pet animation states, through the Thread API.
- [ghfind](https://mosoo.ai/en/use-cases/ghfind): Built by AsperforMias. A Go worker starts one Thread per public repository and renders 3 artifacts: analysis JSON, evidence JSON, and a Markdown report.

## Source and trust

- [GitHub](https://github.com/langgenius/mosoo): Source code, issues, releases, and license.
- [Product spec](https://github.com/langgenius/mosoo/blob/main/docs/SPEC.md): What mosoo promises and what it does not do.
- [Architecture](https://github.com/langgenius/mosoo/blob/main/docs/architecture.md): Engineering invariants.
- [Releases](https://github.com/langgenius/mosoo/releases): Every release is marked Alpha.
- [Incident postmortems](https://github.com/langgenius/mosoo/tree/main/docs/operations/incidents): Dated records; newer incidents are GitHub issues.
- [Security](https://github.com/langgenius/mosoo/security): The repository's Security tab. It has no security policy (SECURITY.md) yet, and private vulnerability reporting is not enabled.
- [API catalog](https://mosoo.ai/.well-known/api-catalog): Discovery links for the API, documentation, and status.
- [Blog](https://mosoo.ai/blog): Product and engineering articles.
- [Blog RSS](https://mosoo.ai/blog/rss.xml)

## Languages

- [English](https://mosoo.ai/en)
- [简体中文](https://mosoo.ai/zh)
- [日本語](https://mosoo.ai/ja)
`;
// Matches the agent-auth metadata at cloud.mosoo.ai/.well-known/oauth-authorization-server
// (langgenius/mosoo apps/web/src/worker.ts) and SPEC section 2: Project API keys
// (msp_) are the only credential the Public Thread API accepts.
const AUTH_MARKDOWN = `# mosoo auth.md: agent registration

mosoo's Public Thread API is for backend agents and server-side integrations. They call it with a Project API key.

You are an agent integrating mosoo from a trusted backend. mosoo does not support autonomous agentic registration. The account owner creates a Project API key in the console and gives it to you out of band.

## Identity boundary

- A Project API key starts with \`msp_\` and is bound to one Project. It configures Agent presets, runs Sessions and uses files in that Project, and nothing else. Requests for another Project are rejected.
- Managing the account, Projects, keys, provider credentials, MCP servers, Skills or Environments needs an account login in the console or the CLI, not a Project API key.
- A key cannot represent an end user of the integrating product. That product authenticates and authorizes its own users, and may label a Thread with an opaque userId. The label is not an access boundary.
- Keep the key on a trusted backend. Do not expose it to browsers, mobile clients, logs, or source control.

## Supported registration method: Project API key, supplied out of band

- Account registration and sign-in page (human-operated): https://cloud.mosoo.ai/login
- Credential provisioning page (human-operated): https://cloud.mosoo.ai/project-settings/api-keys
- Supported credential type: Project API key with the \`msp_\` prefix

Human-assisted registration metadata:

- \`register_uri\`: https://cloud.mosoo.ai/project-settings/api-keys (open with GET; do not POST)
- \`claim_uri\`: https://cloud.mosoo.ai/project-settings/api-keys
- \`identity_types_supported\`: \`anonymous\` (the uncredentialed agent is claimed when the account owner creates a key)
- \`credential_types_supported\`: \`mosoo_project_api_key\`
- \`revocation_uri\`: https://cloud.mosoo.ai/project-settings/api-keys

1. Sign in at https://cloud.mosoo.ai/project-settings/api-keys. The first sign-in creates a Default Project.
2. Create a Project API key and copy the msp_... value. It is shown once and stored only as a hash.
3. Store it as a backend secret, such as MOSOO_API_TOKEN.

The account owner authorizes the integration by creating this key. The key reaches only its own Project.

## Credential exchange

There is no OAuth authorization-code or token exchange. The API keys page issues the msp_... key once after the owner creates it.

## Credential use

Send the key as an HTTP Bearer credential:

~~~http
Authorization: Bearer msp_...
~~~

Legacy account tokens are rejected.

## Revocation

The owner can revoke the key from https://cloud.mosoo.ai/project-settings/api-keys. Revoking it rejects later requests but does not cancel work it already admitted.

Discovery metadata:

- Protected resource: https://cloud.mosoo.ai/.well-known/oauth-protected-resource
- Agent authentication: https://cloud.mosoo.ai/.well-known/oauth-authorization-server

These documents describe the human-assisted key flow above; they do not provide an OAuth authorization-code or token exchange.

API base (v2): https://cloud.mosoo.ai/api/v2

OpenAPI (v2): https://cloud.mosoo.ai/api/v2/openapi.json

Human documentation (v2): https://mosoo.ai/docs/api-reference-v2/

API base (v1, wire-compatible): https://cloud.mosoo.ai/api/v1

OpenAPI (v1): https://cloud.mosoo.ai/api/v1/openapi.json
`;

function redirect(url, status = 307) {
  return Response.redirect(url.toString(), status);
}

function permanentRedirect(url) {
  return redirect(url, 308);
}

function shouldDropTrailingSlash(pathname) {
  return pathname.length > 1 && pathname.endsWith("/") && !pathname.startsWith("/docs/");
}

function localeForLanguageTag(tag) {
  if (tag === "zh" || tag.startsWith("zh-")) return "zh";
  if (tag === "ja" || tag.startsWith("ja-")) return "ja";
  if (tag === "en" || tag.startsWith("en-")) return "en";
  return undefined;
}

function preferredLocale(request) {
  const prefix = `${LOCALE_COOKIE}=`;
  const locale = request.headers
    .get("cookie")
    ?.split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(prefix))
    ?.slice(prefix.length);

  if (SUPPORTED_LOCALES.has(locale)) {
    return locale;
  }

  const preferredBrowserLocale = request.headers
    .get("accept-language")
    ?.split(",")
    .map((languageRange, index) => {
      const [tag = "", ...parameters] = languageRange
        .trim()
        .toLowerCase()
        .split(";")
        .map((part) => part.trim());
      const quality = parameters.find((parameter) => parameter.startsWith("q="));
      const score = quality ? Number(quality.slice(2)) : 1;
      return { index, locale: localeForLanguageTag(tag), score };
    })
    .filter((entry) => entry.locale && Number.isFinite(entry.score) && entry.score > 0)
    .sort((left, right) => right.score - left.score || left.index - right.index)[0]?.locale;

  if (preferredBrowserLocale) return preferredBrowserLocale;
  return "en";
}

function localeRedirect(request, url, subpath = "") {
  url.pathname = `/${preferredLocale(request)}${subpath}`;
  return new Response(null, {
    status: 307,
    headers: {
      "cache-control": "private, no-store",
      "content-signal": CONTENT_SIGNAL,
      link: DISCOVERY_LINK_HEADER,
      location: url.toString(),
      vary: subpath === "" ? "Cookie, Accept, Accept-Language" : "Cookie, Accept-Language",
    },
  });
}

function withPath(request, pathname) {
  const url = new URL(request.url);
  url.pathname = pathname;
  return new Request(url.toString(), request);
}

function isConsolePath(pathname) {
  return (
    pathname === "/login" ||
    pathname === "/onboarding" ||
    pathname === "/apps" ||
    pathname.startsWith("/apps/") ||
    pathname === "/threads" ||
    pathname.startsWith("/threads/") ||
    pathname === "/agent" ||
    pathname.startsWith("/agent/") ||
    pathname === "/providers" ||
    pathname === "/settings" ||
    pathname.startsWith("/settings/") ||
    pathname === "/app-settings" ||
    pathname.startsWith("/app-settings/") ||
    pathname === "/files" ||
    pathname === "/environment" ||
    pathname.startsWith("/environment/")
  );
}

function isLegacyDocsRootPath(pathname) {
  return (
    pathname === "/quickstart" ||
    pathname.startsWith("/quickstart/") ||
    pathname === "/auth-and-access" ||
    pathname.startsWith("/auth-and-access/") ||
    pathname === "/coding-agents" ||
    pathname.startsWith("/coding-agents/") ||
    pathname === "/api-reference" ||
    pathname.startsWith("/api-reference/") ||
    pathname === "/cli" ||
    pathname.startsWith("/cli/") ||
    pathname === "/zh-Hans" ||
    pathname.startsWith("/zh-Hans/") ||
    pathname === "/llms-full.txt" ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/images/") ||
    pathname.startsWith("/favicons/")
  );
}

function canonicalLegacyDocsPathname(pathname) {
  const docsPathname = `/docs${pathname}`;
  const lastSegment = docsPathname.split("/").at(-1) ?? "";
  const isFile = lastSegment.includes(".");
  const isAsset =
    docsPathname.startsWith("/docs/_next/") ||
    docsPathname.startsWith("/docs/images/") ||
    docsPathname.startsWith("/docs/favicons/");

  if (!docsPathname.endsWith("/") && !isFile && !isAsset) {
    return `${docsPathname}/`;
  }

  return docsPathname;
}

function isHomepage(pathname) {
  return pathname === "/" || pathname === "/en" || pathname === "/zh" || pathname === "/ja";
}

function acceptsMarkdown(request) {
  return (
    request.headers
      .get("accept")
      ?.split(",")
      .some((mediaRange) => {
        const [type, ...parameters] = mediaRange
          .toLowerCase()
          .split(";")
          .map((part) => part.trim());
        const quality = parameters.find((parameter) => parameter.startsWith("q="));
        return type === "text/markdown" && (quality === undefined || Number(quality.slice(2)) > 0);
      }) ?? false
  );
}

function methodNotAllowed() {
  return new Response("Method not allowed", {
    headers: { allow: "GET, HEAD" },
    status: 405,
  });
}

function homepageMarkdown(request, pathname) {
  const { markdown, language } = HOMEPAGE_MARKDOWN_BY_PATH[pathname] ?? {
    markdown: HOMEPAGE_MARKDOWN,
    language: "en",
  };
  return new Response(request.method === "HEAD" ? null : markdown, {
    headers: {
      "content-language": language,
      "content-signal": CONTENT_SIGNAL,
      "content-type": "text/markdown; charset=utf-8",
      link: DISCOVERY_LINK_HEADER,
      vary: "Accept",
    },
  });
}

function llmsMarkdownResponse(request) {
  return new Response(request.method === "HEAD" ? null : LLMS_MARKDOWN, {
    headers: {
      "content-signal": CONTENT_SIGNAL,
      "content-type": "text/markdown; charset=utf-8",
      link: DISCOVERY_LINK_HEADER,
    },
  });
}

function apiCatalogResponse(request) {
  return new Response(request.method === "HEAD" ? null : `${JSON.stringify(API_CATALOG, null, 2)}\n`, {
    headers: {
      "content-type":
        'application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"',
      link: API_CATALOG_LINK,
    },
  });
}

function authMarkdownResponse(request) {
  return new Response(request.method === "HEAD" ? null : AUTH_MARKDOWN, {
    headers: {
      "content-signal": CONTENT_SIGNAL,
      "content-type": "text/markdown; charset=utf-8",
      link: DISCOVERY_LINK_HEADER,
    },
  });
}

function withDiscoveryHeaders(response, varyAccept = false) {
  if (!response.headers.get("content-type")?.includes("text/html")) return response;

  const headers = new Headers(response.headers);
  headers.set("content-signal", CONTENT_SIGNAL);
  headers.append("link", DISCOVERY_LINK_HEADER);
  if (varyAccept) headers.append("vary", "Accept");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

async function blogNotFound(request, env) {
  const notFound = await env.ASSETS.fetch(withPath(request, "/blog/404"));
  if (notFound.status === 404) {
    return new Response("Not found", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  const body = await notFound.arrayBuffer();
  return new Response(body, {
    status: 404,
    statusText: "Not Found",
    headers: notFound.headers,
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const forceHttps = url.protocol === "http:";
    const dropTrailingSlash = shouldDropTrailingSlash(pathname);

    if (forceHttps) url.protocol = "https:";
    if (dropTrailingSlash) url.pathname = pathname.slice(0, -1);

    const oldStatusPath = url.pathname.match(/^\/(?:(en|zh|ja)\/)?status$/);
    if (oldStatusPath || url.pathname === "/en/health") {
      const locale = oldStatusPath?.[1] ?? "en";
      url.pathname = locale === "en" ? "/health" : `/${locale}/health`;
      return permanentRedirect(url);
    }

    const healthPath = url.pathname.match(/^\/(?:(zh|ja)\/)?health$/);
    if (healthPath) {
      if (forceHttps || dropTrailingSlash) return permanentRedirect(url);
      const assetUrl = new URL(url);
      assetUrl.pathname = `/${healthPath[1] ?? "en"}/status`;
      return env.ASSETS.fetch(new Request(assetUrl, request));
    }

    if (!forceHttps && !dropTrailingSlash && pathname === "/.well-known/oauth-protected-resource") {
      if (request.method !== "GET" && request.method !== "HEAD") return methodNotAllowed();
      return redirect(PROTECTED_RESOURCE_METADATA);
    }

    if (!forceHttps && !dropTrailingSlash && pathname === "/.well-known/api-catalog") {
      if (request.method !== "GET" && request.method !== "HEAD") return methodNotAllowed();
      return apiCatalogResponse(request);
    }

    if (!forceHttps && !dropTrailingSlash && pathname === "/auth.md") {
      if (request.method !== "GET" && request.method !== "HEAD") return methodNotAllowed();
      return authMarkdownResponse(request);
    }

    if (!forceHttps && !dropTrailingSlash && pathname === "/llms.txt") {
      if (request.method !== "GET" && request.method !== "HEAD") return methodNotAllowed();
      return llmsMarkdownResponse(request);
    }

    if (
      !forceHttps &&
      !dropTrailingSlash &&
      isHomepage(pathname) &&
      acceptsMarkdown(request) &&
      (request.method === "GET" || request.method === "HEAD")
    ) {
      return homepageMarkdown(request, pathname);
    }

    if (pathname === "/") {
      return localeRedirect(request, url);
    }

    // Bare /pricing is a geo-aware entry point, mirroring "/"; the canonical
    // localized pages live at /en/pricing, /zh/pricing, and /ja/pricing.
    if (pathname === "/pricing") {
      return localeRedirect(request, url, "/pricing");
    }

    if (pathname === "/use-cases" || pathname.startsWith("/use-cases/")) {
      return localeRedirect(request, url, dropTrailingSlash ? pathname.slice(0, -1) : pathname);
    }

    if (pathname === "/status.json") {
      if (request.method !== "GET" && request.method !== "HEAD") {
        return methodNotAllowed();
      }
      return statusJsonResponse(env);
    }

    if (isConsolePath(pathname)) {
      url.hostname = new URL(CONSOLE_ORIGIN).hostname;
      return redirect(url);
    }

    if (pathname === "/blogs" || pathname === "/blogs/") {
      url.pathname = "/blog";
      return permanentRedirect(url);
    }

    if (pathname.startsWith("/blogs/")) {
      url.pathname = `/blog/${pathname.slice("/blogs/".length).replace(/\/$/, "")}`;
      return permanentRedirect(url);
    }

    if (pathname === "/docs") {
      url.pathname = "/docs/";
      return permanentRedirect(url);
    }

    if (isLegacyDocsRootPath(pathname)) {
      url.pathname = canonicalLegacyDocsPathname(pathname);
      return permanentRedirect(url);
    }

    if (forceHttps || dropTrailingSlash) {
      return permanentRedirect(url);
    }

    const asset = await env.ASSETS.fetch(request);
    if (asset.status !== 404) {
      return withDiscoveryHeaders(asset, isHomepage(pathname));
    }

    if (pathname === "/blog/" || pathname.startsWith("/blog/")) {
      return blogNotFound(request, env);
    }

    if (pathname === "/docs/" || pathname.startsWith("/docs/")) {
      return asset;
    }

    return new Response("Not found", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  },
  tail(events, env, ctx) {
    ctx.waitUntil(recordStatusTailEvents(env, events));
  },
};
