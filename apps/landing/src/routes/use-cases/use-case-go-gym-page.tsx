import { ArrowLeft, ArrowUpRight, CheckCircle2 } from "lucide-react";
import type { CSSProperties, ReactElement } from "react";

import { locale } from "@/shared/locale";

import { Reveal } from "../login/landing/motion";
import { DISPLAY_FONT, sectionHeadingStyle } from "../login/landing/typography";
import { Eyebrow } from "../login/landing/ui";
import {
  MOSOO_API_REFERENCE_URL,
  MOSOO_DOCS_URL,
  MOSOO_GITHUB_URL,
} from "../login/links";
import { t } from "./i18n";
import { GO_GYM } from "./use-cases-data";

const MOSOO_SCREENSHOT = "/landing/use-cases/go-gym-mosoo-agents.png";
const CLOUDFLARE_CONTAINERS_URL =
  "https://developers.cloudflare.com/containers/";
const SUPABASE_RLS_URL =
  "https://supabase.com/docs/guides/database/postgres/row-level-security";

const PAGE_HEADLINE_STYLE = {
  fontFamily: DISPLAY_FONT,
  fontSize: "clamp(36px, 4.6vw, 60px)",
  fontWeight: 500,
  letterSpacing: "-0.032em",
  lineHeight: 1.05,
} satisfies CSSProperties;

const VALUE = [
  {
    body: () =>
      t(
        "Go Gym publishes one shared Agent. Its trusted backend creates a separate Thread with userId for each signed-in user, so the browser never receives a mosoo token.",
      ),
    title: () => t("One Agent, user-scoped Threads"),
  },
  {
    body: () =>
      t(
        "Mosoo carries the verified user context into the MCP call. The model cannot choose another user ID, while Go Gym and Supabase still enforce authorization at the data boundary.",
      ),
    title: () => t("Delegated tool identity"),
  },
  {
    body: () =>
      t(
        "Each Thread runs in a Cattle sandbox. Production uses OpenCode, while the same business MCP path was verified with Codex and Claude without rewriting the app.",
      ),
    title: () => t("Isolated, harness-neutral execution"),
  },
] as const;

const REQUEST_PATH = [
  "Browser",
  "Go Gym backend",
  "mosoo Thread API",
  "Cattle sandbox",
  "Delegated MCP",
  "Supabase",
] as const;

const VERIFIED_RESULTS = [
  "3 structured records",
  "1,150 kcal intake",
  "64 g protein",
  "320 kcal training burn",
] as const;

const RESPONSIBILITIES = [
  {
    body: () =>
      t(
        "Product UI, Supabase login, domain rules, WebSocket updates, and the business tool endpoints.",
      ),
    name: "Go Gym",
  },
  {
    body: () =>
      t(
        "Agent publication, Thread and Run lifecycle, user delegation, sandbox isolation, and harness selection.",
      ),
    name: "mosoo",
  },
  {
    body: () =>
      t(
        "OAuth identity, Postgres persistence, Row Level Security, and private file storage.",
      ),
    name: "Supabase",
  },
  {
    body: () =>
      t(
        "A stateless Container for the web app and a Worker for the remote MCP service. Durable user data stays in Supabase.",
      ),
    name: "Cloudflare",
  },
] as const;

const RESOURCES = [
  {
    description: () =>
      t("Use the production app and try a meal or workout log."),
    href: GO_GYM.productUrl,
    label: () => t("Try Go Gym"),
  },
  {
    description: () =>
      t("Create Threads and Runs from an application backend."),
    href: MOSOO_API_REFERENCE_URL,
    label: () => t("Thread API reference"),
  },
  {
    description: () =>
      t("Inspect the open-source Agent runtime behind this case."),
    href: MOSOO_GITHUB_URL,
    label: () => t("Mosoo source"),
  },
  {
    description: () =>
      t("See the application compute used by the production deployment."),
    href: CLOUDFLARE_CONTAINERS_URL,
    label: () => t("Cloudflare Containers"),
  },
  {
    description: () =>
      t("See how durable per-user records are enforced at the database layer."),
    href: SUPABASE_RLS_URL,
    label: () => t("Supabase Row Level Security"),
  },
] as const;

