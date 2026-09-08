import { Menu } from "@base-ui/react/menu";
import { ArrowUpRight, Check, ChevronDown, ChevronLeft, ChevronRight, Minus } from "lucide-react";
import { m } from "motion/react";
import { useEffect, useId, useState } from "react";
import type { CSSProperties, ReactElement, ReactNode } from "react";

import { cn } from "@/shared/lib/class-names";
import { locale } from "@/shared/locale";

import { EASE_OUT } from "../login/landing/motion-variants";
import { DISPLAY_FONT } from "../login/landing/typography";
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
const CONTENT_WIDTH_CLASS = "mx-auto w-full max-w-[1000px]";

const OVERALL_TITLE_STYLE = {
  fontFamily: DISPLAY_FONT,
  fontSize: "clamp(22px, 2.6vw, 28px)",
  fontWeight: 500,
  letterSpacing: "-0.02em",
  lineHeight: 1.15,
} satisfies CSSProperties;

// Glyphs follow the brand rule for the bright accent: dark ink on the shoot
// green disc, never white on it.
const TONE_CLASS = {
  degraded: { disc: "bg-amber text-ink-900", halo: "bg-amber-bg" },
  loading: { disc: "bg-ink-200 text-ink-700 animate-pulse", halo: "bg-paper-200" },
  operational: { disc: "bg-green-500 text-on-accent", halo: "bg-green-100" },
  unknown: { disc: "bg-ink-300 text-ink-900", halo: "bg-paper-200" },
} satisfies Record<Tone, { disc: string; halo: string }>;

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

const LINK_CLASS =
  "text-green-800 decoration-green-800/30 hover:decoration-green-800 focus-visible:ring-ring inline-flex items-center gap-1 rounded-sm text-[13px] font-semibold underline underline-offset-4 outline-none focus-visible:ring-2";

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

function StatusGlyph({ size = "sm", tone }: { size?: "lg" | "sm"; tone: Tone }): ReactElement {
  const classes = TONE_CLASS[tone];
  const large = size === "lg";

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full",
        large ? `size-11 ${classes.halo}` : "size-5",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "inline-flex items-center justify-center rounded-full",
          large ? "size-[22px]" : "size-5",
          classes.disc,
        )}
      >
        {tone === "operational" ? (
          <Check className={large ? "size-3" : "size-[11px]"} strokeWidth={3.25} />
        ) : tone === "degraded" ? (
          <span className={cn("font-bold leading-none", large ? "text-[13px]" : "text-[11px]")}>
            !
          </span>
        ) : (
          <Minus className={large ? "size-3" : "size-[11px]"} strokeWidth={3.25} />
        )}
      </span>
      <span className="sr-only">{TONE_LABEL[tone]()}</span>
    </span>
  );
}

