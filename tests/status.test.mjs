import assert from "node:assert/strict";
import test from "node:test";

import {
  buildPublicStatus,
  classifyFailureSource,
  createEmptyStatusState,
  mergeStatusEvents,
  statusEventsFromTailItems,
  StatusStore,
} from "../src/status.js";

const observedAt = "2026-08-13T12:00:00.000Z";

const noFailures = { platform: 0, upstream_provider: 0, user_config: 0, unknown: 0 };

function runEvent(runId, overrides = {}) {
  return {
    type: "run", runtimeId: "openai-runtime", sessionType: "ui",
    status: "failed", errorCode: "openai.turn_failed", observedAt, runId, ...overrides,
  };
}

const failureExamples = {
  platform: [
    "Driver process exited before ready",
    "Driver exited before ready",
    "Durable Object reset because its code was updated.",
    "Runtime subject is busy with lifecycle maintenance.",
    "Runtime session became inactive before the run completed.",
    "502 Bad Gateway: {\"error\":\"LLM proxy upstream request failed.\"}",
    "input.attachmentIds is unsupported.",
    "App-server message queue limit exceeded.",
    "accepted status delivery timed out",
    "The operation timed out.",
    "The operation timed out. url=https://cloud.mosoo.ai/api/v1/threads",
    'Gemini 400 Invalid JSON payload. Unknown name "store" at https://generativelanguage.googleapis.com',
    'Unknown name "store"; url=https://api.gaoxin.net.cn/v1',
    'Unknown name \\"store\\"',
  ],
  user_config: [
    "403 Forbidden: Request rejected; url=https://api.gaoxin.net.cn/v1/responses",
    "403 Forbidden: Request rejected",
    'Cloudflare 524 {"zone":"api.gaoxin.net.cn","error":"origin_response_timeout"}',
    '<html><title>524: A timeout occurred</title>zone: "api.gaoxin.net.cn"</html>',
    "origin_response_timeout; host=api.gaoxin.net.cn",
    "The operation timed out. zone=api.gaoxin.net.cn",
    "Country, region, or territory not supported",
    "Region not supported",
    "You have no credits remaining",
    "Insufficient balance",
    "Quota exceeded. Check your plan and billing details.",
    "429 Quota exceeded; api_base=https://api.openai.com/v1",
    "401 Incorrect API key provided; url=https://api.openai.com/v1/responses",
    "503 Service Unavailable; api_base=https://relay.example/v1 (provider OpenAI)",
    "524; zone=api.openai.com.relay.example",
    "524; zone=api.gaoxin.net.cn; upstream=https://api.openai.com",
  ],
  upstream_provider: [
    "500 Internal Server Error; url=https://api.openai.com/v1/responses",
    "503 Service Unavailable; host=generativelanguage.googleapis.com",
    "403 Forbidden: Request rejected; api_base=https://api.openai.com/v1",
    "429 Too Many Requests; api_base=https://generativelanguage.googleapis.com/v1beta",
    "Rate limit exceeded; base_url=https://api.openai.com/v1",
    "529 Overloaded; url=https://api.anthropic.com/v1/messages",
    '524 origin_response_timeout; zone="api.openai.com"; see https://www.cloudflare.com/5xx-error-landing',
    "The operation timed out. url=https://api.openai.com/v1/responses",
  ],
  unknown: [
    "Something unexpected happened",
    "500 Internal Server Error",
    "403 Forbidden",
    "524 origin_response_timeout",
    "OpenAI provider error",
  ],
};

for (const [source, messages] of Object.entries(failureExamples)) {
  test(`failure messages classify as ${source} regardless of case`, () => {
    for (const message of messages) {
      for (const errorMessage of [message, message.toUpperCase()]) {
        for (const status of ["failed", "expired"]) {
          assert.equal(classifyFailureSource({
            errorCode: "provider_error", errorMessage, status,
          }), source, errorMessage);
        }
      }
    }
  });
}

test("generic runtime/provider error codes without a message stay unknown", () => {
  for (const errorCode of ["openai.turn_failed", "pi.turn_failed", "acp.turn_failed", "provider_error"]) {
    for (const errorMessage of [undefined, null, "", 403, { message: "Driver exited" }]) {
      assert.equal(classifyFailureSource({ errorCode, errorMessage, status: "failed" }), "unknown");
    }
  }
  assert.equal(classifyFailureSource(), "unknown");
  assert.equal(classifyFailureSource({
    errorCode: "provider_error", errorMessage: "Driver process exited before ready", status: "completed",
  }), null);
});

