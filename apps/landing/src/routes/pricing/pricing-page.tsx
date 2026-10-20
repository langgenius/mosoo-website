import type { ReactElement } from "react";

import faq from "@/home/copy/faq.json" with { type: "json" };
import { MOSOO_CLOUD_URL } from "@/shared/config/external-links";
import { t } from "@/shared/i18n";
import { locale } from "@/shared/locale";

/**
 * /{locale}/pricing (#138, staging committee/PLAN.md 2-3): a page in the subpage shell, like status. It says one
 * thing, the home FAQ's answer to "What does it cost to start?" (src/home/copy/faq.json, item 2: free to start, no
 * credit card, models run on your own provider key and the provider bills that account), then the one lime button,
 * to the console. No plans, quotas or prices: mosoo sells none (MAIN docs/SPEC.md §8). The static page, its
 * description and its share text carry the same answer (scripts/landing-locales.mjs renderPricingLocale), so the
 * FAQ stays the only copy. Unlisted: noindex, out of the sitemap, linked from no nav (owner question 11, default).
 */

/** The page name, as the static page's h1 and <title> have it (scripts/landing-locales.mjs PRICING_SEO). */
const TITLE = { en: "Pricing", zh: "定价", ja: "料金" } as const;

/** copy/faq.json items[1], "What does it cost to start?" (tests/site-seo.test.mjs checks it still is). */
const COST_QUESTION = 1;

function costAnswer(): string {
  const item = faq[locale].items[COST_QUESTION];
  if (!item) {
    throw new Error("copy/faq.json has no second question.");
  }
  return item.a;
}

export function PricingPage(): ReactElement {
  return (
    // The shared LandingShell provides <main> and the site nav; the title is the status page's (app.css .sp-title).
    <div className="sp">
      <h1 className="sp-title">{TITLE[locale]}</h1>
      <p className="pp-answer">{costAnswer()}</p>
      <p className="pp-actions">
        <a className="sub-btn sub-btn--lime" href={MOSOO_CLOUD_URL}>
          {t("Try mosoo")}
        </a>
      </p>
    </div>
  );
}
