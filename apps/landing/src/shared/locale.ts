export const LOCALES = ["en", "zh", "ja"] as const;

export type Locale = (typeof LOCALES)[number];

export const LOCALE_LABELS = {
  en: { short: "EN", native: "English" },
  zh: { short: "中", native: "简体中文" },
  ja: { short: "日", native: "日本語" },
} as const satisfies Record<Locale, { short: string; native: string }>;

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

/** The same page in another locale (e.g. /en/use-cases → /ja/use-cases). */
export function localeHref(nextLocale: Locale, pathname = window.location.pathname): string {
  if (/^\/(?:(en|zh|ja)\/)?health$/.test(pathname)) {
    return nextLocale === "en" ? "/health" : `/${nextLocale}/health`;
  }

  const segments = pathname.split("/").filter(Boolean);
  const rest = isLocale(segments[0] ?? "") ? segments.slice(1) : segments;
  return ["", nextLocale, ...rest].join("/");
}

/** The worker's `/` redirect reads this cookie before Accept-Language. */
export function rememberLocale(nextLocale: Locale): void {
  document.cookie = `mosoo_locale=${nextLocale}; Path=/; Max-Age=31536000; SameSite=Lax; Secure`;
}

export function navigateToLocale(nextLocale: Locale): void {
  rememberLocale(nextLocale);
  window.location.assign(localeHref(nextLocale));
}
