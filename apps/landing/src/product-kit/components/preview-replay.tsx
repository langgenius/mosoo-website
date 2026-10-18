// PM-03, the console Preview replaying CSV turn 1. Rebuilt as static DOM from
// the console's class lists, without assistant-ui or streamdown:
// - routes/agent/components/agent-session-panel.tsx and -header.tsx (pane,
//   "Testing {name}" header with the pill, the 30-day retention note)
// - features/session-chat/assistant-ui/session-message-parts.tsx (user
//   bubble, assistant message, Thinking… indicator)
// - features/session-chat/tool-call-card.tsx (the <details> tool card)
// - features/session-chat/assistant-ui/session-thread-composer.tsx (composer)
// - shared/ui/markdown.tsx (artifact links, inline code)
// The composer and header controls are drawn, not wired: they carry no
// behaviour and no hover, pressed or focus states here. Artifact links open
// the real output inline instead of the console's preview sheet; their name
// is the visible path ("Preview outputs/report.md"). The conversation is the
// script's English in every locale and is marked lang="en".
// Replay: Ready becomes Working, Thinking… shimmers, the exec_command card runs
// and finishes, the reply streams at the console's pace (tau 250 ms drain,
// 20 to 800 graphemes per second), the links land, and the pill is Ready again.

import { useId, useState } from "react";
import type { ReactElement } from "react";

import {
  ASSISTANT_REPLIES,
  OUTPUTS,
  PREVIEW_AGENT_NAME,
  PROMPTS,
  TOOL_CALLS,
} from "../data/example-universe";
import type { ExampleFile, ExampleToolCall } from "../data/example-universe";
import type { KitLocale } from "../i18n";
import { consoleText, momentLabel } from "../i18n";
import { countGraphemes, parseInline, sliceTokens } from "../lib/inline-markdown";
import type { InlineToken } from "../lib/inline-markdown";
import { reached, useReplay } from "../lib/replay";
import { buildStreamSchedule, visibleGraphemes } from "../lib/stream-pacer";
import { ArrowUp, ChevronRight, FileText, Loader2, Paperclip, RotateCcw } from "./icons";
import { ConsoleIsland, ExampleValues, ReplayControl } from "./island";
import type { MomentProps } from "./island";
import { Badge, MonoText, buttonClassName } from "./primitives";

export type PreviewReplayProps = MomentProps;

const REPLAY_MS = 4800;
const AT = { ready: 4350, stream: 2450, toolDone: 2250, toolStart: 950 } as const;

// Computed once; pure, so a page without this moment drops them.
const REPLY_TOKENS = /* @__PURE__ */ parseInline(ASSISTANT_REPLIES.turn1);
const REPLY_GRAPHEMES = /* @__PURE__ */ countGraphemes(REPLY_TOKENS);
// The reply reaches the browser in five batches, one per Driver event batch.
const STREAM = /* @__PURE__ */ buildStreamSchedule(
  [0, 1, 2, 3, 4].map((batch) => ({
    atMs: AT.stream + batch * 170,
    graphemes:
      batch < 4 ? Math.floor(REPLY_GRAPHEMES / 5) : REPLY_GRAPHEMES - 4 * Math.floor(REPLY_GRAPHEMES / 5),
  })),
);

const FILES_BY_HREF: Readonly<Record<string, ExampleFile>> = {
  "outputs/chart.svg": OUTPUTS.chartTurn1,
  "outputs/report.md": OUTPUTS.reportTurn1,
};

function ThinkingIndicator({ locale }: { locale: KitLocale }): ReactElement {
  return (
    <span className="inline-flex items-center gap-1.5 text-[14px] font-medium">
      <span className="mosoo-thinking">{consoleText(locale, "chat.thinking")}</span>
      <span aria-hidden className="mosoo-thinking-dots text-fg-3 inline-flex items-center gap-[3px]">
        <span className="size-1 rounded-full bg-current" />
        <span className="size-1 rounded-full bg-current" />
        <span className="size-1 rounded-full bg-current" />
      </span>
    </span>
  );
}

