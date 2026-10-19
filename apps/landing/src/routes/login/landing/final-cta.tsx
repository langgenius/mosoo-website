import { useState } from "react";
import type { ReactElement } from "react";

import { Check, Copy } from "@/shared/ui/console-glyphs";

import { copy } from "./home-copy";

/**
 * 05 Closing (UI-FORMS U06, legend variant, dark, no corner dots): a closing
 * sentence over one card whose label sits in its top border (Enter CLI,
 * refs/devices/crops/enter-cli-legend-prompt-card.jpg) and whose field holds a
 * line to paste into a coding agent (Ploy's closing input card,
 * crops/ploy-final-cta-card-live.jpg). Copy is the conversion.
 */
export function FinalCta(): ReactElement {
  const [copied, setCopied] = useState(false);
  const [first, second] = copy.closing.title;

  const copyPrompt = (): void => {
    void navigator.clipboard?.writeText(copy.closing.prompt).then(() => {
      setCopied(true);
      window.setTimeout(() => {
        setCopied(false);
      }, 1600);
    });
  };

  return (
    <section
      id="start"
      aria-labelledby="start-title"
      className="i-section i-closing"
    >
      <h2 id="start-title" className="i-display i-h-close">
        <span>{first}</span> <span className="i-soft">{second}</span>
      </h2>
      <div className="i-legend-card" data-product-ui="">
        <span className="i-legend">{copy.closing.legend}</span>
        <div className="i-prompt-field">
          <span className="i-prompt-text">{copy.closing.prompt}</span>
          <button
            type="button"
            className="i-btn i-btn-pill"
            onClick={copyPrompt}
            aria-live="polite"
            aria-label={copied ? copy.closing.copied : copy.closing.copy}
          >
            {/* Phones show the console's Copy / Check glyph (U06: the button
                becomes an icon at 390). */}
            {copied ? (
              <Check className="i-btn-icon" aria-hidden />
            ) : (
              <Copy className="i-btn-icon" aria-hidden />
            )}
            <span className="i-btn-label">
              {copied ? copy.closing.copied : copy.closing.copy}
            </span>
          </button>
        </div>
        <p className="i-legend-note">{copy.closing.note}</p>
      </div>
    </section>
  );
}
