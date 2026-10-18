import { lazy, Suspense } from "react";
import type { ReactElement } from "react";

import { useIdleReady } from "@/shared/lib/use-idle-ready";

import { Hero } from "./hero";
import { ProductVisual } from "./product-visual";

const LandingBelowFold = lazy(async () => {
  const mod = await import("./landing-below-fold");
  return { default: mod.LandingBelowFold };
});

export function LoginLanding(): ReactElement {
  const loadBelowFold = useIdleReady();

  return (
    <div className="px-4 md:px-6">
      {/* A single framed column: continuous left/right hairlines run the full
          height, and sections are split by horizontal dividers. */}
      <div className="border-border-strong divide-border-strong mx-auto w-full max-w-[1280px] divide-y border-x">
        <Hero />
        <ProductVisual />
        {loadBelowFold ? (
          <Suspense fallback={null}>
            <LandingBelowFold />
          </Suspense>
        ) : null}
      </div>
    </div>
  );
}
