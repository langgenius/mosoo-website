import { useEffect } from "react";
import type { ReactElement } from "react";

import { FaqSection } from "./faq-section";
import { FinalCta } from "./final-cta";
import { LimitsSection } from "./limits-section";
import { ProofSection } from "./proof-section";
import { SplitSection } from "./split-section";
import { SupplyWall } from "./supply-wall";

// Everything below the first screen: what runs a Session, who owns what,
// what you can check, what is left out, questions, and the way in. Split into
// its own chunk and loaded once the browser is idle, so the first paint only
// ships the hero and the product stage.
export function LandingBelowFold(): ReactElement {
  // These sections mount after the first paint, so a link to one of them
  // (for example /en#faq, the FAQPage @id) found no target on load. Scroll to
  // it once it exists. The section ids (runtimes, your-app-and-mosoo, proof,
  // limits, faq, start) are the same ones the static fallback in
  // scripts/landing-home.mjs uses, so an anchor works with and without
  // JavaScript. (#how-it-works is the product stage, which renders with the
  // first screen.)
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (id !== "") {
      document.getElementById(id)?.scrollIntoView();
    }
  }, []);

  return (
    <>
      <SupplyWall />
      <SplitSection />
      <ProofSection />
      <LimitsSection />
      <FaqSection />
      <FinalCta />
    </>
  );
}
