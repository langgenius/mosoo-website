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

// The subpage shell (nav with Products and the language, footer), as on status; nothing on the page moves.
createRoot(container).render(
  <StrictMode>
    <LandingShell>
      <PricingPage />
    </LandingShell>
  </StrictMode>,
);
