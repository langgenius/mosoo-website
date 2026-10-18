// PM-08, the credential boundary. A diagram, not a console screen: the
// console has none. What it draws is langgenius/mosoo SPEC section 5 and
// docs/architecture.md section 4 at 7cb9866cfc: raw provider keys and MCP
// credentials stay in the Worker's vault; the Driver in the Session sandbox
// holds expiring grants and calls the Worker's LLM proxy and MCP proxy, which
// read the credential on every request and add it upstream; Environment
// variables are the exception, readable inside the sandbox
// (docs/prd/environment.md). Two layouts, wide and narrow, switch on the
// island's width so labels stay at least 12px.
// Replay: a model call leaves the Driver, picks up its key at the LLM proxy
// and reaches the provider; then an MCP call does the same with its
// credential.

import { useId } from "react";
import type { ReactElement } from "react";

import type { KitLocale } from "../i18n";
import { consoleText, kitText } from "../i18n";
import { progress, useReplay } from "../lib/replay";
import { ConsoleIsland, KitFooter, cx } from "./island";

export interface KeyBoundaryProps {
  locale: KitLocale;
  /** Send one model call and one MCP call through once when first half visible. */
  animate?: boolean | undefined;
  /** Render the replay frozen at this many milliseconds (stills, docs, tests). */
  replayAt?: number | undefined;
}

const REPLAY_MS = 4400;

type Point = readonly [number, number];

interface Box {
  readonly h: number;
  readonly w: number;
  readonly x: number;
  readonly y: number;
}

