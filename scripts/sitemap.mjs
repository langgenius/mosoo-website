import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

// Pages that stay published but out of the sitemap until their copy is rewritten.
// Pricing still states capabilities the spec excludes (staging REVIEW-v4 G9,
// langgenius/mosoo-website#138); nothing links it either. Paths, all locales.
export const UNLISTED_PAGES = ["/en/pricing", "/zh/pricing", "/ja/pricing"];

const escapeXml = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

export function extractSitemapLocations(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1].trim());
}

export function renderSitemapIndex(locations) {
  const entries = locations
    .map((location) => `  <sitemap>\n    <loc>${escapeXml(location)}</loc>\n  </sitemap>`)
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</sitemapindex>\n`;
}

/** Drops every <url> entry whose <loc> path is unlisted; the rest of the urlset is kept byte for byte. */
export function withoutUnlistedPages(xml, unlisted = UNLISTED_PAGES) {
  return xml.replace(/\n?[ \t]*<url>\s*<loc>([^<]+)<\/loc>[\s\S]*?<\/url>/g, (entry, location) =>
    unlisted.includes(new URL(location.trim()).pathname) ? "" : entry,
  );
}

/**
 * Writes the root sitemap index, and removes the unlisted pages from the pages
 * sitemap that the landing build copied next to it (the source file in
 * apps/landing/public keeps every page).
 */
export async function writeRootSitemap({
  blogIndexPath,
  outputPath,
  pagesPath = join(dirname(outputPath), "sitemap-pages.xml"),
}) {
  const blogIndex = await readFile(blogIndexPath, "utf8");
  const locations = [
    "https://mosoo.ai/sitemap-pages.xml",
    ...extractSitemapLocations(blogIndex),
    "https://mosoo.ai/docs/sitemap.xml",
  ];

  await writeFile(outputPath, renderSitemapIndex(locations));
  await writeFile(pagesPath, withoutUnlistedPages(await readFile(pagesPath, "utf8")));
}
