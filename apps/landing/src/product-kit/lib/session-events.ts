// Ported from langgenius/mosoo at 7cb9866cfc:
// - pkgs/contracts/src/session/session.contract.ts (SESSION_PROCESS_EVENT_TYPES)
// - apps/web/src/shared/ui/session-events/domain.ts (domains, labels, tones)
// - apps/web/src/shared/ui/session-events/feed-display.ts (status classes)
// - apps/web/src/shared/ui/session-events/format.ts, turns.ts (durations, counts)
// The class strings are the console's, unchanged. Only i18n wiring differs.

import type { ConsoleKey, KitLocale } from "../i18n";
import { consoleText } from "../i18n";

export const SESSION_PROCESS_EVENT_TYPES = [
  "agent.message.delta",
  "agent.thinking.delta",
  "file.changed",
  "run.completed",
  "run.failed",
  "run.started",
  "session.status",
  "session_files.updated",
  "tool.confirmation.required",
  "tool.use.completed",
  "tool.use.started",
  "usage.updated",
  "user.message",
] as const;

export type SessionProcessEventType = (typeof SESSION_PROCESS_EVENT_TYPES)[number];
export type SessionProcessEventStatus = "available" | "error" | "unsupported";

export interface SessionProcessEvent {
  content: string;
  durationMs: number | null;
  id: string;
  occurredAt: string;
  status: SessionProcessEventStatus;
  tokens: number | null;
  type: SessionProcessEventType;
}

export type SessionEventDomain = "agent" | "session" | "span" | "user";

export const SESSION_EVENT_FILTER_DOMAINS: readonly SessionEventDomain[] = [
  "user",
  "agent",
  "session",
];

const SESSION_EVENT_DOMAIN_BY_TYPE = {
  "agent.message.delta": "agent",
  "agent.thinking.delta": "agent",
  "file.changed": "agent",
  "run.completed": "session",
  "run.failed": "session",
  "run.started": "session",
  "session.status": "session",
  "session_files.updated": "agent",
  "tool.confirmation.required": "agent",
  "tool.use.completed": "agent",
  "tool.use.started": "agent",
  "usage.updated": "span",
  "user.message": "user",
} as const satisfies Record<SessionProcessEventType, SessionEventDomain>;

const SESSION_EVENT_TYPE_LABEL_KEY = {
  "agent.message.delta": "sessionEvents.eventAssistantMessage",
  "agent.thinking.delta": "sessionEvents.eventThinking",
  "file.changed": "sessionEvents.eventFileChanged",
  "run.completed": "sessionEvents.eventRunCompleted",
  "run.failed": "sessionEvents.eventRunFailed",
  "run.started": "sessionEvents.eventRunStarted",
  "session.status": "sessionEvents.eventSessionStatus",
  "session_files.updated": "sessionEvents.eventSessionFiles",
  "tool.confirmation.required": "sessionEvents.eventApprovalRequested",
  "tool.use.completed": "sessionEvents.eventToolResult",
  "tool.use.started": "sessionEvents.eventToolUse",
  "usage.updated": "sessionEvents.eventUsageUpdated",
  "user.message": "sessionEvents.eventUserMessage",
} as const satisfies Record<SessionProcessEventType, ConsoleKey>;

const SESSION_EVENT_DOMAIN_LABEL_KEY = {
  agent: "sessionEvents.domainAgent",
  session: "sessionEvents.domainSession",
  span: "sessionEvents.domainSpan",
  user: "sessionEvents.domainUser",
} as const satisfies Record<SessionEventDomain, ConsoleKey>;

export interface SessionEventDomainTone {
  bar: string;
  chip: string;
  swatch: string;
}

export const SESSION_EVENT_DOMAIN_TONE: Record<SessionEventDomain, SessionEventDomainTone> = {
  agent: {
    bar: "bg-green-600",
    chip: "border-green-200 bg-green-50 text-green-800",
    swatch: "bg-green-600",
  },
  session: {
    bar: "bg-ink-700",
    chip: "border-ink-200 bg-ink-50 text-ink-800",
    swatch: "bg-ink-700",
  },
  span: {
    bar: "bg-ink-400/75",
    chip: "border-ink-100 bg-ink-50 text-ink-600",
    swatch: "bg-ink-400/75",
  },
  user: {
    bar: "bg-info",
    chip: "border-info/30 bg-info-bg text-info-fg",
    swatch: "bg-info",
  },
};

