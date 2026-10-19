import type { ReactElement } from "react";

import {
  NESTED_BASE,
  NESTED_INNER,
  NESTED_PATHS,
  NESTED_VIEWBOX,
} from "@/shared/brand/outline-paths";

// Quieter than brand/outline §d's 22/40/100%: the inner 1px line was the
// brightest shape on the page (UI review P2-7), so the outline reads as a
// place, not a logo.
const OPACITY = { 0: 0.64, 1: 0.32, 2: 0.18 } as const;

/**
 * The page end: the logo outline at its one large size (three nested
 * windows, 18% / 32% / 64%), the inner window lit from below (study S6,
 * brand/outline/studies/s6-dark-glow.png), standing on its line with one 7px
 * live dot, the page's only green on an outline. Under the line, one quiet
 * status row (Forge's live strip, issue #99): an event name and a state.
 */
export function PageEnd({
  event,
  status,
}: {
  event: string;
  status: string;
}): ReactElement {
  const midX = NESTED_VIEWBOX.width / 2;
  const baseY = Number(
    / ([\d.]+)H/.exec(NESTED_BASE)?.[1] ?? NESTED_VIEWBOX.height - 1,
  );

  return (
    <div className="i-end">
      <div className="i-end-figure">
        <svg
          className="i-end-outline"
          viewBox={`0 0 ${NESTED_VIEWBOX.width} ${NESTED_VIEWBOX.height}`}
          aria-hidden="true"
        >
          <defs>
            <radialGradient
              id="i-end-glow"
              gradientUnits="userSpaceOnUse"
              cx={NESTED_INNER.x + NESTED_INNER.width / 2}
              cy={NESTED_INNER.y + NESTED_INNER.height}
              r={NESTED_INNER.width * 0.62}
            >
              <stop offset="0" stopColor="currentColor" stopOpacity="0.2" />
              <stop offset="1" stopColor="currentColor" stopOpacity="0" />
            </radialGradient>
          </defs>
          {NESTED_PATHS.map((shape) => (
            <path
              key={shape.level}
              d={shape.d}
              fill={shape.level === 0 ? "url(#i-end-glow)" : "none"}
              stroke="currentColor"
              strokeOpacity={OPACITY[shape.level]}
              vectorEffect="non-scaling-stroke"
            />
          ))}
          <path
            d={NESTED_BASE}
            stroke="currentColor"
            strokeOpacity="0.34"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <span
          className="i-end-dot"
          style={{
            left: `${(midX / NESTED_VIEWBOX.width) * 100}%`,
            top: `${(baseY / NESTED_VIEWBOX.height) * 100}%`,
          }}
        />
      </div>
      <p className="i-end-status">
        <code translate="no">{event}</code> {status}
      </p>
    </div>
  );
}
