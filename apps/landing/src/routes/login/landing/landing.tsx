import { lazy, Suspense } from "react";
import type { ReactElement } from "react";

import { useIdleReady } from "@/shared/lib/use-idle-ready";

import { Hero } from "./hero";

const LandingBelowFold = lazy(async () => {
  const mod = await import("./landing-below-fold");
  return { default: mod.LandingBelowFold };
});

// Holds the space of the sections below the hero until their chunk arrives,
// so the footer never shows in the first screen and then jumps away.
const BELOW_FOLD_PLACEHOLDER = <div aria-hidden="true" className="min-h-screen" />;

export function LoginLanding(): ReactElement {
  const loadBelowFold = useIdleReady();

  return (
    <div className="v2a px-4 md:px-6">
      {/* One column. Below the hero, the sections hang off a single 1px
          culm line with a node at each heading (bamboo-node.css). */}
      <div className="mx-auto w-full max-w-[1280px]">
        <Hero />
        {loadBelowFold ? (
          <Suspense fallback={BELOW_FOLD_PLACEHOLDER}>
            <LandingBelowFold />
          </Suspense>
        ) : (
          BELOW_FOLD_PLACEHOLDER
        )}
      </div>
    </div>
  );
}
