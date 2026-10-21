import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

import { homeFaq, homeHeadline, homePositioning } from "../scripts/landing-home.mjs";
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
const textOf = (html) =>
  decodeEntities(html.replace(/<br\s*\/?>/g, " ").replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();
const hrefsOf = (html) => [...html.matchAll(/\bhref="([^"]+)"/g)].map((match) => decodeEntities(match[1]));
const headingsOf = (html, level) =>
  [...html.matchAll(new RegExp(`<h${level}\\b[^>]*>([\\s\\S]*?)</h${level}>`, "g"))].map((match) =>
    textOf(match[1]),
  );
// The home's content sections in order, by data-section (the v5 section modules, src/home/sections/).
const sectionsOf = (html) =>
  [...html.matchAll(/<section\b[^>]*\bdata-section="([^"]+)"/g)].map((match) => match[1]);
const jsonLdScriptsOf = (html) =>
  [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((match) => match[1]);
const graphOf = (html) => {
  const scripts = jsonLdScriptsOf(html);
  assert.equal(scripts.length, 1, "the home page carries one JSON-LD script");
  return JSON.parse(scripts[0]);
};
const nodesByType = (graph) => Object.fromEntries(graph["@graph"].map((node) => [node["@type"], node]));
// Question and answer text as a reader sees it in the static FAQ section: one
// native <details name="faq"> per question; the question is the <summary>'s
// text, the answer the rest of the <details>, in the DOM whether open or not
// (the contract in apps/landing/src/home/sections/README.md).
const faqSectionOf = (html) => /<section\b[^>]*\bid="faq"[\s\S]*?<\/section>/.exec(html)?.[0] ?? "";
const faqRowsOf = (html) =>
  [...faqSectionOf(html).matchAll(/<details\b([^>]*)>([\s\S]*?)<\/details>/g)]
    .filter((match) => /\bname="faq"/.test(match[1]))
    .map((match) => {
      const summary = /<summary\b[^>]*>([\s\S]*?)<\/summary>/.exec(match[2]);
      return {
        open: /\sopen(?=[\s>]|$)/.test(match[1]),
        q: textOf(summary?.[1] ?? ""),
        a: textOf(match[2].replace(/<summary\b[\s\S]*?<\/summary>/, "")),
      };
    });
const visibleFaqOf = (html) => faqRowsOf(html).map(({ q, a }) => [q, a]);
// The home copy files (apps/landing/src/home/copy/<section>.json).
const homeCopy = (section) => JSON.parse(read(`apps/landing/src/home/copy/${section}.json`));

// Narrative the main repo retired or never supported (SPEC section 8, README).
const RETIRED_NARRATIVE =
  /App-owner|App owner|Publish an Agent|already published|self-host|Self-host|Deploy to Cloudflare|for coding agents|\bChannels\b|\bKV\b|sandbox ready in|mst_|Personal Access Token/;

const HOME_LINKS = {
  en: {
    docs: "https://mosoo.ai/docs/",
    quickstart: "https://mosoo.ai/docs/quickstart/",
    apiReference: "https://mosoo.ai/docs/api-reference-v2/",
    health: "/health",
  },
  zh: {
    docs: "https://mosoo.ai/docs/zh-Hans/",
    quickstart: "https://mosoo.ai/docs/zh-Hans/quickstart/",
    apiReference: "https://mosoo.ai/docs/zh-Hans/api-reference-v2/",
    health: "/zh/health",
  },
  ja: {
    docs: "https://mosoo.ai/docs/ja/",
    quickstart: "https://mosoo.ai/docs/ja/quickstart/",
    apiReference: "https://mosoo.ai/docs/ja/api-reference-v2/",
    health: "/ja/health",
  },
};

// Crawlable links in the static home page: the primary nav (with the Products
// panel and the language list since the owner's 2026-10-20 17:15 note), the
// footer's link columns (v5: Product, Developers, Open source; TOOLS-REVIEW T5),
// every language, llms.txt, the source, the console and mosoo computer. The v5
// footer has no Pricing (#138) or OpenAPI link; llms.txt links those
// (tests/worker.test.mjs) and the worker's Link header advertises both OpenAPI
// contracts. tests/home-nav-products.test.mjs checks the panels themselves.
const assertHomeSiteLinks = (html, locale) => {
  const links = HOME_LINKS[locale];
  const hrefs = hrefsOf(html);

  assert.match(html, /<nav class="v5-nav-links" id="v5-nav-menu" aria-label="[^"]+" popover>/);
  for (const href of [
    "https://computer.mosoo.ai",
    "/en",
    "/zh",
    "/ja",
    `/${locale}/use-cases`,
    locale === "en" ? "/blog" : `/blog/${locale}`, // the live home links the blog (v5 SEO review P1)
    links.health,
    links.docs,
    links.quickstart,
    links.apiReference,
    "https://cloud.mosoo.ai",
    "https://cloud.mosoo.ai/login",
    "https://github.com/langgenius/mosoo",
    "https://github.com/langgenius/mosoo/releases",
    "https://github.com/langgenius/mosoo/blob/main/docs/SPEC.md",
    "https://github.com/langgenius/mosoo/blob/main/LICENSE",
    "https://mosoo.ai/llms.txt",
  ]) {
    assert.ok(hrefs.includes(href), `${locale} home page links ${href}`);
  }
  assert.ok(!hrefs.some((href) => href.endsWith("/pricing")), `${locale} home page does not link pricing`);
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
  // the second product's name in lowercase too (owner 2026-10-20 21:57: 「mosoo computer 一律小写」)
  assert.match(html, /href="https:\/\/computer\.mosoo\.ai">mosoo computer<\/a>/);
  assert.doesNotMatch(html, /\bMosoo\b/, "the brand is lowercase mosoo, mosoo computer included");
  // Pricing is a page again but stays unlinked (#138: owner question 11, default), like the home's nav.
  assert.doesNotMatch(html, /href="\/(?:en|zh|ja)\/pricing"/);
  assert.match(html, new RegExp(`href="/${locale}/use-cases"`));
  assert.match(html, new RegExp(`href="${locale === "en" ? "/health" : `/${locale}/health`}"`));
  assert.match(html, /href="https:\/\/mosoo\.ai\/docs\/"/);
  assert.match(html, /href="https:\/\/mosoo\.ai\/docs\/quickstart\/"/);
  assert.match(html, /href="https:\/\/mosoo\.ai\/blog"/);
  assert.match(html, /href="https:\/\/github\.com\/langgenius\/mosoo\/"/);
  // The console login says what the home's bar and the subpages' bar say (copy/nav.json signIn), #143.
  const signIn = homeCopy("nav")[locale].signIn;
  assert.match(html, new RegExp(`href="https://cloud\\.mosoo\\.ai/login">${signIn}</a>`));
  assert.doesNotMatch(html, /Log in/, "no Log in left in the static page");
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
    /<meta property="og:image" content="https:\/\/mosoo\.ai\/brand\/social-card-v5-20261021b\.png" \/>/,
  );
  assert.match(
    landing,
    /<meta name="twitter:image" content="https:\/\/mosoo\.ai\/brand\/social-card-v5-20261021b\.png" \/>/,
  );
  assert.doesNotMatch(blogLayout, /\/og-default\.png/);
  assert.match(blogLayout, /\/brand\/social-card-v5-20261021b\.png/);
  assert.equal(
    existsSync(new URL("../apps/landing/public/brand/social-card-v5-20261021b.png", import.meta.url)),
    true,
  );
  // The v5 card shows the en hero H1 (apps/landing/scripts/assets/social-card-v5.mjs COPY, the strings of
  // copy/hero.json: the narrative round's claim, redrawn under a new dated name); the alt text of the home and the blog
  // says what is on it.
  const cardAlt = "mosoo: Your agent works locally. Now it runs without you.";
  assert.equal(cardAlt, `mosoo: ${homeHeadline("en")}`, "the card says the hero H1");
  assert.ok(landing.includes(`<meta property="og:image:alt" content="${cardAlt}" />`));
  assert.ok(landing.includes(`<meta name="twitter:image:alt" content="${cardAlt}" />`));
  assert.ok(blogLayout.includes(`ogImageAlt = "${cardAlt}"`));
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

  assert.match(en, /<html lang="en" data-damp>/);
  assert.match(en, /<title>Open-source Agent runtime for application backends \| mosoo<\/title>/);
  assert.match(
    en,
    /property="og:title"\s+content="An open-source, API-first managed Agent runtime for application backends"/,
  );
  assert.match(en, /name="twitter:description"\s+content="Start an agent task from your backend/);
  assert.match(zh, /<html lang="zh-CN" data-damp>/);
  assert.match(zh, /<link rel="canonical" href="https:\/\/mosoo\.ai\/zh"/);
  assert.match(zh, /<meta property="og:url" content="https:\/\/mosoo\.ai\/zh" \/>/);
  assert.match(zh, /<title>面向应用后端的开源 Agent runtime \| mosoo<\/title>/);
  assert.match(zh, /content="开源、API 优先的托管 Agent runtime，面向应用后端"/);
  const faqTitle = (html) => textOf(/<h2 id="faq-title"[^>]*>([\s\S]*?)<\/h2>/.exec(html)?.[1] ?? "");
  assert.equal(faqTitle(zh), `${homeCopy("faq").zh.a} ${homeCopy("faq").zh.b}`);
  assert.match(zh, /开始使用要付费吗？/);
  assert.match(ja, /<html lang="ja" data-damp>/);
  assert.match(ja, /<link rel="canonical" href="https:\/\/mosoo\.ai\/ja"/);
  assert.match(ja, /<meta property="og:url" content="https:\/\/mosoo\.ai\/ja" \/>/);
  assert.match(ja, /<title>アプリのバックエンド向けオープンソース Agent runtime \| mosoo<\/title>/);
  assert.equal(faqTitle(ja), `${homeCopy("faq").ja.a} ${homeCopy("faq").ja.b}`);
  assert.match(ja, /始めるのに費用はかかりますか？/);
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
    assert.ok(app.description.startsWith(homePositioning(locale)), "description leads with the README positioning");
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
    // The reader's text collapses whitespace (textOf), a no-break space included: ja ties a numeral to its counter
    // with one (copy/faq.json 「24 時間」「1 人」); the JSON-LD keeps the copy's own characters.
    const spaced = (value) => value.replace(/\s+/g, " ").trim();
    assert.deepEqual(
      faq.mainEntity.map((question) => [spaced(question.name), spaced(question.acceptedAnswer.text)]),
      visible,
    );
    // One exclusive accordion (native details sharing name="faq"), the first question open.
    assert.deepEqual(
      faqRowsOf(html).map((row) => row.open),
      [true, false, false, false, false, false],
      "native details, the first one open",
    );
    for (const [, answer] of visible) {
      assert.ok(answer.split(/\s+/).length <= 40, `${locale} answer within 40 words: ${answer}`);
    }
    assert.match(html, /<section\b[^>]*\bid="faq"/, "the FAQPage @id fragment resolves on the page");
  }
});

