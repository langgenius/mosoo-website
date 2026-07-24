import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { ReactElement } from "react";

import { LoginLandingTopbar } from "../topbar";
import { LandingFooter } from "./footer";
import { LoginLanding } from "./landing";

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
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const [footerHeight, setFooterHeight] = useState(0);
  const [footerRevealProgress, setFooterRevealProgress] = useState(1);
  const viewportHeight = useSyncExternalStore(
    subscribeViewportHeight,
    getViewportHeightSnapshot,
    () => 0,
  );
  const [maxScroll, setMaxScroll] = useState(0);

  const measureScrollRange = useCallback((): void => {
    if (scrollRef.current) {
      setMaxScroll(Math.max(0, scrollRef.current.scrollHeight - scrollRef.current.clientHeight));
    }
  }, []);

  const setScrollNode = useCallback(
    (node: HTMLDivElement | null): void => {
      scrollRef.current = node;
      measureScrollRange();
    },
    [measureScrollRange],
  );

  const setContentNode = useCallback(
    (node: HTMLDivElement | null): void => {
      contentRef.current = node;
      measureScrollRange();
    },
    [measureScrollRange],
  );

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
      measureScrollRange();
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
  }, [measureScrollRange]);

  const reveal = footerHeight > 0 && viewportHeight > 0 && footerHeight <= viewportHeight;

  const updateFooterRevealProgress = useCallback((): void => {
    const scrollNode = scrollRef.current;

    if (!scrollNode || !reveal || maxScroll <= 0) {
      setFooterRevealProgress(1);
      return;
    }

    const revealStart = Math.max(0, maxScroll - footerHeight);
    const revealEnd = Math.max(revealStart + 1, maxScroll);
    const nextProgress = Math.min(
      1,
      Math.max(0, (scrollNode.scrollTop - revealStart) / (revealEnd - revealStart)),
    );

    setFooterRevealProgress((current) =>
      Math.abs(current - nextProgress) < 0.01 ? current : nextProgress,
    );
  }, [footerHeight, maxScroll, reveal]);

  useEffect(() => {
    const scrollNode = scrollRef.current;
    if (!scrollNode) {
      return;
    }

    let frame = 0;
    const handleScroll = (): void => {
      if (frame !== 0) {
        return;
      }

      frame = window.requestAnimationFrame(() => {
        frame = 0;
        updateFooterRevealProgress();
      });
    };

    updateFooterRevealProgress();
    scrollNode.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      if (frame !== 0) {
        window.cancelAnimationFrame(frame);
      }
      scrollNode.removeEventListener("scroll", handleScroll);
    };
  }, [updateFooterRevealProgress]);

  return (
    <div
      ref={setScrollNode}
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
        <LandingFooter revealProgress={footerRevealProgress} />
      </div>
    </div>
  );
}
