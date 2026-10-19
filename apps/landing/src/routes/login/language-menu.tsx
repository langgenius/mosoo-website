import { ChevronDown } from "lucide-react";
import type { ReactElement } from "react";

import { t } from "@/shared/i18n";
import {
  htmlLanguage,
  isLocale,
  locale,
  LOCALE_LABELS,
  LOCALES,
  navigateToLocale,
} from "@/shared/locale";

export function LanguageMenu(): ReactElement {
  return (
    <label title={t("Change language")} className="relative inline-flex h-9 min-w-[56px] items-center">
      <select
        aria-label={t("Change language")}
        value={locale}
        onChange={(event) => {
          const nextLocale = event.currentTarget.value;
          if (isLocale(nextLocale) && nextLocale !== locale) navigateToLocale(nextLocale);
        }}
        className="text-fg-2 hover:border-border-soft hover:bg-paper-200/70 hover:text-fg-1 focus-visible:ring-ring h-full w-full cursor-pointer appearance-none rounded-md border border-transparent bg-transparent pr-7 pl-2.5 font-mono text-[13px] font-semibold transition-colors outline-none focus-visible:ring-2"
      >
        {LOCALES.map((nextLocale) => (
          <option key={nextLocale} value={nextLocale} lang={htmlLanguage[nextLocale]}>
            {LOCALE_LABELS[nextLocale].short}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-2.5 size-3 -translate-y-1/2"
      />
    </label>
  );
}