test("the static home page carries the whole page for readers without JavaScript", () => {
  const en = home("en");

  for (const locale of LOCALES) {
    const html = home(locale);

    // The six content sections in page order (staging production/v5/BRIEF.md §4, plus the spec table of the
    // 2026-10-20 graft), each a module of apps/landing/src/home/sections/, inside the paper, with the nav before and
    // the footer after.
    assert.deepEqual(sectionsOf(html), ["hero", "stage", "spec", "accent", "faq", "closing"]);
    assert.deepEqual(headingsOf(html, 1), [homeHeadline(locale)], `${locale} has one h1, the two-tone headline`);
    assert.match(html, /<div id="root"><div class="v5" data-v5-home>/);
    // The skip link comes first and lands on main.
    assert.match(html, /<div class="v5" data-v5-home>\n<a class="v5-skip" href="#main">/);
    assert.match(html, /<main id="main" tabindex="-1">/);
    // What the engines read is in the HTML (src/effects/v5/README.md, "On the v5 page").
    assert.match(html, /<html lang="[^"]+" data-damp>/);
    assert.match(html, /<script>document\.documentElement\.classList\.add\("js"\)<\/script>/);
    assert.match(html, /<header class="v5-nav" data-nav>/);
    assert.match(html, /<span class="v5-nav-cta" data-nav-cta><a class="v5-btn v5-btn--lime" href="https:\/\/cloud\.mosoo\.ai">/);
    assert.equal(html.match(/data-nav-cta-watch/g)?.length, 1, "the nav watches the hero's lime CTA");
    assert.match(html, /<section\b[^>]*\bdata-section="stage"[^>]*\bdata-stage\b/);
    assert.match(html, /\bdata-stage-pin\b/);
    assert.equal(html.match(/data-theme-zone="accent"/g)?.length, 1, "one lime zone for the nav theme");
    assert.match(html, /<footer class="v5-ft" data-footer>/);
    assert.match(html, /<a class="v5-ft-brand" href="\/[a-z]{2}" aria-label="[^"]+" data-footer-brand>/);
    assert.equal(html.match(/data-footer-rise/g)?.length, 2, "the mark, then the letters");
    assert.equal(html.match(/data-footer-link\b/g)?.length, 5, "the Ask-AI column and four link columns");
    // The footer's bottom row: every language (the current one marked) and the credit.
    const langs = /<ul class="v5-ft-langs" aria-label="[^"]+">[\s\S]*?<\/ul>/.exec(html)?.[0] ?? "";
    assert.deepEqual(
      [...langs.matchAll(/<a href="([^"]+)" hreflang="([^"]+)"/g)].map((match) => [match[1], match[2]]),
      [
        ["/en", "en"],
        ["/zh", "zh-CN"],
        ["/ja", "ja"],
      ],
    );
    assert.match(langs, new RegExp(`<a href="/${locale}" [^>]*aria-current="true"`));
    assert.match(html, /<p class="v5-ft-copy">© 2026 LangGenius, Inc\.<\/p>/);
    assert.doesNotMatch(html, /mosoo:home-/, "no build marker is left");
    assert.doesNotMatch(html, RETIRED_NARRATIVE);
    assert.doesNotMatch(html, /[—–]/, "no em or en dashes");
    // The brand is lowercase, the second product's name too (owner 2026-10-20 21:57: 「mosoo computer 一律小写」):
    // no capital Mosoo anywhere in the page, head and JSON-LD included. Hosts and URLs are lowercase already.
    assert.doesNotMatch(html, /Mosoo/, "the brand is lowercase mosoo, mosoo computer included");
    assert.match(html, />mosoo computer</, "the footer names the computer in lowercase");
    assert.doesNotMatch(html, /bamboo/i, "no bamboo motif");
  }

  // The hero lead names the four harnesses as plain names in the sentence (O1: no keycaps; product words:
  // data-product-ui), and its lime CTA is the console.
  assert.equal(en.match(/<span class="v5-hn" data-product-ui translate="no">/g)?.length, 4);
  for (const name of ["OpenAI Codex", "Claude Agent SDK", "OpenCode", "Pi"]) {
    assert.match(en, new RegExp(`<span class="v5-hn" data-product-ui translate="no">${name}</span>`));
  }
  assert.doesNotMatch(en, /class="v5-kc"/, "no keycap in the hero (the spec table's Files token is a code element)");
  assert.match(en, /<a class="v5-btn v5-btn--lime" href="https:\/\/cloud\.mosoo\.ai" data-nav-cta-watch>/);
  // The footer's Harnesses column: four lime tiles with ink runtime glyphs, each with its name.
  assert.equal(en.match(/<li class="v5-ft-rt"><span class="v5-ft-tile" aria-hidden="true"><svg /g)?.length, 4);
  // The page links its own stylesheet; no React fallback styles are inlined.
  assert.doesNotMatch(en, /mosoo-fallback|<style>/);
});

