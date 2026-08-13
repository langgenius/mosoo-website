import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import { blogSitemapI18n, serializeBlogSitemapItem } from "./src/lib/sitemap.mjs";

// Blog is mounted at https://mosoo.ai/blog/*. apps/blog builds a static
// site that gets embedded into apps/web's deploy: `apps/web` build runs
// `apps/blog` build first, then copies `apps/blog/dist` into
// `apps/web/dist/blog/`. The same Cloudflare Worker (`mosoo-web`) serves
// both the SPA and the static blog content; `apps/web/src/worker.ts` forks
// the not-found path so `/blog/*` misses return a real 404 instead of the
// SPA shell. Astro's `base` ensures all generated URLs include the `/blog`
// prefix.
export default defineConfig({
  site: "https://mosoo.ai",
  base: "/blog",
  trailingSlash: "never",
  build: {
    // `directory` writes each route as <path>/index.html so URLs stay clean
    // and extensionless. Cloudflare Workers Assets uses `drop-trailing-slash`
    // so /blog/why-mosoo serves this file at the same URL Astro marks canonical.
    format: "directory",
  },
  integrations: [
    mdx(),
    sitemap({
      i18n: blogSitemapI18n,
      serialize: serializeBlogSitemapItem,
    }),
  ],
  vite: {
    plugins: [tailwind()],
  },
});