test("public feed keeps version 2 for existing health clients while storage uses version 3", () => {
  const state = mergeStatusEvents(createEmptyStatusState(), [runEvent("version", {
    failureSource: "platform",
  })]);
  assert.equal(state.version, 3);
  assert.equal(buildPublicStatus(state, new Date(observedAt)).version, 2);
});

test("overall health requires fresh observations for every runtime", () => {
  const now = new Date("2026-09-07T10:25:00.000Z");
  const healthyPlatform = {
    type: "invocation", succeeded: true, observedAt: now.toISOString(), outcome: "ok",
  };
  const runtimeIds = ["openai-runtime", "claude-agent-sdk", "acp-fallback", "pi"];
  const completed = runtimeIds.map((runtimeId) => ({
    type: "run", runtimeId, runId: runtimeId, sessionType: "ui",
    status: "completed", observedAt: now.toISOString(),
  }));
  for (const runs of [[], completed.slice(0, 1), completed.slice(0, 3), completed]) {
    const state = mergeStatusEvents(createEmptyStatusState(), [healthyPlatform, ...runs]);
    const result = buildPublicStatus(state, now);
    assert.equal(result.status, runs.length === runtimeIds.length ? "operational" : "unknown");
    assert.equal(result.platform.status, "operational");
  }
  const staleFailure = {
    ...completed[2], status: "failed", errorCode: "acp.turn_failed",
    observedAt: "2026-09-05T17:46:17.117Z",
  };
  const staleState = mergeStatusEvents(createEmptyStatusState(), [staleFailure, healthyPlatform]);
  const stale = buildPublicStatus(staleState, now);
  assert.equal(stale.status, "unknown");
  assert.equal(stale.components[2].latestErrorCode, "acp.turn_failed");
  assert.equal(stale.components[2].failedRuns90d, 1);
});

function terminalLog(metadata) {
  return {
    message: [
      JSON.stringify({
        level: "info",
        message: "session.run.terminal",
        metadata,
        timestamp: observedAt,
      }),
    ],
  };
}

test("Pi stays unknown in existing status history until a real production Run is observed", () => {
  const previous = mergeStatusEvents(createEmptyStatusState(), [{
    type: "run", runtimeId: "openai-runtime", runId: "existing-run", sessionType: "ui",
    status: "completed", observedAt,
  }]);
  // A deployed v2 store predates the Pi component. Its history needs no migration.
  previous.version = 2;
  delete previous.components.pi;
  const before = buildPublicStatus(previous, new Date(observedAt));
  const piBefore = before.components.find((component) => component.id === "pi");
  assert.equal(piBefore.name, "Pi");
  assert.equal(piBefore.status, "unknown");
  assert.equal(piBefore.runs90d, 0);
  assert.equal(piBefore.successRate90d, null);
  assert.equal(piBefore.lastObservedAt, null);
  assert.ok(piBefore.history.every((day) => day.total === 0));

  const events = statusEventsFromTailItems([{
    event: { response: { status: 200 } },
    eventTimestamp: Date.parse(observedAt),
    outcome: "ok",
    logs: [
      terminalLog({ runId: "pi-preview", runtimeId: "pi", sessionType: "preview", status: "completed" }),
      terminalLog({ runId: "pi-cancelled", runtimeId: "pi", sessionType: "ui", status: "cancelled" }),
    ],
  }], Date.parse(observedAt));
  const excluded = mergeStatusEvents(previous, events);
  assert.equal(buildPublicStatus(excluded, new Date(observedAt)).components.find(
    (component) => component.id === "pi",
  ).status, "unknown");

  const completed = statusEventsFromTailItems([{
    event: { response: { status: 200 } },
    eventTimestamp: Date.parse(observedAt),
    outcome: "ok",
    logs: [terminalLog({
      runId: "pi-run", runtimeId: "pi", sessionType: "api_channel", status: "completed",
      durationMs: 2_500, errorCode: null,
    })],
  }], Date.parse(observedAt));
  const state = mergeStatusEvents(excluded, [...completed, ...completed]);
  const after = buildPublicStatus(state, new Date(observedAt));
  const pi = after.components.find((component) => component.id === "pi");
  assert.equal(pi.status, "operational");
  assert.equal(pi.runs90d, 1);
  assert.equal(pi.completedRuns90d, 1);
  assert.equal(pi.successRate90d, 1);
  assert.equal(pi.latestDurationMs, 2_500);
  assert.equal(after.components.find((component) => component.id === "openai-runtime").runs90d, 1);
  const stale = buildPublicStatus(state, new Date("2026-08-14T12:00:00.001Z"));
  assert.equal(stale.components.find((component) => component.id === "pi").status, "unknown");
});

