const CONSOLE_ORIGIN = "https://try.mosoo.ai";
const LOCALE_COOKIE = "mosoo_locale";

function redirect(url, status = 307) {
  return Response.redirect(url.toString(), status);
}

function permanentRedirect(url) {
  return redirect(url, 308);
}

function shouldDropTrailingSlash(pathname) {
  return pathname.length > 1 && pathname.endsWith("/") && !pathname.startsWith("/docs/");
}

function preferredLocale(request) {
  const prefix = `${LOCALE_COOKIE}=`;
  const locale = request.headers
    .get("cookie")
    ?.split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(prefix))
    ?.slice(prefix.length);

  if (locale === "en" || locale === "zh" || locale === "ja") {
    return locale;
  }

  const country = request.cf?.country ?? request.headers.get("CF-IPCountry");
  if (country === "CN") return "zh";
  if (country === "JP") return "ja";
  return "en";
}

function localeRedirect(request, url, subpath = "") {
  url.pathname = `/${preferredLocale(request)}${subpath}`;
  return new Response(null, {
    status: 307,
    headers: {
      "cache-control": "private, no-store",
      location: url.toString(),
      vary: "Cookie",
    },
  });
}

function withPath(request, pathname) {
  const url = new URL(request.url);
  url.pathname = pathname;
  return new Request(url.toString(), request);
}

function isConsolePath(pathname) {
  return (
    pathname === "/login" ||
    pathname === "/onboarding" ||
    pathname === "/apps" ||
    pathname.startsWith("/apps/") ||
    pathname === "/threads" ||
    pathname.startsWith("/threads/") ||
    pathname === "/agent" ||
    pathname.startsWith("/agent/") ||
    pathname === "/providers" ||
    pathname === "/settings" ||
    pathname.startsWith("/settings/") ||
    pathname === "/app-settings" ||
    pathname.startsWith("/app-settings/") ||
    pathname === "/deployments" ||
    pathname === "/files" ||
    pathname === "/environment" ||
    pathname.startsWith("/environment/")
  );
}

function isLegacyDocsRootPath(pathname) {
  return (
    pathname === "/quickstart" ||
    pathname.startsWith("/quickstart/") ||
    pathname === "/auth-and-access" ||
    pathname.startsWith("/auth-and-access/") ||
    pathname === "/coding-agents" ||
    pathname.startsWith("/coding-agents/") ||
    pathname === "/api-reference" ||
    pathname.startsWith("/api-reference/") ||
    pathname === "/cli" ||
    pathname.startsWith("/cli/") ||
    pathname === "/zh-Hans" ||
    pathname.startsWith("/zh-Hans/") ||
    pathname === "/llms.txt" ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/images/") ||
    pathname.startsWith("/favicons/")
  );
}

async function blogNotFound(request, env) {
  const notFound = await env.ASSETS.fetch(withPath(request, "/blog/404"));
  if (notFound.status === 404) {
    return new Response("Not found", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  const body = await notFound.arrayBuffer();
  return new Response(body, {
    status: 404,
    statusText: "Not Found",
    headers: notFound.headers,
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const forceHttps = url.protocol === "http:";
    const dropTrailingSlash = shouldDropTrailingSlash(pathname);

    if (forceHttps) url.protocol = "https:";
    if (dropTrailingSlash) url.pathname = pathname.slice(0, -1);

    if (pathname === "/") {
      return localeRedirect(request, url);
    }

    // Bare /pricing is a geo-aware entry point, mirroring "/"; the canonical
    // localized pages live at /en/pricing, /zh/pricing, and /ja/pricing.
    if (pathname === "/pricing") {
      return localeRedirect(request, url, "/pricing");
    }

    if (isConsolePath(pathname)) {
      url.hostname = new URL(CONSOLE_ORIGIN).hostname;
      return redirect(url);
    }

    if (pathname === "/blogs" || pathname === "/blogs/") {
      url.pathname = "/blog";
      return permanentRedirect(url);
    }

    if (pathname.startsWith("/blogs/")) {
      url.pathname = `/blog/${pathname.slice("/blogs/".length).replace(/\/$/, "")}`;
      return permanentRedirect(url);
    }

    if (pathname === "/docs") {
      url.pathname = "/docs/";
      return permanentRedirect(url);
    }

    if (isLegacyDocsRootPath(pathname)) {
      url.pathname = `/docs${pathname}`;
      return permanentRedirect(url);
    }

    if (forceHttps || dropTrailingSlash) {
      return permanentRedirect(url);
    }

    const asset = await env.ASSETS.fetch(request);
    if (asset.status !== 404) {
      return asset;
    }

    if (pathname === "/blog/" || pathname.startsWith("/blog/")) {
      return blogNotFound(request, env);
    }

    if (pathname === "/docs/" || pathname.startsWith("/docs/")) {
      return asset;
    }

    url.pathname = "/";
    return redirect(url);
  },
};
