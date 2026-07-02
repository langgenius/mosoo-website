import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");
const TMP = join(ROOT, ".tmp");
const DOCS_ZIP = join(TMP, "docs-export.zip");
const DOCS_EXPORT = join(TMP, "docs-export");

const TEXT_EXTENSIONS = new Set([
  ".css",
  ".html",
  ".js",
  ".json",
  ".md",
  ".svg",
  ".txt",
  ".webmanifest",
  ".xml",
]);

const DOCS_ROOT_PATH_PATTERN =
  /(["'(\s=])\/(_next\/|images\/|favicons\/|api-reference(?:\/|(?=["'#?\s)]))|cli(?:\/|(?=["'#?\s)]))|zh-Hans(?:\/|(?=["'#?\s)]))|quickstart(?:\/|(?=["'#?\s)]))|auth-and-access(?:\/|(?=["'#?\s)]))|coding-agents(?:\/|(?=["'#?\s)]))|index(?:\/|\.md|(?=["'#?\s)]))|openapi(?:\.json|\/)|mosoo-openapi[^"'()\s]*|llms\.txt|sitemap\.xml)/g;

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

function copyFilteredDirectory(source, target) {
  mkdirSync(target, { recursive: true });

  for (const entry of readdirSync(source)) {
    if (
      entry === ".nvmrc" ||
      entry === ".gitignore" ||
      entry === ".mintignore" ||
      entry === "serve.js" ||
      entry === "scripts" ||
      entry === "src" ||
      entry === "wrangler.toml" ||
      entry === "Start Docs.command" ||
      entry === "Start Docs.bat"
    ) {
      continue;
    }

    const sourcePath = join(source, entry);
    const targetPath = join(target, entry);
    const stat = statSync(sourcePath);

    if (stat.isDirectory()) {
      copyFilteredDirectory(sourcePath, targetPath);
    } else if (stat.isFile()) {
      copyFileSync(sourcePath, targetPath);
    }
  }
}

function walkFiles(directory, visit) {
  for (const entry of readdirSync(directory)) {
    const path = join(directory, entry);
    const stat = statSync(path);

    if (stat.isDirectory()) {
      walkFiles(path, visit);
    } else if (stat.isFile()) {
      visit(path);
    }
  }
}

function rewriteDocsAssets(directory) {
  walkFiles(directory, (path) => {
    if (!TEXT_EXTENSIONS.has(extname(path))) {
      return;
    }

    const original = readFileSync(path, "utf8");
    const rewritten = original.replace(DOCS_ROOT_PATH_PATTERN, "$1/docs/$2");

    if (rewritten !== original) {
      writeFileSync(path, rewritten);
    }
  });
}

rmSync(DIST, { force: true, recursive: true });
rmSync(TMP, { force: true, recursive: true });
mkdirSync(TMP, { recursive: true });

run("npm", ["run", "landing:build"]);
run("npm", ["run", "blog:build"]);
run("npm", ["run", "docs:export"]);

run("unzip", ["-q", DOCS_ZIP, "-d", DOCS_EXPORT]);

cpSync(join(ROOT, "apps", "landing", "dist"), DIST, { recursive: true });
cpSync(join(ROOT, "apps", "blog", "dist"), join(DIST, "blog"), { recursive: true });
copyFilteredDirectory(DOCS_EXPORT, join(DIST, "docs"));
rewriteDocsAssets(join(DIST, "docs"));

if (!existsSync(join(DIST, "index.html"))) {
  throw new Error("Landing build did not produce dist/index.html.");
}

if (!existsSync(join(DIST, "blog", "index.html"))) {
  throw new Error("Blog build did not produce dist/blog/index.html.");
}

if (!existsSync(join(DIST, "docs", "index.html"))) {
  throw new Error("Docs export did not produce dist/docs/index.html.");
}

console.log(`Built Mosoo website into ${basename(DIST)}/`);
