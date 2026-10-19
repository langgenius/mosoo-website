import { useEffect } from "react";
import type { ReactElement } from "react";

import { ContractBelowFold } from "./contract-sections";

// Everything below the title block, in its own chunk, loaded once the browser
// is idle, so the first paint only ships the title block and Exhibit 1.
export function LandingBelowFold(): ReactElement {
  // These sections mount after the first paint, so a link to one of them
  // (for example /en#faq, the FAQPage @id) found no target on load. Scroll to
  // it once it exists. The section ids are the ones the static fallback in
  // scripts/landing-home.mjs uses, so an anchor works with and without
  // JavaScript.
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (id !== "") {
      document.getElementById(id)?.scrollIntoView();
    }
  }, []);

  return <ContractBelowFold />;
}
