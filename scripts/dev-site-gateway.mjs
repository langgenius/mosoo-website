#!/usr/bin/env node
import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import http from "node:http";
import net from "node:net";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const HOST = "127.0.0.1";
const PUBLIC_HOST = "localhost";
const DEFAULT_GATEWAY_PORT = 3000;
const INTERNAL_PORT_START = 4300;
const REQUEST_TIMEOUT_MS = 30_000;
const READY_TIMEOUT_MS = 60_000;
const DOCS_JSON_FILES = new Map([
  ["mosoo-openapi.generated.json", "mosoo-openapi.generated.json"],
  ["mosoo-openapi.en.generated.json", "mosoo-openapi.en.generated.json"],
  ["mosoo-openapi.zh-Hans.generated.json", "mosoo-openapi.zh-Hans.generated.json"],
  ["openapi.json", "mosoo-openapi.en.generated.json"],
]);
const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

const children = [];
let gatewayServer;
let shuttingDown = false;

function log(message) {
  process.stdout.write(`${message}\n`);
}

function getBin(name, workspacePath = ROOT) {
  const suffix = process.platform === "win32" ? ".cmd" : "";
  return join(workspacePath, "node_modules", ".bin", `${name}${suffix}`);
}

function getRootBin(name) {
  return getBin(name, ROOT);
}

function isPortFree(port, host = HOST) {
  return new Promise((resolvePort) => {
    const server = net.createServer();
    server.once("error", () => resolvePort(false));
    server.once("listening", () => {
      server.close(() => resolvePort(true));
    });
    server.listen(port, host);
  });
}

async function findFreePort(startPort, host = HOST) {
  for (let port = startPort; port < startPort + 200; port += 1) {
    if (await isPortAvailable(port, host)) {
      return port;
    }
  }
  throw new Error(`No free port found from ${startPort}`);
}

async function isPortAvailable(port, host = HOST) {
  if (!(await isPortFree(port, host))) {
    return false;
  }
  if (host !== "0.0.0.0" && !(await isPortFree(port, "0.0.0.0"))) {
    return false;
  }
  if (host !== HOST && !(await isPortFree(port, HOST))) {
    return false;
  }
  return true;
}

async function reservePorts() {
  const requestedGatewayPort = Number(process.env["SITE_DEV_PORT"] ?? DEFAULT_GATEWAY_PORT);
  const gatewayPort =
    process.env["SITE_DEV_PORT"] && !(await isPortAvailable(requestedGatewayPort, "0.0.0.0"))
      ? (() => {
          throw new Error(`SITE_DEV_PORT ${requestedGatewayPort} is already in use`);
        })()
      : await findFreePort(requestedGatewayPort, "0.0.0.0");

  const landingPort = await findFreePort(
    Number(process.env["LANDING_DEV_PORT"] ?? INTERNAL_PORT_START),
    "0.0.0.0",
  );
  const blogPort = await findFreePort(Number(process.env["BLOG_DEV_PORT"] ?? landingPort + 1), "0.0.0.0");
  const docsPort = await findFreePort(Number(process.env["MINT_DEV_PORT"] ?? blogPort + 1), "0.0.0.0");

  return { gatewayPort, landingPort, blogPort, docsPort };
}

function prefixChildOutput(name, stream, output) {
  output.setEncoding("utf8");
  let buffer = "";
  output.on("data", (chunk) => {
    buffer += chunk;
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      const clean = line.replace(/\u001b\[[0-9;]*[A-Za-z]/g, "").trimEnd();
      if (clean.length > 0 && shouldPrintChildLine(clean)) {
        stream.write(`[${name}] ${clean}\n`);
      }
    }
  });
}

function shouldPrintChildLine(line) {
  return !(
    /\b(?:local|network)\b\s*(?::|→)?\s*https?:\/\//i.test(line) ||
    /➜\s+local:/i.test(line) ||
    /press ctrl\+c/i.test(line)
  );
}

