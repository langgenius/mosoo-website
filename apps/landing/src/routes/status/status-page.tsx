import { m } from "motion/react";
import { useEffect, useState } from "react";
import type { CSSProperties, ReactElement } from "react";

import { locale } from "@/shared/locale";

import { EASE_OUT } from "../login/landing/motion-variants";
import { DISPLAY_FONT, sectionHeadingStyle } from "../login/landing/typography";
import { t } from "./i18n";

type ComponentStatus = "degraded" | "operational" | "unknown";

interface StatusDay {
  checks: number;
  date: string;
  passed: number;
}

interface StatusComponent {
  availability90d: number | null;
  checks90d: number;
  consecutiveFailures: number;
  driverReused: boolean | null;
  firstTtftMs: number | null;
  followUpTtftMs: number | null;
  history: StatusDay[];
  id: string;
  lastCheckedAt: string | null;
  name: string;
  status: ComponentStatus;
  ttftBudgetMs: number | null;
}

interface StatusPayload {
  components: StatusComponent[];
  releasePolicyTriggered: boolean;
  status: ComponentStatus;
  updatedAt: string | null;
}

const PAGE_HEADLINE_STYLE = {
  fontFamily: DISPLAY_FONT,
  fontSize: "clamp(42px, 6vw, 72px)",
  fontWeight: 500,
  letterSpacing: "-0.038em",
  lineHeight: 0.98,
} satisfies CSSProperties;

const STATUS_LABEL = {
  degraded: () => t("Degraded"),
  operational: () => t("Operational"),
  unknown: () => t("Unknown"),
} satisfies Record<ComponentStatus, () => string>;

const STATUS_TONE = {
  degraded: {
    banner: "border-amber-500 bg-amber-50 text-amber-950",
    dot: "bg-amber-500",
  },
  operational: {
    banner: "border-green-700 bg-green-50 text-green-950",
    dot: "bg-green-600",
  },
  unknown: {
    banner: "border-border-strong bg-paper-200 text-fg-1",
    dot: "bg-ink-400",
  },
} satisfies Record<ComponentStatus, { banner: string; dot: string }>;

function formatDuration(value: number | null): string {
  if (value === null) return "—";
  return value < 1_000 ? `${value} ms` : `${(value / 1_000).toFixed(1)} s`;
}

function formatAvailability(value: number | null): string {
  if (value === null) return "—";
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    style: "percent",
  }).format(value);
}

function formatTimestamp(value: string | null): string {
  if (value === null) return t("No successful check yet");
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    timeZoneName: "short",
    year: "numeric",
  }).format(new Date(value));
}

function HistoryBars({ component }: { component: StatusComponent }): ReactElement {
  return (
    <div
      aria-label={`${t("90-day measured availability")}: ${formatAvailability(component.availability90d)}`}
      className="mt-4 grid h-7 grid-cols-[repeat(90,minmax(2px,1fr))] items-stretch gap-[2px]"
    >
      {component.history.map((day) => {
        const tone =
          day.checks === 0
            ? "bg-ink-200/65"
            : day.passed === day.checks
              ? "bg-green-600"
              : day.passed === 0
                ? "bg-red-600"
                : "bg-amber-500";

        return <span key={day.date} aria-hidden="true" className={`${tone} min-w-0 rounded-[1px]`} />;
      })}
    </div>
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
      ? t("Awaiting fresh canary data")
      : status === "operational"
        ? t("Latest check passed")
        : t("Latest check breached the SLO");

  return (
    <article className="border-border-soft border-t px-5 py-6 first:border-t-0 md:px-7 md:py-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-fg-1 text-[16px] font-semibold">{component.name}</h3>
          <p className="text-fg-3 mt-1 text-[13px]">{detail}</p>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px] font-semibold tracking-[0.08em] uppercase">
          <span aria-hidden="true" className={`${STATUS_TONE[status].dot} size-2 rounded-[1px]`} />
          {STATUS_LABEL[status]()}
        </div>
      </div>

      <HistoryBars component={component} />

      <div className="text-fg-3 mt-3 flex flex-col gap-1 font-mono text-[10.5px] tracking-[0.04em] sm:flex-row sm:items-center sm:justify-between">
        <span>
          {t("90-day measured availability")} · {formatAvailability(component.availability90d)}
        </span>
        <span>
          {component.checks90d === 0
            ? t("No measurements yet")
            : `${component.checks90d.toLocaleString(locale)} ${t("checks")}`}
        </span>
      </div>

      {component.lastCheckedAt !== null ? (
        <dl className="border-border-soft text-fg-2 mt-5 grid grid-cols-2 gap-x-4 gap-y-3 border-t pt-4 text-[12px] sm:grid-cols-4">
          <div>
            <dt className="text-fg-3 font-mono text-[10px] tracking-[0.08em] uppercase">
              {t("First TTFT")}
            </dt>
            <dd className="mt-1 font-semibold">{formatDuration(component.firstTtftMs)}</dd>
          </div>
          <div>
            <dt className="text-fg-3 font-mono text-[10px] tracking-[0.08em] uppercase">
              {t("Follow-up")}
            </dt>
            <dd className="mt-1 font-semibold">{formatDuration(component.followUpTtftMs)}</dd>
          </div>
          <div>
            <dt className="text-fg-3 font-mono text-[10px] tracking-[0.08em] uppercase">
              {t("budget")}
            </dt>
            <dd className="mt-1 font-semibold">{formatDuration(component.ttftBudgetMs)}</dd>
          </div>
          <div>
            <dt className="text-fg-3 font-mono text-[10px] tracking-[0.08em] uppercase">
              Driver
            </dt>
            <dd className="mt-1 font-semibold">
              {component.driverReused === null
                ? "—"
                : component.driverReused
                  ? t("Same driver")
                  : t("Driver changed")}
            </dd>
          </div>
        </dl>
      ) : null}
    </article>
  );
}

