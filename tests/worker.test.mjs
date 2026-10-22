import assert from "node:assert/strict";
import test from "node:test";

import { homeFaq } from "../scripts/landing-home.mjs";
import worker from "../src/worker.js";

// Narrative the main repo retired: App owners, publishing before calling,
// self-hosting claims, Channels, legacy mst_ tokens, workflow comparisons.
const RETIRED_NARRATIVE =
  /App-owner|App owner|Publish an Agent|already published|self-host|Self-host|\bChannels\b|mst_|Personal Access Token|Dify|n8n|coding agents into products/;

function envFor(paths) {
  return {
    ASSETS: {
      async fetch(request) {
        const pathname = new URL(request.url).pathname;
        if (Object.hasOwn(paths, pathname)) return new Response(paths[pathname]);
        return new Response("missing", { status: 404 });
      },
    },
  };
}

function requestFor(pathname, { acceptLanguage, cookie, country, countryHeader } = {}) {
  const headers = new Headers();
  if (cookie) headers.set("cookie", cookie);
  if (acceptLanguage) headers.set("accept-language", acceptLanguage);
  if (countryHeader) headers.set("CF-IPCountry", countryHeader);
  const request = new Request(`https://mosoo.ai${pathname}`, { headers });
  if (country) Object.defineProperty(request, "cf", { value: { country } });
  return request;
}

test("worker selects the landing locale by cookie, then browser language", async () => {
  const cases = [
    {
      pathname: "/?ref=launch",
      acceptLanguage: "zh-CN,zh;q=0.9",
      cookie: "mosoo_locale=ja",
      locale: "ja",
    },
    {
      pathname: "/",
      acceptLanguage: "zh-CN,zh;q=0.9,en;q=0.5",
      cookie: "mosoo_locale=invalid",
      locale: "zh",
    },
    { pathname: "/", acceptLanguage: "fr-FR,ja-JP;q=0.7", locale: "ja" },
    { pathname: "/", acceptLanguage: "ja;q=0,zh;q=0.8,en;q=0.6", locale: "zh" },
    { pathname: "/", country: "JP", countryHeader: "CN", locale: "en" },
    { pathname: "/", country: "US", locale: "en" },
    { pathname: "/", locale: "en" },
  ];

  for (const entry of cases) {
    const response = await worker.fetch(requestFor(entry.pathname, entry), envFor({}));
    const suffix = entry.pathname.includes("?") ? "?ref=launch" : "";

    assert.equal(response.status, 307);
    assert.equal(response.headers.get("location"), `https://mosoo.ai/${entry.locale}${suffix}`);
    assert.equal(response.headers.get("cache-control"), "private, no-store");
    assert.equal(response.headers.get("vary"), "Cookie, Accept, Accept-Language");
  }
});

test("worker redirects bare /pricing to the locale pricing page without GeoIP", async () => {
  const cases = [
    { pathname: "/pricing", cookie: "mosoo_locale=ja", country: "CN", locale: "ja" },
    { pathname: "/pricing", acceptLanguage: "ja-JP,ja;q=0.9", locale: "ja" },
    { pathname: "/pricing", acceptLanguage: "zh-CN,zh;q=0.9", locale: "zh" },
    { pathname: "/pricing", country: "JP", countryHeader: "CN", locale: "en" },
    { pathname: "/pricing?ref=launch", locale: "en" },
  ];

  for (const entry of cases) {
    const response = await worker.fetch(requestFor(entry.pathname, entry), envFor({}));
    const suffix = entry.pathname.includes("?") ? "?ref=launch" : "";

    assert.equal(response.status, 307);
    assert.equal(
      response.headers.get("location"),
      `https://mosoo.ai/${entry.locale}/pricing${suffix}`,
    );
    assert.equal(response.headers.get("cache-control"), "private, no-store");
    assert.equal(response.headers.get("vary"), "Cookie, Accept-Language");
  }
});