function startChild(name, command, args, options = {}) {
  const child = spawn(command, args, {
    cwd: options.cwd ?? ROOT,
    env: {
      ...process.env,
      ...options.env,
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  children.push({ child, name });
  prefixChildOutput(name, process.stdout, child.stdout);
  prefixChildOutput(name, process.stderr, child.stderr);

  child.once("exit", (code, signal) => {
    if (!shuttingDown) {
      shutdown(new Error(`${name} exited unexpectedly (${signal ?? code ?? "unknown"})`));
    }
  });

  return child;
}

function requestStatus(origin, path) {
  return new Promise((resolveStatus) => {
    const request = http.request(`${origin}${path}`, { method: "GET", timeout: 2_000 }, (response) => {
      response.resume();
      resolveStatus(response.statusCode ?? 0);
    });
    request.once("timeout", () => {
      request.destroy();
      resolveStatus(0);
    });
    request.once("error", () => resolveStatus(0));
    request.end();
  });
}

async function waitForReady(name, origin, path = "/") {
  const startedAt = Date.now();
  while (Date.now() - startedAt < READY_TIMEOUT_MS) {
    const status = await requestStatus(origin, path);
    if (status >= 200 && status < 500) {
      return;
    }
    await new Promise((resolveSleep) => setTimeout(resolveSleep, 500));
  }
  throw new Error(`${name} did not become ready at ${origin}${path}`);
}

function copyHeaders(headers, overrides = {}) {
  const nextHeaders = {};
  for (const [key, value] of Object.entries(headers)) {
    if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
      nextHeaders[key] = value;
    }
  }
  return { ...nextHeaders, ...overrides };
}

function docsPathFromGateway(pathname) {
  if (pathname === "/docs") {
    return "/";
  }
  return normalizeDocsPath(pathname.slice("/docs".length) || "/");
}

function normalizeDocsPath(pathname) {
  return pathname.replace(/\/{2,}/g, "/") || "/";
}

function isDocsRootPath(pathname) {
  return (
    pathname === "/index" ||
    pathname === "/quickstart" ||
    pathname === "/auth-and-access" ||
    pathname.startsWith("/_mintlify/") ||
    pathname.startsWith("/api-reference/") ||
    pathname.startsWith("/cli/") ||
    pathname === "/zh-Hans" ||
    pathname.startsWith("/zh-Hans/") ||
    pathname.startsWith("/src/_props/") ||
    pathname.startsWith("/openapi") ||
    pathname.startsWith("/mosoo-openapi")
  );
}

function isDocsOgImagePath(pathname) {
  return pathname === "/_mintlify/api/og" || pathname === "/docs/_mintlify/api/og";
}

function docsStaticJsonFile(pathname) {
  const docsPath = pathname.startsWith("/docs/") ? pathname.slice("/docs/".length) : pathname.slice(1);
  return DOCS_JSON_FILES.get(docsPath);
}

function isStaleAstroToolbarDepPath(pathname) {
  return (
    pathname === "/node_modules/.vite/deps/astro_runtime_client_dev-toolbar_entrypoint__js.js" ||
    pathname === "/blog/node_modules/.vite/deps/astro_runtime_client_dev-toolbar_entrypoint__js.js"
  );
}

function isBlogInternalPath(pathname) {
  return (
    pathname.startsWith("/blog/@vite/") ||
    pathname === "/blog/@vite/client" ||
    pathname.startsWith("/blog/@id/") ||
    pathname.startsWith("/blog/@fs/") ||
    pathname.startsWith("/blog/@react-refresh") ||
    pathname.startsWith("/blog/node_modules/") ||
    pathname.startsWith("/blog/src/") ||
    pathname === "/blog/__vite_ping"
  );
}

function isRootViteInternalPath(pathname) {
  return (
    pathname.startsWith("/@vite/") ||
    pathname === "/@vite/client" ||
    pathname.startsWith("/@id/") ||
    pathname.startsWith("/@fs/") ||
    pathname.startsWith("/@react-refresh") ||
    pathname.startsWith("/node_modules/") ||
    pathname.startsWith("/src/") ||
    pathname === "/__vite_ping"
  );
}

function isAstroInternalPath(pathname) {
  return (
    pathname.startsWith("/@id/astro/") ||
    pathname.includes("/astro_runtime_") ||
    pathname.includes("/astro-") ||
    pathname.includes("/audit-") ||
    pathname.includes("/xray-") ||
    pathname.includes("/toolbar-") ||
    pathname.includes("/ui-library-")
  );
}

function getRefererPath(headers) {
  const referer = headers.referer ?? headers.referrer;
  if (typeof referer !== "string") {
    return "";
  }
  try {
    return new URL(referer).pathname;
  } catch {
    return "";
  }
}

function shouldRouteRootInternalToBlog(pathname, headers) {
  const refererPath = getRefererPath(headers);
  return (
    isRootViteInternalPath(pathname) &&
    (refererPath === "/blog" ||
      refererPath.startsWith("/blog/") ||
      isBlogInternalPath(refererPath) ||
      isAstroInternalPath(refererPath) ||
      isAstroInternalPath(pathname))
  );
}

function docsPropsRedirectPath(pathname) {
  let propsPath;
  if (pathname === "/docs/src/_props" || pathname.startsWith("/docs/src/_props/")) {
    propsPath = pathname.slice("/docs/src/_props".length);
  } else if (pathname === "/src/_props" || pathname.startsWith("/src/_props/")) {
    propsPath = pathname.slice("/src/_props".length);
  } else {
    return undefined;
  }

  const pagePath = normalizeDocsPath(propsPath || "/").replace(/\/index$/, "") || "/";
  return pagePath === "/" ? "/docs" : `/docs${pagePath}`;
}

function routeFor(requestUrl, targets, headers = {}) {
  const url = new URL(requestUrl, "http://gateway.local");

  const propsRedirect = docsPropsRedirectPath(url.pathname);
  if (propsRedirect) {
    return { redirect: `${propsRedirect}${url.search}` };
  }

  if (isDocsOgImagePath(url.pathname)) {
    return { inline: "docs-og" };
  }

  const docsJsonFile = docsStaticJsonFile(url.pathname);
  if (docsJsonFile) {
    return { inline: "docs-json", file: docsJsonFile };
  }

  if (isStaleAstroToolbarDepPath(url.pathname)) {
    return { inline: "blog-astro-toolbar-entrypoint" };
  }

  if (shouldRouteRootInternalToBlog(url.pathname, headers)) {
    return { kind: "blog", origin: targets.blog, path: `${url.pathname}${url.search}` };
  }

  if (isBlogInternalPath(url.pathname)) {
    return {
      kind: "blog",
      origin: targets.blog,
      path: `${url.pathname.slice("/blog".length)}${url.search}`,
    };
  }

  if (
    url.pathname.startsWith("/_next/") ||
    url.pathname.startsWith("/favicons/") ||
    url.pathname === "/sitemap.xml" ||
    url.pathname === "/llms.txt" ||
    isDocsRootPath(url.pathname)
  ) {
    return { kind: "docs", origin: targets.docs, path: `${normalizeDocsPath(url.pathname)}${url.search}` };
  }

  if (url.pathname === "/api-reference" || url.pathname.startsWith("/api-reference/")) {
    return { redirect: `/docs${url.pathname}${url.search}` };
  }

  if (url.pathname === "/docs") {
    return { redirect: "/docs/" };
  }

  if (url.pathname.startsWith("/docs/")) {
    return {
      kind: "docs",
      origin: targets.docs,
      path: `${docsPathFromGateway(url.pathname)}${url.search}`,
    };
  }

  if (url.pathname === "/blog" || url.pathname.startsWith("/blog/")) {
    return { kind: "blog", origin: targets.blog, path: requestUrl };
  }

  return { kind: "landing", origin: targets.landing, path: requestUrl };
}

function rewriteDocsLocation(location) {
  if (location.startsWith("/docs/") || location === "/docs") {
    return location;
  }
  if (location.startsWith("/")) {
    return `/docs${location}`;
  }
  return location;
}

function sendDocsOgImage(res) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="#ffffff"/><rect x="92" y="108" width="64" height="64" fill="#5ee000"/><path d="M92 188h64v12H92z" fill="#5ee000"/><text x="188" y="170" font-family="Arial, Helvetica, sans-serif" font-size="64" font-weight="700" fill="#0a1f1b">Mosoo API</text><text x="96" y="315" font-family="Arial, Helvetica, sans-serif" font-size="40" font-weight="600" fill="#086030">Developer documentation</text><text x="96" y="380" font-family="Arial, Helvetica, sans-serif" font-size="30" fill="#4b5563">Call published Mosoo Agents from your applications.</text></svg>`;
  res.writeHead(200, {
    "content-type": "image/svg+xml; charset=utf-8",
    "cache-control": "no-store",
    "content-length": Buffer.byteLength(svg),
  });
  res.end(svg);
}

function sendDocsJson(res, fileName) {
  const filePath = join(ROOT, fileName);
  if (!existsSync(filePath)) {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("OpenAPI file not found\n");
    return;
  }

  const body = readFileSync(filePath);
  res.writeHead(200, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "content-length": body.byteLength,
  });
  res.end(body);
}

function sendBlogAstroToolbarEntrypoint(res) {
  const script = `import "/blog/@id/astro/runtime/client/dev-toolbar/entrypoint.js";\nexport {};\n`;
  res.writeHead(200, {
    "content-type": "application/javascript; charset=utf-8",
    "cache-control": "no-store",
    "content-length": Buffer.byteLength(script),
  });
  res.end(script);
}

function rewriteDocsHeaderValue(value) {
  return value.replace(/([<="'])\/(?!\/|docs(?:\/|[>"'])|blog(?:\/|[>"']))/g, "$1/docs/");
}

function rewriteDocsRequestHeaders(headers) {
  const nextUrl = headers["next-url"];
  if (typeof nextUrl === "string" && (nextUrl === "/docs" || nextUrl.startsWith("/docs/"))) {
    const url = new URL(nextUrl, "http://gateway.local");
    headers["next-url"] = `${docsPathFromGateway(url.pathname)}${url.search}`;
  }
  return headers;
}

function rewriteDocsBody(body) {
  return body
    .replace(/\b(href|src|action|content)=("|')\/(?!\/|docs(?:\/|["'])|blog(?:\/|["']))/g, '$1=$2/docs/')
    .replace(/\b(url\(\s*['"]?)\/(?!\/|docs\/|blog\/)/g, "$1/docs/")
    .replace(/\bhref=(["'])https:\/\/mosoo\.ai\/?\1/g, "href=$1/$1");
}

function rewriteBlogBody(body) {
  return body
    .replace(
      /\b(src|href)=("|')\/(?=(@vite(?:\/|["'])|@id\/|@fs\/|@react-refresh|node_modules\/|src\/|__vite_ping(?:\?|["'])))/g,
      "$1=$2/blog/",
    )
    .replace(
      /(["'`])\/((?:@vite|@id|@fs|@react-refresh|node_modules|src|__vite_ping)(?:\/|\?)[^"'`\s<>)]*)/g,
      "$1/blog/$2",
    );
}

