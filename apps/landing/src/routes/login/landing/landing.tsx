import { lazy, Suspense } from "react";
import type { ReactElement } from "react";

import { useIdleReady } from "@/shared/lib/use-idle-ready";

import { Hero } from "./hero";

// The marketing sections below the hero are not part of the first viewport, so
// they load after the browser gets an idle slot. Keeping them out of the login
// route's first turn shrinks the work every unauthenticated visitor pays for.
const LandingBelowFold = lazy(async () => {
  const mod = await import("./landing-below-fold");
  return { default: mod.LandingBelowFold };
});

export function LoginLanding({ onContinue }: { onContinue: () => void }): ReactElement {
  const loadBelowFold = useIdleReady();

  return (
    <div className="px-4 md:px-6">
      {/* A single framed column — continuous left/right hairlines run the full
          height (the "wireframe"); sections are split by horizontal dividers. */}
      <div className="border-border-strong divide-border-strong mx-auto w-full max-w-[1280px] divide-y border-x">
        <Hero onContinue={onContinue} />
        {loadBelowFold ? (
          <Suspense fallback={null}>
            <LandingBelowFold onContinue={onContinue} />
          </Suspense>
        ) : null}
      </div>
    </div>
  );
}
