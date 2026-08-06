import { ArrowLeft, ArrowUpRight } from "lucide-react";
import type { CSSProperties, ReactElement } from "react";

import { locale } from "@/shared/locale";

import { GithubMark } from "../login/github-mark";
import { Reveal } from "../login/landing/motion";
import { DISPLAY_FONT, sectionHeadingStyle } from "../login/landing/typography";
import { Eyebrow } from "../login/landing/ui";
import { MOSOO_DOCS_URL } from "../login/links";
import { t } from "./i18n";
import { PITCHPILOT } from "./use-cases-data";

const APPLICATION_ARCHITECTURE_SCREENSHOT =
  "/landing/use-cases/pitchpilot-application-architecture.jpg";
const RUNTIME_ARCHITECTURE_SCREENSHOT =
  "/landing/use-cases/pitchpilot-runtime-architecture.jpg";

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
        "PitchPilot keeps authentication, deck metadata, attachments, chat, preview, and download inside its own web experience.",
      ),
    title: () => t("Own the application experience"),
  },
  {
    body: () =>
      t(
        "Its trusted Worker maps each deck to a mosoo Thread, uploads the brief, starts a Run, and keeps the Mosoo token off the browser.",
      ),
    title: () => t("Run work through mosoo"),
  },
  {
    body: () =>
      t(
        "PitchPilot reads Thread events and committed files through Mosoo's public API, then presents the Agent's HTML artifact in a sandboxed in-app preview with an explicit download.",
      ),
    title: () => t("Return a product-native artifact"),
  },
] as const;

