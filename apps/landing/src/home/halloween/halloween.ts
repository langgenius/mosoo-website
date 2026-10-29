// Halloween on the home: three small accents for a few days a year (owner 2026-10-29: 「来点万圣节氛围，点缀即可」).
// Everything the season adds is in this folder: the switch and the dates below, the accents (this file) and their
// styles (./halloween.css, imported by ../v5.css). No copy changes, no new asset.
//
// The static page never carries them: scripts/landing-home.mjs prerenders /en, /zh and /ja at build time, so the day is
// checked here, in the reader's browser and calendar, and a build made before, during or after the window serves the
// same page. The home has no hydration (src/main.tsx renders nothing over the static HTML), so nothing can mismatch.
//
// Decoration only: aria-hidden, no pointer, absolutely positioned (nothing in the flow moves, so no layout shift), in
// the page's own thin ink line with one touch of pumpkin; motion only when the reader allows it (./halloween.css).
//   web     a cobweb in the first plate's top-left corner (sections/stage.ts), with a spider on a thread from desktop
//           widths; sized so the corner stays clear of the object at every width
//   ghost   a line ghost after the H1's second line ("Now it runs without you."), sized in em with the H1; left out
//           where the line leaves it no room inside the H1
//   arrow   the announcement's arrow turns pumpkin on hover and focus (CSS only, under the root's data-halloween)
//
// Preview on any day: ?halloween=1 (?halloween=0 hides them). Off: HALLOWEEN_ENABLED = false. Gone: delete this
// folder, its @import in ../v5.css, the three lines that name it in ../effects.ts and tests/home-halloween.test.mjs.

/** The one switch: false hides the accents on every day, whatever the query says. */
export const HALLOWEEN_ENABLED = true;

/** The window, first and last day included, as YYYY-MM-DD in the reader's local calendar. */
export const HALLOWEEN_START = "2026-10-24";
export const HALLOWEEN_END = "2026-11-01";

/** ?halloween=1 shows the accents on any day and ?halloween=0 hides them (a preview); any other value leaves it to the
 *  day. The worker's / -> /en redirect keeps the query. */
const QUERY = "halloween";

const pad = (n: number): string => String(n).padStart(2, "0");

