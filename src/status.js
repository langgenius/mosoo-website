const DAY_MS = 86_400_000;
const HISTORY_DAYS = 90;
const PLATFORM_STALE_AFTER_MS = 5 * 60_000;
const RUNTIME_STALE_AFTER_MS = DAY_MS;
const FAILURE_THRESHOLD = 3;
const SEEN_RUN_LIMIT = 1_000;

const FAILED_WORKER_OUTCOMES = new Set([
  "exception",
  "exceededCpu",
  "exceededMemory",
  "scriptNotFound",
  "unknown",
]);
const USER_FACING_SESSION_TYPES = new Set(["api_channel", "ui"]);

export const STATUS_COMPONENTS = [
  { id: "openai-runtime", name: "OpenAI Codex" },
  { id: "claude-agent-sdk", name: "Claude Agent SDK" },
  { id: "acp-fallback", name: "OpenCode (ACP)" },
];

function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function timestampMs(value, fallback = Date.now()) {
  const parsed = new Date(value ?? fallback).getTime();
  return Number.isFinite(parsed) ? parsed : fallback;
}

function isoTimestamp(value, fallback) {
  return new Date(timestampMs(value, fallback)).toISOString();
}

function dateKey(value) {
  return new Date(value).toISOString().slice(0, 10);
}

function emptySignal() {
  return {
    consecutiveFailures: 0,
    history: {},
    latest: null,
  };
}

function emptyComponent(component) {
  return {
    ...emptySignal(),
    id: component.id,
    name: component.name,
  };
}

export function createEmptyStatusState() {
  return {
    components: Object.fromEntries(
      STATUS_COMPONENTS.map((component) => [component.id, emptyComponent(component)]),
    ),
    observedSince: null,
    platform: emptySignal(),
    seenRunIds: [],
    updatedAt: null,
    version: 2,
  };
}

function currentState(previous) {
  return isRecord(previous) && previous.version === 2 ? previous : createEmptyStatusState();
}

function mergeSignal(signal, observation) {
  const history = { ...signal.history };
  const day = dateKey(observation.observedAt);
  const daily = history[day] ?? { succeeded: 0, total: 0 };
  const cutoff = dateKey(
    timestampMs(observation.observedAt) - (HISTORY_DAYS - 1) * DAY_MS,
  );

  history[day] = {
    succeeded: daily.succeeded + (observation.succeeded ? 1 : 0),
    total: daily.total + 1,
  };
  for (const key of Object.keys(history)) {
    if (key < cutoff) delete history[key];
  }

  return {
    ...signal,
    consecutiveFailures: observation.succeeded ? 0 : signal.consecutiveFailures + 1,
    history,
    latest: observation,
  };
}

export function mergeStatusEvents(previous, incoming) {
  const state = currentState(previous);
  const components = { ...state.components };
  let platform = state.platform;
  const seenRunIds = new Set(Array.isArray(state.seenRunIds) ? state.seenRunIds : []);
  let observedSince = state.observedSince;
  let updatedAt = state.updatedAt;

  const events = Array.isArray(incoming) ? [...incoming] : [];
  events.sort((left, right) => timestampMs(left?.observedAt) - timestampMs(right?.observedAt));

  for (const event of events) {
    if (!isRecord(event) || typeof event.observedAt !== "string") continue;

    if (event.type === "invocation" && typeof event.succeeded === "boolean") {
      platform = mergeSignal(platform, event);
    } else if (
      event.type === "run" &&
      typeof event.runId === "string" &&
      typeof event.runtimeId === "string" &&
      USER_FACING_SESSION_TYPES.has(event.sessionType) &&
      !seenRunIds.has(event.runId)
    ) {
      const definition = STATUS_COMPONENTS.find((component) => component.id === event.runtimeId);
      const succeeded = event.status === "completed";
      const failed = event.status === "failed" || event.status === "expired";
      if (!definition || (!succeeded && !failed)) continue;

      const component = components[event.runtimeId] ?? emptyComponent(definition);
      components[event.runtimeId] = mergeSignal(component, { ...event, succeeded });
      seenRunIds.add(event.runId);
    } else {
      continue;
    }

    observedSince =
      observedSince === null || event.observedAt < observedSince
        ? event.observedAt
        : observedSince;
    updatedAt = updatedAt === null || event.observedAt > updatedAt ? event.observedAt : updatedAt;
  }

  return {
    components,
    observedSince,
    platform,
    seenRunIds: [...seenRunIds].slice(-SEEN_RUN_LIMIT),
    updatedAt,
    version: 2,
  };
}

function historyWindow(signal, nowMs) {
  return Array.from({ length: HISTORY_DAYS }, (_, index) => {
    const date = dateKey(nowMs - (HISTORY_DAYS - 1 - index) * DAY_MS);
    return { date, ...(signal.history[date] ?? { succeeded: 0, total: 0 }) };
  });
}

function summarizeHistory(history) {
  const total = history.reduce((sum, day) => sum + day.total, 0);
  const succeeded = history.reduce((sum, day) => sum + day.succeeded, 0);
  return {
    failed: total - succeeded,
    successRate: total === 0 ? null : succeeded / total,
    succeeded,
    total,
  };
}

function isFresh(latest, nowMs, staleAfterMs) {
  if (latest === null) return false;
  const age = nowMs - timestampMs(latest.observedAt, 0);
  return age >= 0 && age <= staleAfterMs;
}

