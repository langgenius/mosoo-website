import { m } from "motion/react";
import { useEffect, useState } from "react";
import type { CSSProperties, ReactElement } from "react";

import { locale } from "@/shared/locale";

import { EASE_OUT } from "../login/landing/motion-variants";
import { DISPLAY_FONT, sectionHeadingStyle } from "../login/landing/typography";
import { t } from "./i18n";

type ComponentStatus = "degraded" | "operational" | "unknown";

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

function formatRate(value: number | null): string {
  if (value === null) return "—";
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    style: "percent",
  }).format(value);
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

function HistoryBars({
  history,
  label,
  rate,
}: {
  history: StatusDay[];
  label: string;
  rate: number | null;
}): ReactElement {
  return (
    <div
      aria-label={`${label}: ${formatRate(rate)}`}
      className="mt-4 grid h-7 grid-cols-[repeat(90,minmax(2px,1fr))] items-stretch gap-[2px]"
    >
      {history.map((day) => {
        const tone =
          day.total === 0
            ? "bg-ink-200/65"
            : day.succeeded === day.total
              ? "bg-green-600"
              : day.succeeded === 0
                ? "bg-red-600"
                : "bg-amber-500";

        return <span key={day.date} aria-hidden="true" className={`${tone} min-w-0 rounded-[1px]`} />;
      })}
    </div>
  );
}