// One source for the home: the build writes apps/landing/src/home/markup.ts into /en, /zh and /ja, and
// src/main.tsx renders the same markup in dev, so there is no React home to drift from it. The primary nav links
// the two products (its Products panel), docs, use cases, GitHub, the three languages (its language list) and the
// console login, in that order, never pricing (copy deck D12).
test("the home has one source, the static markup, and its primary navigation", () => {
  const main = read("apps/landing/src/main.tsx");
  assert.match(main, /import "\.\/home\/v5\.css";/);
  assert.match(main, /await import\("\.\/home\/markup\.ts"\)/);
  assert.doesNotMatch(main, /from "react|LoginLanding|shared\/styles\/app\.css/, "no React home, no Tailwind CSS");
  assert.equal(
    existsSync(new URL("../apps/landing/src/routes/login/landing/landing.tsx", import.meta.url)),
    false,
    "the React home is gone",
  );

  for (const locale of LOCALES) {
    assert.deepEqual(homeFaq(locale), homeCopy("faq")[locale].items, `${locale} FAQ comes from copy/faq.json`);
    assert.equal(homeCopy("faq")[locale].items.length, 6);

    const staticNav = /<nav class="v5-nav-links"[\s\S]*?<\/nav>/.exec(home(locale))?.[0] ?? "";
    assert.deepEqual(hrefsOf(staticNav), [
      "https://cloud.mosoo.ai",
      "https://computer.mosoo.ai",
      HOME_LINKS[locale].docs,
      `/${locale}/use-cases`,
      "https://github.com/langgenius/mosoo",
      "/en",
      "/zh",
      "/ja",
      "https://cloud.mosoo.ai/login",
    ]);
    assert.doesNotMatch(staticNav, /\/pricing/, "the home page does not link pricing (copy deck D12)");
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
  assert.match(zh, /<title>定价 \| mosoo<\/title>/);
  assert.match(zh, />\s*定价\s*<\/h1>/);
  assert.match(zh, /rel="alternate" hreflang="en" href="https:\/\/mosoo\.ai\/en\/pricing"/);
  assert.match(ja, /<html lang="ja">/);
  assert.match(ja, /<link rel="canonical" href="https:\/\/mosoo\.ai\/ja\/pricing"/);
  assert.match(ja, /<title>料金 \| mosoo<\/title>/);
  assertInitialSiteLinks(zh, "zh");
  assertInitialSiteLinks(ja, "ja");
});

// Unlisted pages (scripts/sitemap.mjs) stay out of the index too, in every locale, and pricing claims nothing the
// spec lacks: no offers, no plans or quotas, no self-hosting.
test("unlisted pricing pages are noindex and claim no plans", () => {
  const source = read("apps/landing/pricing.html");
  for (const locale of LOCALES) {
    const html = renderPricingLocale(source, locale);
    assert.match(html, /<meta name="robots" content="noindex, follow" \/>/, `${locale} pricing is noindex`);
    assert.doesNotMatch(html, /"offers"|"Offer"|PreOrder/, `${locale} pricing JSON-LD has no offers`);
    assert.doesNotMatch(
      textOf(html),
      /sandbox hours|concurrency|coming soon|self-host|Pro\b|Enterprise|SSO|VPC|channels|forever/i,
      `${locale} pricing text`,
    );
  }
});

// #138 (staging committee/PLAN.md 2-3): pricing stays a page, in the subpage shell like status, linked from no nav.
// It says one thing, the home FAQ's answer to "What does it cost to start?" (copy/faq.json item 5 since the
// narrative round put the FAQ in the story's order, staging narrative/DECK.md §2.6), in its
// paragraph, description and share text alike, so the FAQ is the only copy; then one lime "Try mosoo" to the
// console. The plan-based React page (tiers, quotas, self-hosting the spec does not have) is deleted.
test("pricing is the home FAQ's cost answer in the subpage shell, with one lime button", () => {
  assert.match(homeFaq("en")[4].q, /cost/, "copy/faq.json item 5 is still the cost question");
  const source = read("apps/landing/pricing.html");
  assert.match(source, /<script type="module" src="\/src\/pricing-main\.tsx"><\/script>/, "the shell mounts");
  assert.match(read("apps/landing/src/pricing-main.tsx"), /<LandingShell>\s*<PricingPage \/>\s*<\/LandingShell>/);
  const page = read("apps/landing/src/routes/pricing/pricing-page.tsx");
  assert.match(page, /import faq from "@\/home\/copy\/faq\.json"/, "the page reads the FAQ");
  assert.match(page, /const COST_QUESTION = 4;/);
  assert.match(page, /<h1 className="sp-title">/, "the title is the status page's, in the display token");
  assert.equal(page.match(/sub-btn--lime/g)?.length, 1, "one lime button");
  assert.match(page, /className="sub-btn sub-btn--lime" href=\{MOSOO_CLOUD_URL\}/, "to the console");
  for (const gone of ["src/routes/pricing/pricing-data.ts", "src/routes/pricing/i18n.ts"]) {
    assert.equal(existsSync(new URL(`../apps/landing/${gone}`, import.meta.url)), false, `${gone} is deleted`);
  }
  assert.doesNotMatch(page, /TIERS|METERED|unicorn/i, "no plans and no WebGL hero");

  for (const locale of LOCALES) {
    const html = renderPricingLocale(source, locale);
    const answer = homeFaq(locale)[4].a;
    for (const slot of [
      /<meta\s+name="description"\s+content="([^"]*)"/,
      /<meta\s+property="og:description"\s+content="([^"]*)"/,
      /<meta\s+name="twitter:description"\s+content="([^"]*)"/,
      /<p data-pricing-answer\b[^>]*>([^<]*)<\/p>/,
    ]) {
      assert.equal(decodeEntities(slot.exec(html)?.[1] ?? ""), answer, `${locale} pricing ${slot} carries the FAQ answer`);
    }
    const cta = homeCopy("nav")[locale].cta;
    assert.match(
      html,
      new RegExp(`<a href="https://cloud\\.mosoo\\.ai" class="sub-btn sub-btn--lime">${cta}</a>`),
      `${locale} Try mosoo, the lime button even without JavaScript`,
    );
    assert.match(html, new RegExp(`>\\s*${{ en: "Pricing", zh: "定价", ja: "料金" }[locale]}\\s*</h1>`));
  }
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
    "apps/landing/src/routes/use-cases/case-parts.tsx",
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
    assert.doesNotMatch(text, /\bMosoo\b/, `${path} writes the brand in lowercase, mosoo computer included`);
    assert.doesNotMatch(text, /[—–]/, `${path} has no em or en dashes`);
  }
});

