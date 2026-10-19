#!/usr/bin/env node
// Renders every product-kit moment's final state to static HTML, in en, zh and
// ja, for a page's no-JS fallback (the landing app renders client-side only):
//
//   node scripts/export-product-kit-markup.mjs <out.json>
//
// The landing app's own Vite loads the kit for server rendering and
// react-dom/server renders it; nothing new is installed. On the server every
// moment assumes reduced motion, so the markup is the final state: no hidden
// element, no Replay control. The markup carries the island's class names, so
// the page that embeds it must also load the kit's console-island.css (a page
// that imports the kit statically gets it in its CSS bundle).
//
// Output: { generator, moments: { "<moment-id>": { en, zh, ja } } }.

import { mkdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const LANDING = resolve(dirname(fileURLToPath(import.meta.url)), "../apps/landing");
const LOCALES = ["en", "zh", "ja"];

// Moment ID, component, and the props a page shows it with.
export const MOMENTS = [
  ["turn-receipt", "TurnReceipt", {}],
  ["session-continuation", "SessionContinuation", { showCancelledTurn: true }],
  ["preview-replay", "PreviewReplay", {}],
  ["runtime-matrix", "RuntimeMatrix", {}],
  ["runtime-availability", "RuntimeAvailability", {}],
  ["key-boundary", "KeyBoundary", {}],
  ["api-call", "ApiCall", {}],
  ["coding-agent-setup", "CodingAgentSetup", {}],
];

export async function renderProductKitMarkup() {
  const require = createRequire(resolve(LANDING, "package.json"));
  const { createServer } = await import(pathToFileURL(require.resolve("vite")).href);
  const React = require("react");
  const { renderToStaticMarkup } = require("react-dom/server");

  const server = await createServer({
    appType: "custom",
    logLevel: "error",
    root: LANDING,
    server: { hmr: false, middlewareMode: true, watch: null, ws: false },
    ssr: { external: ["react", "react-dom"] },
  });

  try {
    const kit = await server.ssrLoadModule("/src/product-kit/index.ts");
    const moments = {};

    for (const [id, component, props] of MOMENTS) {
      moments[id] = {};
      for (const locale of LOCALES) {
        moments[id][locale] = renderToStaticMarkup(React.createElement(kit[component], { ...props, locale }));
      }
    }

    return { generator: "scripts/export-product-kit-markup.mjs", moments };
  } finally {
    await server.close();
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const out = process.argv[2];
  if (out === undefined) {
    console.error("usage: node scripts/export-product-kit-markup.mjs <out.json>");
    process.exit(2);
  }

  const markup = await renderProductKitMarkup();
  mkdirSync(dirname(resolve(out)), { recursive: true });
  writeFileSync(out, `${JSON.stringify(markup, null, 2)}\n`);
  console.log(`wrote ${resolve(out)}`);
}