test("Pi platform failures and expiry trigger the same incident policy as other runtimes", () => {
  const state = mergeStatusEvents(createEmptyStatusState(), ["failed", "expired", "failed"].map(
    (status, index) => ({
      type: "run", runtimeId: "pi", runId: `pi-failure-${index}`, sessionType: "ui",
      status, observedAt, errorCode: "pi.turn_failed", errorMessage: "Driver process exited before ready",
    }),
  ));
  const status = buildPublicStatus(state, new Date(observedAt));
  const pi = status.components.find((component) => component.id === "pi");
  assert.equal(pi.status, "degraded");
  assert.equal(pi.failedRuns90d, 3);
  assert.equal(pi.successRate90d, 0);
  assert.equal(pi.latestErrorCode, "pi.turn_failed");
  assert.equal(status.releasePolicyTriggered, true);
});

test("Cloudflare Tail events reuse Mosoo terminal logs without synthetic traffic", () => {
  const events = statusEventsFromTailItems(
    [
      {
        event: { response: { status: 200 } },
        eventTimestamp: Date.parse(observedAt),
        logs: [
          terminalLog({
            durationMs: 4_200,
            errorCode: null,
            runId: "run-1",
            runtimeId: "openai-runtime",
            sessionType: "api_channel",
            status: "completed",
          }),
        ],
        outcome: "ok",
      },
    ],
    Date.parse(observedAt),
  );

  assert.deepEqual(events, [
    {
      httpStatus: 200,
      observedAt,
      outcome: "ok",
      succeeded: true,
      type: "invocation",
    },
    {
      durationMs: 4_200,
      errorCode: null,
      observedAt,
      runId: "run-1",
      runtimeId: "openai-runtime",
      sessionType: "api_channel",
      status: "completed",
      type: "run",
    },
  ]);

  const state = mergeStatusEvents(createEmptyStatusState(), [...events, events[1]]);
  const status = buildPublicStatus(state, new Date("2026-08-13T12:01:00.000Z"));
  const openai = status.components.find((component) => component.id === "openai-runtime");

  assert.equal(status.platform.status, "operational");
  assert.equal(status.platform.successRate90d, 1);
  assert.equal(openai.runs90d, 1);
  assert.equal(openai.successRate90d, 1);
  assert.equal(openai.latestDurationMs, 4_200);
});

test("three consecutive platform Run failures degrade the runtime and exclude preview traffic", () => {
  const run = (runId, offset, sessionType = "ui") => ({
    durationMs: 1_000,
    errorCode: "acp.turn_failed",
    errorMessage: "Runtime subject is busy with lifecycle maintenance.",
    observedAt: new Date(Date.parse(observedAt) + offset).toISOString(),
    runId,
    runtimeId: "acp-fallback",
    sessionType,
    status: "failed",
    type: "run",
  });
  const state = mergeStatusEvents(createEmptyStatusState(), [
    {
      httpStatus: 200,
      observedAt,
      outcome: "ok",
      succeeded: true,
      type: "invocation",
    },
    run("preview-run", 500, "preview"),
    run("run-1", 1_000),
    run("run-2", 2_000),
    run("run-3", 3_000),
  ]);
  const status = buildPublicStatus(state, new Date("2026-08-13T12:04:00.000Z"));
  const opencode = status.components.find((component) => component.id === "acp-fallback");

  assert.equal(opencode.runs90d, 3);
  assert.equal(opencode.failedRuns90d, 3);
  assert.deepEqual(opencode.failedBySource90d, { ...noFailures, platform: 3 });
  assert.equal(opencode.status, "degraded");
  assert.equal(status.status, "degraded");
  assert.equal(status.releasePolicyTriggered, true);
});

