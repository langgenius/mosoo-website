import { Check } from "lucide-react";
import type { CSSProperties, ReactElement } from "react";

import { cn } from "@/shared/lib/class-names";

import { GithubMark } from "../login/github-mark";
import { MOSOO_DEPLOY_URL, MOSOO_GITHUB_URL } from "../login/links";
import { Reveal } from "../login/landing/motion";
import { DISPLAY_FONT, sectionHeadingStyle } from "../login/landing/typography";
import { Eyebrow } from "../login/landing/ui";
import { t } from "./i18n";
import { CAPABILITY_MATRIX, TIERS } from "./pricing-data";
import type { MatrixValue, Tier } from "./pricing-data";

const PAGE_HEADLINE_STYLE = {
  fontFamily: DISPLAY_FONT,
  fontSize: "clamp(38px, 5vw, 64px)",
  fontWeight: 500,
  letterSpacing: "-0.032em",
  lineHeight: 1.04,
} satisfies CSSProperties;

const PRICE_STYLE = {
  fontFamily: DISPLAY_FONT,
  fontSize: "clamp(38px, 4vw, 52px)",
  fontWeight: 500,
  letterSpacing: "-0.03em",
  lineHeight: 1,
} satisfies CSSProperties;

function PricingHeader(): ReactElement {
  return (
    <section className="px-4 py-16 md:px-6 md:py-20">
      <Reveal className="mx-auto flex max-w-[760px] flex-col items-center text-center">
        <Eyebrow>{t("Pricing")}</Eyebrow>
        <h1 className="text-fg-1 mt-5 [text-wrap:balance]" style={PAGE_HEADLINE_STYLE}>
          {t("Start free. Grow when your agents do.")}
        </h1>
        <p className="text-fg-2 mt-5 max-w-[560px] text-[15px] leading-[1.6]">
          {t(
            "Run agents on mosoo Cloud with a free tier that's ready today. Paid plans land soon — and self-hosting stays free and open source, forever.",
          )}
        </p>
      </Reveal>
    </section>
  );
}

function TierCta({ tier, onGetStarted }: { tier: Tier; onGetStarted: () => void }): ReactElement {
  if (tier.cta.kind === "get-started") {
    return (
      <button
        type="button"
        onClick={onGetStarted}
        className="bg-ink-900 text-paper-100 hover:bg-ink-800 focus-visible:ring-ring inline-flex h-11 w-full items-center justify-center rounded-md px-6 text-[14.5px] font-semibold shadow-sm transition-colors outline-none focus-visible:ring-2"
      >
        {t("Get Started")}
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled
      className="border-border-strong text-fg-3 inline-flex h-11 w-full cursor-not-allowed items-center justify-center rounded-md border border-dashed px-6 text-[14.5px] font-semibold"
    >
      {t("Coming Soon")}
    </button>
  );
}

function TierColumn({
  tier,
  index,
  onGetStarted,
}: {
  tier: Tier;
  index: number;
  onGetStarted: () => void;
}): ReactElement {
  const available = tier.cta.kind === "get-started";

  return (
    <Reveal
      delay={index * 0.06}
      className={cn("flex flex-col p-8 md:p-10", available && "bg-paper-50")}
    >
      <div className="flex min-h-[26px] items-center justify-between gap-3">
        <h2 className="text-fg-1 font-mono text-[12px] font-semibold tracking-[0.14em] uppercase">
          {tier.name}
        </h2>
        {available ? (
          <span className="bg-accent-soft text-accent-press rounded-full px-2.5 py-1 text-[11px] font-semibold">
            {t("Available now")}
          </span>
        ) : null}
      </div>

      <div className="mt-6 flex items-baseline gap-1.5">
        <span className="text-fg-1" style={PRICE_STYLE}>
          {tier.price}
        </span>
        {tier.priceSuffix === undefined ? null : (
          <span className="text-fg-3 font-mono text-[13px]">{tier.priceSuffix}</span>
        )}
      </div>
      <p className="text-fg-2 mt-3 text-[14px] leading-[1.55]">{tier.tagline}</p>

      <div className="mt-7">
        <TierCta tier={tier} onGetStarted={onGetStarted} />
      </div>

      <ul className="border-border-soft mt-7 flex flex-col gap-3 border-t pt-7">
        {tier.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5">
            <Check aria-hidden="true" className="text-green-700 mt-[3px] size-4 shrink-0" />
            <span className="text-fg-1 text-[14px] leading-[1.55]">{feature}</span>
          </li>
        ))}
      </ul>
    </Reveal>
  );
}

function TierGrid({ onGetStarted }: { onGetStarted: () => void }): ReactElement {
  return (
    <section className="divide-border-strong grid grid-cols-1 divide-y md:grid-cols-3 md:divide-x md:divide-y-0">
      {TIERS.map((tier, index) => (
        <TierColumn key={tier.id} tier={tier} index={index} onGetStarted={onGetStarted} />
      ))}
    </section>
  );
}

function MatrixCell({ value }: { value: MatrixValue }): ReactElement {
  if (value.kind === "check") {
    return (
      <span role="img" aria-label={t("Included")} className="inline-flex justify-center">
        <Check className="text-green-700 size-4" />
      </span>
    );
  }

  if (value.kind === "dash") {
    return (
      <span aria-label={t("Not included")} className="text-fg-muted">
        —
      </span>
    );
  }

  return <span className="text-fg-1 font-mono text-[13px]">{value.label}</span>;
}

