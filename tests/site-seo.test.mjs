import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

import {
  renderLandingLocale,
  renderPricingLocale,
  renderStatusLocale,
  renderUseCaseBlueprintLocale,
  renderUseCaseCodexPetLocale,
  renderUseCaseGoGymLocale,
  renderUseCasesLocale,
} from "../scripts/landing-locales.mjs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
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
  assert.match(html, new RegExp(`href="/${locale}/pricing"`));
  assert.match(html, new RegExp(`href="/${locale}/use-cases"`));
  assert.match(html, new RegExp(`href="/${locale}/status"`));
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
    "https://mosoo.ai/en/status",
    "https://mosoo.ai/zh/status",
    "https://mosoo.ai/ja/status",
    "https://mosoo.ai/en/use-cases",
    "https://mosoo.ai/zh/use-cases",
    "https://mosoo.ai/ja/use-cases",
    "https://mosoo.ai/en/use-cases/blueprint",
    "https://mosoo.ai/zh/use-cases/blueprint",
    "https://mosoo.ai/ja/use-cases/blueprint",
    "https://mosoo.ai/en/use-cases/go-gym",
    "https://mosoo.ai/zh/use-cases/go-gym",
    "https://mosoo.ai/ja/use-cases/go-gym",
    "https://mosoo.ai/en/use-cases/codex-pet",
    "https://mosoo.ai/zh/use-cases/codex-pet",
    "https://mosoo.ai/ja/use-cases/codex-pet",
  ]);
});

test("the main-page sitemap exposes reciprocal landing hreflang alternates", () => {
  const sitemap = read("apps/landing/public/sitemap-pages.xml");

  assert.match(sitemap, /xmlns:xhtml="http:\/\/www\.w3\.org\/1999\/xhtml"/);
  for (const entry of sitemapEntries(sitemap)) {
    const suffix = entry.loc.replace(/^https:\/\/mosoo\.ai\/(?:en|zh|ja)/, "");
    assert.deepEqual(entry.alternates, [
      ["en", `https://mosoo.ai/en${suffix}`],
      ["zh-CN", `https://mosoo.ai/zh${suffix}`],
      ["ja", `https://mosoo.ai/ja${suffix}`],
      ["x-default", `https://mosoo.ai/en${suffix}`],
    ]);
  }
});

