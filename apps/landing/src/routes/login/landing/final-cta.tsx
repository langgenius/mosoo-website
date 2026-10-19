import { useState } from "react";
import type { ReactElement } from "react";

import { locale } from "@/shared/locale";

import { MOSOO_CLOUD_URL, MOSOO_INSTALL_COMMAND, MOSOO_INSTALL_SCRIPT_URL } from "../links";
import { CopyButton } from "./copy-button";
import { t } from "./i18n";
import { SETUP_PROMPT } from "./setup-prompt";
import { Phrases } from "./ui";

/**
 * Copy deck §11: say what happens on click, then offer the two ways in the
 * console itself offers (onboarding.inConsole / onboarding.inCodingAgent).
 * The setup prompt shows its first lines and opens in full on request; Copy
 * always copies all of it.
 */
/** The install command with a wrap opportunity before the URL and the pipe. */
function InstallCommand(): ReactElement {
  const [head, rest = ""] = MOSOO_INSTALL_COMMAND.split(" https://");
  const [url, pipe = ""] = rest.split(" | ");
  return (
    <>
      {head} <wbr />
      https://{url} <wbr />| {pipe}
    </>
  );
}

const PROMPT_PREVIEW_LINES = 3;

export function FinalCta(): ReactElement {
  const setupPrompt = SETUP_PROMPT[locale];
  const [promptOpen, setPromptOpen] = useState(false);
  const promptLines = setupPrompt.split("\n");
  const shownPrompt = promptOpen ? setupPrompt : promptLines.slice(0, PROMPT_PREVIEW_LINES).join("\n");

  return (
    <section id="start" aria-labelledby="start-title" className="v2a-section pb-28">
      <span aria-hidden="true" className="v2a-node" style={{ top: 117 }} />
      {/* The hero's two-tone sentence, closing the page: the act in full ink,
          the promise softer. */}
      <h2 id="start-title" className="v2a-display v2a-h1">
        <span>
          <Phrases text={t("Start your first Session.")} />
        </span>
        {locale === "en" ? " " : null}
        <span className="v2a-tone-soft">
          <Phrases text={t("Reply in a minute or in seven days.")} />
        </span>
      </h2>

      {/* The console lane first and full width, its button beside what happens
          after the click (v2c); the coding-agent lane below it. */}
      <div className="mt-12 overflow-hidden rounded-[16px] bg-[rgba(251,251,249,0.94)] shadow-[0_0_0_1px_rgba(11,26,20,0.1)]">
        <div className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between md:gap-10 md:p-8">
          <div className="min-w-0">
            <h3 className="text-ink-900 text-[20px] font-semibold">{t("In the console")}</h3>
            <p className="text-ink-500 mt-3 max-w-[560px] text-[16px] leading-[1.6]">
              {t(
                "Sign in with email or Google. Your first sign-in creates a Default Project. Add a provider key, then start a Session.",
              )}
            </p>
          </div>
          <div className="shrink-0">
            <a href={MOSOO_CLOUD_URL} className="v2a-btn-primary">
              {t("Try mosoo")}
            </a>
          </div>
        </div>

        <div className="min-w-0 border-t border-[rgba(109,120,106,0.35)] p-6 md:p-8">
          <h3 id="agent-lane-title" className="text-ink-900 text-[20px] font-semibold">
            {t("In your coding agent")}
          </h3>
          <p className="text-ink-500 mt-3 max-w-[48rem] text-[16px] leading-[1.6]">
            {t(
              "Paste the setup prompt into Codex, Claude Code, OpenCode, Cursor, or Cline. It installs the CLI, then asks you to add a provider key in the console, the one step it can’t do for you.",
            )}
          </p>
          <pre
            id="setup-prompt-text"
            tabIndex={0}
            aria-labelledby="agent-lane-title"
            className="border-border-strong bg-paper-100 text-ink-700 focus-visible:ring-ring mt-5 max-h-80 max-w-[82ch] overflow-auto rounded-[10px] border p-4 font-mono text-[15px] leading-[1.6] whitespace-pre-wrap outline-none focus-visible:ring-2"
          >
            {shownPrompt}
            {promptOpen ? null : "\n…"}
          </pre>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <CopyButton
              getText={() => setupPrompt}
              label={t("Copy setup prompt")}
              copiedLabel={t("Setup prompt copied")}
              failedLabel={t("Copy failed. Select and copy the prompt above.")}
            />
            <button
              type="button"
              aria-controls="setup-prompt-text"
              aria-expanded={promptOpen}
              onClick={() => {
                setPromptOpen((open) => !open);
              }}
              className="text-ink-700 hover:text-ink-900 focus-visible:ring-ring min-h-11 rounded-sm px-1 text-[15px] font-semibold underline decoration-current/30 underline-offset-4 outline-none focus-visible:ring-2"
            >
              {promptOpen ? t("Show less") : t("Show full prompt")}
            </button>
          </div>
          <div className="border-border-strong bg-paper-100 mt-5 flex max-w-[48rem] min-w-0 flex-wrap items-center gap-2 rounded-md border py-1.5 pr-1.5 pl-3">
            <code
              translate="no"
              className="text-ink-900 min-w-0 flex-[1_1_15rem] py-1 font-mono text-[15px] leading-[1.5] [overflow-wrap:break-word] sm:text-[16px]"
            >
              <span aria-hidden="true" className="text-ink-400 select-none">
                ${" "}
              </span>
              <InstallCommand />
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
