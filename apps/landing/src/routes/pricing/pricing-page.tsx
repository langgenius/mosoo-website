import { Check, Star } from "lucide-react";
import { useInView } from "motion/react";
import { useRef } from "react";
import type { CSSProperties, ReactElement } from "react";

import { cn } from "@/shared/lib/class-names";

import { GithubMark } from "../login/github-mark";
import { MOSOO_DEPLOY_URL, MOSOO_GITHUB_URL } from "../login/links";
import { Reveal } from "../login/landing/motion";
import { DISPLAY_FONT, sectionHeadingStyle } from "../login/landing/typography";
import { UnicornBackground } from "../login/landing/unicorn";
import { t } from "./i18n";
import { METERED_ITEMS, TIERS } from "./pricing-data";
import type { Tier } from "./pricing-data";

// Same scene as the landing's closing band, so the site ends on the one
// signature motion moment in both places.
const BAND_SCENE_ID = "dyB6OzmnClK6iCdmrv2H";

const PAGE_HEADLINE_STYLE = {
  fontFamily: DISPLAY_FONT,
  fontSize: "clamp(38px, 5vw, 64px)",
  fontWeight: 500,
  letterSpacing: "-0.032em",
  lineHeight: 1.04,
} satisfies CSSProperties;

const TIER_NAME_STYLE = {
  fontFamily: DISPLAY_FONT,
  fontSize: "clamp(26px, 2.4vw, 32px)",
  fontWeight: 500,
  letterSpacing: "-0.02em",
  lineHeight: 1.1,
} satisfies CSSProperties;

// Readability scrim over the WebGL, darkest under the centred text (same as
// the landing CTA band).
const BAND_SCRIM_STYLE = {
  background:
    "radial-gradient(72% 82% at 50% 50%, rgba(8,11,9,0.46) 0%, rgba(8,11,9,0.18) 58%, rgba(8,11,9,0) 100%)",
} satisfies CSSProperties;

/** Quiet uppercase overline — no accent marker, per the pricing page's stricter restraint. */
function Overline({ children, dark = false }: { children: string; dark?: boolean }): ReactElement {
  return (
    <p
      className={cn(
        "font-mono text-[11px] font-semibold tracking-[0.18em] uppercase",
        dark ? "text-paper-100/60" : "text-fg-3",
      )}
    >
      {children}
    </p>
  );
}

function PricingHeader(): ReactElement {
  return (
    <section className="px-4 py-16 md:px-6 md:py-20">
      <Reveal className="mx-auto flex max-w-[760px] flex-col items-center text-center">
        <Overline>{t("Pricing")}</Overline>
        <h1 className="text-fg-1 mt-5 [text-wrap:balance]" style={PAGE_HEADLINE_STYLE}>
          {t("Start free. Grow when your agents do.")}
        </h1>
        <p className="text-fg-2 mt-5 max-w-[560px] text-[15px] leading-[1.6] [text-wrap:pretty]">
          {t(
            "Run agents on mosoo Cloud with a free tier that's ready today. Paid plans land soon, and self-hosting stays free and open source, forever.",
          )}
        </p>
        <p className="text-fg-3 mt-4 max-w-[560px] text-[13px] leading-[1.6] [text-wrap:pretty]">
          {t("Billing isn't implemented yet. During the alpha, everything runs free.")}
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
        className="bg-ink-900 text-paper-100 hover:bg-ink-800 focus-visible:ring-ring inline-flex h-11 w-full items-center justify-center rounded-md px-6 text-[14.5px] font-semibold shadow-sm transition-[background-color,transform] duration-150 outline-none active:scale-[0.98] focus-visible:ring-2"
      >
        {t("Get Started")}
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled
      className="border-border-default text-fg-3 inline-flex h-11 w-full cursor-default items-center justify-center rounded-md border px-6 text-[14.5px] font-semibold"
    >
      {t("Coming Soon")}
    </button>
  );
}

function TierColumn({
  tier,
  stagger,
  onGetStarted,
}: {
  tier: Tier;
  stagger: number;
  onGetStarted: () => void;
}): ReactElement {
  // The static outer div owns the cell chrome (padding, hairlines from the
  // grid), so the entrance only moves content — never the frame.
  return (
    <div className="p-8 md:p-10">
      <Reveal delay={stagger} className="flex h-full flex-col">
        <h2 className="text-fg-1" style={TIER_NAME_STYLE}>
          {tier.name}
        </h2>
        <p className="text-fg-3 mt-2.5 font-mono text-[12.5px]">{tier.priceLine}</p>
        <p className="text-fg-2 mt-4 text-[14px] leading-[1.55]">{tier.tagline}</p>

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
    </div>
  );
}

