// PM-02, the same Session seven days later. Turn cards are the console's
// TurnCard header (feed-turn-card.tsx, without the expand chevron, since the
// cards do not expand here); the outputs use the Files page's Artifact badge
// (soil); the cancelled turn uses the Runs status line ("cancelled ✗") and the
// Thread page's run failure notice (routes/threads/detail/run-failure-
// notice.tsx), because the event log records a cancelled run as
// `run.completed` and would read "Completed". The notice title uses danger-fg
// instead of the console's danger, which is 4.3:1 on the notice's tint.
// The captions between the turns are the copy deck's panel labels (section 3)
// with the story's seven days: the console has no such marker. The JSON
// panels show the two real output files with the private_nonce_sha256 line
// tinted in both, aligned.
// Replay: the continuation. The gap draws, the restore lands, turn 2 runs and
// completes, followup.json appears, the matching hash lines light up, and
// (when shown) turn 3 is cancelled.

import type { ReactElement, ReactNode } from "react";

import { EXAMPLE_IDS, NONCE_SHA256, OUTPUTS, TURN_1, TURN_2, TURN_3 } from "../data/example-universe";
import type { ExampleFile, ExampleTurn } from "../data/example-universe";
import { highlightLine, TOKEN_CLASS } from "../lib/highlight";
import type { KitLocale } from "../i18n";
import { consoleText, kitText, momentLabel } from "../i18n";
import { progress, reached, useReplay } from "../lib/replay";
import { CheckCircle2, CircleDashed, CircleX, FileText, RefreshCw } from "./icons";
import { ConsoleIsland, ExampleValues, ReplayControl, cx } from "./island";
import type { MomentProps } from "./island";
import { Badge, MonoText } from "./primitives";
import { TurnHeader } from "./turn-parts";

export interface SessionContinuationProps extends MomentProps {
  /** Also show turn 3, the cancellation test, with its honest outcome. */
  showCancelledTurn?: boolean | undefined;
  /**
   * The website's hero cut: the API call that created the Thread on top, no
   * domain counters, "done" lines or "Direct invocation", one-line prompts,
   * turn 1's real chart, the seven-day markers at reading size, and the two
   * outputs as short evidence rows instead of full JSON panels.
   */
  stage?: boolean | undefined;
}

