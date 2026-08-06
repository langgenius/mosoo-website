import type { CSSProperties, ReactElement } from "react";

import { RuntimeIcon } from "@/shared/ui/brand-icons";

import { useBambooPhysics } from "./bamboo-physics";
import "./bamboo-wave-background.css";

const COLUMN_COUNT = 36;
const SEGMENT_COUNT = 9;
const SEGMENT_WIDTH = 29;
const SEGMENT_HEIGHT = 23.07;

// The upper piece of the Mosoo mark. Rendering the path directly avoids the
// viewBox/image crop that affected the handoff version's <img> segments.
const BAMBOO_PATH =
  "M45.68,0H0c.83,5.28,1.31,11.5,1.31,18.16S.83,31.04,0,36.32h45.68c-.83-5.28-1.31-11.5-1.31-18.16s.48-12.88,1.31-18.16Z";

function bambooSegmentRandomValue(columnIndex: number, segmentIndex: number): number {
  const random = Math.sin((columnIndex + 1) * 19.17 + (segmentIndex + 1) * 47.31) * 43758.5453;
  return random - Math.floor(random);
}

function bambooSegmentOpacity(columnIndex: number, segmentIndex: number): number {
  const normalized = bambooSegmentRandomValue(columnIndex, segmentIndex);
  const opacityLevels = [0.35, 0.55, 0.75, 1] as const;

  return opacityLevels[Math.min(opacityLevels.length - 1, Math.floor(normalized * opacityLevels.length))]!;
}

function bambooSegmentFilter(columnIndex: number, segmentIndex: number): string {
  const normalized = bambooSegmentRandomValue(columnIndex + 7, segmentIndex + 11);

  return normalized < 0.28 ? "blur(1.25px)" : "none";
}

function bambooSegmentHasStipple(columnIndex: number, segmentIndex: number): boolean {
  return bambooSegmentRandomValue(columnIndex + 23, segmentIndex + 31) < 0.2;
}

const AGENT_RUNTIME_IDS = {
  codex: "openai-runtime",
  claude: "claude-agent-sdk",
  opencode: "opencode",
  deepseek: "deepseek",
  hermes: "hermes",
  openai: "openai",
  gemini: "gemini",
  qwen: "qwen",
} as const;

export function BambooWaveBackground(): ReactElement {
  const { agents, platformHeights } = useBambooPhysics();

  return (
    <div className="bambooWaveBackground" aria-hidden="true">
      <div className="bambooWaveBackground__wash" />
      <div className="bambooWaveBackground__columns">
        {Array.from({ length: COLUMN_COUNT }, (_, columnIndex) => {
          const segmentCount = platformHeights[columnIndex] ?? 0;

          return (
            <div
              className={`bambooWaveBackground__column bambooWaveBackground__column--${segmentCount}`}
              key={columnIndex}
            >
              <div className="bambooWaveBackground__stack-window">
                <div className="bambooWaveBackground__stack">
                  {Array.from({ length: SEGMENT_COUNT }, (_, segmentIndex) => {
                    const isVisible = segmentIndex < segmentCount;
                    const hasStipple = bambooSegmentHasStipple(columnIndex, segmentIndex);
                    const patternId = `bamboo-stipple-${columnIndex}-${segmentIndex}`;
                    const clipPathId = `bamboo-stipple-clip-${columnIndex}-${segmentIndex}`;

                    return (
                      <svg
                        aria-hidden="true"
                        className="bambooWaveBackground__segment"
                        focusable="false"
                        key={segmentIndex}
                        style={{
                          opacity: isVisible ? bambooSegmentOpacity(columnIndex, segmentIndex) : 0,
                          filter: bambooSegmentFilter(columnIndex, segmentIndex),
                        }}
                        viewBox="0 0 45.68 36.32"
                        width={SEGMENT_WIDTH}
                        height={SEGMENT_HEIGHT}
                      >
                        {hasStipple ? (
                          <defs>
                            <pattern
                              id={patternId}
                              width="7"
                              height="7"
                              patternUnits="userSpaceOnUse"
                            >
                              <circle cx="1.5" cy="1.5" r="0.8" fill="white" fillOpacity="0.36" />
                            </pattern>
                            <clipPath id={clipPathId}>
                              <path d={BAMBOO_PATH} />
                            </clipPath>
                          </defs>
                        ) : null}
                        <path d={BAMBOO_PATH} />
                        {hasStipple ? (
                          <rect
                            x="0"
                            y="0"
                            width="45.68"
                            height="36.32"
                            fill={`url(#${patternId})`}
                            clipPath={`url(#${clipPathId})`}
                          />
                        ) : null}
                      </svg>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="bambooWaveBackground__agents">
        {agents.map((agent) => (
          <div
            className="bambooWaveBackground__agent"
            key={agent.id}
            style={
              {
                left: `${agent.x * 100}%`,
                top: `${agent.y * 100}%`,
                transform: `translate(-50%, -50%) rotate(${agent.rotation}rad)`,
              } as CSSProperties
            }
          >
            <RuntimeIcon
              runtimeId={AGENT_RUNTIME_IDS[agent.id as keyof typeof AGENT_RUNTIME_IDS]}
              className="size-full"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
