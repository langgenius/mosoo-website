// mosoo logo-outline geometry: the single source for public/brand/outline/*.svg
// and src/shared/ui/outline-paths.generated.ts. Ported from the staging
// study brand/outline/src/gen.mjs (2026-10-19); the geometry is unchanged.
// Mark source: public/brand/logo-mark.svg
//   block  M68.15,16.64 H16.64 c.93,5.95 1.47,12.97 1.47,20.48 s-.54,14.52 -1.47,20.48 h51.51 ...  (51.51 x 40.96, sides concave by 1.47)
//   bar    rect 16.64,61.23 51.51 x 6.93   (gap 3.63 under the block; block+gap+bar = 51.52 = a square)
// Run: node apps/landing/scripts/assets/outline.mjs
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, "..", "..", "public", "brand", "outline");
mkdirSync(out, { recursive: true });

export const M = { w: 51.51, h: 40.96, sag: 1.47, gap: 3.63, barH: 6.93 };
M.barMid = M.h + M.gap; // 44.59: the line sits where the bar's top edge was, so the mark's gap (3.63) is kept
M.box = M.h + M.gap + M.barH; // 51.52
// control-point ratios read off the original cubic (c.93,5.95 1.47,12.97 1.47,20.48 over half-height 20.48)
const K1 = 0.93 / 1.47, K2 = 5.95 / 20.48, K3 = 12.97 / 20.48;
const r = (n) => +n.toFixed(3);

