// Font loading, measuring and outlining (text -> <path>) with opentype.js.
// Static exports outline every label so SVG/PNG output never depends on the
// fonts installed on the machine that views or rasterises it.
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import opentype from "opentype.js";
import { el, esc, n } from "./svg.mjs";

const require = createRequire(import.meta.url);
const cache = new Map();

function fontFile(pkg, base, weight, style) {
  const dir = join(dirname(require.resolve(`@fontsource/${pkg}/package.json`)), "files");
  return join(dir, `${base}-latin-${weight}-${style}.woff`);
}

export function loadFont(role, tokens, { weight = 400, style = "normal" } = {}) {
  const spec = tokens.type[role];
  if (!spec) throw new Error(`Unknown font role: ${role}`);
  const key = `${role}:${weight}:${style}`;
  if (!cache.has(key)) {
    const file = fontFile(spec.file, spec.file, weight, style);
    const buf = readFileSync(file);
    const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
    cache.set(key, { font, file, spec });
  }
  return cache.get(key);
}

export function measure(role, tokens, text, size, { weight = 400, style = "normal", letterSpacing = 0 } = {}) {
  const { font } = loadFont(role, tokens, { weight, style });
  if (role === "hand") return handRun(font, text, size).width + letterSpacing * size * Math.max(0, text.length - 1);
  return font.getAdvanceWidth(text, size) + letterSpacing * size * Math.max(0, text.length - 1);
}

// The new scene has only three ASCII hand-lettered labels. Outline the font's
// actual glyphs and kern pairs directly: opentype.js 2 cannot parse Shantell's
// contextual ccmp substitutions. Non-ASCII shaping is deliberately not implied.
function handRun(font, text, size) {
  if (!/^[\x20-\x7e]*$/.test(text)) throw new Error("Hand-lettered static labels must be ASCII.");
  const glyphs = [...text].map((c) => font.charToGlyph(c));
  let width = 0;
  const run = glyphs.map((glyph, i) => {
    const x = width;
    width += (glyph.advanceWidth + (glyphs[i + 1] ? font.getKerningValue(glyph, glyphs[i + 1]) : 0)) * size / font.unitsPerEm;
    return { glyph, x };
  });
  return { run, width };
}

/**
 * Text factory bound to a render mode.
 *  - "static": outlined <path> (deterministic, font-independent)
 *  - "live":   real <text> (crisp, selectable, accessible in the web demo)
 * Geometry (advance width, anchor maths) is computed from the same font file in
 * both modes, so layouts are identical.
 */
export function createText(tokens, mode) {
  return function text({
    x,
    y,
    value,
    role = "sans",
    size = 24,
    weight = 400,
    style = "normal",
    fill = "#141713",
    opacity = null,
    anchor = "start",
    letterSpacing = 0,
    attrs = {},
  }) {
    const width = measure(role, tokens, value, size, { weight, style, letterSpacing });
    const startX = anchor === "middle" ? x - width / 2 : anchor === "end" ? x - width : x;
    if (mode === "live") {
      const spec = tokens.type[role];
      const family = `'${spec.cssFamily ?? spec.family}', ${spec.fallback}`;
      return el(
        "text",
        {
          x: startX,
          y,
          fill,
          "fill-opacity": opacity,
          "font-family": family,
          "font-size": size,
          "font-weight": weight,
          "font-style": style === "italic" ? "italic" : null,
          "letter-spacing": letterSpacing ? `${n(letterSpacing)}em` : null,
          ...attrs,
        },
        esc(value),
      );
    }
    const { font } = loadFont(role, tokens, { weight, style });
    const d = role === "hand"
      ? handRun(font, value, size).run.map(({ glyph, x: dx }, i) => {
          const path = glyph.getPath(startX + dx + i * letterSpacing * size, y, size, {}, font);
          // Avoid exponent-form floating point tails in opentype's SVG rounding.
          for (const command of path.commands) for (const key of Object.keys(command)) {
            if (typeof command[key] === "number") command[key] = Number(command[key].toFixed(5));
          }
          return path.toPathData(2);
        }).join("")
      : font.getPath(value, startX, y, size, { letterSpacing, kerning: true }).toPathData(2);
    if (/NaN|Infinity/.test(d)) throw new Error(`Invalid outlined text: ${value}`);
    return el("path", { d, fill, "fill-opacity": opacity, "aria-label": value, ...attrs });
  };
}