function dayTone(day: StatusDay): string {
  if (day.total === 0) return "bg-ink-200/70";
  if (day.succeeded === day.total) return "bg-green-500";
  if (day.succeeded === 0) return "bg-ember";
  return "bg-amber";
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
      className={cn(
        "bg-ink-900 text-paper-100 pointer-events-none absolute bottom-[calc(100%+8px)] z-10 rounded-md px-2.5 py-1.5 text-[12px] leading-[1.45] whitespace-nowrap shadow-md",
        nearStart ? "left-0" : nearEnd ? "right-0" : "-translate-x-1/2",
      )}
      style={
        nearStart || nearEnd ? undefined : { left: `${((index + 0.5) / HISTORY_DAYS) * 100}%` }
      }
    >
      <p className="font-semibold">{formatDay(day.date)}</p>
      <p className="text-paper-100/75">{summary}</p>
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
    <div className="mt-3">
      <div className="relative">
        <div
          role="img"
          aria-label={`${label}: ${formatRate(rate)}`}
          onMouseLeave={() => setHovered(null)}
          className="grid h-8 grid-cols-[repeat(90,minmax(0,1fr))] gap-px overflow-hidden rounded-[6px] sm:h-10 sm:gap-0.5"
        >
          {history.map((day, index) => (
            <span
              key={day.date}
              aria-hidden="true"
              onMouseEnter={() => setHovered(index)}
              className={cn(
                "min-w-0 rounded-[2px] transition-[filter] duration-100",
                dayTone(day),
                hovered === index && "brightness-90",
              )}
            />
          ))}
        </div>
        {hoveredDay && hovered !== null ? (
          <DayTooltip day={hoveredDay} index={hovered} unit={unit} />
        ) : null}
      </div>
      <div className="text-fg-3 mt-2 flex items-center justify-between text-[11.5px] font-semibold tracking-[0.06em] uppercase sm:text-[12px]">
        <span className="inline-flex items-center gap-0.5">
          <ChevronLeft aria-hidden="true" className="size-3.5" />
          {t("90 days ago")}
        </span>
        <span>{t("Today")}</span>
      </div>
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
  // The figure takes the row's current tone, so a stale runtime's rate is not painted green.
  const rateClass =
    rate === null
      ? "text-fg-3"
      : status === "operational"
        ? "text-green-800"
        : status === "degraded"
          ? "text-amber-fg"
          : "text-fg-2";

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <h3 className="min-w-0">
          <button
            type="button"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((value) => !value)}
            className="group focus-visible:ring-ring -ml-1 inline-flex items-center gap-2.5 rounded-md px-1 py-0.5 text-left outline-none focus-visible:ring-2"
          >
            <StatusGlyph tone={status} />
            <span className="text-fg-1 text-[16px] font-semibold sm:text-[17px]">{name}</span>
            <ChevronRight
              aria-hidden="true"
              className={cn(
                "text-fg-3 group-hover:text-fg-1 size-4 shrink-0 transition-[color,transform] duration-150",
                open && "rotate-90",
              )}
            />
          </button>
        </h3>
        <p className={cn("shrink-0 text-[15px] font-semibold sm:text-[17px]", rateClass)}>
          {rateText}
        </p>
      </div>

      <HistoryBar history={history} label={barLabel} rate={rate} unit={unit} />

      <div id={panelId} hidden={!open} className="border-border-soft mt-4 border-t pt-4">
        <p className="text-fg-1 text-[13.5px] font-semibold">{detail}</p>
        <p className="text-fg-2 mt-1 max-w-[720px] text-[13px] leading-[1.6]">{description}</p>
        <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 lg:grid-cols-5">
          {facts.map((fact) => (
            <div key={fact.label}>
              <dt className="text-fg-3 font-mono text-[10px] font-semibold tracking-[0.08em] uppercase">
                {fact.label}
              </dt>
              <dd className="text-fg-1 mt-1 text-[13px] font-semibold wrap-anywhere">
                {fact.value}
              </dd>
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
    <section aria-busy={tone === "loading"}>
      <div className="flex items-center gap-2.5">
        <StatusGlyph tone={tone} />
        <p className="text-fg-2 text-[16px] font-semibold sm:text-[17px]">{label}</p>
      </div>
      <div
        aria-hidden="true"
        className="mt-3 grid h-8 grid-cols-[repeat(90,minmax(0,1fr))] gap-px overflow-hidden rounded-[6px] sm:h-10 sm:gap-0.5"
      >
        {Array.from({ length: HISTORY_DAYS }, (_, index) => (
          <span key={index} className="bg-ink-200/50 min-w-0 rounded-[2px]" />
        ))}
      </div>
      <div className="text-fg-3 mt-2 flex items-center justify-between text-[11.5px] font-semibold tracking-[0.06em] uppercase sm:text-[12px]">
        <span className="inline-flex items-center gap-0.5">
          <ChevronLeft aria-hidden="true" className="size-3.5" />
          {t("90 days ago")}
        </span>
        <span>{t("Today")}</span>
      </div>
    </section>
  );
}

function NoticeItem({ notice }: { notice: Notice }): ReactElement {
  return (
    <li className="flex items-start gap-4">
      <StatusGlyph tone={notice.tone} size="lg" />
      <div className="min-w-0 pt-1">
        <p className="text-fg-3 font-mono text-[10.5px] font-semibold tracking-[0.08em] uppercase">
          {notice.eyebrow}
        </p>
        <p className="text-fg-1 mt-1 text-[15px] leading-[1.6]">{notice.body}</p>
        {notice.link ? (
          <a
            href={notice.link.href}
            target="_blank"
            rel="noreferrer noopener"
            className={cn(LINK_CLASS, "mt-2.5")}
          >
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

function UpdatesMenu(): ReactElement {
  return (
    <Menu.Root>
      <Menu.Trigger className="group bg-green-500 text-on-accent hover:bg-green-600 focus-visible:ring-paper-100/60 data-[popup-open]:bg-green-600 inline-flex h-10 shrink-0 items-center gap-1.5 rounded-md px-3 text-[14px] font-semibold shadow-sm transition-[background-color,transform] duration-150 outline-none active:scale-[0.98] focus-visible:ring-2 sm:px-4">
        {t("Get updates")}
        <ChevronDown
          aria-hidden="true"
          className="size-3.5 transition-transform duration-200 ease-out group-data-[popup-open]:rotate-180"
        />
      </Menu.Trigger>
      <Menu.Portal>
        {/* Portalled to <body>, outside the landing shell: restate both the landing
            palette and the page's brand ramp so the popup matches its trigger. */}
        <Menu.Positioner
          data-theme="landing"
          className="status-brand z-50 outline-none"
          side="bottom"
          align="end"
          sideOffset={8}
          collisionPadding={16}
        >
          <Menu.Popup className="bg-paper-50 border-border-strong w-[280px] max-w-[calc(100vw-32px)] origin-[var(--transform-origin)] rounded-lg border p-1.5 shadow-[var(--shadow-lg)] transition-[opacity,transform] duration-150 ease-out outline-none data-[ending-style]:-translate-y-1 data-[ending-style]:opacity-0 data-[starting-style]:-translate-y-1 data-[starting-style]:opacity-0 motion-reduce:transition-none">
            {UPDATE_CHANNELS.map((channel) => (
              <Menu.LinkItem
                key={channel.href}
                href={channel.href}
                closeOnClick
                {...(channel.external ? { rel: "noreferrer noopener", target: "_blank" } : {})}
                className="hover:bg-paper-200/70 data-[highlighted]:bg-paper-200/70 block rounded-md px-3 py-2.5 outline-none"
              >
                <span className="flex items-baseline justify-between gap-4">
                  <span className="text-fg-1 text-[13.5px] font-semibold">{channel.label()}</span>
                  <span className="text-fg-3 font-mono text-[10.5px] tracking-[0.06em]">
                    {channel.caption}
                  </span>
                </span>
              </Menu.LinkItem>
            ))}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}

function StatusHeader(): ReactElement {
  return (
    <div className="bg-ink-900 px-4 pt-5 pb-[168px] sm:pt-6 sm:pb-[184px] md:px-6">
      <div className={`${CONTENT_WIDTH_CLASS} flex items-center justify-between gap-4`}>
        <div className="flex min-w-0 items-center gap-3">
          <a
            href={`/${locale}`}
            aria-label="mosoo"
            className="focus-visible:ring-paper-100/60 inline-flex shrink-0 rounded-full outline-none focus-visible:ring-2"
          >
            <img src="/brand/logo-mark.svg" alt="" className="block size-11 sm:size-12" />
          </a>
          <span className="text-paper-100 hidden text-[15px] font-semibold tracking-[-0.01em] sm:block">
            {t("System status")}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <a
            href={MOSOO_ISSUES_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="text-paper-100/85 hover:bg-paper-100/10 hover:text-paper-100 focus-visible:ring-paper-100/60 inline-flex h-10 items-center rounded-md px-2.5 text-[14px] font-semibold transition-colors outline-none focus-visible:ring-2 sm:px-3.5"
          >
            {t("Report an issue")}
          </a>
          <UpdatesMenu />
        </div>
      </div>
    </div>
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
    <main className="status-brand">
      <StatusHeader />

      <div className="px-4 pb-16 md:px-6 md:pb-24">
        <m.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: EASE_OUT }}
          className={`${CONTENT_WIDTH_CLASS} relative z-10 -mt-[120px] sm:-mt-[136px]`}
        >
          <div className="overflow-hidden rounded-[24px] bg-white shadow-[0_32px_64px_-28px_rgba(11,26,20,0.38),0_1px_2px_rgba(11,26,20,0.06)] ring-1 ring-[rgba(11,26,20,0.06)]">
            <div
              aria-live="polite"
              className="flex flex-col items-center px-5 pt-10 pb-8 text-center sm:px-10 sm:pt-12 sm:pb-10"
            >
              <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
                <StatusGlyph tone={tone} size="lg" />
                <h1 className="text-fg-1 [text-wrap:balance]" style={OVERALL_TITLE_STYLE}>
                  {overallTitle(status, loading, feedUnavailable)}
                </h1>
              </div>
              <p className="text-fg-3 mt-3 text-[13px]">
                {t("Last observed")} · {formatTimestamp(payload?.updatedAt ?? null)}
              </p>
            </div>

            <div className="flex flex-col gap-8 px-5 pt-2 pb-10 sm:gap-9 sm:px-10">
              {payload ? (
                <>
                  <PlatformRow platform={payload.platform} feedUnavailable={feedUnavailable} />
                  {payload.components.map((component) => (
                    <ComponentRow
                      key={component.id}
                      component={component}
                      feedUnavailable={feedUnavailable}
                    />
                  ))}
                </>
              ) : (
                <PlaceholderRow
                  tone={tone}
                  label={
                    feedUnavailable
                      ? t("Status feed is temporarily unavailable")
                      : t("Checking current status…")
                  }
                />
              )}
            </div>

            <div className="px-5 pt-6 pb-10 sm:px-10">
              <h2 className="text-fg-2 border-border-soft border-b pb-3 text-[13.5px] font-semibold tracking-[0.1em] uppercase">
                {t("Recent notices")}
              </h2>
              {notices.length === 0 ? (
                <div className="mt-7 flex items-center gap-4">
                  <StatusGlyph tone="operational" size="lg" />
                  <p className="text-fg-1 text-[16px] sm:text-[17px]">
                    {t("No notices reported for the past 7 days")}
                  </p>
                </div>
              ) : (
                <ul className="mt-7 flex flex-col gap-7">
                  {notices.map((notice) => (
                    <NoticeItem key={notice.key} notice={notice} />
                  ))}
                </ul>
              )}
            </div>

            <div
              id={historyId}
              hidden={!historyOpen}
              className="border-border-soft border-t px-5 py-8 sm:px-10"
            >
              <h2 className="text-fg-2 text-[13.5px] font-semibold tracking-[0.1em] uppercase">
                {t("Notice history")}
              </h2>
              <ol className="mt-6 flex flex-col gap-7">
                {INCIDENTS.map((incident) => (
                  <NoticeItem key={incident.id} notice={incidentNotice(incident)} />
                ))}
              </ol>
            </div>

            <button
              type="button"
              aria-expanded={historyOpen}
              aria-controls={historyId}
              onClick={() => setHistoryOpen((value) => !value)}
              className="border-border-soft text-fg-1 hover:bg-paper-200/50 focus-visible:ring-ring grid h-[72px] w-full grid-cols-[1fr_auto_1fr] items-center border-t px-5 text-[15px] font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-inset sm:px-10"
            >
              <span aria-hidden="true" />
              <span>{historyOpen ? t("Hide notice history") : t("Show notice history")}</span>
              <ChevronDown
                aria-hidden="true"
                className={cn(
                  "text-fg-3 size-5 justify-self-end transition-transform duration-200",
                  historyOpen && "rotate-180",
                )}
              />
            </button>
          </div>
        </m.div>

        <div className={`${CONTENT_WIDTH_CLASS} mt-10 grid gap-6 px-1 md:grid-cols-2 md:gap-10`}>
          <div>
            <p className="text-fg-3 font-mono text-[10.5px] font-semibold tracking-[0.16em] uppercase">
              {t("Signal source")} · {t("Cloudflare + Mosoo")}
            </p>
            <p className="text-fg-3 mt-2 text-[13px] leading-[1.65]">
              {t(
                "Status is derived from Cloudflare Worker outcomes and Mosoo Run terminal events. No synthetic Agent calls, no model-token spend.",
              )}{" "}
              {t(
                "Cloudflare supplies invocation outcomes; Mosoo's existing structured business log supplies runtime, terminal status, duration, and error code.",
              )}
            </p>
          </div>
          <div>
            <p className="text-fg-3 font-mono text-[10.5px] font-semibold tracking-[0.16em] uppercase">
              {t("How this is measured")}
            </p>
            <p className="text-fg-3 mt-2 text-[13px] leading-[1.65]">
              {t(
                "The API Worker is observed continuously through Cloudflare Tail events. Runtime completion rates update whenever a real user-facing Run reaches completed, failed, or expired.",
              )}{" "}
              <a href={STATUS_FEED_URL} className={cn(LINK_CLASS, "font-mono text-[12px]")}>
                /status.json
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
