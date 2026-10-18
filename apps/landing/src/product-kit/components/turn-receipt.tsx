// PM-01, the receipt of one turn. Composed from the console's TurnCard and
// SessionEventRow (apps/web/src/shared/ui/session-events/feed-turn-card.tsx)
// and the drawer's SessionTimelineBar and SessionEventLegend (drawer-core.tsx),
// classes unchanged. Differences: the card is always expanded and has no
// "Open event details" button (the timeline is shown inline instead), rows are
// not buttons, below 36rem the rows drop the domain and status columns, and
// the timeline bar is a picture of the rows: hidden from assistive technology
// and not focusable, its hover highlight kept for pointers.
// Replay: the commit step. The turn reads Running, then the reply, the
// outputs scan and Run completed arrive, the bar grows, and it flips to
// Completed.

import { useState } from "react";
import type { ReactElement } from "react";

import { TURN_1, TURN_2 } from "../data/example-universe";
import type { ExampleTurn } from "../data/example-universe";
import type { KitLocale } from "../i18n";
import { consoleText, momentLabel } from "../i18n";
import { progress, reached, useReplay } from "../lib/replay";
import {
  SESSION_EVENT_DOMAIN_TONE,
  SESSION_EVENT_FILTER_DOMAINS,
  clipPreview,
  countSessionTurnDomains,
  formatEventTime,
  formatTotalDuration,
  getSessionEventChipTone,
  getSessionEventDomain,
  getSessionEventDomainLabel,
  getSessionEventLabel,
  getSessionEventStatusLabel,
  isSessionEventAttentionWorthy,
  isSessionEventVisibleInMainFeed,
  statusClassName,
  summarizeSessionEvent,
} from "../lib/session-events";
import type { SessionProcessEvent } from "../lib/session-events";
import { ConsoleIsland, ExampleValues, ReplayControl, cx } from "./island";
import type { MomentProps } from "./island";
import { TurnHeader } from "./turn-parts";

export interface TurnReceiptProps extends MomentProps {
  /** Which CSV turn to show; the receipt is designed around turn 1. */
  turn?: 1 | 2 | undefined;
}

const REPLAY_MS = 3600;
const GROW_MS = 360;
// When each event of the last step arrives, in replay milliseconds.
const LAST_STEP_ARRIVALS = [450, 1500, 2550, 2650];

function lastStepArrivals(events: readonly SessionProcessEvent[]): number[] {
  const lastToolResult = events.findLastIndex((event) => event.type === "tool.use.completed");

  return events.map((_, index) =>
    index <= lastToolResult
      ? Number.NEGATIVE_INFINITY
      : (LAST_STEP_ARRIVALS[index - lastToolResult - 1] ?? 0),
  );
}

function SessionEventLegend({
  events,
  locale,
}: {
  events: readonly SessionProcessEvent[];
  locale: KitLocale;
}): ReactElement {
  const counts = countSessionTurnDomains(events);

  return (
    <div className="text-fg-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10.5px]">
      {SESSION_EVENT_FILTER_DOMAINS.map((domain) => (
        <span key={domain} className="inline-flex items-center gap-1">
          <span className={cx("size-2 rounded-sm", SESSION_EVENT_DOMAIN_TONE[domain].swatch)} />
          <span>
            {getSessionEventDomainLabel(domain, locale)} {counts[domain]}
          </span>
        </span>
      ))}
      <span className="inline-flex items-center gap-1">
        <span className="border-danger/40 bg-danger/40 size-2 rounded-sm border" />
        <span>{consoleText(locale, "common.error")}</span>
      </span>
    </div>
  );
}

function SessionEventRow({
  arriving,
  event,
  hidden,
  locale,
  selected,
}: {
  arriving: boolean;
  event: SessionProcessEvent;
  hidden: boolean;
  locale: KitLocale;
  selected: boolean;
}): ReactElement {
  const domain = getSessionEventDomain(event.type);
  const chipTone = getSessionEventChipTone(event);

  return (
    <div
      aria-hidden={hidden || undefined}
      className={cx(
        "group relative grid h-11 w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 overflow-hidden rounded-md border bg-card pr-2 pl-3 text-left transition-colors @xl:grid-cols-[136px_minmax(118px,0.55fr)_minmax(0,1.45fr)_76px_82px]",
        selected ? "border-emphasis/35 ring-1 ring-emphasis/35 ring-inset" : "border-border-soft",
        hidden ? "invisible" : null,
        arriving ? "environment-row-enter" : null,
      )}
    >
      <span
        className={cx(
          "inline-flex items-center justify-self-start whitespace-nowrap rounded-sm px-1 py-0.5 text-[10px] font-semibold",
          chipTone.chip,
        )}
      >
        {getSessionEventLabel(event.type, locale)}
      </span>
      <span className="text-fg-1 hidden truncate text-[12px] font-semibold @xl:block">
        {getSessionEventDomainLabel(domain, locale)}
      </span>
      {/* Event contents are the runtime's own text, in English in every locale. */}
      <span className="text-fg-3 min-w-0 truncate text-[12px]" lang="en">
        {clipPreview(summarizeSessionEvent(event, locale))}
      </span>
      <span className="text-fg-3 justify-self-end font-mono text-[10.5px] tabular-nums">
        {formatEventTime(event.occurredAt, locale)}
      </span>
      <span
        className={cx(
          "hidden justify-self-end rounded-sm border px-1 py-0.5 text-[10px] font-semibold @xl:block",
          statusClassName(event.status),
        )}
      >
        {getSessionEventStatusLabel(event.status, locale)}
      </span>
    </div>
  );
}

