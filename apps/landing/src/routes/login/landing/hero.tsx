import { ArrowRight } from "lucide-react";
import type { ReactElement } from "react";

import { locale } from "@/shared/locale";

import { docsUrl, MOSOO_CLOUD_URL } from "../links";
import { t } from "./above-fold-i18n";
import { HeroStage } from "./hero-stage";
import { Phrases } from "./ui";

/** Keeps one term (a licence name with a hyphen) from breaking inside a line. */
function KeepWhole({ term, text }: { term: string; text: string }): ReactElement {
  const [before, after] = text.split(term);
  if (after === undefined) {
    return <>{text}</>;
  }
  return (
    <>
      {before}
      <span className="whitespace-nowrap">{term}</span>
      {after}
    </>
  );
}

/**
 * H1 in two tones (#99): the product in full ink, the audience softer, in
 * that order in every locale (v3 reorders the Japanese line so its pale
 * clause no longer sits on top). zh/ja strings carry phrase marks ("|").
 */
function Headline(): ReactElement {
  return (
    <h1 id="hero-title" className="v2a-display v2a-h1">
      <span>
        <Phrases text={t("An open-source, API-first managed Agent runtime")} />
      </span>
      {locale === "en" ? " " : null}
      <span className="v2a-tone-soft">
        <Phrases text={t("for application backends.")} />
      </span>
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
        <p className="v2a-hosted">
          <KeepWhole text={t("Hosted at cloud.mosoo.ai. Apache-2.0 source on GitHub. Bring your own model key.")} term="Apache-2.0" />
        </p>
        <p className="v2a-alpha">{t("mosoo is in Alpha. Public APIs may still change.")}</p>
      </div>
      <HeroStage />
    </section>
  );
}
