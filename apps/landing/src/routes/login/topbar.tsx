import { ArrowLeft } from "lucide-react";
import type { ReactElement } from "react";

import { t } from "@/shared/i18n";
import { isLocale, locale, LOCALE_LABELS, navigateToLocale } from "@/shared/locale";

import { GithubMarkLink } from "./github-mark";
import { MOSOO_API_REFERENCE_URL, MOSOO_BLOG_URL, MOSOO_GITHUB_URL, MOSOO_X_URL } from "./links";
import { XMark } from "./x-mark";

const ICON_LINK_CLASS =
  "text-fg-2 hover:bg-paper-200/70 hover:text-fg-1 focus-visible:ring-ring flex size-9 items-center justify-center rounded-md transition-colors outline-none focus-visible:ring-2";

function Brand(): ReactElement {
  return (
    <span aria-label="mosoo" className="inline-flex items-center">
      <img src="/brand/logo-wordmark-onlight.svg" alt="mosoo" className="block h-[22px]" />
    </span>
  );
}

export function LoginLandingTopbar({ onContinue }: { onContinue: () => void }): ReactElement {
  const blogHref = locale === "en" ? MOSOO_BLOG_URL : `${MOSOO_BLOG_URL}/${locale}`;

  return (
    <div className="border-border-soft/70 bg-paper-100/80 sticky top-0 z-50 border-b backdrop-blur-md">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-4 py-3 md:px-6">
        <Brand />
        <div className="flex items-center gap-1">
          <a
            href={blogHref}
            className="text-fg-2 hover:text-fg-1 focus-visible:ring-ring hidden rounded-md px-3 text-[13.5px] font-semibold transition-colors outline-none focus-visible:ring-2 sm:inline-flex"
          >
            {t("Blog")}
          </a>
          <a
            href={MOSOO_API_REFERENCE_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="text-fg-2 hover:text-fg-1 focus-visible:ring-ring hidden rounded-md px-3 text-[13.5px] font-semibold transition-colors outline-none focus-visible:ring-2 sm:inline-flex"
          >
            {t("API docs")}
          </a>
          <select
            value={locale}
            aria-label={t("Language")}
            title={t("Language")}
            onChange={(event) => {
              const nextLocale = event.currentTarget.value;
              if (isLocale(nextLocale)) navigateToLocale(nextLocale);
            }}
            className="border-border-strong bg-card text-fg-2 focus-visible:border-ring focus-visible:ring-ring h-9 w-[58px] cursor-pointer rounded-md border px-1.5 text-[12px] font-semibold outline-none focus-visible:ring-2"
          >
            {LOCALE_LABELS.map((option) => (
              <option key={option.locale} value={option.locale}>
                {option.label}
              </option>
            ))}
          </select>
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
