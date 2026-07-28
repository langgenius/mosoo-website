import { spawnSync } from "node:child_process";
import { cpSync, existsSync, rmSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildLandingLocales } from "./landing-locales.mjs";
import { writeRootSitemap } from "./sitemap.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");

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

await buildLandingLocales(join(ROOT, "apps", "landing", "dist"));

cpSync(join(ROOT, "apps", "landing", "dist"), DIST, { recursive: true });
cpSync(join(ROOT, "apps", "blog", "dist"), join(DIST, "blog"), { recursive: true });

await writeRootSitemap({
  blogIndexPath: join(DIST, "blog", "sitemap-index.xml"),
  outputPath: join(DIST, "sitemap.xml"),
});

if (!existsSync(join(DIST, "index.html"))) {
  throw new Error("Landing build did not produce dist/index.html.");
}

if (!existsSync(join(DIST, "pricing.html"))) {
  throw new Error("Landing build did not produce dist/pricing.html.");
}

for (const locale of ["en", "zh", "ja"]) {
  if (!existsSync(join(DIST, `${locale}.html`))) {
    throw new Error(`Landing build did not produce dist/${locale}.html.`);
  }
  if (!existsSync(join(DIST, locale, "pricing.html"))) {
    throw new Error(`Landing build did not produce dist/${locale}/pricing.html.`);
  }
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

console.log(`Built mosoo website into ${basename(DIST)}/`);
