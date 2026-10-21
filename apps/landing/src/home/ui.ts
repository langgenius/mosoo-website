// Markup helpers shared by the section modules (./sections/*.ts). They emit the system components styled in
// ./system.css, so a section never re-implements a heading, a button or a harness name.
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
 * A harness name in running text (.v5-hn): the product's own name in the sentence's face, Hanken 500 ink, never a
 * box (O1, committee 2026-10-21: the 1px keycaps read as buttons and cut the sentence up, 4 of 5 readers).
 * data-product-ui: a product's name, so its words count as object words in tools/budget.ts; translate="no": the
 * name is the same in every language.
 */
export function harnessName(name: string): string {
  return `<span class="v5-hn" data-product-ui translate="no">${esc(name)}</span>`;
}

/**
 * Names as one list inside a sentence: "A, B, C or D" in en, "A、B、C 或 D" in zh and ja (the ideographic comma, no
 * space after it). `or` is the copy's own word; a no-break space ties it to the last name, so a line never ends on it.
 */
export function nameList(names: readonly string[], or: string, cjk: boolean): string {
  const items = names.map(harnessName);
  const last = items.pop();
  if (last === undefined) {
    return "";
  }
  return items.length === 0 ? last : `${items.join(cjk ? "、" : ", ")} ${esc(or)}&nbsp;${last}`;
}

export type ButtonTone = "lime" | "ink" | "grey";

/**
 * A link styled as a button: lime (the primary CTA, Frame's glow), grey (the secondary: the frame's #f4f4f4 fill,
 * no line and no shadow, so the lime primary stays the one solid colour) or ink (solid; for a primary on lime, see
 * .v5-on-lime).
 */
export function button(href: string, label: string, tone: ButtonTone, extra = ""): string {
  return `<a class="v5-btn v5-btn--${tone}" href="${esc(href)}"${extra}>${esc(label)}</a>`;
}
