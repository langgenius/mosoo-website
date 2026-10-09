// Helpers for LIVE covers: SVG that ships into the website with native <text>
// (site web fonts via CSS classes) and data-el hooks for the Motion runtime.
import { measure } from "./fonts.mjs";
import { roundedRectPath, squirclePath } from "./geometry.mjs";
import { icon } from "./icons.mjs";
import { el, esc, n } from "./svg.mjs";

export function createLive({ tokens }) {
  const C = tokens.color;

  /** Native text. cls: cv-mono | cv-sans | cv-display */
  function text({ x, y, value, cls = "cv-sans", size = 24, weight = 400, fill = C.ink.onDark, opacity = null, anchor = "start", spacing = null, hook = null, attrs = {} }) {
    return el(
      "text",
      {
        x,
        y,
        class: cls,
        "font-size": size,
        "font-weight": weight,
        fill,
        "fill-opacity": opacity,
        "text-anchor": anchor === "start" ? null : anchor,
        "letter-spacing": spacing,
        "data-el": hook,
        ...attrs,
      },
      esc(value),
    );
  }

  /** Width of a string in Geist / Geist Mono (same metrics as the site fonts). */
  const width = (value, size, { mono = false, weight = 400 } = {}) => measure(mono ? "mono" : "sans", tokens, value, size, { weight });

  function panel({ x, y, w, h, r = 28, fill = C.surface.slab, stroke = "#FFFFFF", strokeOpacity = 0.1, hook = null, children = "" }) {
    const d = roundedRectPath(x, y, w, h, r);
    return el("g", { "data-el": hook }, [
      el("path", { d, fill }),
      children,
      el("path", { d, fill: "none", stroke, "stroke-opacity": strokeOpacity, "stroke-width": 1.5 }),
    ]);
  }

  /** Frosted glass plaque: translucent body, top sheen, bright hairline. */
  function glass({ x, y, w, h, r = 36, defs, idKey = "glass", hook = null, children = "" }) {
    const d = roundedRectPath(x, y, w, h, r);
    const sheen = defs.use(`${idKey}-sheen`, (id) =>
      el("linearGradient", { id, x1: 0, y1: 0, x2: 0, y2: 1 }, [
        el("stop", { offset: 0, "stop-color": "#FFFFFF", "stop-opacity": 0.22 }),
        el("stop", { offset: 0.45, "stop-color": "#FFFFFF", "stop-opacity": 0.06 }),
        el("stop", { offset: 1, "stop-color": "#FFFFFF", "stop-opacity": 0.1 }),
      ]),
    );
    return el("g", { "data-el": hook }, [
      el("path", { d, fill: C.stage.ink, "fill-opacity": 0.34 }),
      el("path", { d, fill: `url(#${sheen})` }),
      children,
      el("path", { d, fill: "none", stroke: "#FFFFFF", "stroke-opacity": 0.34, "stroke-width": 1.5 }),
    ]);
  }

  function tile({ cx, cy, size, iconName, iconSize = null, fill = C.surface.tile, stroke = C.ink.strong, hook = null }) {
    const d = squirclePath(cx, cy, size);
    return el("g", { "data-el": hook }, [
      el("path", { d, fill }),
      el("path", { d, fill: "none", stroke: C.ink.strong, "stroke-opacity": 0.08, "stroke-width": 1.5 }),
      iconName ? icon(iconName, cx, cy, iconSize ?? size * 0.44, { stroke, width: 1.8 }) : "",
    ]);
  }

  function pill({ x, y, w, h, fill, opacity = null, stroke = null, strokeOpacity = null, hook = null, children = "" }) {
    return el("g", { "data-el": hook }, [
      el("rect", { x, y, width: w, height: h, rx: h / 2, fill, "fill-opacity": opacity, stroke, "stroke-opacity": strokeOpacity, "stroke-width": stroke ? 1.5 : null }),
      children,
    ]);
  }

  /** A travelling light packet: soft halo + bright core, positioned at 0,0 of its own group. */
  function packet({ x, y, hook, defs, r = 9 }) {
    const halo = defs.use("packet-halo", (id) =>
      el("radialGradient", { id }, [
        el("stop", { offset: 0, "stop-color": C.lime[300], "stop-opacity": 0.9 }),
        el("stop", { offset: 0.35, "stop-color": C.lime[500], "stop-opacity": 0.5 }),
        el("stop", { offset: 1, "stop-color": C.lime[500], "stop-opacity": 0 }),
      ]),
    );
    return el("g", { "data-el": hook, class: "cv-packet", transform: `translate(${n(x)} ${n(y)})` }, [
      el("g", { "data-el": `${hook}-body` }, [el("circle", { r: r * 3.6, fill: `url(#${halo})` }), el("circle", { r, fill: C.lime[300] }), el("circle", { r: r * 0.5, fill: "#FFFFFF" })]),
    ]);
  }

  const line = (points, { opacity = 0.34, dashed = false, width: sw = 2 } = {}) =>
    el("path", {
      d: points.map((p, i) => `${i === 0 ? "M" : "L"}${n(p[0])} ${n(p[1])}`).join(""),
      fill: "none",
      stroke: C.ink.onDark,
      "stroke-opacity": opacity,
      "stroke-width": sw,
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "stroke-dasharray": dashed ? "2 9" : null,
    });

  return { text, width, panel, glass, tile, pill, packet, line, icon };
}