test("worker redirects bare /status to /health", async () => {
  const response = await worker.fetch(
    requestFor("/status?ref=incident", { cookie: "mosoo_locale=zh" }),
    envFor({}),
  );

  assert.equal(response.status, 308);
  assert.equal(response.headers.get("location"), "https://mosoo.ai/health?ref=incident");
});

test("worker redirects bare use-cases paths to the locale pages", async () => {
  const cases = [
    { pathname: "/use-cases", location: "https://mosoo.ai/zh/use-cases" },
    { pathname: "/use-cases/", location: "https://mosoo.ai/zh/use-cases" },
    { pathname: "/use-cases/codex-pet", location: "https://mosoo.ai/zh/use-cases/codex-pet" },
  ];

  for (const entry of cases) {
    const response = await worker.fetch(
      requestFor(entry.pathname, { cookie: "mosoo_locale=zh" }),
      envFor({}),
    );

    assert.equal(response.status, 307);
    assert.equal(response.headers.get("location"), entry.location);
  }
});

test("worker does not forward the removed deployments route to the console", async () => {
  const response = await worker.fetch(requestFor("/deployments"), envFor({}));

  assert.equal(response.status, 404);
  assert.equal(response.headers.get("location"), null);
});

test("worker publishes an unknown status feed before the first production signal", async () => {
  const response = await worker.fetch(requestFor("/status.json"), envFor({}));
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.equal(payload.status, "unknown");
  assert.deepEqual(
    payload.components.map((component) => component.id),
    ["openai-runtime", "claude-agent-sdk", "acp-fallback", "pi"],
  );
  assert.ok(payload.components.every((component) => component.status === "unknown"));
});

test("worker forwards Cloudflare Tail batches to the existing status store", async () => {
  const writes = [];
  const env = {
    STATUS_STORE: {
      get() {
        return {
          async fetch(_request, init) {
            writes.push(JSON.parse(init.body));
            return Response.json({ ok: true });
          },
        };
      },
      idFromName(name) {
        return name;
      },
    },
  };

  const pending = [];
  worker.tail(
    [
      {
        event: { response: { status: 200 } },
        eventTimestamp: Date.parse("2026-08-13T12:00:00.000Z"),
        logs: [],
        outcome: "ok",
      },
    ],
    env,
    { waitUntil: (promise) => pending.push(promise) },
  );
  await Promise.all(pending);

  assert.equal(writes.length, 1);
  assert.deepEqual(writes[0].events[0], {
    httpStatus: 200,
    observedAt: "2026-08-13T12:00:00.000Z",
    outcome: "ok",
    succeeded: true,
    type: "invocation",
  });
});

test("worker serves localized pricing pages from assets", async () => {
  const response = await worker.fetch(
    new Request("https://mosoo.ai/en/pricing"),
    envFor({ "/en/pricing": "pricing page" }),
  );

  assert.equal(response.status, 200);
  assert.equal(await response.text(), "pricing page");
});

test("worker advertises agent discovery resources from HTML assets", async () => {
  const response = await worker.fetch(
    new Request("https://mosoo.ai/blog"),
    {
      ASSETS: {
        async fetch() {
          return new Response("<!doctype html><html></html>", {
            headers: { "content-type": "text/html; charset=utf-8" },
          });
        },
      },
    },
  );

  const link = response.headers.get("link");
  assert.match(link, /<\/llms\.txt>; rel="llms-txt"/);
  assert.match(link, /<\/docs\/llms-full\.txt>; rel="llms-full-txt"/);
  assert.match(link, /<\/\.well-known\/api-catalog>; rel="api-catalog"/);
  assert.match(link, /rel="service-desc"/);
  assert.match(link, /rel="service-doc"/);
  assert.match(
    link,
    /<https:\/\/cloud\.mosoo\.ai\/api\/v2\/openapi\.json>; rel="service-desc"; type="application\/json"/,
  );
  assert.match(
    link,
    /<https:\/\/mosoo\.ai\/docs\/api-reference-v2\/>; rel="service-doc"; type="text\/html"/,
  );
  assert.match(
    link,
    /<https:\/\/cloud\.mosoo\.ai\/api\/v1\/openapi\.json>; rel="service-desc"; type="application\/json"/,
  );
  assert.match(link, /<\/auth\.md>; rel="describedby"/);
  assert.equal(response.headers.get("content-signal"), "ai-train=no, search=yes, ai-input=yes");
});

