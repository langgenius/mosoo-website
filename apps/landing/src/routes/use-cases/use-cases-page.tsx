import { ArrowUpRight } from "lucide-react";
import type { ReactElement, ReactNode } from "react";

import { GithubMark } from "../login/github-mark";
import { Reveal } from "../login/landing/motion";
import { MOSOO_GITHUB_URL } from "../login/links";
import { displayStyle } from "./display";
import { t } from "./i18n";
import { USE_CASES } from "./use-cases-data";
import type { UseCase } from "./use-cases-data";

// Titles in the display token (./display.ts), on the plain paper: no texture
// behind the hero (the bamboo "culm" hairlines are gone with the motif).
const HERO_TITLE_STYLE = displayStyle("clamp(40px, 5vw, 60px)", "-0.026em", 1.04);
const FEATURED_TITLE_STYLE = displayStyle("clamp(32px, 3.4vw, 40px)", "-0.022em", 1.08);
const SECTION_TITLE_STYLE = displayStyle("clamp(26px, 2.6vw, 32px)", "-0.018em", 1.15);
const CARD_TITLE_STYLE = displayStyle("22px", "-0.012em", 1.2);

// v5 ink (app.css --sub-*): no green text, underline or focus ring on the page.
const INK_950 = "text-[color:var(--sub-ink)]";
const TITLE_HOVER =
  "underline decoration-transparent decoration-1 underline-offset-[5px] transition-[text-decoration-color] duration-200 group-hover:decoration-[color:var(--sub-ink)]";
// Same box as the topbar, so the logo, headline, and cards share one left edge
// at every width — the alignment the blog has between its header and content.
const CONTAINER = "mx-auto w-full max-w-[1280px] px-4 md:px-6";
// Keyboard focus in ink (v5: 2px ink ring), following the card's rounded
// corners instead of the browser's square blue outline.
const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--sub-ink)]";

// Each meta chunk leads with its own "·" in a 20px slot. The row is pulled left
// by one slot inside a clipping box, so a separator that would start a line is
// hidden — narrow three-column cards (~1024px) wrap between chunks without
// leaving "engine ·" dangling at the end of the first line.
function MetaChunk({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}): ReactElement {
  return (
    <span className={`inline-flex items-center whitespace-nowrap ${className}`}>
      <span aria-hidden="true" className="w-5 shrink-0 text-center font-normal text-ink-500">
        ·
      </span>
      {children}
    </span>
  );
}

function CaseMeta({ useCase }: { useCase: UseCase }): ReactElement {
  return (
    <div className="overflow-hidden text-[13px] text-ink-500">
      <div className="-ml-5 flex flex-wrap items-center gap-y-1">
        <MetaChunk className={`font-semibold ${INK_950}`}>{useCase.kicker}</MetaChunk>
        <MetaChunk>
          <span className="inline-flex items-center gap-1.5">
            <img
              src={useCase.author.avatar}
              alt=""
              width={20}
              height={20}
              className="size-5 rounded-[4px] object-cover"
            />
            {useCase.author.name}
          </span>
        </MetaChunk>
      </div>
    </div>
  );
}

