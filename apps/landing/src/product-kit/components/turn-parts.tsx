// Pieces of the console's TurnCard (apps/web/src/shared/ui/session-events/
// feed-turn-card.tsx) shared by the turn moments: the header line and the
// per-domain stats. The title is a <p>, not the console's <h3>, so a product
// moment adds nothing to the page's heading outline. The console's header is
// a button with an expand chevron; here the card does not expand, so the
// header is plain text and has no chevron.

import type { ReactElement, ReactNode } from "react";

import type { KitLocale } from "../i18n";
import { consoleText } from "../i18n";
import {
  SESSION_EVENT_DOMAIN_TONE,
  SESSION_EVENT_FILTER_DOMAINS,
  calculateTurnDurationMs,
  countSessionTurnDomains,
  formatTotalDuration,
  getSessionEventDomainLabel,
  turnStatusClassName,
  turnStatusLabel,
} from "../lib/session-events";
import type { SessionProcessEvent, SessionTurnStatus } from "../lib/session-events";
import { Clock3 } from "./icons";
import { cx } from "./island";

export function TurnStats({
  events,
  locale,
}: {
  events: readonly SessionProcessEvent[];
  locale: KitLocale;
}): ReactElement {
  const counts = countSessionTurnDomains(events);

  return (
    <div className="text-fg-3 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px]">
      {SESSION_EVENT_FILTER_DOMAINS.map((domain) => (
        <span key={domain} className="inline-flex items-center gap-1">
          <span className={cx("size-1.5 rounded-sm", SESSION_EVENT_DOMAIN_TONE[domain].swatch)} />
          {counts[domain]} {getSessionEventDomainLabel(domain, locale)}
        </span>
      ))}
    </div>
  );
}

export function TurnHeader({
  events,
  index,
  locale,
  status,
  trailing,
}: {
  events: readonly SessionProcessEvent[];
  index: number;
  locale: KitLocale;
  status: SessionTurnStatus;
  trailing?: ReactNode;
}): ReactElement {
  return (
    <div className="flex items-start justify-between gap-3 px-3.5 py-3">
      <div className="min-w-0 flex-1 text-left">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-fg-1 text-[13px] font-semibold">
            {consoleText(locale, "sessionEvents.turn", { number: String(index) })}
          </p>
          <span
            className={cx(
              "rounded-sm border px-1 py-0.5 text-[10.5px] font-semibold",
              turnStatusClassName(status),
            )}
          >
            {turnStatusLabel(status, locale)}
          </span>
          <span className="text-fg-3 inline-flex items-center gap-1 text-[11px] tabular-nums">
            <Clock3 className="size-3" />
            {formatTotalDuration(calculateTurnDurationMs(events))}
          </span>
        </div>
        <div className="mt-1">
          <TurnStats events={events} locale={locale} />
        </div>
      </div>
      {trailing}
    </div>
  );
}