function Screenshot({
  alt,
  eager = false,
  src,
}: {
  alt: string;
  eager?: boolean;
  src: string;
}): ReactElement {
  return (
    <figure>
      <div className="bg-paper-200/70 border-border-soft rounded-[20px] border p-3 md:p-4">
        <div className="ring-border-default overflow-hidden rounded-[12px] bg-white shadow-[var(--shadow-md)] ring-1">
          <img
            src={src}
            alt={alt}
            width={1440}
            height={900}
            loading={eager ? "eager" : "lazy"}
            className="w-full"
          />
        </div>
      </div>
      <figcaption className="text-fg-3 mt-3 text-center text-[13px]">
        {alt}
      </figcaption>
    </figure>
  );
}

function CaseHeader(): ReactElement {
  return (
    <Reveal className="flex flex-col items-start">
      <a
        href={`/${locale}/use-cases`}
        className="text-fg-2 hover:text-fg-1 focus-visible:ring-ring inline-flex items-center gap-1.5 rounded-md text-[13px] font-semibold transition-colors outline-none focus-visible:ring-2"
      >
        <ArrowLeft aria-hidden="true" className="size-3.5" />
        {t("Use cases")}
      </a>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Eyebrow>{t("Use case")}</Eyebrow>
        <span className="text-green-700 font-mono text-[11px] font-semibold tracking-[0.18em] uppercase">
          {GO_GYM.name}
        </span>
      </div>
      <h1
        className="text-fg-1 mt-5 max-w-[860px] [text-wrap:balance]"
        style={PAGE_HEADLINE_STYLE}
      >
        {t("One Agent for every user. Their data stays isolated.")}
      </h1>
      <p className="text-fg-2 mt-5 max-w-[720px] text-[15px] leading-[1.65] [text-wrap:pretty]">
        {t(
          "Go Gym is a production fitness tracker. Users describe meals, workouts, and body measurements in chat; the app turns them into structured records, durable dashboards, and progress summaries.",
        )}
      </p>
      <div className="mt-6 flex items-center gap-2.5">
        <span className="text-fg-3 text-[13px]">{t("Submitted by")}</span>
        <img
          src={GO_GYM.author.avatar}
          alt=""
          width={20}
          height={20}
          className="size-5 rounded-[4px]"
        />
        <span className="text-fg-1 text-[13.5px] font-semibold">
          {GO_GYM.author.name}
        </span>
      </div>
      <div className="mt-7 flex flex-wrap items-center gap-3">
        <a
          href={GO_GYM.productUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="bg-ink-900 text-paper-100 hover:bg-ink-800 focus-visible:ring-ring inline-flex h-11 items-center gap-2 rounded-md px-6 text-[14px] font-semibold shadow-sm transition-colors outline-none focus-visible:ring-2"
        >
          {t("Open the live app")}
          <ArrowUpRight aria-hidden="true" className="size-4" />
        </a>
        <a
          href={MOSOO_API_REFERENCE_URL}
          target="_blank"
          rel="noreferrer noopener"
          className="text-ink-900 ring-ink-900/15 hover:bg-ink-900/[0.06] focus-visible:ring-ring inline-flex h-11 items-center gap-2 rounded-md px-5 text-[14px] font-semibold ring-1 transition-colors outline-none focus-visible:ring-2"
        >
          {t("Read the API docs")}
          <ArrowUpRight aria-hidden="true" className="size-4" />
        </a>
      </div>
    </Reveal>
  );
}

function ProductionProof(): ReactElement {
  return (
    <section className="mt-16 grid gap-8 md:mt-20 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <Reveal>
        <div className="border-border-strong border-t pt-5">
          <p className="text-green-700 font-mono text-[11px] font-semibold tracking-[0.18em] uppercase">
            {t("Production smoke test")}
          </p>
          <h2 className="text-fg-1 mt-4" style={sectionHeadingStyle}>
            {t("From one message to durable records")}
          </h2>
          <p className="text-fg-2 mt-4 text-[14px] leading-[1.65] [text-wrap:pretty]">
            {t(
              "A test user described breakfast, lunch, and 45 minutes of strength training in one message. The Agent created three user-scoped records and refreshed the dashboard.",
            )}
          </p>
        </div>
      </Reveal>
      <Reveal delay={0.06}>
        <div className="border-border-default rounded-[14px] border bg-white p-6 shadow-[var(--shadow-xs)]">
          <p className="text-fg-3 font-mono text-[11px] font-semibold tracking-[0.14em] uppercase">
            {t("Verified result")}
          </p>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {VERIFIED_RESULTS.map((result) => (
              <li
                key={result}
                className="text-fg-1 flex items-center gap-2 text-[13.5px] font-medium"
              >
                <CheckCircle2
                  aria-hidden="true"
                  className="text-green-700 size-4 shrink-0"
                />
                {t(result)}
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
    </section>
  );
}

function MosooValue(): ReactElement {
  return (
    <section className="mt-16 md:mt-24">
      <Reveal>
        <h2 className="text-fg-1" style={sectionHeadingStyle}>
          {t("What mosoo provides")}
        </h2>
      </Reveal>
      <div className="mt-8 grid gap-x-10 gap-y-8 md:mt-10 md:grid-cols-3">
        {VALUE.map((item, index) => (
          <Reveal key={item.title()} delay={index * 0.06}>
            <div className="border-border-strong border-t pt-5">
              <p className="text-fg-3 font-mono text-[12px] font-semibold">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="text-fg-1 mt-3 text-[16.5px] font-semibold">
                {item.title()}
              </h3>
              <p className="text-fg-2 mt-2.5 text-[14px] leading-[1.6] [text-wrap:pretty]">
                {item.body()}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Architecture(): ReactElement {
  return (
    <section className="mt-16 md:mt-24">
      <Reveal>
        <h2 className="text-fg-1" style={sectionHeadingStyle}>
          {t("The production request path")}
        </h2>
        <p className="text-fg-2 mt-4 max-w-[720px] text-[14.5px] leading-[1.65]">
          {t(
            "The app and Agent runtime are deployed separately. The browser talks only to Go Gym; its backend holds the Mosoo token and supplies the trusted userId.",
          )}
        </p>
      </Reveal>
      <Reveal className="mt-8" delay={0.06}>
        <ol className="border-border-default grid overflow-hidden rounded-[14px] border bg-white shadow-[var(--shadow-xs)] md:grid-cols-6">
          {REQUEST_PATH.map((stage, index) => (
            <li
              key={stage}
              className="border-border-soft flex min-h-24 flex-col justify-between border-b p-4 last:border-b-0 md:border-r md:border-b-0 md:last:border-r-0"
            >
              <span className="text-fg-3 font-mono text-[11px]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="text-fg-1 mt-4 text-[13px] font-semibold">
                {stage}
              </span>
            </li>
          ))}
        </ol>
        <p className="text-fg-3 mt-3 text-[13px] leading-[1.6]">
          {t(
            "Mosoo delegates identity; it does not replace application authorization. Go Gym validates the caller and Supabase RLS remains the final data boundary.",
          )}
        </p>
      </Reveal>
    </section>
  );
}

function StackOwnership(): ReactElement {
  return (
    <section className="mt-16 md:mt-24">
      <Reveal>
        <h2 className="text-fg-1" style={sectionHeadingStyle}>
          {t("Clear ownership across the stack")}
        </h2>
      </Reveal>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {RESPONSIBILITIES.map((item, index) => (
          <Reveal key={item.name} delay={index * 0.04}>
            <div className="border-border-default h-full rounded-[14px] border bg-white p-6 shadow-[var(--shadow-xs)]">
              <h3 className="text-fg-1 text-[16px] font-semibold">
                {item.name}
              </h3>
              <p className="text-fg-2 mt-2.5 text-[14px] leading-[1.6] [text-wrap:pretty]">
                {item.body()}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function AgentConsole(): ReactElement {
  return (
    <section className="mt-16 md:mt-24">
      <Reveal>
        <h2 className="text-fg-1" style={sectionHeadingStyle}>
          {t("One use case, multiple harnesses")}
        </h2>
        <p className="text-fg-2 mt-4 max-w-[720px] text-[14.5px] leading-[1.65]">
          {t(
            "Go Gym runs on OpenCode in production. The same Agent contract and business MCP were also exercised through Codex and Claude before release.",
          )}
        </p>
      </Reveal>
      <Reveal className="mt-8" delay={0.06}>
        <Screenshot
          src={MOSOO_SCREENSHOT}
          alt={t(
            "Published Go Gym Agents for OpenCode, Codex, and Claude in the Mosoo console.",
          )}
        />
      </Reveal>
    </section>
  );
}

function ResourceLinks(): ReactElement {
  return (
    <section className="mt-16 md:mt-24">
      <Reveal>
        <h2 className="text-fg-1" style={sectionHeadingStyle}>
          {t("Explore the product and stack")}
        </h2>
      </Reveal>
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {RESOURCES.map((resource, index) => (
          <Reveal key={resource.href} delay={index * 0.04}>
            <a
              href={resource.href}
              target="_blank"
              rel="noreferrer noopener"
              className="group border-border-default hover:border-border-strong focus-visible:ring-ring flex h-full min-h-32 flex-col rounded-[14px] border bg-white p-5 shadow-[var(--shadow-xs)] transition-colors outline-none focus-visible:ring-2"
            >
              <span className="text-fg-1 flex items-center justify-between gap-3 text-[14px] font-semibold">
                {resource.label()}
                <ArrowUpRight
                  aria-hidden="true"
                  className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </span>
              <span className="text-fg-2 mt-2 text-[13px] leading-[1.55]">
                {resource.description()}
              </span>
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function ClosingCta(): ReactElement {
  return (
    <Reveal className="border-border-soft mt-20 border-t pt-14 md:mt-24 md:pt-16">
      <div className="mx-auto flex max-w-[660px] flex-col items-center text-center">
        <h2
          className="text-fg-1 [text-wrap:balance]"
          style={sectionHeadingStyle}
        >
          {t("Embed an Agent in your own SaaS.")}
        </h2>
        <p className="text-fg-2 mt-4 text-[14.5px] leading-[1.6] [text-wrap:pretty]">
          {t(
            "Keep your product, auth, and database. Let mosoo own the Agent lifecycle, isolation, harness, and delegated tool context.",
          )}
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <a
            href="https://cloud.mosoo.ai/login"
            className="bg-ink-900 text-paper-100 hover:bg-ink-800 focus-visible:ring-ring inline-flex h-11 items-center rounded-md px-6 text-[14px] font-semibold shadow-sm transition-colors outline-none focus-visible:ring-2"
          >
            {t("Start on mosoo Cloud")}
          </a>
          <a
            href={MOSOO_DOCS_URL}
            className="text-ink-900 ring-ink-900/15 hover:bg-ink-900/[0.06] focus-visible:ring-ring inline-flex h-11 items-center rounded-md px-5 text-[14px] font-semibold ring-1 transition-colors outline-none focus-visible:ring-2"
          >
            {t("Read the docs")}
          </a>
        </div>
      </div>
    </Reveal>
  );
}

export function UseCaseGoGymPage(): ReactElement {
  return (
    <div className="mx-auto max-w-[1120px] px-4 pt-12 pb-20 md:px-6 md:pt-16 md:pb-24">
      <CaseHeader />
      <Reveal className="mt-12 md:mt-16">
        <Screenshot src={GO_GYM.image} alt={GO_GYM.imageAlt} eager />
      </Reveal>
      <ProductionProof />
      <MosooValue />
      <Architecture />
      <StackOwnership />
      <AgentConsole />
      <ResourceLinks />
      <ClosingCta />
    </div>
  );
}
