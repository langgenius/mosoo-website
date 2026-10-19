import { useLayoutEffect, useRef, useState } from "react";
import type { ReactElement } from "react";

import { SessionContinuation } from "@/product-kit/components/session-continuation";
import { locale } from "@/shared/locale";

import { t } from "./above-fold-i18n";

// The hero's product stage: the console's own continuation view (product kit,
// PM-02, the CSV story) in one shell, on the halftone bamboo plate. Beside the
// shell runs the Session drawn as a bamboo culm, measured against the kit's
// turn cards: turn 1 is one internode closed by a committed node, the seven
// idle days are a dashed internode (the sandbox was reclaimed), and turn 2
// grows on from the restored checkpoint to its own committed node.

type CulmLayout = {
  readonly turn1Top: number;
  readonly turn1Bottom: number;
  readonly turn2Top: number;
  readonly turn2Bottom: number;
};

// Culm width and the node proportions of the mosoo mark (internode, gap,
// ring), with the ring thickened optically. 20px wide, so the culm reads as
// the mechanism and not as a rule (v3; v2a drew it at 14px).
const CULM_WIDTH = 20;
const GAP = 2;
const RING = 4.5;

/** One internode of the mark: straight ends, sides pinched at mid-height. */
function internodePath(x: number, y: number, width: number, height: number): string {
  const pinch = 0.0287 * width;
  const near = 0.0182 * width;
  const right = x + width;
  const bottom = y + height;
  const at = (fraction: number): number => y + fraction * height;
  return [
    `M${right} ${y}H${x}`,
    `C${x + near} ${at(0.1454)} ${x + pinch} ${at(0.3166)} ${x + pinch} ${at(0.5)}`,
    `S${x + near} ${at(0.8546)} ${x} ${bottom}`,
    `H${right}`,
    `C${right - near} ${at(0.8546)} ${right - pinch} ${at(0.6834)} ${right - pinch} ${at(0.5)}`,
    `S${right - near} ${at(0.1454)} ${right} ${y}Z`,
  ].join("");
}

function Culm({ layout, height }: { layout: CulmLayout; height: number }): ReactElement {
  const x = 0.5;
  const ring1 = layout.turn1Bottom - RING;
  const ring2 = layout.turn2Bottom - RING;
  const first = { y: layout.turn1Top, h: ring1 - GAP - layout.turn1Top };
  const idle = { y: layout.turn1Bottom + GAP, h: layout.turn2Top - GAP - (layout.turn1Bottom + GAP) };
  const second = { y: layout.turn2Top, h: ring2 - GAP - layout.turn2Top };

  return (
    <svg
      aria-hidden="true"
      className="v2a-culm"
      width={CULM_WIDTH + 1}
      height={height}
      viewBox={`0 0 ${CULM_WIDTH + 1} ${height}`}
    >
      <path className="v2a-culm-internode v2a-culm-step-1" d={internodePath(x, first.y, CULM_WIDTH, first.h)} />
      <rect className="v2a-culm-ring v2a-culm-step-2" x={x} y={ring1} width={CULM_WIDTH} height={RING} rx={0.75} />
      {idle.h > 6 ? (
        <path
          className="v2a-culm-idle v2a-culm-step-3"
          d={internodePath(x, idle.y, CULM_WIDTH, idle.h)}
        />
      ) : null}
      <path className="v2a-culm-internode v2a-culm-step-4" d={internodePath(x, second.y, CULM_WIDTH, second.h)} />
      <rect className="v2a-culm-ring v2a-culm-step-5" x={x} y={ring2} width={CULM_WIDTH} height={RING} rx={0.75} />
    </svg>
  );
}

/** Where the kit's two turn cards sit, relative to the culm's column. */
function measure(column: HTMLElement, island: HTMLElement): CulmLayout | null {
  const cards = island.querySelectorAll<HTMLElement>("section");
  const [turn1, turn2] = [cards.item(0), cards.item(1)];
  if (turn1 === null || turn2 === null) {
    return null;
  }
  const origin = column.getBoundingClientRect().top;
  const one = turn1.getBoundingClientRect();
  const two = turn2.getBoundingClientRect();
  return {
    turn1Top: one.top - origin,
    turn1Bottom: one.bottom - origin,
    turn2Top: two.top - origin,
    turn2Bottom: two.bottom - origin,
  };
}

export function HeroStage(): ReactElement {
  const column = useRef<HTMLDivElement>(null);
  const island = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<{ culm: CulmLayout; height: number } | null>(null);

  // Measure before paint, then again whenever the shell reflows (width,
  // font arrival), so the nodes stay on the cards in every locale.
  useLayoutEffect(() => {
    const columnElement = column.current;
    const islandElement = island.current;
    if (columnElement === null || islandElement === null) {
      return;
    }
    const update = (): void => {
      const culm = measure(columnElement, islandElement);
      if (culm !== null) {
        setLayout({ culm, height: columnElement.getBoundingClientRect().height });
      }
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(islandElement);
    return () => observer.disconnect();
  }, []);

  return (
    <figure className="v2a-stage" aria-label={t("The same Session, seven days apart")}>
      <img
        className="v2a-stage-plate"
        src="/landing/bamboo/bamboo-plate-paper-2400.png"
        srcSet="/landing/bamboo/bamboo-plate-paper-1200.png 1200w, /landing/bamboo/bamboo-plate-paper-2400.png 2400w"
        sizes="(max-width: 1023px) calc(100vw - 32px), 56vw"
        width={2400}
        height={1500}
        alt=""
        decoding="async"
      />
      <div className="v2a-shell">
        <div ref={column} className="v2a-culm-column">
          {layout === null ? null : <Culm layout={layout.culm} height={layout.height} />}
        </div>
        <div ref={island} className="min-w-0">
          <SessionContinuation locale={locale} stage />
        </div>
      </div>
      <figcaption className="v2a-stage-caption">
        <strong>{t("Example values.")}</strong>{" "}
        {t("A CSV analysis, continued seven days later in the same Session; the day markers annotate a console Thread.")}{" "}
        <span className="v2a-stage-caption-fact">{t("API Sessions have no inactivity deadline.")}</span>
      </figcaption>
    </figure>
  );
}
