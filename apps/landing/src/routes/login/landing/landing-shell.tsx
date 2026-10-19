import type { ReactElement, ReactNode } from "react";

import { t } from "@/shared/i18n";
import { SiteFooter } from "@/shared/ui/site-footer";
import { SiteNav } from "@/shared/ui/site-nav";

/** The page a nav link marks as current. */
export type TopbarNav = "use-cases";

/**
 * The chrome every landing page shares (d-object canvas): a stone frame with
 * one white paper sheet on it (Apollo's sand frame + white sheet), the nav at
 * the top of the paper, the page in <main id="main">, and the footer back on
 * the frame. The document scrolls; nothing is pinned.
 */
export function LandingShell({
  activeNav,
  theme = "landing",
  children,
}: {
  activeNav?: TopbarNav;
  /** Kept for callers; the home page no longer has its own nav shape. */
  navVariant?: "bar" | "capsule";
  // "landing" keeps the page's palette tokens; "brand" drops them to inherit
  // the :root palette the blog uses.
  theme?: "landing" | "brand";
  children: ReactNode;
}): ReactElement {
  return (
    <div data-theme={theme === "landing" ? "landing" : undefined} className="landing-shell d-shell">
      <a href="#main" className="d-skip">
        {t("Skip to content")}
      </a>
      <div className="d-paper">
        <SiteNav active={activeNav} />
        <main id="main" tabIndex={-1} className="outline-none">
          {children}
        </main>
      </div>
      <SiteFooter />
    </div>
  );
}
