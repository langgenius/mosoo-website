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
import { PITCHPILOT } from "./use-cases-data";

const APPLICATION_ARCHITECTURE_SCREENSHOT = "/landing/use-cases/pitchpilot-application-architecture.jpg";
const RUNTIME_ARCHITECTURE_SCREENSHOT = "/landing/use-cases/pitchpilot-runtime-architecture.jpg";

const PIPELINE = [
  "Browser",
  "PitchPilot Worker",
  "mosoo Thread API",
  "Published Agent",
  "HTML Artifact",
  "Preview / Download",
] as const;

export function UseCasePitchPilotPage(): ReactElement {
  return (
    <CasePage>
      <CaseHeader
        useCase={PITCHPILOT}
        title={t("Keep the product UI. Put the managed Agent behind it.")}
        lead={t(
          "PitchPilot is a complete presentation web app, not an Agent console. Its backend calls one published mosoo Agent for long-running work, then turns the returned files and events into a normal product experience.",
        )}
        actions={
          <>
            {PITCHPILOT.productUrl ? <LiveAppButton href={PITCHPILOT.productUrl} /> : null}
            {PITCHPILOT.repoUrl ? <RepositoryLink href={PITCHPILOT.repoUrl} /> : null}
          </>
        }
      />
      <Reveal className="uc-sec uc-sec--shot">
        <CaseShot src={PITCHPILOT.image} alt={PITCHPILOT.imageAlt} width={1272} height={868} eager />
      </Reveal>
      <CaseSection title={t("How it works")}>
        <CaseSteps
          items={[
            {
              title: t("Own the application experience"),
              body: t(
                "PitchPilot keeps authentication, deck metadata, attachments, chat, preview, and download inside its own web experience.",
              ),
            },
            {
              title: t("Run work through mosoo"),
              body: t(
                "Its trusted Worker maps each deck to a mosoo Thread, uploads the brief, starts a Run, and keeps the mosoo token off the browser.",
              ),
            },
            {
              title: t("Return a product-native artifact"),
              body: t(
                "PitchPilot reads Thread events and committed files through mosoo's public API, then presents the Agent's HTML artifact in a sandboxed in-app preview with an explicit download.",
              ),
            },
          ]}
        />
      </CaseSection>
      <CaseSection
        title={t("See the architecture the Agent delivered.")}
        intro={t(
          "Each capture keeps the PitchPilot workspace on the left and the committed Agent artifact on the right: first at the application level, then inside the managed Agent runtime.",
        )}
      >
        <div className="uc-gallery">
          <Reveal>
            <CaseShot
              src={APPLICATION_ARCHITECTURE_SCREENSHOT}
              alt={t(
                "PitchPilot workspace beside a slide showing the Dify application layer and mosoo managed Agent runtime as two responsibilities.",
              )}
              caption={t(
                "Application boundary: Dify owns the product layer; mosoo supplies the managed Agent backend.",
              )}
              width={1272}
              height={868}
            />
          </Reveal>
          <Reveal delay={0.06}>
            <CaseShot
              src={RUNTIME_ARCHITECTURE_SCREENSHOT}
              alt={t(
                "PitchPilot workspace beside a slide showing Thread, Run, Harness Selection, MCP Tools, Delegated End-User Context, Normalized Events, and Artifacts inside mosoo.",
              )}
              caption={t(
                "Runtime boundary: one Thread contains Runs, tools, delegated identity, events, and Artifacts.",
              )}
              width={1272}
              height={868}
            />
          </Reveal>
        </div>
      </CaseSection>
      <RequestPath
        stages={PIPELINE}
        note={t(
          "The application owns the user experience. mosoo owns published Agent execution, Thread and Run lifecycle, event delivery, and Agent-produced files.",
        )}
      />
      <CaseFacts columns={3}>
        <CaseFact title={t("Verified delivery path")}>
          <CaseFactText>
            {t(
              "English prompt plus attachment → completed Run → committed HTML artifact → in-app preview → browser download.",
            )}
          </CaseFactText>
        </CaseFact>
        <CaseFact title={t("Explicit boundary")}>
          <CaseFactText>
            {t(
              "This case proves HTML artifact preview and download. It does not claim native PitchPilot version history or PPTX parity.",
            )}
          </CaseFactText>
        </CaseFact>
        <CaseFact title={t("Stack")}>
          <CaseTags tags={PITCHPILOT.tags} />
        </CaseFact>
      </CaseFacts>
      <ClosingCta
        title={t("Put a managed Agent behind your product UI.")}
        body={t(
          "Today one API call from your backend starts a Session, with no saved or published Agent. Turn its events and files into the feature your users see.",
        )}
      />
    </CasePage>
  );
}
