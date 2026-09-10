import assert from "node:assert/strict";
import test from "node:test";

import {
  buildPublicStatus,
  createEmptyStatusState,
  mergeStatusEvents,
  statusEventsFromTailItems,
} from "../src/status.js";

const observedAt = "2026-08-13T12:00:00.000Z";

test("overall health requires fresh observations for every runtime", () => {
  const now = new Date("2026-09-07T10:25:00.000Z");
  const healthyPlatform = {
    type: "invocation", succeeded: true, observedAt: now.toISOString(), outcome: "ok",
  };
  const runtimeIds = ["openai-runtime", "claude-agent-sdk", "acp-fallback"];
  const completed = runtimeIds.map((runtimeId) => ({
    type: "run", runtimeId, runId: runtimeId, sessionType: "ui",
    status: "completed", observedAt: now.toISOString(),
  }));
  for (const runs of [[], completed.slice(0, 1), completed]) {
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

test("three consecutive observed Run failures degrade the runtime and exclude preview traffic", () => {
  const run = (runId, offset, sessionType = "ui") => ({
    durationMs: 1_000,
    errorCode: "acp.turn_failed",
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
  assert.equal(status.components[0].failedRuns90d, 1);
});