test("the use-cases gallery switches to a featured grid at three cases", () => {
  const source = read("apps/landing/src/routes/use-cases/use-cases-page.tsx");

  assert.match(source, /USE_CASES\.length < 3/);
  assert.match(source, /md:grid-cols-2/);
  assert.match(source, /lg:grid-cols-3/);
  // #143 item 7: both kinds of card carry the same still arrow, and hovering one only underlines its title.
  assert.equal(source.match(/<ReadTheCase \/>/g)?.length, 2, "the featured card and the grid card");
  assert.doesNotMatch(source, /group-hover:(?:translate|scale|-translate)/, "nothing moves or zooms on hover");
  assert.equal(source.match(/sub-btn--lime/g)?.length, 1, "one lime button, to mosoo");
});

// #143 (staging committee/PLAN.md 2-4, items 1, 5, 8): the five use-case pages, cleaned up to the home's system
// (routes/use-cases/case-parts.tsx, app.css "use cases"). No uppercase kicker over a title: the case's name is in
// the way back. Numbers only on steps that happen in order, in ink-3-text. Lime only for the button that goes to
// mosoo; "Open the live app" leaves for someone else's site, so it is the grey secondary. The frame, not outlined
// boxes or chips. No mosoo console capture.
test("the use-case detail pages carry no kicker, no outlined box and lime only toward mosoo", () => {
  const parts = read("apps/landing/src/routes/use-cases/case-parts.tsx");
  const pages = ["blueprint", "codex-pet", "ghfind", "go-gym", "pitchpilot"].map((slug) =>
    read(`apps/landing/src/routes/use-cases/use-case-${slug}-page.tsx`),
  );
  for (const source of [parts, ...pages]) {
    assert.doesNotMatch(source, /uppercase|tracking-\[/, "no uppercase or spaced-out kicker");
    assert.doesNotMatch(source, /padStart\(2, "0"\)/, "no 01 / 02 / 03");
    assert.doesNotMatch(source, /bg-ink-900|ring-1|border-border|shadow-\[var|rounded-full border/, "no ink button or box");
    assert.doesNotMatch(source, /bg-green|text-green|decoration-green/, "no green");
  }
  for (const page of pages) {
    assert.match(page, /<CaseHeader\b/, "every page opens with the shared header");
    assert.match(page, /<ClosingCta\b/, "every page ends with the shared closing");
    assert.doesNotMatch(page, /sub-btn--lime/, "the pages add no lime of their own");
  }
  assert.match(parts, /<li aria-current="page" translate="no">\s*\{useCase\.name\}/, "the way back names the case");
  assert.equal(parts.match(/sub-btn--lime/g)?.length, 1, "one lime button, in the closing");
  assert.match(parts, /<a className="sub-btn sub-btn--lime" href=\{MOSOO_LOGIN_URL\}>/, "it goes to mosoo");
  assert.match(
    parts,
    /<a className="sub-btn sub-btn--grey" href=\{href\} target="_blank" rel="noreferrer noopener">/,
    "the outbound button is the grey secondary",
  );
  const css = read("apps/landing/src/shared/styles/app.css");
  assert.match(css, /\.uc-steps \.uc-item-h::before \{[^}]*color: var\(--sub-ink-3-text\);/, "step numbers in ink-3-text");
  assert.match(css, /\.uc-board \{[^}]*background: var\(--sub-frame\);/, "screenshots sit on the frame");
  assert.match(read("apps/landing/src/shared/styles/d-object.css"), /\.d-footer-h \{[^}]*font: 500 14px\/20px var\(--font-sans\);/);
});

// #143 item 3: one ink family on the subpages. The old token names in app.css (the cool greys at :root, the warm
// forest set [data-theme="landing"] used to restore, #6fd305) are aliases of the v5 values in d-object.css, and the
// subpages' two hairlines are the home's 10% / 18%.
test("the subpages' old colour tokens are aliases of the v5 ink, frame, paper and lime", () => {
  const css = read("apps/landing/src/shared/styles/app.css");
  const chrome = read("apps/landing/src/shared/styles/d-object.css");
  const root = /\n:root \{([\s\S]*?)\n\}/.exec(css)?.[1] ?? "";
  for (const [name, value] of [
    ["--ink-950", "--d-ink"],
    ["--ink-900", "--d-ink"],
    ["--ink-700", "--d-ink"],
    ["--ink-500", "--d-ink-2"],
    ["--ink-400", "--d-ink-3-text"],
    ["--ink-300", "--d-ink-3"],
    ["--ink-100", "--d-line"],
    ["--ink-50", "--d-frame"],
    ["--paper-100", "--d-paper"],
    ["--paper-200", "--d-frame"],
    ["--green-500", "--d-accent"],
    ["--border-default", "--d-line"],
    ["--border-strong", "--d-line-2"],
    ["--focus-ring", "--d-ink"],
  ]) {
    assert.match(root, new RegExp(`\\n\\s*${name}: var\\(${value}\\);`), `${name} is ${value}`);
  }
  const landing = /\[data-theme="landing"\] \{([^}]*)\}/.exec(css)?.[1] ?? "";
  assert.doesNotMatch(landing, /--(?:ink|paper|green|accent|primary|border|shadow)/, "the landing theme restores no palette");
  assert.match(chrome, /--d-line: rgb\(22 24 21 \/ 0\.1\);/);
  assert.match(chrome, /--d-line-2: rgb\(22 24 21 \/ 0\.18\);/);
  assert.match(chrome, /--d-accent: #bcf870;/);
  const code = (sheet) => sheet.replace(/\/\*[\s\S]*?\*\//g, "");
  assert.doesNotMatch(code(css) + code(chrome), /#6fd305|#1c2024|#08090a|#0b1a14/i, "no old near-black or green");
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
  // The mosoo console capture is gone (#143 item 8: it showed Published and Import package, the flow MAIN SPEC §8
  // is retiring, and the owner wants no product screenshots).
  assert.equal(
    existsSync(
      new URL("../apps/landing/public/landing/use-cases/go-gym-mosoo-agents.png", import.meta.url),
    ),
    false,
  );
  assert.doesNotMatch(read("apps/landing/src/routes/use-cases/use-case-go-gym-page.tsx"), /go-gym-mosoo-agents/);
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
