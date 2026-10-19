import { lazy, Suspense } from "react";
import type { ReactElement } from "react";

import { useIdleReady } from "@/shared/lib/use-idle-ready";

import { Hero } from "./hero";

const LandingBelowFold = lazy(async () => {
  const mod = await import("./landing-below-fold");
  return { default: mod.LandingBelowFold };
});

/**
 * The home page as one document (v2b "Contract"): the title block with
 * Exhibit 1 first, then the rest once the browser is idle.
 */
export function LoginLanding(): ReactElement {
  const loadBelowFold = useIdleReady();

  return (
    <div className="ct-page">
      <Hero />
      {loadBelowFold ? (
        <Suspense fallback={null}>
          <LandingBelowFold />
        </Suspense>
      ) : null}
    </div>
  );
}
