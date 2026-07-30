import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { LandingShell } from "./routes/login/landing/landing-shell";
import { LoginLanding } from "./routes/login/landing/landing";
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
    <LandingShell onContinue={openAuth}>
      <LoginLanding onContinue={openAuth} />
    </LandingShell>
  </StrictMode>,
);