function shouldRewriteDocsResponse(headers) {
  const contentType = String(headers["content-type"] ?? "");
  return /text\/html|text\/css/.test(contentType);
}

function shouldRewriteBlogResponse(headers) {
  const contentType = String(headers["content-type"] ?? "");
  return /text\/html|text\/css|javascript|application\/json/.test(contentType);
}

function proxyHttp(req, res, route) {
  if (route.inline === "docs-og") {
    sendDocsOgImage(res);
    return;
  }

  if (route.inline === "docs-json") {
    sendDocsJson(res, route.file);
    return;
  }

  if (route.inline === "blog-astro-toolbar-entrypoint") {
    sendBlogAstroToolbarEntrypoint(res);
    return;
  }

  if (route.redirect) {
    res.writeHead(302, { location: route.redirect });
    res.end();
    return;
  }

  const target = new URL(route.path, route.origin);
  const headers = copyHeaders(req.headers, {
    host: target.host,
    "accept-encoding": "identity",
    "x-forwarded-host": req.headers.host ?? "",
    "x-forwarded-proto": "http",
  });
  if (route.kind === "docs") {
    rewriteDocsRequestHeaders(headers);
  }

  const proxyRequest = http.request(
    target,
    {
      headers,
      method: req.method,
      timeout: REQUEST_TIMEOUT_MS,
    },
    (proxyResponse) => {
      const responseHeaders = copyHeaders(proxyResponse.headers);
      const location = responseHeaders.location;
      if (route.kind === "docs" && typeof location === "string") {
        responseHeaders.location = rewriteDocsLocation(location);
      }
      const link = responseHeaders.link;
      if (route.kind === "docs" && typeof link === "string") {
        responseHeaders.link = rewriteDocsHeaderValue(link);
      }

      const shouldRewriteDocs = route.kind === "docs" && shouldRewriteDocsResponse(proxyResponse.headers);
      const shouldRewriteBlog = route.kind === "blog" && shouldRewriteBlogResponse(proxyResponse.headers);

      if (!shouldRewriteDocs && !shouldRewriteBlog) {
        res.writeHead(proxyResponse.statusCode ?? 502, responseHeaders);
        proxyResponse.pipe(res);
        return;
      }

      const chunks = [];
      proxyResponse.on("data", (chunk) => chunks.push(chunk));
      proxyResponse.on("end", () => {
        const body = Buffer.concat(chunks).toString("utf8");
        const rewritten = shouldRewriteDocs ? rewriteDocsBody(body) : rewriteBlogBody(body);
        delete responseHeaders["content-length"];
        delete responseHeaders["content-encoding"];
        res.writeHead(proxyResponse.statusCode ?? 502, responseHeaders);
        res.end(rewritten);
      });
    },
  );

  proxyRequest.once("timeout", () => {
    proxyRequest.destroy(new Error(`Timed out proxying ${req.url}`));
  });
  proxyRequest.once("error", (error) => {
    if (!res.headersSent) {
      res.writeHead(502, { "content-type": "text/plain; charset=utf-8" });
    }
    res.end(`Gateway proxy error: ${error.message}\n`);
  });

  req.pipe(proxyRequest);
}

