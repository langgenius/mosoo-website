import { ChevronDown } from "lucide-react";
import type { ReactElement } from "react";

import { t } from "@/shared/i18n";
import {
  isLocale,
  locale,
  LOCALE_LABELS,
  LOCALES,
  navigateToLocale,
} from "@/shared/locale";

export function LanguageMenu(): ReactElement {
  return (
    <label
      aria-label={t("Language")}
      title={t("Language")}
      className="relative inline-flex h-11 min-w-[64px] items-center sm:h-9"
    >
      <span
        aria-hidden="true"
        className="bg-green-500 pointer-events-none absolute left-2.5 top-1/2 z-10 size-1.5 -translate-y-1/2 rounded-[1px]"
      />
      <select
        aria-label={t("Language")}
        value={locale}
        onChange={(event) => {
          const nextLocale = event.currentTarget.value;
          if (isLocale(nextLocale) && nextLocale !== locale) navigateToLocale(nextLocale);
        }}
        className="text-fg-2 hover:border-border-soft hover:bg-paper-200/70 hover:text-fg-1 focus-visible:ring-ring h-full w-full cursor-pointer appearance-none rounded-md border border-transparent bg-transparent pl-5 pr-7 font-mono text-[11px] font-semibold tracking-[0.08em] outline-none transition-colors focus-visible:ring-2"
      >
        {LOCALES.map((nextLocale) => (
          <option key={nextLocale} value={nextLocale}>
            {LOCALE_LABELS[nextLocale].short}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-2.5 top-1/2 size-3 -translate-y-1/2"
      />
    </label>
  );
}
