import type { ReactElement, ReactNode } from "react";

import { renderPaperFooter, renderPaperNav } from "@/shared/chrome/paper-chrome.mjs";
import { LOCALES, locale, localeHref } from "@/shared/locale";

import "@/shared/styles/paper-fonts.css";
import "@/shared/styles/paper.css";

// The nav and footer are the same HTML the static home renders
// (shared/chrome/paper-chrome.mjs), so every page shares one chrome.
const NAV_HTML = { __html: renderPaperNav({ locale }) };
const FOOTER_HTML = {
  __html: renderPaperFooter({
    locale,
    languageHrefs: Object.fromEntries(LOCALES.map((code) => [code, localeHref(code)])) as Record<
      (typeof LOCALES)[number],
      string
    >,
  }),
};

/**
 * The chrome every landing subpage shares: skip link and nav, the page in
 * <main id="main">, and the footer. The home page renders the same chrome as
 * static HTML (scripts/landing-home.mjs).
 */
export function LandingShell({
  theme = "landing",
  children,
}: {
  /** Kept for the subpages' call sites; the paper chrome has one nav. */
  activeNav?: string;
  // "landing" keeps the warm palette; "brand" drops it to inherit the
  // cool/bright :root palette the blog uses, so a page can match the blog.
  theme?: "landing" | "brand";
  children: ReactNode;
}): ReactElement {
  return (
    <div data-theme={theme === "landing" ? "landing" : undefined} className="pp-page landing-shell text-fg-1">
      <div dangerouslySetInnerHTML={NAV_HTML} />
      <main id="main" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <div dangerouslySetInnerHTML={FOOTER_HTML} />
    </div>
  );
}