test("Tail health distinguishes invocation failures from HTTP client errors and business logs", () => {
  const items = [
    { event: { request: {}, response: { status: 404 } }, outcome: "ok" },
    { event: { request: {}, response: { status: 503 } }, outcome: "ok" },
    { event: { cron: "* * * * *", scheduledTime: Date.parse(observedAt) }, outcome: "ok" },
    { event: { cron: "* * * * *", scheduledTime: Date.parse(observedAt) }, outcome: "exception" },
    { event: { consumedEvents: [{ scriptName: "producer" }] }, outcome: "exception" },
    { event: { response: { status: 200 } }, outcome: "ok", logs: [terminalLog({
      runId: "failed-run", runtimeId: "openai-runtime", sessionType: "ui",
      status: "failed", errorCode: "provider_error",
    })] },
  ];
  const events = statusEventsFromTailItems(items, Date.parse(observedAt));
  assert.deepEqual(events.filter((event) => event.type === "invocation").map((event) => event.succeeded),
    [true, false, true, false, false, true]);
  const status = buildPublicStatus(mergeStatusEvents(createEmptyStatusState(), events), new Date(observedAt));
  assert.equal(status.platform.failedInvocations90d, 3);
  assert.equal(status.platform.invocations90d, 6);
  assert.equal(status.platform.successRate90d, 0.5);
  assert.equal(status.components[0].failedRuns90d, 1);
  assert.deepEqual(status.components[0].failedBySource90d, { ...noFailures, unknown: 1 });
});

test("marked egress HTTP results do not hide actual API or Worker failures", () => {
  const marker = (status) => ({ message: [JSON.stringify({
    message: "runtime.sandbox.egress.http_error",
    metadata: { httpStatus: status },
  })] });
  const events = statusEventsFromTailItems([
    { event: { response: { status: 520 } }, outcome: "ok", logs: [marker(520)] },
    { event: { response: { status: 503 } }, outcome: "ok", logs: [marker(503)] },
    { event: { response: { status: 520 } }, outcome: "ok", logs: [] },
    { event: { response: { status: 500 } }, outcome: "ok", logs: [marker(520)] },
    { event: { response: { status: 520 } }, outcome: "exception", logs: [marker(520)] },
    { event: { response: { status: 520 } }, outcome: "exceededCpu", logs: [marker(520)] },
    { event: { response: { status: 520 } }, outcome: "ok", logs: [marker(520)], exceptions: [{ message: "waitUntil failed" }] },
    { event: { response: { status: 520 } }, outcome: "unknown", logs: [marker(520)] },
  ], Date.parse(observedAt));
  assert.deepEqual(events.map((event) => event.succeeded), [true, true, false, false, false, false, false, false]);
});

test("egress classification preserves failed run terminal events", () => {
  const events = statusEventsFromTailItems([{
    event: { response: { status: 520 } }, outcome: "ok", logs: [
      { message: [JSON.stringify({message: "runtime.sandbox.egress.http_error", metadata: { httpStatus: 520 }})] },
      terminalLog({ durationMs: 1000, errorCode: "acp.turn_failed", runId: "denied-run", runtimeId: "acp-fallback", sessionType: "ui", status: "failed" }),
    ],
  }], Date.parse(observedAt));
  assert.equal(events[0].succeeded, true);
  assert.equal(events[1].type, "run");
  assert.equal(events[1].status, "failed");
  assert.equal(events[1].failureSource, "unknown");
});

function tailRuns(overrides) {
  return statusEventsFromTailItems([{
    event: { response: { status: 200 } }, eventTimestamp: Date.parse(observedAt), outcome: "ok",
    logs: overrides.map((metadata, index) => terminalLog(runEvent(`run-${index}`, metadata))),
  }], Date.parse(observedAt)).filter((event) => event.type === "run");
}

test("Tail accepts only string error messages, including alternate field names", () => {
  const message = "Driver process exited before ready";
  const events = tailRuns([
    { errorMessage: message },
    { error_message: message },
    { error: { message } },
    { error: message },
    { errorMessage: {}, error_message: message },
    { errorMessage: 500, error_message: [], error: { message: {} } },
    {},
  ]);
  for (const event of events.slice(0, 5)) {
    assert.equal(event.errorMessage, message);
    assert.equal(event.failureSource, "platform");
  }
  for (const event of events.slice(5)) {
    assert.equal(Object.hasOwn(event, "errorMessage"), false);
    assert.equal(event.failureSource, "unknown");
  }
});

