import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { LandingShell } from "./routes/login/landing/landing-shell";
import { LoginLanding } from "./routes/login/landing/landing";
import { htmlLanguage, locale } from "./shared/locale";

import "./shared/styles/app.css";
import "./shared/styles/literata.css";
import "./routes/login/landing/contract.css";

const container = document.querySelector("#root");

if (!container) {
  throw new Error("The root element is missing.");
}

document.documentElement.lang = htmlLanguage[locale];
// Scopes the home page's paper colour (routes/login/landing/contract.css).
document.documentElement.dataset["page"] = "home";

createRoot(container).render(
  <StrictMode>
    <LandingShell>
      <LoginLanding />
    </LandingShell>
  </StrictMode>,
);
