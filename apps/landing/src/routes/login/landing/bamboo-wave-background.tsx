import type { CSSProperties, ReactElement } from "react";

import { RuntimeIcon } from "@/shared/ui/brand-icons";

import { useBambooPhysics } from "./bamboo-physics";
import "./bamboo-wave-background.css";

const COLUMN_COUNT = 18;
const SEGMENT_COUNT = 9;
const SEGMENT_WIDTH = 58;
const SEGMENT_HEIGHT = 46.13;

// The upper piece of the Mosoo mark. Rendering the path directly avoids the
// viewBox/image crop that affected the handoff version's <img> segments.
const BAMBOO_PATH =
  "M45.68,0H0c.83,5.28,1.31,11.5,1.31,18.16S.83,31.04,0,36.32h45.68c-.83-5.28-1.31-11.5-1.31-18.16s.48-12.88,1.31-18.16Z";

const AGENT_RUNTIME_IDS = {
  codex: "openai-runtime",
  claude: "claude-agent-sdk",
  opencode: "opencode",
  minimax: "minimax",
  deepseek: "deepseek",
  hermes: "hermes",
  openai: "openai",
  gemini: "gemini",
  qwen: "qwen",
  kimi: "kimi",
} as const;

export function BambooWaveBackground(): ReactElement {
  const { agents, platformHeights } = useBambooPhysics();

  return (
    <div className="bambooWaveBackground" aria-hidden="true">
      <div className="bambooWaveBackground__wash" />
      <div className="bambooWaveBackground__columns">
        {Array.from({ length: COLUMN_COUNT }, (_, columnIndex) => (
          <div
            className={`bambooWaveBackground__column bambooWaveBackground__column--${platformHeights[columnIndex] ?? 0}`}
            key={columnIndex}
          >
            <div className="bambooWaveBackground__stack-window">
              <div className="bambooWaveBackground__stack">
                {Array.from({ length: SEGMENT_COUNT }, (_, segmentIndex) => (
                  <svg
                    aria-hidden="true"
                    className="bambooWaveBackground__segment"
                    focusable="false"
                    key={segmentIndex}
                    viewBox="0 0 45.68 36.32"
                    width={SEGMENT_WIDTH}
                    height={SEGMENT_HEIGHT}
                  >
                    <path d={BAMBOO_PATH} />
                  </svg>
                ))}
              </div>
            </div>
          </div>
        ))}
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
