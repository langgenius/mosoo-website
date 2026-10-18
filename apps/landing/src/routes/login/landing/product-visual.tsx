import { ArchiveRestore, ArrowRight, CircleDashed, Info, Link2 } from "lucide-react";
import type { CSSProperties, ReactElement, ReactNode } from "react";

import { cn } from "@/shared/lib/class-names";

import { t } from "./above-fold-i18n";
import { BreakAfterSlashes } from "./ui";

/*
 * One example Session, drawn in code (copy deck §3). Day 1: the backend
 * creates a Session with an inline configuration and a CSV attachment; mosoo
 * streams persisted events and the Agent leaves artifacts under outputs/. Two
 * days later the backend posts a follow-up to the same Thread after the
 * sandbox was reclaimed, and the turn resumes from the last checkpoint.
 *
 * Field names, enums, event types and endpoints come from the main repo's
 * public API v2 contract (apps/api/openapi/public-api-v2.generated.json):
 * CreateProjectThreadRequest, CreateThreadResponse (201), ThreadSummary,
 * RunSummary, ThreadEventLogEntry.type, SendEventsRequest / ThreadEventInput,
 * ThreadFile. Event `content` values follow pkgs/runtime-events
 * process-draft.ts. The IDs, tool calls and file names are example values,
 * and the visual deliberately shows no durations, token counts or costs.
 */

const THREAD_ID = "01JC9W8Q4N7K2M5R3T6V8X0Y1Z";
const FILE_ID = "01JC9W2D5F8H1K4M7P0R3T6V9X";

type TokenKind =
  | "punct"
  | "key"
  | "string"
  | "literal"
  | "method"
  | "path"
  | "header"
  | "value"
  | "status"
  | "threadId";

type Token = readonly [TokenKind, string];
type CodeLine = { readonly indent: number; readonly tokens: readonly Token[] };

const TOKEN_CLASS: Record<TokenKind, string> = {
  punct: "text-ink-500",
  key: "text-ink-900",
  string: "text-green-700",
  literal: "text-soil-fg",
  method: "font-semibold text-green-700",
  path: "text-ink-900",
  header: "text-ink-500",
  value: "text-ink-900",
  status: "font-semibold text-green-700",
  threadId: "bg-lime text-ink-900 rounded-[3px] px-0.5",
};

const p = (text: string): Token => ["punct", text];
const key = (name: string): Token => ["key", `"${name}"`];
const str = (value: string): Token => ["string", `"${value}"`];
const line = (indent: number, ...tokens: Token[]): CodeLine => ({ indent, tokens });

const CREATE_REQUEST_HEAD: readonly CodeLine[] = [
  line(0, ["method", "POST"], p(" "), ["path", "/api/v2/projects/{projectId}/threads"]),
  line(0, ["header", "Authorization:"], p(" "), ["value", "Bearer msp_..."]),
  line(0, ["header", "Idempotency-Key:"], p(" "), ["value", "sales-q3-analysis"]),
];

function createRequestBody(message: string): readonly CodeLine[] {
  return [
    line(0, p("{")),
    line(1, key("configuration"), p(": {")),
    line(2, key("type"), p(": "), str("inline"), p(",")),
    line(2, key("harness"), p(": "), str("claude-agent-sdk"), p(",")),
    line(2, key("provider"), p(": "), str("anthropic"), p(",")),
    line(2, key("model"), p(": "), str("claude-sonnet-5"), p(",")),
    line(
      2,
      key("instructions"),
      p(": "),
      str("Analyze the attached CSV. Save a report, a chart, and the result data under outputs/."),
    ),
    line(1, p("},")),
    line(1, key("input"), p(": {")),
    line(2, key("type"), p(": "), str("user.message"), p(",")),
    line(
      2,
      key("content"),
      p(": [{ "),
      key("type"),
      p(": "),
      str("text"),
      p(", "),
      key("text"),
      p(": "),
      str(message),
      p(" }]"),
    ),
    line(1, p("},")),
    line(
      1,
      key("resources"),
      p(": [{ "),
      key("type"),
      p(": "),
      str("file"),
      p(", "),
      key("file_id"),
      p(": "),
      str(FILE_ID),
      p(" }]"),
    ),
    line(0, p("}")),
  ];
}

