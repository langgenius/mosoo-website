import { readFile, writeFile } from "node:fs/promises";

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

export async function writeRootSitemap({ blogIndexPath, outputPath }) {
  const blogIndex = await readFile(blogIndexPath, "utf8");
  const locations = [
    "https://mosoo.ai/sitemap-pages.xml",
    ...extractSitemapLocations(blogIndex),
    "https://mosoo.ai/docs/sitemap.xml",
  ];

  await writeFile(outputPath, renderSitemapIndex(locations));
}
