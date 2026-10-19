// The home page is static HTML (scripts/landing-home.mjs renders it into
// /en, /zh and /ja at build time). This entry only brings its styles and the
// effect engines that animate it; without JavaScript the page shows each
// effect's end state.
import { mountProgressTabs } from "./effects/progress-tabs";
import { mountRiseOnce } from "./effects/rise-once";
import { mountWordFill } from "./effects/word-fill";

import "./shared/styles/paper-fonts.css";
import "./shared/styles/paper.css";

const mounts: Readonly<Record<string, (root: HTMLElement) => void>> = {
  tabs: mountProgressTabs,
  fill: mountWordFill,
  rise: mountRiseOnce,
};

for (const root of document.querySelectorAll<HTMLElement>("[data-effect]")) {
  mounts[root.dataset["effect"] ?? ""]?.(root);
}
