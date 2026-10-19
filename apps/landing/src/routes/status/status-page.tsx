import { Menu } from "@base-ui/react/menu";
import { ArrowUpRight, Check, ChevronDown, ChevronLeft, ChevronRight, Minus } from "lucide-react";
import { useEffect, useId, useState } from "react";
import type { ReactElement, ReactNode } from "react";

import { cn } from "@/shared/lib/class-names";
import { locale } from "@/shared/locale";

import { MOSOO_INCIDENTS_URL, MOSOO_ISSUES_URL, MOSOO_X_URL } from "../login/links";
import { t } from "./i18n";
import { INCIDENTS } from "./incidents";
import type { IncidentRecord } from "./incidents";

type ComponentStatus = "degraded" | "operational" | "unknown";

/** Everything a status glyph can express: the feed's three states plus the first load. */
type Tone = ComponentStatus | "loading";

type ObservationUnit = "invocations" | "Runs";

interface StatusDay {
  date: string;
  succeeded: number;
  total: number;
}

interface PlatformStatus {
  failedInvocations90d: number;
  history: StatusDay[];
  invocations90d: number;
  lastObservedAt: string | null;
  latestHttpStatus: number | null;
  latestOutcome: string | null;
  status: ComponentStatus;
  successRate90d: number | null;
}

interface StatusComponent {
  completedRuns90d: number;
  consecutiveFailures: number;
  failedRuns90d: number;
  history: StatusDay[];
  id: string;
  lastObservedAt: string | null;
  latestDurationMs: number | null;
  latestErrorCode: string | null;
  latestStatus: string | null;
  name: string;
  runs90d: number;
  status: ComponentStatus;
  successRate90d: number | null;
}

interface StatusPayload {
  components: StatusComponent[];
  platform: PlatformStatus;
  status: ComponentStatus;
  updatedAt: string | null;
  version: 2;
}

interface Fact {
  label: string;
  value: string;
}

interface Notice {
  body: ReactNode;
  eyebrow: string;
  key: string;
  link?: { href: string; label: string };
  tone: Tone;
}

const STATUS_FEED_URL = "/status.json";
const REFRESH_INTERVAL_MS = 60_000;
const HISTORY_DAYS = 90;
const RECENT_NOTICE_WINDOW_MS = 7 * 86_400_000;

// v5 (app.css "status"): no green anywhere. Operational is ink; amber is the
// only colour, for a degraded service.
const TONE_CLASS = {
  degraded: "sp-glyph--degraded",
  loading: "sp-glyph--loading",
  operational: "sp-glyph--operational",
  unknown: "sp-glyph--unknown",
} satisfies Record<Tone, string>;

const TONE_LABEL = {
  degraded: () => t("Degraded"),
  loading: () => t("Checking current status…"),
  operational: () => t("Operational"),
  unknown: () => t("Unknown"),
} satisfies Record<Tone, () => string>;

const UPDATE_CHANNELS = [
  {
    caption: "/status.json",
    external: false,
    href: STATUS_FEED_URL,
    label: () => t("Status JSON feed"),
  },
  {
    caption: "github.com",
    external: true,
    href: MOSOO_INCIDENTS_URL,
    label: () => t("Incident records"),
  },
  { caption: "x.com", external: true, href: MOSOO_X_URL, label: () => t("mosoo on X") },
] as const;

function formatDuration(value: number | null): string {
  if (value === null) return "—";
  return value < 1_000 ? `${value} ms` : `${(value / 1_000).toFixed(1)} s`;
}

function formatRate(value: number | null): string {
  if (value === null) return "—";
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    style: "percent",
  }).format(value);
}

function formatCount(value: number): string {
  return value.toLocaleString(locale);
}

function formatTimestamp(value: string | null): string {
  if (value === null) return t("No production signal yet");
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    timeZoneName: "short",
    year: "numeric",
  }).format(new Date(value));
}