function TierGrid({ onGetStarted }: { onGetStarted: () => void }): ReactElement {
  // Stagger only when the three columns are side by side; stacked cards enter
  // the viewport one at a time and a delay would read as lag.
  const columnsSideBySide = window.matchMedia("(min-width: 768px)").matches;

  return (
    <section className="divide-border-strong grid grid-cols-1 divide-y md:grid-cols-3 md:divide-x md:divide-y-0">
      {TIERS.map((tier, index) => (
        <TierColumn
          key={tier.id}
          tier={tier}
          stagger={columnsSideBySide ? index * 0.06 : 0}
          onGetStarted={onGetStarted}
        />
      ))}
    </section>
  );
}

function MeteredSection(): ReactElement {
  return (
    <section className="px-4 py-16 md:px-6 md:py-20">
      <Reveal className="grid grid-cols-1 gap-10 md:grid-cols-[minmax(220px,0.85fr)_1.9fr] md:gap-16">
        <div>
          <h2 className="text-fg-1 [text-wrap:balance]" style={sectionHeadingStyle}>
            {t("What the meter counts.")}
          </h2>
          <p className="text-fg-2 mt-4 max-w-[300px] text-[14px] leading-[1.6] [text-wrap:pretty]">
            {t(
              "mosoo Cloud runs on Cloudflare. The meter tracks the resources a run actually consumes, never seats or idle servers.",
            )}
          </p>
        </div>

        <div>
          <dl className="border-border-soft border-t">
            {METERED_ITEMS.map((item) => (
              <div
                key={item.label}
                className="border-border-soft grid grid-cols-1 gap-1.5 border-b py-5 md:grid-cols-[200px_1fr] md:gap-8"
              >
                <dt className="text-fg-1 font-mono text-[12px] font-semibold tracking-[0.08em] uppercase md:pt-0.5">
                  {item.label}
                </dt>
                <dd className="text-fg-2 m-0 max-w-[560px] text-[14.5px] leading-[1.65]">
                  {item.description}
                </dd>
              </div>
            ))}
          </dl>
          <p className="text-fg-3 mt-6 text-[12.5px] leading-[1.6]">
            {t(
              "mosoo Cloud is in alpha. Plan limits are indicative and may change before general availability.",
            )}
          </p>
        </div>
      </Reveal>
    </section>
  );
}

function SelfHostBand(): ReactElement {
  // Mount the scene only as the band nears the viewport, same as the landing
  // CTA band, so the WebGL never competes with first paint.
  const panelRef = useRef<HTMLElement>(null);
  const sceneVisible = useInView(panelRef, { once: true, margin: "240px" });

  return (
    <section
      ref={panelRef}
      className="bg-ink-900 relative overflow-hidden px-4 py-16 md:px-6 md:py-20"
    >
      {sceneVisible ? <UnicornBackground sceneId={BAND_SCENE_ID} /> : null}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1]"
        style={BAND_SCRIM_STYLE}
      />
      <Reveal className="relative z-10 mx-auto flex max-w-[680px] flex-col items-center text-center">
        <Overline dark>{t("Self-host")}</Overline>
        <h2 className="mt-4 text-white [text-wrap:balance] drop-shadow-sm" style={sectionHeadingStyle}>
          {t("Or run it on your own cloud, free.")}
        </h2>
        <p className="mt-4 max-w-[480px] text-[15px] leading-[1.6] text-white/80 [text-wrap:pretty]">
          {t(
            "mosoo is open source. Deploy Workers, D1, R2, and KV into your own Cloudflare account. BYOK, no per-seat fee, no meter.",
          )}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href={MOSOO_DEPLOY_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="focus-visible:ring-paper-100/60 inline-flex h-12 items-center rounded-md bg-[#6FD305] px-7 text-[15px] font-semibold text-[#0F1A02] shadow-sm transition-[background-color,transform] duration-150 outline-none hover:bg-[#5CB300] active:scale-[0.98] focus-visible:ring-2"
          >
            {t("Deploy to Cloudflare")}
          </a>
          <a
            href={MOSOO_GITHUB_URL}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={t("Star mosoo on GitHub")}
            className="text-paper-100 ring-paper-100/25 hover:bg-paper-100/[0.1] focus-visible:ring-paper-100/60 bg-ink-900/30 inline-flex h-12 items-center gap-2 rounded-md px-5 text-[14px] font-semibold ring-1 backdrop-blur-sm transition-[background-color,transform] duration-150 outline-none active:scale-[0.98] focus-visible:ring-2"
          >
            <GithubMark className="size-[18px]" />
            <span>{t("Star on GitHub")}</span>
            <Star className="size-4" />
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
        <MeteredSection />
        <SelfHostBand />
      </div>
    </div>
  );
}