function StatusBadge({ status }: { status: ComponentStatus }): ReactElement {
  return (
    <div className="flex items-center gap-2 font-mono text-[11px] font-semibold tracking-[0.08em] uppercase">
      <span aria-hidden="true" className={`${STATUS_TONE[status].dot} size-2 rounded-[1px]`} />
      {STATUS_LABEL[status]()}
    </div>
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
    <article className="px-5 py-6 md:px-7 md:py-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-fg-1 text-[16px] font-semibold">{t("Mosoo API & control plane")}</h3>
          <p className="text-fg-3 mt-1 text-[13px]">{detail}</p>
        </div>
        <StatusBadge status={status} />
      </div>

      <HistoryBars
        history={platform.history}
        label={t("90-day invocation success")}
        rate={platform.successRate90d}
      />
      <div className="text-fg-3 mt-3 flex flex-col gap-1 font-mono text-[10.5px] tracking-[0.04em] sm:flex-row sm:items-center sm:justify-between">
        <span>
          {t("90-day invocation success")} · {formatRate(platform.successRate90d)}
        </span>
        <span>
          {platform.invocations90d === 0
            ? t("No observations yet")
            : `${platform.invocations90d.toLocaleString(locale)} ${t("invocations")}`}
        </span>
      </div>

      <dl className="border-border-soft text-fg-2 mt-5 grid grid-cols-1 gap-4 border-t pt-4 text-[12px] sm:grid-cols-3">
        <div>
          <dt className="text-fg-3 font-mono text-[10px] tracking-[0.08em] uppercase">
            {t("Latest outcome")}
          </dt>
          <dd className="mt-1 font-semibold">{platform.latestOutcome ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-fg-3 font-mono text-[10px] tracking-[0.08em] uppercase">
            {t("HTTP status")}
          </dt>
          <dd className="mt-1 font-semibold">{platform.latestHttpStatus ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-fg-3 font-mono text-[10px] tracking-[0.08em] uppercase">
            {t("Last observed")}
          </dt>
          <dd className="mt-1 font-semibold">{formatTimestamp(platform.lastObservedAt)}</dd>
        </div>
      </dl>
    </article>
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
    <article className="border-border-soft border-t px-5 py-6 first:border-t-0 md:px-7 md:py-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-fg-1 text-[16px] font-semibold">{component.name}</h3>
          <p className="text-fg-3 mt-1 text-[13px]">{detail}</p>
        </div>
        <StatusBadge status={status} />
      </div>

      <HistoryBars
        history={component.history}
        label={t("90-day Run completion rate")}
        rate={component.successRate90d}
      />
      <div className="text-fg-3 mt-3 flex flex-col gap-1 font-mono text-[10.5px] tracking-[0.04em] sm:flex-row sm:items-center sm:justify-between">
        <span>
          {t("90-day Run completion rate")} · {formatRate(component.successRate90d)}
        </span>
        <span>
          {component.runs90d === 0
            ? t("No observations yet")
            : `${component.runs90d.toLocaleString(locale)} ${t("Runs")}`}
        </span>
      </div>

      <dl className="border-border-soft text-fg-2 mt-5 grid grid-cols-1 gap-4 border-t pt-4 text-[12px] sm:grid-cols-3">
        <div>
          <dt className="text-fg-3 font-mono text-[10px] tracking-[0.08em] uppercase">
            {t("Latest Run")}
          </dt>
          <dd className="mt-1 font-semibold">{component.latestStatus ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-fg-3 font-mono text-[10px] tracking-[0.08em] uppercase">
            {t("Duration")}
          </dt>
          <dd className="mt-1 font-semibold">{formatDuration(component.latestDurationMs)}</dd>
        </div>
        <div>
          <dt className="text-fg-3 font-mono text-[10px] tracking-[0.08em] uppercase">
            {t("Error")}
          </dt>
          <dd className="mt-1 break-all font-mono font-semibold">
            {component.latestErrorCode ?? "—"}
          </dd>
        </div>
      </dl>
    </article>
  );
}

function overallTitle(status: ComponentStatus, loading: boolean): string {
  if (loading) return t("Checking current status…");
  if (status === "operational") return t("Production services are responding");
  if (status === "degraded") return t("Production failures are being observed");
  return t("Awaiting production signals");
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
            {t("Production traffic, observed.")}
          </h1>
          <p className="text-fg-2 mt-6 max-w-[700px] text-[15px] leading-[1.65] [text-wrap:pretty]">
            {t(
              "Status is derived from Cloudflare Worker outcomes and Mosoo Run terminal events. No synthetic Agent calls, no model-token spend.",
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
              {t("Last observed")} · {formatTimestamp(payload?.updatedAt ?? null)}
            </p>
          </div>
        </m.div>
      </section>

      <section className="px-4 py-16 md:px-6 md:py-20">
        <div className="mx-auto max-w-[1040px]">
          <div className="grid gap-5 md:grid-cols-[0.78fr_1.22fr] md:gap-12">
            <div>
              <h2 className="text-fg-1" style={sectionHeadingStyle}>
                {t("Service availability")}
              </h2>
              <p className="text-fg-2 mt-4 max-w-[360px] text-[14px] leading-[1.65]">
                {t(
                  "Cloudflare reports whether the production API and control plane complete their invocations successfully.",
                )}
              </p>
            </div>
            <div className="border-border-strong bg-card overflow-hidden rounded-[10px] border shadow-sm">
              {payload?.platform ? (
                <PlatformRow platform={payload.platform} feedUnavailable={feedUnavailable} />
              ) : (
                <div className="text-fg-3 px-7 py-10 text-[14px]">
                  {t("Checking current status…")}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="border-border-soft border-t px-4 py-16 md:px-6 md:py-20">
        <div className="mx-auto max-w-[1040px]">
          <div className="grid gap-5 md:grid-cols-[0.78fr_1.22fr] md:gap-12">
            <div>
              <h2 className="text-fg-1" style={sectionHeadingStyle}>
                {t("Runtime Run stability")}
              </h2>
              <p className="text-fg-2 mt-4 max-w-[360px] text-[14px] leading-[1.65]">
                {t(
                  "Completion rate is based only on real user-facing UI and Public API Runs. Preview traffic and cancellations are excluded.",
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
              {t("Signal source")}
            </p>
            <p className="text-fg-1 mt-4 font-mono text-[28px] font-semibold tracking-[-0.04em]">
              {t("Cloudflare + Mosoo")}
            </p>
            <p className="text-fg-2 mt-4 text-[14px] leading-[1.65]">
              {t(
                "Cloudflare supplies invocation outcomes; Mosoo's existing structured business log supplies runtime, terminal status, duration, and error code.",
              )}
            </p>
          </article>
          <article className="bg-paper-50 p-7 md:p-9">
            <p className="text-fg-3 font-mono text-[10.5px] font-semibold tracking-[0.16em] uppercase">
              {t("Synthetic traffic")}
            </p>
            <p className="text-fg-1 mt-4 font-mono text-[28px] font-semibold tracking-[-0.04em]">
              {t("0 Agent Runs")}
            </p>
            <p className="text-fg-2 mt-4 text-[14px] leading-[1.65]">
              {t(
                "The status pipeline does not create Threads, invoke models, or consume tokens. Runtime status becomes Unknown after 24 hours without real traffic.",
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
              {t(
                "Resolved · 29 Jul 2026 — OpenAI Runtime runs failed before producing a response. Production hotfixes restored sandbox startup, provider routing, and lifecycle recovery.",
              )}
            </p>
            <a
              href="https://github.com/langgenius/mosoo/blob/main/docs/operations/incidents/2026-07-29-openai-runtime-unavailable.md"
              target="_blank"
              rel="noreferrer noopener"
              className="text-green-800 focus-visible:ring-ring mt-5 inline-flex rounded-sm text-[13px] font-semibold underline decoration-green-800/30 underline-offset-4 outline-none hover:decoration-green-800 focus-visible:ring-2"
            >
              {t("Read the OpenAI Runtime incident postmortem")} ↗
            </a>
          </article>
          <article>
            <p className="text-fg-3 font-mono text-[10.5px] font-semibold tracking-[0.16em] uppercase">
              {t("How this is measured")}
            </p>
            <p className="text-fg-2 mt-4 text-[14px] leading-[1.65]">
              {t(
                "The API Worker is observed continuously through Cloudflare Tail events. Runtime completion rates update whenever a real user-facing Run reaches completed, failed, or expired.",
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
