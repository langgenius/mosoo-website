#!/usr/bin/env node
// Inline SVG data for the v5 product kit (tool T4): writes apps/landing/src/home/kit/glyphs.ts.
//
//   MOSOO_MAIN=<mosoo checkout> node apps/landing/scripts/assets/kit-glyphs.mjs
//
// The glyph step of the kit's proof builder (staging v5/tools/kit/build.ts, step "glyphs"), moved into the repo
// so the repo can regenerate glyphs.ts on its own (staging production/v5/TOOLS-REVIEW.md, T4). Same sources,
// same transforms, same bytes in the KIT_GLYPHS body; only the two header lines that name the command changed.
// Sources are read as text, never imported or executed:
//   runtime marks   @lobehub/icons-static-svg 1.94.0 (MIT): the version MAIN bun.lock L771 pins. It has pi.svg,
//                   which the 1.91.0 installed in this repo lacks (openai / claudecode / opencode are identical).
//   mosoo glyphs    MAIN docs/design/assets/sidebar-icons: 24 grid, 1.5 stroke, one 12% plane (class kit-gp).
//   console glyphs  @hugeicons/core-free-icons 4.2.3 (MIT), MAIN bun.lock L631, as apps/web/src/shared/ui/icons.tsx.
// Paths outside this repo come from the environment:
//   MOSOO_MAIN               a checkout of the mosoo main repo (required);
//   BUN_INSTALL_CACHE_DIR    bun's package cache (default ~/.bun/install/cache); `bun install` in MAIN fills it
//                            with the two packages above.
// Deterministic: same inputs, same bytes.

import { readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const env = (name) => {
  const value = process.env[name];
  if (!value) throw new Error(`set ${name}; see the comment at the top of this file`);
  return value;
};

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(HERE, "../../src/home/kit/glyphs.ts");
const CACHE = process.env["BUN_INSTALL_CACHE_DIR"] ?? join(homedir(), ".bun/install/cache");
const LOBE = join(CACHE, "@lobehub/icons-static-svg@1.94.0@@@1/icons");
const HUGE = join(CACHE, "@hugeicons/core-free-icons@4.2.3@@@1/dist/esm");
const SIDEBAR = join(env("MOSOO_MAIN"), "docs/design/assets/sidebar-icons");

const LINE = 'fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"';
const FILL = 'fill="currentColor" fill-rule="evenodd"';

function fromLobe(id, file) {
  const svg = readFileSync(join(LOBE, file), "utf8");
  const viewBox = svg.match(/viewBox="([^"]+)"/)?.[1];
  if (!viewBox) throw new Error(`no viewBox in ${file}`);
  const body = svg
    .replace(/^<svg[^>]*>/, "")
    .replace(/<\/svg>\s*$/, "")
    .replace(/<title>[\s\S]*?<\/title>/, "")
    .replace(/<path([^>]*)><\/path>/g, "<path$1/>")
    .trim();
  return { id, source: `@lobehub/icons-static-svg 1.94.0 icons/${file}`, viewBox, attrs: FILL, body };
}

function fromHuge(id, name) {
  const js = readFileSync(join(HUGE, `${name}.js`), "utf8");
  const shapes = [...js.matchAll(/\["(path|circle|rect)",\s*\{([^}]*)\}\]/g)].map(([, tag, props]) => {
    const attrs = [...props.matchAll(/(\w+):\s*"([^"]*)"/g)]
      .filter(([, key]) => key !== "key")
      .map(([, key, value]) => `${key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}="${value}"`)
      .join(" ");
    return `<${tag} ${attrs}/>`;
  });
  if (shapes.length === 0) throw new Error(`no shapes in ${name}`);
  return {
    id,
    source: `@hugeicons/core-free-icons 4.2.3 dist/esm/${name}.js`,
    viewBox: "0 0 24 24",
    attrs: 'fill="none"',
    body: shapes.join(""),
  };
}

function fromSidebar(id, file) {
  const svg = readFileSync(join(SIDEBAR, file), "utf8");
  const plane = ' fill="currentColor" fill-opacity="0.12" stroke="none"';
  if (!svg.includes(plane)) throw new Error(`${file}: the 12% plane moved; update the generator`);
  const body = svg
    .replace(/^[\s\S]*?<svg[^>]*>/, "")
    .replace(/<\/svg>\s*$/, "")
    .replaceAll(plane, ' class="kit-gp" stroke="none"')
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("");
  return { id, source: `MAIN docs/design/assets/sidebar-icons/${file}`, viewBox: "0 0 24 24", attrs: LINE, body };
}

const glyphs = [
  fromLobe("openai", "openai.svg"), // openai-runtime (Codex): catalog iconKey "openai"
  fromLobe("claude-code", "claudecode.svg"), // claude-agent-sdk: iconKey "claude-code"
  fromLobe("opencode", "opencode.svg"), // acp-fallback: iconKey "opencode"
  fromLobe("pi", "pi.svg"), // pi: iconKey "pi"
  fromSidebar("folder", "files.svg"),
  fromSidebar("cube", "environments.svg"),
  fromSidebar("key", "providers.svg"),
  fromSidebar("runs", "runs.svg"),
  fromHuge("file", "File02Icon"), // console FileText
  fromHuge("check", "CheckIcon"),
  fromHuge("plus", "Add01Icon"),
  fromHuge("arrow-up", "ArrowUp01Icon"), // the composer's send key
  fromHuge("clock", "Clock03Icon"),
  fromHuge("terminal", "ComputerTerminal01Icon"), // console SquareTerminal: bash / exec_command / shell
  fromHuge("refresh", "RefreshIcon"), // console RefreshCw
];

const out = [
  "// GENERATED by apps/landing/scripts/assets/kit-glyphs.mjs. Do not edit; re-run (sources in its header):",
  "//   MOSOO_MAIN=<mosoo checkout> node apps/landing/scripts/assets/kit-glyphs.mjs",
  "// Inline SVG for the kit in currentColor. Sources were read as text, never imported or executed:",
  "//   runtime marks   @lobehub/icons-static-svg 1.94.0 (MIT), the version MAIN bun.lock L771 pins; it has pi.svg,",
  "//                   which the 1.91.0 installed here lacks (openai / claudecode / opencode are byte-identical).",
  "//   mosoo glyphs    MAIN docs/design/assets/sidebar-icons: 24 grid, 1.5 stroke, one 12% plane (class kit-gp).",
  "//   console glyphs  @hugeicons/core-free-icons 4.2.3 (MIT), MAIN bun.lock L631, as apps/web/src/shared/ui/icons.tsx.",
  "",
  "export interface KitGlyph {",
  "  readonly viewBox: string;",
  "  readonly attrs: string;",
  "  readonly body: string;",
  "}",
  "",
  "export const KIT_GLYPHS = {",
  ...glyphs.flatMap((g) => [
    `  // ${g.source}`,
    `  ${JSON.stringify(g.id)}: {`,
    `    viewBox: ${JSON.stringify(g.viewBox)},`,
    `    attrs: ${JSON.stringify(g.attrs)},`,
    `    body: ${JSON.stringify(g.body)},`,
    "  },",
  ]),
  "} as const satisfies Record<string, KitGlyph>;",
  "",
  "export type KitGlyphId = keyof typeof KIT_GLYPHS;",
  "",
].join("\n");

writeFileSync(OUT, out);
console.log(`glyphs.ts: ${glyphs.length} glyphs, ${out.length} B`);