function proxyUpgrade(req, socket, head, route) {
  if (route.redirect || route.inline) {
    socket.destroy();
    return;
  }

  const target = new URL(route.path, route.origin);
  const proxySocket = net.connect(Number(target.port), target.hostname, () => {
    const headers = [
      `${req.method} ${target.pathname}${target.search} HTTP/${req.httpVersion}`,
      ...Object.entries(req.headers)
        .filter(([key]) => key.toLowerCase() !== "host")
        .map(([key, value]) => `${key}: ${value}`),
      `host: ${target.host}`,
      "",
      "",
    ];
    proxySocket.write(headers.join("\r\n"));
    if (head.length > 0) {
      proxySocket.write(head);
    }
    socket.pipe(proxySocket).pipe(socket);
  });

  proxySocket.once("error", () => socket.destroy());
}

function createGateway(targets, gatewayPort) {
  const server = http.createServer((req, res) => {
    proxyHttp(req, res, routeFor(req.url ?? "/", targets, req.headers));
  });

  server.on("upgrade", (req, socket, head) => {
    proxyUpgrade(req, socket, head, routeFor(req.url ?? "/", targets, req.headers));
  });

  return new Promise((resolveServer, rejectServer) => {
    server.once("error", rejectServer);
    server.listen(gatewayPort, "0.0.0.0", () => {
      gatewayServer = server;
      resolveServer(server);
    });
  });
}