test("robots advertises the aggregate sitemap", () => {
  const robots = read("apps/landing/public/robots.txt");
  const sitemaps = [...robots.matchAll(/^Sitemap:\s*(\S+)$/gm)].map((match) => match[1]);

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

test("blog pages send explicit PostHog page views without the analytics SDK", () => {
  const blogLayout = read("apps/blog/src/layouts/BaseLayout.astro");

  assert.match(blogLayout, /event: "page_viewed"/);
  assert.match(blogLayout, /article_slug:/);
  assert.match(blogLayout, /surface: "blog"/);
  assert.doesNotMatch(blogLayout, /posthog-js|autocapture|session[_-]replay/i);
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
  assert.match(landing, /"@id": "https:\/\/mosoo\.ai\/#organization"/);
  assert.doesNotMatch(blogLayout, /\/og-default\.png/);
  assert.match(blogLayout, /\/landing\/invoke-gradient\.jpg/);
  assert.equal(
    existsSync(new URL("../apps/landing/public/landing/invoke-gradient.jpg", import.meta.url)),
    true,
  );
});

test("landing initial HTML exposes crawlable primary site links", () => {
  assertInitialSiteLinks(read("apps/landing/index.html"));
  assertInitialSiteLinks(read("apps/landing/pricing.html"));
});

test("landing locale pages receive localized canonical metadata", () => {
  const source = read("apps/landing/index.html");
  const zh = renderLandingLocale(source, "zh");
  const ja = renderLandingLocale(source, "ja");

  assert.match(zh, /<html lang="zh-CN">/);
  assert.match(zh, /<link rel="canonical" href="https:\/\/mosoo\.ai\/zh"/);
  assert.match(zh, /<title>mosoo — 面向 Coding Agent 的开源 Agent runtime<\/title>/);
  assert.match(ja, /<html lang="ja">/);
  assert.match(ja, /<link rel="canonical" href="https:\/\/mosoo\.ai\/ja"/);
  assert.match(
    ja,
    /<title>mosoo — Coding Agent 向けオープンソース Agent runtime<\/title>/,
  );
  assertInitialSiteLinks(zh, "zh");
  assert.match(zh, />文档<\/a>/);
  assert.match(zh, />快速开始<\/a>/);
  assertInitialSiteLinks(ja, "ja");
  assert.match(ja, />ドキュメント<\/a>/);
  assert.match(ja, />クイックスタート<\/a>/);
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

  assert.match(source, /rel="canonical" href="https:\/\/mosoo\.ai\/en\/status"/);
  assert.match(zh, /<html lang="zh-CN">/);
  assert.match(zh, /<link rel="canonical" href="https:\/\/mosoo\.ai\/zh\/status"/);
  assert.match(zh, /<title>mosoo — 系统状态<\/title>/);
  assert.match(ja, /<html lang="ja">/);
  assert.match(ja, /<link rel="canonical" href="https:\/\/mosoo\.ai\/ja\/status"/);
  assertInitialSiteLinks(zh, "zh");
  assertInitialSiteLinks(ja, "ja");
});

test("use-cases pages expose localized canonical metadata and crawlable links", () => {
  const source = read("apps/landing/use-cases.html");
  const zh = renderUseCasesLocale(source, "zh");
  const ja = renderUseCasesLocale(source, "ja");

  assert.match(source, /rel="canonical" href="https:\/\/mosoo\.ai\/en\/use-cases"/);
  assert.match(source, /href="\/en\/use-cases\/blueprint"/);
  assert.match(source, /href="\/en\/use-cases\/go-gym"/);
  assert.match(source, /href="\/en\/use-cases\/codex-pet"/);
  assert.match(zh, /<html lang="zh-CN">/);
  assert.match(zh, /<link rel="canonical" href="https:\/\/mosoo\.ai\/zh\/use-cases"/);
  assert.match(zh, /<title>mosoo — 用例<\/title>/);
  assert.match(zh, /href="\/zh\/use-cases\/blueprint"/);
  assert.match(zh, /href="\/zh\/use-cases\/go-gym"/);
  assert.match(zh, /href="\/zh\/use-cases\/codex-pet"/);
  assert.match(ja, /<html lang="ja">/);
  assert.match(ja, /<link rel="canonical" href="https:\/\/mosoo\.ai\/ja\/use-cases"/);
  assertInitialSiteLinks(zh, "zh");
  assertInitialSiteLinks(ja, "ja");
});

test("the use-cases gallery switches to a featured grid at three cases", () => {
  const source = read("apps/landing/src/routes/use-cases/use-cases-page.tsx");

  assert.match(source, /USE_CASES\.length < 3/);
  assert.match(source, /md:grid-cols-2/);
  assert.match(source, /gridCases\.length >= 3 \? "lg:grid-cols-3"/);
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

test("the codex-pet case page keeps its canonical, screenshot, and outbound links", () => {
  const source = read("apps/landing/use-cases/codex-pet.html");
  const zh = renderUseCaseCodexPetLocale(source, "zh");

  assert.match(source, /rel="canonical" href="https:\/\/mosoo\.ai\/en\/use-cases\/codex-pet"/);
  assert.match(source, /content="https:\/\/mosoo\.ai\/landing\/use-cases\/codex-pet-app\.png"/);
  assert.match(source, /href="https:\/\/github\.com\/Yevanchen\/mosoo-codex-pet"/);
  assert.match(source, /href="https:\/\/app-01kwc37q6ejfnjvvk3g192x5x7\.apps\.mosoo\.ai\/"/);
  assert.match(zh, /<link rel="canonical" href="https:\/\/mosoo\.ai\/zh\/use-cases\/codex-pet"/);
  assert.match(zh, /<title>mosoo — Codex Pet：Agent as API<\/title>/);
  assertInitialSiteLinks(zh, "zh");
});