// An excerpt of CreateThreadResponse: "..." marks the fields left out
// (including links.thread, the same Thread ID as a URL).
const CREATE_RESPONSE: readonly CodeLine[] = [
  line(0, ["status", "201 Created"]),
  line(0, p("{")),
  line(1, key("thread"), p(": {")),
  line(2, key("id"), p(": "), ["threadId", `"${THREAD_ID}"`], p(",")),
  line(2, key("agent_id"), p(": "), ["literal", "null"], p(",")),
  line(2, p("...")),
  line(1, p("},")),
  line(
    1,
    key("run"),
    p(": { "),
    key("status"),
    p(": "),
    str("queued"),
    p(", "),
    key("trigger"),
    p(": "),
    str("user_prompt"),
    p(", ... },"),
  ),
  line(1, p("...")),
  line(0, p("}")),
];

const FOLLOW_UP_HEAD: readonly CodeLine[] = [
  line(
    0,
    ["method", "POST"],
    p(" "),
    ["path", "/api/v2/threads/"],
    ["threadId", THREAD_ID],
    ["path", "/events"],
  ),
  line(0, ["header", "Authorization:"], p(" "), ["value", "Bearer msp_..."]),
  line(0, ["header", "Idempotency-Key:"], p(" "), ["value", "sales-q3-followup-1"]),
];

function followUpBody(message: string): readonly CodeLine[] {
  return [
    line(0, p("{")),
    line(1, key("events"), p(": [")),
    line(
      2,
      p("{ "),
      key("type"),
      p(": "),
      str("user_message"),
      p(", "),
      key("text"),
      p(": "),
      str(message),
      p(" }"),
    ),
    line(1, p("]")),
    line(0, p("}")),
  ];
}

type EventType =
  | "user.message"
  | "run.started"
  | "tool.use.started"
  | "tool.use.completed"
  | "file.changed"
  | "usage.updated"
  | "session_files.updated"
  | "run.completed";

type EventRow = { readonly type: EventType; readonly toolName?: string; readonly content: string };

// Decorative markers only: the type name next to each one carries the meaning.
const EVENT_MARKER_CLASS: Record<EventType, string> = {
  "user.message": "bg-ink-900",
  "run.started": "bg-green-600",
  "run.completed": "bg-green-600",
  "tool.use.started": "bg-amber",
  "tool.use.completed": "bg-amber",
  "file.changed": "bg-soil",
  "session_files.updated": "bg-soil",
  "usage.updated": "bg-sky",
};

function dayOneEvents(message: string): readonly EventRow[] {
  return [
    { type: "user.message", content: message },
    { type: "run.started", content: "01JC9W8R…" },
    { type: "tool.use.started", toolName: "bash", content: "python analyze.py sales.csv" },
    { type: "tool.use.completed", toolName: "bash", content: "python analyze.py sales.csv" },
    { type: "file.changed", content: "outputs/chart.png" },
    { type: "file.changed", content: "outputs/regions.csv" },
    { type: "tool.use.started", toolName: "write", content: "outputs/report.md" },
    { type: "file.changed", content: "outputs/report.md" },
    { type: "usage.updated", content: "Usage updated." },
    { type: "session_files.updated", content: "Session files updated." },
    { type: "run.completed", content: "01JC9W8R…" },
  ];
}

function dayThreeEvents(message: string): readonly EventRow[] {
  return [
    { type: "user.message", content: message },
    { type: "run.started", content: "01JCF3M2…" },
    { type: "tool.use.started", toolName: "read", content: "outputs/regions.csv" },
    { type: "tool.use.started", toolName: "bash", content: "python analyze.py sales.csv --by channel" },
    { type: "file.changed", content: "outputs/chart.png" },
    { type: "file.changed", content: "outputs/report.md" },
    { type: "run.completed", content: "01JCF3M2…" },
  ];
}

