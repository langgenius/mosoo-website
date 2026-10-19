import { useEffect } from "react";
import type { ReactElement } from "react";

import { FaqSection } from "./faq-section";
import { FinalCta } from "./final-cta";
import { Hero } from "./hero";
import { SpecSection } from "./spec-section";
import { StageSection } from "./stage-section";

/**
 * The instrument home (v4a): 01 hero, 02 the pinned transcript stage, 03 the
 * spec table, 04 FAQ, 05 closing card; the footer comes from the shell.
 * Section ids match the static fallback in scripts/landing-home.mjs where
 * they still exist (faq, start).
 */
export function LoginLanding(): ReactElement {
  // A link to a section (for example /en#faq, the FAQPage @id) scrolls to it
  // once React has replaced the static first paint.
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (id !== "") {
      document.getElementById(id)?.scrollIntoView();
    }
  }, []);

  return (
    <div className="i-home i-shell">
      <Hero />
      <StageSection />
      <SpecSection />
      <FaqSection />
      <FinalCta />
    </div>
  );
}
