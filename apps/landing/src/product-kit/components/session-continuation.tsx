// PM-02, the same Session seven days later. Turn cards are the console's
// TurnCard header (feed-turn-card.tsx, collapsed); the outputs use the Files
// page's Artifact badge (soil); the cancelled turn uses the Runs status line
// ("cancelled ✗") and the Thread page's run failure notice
// (routes/threads/detail/run-failure-notice.tsx), because the event log
// records a cancelled run as `run.completed` and would read "Completed".
// The gap between turns and "Restored from checkpoint" are kit captions: the
// console has no such marker. The JSON panels show the two real output files
// with the private_nonce_sha256 line tinted in both, aligned.
// Replay: the continuation. The gap draws, the restore lands, turn 2 runs and
// completes, followup.json appears and the matching hash lines light up.

import type { ReactElement, ReactNode } from "react";

import { EXAMPLE_IDS, OUTPUTS, TURN_1, TURN_2, TURN_3 } from "../data/example-universe";
import type { ExampleFile, ExampleTurn } from "../data/example-universe";
import { highlightLine, TOKEN_CLASS } from "../lib/highlight";
import type { KitLocale } from "../i18n";
import { consoleText, kitText } from "../i18n";
import { progress, reached, useReplay } from "../lib/replay";
import { CheckCircle2, CircleDashed, CircleX, FileText, RefreshCw } from "./icons";
import { ConsoleIsland, KitFooter, cx } from "./island";
import { Badge, MonoText } from "./primitives";
import { TurnHeader } from "./turn-parts";

export interface SessionContinuationProps {
  locale: KitLocale;
  /** Replay the continuation once when first half visible (never with reduced motion). */
  animate?: boolean | undefined;
  /** Also show turn 3, the cancellation test, with its honest outcome. */
  showCancelledTurn?: boolean | undefined;
  /** Render the replay frozen at this many milliseconds (stills, docs, tests). */
  replayAt?: number | undefined;
}

const REPLAY_MS = 4200;
const AT = {
  artifacts: 2450,
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

function Prompt({ text }: { text: string }): ReactElement {
  return (
    <p className="text-fg-2 line-clamp-2 text-[12.5px] leading-relaxed" title={text}>
      {text}
    </p>
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
  visible,
}: {
  children: ReactNode;
  drawn: number;
  icon: ReactNode;
  visible: boolean;
}): ReactElement {
  return (
    <div className="relative flex min-h-9 items-center gap-2 py-2 pl-9 text-[12px] leading-4">
      <span
        aria-hidden
        className="border-border-strong absolute top-0 bottom-0 left-6 origin-top border-l border-dashed"
        style={{ transform: `scaleY(${drawn})` }}
      />
      <span className={cx("text-fg-3 inline-flex items-center gap-1.5", visible ? null : "invisible")}>
        {icon}
        {children}
      </span>
    </div>
  );
}

export function SessionContinuationView({
  elapsed,
  locale,
  showCancelledTurn,
}: {
  elapsed: number | null;
  locale: KitLocale;
  showCancelledTurn: boolean;
}): ReactElement {
  const turn2Events = eventsArrivedBy(TURN_2, elapsed);
  const turn2Visible = reached(elapsed, AT.turn2);
  const turn2Done = reached(elapsed, AT.turn2Done);
  const entering = (at: number): string | null =>
    elapsed !== null && reached(elapsed, at) ? "environment-row-enter" : null;
  const hidden = (at: number): string | null => (reached(elapsed, at) ? null : "invisible");

  return (
    <div className="flex flex-col">
      <div className="text-fg-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 pb-2.5 text-[12px]">
        <span className="inline-flex min-w-0 items-center gap-1.5">
          <span>{kitText(locale, "thread")}</span>
          <MonoText className="text-fg-1 truncate">{EXAMPLE_IDS.thread}</MonoText>
        </span>
        <span>{consoleText(locale, "threads.directInvocation")}</span>
      </div>

      <section className="border-border-soft bg-card overflow-hidden rounded-lg border">
        <TurnHeader
          events={TURN_1.events}
          expanded={false}
          index={1}
          locale={locale}
          status="completed"
          trailing={<StatusLine locale={locale} status="done" />}
        />
        <TurnBody>
          <Prompt text={TURN_1.prompt} />
          <ArtifactList files={TURN_1.artifacts} locale={locale} />
        </TurnBody>
      </section>

      <Gap
        drawn={progress(elapsed, AT.gap, AT.gapDrawn)}
        icon={<CircleDashed className="size-3.5" />}
        visible={reached(elapsed, AT.gap + 150)}
      >
        {kitText(locale, "gapReclaimed")}
      </Gap>
      <div className={cx("relative", hidden(AT.restored), entering(AT.restored))}>
        <Gap drawn={1} icon={<RefreshCw className="text-fg-2 size-3.5" />} visible>
          <span className="text-fg-2">{kitText(locale, "restoredFromCheckpoint")}</span>
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
          expanded={false}
          index={2}
          locale={locale}
          status={turn2Done ? "completed" : "running"}
          trailing={turn2Done ? <StatusLine locale={locale} status="done" /> : null}
        />
        <TurnBody>
          <Prompt text={TURN_2.prompt} />
          <div className={cx(hidden(AT.artifacts), entering(AT.artifacts))}>
            <ArtifactList files={TURN_2.artifacts.slice(0, 3)} locale={locale} />
          </div>
        </TurnBody>
      </section>

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
        <Badge variant="outline">{kitText(locale, "example")}</Badge>
      </p>

      {showCancelledTurn ? <CancelledTurn locale={locale} /> : null}
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
        <p className="text-fg-1 pl-7 text-[13px] font-semibold">
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
            <div className="text-danger text-[12.5px] font-semibold">
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
  locale,
  replayAt,
  showCancelledTurn = false,
}: SessionContinuationProps): ReactElement {
  const replay = useReplay({ animate, durationMs: REPLAY_MS, replayAt });

  return (
    <ConsoleIsland locale={locale} rootRef={replay.ref}>
      <SessionContinuationView
        elapsed={replay.elapsed}
        locale={locale}
        showCancelledTurn={showCancelledTurn}
      />
      <KitFooter canReplay={replay.canReplay} locale={locale} onReplay={replay.replay} />
    </ConsoleIsland>
  );
}
