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

// The built page ships the whole home page as static HTML inside #root, which
// the browser has usually painted by now. Tell the stylesheet, so the hero's
// entrance animation does not hide what the reader already sees.
if (container.querySelector(".mosoo-fallback") !== null) {
  document.documentElement.setAttribute("data-fallback-painted", "");
}

createRoot(container).render(
  <StrictMode>
    <LandingShell>
      <LoginLanding />
    </LandingShell>
  </StrictMode>,
);
