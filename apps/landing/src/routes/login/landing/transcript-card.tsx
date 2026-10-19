import type { ReactElement } from "react";

import { GLYPH_REST_FRAME, mountGlyphFrames } from "@/effects/glyph-frames";
import { cn } from "@/shared/lib/class-names";

import type { TranscriptLine } from "./home-copy";

/**
 * UI-FORMS U12, the transcript card: a dark terminal window whose verbs are
 * bright, arguments grey and results greyer, after Enter Code's feature card
 * (refs/devices/crops/enter-code-transcript-card.jpg). The running line has a
 * 2px lime bar and braille frames (Ploy's glyph icons), the card's only
 * colour. Stage cards carry the [data-at] marks the stage engine reads; the
 * markup is the end state (every line printed, the last one current).
 */
export function TranscriptCard({
  className,
  lines,
  staged = false,
  windowName,
}: {
  className?: string;
  lines: readonly TranscriptLine[];
  staged?: boolean;
  windowName: string;
}): ReactElement {
  const lastIndex = lines.length - 1;

  return (
    <figure
      data-product-ui=""
      translate="no"
      className={cn("i-term", className)}
      aria-label={windowName}
    >
      <div className="i-term-bar" aria-hidden="true">
        <span className="i-term-dots">
          <i />
          <i />
          <i />
        </span>
        <span className="i-term-name">{windowName}</span>
      </div>
      <div className="i-term-body">
        <ol className="i-term-track" data-stage-track={staged ? "" : undefined}>
          {lines.map((line, index) => {
            const current = index === lastIndex;
            const stageMarks = staged
              ? { "data-at": line.at, "data-ruler-at": line.rulerAt }
              : {};
            if (line.kind === "gap") {
              return (
                <li
                  key={index}
                  className="i-term-gap"
                  aria-hidden="true"
                  {...stageMarks}
                />
              );
            }
            if (line.kind === "prompt") {
              return (
                <li
                  key={index}
                  className="i-term-prompt"
                  data-current={current ? "" : undefined}
                  {...stageMarks}
                >
                  {line.text}
                </li>
              );
            }
            return (
              <li
                key={index}
                className="i-term-step"
                data-current={current ? "" : undefined}
                {...stageMarks}
              >
                <span className="i-term-call">
                  <span className="i-term-verb">{line.verb}</span>{" "}
                  <span className="i-term-arg">{line.arg}</span>
                  <span
                    className="i-term-glyph"
                    aria-hidden="true"
                    ref={(element) =>
                      element ? mountGlyphFrames(element) : undefined
                    }
                  >
                    {GLYPH_REST_FRAME}
                  </span>
                </span>
                {line.result === undefined ? null : (
                  <span className="i-term-result">{line.result}</span>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </figure>
  );
}
