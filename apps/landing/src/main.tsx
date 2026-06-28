import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { LandingShell } from "./routes/login/landing/landing-shell";

import "./shared/styles/app.css";

const container = document.querySelector("#root");

if (!container) {
  throw new Error("The root element is missing.");
}

const openAuth = (): void => {
  window.location.href = "/login";
};

createRoot(container).render(
  <StrictMode>
    <LandingShell onContinue={openAuth} />
  </StrictMode>,
);
