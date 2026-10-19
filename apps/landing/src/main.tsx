import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { LandingShell } from "./routes/login/landing/landing-shell";
import { LoginLanding } from "./routes/login/landing/landing";
import { htmlLanguage, locale } from "./shared/locale";

import "./shared/styles/app.css";
import "./shared/styles/literata.css";
import "./routes/login/landing/bamboo-node.css";

const container = document.querySelector("#root");

if (!container) {
  throw new Error("The root element is missing.");
}

document.documentElement.lang = htmlLanguage[locale];

createRoot(container).render(
  <StrictMode>
    <LandingShell navVariant="capsule">
      <LoginLanding />
    </LandingShell>
  </StrictMode>,
);
