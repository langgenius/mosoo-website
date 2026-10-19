// Types for paper-chrome.mjs.
type ChromeLocale = "en" | "zh" | "ja";

export declare function chromeLinks(locale: ChromeLocale): Readonly<Record<string, string>>;
export declare function renderPaperNav(options: { locale: ChromeLocale }): string;
export declare function renderPaperFooter(options: {
  locale: ChromeLocale;
  languageHrefs: Readonly<Record<ChromeLocale, string>>;
}): string;
