import type { ReactElement, ReactNode } from "react";

import { kitText } from "@/product-kit/i18n";
import { cn } from "@/shared/lib/class-names";
import { locale } from "@/shared/locale";

import { stageHeadingStyle } from "./typography";

// The one stage system of the v2c home page: every product moment sits on
// the same pixel bamboo plate (scripts/brand-assets job plate-pixel, console
// greys, no lime), in one framed window, with a caption under it.

const PLATE = "/landing/bamboo/bamboo-plate-pixel";



export function PixelPlate({
  sizes,
  accent = false,
  lazy = false,
}: {
  sizes: string;
  /** Light the one lime node ring (only where nothing else in view is lime). */
  accent?: boolean;
  lazy?: boolean;
}): ReactElement {
  const loading = lazy ? "lazy" : undefined;
  return (
    <>
      <img
        className="stage-plate"
        src={`${PLATE}-2400.png`}
        srcSet={`${PLATE}-1200.png 1200w, ${PLATE}-2400.png 2400w`}
        sizes={sizes}
        width={2400}
        height={1500}
        alt=""
        decoding="async"
        loading={loading}
      />
      {accent ? (
        <img
          className="stage-plate stage-accent"
          src={`${PLATE}-accent-2400.png`}
          srcSet={`${PLATE}-accent-1200.png 1200w, ${PLATE}-accent-2400.png 2400w`}
          sizes={sizes}
          width={2400}
          height={1500}
          alt=""
          decoding="async"
          loading={loading}
        />
      ) : null}
    </>
  );
}

/** "Example values" at the head of a caption, in the caption's own size. */
export function ExampleBadge(): ReactElement {
  return <span className="text-ink-900 font-semibold whitespace-nowrap">{kitText(locale, "exampleValues")}</span>;
}

export function StageFigure({
  children,
  caption,
  example = true,
  sizes,
  accent = false,
  className,
  // Phones give the island the whole frame (the kit's narrow layouts are
  // measured from a 354px island); the plate shows from 640px.
  padClassName = "p-0 sm:p-6 lg:p-8",
  windowClassName,
  zoomClassName = "stage-zoom",
}: {
  children: ReactNode;
  caption?: string;
  example?: boolean;
  sizes: string;
  accent?: boolean;
  className?: string;
  padClassName?: string;
  windowClassName?: string;
  /** stage-zoom everywhere; stage-zoom-wide only from 768px (the key boundary). */
  zoomClassName?: string;
}): ReactElement {
  return (
    <figure className={cn("m-0 min-w-0", className)}>
      <div className={cn("stage", padClassName)}>
        <PixelPlate sizes={sizes} accent={accent} lazy />
        <div className={cn("stage-window overflow-hidden", zoomClassName, windowClassName)}>{children}</div>
      </div>
      {caption === undefined ? null : (
        <figcaption className="text-ink-500 mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[16px] leading-[1.5]">
          {example ? <ExampleBadge /> : null}
          <span>{caption}</span>
        </figcaption>
      )}
    </figure>
  );
}

export function StageHeading({
  id,
  children,
  className,
}: {
  id: string;
  children: ReactNode;
  className?: string;
}): ReactElement {
  return (
    <h2 id={id} className={cn("stage-heading text-ink-900 [text-wrap:balance]", className)} style={stageHeadingStyle}>
      {children}
    </h2>
  );
}

/** Body copy next to a stage: 18px, the page's secondary ink. */
export function Lede({ children, className }: { children: ReactNode; className?: string }): ReactElement {
  return (
    <p className={cn("text-ink-600 mt-4 max-w-[34em] text-[18px] leading-[1.6] [text-wrap:pretty]", className)}>
      {children}
    </p>
  );
}

/** A quieter supporting fact under the lede, with a hairline rule above. */
export function Fact({ children, className }: { children: ReactNode; className?: string }): ReactElement {
  return (
    <p
      className={cn(
        "border-border-strong text-ink-500 mt-6 max-w-[34em] border-t pt-4 text-[16px] leading-[1.6] [text-wrap:pretty]",
        className,
      )}
    >
      {children}
    </p>
  );
}
