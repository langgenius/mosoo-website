import assert from "node:assert/strict";
import test from "node:test";
import worker from "../src/worker.js";

test("Worker tail persists API observations and surfaces store failures", async () => {
  for (const status of [200, 503]) {
    let pending;
    const env = { STATUS_STORE: {
      idFromName(name) { assert.equal(name, "production"); return name; },
      get() { return { async fetch(url, init) {
        assert.equal(url, "https://status.internal/events");
        assert.equal(init.method, "POST");
        const { events } = JSON.parse(init.body);
        assert.equal(events[0].succeeded, true);
        return new Response(null, { status });
      } }; },
    } };
    worker.tail([{ event: { cron: "* * * * *" }, outcome: "ok" }], env,
      { waitUntil(promise) { pending = promise; } });
    assert.ok(pending instanceof Promise);
    if (status === 200) await pending;
    else await assert.rejects(pending, /Status store rejected Tail events: 503/);
  }
  assert.equal(typeof worker.fetch, "function");
  assert.equal(worker.scheduled, undefined);
});
