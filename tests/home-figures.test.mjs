import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

// The full lime screen inlines T3's line figures (apps/landing/src/home/sections/accent.ts, FIGURES) so that the
// page's CSS can pause the Resume comet while it is off-screen. They are copies of what the generator writes
// (apps/landing/scripts/assets/linefig.mjs -> apps/landing/public/landing/v5/figures/<part>-<size>.svg): after
// re-running it, paste the files into FIGURES again. render() drops the Resume figure's own <style>, so its comet
// keyframes live in sections/accent.css and must keep the generator's timing. Since the 2026-10-20 graft the lime
// screen draws three of them (sandbox, files, resume); the five parts are the spec table's (sections/spec.ts), and the
// generator still writes harness-* and model-key-* with its alternates.

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const PARTS = ["sandbox", "files", "resume"];
const SIZES = [202, 160];

test("the accent section's inline figures are the generated SVG files, byte for byte", () => {
  const source = read("apps/landing/src/home/sections/accent.ts");
  const stale = [];
  for (const part of PARTS) {
    for (const size of SIZES) {
      const svg = read(`apps/landing/public/landing/v5/figures/${part}-${size}.svg`).replace(/\n$/, "");
      if (!source.includes(`\`${svg}\``)) stale.push(`${part}-${size}.svg`);
    }
  }
  assert.deepEqual(stale, [], "paste these files into FIGURES in sections/accent.ts again");
});

test("the Resume comet in accent.css runs on the generator's keyframes and timing", () => {
  const css = read("apps/landing/src/home/sections/accent.css");
  for (const size of SIZES) {
    const svg = read(`apps/landing/public/landing/v5/figures/resume-${size}.svg`);
    const style = /<style>([\s\S]*?)<\/style>/.exec(svg)?.[1] ?? "";
    const offsets = [...style.matchAll(/stroke-dashoffset:\s*(-?[\d.]+)/g)].map((match) => Number(match[1]));
    const timing = new RegExp(`\\.lfc${size}\\{animation:lfc${size} ([\\d.]+s) (\\w+) infinite\\}`).exec(style);
    assert.deepEqual(offsets, [0, -100], `resume-${size}.svg keyframes`);
    assert.ok(timing, `resume-${size}.svg animation`);
    assert.match(css, new RegExp(`animation: v5-acc-comet ${timing[1].replace(".", "\\.")} ${timing[2]} infinite;`));
  }
  assert.match(css, /@keyframes v5-acc-comet \{\s*from \{\s*stroke-dashoffset: 0;\s*\}\s*to \{\s*stroke-dashoffset: -100;\s*\}\s*\}/);
});
