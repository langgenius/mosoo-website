#!/usr/bin/env node
// mosoo logo-outline geometry for the v4b "Paper" home (UI-FORMS §d; brand/outline/README.md §2-§3).
//
//   node apps/landing/scripts/assets/outline.mjs
//
// Port of mosoo-website-redesign-staging/brand/outline/src/gen.mjs, cut to the three pieces this variant uses:
//   public/brand/outline/nested-3.svg          footer: three nested windows on one floor line (22% / 40% / 100%)
//   public/brand/outline/portal-mask.svg       the block, filled; masks the footer's dot field to the inner window
//   public/brand/outline/faq-indicator-*.svg   FAQ row indicator, 10 px block on a floor line, 1 px; open = filled
//   src/shared/chrome/outline-geometry.mjs     the same paths for inline SVG (currentColor) in the page chrome
// Deterministic: every number below comes from the mark, nothing is sampled.
//
// Mark source: apps/landing/public/brand/logo-mark.svg
//   block  51.51 x 40.96, left and right sides concave by 1.47   bar  51.51 x 6.93, 3.63 under the block
// The bar becomes a line at the bar's top edge (the gap stays 3.63), so the outline never reads as a culm and node.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const app = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const svgDir = join(app, "public", "brand", "outline");
const moduleFile = join(app, "src", "shared", "chrome", "outline-geometry.mjs");
mkdirSync(svgDir, { recursive: true });
mkdirSync(dirname(moduleFile), { recursive: true });

const M = { w: 51.51, h: 40.96, sag: 1.47, gap: 3.63 };
// Control-point ratios read off the original cubic (c.93,5.95 1.47,12.97 1.47,20.48 over half-height 20.48).
const K1 = 0.93 / 1.47;
const K2 = 5.95 / 20.48;
const K3 = 12.97 / 20.48;
const r = (n) => +n.toFixed(3);

function block(x, y, w, h, s) {
  const hh = h / 2;
  return [
    `M${r(x)} ${r(y)}H${r(x + w)}`,
    `C${r(x + w - K1 * s)} ${r(y + K2 * hh)} ${r(x + w - s)} ${r(y + K3 * hh)} ${r(x + w - s)} ${r(y + hh)}`,
    `C${r(x + w - s)} ${r(y + h - K3 * hh)} ${r(x + w - K1 * s)} ${r(y + h - K2 * hh)} ${r(x + w)} ${r(y + h)}`,
    `H${r(x)}`,
    `C${r(x + K1 * s)} ${r(y + h - K2 * hh)} ${r(x + s)} ${r(y + h - K3 * hh)} ${r(x + s)} ${r(y + hh)}`,
    `C${r(x + s)} ${r(y + K3 * hh)} ${r(x + K1 * s)} ${r(y + K2 * hh)} ${r(x)} ${r(y)}Z`,
  ].join("");
}

// Nested: level k grows by band b on top and both sides, bottoms shared (Enter Pro's arches share one floor,
// refs/devices/crops/enter-pro-nested-arches.jpg); the sag scales with width so every level is the same form.
const LEVELS = 3;
const BAND = M.w * 0.22;
const OPACITY = [1, 0.4, 0.22]; // inner to outer (UI-FORMS §d: 22% / 40% / 100%)
const outerW = M.w + 2 * BAND * (LEVELS - 1);
const outerH = M.h + BAND * (LEVELS - 1);
const pad = 1;
const vbW = outerW + 2 * pad;
const baseY = outerH + M.gap + pad;
const vbH = baseY + pad;
const layers = [];
for (let k = LEVELS - 1; k >= 0; k--) {
  const w = M.w + 2 * BAND * k;
  const h = M.h + BAND * k;
  const x = (outerW - w) / 2 + pad;
  const y = outerH - h + pad;
  layers.push({ d: block(x, y, w, h, M.sag * (w / M.w)), opacity: OPACITY[k], x: r(x), y: r(y), w: r(w), h: r(h) });
}
const inner = layers[layers.length - 1];
const base = `M${pad} ${r(baseY)}H${r(outerW + pad)}`;
const nestedViewBox = `0 0 ${r(vbW)} ${r(vbH)}`;

// 1px at any rendered size: the strokes do not scale with the viewBox.
const stroke = 'stroke="currentColor" stroke-width="1" vector-effect="non-scaling-stroke"';
const nestedBody = [
  ...layers.map((l) => `  <path d="${l.d}" ${stroke} stroke-opacity="${l.opacity}"/>`),
  `  <path d="${base}" ${stroke}/>`,
].join("\n");
writeFileSync(
  join(svgDir, "nested-3.svg"),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${nestedViewBox}" width="560" height="${r((560 * vbH) / vbW)}" fill="none" color="#1b1916">\n${nestedBody}\n</svg>\n`,
);

const maskD = block(0, 0, M.w, M.h, M.sag);
writeFileSync(
  join(svgDir, "portal-mask.svg"),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${M.w} ${M.h}" width="${r(M.w * 4)}" height="${r(M.h * 4)}" preserveAspectRatio="none">\n  <path d="${maskD}" fill="#000"/>\n</svg>\n`,
);

// FAQ indicator: 10 px block, 1 px stroke, standing on a floor line 2 px wider, 1 px under it (UI-FORMS §d: the
// window stands on its line). Without the line, the block alone reads as a checkbox at this size.
const fw = 10;
const fk = fw / M.w;
const fh = M.h * fk;
const faqD = block(1.5, 0.5, fw, fh, M.sag * fk);
const faqBase = `M0.5 ${r(fh + 2)}H12.5`;
const faqH = r(fh + 3);
const faqViewBox = `0 0 13 ${faqH}`;
for (const open of [false, true]) {
  writeFileSync(
    join(svgDir, `faq-indicator-${open ? "open" : "closed"}.svg`),
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${faqViewBox}" width="13" height="${faqH}" fill="none" color="#1b1916">\n  <path d="${faqD}" stroke="currentColor" stroke-width="1"${open ? ' fill="currentColor"' : ""}/>\n  <path d="${faqBase}" stroke="currentColor" stroke-width="1"/>\n</svg>\n`,
  );
}

const geometry = {
  nested: {
    viewBox: nestedViewBox,
    width: r(vbW),
    height: r(vbH),
    layers: layers.map(({ d, opacity }) => ({ d, opacity })),
    base,
    // The inner window's box in viewBox units, for the dot field that fills it.
    inner: { x: inner.x, y: inner.y, w: inner.w, h: inner.h },
  },
  faq: { viewBox: faqViewBox, d: faqD, base: faqBase },
};
writeFileSync(
  moduleFile,
  `// Generated by apps/landing/scripts/assets/outline.mjs. Do not edit.\nexport const OUTLINE = ${JSON.stringify(geometry, null, 2)};\n`,
);
console.log("ok", { band: r(BAND), outerW: r(outerW), viewBox: nestedViewBox, inner: geometry.nested.inner });
