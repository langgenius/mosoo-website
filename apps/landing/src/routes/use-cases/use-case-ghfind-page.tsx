import { ArrowLeft, ArrowUpRight } from "lucide-react";
import type { CSSProperties, ReactElement } from "react";

import { locale } from "@/shared/locale";

import { GithubMark } from "../login/github-mark";
import { Reveal } from "../login/landing/motion";
import { DISPLAY_FONT, sectionHeadingStyle } from "../login/landing/typography";
import { Eyebrow } from "../login/landing/ui";
import { MOSOO_DOCS_URL } from "../login/links";
import { t } from "./i18n";
import { GHFIND } from "./use-cases-data";

const PAGE_HEADLINE_STYLE = {
  fontFamily: DISPLAY_FONT,
  fontSize: "clamp(36px, 4.6vw, 60px)",
  fontWeight: 500,
  letterSpacing: "-0.032em",
  lineHeight: 1.05,
} satisfies CSSProperties;

const STEPS = [
  {
    body: () =>
      t(
        "ghfind publishes one cattle Agent with its project-evaluation skill. mosoo runs that Agent in an isolated sandbox and manages the harness, environment, and execution lifecycle.",
      ),
    title: () => t("Publish one project analyst"),
  },
  {
    body: () =>
      t(
        "For each repository, ghfind's Go worker creates a Thread with a stable idempotency key, persists the Thread and Run ids, and follows the Run to a terminal state. The mosoo token never reaches the browser.",
      ),
    title: () => t("Create one Thread per repository"),
  },
  {
    body: () =>
      t(
        "The Agent commits analysis JSON, evidence JSON, and a Markdown report. ghfind downloads those artifacts, validates its own product schema, stores the result, and renders a native evaluation page.",
      ),
    title: () => t("Render three committed artifacts"),
  },
] as const;

const PIPELINE = [
  "Browser",
  "ghfind backend",
  "mosoo Public Thread API",
  "cattle Agent sandbox",
  "analysis + evidence + report",
  "native ghfind result",
] as const;

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
          {GHFIND.name}
        </span>
      </div>
      <h1 className="text-fg-1 mt-5 max-w-[820px] [text-wrap:balance]" style={PAGE_HEADLINE_STYLE}>
        {t("One ghfind feature runs on a published mosoo Agent.")}
      </h1>
      <p className="text-fg-2 mt-5 max-w-[680px] text-[15px] leading-[1.65] [text-wrap:pretty]">
        {t(
          "ghfind has two distinct products: a deterministic 0–100 value and trust score for GitHub accounts, and a deep evaluation for public repositories. mosoo powers only the repository evaluation. A published Agent inspects the project in a sandbox and returns structured artifacts; ghfind owns the rubric, job workflow, validation, storage, and result page.",
        )}
      </p>
      <div className="mt-6 flex items-center gap-2.5">
        <span className="text-fg-3 text-[13px]">{t("Submitted by")}</span>
        <img
          src={GHFIND.author.avatar}
          alt=""
          width={20}
          height={20}
          className="size-5 rounded-[4px]"
        />
        <span className="text-fg-1 text-[13.5px] font-semibold">{GHFIND.author.name}</span>
      </div>
      <div className="mt-7 flex flex-wrap items-center gap-3">
        <a
          href={GHFIND.productUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="bg-ink-900 text-paper-100 hover:bg-ink-800 focus-visible:ring-ring inline-flex h-11 items-center gap-2 rounded-md px-6 text-[14px] font-semibold shadow-sm transition-colors outline-none focus-visible:ring-2"
        >
          {t("Open the live app")}
          <ArrowUpRight aria-hidden="true" className="size-4" />
        </a>
        <a
          href={GHFIND.repoUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="text-ink-900 ring-ink-900/15 hover:bg-ink-900/[0.06] focus-visible:ring-ring inline-flex h-11 items-center gap-2 rounded-md px-5 text-[14px] font-semibold ring-1 transition-colors outline-none focus-visible:ring-2"
        >
          <GithubMark className="size-[18px]" />
          {t("View the repository")}
        </a>
      </div>
    </Reveal>
  );
}

function AppScreenshot(): ReactElement {
  return (
    <Reveal className="mt-12 md:mt-16">
      <figure>
        <div className="bg-paper-200/70 border-border-soft rounded-[20px] border p-3 md:p-4">
          <div className="ring-border-default overflow-hidden rounded-[12px] bg-white shadow-[var(--shadow-md)] ring-1">
            <img
              src={GHFIND.image}
              alt={GHFIND.imageAlt}
              width={1440}
              height={900}
              loading="eager"
              className="w-full"
            />
          </div>
        </div>
        <figcaption className="text-fg-3 mt-3 text-center text-[13px]">
          {GHFIND.imageAlt}
        </figcaption>
      </figure>
    </Reveal>
  );
}

