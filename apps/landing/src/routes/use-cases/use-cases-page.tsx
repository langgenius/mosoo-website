import { ArrowUpRight } from "lucide-react";
import type { CSSProperties, ReactElement } from "react";

import { GithubMark } from "../login/github-mark";
import { Reveal } from "../login/landing/motion";
import { DISPLAY_FONT } from "../login/landing/typography";
import { Eyebrow } from "../login/landing/ui";
import { MOSOO_GITHUB_URL } from "../login/links";
import { t } from "./i18n";
import { USE_CASES } from "./use-cases-data";
import type { UseCase } from "./use-cases-data";

const PAGE_HEADLINE_STYLE = {
  fontFamily: DISPLAY_FONT,
  fontSize: "clamp(38px, 5vw, 64px)",
  fontWeight: 500,
  letterSpacing: "-0.032em",
  lineHeight: 1.04,
} satisfies CSSProperties;

const CASE_NAME_STYLE = {
  fontFamily: DISPLAY_FONT,
  fontSize: "clamp(28px, 3vw, 40px)",
  fontWeight: 500,
  letterSpacing: "-0.025em",
  lineHeight: 1.08,
} satisfies CSSProperties;

function UseCasesHeader(): ReactElement {
  return (
    <section className="px-4 pt-16 pb-12 md:px-6 md:pt-20 md:pb-14">
      <Reveal className="mx-auto flex max-w-[760px] flex-col items-center text-center">
        <Eyebrow>{t("Use cases")}</Eyebrow>
        <h1 className="text-fg-1 mt-5 [text-wrap:balance]" style={PAGE_HEADLINE_STYLE}>
          {t("Built on mosoo.")}
        </h1>
        <p className="text-fg-2 mt-5 max-w-[600px] text-[15px] leading-[1.6] [text-wrap:pretty]">
          {t(
            "Real products that use mosoo as their Agent backend. Each case shows the live product, the value mosoo provides, and the integration path.",
          )}
        </p>
      </Reveal>
    </section>
  );
}

function UseCaseCard({ useCase }: { useCase: UseCase }): ReactElement {
  return (
    <Reveal>
      <a
        href={useCase.detailPath}
        className="group border-border-default bg-paper-50 hover:border-border-strong focus-visible:ring-ring grid overflow-hidden rounded-[20px] border shadow-[var(--shadow-xs)] transition-[border-color,box-shadow] duration-200 outline-none hover:shadow-[var(--shadow-md)] focus-visible:ring-2 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]"
      >
        <div className="flex flex-col p-7 md:p-10">
          <p className="text-green-700 font-mono text-[11px] font-semibold tracking-[0.18em] uppercase">
            {useCase.kicker}
          </p>
          <h2 className="text-fg-1 mt-4" style={CASE_NAME_STYLE}>
            {useCase.name}
          </h2>
          <p className="text-fg-2 mt-4 max-w-[440px] text-[14.5px] leading-[1.6] [text-wrap:pretty]">
            {useCase.summary}
          </p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {useCase.tags.map((tag) => (
              <li
                key={tag}
                className="border-border-default text-fg-2 rounded-full border px-2.5 py-1 font-mono text-[11px] font-medium"
              >
                {tag}
              </li>
            ))}
          </ul>
          <span className="mt-8 flex items-center justify-between gap-3 md:mt-auto md:pt-8">
            <span className="text-fg-2 inline-flex items-center gap-2 text-[13px] font-medium">
              <img
                src={useCase.author.avatar}
                alt=""
                width={20}
                height={20}
                className="size-5 rounded-[4px]"
              />
              {useCase.author.name}
            </span>
            <span className="text-fg-1 inline-flex items-center gap-1.5 text-[13.5px] font-semibold">
              {t("Read the case")}
              <ArrowUpRight
                aria-hidden="true"
                className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </span>
          </span>
        </div>
        <div className="bg-paper-200/70 border-border-soft border-t p-3 md:border-t-0 md:border-l md:p-4">
          <div className="ring-border-default h-full overflow-hidden rounded-[12px] bg-white shadow-[var(--shadow-sm)] ring-1 transition-transform duration-200 group-hover:-translate-y-0.5">
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
      </a>
    </Reveal>
  );
}

function MoreCasesBand(): ReactElement {
  return (
    <Reveal className="border-border-soft mt-16 border-t pt-10 pb-4 md:mt-20">
      <div className="flex flex-col items-start justify-between gap-5 md:flex-row md:items-center">
        <div>
          <p className="text-fg-1 text-[15px] font-semibold">{t("More cases are being written up.")}</p>
          <p className="text-fg-2 mt-1 text-[13.5px] leading-[1.6]">
            {t("Shipping something on mosoo? We want the next case to be yours.")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <a
            href="https://cloud.mosoo.ai/login"
            className="bg-ink-900 text-paper-100 hover:bg-ink-800 focus-visible:ring-ring inline-flex h-10 items-center rounded-md px-5 text-[13.5px] font-semibold shadow-sm transition-colors outline-none focus-visible:ring-2"
          >
            {t("Start on mosoo Cloud")}
          </a>
          <a
            href={MOSOO_GITHUB_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="text-ink-900 ring-ink-900/15 hover:bg-ink-900/[0.06] focus-visible:ring-ring inline-flex h-10 items-center gap-2 rounded-md px-4 text-[13.5px] font-semibold ring-1 transition-colors outline-none focus-visible:ring-2"
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
  return (
    <div className="pb-20 md:pb-24">
      <UseCasesHeader />
      <div className="mx-auto max-w-[1120px] px-4 md:px-6">
        <div className="flex flex-col gap-8">
          {USE_CASES.map((useCase) => (
            <UseCaseCard key={useCase.detailPath} useCase={useCase} />
          ))}
        </div>
        <MoreCasesBand />
      </div>
    </div>
  );
}
