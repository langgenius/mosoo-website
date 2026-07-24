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

test("worker serves root LLM crawler assets before SPA fallback", async () => {
  for (const pathname of ["/coding-agents.md", "/llms.txt", "/mosoo-openapi.en.generated.json"]) {
    const response = await worker.fetch(
      new Request(`https://mosoo.ai${pathname}`),
      envFor({ [pathname]: pathname }),
    );

    assert.equal(response.status, 200);
    assert.equal(await response.text(), pathname);
  }
});

test("worker still redirects legacy extensionless docs paths", async () => {
  const response = await worker.fetch(
    new Request("https://mosoo.ai/quickstart"),
    envFor({}),
  );

  assert.equal(response.status, 307);
  assert.equal(response.headers.get("location"), "https://mosoo.ai/docs/quickstart");
});