const PIPELINE = [
  "Browser",
  "PitchPilot Worker",
  "mosoo Thread API",
  "Published Agent",
  "HTML Artifact",
  "Preview / Download",
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
          {PITCHPILOT.name}
        </span>
      </div>
      <h1 className="text-fg-1 mt-5 max-w-[860px] [text-wrap:balance]" style={PAGE_HEADLINE_STYLE}>
        {t("Keep the product UI. Put the managed Agent behind it.")}
      </h1>
      <p className="text-fg-2 mt-5 max-w-[720px] text-[15px] leading-[1.65] [text-wrap:pretty]">
        {t(
          "PitchPilot is a complete presentation web app, not an Agent console. Its backend calls one published mosoo Agent for long-running work, then turns the returned files and events into a normal product experience.",
        )}
      </p>
      <div className="mt-6 flex items-center gap-2.5">
        <span className="text-fg-3 text-[13px]">{t("Submitted by")}</span>
        <img
          src={PITCHPILOT.author.avatar}
          alt=""
          width={20}
          height={20}
          className="size-5 rounded-[4px]"
        />
        <span className="text-fg-1 text-[13.5px] font-semibold">{PITCHPILOT.author.name}</span>
      </div>
      <div className="mt-7 flex flex-wrap items-center gap-3">
        <a
          href={PITCHPILOT.productUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="bg-ink-900 text-paper-100 hover:bg-ink-800 focus-visible:ring-ring inline-flex h-11 items-center gap-2 rounded-md px-6 text-[14px] font-semibold shadow-sm transition-colors outline-none focus-visible:ring-2"
        >
          {t("Open the live app")}
          <ArrowUpRight aria-hidden="true" className="size-4" />
        </a>
        {PITCHPILOT.repoUrl ? (
          <a
            href={PITCHPILOT.repoUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="text-ink-900 ring-ink-900/15 hover:bg-ink-900/[0.06] focus-visible:ring-ring inline-flex h-11 items-center gap-2 rounded-md px-5 text-[14px] font-semibold ring-1 transition-colors outline-none focus-visible:ring-2"
          >
            <GithubMark className="size-[18px]" />
            {t("View the repository")}
          </a>
        ) : null}
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
              src={PITCHPILOT.image}
              alt={PITCHPILOT.imageAlt}
              width={1272}
              height={868}
              loading="eager"
              className="w-full"
            />
          </div>
        </div>
        <figcaption className="text-fg-3 mt-3 text-center text-[13px]">
          {PITCHPILOT.imageAlt}
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

function ArchitectureGallery(): ReactElement {
  return (
    <section className="mt-16 md:mt-24">
      <Reveal>
        <h2 className="text-fg-1" style={sectionHeadingStyle}>
          {t("See the architecture the Agent delivered.")}
        </h2>
        <p className="text-fg-2 mt-4 max-w-[700px] text-[14.5px] leading-[1.65] [text-wrap:pretty]">
          {t(
            "Each capture keeps the PitchPilot workspace on the left and the committed Agent artifact on the right: first at the application level, then inside the managed Agent runtime.",
          )}
        </p>
      </Reveal>
      <div className="mt-8 grid gap-5">
        <Reveal>
          <figure className="border-border-default overflow-hidden rounded-[14px] border bg-white shadow-[var(--shadow-xs)]">
            <img
              src={APPLICATION_ARCHITECTURE_SCREENSHOT}
              alt={t(
                "PitchPilot workspace beside a slide showing the Dify application layer and Mosoo managed Agent runtime as two responsibilities.",
              )}
              width={1272}
              height={868}
              loading="lazy"
              className="w-full"
            />
            <figcaption className="border-border-soft text-fg-2 border-t px-4 py-3 text-[13px] leading-[1.55]">
              {t(
                "Application boundary: Dify owns the product layer; Mosoo supplies the managed Agent backend.",
              )}
            </figcaption>
          </figure>
        </Reveal>
        <Reveal delay={0.06}>
          <figure className="border-border-default overflow-hidden rounded-[14px] border bg-white shadow-[var(--shadow-xs)]">
            <img
              src={RUNTIME_ARCHITECTURE_SCREENSHOT}
              alt={t(
                "PitchPilot workspace beside a slide showing Thread, Run, Harness Selection, MCP Tools, Delegated End-User Context, Normalized Events, and Artifacts inside Mosoo.",
              )}
              width={1272}
              height={868}
              loading="lazy"
              className="w-full"
            />
            <figcaption className="border-border-soft text-fg-2 border-t px-4 py-3 text-[13px] leading-[1.55]">
              {t(
                "Runtime boundary: one Thread contains Runs, tools, delegated identity, events, and Artifacts.",
              )}
            </figcaption>
          </figure>
        </Reveal>
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
          "The application owns the user experience. Mosoo owns published Agent execution, Thread and Run lifecycle, event delivery, and Agent-produced files.",
        )}
      </p>
    </Reveal>
  );
}

function Facts(): ReactElement {
  return (
    <section className="mt-16 grid gap-8 md:mt-20 md:grid-cols-3">
      <Reveal>
        <div className="border-border-strong border-t pt-5">
          <h3 className="text-fg-1 text-[16.5px] font-semibold">{t("Verified delivery path")}</h3>
          <p className="text-fg-2 mt-2.5 text-[14px] leading-[1.6] [text-wrap:pretty]">
            {t(
              "English prompt plus attachment → completed Run → committed HTML artifact → in-app preview → browser download.",
            )}
          </p>
        </div>
      </Reveal>
      <Reveal delay={0.06}>
        <div className="border-border-strong border-t pt-5">
          <h3 className="text-fg-1 text-[16.5px] font-semibold">{t("Explicit boundary")}</h3>
          <p className="text-fg-2 mt-2.5 text-[14px] leading-[1.6] [text-wrap:pretty]">
            {t(
              "This case proves HTML artifact preview and download. It does not claim native PitchPilot version history or PPTX parity.",
            )}
          </p>
        </div>
      </Reveal>
      <Reveal delay={0.12}>
        <div className="border-border-strong border-t pt-5">
          <h3 className="text-fg-1 text-[16.5px] font-semibold">{t("Stack")}</h3>
          <ul className="mt-3 flex flex-wrap gap-2">
            {PITCHPILOT.tags.map((tag) => (
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
    </section>
  );
}

function ClosingCta(): ReactElement {
  return (
    <Reveal className="border-border-soft mt-20 border-t pt-14 md:mt-24 md:pt-16">
      <div className="mx-auto flex max-w-[640px] flex-col items-center text-center">
        <h2 className="text-fg-1 [text-wrap:balance]" style={sectionHeadingStyle}>
          {t("Put a managed Agent behind your product UI.")}
        </h2>
        <p className="text-fg-2 mt-4 text-[14.5px] leading-[1.6] [text-wrap:pretty]">
          {t(
            "Publish the Agent once, call it through Threads, and turn its events and files into the experience your users already understand.",
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

export function UseCasePitchPilotPage(): ReactElement {
  return (
    <div className="mx-auto max-w-[1120px] px-4 pt-12 pb-20 md:px-6 md:pt-16 md:pb-24">
      <CaseHeader />
      <AppScreenshot />
      <HowItWorks />
      <ArchitectureGallery />
      <RequestPath />
      <Facts />
      <ClosingCta />
    </div>
  );
}
