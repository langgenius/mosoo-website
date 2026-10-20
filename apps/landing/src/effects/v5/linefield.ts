// Line field (v5 tool T2): Mintlify's card "Waves", rebuilt without Rive.
//
// Provenance: the maths was reversed from the Luau bytecode inside Mintlify's .riv files
// (staging refs/mintlify/v5/STUDY.md §2.3, rive/waves.dis.txt protos 3, 4, 6, 16, 18) and first
// prototyped in refs/mintlify/v5/scripts/wavefield.ts. This is our own code, written from those
// measurements; nothing of Mintlify's is copied. The pinch window is our addition (STUDY §3.2).
//
// For line i of n (k = i - (n-1)/2) at u in [0, 1] along a straight axis of length L:
//   y = hold(u) * ( k*spacing + amp*(1 + bulge*sin(pi*u))*0.5*( sin(2pi*freq*u + phase*k)
//         + twist*sin(pi*freq*u - 2*phase*k + spin) + morph*sin(3.7u + 0.2i)*cos(2.1u + 0.13i) ) )
//   spin = 0.7 rad/s * speed * t   (the only moving term: one loop every 8.976 s)
//   hold(u) = 1 - pinch*exp(-((u - at)/width)^2): pulls every line onto the axis at u = at,
//   so a crossing stays pinned to one point (an object's edge) for every t.
// The axis is rotated by `rotate` degrees and placed at (cx, cy), or so that u = at lands on pin (x, y).
// Each line is one solid stroke; the ramp runs across lines, not along them.
//
// Page contract (declared in markup, no JS needed for the still):
//   <div data-linefield="hero" aria-hidden="true">        position:relative/absolute; overflow:hidden
//     <img data-linefield-poster src="/landing/v5/lines/hero.svg" alt="" width="1120" height="520">
//   </div>
//   The poster is the t0 frame, generated from the same params by scripts/assets/linefield.mjs.
//   Poster CSS: position:absolute; inset:0; width:100%; height:100%; object-position:50% 50%;
//   object-fit:none (fit "none") or cover (fit "cover"). The canvas uses the same mapping.
//   data-linefield-src (optional) overrides the params URL.
// Behaviour: the canvas mounts when the host first enters the viewport, draws the t0 frame (identical
// to the poster), hides the poster and runs at 0.7 rad/s for at most RUN_S seconds, slowing to a stop
// over the last EASE_S, then rests on its frame: moving content that starts by itself stops within
// 5 s (WCAG 2.2.2; staging v5 motion review P1-2). It runs again each time the host comes back into
// view, and, inside a pinned stage ([data-stage]), each time the stage switches step, so the lines move
// when something happens. It pauses off-screen (IntersectionObserver) and resumes where it stopped.
// Device-pixel aware (capped at 2x); strokes stay `stroke` CSS px at any scale, like the poster's
// non-scaling-stroke. Reduced motion or no JS: only the poster shows.
// data-linefield-state on the host reads poster | running | rest | paused.
// Wiring: initLinefields(root) mounts every [data-linefield] host (add it to initMotion in ./index.ts).

export const LINEFIELD_PARAMS_URL = "/landing/v5/lines/params.json";
/** Phase speed of the second harmonic (Waves animMode 0), rad/s. */
export const SPIN_RATE = 0.7;

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
const MAX_DPR = 2;
// Longest step one frame may take (s), so a dropped or throttled frame never jumps the phase.
const MAX_STEP = 0.1;
/** Seconds one start runs (WCAG 2.2.2 allows motion that starts by itself if it stops within 5 s). */
export const RUN_S = 4.5;
/** The last seconds of a run, over which the phase speed eases to zero (smoothstep). */
const EASE_S = 1.5;

export type Ramp = {
  from: string;
  to: string;
  /** Interpolation space; Mintlify's Color.lerp is "srgb", ours is "oklab". */
  space?: "oklab" | "srgb";
  /** f = (i/(n-1))^ease; > 1 keeps more lines near `from`. */
  ease?: number;
  /** true: line 0 takes `to`. */
  reverse?: boolean;
};

export type Pin = {
  x: number;
  y: number;
  /** Position of the pinned crossing along the axis, u in [0, 1]. */
  at: number;
  /** Depth of the hold window, 0–1 (0.9: lines close to 10% of their offset). */
  pinch: number;
  /** Width (sigma) of the hold window in u. */
  width: number;
};

export type LinefieldParams = {
  /** Design box in CSS px; the poster's size and the canvas's mapping box. */
  w: number;
  h: number;
  fit?: "none" | "cover";
  n: number;
  spacing: number;
  length: number;
  amp: number;
  freq: number;
  phase: number;
  twist: number;
  bulge: number;
  morph: number;
  res: number;
  rotate: number;
  cx?: number;
  cy?: number;
  pin?: Pin;
  speed?: number;
  /** Poster time (s); the canvas starts here. */
  t0?: number;
  /** CSS px. */
  stroke: number;
  ramp: Ramp;
  opacity?: number;
};

