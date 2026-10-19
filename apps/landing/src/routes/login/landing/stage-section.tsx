import type { ReactElement } from "react";

import { mountTranscriptStage } from "@/effects/transcript-stage";

import { copy } from "./home-copy";
import { Bracketed } from "./instrument-ui";
import { TranscriptCard } from "./transcript-card";

// Places of the five long ticks on the ruler (UI-FORMS U14: a log scale).
const TICKS = [0, 0.22, 0.44, 0.7, 0.96] as const;

/**
 * 02 The signature: a pinned stage (240vh runway on wide screens) where the
 * transcript prints line by line and the dot on the vertical time ruler
 * (U14) walks from +0 to +7 days. The ruler's spine is dashed from +1 hour to
 * +7 days: the sandbox was reclaimed, the Session kept.
 */
export function StageSection(): ReactElement {
  const lastPlace =
    copy.stage.lines[copy.stage.lines.length - 1]?.rulerAt ?? 0.97;

  return (
    <section
      id="session"
      aria-labelledby="stage-title"
      className="i-stage"
      data-stage=""
      ref={(element) => (element ? mountTranscriptStage(element) : undefined)}
    >
      <div className="i-stage-frame" data-stage-frame="">
        <div className="i-stage-grid">
          <div className="i-stage-copy">
            <h2 id="stage-title" className="i-display i-h2">
              <Bracketed lines={copy.stage.title} />
            </h2>
            <p className="i-lead i-stage-lead">{copy.stage.lead}</p>
          </div>
          <div className="i-ruler" data-product-ui="" aria-hidden="true">
            <div className="i-ruler-scale" data-ruler="">
              <span className="i-ruler-spine i-ruler-spine-a" />
              <span className="i-ruler-spine i-ruler-spine-dash" />
              <span className="i-ruler-spine i-ruler-spine-b" />
              {TICKS.map((place, index) => (
                <span
                  key={place}
                  className="i-ruler-tick"
                  style={{ top: `${place * 100}%` }}
                >
                  <span className="i-ruler-label">
                    {copy.stage.ruler[index]}
                  </span>
                </span>
              ))}
              <span
                className="i-ruler-dot"
                data-ruler-dot=""
                style={{ top: `${lastPlace * 100}%` }}
              />
            </div>
          </div>
          <TranscriptCard
            className="i-term-stage"
            lines={copy.stage.lines}
            staged
            windowName={copy.stage.windowName}
          />
        </div>
      </div>
    </section>
  );
}
