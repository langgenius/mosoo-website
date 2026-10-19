import { ArrowRight, ChevronRight } from "lucide-react";
import type { ReactElement } from "react";

import { cn } from "@/shared/lib/class-names";
import { locale } from "@/shared/locale";

import { MOSOO_CLOUD_URL, MOSOO_INSTALL_COMMAND, MOSOO_INSTALL_SCRIPT_URL } from "../links";
import { CopyButton } from "./copy-button";
import { t, tp } from "./i18n";
import { SETUP_PROMPT } from "./setup-prompt";
import { PHRASE_CLASS, Phrases, SectionHeading } from "./ui";

/**
 * Copy deck §11: the two ways in the console itself offers
 * (onboarding.inConsole / onboarding.inCodingAgent), console first. The
 * console row names its three steps and puts the button right under them;
 * the coding-agent path is the quieter second row, with the full prompt one
 * click away so a visitor can read what they hand to their agent.
 */
export function FinalCta(): ReactElement {
  const setupPrompt = SETUP_PROMPT[locale];
  const consoleSteps = [
    t("Sign in with email or Google. Your first sign-in creates a Default Project."),
    t("Add a provider key."),
    t("Start a Session."),
  ];

  return (
    <section id="start" aria-labelledby="start-title" className="px-4 py-16 md:px-6 md:py-18">
      <SectionHeading id="start-title" title={tp("Start your first Session")} />

      <div className="border-border-strong mt-10 overflow-hidden rounded-[14px] border">
        <div className="bg-paper-50 p-5 sm:p-6 md:p-8">
          <h3 className={cn(PHRASE_CLASS, "text-ink-900 text-[20px] font-semibold")}>
            <Phrases text={tp("In the console")} />
          </h3>
          {/* The three steps the console walks through, then the button that
              starts them: on wide screens the button ends the same row. */}
          <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
            <ol className="grid gap-x-4 gap-y-3 md:grid-cols-[minmax(0,1.6fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)] md:items-start">
              {consoleSteps.map((step, index) => (
                <li key={step} className="contents">
                  <span className="text-ink-900 text-[16px] leading-[1.55]">{step}</span>
                  {index < consoleSteps.length - 1 ? (
                    <ArrowRight aria-hidden="true" className="text-ink-400 mt-1 hidden size-4 md:block" />
                  ) : null}
                </li>
              ))}
            </ol>
            <a
              href={MOSOO_CLOUD_URL}
              className="bg-ink-900 text-paper-100 hover:bg-ink-800 focus-visible:ring-ring focus-visible:ring-offset-paper-50 inline-flex h-12 shrink-0 items-center justify-center self-start rounded-md px-7 text-[16px] font-semibold shadow-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-2 max-sm:w-full lg:self-center"
            >
              {t("Try mosoo")}
            </a>
          </div>
        </div>

        <div className="border-border-strong bg-paper-100 min-w-0 border-t p-5 sm:p-6 md:p-8">
          <h3 id="agent-lane-title" className={cn(PHRASE_CLASS, "text-ink-900 text-[18px] font-semibold")}>
            <Phrases text={tp("In your coding agent")} />
          </h3>
          <p className="text-ink-700 mt-2 max-w-[760px] text-[16px] leading-[1.6]">
            {t(
              "Paste the setup prompt into Codex, Claude Code, OpenCode, Cursor, or Cline. It installs the CLI, then asks you to add a provider key in the console, the one step it can’t do for you.",
            )}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
            <CopyButton
              getText={() => setupPrompt}
              label={tp("Copy setup prompt")}
              copiedLabel={t("Setup prompt copied")}
              failedLabel={t("Copy failed. Open the prompt below and copy it by hand.")}
            />
          </div>
          <details className="group mt-3">
            <summary className="text-ink-700 hover:text-ink-900 focus-visible:ring-ring inline-flex min-h-11 cursor-pointer list-none items-center gap-1.5 rounded-sm text-[15px] font-semibold outline-none focus-visible:ring-2 sm:min-h-9 [&::-webkit-details-marker]:hidden">
              <ChevronRight
                aria-hidden="true"
                className="size-4 shrink-0 transition-transform duration-150 ease-out group-open:rotate-90 motion-reduce:transition-none"
              />
              <span className={PHRASE_CLASS}>
                <Phrases text={tp("Read the setup prompt")} />
              </span>
            </summary>
            <pre
              tabIndex={0}
              aria-labelledby="agent-lane-title"
              className="border-border-strong bg-paper-50 text-ink-700 focus-visible:ring-ring mt-2 max-h-72 overflow-auto rounded-[10px] border p-4 font-mono text-[14px] leading-[1.6] whitespace-pre-wrap outline-none focus-visible:ring-2"
            >
              {setupPrompt}
            </pre>
          </details>
          <div className="border-border-strong bg-paper-50 mt-4 flex min-w-0 flex-wrap items-center gap-2 rounded-md border py-1.5 pr-1.5 pl-3">
            {/* On a phone the command gets the whole row, so it wraps at its spaces
                and the URL stays in one piece at 390px; break-word only steps in
                on narrower screens. */}
            <code
              translate="no"
              className="text-ink-900 min-w-0 flex-[1_1_15rem] py-1 font-mono text-[13.5px] leading-[1.5] [overflow-wrap:break-word] max-sm:basis-full sm:text-[14px]"
            >
              <span aria-hidden="true" className="text-ink-400 select-none">
                ${" "}
              </span>
              curl -fsSL <wbr />
              https://install.mosoo.ai/install.sh <wbr />| bash
            </code>
            <CopyButton
              getText={() => MOSOO_INSTALL_COMMAND}
              label={tp("Copy command")}
              copiedLabel={t("Command copied")}
              failedLabel={t("Copy failed.")}
              variant="compact"
            />
          </div>
          <a
            href={MOSOO_INSTALL_SCRIPT_URL}
            className="text-ink-700 hover:text-ink-900 focus-visible:ring-ring mt-3 inline-flex min-h-11 items-center rounded-sm text-[15px] font-semibold underline decoration-current/30 underline-offset-4 transition-colors outline-none focus-visible:ring-2 sm:min-h-0"
          >
            {t("Read the install script")}
          </a>
        </div>
      </div>

      <p className={`${PHRASE_CLASS} text-ink-500 mt-6 text-[16px]`}>
        <Phrases text={tp("mosoo is in Alpha. Public APIs may still change.")} />
      </p>
    </section>
  );
}
