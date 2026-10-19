import { useEffect } from "react";
import type { ReactElement } from "react";

import { FaqSection } from "./faq-section";
import { FeaturesSection } from "./features-section";
import { FinalCta } from "./final-cta";
import { HowItWorks } from "./how-it-works";
import { ProofSection } from "./proof-section";
import { SplitSection } from "./split-section";
import { SupplyWall } from "./supply-wall";

// Everything below the first screen, in copy deck order. Split into its own
// chunk and loaded once the browser is idle, so the first paint only ships the
// hero and the product visual.
export function LandingBelowFold(): ReactElement {
  // These sections mount after the first paint, so a link to one of them
  // (for example /en#faq, the FAQPage @id) found no target on load. Scroll to
  // it once it exists. The section ids (runtimes, features, how-it-works,
  // your-app-and-mosoo, proof, faq, start, and #limits, now the split's third
  // ledger) are the same ones the static fallback in scripts/landing-home.mjs
  // uses, so an anchor works with and without JavaScript.
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (id !== "") {
      document.getElementById(id)?.scrollIntoView();
    }
  }, []);

  return (
    <>
      <SupplyWall />
      <FeaturesSection />
      <HowItWorks />
      <SplitSection />
      <ProofSection />
      <FaqSection />
      <FinalCta />
    </>
  );
}