function CapabilityMatrix(): ReactElement {
  return (
    <section className="px-4 py-16 md:px-6 md:py-20">
      <Reveal className="mx-auto max-w-[720px] text-center">
        <h2 className="text-fg-1" style={sectionHeadingStyle}>
          {t("Every capability, listed.")}
        </h2>
        <p className="text-fg-2 mt-4 text-[14.5px] leading-[1.6]">
          {t("What each plan includes across the agent lifecycle — build, run, invoke, observe.")}
        </p>
      </Reveal>

      <Reveal className="mt-12 overflow-x-auto">
        <table className="w-full min-w-[680px] border-collapse text-left">
          <thead>
            <tr className="border-border-strong border-b">
              <th scope="col" className="w-[34%] py-4 pr-4" />
              {TIERS.map((tier) => (
                <th key={tier.id} scope="col" className="w-[22%] px-3 py-4 text-center">
                  <span className="text-fg-1 font-mono text-[12px] font-semibold tracking-[0.14em] uppercase">
                    {tier.name}
                  </span>
                  <span className="text-fg-3 mt-1 block font-mono text-[11px]">
                    {tier.priceSuffix === undefined
                      ? tier.price
                      : `${tier.price} ${tier.priceSuffix}`}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          {CAPABILITY_MATRIX.map((group) => (
            <tbody key={group.group}>
              <tr>
                <th
                  scope="colgroup"
                  colSpan={4}
                  className="text-fg-3 pt-8 pb-3 text-left text-[11px] font-semibold tracking-[0.14em] uppercase"
                >
                  <span className="inline-flex items-center gap-2">
                    <span className="bg-green-600 inline-block size-1.5 rounded-full" />
                    {group.group}
                  </span>
                </th>
              </tr>
              {group.rows.map((row) => (
                <tr key={row.capability} className="border-border-soft border-b">
                  <th scope="row" className="text-fg-1 py-3.5 pr-4 text-[14px] font-medium">
                    {row.capability}
                  </th>
                  {row.values.map((value, valueIndex) => (
                    <td
                      key={TIERS[valueIndex]?.id ?? valueIndex}
                      className="px-3 py-3.5 text-center align-middle"
                    >
                      <MatrixCell value={value} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </Reveal>

      <p className="text-fg-3 mt-10 text-center text-[12.5px]">
        {t("mosoo Cloud is in alpha. Plan limits are indicative and may change before general availability.")}
      </p>
    </section>
  );
}

function BillingUnitNote(): ReactElement {
  return (
    <section className="px-4 py-14 md:px-6 md:py-16">
      <Reveal className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(220px,0.85fr)_1.9fr] md:gap-16">
        <h2 className="text-fg-1 text-[18px] leading-[1.35] font-bold">
          {t("Sandbox time is the billing unit.")}
        </h2>
        <p className="text-fg-2 max-w-[640px] text-[14.5px] leading-[1.65]">
          {t(
            "A sandbox mounts the instant a run starts and tears down when the turn ends. You're billed for mounted seconds — never for an idle fleet. Included hours reset monthly, and every run is capped by your plan's max duration.",
          )}
        </p>
      </Reveal>
    </section>
  );
}

function SelfHostBand(): ReactElement {
  return (
    <section className="bg-ink-900 px-4 py-16 md:px-6 md:py-20">
      <Reveal className="mx-auto flex max-w-[680px] flex-col items-center text-center">
        <Eyebrow tone="dark">{t("Self-host")}</Eyebrow>
        <h2 className="mt-4 text-white" style={sectionHeadingStyle}>
          {t("Or run it on your own cloud, free.")}
        </h2>
        <p className="mt-4 max-w-[480px] text-[15px] leading-[1.6] text-white/80">
          {t(
            "mosoo is open source. Deploy Workers, D1, R2, and KV into your own Cloudflare account — BYOK, no per-seat fee, no meter.",
          )}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href={MOSOO_DEPLOY_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="focus-visible:ring-paper-100/60 inline-flex h-12 items-center rounded-md bg-[#6FD305] px-7 text-[15px] font-semibold text-[#0F1A02] shadow-sm transition-colors outline-none hover:bg-[#5CB300] focus-visible:ring-2"
          >
            {t("Deploy to Cloudflare")}
          </a>
          <a
            href={MOSOO_GITHUB_URL}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={t("Star mosoo on GitHub")}
            className="text-paper-100 ring-paper-100/25 hover:bg-paper-100/[0.1] focus-visible:ring-paper-100/60 inline-flex h-12 items-center gap-2 rounded-md px-5 text-[14px] font-semibold ring-1 transition-colors outline-none focus-visible:ring-2"
          >
            <GithubMark className="size-[18px]" />
            <span>{t("Star on GitHub")}</span>
          </a>
        </div>
      </Reveal>
    </section>
  );
}

export function PricingPage({ onGetStarted }: { onGetStarted: () => void }): ReactElement {
  return (
    <div className="px-4 md:px-6">
      {/* Same framed column as the landing — continuous hairlines, sections
          split by horizontal dividers. */}
      <div className="border-border-strong divide-border-strong mx-auto w-full max-w-[1280px] divide-y border-x">
        <PricingHeader />
        <TierGrid onGetStarted={onGetStarted} />
        <CapabilityMatrix />
        <BillingUnitNote />
        <SelfHostBand />
      </div>
    </div>
  );
}
