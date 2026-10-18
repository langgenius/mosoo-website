import type { ReactElement } from "react";

import { FAQ_MESSAGES, t } from "./i18n";
import { sectionHeadingStyle } from "./typography";
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
    <section id="faq" aria-labelledby="faq-title" className="px-4 py-20 md:px-6 md:py-24">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-[minmax(220px,0.8fr)_1.9fr] md:gap-16">
        <div>
          <h2
            id="faq-title"
            className="text-ink-900 [text-wrap:balance] md:sticky md:top-24"
            style={sectionHeadingStyle}
          >
            {t("Questions to ask before you build on mosoo")}
          </h2>
        </div>

        <div className="border-border-strong border-t">
          {FAQ_MESSAGES.map((faq) => (
            <div key={faq.q} className="border-border-strong border-b py-6">
              <h3 className="text-ink-900 text-[18px] leading-[1.4] font-semibold">{t(faq.q)}</h3>
              <p className="text-ink-500 mt-2.5 max-w-[720px] text-[16px] leading-[1.65]">
                <WithCodeTokens text={t(faq.a)} tokens={FAQ_CODE_TOKENS} />
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