export function buildPublicStatus(previous = createEmptyStatusState(), now = new Date()) {
  const state = currentState(previous);
  const nowMs = now.getTime();
  const platformHistory = historyWindow(state.platform, nowMs);
  const platformSummary = summarizeHistory(platformHistory);
  const platformFresh = isFresh(state.platform.latest, nowMs, PLATFORM_STALE_AFTER_MS);
  const platform = {
    failedInvocations90d: platformSummary.failed,
    history: platformHistory,
    invocations90d: platformSummary.total,
    lastObservedAt: state.platform.latest?.observedAt ?? null,
    latestHttpStatus: state.platform.latest?.httpStatus ?? null,
    latestOutcome: state.platform.latest?.outcome ?? null,
    status: !platformFresh
      ? "unknown"
      : state.platform.latest.succeeded
        ? "operational"
        : "degraded",
    successRate90d: platformSummary.successRate,
  };

  const components = STATUS_COMPONENTS.map((definition) => {
    const component = state.components[definition.id] ?? emptyComponent(definition);
    const history = historyWindow(component, nowMs);
    const summary = summarizeHistory(history);
    const fresh = isFresh(component.latest, nowMs, RUNTIME_STALE_AFTER_MS);

    return {
      completedRuns90d: summary.succeeded,
      consecutiveFailures: component.consecutiveFailures,
      failedRuns90d: summary.failed,
      history,
      id: definition.id,
      lastObservedAt: component.latest?.observedAt ?? null,
      latestDurationMs: component.latest?.durationMs ?? null,
      latestErrorCode: component.latest?.errorCode ?? null,
      latestStatus: component.latest?.status ?? null,
      name: definition.name,
      runs90d: summary.total,
      status: !fresh
        ? "unknown"
        : component.consecutiveFailures >= FAILURE_THRESHOLD
          ? "degraded"
          : "operational",
      successRate90d: summary.successRate,
    };
  });
  const status =
    platform.status === "degraded" || components.some((component) => component.status === "degraded")
      ? "degraded"
      : platform.status === "unknown"
        ? "unknown"
        : "operational";

  return {
    components,
    generatedAt: now.toISOString(),
    observedSince: state.observedSince,
    platform,
    releasePolicyTriggered:
      state.platform.consecutiveFailures >= FAILURE_THRESHOLD ||
      components.some((component) => component.consecutiveFailures >= FAILURE_THRESHOLD),
    status,
    updatedAt: state.updatedAt,
    version: 2,
  };
}

function responseStatus(item) {
  const status = item?.event?.response?.status;
  return Number.isInteger(status) ? status : null;
}

function structuredLogEntries(log) {
  const messages = Array.isArray(log?.message) ? log.message : [log?.message];
  return messages.flatMap((message) => {
    if (typeof message !== "string" || !message.startsWith("{")) return [];
    try {
      const entry = JSON.parse(message);
      return isRecord(entry) ? [entry] : [];
    } catch {
      return [];
    }
  });
}

export function statusEventsFromTailItems(items, nowMs = Date.now()) {
  const events = [];

  for (const item of Array.isArray(items) ? items : []) {
    if (!isRecord(item)) continue;
    const observedAt = isoTimestamp(item.eventTimestamp, nowMs);
    const httpStatus = responseStatus(item);
    const outcome = typeof item.outcome === "string" ? item.outcome : "unknown";
    events.push({
      httpStatus,
      observedAt,
      outcome,
      succeeded:
        !FAILED_WORKER_OUTCOMES.has(outcome) && (httpStatus === null || httpStatus < 500),
      type: "invocation",
    });

    for (const log of Array.isArray(item.logs) ? item.logs : []) {
      for (const entry of structuredLogEntries(log)) {
        const metadata = entry.metadata;
        if (
          entry.message !== "session.run.terminal" ||
          !isRecord(metadata) ||
          typeof metadata.runId !== "string" ||
          typeof metadata.runtimeId !== "string" ||
          typeof metadata.sessionType !== "string" ||
          typeof metadata.status !== "string"
        ) {
          continue;
        }

        events.push({
          durationMs:
            typeof metadata.durationMs === "number" && Number.isFinite(metadata.durationMs)
              ? Math.max(0, metadata.durationMs)
              : null,
          errorCode: typeof metadata.errorCode === "string" ? metadata.errorCode : null,
          observedAt: isoTimestamp(entry.timestamp, timestampMs(observedAt)),
          runId: metadata.runId,
          runtimeId: metadata.runtimeId,
          sessionType: metadata.sessionType,
          status: metadata.status,
          type: "run",
        });
      }
    }
  }

  return events;
}

function storeStub(env) {
  const id = env.STATUS_STORE.idFromName("production");
  return env.STATUS_STORE.get(id);
}

export async function recordStatusTailEvents(env, items) {
  if (!env.STATUS_STORE) return;
  const events = statusEventsFromTailItems(items);
  if (events.length === 0) return;

  const response = await storeStub(env).fetch("https://status.internal/events", {
    body: JSON.stringify({ events }),
    headers: { "content-type": "application/json" },
    method: "POST",
  });
  if (!response.ok) throw new Error(`Status store rejected Tail events: ${response.status}`);
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

    if (request.method === "POST" && url.pathname === "/events") {
      const payload = await request.json();
      if (!isRecord(payload) || !Array.isArray(payload.events)) {
        return Response.json({ error: "Invalid status events." }, { status: 400 });
      }
      const previous = await this.state.storage.get("status");
      await this.state.storage.put("status", mergeStatusEvents(previous, payload.events));
      return Response.json({ ok: true });
    }

    if (request.method === "GET" && url.pathname === "/status") {
      const state = await this.state.storage.get("status");
      return Response.json(buildPublicStatus(state));
    }

    return new Response("Not found", { status: 404 });
  }
}
