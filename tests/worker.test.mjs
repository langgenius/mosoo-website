import assert from "node:assert/strict";
import test from "node:test";

import worker from "../src/worker.js";

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

function requestFor(pathname, { cookie, country, countryHeader } = {}) {
  const headers = new Headers();
  if (cookie) headers.set("cookie", cookie);
  if (countryHeader) headers.set("CF-IPCountry", countryHeader);
  const request = new Request(`https://mosoo.ai${pathname}`, { headers });
  if (country) Object.defineProperty(request, "cf", { value: { country } });
  return request;
}

test("worker selects the landing locale by cookie, then country", async () => {
  const cases = [
    { pathname: "/?ref=launch", cookie: "mosoo_locale=ja", country: "CN", locale: "ja" },
    { pathname: "/", cookie: "mosoo_locale=invalid", country: "CN", locale: "zh" },
    { pathname: "/", country: "JP", locale: "ja" },
    { pathname: "/", country: "US", countryHeader: "CN", locale: "en" },
    { pathname: "/", countryHeader: "CN", locale: "zh" },
    { pathname: "/", country: "US", locale: "en" },
    { pathname: "/", locale: "en" },
  ];

  for (const entry of cases) {
    const response = await worker.fetch(requestFor(entry.pathname, entry), envFor({}));
    const suffix = entry.pathname.includes("?") ? "?ref=launch" : "";

    assert.equal(response.status, 307);
    assert.equal(response.headers.get("location"), `https://mosoo.ai/${entry.locale}${suffix}`);
    assert.equal(response.headers.get("cache-control"), "private, no-store");
    assert.equal(response.headers.get("vary"), "Cookie, Accept");
  }
});

test("worker redirects bare /pricing to the locale pricing page", async () => {
  const cases = [
    { pathname: "/pricing", cookie: "mosoo_locale=ja", country: "CN", locale: "ja" },
    { pathname: "/pricing", country: "JP", locale: "ja" },
    { pathname: "/pricing", countryHeader: "CN", locale: "zh" },
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
    assert.equal(response.headers.get("vary"), "Cookie");
  }
});

test("worker redirects bare /status to the locale status page", async () => {
  const response = await worker.fetch(
    requestFor("/status?ref=incident", { cookie: "mosoo_locale=zh" }),
    envFor({}),
  );

  assert.equal(response.status, 307);
  assert.equal(response.headers.get("location"), "https://mosoo.ai/zh/status?ref=incident");
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

test("worker publishes an unknown status feed before the first canary", async () => {
  const response = await worker.fetch(requestFor("/status.json"), envFor({}));
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.equal(payload.status, "unknown");
  assert.deepEqual(
    payload.components.map((component) => component.id),
    ["openai-runtime", "claude-agent-sdk", "acp-fallback"],
  );
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
  assert.match(link, /<\/docs\/llms\.txt>; rel="llms-txt"/);
  assert.match(link, /<\/docs\/llms-full\.txt>; rel="llms-full-txt"/);
  assert.match(link, /<\/\.well-known\/api-catalog>; rel="api-catalog"/);
  assert.match(link, /rel="service-desc"/);
  assert.match(link, /rel="service-doc"/);
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
  assert.match(markdown, /^# Mosoo$/m);
  assert.match(markdown, /https:\/\/cloud\.mosoo\.ai\/api\/v1/);
  assert.match(markdown, /https:\/\/mosoo\.ai\/docs\/llms\.txt/);
  assert.doesNotMatch(markdown, /<html/i);

  const declined = await worker.fetch(
    new Request("https://mosoo.ai/", { headers: { accept: "text/markdown;q=0" } }),
    envFor({}),
  );
  assert.equal(declined.status, 307);
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
  const [entry] = catalog.linkset;

  assert.match(catalogResponse.headers.get("content-type"), /^application\/linkset\+json/);
  assert.equal(entry.anchor, "https://cloud.mosoo.ai/api/v1");
  assert.equal(entry["service-desc"][0].href, "https://cloud.mosoo.ai/api/v1/openapi.json");
  assert.equal(entry["service-doc"][0].href, "https://mosoo.ai/docs/api-reference/");
  assert.equal(entry.status[0].href, "https://cloud.mosoo.ai/api/health");

  const authResponse = await worker.fetch(new Request("https://mosoo.ai/auth.md"), envFor({}));
  const auth = await authResponse.text();

  assert.equal(authResponse.headers.get("content-type"), "text/markdown; charset=utf-8");
  assert.match(auth, /^# .*auth\.md/m);
  assert.match(auth, /You are an agent/);
  assert.match(auth, /agentic registration/);
  assert.match(auth, /issued by the Mosoo App owner out of band/);
  assert.match(auth, /Supported registration method: Personal Access Token/);
  assert.match(auth, /Credential provisioning endpoint \(human-operated\)/);
  assert.match(auth, /register_uri/);
  assert.match(auth, /identity_types_supported\`: \`anonymous\`/);
  assert.match(auth, /credential_types_supported\`: \`mosoo_personal_access_token\`/);
  assert.match(auth, /revocation_uri/);
  assert.match(auth, /https:\/\/cloud\.mosoo\.ai\/login/);
  assert.match(auth, /https:\/\/cloud\.mosoo\.ai\/settings\/access-tokens/);
  assert.match(auth, /Authorization: Bearer mst_\.\.\./);
  assert.match(auth, /cloud\.mosoo\.ai\/\.well-known\/oauth-protected-resource/);
  assert.match(auth, /cloud\.mosoo\.ai\/\.well-known\/oauth-authorization-server/);
  assert.doesNotMatch(auth, /does not currently publish/);
  assert.match(auth, /API base: https:\/\/cloud\.mosoo\.ai\/api\/v1/);
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

test("worker redirects llms entrypoints to the docs app", async () => {
  for (const [from, to] of [
    ["/llms.txt", "/docs/llms.txt"],
    ["/llms-full.txt", "/docs/llms-full.txt"],
  ]) {
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
  assert.equal(response.headers.get("location"), "https://mosoo.ai/docs/quickstart");
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
