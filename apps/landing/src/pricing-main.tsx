import { domAnimation, LazyMotion } from "motion/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { LandingShell } from "./routes/login/landing/landing-shell";
import { PricingPage } from "./routes/pricing/pricing-page";
import { htmlLanguage, locale } from "./shared/locale";

import "./shared/styles/app.css";

const container = document.querySelector("#root");

if (!container) {
  throw new Error("The root element is missing.");
}

document.documentElement.lang = htmlLanguage[locale];

const openAuth = (): void => {
  window.location.href = "https://try.mosoo.ai/login";
};

createRoot(container).render(
  <StrictMode>
    <LazyMotion features={domAnimation}>
      <LandingShell onContinue={openAuth} activeNav="pricing">
        <PricingPage onGetStarted={openAuth} />
      </LandingShell>
    </LazyMotion>
  </StrictMode>,
);
