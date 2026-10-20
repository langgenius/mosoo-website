import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

// Guards for the brand kit (scripts/brand-assets/MANIFEST.md): the generated
// outline files stay out of the website's CSS, CJK headings keep their own
// punctuation, and the manifest matches the files. The bamboo kit is gone
// from the site (d-object redesign), so its plate and manifest checks went
// with it. The v5 clean-up (2026-10-20) adds the social card and font guards
// at the end of this file.

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(root, "apps/landing/public");
const outline = join(root, "apps/landing/public/brand/outline");
const fonts = join(root, "apps/landing/public/fonts");
const literataCss = readFileSync(join(root, "apps/landing/src/shared/styles/literata.css"), "utf8");

test("the generated outline folder adds no Tailwind utilities to the website build", async (t) => {
  let compile;
  let Scanner;
  try {
    ({ compile } = await import("@tailwindcss/node"));
    ({ Scanner } = await import("@tailwindcss/oxide"));
  } catch {
    t.skip("Tailwind's node packages are not installed");
    return;
  }
  // Tailwind's automatic source detection scans apps/landing/public, so a word
  // in a generated SVG that names a utility (once: "ring") becomes global CSS.
  const fresh = () => compile('@import "tailwindcss";', { base: join(root, "apps/landing/src/shared/styles"), onDependency() {} });
  const candidates = new Scanner({ sources: [{ base: outline, pattern: "**/*", negated: false }] }).scan();
  const without = (await fresh()).build([]);
  if ((await fresh()).build(candidates) !== without) {
    const live = [];
    for (const candidate of candidates) if ((await fresh()).build([candidate]) !== without) live.push(candidate);
    assert.deepEqual(live, [], "candidates from apps/landing/public/brand/outline that emit CSS");
  }
});

/** Parse "U+0000-00B6, U+2013" into [[start, end], ...]. */
const parseRanges = (value) =>
  value.split(",").map((part) => {
    const [start, end = start] = part.trim().replace(/^U\+/i, "").split("-");
    return [Number.parseInt(start, 16), Number.parseInt(end, 16)];
  });

test("zh and ja Literata stacks leave CJK punctuation to the CJK serif faces", () => {
  const faces = [...literataCss.matchAll(/@font-face\s*{([^}]*)}/g)].map(([, body]) => ({
    family: body.match(/font-family:\s*"([^"]+)"/)[1],
    ranges: body.match(/unicode-range:\s*([^;]+);/)?.[1],
  }));
  // Middle dot, quotes, dashes, ellipsis, hyphenation point: full width in CJK text.
  const punctuation = [0x00b7, 0x2014, 0x2018, 0x2019, 0x201c, 0x201d, 0x2026, 0x2027];
  for (const variable of ["--font-literata-zh", "--font-literata-ja"]) {
    const stack = literataCss.match(new RegExp(`${variable}:\\s*([^;]+);`))[1];
    const families = [...stack.matchAll(/"([^"]+)"/g)].map(([, family]) => family);
    const cjk = families.findIndex((family) => /Songti|STSong|Mincho|CJK|Serif SC|Serif JP/.test(family));
    assert.ok(cjk > 0, `${variable} names a CJK serif face after its Latin faces`);
    for (const family of families.slice(0, cjk)) {
      const own = faces.filter((face) => face.family === family);
      assert.ok(own.length > 0, `${variable}: "${family}" is declared in literata.css`);
      for (const face of own) {
        assert.ok(face.ranges, `${variable}: every "${family}" face has a unicode-range`);
        const ranges = parseRanges(face.ranges);
        for (const cp of punctuation) {
          const hit = ranges.some(([start, end]) => cp >= start && cp <= end);
          assert.equal(hit, false, `${variable}: "${family}" covers U+${cp.toString(16).toUpperCase().padStart(4, "0")}`);
        }
      }
    }
  }
});

test("MANIFEST.md lists every brand kit file with its current size", () => {
  const manifest = readFileSync(join(root, "scripts/brand-assets/MANIFEST.md"), "utf8");
  const files = [
    ...readdirSync(fonts).filter((name) => name.startsWith("Literata")).map((name) => `apps/landing/public/fonts/${name}`),
    "apps/landing/src/shared/styles/literata.css",
  ];
  for (const path of files) {
    const row = manifest.split("\n").find((line) => line.startsWith(`| \`${path}\` |`));
    assert.ok(row, `${path} has a row in MANIFEST.md`);
    const bytes = statSync(join(root, path)).size.toLocaleString("en-US");
    assert.ok(row.includes(`| ${bytes} |`), `${path}: MANIFEST.md says ${row.split("|")[2].trim()}, the file has ${bytes} bytes`);
  }
});

