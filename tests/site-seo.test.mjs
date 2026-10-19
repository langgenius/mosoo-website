import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

import { homeFaq, homeHeadline } from "../scripts/landing-home.mjs";
import {
  renderLandingLocale,
  renderPricingLocale,
  renderStatusLocale,
  renderUseCaseBlueprintLocale,
  renderUseCaseCodexPetLocale,
  renderUseCaseGhfindLocale,
  renderUseCaseGoGymLocale,
  renderUseCasePitchPilotLocale,
  renderUseCasesLocale,
} from "../scripts/landing-locales.mjs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const LOCALES = ["en", "zh", "ja"];
const HTML_LANG = { en: "en", zh: "zh-CN", ja: "ja" };
// The home page as served at /en, /zh and /ja (index.html after the locale build).
const home = (locale) => renderLandingLocale(read("apps/landing/index.html"), locale);

const decodeEntities = (value) =>
  value
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&amp;", "&");
const textOf = (html) => decodeEntities(html.replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();
const hrefsOf = (html) => [...html.matchAll(/\bhref="([^"]+)"/g)].map((match) => decodeEntities(match[1]));
const headingsOf = (html, level) =>
  [...html.matchAll(new RegExp(`<h${level}\\b[^>]*>([\\s\\S]*?)</h${level}>`, "g"))].map((match) =>
    textOf(match[1]),
  );
const sectionIdsOf = (html) => [...html.matchAll(/<section id="([^"]+)"/g)].map((match) => match[1]);
const jsonLdScriptsOf = (html) =>
  [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((match) => match[1]);
const graphOf = (html) => {
  const scripts = jsonLdScriptsOf(html);
  assert.equal(scripts.length, 1, "the home page carries one JSON-LD script");
  return JSON.parse(scripts[0]);
};
const nodesByType = (graph) => Object.fromEntries(graph["@graph"].map((node) => [node["@type"], node]));
// Question and answer text as a reader sees it in the static FAQ section.
const visibleFaqOf = (html) => {
  const section = /<section id="faq"[\s\S]*?<\/section>/.exec(html)?.[0] ?? "";
  return [...section.matchAll(/<h3>([\s\S]*?)<\/h3>\s*<p>([\s\S]*?)<\/p>/g)].map((match) => [
    textOf(match[1]),
    textOf(match[2]),
  ]);
};

// Narrative the main repo retired or never supported (SPEC section 8, README).
const RETIRED_NARRATIVE =
  /App-owner|App owner|Publish an Agent|already published|self-host|Self-host|Deploy to Cloudflare|for coding agents|\bChannels\b|\bKV\b|sandbox ready in|mst_|Personal Access Token/;

const HOME_LINKS = {
  en: {
    docs: "https://mosoo.ai/docs/",
    quickstart: "https://mosoo.ai/docs/quickstart/",
    apiReference: "https://mosoo.ai/docs/api-reference-v2/",
    blog: "https://mosoo.ai/blog",
    health: "/health",
  },
  zh: {
    docs: "https://mosoo.ai/docs/zh-Hans/",
    quickstart: "https://mosoo.ai/docs/zh-Hans/quickstart/",
    apiReference: "https://mosoo.ai/docs/zh-Hans/api-reference-v2/",
    blog: "https://mosoo.ai/blog/zh",
    health: "/zh/health",
  },
  ja: {
    docs: "https://mosoo.ai/docs/ja/",
    quickstart: "https://mosoo.ai/docs/ja/quickstart/",
    apiReference: "https://mosoo.ai/docs/ja/api-reference-v2/",
    blog: "https://mosoo.ai/blog/ja",
    health: "/ja/health",
  },
};

// Crawlable links in the static home page: navigation, every language, the v2
// docs, both OpenAPI contracts, llms.txt, the source and the console.
const assertHomeSiteLinks = (html, locale) => {
  const links = HOME_LINKS[locale];
  const hrefs = hrefsOf(html);

  assert.match(html, /<nav aria-label="Primary site links">/);
  for (const href of [
    "/en",
    "/zh",
    "/ja",
    `/${locale}/use-cases`,
    `/${locale}/use-cases/codex-pet`,
    `/${locale}/use-cases/ghfind`,
    links.health,
    links.docs,
    links.quickstart,
    links.apiReference,
    links.blog,
    "https://cloud.mosoo.ai",
    "https://cloud.mosoo.ai/login",
    "https://computer.mosoo.ai",
    "https://github.com/langgenius/mosoo",
    "https://github.com/langgenius/mosoo/blob/main/docs/SPEC.md",
    "https://cloud.mosoo.ai/api/v2/openapi.json",
    "https://cloud.mosoo.ai/api/v1/openapi.json",
    "https://mosoo.ai/llms.txt",
    "https://install.mosoo.ai/install.sh",
  ]) {
    assert.ok(hrefs.includes(href), `${locale} home page links ${href}`);
  }
};
const locations = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const alternates = (xml) =>
  [...xml.matchAll(/<xhtml:link rel="alternate" hreflang="([^"]+)" href="([^"]+)" \/>/g)].map(
    (match) => [match[1], match[2]],
  );
const sitemapEntries = (xml) =>
  [...xml.matchAll(/<url>\s*<loc>([^<]+)<\/loc>([\s\S]*?)<\/url>/g)].map((match) => ({
    loc: match[1],
    alternates: alternates(match[2]),
  }));

const assertInitialSiteLinks = (html, locale = "en") => {
  assert.match(html, /aria-label="Primary site links"/);
  assert.match(html, /href="https:\/\/cloud\.mosoo\.ai">Mosoo<\/a>/);
  assert.match(html, /href="https:\/\/computer\.mosoo\.ai">Mosoo Computer<\/a>/);
  assert.match(html, new RegExp(`href="/${locale}/pricing"`));
  assert.match(html, new RegExp(`href="/${locale}/use-cases"`));
  assert.match(html, new RegExp(`href="${locale === "en" ? "/health" : `/${locale}/health`}"`));
  assert.match(html, /href="https:\/\/mosoo\.ai\/docs\/"/);
  assert.match(html, /href="https:\/\/mosoo\.ai\/docs\/quickstart\/"/);
  assert.match(html, /href="https:\/\/mosoo\.ai\/blog"/);
  assert.match(html, /href="https:\/\/github\.com\/langgenius\/mosoo\/"/);
  assert.match(html, /href="https:\/\/cloud\.mosoo\.ai\/login"/);
};

test("the root sitemap aggregates every public content surface", () => {
  const sitemap = read("apps/landing/public/sitemap.xml");

  assert.match(sitemap, /<sitemapindex\b/);
  assert.deepEqual(locations(sitemap), [
    "https://mosoo.ai/sitemap-pages.xml",
    "https://mosoo.ai/blog/sitemap-0.xml",
    "https://mosoo.ai/docs/sitemap.xml",
  ]);
});
test("the main-page sitemap contains every canonical landing locale", () => {
  assert.equal(existsSync(new URL("../apps/landing/public/sitemap-pages.xml", import.meta.url)), true);
  const sitemap = read("apps/landing/public/sitemap-pages.xml");

  assert.match(sitemap, /<urlset\b/);
  assert.deepEqual(locations(sitemap), [
    "https://mosoo.ai/en",
    "https://mosoo.ai/zh",
    "https://mosoo.ai/ja",
    "https://mosoo.ai/en/pricing",
    "https://mosoo.ai/zh/pricing",
    "https://mosoo.ai/ja/pricing",
    "https://mosoo.ai/health",
    "https://mosoo.ai/zh/health",
    "https://mosoo.ai/ja/health",
    "https://mosoo.ai/en/use-cases",
    "https://mosoo.ai/zh/use-cases",
    "https://mosoo.ai/ja/use-cases",
    "https://mosoo.ai/en/use-cases/blueprint",
    "https://mosoo.ai/zh/use-cases/blueprint",
    "https://mosoo.ai/ja/use-cases/blueprint",
    "https://mosoo.ai/en/use-cases/pitchpilot",
    "https://mosoo.ai/zh/use-cases/pitchpilot",
    "https://mosoo.ai/ja/use-cases/pitchpilot",
    "https://mosoo.ai/en/use-cases/go-gym",
    "https://mosoo.ai/zh/use-cases/go-gym",
    "https://mosoo.ai/ja/use-cases/go-gym",
    "https://mosoo.ai/en/use-cases/codex-pet",
    "https://mosoo.ai/zh/use-cases/codex-pet",
    "https://mosoo.ai/ja/use-cases/codex-pet",
    "https://mosoo.ai/en/use-cases/ghfind",
    "https://mosoo.ai/zh/use-cases/ghfind",
    "https://mosoo.ai/ja/use-cases/ghfind",
  ]);
});

test("the main-page sitemap exposes reciprocal landing hreflang alternates", () => {
  const sitemap = read("apps/landing/public/sitemap-pages.xml");

  assert.match(sitemap, /xmlns:xhtml="http:\/\/www\.w3\.org\/1999\/xhtml"/);
  for (const entry of sitemapEntries(sitemap)) {
    const suffix = new URL(entry.loc).pathname.replace(/^\/(?:en|zh|ja)(?=\/|$)/, "");
    const health = new URL(entry.loc).pathname.endsWith("/health");
    assert.deepEqual(entry.alternates, [
      ["en", health ? "https://mosoo.ai/health" : `https://mosoo.ai/en${suffix}`],
      ["zh-CN", `https://mosoo.ai/zh${suffix}`],
      ["ja", `https://mosoo.ai/ja${suffix}`],
      ["x-default", health ? "https://mosoo.ai/health" : `https://mosoo.ai/en${suffix}`],
    ]);
  }
});

test("robots advertises the aggregate sitemap", () => {
  const robots = read("apps/landing/public/robots.txt");
  const sitemaps = [...robots.matchAll(/^Sitemap:\s*(\S+)$/gm)].map((match) => match[1]);

  assert.match(robots, /^Content-Signal: ai-train=no, search=yes, ai-input=yes$/m);
  assert.deepEqual(sitemaps, ["https://mosoo.ai/sitemap.xml"]);
});

test("blog routing and metadata use slashless canonical URLs", () => {
  const blogConfig = read("apps/blog/astro.config.mjs");
  const blogLayout = read("apps/blog/src/layouts/BaseLayout.astro");
  const workerConfig = read("wrangler.toml");

  assert.match(blogConfig, /trailingSlash: "never"/);
  assert.match(blogLayout, /new URL\(Astro\.url\.pathname, Astro\.site\)\.href/);
  assert.doesNotMatch(blogLayout, /pathname\.replace\(\/\\\/\$\//);
  assert.match(workerConfig, /html_handling = "drop-trailing-slash"/);
  assert.match(workerConfig, /run_worker_first = true/);
});

test("blog posts reference the landing page organization identity", () => {
  const postLayout = read("apps/blog/src/layouts/PostLayout.astro");

  assert.match(
    postLayout,
    /publisher:\s*\{\s*"@id": "https:\/\/mosoo\.ai\/#organization"\s*\},/,
  );
});

test("blog pages do not bypass edge-managed analytics consent", () => {
  const blogLayout = read("apps/blog/src/layouts/BaseLayout.astro");

  assert.doesNotMatch(blogLayout, /posthog|page_viewed|\/capture\/|mosoo_posthog/i);
});

test("blog chrome links back to canonical localized landing pages", () => {
  const header = read("apps/blog/src/components/Header.astro");
  const footer = read("apps/blog/src/components/Footer.astro");

  assert.match(header, /const landingHref = `\/\$\{currentLocale\}`;/);
  assert.match(footer, /const landingHref = `\/\$\{locale\}`;/);
  assert.doesNotMatch(header, /href="\/"/);
  assert.doesNotMatch(footer, /href="\/"/);
});

test("landing and blog metadata never point at a missing default image", () => {
  const landing = read("apps/landing/index.html");
  const blogLayout = read("apps/blog/src/layouts/BaseLayout.astro");

  assert.match(landing, /rel="canonical" href="https:\/\/mosoo\.ai\/en"/);
  assert.match(landing, /rel="alternate" hreflang="en" href="https:\/\/mosoo\.ai\/en"/);
  assert.match(landing, /rel="alternate" hreflang="zh-CN" href="https:\/\/mosoo\.ai\/zh"/);
  assert.match(landing, /rel="alternate" hreflang="ja" href="https:\/\/mosoo\.ai\/ja"/);
  assert.match(
    landing,
    /rel="alternate" hreflang="x-default" href="https:\/\/mosoo\.ai\/en"/,
  );
  assert.match(
    landing,
    /<meta property="og:image" content="https:\/\/mosoo\.ai\/brand\/social-card-geist-20260917\.png" \/>/,
  );
  assert.match(
    landing,
    /<meta name="twitter:image" content="https:\/\/mosoo\.ai\/brand\/social-card-geist-20260917\.png" \/>/,
  );
  assert.doesNotMatch(blogLayout, /\/og-default\.png/);
  assert.match(blogLayout, /\/brand\/social-card-geist-20260917\.png/);
  assert.equal(
    existsSync(new URL("../apps/landing/public/brand/social-card-geist-20260917.png", import.meta.url)),
    true,
  );
});

test("landing initial HTML exposes crawlable primary site links", () => {
  for (const locale of LOCALES) assertHomeSiteLinks(home(locale), locale);
  assertInitialSiteLinks(read("apps/landing/pricing.html"));
});

test("landing locale pages receive localized canonical metadata", () => {
  const en = home("en");
  const zh = home("zh");
  const ja = home("ja");

  assert.match(en, /<html lang="en">/);
  assert.match(en, /<title>Open-source Agent runtime for application backends \| mosoo<\/title>/);
  assert.match(
    en,
    /property="og:title"\s+content="An open-source, API-first managed Agent runtime for application backends"/,
  );
  assert.match(en, /name="twitter:description"\s+content="Start an agent task from your backend/);
  assert.match(zh, /<html lang="zh-CN">/);
  assert.match(zh, /<link rel="canonical" href="https:\/\/mosoo\.ai\/zh"/);
  assert.match(zh, /<meta property="og:url" content="https:\/\/mosoo\.ai\/zh" \/>/);
  assert.match(zh, /<title>面向应用后端的开源 Agent runtime \| mosoo<\/title>/);
  assert.match(zh, /content="开源、API 优先的托管 Agent runtime，面向应用后端"/);
  assert.match(zh, /<h2 id="mf-faq">开始构建前值得问的问题<\/h2>/);
  assert.match(zh, /需要先创建或发布 Agent 吗？/);
  assert.match(ja, /<html lang="ja">/);
  assert.match(ja, /<link rel="canonical" href="https:\/\/mosoo\.ai\/ja"/);
  assert.match(ja, /<meta property="og:url" content="https:\/\/mosoo\.ai\/ja" \/>/);
  assert.match(ja, /<title>アプリのバックエンド向けオープンソース Agent runtime \| mosoo<\/title>/);
  assert.match(ja, /<h2 id="mf-faq">使い始める前に確認したいこと<\/h2>/);
  assert.match(ja, /先に Agent を作成または公開する必要はありますか？/);
  for (const html of [en, zh, ja]) {
    assert.match(html, /<link rel="alternate" hreflang="en" href="https:\/\/mosoo\.ai\/en" \/>/);
    assert.match(html, /<link rel="alternate" hreflang="zh-CN" href="https:\/\/mosoo\.ai\/zh" \/>/);
    assert.match(html, /<link rel="alternate" hreflang="ja" href="https:\/\/mosoo\.ai\/ja" \/>/);
    assert.match(html, /<link rel="alternate" hreflang="x-default" href="https:\/\/mosoo\.ai\/en" \/>/);
  }
  // The localized pages carry no English page copy.
  for (const html of [zh, ja]) {
    for (const { q } of homeFaq("en")) assert.ok(!html.includes(q), `untranslated FAQ: ${q}`);
    for (const heading of headingsOf(en, 2)) {
      assert.ok(!html.includes(heading), `untranslated heading: ${heading}`);
    }
  }
  assertHomeSiteLinks(zh, "zh");
  assert.match(zh, />文档<\/a>/);
  assert.match(zh, />快速开始<\/a>/);
  assertHomeSiteLinks(ja, "ja");
  assert.match(ja, />ドキュメント<\/a>/);
  assert.match(ja, />クイックスタート<\/a>/);
});

test("the home JSON-LD graph is valid and states only what the main repo states", () => {
  for (const locale of LOCALES) {
    const html = home(locale);
    const [script] = jsonLdScriptsOf(html);
    const graph = graphOf(html);
    const nodes = nodesByType(graph);
    const url = `https://mosoo.ai/${locale}`;

    assert.ok(!script.includes("<"), "every < is escaped so the script cannot close early");
    assert.equal(graph["@context"], "https://schema.org");
    assert.deepEqual(Object.keys(nodes).sort(), [
      "FAQPage",
      "Organization",
      "SoftwareApplication",
      "WebSite",
    ]);

    assert.equal(nodes.Organization["@id"], "https://mosoo.ai/#organization");
    assert.equal(nodes.Organization.legalName, "LangGenius, Inc.");

    assert.equal(nodes.WebSite["@id"], "https://mosoo.ai/#website");
    assert.equal(nodes.WebSite.url, "https://mosoo.ai/");
    assert.deepEqual(nodes.WebSite.inLanguage, ["en", "zh-CN", "ja"]);
    assert.deepEqual(nodes.WebSite.publisher, { "@id": "https://mosoo.ai/#organization" });

    const app = nodes.SoftwareApplication;
    assert.equal(app["@id"], "https://mosoo.ai/#software");
    assert.equal(app.name, "mosoo");
    assert.equal(app.url, url);
    assert.equal(app.inLanguage, HTML_LANG[locale]);
    assert.ok(app.description.startsWith(homeHeadline(locale)), "description leads with the positioning");
    for (const runtime of ["OpenAI Codex", "Claude Agent SDK", "OpenCode", "Pi"]) {
      assert.ok(app.description.includes(runtime), `description names ${runtime}`);
    }
    assert.equal(app.applicationCategory, "DeveloperApplication");
    assert.equal(app.operatingSystem, "Web");
    assert.equal(app.license, "https://github.com/langgenius/mosoo/blob/main/LICENSE");
    assert.equal(app.codeRepository, "https://github.com/langgenius/mosoo");
    assert.equal(app.releaseNotes, "https://github.com/langgenius/mosoo/releases");
    assert.equal(app.featureList.length, 8);
    for (const unsupported of ["offers", "aggregateRating", "review", "softwareVersion"]) {
      assert.equal(Object.hasOwn(app, unsupported), false, `no ${unsupported} without a source`);
    }

    const faq = nodes.FAQPage;
    assert.equal(faq["@id"], `${url}#faq`);
    assert.equal(faq.url, url);
    assert.equal(faq.inLanguage, HTML_LANG[locale]);
    assert.deepEqual(faq.isPartOf, { "@id": "https://mosoo.ai/#website" });
    assert.deepEqual(faq.about, { "@id": "https://mosoo.ai/#software" });
    assert.equal(faq.mainEntity.length, 10);
    for (const question of faq.mainEntity) {
      assert.equal(question["@type"], "Question");
      assert.equal(question.acceptedAnswer["@type"], "Answer");
      assert.ok(question.name.length > 0 && question.acceptedAnswer.text.length > 0);
    }
    assert.deepEqual(
      faq.mainEntity.map((question) => [question.name, question.acceptedAnswer.text]),
      homeFaq(locale).map(({ q, a }) => [q, a]),
    );
  }
});

test("the FAQPage JSON-LD matches the FAQ a reader sees on the page", () => {
  for (const locale of LOCALES) {
    const html = home(locale);
    const faq = nodesByType(graphOf(html)).FAQPage;
    const visible = visibleFaqOf(html);

    assert.equal(visible.length, 10, `${locale} shows all 10 answers without a click`);
    assert.deepEqual(
      faq.mainEntity.map((question) => [question.name, question.acceptedAnswer.text]),
      visible,
    );
    assert.match(html, /<section id="faq" /, "the FAQPage @id fragment resolves on the page");
  }
});

test("the static home page carries the whole page for readers without JavaScript", () => {
  const en = home("en");

  assert.deepEqual(headingsOf(en, 2), [
    "Pick a runtime. Use your own model key.",
    "mosoo handles execution, files, events, and usage.",
    "One request starts a Session. A follow-up continues it.",
    "Your app keeps its users. mosoo runs the Agent.",
    "The code, the releases, and the incident postmortems are public.",
    "mosoo leaves these out on purpose.",
    "Questions to ask before you build on mosoo",
    "Start your first Session. Reply in a minute or in seven days.",
  ]);
  assert.match(
    textOf(en),
    /mosoo runs OpenAI Codex, Claude Agent SDK, OpenCode, and Pi behind one API, each Session in its own sandbox\./,
  );
  assert.match(en, /It starts with <code translate="no">msp_<\/code> and is shown once\./);
  assert.match(en, /curl https:\/\/cloud\.mosoo\.ai\/api\/v2\/projects\/\$MOSOO_PROJECT_ID\/threads/);
  assert.match(en, /"type": "inline",\n\s+"harness": "openai-runtime"/);
  assert.match(en, /curl -fsSL https:\/\/install\.mosoo\.ai\/install\.sh \| bash/);
  assert.match(en, /There are no Webhooks\./);
  assert.match(en, /mosoo is in Alpha\. Public APIs may still change\./);
  assert.match(en, /<details>\s*<summary>Set up with your coding agent<\/summary>/);
  assert.match(en, /# Set up mosoo/);
  assert.match(en, /<a href="https:\/\/cloud\.mosoo\.ai" class="mf-btn">Try mosoo<\/a>/);

  for (const locale of LOCALES) {
    const html = home(locale);
    const headlines = headingsOf(html, 1);

    assert.deepEqual(headlines, [homeHeadline(locale)], `${locale} has one h1, the positioning`);
    assert.deepEqual(sectionIdsOf(html), [
      "runtimes",
      "features",
      "how-it-works",
      "your-app-and-mosoo",
      "proof",
      "limits",
      "faq",
      "start",
    ]);
    assert.equal(headingsOf(html, 2).length, 8);
    assert.match(html, /<main id="main">/);
    assert.match(html, /<footer class="mf-foot">/);
    assert.match(html, /<div id="root"><div class="mosoo-fallback">/);
    assert.match(html, /<style>\n\.mosoo-fallback\{/);
    assert.doesNotMatch(html, /mosoo:home-/, "no build marker is left");
    assert.doesNotMatch(html, RETIRED_NARRATIVE);
    assert.doesNotMatch(html, /[—–]/, "no em or en dashes");
    assert.doesNotMatch(html, /\bMosoo\b(?! Computer)/, "the brand is lowercase mosoo");
  }
});

// The static fallback and the React page are written separately, so these
// checks keep them from drifting: the same anchors, the same FAQ strings (the
// ones the FAQPage JSON-LD carries) and the same primary navigation.
test("the React home page and the static fallback share anchors, FAQ text and navigation", () => {
  const landing = "apps/landing/src/routes/login/landing";
  const sections = [
    "supply-wall.tsx",
    "features-section.tsx",
    "how-it-works.tsx",
    "split-section.tsx",
    "proof-section.tsx",
    "limits-section.tsx",
    "faq-section.tsx",
    "final-cta.tsx",
  ]
    .map((file) => read(`${landing}/${file}`))
    .join("\n");
  for (const id of sectionIdsOf(home("en"))) {
    assert.match(sections, new RegExp(`<section id="${id}" `), `the React page has #${id} too`);
  }

  const dictionary = read(`${landing}/i18n.ts`);
  for (const locale of LOCALES) {
    for (const { q, a } of homeFaq(locale)) {
      assert.ok(dictionary.includes(JSON.stringify(q)), `the React FAQ asks (${locale}): ${q}`);
      assert.ok(dictionary.includes(JSON.stringify(a)), `the React FAQ answers (${locale}): ${q}`);
    }

    const nav = /<nav aria-label="Primary site links">[\s\S]*?<\/nav>/.exec(home(locale))?.[0] ?? "";
    assert.match(nav, /<a href="https:\/\/cloud\.mosoo\.ai" translate="no">mosoo<\/a>/);
    assert.match(nav, /<a href="https:\/\/computer\.mosoo\.ai" translate="no">Mosoo Computer<\/a>/);
    assert.match(nav, /<a href="https:\/\/cloud\.mosoo\.ai\/login">/);
    assert.doesNotMatch(nav, /\/pricing/, "the home page does not link pricing (copy deck D12)");
  }
});

test("pricing metadata lists every localized alternate", () => {
  const pricing = read("apps/landing/pricing.html");

  assert.match(pricing, /rel="canonical" href="https:\/\/mosoo\.ai\/en\/pricing"/);
  assert.match(pricing, /rel="alternate" hreflang="en" href="https:\/\/mosoo\.ai\/en\/pricing"/);
  assert.match(pricing, /rel="alternate" hreflang="zh-CN" href="https:\/\/mosoo\.ai\/zh\/pricing"/);
  assert.match(pricing, /rel="alternate" hreflang="ja" href="https:\/\/mosoo\.ai\/ja\/pricing"/);
  assert.match(
    pricing,
    /rel="alternate" hreflang="x-default" href="https:\/\/mosoo\.ai\/en\/pricing"/,
  );
  assert.match(pricing, /"@id": "https:\/\/mosoo\.ai\/#organization"/);
});

test("pricing locale pages receive localized canonical metadata", () => {
  const source = read("apps/landing/pricing.html");
  const zh = renderPricingLocale(source, "zh");
  const ja = renderPricingLocale(source, "ja");

  assert.match(zh, /<html lang="zh-CN">/);
  assert.match(zh, /<link rel="canonical" href="https:\/\/mosoo\.ai\/zh\/pricing"/);
  assert.match(zh, /<title>mosoo — 定价<\/title>/);
  assert.match(zh, /rel="alternate" hreflang="en" href="https:\/\/mosoo\.ai\/en\/pricing"/);
  assert.match(ja, /<html lang="ja">/);
  assert.match(ja, /<link rel="canonical" href="https:\/\/mosoo\.ai\/ja\/pricing"/);
  assert.match(ja, /<title>mosoo — 料金<\/title>/);
  assertInitialSiteLinks(zh, "zh");
  assertInitialSiteLinks(ja, "ja");
});

test("status pages expose localized canonical metadata and crawlable links", () => {
  const source = read("apps/landing/status.html");
  const zh = renderStatusLocale(source, "zh");
  const ja = renderStatusLocale(source, "ja");

  assert.match(source, /rel="canonical" href="https:\/\/mosoo\.ai\/health"/);
  assert.match(zh, /<html lang="zh-CN">/);
  assert.match(zh, /<link rel="canonical" href="https:\/\/mosoo\.ai\/zh\/health"/);
  assert.match(zh, /<title>mosoo — 系统状态<\/title>/);
  assert.match(ja, /<html lang="ja">/);
  assert.match(ja, /<link rel="canonical" href="https:\/\/mosoo\.ai\/ja\/health"/);
  assertInitialSiteLinks(zh, "zh");
  assertInitialSiteLinks(ja, "ja");
});

test("use-cases pages expose localized canonical metadata and crawlable links", () => {
  const source = read("apps/landing/use-cases.html");
  const zh = renderUseCasesLocale(source, "zh");
  const ja = renderUseCasesLocale(source, "ja");

  assert.match(source, /rel="canonical" href="https:\/\/mosoo\.ai\/en\/use-cases"/);
  assert.match(source, /href="\/en\/use-cases\/blueprint"/);
  assert.match(source, /href="\/en\/use-cases\/pitchpilot"/);
  assert.match(source, /href="\/en\/use-cases\/go-gym"/);
  assert.match(source, /href="\/en\/use-cases\/codex-pet"/);
  assert.match(source, /href="\/en\/use-cases\/ghfind"/);
  assert.match(zh, /<html lang="zh-CN">/);
  assert.match(zh, /<link rel="canonical" href="https:\/\/mosoo\.ai\/zh\/use-cases"/);
  assert.match(zh, /<title>mosoo — 用例<\/title>/);
  assert.match(zh, /href="\/zh\/use-cases\/blueprint"/);
  assert.match(zh, /href="\/zh\/use-cases\/pitchpilot"/);
  assert.match(zh, /href="\/zh\/use-cases\/go-gym"/);
  assert.match(zh, /href="\/zh\/use-cases\/codex-pet"/);
  assert.match(zh, /href="\/zh\/use-cases\/ghfind"/);
  assert.match(ja, /<html lang="ja">/);
  assert.match(ja, /<link rel="canonical" href="https:\/\/mosoo\.ai\/ja\/use-cases"/);
  assertInitialSiteLinks(zh, "zh");
  assertInitialSiteLinks(ja, "ja");
});

test("the use-cases gallery switches to a featured grid at three cases", () => {
  const source = read("apps/landing/src/routes/use-cases/use-cases-page.tsx");

  assert.match(source, /USE_CASES\.length < 3/);
  assert.match(source, /md:grid-cols-2/);
  assert.match(source, /lg:grid-cols-3/);
});

test("the blueprint case page keeps its canonical, screenshot, and outbound links", () => {
  const source = read("apps/landing/use-cases/blueprint.html");
  const zh = renderUseCaseBlueprintLocale(source, "zh");
  const ja = renderUseCaseBlueprintLocale(source, "ja");

  assert.match(source, /rel="canonical" href="https:\/\/mosoo\.ai\/en\/use-cases\/blueprint"/);
  assert.match(source, /content="https:\/\/mosoo\.ai\/landing\/use-cases\/blueprint-app\.png"/);
  assert.match(source, /href="https:\/\/trybp\.page"/);
  assert.match(source, /href="https:\/\/github\.com\/samzong\/blueprint"/);
  assert.equal(
    existsSync(
      new URL("../apps/landing/public/landing/use-cases/blueprint-app.png", import.meta.url),
    ),
    true,
  );
  assert.match(zh, /<link rel="canonical" href="https:\/\/mosoo\.ai\/zh\/use-cases\/blueprint"/);
  assert.match(zh, /<title>mosoo — Blueprint：人人可用的站点构建器<\/title>/);
  assert.match(ja, /<link rel="canonical" href="https:\/\/mosoo\.ai\/ja\/use-cases\/blueprint"/);
  assertInitialSiteLinks(zh, "zh");
  assertInitialSiteLinks(ja, "ja");
});

test("the pitchpilot case page keeps its localized metadata, screenshot, and outbound links", () => {
  const source = read("apps/landing/use-cases/pitchpilot.html");
  const page = read("apps/landing/src/routes/use-cases/use-case-pitchpilot-page.tsx");
  const data = read("apps/landing/src/routes/use-cases/use-cases-data.ts");
  const zh = renderUseCasePitchPilotLocale(source, "zh");
  const ja = renderUseCasePitchPilotLocale(source, "ja");

  assert.match(source, /rel="canonical" href="https:\/\/mosoo\.ai\/en\/use-cases\/pitchpilot"/);
  assert.match(source, /content="https:\/\/mosoo\.ai\/landing\/use-cases\/pitchpilot-mosoo\.png"/);
  assert.match(source, /href="https:\/\/pitchpilot-mosoo\.wh-2099\.workers\.dev\/"/);
  assert.match(source, /href="https:\/\/github\.com\/Yevanchen\/pitchpilot-mosoo"/);
  assert.match(page, /pitchpilot-application-architecture\.jpg/);
  assert.match(page, /pitchpilot-runtime-architecture\.jpg/);
  assert.match(data, /avatar: "\/landing\/use-cases\/petrus-han\.jpg", name: "Peter Han"/);
  assert.equal(
    existsSync(
      new URL("../apps/landing/public/landing/use-cases/pitchpilot-mosoo.png", import.meta.url),
    ),
    true,
  );
  for (const image of [
    "petrus-han.jpg",
    "pitchpilot-application-architecture.jpg",
    "pitchpilot-runtime-architecture.jpg",
  ]) {
    assert.equal(
      existsSync(new URL(`../apps/landing/public/landing/use-cases/${image}`, import.meta.url)),
      true,
    );
  }
  assert.match(zh, /<link rel="canonical" href="https:\/\/mosoo\.ai\/zh\/use-cases\/pitchpilot"/);
  assert.match(zh, /<title>mosoo — PitchPilot：Agent 驱动的 Web 应用<\/title>/);
  assert.match(ja, /<link rel="canonical" href="https:\/\/mosoo\.ai\/ja\/use-cases\/pitchpilot"/);
  assert.match(ja, /<title>mosoo — PitchPilot：Agent 搭載 Web アプリ<\/title>/);
  assertInitialSiteLinks(zh, "zh");
  assertInitialSiteLinks(ja, "ja");
});

test("the go-gym case page keeps its localized metadata, screenshots, and outbound links", () => {
  const source = read("apps/landing/use-cases/go-gym.html");
  const zh = renderUseCaseGoGymLocale(source, "zh");
  const ja = renderUseCaseGoGymLocale(source, "ja");

  assert.match(source, /rel="canonical" href="https:\/\/mosoo\.ai\/en\/use-cases\/go-gym"/);
  assert.match(source, /content="https:\/\/mosoo\.ai\/landing\/use-cases\/go-gym-dashboard\.png"/);
  assert.match(source, /href="https:\/\/go-gym-prod\.wh-2099\.workers\.dev\/"/);
  assert.match(source, /href="https:\/\/mosoo\.ai\/docs\/api-reference\/"/);
  assert.match(source, /href="https:\/\/github\.com\/langgenius\/mosoo\/"/);
  assert.equal(
    existsSync(
      new URL("../apps/landing/public/landing/use-cases/go-gym-dashboard.png", import.meta.url),
    ),
    true,
  );
  assert.equal(
    existsSync(
      new URL("../apps/landing/public/landing/use-cases/go-gym-mosoo-agents.png", import.meta.url),
    ),
    true,
  );
  assert.match(zh, /<link rel="canonical" href="https:\/\/mosoo\.ai\/zh\/use-cases\/go-gym"/);
  assert.match(zh, /<title>mosoo — Go Gym：多用户 Agent Backend<\/title>/);
  assert.match(ja, /<link rel="canonical" href="https:\/\/mosoo\.ai\/ja\/use-cases\/go-gym"/);
  assertInitialSiteLinks(zh, "zh");
  assertInitialSiteLinks(ja, "ja");
});

test("the codex-pet case page keeps its canonical, screenshot, and repository link", () => {
  const source = read("apps/landing/use-cases/codex-pet.html");
  const zh = renderUseCaseCodexPetLocale(source, "zh");

  assert.match(source, /rel="canonical" href="https:\/\/mosoo\.ai\/en\/use-cases\/codex-pet"/);
  assert.match(source, /content="https:\/\/mosoo\.ai\/landing\/use-cases\/codex-pet-app\.png"/);
  assert.match(source, /href="https:\/\/github\.com\/Yevanchen\/mosoo-codex-pet"/);
  assert.doesNotMatch(source, /apps\.mosoo\.ai/);
  assert.match(zh, /<link rel="canonical" href="https:\/\/mosoo\.ai\/zh\/use-cases\/codex-pet"/);
  assert.match(zh, /<title>mosoo — Codex Pet：Agent as API<\/title>/);
  assertInitialSiteLinks(zh, "zh");
});

test("the ghfind case page keeps its canonical, screenshot, and outbound links", () => {
  const source = read("apps/landing/use-cases/ghfind.html");
  const zh = renderUseCaseGhfindLocale(source, "zh");
  const description = /<meta\s+name="description"\s+content="([^"]+)"/.exec(source)?.[1] ?? "";

  assert.match(source, /rel="canonical" href="https:\/\/mosoo\.ai\/en\/use-cases\/ghfind"/);
  assert.match(source, /content="https:\/\/mosoo\.ai\/landing\/use-cases\/ghfind-app\.png"/);
  assert.ok(description.length <= 160);
  assert.match(description, /deep repository evaluation/);
  assert.match(source, /href="https:\/\/github\.com\/hikariming\/ghfind"/);
  assert.match(source, /href="https:\/\/ghfind\.com"/);
  assert.equal(
    existsSync(new URL("../apps/landing/public/landing/use-cases/ghfind-app.png", import.meta.url)),
    true,
  );
  assert.equal(
    existsSync(new URL("../apps/landing/public/landing/use-cases/asperformias.png", import.meta.url)),
    true,
  );
  assert.match(zh, /<link rel="canonical" href="https:\/\/mosoo\.ai\/zh\/use-cases\/ghfind"/);
  assert.match(zh, /<title>mosoo — ghfind：深度项目评测估值引擎<\/title>/);
  assertInitialSiteLinks(zh, "zh");
});