export type Field = {
  readonly params: LinefieldParams;
  readonly lines: number;
  readonly points: number;
  readonly colors: readonly string[];
  /** rad/s */
  readonly rate: number;
  // Axis points (design px) and the unit normal the offsets move along.
  readonly ax: Float64Array;
  readonly ay: Float64Array;
  readonly nx: number;
  readonly ny: number;
  // offset(i, j, t) = base + gain_j * sin(arg + spin), with sin(arg + spin) expanded so a frame
  // needs only cos(spin) and sin(spin).
  readonly base: Float64Array;
  readonly gain: Float64Array;
  readonly sinArg: Float64Array;
  readonly cosArg: Float64Array;
};

export type View = { scale: number; x: number; y: number; dpr: number };

// ---------------------------------------------------------------------------------------------
// Colour

const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toGamma = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

function hexToRgb(hex: string): [number, number, number] {
  const v = Number.parseInt(hex.replace("#", ""), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}

function rgbToHex(rgb: readonly number[]): string {
  return `#${rgb.map((c) => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, "0")).join("")}`;
}

// Björn Ottosson's OKLab matrices.
function rgbToOklab([r8, g8, b8]: readonly number[]): [number, number, number] {
  const r = toLinear((r8 ?? 0) / 255);
  const g = toLinear((g8 ?? 0) / 255);
  const b = toLinear((b8 ?? 0) / 255);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

function oklabToRgb([L, a, b]: readonly number[]): number[] {
  const l = ((L ?? 0) + 0.3963377774 * (a ?? 0) + 0.2158037573 * (b ?? 0)) ** 3;
  const m = ((L ?? 0) - 0.1055613458 * (a ?? 0) - 0.0638541728 * (b ?? 0)) ** 3;
  const s = ((L ?? 0) - 0.0894841775 * (a ?? 0) - 1.291485548 * (b ?? 0)) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map((c) => toGamma(Math.max(0, Math.min(1, c))) * 255);
}

/** One solid colour per line, from `ramp.from` (line 0) to `ramp.to` (line n-1). */
export function rampColors(ramp: Ramp, n: number): string[] {
  const a = hexToRgb(ramp.from);
  const b = hexToRgb(ramp.to);
  const la = rgbToOklab(a);
  const lb = rgbToOklab(b);
  return Array.from({ length: n }, (_, i) => {
    const lin = n > 1 ? i / (n - 1) : 0;
    const f = (ramp.reverse ? 1 - lin : lin) ** (ramp.ease ?? 1);
    if (ramp.space === "srgb") {
      return rgbToHex(a.map((c, ch) => c + ((b[ch] ?? 0) - c) * f));
    }
    return rgbToHex(oklabToRgb(la.map((c, ch) => c + ((lb[ch] ?? 0) - c) * f)));
  });
}

// ---------------------------------------------------------------------------------------------
// Geometry (shared by the poster generator and the canvas, so both draw the same frame)

export function prepareField(p: LinefieldParams): Field {
  const lines = Math.max(1, Math.floor(p.n));
  const res = Math.max(8, Math.floor(p.res)); // Waves: max(8, lineRes) segments
  const points = res + 1;
  const angle = (p.rotate * Math.PI) / 180;
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  const pin = p.pin;
  let cx = p.cx ?? p.w / 2;
  let cy = p.cy ?? p.h / 2;
  if (pin) {
    const along = -p.length / 2 + pin.at * p.length;
    cx = pin.x - dx * along;
    cy = pin.y - dy * along;
  }
  const w = 2 * Math.PI * p.freq;
  const ax = new Float64Array(points);
  const ay = new Float64Array(points);
  const hold = new Float64Array(points);
  const env = new Float64Array(points);
  const gain = new Float64Array(points);
  for (let j = 0; j < points; j++) {
    const u = j / res;
    const along = -p.length / 2 + u * p.length;
    ax[j] = cx + dx * along;
    ay[j] = cy + dy * along;
    const h = pin ? 1 - pin.pinch * Math.exp(-(((u - pin.at) / pin.width) ** 2)) : 1;
    const e = p.amp * (1 + p.bulge * Math.sin(Math.PI * u)) * 0.5;
    hold[j] = h;
    env[j] = e;
    gain[j] = h * e * p.twist;
  }
  const base = new Float64Array(lines * points);
  const sinArg = new Float64Array(lines * points);
  const cosArg = new Float64Array(lines * points);
  for (let i = 0, q = 0; i < lines; i++) {
    const k = i - (lines - 1) / 2;
    const c = p.phase * k;
    for (let j = 0; j < points; j++, q++) {
      const u = j / res;
      const morph = p.morph > 0 ? p.morph * Math.sin(3.7 * u + 0.2 * i) * Math.cos(2.1 * u + 0.13 * i) : 0;
      base[q] = (hold[j] ?? 1) * (k * p.spacing + (env[j] ?? 0) * (Math.sin(w * u + c) + morph));
      const arg = 0.5 * w * u - 2 * c;
      sinArg[q] = Math.sin(arg);
      cosArg[q] = Math.cos(arg);
    }
  }
  return {
    params: p,
    lines,
    points,
    colors: rampColors(p.ramp, lines),
    rate: SPIN_RATE * (p.speed ?? 1),
    ax,
    ay,
    nx: -dy,
    ny: dx,
    base,
    gain,
    sinArg,
    cosArg,
  };
}

/** Writes x, y (design px) for every point of every line at time t (s) into out (lines*points*2). */
export function computeFrame(field: Field, t: number, out: Float64Array): void {
  const spin = field.rate * t;
  const cs = Math.cos(spin);
  const sn = Math.sin(spin);
  const { lines, points, ax, ay, nx, ny, base, gain, sinArg, cosArg } = field;
  for (let i = 0, q = 0, o = 0; i < lines; i++) {
    for (let j = 0; j < points; j++, q++, o += 2) {
      const offset = (base[q] ?? 0) + (gain[j] ?? 0) * ((sinArg[q] ?? 0) * cs + (cosArg[q] ?? 0) * sn);
      out[o] = (ax[j] ?? 0) + nx * offset;
      out[o + 1] = (ay[j] ?? 0) + ny * offset;
    }
  }
}

/** Maps the design box onto a width x height box (CSS px), centred, like object-fit none / cover. */
export function fitView(p: LinefieldParams, width: number, height: number, dpr: number): View {
  const scale = p.fit === "cover" ? Math.max(width / p.w, height / p.h) : 1;
  return { scale, x: (width - p.w * scale) / 2, y: (height - p.h * scale) / 2, dpr };
}

export function paintFrame(ctx: CanvasRenderingContext2D, field: Field, xy: Float64Array, view: View): void {
  const p = field.params;
  const k = view.scale * view.dpr;
  const ox = view.x * view.dpr;
  const oy = view.y * view.dpr;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.save();
  // Clip to the design box: the poster's viewport ends there too.
  ctx.beginPath();
  ctx.rect(ox, oy, p.w * k, p.h * k);
  ctx.clip();
  ctx.lineWidth = p.stroke * view.dpr;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.globalAlpha = p.opacity ?? 1;
  for (let i = 0, o = 0; i < field.lines; i++) {
    ctx.beginPath();
    ctx.moveTo(ox + (xy[o] ?? 0) * k, oy + (xy[o + 1] ?? 0) * k);
    o += 2;
    for (let j = 1; j < field.points; j++, o += 2) {
      ctx.lineTo(ox + (xy[o] ?? 0) * k, oy + (xy[o + 1] ?? 0) * k);
    }
    ctx.strokeStyle = field.colors[i] ?? "#000";
    ctx.stroke();
  }
  ctx.restore();
}

// ---------------------------------------------------------------------------------------------
// Runtime

type Player = { play: () => void; pause: () => void; destroy: () => void };

const NUMBERS = ["w", "h", "n", "spacing", "length", "amp", "freq", "phase", "twist", "bulge", "morph", "res", "rotate", "stroke"];

/** The fields prepareField reads; an instance without them is skipped and keeps its poster. */
function isParams(value: unknown): value is LinefieldParams {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const fields = value as Record<string, unknown>;
  const ramp = fields["ramp"];
  return (
    NUMBERS.every((key) => Number.isFinite(fields[key])) &&
    typeof ramp === "object" &&
    ramp !== null &&
    typeof (ramp as Record<string, unknown>)["from"] === "string" &&
    typeof (ramp as Record<string, unknown>)["to"] === "string"
  );
}

const sources = new Map<string, Promise<Map<string, LinefieldParams>>>();

function loadParams(url: string): Promise<Map<string, LinefieldParams>> {
  let pending = sources.get(url);
  if (!pending) {
    pending = fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`linefield: ${url} ${response.status}`);
        }
        return response.json() as Promise<unknown>;
      })
      .then((doc) => {
        const instances = typeof doc === "object" && doc !== null ? (doc as Record<string, unknown>)["instances"] : null;
        const entries = typeof instances === "object" && instances !== null ? Object.entries(instances) : [];
        return new Map(entries.filter((entry): entry is [string, LinefieldParams] => isParams(entry[1])));
      });
    pending.catch(() => sources.delete(url));
    sources.set(url, pending);
  }
  return pending;
}

