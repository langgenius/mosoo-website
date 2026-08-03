import { domAnimation, LazyMotion, MotionConfig } from "motion/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { LandingShell } from "./routes/login/landing/landing-shell";
import { UseCaseGoGymPage } from "./routes/use-cases/use-case-go-gym-page";
import { htmlLanguage, locale } from "./shared/locale";

import "./shared/styles/app.css";

const container = document.querySelector("#root");

if (!container) {
  throw new Error("The root element is missing.");
}

document.documentElement.lang = htmlLanguage[locale];

const openAuth = (): void => {
  window.location.href = "https://cloud.mosoo.ai/login";
};

createRoot(container).render(
  <StrictMode>
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <LandingShell onContinue={openAuth} activeNav="use-cases">
          <UseCaseGoGymPage />
        </LandingShell>
      </MotionConfig>
    </LazyMotion>
  </StrictMode>,
);
