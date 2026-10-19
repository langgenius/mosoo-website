import type { ReactElement } from "react";

import { cn } from "@/shared/lib/class-names";

import { RUNTIME_ICON_URL } from "./runtime-icon-data";

export { hasRuntimeIcon } from "./runtime-icon-data";

/** A runtime's brand mark. Decorative: render the runtime's name next to it. */
export function RuntimeIcon({
  className,
  runtimeId,
  size = 20,
  loading = "lazy",
}: {
  className?: string;
  runtimeId: string;
  size?: number;
  /** "eager" for marks in the first viewport. */
  loading?: "lazy" | "eager";
}): ReactElement | null {
  const iconUrl = RUNTIME_ICON_URL[runtimeId];

  if (iconUrl === undefined) {
    return null;
  }

  return (
    <img
      aria-hidden="true"
      alt=""
      width={size}
      height={size}
      loading={loading}
      decoding="async"
      className={cn("inline-block object-contain", className)}
      src={iconUrl}
    />
  );
}
