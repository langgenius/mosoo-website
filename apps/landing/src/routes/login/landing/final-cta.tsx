import type { ReactElement } from "react";

import { locale } from "@/shared/locale";

import { MOSOO_CLOUD_URL, MOSOO_INSTALL_COMMAND, MOSOO_INSTALL_SCRIPT_URL } from "../links";
import { CopyButton } from "./copy-button";
import { t } from "./i18n";
import { SETUP_PROMPT } from "./setup-prompt";

/**
 * Copy deck §11: say what happens on click, then offer the two ways in the
 * console itself offers (onboarding.inConsole / onboarding.inCodingAgent).
 * The setup prompt is shown in full, so a visitor can read what they hand to
 * their agent, and can select it by hand if the clipboard is unavailable.
 */
export function FinalCta(): ReactElement {
  const setupPrompt = SETUP_PROMPT[locale];

  return (
    <section id="start" aria-labelledby="start-title" className="v2a-section pb-28">
      <span aria-hidden="true" className="v2a-node" style={{ top: 117 }} />
      {/* The hero's two-tone sentence, closing the page: the act in full ink,
          the promise softer. */}
      <h2 id="start-title" className="v2a-display v2a-h1">
        <span>{t("Start your first Session.")}</span>
        {locale === "en" ? " " : null}
        <span className="v2a-tone-soft">{t("Reply in a minute or in seven days.")}</span>
      </h2>

      <div className="mt-12 grid grid-cols-1 overflow-hidden rounded-[16px] bg-[rgba(251,251,249,0.94)] shadow-[0_0_0_1px_rgba(11,26,20,0.1)] md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <div className="flex flex-col p-6 md:p-8">
          <h3 className="text-ink-900 text-[20px] font-semibold">{t("In the console")}</h3>
          <p className="text-ink-500 mt-3 max-w-[440px] text-[16px] leading-[1.6]">
            {t(
              "Sign in with email or Google. Your first sign-in creates a Default Project. Add a provider key, then start a Session.",
            )}
          </p>
          <div className="mt-auto pt-8">
            <a href={MOSOO_CLOUD_URL} className="v2a-btn-primary">
              {t("Try mosoo")}
            </a>
          </div>
        </div>

        <div className="min-w-0 border-t border-[rgba(109,120,106,0.35)] p-6 md:border-t-0 md:border-l md:p-8">
          <h3 id="agent-lane-title" className="text-ink-900 text-[20px] font-semibold">
            {t("In your coding agent")}
          </h3>
          <p className="text-ink-500 mt-3 text-[16px] leading-[1.6]">
            {t(
              "Paste the setup prompt into Codex, Claude Code, OpenCode, Cursor, or Cline. It installs the CLI, then asks you to add a provider key in the console, the one step it can’t do for you.",
            )}
          </p>
          <pre
            tabIndex={0}
            aria-labelledby="agent-lane-title"
            className="border-border-strong bg-paper-100 text-ink-700 focus-visible:ring-ring mt-5 max-h-56 overflow-auto rounded-[10px] border p-4 font-mono text-[14px] leading-[1.6] whitespace-pre-wrap outline-none focus-visible:ring-2"
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
