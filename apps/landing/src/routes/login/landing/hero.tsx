import { ArrowRight } from "lucide-react";
import type { CSSProperties, ReactElement } from "react";

import { locale } from "@/shared/locale";
import { hasRuntimeIcon, RuntimeIcon } from "@/shared/ui/brand-icons";

import { docsUrl, MOSOO_CLOUD_URL } from "../links";
import { t, tp } from "./above-fold-i18n";
import { CopyButton } from "./copy-button";
import { displayTracking, DISPLAY_FONT } from "./typography";
import { PHRASE_CLASS, Phrases } from "./ui";

const HERO_HEADLINE_STYLE = {
  fontFamily: DISPLAY_FONT,
  // Japanese runs about twice as long as the English line and its glyphs set
  // denser, so it gets a smaller display size to keep the H1 compact.
  fontSize:
    locale === "ja"
      ? "clamp(26px, 3.3vw, 46px)"
      : locale === "zh"
        ? "clamp(32px, 4vw, 56px)"
        : "clamp(34px, 4.3vw, 60px)",
  fontWeight: 500,
  letterSpacing: displayTracking("-0.03em"),
  lineHeight: locale === "en" ? 1.04 : 1.2,
} satisfies CSSProperties;

// The four runtimes, in README order. Pi has no brand mark in the icon set, so
// it gets a text mark rather than another product's logo.
const RUNTIMES = [
  { id: "openai-runtime", name: "OpenAI Codex" },
  { id: "claude-agent-sdk", name: "Claude Agent SDK" },
  { id: "acp-fallback", name: "OpenCode" },
  { id: "pi", name: "Pi" },
] as const;

// The setup prompt is a few KB per locale, so it is not in the first bundle.
// Hovering or focusing the copy button starts the load early.
function loadSetupPrompt(): Promise<string> {
  return import("./setup-prompt").then((module) => module.SETUP_PROMPT[locale]);
}

function prepareSetupPrompt(): void {
  void loadSetupPrompt();
}

/**
 * H1 in two tones: the product in full ink, the audience softer. Japanese
 * puts the audience first, so both clauses stay in full ink there: a pale
 * first line would read as the weaker half. English joins the two spans with
 * a space so the heading text reads as one sentence.
 */
function Headline(): ReactElement {
  // Chinese ends the product clause with a full-width comma, which PingFang
  // sets with a half-em of space after it; ending the line there hides it.
  const product = (
    <span className={locale === "zh" ? "sm:block" : undefined}>
      <Phrases text={tp("An open-source, API-first managed Agent runtime")} />
    </span>
  );
  const audience = (
    <span className={locale === "ja" ? undefined : "text-ink-500"}>
      <Phrases text={tp("for application backends.")} />
    </span>
  );

  return (
    <h1
      id="hero-title"
      className={`${PHRASE_CLASS} landing-hero-reveal text-ink-900 mx-auto max-w-[1040px] [text-wrap:balance]`}
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

function RuntimeMark({ id, name }: { id: string; name: string }): ReactElement {
  if (hasRuntimeIcon(id)) {
    return <RuntimeIcon runtimeId={id} size={18} loading="eager" className="size-[18px] shrink-0" />;
  }
  return (
    <span
      aria-hidden="true"
      className="bg-ink-900 text-paper-100 inline-flex size-[18px] shrink-0 items-center justify-center rounded-[4px] font-mono text-[10px] font-semibold"
    >
      {name}
    </span>
  );
}

/** The owner's "compact proof": the four runtimes behind the one API. */
function RuntimeRow(): ReactElement {
  return (
    <div className="landing-hero-reveal landing-hero-reveal-delay-3 mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2.5">
      <p id="hero-runtimes" className="text-ink-500 text-[15px] font-semibold">
        {t("One API, 4 runtimes:")}
      </p>
      <ul aria-labelledby="hero-runtimes" className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2.5">
        {RUNTIMES.map((runtime) => (
          <li key={runtime.id} className="flex items-center gap-2">
            <RuntimeMark id={runtime.id} name={runtime.name} />
            <span translate="no" className="text-ink-900 text-[15px] font-semibold whitespace-nowrap">
              {runtime.name}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const PRIMARY_CTA_CLASS =
  "bg-ink-900 text-paper-100 hover:bg-ink-800 focus-visible:ring-ring focus-visible:ring-offset-paper-100 inline-flex h-12 items-center justify-center rounded-md px-7 text-[16px] font-semibold shadow-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-2 max-sm:w-full";

const SECONDARY_CTA_CLASS =
  "text-ink-900 ring-ink-900/20 hover:bg-ink-900/[0.06] focus-visible:ring-ring inline-flex h-12 items-center justify-center gap-2 rounded-md px-5 text-[16px] font-semibold ring-1 transition-colors outline-none focus-visible:ring-2 max-sm:w-full";

export function Hero(): ReactElement {
  return (
    <section aria-labelledby="hero-title" className="px-4 pt-9 pb-7 md:px-6 md:pt-8 md:pb-7">
      <div className="mx-auto flex max-w-[1160px] flex-col items-center text-center">
        <Headline />
        <p
          className={`${PHRASE_CLASS} landing-hero-reveal landing-hero-reveal-delay-1 text-ink-700 mt-5 max-w-[600px] text-[18px] leading-[1.55] [text-wrap:balance] md:text-[19px] lg:max-w-[880px]`}
        >
          <Phrases
            text={tp(
              "Start an agent task with one API call, then continue the same Session a minute or 7 days later.",
            )}
          />
        </p>

        <div className="landing-hero-reveal landing-hero-reveal-delay-2 mt-6 flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:items-center">
          <a href={MOSOO_CLOUD_URL} className={PRIMARY_CTA_CLASS}>
            {t("Try mosoo")}
          </a>
          <a href={docsUrl("quickstart/")} className={SECONDARY_CTA_CLASS}>
            <span className={PHRASE_CLASS}>
              <Phrases text={tp("Read the quickstart")} />
            </span>
            <ArrowRight aria-hidden="true" className="size-4 shrink-0" />
          </a>
        </div>

        <div className="landing-hero-reveal landing-hero-reveal-delay-2 mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
          <p className="text-ink-700 text-[15px]">{t("Using a coding agent?")}</p>
          <CopyButton
            getText={loadSetupPrompt}
            onPrepare={prepareSetupPrompt}
            label={tp("Copy setup prompt")}
            copiedLabel={t("Setup prompt copied")}
            failedLabel={t("Copy failed.")}
            variant="quiet"
          />
        </div>

        <p className={`${PHRASE_CLASS} landing-hero-reveal landing-hero-reveal-delay-3 text-ink-500 mt-3 text-[15px]`}>
          <Phrases text={tp("mosoo is in Alpha. Public APIs may still change.")} />
        </p>

        <RuntimeRow />
      </div>
    </section>
  );
}
