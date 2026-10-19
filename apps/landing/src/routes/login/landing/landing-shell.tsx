import type { ReactElement, ReactNode } from "react";

import { renderFooter, renderNav } from "@/home/markup.ts";
import { locale } from "@/shared/locale";

import "@/shared/styles/v4.css";

import type { TopbarNav } from "../topbar";

/**
 * The chrome every landing page shares, from the same markup as the static home
 * (src/home/markup.ts): skip link and sticky nav, the page in <main id="main">,
 * and the v4 footer (Ask-AI plate, links, language switcher, credit). The
 * markup is static, so it is set as HTML rather than re-declared in JSX.
 */
export function LandingShell(props: {
  activeNav?: TopbarNav;
  /** Kept for callers; the v4 nav has one shape. */
  navVariant?: "bar" | "capsule";
  theme?: "landing" | "brand";
  children: ReactNode;
}): ReactElement {
  return (
    <div data-theme="landing" className="v4-chrome landing-shell">
      <div style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: renderNav(locale) }} />
      <main id="main" tabIndex={-1} className="outline-none">
        {props.children}
      </main>
      <div style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: renderFooter(locale) }} />
    </div>
  );
}
