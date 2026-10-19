import { ChevronRight, Info, Link2 } from "lucide-react";
import type { CSSProperties, ReactElement, ReactNode } from "react";

import { cn } from "@/shared/lib/class-names";

import { docsUrl } from "../links";
import { t, tp } from "./above-fold-i18n";
import { CopyButton } from "./copy-button";
import { DISPLAY_FONT, displayTracking } from "./typography";
import { ArrowLink, BreakAfterSlashes, PHRASE_CLASS, Phrases, WithCode } from "./ui";

/*
 * The product stage (copy deck §3 and §6, merged): one example Session in
 * three beats, drawn in code.
 *   1. Your backend starts a Session with one inline request (and a CSV).
 *   2. mosoo runs the turn: events stream, artifacts land under outputs/.
 *   3. Two days later a follow-up to the same thread.id continues it, after
 *      the sandbox was reclaimed and restored from the last checkpoint.
 * The How it works steps are the beats' captions, so the page tells the
 * Session story once, with one example.
 *
 * Field names, enums, event types and endpoints come from the main repo's
 * public API v2 contract (apps/api/openapi/public-api-v2.generated.json):
 * CreateProjectThreadRequest, CreateThreadResponse (201), ThreadEventLogEntry,
 * SendEventsRequest, FileResource. Attachments mount at session-files/ in the
 * Session workspace (mosoo-agent-driver src/protocol/paths), and a turn
 * without attachments cannot read them again (docs/prd/session-files.md), so
 * the Agent copies the CSV into the working directory on day 1; the
 * checkpoint brings that copy back on day 3. IDs, tool calls and file names
 * are example values. No durations, token counts or costs.
 */

const THREAD_ID = "01JC9W8Q4N7K2M5R3T6V8X0Y1Z";
const FILE_ID = "01JC9W2D5F8H1K4M7P0R3T6V9X";
const INSTRUCTIONS = "Analyze the CSV and save the results in outputs/.";
const CREATE_PATH = "/api/v2/projects/{projectId}/threads";
const EVENTS_STREAM_PATH = "/api/v2/threads/{threadId}/events/stream";

// The full create request as a backend sends it (hand-wrapped to 72 columns).
function startSessionRequest(message: string): string {
  return `curl https://cloud.mosoo.ai/api/v2/projects/$MOSOO_PROJECT_ID/threads \\
  -H "Authorization: Bearer $MOSOO_API_TOKEN" \\
  -H "Content-Type: application/json" \\
  -H "Idempotency-Key: sales-q3-analysis" \\
  -d '{
    "configuration": {
      "type": "inline",
      "harness": "claude-agent-sdk",
      "provider": "anthropic",
      "model": "claude-sonnet-5",
      "instructions": "${INSTRUCTIONS}"
    },
    "input": {
      "type": "user.message",
      "content": [{
        "type": "text",
        "text": "${message}"
      }]
    },
    "resources": [
      { "type": "file", "file_id": "${FILE_ID}" }
    ]
  }'`;
}

// An excerpt of CreateThreadResponse; "..." marks the fields left out.
const CREATE_RESPONSE = `201 Created
{
  "thread": { "id": "${THREAD_ID}", "agent_id": null, ... },
  "run": { "status": "queued", "trigger": "user_prompt", ... },
  "links": { ... }
}`;

const SHELL_TOKEN = /^curl|\s-[Hd](?=\s)|\$[A-Z_]+|"[^"]*"/g;

function withVariables(text: string): ReactNode[] {
  return text.split(/(\$[A-Z_]+)/).map((piece, index) =>
    piece.startsWith("$") ? (
      // Pieces of a fixed string: the index is a stable key.
      <span key={index} className="text-amber">
        {piece}
      </span>
    ) : (
      piece
    ),
  );
}

/** Light colouring for the one fixed sample: command and flags, environment
    variables, JSON keys and string values. */