test("valid metadata failureSource overrides classification, including unknown", () => {
  for (const failureSource of Object.keys(noFailures)) {
    const [event] = tailRuns([{
      failureSource, errorMessage: "Driver process exited before ready",
    }]);
    assert.equal(event.failureSource, failureSource);
    const state = mergeStatusEvents(createEmptyStatusState(), [event]);
    assert.deepEqual(buildPublicStatus(state, new Date(observedAt)).components[0].failedBySource90d,
      { ...noFailures, [failureSource]: 1 });
  }
  for (const failureSource of [undefined, null, "PLATFORM", "provider", "", 1, {}]) {
    const [event] = tailRuns([{
      failureSource, errorMessage: "Quota exceeded. Check your plan and billing details.",
    }]);
    assert.equal(event.failureSource, "user_config");
  }
  const [precomputed] = tailRuns([{ failureSource: "platform" }]);
  assert.equal(precomputed.failureSource, "platform");
});

test("Tail classifies the full error before limiting stored messages to 500 characters", () => {
  const errorMessage = `Cloudflare 524 <html>${"x".repeat(600)} {"zone":"api.gaoxin.net.cn"}</html>`;
  const [event] = tailRuns([{ errorMessage }]);
  assert.equal(event.errorMessage, errorMessage.slice(0, 500));
  assert.equal(event.failureSource, "user_config");
  const state = mergeStatusEvents(createEmptyStatusState(), [JSON.parse(JSON.stringify(event))]);
  assert.deepEqual(buildPublicStatus(state, new Date(observedAt)).components[0].failedBySource90d,
    { ...noFailures, user_config: 1 });
});

test("completed Runs never receive a failure source or enter failure buckets", () => {
  const [event] = tailRuns([{
    status: "completed", errorMessage: "Driver exited", failureSource: "platform",
  }]);
  assert.equal(Object.hasOwn(event, "failureSource"), false);
  const state = mergeStatusEvents(createEmptyStatusState(), [{ ...event, failureSource: "platform" }]);
  const component = buildPublicStatus(state, new Date(observedAt)).components[0];
  assert.equal(component.completedRuns90d, 1);
  assert.equal(component.failedRuns90d, 0);
  assert.equal(component.consecutiveFailures, 0);
  assert.deepEqual(component.failedBySource90d, noFailures);
});

test("runtime availability only counts completed Runs and platform failures", () => {
  const cases = [
    { sources: [], rate: null },
    { sources: ["user_config"], rate: 1 },
    { sources: ["upstream_provider", "unknown"], rate: 1 },
    { sources: ["platform"], rate: 0 },
    { sources: ["completed", "user_config", "upstream_provider", "unknown"], rate: 1 },
    { sources: ["completed", "completed", "platform", "user_config", "upstream_provider", "unknown"], rate: 2 / 3 },
  ];
  for (const { sources, rate } of cases) {
    const events = sources.map((source, index) => runEvent(`availability-${index}`, {
      status: source === "completed" ? "completed" : "failed", failureSource: source,
    }));
    const state = mergeStatusEvents(createEmptyStatusState(), events);
    const component = buildPublicStatus(state, new Date(observedAt)).components[0];
    const completed = sources.filter((source) => source === "completed").length;
    assert.equal(component.successRate90d, rate);
    assert.equal(component.runs90d, sources.length);
    assert.equal(component.completedRuns90d, completed);
    assert.equal(component.failedRuns90d, sources.length - completed);
    assert.deepEqual(component.failedBySource90d, Object.fromEntries(
      Object.keys(noFailures).map((source) => [source, sources.filter((value) => value === source).length]),
    ));
    assert.deepEqual(component.history.at(-1).failedBySource, component.failedBySource90d);
  }
});

test("non-platform failures alone never degrade a fresh runtime or trigger release policy", () => {
  for (const failureSource of ["user_config", "upstream_provider", "unknown"]) {
    const events = Array.from({ length: 4 }, (_, index) => runEvent(`non-platform-${index}`, { failureSource }));
    const state = mergeStatusEvents(createEmptyStatusState(), events);
    const status = buildPublicStatus(state, new Date(observedAt));
    assert.equal(status.components[0].consecutiveFailures, 0);
    assert.equal(status.components[0].status, "operational");
    assert.equal(status.releasePolicyTriggered, false);
    assert.equal(status.components[0].failedRuns90d, 4);
    const stale = buildPublicStatus(state, new Date("2026-08-14T12:00:00.001Z"));
    assert.equal(stale.components[0].status, "unknown");
  }
});

