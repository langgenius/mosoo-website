import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const locations = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);

test("the root sitemap aggregates every public content surface", () => {
  const sitemap = read("apps/landing/public/sitemap.xml");

  assert.match(sitemap, /<sitemapindex\b/);
  assert.deepEqual(locations(sitemap), [
    "https://mosoo.ai/sitemap-pages.xml",
    "https://mosoo.ai/blog/sitemap-0.xml",
    "https://mosoo.ai/docs/sitemap.xml",
  ]);
});

test("the main-page sitemap contains the canonical landing URL", () => {
  assert.equal(existsSync(new URL("../apps/landing/public/sitemap-pages.xml", import.meta.url)), true);
  const sitemap = read("apps/landing/public/sitemap-pages.xml");

  assert.match(sitemap, /<urlset\b/);
  assert.deepEqual(locations(sitemap), ["https://mosoo.ai/"]);
});

test("robots advertises the aggregate sitemap", () => {
  const robots = read("apps/landing/public/robots.txt");
  const sitemaps = [...robots.matchAll(/^Sitemap:\s*(\S+)$/gm)].map((match) => match[1]);

  assert.deepEqual(sitemaps, ["https://mosoo.ai/sitemap.xml"]);
});

test("blog canonical metadata preserves final directory URLs", () => {
  const blogLayout = read("apps/blog/src/layouts/BaseLayout.astro");

  assert.match(blogLayout, /new URL\(Astro\.url\.pathname, Astro\.site\)\.href/);
  assert.doesNotMatch(blogLayout, /pathname\.replace\(\/\\\/\$\//);
});

test("blog posts reference the landing page organization identity", () => {
  const postLayout = read("apps/blog/src/layouts/PostLayout.astro");

  assert.match(
    postLayout,
    /publisher:\s*\{\s*"@id": "https:\/\/mosoo\.ai\/#organization"\s*\},/,
  );
});

test("landing and blog metadata never point at a missing default image", () => {
  const landing = read("apps/landing/index.html");
  const blogLayout = read("apps/blog/src/layouts/BaseLayout.astro");

  assert.match(landing, /rel="alternate" hreflang="en" href="https:\/\/mosoo\.ai\/"/);
  assert.match(landing, /rel="alternate" hreflang="x-default" href="https:\/\/mosoo\.ai\/"/);
  assert.match(landing, /"@id": "https:\/\/mosoo\.ai\/#organization"/);
  assert.doesNotMatch(blogLayout, /\/og-default\.png/);
  assert.match(blogLayout, /\/landing\/invoke-gradient\.jpg/);
  assert.equal(
    existsSync(new URL("../apps/landing/public/landing/invoke-gradient.jpg", import.meta.url)),
    true,
  );
});

test("llms entrypoint links to public crawler and docs surfaces", () => {
  const llms = read("llms.txt");

  assert.match(llms, /https:\/\/mosoo\.ai\/coding-agents\.md/);
  assert.match(llms, /https:\/\/mosoo\.ai\/docs\/quickstart\//);
  assert.match(llms, /https:\/\/mosoo\.ai\/docs\/auth-and-access\//);
  assert.doesNotMatch(llms, /https:\/\/mosoo\.ai\/quickstart\.md/);
  assert.doesNotMatch(llms, /https:\/\/mosoo\.ai\/auth-and-access\.md/);
});