/** The reader's calendar day. Local time on purpose: toISOString() is the UTC day, off by one for half the world. */
function localDay(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Whether the accents show on this day with this query string (location.search). */
export function isHalloween(now: Date, search = ""): boolean {
  if (!HALLOWEEN_ENABLED) {
    return false;
  }
  const forced = new URLSearchParams(search).get(QUERY);
  if (forced === "1" || forced === "0") {
    return forced === "1";
  }
  const day = localDay(now);
  return day >= HALLOWEEN_START && day <= HALLOWEEN_END;
}

const SVG = 'aria-hidden="true" focusable="false"';

/**
 * The ghost in the nav glyphs' line (1.3 at 24, round ends): a dome, three points at the hem, two eyes. Its span opens
 * with a word joiner (U+2060, no width, no glyph): a balanced line is exactly as wide as its text, and without the
 * joiner Chrome breaks before the span and hangs the ghost on an empty line under the H1 (phones). The span is
 * aria-hidden and cannot be selected, so neither a screen reader nor a copied headline picks the joiner up.
 */
const GHOST =
  `<span class="v5-hw-ghost" aria-hidden="true">&#8288;<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" ${SVG}>` +
  '<path d="M6 20V11a6 6 0 0 1 12 0v9l-2-1.6-2 1.6-2-1.6-2 1.6-2-1.6-2 1.6z"/><path d="M10 10.6v1.2M14 10.6v1.2"/></svg></span>';

/**
 * The cobweb, drawn in a 100-wide box whose top-left corner is the hub (the plate's own corner, which its radius
 * clips): five spokes, four rings sagging toward the hub and tied to both edges, slightly uneven. The spider hangs off
 * the third ring on a thread. Every line is 1px at any size (non-scaling stroke), like the page's other lines.
 */
const SILK =
  "M0 0L96.1 27.6M0 0L81.4 52.8M0 0L59.1 70.5M0 0L37.5 88.4M0 0L12.2 99.3" +
  "M22 0Q17 2.4 20.2 5.8Q14.9 6.8 16.8 10.9Q12.3 10.9 13.5 16.1Q8.6 14 7.8 18.4Q4.2 15.8 2.6 20.8Q1.1 17.2 0 22" +
  "M43 0Q33.3 4.7 39.4 11.3Q29.5 13.4 33.5 21.8Q24.3 21.5 26.4 31.4Q16.9 27.6 15.6 36.8Q8.5 31.7 5.1 41.7Q2.1 33.9 0 43" +
  "M66 0Q51.1 7.2 60.6 17.4Q45.1 20.6 51.2 33.2Q36.8 32.6 39.9 47.5Q25.7 41.9 23.8 56.2Q12.8 47.9 7.7 62.5Q3.1 51.1 0 65" +
  "M90 0Q69.7 9.8 82.7 23.7Q61.5 28 69.6 45.2Q49.4 43.7 52.7 62.8Q34.5 56.3 32.4 76.4Q17.5 65.3 10.5 85.4Q4.3 69.9 0 89";

/** Four legs a side, each bent once, either side of the body at x 32.1. */
const LEGS =
  "M29.4 101.6L25.6 98.8L24.4 101.2M29.2 103.2L24.8 102.2L23.4 105.2M29.3 104.9L25 106.2L24.2 109.4M29.8 106.4L26.6 109.4V112.4" +
  "M34.8 101.6L38.6 98.8L39.8 101.2M35 103.2L39.4 102.2L40.8 105.2M34.9 104.9L39.2 106.2L40 109.4M34.4 106.4L37.6 109.4V112.4";

const WEB =
  `<div class="v5-hw-web" aria-hidden="true"><svg viewBox="0 0 100 114" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" ${SVG}>` +
  `<path class="v5-hw-silk" d="${SILK}" vector-effect="non-scaling-stroke"/>` +
  `<g class="v5-hw-spider"><path class="v5-hw-thread" d="M32.1 52.4V97.7" vector-effect="non-scaling-stroke"/>` +
  `<path d="${LEGS}" vector-effect="non-scaling-stroke"/>` +
  '<circle cx="32.1" cy="99.6" r="1.9" fill="currentColor" stroke="none"/>' +
  '<ellipse cx="32.1" cy="104" rx="3" ry="3.6" fill="currentColor" stroke="none"/></g></svg></div>';

/** zh and ja lines end in a full-width stop (「。」), whose glyph leaves the right half of its box blank. */
const CJK_STOP = /[。．！？]$/;

/** Adds the accents when isHalloween() says so. Returns one cleanup, like the engines in ../effects.ts. */
export function initHalloween(root: ParentNode = document): () => void {
  const home = root.querySelector<HTMLElement>("[data-v5-home]");
  if (!home || !isHalloween(new Date(), window.location.search)) {
    return () => {};
  }
  const line = home.querySelector<HTMLElement>("#hero-title .v5-tone-b");
  const plate = home.querySelector('[data-section="stage"] .v5-step');
  const stop = CJK_STOP.test(line?.textContent?.trim() ?? "");
  line?.insertAdjacentHTML("beforeend", GHOST);
  plate?.insertAdjacentHTML("beforeend", WEB);
  const ghost = line?.querySelector<HTMLElement>(":scope > .v5-hw-ghost");
  const web = plate?.querySelector(":scope > .v5-hw-web");
  ghost?.classList.toggle("v5-hw-ghost--stop", stop);
  home.dataset["halloween"] = "";

  // The ghost shows only where the line leaves it room inside the H1 (a full zh or ja line on a phone does not, and it
  // would cross the paper's edge): checked now, once the faces have loaded, and after a resize. Both boxes are inside
  // the H1, so its rise (a transform) moves them alike and the comparison holds mid-rise.
  const fit = (): void => {
    const glyph = ghost?.querySelector("svg");
    if (!ghost || !glyph || !line) {
      return;
    }
    ghost.hidden = false;
    ghost.hidden = glyph.getBoundingClientRect().right > line.getBoundingClientRect().right;
  };
  let timer = 0;
  const onResize = (): void => {
    window.clearTimeout(timer);
    timer = window.setTimeout(fit, 150);
  };
  fit();
  void document.fonts.ready.then(fit);
  window.addEventListener("resize", onResize, { passive: true });

  return () => {
    window.clearTimeout(timer);
    window.removeEventListener("resize", onResize);
    ghost?.remove();
    web?.remove();
    delete home.dataset["halloween"];
  };
}
