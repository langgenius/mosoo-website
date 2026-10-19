// Leak probes: website elements that use the same class names as the kit.
// preview.tsx renders them next to the kit, control.tsx without it; the two
// computed-style reports must match. Imports nothing from the kit.

import type { ReactElement } from "react";

export const PROBES = [
  { className: "bg-primary text-primary-foreground rounded-md px-3 py-1", id: "primary-button" },
  { className: "bg-card border border-border rounded-lg p-2 text-fg-1", id: "card" },
  { className: "text-fg-2 font-mono text-[12.5px]", id: "mono" },
  { className: "text-brand bg-brand-soft", id: "brand" },
  { className: "transition-colors duration-150 ease-out", id: "ease" },
  { className: "mosoo-thinking", id: "thinking" },
  { className: "environment-row-enter", id: "row-enter" },
  { className: "bg-sunken text-fg-heading bg-hover", id: "console-only-names" },
  { className: "font-sans", id: "font" },
  { className: "shadow-xs rounded-sm", id: "shadow" },
] as const;

const PROPERTIES = [
  "animation-name",
  "background-color",
  "background-image",
  "border-top-color",
  "border-top-left-radius",
  "box-shadow",
  "color",
  "font-family",
  "font-size",
  "font-weight",
  "transition-timing-function",
] as const;

export function readProbeReport(root: ParentNode): Record<string, Record<string, string>> {
  const report: Record<string, Record<string, string>> = {};

  for (const probe of PROBES) {
    const element = root.querySelector(`[data-probe="${probe.id}"]`);
    if (element === null) {
      continue;
    }

    const style = getComputedStyle(element);
    report[probe.id] = Object.fromEntries(PROPERTIES.map((name) => [name, style.getPropertyValue(name)]));
  }

  // Names are assembled at runtime: a literal theme variable name in a source
  // file counts as a use for Tailwind's scanner and changes the CSS it emits.
  const html = getComputedStyle(document.documentElement);
  report["root-vars"] = Object.fromEntries(
    ["font-sans", "font-mono", "ease-out", "primary", "fg-1", "r-md", "green-500"].map((name) => [
      name,
      html.getPropertyValue(`--${name}`).trim(),
    ]),
  );

  return report;
}

export function Probes(): ReactElement {
  return (
    <div data-probes style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: 8 }}>
      {PROBES.map((probe) => (
        <span key={probe.id} className={probe.className} data-probe={probe.id}>
          {probe.id}
        </span>
      ))}
    </div>
  );
}
