import type { ReactElement } from "react";

import { locale } from "@/shared/locale";

import { MOSOO_CLOUD_URL, MOSOO_INSTALL_COMMAND, MOSOO_INSTALL_SCRIPT_URL } from "../links";
import { CopyButton } from "./copy-button";
import { t } from "./i18n";
import { SETUP_PROMPT } from "./setup-prompt";
import { stageHeadingStyle } from "./typography";

/**
 * Copy deck §11: say what happens on click, then offer the two ways in the
 * console itself offers (onboarding.inConsole / onboarding.inCodingAgent).
 * The setup prompt is shown in full, so a visitor can read what they hand to
 * their agent, and can select it by hand if the clipboard is unavailable.
 */
export function FinalCta(): ReactElement {
  const setupPrompt = SETUP_PROMPT[locale];

  return (
    <section id="start" aria-labelledby="start-title" className="px-4 py-20 md:px-6 md:py-24">
      <h2 id="start-title" className="stage-heading text-ink-900 max-w-[18em] [text-wrap:balance]" style={stageHeadingStyle}>
        {t("The fastest way to try mosoo is the hosted console")}
      </h2>

      <div className="border-border-strong mt-10 grid grid-cols-1 overflow-hidden rounded-[14px] border md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <div className="bg-paper-50 flex flex-col p-6 md:p-8">
          <h3 className="text-ink-900 text-[20px] font-semibold">{t("In the console")}</h3>
          <p className="text-ink-500 mt-3 max-w-[440px] text-[16px] leading-[1.6]">
            {t(
              "Sign in with email or Google. Your first sign-in creates a Default Project. Add a provider key, then start a Session.",
            )}
          </p>
          <div className="mt-auto pt-8">
            <a
              href={MOSOO_CLOUD_URL}
              className="bg-ink-900 text-paper-100 hover:bg-ink-800 focus-visible:ring-ring focus-visible:ring-offset-paper-50 inline-flex h-12 items-center rounded-md px-7 text-[16px] font-semibold shadow-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            >
              {t("Try mosoo")}
            </a>
          </div>
        </div>

        <div className="border-border-strong bg-paper-50 min-w-0 border-t p-6 md:border-t-0 md:border-l md:p-8">
          <h3 id="agent-lane-title" className="text-ink-900 text-[20px] font-semibold">
            {t("In your coding agent")}
          </h3>
          <p className="text-ink-500 mt-3 text-[16px] leading-[1.6]">
            {t(
              "Paste the setup prompt into Codex, Claude Code, OpenCode, Cursor, or Cline. It installs the CLI and asks you for your provider key, the one value it can’t create for you.",
            )}
          </p>
          <pre
            tabIndex={0}
            aria-labelledby="agent-lane-title"
            className="border-border-strong bg-paper-100 text-ink-700 focus-visible:ring-ring mt-5 max-h-56 overflow-auto rounded-[10px] border p-4 font-mono text-[13px] leading-[1.6] whitespace-pre-wrap outline-none focus-visible:ring-2"
          >
            {setupPrompt}
          </pre>
          <div className="mt-4">
            <CopyButton
              getText={() => setupPrompt}
              label={t("Copy setup prompt")}
              copiedLabel={t("Setup prompt copied")}
              failedLabel={t("Copy failed. Select and copy the prompt above.")}
            />
          </div>
          <div className="border-border-strong bg-paper-100 mt-5 flex min-w-0 flex-wrap items-center gap-2 rounded-md border py-1.5 pr-1.5 pl-3">
            <code
              translate="no"
              className="text-ink-900 min-w-0 flex-[1_1_15rem] py-1 font-mono text-[12.5px] leading-[1.5] [overflow-wrap:break-word] sm:text-[13px]"
            >
              <span aria-hidden="true" className="text-ink-400 select-none">
                ${" "}
              </span>
              {MOSOO_INSTALL_COMMAND}
            </code>
            <CopyButton
              getText={() => MOSOO_INSTALL_COMMAND}
              label={t("Copy command")}
              copiedLabel={t("Command copied")}
              failedLabel={t("Copy failed.")}
              variant="compact"
            />
          </div>
          <a
            href={MOSOO_INSTALL_SCRIPT_URL}
            className="text-ink-500 hover:text-ink-900 focus-visible:ring-ring mt-3 inline-block rounded-sm text-[14px] font-semibold underline decoration-current/30 underline-offset-4 transition-colors outline-none focus-visible:ring-2"
          >
            {t("Read the install script")}
          </a>
        </div>
      </div>

      <p className="text-ink-500 mt-6 text-[16px]">{t("mosoo is in Alpha. Public APIs may still change.")}</p>
    </section>
  );
}
