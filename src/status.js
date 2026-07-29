const DAY_MS = 86_400_000;
const HISTORY_DAYS = 90;
const STALE_AFTER_MS = 12 * 60_000;
const FOLLOW_UP_DELAY_MS = 6_000;
const FAILURE_THRESHOLD = 3;
const REQUEST_TIMEOUT_MS = 15_000;

export const STATUS_COMPONENTS = [
  { id: "openai-runtime", name: "OpenAI Codex" },
  { id: "claude-agent-sdk", name: "Claude Agent SDK" },
  { id: "acp-fallback", name: "OpenCode (ACP)" },
];

class CanaryFailure extends Error {
  constructor(code) {
    super(code);
    this.code = code;
  }
}

function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function dateKey(value) {
  return new Date(value).toISOString().slice(0, 10);
}

function emptyComponent(component) {
  return {
    consecutiveFailures: 0,
    history: {},
    id: component.id,
    latest: null,
    name: component.name,
  };
}

export function createEmptyStatusState() {
  return {
    components: Object.fromEntries(
      STATUS_COMPONENTS.map((component) => [component.id, emptyComponent(component)]),
    ),
    observedSince: null,
    updatedAt: null,
    version: 1,
  };
}

export function mergeStatusSnapshot(previous, snapshot) {
  const state = previous ?? createEmptyStatusState();
  const components = { ...state.components };
  const cutoff = dateKey(new Date(snapshot.checkedAt).getTime() - (HISTORY_DAYS - 1) * DAY_MS);
  const today = dateKey(snapshot.checkedAt);

  for (const result of snapshot.results) {
    const definition = STATUS_COMPONENTS.find((component) => component.id === result.id);
    if (!definition) continue;

    const current = components[result.id] ?? emptyComponent(definition);
    const history = { ...current.history };
    const daily = history[today] ?? { checks: 0, passed: 0 };

    history[today] = {
      checks: daily.checks + 1,
      passed: daily.passed + (result.ok ? 1 : 0),
    };

    for (const key of Object.keys(history)) {
      if (key < cutoff) delete history[key];
    }

    components[result.id] = {
      ...current,
      consecutiveFailures: result.ok ? 0 : current.consecutiveFailures + 1,
      history,
      latest: { ...result, checkedAt: snapshot.checkedAt },
    };
  }

  return {
    components,
    observedSince: state.observedSince ?? snapshot.checkedAt,
    updatedAt: snapshot.checkedAt,
    version: 1,
  };
}

function historyWindow(component, nowMs) {
  return Array.from({ length: HISTORY_DAYS }, (_, index) => {
    const date = dateKey(nowMs - (HISTORY_DAYS - 1 - index) * DAY_MS);
    const day = component.history[date] ?? { checks: 0, passed: 0 };
    return { date, ...day };
  });
}

export function buildPublicStatus(state = createEmptyStatusState(), now = new Date()) {
  const nowMs = now.getTime();
  const components = STATUS_COMPONENTS.map((definition) => {
    const component = state.components[definition.id] ?? emptyComponent(definition);
    const history = historyWindow(component, nowMs);
    const checks = history.reduce((total, day) => total + day.checks, 0);
    const passed = history.reduce((total, day) => total + day.passed, 0);
    const latest = component.latest;
    const fresh =
      latest !== null &&
      nowMs - new Date(latest.checkedAt).getTime() >= 0 &&
      nowMs - new Date(latest.checkedAt).getTime() <= STALE_AFTER_MS;
    const status = !fresh ? "unknown" : latest.ok ? "operational" : "degraded";

    return {
      availability90d: checks === 0 ? null : passed / checks,
      checks90d: checks,
      consecutiveFailures: component.consecutiveFailures,
      driverReused: latest?.driverReused ?? null,
      errorCode: latest?.errorCode ?? null,
      firstTtftMs: latest?.firstTtftMs ?? null,
      followUpTtftMs: latest?.followUpTtftMs ?? null,
      history,
      id: definition.id,
      lastCheckedAt: latest?.checkedAt ?? null,
      name: definition.name,
      status,
      ttftBudgetMs: latest?.ttftBudgetMs ?? null,
    };
  });
  const status = components.some((component) => component.status === "degraded")
    ? "degraded"
    : components.some((component) => component.status === "unknown")
      ? "unknown"
      : "operational";

  return {
    components,
    generatedAt: now.toISOString(),
    observedSince: state.observedSince,
    releasePolicyTriggered: components.some(
      (component) => component.consecutiveFailures >= FAILURE_THRESHOLD,
    ),
    slo: {
      failureThreshold: FAILURE_THRESHOLD,
      target: 0.995,
      windowDays: 30,
    },
    status,
    updatedAt: state.updatedAt,
    version: 1,
  };
}

