// Geometry and label sizes of the KeyBoundary diagram. Kept apart from the
// component, with no runtime imports, so tests/product-kit.test.mjs can check
// for every island width that the labels render at 12px or more.
//
// The diagram is SVG scaled to its card, so a label renders at
// LABEL_SIZE × (rendered width / viewBox width). Two layouts keep that scale
// near 1: WIDE from a 47rem (752px) island, where it is at least 0.9×, and
// NARROW below, capped at 380px wide so it never grows past 1.06×. With the
// smallest label at 13.5 units, labels stay at 12px or more for islands of
// 354px and wider (a 390px phone with 16px gutters gives 358px), and at
// 16.4px or less.

export type Point = readonly [number, number];

export interface Box {
  readonly h: number;
  readonly w: number;
  readonly x: number;
  readonly y: number;
}

export interface Layout {
  readonly arrows: {
    readonly llmIn: readonly Point[];
    readonly llmOut: readonly Point[];
    readonly mcpIn: readonly Point[];
    readonly mcpOut: readonly Point[];
    readonly vaultToLlm: readonly Point[];
    readonly vaultToMcp: readonly Point[];
  };
  readonly boundary: { readonly from: Point; readonly label: Point; readonly to: Point };
  readonly boxes: {
    readonly driver: Box;
    readonly env: Box;
    readonly harness: Box;
    readonly llm: Box;
    readonly mcp: Box;
    readonly mcpServer: Box;
    readonly provider: Box;
    readonly sandbox: Box;
    readonly vault: Box;
    readonly workdir: Box;
    readonly worker: Box;
  };
  readonly grant: { readonly anchor: "end" | "start"; readonly point: Point };
  readonly height: number;
  readonly labelAnchor: "middle" | "start";
  readonly sandboxLabel: Point;
  readonly width: number;
  readonly workerLabel: Point;
}

/** Label sizes in SVG units; the rendered size is this times the diagram's scale. */
export const LABEL_SIZE = {
  /** Code-like labels: harness, the working-directory files. */
  mono: 13.5,
  /** Secondary lines under a box title. */
  note: 13.5,
  /** Box titles. */
  label: 14,
  /** The two region titles: Session sandbox, mosoo Worker. */
  title: 14.5,
} as const;

/** How the card fits the diagram; mirrors the classes in key-boundary.tsx. */
export const FIT = {
  /** The card's border. */
  borderPx: 1,
  /** The card's padding: p-4, and p-6 from a 36rem island (@xl). */
  paddingPx: 16,
  paddingWidePx: 24,
  paddingWideFromPx: 576,
  /** max-w-[380px] on the narrow diagram. */
  narrowMaxPx: 380,
  /** max-w-[880px] on the wide diagram. */
  wideMaxPx: 880,
  /** The wide layout from a 47rem island (@min-[47rem]). */
  wideFromPx: 752,
} as const;

/** The smallest island, in CSS pixels, at which every label renders at 12px or more. */
export const MIN_READABLE_ISLAND_PX = 354;

// Wide: sandbox, boundary, Worker, upstreams left to right.
export const WIDE: Layout = {
  arrows: {
    llmIn: [
      [265, 72],
      [356, 72],
    ],
    llmOut: [
      [592, 72],
      [620, 72],
    ],
    mcpIn: [
      [265, 84],
      [298, 84],
      [298, 278],
      [356, 278],
    ],
    mcpOut: [
      [592, 278],
      [620, 278],
    ],
    vaultToLlm: [
      [474, 136],
      [474, 98],
    ],
    vaultToMcp: [
      [474, 216],
      [474, 252],
    ],
  },
  boundary: { from: [316, 24], label: [316, 352], to: [316, 334] },
  boxes: {
    driver: { h: 40, w: 120, x: 145, y: 52 },
    env: { h: 60, w: 248, x: 17, y: 248 },
    harness: { h: 40, w: 120, x: 17, y: 52 },
    llm: { h: 52, w: 236, x: 356, y: 46 },
    mcp: { h: 52, w: 236, x: 356, y: 252 },
    mcpServer: { h: 52, w: 158, x: 620, y: 252 },
    provider: { h: 52, w: 158, x: 620, y: 46 },
    sandbox: { h: 296, w: 280, x: 1, y: 28 },
    vault: { h: 80, w: 236, x: 356, y: 136 },
    workdir: { h: 92, w: 248, x: 17, y: 140 },
    worker: { h: 296, w: 268, x: 340, y: 28 },
  },
  grant: { anchor: "start", point: [17, 118] },
  height: 364,
  labelAnchor: "start",
  sandboxLabel: [1, 16],
  width: 780,
  workerLabel: [340, 16],
};

// Narrow: the same parts stacked, the Driver at the sandbox's lower edge so
// both calls go straight down through the boundary.
export const NARROW: Layout = {
  arrows: {
    llmIn: [
      [60, 332],
      [60, 424],
    ],
    llmOut: [
      [16, 450],
      [8, 450],
      [8, 674],
      [16, 674],
    ],
    mcpIn: [
      [300, 332],
      [300, 424],
    ],
    mcpOut: [
      [344, 450],
      [352, 450],
      [352, 674],
      [344, 674],
    ],
    vaultToLlm: [
      [92, 508],
      [92, 476],
    ],
    vaultToMcp: [
      [268, 508],
      [268, 476],
    ],
  },
  boundary: { from: [1, 372], label: [180, 377], to: [359, 372] },
  boxes: {
    driver: { h: 40, w: 328, x: 16, y: 292 },
    env: { h: 60, w: 328, x: 16, y: 216 },
    harness: { h: 40, w: 328, x: 16, y: 52 },
    llm: { h: 52, w: 152, x: 16, y: 424 },
    mcp: { h: 52, w: 152, x: 192, y: 424 },
    mcpServer: { h: 52, w: 152, x: 192, y: 648 },
    provider: { h: 52, w: 152, x: 16, y: 648 },
    sandbox: { h: 320, w: 358, x: 1, y: 28 },
    vault: { h: 92, w: 328, x: 16, y: 508 },
    workdir: { h: 92, w: 328, x: 16, y: 108 },
    worker: { h: 208, w: 358, x: 1, y: 408 },
  },
  grant: { anchor: "end", point: [332, 316] },
  height: 712,
  labelAnchor: "middle",
  sandboxLabel: [180, 16],
  width: 360,
  workerLabel: [180, 400],
};

/** Which layout an island of this width shows, and at what scale. */
export function fitDiagram(islandPx: number): { layout: "narrow" | "wide"; scale: number } {
  const padding = islandPx >= FIT.paddingWideFromPx ? FIT.paddingWidePx : FIT.paddingPx;
  const inner = islandPx - 2 * (padding + FIT.borderPx);

  if (islandPx >= FIT.wideFromPx) {
    return { layout: "wide", scale: Math.min(inner, FIT.wideMaxPx) / WIDE.width };
  }

  return { layout: "narrow", scale: Math.min(inner, FIT.narrowMaxPx) / NARROW.width };
}
