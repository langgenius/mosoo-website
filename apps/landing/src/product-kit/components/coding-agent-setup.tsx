// PM-10, setting mosoo up from a coding agent or from the console. Ported
// from routes/project-overview/project-overview-install.tsx and
// onboarding-steps.tsx (7cb9866cfc) with the console's strings. The console
// shows one lane at a time behind a toggle; here both lanes are visible, side
// by side when there is room, so nothing hides behind a tab. Steps link to the
// matching console pages on cloud.mosoo.ai. The five tiles are the coding
// agents that can run the setup prompt, not mosoo runtimes.
// The setup prompt is the console's own (projectOverview.setupPrompt) with
// the console's values filled in; it still mentions publishing an Agent,
// which the product plans to remove (issue #584).
// Replay: the Example Project's checklist ticks off, step by step.

import { useState } from "react";
import type { ReactElement, ReactNode } from "react";

import type { KitLocale } from "../i18n";
import { CONSOLE_CONSTANTS, consoleText } from "../i18n";
import { copyText } from "../lib/clipboard";
import { reached, useReplay } from "../lib/replay";
import { RuntimeMark } from "./brand-marks";
import { ArrowUpRight, Check, ChevronRight, MousePointerClick, SquareTerminal } from "./icons";
import { ConsoleIsland, KitFooter, cx } from "./island";
import { Badge, Button, CopyCheckIcon } from "./primitives";

export interface CodingAgentSetupProps {
  locale: KitLocale;
  /** Tick the checklist once when first half visible (never with reduced motion). */
  animate?: boolean | undefined;
  /** "done" shows the Example Project's finished checklist; "todo" shows numbered steps. */
  progress?: "done" | "todo" | undefined;
  /** Show the console's onboarding title and subtitle above the lanes. */
  heading?: boolean | undefined;
  /** Render the replay frozen at this many milliseconds (stills, docs, tests). */
  replayAt?: number | undefined;
}

const CONSOLE_ORIGIN = "https://cloud.mosoo.ai";
const DOCS_URL = `${CONSOLE_CONSTANTS.docsBaseUrl}/`;
const REPLAY_MS = 3400;
const STEP_DONE_AT = [500, 1400, 2300] as const;

const STEPS = [
  { label: "onboarding.addProviderKey", optional: false, to: "/providers" },
  { label: "onboarding.createApiToken", optional: true, to: "/project-settings/api-keys" },
  { label: "onboarding.createAgent", optional: false, to: "/agent?create=1" },
] as const;

export function buildSetupPrompt(locale: KitLocale): string {
  return consoleText(locale, "projectOverview.setupPrompt", {
    docsUrl: CONSOLE_CONSTANTS.docsBaseUrl,
    installCommand: CONSOLE_CONSTANTS.installCommand,
    origin: CONSOLE_ORIGIN,
  });
}

function LaneHeader({ children, icon }: { children: ReactNode; icon: ReactNode }): ReactElement {
  return (
    <div className="text-fg-1 flex items-center gap-2 text-sm font-semibold">
      <span className="text-fg-3">{icon}</span>
      {children}
    </div>
  );
}

function StepMarker({
  animateIn,
  done,
  locale,
  number,
}: {
  animateIn: boolean;
  done: boolean;
  locale: KitLocale;
  number: number;
}): ReactElement {
  if (done) {
    return (
      <span
        className={cx(
          "bg-success-bg text-success-fg flex size-6 shrink-0 items-center justify-center rounded-full",
          animateIn ? "success-check-enter" : null,
        )}
      >
        <Check className="size-3.5" strokeWidth={3} />
        <span className="sr-only">{consoleText(locale, "common.done")}</span>
      </span>
    );
  }

  return (
    <span className="border-border-strong bg-sunken text-fg-2 flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold">
      {number}
    </span>
  );
}

