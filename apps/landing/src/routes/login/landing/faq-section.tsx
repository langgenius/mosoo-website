import type { ReactElement } from "react";

import { FAQ_INDICATOR } from "@/shared/brand/outline-paths";

import { copy } from "./home-copy";
import { Bracketed } from "./instrument-ui";

/**
 * 04 FAQ (UI-FORMS U16, dark skin): Retool's two-column FAQ (issue #134,
 * refs/devices/crops/issue-134-faq-split-retool.jpg) between the page rails.
 * The +/− is the logo outline's smallest place: a 10x8 window that fills and
 * steps 10px left when its row opens (Enter Pro's .faq-item__dot). Native
 * <details name="faq">, first one open; answers stay in the DOM.
 */
export function FaqSection(): ReactElement {
  return (
    <section id="faq" aria-labelledby="faq-title" className="i-section i-faq">
      <h2 id="faq-title" className="i-display i-h2 i-faq-title">
        <Bracketed lines={copy.faq.title} />
      </h2>
      <div className="i-faq-list">
        {copy.faq.items.map((item, index) => (
          <details
            key={item.question}
            name="faq"
            className="i-faq-row"
            open={index === 0}
          >
            <summary>
              <svg
                className="i-faq-mark"
                viewBox={`0 0 ${FAQ_INDICATOR.w} ${FAQ_INDICATOR.h}`}
                width={FAQ_INDICATOR.w}
                height={FAQ_INDICATOR.h}
                aria-hidden="true"
              >
                <path d={FAQ_INDICATOR.d} />
              </svg>
              <span className="i-faq-q">{item.question}</span>
            </summary>
            <p className="i-faq-a">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
