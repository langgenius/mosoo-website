import { ArrowUpRight } from "lucide-react";
import type { CSSProperties, ReactElement } from "react";

import { GithubMark } from "../login/github-mark";
import { Reveal } from "../login/landing/motion";
import { DISPLAY_FONT } from "../login/landing/typography";
import { MOSOO_GITHUB_URL } from "../login/links";
import { t } from "./i18n";
import { USE_CASES } from "./use-cases-data";
import type { UseCase } from "./use-cases-data";

// Headings use Cabinet Grotesk (the blog's display face) via an inline style:
// the landing app's --font-display token is Geist, so the blog look only comes
// through when the family is set explicitly.
const HERO_TITLE_STYLE = {
  fontFamily: DISPLAY_FONT,
  fontSize: "clamp(40px, 5vw, 56px)",
  fontWeight: 500,
  letterSpacing: "-0.022em",
  lineHeight: 1.06,
} satisfies CSSProperties;

const FEATURED_TITLE_STYLE = {
  fontFamily: DISPLAY_FONT,
  fontSize: "clamp(30px, 3.4vw, 38px)",
  fontWeight: 500,
  letterSpacing: "-0.02em",
  lineHeight: 1.1,
} satisfies CSSProperties;

const SECTION_TITLE_STYLE = {
  fontFamily: DISPLAY_FONT,
  fontSize: "clamp(24px, 2.4vw, 28px)",
  fontWeight: 500,
  letterSpacing: "-0.015em",
  lineHeight: 1.2,
} satisfies CSSProperties;

const CARD_TITLE_STYLE = {
  fontFamily: DISPLAY_FONT,
  fontSize: "19px",
  fontWeight: 500,
  letterSpacing: "-0.015em",
  lineHeight: 1.3,
} satisfies CSSProperties;

// The "culm" texture from the blog hero — a barely-there vertical hairline every
// 64px, pulled back to ~2.5% opacity so it reads as paper grain, not stripes.
const CULM_BACKGROUND =
  "repeating-linear-gradient(90deg, transparent 0 64px, rgba(15, 20, 12, 0.025) 64px 65px)";

const INK_950 = "text-[color:var(--ink-950)]";
const TITLE_HOVER =
  "underline decoration-transparent decoration-2 underline-offset-4 transition-[text-decoration-color] duration-200 group-hover:decoration-green-500";

function CaseMeta({ useCase }: { useCase: UseCase }): ReactElement {
  return (
    <div className="flex items-center gap-2 text-[13px] text-ink-500">
      <span className="font-semibold text-green-800">{useCase.kicker}</span>
      <span aria-hidden="true">·</span>
      <span>{useCase.author.name}</span>
    </div>
  );
}

function HeroBand(): ReactElement {
  return (
    <section
      className="border-b border-ink-100"
      style={{ backgroundImage: CULM_BACKGROUND }}
    >
      <div className="mx-auto w-full max-w-[1180px] px-6 pt-14 pb-12 md:px-7 md:pt-20 md:pb-16">
        <Reveal>
          <p className="text-[13px] font-semibold tracking-[-0.01em] text-green-800">
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
      <a href={useCase.detailPath} className="group block">
        <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-[0.95fr_1.05fr] lg:gap-12">
          <div className="overflow-hidden rounded-[16px] border border-ink-100 md:order-2">
            <div className="aspect-[16/9] bg-ink-50">
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
      <div className="mx-auto w-full max-w-[1180px] px-6 py-12 md:px-7 md:py-16">
        <FeaturedCaseBody useCase={useCase} />
      </div>
    </section>
  );
}

function GridCard({ useCase }: { useCase: UseCase }): ReactElement {
  return (
    <Reveal className="h-full">
      <a href={useCase.detailPath} className="group flex h-full flex-col gap-4">
        <div className="overflow-hidden rounded-[12px] border border-ink-100">
          <div className="aspect-[16/9] bg-ink-50">
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
  const [featuredCase, ...gridCases] = USE_CASES;

  // With only a couple of cases, a featured block over a sparse grid reads as
  // broken; stack them as full-width features instead. At three or more, switch
  // to the blog-style featured + card grid, and only let the grid go to three
  // columns once there are enough cards to fill a row.
  if (USE_CASES.length < 3) {
    return (
      <div className="pb-4">
        <HeroBand />
        <section>
          <div className="mx-auto w-full max-w-[1180px] px-6 py-12 md:px-7 md:py-14">
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
        <div className="mx-auto w-full max-w-[1180px] px-6 py-12 md:px-7 md:py-14">
          <div className="mb-8 flex items-baseline justify-between gap-4">
            <h2 className={INK_950} style={SECTION_TITLE_STYLE}>
              {t("All use cases")}
            </h2>
            <span className="text-[13px] tabular-nums text-ink-500">
              {USE_CASES.length} {t("cases")}
            </span>
          </div>
          <div
            className={`grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 ${gridCases.length >= 3 ? "lg:grid-cols-3" : ""}`}
          >
            {gridCases.map((useCase) => (
              <GridCard key={useCase.detailPath} useCase={useCase} />
            ))}
          </div>
          <MoreCasesBand />
        </div>
      </section>
    </div>
  );
}
