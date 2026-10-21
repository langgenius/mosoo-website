import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  extractSitemapLocations,
  renderSitemapIndex,
  UNLISTED_PAGES,
  withoutUnlistedPages,
  writeRootSitemap,
} from "../scripts/sitemap.mjs";

const pagesSource = readFileSync(new URL("../apps/landing/public/sitemap-pages.xml", import.meta.url), "utf8");

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

// Pricing is unlisted until it is rewritten (REVIEW-v4 G9, #138): the shipped
// pages sitemap must not carry it, while every other page stays as it was.
test("the shipped pages sitemap leaves out pricing and keeps every other page", () => {
  const before = extractSitemapLocations(pagesSource);
  const after = extractSitemapLocations(withoutUnlistedPages(pagesSource));

  assert.deepEqual(UNLISTED_PAGES, ["/en/pricing", "/zh/pricing", "/ja/pricing"]);
  assert.deepEqual(
    after,
    before.filter((location) => !UNLISTED_PAGES.includes(new URL(location).pathname)),
  );
  assert.equal(after.length, before.length - 3);
  assert.doesNotMatch(withoutUnlistedPages(pagesSource), /pricing/);
  // The kept entries are untouched, alternates included.
  assert.match(
    withoutUnlistedPages(pagesSource),
    /<loc>https:\/\/mosoo\.ai\/health<\/loc>\n {4}<xhtml:link rel="alternate" hreflang="en" href="https:\/\/mosoo\.ai\/health" \/>/,
  );
  assert.match(withoutUnlistedPages(pagesSource), /^<\?xml version="1\.0" encoding="UTF-8"\?>\n<urlset\b/);
  assert.match(withoutUnlistedPages(pagesSource), /<\/url>\n<\/urlset>\n$/);
});

test("writeRootSitemap writes the index and unlists pricing in the built pages sitemap", async () => {
  const dir = mkdtempSync(join(tmpdir(), "sitemap-"));
  try {
    writeFileSync(
      join(dir, "blog-index.xml"),
      `<sitemapindex><sitemap><loc>https://mosoo.ai/blog/sitemap-0.xml</loc></sitemap></sitemapindex>`,
    );
    writeFileSync(join(dir, "sitemap-pages.xml"), pagesSource);
    await writeRootSitemap({ blogIndexPath: join(dir, "blog-index.xml"), outputPath: join(dir, "sitemap.xml") });

    assert.deepEqual(extractSitemapLocations(readFileSync(join(dir, "sitemap.xml"), "utf8")), [
      "https://mosoo.ai/sitemap-pages.xml",
      "https://mosoo.ai/blog/sitemap-0.xml",
      "https://mosoo.ai/docs/sitemap.xml",
    ]);
    const pages = readFileSync(join(dir, "sitemap-pages.xml"), "utf8");
    assert.doesNotMatch(pages, /pricing/);
    assert.ok(extractSitemapLocations(pages).includes("https://mosoo.ai/en/use-cases"));
  } finally {
    rmSync(dir, { force: true, recursive: true });
  }
});
