import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type { ReactElement } from "react";

import { useIdleReady } from "@/shared/lib/use-idle-ready";

import { LoginLandingTopbar } from "../topbar";
import { LoginLanding } from "./landing";

const LandingFooter = lazy(async () => {
  const mod = await import("./footer");
  return { default: mod.LandingFooter };
});

function getViewportHeightSnapshot(): number {
  return window.innerHeight;
}

function subscribeViewportHeight(listener: () => void): () => void {
  window.addEventListener("resize", listener);

  return () => {
    window.removeEventListener("resize", listener);
  };
}

// exa-style footer reveal: the foreground content sits on a higher layer and
// "peels up" as you reach the bottom, uncovering the footer pinned behind it.
// Falls back to a normal in-flow footer when it's taller than the viewport.
export function LandingShell({ onContinue }: { onContinue: () => void }): ReactElement {
  const contentRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const [footerHeight, setFooterHeight] = useState(0);
  const loadFooter = useIdleReady();
  const viewportHeight = useSyncExternalStore(
    subscribeViewportHeight,
    getViewportHeightSnapshot,
    () => 0,
  );

  const setContentNode = useCallback((node: HTMLDivElement | null): void => {
    contentRef.current = node;
  }, []);

  const setFooterNode = useCallback((node: HTMLDivElement | null): void => {
    footerRef.current = node;

    if (node !== null) {
      setFooterHeight(node.offsetHeight);
    }
  }, []);

  useEffect(() => {
    const measure = (): void => {
      if (footerRef.current) {
        setFooterHeight(footerRef.current.offsetHeight);
      }
    };
    const observer = new ResizeObserver(measure);
    if (footerRef.current) {
      observer.observe(footerRef.current);
    }
    if (contentRef.current) {
      observer.observe(contentRef.current);
    }
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const reveal = footerHeight > 0 && viewportHeight > 0 && footerHeight <= viewportHeight;

  return (
    <div
      data-theme="landing"
      className="bg-paper-100 fixed inset-0 overflow-x-hidden overflow-y-auto"
    >
      <div
        ref={setContentNode}
        className="bg-paper-100 relative z-10 shadow-[0_24px_48px_-16px_rgba(11,26,20,0.45)]"
        style={reveal ? { marginBottom: footerHeight } : undefined}
      >
        <LoginLandingTopbar onContinue={onContinue} />
        <LoginLanding onContinue={onContinue} />
      </div>
      <div ref={setFooterNode} className={reveal ? "fixed inset-x-0 bottom-0 z-0" : "relative z-0"}>
        {loadFooter ? (
          <Suspense fallback={null}>
            <LandingFooter />
          </Suspense>
        ) : null}
      </div>
    </div>
  );
}
