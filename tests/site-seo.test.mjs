import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

import { renderLandingLocale, renderPricingLocale } from "../scripts/landing-locales.mjs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const locations = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);

const assertInitialSiteLinks = (html, locale = "en") => {
  assert.match(html, /aria-label="Primary site links"/);
  assert.match(html, new RegExp(`href="/${locale}/pricing"`));
  assert.match(html, /href="https:\/\/mosoo\.ai\/docs\/"/);
  assert.match(html, /href="https:\/\/mosoo\.ai\/docs\/quickstart\/"/);
  assert.match(html, /href="https:\/\/mosoo\.ai\/blog"/);
  assert.match(html, /href="https:\/\/github\.com\/langgenius\/mosoo\/"/);
  assert.match(html, /href="https:\/\/try\.mosoo\.ai\/login"/);
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
  ]);
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
