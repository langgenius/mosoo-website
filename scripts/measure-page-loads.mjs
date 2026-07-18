import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, relative, sep } from "node:path";
import { performance } from "node:perf_hooks";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const DIST = join(ROOT, "dist");
const DEFAULT_PORT = 4174;
const ITERATIONS = Number(process.env.MEASURE_ITERATIONS ?? "7");
const THRESHOLD_MS = Number(process.env.MEASURE_THRESHOLD_MS ?? "50");

const MIME_TYPES = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".jpg", "image/jpeg"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".webp", "image/webp"],
  [".woff2", "font/woff2"],
  [".xml", "application/xml; charset=utf-8"],
  [".txt", "text/plain; charset=utf-8"],
]);

function toFilePath(pathname) {
  const decoded = decodeURIComponent(pathname);
  if (decoded.includes("\0") || decoded.split("/").includes("..")) {
    return null;
  }

  if (decoded.endsWith("/")) {
    return join(DIST, decoded, "index.html");
  }

  return join(DIST, decoded);
}

async function exists(path) {
  try {
    const stats = await stat(path);
    return stats.isFile();
  } catch {
    return false;
  }
}

function startStaticServer() {
  const server = createServer(async (request, response) => {
    const url = new URL(request.url ?? "/", `http://${request.headers.host}`);
    const filePath = toFilePath(url.pathname);

    if (!filePath || !(await exists(filePath))) {
      response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }

    const body = await readFile(filePath);
    response.writeHead(200, {
      "cache-control": "no-store",
      "content-length": String(body.byteLength),
      "content-type": MIME_TYPES.get(extname(filePath)) ?? "application/octet-stream",
    });
    response.end(body);
  });

  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(Number(process.env.MEASURE_PORT ?? DEFAULT_PORT), "127.0.0.1", () => {
      server.off("error", reject);
      resolve(server);
    });
  });
}

async function collectHtmlFiles(dir = DIST) {
  const { readdir } = await import("node:fs/promises");
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectHtmlFiles(entryPath)));
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      files.push(entryPath);
    }
  }

  return files.sort();
}

function routeFromHtmlFile(filePath) {
  const normalized = relative(DIST, filePath).split(sep).join("/");
  if (normalized === "index.html") {
    return "/";
  }

  if (normalized.endsWith("/index.html")) {
    return `/${normalized.slice(0, -"index.html".length)}`;
  }

  return `/${normalized}`;
}

function resourceUrl(value, baseUrl) {
  if (!value || value.startsWith("data:") || value.startsWith("mailto:")) {
    return null;
  }

  try {
    const url = new URL(value, baseUrl);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    return url;
  } catch {
    return null;
  }
}

function collectBlockingResources(html, baseUrl) {
  const resources = new Set();
  const linkPattern = /<link\b[^>]*\bhref=["']([^"']+)["'][^>]*>/gi;
  const scriptPattern = /<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi;

  for (const match of html.matchAll(linkPattern)) {
    const tag = match[0];
    const rel = /\brel=["']([^"']+)["']/i.exec(tag)?.[1]?.toLowerCase() ?? "";
    if (!rel.split(/\s+/).includes("stylesheet")) {
      continue;
    }

    const url = resourceUrl(match[1], baseUrl);
    if (url) {
      resources.add(url.href);
    }
  }

  for (const match of html.matchAll(scriptPattern)) {
    const url = resourceUrl(match[1], baseUrl);
    if (url) {
      resources.add(url.href);
    }
  }

  return [...resources].sort();
}

async function timedFetch(url) {
  const start = performance.now();
  const response = await fetch(url, { cache: "no-store" });
  const body = await response.arrayBuffer();
  const duration = performance.now() - start;

  if (!response.ok) {
    throw new Error(`${url} returned ${response.status}`);
  }

  return { body, duration };
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

async function measureRoute(baseUrl, route) {
  const htmlTimes = [];
  const blockingTimes = [];
  let resources = [];

  for (let i = 0; i < ITERATIONS; i += 1) {
    const htmlUrl = new URL(route, baseUrl);
    htmlUrl.searchParams.set("__measure", String(i));

    const htmlStart = performance.now();
    const htmlResponse = await timedFetch(htmlUrl);
    const html = new TextDecoder().decode(htmlResponse.body);
    resources = collectBlockingResources(html, baseUrl);

    await Promise.all(
      resources.map((resource) => {
        const url = new URL(resource);
        if (url.origin === baseUrl) {
          url.searchParams.set("__measure", String(i));
        }
        return timedFetch(url);
      }),
    );

    htmlTimes.push(htmlResponse.duration);
    blockingTimes.push(performance.now() - htmlStart);
  }

  return {
    route,
    htmlMs: median(htmlTimes),
    blockingMs: median(blockingTimes),
    resources,
  };
}

const server = await startStaticServer();
const address = server.address();
const baseUrl = `http://127.0.0.1:${address.port}`;

try {
  const routes = (await collectHtmlFiles()).map(routeFromHtmlFile);
  const results = [];

  for (const route of routes) {
    results.push(await measureRoute(baseUrl, route));
  }

  const failures = results.filter((result) => result.blockingMs >= THRESHOLD_MS);

  console.log(`Measured ${results.length} pages from dist over ${ITERATIONS} iterations.`);
  console.log(`Threshold: HTML plus render-blocking styles/scripts loaded in < ${THRESHOLD_MS} ms.`);
  console.table(
    results.map((result) => ({
      route: result.route,
      html_ms: result.htmlMs.toFixed(2),
      blocking_ms: result.blockingMs.toFixed(2),
      resources: result.resources.length,
    })),
  );

  if (failures.length > 0) {
    console.error(
      `Failed threshold: ${failures.map((result) => `${result.route} ${result.blockingMs.toFixed(2)}ms`).join(", ")}`,
    );
    process.exitCode = 1;
  }
} finally {
  await new Promise((resolve) => server.close(resolve));
}
