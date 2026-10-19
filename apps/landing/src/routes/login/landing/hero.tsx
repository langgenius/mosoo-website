import { ArrowRight } from "lucide-react";
import type { CSSProperties, ReactElement } from "react";

import { PreviewReplay } from "@/product-kit/components/preview-replay";
import { OUTPUTS } from "@/product-kit/data/example-universe";
import { consoleText, kitText } from "@/product-kit/i18n";
import { locale } from "@/shared/locale";

import { docsUrl, MOSOO_CLOUD_URL } from "../links";
import { t } from "./above-fold-i18n";
import { PixelPlate } from "./stage";
import { STAGE_DISPLAY_FONT } from "./typography";

const HERO_HEADLINE_STYLE = {
  fontFamily: STAGE_DISPLAY_FONT,
  // Japanese runs longer than the English line, so it sets a size smaller.
  fontSize: locale === "ja" ? "clamp(28px, 2.6vw, 38px)" : "clamp(34px, 3.05vw, 44px)",
  fontWeight: 600,
  letterSpacing: locale === "en" ? "-0.032em" : "-0.01em",
  lineHeight: locale === "en" ? 1.06 : 1.22,
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

/** One sentence in one ink. Japanese puts the audience first. */
function Headline(): ReactElement {
  const product = <KeepProductTerm text={t("An open-source, API-first managed Agent runtime")} />;
  const audience = t("for application backends.");

  return (
    <h1 id="hero-title" className="stage-heading text-ink-900 [text-wrap:balance]" style={HERO_HEADLINE_STYLE}>
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

const CHART_SRC = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(OUTPUTS.chartTurn1.text)}`;

/**
 * The turn's result, a tray layered over the Preview's cut edge (the way a
 * second window overlaps the first on a desktop). The chart is the real
 * chart.svg the example's agent code wrote; the paths are turn 1's three
 * artifacts. app.css hides the tray while the Preview replays and lands it
 * when the turn commits; without JavaScript or motion it is simply there.
 */
function OutputsTray(): ReactElement {
  const artifact = consoleText(locale, "files.artifact");

  return (
    <div className="stage-outputs bg-paper-50 border-border-strong relative z-10 mx-2 -mt-4 flex min-w-0 items-stretch overflow-hidden rounded-[10px] border shadow-[0_14px_32px_-16px_rgba(0,0,0,0.25)] sm:mx-6">
      <img
        src={CHART_SRC}
        alt={t("Revenue by region: north 150, south 80, grand_total 230.")}
        width={360}
        height={132}
        className="border-border-soft hidden h-[92px] w-auto shrink-0 border-r bg-white px-1 sm:block"
      />
      <ul className="flex min-w-0 flex-1 flex-col justify-center gap-0.5 px-3 py-2.5 sm:px-4" aria-label={t("Saved files")}>
        {[OUTPUTS.chartTurn1.path, OUTPUTS.reportTurn1.path, OUTPUTS.initialJson.path].map((path, index) => (
          <li key={path} className="flex min-w-0 items-center gap-2">
            <span translate="no" className="text-ink-900 truncate font-mono text-[14px] leading-[1.6]">
              {path}
            </span>
            {index === 0 ? (
              <span className="bg-soil-bg text-soil-fg shrink-0 rounded-[4px] px-1.5 text-[12px] leading-[1.6] font-semibold">
                {artifact}
              </span>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

function HeroStage(): ReactElement {
  return (
    <figure className="m-0 min-w-0">
      <div className="stage hero-stage px-3 pt-3 pb-3 sm:px-8 sm:pt-8 sm:pb-6">
        <PixelPlate sizes="(max-width: 1279px) calc(100vw - 32px), 58vw" />
        <div className="stage-window hero-window">
          <PreviewReplay locale={locale} animate />
        </div>
        <OutputsTray />
      </div>
      <figcaption className="text-ink-500 mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[16px] leading-[1.5]">
        <span className="border-border-strong text-ink-700 rounded-[4px] border px-1.5 text-[14px] font-semibold">
          {kitText(locale, "exampleValues")}
        </span>
        <span>{t("Turn 1 in the console Preview: the Agent reads input.csv and saves a report and a chart.")}</span>
      </figcaption>
    </figure>
  );
}

export function Hero(): ReactElement {
  return (
    <section aria-labelledby="hero-title" className="px-4 pt-8 pb-16 md:px-6 md:pt-12 xl:pt-10 xl:pb-20">
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-10 xl:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] xl:gap-14">
        <div className="min-w-0 xl:pb-10">
          <Headline />
          <p className="text-ink-600 mt-5 max-w-[30em] text-[18px] leading-[1.55] [text-wrap:pretty]">
            {t(
              "mosoo runs OpenAI Codex, Claude Agent SDK, OpenCode, and Pi behind one API, each Session in its own sandbox.",
            )}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <a
              href={MOSOO_CLOUD_URL}
              className="focus-visible:ring-ring focus-visible:ring-offset-paper-100 inline-flex h-12 items-center rounded-[8px] bg-green-500 px-6 text-[16px] font-semibold text-[#0f1a02] shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_0_0_1px_rgba(58,110,14,0.35)] transition-colors outline-none hover:bg-green-400 focus-visible:ring-2 focus-visible:ring-offset-2 active:bg-green-600"
            >
              {t("Try mosoo")}
            </a>
            <a
              href={docsUrl("quickstart/")}
              className="group text-ink-900 focus-visible:ring-ring inline-flex h-12 items-center gap-1.5 rounded-sm text-[16px] font-semibold underline decoration-current/25 underline-offset-[6px] transition-colors outline-none hover:decoration-current focus-visible:ring-2"
            >
              <span>{t("Read the quickstart")}</span>
              <ArrowRight
                aria-hidden="true"
                className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
              />
            </a>
          </div>

          <p className="text-ink-500 mt-5 text-[16px] leading-[1.5]">
            {t("mosoo is in Alpha. Public APIs may still change.")}
          </p>
        </div>

        <HeroStage />
      </div>
    </section>
  );
}
