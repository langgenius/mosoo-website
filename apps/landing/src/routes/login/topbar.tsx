import { ArrowLeft, ChevronDown } from "lucide-react";
import { lazy, Suspense } from "react";
import type { ReactElement } from "react";

import { t } from "@/shared/i18n";
import { useIdleReady } from "@/shared/lib/use-idle-ready";
import { locale, LOCALE_LABELS } from "@/shared/locale";

import { GithubMarkLink } from "./github-mark";
import { MOSOO_API_REFERENCE_URL, MOSOO_BLOG_URL, MOSOO_GITHUB_URL, MOSOO_X_URL } from "./links";
import { XMark } from "./x-mark";

const ICON_LINK_CLASS =
  "text-fg-2 hover:bg-paper-200/70 hover:text-fg-1 focus-visible:ring-ring flex size-9 items-center justify-center rounded-md transition-colors outline-none focus-visible:ring-2";

const TEXT_LINK_CLASS =
  "hover:text-fg-1 focus-visible:ring-ring hidden rounded-md px-3 text-[13.5px] font-semibold transition-colors outline-none focus-visible:ring-2 sm:inline-flex";

export type TopbarNav = "pricing";

const LazyLanguageMenu = lazy(async () => {
  const mod = await import("./language-menu");
  return { default: mod.LanguageMenu };
});

function Brand(): ReactElement {
  return (
    <a href={`/${locale}`} aria-label="mosoo" className="inline-flex items-center">
      <img src="/brand/logo-wordmark-onlight.svg" alt="mosoo" className="block h-[22px]" />
    </a>
  );
}

function LanguageMenuFallback(): ReactElement {
  const currentLanguage = LOCALE_LABELS[locale];

  return (
    <button
      type="button"
      aria-label={t("Language")}
      title={t("Language")}
      disabled
      className="text-fg-2 inline-flex h-11 min-w-[64px] cursor-default items-center justify-center gap-2 rounded-md border border-transparent px-2.5 font-mono text-[11px] font-semibold tracking-[0.08em] opacity-80 outline-none sm:h-9"
    >
      <span aria-hidden="true" className="bg-green-500 size-1.5 rounded-[1px]" />
      {currentLanguage.short}
      <ChevronDown aria-hidden="true" className="size-3" />
    </button>
  );
}

export function LoginLandingTopbar({
  onContinue,
  activeNav,
}: {
  onContinue: () => void;
  activeNav?: TopbarNav | undefined;
}): ReactElement {
  const loadLanguageMenu = useIdleReady();
  const blogHref = locale === "en" ? MOSOO_BLOG_URL : `${MOSOO_BLOG_URL}/${locale}`;

  return (
    <div className="border-border-soft/70 bg-paper-100/80 sticky top-0 z-50 border-b backdrop-blur-md">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-4 py-3 md:px-6">
        <Brand />
        <div className="flex items-center gap-1">
          <a
            href={`/${locale}/pricing`}
            aria-current={activeNav === "pricing" ? "page" : undefined}
            className={`${TEXT_LINK_CLASS} ${activeNav === "pricing" ? "text-fg-1" : "text-fg-2"}`}
          >
            {t("Pricing")}
          </a>
          <a href={blogHref} className={`${TEXT_LINK_CLASS} text-fg-2`}>
            {t("Blog")}
          </a>
          <a
            href={MOSOO_API_REFERENCE_URL}
            target="_blank"
            rel="noreferrer noopener"
            className={`${TEXT_LINK_CLASS} text-fg-2`}
          >
            {t("API docs")}
          </a>
          {loadLanguageMenu ? (
            <Suspense fallback={<LanguageMenuFallback />}>
              <LazyLanguageMenu />
            </Suspense>
          ) : (
            <LanguageMenuFallback />
          )}
          <a
            href={MOSOO_X_URL}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={t("mosoo on X")}
            title={t("mosoo on X")}
            className={`${ICON_LINK_CLASS} max-[380px]:hidden`}
          >
            <XMark className="size-4" />
          </a>
          <GithubMarkLink
            href={MOSOO_GITHUB_URL}
            className={ICON_LINK_CLASS}
            label={t("mosoo on GitHub")}
          />
          <button
            type="button"
            onClick={onContinue}
            className="border-border-strong bg-card text-foreground hover:bg-paper-200 focus-visible:border-ring focus-visible:ring-ring active:scale-[0.98] ml-1 inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-md border px-4 py-2 text-sm font-semibold tracking-[0.01em] whitespace-nowrap shadow-xs transition-all outline-none focus-visible:ring-[2px]"
          >
            {t("Log in")}
          </button>
        </div>
      </div>
    </div>
  );
}

export function LoginAuthTopbar({ onBack }: { onBack: () => void }): ReactElement {
  return (
    <div className="flex items-center justify-between px-10 py-[22px]">
      <button
        type="button"
        onClick={onBack}
        className="text-fg-2 hover:text-fg-1 flex items-center gap-1.5 text-[13px] font-semibold transition-colors"
      >
        <ArrowLeft className="size-3.5" />
        Back
      </button>
      <Brand />
      <div className="w-[60px]" />
    </div>
  );
}
