import { Menu } from "@base-ui/react/menu";
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
  const currentLanguage = LOCALE_LABELS[locale];

  return (
    <Menu.Root>
      <Menu.Trigger
        aria-label={t("Language")}
        title={t("Language")}
        className="group text-fg-2 hover:border-border-soft hover:bg-paper-200/70 hover:text-fg-1 focus-visible:ring-ring data-popup-open:border-border-strong data-popup-open:bg-paper-50 inline-flex h-11 min-w-[64px] cursor-pointer items-center justify-center gap-2 rounded-md border border-transparent px-2.5 font-mono text-[11px] font-semibold tracking-[0.08em] outline-none transition-colors focus-visible:ring-2 sm:h-9"
      >
        <span aria-hidden="true" className="bg-green-500 size-1.5 rounded-[1px]" />
        {currentLanguage.short}
        <ChevronDown
          aria-hidden="true"
          className="size-3 transition-transform duration-150 group-data-[popup-open]:rotate-180"
        />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner align="end" sideOffset={8} className="z-[100] outline-none">
          <Menu.Popup
            aria-label={t("Language")}
            data-theme="landing"
            className="border-border-strong bg-paper-50 text-fg-1 w-[176px] origin-[var(--transform-origin)] rounded-[10px] border p-1.5 shadow-[var(--shadow-md)] outline-none transition-[transform,opacity] duration-150 ease-out data-[ending-style]:scale-[0.98] data-[ending-style]:opacity-0 data-[starting-style]:scale-[0.98] data-[starting-style]:opacity-0"
          >
            <Menu.RadioGroup
              value={locale}
              onValueChange={(nextLocale) => {
                if (isLocale(nextLocale) && nextLocale !== locale) navigateToLocale(nextLocale);
              }}
            >
              {LOCALES.map((nextLocale) => {
                const language = LOCALE_LABELS[nextLocale];

                return (
                  <Menu.RadioItem
                    key={nextLocale}
                    value={nextLocale}
                    className="data-highlighted:bg-paper-200 grid min-h-11 cursor-pointer grid-cols-[14px_1fr_auto] items-center gap-2 rounded-md px-2.5 outline-none select-none"
                  >
                    <Menu.RadioItemIndicator className="col-start-1">
                      <span className="bg-green-500 block size-1.5 rounded-[1px]" />
                    </Menu.RadioItemIndicator>
                    <span className="col-start-2 text-[13px] font-semibold">
                      {language.native}
                    </span>
                    <span className="text-fg-3 col-start-3 font-mono text-[10px] tracking-[0.12em]">
                      {language.short}
                    </span>
                  </Menu.RadioItem>
                );
              })}
            </Menu.RadioGroup>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
