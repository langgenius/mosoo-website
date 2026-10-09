// Minimal, dependency-free SVG string builder with deterministic number output.

/**
 * Deterministic number formatting: 2 decimals for coordinates, 4 decimals for
 * sub-unit values (opacities, turbulence frequencies) so small numbers never
 * collapse to 0. Trailing zeros are stripped.
 */
export function n(value, digits = null) {
  if (!Number.isFinite(value)) throw new Error(`Non-finite number in SVG output: ${value}`);
  const d = digits ?? (Math.abs(value) < 1 ? 4 : 2);
  const f = 10 ** d;
  const r = Math.round(value * f) / f;
  return Object.is(r, -0) ? "0" : String(r);
}

const ESC = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" };
export const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ESC[c]);

/** el("rect", {x: 1}, children?) -> "<rect x="1"/>"; null/undefined/false attrs are skipped. */
export function el(tag, attrs = {}, children = null) {
  let out = `<${tag}`;
  for (const [key, raw] of Object.entries(attrs)) {
    if (raw === null || raw === undefined || raw === false) continue;
    const value = typeof raw === "number" ? n(raw) : esc(raw);
    out += ` ${key}="${value}"`;
  }
  if (children === null || children === undefined || children === "") return `${out}/>`;
  const body = Array.isArray(children) ? children.filter(Boolean).join("") : children;
  return `${out}>${body}</${tag}>`;
}

export const group = (attrs, children) => el("g", attrs, children);

/** Collects <defs> entries and guarantees unique, deterministic ids per scene. */
export function createDefs(prefix) {
  const entries = [];
  const seen = new Map();
  return {
    /** Register a def once per key; returns its id. `build(id)` must return the markup. */
    use(key, build) {
      if (seen.has(key)) return seen.get(key);
      const id = `${prefix}-${key}`.replace(/[^a-zA-Z0-9_-]/g, "-");
      seen.set(key, id);
      entries.push(build(id));
      return id;
    },
    render: () => (entries.length ? el("defs", {}, entries) : ""),
  };
}

export function rgba(hex, alpha) {
  const h = hex.replace("#", "");
  const v = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const r = parseInt(v.slice(0, 2), 16);
  const g = parseInt(v.slice(2, 4), 16);
  const b = parseInt(v.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${n(alpha)})`;
}