test("worker negotiates homepage HTML to clean Markdown", async () => {
  const response = await worker.fetch(
    new Request("https://mosoo.ai/en", { headers: { accept: "text/markdown" } }),
    envFor({}),
  );

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("content-type"), "text/markdown; charset=utf-8");
  assert.match(response.headers.get("vary"), /Accept/);
  const markdown = await response.text();
  assert.match(markdown, /^# mosoo$/m);
  assert.match(
    markdown,
    /mosoo is an open-source, API-first managed Agent runtime for application backends\./,
  );
  assert.match(markdown, /OpenAI Codex, Claude Agent SDK, OpenCode, and Pi behind one API/);
  assert.match(markdown, /mosoo is in Alpha\./);
  // The home's claim (round 3c, staging v5/round3/review/seo-geo.md SG-17): the agent from your laptop is saved as an
  // Agent preset (docs "Save an Agent preset"), and a Session starts from that preset or inline; an inline Session
  // needs no saved Agent but carries no Skills or MCP servers (MAIN docs/prd/public-thread-api-surface.md L8, L25).
  assert.match(
    markdown,
    /save its harness, model, instructions, Skills, remote MCP servers and pinned npm\/PyPI packages as an Agent preset \(https:\/\/mosoo\.ai\/docs\/first-agent\/\)\. Nothing syncs from your laptop\./,
  );
  assert.match(
    markdown,
    /POST https:\/\/cloud\.mosoo\.ai\/api\/v2\/projects\/\{projectId\}\/threads with a Project API key \(msp_\) and the preset \(\{"type":"agent","agent_id":"\.\.\."\}\), or with an inline configuration, which needs no saved Agent but carries no Skills or MCP servers\./,
  );
  assert.doesNotMatch(markdown, /No Agent is required/);
  assert.match(markdown, /POST \/api\/v2\/threads\/\{threadId\}\/events/);
  assert.match(markdown, /Follow events over SSE\. There are no Webhooks\./);
  assert.match(markdown, /Bring your own model provider key\. mosoo supplies no models\./);
  assert.match(markdown, /https:\/\/mosoo\.ai\/docs\/quickstart\//);
  assert.match(markdown, /https:\/\/cloud\.mosoo\.ai\/api\/v2\/openapi\.json/);
  assert.match(markdown, /https:\/\/mosoo\.ai\/llms\.txt/);
  assert.match(markdown, /https:\/\/mosoo\.ai\/docs\/llms\.txt/);
  assert.match(markdown, /https:\/\/github\.com\/langgenius\/mosoo/);
  assert.doesNotMatch(markdown, RETIRED_NARRATIVE);
  assert.doesNotMatch(markdown, /\bMosoo\b/);
  assert.doesNotMatch(markdown, /<html/i);

  const declined = await worker.fetch(
    new Request("https://mosoo.ai/", { headers: { accept: "text/markdown;q=0" } }),
    envFor({}),
  );
  assert.equal(declined.status, 307);
});

test("worker answers localized homepages with Markdown in their language", async () => {
  const cases = [
    {
      pathname: "/",
      language: "en",
      text: /^mosoo is an open-source, API-first managed Agent runtime/m,
      preset: "https://mosoo.ai/docs/first-agent/",
    },
    {
      pathname: "/en",
      language: "en",
      text: /POST https:\/\/cloud\.mosoo\.ai\/api\/v2\/projects/,
      preset: "https://mosoo.ai/docs/first-agent/",
    },
    {
      pathname: "/zh",
      language: "zh-CN",
      text: /^> mosoo 是开源、API 优先的托管 Agent runtime，面向应用后端。/m,
      docs: "https://mosoo.ai/docs/zh-Hans/quickstart/",
      preset: "https://mosoo.ai/docs/zh-Hans/first-agent/",
    },
    {
      pathname: "/ja",
      language: "ja",
      text: /^> mosoo は、アプリケーションのバックエンドのための、オープンソースで API ファーストなマネージド Agent runtime です。/m,
      docs: "https://mosoo.ai/docs/ja/quickstart/",
      preset: "https://mosoo.ai/docs/ja/first-agent/",
    },
  ];

  for (const entry of cases) {
    const response = await worker.fetch(
      new Request(`https://mosoo.ai${entry.pathname}`, { headers: { accept: "text/markdown" } }),
      envFor({}),
    );
    const markdown = await response.text();

    assert.equal(response.status, 200);
    assert.equal(response.headers.get("content-type"), "text/markdown; charset=utf-8");
    assert.equal(response.headers.get("content-language"), entry.language);
    assert.match(response.headers.get("vary"), /Accept/);
    assert.match(markdown, /^# mosoo$/m);
    assert.match(markdown, entry.text);
    assert.match(markdown, /msp_/);
    assert.match(markdown, /https:\/\/cloud\.mosoo\.ai\/api\/v2\/openapi\.json/);
    if (entry.docs) assert.ok(markdown.includes(entry.docs), `${entry.pathname} links ${entry.docs}`);
    // Each language links its own "Save an Agent preset" page and names the preset as a configuration source.
    assert.ok(markdown.includes(entry.preset), `${entry.pathname} links ${entry.preset}`);
    assert.ok(markdown.includes('{"type":"agent","agent_id":"..."}'), `${entry.pathname} shows the preset source`);
    assert.doesNotMatch(markdown, RETIRED_NARRATIVE);
    assert.doesNotMatch(markdown, /\bMosoo\b/);
  }
});

test("worker serves a product-wide llms.txt index", async () => {
  const response = await worker.fetch(new Request("https://mosoo.ai/llms.txt"), envFor({}));
  const markdown = await response.text();

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("content-type"), "text/markdown; charset=utf-8");
  assert.equal(response.headers.get("content-signal"), "ai-train=no, search=yes, ai-input=yes");
  assert.match(markdown, /^# mosoo$/m);
  assert.match(
    markdown,
    /^> mosoo is an open-source, API-first managed Agent runtime for application backends\./m,
  );
  for (const heading of [
    "Direct answers",
    "Call mosoo from a backend (v2)",
    "Set up with a coding agent",
    "Product",
    "Build and integrate",
    "Examples",
    "Source and trust",
    "Languages",
  ]) {
    assert.ok(markdown.includes(`\n## ${heading}\n`), `llms.txt has the ${heading} section`);
  }
  assert.match(markdown, /mosoo is in Alpha\. Public APIs and product behavior may still change\./);
  assert.match(markdown, /Authorization: Bearer msp_\.\.\./);
  assert.match(markdown, /POST https:\/\/cloud\.mosoo\.ai\/api\/v2\/projects\/\{projectId\}\/threads/);
  assert.match(markdown, /No Agent is created\./);
  for (const harness of ["openai-runtime", "claude-agent-sdk", "acp-fallback", "pi"]) {
    assert.ok(markdown.includes(`\`${harness}\``), `llms.txt names the ${harness} harness`);
  }
  assert.match(markdown, /GET \/api\/v2\/threads\/\{threadId\}\/events\/stream` for SSE\. There are no Webhooks\./);
  assert.match(markdown, /curl -fsSL https:\/\/install\.mosoo\.ai\/install\.sh \| bash/);
  for (const url of [
    "https://mosoo.ai/docs/quickstart/",
    "https://mosoo.ai/docs/first-agent/",
    "https://mosoo.ai/docs/api-reference-v2/",
    "https://cloud.mosoo.ai/api/v2/openapi.json",
    "https://cloud.mosoo.ai/api/v1/openapi.json",
    "https://github.com/langgenius/mosoo",
    "https://github.com/langgenius/mosoo/blob/main/docs/SPEC.md",
    "https://github.com/langgenius/mosoo/security",
    "https://computer.mosoo.ai",
    "https://mosoo.ai/en/use-cases/ghfind",
    "https://mosoo.ai/docs/llms.txt",
  ]) {
    assert.ok(markdown.includes(`(${url})`), `llms.txt links ${url}`);
  }
  assert.doesNotMatch(markdown, RETIRED_NARRATIVE);
  // The brand is lowercase, the second product's name too (owner 2026-10-20 21:57: 「mosoo computer 一律小写」).
  assert.doesNotMatch(markdown, /\bMosoo\b/);
  assert.match(markdown, /\[mosoo computer\]\(https:\/\/computer\.mosoo\.ai\)/);
  assert.doesNotMatch(markdown, /<html/i);

  const head = await worker.fetch(
    new Request("https://mosoo.ai/llms.txt", { method: "HEAD" }),
    envFor({}),
  );
  assert.equal(head.status, 200);
  assert.equal(await head.text(), "");
});

// llms.txt is a superset of the page FAQ (staging REVIEW-v4 §6.11): the six answers the English home shows come
// first, verbatim and in order; after them stay the answers the page has no room for, each one stated in MAIN
// docs/SPEC.md (§4 L39-L42 turn limits, §6 L73-L75 events and files, §6 L74 retries, §6 L70 + README L39 / L78).
test("llms.txt direct answers start with the English home FAQ, then keep the answers the page leaves out", async () => {
  const response = await worker.fetch(new Request("https://mosoo.ai/llms.txt"), envFor({}));
  const markdown = await response.text();
  const section = markdown.split("\n## Direct answers\n\n")[1]?.split("\n\n## ")[0] ?? "";
  const lines = section.split("\n");
  // llms.txt keeps ASCII apostrophes for plain-text readers; the page uses curly ones.
  const faq = homeFaq("en").map(({ q, a }) => `- ${q} ${a}`.replaceAll("’", "'"));

  assert.deepEqual(lines.slice(0, faq.length), faq, "the page FAQ, verbatim and in order");
  const extra = lines.slice(faq.length);
  assert.ok(extra.every((line) => /^- .+\? .+/.test(line)), "every further line is a question and its answer");
  for (const [topic, pattern] of [
    ["the two-hour turn limit", /Up to two hours\..*run\.time_limit_exceeded.*runtime\.capacity_exhausted/],
    ["retries with Idempotency-Key", /Idempotency-Key header\. For 24 hours, .*exactly-once\./],
    ["SSE and outputs/", /SSE stream .*outputs\/ become downloadable artifacts\. There are no Webhooks\./],
    ["Alpha and /api/v1 compatibility", /It is in Alpha.*\/api\/v1 stays wire-compatible/],
  ]) {
    assert.ok(extra.some((line) => pattern.test(line)), `llms.txt still answers ${topic}`);
  }
});

test("worker publishes the Public Thread API catalog and self-contained auth guide", async () => {
  const protectedResourceResponse = await worker.fetch(
    new Request("https://mosoo.ai/.well-known/oauth-protected-resource"),
    envFor({}),
  );
  assert.equal(protectedResourceResponse.status, 307);
  assert.equal(
    protectedResourceResponse.headers.get("location"),
    "https://cloud.mosoo.ai/.well-known/oauth-protected-resource",
  );

  const catalogResponse = await worker.fetch(
    new Request("https://mosoo.ai/.well-known/api-catalog"),
    envFor({}),
  );
  const catalog = await catalogResponse.json();
  const [v2, v1] = catalog.linkset;

  assert.match(catalogResponse.headers.get("content-type"), /^application\/linkset\+json/);
  assert.equal(catalog.linkset.length, 2);
  assert.equal(v2.anchor, "https://cloud.mosoo.ai/api/v2");
  assert.equal(v2["service-desc"][0].href, "https://cloud.mosoo.ai/api/v2/openapi.json");
  assert.equal(v2["service-doc"][0].href, "https://mosoo.ai/docs/api-reference-v2/");
  assert.equal(v2.status[0].href, "https://cloud.mosoo.ai/api/health");
  assert.equal(v1.anchor, "https://cloud.mosoo.ai/api/v1");
  assert.equal(v1["service-desc"][0].href, "https://cloud.mosoo.ai/api/v1/openapi.json");
  assert.equal(v1["service-doc"][0].href, "https://mosoo.ai/docs/api-reference/");
  assert.equal(v1.status[0].href, "https://cloud.mosoo.ai/api/health");

  const authResponse = await worker.fetch(new Request("https://mosoo.ai/auth.md"), envFor({}));
  const auth = await authResponse.text();

  // The same values cloud.mosoo.ai/.well-known/oauth-authorization-server
  // publishes for agent auth (langgenius/mosoo apps/web/src/worker.ts).
  assert.equal(authResponse.headers.get("content-type"), "text/markdown; charset=utf-8");
  assert.match(auth, /^# .*auth\.md/m);
  assert.match(auth, /You are an agent/);
  assert.match(auth, /agentic registration/);
  assert.match(auth, /creates a Project API key in the console and gives it to you out of band/);
  assert.match(auth, /Supported registration method: Project API key/);
  assert.match(auth, /Credential provisioning page \(human-operated\)/);
  assert.match(auth, /starts with `msp_` and is bound to one Project/);
  assert.match(
    auth,
    /`register_uri`: https:\/\/cloud\.mosoo\.ai\/project-settings\/api-keys \(open with GET; do not POST\)/,
  );
  assert.match(auth, /`claim_uri`: https:\/\/cloud\.mosoo\.ai\/project-settings\/api-keys/);
  assert.match(auth, /identity_types_supported`: `anonymous`/);
  assert.match(auth, /credential_types_supported`: `mosoo_project_api_key`/);
  assert.match(auth, /`revocation_uri`: https:\/\/cloud\.mosoo\.ai\/project-settings\/api-keys/);
  assert.match(auth, /https:\/\/cloud\.mosoo\.ai\/login/);
  assert.match(auth, /Authorization: Bearer msp_\.\.\./);
  assert.match(auth, /Legacy account tokens are rejected\./);
  assert.match(auth, /cloud\.mosoo\.ai\/\.well-known\/oauth-protected-resource/);
  assert.match(auth, /cloud\.mosoo\.ai\/\.well-known\/oauth-authorization-server/);
  assert.doesNotMatch(auth, /does not currently publish/);
  assert.match(auth, /API base \(v2\): https:\/\/cloud\.mosoo\.ai\/api\/v2/);
  assert.match(auth, /API base \(v1, wire-compatible\): https:\/\/cloud\.mosoo\.ai\/api\/v1/);
  assert.doesNotMatch(auth, RETIRED_NARRATIVE);
  assert.doesNotMatch(auth, /settings\/access-tokens/);
  assert.doesNotMatch(auth, /\bMosoo\b/);
  assert.doesNotMatch(auth, /[—–]/);
});

test("worker permanently redirects HTTP requests to HTTPS before assets", async () => {
  const response = await worker.fetch(
    new Request("http://mosoo.ai/en?ref=launch"),
    envFor({ "/en": "landing page" }),
  );

  assert.equal(response.status, 308);
  assert.equal(response.headers.get("location"), "https://mosoo.ai/en?ref=launch");
});

test("worker permanently redirects trailing-slash website URLs to canonical slashless URLs", async () => {
  for (const [from, to] of [
    ["https://mosoo.ai/en/", "https://mosoo.ai/en"],
    ["https://mosoo.ai/zh/pricing/?ref=launch", "https://mosoo.ai/zh/pricing?ref=launch"],
    ["https://mosoo.ai/blog/post/", "https://mosoo.ai/blog/post"],
  ]) {
    const response = await worker.fetch(new Request(from), envFor({}));

    assert.equal(response.status, 308);
    assert.equal(response.headers.get("location"), to);
  }
});

test("worker serves existing static assets before SPA fallback", async () => {
  for (const pathname of ["/coding-agents.md", "/mosoo-openapi.en.generated.json"]) {
    const response = await worker.fetch(
      new Request(`https://mosoo.ai${pathname}`),
      envFor({ [pathname]: pathname }),
    );

    assert.equal(response.status, 200);
    assert.equal(await response.text(), pathname);
  }
});

test("worker redirects the legacy full llms entrypoint to the docs app", async () => {
  for (const [from, to] of [["/llms-full.txt", "/docs/llms-full.txt"]]) {
    const response = await worker.fetch(new Request(`https://mosoo.ai${from}`), envFor({}));

    assert.equal(response.status, 308);
    assert.equal(response.headers.get("location"), `https://mosoo.ai${to}`);
  }
});

test("worker permanently redirects legacy extensionless docs paths", async () => {
  const response = await worker.fetch(
    new Request("https://mosoo.ai/quickstart"),
    envFor({}),
  );

  assert.equal(response.status, 308);
  assert.equal(response.headers.get("location"), "https://mosoo.ai/docs/quickstart/");
});

test("worker keeps legacy docs file and asset redirects extension-safe", async () => {
  for (const [from, to] of [
    ["/llms-full.txt", "/docs/llms-full.txt"],
    ["/_next/static/chunk.js", "/docs/_next/static/chunk.js"],
    ["/images/product/app.png", "/docs/images/product/app.png"],
  ]) {
    const response = await worker.fetch(new Request(`https://mosoo.ai${from}`), envFor({}));

    assert.equal(response.status, 308);
    assert.equal(response.headers.get("location"), `https://mosoo.ai${to}`);
  }
});

test("worker permanently redirects old blog aliases", async () => {
  const response = await worker.fetch(
    new Request("https://mosoo.ai/blogs/the-journey-begins-with-an-imagine-if/"),
    envFor({}),
  );

  assert.equal(response.status, 308);
  assert.equal(
    response.headers.get("location"),
    "https://mosoo.ai/blog/the-journey-begins-with-an-imagine-if",
  );
});

test("worker serves the slashless blog index without redirecting", async () => {
  const response = await worker.fetch(
    new Request("https://mosoo.ai/blog"),
    envFor({ "/blog": "blog index" }),
  );

  assert.equal(response.status, 200);
  assert.equal(await response.text(), "blog index");
});

test("worker returns the built blog 404 without a redirect header", async () => {
  const response = await worker.fetch(
    new Request("https://mosoo.ai/blog/missing"),
    envFor({ "/blog/404": "blog not found" }),
  );

  assert.equal(response.status, 404);
  assert.equal(response.headers.get("location"), null);
  assert.equal(await response.text(), "blog not found");
});

test("worker returns a real 404 for unknown website paths", async () => {
  const response = await worker.fetch(new Request("https://mosoo.ai/en/missing"), envFor({}));

  assert.equal(response.status, 404);
  assert.equal(response.headers.get("location"), null);
  assert.equal(response.headers.get("content-type"), "text/plain; charset=utf-8");
  assert.equal(await response.text(), "Not found");
});


test("health paths serve status assets and legacy URLs retain their locale", async () => {
  for (const locale of ["en", "zh", "ja"]) {
    const target = locale === "en" ? "/health" : `/${locale}/health`;
    for (const suffix of ["", "/"]) {
      const moved = await worker.fetch(requestFor(`/${locale}/status${suffix}?ref=old`), envFor({}));
      assert.equal(moved.status, 308);
      assert.equal(moved.headers.get("location"), `https://mosoo.ai${target}?ref=old`);
    }
    const response = await worker.fetch(requestFor(target), envFor({ [`/${locale}/status`]: `${locale} status page` }));
    assert.equal(response.status, 200);
    assert.equal(await response.text(), `${locale} status page`);
    const slash = await worker.fetch(requestFor(`${target}/`), envFor({}));
    assert.equal(slash.headers.get("location"), `https://mosoo.ai${target}`);
  }
  const en = await worker.fetch(requestFor("/en/health"), envFor({}));
  assert.equal(en.headers.get("location"), "https://mosoo.ai/health");
});
