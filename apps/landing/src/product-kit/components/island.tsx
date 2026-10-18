import "../console-island.css";

import { clsx } from "clsx";
import type { ReactElement, ReactNode, Ref } from "react";

import type { KitLocale } from "../i18n";
import { consoleText, kitText } from "../i18n";
import { RotateCcw } from "./icons";
import { Button } from "./primitives";

const HTML_LANG = { en: "en", ja: "ja", zh: "zh-CN" } as const satisfies Record<KitLocale, string>;

/**
 * The scope every product moment renders in. Tokens, type and utilities come
 * from console-island.css and stop at this element. `lang` follows the
 * moment's locale, so the console's CJK font stack and Japanese line
 * breaking apply even when the page language differs.
 */
export function ConsoleIsland({
  children,
  className,
  label,
  locale,
  rootRef,
}: {
  children: ReactNode;
  className?: string;
  label?: string;
  locale: KitLocale;
  rootRef?: Ref<HTMLDivElement>;
}): ReactElement {
  return (
    <div
      aria-label={label}
      className={className}
      data-surface="console"
      lang={HTML_LANG[locale]}
      ref={rootRef}
      role={label === undefined ? undefined : "group"}
    >
      {children}
    </div>
  );
}

/** "Example" on the left; the Replay control on the right while one is possible. */
export function KitFooter({
  canReplay,
  locale,
  note,
  onReplay,
}: {
  canReplay: boolean;
  locale: KitLocale;
  note?: string;
  onReplay: () => void;
}): ReactElement {
  return (
    <div className="text-fg-3 mt-2 flex min-h-6 items-center justify-between gap-3 px-0.5 text-[12px] leading-4">
      <span>{note ?? kitText(locale, "example")}</span>
      {canReplay ? (
        <Button className="gap-1" onClick={onReplay} size="xs" variant="ghost-quiet">
          <RotateCcw className="size-3" />
          {consoleText(locale, "agent.replay")}
        </Button>
      ) : null}
    </div>
  );
}

export function cx(...values: Parameters<typeof clsx>): string {
  return clsx(values);
}