function shutdown(error) {
  if (shuttingDown) {
    return;
  }
  shuttingDown = true;
  if (error) {
    process.stderr.write(`${error.message}\n`);
  }

  gatewayServer?.close();
  for (const { child } of children) {
    if (child.pid) {
      child.kill("SIGTERM");
    }
  }

  setTimeout(() => {
    process.exit(error ? 1 : 0);
  }, 300);
}

async function main() {
  const ports = await reservePorts();
  const targets = {
    landing: `http://${HOST}:${ports.landingPort}`,
    blog: `http://${HOST}:${ports.blogPort}`,
    docs: `http://${HOST}:${ports.docsPort}`,
  };

  log("Starting Mosoo site gateway...");

  const landingRoot = join(ROOT, "apps", "landing");
  const blogRoot = join(ROOT, "apps", "blog");

  startChild("landing", getBin("vite", landingRoot), [
    "--host",
    HOST,
    "--port",
    String(ports.landingPort),
    "--strictPort",
  ], {
    cwd: landingRoot,
  });

  startChild("blog", getRootBin("astro"), [
    "dev",
    "--host",
    HOST,
    "--port",
    String(ports.blogPort),
  ], {
    cwd: blogRoot,
  });

  startChild("docs", "mint", [
    "dev",
    "--no-open",
    "--port",
    String(ports.docsPort),
  ]);

  await Promise.all([
    waitForReady("landing", targets.landing),
    waitForReady("blog", targets.blog, "/blog"),
    waitForReady("docs", targets.docs),
  ]);

  await createGateway(targets, ports.gatewayPort);

  log("");
  log(`Mosoo site gateway ready: http://${PUBLIC_HOST}:${ports.gatewayPort}`);
  log(`  Landing Page : http://${PUBLIC_HOST}:${ports.gatewayPort}/`);
  log(`  Blog         : http://${PUBLIC_HOST}:${ports.gatewayPort}/blog`);
  log(`  API docs     : http://${PUBLIC_HOST}:${ports.gatewayPort}/docs`);
  log("");
  log("Press Ctrl+C to stop the gateway and all child servers.");
}

process.once("SIGINT", () => shutdown());
process.once("SIGTERM", () => shutdown());

main().catch((error) => shutdown(error));
