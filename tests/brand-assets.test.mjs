import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

// Guards for the brand kit (scripts/brand-assets/MANIFEST.md): the generated
// outline files stay out of the website's CSS. The bamboo kit is gone from the
// site (d-object redesign), and so is the opt-in Literata (#143, 2026-10-21:
// no page loaded it), so their plate, punctuation and manifest checks went
// with them. The v5 clean-up (2026-10-20) adds the social card and font guards
// at the end of this file.

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(root, "apps/landing/public");
const outline = join(root, "apps/landing/public/brand/outline");
const fonts = join(root, "apps/landing/public/fonts");

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

// ---------------------------------------------------------------------------
// Social cards (staging REVIEW-v4 §4.7 and §6.2): no page shares a bamboo card.

// The v3 cards: a bamboo-grove photograph with the green solid mark. The geist
// file is deleted; both hashes stay, so a copy under any name is still caught.
const BAMBOO_CARDS = {
  "social-card-20261019.png": "fd744e4902b145737ab28320b566b49ffa03da441557ffbb7235afe5b5c7e8bd",
  "social-card-geist-20260917.png": "31c8f6e3f2c0459494019090c080a38b43315ac2d578833cacd0c578358ce388",
};
const V5_CARD = "https://mosoo.ai/brand/social-card-v5-20261021b.png"; // the narrative round's H1 (social-card-v5.mjs)

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
  HankenGrotesk: "HankenGrotesk-OFL.txt",
  // The display face since 2026-10-21 (committee O2; Hedvig Letters Serif left with its licence).
  RobotoSerif: "RobotoSerif-OFL.txt",
  // Inter left with its licence on 2026-10-20: Hanken Grotesk sets the pages and the share card's CTA.
  // Cabinet Grotesk (it had no licence file), Geist, Geist Mono and Literata left with theirs on 2026-10-21:
  // no page loaded them (#143).
};