function overallTitle(status: ComponentStatus, loading: boolean): string {
  if (loading) return t("Checking current status…");
  if (status === "operational") return t("All monitored runtimes operational");
  if (status === "degraded") return t("A production canary is outside its SLO");
  return t("Current status is unavailable");
}

export function StatusPage(): ReactElement {
  const [payload, setPayload] = useState<StatusPayload | null>(null);
  const [feedUnavailable, setFeedUnavailable] = useState(false);

  useEffect(() => {
    let active = true;

    const load = async (): Promise<void> => {
      try {
        const response = await fetch("/status.json", {
          headers: { accept: "application/json" },
          signal: AbortSignal.timeout(10_000),
        });
        if (!response.ok) throw new Error("Status feed unavailable.");
        const next = (await response.json()) as StatusPayload;
        if (active) {
          setPayload(next);
          setFeedUnavailable(false);
        }
      } catch {
        if (active) setFeedUnavailable(true);
      }
    };

    void load();
    const timer = window.setInterval(() => void load(), 60_000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  const loading = payload === null && !feedUnavailable;
  const status = feedUnavailable ? "unknown" : (payload?.status ?? "unknown");

  return (
    <main>
      <section className="border-border-soft border-b px-4 py-16 md:px-6 md:py-24">
        <m.div
          initial={{ opacity: 0, scale: 0.97, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.24, ease: EASE_OUT }}
          className="mx-auto max-w-[1040px]"
        >
          <p className="text-fg-3 font-mono text-[11px] font-semibold tracking-[0.18em] uppercase">
            {t("System status")}
          </p>
          <h1 className="text-fg-1 mt-5 max-w-[760px] [text-wrap:balance]" style={PAGE_HEADLINE_STYLE}>
            {t("Production path, measured.")}
          </h1>
          <p className="text-fg-2 mt-6 max-w-[700px] text-[15px] leading-[1.65] [text-wrap:pretty]">
            {t(
              "Every check runs a real production turn, waits for completion, then sends a follow-up through the same Thread. We publish TTFT and driver continuity—not a shallow ping.",
            )}
          </p>

          <div
            aria-live="polite"
            className={`${STATUS_TONE[status].banner} mt-10 flex flex-col gap-5 border-2 p-5 shadow-[4px_4px_0_currentColor] sm:flex-row sm:items-center sm:justify-between md:p-6`}
          >
            <div className="flex items-center gap-4">
              <span
                aria-hidden="true"
                className={`${STATUS_TONE[status].dot} block size-4 shrink-0 rounded-[2px]`}
              />
              <p className="text-[17px] font-semibold">{overallTitle(status, loading)}</p>
            </div>
            <p className="font-mono text-[10.5px] tracking-[0.06em] uppercase">
              {t("Last checked")} · {formatTimestamp(payload?.updatedAt ?? null)}
            </p>
          </div>
        </m.div>
      </section>

      <section className="px-4 py-16 md:px-6 md:py-20">
        <div className="mx-auto max-w-[1040px]">
          <div className="grid gap-5 md:grid-cols-[0.78fr_1.22fr] md:gap-12">
            <div>
              <h2 className="text-fg-1" style={sectionHeadingStyle}>
                {t("Monitored runtimes")}
              </h2>
              <p className="text-fg-2 mt-4 max-w-[360px] text-[14px] leading-[1.65]">
                {t(
                  "A passing check requires two real turns, both within the TTFT budget, with the follow-up reusing the first turn's driver.",
                )}
              </p>
            </div>
            <div className="border-border-strong bg-card overflow-hidden rounded-[10px] border shadow-sm">
              {payload?.components.map((component) => (
                <ComponentRow
                  key={component.id}
                  component={component}
                  feedUnavailable={feedUnavailable}
                />
              )) ?? (
                <div className="text-fg-3 px-7 py-10 text-[14px]">
                  {t("Checking current status…")}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="border-border-soft bg-paper-200/45 border-y px-4 py-16 md:px-6 md:py-20">
        <div className="mx-auto grid max-w-[1040px] gap-px overflow-hidden rounded-[10px] border border-border-strong bg-border-strong md:grid-cols-2">
          <article className="bg-paper-50 p-7 md:p-9">
            <p className="text-fg-3 font-mono text-[10.5px] font-semibold tracking-[0.16em] uppercase">
              {t("Target SLO")}
            </p>
            <p className="text-fg-1 mt-4 font-mono text-[36px] font-semibold tracking-[-0.05em]">
              99.5%
            </p>
            <p className="text-fg-2 mt-4 text-[14px] leading-[1.65]">
              {t(
                "99.5% of checks pass over a rolling 30-day window. This is a public SLO, not a contractual SLA.",
              )}
            </p>
          </article>
          <article className="bg-paper-50 p-7 md:p-9">
            <p className="text-fg-3 font-mono text-[10.5px] font-semibold tracking-[0.16em] uppercase">
              {t("Release policy")}
            </p>
            {payload?.releasePolicyTriggered ? (
              <p className="mt-4 inline-flex border border-amber-600 bg-amber-50 px-2.5 py-1.5 font-mono text-[10.5px] font-semibold tracking-[0.08em] text-amber-950 uppercase">
                {t("Release freeze active")}
              </p>
            ) : null}
            <p className="text-fg-2 mt-4 text-[14px] leading-[1.65]">
              {t(
                "Three consecutive breaches freeze feature releases. The team ships reliability fixes only until a passing canary and incident review clear the freeze.",
              )}
            </p>
          </article>
        </div>
      </section>

      <section className="px-4 py-16 md:px-6 md:py-20">
        <div className="mx-auto grid max-w-[1040px] gap-12 md:grid-cols-2">
          <article>
            <p className="text-fg-3 font-mono text-[10.5px] font-semibold tracking-[0.16em] uppercase">
              {t("Incident record")}
            </p>
            <p className="text-fg-2 mt-4 text-[14px] leading-[1.65]">
              {t("No formal postmortems have been published since this status surface launched.")}
            </p>
            <a
              href="https://github.com/langgenius/mosoo/tree/main/docs/operations/incidents"
              target="_blank"
              rel="noreferrer noopener"
              className="text-green-800 focus-visible:ring-ring mt-5 inline-flex rounded-sm text-[13px] font-semibold underline decoration-green-800/30 underline-offset-4 outline-none hover:decoration-green-800 focus-visible:ring-2"
            >
              {t("View the public postmortem archive")} ↗
            </a>
          </article>
          <article>
            <p className="text-fg-3 font-mono text-[10.5px] font-semibold tracking-[0.16em] uppercase">
              {t("How this is measured")}
            </p>
            <p className="text-fg-2 mt-4 text-[14px] leading-[1.65]">
              {t(
                "Canaries run every five minutes against the public production API for OpenAI Codex, Claude Agent SDK, and OpenCode. Missing two check intervals makes a component Unknown.",
              )}
            </p>
            <a
              href="/status.json"
              className="text-green-800 focus-visible:ring-ring mt-5 inline-flex rounded-sm font-mono text-[12px] font-semibold underline decoration-green-800/30 underline-offset-4 outline-none hover:decoration-green-800 focus-visible:ring-2"
            >
              /status.json
            </a>
          </article>
        </div>
      </section>
    </main>
  );
}
