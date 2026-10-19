import { useEffect } from "react";
import type { ReactElement } from "react";

import { FaqSection } from "./faq-section";
import { FinalCta } from "./final-cta";
import { HowItWorks } from "./how-it-works";
import { LimitsSection } from "./limits-section";
import { ProofSection } from "./proof-section";
import { ContinueSection, KeysSection, RuntimesSection, TurnsSection } from "./stage-sections";

// Everything below the first screen, in copy deck order. Split into its own
// chunk and loaded once the browser is idle, so the first paint only ships the
// hero and the product visual.
export function LandingBelowFold(): ReactElement {
  // These sections mount after the first paint, so a link to one of them
  // (for example /en#faq, the FAQPage @id) found no target on load. Scroll to
  // it once it exists. The section ids (continue, runtimes, turns, keys,
  // how-it-works, proof, limits, faq, start) are the same ones the
  // static fallback in scripts/landing-home.mjs uses, so an anchor works with
  // and without JavaScript.
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (id !== "") {
      document.getElementById(id)?.scrollIntoView();
    }
  }, []);

  return (
    <>
      <ContinueSection />
      <RuntimesSection />
      <TurnsSection />
      <KeysSection />
      <HowItWorks />
      <div className="border-border-strong border-t">
        <div className="mx-auto max-w-[1280px]">
          <ProofSection />
        </div>
      </div>
      <div className="bg-paper-200">
        <div className="mx-auto max-w-[1280px]">
          <LimitsSection />
        </div>
      </div>
      <div className="mx-auto max-w-[1280px]">
        <FaqSection />
        <FinalCta />
      </div>
    </>
  );
}
