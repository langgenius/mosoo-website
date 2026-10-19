// The mosoo mark and its outline system (staging brand/outline/README.md,
// UI-FORMS §d). One shape only: the block drawn as a window (1px line) standing
// on a line. Path data comes from scripts/assets/outline.mjs.

import type { CSSProperties, ReactElement, ReactNode } from "react";

import { OUTLINE_FAQ, OUTLINE_NESTED, OUTLINE_WINDOW } from "./outline-paths.generated";

const INK = "#1a1a1c";

/** The solid monochrome nav mark (block + bar), 20px, currentColor. */
export function LogoMark({ size = 20 }: { size?: number }): ReactElement {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 51.51 51.52" fill="currentColor">
      <path d="M0 0H51.51C50.58 5.95 50.04 12.97 50.04 20.48C50.04 27.99 50.58 35.01 51.51 40.96H0C0.93 35.01 1.47 27.99 1.47 20.48C1.47 12.97 0.93 5.95 0 0Z" />
      <rect x="0" y="44.59" width="51.51" height="6.93" />
    </svg>
  );
}

/**
 * The medium window (U09 centre object): 1px ink outline, the line under it,
 * and whatever fills it (children sit in the block via the portal mask).
 */
export function OutlineWindow({
  className,
  children,
  fill,
}: {
  className?: string;
  children?: ReactNode;
  fill?: ReactNode;
}): ReactElement {
  const [w, h] = OUTLINE_WINDOW.vb;
  return (
    <div className={className} style={{ aspectRatio: `${w} / ${h}` } as CSSProperties}>
      {fill}
      <svg aria-hidden="true" className="d-win-line" viewBox={`0 0 ${w} ${h}`} fill="none" style={{ color: INK }}>
        <path d={OUTLINE_WINDOW.block} stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        <path d={OUTLINE_WINDOW.line} stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      </svg>
      {children}
    </div>
  );
}

/** The page-end nested outline: three hairlines (22% / 40% / 100%). */
export function OutlineNested({ className, children }: { className?: string; children?: ReactNode }): ReactElement {
  const [w, h] = OUTLINE_NESTED.vb;
  const opacities = [0.22, 0.4, 1];
  return (
    <div className={className} style={{ aspectRatio: `${w} / ${h}` } as CSSProperties}>
      {children}
      <svg aria-hidden="true" viewBox={`0 0 ${w} ${h}`} fill="none" style={{ color: INK }}>
        {OUTLINE_NESTED.blocks.map((d, index) => (
          <path
            key={d}
            d={d}
            stroke="currentColor"
            strokeOpacity={opacities[index]}
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        ))}
        <path d={OUTLINE_NESTED.line} stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
}

/** The FAQ row indicator: 10px block, hollow when closed, filled when open (CSS). */
export function FaqIndicator(): ReactElement {
  const [w, h] = OUTLINE_FAQ.vb;
  return (
    <svg aria-hidden="true" className="d-faq-ind" width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <path d={OUTLINE_FAQ.block} stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}