interface Layout {
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

// Wide: sandbox, boundary, Worker, upstreams left to right.
const WIDE: Layout = {
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
const NARROW: Layout = {
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

function length(points: readonly Point[]): number {
  let total = 0;
  for (let index = 1; index < points.length; index += 1) {
    const [x1, y1] = points[index - 1] ?? [0, 0];
    const [x2, y2] = points[index] ?? [0, 0];
    total += Math.hypot(x2 - x1, y2 - y1);
  }
  return total;
}

function pointAlong(points: readonly Point[], share: number): Point {
  let remaining = length(points) * Math.min(Math.max(share, 0), 1);

  for (let index = 1; index < points.length; index += 1) {
    const [x1, y1] = points[index - 1] ?? [0, 0];
    const [x2, y2] = points[index] ?? [0, 0];
    const segment = Math.hypot(x2 - x1, y2 - y1);

    if (remaining <= segment) {
      const t = segment === 0 ? 0 : remaining / segment;
      return [x1 + (x2 - x1) * t, y1 + (y2 - y1) * t];
    }

    remaining -= segment;
  }

  return points.at(-1) ?? [0, 0];
}

function pathOf(points: readonly Point[]): string {
  return points.map(([x, y], index) => `${index === 0 ? "M" : "L"}${x} ${y}`).join(" ");
}

function arrowHead(points: readonly Point[]): string {
  const [x2, y2] = points.at(-1) ?? [0, 0];
  const [x1, y1] = points.at(-2) ?? [0, 0];
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const size = 6;
  const left: Point = [x2 - size * Math.cos(angle - 0.45), y2 - size * Math.sin(angle - 0.45)];
  const right: Point = [x2 - size * Math.cos(angle + 0.45), y2 - size * Math.sin(angle + 0.45)];
  return `M${x2} ${y2} L${left[0]} ${left[1]} L${right[0]} ${right[1]} Z`;
}

function BoxRect({ box, className }: { box: Box; className: string }): ReactElement {
  return <rect className={className} height={box.h} rx={4} width={box.w} x={box.x + 0.5} y={box.y + 0.5} />;
}

function Label({
  className,
  point,
  text,
  anchor = "start",
}: {
  anchor?: "end" | "middle" | "start";
  className: string;
  point: Point;
  text: string;
}): ReactElement {
  return (
    <text className={className} textAnchor={anchor} x={point[0]} y={point[1]}>
      {text}
    </text>
  );
}

// Key02Icon's three strokes, drawn at 0.6 scale around a point.
function KeyGlyph({ at, className }: { at: Point; className: string }): ReactElement {
  return (
    <g className={className} transform={`translate(${at[0] - 7.2} ${at[1] - 7.2}) scale(0.6)`}>
      <path
        d="M13.4998 13.5C15.1242 14.1962 15.9365 14.5443 16.7554 14.4351C16.8478 14.4227 16.9396 14.4061 17.0305 14.3852C17.8357 14.2003 18.4742 13.5894 19.7513 12.3676L19.9012 12.2242C20.8695 11.2559 21.3537 10.7717 21.4713 9.78342C21.5889 8.79514 21.3365 8.38218 20.8317 7.55626C20.3833 6.82247 19.7571 5.98593 18.8855 5.11433C18.0139 4.24272 17.1773 3.61654 16.4435 3.16808C15.6176 2.66332 15.2047 2.41094 14.2164 2.52851C13.2281 2.64609 12.7439 3.13027 11.7756 4.09863L11.6322 4.24843C10.4105 5.52557 9.7996 6.16413 9.61466 6.96941C9.59382 7.0602 9.57721 7.1519 9.56489 7.24423C9.45564 8.06322 9.80375 8.87548 10.5 10.5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
      <path
        d="M10.5002 10.499L2.50021 18.4997V21.4997H5.50021V19.4997H7.50021V17.4997H9.50021L13.5002 13.4997"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
      <path d="M17.0002 7L16.0002 8" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth={2} />
    </g>
  );
}

interface Moving {
  readonly dot: Point | null;
  readonly key: Point | null;
}

// Model call 0.15 to 2.2 s, MCP call 2.3 to 4.3 s: to the proxy, the key comes
// up from the vault, then on to the upstream with it.
function movingAt(layout: Layout, elapsed: number | null): Moving {
  if (elapsed === null) {
    return { dot: null, key: null };
  }

  const leg = (start: number, inPath: readonly Point[], vaultPath: readonly Point[], outPath: readonly Point[]): Moving | null => {
    const toProxy = progress(elapsed, start, start + 750);
    const keyUp = progress(elapsed, start + 750, start + 1250);
    const out = progress(elapsed, start + 1250, start + 2000);

    if (elapsed < start || elapsed > start + 2050) {
      return null;
    }

    if (toProxy < 1) {
      return { dot: pointAlong(inPath, toProxy), key: null };
    }

    if (keyUp < 1) {
      return { dot: inPath.at(-1) ?? null, key: pointAlong(vaultPath, keyUp) };
    }

    const at = pointAlong(outPath, out);
    return { dot: at, key: [at[0] + 10, at[1] - 10] };
  };

  return (
    leg(150, layout.arrows.llmIn, layout.arrows.vaultToLlm, layout.arrows.llmOut) ??
    leg(2300, layout.arrows.mcpIn, layout.arrows.vaultToMcp, layout.arrows.mcpOut) ?? {
      dot: null,
      key: null,
    }
  );
}

function Diagram({
  className,
  elapsed,
  layout,
  locale,
}: {
  className: string;
  elapsed: number | null;
  layout: Layout;
  locale: KitLocale;
}): ReactElement {
  const titleId = useId();
  const descId = useId();
  const b = layout.boxes;
  const moving = movingAt(layout, elapsed);
  const center = (box: Box): number => box.x + box.w / 2;
  const t = (key: Parameters<typeof kitText>[1]): string => kitText(locale, key);
  const connectors = [layout.arrows.llmIn, layout.arrows.llmOut, layout.arrows.mcpIn, layout.arrows.mcpOut];

  return (
    <svg
      aria-describedby={descId}
      aria-labelledby={titleId}
      className={cx("mx-auto h-auto w-full max-w-[880px]", className)}
      role="img"
      viewBox={`0 0 ${layout.width} ${layout.height}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title id={titleId}>{t("boundaryTitle")}</title>
      <desc id={descId}>
        {`${t("boundaryProviderKeys")}, ${t("boundaryMcpCredentials")}: ${t("boundaryKeysNote")}. ${t("boundaryLlmProxy")}, ${t("boundaryMcpProxy")}: ${t("boundaryAddsKey")}, ${t("boundaryAddsCredential")}. ${t("boundarySandbox")}: ${t("boundaryGrant")}. ${t("boundaryEnvException")}`}
      </desc>

      <Label
        anchor={layout.labelAnchor}
        className="fill-fg-1 text-[14px] font-semibold"
        point={layout.sandboxLabel}
        text={t("boundarySandbox")}
      />
      <Label
        anchor={layout.labelAnchor}
        className="fill-fg-1 text-[14px] font-semibold"
        point={layout.workerLabel}
        text={t("boundaryWorker")}
      />

      <BoxRect box={b.sandbox} className="fill-sunken stroke-border-strong" />
      <BoxRect box={b.worker} className="fill-paper-100 stroke-border" />

      <BoxRect box={b.harness} className="fill-card stroke-border" />
      <Label
        anchor="middle"
        className="fill-fg-1 font-mono text-[12.5px]"
        point={[center(b.harness), b.harness.y + 24]}
        text={t("boundaryHarness")}
      />
      <BoxRect box={b.driver} className="fill-card stroke-border" />
      <Label
        anchor={layout.grant.anchor === "end" ? "start" : "middle"}
        className="fill-fg-1 text-[13.5px] font-medium"
        point={layout.grant.anchor === "end" ? [b.driver.x + 12, b.driver.y + 24] : [center(b.driver), b.driver.y + 24]}
        text={t("boundaryDriver")}
      />
      <Label
        anchor={layout.grant.anchor}
        className="fill-fg-3 text-[13px]"
        point={layout.grant.point}
        text={t("boundaryGrant")}
      />

      <BoxRect box={b.workdir} className="fill-card stroke-border" />
      <Label
        className="fill-fg-2 text-[13px] font-medium"
        point={[b.workdir.x + 12, b.workdir.y + 22]}
        text={t("boundaryWorkspace")}
      />
      {["input.csv", ".private/nonce", "outputs/"].map((name, index) => (
        <Label
          key={name}
          className="fill-fg-1 font-mono text-[12.5px]"
          point={[b.workdir.x + 12, b.workdir.y + 44 + index * 17]}
          text={name}
        />
      ))}

      <BoxRect box={b.env} className="fill-soil-bg stroke-soil/40" />
      <Label
        className="fill-soil-fg text-[13.5px] font-semibold"
        point={[b.env.x + 12, b.env.y + 24]}
        text={consoleText(locale, "environments.envVars")}
      />
      <Label
        className="fill-soil-fg text-[13px]"
        point={[b.env.x + 12, b.env.y + 44]}
        text={t("boundaryEnvNote")}
      />

      <path
        className="stroke-soil"
        d={pathOf([layout.boundary.from, layout.boundary.to])}
        fill="none"
        strokeDasharray="4 4"
        strokeWidth={1.5}
      />
      {/* A card-coloured halo lets the label sit on the dashed line. */}
      <text
        className="fill-soil-fg stroke-card text-[13px] font-medium"
        paintOrder="stroke"
        strokeLinejoin="round"
        strokeWidth={10}
        textAnchor="middle"
        x={layout.boundary.label[0]}
        y={layout.boundary.label[1]}
      >
        {t("boundaryOutside")}
      </text>

      <BoxRect box={b.llm} className="fill-card stroke-border" />
      <Label
        className="fill-fg-1 text-[13.5px] font-semibold"
        point={[b.llm.x + 12, b.llm.y + 22]}
        text={t("boundaryLlmProxy")}
      />
      <Label className="fill-fg-3 text-[13px]" point={[b.llm.x + 12, b.llm.y + 40]} text={t("boundaryAddsKey")} />

      <BoxRect box={b.mcp} className="fill-card stroke-border" />
      <Label
        className="fill-fg-1 text-[13.5px] font-semibold"
        point={[b.mcp.x + 12, b.mcp.y + 22]}
        text={t("boundaryMcpProxy")}
      />
      <Label
        className="fill-fg-3 text-[13px]"
        point={[b.mcp.x + 12, b.mcp.y + 40]}
        text={t("boundaryAddsCredential")}
      />

      <BoxRect box={b.vault} className="fill-card stroke-border-strong" />
      <KeyGlyph at={[b.vault.x + 22, b.vault.y + 28]} className="text-fg-1" />
      <Label
        className="fill-fg-1 text-[13.5px] font-semibold"
        point={[b.vault.x + 38, b.vault.y + 25]}
        text={t("boundaryProviderKeys")}
      />
      <Label
        className="fill-fg-1 text-[13.5px] font-semibold"
        point={[b.vault.x + 38, b.vault.y + 43]}
        text={t("boundaryMcpCredentials")}
      />
      <Label
        className="fill-fg-3 text-[13px]"
        point={[b.vault.x + 12, b.vault.y + b.vault.h - 14]}
        text={t("boundaryKeysNote")}
      />
      {[layout.arrows.vaultToLlm, layout.arrows.vaultToMcp].map((points, index) => (
        <path
          key={index}
          className="stroke-ink-400"
          d={pathOf(points)}
          fill="none"
          strokeDasharray="2 3"
          strokeWidth={1.25}
        />
      ))}

      <BoxRect box={b.provider} className="fill-card stroke-border" />
      <Label
        anchor="middle"
        className="fill-fg-1 text-[13.5px] font-medium"
        point={[center(b.provider), b.provider.y + 31]}
        text={t("boundaryProvider")}
      />
      <BoxRect box={b.mcpServer} className="fill-card stroke-border" />
      <Label
        anchor="middle"
        className="fill-fg-1 text-[13.5px] font-medium"
        point={[center(b.mcpServer), b.mcpServer.y + 31]}
        text={t("boundaryMcpServer")}
      />

      {connectors.map((points, index) => (
        <g key={index}>
          <path
            className="stroke-ink-400"
            d={pathOf(points)}
            fill="none"
            strokeLinejoin="round"
            strokeWidth={1.25}
          />
          <path className="fill-ink-400" d={arrowHead(points)} />
        </g>
      ))}

      {moving.dot === null ? null : (
        <circle className="fill-brand-mark stroke-card" cx={moving.dot[0]} cy={moving.dot[1]} r={5} strokeWidth={2} />
      )}
      {moving.key === null ? null : <KeyGlyph at={moving.key} className="text-soil-fg" />}
    </svg>
  );
}

export function KeyBoundaryView({
  elapsed,
  locale,
}: {
  elapsed: number | null;
  locale: KitLocale;
}): ReactElement {
  return (
    <div className="border-border bg-card rounded-lg border p-4 @xl:p-6">
      <Diagram className="hidden @2xl:block" elapsed={elapsed} layout={WIDE} locale={locale} />
      <Diagram className="block @2xl:hidden" elapsed={elapsed} layout={NARROW} locale={locale} />
      <p className="text-fg-2 mt-4 text-[13px] leading-5">
        <span className="text-soil-fg font-semibold">{consoleText(locale, "environments.envVars")}</span>{" "}
        {kitText(locale, "boundaryEnvException")}
      </p>
    </div>
  );
}

export function KeyBoundary({ animate = false, locale, replayAt }: KeyBoundaryProps): ReactElement {
  const replay = useReplay({ animate, durationMs: REPLAY_MS, replayAt });

  return (
    <ConsoleIsland locale={locale} rootRef={replay.ref}>
      <KeyBoundaryView elapsed={replay.elapsed} locale={locale} />
      <KitFooter canReplay={replay.canReplay} locale={locale} onReplay={replay.replay} />
    </ConsoleIsland>
  );
}