test("non-platform failures preserve platform streaks and success resets them", () => {
  let state = createEmptyStatusState();
  const sources = ["platform", "user_config", "platform", "upstream_provider", "unknown",
    "platform", "user_config", "upstream_provider", "unknown", "completed", "unknown"];
  const expectedStreaks = [1, 1, 2, 2, 2, 3, 3, 3, 3, 0, 0];
  for (const [index, failureSource] of sources.entries()) {
    state = mergeStatusEvents(state, [runEvent(`streak-${index}`, {
      failureSource, status: failureSource === "completed" ? "completed" : "failed",
    })]);
    const status = buildPublicStatus(state, new Date(observedAt));
    assert.equal(status.components[0].consecutiveFailures, expectedStreaks[index]);
    assert.equal(status.components[0].status, expectedStreaks[index] >= 3 ? "degraded" : "operational");
    assert.equal(status.releasePolicyTriggered, expectedStreaks[index] >= 3);
  }
});

test("classified Run failures still exclude preview/cancelled runs and deduplicate by runId", () => {
  const runs = tailRuns([
    { runId: "preview", sessionType: "preview", errorMessage: "Driver exited" },
    { runId: "cancelled", status: "cancelled", failureSource: "platform" },
    { runId: "unknown-runtime", runtimeId: "other", failureSource: "platform" },
    { runId: "user", sessionType: "api_channel", errorMessage: "403 Forbidden: Request rejected" },
    { runId: "platform", status: "expired", errorMessage: "The operation timed out." },
  ]);
  const initial = mergeStatusEvents(createEmptyStatusState(), [...runs, ...runs]);
  const state = mergeStatusEvents(initial, runs);
  const component = buildPublicStatus(state, new Date(observedAt)).components[0];
  assert.equal(component.runs90d, 2);
  assert.equal(component.failedRuns90d, 2);
  assert.equal(component.consecutiveFailures, 1);
  assert.deepEqual(component.failedBySource90d, { ...noFailures, platform: 1, user_config: 1 });
  assert.deepEqual(state.seenRunIds, ["user", "platform"]);
  assert.deepEqual(state, initial);
});

test("v2 history remains readable and uncategorized Run failures migrate to unknown", () => {
  const previous = {
    version: 2, observedSince: observedAt, updatedAt: observedAt, seenRunIds: ["old-run"],
    platform: {
      consecutiveFailures: 0,
      history: { "2026-08-13": { succeeded: 2, total: 3 } },
      latest: { type: "invocation", succeeded: true, outcome: "ok", observedAt },
    },
    components: {
      "openai-runtime": {
        consecutiveFailures: 4,
        history: { "2026-08-13": { succeeded: 2, total: 6 } },
        latest: runEvent("old-run", { succeeded: false }),
      },
    },
  };
  const unchanged = structuredClone(previous);
  const before = buildPublicStatus(previous, new Date(observedAt));
  assert.equal(before.version, 2);
  assert.equal(before.components[0].completedRuns90d, 2);
  assert.equal(before.components[0].failedRuns90d, 4);
  assert.equal(before.components[0].runs90d, 6);
  assert.equal(before.components[0].successRate90d, 1);
  assert.equal(before.components[0].consecutiveFailures, 0);
  assert.equal(before.components[0].status, "operational");
  assert.equal(before.releasePolicyTriggered, false);
  assert.deepEqual(before.components[0].failedBySource90d, { ...noFailures, unknown: 4 });
  assert.deepEqual(before.components[3].failedBySource90d, noFailures);
  assert.equal(before.platform.successRate90d, 2 / 3);
  assert.equal(before.platform.failedInvocations90d, 1);

  const merged = mergeStatusEvents(previous, [
    runEvent("old-run", { failureSource: "platform" }),
    runEvent("new-run", { failureSource: "platform" }),
  ]);
  const after = buildPublicStatus(JSON.parse(JSON.stringify(merged)), new Date(observedAt));
  assert.equal(merged.version, 3);
  assert.equal(after.observedSince, observedAt);
  assert.equal(after.components[0].runs90d, 7);
  assert.equal(after.components[0].consecutiveFailures, 1);
  assert.equal(after.components[0].successRate90d, 2 / 3);
  assert.deepEqual(after.components[0].failedBySource90d, { ...noFailures, platform: 1, unknown: 4 });
  assert.deepEqual(previous, unchanged);

  previous.platform.consecutiveFailures = 3;
  previous.platform.latest.succeeded = false;
  const failingPlatform = buildPublicStatus(previous, new Date(observedAt));
  assert.equal(failingPlatform.platform.status, "degraded");
  assert.equal(failingPlatform.releasePolicyTriggered, true);
});

