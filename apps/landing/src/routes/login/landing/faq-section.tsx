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
      <div className="grid grid-cols-1 gap-10 md:grid-cols-[minmax(220px,0.8fr)_1.9fr] md:gap-16">
        <div>
          <h2 id="faq-title" className="v2a-display v2a-h2 md:sticky md:top-24">
            {t("Questions to ask before you build on mosoo")}
          </h2>
        </div>

        <div className="border-t border-[rgba(109,120,106,0.35)]">
          {FAQ_MESSAGES.map((faq) => (
            <div key={faq.q} className="border-b border-[rgba(109,120,106,0.35)] py-6">
              <h3 className="text-ink-900 text-[18px] leading-[1.4] font-semibold">{t(faq.q)}</h3>
              <p className="text-ink-700 mt-2.5 max-w-[720px] text-[16px] leading-[1.65]">
                <WithCodeTokens text={t(faq.a)} tokens={FAQ_CODE_TOKENS} />
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