function DocsAction({ locale }: { locale: KitLocale }): ReactElement {
  return (
    <a
      className="group border-border bg-card hover:bg-paper-100 focus-visible:ring-ring flex w-full items-center gap-4 rounded-lg border px-4 py-3.5 text-left transition-colors outline-none focus-visible:ring-2"
      href={DOCS_URL}
      rel="noreferrer"
      target="_blank"
    >
      <div className="min-w-0 flex-1">
        <span className="text-fg-1 text-sm leading-6 font-semibold">{consoleText(locale, "onboarding.readDocs")}</span>
        <p className="text-fg-3 mt-0.5 text-[13px] leading-5">
          {consoleText(locale, "onboarding.quickstartDescription")}
        </p>
      </div>
      <ArrowUpRight className="text-fg-2 size-4 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </a>
  );
}

function CodingAgentLane({ locale }: { locale: KitLocale }): ReactElement {
  const [commandCopied, setCommandCopied] = useState(false);
  const [promptCopied, setPromptCopied] = useState(false);
  const [promptCopyFailed, setPromptCopyFailed] = useState(false);

  async function copyCommand(): Promise<void> {
    if (await copyText(CONSOLE_CONSTANTS.installCommand)) {
      setCommandCopied(true);
      globalThis.setTimeout(() => {
        setCommandCopied(false);
      }, 1500);
    }
  }

  async function copyPrompt(): Promise<void> {
    setPromptCopyFailed(false);

    if (!(await copyText(buildSetupPrompt(locale)))) {
      setPromptCopyFailed(true);
      return;
    }

    setPromptCopied(true);
    globalThis.setTimeout(() => {
      setPromptCopied(false);
    }, 1500);
  }

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <LaneHeader icon={<SquareTerminal className="size-4" />}>
        {consoleText(locale, "onboarding.inCodingAgent")}
      </LaneHeader>

      <div className="border-border bg-sunken flex w-full flex-col items-stretch gap-3 rounded-lg border px-4 py-3 @lg:flex-row @lg:items-center">
        <code className="text-fg-1 min-w-0 flex-1 text-left font-mono text-[13px] whitespace-pre-wrap [overflow-wrap:anywhere] @lg:text-[14px]">
          <span className="text-fg-3 select-none">$ </span>
          {CONSOLE_CONSTANTS.installCommand}
        </code>
        <Button
          aria-label={commandCopied ? consoleText(locale, "common.copied") : consoleText(locale, "common.copyCommand")}
          className="w-full @lg:w-auto"
          onClick={() => {
            void copyCommand();
          }}
          variant="outline"
        >
          <CopyCheckIcon copied={commandCopied} />
          {commandCopied ? consoleText(locale, "common.copied") : consoleText(locale, "common.copy")}
        </Button>
      </div>

      <p className="text-fg-3 text-[13px] leading-5">{consoleText(locale, "onboarding.setupDescription")}</p>

      <button
        className="group border-border bg-card hover:bg-paper-100 focus-visible:ring-ring flex w-full items-center gap-4 rounded-lg border px-4 py-3.5 text-left transition-colors outline-none focus-visible:ring-2"
        onClick={() => {
          void copyPrompt();
        }}
        type="button"
      >
        <div className="min-w-0 flex-1">
          <span className="text-fg-1 text-sm leading-6 font-semibold">
            {promptCopied
              ? consoleText(locale, "onboarding.setupPromptCopied")
              : consoleText(locale, "onboarding.setupWithAgent")}
          </span>
          <p className="text-fg-3 mt-0.5 text-[13px] leading-5">{consoleText(locale, "onboarding.docsDescription")}</p>
        </div>
        <span aria-label={consoleText(locale, "onboarding.harnesses")} className="hidden items-center gap-1.5 @sm:flex" role="group">
          {CONSOLE_CONSTANTS.codingAgentHarnesses.map((harness) => (
            <span
              className="border-border bg-sunken inline-flex size-7 items-center justify-center rounded-md border"
              key={harness.runtimeId}
              title={harness.label}
            >
              <RuntimeMark className="size-4.5" iconKey={harness.runtimeId} />
              <span className="sr-only">{harness.label}</span>
            </span>
          ))}
        </span>
        <CopyCheckIcon className="text-fg-2 size-4" copied={promptCopied} />
      </button>

      {promptCopyFailed ? (
        <div className="w-full text-left">
          <textarea
            aria-label={consoleText(locale, "projectOverview.setupPromptLabel")}
            className="border-border bg-sunken text-fg-1 h-28 w-full rounded-md border px-3 py-2 font-mono text-xs"
            onFocus={(event) => {
              event.currentTarget.select();
            }}
            readOnly
            value={buildSetupPrompt(locale)}
          />
          <p className="text-fg-3 mt-1 text-xs">{consoleText(locale, "projectOverview.copyPromptFailed")}</p>
        </div>
      ) : null}

      <DocsAction locale={locale} />
    </div>
  );
}

