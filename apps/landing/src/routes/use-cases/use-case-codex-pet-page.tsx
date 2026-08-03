import { ArrowLeft, ArrowUpRight, Play } from "lucide-react";
import { useRef, useState } from "react";
import type { CSSProperties, ReactElement } from "react";

import { locale } from "@/shared/locale";

import { GithubMark } from "../login/github-mark";
import { Reveal } from "../login/landing/motion";
import { DISPLAY_FONT, sectionHeadingStyle } from "../login/landing/typography";
import { Eyebrow } from "../login/landing/ui";
import { MOSOO_DOCS_URL } from "../login/links";
import { t } from "./i18n";
import { CODEX_PET, CODEX_PET_DEMO_POSTER, CODEX_PET_DEMO_VIDEO } from "./use-cases-data";

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
        "A Pet Agent with an avatar-generation skill is published on mosoo. Its environment carries the openai and pillow packages plus an OpenAI provider credential.",
      ),
    title: () => t("Publish the Agent"),
  },
  {
    body: () =>
      t(
        "Publishing generates an Instruction for LLM — an API contract sized for a prompt. Paste it into Codex and the integration work moves to the coding agent.",
      ),
    title: () => t("Copy the Instruction for LLM"),
  },
  {
    body: () =>
      t(
        "Codex wires the mosoo Thread API into the product backend: the Worker creates a Thread with the uploaded avatar, polls the Run, and streams the finished ZIP back.",
      ),
    title: () => t("Integrate from Codex"),
  },
] as const;

const PIPELINE = [
  "Browser",
  "Cloudflare Worker",
  "mosoo Thread API",
  "Agent sandbox",
  "outputs/codex-pet.zip",
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
          {CODEX_PET.name}
        </span>
      </div>
      <h1 className="text-fg-1 mt-5 max-w-[820px] [text-wrap:balance]" style={PAGE_HEADLINE_STYLE}>
        {t("Publish one Agent. Let any Codex call it.")}
      </h1>
      <p className="text-fg-2 mt-5 max-w-[680px] text-[15px] leading-[1.65] [text-wrap:pretty]">
        {t(
          "Codex Pet shows how a workflow built in a coding IDE becomes a reusable mosoo-managed Agent exposed through an API — one uploaded avatar comes back as a validated ZIP with all nine Codex pet animation states.",
        )}
      </p>
      <div className="mt-6 flex items-center gap-2.5">
        <span className="text-fg-3 text-[13px]">{t("Submitted by")}</span>
        <img
          src={CODEX_PET.author.avatar}
          alt=""
          width={20}
          height={20}
          className="size-5 rounded-[4px]"
        />
        <span className="text-fg-1 text-[13.5px] font-semibold">{CODEX_PET.author.name}</span>
      </div>
      <div className="mt-7 flex flex-wrap items-center gap-3">
        <a
          href={CODEX_PET.productUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="bg-ink-900 text-paper-100 hover:bg-ink-800 focus-visible:ring-ring inline-flex h-11 items-center gap-2 rounded-md px-6 text-[14px] font-semibold shadow-sm transition-colors outline-none focus-visible:ring-2"
        >
          {t("Open the live app")}
          <ArrowUpRight aria-hidden="true" className="size-4" />
        </a>
        <a
          href={CODEX_PET.repoUrl}
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
              src={CODEX_PET.image}
              alt={CODEX_PET.imageAlt}
              width={1440}
              height={900}
              loading="eager"
              className="w-full"
            />
          </div>
        </div>
        <figcaption className="text-fg-3 mt-3 text-center text-[13px]">
          {CODEX_PET.imageAlt}
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
        {t("The token stays in the Worker. The browser only ever sees the finished ZIP.")}
      </p>
    </Reveal>
  );
}

function DemoVideo(): ReactElement {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);

  return (
    <div className="border-border-default overflow-hidden rounded-[14px] border bg-white shadow-[var(--shadow-xs)]">
      <div className="relative">
        <video
          ref={videoRef}
          controls
          playsInline
          preload="none"
          poster={CODEX_PET_DEMO_POSTER}
          aria-label={t(
            "Agent as API, end to end — from publishing the Agent to the downloaded pet.",
          )}
          onPlay={() => setStarted(true)}
          className="aspect-video w-full"
        >
          <source src={CODEX_PET_DEMO_VIDEO} type="video/mp4" />
        </video>
        {started ? null : (
          <button
            type="button"
            aria-label={t("Watch the 57-second demo")}
            onClick={() => videoRef.current?.play()}
            className="group absolute inset-0 flex items-center justify-center"
          >
            <span className="bg-ink-900/85 text-paper-100 flex size-14 items-center justify-center rounded-full shadow-lg transition-transform duration-200 group-hover:scale-105">
              <Play aria-hidden="true" className="ml-0.5 size-5" fill="currentColor" />
            </span>
          </button>
        )}
      </div>
      <div className="border-border-soft flex items-center justify-between gap-3 border-t px-4 py-3">
        <span className="text-fg-1 text-[13.5px] font-semibold">
          {t("Watch the 57-second demo")}
        </span>
        <span className="text-fg-3 font-mono text-[12px]">0:57</span>
      </div>
    </div>
  );
}

function DemoAndFacts(): ReactElement {
  return (
    <section className="mt-16 grid gap-8 md:mt-20 md:grid-cols-[minmax(0,6fr)_minmax(0,5fr)]">
      <Reveal>
        <DemoVideo />
      </Reveal>
      <div className="flex flex-col gap-8">
        <Reveal delay={0.06}>
          <div className="border-border-strong border-t pt-5">
            <h3 className="text-fg-1 text-[16.5px] font-semibold">{t("What comes out")}</h3>
            <p className="text-fg-2 mt-2.5 text-[14px] leading-[1.6] [text-wrap:pretty]">
              {t(
                "A 1536×1872 RGBA WebP atlas with nine animation rows, QA-checked in the sandbox before download.",
              )}
            </p>
          </div>
        </Reveal>
        <Reveal delay={0.12}>
          <div className="border-border-strong border-t pt-5">
            <h3 className="text-fg-1 text-[16.5px] font-semibold">{t("Stack")}</h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {[...CODEX_PET.tags, "Python skill"].map((tag) => (
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
          {t("Build your own Agent as API.")}
        </h2>
        <p className="text-fg-2 mt-4 text-[14.5px] leading-[1.6] [text-wrap:pretty]">
          {t(
            "Publish an Agent on mosoo, hand its Instruction for LLM to a coding agent, and ship the integration in an afternoon.",
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

export function UseCaseCodexPetPage(): ReactElement {
  return (
    <div className="mx-auto max-w-[1120px] px-4 pt-12 pb-20 md:px-6 md:pt-16 md:pb-24">
      <CaseHeader />
      <AppScreenshot />
      <HowItWorks />
      <RequestPath />
      <DemoAndFacts />
      <ClosingCta />
    </div>
  );
}
