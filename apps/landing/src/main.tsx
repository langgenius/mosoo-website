// The v4c home. The page is static HTML (written per locale by scripts/landing-home.mjs from
// src/home/markup.ts) and works without JavaScript; this entry only loads the styles and adds the
// effects. The dev server serves index.html without that HTML, so it renders the same markup here.

import "./shared/styles/v4.css";
import "./home/home.css";

import { initCopyPrompt } from "./effects/copy-prompt.ts";
import { initHeroWindow } from "./effects/hero-window.ts";
import { initStage } from "./effects/stage.ts";
import { htmlLanguage, locale } from "./shared/locale";

async function boot(): Promise<void> {
  const root = document.querySelector("#root");
  if (!root) throw new Error("The root element is missing.");
  if (!root.querySelector("[data-v4-home]")) {
    const { renderHome } = await import("./home/markup.ts");
    root.innerHTML = renderHome(locale);
  }
  document.documentElement.lang = htmlLanguage[locale];
  initHeroWindow();
  initStage();
  initCopyPrompt();
}

void boot();
