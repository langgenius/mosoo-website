// The v5 home. The page is static HTML, written per locale at build time by scripts/landing-home.mjs from
// src/home/markup.ts, and complete without JavaScript; this entry only loads the home's styles and starts the
// motion (src/home/effects.ts). The dev server serves index.html without that HTML, so here it renders the same
// markup first. The other routes (pricing, status, use cases) keep their own React entries.

import "./home/v5.css";

import { initHomeEffects } from "./home/effects.ts";
import { htmlLanguage, locale } from "./shared/locale";

async function boot(): Promise<void> {
  const root = document.querySelector("#root");
  if (!root) {
    throw new Error("The root element is missing.");
  }
  if (!root.querySelector("[data-v5-home]")) {
    const { renderHome } = await import("./home/markup.ts");
    root.innerHTML = renderHome(locale);
  }
  document.documentElement.lang = htmlLanguage[locale];
  initHomeEffects();
}

void boot();
