import assert from "node:assert/strict";
import test from "node:test";

import { extractSitemapLocations, renderSitemapIndex } from "../scripts/sitemap.mjs";

test("the root sitemap generator preserves every Astro sitemap shard", () => {
  const blogIndex = `<?xml version="1.0"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>https://mosoo.ai/blog/sitemap-0.xml</loc></sitemap><sitemap><loc>https://mosoo.ai/blog/sitemap-1.xml</loc></sitemap></sitemapindex>`;

  assert.deepEqual(extractSitemapLocations(blogIndex), [
    "https://mosoo.ai/blog/sitemap-0.xml",
    "https://mosoo.ai/blog/sitemap-1.xml",
  ]);
});

test("the sitemap index escapes locations and emits the canonical content surfaces", () => {
  const xml = renderSitemapIndex([
    "https://mosoo.ai/sitemap-pages.xml",
    "https://mosoo.ai/blog/sitemap-0.xml?x=1&y=2",
    "https://mosoo.ai/docs/sitemap.xml",
  ]);

  assert.match(xml, /^<\?xml version="1\.0" encoding="UTF-8"\?>/);
  assert.match(xml, /<sitemapindex xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/);
  assert.match(xml, /<loc>https:\/\/mosoo\.ai\/blog\/sitemap-0\.xml\?x=1&amp;y=2<\/loc>/);
});
