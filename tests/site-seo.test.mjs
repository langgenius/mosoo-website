import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

import { homeCopyStrings, homeFaq, homeHeadline, homePositioning } from "../scripts/landing-home.mjs";
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
// Question and answer text as a reader sees it in the static FAQ section:
// native <details name="faq"> rows whose answers stay in the DOM.
const faqSectionOf = (html) => /<section id="faq"[\s\S]*?<\/section>/.exec(html)?.[0] ?? "";
const visibleFaqOf = (html) =>
  [
    ...faqSectionOf(html).matchAll(
      /<details name="faq"[^>]*>\s*<summary>([\s\S]*?)<\/summary>\s*<p>([\s\S]*?)<\/p>\s*<\/details>/g,
    ),
  ].map((match) => [textOf(match[1]), textOf(match[2])]);

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

// Crawlable links in the static home page, the same ones the React page
// carries: navigation, every language, the localized v2 docs, pricing,
// status, use cases, the source, the console and llms.txt. The deeper index
// (OpenAPI contracts, SPEC, Mosoo Computer, the case pages, the install
// script) lives in llms.txt, which tests/worker.test.mjs checks.
const assertHomeSiteLinks = (html, locale) => {
  const links = HOME_LINKS[locale];
  const hrefs = hrefsOf(html);

  assert.match(html, /<nav aria-label="Primary site links">/);
  for (const href of [
    "/en",
    "/zh",
    "/ja",
    `/${locale}/use-cases`,
    `/${locale}/pricing`,
    links.health,
    links.docs,
    links.quickstart,
    links.apiReference,
    links.blog,
    "https://cloud.mosoo.ai",
    "https://cloud.mosoo.ai/login",
    "https://github.com/langgenius/mosoo",
    "https://github.com/langgenius/mosoo/releases",
    "https://github.com/langgenius/mosoo/blob/main/LICENSE",
    "https://mosoo.ai/llms.txt",
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
  assert.match(html, /href="https:\/\/cloud\.mosoo\.ai">mosoo<\/a>/);
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
    /<meta property="og:image" content="https:\/\/mosoo\.ai\/brand\/social-card-20261019\.png" \/>/,
  );
  assert.match(
    landing,
    /<meta name="twitter:image" content="https:\/\/mosoo\.ai\/brand\/social-card-20261019\.png" \/>/,
  );
  assert.doesNotMatch(blogLayout, /\/og-default\.png/);
  assert.match(blogLayout, /\/brand\/social-card-20261019\.png/);
  assert.equal(
    existsSync(new URL("../apps/landing/public/brand/social-card-20261019.png", import.meta.url)),
    true,
  );
  // The card states the README positioning and all four runtimes; its alt
  // text says the same.
  assert.match(landing, /<meta property="og:image:alt" content="mosoo: an open-source, API-first managed Agent runtime for application backends\. One API, 4 runtimes: OpenAI Codex, Claude Agent SDK, OpenCode, and Pi\." \/>/);
  for (const page of ["apps/landing/pricing.html", "apps/landing/status.html", "apps/landing/use-cases.html"]) {
    assert.doesNotMatch(read(page), /social-card-geist-20260917/, `${page} uses the current card`);
  }
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
  assert.match(zh, /<h2 id="mf-faq">接入之前，<span class="mf-soft">先问清楚。<\/span><\/h2>/);
  assert.match(zh, /<summary>需要先创建 Agent 吗？<\/summary>/);
  assert.match(ja, /<html lang="ja">/);
  assert.match(ja, /<link rel="canonical" href="https:\/\/mosoo\.ai\/ja"/);
  assert.match(ja, /<meta property="og:url" content="https:\/\/mosoo\.ai\/ja" \/>/);
  assert.match(ja, /<title>アプリのバックエンド向けオープンソース Agent runtime \| mosoo<\/title>/);
  assert.match(ja, /<h2 id="mf-faq">組み込む前に<span class="mf-soft">確かめたいこと。<\/span><\/h2>/);
  assert.match(ja, /<summary>先に Agent を作る必要はありますか？<\/summary>/);
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
    assert.ok(
      app.description.startsWith(homePositioning(locale)),
      "description leads with the README positioning line",
    );
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
    assert.equal(faq.mainEntity.length, 6);
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

    assert.equal(visible.length, 6, `${locale} keeps all 6 answers in the DOM`);
    const rows = [...faqSectionOf(html).matchAll(/<details name="faq"( open)?>/g)];
    assert.deepEqual(
      rows.map((row) => Boolean(row[1])),
      [true, false, false, false, false, false],
      `${locale} opens only the first question`,
    );
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
    "Reply in a minute or in seven days.",
    "One Session, five parts. Choose the harness per Session.",
    "Questions before you wire it in.",
    "Start a Session from your agent.",
    "Want the short version?",
  ]);
  assert.match(
    en,
    /<p class="mf-lead">One API call starts a sandboxed Session\. Codex, Claude Agent SDK, OpenCode or Pi\.<\/p>/,
  );
  // Both transcripts: the acceptance workflow's CSV totals (230, then 250
  // after the follow-up) and the contract's event names.
  assert.match(textOf(en), /Read input\.csv 3 rows Bash python report\.py grand_total 230/);
  assert.match(textOf(en), /Add south,20 and run it again\. Bash python report\.py grand_total 250/);
  assert.match(en, /session_files\.updated/);
  assert.match(en, /run\.completed/);
  // The spec table names every runtime, as the description does.
  for (const runtime of ["OpenAI Codex", "Claude Agent SDK", "OpenCode", "Pi"]) {
    assert.match(en, new RegExp(`<span translate="no">${runtime}</span>`));
  }
  assert.match(en, /<p class="mf-prompt">Read mosoo\.ai\/llms\.txt, then set up mosoo here\.<\/p>/);
  assert.match(en, /mosoo is in Alpha, so public APIs may still change\./);
  assert.match(en, /<a href="https:\/\/cloud\.mosoo\.ai" class="mf-btn">Try mosoo<\/a>/);
  assert.match(en, /<p>© 2026 LangGenius, Inc\.<\/p>/);

  for (const locale of LOCALES) {
    const html = home(locale);
    const headlines = headingsOf(html, 1);

    assert.deepEqual(headlines, [homeHeadline(locale)], `${locale} has one h1, the two-value headline`);
    assert.deepEqual(sectionIdsOf(html), ["session", "parts", "faq", "start"]);
    assert.equal(headingsOf(html, 2).length, 5);
    assert.match(html, /<main id="main">/);
    assert.match(html, /<footer class="mf-foot">/);
    assert.match(html, /<div id="root"><div class="mosoo-fallback">/);
    assert.match(html, /<style>\n\.mosoo-fallback\{/);
    // The fallback is the instrument canvas in the three locked faces.
    assert.match(html, /\.mosoo-fallback\{--mf-paper:#0e0f0d;/);
    assert.doesNotMatch(html, /Geist/, "no Geist: the fonts stay within the 125 KB budget");
    assert.doesNotMatch(html, /mosoo:home-/, "no build marker is left");
    assert.doesNotMatch(html, RETIRED_NARRATIVE);
    assert.doesNotMatch(html, /[—–]/, "no em or en dashes");
    assert.doesNotMatch(html, /\bMosoo\b(?! Computer)/, "the brand is lowercase mosoo");
    assert.doesNotMatch(html, /bamboo/i, "no bamboo anywhere on the home page");
  }
});

// The static fallback and the React page are written separately, so these
// checks keep them from drifting: the same anchors, the same copy (FAQ strings
// included, the ones the FAQPage JSON-LD carries) and the same primary
// navigation.
test("the React home page and the static fallback share anchors, copy and navigation", () => {
  const landing = "apps/landing/src/routes/login/landing";
  const sections = ["stage-section.tsx", "spec-section.tsx", "faq-section.tsx", "final-cta.tsx"]
    .map((file) => read(`${landing}/${file}`))
    .join("\n");
  for (const id of sectionIdsOf(home("en"))) {
    assert.match(sections, new RegExp(`<section\\s+id="${id}"`), `the React page has #${id} too`);
  }

  const dictionary = read(`${landing}/home-copy.ts`);
  for (const locale of LOCALES) {
    for (const { q, a } of homeFaq(locale)) {
      assert.ok(dictionary.includes(JSON.stringify(q)), `the React FAQ asks (${locale}): ${q}`);
      assert.ok(dictionary.includes(JSON.stringify(a)), `the React FAQ answers (${locale}): ${q}`);
    }
    for (const text of homeCopyStrings(locale)) {
      assert.ok(dictionary.includes(JSON.stringify(text)), `the React page says (${locale}): ${text}`);
    }

    const nav = /<nav aria-label="Primary site links">[\s\S]*?<\/nav>/.exec(home(locale))?.[0] ?? "";
    assert.match(nav, /<a href="https:\/\/cloud\.mosoo\.ai\/login">/);
    assert.match(nav, /<a href="https:\/\/cloud\.mosoo\.ai" class="mf-btn">/);
    assert.match(nav, /<a href="https:\/\/github\.com\/langgenius\/mosoo" aria-label="/);
    assert.doesNotMatch(nav, /\/pricing/, "the home page nav does not link pricing (copy deck D12)");
  }
  const faq = read(`${landing}/faq-section.tsx`);
  assert.match(faq, /name="faq"/, "the React FAQ uses native exclusive <details>");
  assert.match(faq, /open=\{index === 0\}/, "the React FAQ opens only the first question");
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
  assert.match(zh, /<title>定价 \| mosoo<\/title>/);
  assert.match(zh, />\s*定价\s*<\/h1>/);
  assert.match(zh, /rel="alternate" hreflang="en" href="https:\/\/mosoo\.ai\/en\/pricing"/);
  assert.match(ja, /<html lang="ja">/);
  assert.match(ja, /<link rel="canonical" href="https:\/\/mosoo\.ai\/ja\/pricing"/);
  assert.match(ja, /<title>料金 \| mosoo<\/title>/);
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
  assert.match(zh, /<title>系统状态 \| mosoo<\/title>/);
  assert.match(zh, />\s*系统状态\s*<\/h1>/);
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
  assert.match(zh, /<title>用例 \| mosoo<\/title>/);
  assert.match(zh, />\s*用例\s*<\/h1>/);
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

test("use-case pages describe Sessions with the spec's words, a lowercase brand and no dashes", () => {
  const sources = [
    "apps/landing/src/routes/use-cases/i18n.ts",
    "apps/landing/src/routes/use-cases/use-cases-data.ts",
    "apps/landing/src/routes/use-cases/use-case-blueprint-page.tsx",
    "apps/landing/src/routes/use-cases/use-case-codex-pet-page.tsx",
    "apps/landing/src/routes/use-cases/use-case-ghfind-page.tsx",
    "apps/landing/src/routes/use-cases/use-case-go-gym-page.tsx",
    "apps/landing/src/routes/use-cases/use-case-pitchpilot-page.tsx",
    "apps/landing/use-cases.html",
    "apps/landing/use-cases/blueprint.html",
    "apps/landing/use-cases/codex-pet.html",
    "apps/landing/use-cases/ghfind.html",
    "apps/landing/use-cases/go-gym.html",
    "apps/landing/use-cases/pitchpilot.html",
  ];
  for (const path of sources) {
    // Strings only: code comments may keep their punctuation.
    const text = read(path)
      .split("\n")
      .filter((line) => !/^\s*(\/\/|\*|\/\*)/.test(line))
      .join("\n");
    assert.doesNotMatch(text, /\b[Cc]attle\b|Pet Agent/, `${path} names no removed Agent type (SPEC section 8)`);
    assert.doesNotMatch(text, /\bMosoo\b(?! Computer)/, `${path} writes the brand in lowercase`);
    assert.doesNotMatch(text, /[—–]/, `${path} has no em or en dashes`);
  }
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
  assert.match(zh, /<title>Blueprint：人人可用的站点构建器 \| mosoo<\/title>/);
  assert.match(zh, />\s*Blueprint：人人可用的站点构建器\s*<\/h1>/);
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
  assert.match(zh, /<title>PitchPilot：Agent 驱动的 Web 应用 \| mosoo<\/title>/);
  assert.match(ja, /<link rel="canonical" href="https:\/\/mosoo\.ai\/ja\/use-cases\/pitchpilot"/);
  assert.match(ja, /<title>PitchPilot：Agent 搭載 Web アプリ \| mosoo<\/title>/);
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
  assert.match(zh, /<title>Go Gym：多用户 Agent Backend \| mosoo<\/title>/);
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
  assert.match(zh, /<title>Codex Pet：Agent as API \| mosoo<\/title>/);
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
  assert.match(zh, /<title>ghfind：深度项目评测估值引擎 \| mosoo<\/title>/);
  assertInitialSiteLinks(zh, "zh");
});
