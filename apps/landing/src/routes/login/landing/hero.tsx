import { ArrowUpRight, Check, Copy, Rocket, Star } from "lucide-react";
import { useState } from "react";
import type { CSSProperties, ReactElement } from "react";

import { t } from "@/shared/i18n";
import { RuntimeIcon } from "@/shared/ui/brand-icons";

import { GithubMark } from "../github-mark";
import { MOSOO_GITHUB_URL } from "../links";
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
  fontFamily: '"Inter", "Geist", ui-sans-serif, system-ui, sans-serif',
  fontSize: "clamp(15px, 1.4vw, 17px)",
  fontWeight: 500,
  lineHeight: 1.55,
} satisfies CSSProperties;

const HERO_CONTENT_STYLE = {
  transform: "translateY(clamp(-64px, -6vh, -24px))",
} satisfies CSSProperties;

type RuntimeChoice = "codex" | "opencode";
type ModelChoice = "gpt" | "deepseek";
const INSTALL_COMMAND = "curl -fsSL https://install.mosoo.ai/install.sh | bash";

const RUNTIME_OPTIONS = [
  { icon: "openai-runtime", label: "Codex", value: "codex" },
  { icon: "opencode", label: "OpenCode", value: "opencode" },
] as const satisfies ReadonlyArray<{ icon: string; label: string; value: RuntimeChoice }>;

const MODEL_OPTIONS = [
  { icon: "openai", label: "GPT", value: "gpt" },
  { icon: "deepseek", label: "DeepSeek", value: "deepseek" },
] as const satisfies ReadonlyArray<{ icon: string; label: string; value: ModelChoice }>;

function SkillConfigurationCard({ onContinue }: { onContinue: () => void }): ReactElement {
  const [runtime, setRuntime] = useState<RuntimeChoice>("codex");
  const [model, setModel] = useState<ModelChoice>("gpt");
  const [commandCopied, setCommandCopied] = useState(false);

  function selectRuntime(nextRuntime: RuntimeChoice): void {
    setRuntime(nextRuntime);
    if (nextRuntime === "codex") {
      setModel("gpt");
    }
  }

  async function copyInstallCommand(): Promise<void> {
    await navigator.clipboard.writeText(INSTALL_COMMAND);
    setCommandCopied(true);
    window.setTimeout(() => setCommandCopied(false), 1600);
  }

  return (
    <div className="landing-config-card">
      <div className="landing-config-card__header">
        <span className="landing-config-card__eyebrow">New Agent</span>
      </div>

      <div className="landing-config-card__group">
        <div className="landing-config-card__section-heading">
          <div className="landing-config-card__label">Runtime</div>
          <button type="button" className="landing-config-more" onClick={onContinue}>
            <span>more</span>
            <ArrowUpRight />
          </button>
        </div>
        <div className="landing-config-card__options">
          {RUNTIME_OPTIONS.map((option) => {
            const selected = runtime === option.value;

            return (
              <button
                type="button"
                className={`landing-config-option${selected ? " landing-config-option--selected" : ""}`}
                key={option.value}
                aria-pressed={selected}
                onClick={() => selectRuntime(option.value)}
              >
                <span className="landing-config-option__icon">
                  <RuntimeIcon runtimeId={option.icon} className="size-5" />
                </span>
                <span>{option.label}</span>
                {selected ? <Check className="landing-config-option__check" /> : null}
              </button>
            );
          })}
        </div>
      </div>

      <div className="landing-config-card__group">
        <div className="landing-config-card__section-heading">
          <div className="landing-config-card__label">Model</div>
          <button type="button" className="landing-config-more" onClick={onContinue}>
            <span>more</span>
            <ArrowUpRight />
          </button>
        </div>
        <div className="landing-config-card__options">
          {MODEL_OPTIONS.map((option) => {
            const selected = model === option.value;
            const disabled = runtime === "codex" && option.value === "deepseek";

            return (
              <button
                type="button"
                className={`landing-config-option${selected ? " landing-config-option--selected" : ""}${disabled ? " landing-config-option--disabled" : ""}`}
                key={option.value}
                aria-pressed={selected}
                disabled={disabled}
                onClick={() => setModel(option.value)}
              >
                <span className="landing-config-option__icon">
                  <RuntimeIcon runtimeId={option.icon} className="size-5" />
                </span>
                <span>{option.label}</span>
                {selected ? <Check className="landing-config-option__check" /> : null}
              </button>
            );
          })}
        </div>
      </div>

      <div className="landing-config-card__group">
        <div className="landing-config-card__skill-grid">
          <div className="landing-config-card__label">Skill</div>
          <span className="landing-config-card__skill-divider" aria-hidden="true" />
          <div className="landing-config-card__cli-label">Quick Start with CLI</div>
          <button type="button" className="landing-config-upload" onClick={onContinue}>
            <ArrowUpRight />
            <span>Upload Skill</span>
          </button>
          <button type="button" className="landing-config-command" onClick={copyInstallCommand} title={INSTALL_COMMAND}>
            <code>{INSTALL_COMMAND}</code>
            {commandCopied ? <Check /> : <Copy />}
          </button>
        </div>
      </div>

      <div className="landing-config-card__footer">
        <div className="landing-config-card__note">
          <span className="landing-config-card__note-dot" />
          Any runtime · Any model · Anyone access
        </div>
        <div className="landing-config-card__action">
          <button type="button" onClick={onContinue}>
            <Rocket />
            <span>Launch</span>
            <ArrowUpRight />
          </button>
        </div>
      </div>
    </div>
  );
}

export function Hero({ onContinue }: { onContinue: () => void }): ReactElement {
  return (
    <section
      className="relative flex min-h-[calc(100svh-48px)] items-center overflow-hidden px-4 py-10 md:min-h-[calc(100svh-54px)] md:px-6 md:py-12"
      style={HERO_PANEL_STYLE}
    >
      <BambooWaveBackground />
      <div
        className="relative z-10 mx-auto grid w-full max-w-[1440px] grid-cols-1 items-center gap-12 lg:grid-cols-[0.86fr_1.14fr] lg:gap-16 xl:px-8"
        style={HERO_CONTENT_STYLE}
      >
        <div className="flex min-w-0 flex-col items-center text-center lg:items-start lg:pl-6 lg:text-left xl:pl-10">
          <div className="landing-hero-reveal">
            <Eyebrow>{t("Open source · Agent runtime · On Cloud")}</Eyebrow>
          </div>
          <h1
            className="landing-hero-reveal landing-hero-reveal-delay-1 text-ink-900 mt-7 max-w-[720px] [text-wrap:balance]"
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
            {" "}
            {t("But no model subscription required.")}
          </p>
          <div className="landing-hero-reveal landing-hero-reveal-delay-3 mt-9 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <button
              type="button"
              onClick={onContinue}
              className="bg-[#66c602] text-paper-100 hover:bg-[#5bb802] focus-visible:ring-ring inline-flex h-12 items-center rounded-md px-7 text-[15px] font-semibold shadow-sm transition-colors outline-none focus-visible:ring-2"
            >
              {t("Get Started")}
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
          </div>
        </div>
        <div className="landing-hero-reveal landing-hero-reveal-delay-2 flex min-w-0 items-center justify-center lg:justify-end">
          <SkillConfigurationCard onContinue={onContinue} />
        </div>
      </div>
    </section>
  );
}