/** Calendar dates (`YYYY-MM-DD`) are UTC days, so they must not shift with the viewer's zone. */
function formatDay(value: string): string {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00Z`));
}

function fillTemplate(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => values[key] ?? match);
}

/** `labelled={false}` where the text next to the glyph already says the state. */
function StatusGlyph({
  labelled = true,
  size = "sm",
  tone,
}: {
  labelled?: boolean;
  size?: "lg" | "sm";
  tone: Tone;
}): ReactElement {
  return (
    <span className={cn("sp-glyph", size === "lg" && "sp-glyph--lg", TONE_CLASS[tone])}>
      {tone === "operational" ? (
        <Check aria-hidden="true" strokeWidth={3.25} />
      ) : tone === "degraded" ? (
        <span aria-hidden="true">!</span>
      ) : (
        <Minus aria-hidden="true" strokeWidth={3.25} />
      )}
      {labelled ? <span className="sr-only">{TONE_LABEL[tone]()}</span> : null}
    </span>
  );
}

function dayTone(day: StatusDay): string {
  if (day.total === 0) return "sp-day";
  if (day.succeeded === day.total) return "sp-day sp-day--operational";
  if (day.succeeded === 0) return "sp-day sp-day--failed";
  return "sp-day sp-day--partial";
}

function DayTooltip({
  day,
  index,
  unit,
}: {
  day: StatusDay;
  index: number;
  unit: ObservationUnit;
}): ReactElement {
  // Segments near either edge pin the tooltip to that edge so it never leaves the card.
  const nearStart = index < 8;
  const nearEnd = index > HISTORY_DAYS - 9;
  const failed = day.total - day.succeeded;
  const summary =
    day.total === 0
      ? t("No data")
      : [
          `${formatCount(day.total)} ${t(unit)}`,
          formatRate(day.succeeded / day.total),
          ...(failed > 0
            ? [fillTemplate(t("{count} failed"), { count: formatCount(failed) })]
            : []),
        ].join(" · ");

  return (
    <div
      role="tooltip"
      className={cn("sp-tip", nearStart ? "left-0" : nearEnd ? "right-0" : "-translate-x-1/2")}
      style={
        nearStart || nearEnd ? undefined : { left: `${((index + 0.5) / HISTORY_DAYS) * 100}%` }
      }
    >
      <p>{formatDay(day.date)}</p>
      <p>{summary}</p>
    </div>
  );
}

function HistoryAxis(): ReactElement {
  return (
    <div className="sp-axis">
      <span>
        <ChevronLeft aria-hidden="true" className="size-3.5" />
        {t("90 days ago")}
      </span>
      <span>{t("Today")}</span>
    </div>
  );
}

function HistoryBar({
  history,
  label,
  rate,
  unit,
}: {
  history: StatusDay[];
  label: string;
  rate: number | null;
  unit: ObservationUnit;
}): ReactElement {
  const [hovered, setHovered] = useState<number | null>(null);
  const hoveredDay = hovered === null ? undefined : history[hovered];

  return (
    <div>
      <div className="sp-bars-wrap">
        <div
          role="img"
          aria-label={`${label}: ${formatRate(rate)}`}
          onMouseLeave={() => setHovered(null)}
          className="sp-bars"
        >
          {history.map((day, index) => (
            <span
              key={day.date}
              aria-hidden="true"
              onMouseEnter={() => setHovered(index)}
              data-hover={hovered === index ? "" : undefined}
              className={dayTone(day)}
            />
          ))}
        </div>
        {hoveredDay && hovered !== null ? (
          <DayTooltip day={hoveredDay} index={hovered} unit={unit} />
        ) : null}
      </div>
      <HistoryAxis />
    </div>
  );
}

function ServiceRow({
  barLabel,
  description,
  detail,
  facts,
  history,
  name,
  rate,
  rateTemplate,
  status,
  unit,
}: {
  barLabel: string;
  description: string;
  detail: string;
  facts: Fact[];
  history: StatusDay[];
  name: string;
  rate: number | null;
  rateTemplate: "{rate} completion" | "{rate} success";
  status: ComponentStatus;
  unit: ObservationUnit;
}): ReactElement {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const rateText = rate === null ? "—" : fillTemplate(t(rateTemplate), { rate: formatRate(rate) });
  // The figure takes the row's current tone, so a stale runtime's rate does not read as healthy.
  const rateClass =
    rate !== null && status === "operational"
      ? "sp-rate--operational"
      : rate !== null && status === "degraded"
        ? "sp-rate--degraded"
        : "sp-rate--quiet";

  return (
    <section className="sp-row">
      <div className="sp-row-head">
        <h3 className="sp-row-name">
          <button
            type="button"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((value) => !value)}
            className="sp-row-toggle"
          >
            <StatusGlyph tone={status} />
            <span>{name}</span>
            <ChevronRight aria-hidden="true" className="sp-chev" />
          </button>
        </h3>
        <p className={cn("sp-rate", rateClass)}>{rateText}</p>
      </div>

      <HistoryBar history={history} label={barLabel} rate={rate} unit={unit} />

      <div id={panelId} hidden={!open} className="sp-panel">
        <p className="sp-panel-detail">{detail}</p>
        <p className="sp-panel-desc">{description}</p>
        <dl className="sp-facts">
          {facts.map((fact) => (
            <div key={fact.label}>
              <dt>{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function PlatformRow({
  feedUnavailable,
  platform,
}: {
  feedUnavailable: boolean;
  platform: PlatformStatus;
}): ReactElement {
  const status = feedUnavailable ? "unknown" : platform.status;
  const detail =
    status === "unknown"
      ? t("Waiting for a fresh Worker invocation")
      : status === "operational"
        ? t("Worker invocations are succeeding")
        : t("A production invocation failed");

  return (
    <ServiceRow
      name={t("Mosoo API & control plane")}
      status={status}
      detail={detail}
      description={t(
        "Cloudflare reports whether the production API and control plane complete their invocations successfully.",
      )}
      rate={platform.successRate90d}
      rateTemplate="{rate} success"
      history={platform.history}
      barLabel={t("90-day invocation success")}
      unit="invocations"
      facts={[
        { label: t("Latest outcome"), value: platform.latestOutcome ?? "—" },
        {
          label: t("HTTP status"),
          value: platform.latestHttpStatus === null ? "—" : String(platform.latestHttpStatus),
        },
        { label: t("Last observed"), value: formatTimestamp(platform.lastObservedAt) },
        {
          label: t("Observed invocations, 90 days"),
          value:
            platform.invocations90d === 0
              ? t("No observations yet")
              : formatCount(platform.invocations90d),
        },
      ]}
    />
  );
}

function ComponentRow({
  component,
  feedUnavailable,
}: {
  component: StatusComponent;
  feedUnavailable: boolean;
}): ReactElement {
  const status = feedUnavailable ? "unknown" : component.status;
  const detail =
    status === "unknown"
      ? t("No recent production Runs")
      : status === "degraded"
        ? t("Three consecutive observed Runs failed")
        : component.latestStatus === "completed"
          ? t("Latest observed Run completed")
          : t("Recent Run failed; incident threshold not reached");

  return (
    <ServiceRow
      name={component.name}
      status={status}
      detail={detail}
      description={t(
        "Completion rate is based only on real user-facing UI and Public API Runs. Preview traffic and cancellations are excluded.",
      )}
      rate={component.successRate90d}
      rateTemplate="{rate} completion"
      history={component.history}
      barLabel={t("90-day Run completion rate")}
      unit="Runs"
      facts={[
        { label: t("Latest Run"), value: component.latestStatus ?? "—" },
        { label: t("Duration"), value: formatDuration(component.latestDurationMs) },
        { label: t("Error"), value: component.latestErrorCode ?? "—" },
        { label: t("Last observed"), value: formatTimestamp(component.lastObservedAt) },
        {
          label: t("Observed Runs, 90 days"),
          value:
            component.runs90d === 0 ? t("No observations yet") : formatCount(component.runs90d),
        },
      ]}
    />
  );
}

/** Keeps the card's silhouette stable before the first feed response (or without one). */
function PlaceholderRow({ label, tone }: { label: string; tone: Tone }): ReactElement {
  return (
    <section className="sp-row" aria-busy={tone === "loading"}>
      <div className="sp-row-head">
        <p className="sp-row-name sp-row-label inline-flex items-center gap-2.5">
          <StatusGlyph tone={tone} />
          {label}
        </p>
      </div>
      <div className="sp-bars-wrap">
        <div aria-hidden="true" className="sp-bars">
          {Array.from({ length: HISTORY_DAYS }, (_, index) => (
            <span key={index} className="sp-day" />
          ))}
        </div>
      </div>
      <HistoryAxis />
    </section>
  );
}

function NoticeItem({ notice }: { notice: Notice }): ReactElement {
  return (
    <li className="sp-notice">
      <StatusGlyph tone={notice.tone} size="lg" />
      <div className="min-w-0">
        <p className="sp-notice-meta">{notice.eyebrow}</p>
        <p className="sp-notice-body">{notice.body}</p>
        {notice.link ? (
          <a href={notice.link.href} target="_blank" rel="noreferrer noopener" className="sp-link">
            {notice.link.label}
            <ArrowUpRight aria-hidden="true" className="size-3.5" />
          </a>
        ) : null}
      </div>
    </li>
  );
}

function incidentNotice(incident: IncidentRecord): Notice {
  return {
    body: incident.summary,
    eyebrow: `${t(incident.status)} · ${formatDay(incident.updatedOn)}`,
    key: incident.id,
    link: { href: incident.postmortemUrl, label: incident.postmortemLabel },
    tone: incident.status === "Resolved" ? "operational" : "unknown",
  };
}

/** Live degradations from the feed, then incident updates from the last week. */
function recentNotices(
  payload: StatusPayload | null,
  feedUnavailable: boolean,
  now: number,
): Notice[] {
  const notices: Notice[] = [];

  if (payload && !feedUnavailable) {
    if (payload.platform.status === "degraded") {
      notices.push({
        body: (
          <>
            <span className="font-semibold">{t("Mosoo API & control plane")}</span> ·{" "}
            {t("A production invocation failed")}
          </>
        ),
        eyebrow: t("Ongoing"),
        key: "platform",
        tone: "degraded",
      });
    }
    for (const component of payload.components) {
      if (component.status !== "degraded") continue;
      notices.push({
        body: (
          <>
            <span className="font-semibold">{component.name}</span> ·{" "}
            {t("Three consecutive observed Runs failed")}
          </>
        ),
        eyebrow: t("Ongoing"),
        key: component.id,
        tone: "degraded",
      });
    }
  }

  for (const incident of INCIDENTS) {
    const age = now - Date.parse(`${incident.updatedOn}T00:00:00Z`);
    if (age >= 0 && age <= RECENT_NOTICE_WINDOW_MS) notices.push(incidentNotice(incident));
  }

  return notices;
}

/** The page's one button: ink, never the accent (REVIEW-v4 G9). */
function UpdatesMenu(): ReactElement {
  return (
    <Menu.Root>
      <Menu.Trigger className="sp-btn">
        {t("Get updates")}
        <ChevronDown aria-hidden="true" className="size-3.5" />
      </Menu.Trigger>
      <Menu.Portal>
        {/* Portalled to <body>, outside the landing shell; the sp-* classes read
            :root tokens, so the popup needs no theme of its own. */}
        <Menu.Positioner
          className="z-50 outline-none"
          side="bottom"
          align="end"
          sideOffset={8}
          collisionPadding={16}
        >
          <Menu.Popup className="sp-menu">
            {UPDATE_CHANNELS.map((channel) => (
              <Menu.LinkItem
                key={channel.href}
                href={channel.href}
                closeOnClick
                {...(channel.external ? { rel: "noreferrer noopener", target: "_blank" } : {})}
                className="sp-menu-item"
              >
                <span className="sp-menu-label">{channel.label()}</span>
                <span className="sp-menu-cap">{channel.caption}</span>
              </Menu.LinkItem>
            ))}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}

function overallTitle(status: ComponentStatus, loading: boolean, feedUnavailable: boolean): string {
  if (loading) return t("Checking current status…");
  if (feedUnavailable) return t("Status feed is temporarily unavailable");
  if (status === "operational") return t("All systems operational");
  if (status === "degraded") return t("Production failures are being observed");
  return t("Awaiting production signals");
}

export function StatusPage(): ReactElement {
  const [payload, setPayload] = useState<StatusPayload | null>(null);
  const [feedUnavailable, setFeedUnavailable] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const historyId = useId();

  useEffect(() => {
    let active = true;

    const load = async (): Promise<void> => {
      try {
        const response = await fetch(STATUS_FEED_URL, {
          headers: { accept: "application/json" },
          signal: AbortSignal.timeout(10_000),
        });
        if (!response.ok) throw new Error("Status feed unavailable.");
        const next = (await response.json()) as StatusPayload;
        if (next.version !== 2) throw new Error("Status feed version mismatch.");
        if (active) {
          setPayload(next);
          setFeedUnavailable(false);
        }
      } catch {
        if (active) setFeedUnavailable(true);
      }
    };

    void load();
    const timer = window.setInterval(() => void load(), REFRESH_INTERVAL_MS);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  const loading = payload === null && !feedUnavailable;
  const status: ComponentStatus = feedUnavailable ? "unknown" : (payload?.status ?? "unknown");
  const tone: Tone = loading ? "loading" : status;
  const notices = recentNotices(payload, feedUnavailable, Date.now());

  return (
    // The shared LandingShell provides the page's <main> landmark and the site
    // nav, whose ink mark is the page's only logo (v5: no second, larger mark).
    <div className="sp">
      <header className="sp-head">
        <div className="min-w-0">
          <h1 className="sp-title">{t("System status")}</h1>
          <p className="sp-state" aria-live="polite">
            <StatusGlyph tone={tone} size="lg" labelled={false} />
            <span>{overallTitle(status, loading, feedUnavailable)}</span>
          </p>
          <p className="sp-observed">
            {t("Last observed")} · {formatTimestamp(payload?.updatedAt ?? null)}
          </p>
        </div>
        <div className="sp-actions">
          <a href={MOSOO_ISSUES_URL} target="_blank" rel="noreferrer noopener" className="sp-quiet">
            {t("Report an issue")}
          </a>
          <UpdatesMenu />
        </div>
      </header>

      <div className="sp-rows">
        {payload ? (
          <>
            <PlatformRow platform={payload.platform} feedUnavailable={feedUnavailable} />
            {payload.components.map((component) => (
              <ComponentRow key={component.id} component={component} feedUnavailable={feedUnavailable} />
            ))}
          </>
        ) : (
          <PlaceholderRow
            tone={tone}
            label={feedUnavailable ? t("Status feed is temporarily unavailable") : t("Checking current status…")}
          />
        )}
      </div>

      <section className="sp-section">
        <h2 className="sp-h2">{t("Recent notices")}</h2>
        {notices.length === 0 ? (
          <p className="sp-empty">
            <StatusGlyph tone="operational" size="lg" labelled={false} />
            {t("No notices reported for the past 7 days")}
          </p>
        ) : (
          <ul className="sp-notice-list">
            {notices.map((notice) => (
              <NoticeItem key={notice.key} notice={notice} />
            ))}
          </ul>
        )}
      </section>

      <section id={historyId} hidden={!historyOpen} className="sp-section">
        <h2 className="sp-h2">{t("Notice history")}</h2>
        <ol className="sp-notice-list">
          {INCIDENTS.map((incident) => (
            <NoticeItem key={incident.id} notice={incidentNotice(incident)} />
          ))}
        </ol>
      </section>

      <button
        type="button"
        aria-expanded={historyOpen}
        aria-controls={historyId}
        onClick={() => setHistoryOpen((value) => !value)}
        className="sp-toggle"
      >
        <span aria-hidden="true" />
        <span>{historyOpen ? t("Hide notice history") : t("Show notice history")}</span>
        <ChevronDown aria-hidden="true" />
      </button>

      <div className="sp-notes">
        <div>
          <p className="sp-note-h">
            {t("Signal source")} · {t("Cloudflare + Mosoo")}
          </p>
          <p className="sp-note-p">
            {t(
              "Status is derived from Cloudflare Worker outcomes and Mosoo Run terminal events. No synthetic Agent calls, no model-token spend.",
            )}{" "}
            {t(
              "Cloudflare supplies invocation outcomes; Mosoo's existing structured business log supplies runtime, terminal status, duration, and error code.",
            )}
          </p>
        </div>
        <div>
          <p className="sp-note-h">{t("How this is measured")}</p>
          <p className="sp-note-p">
            {t(
              "The API Worker is observed continuously through Cloudflare Tail events. Runtime completion rates update whenever a real user-facing Run reaches completed, failed, or expired.",
            )}{" "}
            <a href={STATUS_FEED_URL} className="sp-link sp-mono">
              /status.json
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
