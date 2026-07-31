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
    assert.equal(response.headers.get("vary"), "Cookie");
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

test("worker advertises answer-engine docs from HTML assets", async () => {
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

  assert.equal(
    response.headers.get("link"),
    '</docs/llms.txt>; rel="llms-txt", </docs/llms-full.txt>; rel="llms-full-txt"',
  );
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
