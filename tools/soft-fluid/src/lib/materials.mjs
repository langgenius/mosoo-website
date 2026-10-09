// Shared "soft + fluid" materials. Everything a scene needs to stay inside one
// visual family: stage, bloom, grain, tile, chip, slab, pill, connector.
import { blobPath, roundedPolyline, roundedRectPath, squirclePath } from "./geometry.mjs";
import { icon } from "./icons.mjs";
import { rng } from "./prng.mjs";
import { el, n } from "./svg.mjs";

const DARK_STAGES = new Set(["charcoal", "ink"]);

export function createMaterials({ tokens, defs, seed, width, height }) {
  const C = tokens.color;
  const M = tokens.material;
  const W = width ?? tokens.meta.canvas.width;
  const H = height ?? tokens.meta.canvas.height;

  const blurFilter = (std) =>
    defs.use(`blur-${String(std).replace(".", "_")}`, (id) =>
      el(
        "filter",
        { id, x: -W, y: -H, width: W * 3, height: H * 3, filterUnits: "userSpaceOnUse", "color-interpolation-filters": "sRGB" },
        el("feGaussianBlur", { stdDeviation: std }),
      ),
    );

  // Fluid filter: low-frequency turbulence warps the blob outline (wispy edge),
  // a gaussian blur softens it, then a second, slower noise field modulates the
  // density so the bloom has thin and thick passages instead of a flat fill.
  const fluidFilter = (key, std, seeds, scale, frequency, density) =>
    defs.use(`fluid-${key}`, (id) =>
      el(
        "filter",
        { id, x: -W, y: -H, width: W * 3, height: H * 3, filterUnits: "userSpaceOnUse", "color-interpolation-filters": "sRGB" },
        [
          el("feTurbulence", {
            type: "fractalNoise",
            baseFrequency: frequency,
            numOctaves: M.bloom.displace.octaves,
            seed: seeds[0],
            result: "field",
          }),
          el("feDisplacementMap", {
            in: "SourceGraphic",
            in2: "field",
            scale,
            xChannelSelector: "R",
            yChannelSelector: "G",
            result: "warped",
          }),
          el("feGaussianBlur", { in: "warped", stdDeviation: std, result: "soft" }),
          el("feTurbulence", {
            type: "fractalNoise",
            baseFrequency: `${n(frequency * 0.62)} ${n(frequency * 0.9)}`,
            numOctaves: 3,
            seed: seeds[1],
            result: "veil",
          }),
          el("feColorMatrix", {
            in: "veil",
            type: "matrix",
            values: `0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 ${n(density.gain)} 0 0 0 ${n(density.bias)}`,
            result: "density",
          }),
          el("feComposite", { in: "soft", in2: "density", operator: "in" }),
        ],
      ),
    );

  /** Full-canvas stage with a barely-there light falloff so large fields never look flat. */
  function stage(kind) {
    const dark = DARK_STAGES.has(kind);
    const base = C.stage[kind];
    if (!base) throw new Error(`Unknown stage: ${kind}`);
    const lightId = defs.use(`stage-light-${kind}`, (id) =>
      el("radialGradient", { id, cx: 0.3, cy: 0.12, r: 1.05, gradientUnits: "objectBoundingBox" }, [
        el("stop", { offset: 0, "stop-color": dark ? "#FFFFFF" : "#FFFFFF", "stop-opacity": dark ? 0.07 : 0.5 }),
        el("stop", { offset: 0.55, "stop-color": "#FFFFFF", "stop-opacity": 0 }),
      ]),
    );
    const shadeId = defs.use(`stage-shade-${kind}`, (id) =>
      el("radialGradient", { id, cx: 0.5, cy: 0.46, r: 0.86, gradientUnits: "objectBoundingBox" }, [
        el("stop", { offset: 0.55, "stop-color": C.ink.strong, "stop-opacity": 0 }),
        el("stop", { offset: 1, "stop-color": C.ink.strong, "stop-opacity": dark ? 0.42 : 0.1 }),
      ]),
    );
    return [
      el("rect", { width: W, height: H, fill: base }),
      el("rect", { width: W, height: H, fill: `url(#${lightId})` }),
      el("rect", { width: W, height: H, fill: `url(#${shadeId})` }),
    ].join("");
  }

  /**
   * Organic lime bloom. `shapes` are blobs; each is rendered as halo + body + core
   * (+ a moss shade on light stages) and warped by low-frequency turbulence so the
   * edge reads as fluid rather than as a blurred ellipse.
   */
  function bloom({ key, shapes, tone = "light", strength: strengthIn = 1, tint = "full" }) {
    const random = rng(`${seed}:bloom:${key}`);
    const dark = tone === "dark";
    const B = M.bloom;
    const strength = strengthIn * (dark ? B.darkStrength : 1);
    // "quiet": pale, low-contrast wash for calm editorial stages — the pure brand
    // lime is then reserved for small focused accents in the structure layer.
    const quiet = tint === "quiet";
    const layers = { halo: [], body: [], shade: [], core: [] };
    shapes.forEach((shape, index) => {
      const r = rng(`${seed}:bloom:${key}:${index}`);
      const { cx, cy, rx, ry, rotate = 0, jitter = 0.24, points = 9, weight = 1 } = shape;
      layers.halo.push(
        el("path", {
          d: blobPath(r, cx, cy, rx * 1.22, ry * 1.22, { points, jitter: jitter * 0.7, rotate }),
          fill: dark ? C.lime[700] : quiet ? C.lime[200] : C.lime[300],
          "fill-opacity": B.opacity.halo * weight * strength * (dark ? 0.9 : 1),
        }),
      );
      layers.body.push(
        el("path", {
          d: blobPath(r, cx, cy, rx * 0.86, ry * 0.86, { points, jitter, rotate }),
          fill: quiet ? C.lime[300] : C.lime[500],
          "fill-opacity": Math.min(1, B.opacity.body * weight * strength * (dark ? 0.78 : 1)),
        }),
      );
      if (!dark && !quiet) {
        layers.shade.push(
          el("path", {
            d: blobPath(r, cx + rx * 0.16, cy + ry * 0.3, rx * 0.42, ry * 0.36, { points: 7, jitter: 0.3, rotate }),
            fill: C.lime[600],
            "fill-opacity": 0.3 * weight * strength,
          }),
        );
      }
      layers.core.push(
        el("path", {
          d: blobPath(r, cx - rx * 0.14, cy - ry * 0.16, rx * 0.44, ry * 0.4, { points: 7, jitter: 0.28, rotate }),
          fill: dark ? C.lime[400] : quiet ? C.lime[100] : C.lime[300],
          "fill-opacity": Math.min(1, B.opacity.core * weight * strength * (dark ? 0.5 : 0.8)),
        }),
      );
    });
    const freq = B.displace.baseFrequency;
    const seeds = () => [random.turbulenceSeed(), random.turbulenceSeed()];
    const haloF = fluidFilter(`${key}-halo`, B.blur.halo, seeds(), B.displace.scale * 1.15, freq * 0.8, B.density.halo);
    const bodyF = fluidFilter(`${key}-body`, B.blur.body, seeds(), B.displace.scale, freq, B.density.body);
    const coreF = fluidFilter(`${key}-core`, B.blur.core * 1.5, seeds(), B.displace.scale * 0.8, freq * 1.5, B.density.core);
    return el("g", { "data-layer": "bloom" }, [
      el("g", { filter: `url(#${haloF})` }, layers.halo),
      el("g", { filter: `url(#${bodyF})` }, layers.body),
      layers.shade.length ? el("g", { filter: `url(#${bodyF})` }, layers.shade) : "",
      el("g", { filter: `url(#${coreF})` }, layers.core),
    ]);
  }

  /** Film grain: dark + light speckle, plain alpha compositing (no blend modes). */
  function grain(kind) {
    const dark = DARK_STAGES.has(kind);
    const G = M.grain;
    const random = rng(`${seed}:grain`);
    const make = (key, color, gain, bias) =>
      defs.use(`grain-${key}`, (id) =>
        el(
          "filter",
          { id, x: 0, y: 0, width: W, height: H, filterUnits: "userSpaceOnUse", "color-interpolation-filters": "sRGB" },
          [
            el("feTurbulence", {
              type: "fractalNoise",
              baseFrequency: G.baseFrequency,
              numOctaves: G.octaves,
              seed: random.turbulenceSeed(),
              stitchTiles: "stitch",
              result: "noise",
            }),
            el("feColorMatrix", {
              in: "noise",
              type: "matrix",
              values: `0 0 0 0 ${color[0]} 0 0 0 0 ${color[1]} 0 0 0 0 ${color[2]} ${n(gain)} 0 0 0 ${n(bias)}`,
            }),
          ],
        ),
      );
    const darkSpeck = make("dark", [0.06, 0.07, 0.055], 2.4, -1.1);
    const lightSpeck = make("light", [1, 1, 0.97], 2.4, -1.1);
    return el("g", { "data-layer": "grain" }, [
      el("rect", { width: W, height: H, filter: `url(#${darkSpeck})`, opacity: dark ? G.darkOpacity * 1.4 : G.lightOpacity * 1.5 }),
      el("rect", { width: W, height: H, filter: `url(#${lightSpeck})`, opacity: dark ? G.darkOpacity * 0.55 : G.lightOpacity * 1.6 }),
    ]);
  }

  function shadowFor(d, tone, scale = 1, transform = null) {
    const dark = tone === "dark";
    return M.tile.shadow
      .map((s) =>
        el("path", {
          d,
          transform: `translate(0 ${n(s.dy * scale)})${transform ? ` ${transform}` : ""}`,
          fill: dark ? "#000000" : C.ink.strong,
          "fill-opacity": Math.min(0.85, s.opacity * (dark ? 2.3 : 1)),
          filter: `url(#${blurFilter(Math.max(2, Math.round(s.blur * scale)))})`,
        }),
      )
      .join("");
  }

  /** Signature warm-white squircle tile with optional icon. */
  function tile({ cx, cy, size, iconName = null, iconSize = null, tone = "light", fill = null, iconStroke = null, id = null, shadow = true }) {
    const d = squirclePath(cx, cy, size);
    const sheenId = defs.use("tile-sheen", (gid) =>
      el("linearGradient", { id: gid, x1: 0, y1: 0, x2: 0, y2: 1 }, [
        el("stop", { offset: 0, "stop-color": "#FFFFFF", "stop-opacity": 0.95 }),
        el("stop", { offset: 0.6, "stop-color": "#FFFFFF", "stop-opacity": 0 }),
      ]),
    );
    const scale = Math.max(0.35, size / 220);
    return el("g", { id, "data-part": "tile" }, [
      shadow ? shadowFor(d, tone, scale) : "",
      el("path", { d, fill: fill ?? C.surface.tile }),
      fill ? "" : el("path", { d, fill: `url(#${sheenId})` }),
      el("path", { d, fill: "none", stroke: C.ink.strong, "stroke-opacity": 0.07, "stroke-width": 1.5 }),
      iconName
        ? icon(iconName, cx, cy, iconSize ?? size * 0.42, { stroke: iconStroke ?? C.ink.strong, width: 1.7 })
        : "",
    ]);
  }

  /** Charcoal UI slab (cropped functional-UI motif). Content is drawn by the scene. */
  function slab({ x, y, w, h, r = M.slab.radius, tone = "light", fill = null, id = null, shadow = true, children = "" }) {
    const d = roundedRectPath(x, y, w, h, r);
    const clipId = defs.use(`slab-clip-${n(x)}-${n(y)}-${n(w)}-${n(h)}`, (cid) => el("clipPath", { id: cid }, el("path", { d })));
    return el("g", { id, "data-part": "slab" }, [
      shadow ? shadowFor(d, tone, 1.1) : "",
      el("path", { d, fill: fill ?? C.surface.slab }),
      el("g", { "clip-path": `url(#${clipId})` }, children),
      el("path", { d, fill: "none", stroke: "#FFFFFF", "stroke-opacity": M.slab.hairline, "stroke-width": 1.5 }),
    ]);
  }

  const bar = (x, y, w, h, fill, opacity = null) => el("rect", { x, y, width: w, height: h, rx: h / 2, fill, "fill-opacity": opacity });

  /** Fine connector with optional end dots / arrow head. */
  function connector({ points, tone = "light", dashed = false, arrow = false, startDot = true, endDot = false, opacity = null, radius = 22, id = null, color = null }) {
    const dark = tone === "dark";
    const stroke = color ?? (dark ? C.ink.onDark : C.ink.strong);
    const alpha = opacity ?? (dark ? 0.5 : 0.62);
    const d = roundedPolyline(points, radius);
    const parts = [
      el("path", {
        d,
        fill: "none",
        stroke,
        "stroke-opacity": alpha,
        "stroke-width": M.connector.width,
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        "stroke-dasharray": dashed ? M.connector.dash : null,
      }),
    ];
    const [sx, sy] = points[0];
    const [ex, ey] = points[points.length - 1];
    if (startDot) parts.push(el("circle", { cx: sx, cy: sy, r: M.connector.dot, fill: stroke, "fill-opacity": Math.min(1, alpha + 0.2) }));
    if (endDot) parts.push(el("circle", { cx: ex, cy: ey, r: M.connector.dot, fill: stroke, "fill-opacity": Math.min(1, alpha + 0.2) }));
    if (arrow) {
      const [px, py] = points[points.length - 2];
      const ang = Math.atan2(ey - py, ex - px);
      const size = 11;
      const a1 = ang + Math.PI - 0.5;
      const a2 = ang + Math.PI + 0.5;
      parts.push(
        el("path", {
          d: `M${n(ex + Math.cos(a1) * size)} ${n(ey + Math.sin(a1) * size)}L${n(ex)} ${n(ey)}L${n(ex + Math.cos(a2) * size)} ${n(ey + Math.sin(a2) * size)}`,
          fill: "none",
          stroke,
          "stroke-opacity": Math.min(1, alpha + 0.15),
          "stroke-width": M.connector.width,
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
        }),
      );
    }
    return el("g", { id, "data-part": "connector" }, parts);
  }

  /** Capsule. */
  function pill({ x, y, w, h, fill, opacity = null, stroke = null, strokeOpacity = null, dashed = false, id = null, children = "" }) {
    return el("g", { id, "data-part": "pill" }, [
      el("rect", {
        x,
        y,
        width: w,
        height: h,
        rx: h / 2,
        fill,
        "fill-opacity": opacity,
        stroke,
        "stroke-opacity": strokeOpacity,
        "stroke-width": stroke ? 1.5 : null,
        "stroke-dasharray": dashed ? "5 6" : null,
      }),
      children,
    ]);
  }

  return { stage, bloom, grain, tile, slab, bar, connector, pill, shadowFor, blurFilter, W, H, isDark: (k) => DARK_STAGES.has(k) };
}
