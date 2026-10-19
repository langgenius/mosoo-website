import { lazy, Suspense } from "react";
import type { ReactElement } from "react";

import { useIdleReady } from "@/shared/lib/use-idle-ready";

import { Hero } from "./hero";

const LandingBelowFold = lazy(async () => {
  const mod = await import("./landing-below-fold");
  return { default: mod.LandingBelowFold };
});

// v2c "Product Stage": the hero carries the first product moment (the console
// Preview replaying turn 1); everything after it loads once the browser is
// idle, in its own chunk.
export function LoginLanding(): ReactElement {
  const loadBelowFold = useIdleReady();

  return (
    <>
      <Hero />
      {loadBelowFold ? (
        <Suspense fallback={null}>
          <LandingBelowFold />
        </Suspense>
      ) : null}
    </>
  );
}
