import type { ReactElement } from "react";

import { MOSOO_CLOUD_URL } from "../links";
import { copy } from "./home-copy";
import { TranscriptCard } from "./transcript-card";

/**
 * 01 Hero: the two-tone serif H1, a lead and one button on the left; on the
 * right the transcript card (U12, 640 wide) runs past the right rail and
 * shows two steps, the second one running. Canvas and type from the
 * instrument proposal (Mintlify's dark column with rails, Supabase's two-tone
 * H1); the card from Enter Code.
 */
export function Hero(): ReactElement {
  const [first, second] = copy.hero.title;

  return (
    <section aria-labelledby="hero-title" className="i-hero">
      <div className="i-hero-copy">
        <h1 id="hero-title" className="i-display i-h1">
          <span>{first}</span> <span className="i-soft">{second}</span>
        </h1>
        <p className="i-lead">{copy.hero.lead}</p>
        <div className="i-actions">
          <a href={MOSOO_CLOUD_URL} className="i-btn">
            {copy.hero.primary}
          </a>
        </div>
      </div>
      <div className="i-hero-object">
        <TranscriptCard
          className="i-term-hero"
          lines={copy.hero.lines}
          windowName={copy.hero.windowName}
        />
      </div>
    </section>
  );
}