test("partial daily buckets and missing counters default to zero or unknown", () => {
  const state = createEmptyStatusState();
  const component = state.components["openai-runtime"];
  delete component.consecutiveFailures;
  component.history = {
    "2026-08-12": { succeeded: 1, total: 6, failedBySource: { platform: 2, user_config: 1 } },
    "2026-08-13": { total: 2 },
  };
  const result = buildPublicStatus(state, new Date(observedAt)).components[0];
  assert.equal(result.runs90d, 8);
  assert.equal(result.failedRuns90d, 7);
  assert.equal(result.consecutiveFailures, 0);
  assert.equal(result.successRate90d, 1 / 3);
  assert.deepEqual(result.failedBySource90d,
    { platform: 2, user_config: 1, upstream_provider: 0, unknown: 4 });
  const merged = mergeStatusEvents(state, [runEvent("new", { failureSource: "user_config" })]);
  const after = buildPublicStatus(merged, new Date(observedAt)).components[0];
  assert.equal(after.failedRuns90d, 8);
  assert.equal(after.consecutiveFailures, 0);
  assert.deepEqual(after.failedBySource90d,
    { platform: 2, user_config: 2, upstream_provider: 0, unknown: 4 });
});

test("failure source buckets follow the existing 90 UTC day history window", () => {
  const events = [
    runEvent("too-old", { observedAt: "2026-05-15T23:59:59.999Z", failureSource: "platform" }),
    runEvent("first-day", { observedAt: "2026-05-16T00:00:00.000Z", failureSource: "user_config" }),
    runEvent("today", { status: "completed" }),
  ];
  const state = mergeStatusEvents(createEmptyStatusState(), events);
  const result = buildPublicStatus(state, new Date(observedAt)).components[0];
  assert.equal(result.history.length, 90);
  assert.equal(result.history[0].date, "2026-05-16");
  assert.equal(result.runs90d, 2);
  assert.equal(result.failedRuns90d, 1);
  assert.equal(result.successRate90d, 1);
  assert.deepEqual(result.failedBySource90d, { ...noFailures, user_config: 1 });
  assert.equal(Object.hasOwn(state.components["openai-runtime"].history, "2026-05-15"), false);
});

test("StatusStore persists source buckets through JSON and exposes counts without raw messages", async () => {
  let stored;
  const now = new Date().toISOString();
  const store = new StatusStore({ storage: {
    async get(key) { assert.equal(key, "status"); return stored && JSON.parse(stored); },
    async put(key, value) { assert.equal(key, "status"); stored = JSON.stringify(value); },
  } });
  const events = tailRuns([
    { status: "completed" },
    { errorMessage: "403 Forbidden: Request rejected; url=https://api.gaoxin.net.cn/v1" },
    { errorMessage: "Driver process exited before ready" },
  ]).map((event) => ({ ...event, observedAt: now }));
  const write = await store.fetch(new Request("https://status.internal/events", {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ events }),
  }));
  assert.equal(write.status, 200);
  const state = JSON.parse(stored);
  assert.deepEqual(state.components["openai-runtime"].history[now.slice(0, 10)].failedBySource,
    { ...noFailures, platform: 1, user_config: 1 });
  const response = await store.fetch(new Request("https://status.internal/status"));
  const result = await response.json();
  assert.equal(response.status, 200);
  assert.deepEqual(result, buildPublicStatus(state, new Date(result.generatedAt)));
  assert.equal(result.components[0].successRate90d, 0.5);
  assert.deepEqual(result.components[0].failedBySource90d, { ...noFailures, platform: 1, user_config: 1 });
  assert.doesNotMatch(JSON.stringify(result), /errorMessage|api\.gaoxin\.net\.cn|Driver process exited/);
});
