import type { ReactElement } from "react";

import { Reveal } from "../login/landing/motion";
import {
  CaseFact,
  CaseFactText,
  CaseFacts,
  CaseHeader,
  CasePage,
  CaseSection,
  CaseShot,
  CaseSteps,
  CaseTags,
  ClosingCta,
  LiveAppButton,
  RepositoryLink,
  RequestPath,
} from "./case-parts";
import { t } from "./i18n";
import { BLUEPRINT } from "./use-cases-data";

const PIPELINE = [
  "Browser",
  "trybp Control Worker",
  "mosoo Thread API",
  "Session sandbox (Blueprint)",
  "R2 / *.trybp.page",
] as const;

export function UseCaseBlueprintPage(): ReactElement {
  return (
    <CasePage>
      <CaseHeader
        useCase={BLUEPRINT}
        title={t("From a brief to a live site. mosoo runs the Agent.")}
        lead={t(
          "Blueprint turns a conversational brief into a deterministic page. The online product at trybp.page maps each project to a mosoo Thread, runs Blueprint in that Thread's own sandbox, and publishes validated artifacts. The mosoo token never reaches the browser.",
        )}
        actions={
          <>
            {BLUEPRINT.productUrl ? <LiveAppButton href={BLUEPRINT.productUrl} /> : null}
            {BLUEPRINT.repoUrl ? <RepositoryLink href={BLUEPRINT.repoUrl} /> : null}
          </>
        }
      />
      <Reveal className="uc-sec uc-sec--shot">
        <CaseShot src={BLUEPRINT.image} alt={BLUEPRINT.imageAlt} width={1440} height={900} eager />
      </Reveal>
      <CaseSection title={t("How it works")}>
        <CaseSteps
          items={[
            {
              title: t("Publish the Agent"),
              body: t(
                "One Agent is published on mosoo with the Blueprint skill and full network access, so generation can reach arbitrary reference URLs.",
              ),
            },
            {
              title: t("Drive generation from the Control Worker"),
              body: t(
                "The Control Worker creates one Thread per project and one Run per prompt or revision. It polls the Run, downloads committed artifacts under outputs/, and keeps the mosoo token off the browser.",
              ),
            },
            {
              title: t("Publish outside mosoo"),
              body: t(
                "The Worker validates the artifact, writes an immutable R2 version, and activates it on a stable *.trybp.page hostname. mosoo never receives Cloudflare credentials.",
              ),
            },
          ]}
        />
      </CaseSection>
      <RequestPath
        stages={PIPELINE}
        note={t("The token stays in the Control Worker. The browser only ever sees the published site.")}
      />
      <CaseFacts columns={2}>
        <CaseFact title={t("What comes out")}>
          <CaseFactText>
            {t(
              "A self-contained site artifact, typically one index.html, versioned on R2 with three-version retention and a stable public hostname.",
            )}
          </CaseFactText>
        </CaseFact>
        <CaseFact title={t("Stack")}>
          <CaseTags tags={[...BLUEPRINT.tags, "Blueprint CLI"]} />
        </CaseFact>
      </CaseFacts>
      <ClosingCta
        title={t("Build your own site-generation Agent.")}
        body={t(
          "Today one API call from your backend starts a Session, with no saved or published Agent. Turn its events and files into the feature your users see.",
        )}
      />
    </CasePage>
  );
}