function highlightShellLine(line: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let cursor = 0;
  for (const match of line.matchAll(SHELL_TOKEN)) {
    const token = match[0];
    const start = match.index;
    if (start > cursor) nodes.push(line.slice(cursor, start));
    if (token === "curl" || token.trimStart().startsWith("-")) {
      nodes.push(
        <span key={start} className="font-semibold text-green-300">
          {token}
        </span>,
      );
    } else if (token.startsWith("$")) {
      nodes.push(
        <span key={start} className="text-amber">
          {token}
        </span>,
      );
    } else {
      const isKey = line.slice(start + token.length).trimStart().startsWith(":");
      nodes.push(
        <span key={start} className={isKey ? "text-paper-100" : "text-green-200"}>
          {withVariables(token)}
        </span>,
      );
    }
    cursor = start + token.length;
  }
  if (cursor < line.length) nodes.push(line.slice(cursor));
  return nodes;
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

type EventRow = {
  readonly type: EventType;
  readonly toolName?: string;
  readonly content: string;
  /** Shown in the condensed list, not only in the full one. */
  readonly key?: true;
  /** Left out of the condensed list on phones, to keep the stage short. */
  readonly wideOnly?: true;
};

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

const DAY_ONE_COMMAND = "cp session-files/sales.csv . && python analyze.py sales.csv";
const FOLLOW_UP_COMMAND = "python analyze.py sales.csv --by channel";

function dayOneEvents(message: string): readonly EventRow[] {
  return [
    { type: "user.message", content: message },
    { type: "run.started", content: "01JC9W8R…", key: true },
    { type: "tool.use.started", toolName: "write", content: "analyze.py" },
    { type: "tool.use.started", toolName: "bash", content: DAY_ONE_COMMAND, key: true },
    { type: "tool.use.completed", toolName: "bash", content: DAY_ONE_COMMAND },
    { type: "file.changed", content: "outputs/chart.png" },
    { type: "file.changed", content: "outputs/regions.csv" },
    { type: "tool.use.started", toolName: "write", content: "outputs/report.md" },
    { type: "file.changed", content: "outputs/report.md", key: true },
    { type: "usage.updated", content: "Usage updated." },
    { type: "session_files.updated", content: "Session files updated." },
    { type: "run.completed", content: "01JC9W8R…", key: true },
  ];
}

function followUpEvents(message: string): readonly EventRow[] {
  return [
    { type: "user.message", content: message },
    { type: "run.started", content: "01JCF3M2…", key: true, wideOnly: true },
    { type: "tool.use.started", toolName: "read", content: "outputs/report.md" },
    { type: "tool.use.started", toolName: "bash", content: FOLLOW_UP_COMMAND, key: true },
    { type: "file.changed", content: "outputs/chart.png" },
    { type: "file.changed", content: "outputs/report.md", key: true },
    { type: "run.completed", content: "01JCF3M2…", key: true, wideOnly: true },
  ];
}

const ARTIFACTS = ["report.md", "chart.png", "regions.csv"] as const;

/** Position of a row in its beat's arrival cue (see .stage-row in app.css). */
function rowStyle(index: number): CSSProperties {
  return { "--row": index } as CSSProperties;
}

const MONO = "font-mono text-[13.5px] leading-[1.6] sm:text-[14px]";

function Panel({
  title,
  titleId,
  lane,
  endpoint,
  aside,
  children,
}: {
  title: string;
  /** Set for a beat's own panel: its title is then the beat's h3. */
  titleId?: string;
  lane: string;
  endpoint?: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
}): ReactElement {
  const Title = titleId === undefined ? "p" : "h3";
  return (
    <div className="border-border-strong bg-paper-50 min-w-0 rounded-[12px] border">
      <div className="border-border-soft flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 border-b px-3.5 py-2.5 sm:px-4">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1">
          <Title id={titleId} className={cn(PHRASE_CLASS, "text-ink-900 text-[15px] font-semibold")}>
            <Phrases text={title} />
          </Title>
          <span aria-hidden="true" className="bg-border-strong h-3.5 w-px" />
          <span className="text-ink-500 text-[14px]">{lane}</span>
        </div>
        {aside}
      </div>
      <div className="px-3.5 py-3 sm:px-4">
        {endpoint === undefined ? null : (
          <p translate="no" className={cn("text-ink-900 mb-2 [overflow-wrap:break-word]", MONO)}>
            {endpoint}
          </p>
        )}
        {children}
      </div>
    </div>
  );
}

function Endpoint({ method, children }: { method: "GET" | "POST"; children: ReactNode }): ReactElement {
  return (
    <>
      <span className="mr-2 font-semibold text-green-700">{method}</span>
      {children}
    </>
  );
}

// Phones flow each field inline (name, then value) rather than in two narrow
// columns that would wrap every value; wider screens align the values.
const FIELD_ROW_CLASS =
  "stage-row rounded-[4px] py-0.5 sm:grid sm:grid-cols-[7.5rem_minmax(0,1fr)] sm:gap-x-3 sm:py-0";
const FIELD_NAME_CLASS = "text-ink-500 max-sm:mr-2 max-sm:inline sm:py-0.5";
const FIELD_VALUE_CLASS = "max-sm:inline sm:py-0.5 [overflow-wrap:break-word]";

/** The request cut to the lines that decide the work. */
function RequestSummary({ message }: { message: string }): ReactElement {
  const rows: readonly { name: string; value: ReactNode }[] = [
    { name: "harness", value: <span className="text-green-700">"claude-agent-sdk"</span> },
    { name: "model", value: <span className="text-green-700">"claude-sonnet-5"</span> },
    { name: "instructions", value: <span className="text-green-700">"{INSTRUCTIONS}"</span> },
    { name: "input", value: <span className="text-green-700">"{message}"</span> },
    {
      name: "resources",
      value: (
        <span>
          sales.csv <span className="text-ink-500">(file)</span>
        </span>
      ),
    },
  ];
  return (
    <dl translate="no" className={MONO}>
      {rows.map((row, index) => (
        <div key={row.name} className={FIELD_ROW_CLASS} style={rowStyle(index)}>
          <dt className={FIELD_NAME_CLASS}>{row.name}</dt>
          <dd className={cn("text-ink-900", FIELD_VALUE_CLASS)}>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function ThreadId({ children }: { children: string }): ReactElement {
  return <span className="bg-lime text-ink-900 rounded-[3px] px-0.5">{children}</span>;
}

function ResponseLine(): ReactElement {
  return (
    <p
      translate="no"
      className={cn("stage-row border-border-strong mt-3 border-t border-dashed pt-3 [overflow-wrap:anywhere]", MONO)}
      style={rowStyle(5)}
    >
      <span className="mr-3 font-semibold text-green-700">201 Created</span>
      <span className="text-ink-500">thread.id </span>
      <ThreadId>{THREAD_ID}</ThreadId>
    </p>
  );
}

function EventList({ rows, condensed }: { rows: readonly EventRow[]; condensed: boolean }): ReactElement {
  const shown = condensed ? rows.filter((row) => row.key === true) : rows;
  // Phones stack each row (type, then the content under it); wider screens
  // get the three API columns.
  return (
    <table translate="no" className={cn("w-full border-collapse text-left max-sm:block", MONO)}>
      <caption className="sr-only">{t("Event stream (SSE)")}</caption>
      <thead className="sr-only">
        <tr>
          <th scope="col">type</th>
          <th scope="col">toolName</th>
          <th scope="col">content</th>
        </tr>
      </thead>
      <tbody className="max-sm:block">
        {shown.map((row, index) => (
          <tr
            // Rows of a static sample: the index is a stable key.
            key={index}
            className={cn(
              "stage-row border-border-soft border-t first:border-t-0 max-sm:block max-sm:py-1.5",
              condensed && row.wideOnly === true ? "max-sm:hidden" : undefined,
            )}
            style={rowStyle(index)}
          >
            <td className="text-ink-900 py-1.5 pr-3 align-top whitespace-nowrap max-sm:inline max-sm:p-0">
              <span
                aria-hidden="true"
                className={cn("stage-marker mr-2 inline-block size-1.5 rounded-[1px] align-middle", EVENT_MARKER_CLASS[row.type])}
              />
              {row.type}
            </td>
            <td className="text-ink-500 py-1.5 pr-3 align-top max-sm:inline max-sm:p-0 max-sm:pl-2">
              {row.toolName ?? ""}
            </td>
            <td className="text-ink-700 py-1.5 align-top [overflow-wrap:break-word] max-sm:block max-sm:p-0 max-sm:pl-3.5">
              {row.content}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** A disclosure for the full record behind a condensed view. */
function More({ summary, children }: { summary: string; children: ReactNode }): ReactElement {
  return (
    <details className="group border-border-soft mt-3 border-t pt-2">
      <summary className="text-ink-700 hover:text-ink-900 focus-visible:ring-ring inline-flex min-h-11 cursor-pointer list-none items-center gap-1.5 rounded-sm text-[14px] font-semibold outline-none focus-visible:ring-2 sm:min-h-8 [&::-webkit-details-marker]:hidden">
        <ChevronRight
          aria-hidden="true"
          className="size-4 shrink-0 transition-transform duration-150 ease-out group-open:rotate-90 motion-reduce:transition-none"
        />
        <span className={PHRASE_CLASS}>
          <Phrases text={summary} />
        </span>
      </summary>
      <div className="pt-2">{children}</div>
    </details>
  );
}

function FullRequest({ message }: { message: string }): ReactElement {
  const request = startSessionRequest(message);
  const notes: readonly (readonly [string, string])[] = [
    ["Authorization", t("A Project API key. It starts with `msp_`, is shown once, and stays on your backend.")],
    ["harness", t("The runtime for this Session: openai-runtime, claude-agent-sdk, acp-fallback, or pi.")],
    ["model", t("A model your provider key can use. Model IDs change often, so check your Project first.")],
    ["instructions", t("What the Agent does in this Session.")],
    ["resources", t("Files uploaded first with POST /api/v2/projects/{projectId}/files.")],
    ["Idempotency-Key", t("Retry with the same key for 24 hours without running the work twice.")],
  ];
  return (
    <div className="flex flex-col gap-3">
      <div className="bg-ink-900 overflow-hidden rounded-[10px]">
        <div className="border-paper-100/10 flex justify-end border-b px-2 py-1.5">
          <CopyButton
            getText={() => request}
            label={tp("Copy request")}
            copiedLabel={t("Request copied")}
            failedLabel={t("Copy failed.")}
            variant="dark"
          />
        </div>
        {/* Scrolls sideways on phones; the fade marks the cut edge, and the
            block is focusable so keyboard users can scroll it too. */}
        <div className="stage-scroll-fade relative">
          <pre
            tabIndex={0}
            translate="no"
            aria-label={t("Show the full request")}
            className="text-paper-100 focus-visible:ring-paper-100 m-0 overflow-x-auto p-3.5 font-mono text-[13.5px] leading-[1.65] outline-none focus-visible:ring-2 focus-visible:ring-inset sm:text-[14px]"
          >
            <code>
              {request.split("\n").map((codeLine, index) => (
                // Lines of a fixed sample: the index is a stable key.
                <span key={index} className="block">
                  {highlightShellLine(codeLine)}
                </span>
              ))}
            </code>
          </pre>
        </div>
      </div>
      <dl className="grid gap-x-4 gap-y-1.5 text-[15px] leading-[1.5] sm:grid-cols-[auto_minmax(0,1fr)]">
        {notes.map(([name, note]) => (
          <div key={name} className="contents">
            <dt translate="no" className="text-ink-900 font-mono text-[14px] font-semibold">
              {name}
            </dt>
            <dd className="text-ink-700 max-sm:mb-1.5">
              <WithCode text={note} />
            </dd>
          </div>
        ))}
      </dl>
      <pre
        translate="no"
        className="border-border-strong bg-paper-100 text-ink-700 m-0 overflow-x-auto rounded-[10px] border p-3.5 font-mono text-[13.5px] leading-[1.65] whitespace-pre-wrap [overflow-wrap:anywhere] sm:text-[14px]"
      >
        {CREATE_RESPONSE}
      </pre>
      <ArrowLink href={docsUrl("api-reference-v2/")} className="self-start">
        {t("Open the v2 API reference")}
      </ArrowLink>
    </div>
  );
}

function Caption({ children }: { children: string }): ReactElement {
  return (
    <p className="text-ink-700 mt-3 max-w-[560px] px-1 text-[15px] leading-[1.6] [text-wrap:pretty]">
      <WithCode text={children} />
    </p>
  );
}

/*
 * The Session drawn as a bamboo culm, from the brand mark's geometry (the
 * kit's culm symbols, redesign/kit-assets): an internode for each turn with
 * a node ring for its committed checkpoint, and a dashed internode for the
 * idle time when the sandbox was reclaimed.
 */
const INTERNODE_PATH =
  "M100 0H0C1.82 14.54 2.87 31.66 2.87 50S1.82 85.46 0 100H100C98.18 85.46 97.13 68.34 97.13 50S98.18 14.54 100 0Z";

function CulmTimeline(): ReactElement {
  const steps: readonly { label: string; tone: "turn" | "idle" | "restored" }[] = [
    { label: tp("Turn committed"), tone: "turn" },
    { label: tp("Sandbox reclaimed while idle"), tone: "idle" },
    { label: tp("Restored from the last checkpoint"), tone: "restored" },
  ];
  return (
    <ol className="mt-4 flex flex-col">
      {steps.map((step, index) => (
        <li
          key={step.tone}
          className={cn(
            "stage-row flex items-stretch gap-4",
            step.tone === "idle" ? "min-h-[52px] sm:min-h-[68px]" : "min-h-[38px] sm:min-h-[46px]",
          )}
          style={rowStyle(index)}
        >
          <svg
            aria-hidden="true"
            viewBox={step.tone === "idle" ? "0 0 100 170" : "0 0 100 115"}
            preserveAspectRatio="none"
            className="w-8 shrink-0 overflow-visible text-green-700"
          >
            {step.tone === "idle" ? (
              <path
                d={INTERNODE_PATH}
                transform="scale(1 1.6)"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.25"
                strokeDasharray="4 3"
                vectorEffect="non-scaling-stroke"
                className="text-ink-400"
              />
            ) : (
              <>
                <path d={INTERNODE_PATH} transform="scale(1 0.795)" fill="currentColor" />
                <rect
                  y="90"
                  width="100"
                  height="10"
                  className={cn("stage-ring fill-green-400", step.tone === "restored" ? "stage-ring-late" : undefined)}
                />
              </>
            )}
          </svg>
          <span
            className={cn(
              PHRASE_CLASS,
              "self-center text-[15px] font-semibold",
              step.tone === "idle" ? "text-ink-500" : "text-ink-900",
            )}
          >
            <Phrases text={step.label} />
          </span>
        </li>
      ))}
    </ol>
  );
}

/**
 * Each beat plays a short arrival cue once, when it first comes into view: a
 * light passes down its rows in order. Nothing is hidden first, so content
 * already on screen (or painted by the static page) never disappears, and
 * reduced motion skips the cue (app.css).
 */
function watchArrivals(stage: HTMLElement | null): (() => void) | undefined {
  if (stage === null || typeof IntersectionObserver === "undefined") return undefined;
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.setAttribute("data-arrived", "");
        observer.unobserve(entry.target);
      }
    },
    { threshold: 0.35 },
  );
  for (const beat of stage.querySelectorAll(".stage-beat")) observer.observe(beat);
  return () => {
    observer.disconnect();
  };
}

export function ProductVisual(): ReactElement {
  const firstMessage = t("Which regions grew fastest last quarter?");
  const followUpMessage = t("Now split it by sales channel. Keep the same chart style.");

  return (
    <section id="how-it-works" aria-labelledby="stage-title" className="px-4 pt-6 pb-14 md:px-6 md:pt-7 md:pb-16">
      <div className="mx-auto max-w-[1160px]">
        <div className="flex flex-col gap-2.5 md:flex-row md:items-center md:justify-between md:gap-10">
          <h2
            id="stage-title"
            className={cn(PHRASE_CLASS, "text-ink-900 text-[22px] leading-[1.25] [text-wrap:balance] md:text-[23px]")}
            style={{ fontFamily: DISPLAY_FONT, fontWeight: 500, letterSpacing: displayTracking("-0.015em") }}
          >
            <Phrases text={tp("One request starts a Session. A follow-up continues it 2 days later.")} />
          </h2>
          <p className="text-ink-700 inline-flex max-w-[420px] shrink-0 items-start gap-2 text-[14px] leading-[1.5]">
            <Info aria-hidden="true" className="text-ink-500 mt-0.5 size-4 shrink-0" />
            {t("Example values. Field names and event types come from the v2 OpenAPI document.")}
          </p>
        </div>

        <div
          ref={watchArrivals}
          className="stage-track border-border-strong bg-paper-200/60 mt-4 rounded-[18px] sm:border sm:p-3"
        >
          <div className="grid grid-cols-1 gap-x-3 gap-y-8 sm:gap-y-6 lg:grid-cols-[minmax(0,1.04fr)_minmax(0,1fr)]">
            <article aria-labelledby="stage-start" className="stage-beat min-w-0">
              <Panel
                title={tp("Start a Session")}
                titleId="stage-start"
                lane={t("Your backend")}
                endpoint={
                  <Endpoint method="POST">
                    <BreakAfterSlashes text={CREATE_PATH} />
                  </Endpoint>
                }
              >
                <RequestSummary message={firstMessage} />
                <ResponseLine />
                <More summary={tp("Show the full request")}>
                  <FullRequest message={firstMessage} />
                </More>
              </Panel>
              <Caption>
                {t(
                  "With a provider key in your Project, one request starts the Session. Keep the `thread.id` it returns.",
                )}
              </Caption>
            </article>

            <article aria-labelledby="stage-run" className="stage-beat min-w-0">
              <Panel
                title={tp("mosoo runs the turn")}
                titleId="stage-run"
                lane={t("Event stream (SSE)")}
                endpoint={
                  <Endpoint method="GET">
                    <BreakAfterSlashes text={EVENTS_STREAM_PATH} />
                  </Endpoint>
                }
              >
                <EventList rows={dayOneEvents(firstMessage)} condensed />
                <div className="stage-row border-border-soft mt-2 border-t pt-3" style={rowStyle(4)}>
                  <p className={cn(PHRASE_CLASS, "text-ink-500 text-[14px] font-semibold")}>
                    <Phrases text={tp("Artifacts in outputs/")} />
                  </p>
                  <ul translate="no" className="mt-2 flex flex-wrap gap-1.5 sm:gap-2">
                    {ARTIFACTS.map((name) => (
                      <li
                        key={name}
                        className="bg-soil-bg text-soil-fg rounded-[5px] px-1.5 py-0.5 font-mono text-[13.5px] sm:px-2 sm:text-[14px]"
                      >
                        {name}
                      </li>
                    ))}
                  </ul>
                </div>
                <More summary={tp("Show all 12 events")}>
                  <EventList rows={dayOneEvents(firstMessage)} condensed={false} />
                </More>
              </Panel>
              <Caption>
                {t(
                  "The Agent runs code in the Session’s own sandbox, and your keys stay outside it. Events are saved, then streamed. The turn ends with artifacts, usage, and a checkpoint.",
                )}
              </Caption>
            </article>
          </div>

          <article
            aria-labelledby="stage-later"
            className="stage-beat border-border-strong mt-8 grid min-w-0 grid-cols-1 gap-x-8 gap-y-5 sm:mt-3 sm:rounded-[12px] sm:border sm:bg-paper-100 sm:p-5 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]"
          >
            <div className="min-w-0">
              <h3
                id="stage-later"
                className={cn(PHRASE_CLASS, "text-ink-900 text-[30px] leading-[1.1] md:text-[36px]")}
                style={{ fontFamily: DISPLAY_FONT, fontWeight: 500, letterSpacing: displayTracking("-0.02em") }}
              >
                <Phrases text={tp("2 days later")} />
              </h3>
              <CulmTimeline />
              <Caption>
                {t(
                  "Reply whenever you’re ready. A follow-up to the same `thread.id` continues the Session, and `sales.csv`, copied into the working directory on day 1, comes back with the checkpoint.",
                )}
              </Caption>
            </div>

            <div className="grid min-w-0 content-start gap-3">
              <Panel
                title={tp("Follow-up")}
                lane={t("Your backend")}
                aside={
                  <span className="bg-lime text-ink-900 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[14px] font-semibold">
                    <Link2 aria-hidden="true" className="size-3.5" />
                    {t("Same thread.id")}
                  </span>
                }
                endpoint={
                  <Endpoint method="POST">
                    /api/v2/threads/
                    <wbr />
                    <ThreadId>{THREAD_ID}</ThreadId>
                    <wbr />
                    /events
                  </Endpoint>
                }
              >
                <dl translate="no" className={MONO}>
                  <div className={FIELD_ROW_CLASS} style={rowStyle(0)}>
                    <dt className={FIELD_NAME_CLASS}>type</dt>
                    <dd className={cn("text-green-700", FIELD_VALUE_CLASS)}>"user_message"</dd>
                  </div>
                  <div className={FIELD_ROW_CLASS} style={rowStyle(1)}>
                    <dt className={FIELD_NAME_CLASS}>text</dt>
                    <dd className={cn("text-green-700", FIELD_VALUE_CLASS)}>"{followUpMessage}"</dd>
                  </div>
                </dl>
              </Panel>
              <Panel title={tp("mosoo runs the turn")} lane={t("Event stream (SSE)")}>
                <EventList rows={followUpEvents(followUpMessage)} condensed />
                <More summary={tp("Show all 7 events")}>
                  <EventList rows={followUpEvents(followUpMessage)} condensed={false} />
                </More>
              </Panel>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