type FileRow = { readonly kind: "attachment" | "artifact"; readonly name: string; readonly mimeType: string };

const DAY_ONE_FILES: readonly FileRow[] = [
  { kind: "attachment", name: "sales.csv", mimeType: "text/csv" },
  { kind: "artifact", name: "report.md", mimeType: "text/markdown" },
  { kind: "artifact", name: "chart.png", mimeType: "image/png" },
  { kind: "artifact", name: "regions.csv", mimeType: "text/csv" },
];

// Animation order, one step per row: the day 1 events stream in, then the
// files, the two-days-later marker, the follow-up and its events.
const FILES_FIRST_STEP = 11;
const GAP_STEP = FILES_FIRST_STEP + DAY_ONE_FILES.length;
const FOLLOW_UP_STEP = GAP_STEP + 1;
const DAY_THREE_FIRST_STEP = FOLLOW_UP_STEP + 1;

function rowStyle(step: number): CSSProperties {
  return { "--row-index": step } as CSSProperties;
}

function Code({ lines }: { lines: readonly CodeLine[] }): ReactElement {
  return (
    <pre
      translate="no"
      className="text-ink-900 m-0 font-mono text-[12.5px] leading-[1.65] whitespace-pre-wrap [overflow-wrap:anywhere] sm:text-[13px]"
    >
      {lines.map((codeLine, lineIndex) => (
        <span
          // Lines of a static sample: the index is a stable key.
          key={lineIndex}
          className="block"
          // Hanging indent: a wrapped line continues two columns further in.
          style={{ paddingLeft: `${codeLine.indent * 2 + 2}ch`, textIndent: "-2ch" }}
        >
          {codeLine.tokens.map(([kind, text], tokenIndex) => (
            <span key={tokenIndex} className={TOKEN_CLASS[kind]}>
              {text}
            </span>
          ))}
        </span>
      ))}
    </pre>
  );
}

function Panel({
  lane,
  title,
  endpoint,
  aside,
  children,
  className,
  style,
}: {
  lane: string;
  title: string;
  endpoint?: string;
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}): ReactElement {
  return (
    <div
      className={cn("border-border-strong bg-paper-50 min-w-0 rounded-[10px] border", className)}
      style={style}
    >
      <div className="border-border-soft flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 border-b px-3 py-2.5 sm:px-4">
        <p className="flex items-center gap-2.5 text-[14px]">
          <span className="text-ink-900 font-semibold">{title}</span>
          <span aria-hidden="true" className="bg-border-strong h-3.5 w-px" />
          <span className="text-ink-500">{lane}</span>
        </p>
        {endpoint === undefined ? null : (
          <code translate="no" className="text-ink-500 font-mono text-[12.5px]">
            <BreakAfterSlashes text={endpoint} />
          </code>
        )}
        {aside}
      </div>
      <div className="px-3 py-3.5 sm:px-4">{children}</div>
    </div>
  );
}

