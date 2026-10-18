import "../console-island.css";

import { clsx } from "clsx";
import { createContext, useCallback, useContext, useRef, useState } from "react";
import type { CSSProperties, ReactElement, ReactNode, Ref } from "react";

import type { KitLocale } from "../i18n";
import { consoleText, kitText, withSubject } from "../i18n";
import { RotateCcw } from "./icons";
import { Badge, Button } from "./primitives";

const HTML_LANG = { en: "en", ja: "ja", zh: "zh-CN" } as const satisfies Record<KitLocale, string>;

// How long a status message stays in the live region.
const ANNOUNCE_MS = 1500;

/** Props every product moment takes. */
export interface MomentProps {
  locale: KitLocale;
  /** Replay the moment's last step once when first half visible (never with reduced motion). */
  animate?: boolean | undefined;
  /**
   * Take turns with the page's other replays (default true). Set false only
   * where a direction pairs two moments on purpose.
   */
  exclusive?: boolean | undefined;
  /** Render the replay frozen at this many milliseconds (stills, docs, tests). */
  replayAt?: number | undefined;
  /**
   * CSS zoom on the island root (default 1). 1.2 or more in a hero, so the
   * console's 10px chips read at 12px or more.
   */
  scale?: number | undefined;
}

const AnnounceContext = createContext<(message: string) => void>(() => {});

/**
 * Speak a short status (a copy result) through the island's polite live
 * region. Controls keep their accessible names; the region says what happened.
 */
export function useAnnounce(): (message: string) => void {
  return useContext(AnnounceContext);
}

/**
 * The scope every product moment renders in. Tokens, type and utilities come
 * from console-island.css and stop at this element. `lang` follows the
 * moment's locale, so the console's CJK font stack and Japanese line
 * breaking apply even when the page language differs. `scale` sets CSS zoom
 * on the root, so a moment can be shown larger without changing its 4px grid.
 * `data-replaying` is present while the moment's replay runs.
 */
export function ConsoleIsland({
  children,
  className,
  label,
  locale,
  replaying = false,
  rootRef,
  scale,
}: {
  children: ReactNode;
  className?: string | undefined;
  label?: string | undefined;
  locale: KitLocale;
  replaying?: boolean | undefined;
  rootRef?: Ref<HTMLDivElement> | undefined;
  scale?: number | undefined;
}): ReactElement {
  const [message, setMessage] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const announce = useCallback((text: string): void => {
    if (timer.current !== null) {
      clearTimeout(timer.current);
    }

    // Empty the region first, so the same message twice in a row is read twice.
    setMessage("");
    timer.current = setTimeout(() => {
      setMessage(text);
      timer.current = setTimeout(() => {
        setMessage("");
        timer.current = null;
      }, ANNOUNCE_MS);
    }, 50);
  }, []);

  const style: CSSProperties | undefined = scale === undefined || scale === 1 ? undefined : { zoom: scale };

  return (
    <div
      aria-label={label}
      className={className}
      data-replaying={replaying ? "" : undefined}
      data-surface="console"
      lang={HTML_LANG[locale]}
      ref={rootRef}
      role={label === undefined ? undefined : "group"}
      style={style}
    >
      <AnnounceContext value={announce}>{children}</AnnounceContext>
      <span aria-live="polite" className="sr-only" role="status">
        {message}
      </span>
    </div>
  );
}

/** The outline "Example values" badge, set next to the data it qualifies. */
export function ExampleValues({
  className,
  locale,
}: {
  className?: string | undefined;
  locale: KitLocale;
}): ReactElement {
  return (
    <Badge className={className} variant="outline">
      {kitText(locale, "exampleValues")}
    </Badge>
  );
}

/** The Replay control, under the moment, while a replay is possible. */
export function ReplayControl({
  canReplay,
  locale,
  moment,
  onReplay,
}: {
  canReplay: boolean;
  locale: KitLocale;
  /** The moment's name, so every Replay button on a page has its own. */
  moment: string;
  onReplay: () => void;
}): ReactElement | null {
  if (!canReplay) {
    return null;
  }

  const replay = consoleText(locale, "agent.replay");

  return (
    <div className="mt-2 flex min-h-6 items-center justify-end px-0.5">
      <Button
        aria-label={withSubject(locale, replay, moment)}
        className="gap-1"
        onClick={onReplay}
        size="xs"
        variant="ghost-quiet"
      >
        <RotateCcw className="size-3" />
        {replay}
      </Button>
    </div>
  );
}

export function cx(...values: Parameters<typeof clsx>): string {
  return clsx(values);
}
