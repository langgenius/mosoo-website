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
import { GHFIND } from "./use-cases-data";

const PIPELINE = [
  "Browser",
  "ghfind backend",
  "mosoo Public Thread API",
  "Agent sandbox per Thread",
  "analysis + evidence + report",
  "native ghfind result",
] as const;

export function UseCaseGhfindPage(): ReactElement {
  return (
    <CasePage>
      <CaseHeader
        useCase={GHFIND}
        title={t("One ghfind feature runs on a published mosoo Agent.")}
        lead={t(
          "ghfind has two distinct products: a deterministic 0 to 100 value and trust score for GitHub accounts, and a deep evaluation for public repositories. mosoo powers only the repository evaluation. A published Agent inspects the project in a sandbox and returns structured artifacts; ghfind owns the rubric, job workflow, validation, storage, and result page.",
        )}
        actions={
          <>
            {GHFIND.productUrl ? <LiveAppButton href={GHFIND.productUrl} /> : null}
            {GHFIND.repoUrl ? <RepositoryLink href={GHFIND.repoUrl} /> : null}
          </>
        }
      />
      <Reveal className="uc-sec uc-sec--shot">
        {/* The capture's own size: its nav bar (under a browser plug-in's overlay) and scrollbar are cropped off
            (#143 item 8). */}
        <CaseShot src={GHFIND.image} alt={GHFIND.imageAlt} width={1159} height={791} eager />
      </Reveal>
      <CaseSection title={t("How it works")}>
        <CaseSteps
          items={[
            {
              title: t("Publish one project analyst (v1 API)"),
              body: t(
                "ghfind publishes one Agent with its project-evaluation skill. Each evaluation's Thread runs in its own sandbox, and mosoo manages the harness, environment, and execution lifecycle. On today's v2 API, a saved Agent preset runs without being published.",
              ),
            },
            {
              title: t("Create one Thread per repository"),
              body: t(
                "For each repository, ghfind's Go worker creates a Thread with a stable idempotency key, persists the Thread and Run ids, and follows the Run to a terminal state. The mosoo token never reaches the browser.",
              ),
            },
            {
              title: t("Render three committed artifacts"),
              body: t(
                "The Agent commits analysis JSON, evidence JSON, and a Markdown report. ghfind downloads those artifacts, validates its own product schema, stores the result, and renders a native evaluation page.",
              ),
            },
          ]}
        />
      </CaseSection>
      <RequestPath
        stages={PIPELINE}
        note={t(
          "The browser submits to ghfind. Only the ghfind backend talks to mosoo, and the browser receives ghfind's validated product result.",
        )}
      />
      <CaseFacts columns={3}>
        <CaseFact title={t("What mosoo does")}>
          <CaseFactText>
            {t(
              "mosoo runs the published Agent: isolated sandbox, harness and tool execution, Run lifecycle, public events, and committed Thread artifacts.",
            )}
          </CaseFactText>
        </CaseFact>
        <CaseFact title={t("What ghfind owns")}>
          <CaseFactText>
            {t(
              "The project rubric, queue durability, schema validation, storage, and UI stay in ghfind. Its headline account score is deterministic and does not use the Agent.",
            )}
          </CaseFactText>
        </CaseFact>
        <CaseFact title={t("Feature wiring")}>
          <CaseTags tags={GHFIND.tags} />
        </CaseFact>
      </CaseFacts>
      <ClosingCta
        title={t("Put an Agent behind your own product.")}
        body={t(
          "Today one API call from your backend starts a Session, from a saved Agent preset (no publishing needed) or an inline configuration. Turn its events and files into the feature your users see.",
        )}
      />
    </CasePage>
  );
}
