#!/usr/bin/env node
// Social card of the v4b "Paper" pages (proposal b-paper §10 #7; review P0-3): the home's H1 in Hedvig, ink and
// soft ink as on the page, above the same stone plate the hero uses, with the 24px ink wordmark. No green, no
// photograph, no enlarged solid mark (UI-FORMS §d, ATLAS §2.3).
//
//   node apps/landing/scripts/assets/social-card.mjs <chrome> [out=apps/landing/public/brand/social-card-paper-20261019.png]
//
// <chrome> is a Chrome or Chrome for Testing binary. The card is a 1200x630 HTML page with the font, the plate and
// the wordmark inlined as data URIs, shot headless at device scale 1, then written as a palette PNG.
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";

const [chrome, out = "apps/landing/public/brand/social-card-paper-20261019.png"] = process.argv.slice(2);
if (!chrome) throw new Error("usage: social-card.mjs <chrome> [out]");

const PUBLIC = new URL("../../public/", import.meta.url);
const dataUri = (path, type) => `data:${type};base64,${readFileSync(new URL(path, PUBLIC)).toString("base64")}`;
// The wordmark's mark and letters, all in ink (the file paints the mark green).
const wordmark = readFileSync(new URL("brand/logo-wordmark-onlight.svg", PUBLIC), "utf8")
  .replace(/fill="(?!none)[^"]*"/g, 'fill="#1b1916"')
  .replace(/<svg /, '<svg class="logo" aria-hidden="true" ');

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: "Hedvig"; src: url("${dataUri("fonts/HedvigLettersSerif-Regular-latin.woff2", "font/woff2")}") format("woff2"); }
html, body { margin: 0; width: 1200px; height: 630px; overflow: hidden; background: #f8f7f4; }
.card { position: relative; box-sizing: border-box; width: 1200px; height: 630px; padding: 60px 64px 0; }
.logo { display: block; width: auto; height: 24px; }
h1 { max-width: 860px; margin: 40px 0 0; color: #1b1916; font: 400 76px/1.02 "Hedvig", Georgia, serif; letter-spacing: -0.022em; text-wrap: balance; }
h1 span { display: block; color: #82807c; }
.plate { position: absolute; left: 64px; right: 64px; top: 452px; height: 240px; border-radius: 14px;
  background: #d8d1c5 url("${dataUri("landing/paper/plate-2400.webp", "image/webp")}") 50% 40% / cover no-repeat; }
</style></head><body><div class="card">${wordmark}<h1>A managed runtime<span>for the agents in your backend.</span></h1><div class="plate"></div></div></body></html>`;

const dir = mkdtempSync(join(tmpdir(), "social-card-"));
try {
  const page = join(dir, "card.html");
  const shot = join(dir, "card.png");
  writeFileSync(page, html);
  execFileSync(chrome, [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--force-device-scale-factor=1",
    "--window-size=1200,630",
    "--virtual-time-budget=4000",
    `--screenshot=${shot}`,
    `file://${page}`,
  ]);
  await sharp(shot).resize(1200, 630).png({ palette: true, colours: 256, dither: 0.6, compressionLevel: 9, effort: 10 }).toFile(out);
  console.log(`${out} ${statSync(out).size} B`);
} finally {
  rmSync(dir, { recursive: true, force: true });
}