test("every font that ships has its licence text next to it", () => {
  for (const file of readdirSync(fonts).filter((name) => /\.(woff2?|ttf|otf)$/.test(name))) {
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

// The other way round (#143): every font file that ships is one a stylesheet declares. Cabinet Grotesk, Geist, Geist
// Mono and Literata shipped for months with no page loading them.
test("public/fonts ships only faces a stylesheet declares", () => {
  const declared = new Set(FONT_SHEETS.flatMap((sheet) => fontUrls(read(sheet)).map((url) => url.split("/").at(-1))));
  for (const file of readdirSync(fonts).filter((name) => /\.(woff2?|ttf|otf)$/.test(name))) {
    assert.ok(declared.has(file), `${file} is declared by no stylesheet (${FONT_SHEETS.join(", ")})`);
  }
  assert.equal(existsSync(join(root, "apps/landing/src/shared/styles/literata.css")), false, "literata.css is gone");
  assert.doesNotMatch(read("pkgs/design-tokens/mosoo.css"), /@font-face/, "@mosoo/design-tokens declares no faces");
});

// zh and ja lines set Hanken's Latin at the x-height of the CJK face's own Latin (graft-design P2-3, staging
// v5/polish/type/NOTES.md): the same file declared again with size-adjust, in three stylesheets and the kit. So: every
// sheet declares the same scaled faces of that one file (no new download) with Hanken's line box kept, the zh / ja
// stacks lead with them, and en still leads with "Hanken Grotesk".
const KIT_CSS = "apps/landing/src/home/kit/kit.css";
const faceBlock = (css, family) => {
  const block = [...css.matchAll(/@font-face\s*{([^}]*)}/g)].map(([, body]) => body).find((body) => body.includes(`font-family: "${family}";`));
  assert.ok(block, `no @font-face for "${family}"`);
  const num = (name) => Number(new RegExp(`${name}:\\s*([\\d.]+)%`).exec(block)?.[1]);
  return { block, size: num("size-adjust"), ascent: num("ascent-override"), descent: num("descent-override") };
};
const stackHead = (css, selector, prop) => {
  const body = new RegExp(`(?:^|\\n)${selector.replace(/[()]/g, "\\$&")}\\s*{([^}]*)}`).exec(css)?.[1] ?? "";
  return new RegExp(`${prop}:\\s*"([^"]+)"`).exec(body)?.[1];
};

test("zh / ja lead their sans stack with Hanken scaled to the CJK face's Latin; en keeps Hanken", () => {
  const scales = {};
  for (const sheet of FONT_SHEETS) {
    const css = read(sheet);
    const file = fontUrls(css).find((url) => url.endsWith("HankenGrotesk-latin.woff2"));
    for (const [lang, family] of [["zh", "Hanken Grotesk SC"], ["ja", "Hanken Grotesk JP"]]) {
      const face = faceBlock(css, family);
      assert.ok(face.block.includes(`url("${file}")`), `${sheet}: "${family}" is not the Hanken file`);
      assert.ok(face.size > 100, `${sheet}: "${family}" has no size-adjust above 100%`);
      // The line box stays Hanken's 1000 / 303: the overrides undo the scale.
      assert.ok(Math.abs((face.ascent * face.size) / 100 - 100) < 0.1, `${sheet}: "${family}" ascent moves the line box`);
      assert.ok(Math.abs((face.descent * face.size) / 100 - 30.3) < 0.1, `${sheet}: "${family}" descent moves the line box`);
      const fallback = faceBlock(css, `${family} Fallback`);
      assert.ok(fallback.block.includes('local("Arial")'), `${sheet}: "${family} Fallback" is not Arial`);
      assert.ok(Math.abs(fallback.size / face.size - 1.006) < 0.001, `${sheet}: "${family} Fallback" is not Arial at Hanken's width`);
      (scales[family] ??= new Set()).add(face.size);
      assert.equal(stackHead(css, `:root:lang(${lang})`, "--font-sans"), family, `${sheet}: :lang(${lang}) does not lead with "${family}"`);
    }
    assert.equal(stackHead(css, ":root", "--font-sans"), "Hanken Grotesk", `${sheet}: en no longer leads with Hanken Grotesk`);
  }
  for (const [family, sizes] of Object.entries(scales)) assert.equal(sizes.size, 1, `"${family}" differs between the stylesheets: ${[...sizes]}`);
  const kit = read(KIT_CSS);
  assert.equal(stackHead(kit, ".kit:lang(zh)", "--kit-sans"), "Hanken Grotesk SC");
  assert.equal(stackHead(kit, ".kit:lang(ja)", "--kit-sans"), "Hanken Grotesk JP");
});

// The display face (committee O2, 2026-10-21): Roboto Serif as two static files, wght 440 for English and 400 for
// the Latin in zh / ja headings, and Georgia fitted to them until they load. Every sheet declares the same faces
// with Hedvig's line box; --font-display leads with the 440 face, under :lang(zh) / :lang(ja) with the 400 one; and
// each page preloads exactly the display file its own stack uses, so it makes one display-font request.
const DISPLAY = {
  en: { family: "Roboto Serif Display", file: "RobotoSerif-display-wdth86-opsz36-wght440-latin.woff2", weight: 440 },
  cjk: { family: "Roboto Serif Display CJK", file: "RobotoSerif-display-wdth86-opsz36-wght400-latin.woff2", weight: 400 },
};
const DISPLAY_FALLBACK = "Roboto Serif Fallback";
const displayStack = (css, selector) => {
  const body = new RegExp(`(?:^|\\n)${selector.replace(/[()]/g, "\\$&")}\\s*{([^}]*)}`).exec(css)?.[1] ?? "";
  const stack = /--font-display:\s*([^;]+);/.exec(body)?.[1] ?? "";
  return [...stack.matchAll(/"([^"]+)"/g)].map(([, family]) => family).slice(0, 2);
};
const rangeOf = (block) => /unicode-range:\s*([^;]+);/.exec(block)?.[1].replace(/\s+/g, " ").trim();

test("every sheet sets display headings in the Roboto Serif faces, with a Georgia stand-in on the same line box", () => {
  assert.deepEqual(readdirSync(fonts).filter((name) => /hedvig/i.test(name)), [], "Hedvig files left in public/fonts");
  for (const sheet of FONT_SHEETS) {
    const css = read(sheet);
    assert.doesNotMatch(css.replace(/\/\*[\s\S]*?\*\//g, ""), /hedvig/i, `${sheet} still declares or stacks Hedvig`);
    const fallback = faceBlock(css, DISPLAY_FALLBACK);
    assert.ok(fallback.block.includes('src: local("Georgia");'), `${sheet}: "${DISPLAY_FALLBACK}" is not Georgia`);
    // The faces' line box is 0.96 / 0.27em (100% / 28.125% at size-adjust 96%); the fallback's overrides undo its scale.
    assert.ok(Math.abs((fallback.ascent * fallback.size) / 100 - 96) < 0.05, `${sheet}: the fallback's ascent moves the line box`);
    assert.ok(Math.abs((fallback.descent * fallback.size) / 100 - 27) < 0.05, `${sheet}: the fallback's descent moves the line box`);
    for (const { family, file, weight } of Object.values(DISPLAY)) {
      const face = faceBlock(css, family);
      assert.ok(fontUrls(face.block).some((url) => url.endsWith(`/${file}`)), `${sheet}: "${family}" is not ${file}`);
      assert.ok(face.block.includes(`font-weight: ${weight};`), `${sheet}: "${family}" is not declared at ${weight}`);
      assert.deepEqual([face.size, face.ascent, face.descent], [96, 100, 28.125], `${sheet}: "${family}" moves the line box`);
      assert.equal(rangeOf(face.block), rangeOf(fallback.block), `${sheet}: "${family}" and the fallback cover different glyphs`);
    }
    assert.deepEqual(displayStack(css, ":root"), [DISPLAY.en.family, DISPLAY_FALLBACK], `${sheet}: en --font-display`);
    for (const lang of ["zh", "ja"]) {
      assert.deepEqual(displayStack(css, `:root:lang(${lang})`), [DISPLAY.cjk.family, DISPLAY_FALLBACK], `${sheet}: ${lang} --font-display`);
    }
  }
});

test("each home and blog page preloads the one display file its stack uses", async () => {
  const { renderLandingLocale } = await import("../scripts/landing-locales.mjs");
  const source = read("apps/landing/index.html");
  for (const locale of ["en", "zh", "ja"]) {
    const preloads = [...renderLandingLocale(source, locale).matchAll(/<link rel="preload" href="([^"]+)" as="font"/g)];
    const display = preloads.map(([, href]) => href.split("/").at(-1)).filter((name) => name.startsWith("RobotoSerif-"));
    assert.deepEqual(display, [locale === "en" ? DISPLAY.en.file : DISPLAY.cjk.file], `/${locale} display preloads`);
  }
  const layout = read("apps/blog/src/layouts/BaseLayout.astro");
  const imported = Object.fromEntries([...layout.matchAll(/import (\w+) from "[^"]*\/([^/"]+\.woff2)\?url"/g)].map(([, name, file]) => [name, file]));
  const choice = /<link rel="preload" href=\{lang === "en" \? (\w+) : (\w+)\} as="font"/.exec(layout);
  assert.ok(choice, "the blog layout picks its display preload by lang");
  assert.deepEqual([imported[choice[1]], imported[choice[2]]], [DISPLAY.en.file, DISPLAY.cjk.file], "the blog's en / zh-ja display preloads");
});

// The home's portal (apps/landing/src/effects/v5/portal.ts) redraws the lockup mark's block, BRAND_MARK.fill, as a
// clip-path every frame. It reads M / L / H / V / C / Z path data only, and given anything else it quietly does
// nothing, which leaves the spec table's screen in its still end state: a regenerated mark with arcs or smooth curves
// would switch the door off without an error anywhere.
test("the portal can redraw BRAND_MARK.fill: closed M / L / H / V / C / Z path data with its concave sides", () => {
  const source = read("apps/landing/src/shared/ui/brand-v5.generated.ts");
  const fill = /"fill":"([^"]+)"/.exec(source)?.[1];
  assert.ok(fill, "brand-v5.generated.ts has BRAND_MARK.fill");
  const commands = fill.match(/[a-df-z]/gi) ?? [];
  assert.deepEqual([...new Set(commands.map((c) => c.toUpperCase()))].filter((c) => !"MLHVCZ".includes(c)), []);
  assert.equal(commands[0].toUpperCase(), "M", "starts with a move");
  assert.equal(commands.at(-1).toUpperCase(), "Z", "a closed block");
  assert.ok(commands.filter((c) => c.toUpperCase() === "C").length >= 2, "the two concave sides are curves");
});
