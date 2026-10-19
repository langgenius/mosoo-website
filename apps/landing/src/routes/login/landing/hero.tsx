import { ArrowRight } from "lucide-react";
import type { ReactElement } from "react";

import { locale } from "@/shared/locale";

import { docsUrl, MOSOO_CLOUD_URL } from "../links";
import { t } from "./above-fold-i18n";
import { HeroStage } from "./hero-stage";

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
      <span translate="no" className="whitespace-nowrap">
        {PRODUCT_TERM}
      </span>
      {after}
    </>
  );
}

/**
 * H1 in two tones (#99): the product in full ink, the audience softer.
 * Japanese puts the audience first, so the order follows the locale; English
 * joins the two spans with a space so the heading reads as one sentence.
 */
function Headline(): ReactElement {
  const product = (
    <span>
      <KeepProductTerm text={t("An open-source, API-first managed Agent runtime")} />
    </span>
  );
  const audience = <span className="v2a-tone-soft">{t("for application backends.")}</span>;

  return (
    <h1 id="hero-title" className="v2a-display v2a-h1">
      {locale === "ja" ? (
        <>
          {audience}
          {product}
        </>
      ) : (
        <>
          {product}
          {locale === "en" ? " " : null}
          {audience}
        </>
      )}
    </h1>
  );
}

export function Hero(): ReactElement {
  return (
    <section aria-labelledby="hero-title" className="v2a-hero">
      <div className="v2a-hero-copy">
        <Headline />
        <p className="v2a-lead">
          {t(
            "mosoo runs OpenAI Codex, Claude Agent SDK, OpenCode, and Pi behind one API, each Session in its own sandbox.",
          )}
        </p>
        <div className="v2a-actions">
          <a href={MOSOO_CLOUD_URL} className="v2a-btn-primary">
            {t("Try mosoo")}
          </a>
          <a href={docsUrl("quickstart/")} className="v2a-link">
            <span>{t("Read the quickstart")}</span>
            <ArrowRight aria-hidden="true" className="size-4" />
          </a>
        </div>
        <p className="v2a-alpha">{t("mosoo is in Alpha. Public APIs may still change.")}</p>
      </div>
      <HeroStage />
    </section>
  );
}
