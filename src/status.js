const DAY_MS = 86_400_000;
const HISTORY_DAYS = 90;
const PLATFORM_STALE_AFTER_MS = 5 * 60_000;
const RUNTIME_STALE_AFTER_MS = DAY_MS;
const FAILURE_THRESHOLD = 3;
const SEEN_RUN_LIMIT = 1_000;
const ERROR_MESSAGE_LIMIT = 500;
const FAILURE_SOURCES = ["platform", "upstream_provider", "user_config", "unknown"];
const OFFICIAL_PROVIDER_HOSTS = new Set([
  "api.openai.com",
  "generativelanguage.googleapis.com",
  "api.anthropic.com",
]);
const MOSOO_HOSTS = new Set(["mosoo.ai", "cloud.mosoo.ai"]);
const PLATFORM_ERROR_PATTERNS = [
  "driver process exited",
  "driver exited",
  "durable object reset because its code was updated",
  "runtime subject is busy with lifecycle maintenance",
  "runtime session became inactive before the run completed",
  "llm proxy upstream request failed",
  "input.attachmentids is unsupported",
  "app-server message queue limit exceeded",
  "accepted status delivery timed out",
  "invalid json payload",
  'unknown name "store"',
];
const USER_CONFIG_ERROR_PATTERNS = [
  "country, region, or territory not supported",
  "region not supported",
  "unsupported_country_region_territory",
  "no credits",
  "insufficient credits",
  "insufficient balance",
  "credit balance",
  "quota",
  "invalid api key",
  "invalid_api_key",
  "incorrect api key",
  "api key not valid",
];

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
  { id: "pi", name: "Pi" },
];