function HeroBand(): ReactElement {
  return (
    <section className="border-b border-ink-100">
      <div className={`${CONTAINER} pt-14 pb-12 md:pt-20 md:pb-16`}>
        <Reveal>
          <p className="text-[13px] font-semibold tracking-[-0.01em] text-[color:var(--sub-ink-2)]">
            {t("Use cases")}
          </p>
          <h1 className={`mt-3 max-w-3xl ${INK_950} [text-wrap:balance]`} style={HERO_TITLE_STYLE}>
            {t("Built on mosoo.")}
          </h1>
          <p className="mt-4 max-w-xl text-[17px] leading-[1.6] text-ink-700 [text-wrap:pretty]">
            {t(
              "Products that use mosoo as their Agent backend. Each case explains the product, the value mosoo provides, and the integration path.",
            )}
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function FeaturedCaseBody({ useCase }: { useCase: UseCase }): ReactElement {
  return (
    <Reveal>
      <a href={useCase.detailPath} className={`group block rounded-[16px] ${FOCUS_RING}`}>
        <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-[0.95fr_1.05fr] lg:gap-12">
          <div className="overflow-hidden rounded-[16px] border border-ink-100 md:order-2">
            <div className="aspect-[16/10] bg-ink-50">
              <img
                src={useCase.image}
                alt={useCase.imageAlt}
                width={1440}
                height={900}
                loading="eager"
                className="h-full w-full object-cover object-top"
              />
            </div>
          </div>
          <div className="flex min-w-0 flex-col gap-4 md:order-1">
            <CaseMeta useCase={useCase} />
            <h2 className={`${INK_950} ${TITLE_HOVER}`} style={FEATURED_TITLE_STYLE}>
              {useCase.name}
            </h2>
            <p className="max-w-[52ch] text-[16px] leading-[1.6] text-ink-700 [text-wrap:pretty]">
              {useCase.summary}
            </p>
            <span className="mt-1 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[color:var(--ink-950)]">
              {t("Read the case")}
              <ArrowUpRight
                aria-hidden="true"
                className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </span>
          </div>
        </div>
      </a>
    </Reveal>
  );
}

function FeaturedCase({ useCase }: { useCase: UseCase }): ReactElement {
  return (
    <section className="border-b border-ink-100">
      <div className={`${CONTAINER} py-12 md:py-16`}>
        <FeaturedCaseBody useCase={useCase} />
      </div>
    </section>
  );
}

function GridCard({ useCase }: { useCase: UseCase }): ReactElement {
  return (
    <Reveal className="h-full">
      <a
        href={useCase.detailPath}
        className={`group flex h-full flex-col gap-4 rounded-[12px] ${FOCUS_RING}`}
      >
        <div className="overflow-hidden rounded-[12px] border border-ink-100">
          <div className="aspect-[16/10] bg-ink-50">
            <img
              src={useCase.image}
              alt={useCase.imageAlt}
              width={1440}
              height={900}
              loading="lazy"
              className="h-full w-full object-cover object-top"
            />
          </div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <CaseMeta useCase={useCase} />
          <h3 className={`${INK_950} ${TITLE_HOVER}`} style={CARD_TITLE_STYLE}>
            {useCase.name}
          </h3>
          <p className="line-clamp-2 text-[14px] leading-[1.6] text-ink-700 [text-wrap:pretty]">
            {useCase.summary}
          </p>
        </div>
      </a>
    </Reveal>
  );
}

function MoreCasesBand(): ReactElement {
  return (
    <Reveal className="mt-16 border-t border-ink-100 pt-10 md:mt-20">
      <div className="flex flex-col items-start justify-between gap-5 md:flex-row md:items-center">
        <div>
          <p className="text-[15px] font-semibold text-[color:var(--ink-950)]">
            {t("More cases are being written up.")}
          </p>
          <p className="mt-1 text-[13.5px] leading-[1.6] text-ink-700">
            {t("Shipping something on mosoo? We want the next case to be yours.")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <a
            href="https://cloud.mosoo.ai/login"
            className="bg-ink-900 focus-visible:ring-ring inline-flex h-10 items-center rounded-md px-5 text-[13.5px] font-semibold text-white transition-colors outline-none hover:bg-ink-800 focus-visible:ring-2"
          >
            {t("Start on mosoo Cloud")}
          </a>
          <a
            href={MOSOO_GITHUB_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="text-[color:var(--ink-950)] ring-ink-900/15 hover:bg-ink-900/[0.06] focus-visible:ring-ring inline-flex h-10 items-center gap-2 rounded-md px-4 text-[13.5px] font-semibold ring-1 transition-colors outline-none focus-visible:ring-2"
          >
            <GithubMark className="size-4" />
            GitHub
          </a>
        </div>
      </div>
    </Reveal>
  );
}

export function UseCasesPage(): ReactElement {
  const [featuredCase] = USE_CASES;

  // With only a couple of cases, a featured block over a sparse grid reads as
  // broken; stack them as full-width features instead. At three or more, use
  // the blog index layout: the first case is featured, and the grid below is
  // the complete index (featured case included, as on the blog), so the count
  // in its header always matches the cards shown.
  if (USE_CASES.length < 3) {
    return (
      <div className="pb-4">
        <HeroBand />
        <section>
          <div className={`${CONTAINER} py-12 md:py-14`}>
            <div className="flex flex-col gap-14">
              {USE_CASES.map((useCase) => (
                <FeaturedCaseBody key={useCase.detailPath} useCase={useCase} />
              ))}
            </div>
            <MoreCasesBand />
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="pb-4">
      <HeroBand />
      {featuredCase ? <FeaturedCase useCase={featuredCase} /> : null}
      <section>
        <div className={`${CONTAINER} py-12 md:py-14`}>
          <div className="mb-8 flex items-baseline justify-between gap-4">
            <h2 className={INK_950} style={SECTION_TITLE_STYLE}>
              {t("All use cases")}
            </h2>
            <span className="text-[13px] tabular-nums text-ink-500">
              {USE_CASES.length} {t("cases")}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
            {USE_CASES.map((useCase) => (
              <GridCard key={useCase.detailPath} useCase={useCase} />
            ))}
          </div>
          <MoreCasesBand />
        </div>
      </section>
    </div>
  );
}
