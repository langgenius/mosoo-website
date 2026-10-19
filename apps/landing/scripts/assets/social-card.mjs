// Social card (og:image / twitter:image), 1200 x 630, drawn in the v4c design language: paper ground,
// Hedvig Letters Serif for the README positioning line (README.md L8), Inter for the runtime line
// (README.md L9), the 1 px logo-outline window and the four runtime glyphs in ink on low-chroma tiles,
// the solid monochrome mark at 24 px. No photo, no green, no enlarged filled mark (decisions 4 and 10).
// It replaces the v3 card (bamboo photo + large green mark) at the same, never-deployed path.
//
// Usage (from the repository root): node apps/landing/scripts/assets/social-card.mjs <chrome-binary>
// or set CHROME. Chrome renders the page headless and writes the PNG; nothing is downloaded.

import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { HERO_WINDOW, NAV_MARK } from "../../src/home/outline-geometry.ts";
import { RUNTIME_GLYPHS } from "../../src/home/runtime-glyphs.ts";

const chrome = process.argv[2] ?? process.env.CHROME;
if (!chrome) throw new Error("pass the Chrome binary as the first argument or set CHROME");

const root = resolve(import.meta.dirname, "../..");
const out = join(root, "public/brand/social-card-20261019.png");
const font = (file) => pathToFileURL(join(root, "public/fonts", file)).href;

const glyph = (id) => {
  const g = RUNTIME_GLYPHS.find((item) => item.id === id);
  if (!g) throw new Error(`unknown runtime glyph ${id}`);
  return `<svg viewBox="${g.viewBox}" fill="currentColor" fill-rule="evenodd">${g.body}</svg>`;
};

// Same tile plates and tilts as the hero (src/home/home.css .tile-1..4).
const tiles = [
  ["openai-runtime", "#e9e6df", -4, 742, 214],
  ["claude-agent-sdk", "#e2e7ec", 3, 1000, 190],
  ["acp-fallback", "#e8e3ec", 4, 716, 300],
  ["pi", "#eee3dc", -3, 1028, 282],
]
  .map(
    ([id, bg, rot, x, y]) =>
      `<div class="tile" style="left:${x}px;top:${y}px;background:${bg};transform:rotate(${rot}deg)">${glyph(id)}</div>`,
  )
  .join("");

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><style>
@font-face{font-family:Hedvig;src:url("${font("hedvig-letters-serif-400.woff2")}") format("woff2")}
@font-face{font-family:InterV;src:url("${font("inter-latin-var.woff2")}") format("woff2");font-weight:100 900}
html,body{margin:0;width:1200px;height:630px;overflow:hidden;background:#f9faf9;color:#161815}
.brand{position:absolute;left:80px;top:64px;display:flex;align-items:center;gap:10px;font:600 22px/1 InterV;letter-spacing:-.02em}
.brand svg{width:24px;height:24px;display:block}
h1{position:absolute;left:80px;top:196px;width:600px;margin:0;font:400 58px/1.04 Hedvig;letter-spacing:-.03em}
h1 span{color:#7f817e}
p{position:absolute;left:80px;top:470px;width:600px;margin:0;font:400 22px/1.45 InterV;letter-spacing:-.01em;color:#515350}
.win{position:absolute;left:820px;top:230px;width:168px;height:${(168 * HERO_WINDOW.h) / HERO_WINDOW.w}px}
.win svg{width:100%;height:100%;overflow:visible}
.win path{fill:none;stroke:#1a1a1c;stroke-width:1;vector-effect:non-scaling-stroke}
.tile{position:absolute;width:72px;height:72px;border-radius:12px;display:flex;align-items:center;justify-content:center;color:#161815}
.tile svg{width:32px;height:32px}
.rule{position:absolute;left:80px;right:80px;bottom:72px;height:1px;background:rgb(22 24 21 / .16)}
</style></head><body>
<div class="brand"><svg viewBox="${NAV_MARK.vb}"><path d="${NAV_MARK.block}" fill="currentColor"/><rect x="0" y="${NAV_MARK.bar.y}" width="51.51" height="${NAV_MARK.bar.h}" fill="currentColor"/></svg>mosoo</div>
<h1>An open-source, <i style="font-style:normal;white-space:nowrap">API-first</i> managed Agent runtime <span>for application backends.</span></h1>
<p>One API, 4 runtimes: OpenAI Codex, Claude Agent SDK, OpenCode, and Pi.</p>
<div class="win"><svg viewBox="${HERO_WINDOW.viewBox}"><path d="${HERO_WINDOW.block}"/><path d="${HERO_WINDOW.line}"/></svg></div>
${tiles}
<i class="rule"></i>
</body></html>`;

// Chrome's --screenshot flag does not return in headless=new here, so the page is captured over the
// DevTools protocol (Node's built-in WebSocket): open, wait for fonts, Page.captureScreenshot as PNG.
const dir = mkdtempSync(join(tmpdir(), "mosoo-social-card-"));
const page = join(dir, "card.html");
writeFileSync(page, html);
const profile = join(dir, "profile");
const proc = spawn(
  chrome,
  [
    "--headless=new",
    "--remote-debugging-port=0",
    `--user-data-dir=${profile}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-extensions",
    "--disable-sync",
    "--disable-background-networking",
    "--hide-scrollbars",
    "--force-device-scale-factor=1",
    "--window-size=1200,630",
    "about:blank",
  ],
  { stdio: "ignore" },
);
try {
  let port = "";
  for (let i = 0; i < 100 && !port; i++) {
    await new Promise((r) => setTimeout(r, 100));
    try {
      port = readFileSync(join(profile, "DevToolsActivePort"), "utf8").split("\n")[0] ?? "";
    } catch {
      // not written yet
    }
  }
  if (!port) throw new Error("Chrome did not open a DevTools port");
  const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  const target = targets.find((t) => t.type === "page");
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((r, j) => ((ws.onopen = r), (ws.onerror = j)));
  let id = 0;
  const pending = new Map();
  ws.onmessage = (event) => {
    const msg = JSON.parse(String(event.data));
    if (msg.id && pending.has(msg.id)) pending.get(msg.id)(msg);
  };
  const send = (method, params = {}) =>
    new Promise((r) => {
      pending.set(++id, r);
      ws.send(JSON.stringify({ id, method, params }));
    });
  await send("Emulation.setDeviceMetricsOverride", { width: 1200, height: 630, deviceScaleFactor: 1, mobile: false });
  await send("Page.navigate", { url: pathToFileURL(page).href });
  for (let i = 0; i < 50; i++) {
    const r = await send("Runtime.evaluate", {
      expression: "document.readyState === 'complete' && document.fonts.status === 'loaded' && document.fonts.size >= 2",
      returnByValue: true,
    });
    if (r.result?.result?.value) break;
    await new Promise((res) => setTimeout(res, 100));
  }
  const shot = await send("Page.captureScreenshot", { format: "png", clip: { x: 0, y: 0, width: 1200, height: 630, scale: 1 } });
  writeFileSync(out, Buffer.from(shot.result.data, "base64"));
  ws.close();
} finally {
  proc.kill();
  await new Promise((r) => setTimeout(r, 300));
  rmSync(dir, { recursive: true, force: true });
}
console.log(`wrote ${out}`);
