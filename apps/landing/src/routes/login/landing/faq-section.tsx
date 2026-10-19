import type { ReactElement } from "react";

import { FAQ_MESSAGES, t } from "./i18n";
import { WithCodeTokens } from "./ui";

// API names styled as code inside the answers. Only presentation changes: the
// text stays identical to the FAQPage JSON-LD and llms.txt answers.
const FAQ_CODE_TOKENS = [
  "/api/v2",
  "/api/v1",
  "outputs/",
  "runtime.capacity_exhausted",
  "Idempotency-Key",
] as const;

/**
 * Copy deck §10: ten questions, every answer visible without a click, so the
 * visible FAQ, the FAQPage structured data and the crawlable fallback match.
 * id="faq" is the fragment the FAQPage @id points at (https://mosoo.ai/en#faq).
 */
export function FaqSection(): ReactElement {
  return (
    <section id="faq" aria-labelledby="faq-title" className="v2a-section">
      <span aria-hidden="true" className="v2a-node" style={{ top: 110 }} />
      <h2 id="faq-title" className="v2a-display v2a-h2">
        {t("Questions to ask before you build on mosoo")}
      </h2>

      {/* Two columns from 1024px (v2b's appendix layout): all ten answers stay
          open, in reading order down the first column, then the second. */}
      <div className="v2a-faq mt-10">
        {FAQ_MESSAGES.map((faq) => (
          <div key={faq.q} className="v2a-qa">
            <h3 className="text-ink-900 text-[18px] leading-[1.4] font-semibold">{t(faq.q)}</h3>
            <p className="text-ink-700 mt-2.5 max-w-[720px] text-[16px] leading-[1.65]">
              <WithCodeTokens text={t(faq.a)} tokens={FAQ_CODE_TOKENS} />
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
