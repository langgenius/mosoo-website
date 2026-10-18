import { locale } from "@/shared/locale";
import type { Locale } from "@/shared/locale";

export const MOSOO_GITHUB_URL = "https://github.com/langgenius/mosoo/";

export const MOSOO_X_URL = "https://x.com/mosooagent";

export const MOSOO_DOCS_URL = "https://mosoo.ai/docs/";
export const MOSOO_API_REFERENCE_URL = `${MOSOO_DOCS_URL}api-reference/`;
// Release-by-release product updates, kept with the docs (langgenius/mosoo-docs).
// English only: the zh-Hans and ja variants return 404.
export const MOSOO_CHANGELOG_URL = `${MOSOO_DOCS_URL}changelog/`;

export const MOSOO_RELEASES_URL = `${MOSOO_GITHUB_URL}releases`;
export const MOSOO_LICENSE_URL = `${MOSOO_GITHUB_URL}blob/main/LICENSE`;
export const MOSOO_SECURITY_URL = `${MOSOO_GITHUB_URL}security`;
export const MOSOO_SPEC_URL = `${MOSOO_GITHUB_URL}blob/main/docs/SPEC.md`;
export const MOSOO_ISSUES_LIST_URL = `${MOSOO_GITHUB_URL}issues`;
export const MOSOO_AGENT_DRIVER_URL = "https://github.com/langgenius/mosoo-agent-driver";

// Status page channels: issues are reported against the open-source repository
// (it carries the issue templates), and incident postmortems are published in
// its operations docs.
export const MOSOO_ISSUES_URL = `${MOSOO_GITHUB_URL}issues/new/choose`;
export const MOSOO_INCIDENTS_URL = `${MOSOO_GITHUB_URL}tree/main/docs/operations/incidents`;

// Blog lives at /blog on the same custom domain but is served by a separate
// Cloudflare Worker (apps/blog). Use a plain <a href> so the browser leaves
// the SPA and lets the blog worker take over.
export const MOSOO_BLOG_URL = "https://mosoo.ai/blog";

// Product entry points. Both are separate deployments from this site, so the
// chrome links to them with plain <a href> tags.
export const MOSOO_CLOUD_URL = "https://cloud.mosoo.ai";
export const MOSOO_LOGIN_URL = `${MOSOO_CLOUD_URL}/login`;
export const MOSOO_COMPUTER_URL = "https://computer.mosoo.ai";
export const MOSOO_OPENAPI_V2_URL = `${MOSOO_CLOUD_URL}/api/v2/openapi.json`;

// The console's onboarding installs the CLI and the @mosoo skill with this
// script (mosoo apps/web onboarding-setup-prompt.ts).
export const MOSOO_INSTALL_SCRIPT_URL = "https://install.mosoo.ai/install.sh";
export const MOSOO_INSTALL_COMMAND = `curl -fsSL ${MOSOO_INSTALL_SCRIPT_URL} | bash`;

// The docs site serves zh under /docs/zh-Hans/ and ja under /docs/ja/.
const DOCS_LOCALE_PREFIX = {
  en: "",
  zh: "zh-Hans/",
  ja: "ja/",
} as const satisfies Record<Locale, string>;

/** A docs page in the visitor's locale, e.g. docsUrl("quickstart/"). */
export function docsUrl(path = "", forLocale: Locale = locale): string {
  return `${MOSOO_DOCS_URL}${DOCS_LOCALE_PREFIX[forLocale]}${path}`;
}

export function blogUrl(forLocale: Locale = locale): string {
  return forLocale === "en" ? MOSOO_BLOG_URL : `${MOSOO_BLOG_URL}/${forLocale}`;
}

export function statusPath(forLocale: Locale = locale): string {
  return forLocale === "en" ? "/health" : `/${forLocale}/health`;
}

// Not a hook: named "pathTo…" so it never reads like one.
export function pathToUseCases(slug = "", forLocale: Locale = locale): string {
  return slug === "" ? `/${forLocale}/use-cases` : `/${forLocale}/use-cases/${slug}`;
}
