import assert from "node:assert/strict";
import test from "node:test";

import {
  buildPublicStatus,
  createEmptyStatusState,
  mergeStatusSnapshot,
  parseCanaryConfig,
} from "../src/status.js";

const checkedAt = "2026-07-29T12:00:00.000Z";
const failedResult = {
  driverReused: false,
  errorCode: "driver_not_reused",
  firstTtftMs: 1_200,
  followUpTtftMs: 1_100,
  id: "openai-runtime",
  ok: false,
  ttftBudgetMs: 20_000,
};

test("status history drives availability, staleness, and the release freeze threshold", () => {
  let state = createEmptyStatusState();

  for (let index = 0; index < 3; index += 1) {
    state = mergeStatusSnapshot(state, { checkedAt, results: [failedResult] });
  }

  const current = buildPublicStatus(state, new Date("2026-07-29T12:01:00.000Z"));
  const stale = buildPublicStatus(state, new Date("2026-07-29T12:13:00.000Z"));
  const component = current.components.find((entry) => entry.id === "openai-runtime");

  assert.equal(component.availability90d, 0);
  assert.equal(component.consecutiveFailures, 3);
  assert.equal(component.status, "degraded");
  assert.equal(current.releasePolicyTriggered, true);
  assert.equal(stale.components.find((entry) => entry.id === "openai-runtime").status, "unknown");
});

test("canary config rejects an empty API token", () => {
  assert.throws(
    () =>
      parseCanaryConfig(
        JSON.stringify({
          targets: [
            {
              agentId: "01J00000000000000000000001",
              id: "openai-runtime",
            },
            {
              agentId: "01J00000000000000000000002",
              id: "claude-runtime",
            },
            {
              agentId: "01J00000000000000000000003",
              id: "opencode-runtime",
            },
          ],
          token: " ",
        }),
      ),
    /token and targets/,
  );
});
