// Draft posts never ship — and neither do their assets.
// Astro leaves `draft: true` pages out of `astro build`, but it copies `public/`
// wholesale, so a draft's images under `public/blog/<permalink>/` would still reach
// production. This integration removes such a folder from the build output only when
//   · every entry that shares the permalink is a draft, AND
//   · no published entry references anything inside that folder.
// A published post's hero, figures and cover material are therefore never touched.
import { existsSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

/** @param {string} source raw .md/.mdx file contents */
export function readDraftInfo(source) {
  const match = source.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return undefined;
  const front = match[1];
  const permalink = front.match(/^permalink:\s*["']?([^"'\n]+)["']?\s*$/m)?.[1]?.trim();
  const draft = /^draft:\s*true\s*$/m.test(front);
  return permalink ? { permalink, draft } : undefined;
}

/**
 * Asset folders (by permalink) that are safe to strip from a production build.
 * @param {string[]} sources raw contents of every post
 */
export function draftOnlyPermalinks(sources) {
  const byPermalink = new Map();
  const published = [];
  for (const source of sources) {
    const info = readDraftInfo(source);
    if (!info) continue;
    byPermalink.set(info.permalink, (byPermalink.get(info.permalink) ?? true) && info.draft);
    if (!info.draft) published.push(source);
  }
  return [...byPermalink]
    .filter(([, allDraft]) => allDraft)
    .map(([permalink]) => permalink)
    .filter((permalink) => !published.some((source) => source.includes(`/blog/blog/${permalink}/`)));
}

export function stripDraftAssets({ contentDir = "./src/content/blog" } = {}) {
  return {
    name: "mosoo:strip-draft-assets",
    hooks: {
      "astro:build:done": ({ dir, logger }) => {
        const files = readdirSync(contentDir).filter((name) => /\.mdx?$/.test(name) && name !== "README.md");
        const permalinks = draftOnlyPermalinks(files.map((name) => readFileSync(join(contentDir, name), "utf8")));
        const outDir = fileURLToPath(dir);
        for (const permalink of permalinks) {
          const target = join(outDir, "blog", permalink);
          if (existsSync(target)) {
            rmSync(target, { recursive: true, force: true });
            logger.info(`removed draft-only assets: blog/${permalink}/`);
          }
        }
      },
    },
  };
}