function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function failureEndpointHosts(message) {
  // Prefer endpoint/zone fields over incidental links in provider error pages.
  const labelled = [...message.matchAll(
    /\b(?:zone|host|hostname|url|api[_-]?base|base[_-]?url)["']?\s*[:=]\s*["']?(?:https?:\/\/)?([a-z0-9.-]+\.[a-z]{2,})(?=[:/?#\s"'<>,;)}\]]|$)/g,
  )].map((match) => match[1]);
  if (labelled.length > 0) return labelled;
  return [...message.matchAll(
    /https?:\/\/([a-z0-9.-]+\.[a-z]{2,})(?=[:/?#\s"'<>,;)}\]]|$)/g,
  )].map((match) => match[1]);
}

export function classifyFailureSource({ errorCode, errorMessage, status } = {}) {
  if (status === "completed") return null;
  const message = typeof errorMessage === "string"
    ? errorMessage.toLowerCase().replace(/\\"/g, '"')
    : "";
  const code = typeof errorCode === "string" ? errorCode.toLowerCase() : "";

  // Specific Mosoo/protocol bugs take precedence over provider context.
  if (PLATFORM_ERROR_PATTERNS.some((pattern) => message.includes(pattern))) return "platform";
  if (USER_CONFIG_ERROR_PATTERNS.some((pattern) => `${code} ${message}`.includes(pattern))) {
    return "user_config";
  }

  const hosts = failureEndpointHosts(message);
  const official = hosts.some((host) => OFFICIAL_PROVIDER_HOSTS.has(host));
  if (hosts.some((host) => !OFFICIAL_PROVIDER_HOSTS.has(host) && !MOSOO_HOSTS.has(host))) {
    return "user_config";
  }
  if (message.includes("request rejected") && !official) return "user_config";
  if (
    official &&
    /\b[45]\d{2}\b|rate[_ -]?limit|too many requests|overloaded|timed out|origin_response_timeout/.test(
      `${code} ${message}`,
    )
  ) {
    return "upstream_provider";
  }
  if (message.includes("the operation timed out")) return "platform";
  // A runtime/provider name in a generic error code does not establish origin.
  return "unknown";
}

function runFailureSource(event) {
  if (event.status !== "failed" && event.status !== "expired") return null;
  return FAILURE_SOURCES.includes(event.failureSource)
    ? event.failureSource
    : classifyFailureSource(event);
}

function countsAgainstAvailability(failureSource) {
  return failureSource === "platform" || failureSource === "unknown";
}

function emptyFailureCounts() {
  return Object.fromEntries(FAILURE_SOURCES.map((source) => [source, 0]));
}

function dailyCounts(daily, legacyFailureSource) {
  const succeeded = daily?.succeeded ?? 0;
  const total = daily?.total ?? 0;
  const failedBySource = emptyFailureCounts();
  for (const source of FAILURE_SOURCES) {
    failedBySource[source] = daily?.failedBySource?.[source] ?? 0;
  }
  const classified = Object.values(failedBySource).reduce((sum, count) => sum + count, 0);
  // Legacy runtime failures have no recoverable source; invocation failures do.
  failedBySource[legacyFailureSource] += Math.max(0, total - succeeded - classified);
  return { failedBySource, succeeded, total };
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
    version: 3,
  };
}

function currentState(previous) {
  if (!isRecord(previous) || (previous.version !== 2 && previous.version !== 3)) {
    return createEmptyStatusState();
  }
  if (previous.version === 3) return previous;
  // v2 counted every failed Run in its streak. Unclassified failures still
  // count, so the v2 streak carries over unchanged.
  return { ...previous, version: 3 };
}

function mergeSignal(signal, observation) {
  const history = { ...signal.history };
  const day = dateKey(observation.observedAt);
  const invocation = observation.type === "invocation";
  const daily = dailyCounts(history[day], invocation ? "platform" : "unknown");
  const failureSource = invocation ? "platform" : observation.failureSource;
  if (!observation.succeeded) daily.failedBySource[failureSource] += 1;
  const cutoff = dateKey(
    timestampMs(observation.observedAt) - (HISTORY_DAYS - 1) * DAY_MS,
  );

  history[day] = {
    failedBySource: daily.failedBySource,
    succeeded: daily.succeeded + (observation.succeeded ? 1 : 0),
    total: daily.total + 1,
  };
  for (const key of Object.keys(history)) {
    if (key < cutoff) delete history[key];
  }

  return {
    ...signal,
    consecutiveFailures: observation.succeeded
      ? 0
      : (signal.consecutiveFailures ?? 0) + (countsAgainstAvailability(failureSource) ? 1 : 0),
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
      components[event.runtimeId] = mergeSignal(component, {
        ...event, failureSource: runFailureSource(event), succeeded,
      });
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
    version: 3,
  };
}

function historyWindow(signal, nowMs, legacyFailureSource = "unknown") {
  return Array.from({ length: HISTORY_DAYS }, (_, index) => {
    const date = dateKey(nowMs - (HISTORY_DAYS - 1 - index) * DAY_MS);
    return { date, ...dailyCounts(signal.history?.[date], legacyFailureSource) };
  });
}

function summarizeHistory(history) {
  const total = history.reduce((sum, day) => sum + day.total, 0);
  const succeeded = history.reduce((sum, day) => sum + day.succeeded, 0);
  const failedBySource = emptyFailureCounts();
  for (const day of history) {
    for (const source of FAILURE_SOURCES) failedBySource[source] += day.failedBySource[source];
  }
  // Only failures positively traced to the user's setup or the model
  // provider are excluded. Unclassified failures still count against Mosoo.
  const availabilityTotal = succeeded + failedBySource.platform + failedBySource.unknown;
  return {
    failed: total - succeeded,
    failedBySource,
    successRate: availabilityTotal > 0 ? succeeded / availabilityTotal : total > 0 ? 1 : null,
    succeeded,
    total,
  };
}

function isFresh(latest, nowMs, staleAfterMs) {
  if (!latest) return false;
  const age = nowMs - timestampMs(latest.observedAt, 0);
  return age >= 0 && age <= staleAfterMs;
}

export function buildPublicStatus(previous = createEmptyStatusState(), now = new Date()) {
  const state = currentState(previous);
  const nowMs = now.getTime();
  const platformHistory = historyWindow(state.platform, nowMs, "platform");
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
    const consecutiveFailures = component.consecutiveFailures ?? 0;

    return {
      completedRuns90d: summary.succeeded,
      consecutiveFailures,
      failedBySource90d: summary.failedBySource,
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
        : consecutiveFailures >= FAILURE_THRESHOLD
          ? "degraded"
          : "operational",
      successRate90d: summary.successRate,
    };
  });
  const status =
    platform.status === "degraded" || components.some((component) => component.status === "degraded")
      ? "degraded"
      : platform.status === "unknown" || components.some((component) => component.status === "unknown")
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
    // The additive public feed stays compatible with /health's v2 reader.
    // Only the stored state needs v3 to distinguish legacy failure streaks.
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
    const entries = (Array.isArray(item.logs) ? item.logs : []).flatMap(structuredLogEntries);
    // ContainerProxy returns upstream statuses and intentional SDK policy
    // denials (520). Only the API's explicit marker changes classification;
    // an unmarked 520 or a failed Worker execution remains a platform failure.
    const egressHttpResult = entries.some(
      (entry) =>
        entry.message === "runtime.sandbox.egress.http_error" &&
        isRecord(entry.metadata) &&
        entry.metadata.httpStatus === httpStatus,
    );
    events.push({
      httpStatus,
      observedAt,
      outcome,
      succeeded:
        !FAILED_WORKER_OUTCOMES.has(outcome) &&
        !(Array.isArray(item.exceptions) && item.exceptions.length > 0) &&
        (httpStatus === null || httpStatus < 500 || (outcome === "ok" && egressHttpResult)),
      type: "invocation",
    });

    for (const entry of entries) {
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

      const errorMessage = [
        metadata.errorMessage, metadata.error_message, metadata.error?.message, metadata.error,
      ].find((value) => typeof value === "string");
      const failureSource = runFailureSource({ ...metadata, errorMessage });
      events.push({
        durationMs:
          typeof metadata.durationMs === "number" && Number.isFinite(metadata.durationMs)
            ? Math.max(0, metadata.durationMs)
            : null,
        errorCode: typeof metadata.errorCode === "string" ? metadata.errorCode : null,
        ...(errorMessage === undefined ? {} : { errorMessage: errorMessage.slice(0, ERROR_MESSAGE_LIMIT) }),
        ...(failureSource === null ? {} : { failureSource }),
        observedAt: isoTimestamp(entry.timestamp, timestampMs(observedAt)),
        runId: metadata.runId,
        runtimeId: metadata.runtimeId,
        sessionType: metadata.sessionType,
        status: metadata.status,
        type: "run",
      });
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