// A picture of the rows below: decorative for assistive technology and the
// keyboard (the rows are the accessible list); a pointer over a segment
// highlights its row, as in the console.
function SessionTimelineBar({
  events,
  grow,
  onHover,
  selectedId,
}: {
  events: readonly SessionProcessEvent[];
  grow: (event: SessionProcessEvent) => number;
  onHover: (eventId: string | null) => void;
  selectedId: string | null;
}): ReactElement {
  return (
    <div
      aria-hidden
      className="border-border-soft bg-sunken/10 flex h-7 w-full max-w-full min-w-0 items-center gap-0.5 overflow-hidden rounded-md border p-1"
      onMouseLeave={() => {
        onHover(null);
      }}
    >
      {events.map((event) => {
        const tone = SESSION_EVENT_DOMAIN_TONE[getSessionEventDomain(event.type)];
        const attention = isSessionEventAttentionWorthy(event);

        return (
          <span
            key={event.id}
            onMouseEnter={() => {
              onHover(event.id);
            }}
            style={{ flexGrow: Math.max(event.durationMs ?? 1, 1) * grow(event) }}
            className={cx(
              "h-full min-w-[2px] rounded-[1px] border transition-colors",
              attention ? "border-danger/40 bg-danger/40" : cx("border-transparent", tone.bar),
              selectedId === event.id ? "ring-1 ring-ink-900/55 ring-inset" : null,
            )}
          />
        );
      })}
    </div>
  );
}

export function TurnReceiptView({
  elapsed,
  locale,
  turn,
}: {
  elapsed: number | null;
  locale: KitLocale;
  turn: ExampleTurn;
}): ReactElement {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const arrivals = lastStepArrivals(turn.events);
  const arrivedEvents = turn.events.filter((_, index) => reached(elapsed, arrivals[index] ?? 0));
  const feedEvents = turn.events.filter(isSessionEventVisibleInMainFeed);
  const arrivedFeed = arrivedEvents.filter(isSessionEventVisibleInMainFeed);
  const completed = arrivedEvents.some((event) => event.type === "run.completed");
  const status = completed ? "completed" : "running";
  const arrivalOf = (event: SessionProcessEvent): number =>
    arrivals[turn.events.indexOf(event)] ?? Number.NEGATIVE_INFINITY;
  const timelineMs = arrivedFeed.reduce((total, event) => total + (event.durationMs ?? 0), 0);

  return (
    <section className="border-border-soft bg-card overflow-hidden rounded-lg border">
      <TurnHeader
        events={arrivedEvents}
        index={turn.index}
        locale={locale}
        status={status}
        trailing={<ExampleValues className="mt-0.5" locale={locale} />}
      />
      <div className="border-border-soft bg-paper-100 flex flex-col gap-1.5 border-t p-2.5">
        <div className="flex flex-col gap-2 px-1 pt-0.5 pb-1.5">
          <div className="text-fg-3 flex items-center justify-between text-[10.5px] tabular-nums">
            <span>0:00</span>
            <span>{formatTotalDuration(timelineMs)}</span>
          </div>
          <SessionTimelineBar
            events={arrivedFeed}
            grow={(event) => progress(elapsed, arrivalOf(event), arrivalOf(event) + GROW_MS)}
            onHover={setSelectedId}
            selectedId={selectedId}
          />
          <SessionEventLegend events={arrivedEvents} locale={locale} />
        </div>
        {feedEvents.map((event) => {
          const arrival = arrivalOf(event);

          return (
            <SessionEventRow
              key={event.id}
              arriving={elapsed !== null && Number.isFinite(arrival) && reached(elapsed, arrival)}
              event={event}
              hidden={!reached(elapsed, arrival)}
              locale={locale}
              selected={selectedId === event.id}
            />
          );
        })}
      </div>
    </section>
  );
}

export function TurnReceipt({
  animate = false,
  exclusive,
  locale,
  replayAt,
  scale,
  turn = 1,
}: TurnReceiptProps): ReactElement {
  const replay = useReplay({ animate, durationMs: REPLAY_MS, exclusive, replayAt });
  const example = turn === 2 ? TURN_2 : TURN_1;
  const name = consoleText(locale, "sessionEvents.turn", { number: String(example.index) });

  return (
    <ConsoleIsland label={momentLabel(locale, name)} locale={locale} replaying={replay.elapsed !== null} rootRef={replay.ref} scale={scale}>
      <TurnReceiptView elapsed={replay.elapsed} locale={locale} turn={example} />
      <ReplayControl canReplay={replay.canReplay} locale={locale} moment={name} onReplay={replay.replay} />
    </ConsoleIsland>
  );
}
