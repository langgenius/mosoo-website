// v5 social card (1200 x 630), the og:image / twitter:image of the home, the blog's default and the subpages (status,
// use cases, pricing).
// Run (repo root): node apps/landing/scripts/assets/social-card-v5.mjs
//   CHROME=<Chrome or Chrome for Testing binary> overrides the default macOS Google Chrome path.
// Writes apps/landing/public/brand/social-card-v5-20261020.png and prints its size and SHA-256.
//
// The v5 language (staging production/v5/BRIEF.md §3): one white paper sheet on the #F4F4F4 frame, the black
// lockup top left (public/brand/v5/logo-nav.svg), the home's two-tone serif line (Hedvig Letters Serif 400, the
// second line in ink-3), and one lime element: the hero's CTA with Frame's light-lime glow. No photograph, no
// green logo, no lime text or lime line on white. Replaces the bamboo photo cards (REVIEW-v4 §6.2).
// How: a 1200 x 630 HTML page with the fonts and the lockup inlined, shot by headless Chrome at device scale 1
// (Chrome lays out the type exactly as the site does), then written as a palette PNG by sharp (the repo's own
// copy, lib.mjs). Same Chrome and inputs give the same pixels; a new card gets a new dated file name, so social
// caches that kept an old card cannot serve it under this URL. One exception: the CTA's face followed the site from
// Inter to Hanken Grotesk on 2026-10-20 and the card was redrawn under the same name, because it had never been
// published (https://mosoo.ai/brand/social-card-v5-20261020.png answered 404 that day).

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { LANDING, sharp } from "./lib.mjs";

const OUT = join(LANDING, "public", "brand", "social-card-v5-20261020.png");
const CHROME = process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const W = 1200;
const H = 630;

// The home's H1 and lime CTA (apps/landing/src/home/copy/hero.json en: h1a, h1b, primary). The v5 content phase
// kept v4d's H1, so the card already says it. If the hero line changes, change these three strings, regenerate,
// and give the file a new date (and update with it the og:image of index.html, status.html, use-cases.html and
// pricing.html, the blog's BaseLayout.astro default, the home's imageAlt in scripts/landing-locales.mjs and the
// blog's ogImageAlt).
const COPY = {
  line1: "Run agents from your backend.",
  line2: "Continue them days later.",
  cta: "Try mosoo",
};

// v5 tokens (BRIEF §3.1).
const INK = "#161815";
const INK_3 = "#7f817e";
const FRAME = "#f4f4f4";
const PAPER = "#ffffff";
const ACCENT = "#bcf870";
const ACCENT_TINT = "#deffb5";

const PUBLIC = join(LANDING, "public");
const fontUri = (file) =>
  `data:font/woff2;base64,${readFileSync(join(PUBLIC, "fonts", file)).toString("base64")}`;
// The lockup is already ink; inline it so nothing loads over the network.
const lockup = readFileSync(join(PUBLIC, "brand", "v5", "logo-nav.svg"), "utf8")
  .replace(/<!--[\s\S]*?-->\s*/g, "")
  .replace(/ width="[^"]*" height="[^"]*"/, "")
  .replace("<svg ", '<svg class="logo" aria-hidden="true" ');

// Sizes are the site's v5 values scaled for a card seen at about half size in a feed: the lockup 20 -> 30 px,
// the hero H1 72 px (d-object .d-h1, -0.03em), the button 40 -> 56 px (radius 10 -> 14, text 14.5 -> 21 px,
// glow 0 4px 24px -> 0 6px 32px). The display face carries app.css's "Display Fallback" metric overrides.
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><style>
@font-face { font-family: "Card Display"; src: url("${fontUri("HedvigLettersSerif-Regular-latin.woff2")}") format("woff2");
  font-weight: 400; font-display: block; size-adjust: 96%; ascent-override: 100%; descent-override: 28.125%; line-gap-override: 0%; }
@font-face { font-family: "Card Sans"; src: url("${fontUri("HankenGrotesk-latin.woff2")}") format("woff2");
  font-weight: 100 900; font-display: block; }
html, body { margin: 0; width: ${W}px; height: ${H}px; overflow: hidden; background: ${FRAME}; }
.paper { position: absolute; inset: 24px; border-radius: 16px; background: ${PAPER}; }
.logo { position: absolute; left: 64px; top: 56px; display: block; height: 30px; width: auto; }
h1 { position: absolute; left: 64px; right: 48px; top: 196px; margin: 0; color: ${INK};
  font: 400 72px/1.02 "Card Display"; letter-spacing: -0.03em; font-synthesis: none; }
h1 span { display: block; color: ${INK_3}; }
.cta { position: absolute; left: 64px; top: 396px; display: flex; align-items: center; height: 56px; padding: 0 25px;
  border-radius: 14px; background: ${ACCENT}; box-shadow: 0 6px 32px ${ACCENT_TINT}; color: ${INK};
  font: 500 21px/1 "Card Sans"; letter-spacing: -0.005em; }
</style></head><body><div class="paper">${lockup}<h1>${COPY.line1}<span>${COPY.line2}</span></h1><div class="cta">${COPY.cta}</div></div></body></html>`;

const dir = mkdtempSync(join(tmpdir(), "social-card-v5-"));
try {
  const page = join(dir, "card.html");
  const shot = join(dir, "card.png");
  writeFileSync(page, html);
  execFileSync(CHROME, [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--no-first-run",
    "--no-default-browser-check",
    `--user-data-dir=${join(dir, "profile")}`,
    "--force-device-scale-factor=1",
    `--window-size=${W},${H}`,
    "--virtual-time-budget=5000",
    `--screenshot=${shot}`,
    `file://${page}`,
  ], { stdio: "ignore" });
  const { width, height } = await sharp(shot).metadata();
  if (width !== W || height !== H) throw new Error(`Chrome shot ${width}x${height}, expected ${W}x${H}`);
  // A palette PNG keeps the flat paper, the type's anti-aliasing and the glow (measured: no visible banding).
  await sharp(shot).png({ palette: true, colours: 256, dither: 0.5, compressionLevel: 9, effort: 10 }).toFile(OUT);
  const bytes = readFileSync(OUT);
  console.log(
    JSON.stringify({
      out: OUT.slice(LANDING.length + 1),
      width: W,
      height: H,
      bytes: bytes.length,
      sha256: createHash("sha256").update(bytes).digest("hex"),
      chrome: execFileSync(CHROME, ["--version"], { encoding: "utf8" }).trim(),
    }),
  );
} finally {
  rmSync(dir, { recursive: true, force: true });
}
