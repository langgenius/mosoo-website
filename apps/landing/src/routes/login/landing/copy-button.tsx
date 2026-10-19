import { Check, Copy } from "lucide-react";
import { useRef, useState } from "react";
import type { ReactElement } from "react";

import { cn } from "@/shared/lib/class-names";

import { PHRASE_CLASS, Phrases } from "./ui";

type CopyState = "idle" | "copied" | "failed";

const FEEDBACK_MS = 2400;

async function writeToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // No async clipboard (older browser, insecure context, denied permission):
    // fall back to copying a selected, off-screen textarea.
  }

  const previousFocus = document.activeElement;
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.opacity = "0";
  area.style.pointerEvents = "none";
  document.body.append(area);
  area.select();

  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch {
    copied = false;
  }

  area.remove();
  if (previousFocus instanceof HTMLElement) {
    previousFocus.focus();
  }
  return copied;
}

// Every variant keeps a 44px touch target below the sm breakpoint.
const VARIANT_CLASS = {
  // Long labels (Japanese) may wrap on narrow phones rather than overflow.
  default:
    "border-border-strong bg-paper-50 text-fg-1 hover:bg-paper-200 focus-visible:ring-ring min-h-11 gap-2 px-3.5 py-2 text-left text-[15px] whitespace-normal sm:min-h-10",
  compact:
    "border-border-strong bg-paper-50 text-fg-1 hover:bg-paper-200 focus-visible:ring-ring min-h-11 gap-1.5 px-3 text-[14px] whitespace-nowrap sm:min-h-8 sm:px-2.5",
  // A text button for a secondary path next to the main actions.
  quiet:
    "border-transparent text-green-700 underline decoration-green-700/35 underline-offset-4 hover:text-green-800 hover:decoration-green-800 focus-visible:ring-ring min-h-11 gap-1.5 px-1.5 text-[15px] sm:min-h-9",
  // On the dark code card: the focus ring and the success tick switch to
  // light values so both keep their contrast against ink.
  dark: "border-paper-100/25 bg-paper-100/5 text-paper-100 hover:bg-paper-100/10 focus-visible:ring-paper-100 min-h-11 gap-1.5 px-3 text-[14px] whitespace-nowrap sm:min-h-8 sm:px-2.5",
} as const;

const COPIED_ICON_CLASS = {
  default: "text-green-700",
  compact: "text-green-700",
  quiet: "text-green-700",
  dark: "text-green-300",
} as const satisfies Record<keyof typeof VARIANT_CLASS, string>;

const BUBBLE_CLASS = {
  default: "bg-ink-900 text-paper-100",
  compact: "bg-ink-900 text-paper-100",
  quiet: "bg-ink-900 text-paper-100",
  dark: "bg-paper-100 text-ink-900",
} as const satisfies Record<keyof typeof VARIANT_CLASS, string>;

/**
 * A copy button with visible feedback (a short bubble above the button) and a
 * polite live region, so the result is announced as well as shown. The bubble
 * is absolutely positioned, so feedback never moves the surrounding layout.
 */
export function CopyButton({
  getText,
  label,
  copiedLabel,
  failedLabel,
  variant = "default",
  className,
  onPrepare,
}: {
  /** Return the text synchronously when you can: the clipboard write then
      happens inside the click itself, which strict browsers require. */
  getText: () => string | Promise<string>;
  /** May carry phrase marks (the tp() form of the string). */
  label: string;
  copiedLabel: string;
  failedLabel: string;
  variant?: keyof typeof VARIANT_CLASS;
  className?: string;
  /** Called on hover and focus, e.g. to start loading lazily imported text. */
  onPrepare?: () => void;
}): ReactElement {
  const [state, setState] = useState<CopyState>("idle");
  const timer = useRef<number | undefined>(undefined);

  const showResult = (next: CopyState): void => {
    window.clearTimeout(timer.current);
    setState(next);
    timer.current = window.setTimeout(() => {
      setState("idle");
    }, FEEDBACK_MS);
  };

  const copy = (): void => {
    const text = getText();
    const copied = typeof text === "string" ? writeToClipboard(text) : text.then(writeToClipboard);
    void copied.then(
      (ok) => {
        showResult(ok ? "copied" : "failed");
      },
      () => {
        showResult("failed");
      },
    );
  };

  const message = state === "copied" ? copiedLabel : state === "failed" ? failedLabel : "";

  return (
    <span className={cn("relative inline-flex", className)}>
      <button
        type="button"
        onClick={copy}
        onPointerEnter={onPrepare}
        onFocus={onPrepare}
        className={cn(
          "inline-flex max-w-full items-center justify-center rounded-md border font-semibold transition-colors outline-none focus-visible:ring-2",
          VARIANT_CLASS[variant],
        )}
      >
        {state === "copied" ? (
          <Check aria-hidden="true" className={cn("size-4 shrink-0", COPIED_ICON_CLASS[variant])} />
        ) : (
          <Copy aria-hidden="true" className="size-4 shrink-0" />
        )}
        <span className={PHRASE_CLASS}>
          <Phrases text={label} />
        </span>
      </button>
      {message === "" ? null : (
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute bottom-full left-0 z-20 mb-2 w-max max-w-[18rem] rounded-md px-2.5 py-1.5 text-[13px] leading-[1.4] font-semibold shadow-[var(--shadow-md)]",
            BUBBLE_CLASS[variant],
          )}
        >
          {message}
        </span>
      )}
      <span role="status" className="sr-only">
        {message}
      </span>
    </span>
  );
}