function ConsoleLane({
  elapsed,
  locale,
  progress,
}: {
  elapsed: number | null;
  locale: KitLocale;
  progress: "done" | "todo";
}): ReactElement {
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <LaneHeader icon={<MousePointerClick className="size-4" />}>
        {consoleText(locale, "onboarding.inConsole")}
      </LaneHeader>
      <nav
        aria-label={consoleText(locale, "onboarding.steps")}
        className="border-border bg-card divide-border w-full divide-y overflow-hidden rounded-lg border text-left"
      >
        {STEPS.map((step, index) => {
          const doneAt = STEP_DONE_AT[index] ?? 0;
          const done = progress === "done" && reached(elapsed, doneAt);

          return (
            <a
              className="group hover:bg-paper-100 focus-visible:ring-ring flex items-center gap-3 px-4 py-3.5 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-inset"
              href={`${CONSOLE_ORIGIN}${step.to}`}
              key={step.to}
            >
              <StepMarker animateIn={elapsed !== null && done} done={done} locale={locale} number={index + 1} />
              <span className="text-fg-1 min-w-0 flex-1 truncate text-left text-sm leading-6 font-medium">
                {consoleText(locale, step.label)}
              </span>
              {step.optional ? <Badge variant="outline">{consoleText(locale, "onboarding.optional")}</Badge> : null}
              <ChevronRight className="text-fg-3 size-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
            </a>
          );
        })}
      </nav>
    </div>
  );
}

export function CodingAgentSetupView({
  elapsed,
  heading,
  locale,
  progress,
}: {
  elapsed: number | null;
  heading: boolean;
  locale: KitLocale;
  progress: "done" | "todo";
}): ReactElement {
  return (
    <div className="flex flex-col gap-6">
      {heading ? (
        <div className="flex flex-col items-center text-center">
          <p className="text-foreground tracking-title text-3xl font-semibold">{consoleText(locale, "onboarding.title")}</p>
          <p className="text-fg-3 mt-3 max-w-2xl text-base leading-7">{consoleText(locale, "onboarding.subtitle")}</p>
        </div>
      ) : null}
      <div className="grid gap-8 @3xl:grid-cols-2 @3xl:gap-6">
        <CodingAgentLane locale={locale} />
        <ConsoleLane elapsed={elapsed} locale={locale} progress={progress} />
      </div>
    </div>
  );
}

export function CodingAgentSetup({
  animate = false,
  heading = false,
  locale,
  progress = "done",
  replayAt,
}: CodingAgentSetupProps): ReactElement {
  const replay = useReplay({ animate: animate && progress === "done", durationMs: REPLAY_MS, replayAt });

  return (
    <ConsoleIsland locale={locale} rootRef={replay.ref}>
      <CodingAgentSetupView elapsed={replay.elapsed} heading={heading} locale={locale} progress={progress} />
      {progress === "done" ? (
        <KitFooter canReplay={replay.canReplay} locale={locale} onReplay={replay.replay} />
      ) : null}
    </ConsoleIsland>
  );
}
