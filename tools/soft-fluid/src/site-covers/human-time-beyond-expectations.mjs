// A ruler carries the work; a curtain changes how much an audience can see.
// Geometry is shared by native-text live SVG and outlined-text static exports.
import { createRough } from "../lib/rough.mjs";
import { el } from "../lib/svg.mjs";

export const meta = {
  id: "human-time-beyond-expectations",
  slug: "human-time-beyond-expectations",
  stage: "paper",
  form: "hand-drawn",
};

export default function cover({ tokens, m, L, defs }) {
  const C = tokens.color;
  const ink = C.ink.body;
  const R = createRough({ seed: "site:human-time:v1", stroke: ink, width: 3.5, roughness: 0.68 });
  const hand = (o) => L.text({ cls: "cv-hand", weight: 500, fill: ink, ...o });
  const material = [m.stage(meta.stage), m.grain(meta.stage)].join("");

  // The ruler has no numeric scale: this is visibility, not a claim about a
  // measurable percentage of effort. Its entire length persists under the cloth.
  const ruler = el("g", { "data-el": "ruler" }, [
    el("path", { d: "M224 454 L1377 457 L1379 556 L224 554 Z", fill: "#EDF1E3" }),
    el("path", { d: "M225 536 L1377 539 L1378 554 L225 553 Z", fill: C.lime[500], "fill-opacity": 0.8 }),
    R.rect(224, 454, 1154, 100, { key: "ruler", amount: 1.8 }),
    ...Array.from({ length: 39 }, (_, i) => {
      const x = 240 + i * 29.4;
      return R.line(x, 458, x, 458 + (i % 5 === 0 ? 43 : i % 2 === 0 ? 25 : 17), { key: `tick-${i}`, w: 2.1, passes: 1, amount: 0.8 });
    }),
  ]);

  // A full rod makes the sideways opening legible. Cloth is clipped at its
  // fixed right edge while the leading edge travels; it never reveals the
  // ruler's right-hand end during playback.
  const rod = [
    R.line(223, 299, 1384, 301, { key: "rod", w: 2.8, amount: 1.6 }),
    el("circle", { cx: 220, cy: 299, r: 5.3, fill: ink }),
    el("circle", { cx: 1388, cy: 301, r: 5.3, fill: ink }),
  ].join("");
  const curtainClip = defs.use("curtain-clip", (id) => el("clipPath", { id }, el("rect", { x: 190, y: 292, width: 1191, height: 386 })));
  const clothD = "M805 311 C851 303 887 319 926 311 C971 302 1010 319 1053 312 C1092 305 1137 316 1181 311 C1228 304 1271 320 1312 311 C1374 307 1508 307 1642 313 L1642 654 C1575 669 1518 644 1470 660 C1420 672 1375 646 1322 660 C1278 670 1238 642 1192 657 C1145 673 1100 643 1050 660 C1006 674 960 646 916 660 C871 674 839 650 804 661 C833 600 838 550 835 498 C832 443 806 365 805 311 Z";
  const curtainShade = defs.use("curtain-shade", (id) => el("linearGradient", { id, x1: 0, x2: 1, y1: 0, y2: 0 }, [
    el("stop", { offset: 0, "stop-color": "#C9CEC2" }),
    el("stop", { offset: 0.13, "stop-color": "#E3E6DD" }),
    el("stop", { offset: 0.45, "stop-color": "#D5DACF" }),
    el("stop", { offset: 1, "stop-color": "#E1E4DA" }),
  ]));
  const shadow = defs.use("cloth-shadow", (id) => el("filter", { id, x: "-15%", y: "-15%", width: "130%", height: "145%" }, el("feGaussianBlur", { stdDeviation: 8 })));
  const folds = [854, 932, 1020, 1114, 1211, 1313, 1430, 1540].map((x, i) => {
    const bend = i % 2 ? -13 : 15;
    return [
      el("path", { d: `M${x} 316 C${x + bend} 389 ${x - bend} 430 ${x + 3} 502 C${x + 13} 567 ${x - 5} 617 ${x - 6} 651`, fill: "none", stroke: i % 2 ? "#FFFFFF" : "#A7AEA0", "stroke-opacity": i % 2 ? 0.32 : 0.23, "stroke-width": 15 }),
      R.curve([[x, 317], [x + bend, 391], [x - bend * 0.5, 464], [x + 5, 553], [x - 6, 652]], { key: `fold-${i}`, w: 1.7, opacity: 0.38 }),
    ].join("");
  }).join("");
  const curtain = el("g", { "clip-path": `url(#${curtainClip})` }, el("g", { "data-el": "curtain" }, [
    el("path", { d: clothD, transform: "translate(-4 9)", fill: ink, "fill-opacity": 0.1, filter: `url(#${shadow})` }),
    el("path", { d: clothD, fill: `url(#${curtainShade})`, stroke: ink, "stroke-width": 2.7, "stroke-linejoin": "round" }),
    folds,
    R.curve([[811, 322], [820, 388], [845, 489], [839, 580], [812, 650]], { key: "leading-edge", w: 2.4, opacity: 0.42 }),
  ]));

  const labels = [
    hand({ x: 220, y: 208, value: "Human time", size: 65 }),
    hand({ x: 488, y: 746, value: "Seen", size: 41, anchor: "middle", hook: "seen" }),
    hand({ x: 1095, y: 746, value: "Unseen", size: 41, anchor: "middle", fill: C.ink.muted }),
  ].join("");
  return {
    title: "Human time, half revealed",
    desc: "A hand-drawn ruler on neutral paper is half visible and half covered by a softly folded curtain. A slim lime band marks the ruler. The only labels are Human time, Seen and Unseen.",
    material,
    structure: [ruler, rod, curtain, labels].join(""),
    motion: { id: meta.id, hooks: ["curtain", "seen"], rest: "half-revealed", duration: 2.5 },
  };
}