function ToolCallCard({
  call,
  locale,
  running,
}: {
  call: ExampleToolCall;
  locale: KitLocale;
  running: boolean;
}): ReactElement {
  return (
    <details className="group border-border-soft bg-paper-50 text-fg-2 rounded-md border px-2.5 py-1.5 text-[12px]">
      <summary className="flex min-w-0 cursor-pointer items-center gap-2 [&::-webkit-details-marker]:hidden">
        <ChevronRight className="text-fg-3 size-3.5 shrink-0 transition-transform group-open:rotate-90" />
        {running ? <Loader2 className="text-brand-mark size-3.5 shrink-0 animate-spin" /> : null}
        <span className="text-fg-1 min-w-0 truncate font-mono font-semibold">{call.toolName}</span>
        <span className="text-fg-3 ml-auto shrink-0">
          {running ? consoleText(locale, "chat.toolRunning") : consoleText(locale, "common.done")}
        </span>
      </summary>
      <div className="mt-1.5 space-y-1.5">
        <pre className="bg-paper-200 max-h-48 overflow-auto rounded-sm p-2 font-mono text-[11.5px] leading-snug break-words whitespace-pre-wrap">
          {call.input}
        </pre>
        {running || call.output === null ? null : (
          <pre className="bg-paper-200 max-h-48 overflow-auto rounded-sm p-2 font-mono text-[11.5px] leading-snug break-words whitespace-pre-wrap">
            {call.output}
          </pre>
        )}
      </div>
    </details>
  );
}

function ReplyText({
  locale,
  onOpen,
  openHref,
  previewId,
  tokens,
}: {
  locale: KitLocale;
  onOpen: (href: string) => void;
  openHref: string | null;
  previewId: string;
  tokens: readonly InlineToken[];
}): ReactElement {
  return (
    <div className="min-w-0 max-w-full space-y-3 text-[14.5px] leading-[1.55] break-words text-inherit" lang="en">
      <p className="leading-relaxed">
        {tokens.map((token, index) => {
          switch (token.kind) {
            case "strong": {
              return (
                <strong key={index} className="font-semibold">
                  {token.text}
                </strong>
              );
            }
            case "code": {
              return (
                <code
                  key={index}
                  className="bg-sunken/70 text-foreground rounded px-1 py-0.5 font-mono text-[0.92em]"
                >
                  {token.text}
                </code>
              );
            }
            case "link": {
              return (
                <button
                  key={index}
                  aria-controls={previewId}
                  aria-expanded={openHref === token.href}
                  // The visible path is the name's subject (label in name).
                  aria-label={consoleText(locale, "threads.previewFile", { name: token.text })}
                  className="focus-visible:ring-ring inline-flex cursor-pointer items-baseline gap-1 rounded-xs underline decoration-current/40 underline-offset-3 transition-colors outline-none hover:text-current/80 focus-visible:ring-2"
                  lang={locale === "zh" ? "zh-CN" : locale}
                  onClick={() => {
                    onOpen(token.href);
                  }}
                  type="button"
                >
                  <FileText aria-hidden className="size-3.5 shrink-0 translate-y-[2px]" />
                  <span lang="en">{token.text}</span>
                </button>
              );
            }
            case "text": {
              return <span key={index}>{token.text}</span>;
            }
          }
        })}
      </p>
    </div>
  );
}

