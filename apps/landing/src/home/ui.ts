// Markup helpers shared by the section modules (./sections/*.ts). They emit the system components styled in
// ./system.css, so a section never re-implements a heading, a button, a keycap or a tab label.
// Erasable TypeScript, no DOM: the same functions run in Node at build time and in the browser in dev.

/** Escapes text and attribute values. */
export function esc(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/** The two lines of a two-tone heading (BRIEF §3.2: the second line in ink-3). Put it inside an h1 / h2. */
export function twoTone(a: string, b: string, lineB = ""): string {
  // One space between the block spans: invisible, but keeps the text "a b" for crawlers and copy-paste.
  return `<span class="v5-tone-a">${esc(a)}</span> <span class="v5-tone-b"${lineB}>${esc(b)}</span>`;
}

/**
 * A keycap (BRIEF §3.3; Frame's .rectangle-span): Fragment Mono in a 1px ink box, r8, white, sitting on the
 * sentence's baseline. Put keycaps inside a `.v5-keys` sentence, which sets the line pitch for them.
 * data-product-ui: a keycap is a drawn object, so its words count as object words in tools/budget.ts.
 */
export function keycap(label: string): string {
  return `<span class="v5-kc" data-product-ui translate="no">${esc(label)}</span>`;
}

export type ButtonTone = "lime" | "ink";

/** A link styled as a button: lime (the primary CTA, Frame's glow) or ink (secondary). */
export function button(href: string, label: string, tone: ButtonTone, extra = ""): string {
  return `<a class="v5-btn v5-btn--${tone}" href="${esc(href)}"${extra}>${esc(label)}</a>`;
}

/** A tab label (Frame's .gradient-headline-wrap): 1px ink outline, the lower half fading into the ground. */
export function tabLabel(label: string, tag: "p" | "span" = "p"): string {
  return `<${tag} class="v5-tab"><span>${esc(label)}</span></${tag}>`;
}