function setState(host: HTMLElement, state: "poster" | "running" | "rest" | "paused"): void {
  host.dataset["linefieldState"] = state;
}

function createPlayer(host: HTMLElement, params: LinefieldParams): Player | null {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return null;
  }
  const field = prepareField(params);
  const xy = new Float64Array(field.lines * field.points * 2);
  const period = (2 * Math.PI) / field.rate;
  const poster = host.querySelector<HTMLElement>("[data-linefield-poster]");
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none";
  if (poster) {
    poster.after(canvas);
  } else {
    host.prepend(canvas);
  }
  let view = fitView(params, 0, 0, 1);
  let t = params.t0 ?? 0;
  let last = -1;
  let frame = 0;
  let left = 0; // seconds of the current run still to go

  const paint = () => {
    computeFrame(field, t, xy);
    paintFrame(ctx, field, xy, view);
  };
  const resize = () => {
    const width = host.clientWidth;
    const height = host.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    canvas.width = Math.max(1, Math.round(width * dpr));
    canvas.height = Math.max(1, Math.round(height * dpr));
    view = fitView(params, width, height, dpr);
    paint();
  };
  const tick = (now: number) => {
    const dt = last >= 0 ? Math.min(MAX_STEP, (now - last) / 1000) : 0;
    last = now;
    left = Math.max(0, left - dt);
    const ease = Math.min(1, left / EASE_S);
    t = (t + dt * ease * ease * (3 - 2 * ease)) % period;
    if (Math.min(window.devicePixelRatio || 1, MAX_DPR) === view.dpr) {
      paint();
    } else {
      resize(); // moved to a screen with another pixel ratio
    }
    if (left > 0) {
      frame = requestAnimationFrame(tick);
    } else {
      frame = 0;
      setState(host, "rest");
    }
  };
  /** Starts (or restarts) a run of RUN_S seconds from the current phase. */
  const play = () => {
    left = RUN_S;
    if (frame === 0) {
      last = -1;
      frame = requestAnimationFrame(tick);
    }
    setState(host, "running");
  };
  const pause = () => {
    if (frame !== 0) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
    setState(host, "paused");
  };
  const resizeObserver = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(resize);
  resizeObserver?.observe(host);
  resize();
  // The canvas now shows the t0 frame, identical to the poster, so the poster can go.
  if (poster) {
    poster.style.visibility = "hidden";
  }
  return {
    play,
    pause,
    destroy: () => {
      pause();
      resizeObserver?.disconnect();
      canvas.remove();
      if (poster) {
        poster.style.visibility = "";
      }
      setState(host, "poster");
    },
  };
}

