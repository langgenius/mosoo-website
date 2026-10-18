import type { ReactElement } from "react";

import { cn } from "@/shared/lib/class-names";

import { VENDOR_ICON_URL } from "./vendor-icon-data";

/** A model provider's brand mark. Decorative: render the name next to it. */
export function VendorIcon({
  className,
  vendorId,
  size = 20,
}: {
  className?: string;
  vendorId: string;
  size?: number;
}): ReactElement | null {
  const iconUrl = VENDOR_ICON_URL[vendorId];

  if (iconUrl === undefined) {
    return null;
  }

  return (
    <img
      aria-hidden="true"
      alt=""
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      className={cn("inline-block object-contain", className)}
      src={iconUrl}
    />
  );
}
