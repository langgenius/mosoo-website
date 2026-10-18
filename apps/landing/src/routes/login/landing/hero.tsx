import { ArrowRight } from "lucide-react";
import type { CSSProperties, ReactElement } from "react";

import { locale } from "@/shared/locale";

import { GithubMark } from "../github-mark";
import {
  docsUrl,
  MOSOO_CLOUD_URL,
  MOSOO_GITHUB_URL,
  MOSOO_INSTALL_COMMAND,
  MOSOO_INSTALL_SCRIPT_URL,
} from "../links";
import { t } from "./above-fold-i18n";
import { CopyButton } from "./copy-button";
import { DISPLAY_FONT } from "./typography";

const HERO_HEADLINE_STYLE = {
  fontFamily: DISPLAY_FONT,
  // Japanese runs about twice as long as the English line and its glyphs set
  // denser, so it gets a smaller display size to keep the H1 compact.
  fontSize: locale === "ja" ? "clamp(26px, 3.3vw, 48px)" : "clamp(36px, 4.4vw, 62px)",
  fontWeight: 500,
  letterSpacing: "-0.03em",
  lineHeight: locale === "en" ? 1.04 : 1.18,
} satisfies CSSProperties;

const PRODUCT_TERM = "Agent runtime";

/** Keeps the product term on one line inside a translated headline. */
function KeepProductTerm({ text }: { text: string }): ReactElement {
  const [before, after] = text.split(PRODUCT_TERM);
  if (after === undefined) {
    return <>{text}</>;
  }
  return (
    <>
      {before}
      <span translate="no" className="whitespace-nowrap">
        {PRODUCT_TERM}
      </span>
      {after}
    </>
  );
}

// The setup prompt is a few KB per locale, so it is not in the first bundle. The
// below-the-fold chunk (final CTA) imports it statically once the page is
// idle, and hovering or focusing the copy button starts the load early.
function loadSetupPrompt(): Promise<string> {
  return import("./setup-prompt").then((module) => module.SETUP_PROMPT[locale]);
}

function prepareSetupPrompt(): void {
  void loadSetupPrompt();
}

/**
 * H1 in two tones: the product in full ink, the audience softer. The spans are
 * inline so the sentence balances over two lines on desktop. Japanese puts
 * the audience first, so the order follows the locale; English joins the two
 * spans with a space so the heading text reads as one sentence.
 */
function Headline(): ReactElement {
  const product = (
    <span>
      <KeepProductTerm text={t("An open-source, API-first managed Agent runtime")} />
    </span>
  );
  const audience = <span className="text-ink-500">{t("for application backends.")}</span>;

  return (
    <h1
      id="hero-title"
      className="landing-hero-reveal text-ink-900 max-w-[1080px] [text-wrap:balance]"
      style={HERO_HEADLINE_STYLE}
    >
      {locale === "ja" ? (
        <>
          {audience}
          {product}
        </>
      ) : (
        <>
          {product}
          {locale === "en" ? " " : null}
          {audience}
        </>
      )}
    </h1>
  );
}

/** Copy deck §2: the agent-native way in, the console's coding-agent setup. */
function AgentStrip(): ReactElement {
  return (
    <div className="landing-hero-reveal landing-hero-reveal-delay-4 border-border-strong bg-paper-50 mt-10 w-full max-w-[880px] rounded-[14px] border p-4 text-left sm:p-5 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
        <div className="max-w-[560px]">
          <h2 className="text-ink-900 text-[17px] font-semibold">{t("Set up with your coding agent")}</h2>
          <p className="text-ink-500 mt-2 text-[16px] leading-[1.6]">
            {t(
              "Paste the setup prompt into Codex, Claude Code, OpenCode, Cursor, or Cline. It installs the mosoo CLI and the @mosoo skill, then asks you for a provider key.",
            )}
          </p>
        </div>
        <CopyButton
          getText={loadSetupPrompt}
          onPrepare={prepareSetupPrompt}
          label={t("Copy setup prompt")}
          copiedLabel={t("Setup prompt copied")}
          failedLabel={t("Copy failed.")}
          className="shrink-0 self-start"
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
  );
}

export function Hero(): ReactElement {
  return (
    <section aria-labelledby="hero-title" className="px-4 pt-14 pb-12 md:px-6 md:pt-20 md:pb-14">
      <div className="mx-auto flex max-w-[1160px] flex-col items-center text-center">
        <Headline />
        <p className="landing-hero-reveal landing-hero-reveal-delay-1 text-ink-700 mt-6 max-w-[640px] text-[18px] leading-[1.6] [text-wrap:pretty] md:text-[19px]">
          {t(
            "mosoo runs OpenAI Codex, Claude Agent SDK, OpenCode, and Pi behind one API, each Session in its own sandbox.",
          )}
        </p>

        <div className="landing-hero-reveal landing-hero-reveal-delay-2 mt-9 flex flex-wrap items-center justify-center gap-3">
          <a
            href={MOSOO_CLOUD_URL}
            className="bg-ink-900 text-paper-100 hover:bg-ink-800 focus-visible:ring-ring focus-visible:ring-offset-paper-100 inline-flex h-12 items-center rounded-md px-7 text-[16px] font-semibold shadow-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            {t("Try mosoo")}
          </a>
          <a
            href={docsUrl("quickstart/")}
            className="text-ink-900 ring-ink-900/20 hover:bg-ink-900/[0.06] focus-visible:ring-ring inline-flex h-12 items-center gap-2 rounded-md px-5 text-[16px] font-semibold ring-1 transition-colors outline-none focus-visible:ring-2"
          >
            <span>{t("Read the quickstart")}</span>
            <ArrowRight aria-hidden="true" className="size-4" />
          </a>
          <a
            href={MOSOO_GITHUB_URL}
            className="text-ink-900 hover:bg-ink-900/[0.06] focus-visible:ring-ring inline-flex h-12 items-center gap-2 rounded-md px-3 text-[16px] font-semibold transition-colors outline-none focus-visible:ring-2"
          >
            <GithubMark className="size-[18px]" />
            <span>{t("View source")}</span>
          </a>
        </div>

        <p className="landing-hero-reveal landing-hero-reveal-delay-3 text-ink-500 mt-5 text-[16px]">
          {t("mosoo is in Alpha. Public APIs may still change.")}
        </p>

        <AgentStrip />
      </div>
    </section>
  );
}
