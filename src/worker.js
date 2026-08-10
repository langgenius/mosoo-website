import { runStatusCanary, statusJsonResponse } from "./status.js";

export { StatusStore } from "./status.js";

const CONSOLE_ORIGIN = "https://cloud.mosoo.ai";
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
const DISCOVERY_LINK_HEADER = `${LLMS_LINK_HEADER}, ${API_CATALOG_LINK}, <${PUBLIC_API_DESCRIPTION}>; rel="service-desc"; type="application/json", <${PUBLIC_API_DOCUMENTATION}>; rel="service-doc"; type="text/html", </auth.md>; rel="describedby"; type="text/markdown"`;
const API_CATALOG = {
  linkset: [
    {
      anchor: PUBLIC_API_BASE,
      "service-desc": [{ href: PUBLIC_API_DESCRIPTION, type: "application/json" }],
      "service-doc": [{ href: PUBLIC_API_DOCUMENTATION, type: "text/html" }],
      status: [{ href: PUBLIC_API_STATUS, type: "application/json" }],
    },
  ],
};
const HOMEPAGE_MARKDOWN = `# Mosoo

Mosoo is an open-source platform for building and running persistent cloud Agents in isolated sandboxes.

- Public Thread API base: https://cloud.mosoo.ai/api/v1
- OpenAPI 3.1: https://cloud.mosoo.ai/api/v1/openapi.json
- API documentation: https://mosoo.ai/docs/api-reference/
- Product and content index: https://mosoo.ai/llms.txt
- Documentation index: https://mosoo.ai/docs/llms.txt
`;
const LLMS_MARKDOWN = `# Mosoo

> Mosoo is an open-source Agent runtime and API for developers extending coding agents into products and automations. It runs OpenAI Codex, Claude Agent SDK, and OpenCode in isolated sandboxes, keeps Threads and files across Runs, and is self-hostable on Cloudflare.

Mosoo is currently in alpha. The Public Thread API is designed for trusted application backends: Mosoo App-owner credentials must not be exposed to browsers or end users.

## Product

- [Homepage](https://mosoo.ai/en): Product overview and current positioning.
- [Pricing](https://mosoo.ai/en/pricing): Current cloud plans and included runtime resources.
- [Runtime status](https://mosoo.ai/en/status): Production canaries for supported runtimes.
- [Use cases](https://mosoo.ai/en/use-cases): Real products using Mosoo as their Agent backend.
- [Console](https://cloud.mosoo.ai/login): Build, test, publish, and operate Agents.

## Build and integrate

- [Documentation](https://mosoo.ai/docs/): Build, run, publish, and integrate managed Agents.
- [Documentation index for LLMs](https://mosoo.ai/docs/llms.txt): Concise index of all documentation pages.
- [Full documentation for LLMs](https://mosoo.ai/docs/llms-full.txt): Complete documentation corpus.
- [Product tour](https://mosoo.ai/docs/product-tour/): Apps, Agents, Threads, Runs, and delivery surfaces.
- [Create your first Agent](https://mosoo.ai/docs/first-agent/): Configure, test, and publish an Agent.
- [Skills and MCP servers](https://mosoo.ai/docs/skills-and-mcp/): Attach reusable instructions and authorized external tools.
- [Publish and API access](https://mosoo.ai/docs/publish-and-api-access/): Publish an Agent and enable backend access.
- [API quickstart](https://mosoo.ai/docs/quickstart/): Call a published Agent with curl.
- [API reference](https://mosoo.ai/docs/api-reference/): Public Thread API request and response schemas.
- [CLI](https://mosoo.ai/docs/cli/overview/): Install, authenticate, inspect, and operate Mosoo from a terminal or coding agent.

## Examples

- [Blueprint](https://mosoo.ai/en/use-cases/blueprint): A site builder backed by a published Agent.
- [PitchPilot](https://mosoo.ai/en/use-cases/pitchpilot): Long-running presentation generation surfaced as a normal web product.
- [Go Gym](https://mosoo.ai/en/use-cases/go-gym): Per-user Threads created by a trusted application backend.
- [Codex Pet](https://mosoo.ai/en/use-cases/codex-pet): File-in, artifact-out generation through the Thread API.
- [ghfind](https://mosoo.ai/en/use-cases/ghfind): Deep project evaluation produced by a published Agent.

## Source and trust

- [GitHub](https://github.com/langgenius/mosoo): Source code, issues, releases, and license.
- [Security](https://github.com/langgenius/mosoo/security): Security policy and private vulnerability reporting.
- [Machine-readable status](https://mosoo.ai/status.json): Current runtime canary results.
- [Authentication guide for agents](https://mosoo.ai/auth.md): Credential and identity boundaries.
- [OpenAPI 3.1](https://cloud.mosoo.ai/api/v1/openapi.json): Machine-readable Public Thread API contract.
- [API catalog](https://mosoo.ai/.well-known/api-catalog): Discovery links for the API, documentation, and status.
- [Blog](https://mosoo.ai/blog): Product and engineering articles.
- [Blog RSS](https://mosoo.ai/blog/rss.xml): Published article feed.

## Languages

- [English](https://mosoo.ai/en)
- [简体中文](https://mosoo.ai/zh)
- [日本語](https://mosoo.ai/ja)
`;
const AUTH_MARKDOWN = `# Mosoo auth.md — Agent Registration

Mosoo's Public Thread API is for backend agents and server-side integrations operated by a Mosoo App owner.

You are an agent integrating Mosoo from a trusted backend. Mosoo does not support autonomous agentic registration today. Credentials are issued by the Mosoo App owner out of band through a human-assisted Personal Access Token flow.

## Identity boundary

- A Mosoo Personal Access Token has no selectable scopes; it carries full account access and represents the Mosoo account and App owner that created it.
- It cannot represent an App end user. The integrating product must authenticate and authorize its own users, then pass an opaque userId when it creates a Thread.
- Keep the token on a trusted backend. Do not expose it to browsers, mobile clients, logs, or source control.

## Supported registration method: Personal Access Token, supplied out of band

- Account registration and sign-in page (human-operated): https://cloud.mosoo.ai/login
- Credential provisioning endpoint (human-operated): https://cloud.mosoo.ai/settings/access-tokens
- Supported credential type: Personal Access Token with the \`mst_\` prefix

Human-assisted registration metadata:

- \`register_uri\`: https://cloud.mosoo.ai/settings/access-tokens (open with GET; do not POST)
- \`identity_types_supported\`: \`anonymous\` (the uncredentialed agent is claimed when the account owner provisions a token)
- \`credential_types_supported\`: \`mosoo_personal_access_token\`
- \`revocation_uri\`: https://cloud.mosoo.ai/settings/access-tokens

1. Sign in at https://cloud.mosoo.ai/settings/access-tokens.
2. Create an Access Token and copy the mst_... value when it is shown.
3. Store it as a backend secret, such as MOSOO_API_TOKEN.

The account owner authorizes the integration by creating this token. Tokens have no selectable scopes and carry full account access.

## Credential exchange

There is no OAuth authorization-code or token exchange. The authenticated settings page issues the mst_... token once after the owner creates it.

## Credential use

Send the token as an HTTP Bearer credential:

~~~http
Authorization: Bearer mst_...
~~~

## Revocation

The owner can revoke the token from https://cloud.mosoo.ai/settings/access-tokens. Requests using a revoked token are no longer authorized.

Discovery metadata:

- Protected resource: https://cloud.mosoo.ai/.well-known/oauth-protected-resource
- Agent authentication: https://cloud.mosoo.ai/.well-known/oauth-authorization-server

These documents describe the human-assisted PAT flow above; they do not provide an OAuth authorization-code or token exchange.

API base: https://cloud.mosoo.ai/api/v1

OpenAPI: https://cloud.mosoo.ai/api/v1/openapi.json

Human documentation: https://mosoo.ai/docs/api-reference/
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

function preferredLocale(request) {
  const prefix = `${LOCALE_COOKIE}=`;
  const locale = request.headers
    .get("cookie")
    ?.split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(prefix))
    ?.slice(prefix.length);

  if (locale === "en" || locale === "zh" || locale === "ja") {
    return locale;
  }

  const country = request.cf?.country ?? request.headers.get("CF-IPCountry");
  if (country === "CN") return "zh";
  if (country === "JP") return "ja";
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
      vary: subpath === "" ? "Cookie, Accept" : "Cookie",
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
    pathname === "/deployments" ||
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

function homepageMarkdown(request) {
  return new Response(request.method === "HEAD" ? null : HOMEPAGE_MARKDOWN, {
    headers: {
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
      return homepageMarkdown(request);
    }

    if (pathname === "/") {
      return localeRedirect(request, url);
    }

    // Bare /pricing is a geo-aware entry point, mirroring "/"; the canonical
    // localized pages live at /en/pricing, /zh/pricing, and /ja/pricing.
    if (pathname === "/pricing") {
      return localeRedirect(request, url, "/pricing");
    }

    if (pathname === "/status") {
      return localeRedirect(request, url, "/status");
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
      url.pathname = `/docs${pathname}`;
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
  async scheduled(controller, env) {
    await runStatusCanary(env, controller.scheduledTime);
  },
};