const SESSION_EVENT_CHIP_TONE = {
  error: {
    bar: "bg-danger",
    chip: "border-danger/25 bg-danger-bg text-danger-fg",
    swatch: "bg-danger",
  },
  exec: {
    bar: "bg-green-500",
    chip: "border-green-200 bg-green-50 text-green-800",
    swatch: "bg-green-500",
  },
  message: {
    bar: "bg-green-400",
    chip: "border-green-200 bg-green-50 text-green-800",
    swatch: "bg-green-400",
  },
  read: {
    bar: "bg-ink-300",
    chip: "border-ink-100 bg-ink-50 text-ink-700",
    swatch: "bg-ink-300",
  },
  result: {
    bar: "bg-ink-300",
    chip: "border-ink-100 bg-ink-50 text-ink-600",
    swatch: "bg-ink-300",
  },
  thinking: {
    bar: "bg-soil",
    chip: "border-soil/25 bg-soil-bg text-soil-fg",
    swatch: "bg-soil",
  },
  tool: {
    bar: "bg-warning",
    chip: "border-warning/30 bg-warning-bg text-warning-fg",
    swatch: "bg-warning",
  },
  userInput: {
    bar: "bg-info",
    chip: "border-info/30 bg-info-bg text-info-fg",
    swatch: "bg-info",
  },
  webFetch: {
    bar: "bg-info/70",
    chip: "border-info/25 bg-info-bg text-info-fg",
    swatch: "bg-info/70",
  },
  write: {
    bar: "bg-soil/80",
    chip: "border-soil/25 bg-soil-bg text-soil-fg",
    swatch: "bg-soil/80",
  },
} as const satisfies Record<string, SessionEventDomainTone>;

function getToolChipTone(content: string): SessionEventDomainTone {
  const lower = content.toLowerCase();

  if (lower.includes("exec_command") || lower.includes("bash") || lower.includes("shell")) {
    return SESSION_EVENT_CHIP_TONE.exec;
  }

  if (lower.includes("web_fetch") || lower.includes("web fetch") || lower.includes("webfetch")) {
    return SESSION_EVENT_CHIP_TONE.webFetch;
  }

  if (lower.includes("web_search") || lower.includes("web search") || lower.includes("websearch")) {
    return SESSION_EVENT_CHIP_TONE.tool;
  }

  if (lower.includes("read")) {
    return SESSION_EVENT_CHIP_TONE.read;
  }

  if (lower.includes("write") || lower.includes("file")) {
    return SESSION_EVENT_CHIP_TONE.write;
  }

  return SESSION_EVENT_CHIP_TONE.tool;
}

export function getSessionEventDomain(type: SessionProcessEventType): SessionEventDomain {
  return SESSION_EVENT_DOMAIN_BY_TYPE[type];
}

export function getSessionEventLabel(type: SessionProcessEventType, locale: KitLocale): string {
  return consoleText(locale, SESSION_EVENT_TYPE_LABEL_KEY[type]);
}

export function getSessionEventDomainLabel(domain: SessionEventDomain, locale: KitLocale): string {
  return consoleText(locale, SESSION_EVENT_DOMAIN_LABEL_KEY[domain]);
}

export function getSessionEventChipTone(event: SessionProcessEvent): SessionEventDomainTone {
  if (event.status === "error" || event.type === "run.failed") {
    return SESSION_EVENT_CHIP_TONE.error;
  }

  switch (event.type) {
    case "agent.message.delta":
    case "run.completed":
    case "run.started":
    case "session.status": {
      return SESSION_EVENT_CHIP_TONE.message;
    }
    case "user.message": {
      return SESSION_EVENT_CHIP_TONE.userInput;
    }
    case "agent.thinking.delta": {
      return SESSION_EVENT_CHIP_TONE.thinking;
    }
    case "file.changed":
    case "session_files.updated": {
      return SESSION_EVENT_CHIP_TONE.write;
    }
    case "tool.confirmation.required":
    case "tool.use.started": {
      return getToolChipTone(event.content);
    }
    case "tool.use.completed":
    case "usage.updated": {
      return SESSION_EVENT_CHIP_TONE.result;
    }
  }
}