// ---------------------------------------------------------------------------
// Social cards (staging REVIEW-v4 §4.7 and §6.2): no page shares a bamboo card.

// The v3 cards: a bamboo-grove photograph with the green solid mark. The geist
// file is deleted; both hashes stay, so a copy under any name is still caught.
const BAMBOO_CARDS = {
  "social-card-20261019.png": "fd744e4902b145737ab28320b566b49ffa03da441557ffbb7235afe5b5c7e8bd",
  "social-card-geist-20260917.png": "31c8f6e3f2c0459494019090c080a38b43315ac2d578833cacd0c578358ce388",
};
const V5_CARD = "https://mosoo.ai/brand/social-card-v5-20261020.png";

const sha256 = (path) => createHash("sha256").update(readFileSync(path)).digest("hex");
const filesUnder = (dir) =>
  readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => join(entry.parentPath ?? entry.path, entry.name));

/** Every landing HTML entry and the blog layout, with the share images each one names. */
function shareImages() {
  const pages = [
    ...readdirSync(join(root, "apps/landing")).filter((name) => name.endsWith(".html")).map((name) => `apps/landing/${name}`),
    ...readdirSync(join(root, "apps/landing/use-cases")).map((name) => `apps/landing/use-cases/${name}`),
  ];
  const images = pages.flatMap((page) => {
    const html = readFileSync(join(root, page), "utf8");
    return [
      ...html.matchAll(/<meta\s+property="og:image"\s+content="([^"]+)"/g),
      ...html.matchAll(/<meta\s+name="twitter:image"\s+content="([^"]+)"/g),
    ].map((match) => ({ page, url: match[1] }));
  });
  const blogLayout = "apps/blog/src/layouts/BaseLayout.astro";
  for (const match of readFileSync(join(root, blogLayout), "utf8").matchAll(/new URL\("(\/[^"]+\.(?:png|jpe?g|webp))", Astro\.site\)/g)) {
    images.push({ page: blogLayout, url: `https://mosoo.ai${match[1]}` });
  }
  return images;
}

/** Why an image URL is a bamboo card, or null. Files served from apps/landing/public are hashed too. */
function bambooReason(url) {
  const { pathname } = new URL(url, "https://mosoo.ai");
  const name = pathname.split("/").at(-1);
  if (name in BAMBOO_CARDS) return `${name} is a bamboo card`;
  const file = join(publicDir, pathname);
  if (pathname.startsWith("/brand/") || pathname.startsWith("/landing/")) {
    if (!existsSync(file)) return `${pathname} does not exist in apps/landing/public`;
    const hash = sha256(file);
    const twin = Object.keys(BAMBOO_CARDS).find((card) => BAMBOO_CARDS[card] === hash);
    if (twin) return `${pathname} is a copy of ${twin}`;
  }
  return null;
}

test("no page's og:image or twitter:image is a bamboo card", () => {
  const images = shareImages();
  assert.ok(images.length >= 10, `found ${images.length} share images`);
  const violations = images
    .map(({ page, url }) => ({ page, url, reason: bambooReason(url) }))
    .filter(({ reason }) => reason !== null);
  assert.deepEqual(violations, [], "pages that share a bamboo card");
});

test("the home, the blog, status, use cases and pricing share the v5 card, a 1200 x 630 PNG", () => {
  for (const page of [
    "apps/landing/index.html",
    "apps/landing/status.html",
    "apps/landing/use-cases.html",
    "apps/landing/pricing.html",
  ]) {
    const urls = shareImages().filter((image) => image.page === page).map((image) => image.url);
    assert.deepEqual(urls, [V5_CARD, V5_CARD], `${page} og:image and twitter:image`);
  }
  const blog = shareImages().filter((image) => image.page === "apps/blog/src/layouts/BaseLayout.astro");
  assert.deepEqual(blog.map((image) => image.url), [V5_CARD], "the blog's default share image");
  const png = readFileSync(join(publicDir, new URL(V5_CARD).pathname));
  assert.equal(png.subarray(1, 4).toString("latin1"), "PNG");
  assert.deepEqual([png.readUInt32BE(16), png.readUInt32BE(20)], [1200, 630], "IHDR width and height");
  assert.ok(png.length < 100_000, `the card stays light (${png.length} B)`);
});

