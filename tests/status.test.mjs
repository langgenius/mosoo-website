import assert from "node:assert/strict";
import test from "node:test";

import {
  buildPublicStatus,
  createEmptyStatusState,
  mergeStatusEvents,
  statusEventsFromTailItems,
} from "../src/status.js";

const observedAt = "2026-08-13T12:00:00.000Z";

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
