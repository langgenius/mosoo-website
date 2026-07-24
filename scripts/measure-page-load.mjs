import { createServer } from "node:http";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative, resolve, sep } from "node:path";
import { performance } from "node:perf_hooks";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const DIST = join(ROOT, "dist");
const DEFAULT_THRESHOLD_MS = 50;
const DEFAULT_SAMPLES = 9;
const DEFAULT_WARMUP = 2;

const MIME_TYPES = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".jpg", "image/jpeg"],
  [".js", "text/javascript; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml; charset=utf-8"],
  [".txt", "text/plain; charset=utf-8"],
  [".woff2", "font/woff2"],
  [".xml", "application/xml; charset=utf-8"],
]);

function argValue(name, fallback) {
  const prefix = `${name}=`;
  const match = process.argv.find((arg) => arg.startsWith(prefix));
  return match ? match.slice(prefix.length) : fallback;
}

function parseNumberArg(name, fallback, { allowZero = false } = {}) {
  const value = Number(argValue(name, fallback));
  if (!Number.isFinite(value) || value < 0 || (!allowZero && value === 0)) {
    throw new Error(`${name} must be ${allowZero ? "zero or " : ""}a positive number.`);
  }
  return value;
}

const thresholdMs = parseNumberArg("--threshold", DEFAULT_THRESHOLD_MS);
const samples = parseNumberArg("--samples", DEFAULT_SAMPLES);
const warmup = parseNumberArg("--warmup", DEFAULT_WARMUP, { allowZero: true });

function walkFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      return walkFiles(fullPath);
    }
    return [fullPath];
  });
}

function routeForHtml(htmlPath) {
  const relativePath = relative(DIST, htmlPath).split(sep).join("/");
  if (relativePath === "index.html") {
    return "/";
  }
  if (relativePath.endsWith("/index.html")) {
    return `/${relativePath.slice(0, -"index.html".length)}`;
  }
  return `/${relativePath}`;
}

function pageRoutes() {
  return walkFiles(DIST)
    .filter((file) => extname(file) === ".html")
    .map(routeForHtml)
    .sort((a, b) => a.localeCompare(b));
}

function resolveAssetPath(urlPath) {
  const pathname = decodeURIComponent(new URL(urlPath, "http://local.test").pathname);
  const normalizedPath = pathname.replace(/^\/+/, "");
  const candidate = resolve(DIST, normalizedPath);
  if (candidate !== DIST && !candidate.startsWith(`${DIST}${sep}`)) {
    return null;
  }

  if (statExists(candidate)?.isFile()) {
    return candidate;
  }

  const indexCandidate = join(candidate, "index.html");
  if (statExists(indexCandidate)?.isFile()) {
    return indexCandidate;
  }

  return null;
}

function statExists(path) {
  try {
    return statSync(path);
  } catch {
    return null;
  }
}

function startServer() {
  const server = createServer((request, response) => {
    const filePath = resolveAssetPath(request.url ?? "/");
    if (!filePath) {
      response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }

    response.writeHead(200, {
      "cache-control": "no-store",
      "content-type": MIME_TYPES.get(extname(filePath)) ?? "application/octet-stream",
    });
    response.end(readFileSync(filePath));
  });

  return new Promise((resolveReady, rejectReady) => {
    server.once("error", rejectReady);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        rejectReady(new Error("Could not bind benchmark server."));
        return;
      }
      resolveReady({ server, origin: `http://127.0.0.1:${address.port}` });
    });
  });
}

function assetUrls(html, pageUrl) {
  const urls = new Set();
  const patterns = [
    /<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi,
    /<link\b(?=[^>]*\brel=["'][^"']*(?:stylesheet|modulepreload)[^"']*["'])[^>]*\bhref=["']([^"']+)["'][^>]*>/gi,
  ];

  for (const pattern of patterns) {
    for (const match of html.matchAll(pattern)) {
      urls.add(new URL(match[1], pageUrl).toString());
    }
  }

  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    const tag = match[0];
    if (/\bloading=["']lazy["']/i.test(tag)) {
      continue;
    }

    const src = tag.match(/\bsrc=["']([^"']+)["']/i)?.[1];
    if (src) {
      urls.add(new URL(src, pageUrl).toString());
    }
  }

  return [...urls];
}

async function fetchText(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`${url} returned ${response.status}`);
  }
  return response.text();
}

async function fetchBytes(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`${url} returned ${response.status}`);
  }
  await response.arrayBuffer();
}

async function measureRoute(origin, route) {
  const pageUrl = new URL(route, origin).toString();
  const started = performance.now();
  const html = await fetchText(pageUrl);
  await Promise.all(assetUrls(html, pageUrl).map(fetchBytes));
  return performance.now() - started;
}

function percentile(values, fraction) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * fraction) - 1)];
}

function formatMs(value) {
  return `${value.toFixed(1)} ms`;
}

const routes = pageRoutes();
if (routes.length === 0) {
  throw new Error("No HTML pages found. Run npm run site:build first.");
}

const { server, origin } = await startServer();
try {
  const results = [];
  for (const route of routes) {
    for (let i = 0; i < warmup; i += 1) {
      await measureRoute(origin, route);
    }

    const timings = [];
    for (let i = 0; i < samples; i += 1) {
      timings.push(await measureRoute(origin, route));
    }

    results.push({
      route,
      min: Math.min(...timings),
      p95: percentile(timings, 0.95),
      max: Math.max(...timings),
    });
  }

  console.log(`Page-load benchmark: ${pathToFileURL(DIST).href}`);
  console.log(`samples=${samples} warmup=${warmup} threshold=${formatMs(thresholdMs)}`);
  console.log("");
  console.log("route                                           min       p95       max");
  console.log("------------------------------------------------ -------------------------");

  let failed = false;
  for (const result of results) {
    const ok = result.p95 <= thresholdMs;
    failed ||= !ok;
    console.log(
      `${result.route.padEnd(46)} ${formatMs(result.min).padStart(8)} ${formatMs(result.p95).padStart(9)} ${formatMs(result.max).padStart(9)} ${ok ? "ok" : "fail"}`,
    );
  }

  if (failed) {
    process.exitCode = 1;
  }
} finally {
  await new Promise((resolveClose) => server.close(resolveClose));
}
