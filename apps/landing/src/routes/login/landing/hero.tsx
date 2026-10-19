import type { ReactElement } from "react";

import { TurnReceipt } from "@/product-kit/components/turn-receipt";
import { locale } from "@/shared/locale";

import { docsUrl, MOSOO_CLOUD_URL, MOSOO_GITHUB_URL } from "../links";
import { t } from "./above-fold-i18n";
import { Exhibit, Seal, useCommitSeal } from "./contract-ui";

const PRODUCT_TERM = "Agent runtime";

/** Keeps the product term on one line inside a translated headline. */
function KeepProductTerm({ text }: { text: string }): ReactElement {
  const [before, after] = text.split(PRODUCT_TERM);
  if (after === undefined) {
    return <>{text}</>;
  }
  return (
    <>
      {before}
      <span translate="no" className="ct-nowrap">
        {PRODUCT_TERM}
      </span>
      {after}
    </>
  );
}

/**
 * What it is: the README's first line as the title, the runtimes in one
 * sentence, one primary action and one link. Exhibit 1 follows at once, so
 * the first screen shows a real turn of the CSV example, and the seal marks
 * the moment it commits.
 */
export function Hero(): ReactElement {
  const seal = useCommitSeal();

  return (
    <section aria-labelledby="hero-title" className="ct-hero">
      <div className="ct-head">
        <h1 id="hero-title" className="ct-h1">
          <KeepProductTerm text={t("An open-source, API-first managed Agent runtime for application backends.")} />
        </h1>
        <div className="ct-cites">
          <p className="ct-cite">
            <a href={`${MOSOO_GITHUB_URL}#readme`} lang="en" translate="no">
              <span>README</span>
              <span className="ct-cite-title">langgenius/mosoo</span>
            </a>
          </p>
        </div>
      </div>

      <div className="ct-body">
        <p className="ct-lead">
          {t(
            "mosoo runs OpenAI Codex, Claude Agent SDK, OpenCode, and Pi behind one API, each Session in its own sandbox.",
          )}
        </p>
        <div className="ct-actions">
          <a href={MOSOO_CLOUD_URL} className="ct-button">
            {t("Try mosoo")}
          </a>
          <a href={docsUrl("quickstart/")} className="ct-link-ui">
            {t("Read the quickstart")}
          </a>
        </div>
        <p className="ct-alpha ct-ui ct-muted">{t("mosoo is in Alpha. Public APIs may still change.")}</p>

        <Exhibit
          label={t("Exhibit 1.")}
          caption={t(
            "Turn 1 of the CSV example, as the console records it. A turn succeeds only when its events, usage, and a checkpoint are committed together.",
          )}
        >
          <div ref={seal.frameRef} className="ct-receipt">
            <div className="ct-zoom">
              <TurnReceipt locale={locale} animate />
            </div>
            <Seal turn="turn 1" word={t("committed")} state={seal.state} />
          </div>
        </Exhibit>
      </div>
    </section>
  );
}
