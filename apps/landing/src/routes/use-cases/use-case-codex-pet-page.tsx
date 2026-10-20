import { Play } from "lucide-react";
import { useRef, useState } from "react";
import type { ReactElement } from "react";

import { Reveal } from "../login/landing/motion";
import {
  CaseFact,
  CaseFactText,
  CaseHeader,
  CasePage,
  CaseSection,
  CaseShot,
  CaseSteps,
  CaseTags,
  ClosingCta,
  RepositoryLink,
  RequestPath,
} from "./case-parts";
import { t } from "./i18n";
import { CODEX_PET, CODEX_PET_DEMO_POSTER, CODEX_PET_DEMO_VIDEO } from "./use-cases-data";

const PIPELINE = [
  "Browser",
  "Cloudflare Worker",
  "mosoo Thread API",
  "Agent sandbox",
  "outputs/codex-pet.zip",
] as const;

/** The demo on the frame, like the screenshots: the video card, then its title and length under it. */
function DemoVideo(): ReactElement {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);

  return (
    <div className="uc-board uc-video">
      <div className="uc-video-card">
        <video
          ref={videoRef}
          controls
          playsInline
          preload="none"
          poster={CODEX_PET_DEMO_POSTER}
          aria-label={t("Agent as API, end to end: from publishing the Agent to the downloaded pet.")}
          onPlay={() => setStarted(true)}
        >
          <source src={CODEX_PET_DEMO_VIDEO} type="video/mp4" />
        </video>
        {started ? null : (
          <button
            type="button"
            aria-label={t("Watch the 57-second demo")}
            onClick={() => videoRef.current?.play()}
            className="uc-play"
          >
            <span className="uc-play-dot">
              <Play aria-hidden="true" fill="currentColor" />
            </span>
          </button>
        )}
      </div>
      <p className="uc-video-cap">
        <span>{t("Watch the 57-second demo")}</span>
        <span className="uc-video-time">0:57</span>
      </p>
    </div>
  );
}

export function UseCaseCodexPetPage(): ReactElement {
  return (
    <CasePage>
      <CaseHeader
        useCase={CODEX_PET}
        title={t("One Agent behind an API. Any Codex can call it.")}
        lead={t(
          "The Codex Pet case study shows how a workflow built in a coding IDE becomes a reusable mosoo-managed Agent exposed through an API: one uploaded avatar comes back as a validated ZIP with all nine Codex pet animation states.",
        )}
        actions={CODEX_PET.repoUrl ? <RepositoryLink href={CODEX_PET.repoUrl} primary /> : null}
      />
      <Reveal className="uc-sec uc-sec--shot">
        <CaseShot src={CODEX_PET.image} alt={CODEX_PET.imageAlt} width={1440} height={900} eager />
      </Reveal>
      <CaseSection title={t("How it works")}>
        <CaseSteps
          items={[
            {
              title: t("Publish the Agent"),
              body: t(
                "An Agent with an avatar-generation skill is published on mosoo. Its environment carries the openai and pillow packages plus an OpenAI provider credential.",
              ),
            },
            {
              title: t("Copy the Instruction for LLM"),
              body: t(
                "Publishing generates an Instruction for LLM: an API contract sized for a prompt. Paste it into Codex and the integration work moves to the coding agent.",
              ),
            },
            {
              title: t("Integrate from Codex"),
              body: t(
                "Codex wires the mosoo Thread API into the product backend: the Worker creates a Thread with the uploaded avatar, polls the Run, and streams the finished ZIP back.",
              ),
            },
          ]}
        />
      </CaseSection>
      <RequestPath
        stages={PIPELINE}
        note={t("The token stays in the Worker. The browser only ever sees the finished ZIP.")}
      />
      <section className="uc-sec uc-sec--near uc-demo">
        <Reveal>
          <DemoVideo />
        </Reveal>
        <div className="uc-demo-facts">
          <Reveal delay={0.06}>
            <CaseFact title={t("What comes out")}>
              <CaseFactText>
                {t(
                  "A 1536×1872 RGBA WebP atlas with nine animation rows, QA-checked in the sandbox before download.",
                )}
              </CaseFactText>
            </CaseFact>
          </Reveal>
          <Reveal delay={0.12}>
            <CaseFact title={t("Stack")}>
              <CaseTags tags={[...CODEX_PET.tags, "Python skill"]} />
            </CaseFact>
          </Reveal>
        </div>
      </section>
      <ClosingCta
        title={t("Build your own Agent as API.")}
        body={t(
          "Today one API call from your backend starts a Session, with no saved or published Agent. Turn its events and files into the feature your users see.",
        )}
      />
    </CasePage>
  );
}
