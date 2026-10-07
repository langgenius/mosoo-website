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

test("Pi failures and expiry trigger the same incident policy as other runtimes", () => {
  const state = mergeStatusEvents(createEmptyStatusState(), ["failed", "expired", "failed"].map(
    (status, index) => ({
      type: "run", runtimeId: "pi", runId: `pi-failure-${index}`, sessionType: "ui",
      status, observedAt, errorCode: "pi.turn_failed",
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
});
