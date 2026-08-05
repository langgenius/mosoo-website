import { ArrowUpRight, Star } from "lucide-react";
import type { CSSProperties, ReactElement } from "react";

import { t } from "@/shared/i18n";

import { GithubMark } from "../github-mark";
import { MOSOO_API_REFERENCE_URL, MOSOO_GITHUB_URL } from "../links";
import { BambooWaveBackground } from "./bamboo-wave-background";
import { DISPLAY_FONT } from "./typography";
import { Eyebrow } from "./ui";

const HERO_PANEL_STYLE = {
  backgroundColor: "var(--paper-100)",
} satisfies CSSProperties;

const HERO_HEADLINE_STYLE = {
  fontFamily: DISPLAY_FONT,
  fontSize: "clamp(44px, 6.4vw, 84px)",
  fontWeight: 500,
  letterSpacing: "-0.035em",
  lineHeight: 1.02,
} satisfies CSSProperties;

const HERO_SUBHEAD_STYLE = {
  fontSize: "clamp(15px, 1.4vw, 17px)",
  lineHeight: 1.55,
} satisfies CSSProperties;

export function Hero({ onContinue }: { onContinue: () => void }): ReactElement {
  return (
    <section
      className="relative flex min-h-[640px] flex-col items-center justify-center overflow-hidden px-4 py-20 md:min-h-[680px] md:px-6 md:py-24"
      style={HERO_PANEL_STYLE}
    >
      <BambooWaveBackground />
      <div
        className="relative z-10 flex w-full max-w-[1080px] flex-col items-center text-center"
      >
        <div className="landing-hero-reveal">
          <Eyebrow>{t("Open source · Agent runtime and API")}</Eyebrow>
        </div>
        <h1
          className="landing-hero-reveal landing-hero-reveal-delay-1 text-ink-900 mt-7 [text-wrap:balance]"
          style={HERO_HEADLINE_STYLE}
        >
          <span className="block">{t("Launch your Skill online")}</span>
          <span className="block">{t("for anyone to try.")}</span>
        </h1>
        <p
          className="landing-hero-reveal landing-hero-reveal-delay-2 text-ink-800 mt-6 max-w-[640px]"
          style={HERO_SUBHEAD_STYLE}
        >
          {t(
            "Let anyone use your Skill online with Codex, Claude, or OpenCode in an isolated sandbox.",
          )}
        </p>
        <div className="landing-hero-reveal landing-hero-reveal-delay-3 mt-9 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={onContinue}
            className="bg-ink-900 text-paper-100 hover:bg-ink-800 focus-visible:ring-ring inline-flex h-12 items-center rounded-md px-7 text-[15px] font-semibold shadow-sm transition-colors outline-none focus-visible:ring-2"
          >
            {t("Log in")}
          </button>
          <a
            href={MOSOO_GITHUB_URL}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={t("Star mosoo on GitHub")}
            className="text-ink-900 ring-ink-900/15 hover:bg-ink-900/[0.06] focus-visible:ring-ring inline-flex h-12 items-center gap-2 rounded-md px-5 text-[14px] font-semibold ring-1 transition-colors outline-none focus-visible:ring-2"
          >
            <GithubMark className="size-[18px]" />
            <span>{t("Star on GitHub")}</span>
            <Star className="size-4" />
          </a>
          <a
            href={MOSOO_API_REFERENCE_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="text-ink-900 hover:text-ink-900 focus-visible:ring-ring inline-flex h-12 items-center gap-1.5 rounded-md px-3 text-[14px] font-semibold transition-colors outline-none focus-visible:ring-2"
          >
            <span>{t("API docs")}</span>
            <ArrowUpRight className="size-4" />
          </a>
        </div>
        <p className="landing-hero-reveal landing-hero-reveal-delay-4 text-ink-700 mt-6 font-mono text-[11px] tracking-[0.18em] uppercase">
          {t("Open source · Self-hostable · BYOK")}
        </p>
      </div>
    </section>
  );
}