function parseCanaryTarget(value) {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    typeof value.agentId !== "string" ||
    !STATUS_COMPONENTS.some((component) => component.id === value.id) ||
    !/^[0-9A-HJKMNP-TV-Z]{26}$/.test(value.agentId)
  ) {
    throw new Error("STATUS_CANARY_TARGETS contains an invalid target.");
  }

  const ttftBudgetMs = value.ttftBudgetMs ?? 20_000;
  if (!Number.isInteger(ttftBudgetMs) || ttftBudgetMs < 1_000 || ttftBudgetMs > 120_000) {
    throw new Error("STATUS_CANARY_TARGETS contains an invalid TTFT budget.");
  }

  return { agentId: value.agentId, id: value.id, ttftBudgetMs };
}

export function parseCanaryConfig(raw) {
  if (typeof raw !== "string" || raw.trim() === "") return null;

  const value = JSON.parse(raw);
  if (
    !isRecord(value) ||
    typeof value.token !== "string" ||
    value.token.trim() === "" ||
    !Array.isArray(value.targets)
  ) {
    throw new Error("STATUS_CANARY_TARGETS must contain token and targets.");
  }

  const targets = value.targets.map(parseCanaryTarget);
  const ids = new Set(targets.map((target) => target.id));
  if (targets.length !== STATUS_COMPONENTS.length || ids.size !== STATUS_COMPONENTS.length) {
    throw new Error("STATUS_CANARY_TARGETS must configure every public runtime exactly once.");
  }

  return { targets, token: value.token };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function requestJson(url, init) {
  let response;

  try {
    response = await fetch(url, {
      ...init,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch {
    throw new CanaryFailure("api_unreachable");
  }

  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new CanaryFailure("api_request_failed");
  if (!isRecord(payload)) throw new CanaryFailure("invalid_api_response");
  return payload;
}

function bearerHeaders(token, idempotencyKey) {
  return {
    authorization: `Bearer ${token}`,
    "content-type": "application/json",
    ...(idempotencyKey ? { "idempotency-key": idempotencyKey } : {}),
  };
}

function requireRun(payload, source) {
  const run =
    source === "create"
      ? payload.run
      : Array.isArray(payload.events)
        ? payload.events.find((event) => isRecord(event) && isRecord(event.run))?.run
        : null;

  if (!isRecord(run) || typeof run.id !== "string") {
    throw new CanaryFailure("missing_run_id");
  }
  return run.id;
}

async function waitForTurn({ apiOrigin, budgetMs, expectedToken, runId, startedAt, threadId, token }) {
  const deadline = startedAt + Math.max(60_000, Math.min(180_000, budgetMs * 3));
  const seen = new Set();
  let output = "";
  let firstTtftMs = null;
  let completed = false;

  while (Date.now() < deadline) {
    const payload = await requestJson(
      `${apiOrigin}/api/v1/threads/${encodeURIComponent(threadId)}/events?limit=100`,
      { headers: bearerHeaders(token), method: "GET" },
    );
    if (!Array.isArray(payload.events)) throw new CanaryFailure("invalid_event_response");

    for (const event of payload.events) {
      if (
        !isRecord(event) ||
        event.runId !== runId ||
        typeof event.id !== "string" ||
        seen.has(event.id)
      ) {
        continue;
      }

      seen.add(event.id);
      if (event.type === "run.failed" || event.type === "run.cancelled") {
        throw new CanaryFailure("turn_failed");
      }
      if (event.type === "run.completed") completed = true;
      if (
        typeof event.type === "string" &&
        event.type.startsWith("agent.message") &&
        typeof event.content === "string" &&
        event.content.length > 0
      ) {
        firstTtftMs ??= Date.now() - startedAt;
        output += event.content;
      }
    }

    if (completed && firstTtftMs !== null && output.includes(expectedToken)) {
      return firstTtftMs;
    }
    await sleep(500);
  }

  throw new CanaryFailure("turn_timeout");
}

async function runCanaryTarget(env, config, target) {
  const apiOrigin = env.STATUS_API_ORIGIN.replace(/\/$/, "");
  const firstToken = `MOSOO_CANARY_${crypto.randomUUID().slice(0, 8)}`;
  const followUpToken = `MOSOO_FOLLOW_UP_${crypto.randomUUID().slice(0, 8)}`;
  let threadId = null;

  try {
    const firstStartedAt = Date.now();
    const created = await requestJson(
      `${apiOrigin}/api/v1/agents/${encodeURIComponent(target.agentId)}/threads`,
      {
        body: JSON.stringify({
          input: {
            content: [
              {
                text: `Reply with exactly ${firstToken}. Do not use tools.`,
                type: "text",
              },
            ],
            type: "user.message",
          },
        }),
        headers: bearerHeaders(config.token, `status-create-${crypto.randomUUID()}`),
        method: "POST",
      },
    );

    if (!isRecord(created.thread) || typeof created.thread.id !== "string") {
      throw new CanaryFailure("missing_thread_id");
    }
    threadId = created.thread.id;
    const firstRunId = requireRun(created, "create");
    const firstTtftMs = await waitForTurn({
      apiOrigin,
      budgetMs: target.ttftBudgetMs,
      expectedToken: firstToken,
      runId: firstRunId,
      startedAt: firstStartedAt,
      threadId,
      token: config.token,
    });

    await sleep(FOLLOW_UP_DELAY_MS);

    const followUpStartedAt = Date.now();
    const followedUp = await requestJson(
      `${apiOrigin}/api/v1/threads/${encodeURIComponent(threadId)}/events`,
      {
        body: JSON.stringify({
          events: [
            {
              text: `Reply with exactly ${followUpToken}. Do not use tools.`,
              type: "user_message",
            },
          ],
        }),
        headers: bearerHeaders(config.token, `status-follow-up-${crypto.randomUUID()}`),
        method: "POST",
      },
    );
    const followUpRunId = requireRun(followedUp, "follow-up");
    const followUpTtftMs = await waitForTurn({
      apiOrigin,
      budgetMs: target.ttftBudgetMs,
      expectedToken: followUpToken,
      runId: followUpRunId,
      startedAt: followUpStartedAt,
      threadId,
      token: config.token,
    });
    const diagnostic = await requestJson(
      `${apiOrigin}/api/v1/internal/status-canary/driver-reuse`,
      {
        body: JSON.stringify({ runIds: [firstRunId, followUpRunId], threadId }),
        headers: {
          "content-type": "application/json",
          "x-status-canary-auth": env.STATUS_CANARY_SECRET,
        },
        method: "POST",
      },
    );

    if (typeof diagnostic.sameDriver !== "boolean") {
      throw new CanaryFailure("invalid_driver_diagnostic");
    }

    const withinBudget =
      firstTtftMs <= target.ttftBudgetMs && followUpTtftMs <= target.ttftBudgetMs;
    const ok = withinBudget && diagnostic.sameDriver;

    return {
      driverReused: diagnostic.sameDriver,
      errorCode: ok
        ? null
        : diagnostic.sameDriver
          ? "ttft_budget_exceeded"
          : "driver_not_reused",
      firstTtftMs,
      followUpTtftMs,
      id: target.id,
      ok,
      ttftBudgetMs: target.ttftBudgetMs,
    };
  } catch (error) {
    return {
      driverReused: null,
      errorCode: error instanceof CanaryFailure ? error.code : "check_failed",
      firstTtftMs: null,
      followUpTtftMs: null,
      id: target.id,
      ok: false,
      ttftBudgetMs: target.ttftBudgetMs,
    };
  } finally {
    if (threadId !== null) {
      await fetch(`${apiOrigin}/api/v1/threads/${encodeURIComponent(threadId)}`, {
        headers: bearerHeaders(config.token),
        method: "DELETE",
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      }).catch(() => undefined);
    }
  }
}

function storeStub(env) {
  const id = env.STATUS_STORE.idFromName("production");
  return env.STATUS_STORE.get(id);
}

export async function runStatusCanary(env, checkedAtMs = Date.now()) {
  const config = parseCanaryConfig(env.STATUS_CANARY_TARGETS);
  if (config === null) return;
  if (!env.STATUS_CANARY_SECRET || !env.STATUS_API_ORIGIN || !env.STATUS_STORE) {
    throw new Error("Status canary bindings are incomplete.");
  }

  const results = await Promise.all(
    config.targets.map((target) => runCanaryTarget(env, config, target)),
  );
  await storeStub(env).fetch("https://status.internal/snapshot", {
    body: JSON.stringify({
      checkedAt: new Date(checkedAtMs).toISOString(),
      results,
    }),
    method: "POST",
  });
}

export async function statusJsonResponse(env) {
  if (!env.STATUS_STORE) {
    return Response.json(buildPublicStatus(), {
      headers: { "cache-control": "no-store" },
    });
  }

  try {
    const response = await storeStub(env).fetch("https://status.internal/status");
    const headers = new Headers(response.headers);
    headers.set("access-control-allow-origin", "*");
    headers.set("cache-control", "public, max-age=30, stale-while-revalidate=60");
    return new Response(response.body, { headers, status: response.status });
  } catch {
    return Response.json(buildPublicStatus(), {
      headers: { "cache-control": "no-store" },
      status: 503,
    });
  }
}

export class StatusStore {
  constructor(state) {
    this.state = state;
  }

  async fetch(request) {
    const url = new URL(request.url);

    if (request.method === "POST" && url.pathname === "/snapshot") {
      const snapshot = await request.json();
      const previous = await this.state.storage.get("status");
      await this.state.storage.put("status", mergeStatusSnapshot(previous, snapshot));
      return Response.json({ ok: true });
    }

    if (request.method === "GET" && url.pathname === "/status") {
      const state = await this.state.storage.get("status");
      return Response.json(buildPublicStatus(state));
    }

    return new Response("Not found", { status: 404 });
  }
}