const SHORT_HASH = `${NONCE_SHA256.slice(0, 8)}…${NONCE_SHA256.slice(-8)}`;
const SHORT_THREAD = `${EXAMPLE_IDS.thread.slice(0, 6)}…${EXAMPLE_IDS.thread.slice(-4)}`;
const CHART_SRC = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(OUTPUTS.chartTurn1.text)}`;

const REPLAY_MS = 4200;
const AT = {
  artifacts: 2450,
  cancelled: 3600,
  followup: 2650,
  gap: 0,
  gapDrawn: 650,
  hash: 3250,
  restored: 800,
  turn2: 1300,
  turn2Done: 2300,
} as const;

function eventsArrivedBy(turn: ExampleTurn, elapsed: number | null): ExampleTurn["events"] {
  if (elapsed === null) {
    return turn.events;
  }

  const start = Date.parse(turn.events[0]?.occurredAt ?? turn.createdAt);
  const span = Date.parse(turn.completedAt) - start;

  return turn.events.filter((event) => {
    const share = span > 0 ? (Date.parse(event.occurredAt) - start) / span : 0;
    return reached(elapsed, AT.turn2 + share * (AT.turn2Done - AT.turn2));
  });
}

function ArtifactList({ files, locale }: { files: readonly ExampleFile[]; locale: KitLocale }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
      <Badge variant="soil">{consoleText(locale, "files.artifact")}</Badge>
      {files.map((file) => (
        <span key={file.path} className="text-fg-2 inline-flex items-center gap-1 font-mono text-[12px]">
          <FileText className="text-fg-3 size-3.5" />
          {file.path}
        </span>
      ))}
    </div>
  );
}

function TurnBody({ children }: { children: ReactNode }): ReactElement {
  return (
    <div className="border-border-soft bg-paper-100 flex flex-col gap-2 border-t px-3.5 py-2.5">
      {children}
    </div>
  );
}

// The script's prompts are English in every locale.
function Prompt({ oneLine = false, text }: { oneLine?: boolean; text: string }): ReactElement {
  return (
    <p
      className={cx(
        "text-fg-2 leading-relaxed",
        oneLine ? "truncate text-[13px]" : "line-clamp-2 text-[12.5px]",
      )}
      lang="en"
      title={text}
    >
      {text}
    </p>
  );
}

/** The request that created the Thread, one line (the hero's API origin). */
function ApiOrigin({ locale }: { locale: KitLocale }): ReactElement {
  return (
    <p className="text-fg-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5 pb-3 text-[12px] leading-5">
      <ExampleValues locale={locale} />
      <span translate="no" className="text-fg-1 min-w-0 font-mono text-[13px] [overflow-wrap:anywhere]">
        POST <span className="hidden sm:inline">/api/v2/projects/{"{projectId}"}</span>
        <span className="sm:hidden">…</span>/threads <span className="text-fg-3">→</span> 201
        <span className="hidden sm:inline">
          {" "}
          <span className="text-fg-3">·</span> thread {SHORT_THREAD}
        </span>
      </span>
    </p>
  );
}

/** Turn 1's real result: the chart.svg the example code wrote, as a thumbnail. */
function ChartArtifact({ locale }: { locale: KitLocale }): ReactElement {
  return (
    <img
      src={CHART_SRC}
      alt={kitText(locale, "chartAlt")}
      width={360}
      height={132}
      className="border-border-soft hidden h-[72px] w-auto max-w-full shrink-0 self-start rounded-md border bg-white px-1 sm:block"
    />
  );
}

/**
 * The continuity check at reading size: both outputs carry the same short
 * private_nonce_sha256, so turn 2 read the nonce turn 1 left outside
 * outputs/. Neutral emphasis; the page's one accent stays on the culm.
 */
function NonceEvidence({ locale }: { locale: KitLocale }): ReactElement {
  const rows = [
    { turn: 1, file: OUTPUTS.initialJson.path, total: 230 },
    { turn: 2, file: OUTPUTS.followupJson.path, total: 250 },
  ] as const;

  return (
    <div className="border-border-soft bg-card mt-3 rounded-lg border">
      <p className="text-fg-1 border-border-soft flex flex-wrap items-center gap-x-1.5 gap-y-0.5 border-b px-3.5 py-2 text-[13px] font-semibold">
        <CheckCircle2 className="text-success size-3.5" />
        <span translate="no" className="font-mono">
          {kitText(locale, "sameNonceHash")}
        </span>
      </p>
      <dl className="divide-border-soft m-0 divide-y px-3.5">
        {rows.map((row) => (
          <div key={row.turn} className="grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-x-3 py-1.5">
            <dt className="text-fg-2 text-[13px] font-semibold">
              {consoleText(locale, "sessionEvents.turn", { number: String(row.turn) })}
            </dt>
            <dd translate="no" className="text-fg-1 m-0 flex min-w-0 flex-wrap items-baseline gap-x-3 font-mono text-[13px] leading-[1.6]">
              <span className="min-w-0 [overflow-wrap:anywhere]">{row.file}</span>
              <span className="text-fg-2 whitespace-nowrap">grand_total {row.total}</span>
              <span className="border-fg-3 border-b border-dotted whitespace-nowrap">{SHORT_HASH}</span>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function JsonPanel({
  file,
  highlight,
  locale,
}: {
  file: ExampleFile;
  highlight: boolean;
  locale: KitLocale;
}): ReactElement {
  const lines = file.text.trimEnd().split("\n");

  return (
    <div className="border-border bg-sunken min-w-0 overflow-hidden rounded-md border">
      <div className="border-border-soft flex items-center justify-between gap-2 border-b px-3 py-2">
        <MonoText className="text-fg-1 min-w-0 truncate">{file.path}</MonoText>
        <Badge variant="soil">{consoleText(locale, "files.artifact")}</Badge>
      </div>
      <pre className="text-fg-1 px-3 py-2.5 font-mono text-[12.5px] leading-[1.6] break-all whitespace-pre-wrap">
        {lines.map((line, index) => (
          <span
            key={index}
            className={cx(
              "-mx-1 block rounded-sm px-1 transition-[background-color] duration-300 ease-out",
              highlight && line.includes('"private_nonce_sha256"') ? "bg-brand-soft-hover" : null,
            )}
          >
            {highlightLine(line).map((token, tokenIndex) => (
              <span key={tokenIndex} className={TOKEN_CLASS[token.kind]}>
                {token.text}
              </span>
            ))}
          </span>
        ))}
      </pre>
    </div>
  );
}

function Gap({
  children,
  drawn,
  icon,
  large = false,
  visible,
}: {
  children: ReactNode;
  drawn: number;
  icon: ReactNode;
  large?: boolean;
  visible: boolean;
}): ReactElement {
  return (
    <div
      className={cx(
        "relative flex items-center gap-2 pl-9",
        large ? "min-h-10 py-2 text-[15px] leading-6" : "min-h-9 py-2 text-[12px] leading-4",
      )}
    >
      <span
        aria-hidden
        className="border-border-strong absolute top-0 bottom-0 left-6 origin-top border-l border-dashed"
        style={{ transform: `scaleY(${drawn})` }}
      />
      {large ? (
        // The icon keeps its own column, so a long label wraps beside it
        // instead of dropping below a lone icon on a phone.
        <span className={cx("text-fg-1 flex min-w-0 items-start gap-1.5 font-medium", visible ? null : "invisible")}>
          <span className="flex h-6 shrink-0 items-center">{icon}</span>
          <span className="flex min-w-0 flex-wrap items-center gap-x-1.5">{children}</span>
        </span>
      ) : (
        <span
          className={cx(
            "inline-flex flex-wrap items-center gap-x-1.5 gap-y-0.5",
            "text-fg-3",
            visible ? null : "invisible",
          )}
        >
          {icon}
          {children}
        </span>
      )}
    </div>
  );
}

// Two copy-deck labels on one line, with the deck's one "·" between them.
function LabelPair({ first, second }: { first: string; second: string }): ReactElement {
  return (
    <>
      <span>{first}</span>
      <span aria-hidden>·</span>
      <span>{second}</span>
    </>
  );
}

export function SessionContinuationView({
  elapsed,
  locale,
  showCancelledTurn,
  stage = false,
}: {
  elapsed: number | null;
  locale: KitLocale;
  showCancelledTurn: boolean;
  stage?: boolean;
}): ReactElement {
  const turn2Events = eventsArrivedBy(TURN_2, elapsed);
  const turn2Visible = reached(elapsed, AT.turn2);
  const turn2Done = reached(elapsed, AT.turn2Done);
  const entering = (at: number): string | null =>
    elapsed !== null && reached(elapsed, at) ? "environment-row-enter" : null;
  // Only what the replayed step adds is hidden; its space is kept, so nothing moves.
  const hidden = (at: number): string | null => (reached(elapsed, at) ? null : "invisible");

  return (
    <div className="flex flex-col">
      {stage ? (
        <ApiOrigin locale={locale} />
      ) : (
        <div className="text-fg-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 pb-2.5 text-[12px]">
          <span className="inline-flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1">
            <span>{kitText(locale, "thread")}</span>
            <MonoText className="text-fg-1 truncate">{EXAMPLE_IDS.thread}</MonoText>
            <ExampleValues locale={locale} />
          </span>
          <span>{consoleText(locale, "threads.directInvocation")}</span>
        </div>
      )}

      <section className="border-border-soft bg-card overflow-hidden rounded-lg border">
        <TurnHeader
          events={TURN_1.events}
          index={1}
          locale={locale}
          showStats={!stage}
          status="completed"
          trailing={stage ? null : <StatusLine locale={locale} status="done" />}
        />
        <TurnBody>
          <Prompt oneLine={stage} text={TURN_1.prompt} />
          {stage ? (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <ChartArtifact locale={locale} />
              <div className="min-w-0 flex-1 basis-48">
                <ArtifactList files={TURN_1.artifacts} locale={locale} />
              </div>
            </div>
          ) : (
            <ArtifactList files={TURN_1.artifacts} locale={locale} />
          )}
        </TurnBody>
      </section>

      <Gap
        drawn={progress(elapsed, AT.gap, AT.gapDrawn)}
        icon={<CircleDashed className="size-3.5" />}
        large={stage}
        visible={reached(elapsed, AT.gap + 150)}
      >
        <LabelPair first={kitText(locale, "daysLater")} second={kitText(locale, "sandboxReclaimed")} />
      </Gap>
      <div className={cx("relative", hidden(AT.restored), entering(AT.restored))}>
        <Gap drawn={1} icon={<RefreshCw className={cx(stage ? "text-fg-1" : "text-fg-2", "size-3.5")} />} large={stage} visible>
          <span className={cx(stage ? "text-fg-1" : "text-fg-2", "inline-flex flex-wrap items-center gap-x-1.5")}>
            <LabelPair first={kitText(locale, "restoredFromCheckpoint")} second={kitText(locale, "sameThreadId")} />
          </span>
        </Gap>
      </div>

      <section
        className={cx(
          "border-border-soft bg-card overflow-hidden rounded-lg border",
          turn2Visible ? entering(AT.turn2) : "invisible",
        )}
      >
        <TurnHeader
          events={turn2Events}
          index={2}
          locale={locale}
          showStats={!stage}
          status={turn2Done ? "completed" : "running"}
          trailing={turn2Done && !stage ? <StatusLine locale={locale} status="done" /> : null}
        />
        <TurnBody>
          <Prompt oneLine={stage} text={TURN_2.prompt} />
          <div className={cx(hidden(AT.artifacts), entering(AT.artifacts))}>
            <ArtifactList files={TURN_2.artifacts.slice(0, 3)} locale={locale} />
          </div>
        </TurnBody>
      </section>

      {stage ? (
        <div className={cx(hidden(AT.hash), entering(AT.hash))}>
          <NonceEvidence locale={locale} />
        </div>
      ) : (
        <>
          <div className="mt-3 grid gap-3 @xl:grid-cols-2">
            <JsonPanel file={OUTPUTS.initialJson} highlight={reached(elapsed, AT.hash)} locale={locale} />
            <div className={cx("min-w-0", hidden(AT.followup), entering(AT.followup))}>
              <JsonPanel file={OUTPUTS.followupJson} highlight={reached(elapsed, AT.hash)} locale={locale} />
            </div>
          </div>
          <p
            className={cx(
              "text-fg-2 mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[12px] leading-4",
              hidden(AT.hash),
            )}
          >
            <CheckCircle2 className="text-success size-3.5" />
            <span className="font-mono">{kitText(locale, "sameNonceHash")}</span>
            <ExampleValues locale={locale} />
          </p>
        </>
      )}

      {showCancelledTurn ? (
        <div className={cx(hidden(AT.cancelled), entering(AT.cancelled))}>
          <CancelledTurn locale={locale} />
        </div>
      ) : null}
    </div>
  );
}

function StatusLine({ locale, status }: { locale: KitLocale; status: "cancelled" | "done" }) {
  return status === "done" ? (
    <span className="text-fg-3 mt-0.5 shrink-0 text-[12px]">{consoleText(locale, "threads.statusDone")}</span>
  ) : (
    <span className="text-danger-fg mt-0.5 shrink-0 text-[12px]">
      {consoleText(locale, "threads.statusCancelled")}
    </span>
  );
}

function CancelledTurn({ locale }: { locale: KitLocale }): ReactElement {
  return (
    <section className="border-border-soft bg-card mt-4 overflow-hidden rounded-lg border">
      <div className="flex items-start justify-between gap-3 px-3.5 py-3">
        <p className="text-fg-1 text-[13px] font-semibold">
          {consoleText(locale, "sessionEvents.turn", { number: String(TURN_3.index) })}
        </p>
        <StatusLine locale={locale} status="cancelled" />
      </div>
      <TurnBody>
        <Prompt text={TURN_3.prompt} />
        <div
          className="border-danger/20 bg-danger/[0.04] flex items-start gap-2.5 rounded-lg border px-4 py-3"
          role="note"
        >
          <CircleX className="text-danger mt-0.5 size-4 shrink-0" aria-hidden />
          <div className="min-w-0">
            <div className="text-danger-fg text-[12.5px] font-semibold">
              {consoleText(locale, "threads.runCancelledTitle")}
            </div>
            <div className="text-fg-2 mt-0.5 text-[12.5px] leading-relaxed break-words">
              {consoleText(locale, "threads.runCancelledMessage")}
            </div>
          </div>
        </div>
        <p className="text-fg-3 text-[12px] leading-4">{kitText(locale, "priorCommitKept")}</p>
      </TurnBody>
    </section>
  );
}

export function SessionContinuation({
  animate = false,
  exclusive,
  locale,
  replayAt,
  scale,
  showCancelledTurn = false,
  stage = false,
}: SessionContinuationProps): ReactElement {
  const replay = useReplay({ animate, durationMs: REPLAY_MS, exclusive, replayAt });
  const name = kitText(locale, "thread");

  return (
    <ConsoleIsland label={momentLabel(locale, name)} locale={locale} replaying={replay.elapsed !== null} rootRef={replay.ref} scale={scale}>
      <SessionContinuationView
        elapsed={replay.elapsed}
        locale={locale}
        showCancelledTurn={showCancelledTurn}
        stage={stage}
      />
      <ReplayControl canReplay={replay.canReplay} locale={locale} moment={name} onReplay={replay.replay} />
    </ConsoleIsland>
  );
}