function ArtifactPreview({ file, locale }: { file: ExampleFile; locale: KitLocale }): ReactElement {
  const isSvg = file.name.endsWith(".svg");

  return (
    <div className="border-border bg-card environment-row-enter overflow-hidden rounded-md border">
      <div className="border-border-soft flex items-center justify-between gap-2 border-b px-3 py-2">
        <MonoText className="text-fg-1 min-w-0 truncate">{file.path}</MonoText>
        <Badge variant="soil">{consoleText(locale, "files.artifact")}</Badge>
      </div>
      {isSvg ? (
        <img
          alt={file.path}
          className="block h-auto w-full max-w-[360px] p-2"
          height={132}
          src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(file.text)}`}
          width={360}
        />
      ) : (
        <pre className="text-fg-1 max-h-48 overflow-auto p-3 font-mono text-[11.5px] leading-snug whitespace-pre-wrap">
          {file.text}
        </pre>
      )}
    </div>
  );
}

function AssistantMessage({
  elapsed,
  locale,
}: {
  elapsed: number | null;
  locale: KitLocale;
}): ReactElement {
  const [openHref, setOpenHref] = useState<string | null>(null);
  const previewId = useId();
  const toolShown = reached(elapsed, AT.toolStart);
  const toolRunning = toolShown && !reached(elapsed, AT.toolDone);
  const visible = visibleGraphemes(STREAM, elapsed);
  const tokens = visible >= REPLY_GRAPHEMES ? REPLY_TOKENS : sliceTokens(REPLY_TOKENS, visible);
  const openFile = openHref === null ? undefined : FILES_BY_HREF[openHref];

  return (
    <div className="group/aui-msg flex min-w-0 justify-start">
      <div className="text-fg-1 w-full min-w-0 text-[14.5px] leading-[1.55]">
        <div className="flex min-w-0 flex-col gap-2">
          {toolShown ? null : <ThinkingIndicator locale={locale} />}
          {toolShown ? (
            <ToolCallCard call={TOOL_CALLS.turn1Analyze} locale={locale} running={toolRunning} />
          ) : null}
          {visible > 0 ? (
            <ReplyText
              locale={locale}
              onOpen={(href) => {
                setOpenHref((current) => (current === href ? null : href));
              }}
              openHref={openHref}
              previewId={previewId}
              tokens={tokens}
            />
          ) : null}
          <div hidden={openFile === undefined} id={previewId}>
            {openFile === undefined ? null : <ArtifactPreview file={openFile} locale={locale} />}
          </div>
        </div>
      </div>
    </div>
  );
}

export function PreviewReplayView({
  elapsed,
  locale,
}: {
  elapsed: number | null;
  locale: KitLocale;
}): ReactElement {
  const working = elapsed !== null && !reached(elapsed, AT.ready);

  return (
    <div className="border-border bg-paper-200 flex flex-col overflow-hidden rounded-lg border">
      <div className="border-border-soft bg-card flex h-10 shrink-0 items-center gap-2 border-b px-4">
        <span className="text-foreground min-w-0 truncate text-[12px] font-medium">
          {consoleText(locale, "agent.testing", { name: PREVIEW_AGENT_NAME })}
        </span>
        <Badge variant={working ? "brand" : "success"}>
          {consoleText(locale, working ? "agent.pillWorking" : "agent.pillReady")}
        </Badge>
        <ExampleValues locale={locale} />
        <div className="flex-1" />
        <span
          aria-hidden
          className={buttonClassName({ className: "gap-1.5", drawn: true, size: "xs", variant: "ghost" })}
        >
          <RotateCcw className="size-3" />
          <span className="hidden @md:inline">{consoleText(locale, "agent.resetChat")}</span>
        </span>
      </div>

      {/* The console writes a bare border-b here, which Tailwind 4 paints in
          currentColor; the contract's hairline is the soft border. */}
      <p className="text-fg-3 border-border-soft border-b px-4 py-2 text-xs leading-relaxed">
        {consoleText(locale, "agent.previewRetention")}
      </p>

      <div className="p-4 @xl:p-6">
        <div className="mx-auto flex w-full min-w-0 flex-col gap-2 @xl:w-2/3">
          <div className="flex min-w-0 justify-start">
            <div className="bg-paper-300 text-fg-heading max-w-[82%] min-w-0 rounded-lg rounded-tl-[4px] px-4 py-3 text-[14.5px] leading-[1.55]">
              <div className="break-words whitespace-pre-wrap" lang="en">
                {PROMPTS.turn1}
              </div>
            </div>
          </div>
          {elapsed === null ? (
            <AssistantMessage elapsed={null} locale={locale} />
          ) : (
            // Replay: the final message holds the space so nothing below moves.
            <div className="grid *:col-start-1 *:row-start-1">
              <div aria-hidden className="invisible">
                <AssistantMessage elapsed={null} locale={locale} />
              </div>
              <AssistantMessage elapsed={elapsed} locale={locale} />
            </div>
          )}
        </div>
      </div>

      <div className="relative z-10 mx-auto w-full shrink-0 px-4 pb-4 @xl:w-2/3 @xl:px-0">
        <div aria-hidden className="border-border-strong bg-card rounded-lg border">
          <div className="text-fg-3 px-3.5 pt-3 pb-1 text-[14.5px] leading-[1.5]">
            {consoleText(locale, "chat.describeTask")}
          </div>
          <div className="flex items-center justify-between px-2 pb-2">
            <span className={buttonClassName({ drawn: true, pill: true, size: "icon-sm", variant: "ghost-quiet" })}>
              <Paperclip className="size-4" />
            </span>
            <span className={buttonClassName({ drawn: true, pill: true, size: "icon-sm" })}>
              {working ? (
                <span className="size-2.5 rounded-[2px] bg-current" />
              ) : (
                <ArrowUp className="size-4" />
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PreviewReplay({ animate = false, exclusive, locale, replayAt, scale }: PreviewReplayProps): ReactElement {
  const replay = useReplay({ animate, durationMs: REPLAY_MS, exclusive, replayAt });
  const name = consoleText(locale, "agent.testing", { name: PREVIEW_AGENT_NAME });

  return (
    <ConsoleIsland label={momentLabel(locale, name)} locale={locale} replaying={replay.elapsed !== null} rootRef={replay.ref} scale={scale}>
      <PreviewReplayView elapsed={replay.elapsed} locale={locale} />
      <ReplayControl canReplay={replay.canReplay} locale={locale} moment={name} onReplay={replay.replay} />
    </ConsoleIsland>
  );
}
