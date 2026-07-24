import { spawnSync } from "node:child_process";
import { cpSync, existsSync, rmSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { writeRootSitemap } from "./sitemap.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");
const CRAWLER_FILES = [
  "coding-agents.md",
  "llms.txt",
  "mosoo-openapi.en.generated.json",
  "mosoo-openapi.generated.json",
  "mosoo-openapi.zh-Hans.generated.json",
];

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? ROOT,
    env: { ...process.env, ...options.env },
    stdio: "inherit",
  });

  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed with ${result.status ?? "signal"}.`);
  }
}

rmSync(DIST, { force: true, recursive: true });

run("npm", ["run", "landing:build"]);
run("npm", ["run", "blog:build"]);

cpSync(join(ROOT, "apps", "landing", "dist"), DIST, { recursive: true });
cpSync(join(ROOT, "apps", "blog", "dist"), join(DIST, "blog"), { recursive: true });
for (const file of CRAWLER_FILES) {
  cpSync(join(ROOT, file), join(DIST, file));
}

await writeRootSitemap({
  blogIndexPath: join(DIST, "blog", "sitemap-index.xml"),
  outputPath: join(DIST, "sitemap.xml"),
});

if (!existsSync(join(DIST, "index.html"))) {
  throw new Error("Landing build did not produce dist/index.html.");
}

if (!existsSync(join(DIST, "blog", "index.html"))) {
  throw new Error("Blog build did not produce dist/blog/index.html.");
}

if (!existsSync(join(DIST, "robots.txt"))) {
  throw new Error("Landing build did not produce dist/robots.txt.");
}

if (!existsSync(join(DIST, "sitemap.xml"))) {
  throw new Error("Landing build did not produce dist/sitemap.xml.");
}

if (!existsSync(join(DIST, "sitemap-pages.xml"))) {
  throw new Error("Landing build did not produce dist/sitemap-pages.xml.");
}

if (!existsSync(join(DIST, "blog", "sitemap-index.xml"))) {
  throw new Error("Blog build did not produce dist/blog/sitemap-index.xml.");
}

for (const file of CRAWLER_FILES) {
  if (!existsSync(join(DIST, file))) {
    throw new Error(`Site build did not publish ${file}.`);
  }
}

console.log(`Built Mosoo website into ${basename(DIST)}/`);
