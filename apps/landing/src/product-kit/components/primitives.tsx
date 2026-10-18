// Console recipes the moments are built from, ported from langgenius/mosoo
// apps/web/src/shared/ui/{button,badge,copy-check-icon,list-row}.tsx at
// 7cb9866cfc. The console resolves variant overrides with tailwind-merge; the
// website has no tailwind-merge, so each variant and size spells out its full
// class list and no two lists set the same property.

import { clsx } from "clsx";
import type { ButtonHTMLAttributes, ComponentProps, ReactElement, ReactNode } from "react";

import { Check, Copy } from "./icons";

const BUTTON_BASE =
  "inline-flex shrink-0 items-center justify-center gap-1.5 font-medium whitespace-nowrap select-none [&_svg]:pointer-events-none [&_svg]:shrink-0";

// What only a live control has: transitions, the focus ring, disabled and busy
// cursors. A drawn control (a picture of a button) leaves all of it out.
const BUTTON_INTERACTIVE =
  "outline-none transition-[background-color,border-color,color,box-shadow] duration-150 ease-out focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:cursor-not-allowed aria-busy:cursor-progress";

const BUTTON_SIZE = {
  default: "h-8 rounded-md px-3 text-[13px] has-[>svg]:px-2.5 [&_svg:not([class*='size-'])]:size-4",
  "icon-sm": "size-7 rounded-sm [&_svg:not([class*='size-'])]:size-4",
  "icon-xs": "size-6 rounded-sm [&_svg:not([class*='size-'])]:size-3",
  lg: "h-9 rounded-md px-4 text-[14px] has-[>svg]:px-3.5 [&_svg:not([class*='size-'])]:size-4",
  sm: "h-7 rounded-sm px-2.5 text-[12.5px] has-[>svg]:px-2 [&_svg:not([class*='size-'])]:size-4",
  xs: "h-6 rounded-sm px-2 text-[12px] has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
} as const;

// `pill` is the console's className="rounded-full" on round icon buttons.
const BUTTON_PILL_SIZE = {
  "icon-sm": "size-7 rounded-full [&_svg:not([class*='size-'])]:size-4",
  "icon-xs": "size-6 rounded-full [&_svg:not([class*='size-'])]:size-3",
} as const;

// `rest` is how the variant looks; `states` is its hover, pressed and disabled
// looks, which only a live control gets.
const BUTTON_VARIANT = {
  default: {
    rest: "border border-primary-border bg-primary text-primary-foreground",
    states:
      "hover:bg-primary-hover active:bg-primary-active disabled:border-transparent disabled:bg-paper-300 disabled:text-fg-3",
  },
  ghost: {
    rest: "text-fg-2",
    states: "hover:bg-hover hover:text-fg-1 active:bg-pressed disabled:bg-transparent disabled:text-fg-muted",
  },
  "ghost-quiet": {
    rest: "text-fg-3",
    states: "hover:bg-hover hover:text-fg-1 active:bg-pressed disabled:bg-transparent disabled:text-fg-muted",
  },
  outline: {
    rest: "border border-border-strong bg-card text-fg-1",
    states:
      "hover:bg-paper-100 active:bg-paper-200 disabled:border-border-soft disabled:bg-paper-100 disabled:text-fg-muted",
  },
} as const;

export type ButtonVariant = keyof typeof BUTTON_VARIANT;
export type ButtonSize = keyof typeof BUTTON_SIZE;

export function buttonClassName({
  className,
  drawn = false,
  pill = false,
  size = "default",
  variant = "default",
}: {
  className?: string | undefined;
  /** A picture of the console's control: same look, no hover, pressed or focus states. */
  drawn?: boolean;
  pill?: boolean;
  size?: ButtonSize;
  variant?: ButtonVariant;
}): string {
  const sizeClass =
    pill && (size === "icon-sm" || size === "icon-xs") ? BUTTON_PILL_SIZE[size] : BUTTON_SIZE[size];
  const look = BUTTON_VARIANT[variant];

  return clsx(
    BUTTON_BASE,
    drawn ? null : BUTTON_INTERACTIVE,
    sizeClass,
    look.rest,
    drawn ? null : look.states,
    className,
  );
}

export function Button({
  className,
  pill,
  size,
  variant,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  pill?: boolean;
  size?: ButtonSize;
  variant?: ButtonVariant;
}): ReactElement {
  return (
    <button
      data-slot="button"
      className={buttonClassName({ className, pill: pill ?? false, size: size ?? "default", variant: variant ?? "default" })}
      type={type}
      {...props}
    />
  );
}

const BADGE_BASE =
  "inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 rounded-sm border px-2 text-[11.5px] leading-none font-semibold tracking-[0.01em] whitespace-nowrap transition-[background-color,color] duration-150 ease-out [&>svg]:pointer-events-none [&>svg]:size-3 [&>svg]:shrink-0";

const BADGE_VARIANT = {
  brand: "border-transparent bg-brand-soft text-brand",
  danger: "border-transparent bg-danger-bg text-danger-fg",
  default: "border-transparent bg-paper-200 text-fg-2",
  info: "border-transparent bg-info-bg text-info-fg",
  outline: "border-border-strong bg-card text-fg-2",
  pending: "border-transparent bg-pending-bg text-pending-fg",
  soil: "border-transparent bg-soil-bg text-soil-fg",
  success: "border-transparent bg-success-bg text-success-fg",
  warning: "border-transparent bg-warning-bg text-warning-fg",
} as const;

export type BadgeVariant = keyof typeof BADGE_VARIANT;

export function Badge({
  children,
  className,
  variant = "default",
  ...props
}: ComponentProps<"span"> & { variant?: BadgeVariant }): ReactElement {
  return (
    <span
      data-slot="badge"
      data-variant={variant}
      className={clsx(BADGE_BASE, BADGE_VARIANT[variant], className)}
      {...props}
    >
      {children}
    </span>
  );
}

/** copy-check-icon.tsx: copy and check stacked in one cell, cross-fading. */
export function CopyCheckIcon({
  className,
  copied,
}: {
  className?: string;
  copied: boolean;
}): ReactElement {
  return (
    <span className={clsx("grid shrink-0 *:col-start-1 *:row-start-1", className ?? "size-3.5")}>
      <Copy
        className={clsx(
          "size-full transition-[opacity,scale] duration-(--dur-1) ease-(--console-ease-out)",
          copied ? "scale-75 opacity-0" : "scale-100 opacity-100",
        )}
      />
      <Check
        className={clsx(
          "size-full transition-[opacity,scale] duration-(--dur-1) ease-(--console-ease-out)",
          copied ? "scale-100 opacity-100" : "scale-75 opacity-0",
        )}
      />
    </span>
  );
}

/** list-row.tsx DataRow, tinted (inside a card) or flat (inside a RowList). */
export function DataRow({
  children,
  className,
  tone = "flat",
}: {
  children: ReactNode;
  className?: string;
  tone?: "flat" | "tinted";
}): ReactElement {
  return (
    <div
      data-slot="data-row"
      className={clsx(
        "flex min-h-10 items-center gap-3 px-3 py-2 text-[13px] transition-[background-color] duration-150 ease-out",
        tone === "tinted" ? "rounded-sm bg-sunken" : null,
        className,
      )}
    >
      {children}
    </div>
  );
}

/** MonoText: 12.5px mono, tabular figures. */
export function MonoText({ className, ...props }: ComponentProps<"span">): ReactElement {
  return (
    <span data-slot="mono" className={clsx("font-mono text-[12.5px] tabular-nums", className)} {...props} />
  );
}