export function getSessionEventStatusLabel(
  status: SessionProcessEventStatus,
  locale: KitLocale,
): string {
  switch (status) {
    case "available": {
      return consoleText(locale, "sessionEvents.statusOk");
    }
    case "error": {
      return consoleText(locale, "sessionEvents.statusError");
    }
    case "unsupported": {
      return consoleText(locale, "sessionEvents.statusUnsupported");
    }
  }
}

export function isSessionEventAttentionWorthy(event: SessionProcessEvent): boolean {
  return (
    event.status !== "available" ||
    event.type === "run.failed" ||
    (event.type === "session.status" &&
      (event.content === "mosoo.session.infra.rescheduling" ||
        event.content === "mosoo.session.stopped"))
  );
}

export function isSessionEventVisibleInMainFeed(event: SessionProcessEvent): boolean {
  return event.type !== "usage.updated";
}

export function summarizeSessionEvent(event: SessionProcessEvent, locale: KitLocale): string {
  const normalized = event.content.replaceAll(/\s+/g, " ").trim();
  return normalized.length > 0 ? normalized : getSessionEventLabel(event.type, locale);
}

const MAX_PREVIEW_LENGTH = 180;

export function clipPreview(content: string): string {
  const normalized = content.replaceAll(/\s+/g, " ").trim();

  if (normalized.length <= MAX_PREVIEW_LENGTH) {
    return normalized;
  }

  return `${normalized.slice(0, MAX_PREVIEW_LENGTH - 3)}...`;
}

export function statusClassName(status: SessionProcessEventStatus): string {
  switch (status) {
    case "available": {
      return "border-border bg-sunken/40 text-fg-3";
    }
    case "error": {
      return "border-danger/25 bg-danger-bg text-danger-fg";
    }
    case "unsupported": {
      return "border-warning/30 bg-warning-bg text-warning-fg";
    }
  }
}

export type SessionTurnStatus = "completed" | "running";

export function turnStatusClassName(status: SessionTurnStatus): string {
  return status === "completed"
    ? "border-success/25 bg-success-bg text-success-fg"
    : "border-info/30 bg-info-bg text-info-fg";
}

export function turnStatusLabel(status: SessionTurnStatus, locale: KitLocale): string {
  return status === "completed"
    ? consoleText(locale, "threads.completed")
    : consoleText(locale, "sessionEvents.turnStatusRunning");
}

export interface SessionTurnCounts {
  agent: number;
  session: number;
  span: number;
  user: number;
}

export function countSessionTurnDomains(events: readonly SessionProcessEvent[]): SessionTurnCounts {
  const counts: SessionTurnCounts = { agent: 0, session: 0, span: 0, user: 0 };

  for (const event of events) {
    if (isSessionEventVisibleInMainFeed(event)) {
      counts[getSessionEventDomain(event.type)] += 1;
    }
  }

  return counts;
}

// turns.ts calculateSessionTurnDuration: wall clock from the first event to the
// run's terminal event (or the latest event while it runs).
export function calculateTurnDurationMs(events: readonly SessionProcessEvent[]): number {
  const first = events[0];
  const last = events.at(-1);

  if (first === undefined || last === undefined) {
    return 0;
  }

  return Math.max(0, Date.parse(last.occurredAt) - Date.parse(first.occurredAt));
}

export function formatTotalDuration(value: number): string {
  if (value < 1000) {
    return `${value}ms`;
  }

  const seconds = value / 1000;
  return `${seconds.toFixed(seconds >= 100 ? 0 : 1)}s`;
}

const EVENT_TIME_LOCALE = { en: "en", ja: "ja", zh: "zh-CN" } as const satisfies Record<
  KitLocale,
  string
>;

// feed-display.ts formatEventTime, pinned to UTC so every visitor (and every
// screenshot) sees the same Example clock.
export function formatEventTime(iso: string, locale: KitLocale): string {
  return new Date(iso).toLocaleTimeString(EVENT_TIME_LOCALE[locale], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "UTC",
  });
}