function EventTable({ rows, firstStep }: { rows: readonly EventRow[]; firstStep: number }): ReactElement {
  // Phones stack each row (type, then the content under it); wider screens
  // get the three API columns.
  return (
    <table
      translate="no"
      className="w-full border-collapse text-left font-mono text-[12.5px] leading-[1.5] max-sm:block sm:text-[13px]"
    >
      <caption className="sr-only">{t("Event stream (SSE)")}</caption>
      <thead className="max-sm:sr-only">
        <tr className="text-ink-500">
          <th scope="col" className="pr-3 pb-2 font-medium">
            type
          </th>
          <th scope="col" className="pr-3 pb-2 font-medium">
            toolName
          </th>
          <th scope="col" className="pb-2 font-medium">
            content
          </th>
        </tr>
      </thead>
      <tbody className="max-sm:block">
        {rows.map((row, index) => (
          <tr
            // Rows of a static sample: the index is a stable key.
            key={index}
            className="product-visual-row border-border-soft border-t max-sm:block max-sm:py-2"
            style={rowStyle(firstStep + index)}
          >
            <td className="text-ink-900 py-1.5 pr-3 align-top whitespace-nowrap max-sm:inline max-sm:p-0">
              <span
                aria-hidden="true"
                className={cn("mr-2 inline-block size-1.5 rounded-[1px] align-middle", EVENT_MARKER_CLASS[row.type])}
              />
              {row.type}
            </td>
            <td className="text-ink-500 py-1.5 pr-3 align-top max-sm:inline max-sm:p-0 max-sm:pl-2">
              {row.toolName ?? ""}
            </td>
            <td className="text-ink-700 py-1.5 align-top [overflow-wrap:anywhere] max-sm:block max-sm:p-0 max-sm:pt-0.5 max-sm:pl-3.5">
              {row.content}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function FileTable(): ReactElement {
  return (
    <table
      translate="no"
      className="w-full border-collapse text-left font-mono text-[12.5px] leading-[1.5] max-sm:block sm:text-[13px]"
    >
      <caption className="sr-only">{t("Files")}</caption>
      <thead className="max-sm:sr-only">
        <tr className="text-ink-500">
          <th scope="col" className="pr-3 pb-2 font-medium">
            kind
          </th>
          <th scope="col" className="pr-3 pb-2 font-medium">
            name
          </th>
          <th scope="col" className="pb-2 font-medium">
            mimeType
          </th>
        </tr>
      </thead>
      <tbody className="max-sm:block">
        {DAY_ONE_FILES.map((file, index) => (
          <tr
            key={file.name}
            className="product-visual-row border-border-soft border-t max-sm:flex max-sm:flex-wrap max-sm:items-center max-sm:gap-x-3 max-sm:gap-y-1 max-sm:py-2"
            style={rowStyle(FILES_FIRST_STEP + index)}
          >
            <td className="py-1.5 pr-3 align-top max-sm:p-0">
              <span
                className={cn(
                  "inline-flex rounded-[4px] px-1.5 text-[12.5px]",
                  file.kind === "artifact" ? "bg-soil-bg text-soil-fg" : "bg-paper-200 text-ink-700",
                )}
              >
                {file.kind}
              </span>
            </td>
            <td className="text-ink-900 py-1.5 pr-3 align-top max-sm:p-0">{file.name}</td>
            <td className="text-ink-500 py-1.5 align-top max-sm:p-0">{file.mimeType}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function TimeMarker({ label, children }: { label: string; children?: ReactNode }): ReactElement {
  return (
    <div className="flex flex-col gap-3 py-4 lg:flex-row lg:items-center">
      <div className="flex flex-1 items-center gap-3">
        <span aria-hidden="true" className="bg-ink-900 size-2 shrink-0 rounded-full" />
        <span className="text-ink-900 text-[15px] font-semibold whitespace-nowrap">{label}</span>
        <span aria-hidden="true" className="bg-border-strong h-px flex-1" />
      </div>
      {children}
    </div>
  );
}

function SandboxLifecycle(): ReactElement {
  return (
    <p className="flex flex-wrap items-center gap-2 text-[14px] font-semibold">
      <span className="border-ink-400 text-ink-700 inline-flex items-center gap-2 rounded-full border border-dashed px-3 py-1.5">
        <CircleDashed aria-hidden="true" className="size-4 shrink-0" />
        {t("Sandbox reclaimed while idle")}
      </span>
      <ArrowRight aria-hidden="true" className="text-ink-500 size-4 shrink-0" />
      <span className="border-green-600 inline-flex items-center gap-2 rounded-full border bg-green-50 px-3 py-1.5 text-green-800">
        <ArchiveRestore aria-hidden="true" className="size-4 shrink-0" />
        {t("Restored from the last checkpoint")}
      </span>
    </p>
  );
}

export function ProductVisual(): ReactElement {
  const firstMessage = t("Which regions grew fastest last quarter?");
  const followUpMessage = t("Now split it by sales channel. Keep the same chart style.");

  return (
    <div className="px-4 pt-10 pb-14 md:px-6 md:pt-14 md:pb-20">
      <figure aria-describedby="product-visual-description" className="mx-auto max-w-[1160px]">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-8">
          <figcaption className="text-ink-900 max-w-[560px] text-[18px] leading-[1.45] font-semibold [text-wrap:balance]">
            {t("A CSV analysis, started on day 1 and continued 2 days later in the same Session.")}
          </figcaption>
          <p className="border-border-strong bg-paper-50 text-ink-700 inline-flex max-w-[460px] items-start gap-2 self-start rounded-[10px] border px-3 py-2 text-[14px] leading-[1.5]">
            <Info aria-hidden="true" className="text-ink-500 mt-0.5 size-4 shrink-0" />
            {t("Example values. Field names and event types come from the v2 OpenAPI document.")}
          </p>
        </div>
        <p id="product-visual-description" className="sr-only">
          {t(
            "Example Session record. Your backend sends one request with a CSV attachment. mosoo streams events while the Agent runs Python in the sandbox and saves a report, a chart, and a data file under outputs/. Two days later the backend sends a follow-up to the same Thread. The sandbox had been reclaimed in between, so mosoo restores the working directory and the conversation from the last checkpoint, and the Agent updates the report.",
          )}
        </p>

        <div className="border-border-strong mt-5 rounded-[14px] border bg-paper-200/60 px-2 pb-2 sm:px-3 sm:pb-3 md:px-5 md:pb-5">
          <TimeMarker label={t("Day 1")} />
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)]">
            <Panel lane={t("Your backend")} title={t("Request")}>
              <Code lines={CREATE_REQUEST_HEAD} />
              <div className="mt-3">
                <Code lines={createRequestBody(firstMessage)} />
              </div>
              <div className="border-border-strong mt-4 border-t border-dashed pt-3">
                <Code lines={CREATE_RESPONSE} />
              </div>
            </Panel>
            <div className="grid min-w-0 grid-cols-1 content-start gap-3">
              <Panel
                lane="mosoo"
                title={t("Event stream (SSE)")}
                endpoint="GET /api/v2/threads/{threadId}/events/stream"
              >
                <EventTable rows={dayOneEvents(firstMessage)} firstStep={0} />
              </Panel>
              <Panel lane="mosoo" title={t("Files")} endpoint="GET /api/v2/threads/{threadId}/files">
                <FileTable />
              </Panel>
            </div>
          </div>

          <div className="product-visual-row" style={rowStyle(GAP_STEP)}>
            <TimeMarker label={t("2 days later")}>
              <SandboxLifecycle />
            </TimeMarker>
          </div>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)]">
            <Panel
              lane={t("Your backend")}
              title={t("Request")}
              className="product-visual-row self-start"
              style={rowStyle(FOLLOW_UP_STEP)}
              aside={
                <span className="bg-lime text-ink-900 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[14px] font-semibold">
                  <Link2 aria-hidden="true" className="size-3.5" />
                  {t("Same thread.id")}
                </span>
              }
            >
              <Code lines={FOLLOW_UP_HEAD} />
              <div className="mt-3">
                <Code lines={followUpBody(followUpMessage)} />
              </div>
            </Panel>
            <Panel
              lane="mosoo"
              title={t("Event stream (SSE)")}
              endpoint="GET /api/v2/threads/{threadId}/events/stream"
            >
              <EventTable rows={dayThreeEvents(followUpMessage)} firstStep={DAY_THREE_FIRST_STEP} />
            </Panel>
          </div>
        </div>
      </figure>
    </div>
  );
}