/** Animates one [data-linefield] host. Returns a cleanup that restores the poster. */
export function mountLinefield(host: HTMLElement): () => void {
  if (typeof window === "undefined" || typeof IntersectionObserver === "undefined") {
    return () => {};
  }
  const reduced = window.matchMedia(REDUCED_MOTION);
  let player: Player | null = null;
  let loading = false;
  let visible = false;
  let disposed = false;
  setState(host, "poster");

  const sync = () => {
    if (disposed) {
      return;
    }
    if (reduced.matches) {
      player?.destroy();
      player = null;
      return;
    }
    if (!visible) {
      player?.pause();
      return;
    }
    if (player) {
      player.play();
      return;
    }
    if (loading) {
      return;
    }
    loading = true;
    loadParams(host.dataset["linefieldSrc"] ?? LINEFIELD_PARAMS_URL).then(
      (all) => {
        loading = false;
        const params = all.get(host.dataset["linefield"] ?? "");
        if (params && !disposed && !player && !reduced.matches) {
          player = createPlayer(host, params);
          sync();
        }
      },
      () => {
        loading = false; // the poster stays
      },
    );
  };
  const observer = new IntersectionObserver((entries) => {
    visible = entries[entries.length - 1]?.isIntersecting ?? visible;
    sync();
  });
  reduced.addEventListener("change", sync);
  observer.observe(host);
  // In a pinned stage, a step switch starts a new run: the lines move with the change of state.
  const stage = host.closest<HTMLElement>("[data-stage]");
  const steps =
    stage && typeof MutationObserver !== "undefined"
      ? new MutationObserver(() => {
          if (visible && !reduced.matches) {
            player?.play();
          }
        })
      : null;
  if (stage) {
    steps?.observe(stage, { attributes: true, attributeFilter: ["data-step"] });
  }
  return () => {
    disposed = true;
    observer.disconnect();
    steps?.disconnect();
    reduced.removeEventListener("change", sync);
    player?.destroy();
    player = null;
  };
}

/** Animates every [data-linefield] host under root (same shape as the T6 init* engines). Returns one cleanup. */
export function initLinefields(root: ParentNode = document): () => void {
  const stops = Array.from(root.querySelectorAll<HTMLElement>("[data-linefield]"), mountLinefield);
  return () => {
    for (const stop of stops) {
      stop();
    }
  };
}