test("public/ ships no bamboo file and no orphan social card", () => {
  const files = filesUnder(publicDir).map((file) => relative(publicDir, file));
  assert.deepEqual(files.filter((file) => /bamboo|culm|grove/i.test(file)), []);
  const named = new Set(shareImages().map(({ url }) => new URL(url, "https://mosoo.ai").pathname));
  const cards = files.filter((file) => /^brand\/social-card-[^/]+\.png$/.test(file));
  assert.ok(cards.length > 0);
  for (const card of cards) {
    assert.ok(named.has(`/${card}`), `${card} is shared by no page: delete it`);
  }
});

// ---------------------------------------------------------------------------
// Fonts (staging REVIEW-v4 §6.3, #146): every face that ships has its licence
// text next to it.

const FONT_LICENCES = {
  FragmentMono: "FragmentMono-OFL.txt",
  // vercel/geist-font: one OFL text covers Geist and Geist Mono.
  Geist: "GeistMono-LICENSE.txt",
  GeistMono: "GeistMono-LICENSE.txt",
  HankenGrotesk: "HankenGrotesk-OFL.txt",
  HedvigLettersSerif: "HedvigLettersSerif-OFL.txt",
  // Inter left with its licence on 2026-10-20: Hanken Grotesk sets the pages and the share card's CTA.
  Literata: "Literata-LICENSE.txt",
};
// Cabinet Grotesk has no licence file (the ITF Free Font License, unverified). The landing no longer loads it
// (app.css); @mosoo/design-tokens (pkgs/design-tokens/mosoo.css, the blog) still references the file, so it
// stays until that reference goes. Then delete the font and this entry (v5/subpages/NOTES.md, request 5).
const PENDING_LICENCE = new Set(["CabinetGrotesk-Variable.woff2"]);

test("every font that ships has its licence text next to it", () => {
  for (const file of readdirSync(fonts).filter((name) => /\.(woff2?|ttf|otf)$/.test(name))) {
    if (PENDING_LICENCE.has(file)) continue;
    const family = file.replace(/-.*$/, "").replace(/\.\w+$/, "");
    const licence = FONT_LICENCES[family];
    assert.ok(licence, `${file}: no licence is known for the ${family} family`);
    assert.ok(existsSync(join(fonts, licence)), `${file}: ${licence} is missing`);
  }
});

// A font swap (Inter -> Hanken Grotesk, 2026-10-20) touches three stylesheets and two preload lists. A preload
// left behind downloads a font no rule uses; a renamed file breaks a face silently. So: every @font-face file
// exists, and the home and the blog preload only files their own stylesheet declares.
const HOME_CSS = "apps/landing/src/home/system.css";
const BLOG_CSS = "apps/blog/src/styles/global.css";
const FONT_SHEETS = [HOME_CSS, "apps/landing/src/shared/styles/app.css", BLOG_CSS];
const read = (path) => readFileSync(join(root, path), "utf8");
const fontUrls = (css) => [...css.matchAll(/url\("([^"]+\.woff2)"\)/g)].map(([, url]) => url);

test("@font-face sources exist and every font preload is a face the page's stylesheet declares", () => {
  for (const sheet of FONT_SHEETS) {
    for (const url of fontUrls(read(sheet))) {
      const file = url.startsWith("/") ? join(publicDir, url) : join(root, dirname(sheet), url);
      assert.ok(existsSync(file), `${sheet}: ${url} does not exist`);
    }
  }
  const homeFaces = new Set(fontUrls(read(HOME_CSS)));
  const homePreloads = [...read("apps/landing/index.html").matchAll(/<link rel="preload" href="([^"]+)" as="font"/g)];
  assert.ok(homePreloads.length > 0, "index.html preloads the first screen's fonts");
  for (const [, href] of homePreloads) {
    assert.ok(homeFaces.has(href), `index.html preloads ${href}, which ${HOME_CSS} does not declare`);
  }
  const blogFaces = fontUrls(read(BLOG_CSS)).map((url) => url.split("/").at(-1));
  const layout = read("apps/blog/src/layouts/BaseLayout.astro");
  const blogPreloads = [...layout.matchAll(/from "[^"]*\/([^/"]+\.woff2)\?url"/g)];
  assert.ok(blogPreloads.length > 0, "the blog layout preloads its fonts");
  for (const [, name] of blogPreloads) {
    assert.ok(blogFaces.includes(name), `BaseLayout.astro preloads ${name}, which ${BLOG_CSS} does not declare`);
  }
});
