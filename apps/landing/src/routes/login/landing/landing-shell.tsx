import type { ReactElement, ReactNode } from "react";

import { t } from "@/shared/i18n";

import { LoginLandingTopbar } from "../topbar";
import type { TopbarNav } from "../topbar";
import { LandingFooter } from "./footer";

/**
 * The chrome every landing page shares: skip link, sticky header, the page in
 * <main id="main">, and the footer.
 *
 * The document scrolls (there is no fixed inner scroll container). The footer
 * renders with the page, in normal flow, so it never shifts the layout when it
 * arrives; on large viewports app.css pins it under the content layer, which
 * peels up to reveal it at the end of the page.
 */
export function LandingShell({
  activeNav,
  theme = "landing",
  children,
}: {
  activeNav?: TopbarNav;
  // "landing" keeps the warm forest palette; "brand" drops it to inherit the
  // cool/bright :root palette the blog uses, so a page can match the blog;
  // "console" wears the console's neutrals (the home page's product stage).
  theme?: "landing" | "brand" | "console";
  children: ReactNode;
}): ReactElement {
  return (
    <div
      data-theme={theme === "brand" ? undefined : theme}
      className="landing-shell bg-paper-100 text-fg-1"
    >
      <a
        href="#main"
        className="bg-ink-900 text-paper-100 focus-visible:ring-ring sr-only rounded-md px-4 py-2.5 text-[15px] font-semibold outline-none focus:not-sr-only focus:fixed focus:top-3 focus:left-4 focus:z-[60] focus-visible:ring-2 focus-visible:ring-offset-2"
      >
        {t("Skip to content")}
      </a>
      <div className="bg-paper-100 relative z-10 shadow-[0_24px_48px_-16px_rgba(11,26,20,0.45)]">
        <LoginLandingTopbar activeNav={activeNav} />
        <main id="main" tabIndex={-1} className="outline-none">
          {children}
        </main>
      </div>
      <LandingFooter />
    </div>
  );
}
