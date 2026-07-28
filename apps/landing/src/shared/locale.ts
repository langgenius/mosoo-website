export const LOCALES = ["en", "zh", "ja"] as const;

export type Locale = (typeof LOCALES)[number];

export const LOCALE_LABELS: ReadonlyArray<{ locale: Locale; label: string }> = [
  { locale: "en", label: "EN" },
  { locale: "zh", label: "中" },
  { locale: "ja", label: "日" },
];

export function isLocale(value: string): value is Locale {
  return value === "en" || value === "zh" || value === "ja";
}

export function localeFromPathname(pathname: string): Locale {
  const locale = pathname.split("/")[1] ?? "";
  return isLocale(locale) ? locale : "en";
}

export const locale = localeFromPathname(window.location.pathname);

export const htmlLanguage = {
  en: "en",
  zh: "zh-CN",
  ja: "ja",
} as const satisfies Record<Locale, string>;

export function navigateToLocale(nextLocale: Locale): void {
  document.cookie = `mosoo_locale=${nextLocale}; Path=/; Max-Age=31536000; SameSite=Lax; Secure`;
  window.location.assign(`/${nextLocale}`);
}
