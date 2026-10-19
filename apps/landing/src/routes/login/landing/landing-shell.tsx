import type { ReactElement, ReactNode } from "react";

import { LoginLandingTopbar } from "../topbar";
import type { TopbarNav } from "../topbar";
import { LandingFooter } from "./footer";
import { copy } from "./home-copy";

/**
 * The chrome every landing page shares: skip link, the header, the page in
 * <main id="main">, and the footer, all on the instrument canvas
 * (instrument.css). The two 1px rails run from the header to the footer.
 */
export function LandingShell({
  activeNav,
  theme = "landing",
  children,
}: {
  activeNav?: TopbarNav;
  /** Kept for the page entries; the header shape is the same everywhere. */
  navVariant?: "bar" | "capsule";
  // "landing" keeps the landing palette for the page body; "brand" drops it
  // to inherit the :root palette the blog uses.
  theme?: "landing" | "brand";
  children: ReactNode;
}): ReactElement {
  return (
    <div
      data-theme={theme === "landing" ? "landing" : undefined}
      className="landing-shell i-page"
    >
      <a href="#main" className="i-skip">
        {copy.nav.skip}
      </a>
      <LoginLandingTopbar activeNav={activeNav} />
      <main id="main" tabIndex={-1} className="i-main">
        {children}
      </main>
      <LandingFooter />
    </div>
  );
}