function HowItWorks(): ReactElement {
  return (
    <section className="mt-16 md:mt-24">
      <Reveal>
        <h2 className="text-fg-1" style={sectionHeadingStyle}>
          {t("How it works")}
        </h2>
      </Reveal>
      <div className="mt-8 grid gap-x-10 gap-y-8 md:mt-10 md:grid-cols-3">
        {STEPS.map((step, index) => (
          <Reveal key={step.title()} delay={index * 0.06}>
            <div className="border-border-strong border-t pt-5">
              <p className="text-fg-3 font-mono text-[12px] font-semibold">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="text-fg-1 mt-3 text-[16.5px] font-semibold">{step.title()}</h3>
              <p className="text-fg-2 mt-2.5 text-[14px] leading-[1.6] [text-wrap:pretty]">
                {step.body()}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function RequestPath(): ReactElement {
  return (
    <Reveal className="mt-16 md:mt-20">
      <div className="border-border-default overflow-hidden rounded-[14px] border bg-white shadow-[var(--shadow-xs)]">
        <div className="border-border-soft text-fg-2 border-b px-4 py-2.5 font-mono text-[12px] font-semibold">
          {t("The request path")}
        </div>
        <div className="overflow-x-auto px-4 py-4 font-mono text-[13px] leading-[2]">
          {PIPELINE.map((stage, index) => (
            <div key={stage} className="whitespace-nowrap">
              {index > 0 ? <span className="text-green-700 mr-2">{"->"}</span> : null}
              <span className={index === PIPELINE.length - 1 ? "text-green-800" : "text-fg-1"}>
                {stage}
              </span>
            </div>
          ))}
        </div>
      </div>
      <p className="text-fg-3 mt-3 text-[13px] leading-[1.6]">
        {t(
          "The browser submits to ghfind. Only the ghfind backend talks to mosoo, and the browser receives ghfind's validated product result.",
        )}
      </p>
    </Reveal>
  );
}

function Facts(): ReactElement {
  return (
    <section className="mt-16 md:mt-20">
      <div className="grid gap-x-10 gap-y-8 md:grid-cols-3">
        <Reveal>
          <div className="border-border-strong border-t pt-5">
            <h3 className="text-fg-1 text-[16.5px] font-semibold">{t("What mosoo does")}</h3>
            <p className="text-fg-2 mt-2.5 text-[14px] leading-[1.6] [text-wrap:pretty]">
              {t(
                "mosoo runs the published Agent: isolated sandbox, harness and tool execution, Run lifecycle, public events, and committed Thread artifacts.",
              )}
            </p>
          </div>
        </Reveal>
        <Reveal delay={0.06}>
          <div className="border-border-strong border-t pt-5">
            <h3 className="text-fg-1 text-[16.5px] font-semibold">{t("What ghfind owns")}</h3>
            <p className="text-fg-2 mt-2.5 text-[14px] leading-[1.6] [text-wrap:pretty]">
              {t(
                "The project rubric, queue durability, schema validation, storage, and UI stay in ghfind. Its headline account score is deterministic and does not use the Agent.",
              )}
            </p>
          </div>
        </Reveal>
        <Reveal delay={0.12}>
          <div className="border-border-strong border-t pt-5">
            <h3 className="text-fg-1 text-[16.5px] font-semibold">{t("Feature wiring")}</h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {GHFIND.tags.map((tag) => (
                <li
                  key={tag}
                  className="border-border-default text-fg-2 rounded-full border px-2.5 py-1 font-mono text-[11px] font-medium"
                >
                  {tag}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function ClosingCta(): ReactElement {
  return (
    <Reveal className="border-border-soft mt-20 border-t pt-14 md:mt-24 md:pt-16">
      <div className="mx-auto flex max-w-[640px] flex-col items-center text-center">
        <h2 className="text-fg-1 [text-wrap:balance]" style={sectionHeadingStyle}>
          {t("Put an Agent behind your own product.")}
        </h2>
        <p className="text-fg-2 mt-4 text-[14.5px] leading-[1.6] [text-wrap:pretty]">
          {t(
            "Publish an Agent on mosoo, call it through the Public Thread API, and ship the result as a feature your users already understand.",
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

export function UseCaseGhfindPage(): ReactElement {
  return (
    <div className="mx-auto max-w-[1120px] px-4 pt-12 pb-20 md:px-6 md:pt-16 md:pb-24">
      <CaseHeader />
      <AppScreenshot />
      <HowItWorks />
      <RequestPath />
      <Facts />
      <ClosingCta />
    </div>
  );
}