export function block(x, y, w, h, s) {
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

// nested: level k grows by band b on top + both sides, bottoms shared (Enter's arches share the floor:
// refs/devices/crops/enter-pro-nested-arches.jpg, all three arches end at y=1098 in probe-07).
// sag scales with width so every level is the same form (Enter's levels are all semicircles).
export function nested(levels = 3, bandRatio = 0.22) {
  const b = M.w * bandRatio;
  const outerW = M.w + 2 * b * (levels - 1);
  const outerH = M.h + b * (levels - 1);
  const shapes = [];
  for (let k = levels - 1; k >= 0; k--) {
    const w = M.w + 2 * b * k, h = M.h + b * k;
    const x = (outerW - w) / 2, y = outerH - h;
    shapes.push({ k, x, y, w, h, s: M.sag * (w / M.w), d: block(x, y, w, h, M.sag * (w / M.w)) });
  }
  return { b, outerW, outerH, baseY: outerH + M.gap, shapes };
}

const svg = (vb, w, h, body, extra = "") =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${r(w)}" height="${r(h)}" fill="none"${extra}>\n${body}\n</svg>\n`;

// 1. single-stroke outline at fixed sizes. size = rendered width of the mark (block width).
//    weights are CSS px; stroke-width is converted to user units so the file is exact as <img>.
const WEIGHTS = { 24: 0.5, 48: 0.75, 96: 1, 160: 1, 240: 1.25, 480: 1.5 };
const pad = 1.2;
for (const [size, wpx] of Object.entries(WEIGHTS)) {
  const k = size / M.w; // px per unit
  const sw = wpx / k;
  const vbW = M.w + 2 * pad, vbH = M.barMid + 2 * pad;
  const body =
    `  <path d="${block(pad, pad, M.w, M.h, M.sag)}" stroke="currentColor" stroke-width="${r(sw)}"/>\n` +
    `  <path d="M${r(pad)} ${r(pad + M.barMid)}H${r(pad + M.w)}" stroke="currentColor" stroke-width="${r(sw)}"/>`;
  writeFileSync(join(out, `outline-${size}.svg`), svg(`0 0 ${r(vbW)} ${r(vbH)}`, vbW * k, vbH * k, body, ` color="#1a1a1c"`));
}
// 2. nested three-level (outline) at 480 px outer width
{
  const n = nested(3);
  const size = 480, k = size / n.outerW, sw = 1.5 / k, p = 1;
  const vbW = n.outerW + 2 * p, vbH = n.baseY + 2 * p;
  const body =
    n.shapes.map((s) => `  <path d="${block(s.x + p, s.y + p, s.w, s.h, s.s)}" stroke="currentColor" stroke-width="${r(sw)}"/>`).join("\n") +
    `\n  <path d="M${p} ${r(n.baseY + p)}H${r(n.outerW + p)}" stroke="currentColor" stroke-width="${r(sw)}"/>`;
  writeFileSync(join(out, `nested-3.svg`), svg(`0 0 ${r(vbW)} ${r(vbH)}`, vbW * k, vbH * k, body, ` color="#1a1a1c"`));
}

// 3. portal mask: the block, filled, tight viewBox (use with mask-image + mask-size)
writeFileSync(
  join(out, "portal-mask.svg"),
  svg(`0 0 ${M.w} ${M.h}`, M.w * 4, M.h * 4, `  <path d="${block(0, 0, M.w, M.h, M.sag)}" fill="#000"/>`, ` preserveAspectRatio="none"`),
);

// 4. session line: the bar becomes a 1px line; a 28px block outline stands on it once.
{
  const W = 960, bw = 28, k = bw / M.w, bh = M.h * k, gap = M.gap * k, y = 0.5 + bh + gap;
  const x0 = 640;
  const body =
    `  <path d="M0 ${r(y)}H${W}" stroke="currentColor" stroke-width="1"/>\n` +
    `  <path d="${block(x0, 0.5, bw, bh, M.sag * k)}" stroke="currentColor" stroke-width="1"/>`;
  writeFileSync(join(out, "session-line.svg"), svg(`0 0 ${W} ${r(y + 1)}`, W, y + 1, body, ` color="#1a1a1c"`));
}

// 5. FAQ indicator (closed / open): 10 px block, 1 px stroke; open = filled
for (const open of [false, true]) {
  const bw = 10, k = bw / M.w, bh = M.h * k;
  const body = `  <path d="${block(0.5, 0.5, bw, bh, M.sag * k)}" stroke="currentColor" stroke-width="1"${open ? ' fill="currentColor"' : ""}/>`;
  writeFileSync(join(out, `faq-indicator-${open ? "open" : "closed"}.svg`), svg(`0 0 11 ${r(bh + 1)}`, 11, bh + 1, body, ` color="#1a1a1c"`));
}

// path data for inline SVG in the page (same geometry as the files above)
const n3 = nested(3);
{
  const p = 1;
  const win = { vb: [r(M.w + 2.4), r(M.barMid + 2.4)], block: block(1.2, 1.2, M.w, M.h, M.sag), line: `M1.2 ${r(1.2 + M.barMid)}H${r(1.2 + M.w)}` };
  const nest = {
    vb: [r(n3.outerW + 2 * p), r(n3.baseY + 2 * p)],
    blocks: n3.shapes.map((s) => block(s.x + p, s.y + p, s.w, s.h, s.s)),
    line: `M${p} ${r(n3.baseY + p)}H${r(n3.outerW + p)}`,
    inner: n3.shapes.at(-1),
  };
  const faq = { vb: [11, r(M.h * (10 / M.w) + 1)], block: block(0.5, 0.5, 10, M.h * (10 / M.w), M.sag * (10 / M.w)) };
  const ts =
    "// Generated by apps/landing/scripts/assets/outline.mjs. Do not edit.\n" +
    `export const OUTLINE_WINDOW = ${JSON.stringify(win)} as const;\n` +
    `export const OUTLINE_NESTED = ${JSON.stringify(nest)} as const;\n` +
    `export const OUTLINE_FAQ = ${JSON.stringify(faq)} as const;\n`;
  writeFileSync(join(here, "..", "..", "src", "shared", "ui", "outline-paths.generated.ts"), ts);
}
console.log("ok", { band: r(n3.b), outerW: r(n3.outerW), outerH: r(n3.outerH), baseY: r(n3.baseY) });
