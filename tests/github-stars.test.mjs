import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { LINKS } from "../apps/landing/src/home/copy.ts";
import {
  formatStars,
  GITHUB_REPO,
  GITHUB_REPO_API,
  starCount,
  starsLabel,
} from "../apps/landing/src/shared/github-stars.ts";
import { fetchGithubStars } from "../scripts/github-stars.mjs";
import { renderLandingLocale } from "../scripts/landing-locales.mjs";

// mosoo's GitHub star count in the bars (the request of 2026-11-12 02:06, after nod.n8n.io's header, which reads its
// own count from the GitHub API when the page is built): read once per build (scripts/github-stars.mjs,
// scripts/build-site.mjs), shown in GitHub's short form (1.2k) beside the mark, the whole number in the link's name. A
// build that cannot read it still passes and ships the bars with the mark alone: never "0", "NaN" or an empty pill.
// Nothing here touches the network: the request goes through a stand-in fetch.

const LOCALES = ["en", "zh", "ja"];
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const NAV = JSON.parse(read("apps/landing/src/home/copy/nav.json"));
const INDEX = read("apps/landing/index.html");
const home = (locale, options) => renderLandingLocale(INDEX, locale, options);
const header = (html) => /<header class="v5-nav"[\s\S]*?<\/header>/.exec(html)?.[0] ?? "";
const githubLink = (html) => /<a class="v5-nav-a v5-nav-gh\b[^"]*"[^>]*>[\s\S]*?<\/a>/.exec(header(html))?.[0] ?? "";
const startTag = (html) => /^<a\b[^>]*>/.exec(html)?.[0] ?? "";
const attr = (tag, name) => new RegExp(`\\s${name}="([^"]*)"`).exec(tag)?.[1];
const decode = (value) =>
  value
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&amp;", "&");
const textOf = (html) =>
  decode(html.replace(/<[^>]+>/g, ""))
    .replace(/\s+/g, " ")
    .trim();
const quiet = { log() {}, warn() {} };
const json = (body, init = {}) =>
  new Response(JSON.stringify(body), { status: 200, headers: { "content-type": "application/json" }, ...init });

/** The object literal after `marker` in a TypeScript source (strings only), evaluated as plain JavaScript. */
const objectAfter = (source, marker) => {
  const start = source.indexOf("{", source.indexOf(marker));
  assert.ok(start > 0, `${marker} is in the source`);
  let depth = 0;
  let end = start;
  for (; end < source.length; end++) {
    if (source[end] === "{") depth++;
    if (source[end] === "}" && --depth === 0) break;
  }
  return new Function(`return (${source.slice(start, end + 1)});`)();
};

test("the count reads in GitHub's short form, rounded down so it never claims more stars", () => {
  const cases = [
    [1, "1"],
    [166, "166"],
    [999, "999"],
    [1000, "1k"],
    [1049, "1k"],
    [1234, "1.2k"],
    [1299, "1.2k"],
    [8200, "8.2k"],
    [9999, "9.9k"],
    [10_000, "10k"],
    [12_345, "12.3k"],
    [99_999, "99.9k"],
    [100_000, "100k"],
    [123_456, "123k"],
    [999_999, "999k"],
    [1_000_000, "1M"],
    [1_234_567, "1.2M"],
    [12_345_678, "12.3M"],
    [123_456_789, "123M"],
  ];
  for (const [count, shown] of cases) assert.equal(formatStars(count), shown, `${count}`);
});

test("only a whole number above zero is a count", () => {
  assert.equal(starCount(166), 166);
  assert.equal(starCount(1), 1);
  for (const value of [0, -3, 1.5, Number.NaN, Number.POSITIVE_INFINITY, 2 ** 53, "166", null, undefined, {}]) {
    assert.equal(starCount(value), null, `${String(value)} is no count`);
  }
});

test("the link's name carries the whole count, in each locale's words", () => {
  assert.equal(starsLabel(NAV.en.githubStars, 1234), "Star mosoo on GitHub, 1,234 stars");
  assert.equal(starsLabel(NAV.en.githubStars, 166), "Star mosoo on GitHub, 166 stars");
  assert.equal(starsLabel(NAV.zh.githubStars, 1234), "在 GitHub 上为 mosoo 点 Star，已有 1,234 个 Star");
  assert.equal(starsLabel(NAV.ja.githubStars, 1234), "GitHub で mosoo に Star を付ける（Star 数 1,234）");
  for (const locale of LOCALES) {
    const label = NAV[locale].githubStars;
    assert.equal(label.split("{count}").length, 2, `${locale}: one {count}`);
    // the sheet shows "GitHub": the name holds what the link shows (WCAG 2.5.3)
    assert.match(label, new RegExp(NAV[locale].github), `${locale}: the name says ${NAV[locale].github}`);
    assert.match(label, /\bmosoo\b/, `${locale}: and whose repository`);
    assert.ok(!label.includes("|"), `${locale}: no break mark in an attribute (markup.ts BREAK)`);
  }
});

test("the build asks the GitHub API once, for the repository the bars link to", async () => {
  // the count is the linked repository's: the home's LINKS.github and the subpages' MOSOO_GITHUB_URL
  assert.equal(GITHUB_REPO_API, `https://api.github.com/repos/${GITHUB_REPO}`);
  assert.equal(LINKS.github, `https://github.com/${GITHUB_REPO}`);
  assert.match(
    read("apps/landing/src/shared/config/external-links.ts"),
    new RegExp(`export const MOSOO_GITHUB_URL = "https://github\\.com/${GITHUB_REPO}/";`),
  );

  const calls = [];
  const fetch = async (url, init) => {
    calls.push({ url, init });
    return json({ full_name: GITHUB_REPO, stargazers_count: 166, forks_count: 12 });
  };
  assert.equal(await fetchGithubStars({ env: {}, fetch, log: quiet }), 166);
  assert.equal(calls.length, 1, "one request");
  assert.equal(calls[0].url, GITHUB_REPO_API);
  assert.equal(calls[0].init.headers["user-agent"], "mosoo-website-build", "GitHub's API asks for a User-Agent");
  assert.equal(calls[0].init.headers.accept, "application/vnd.github+json");
  assert.equal(calls[0].init.headers.authorization, undefined, "no token unless the environment has one");
  assert.ok(calls[0].init.signal instanceof AbortSignal, "the request has a deadline");

  // a GITHUB_TOKEN in the environment, if any, raises the rate limit; none is needed
  await fetchGithubStars({ env: { GITHUB_TOKEN: "test-token" }, fetch, log: quiet });
  assert.equal(calls[1].init.headers.authorization, "Bearer test-token");
});

test("a build that cannot read the count gets none, says why, and goes on", async () => {
  const hang = (_url, init) =>
    new Promise((_resolve, reject) => init.signal.addEventListener("abort", () => reject(init.signal.reason)));
  const cases = {
    "rate limit used up": () =>
      new Response('{"message":"API rate limit exceeded"}', {
        status: 403,
        headers: { "x-ratelimit-remaining": "0" },
      }),
    "too many requests": () => new Response("", { status: 429 }),
    "not found": () => new Response("", { status: 404 }),
    "server error": () => new Response("", { status: 502 }),
    "a body that is not JSON": () => new Response("<html>", { status: 200 }),
    "a count of 0": () => json({ stargazers_count: 0 }),
    "no count": () => json({ message: "Moved Permanently" }),
    "a count that is a string": () => json({ stargazers_count: "166" }),
    "JSON null": () => json(null),
    "a network error": () => Promise.reject(new TypeError("fetch failed")),
    "a fetch that throws": () => {
      throw new Error("no fetch here");
    },
    "no answer in time": hang,
  };
  for (const [name, fetch] of Object.entries(cases)) {
    const warnings = [];
    const stars = await fetchGithubStars({
      env: {},
      fetch,
      timeoutMs: 20,
      log: { log() {}, warn: (line) => warnings.push(line) },
    });
    assert.equal(stars, null, `${name}: no count`);
    assert.equal(warnings.length, 1, `${name}: one warning in the build log`);
    assert.match(warnings[0], /^GitHub stars: none \(https:\/\/api\.github\.com\/repos\/langgenius\/mosoo: /);
  }
  const warnings = [];
  await fetchGithubStars({ env: {}, fetch: cases["rate limit used up"], log: { warn: (l) => warnings.push(l) } });
  assert.match(warnings[0], /HTTP 403, rate limit used up/, "a used-up rate limit says so");
});

test("VITE_GITHUB_STARS skips the request: a whole number previews it, anything else means none", async () => {
  const fetch = () => assert.fail("no request when VITE_GITHUB_STARS is set");
  const run = (value) => fetchGithubStars({ env: { VITE_GITHUB_STARS: value }, fetch, log: quiet });
  assert.equal(await run("1234"), 1234);
  for (const value of ["", "0", "off", "-5", "12.5", "NaN"]) {
    assert.equal(await run(value), null, `VITE_GITHUB_STARS=${value}`);
  }
});

test("with a count, the home's GitHub link is the pill: the mark, a star and the short count, named in full", () => {
  for (const locale of LOCALES) {
    const html = home(locale, { stars: 1234 });
    const link = githubLink(html);
    const tag = startTag(link);
    assert.equal(attr(tag, "class"), "v5-nav-a v5-nav-gh v5-nav-gh--stars", `${locale}: the pill's class`);
    assert.equal(attr(tag, "href"), LINKS.github, `${locale}: still the repository`);
    assert.equal(attr(tag, "translate"), "no");
    assert.equal(decode(attr(tag, "aria-label")), starsLabel(NAV[locale].githubStars, 1234), `${locale}: named in full`);
    assert.doesNotMatch(tag, /\btarget=/, `${locale}: same tab, like the rest of the bar`);
    // the mark, the name (shown in the phone sheet), then the star and the count, both hidden from readers
    assert.match(
      link,
      /^<a [^>]*><svg class="v5-nav-ghm"[^>]*aria-hidden="true"[\s\S]*?<\/svg><span class="v5-nav-gh-t">GitHub<\/span> <span class="v5-nav-stars" aria-hidden="true"><svg class="v5-nav-star"[^>]*aria-hidden="true"[^>]*>[\s\S]*?<\/svg>1\.2k<\/span><\/a>$/,
      `${locale}: mark, name, star, 1.2k`,
    );
    assert.equal(textOf(link), "GitHub 1.2k", `${locale}: its text`);
    assert.ok(!link.includes("<wbr>"), `${locale}: no break mark lands in the link`);
    assert.equal(
      decode(attr(startTag(githubLink(home(locale, { stars: 166 }))), "aria-label")),
      starsLabel(NAV[locale].githubStars, 166),
    );
    assert.match(githubLink(home(locale, { stars: 166 })), /<\/svg>166<\/span><\/a>$/, `${locale}: 166 as is`);
  }
});

test("without a count, the home's GitHub link is the mark alone, exactly as before", () => {
  for (const locale of LOCALES) {
    const before = home(locale);
    const link = githubLink(before);
    assert.match(
      link,
      /^<a class="v5-nav-a v5-nav-gh" href="https:\/\/github\.com\/langgenius\/mosoo" translate="no"><svg class="v5-nav-ghm"[^>]*aria-hidden="true"[\s\S]*?<\/svg><span class="v5-nav-gh-t">GitHub<\/span><\/a>$/,
      `${locale}: the mark and its name`,
    );
    for (const stars of [null, undefined, 0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY]) {
      const html = home(locale, { stars });
      assert.equal(html, before, `${locale}: stars ${String(stars)} renders the page without a count`);
    }
    const bar = header(before);
    assert.doesNotMatch(bar, /v5-nav-stars|v5-nav-gh--stars|aria-label="Star/, `${locale}: no pill, no count`);
    assert.doesNotMatch(textOf(bar), /\bNaN\b|\bundefined\b|\bnull\b|\bInfinity\b/, `${locale}: no stray value`);
  }
});

test("the subpages' bar reads the same count from the landing build, in the home's words", () => {
  const SITE_NAV = read("apps/landing/src/shared/ui/site-nav.tsx");
  assert.match(SITE_NAV, /import \{ formatStars, starCount, starsLabel \} from "@\/shared\/github-stars";/);
  assert.match(SITE_NAV, /const STARS = starCount\(Number\(import\.meta\.env\["VITE_GITHUB_STARS"\]\)\);/);
  assert.match(SITE_NAV, /className=\{STARS === null \? "d-nav-a d-nav-gh" : "d-nav-a d-nav-gh d-nav-gh--stars"\}/);
  assert.match(
    SITE_NAV,
    /aria-label=\{STARS === null \? undefined : starsLabel\(t\("Star mosoo on GitHub, \{count\} stars"\), STARS\)\}/,
  );
  assert.match(SITE_NAV, /<span className="d-nav-stars" aria-hidden="true">\s*<Star \/>\s*\{formatStars\(STARS\)\}/);
  const I18N = read("apps/landing/src/shared/i18n.ts");
  for (const [locale, marker] of [
    ["zh", "const ZH_MESSAGES ="],
    ["ja", "const JA_MESSAGES ="],
  ]) {
    assert.equal(
      objectAfter(I18N, marker)["Star mosoo on GitHub, {count} stars"],
      NAV[locale].githubStars,
      `${locale}: the home's words (copy/nav.json githubStars)`,
    );
  }
  assert.equal("Star mosoo on GitHub, {count} stars", NAV.en.githubStars, "en: the home's words");
  // the home's dev server renders the bar in the browser from the same variable (src/main.tsx)
  assert.match(
    read("apps/landing/src/main.tsx"),
    /renderHome\(locale, \{ stars: Number\(import\.meta\.env\["VITE_GITHUB_STARS"\]\) \}\)/,
  );
});

test("one request per build, and both bars get its answer", () => {
  const BUILD = read("scripts/build-site.mjs");
  assert.equal(BUILD.match(/fetchGithubStars\(/g)?.length, 1, "one call");
  const fetchAt = BUILD.indexOf("const stars = await fetchGithubStars();");
  assert.ok(fetchAt > 0, "the build reads the count");
  assert.ok(fetchAt < BUILD.indexOf('run("npm", ["run", "landing:build"]'), "before the landing build");
  assert.match(
    BUILD,
    /run\("npm", \["run", "landing:build"\], \{ env: \{ VITE_GITHUB_STARS: stars === null \? "" : String\(stars\) \} \}\);/,
    "the subpages' bar gets it through the landing build's environment",
  );
  assert.match(
    BUILD,
    /await buildLandingLocales\(join\(ROOT, "apps", "landing", "dist"\), \{ stars \}\);/,
    "the home's static bar gets it through the locale pages",
  );
});

// O1 (committee 2026-10-21; tests/home-nav-products.test.mjs): a pill carries no line. The count's pill is the hero
// announcement's: the frame's fill, a transparent border (seen only in forced-colors mode), --frame-2 under the
// pointer. On the home it starts at 1024px, and the floating bar widens for it only while it is there (nav.css
// --nav-float), so a build without a count keeps the bar as it was.
test("the count's pill is the hero pill's look, with no line, and fits the floating bar", () => {
  const rule = (source, selector) => new RegExp(`(?:^|\\n)\\s*${selector} \\{([^}]*)\\}`).exec(source)?.[1] ?? "";
  const NAV_CSS = read("apps/landing/src/home/sections/nav.css");
  const SITE_CSS = read("apps/landing/src/shared/styles/site-nav.css");
  for (const [name, source, pill, frame, frame2] of [
    ["nav.css", NAV_CSS, "\\.v5-nav-gh--stars", "var\\(--frame\\)", "var\\(--frame-2\\)"],
    ["site-nav.css", SITE_CSS, "\\.d-nav-gh--stars", "var\\(--d-frame\\)", "var\\(--d-frame-2\\)"],
  ]) {
    const body = rule(source, pill);
    assert.match(body, /border: 1px solid transparent;/, `${name}: no visible line`);
    assert.match(body, /border-radius: 999px;/, `${name}: a pill`);
    assert.match(body, new RegExp(`background: ${frame};`), `${name}: the frame's fill`);
    assert.match(rule(source, `${pill}:hover`), new RegExp(`background: ${frame2};`), `${name}: a shade darker`);
  }
  const wide = /@media \(min-width: 1024px\) \{([\s\S]*?)\n\}/.exec(NAV_CSS)?.[1] ?? "";
  assert.match(wide, /\n {2}\.v5-nav-gh--stars \{/, "home: the pill from 1024px");
  assert.match(
    wide,
    /\[data-nav\]:has\(\.v5-nav-gh--stars\) \{\s*--nav-float: 920px;\s*\}/,
    "the floating bar makes room for it (ja, CTA in: 897 of 920)",
  );
  assert.match(NAV_CSS, /\n {2}--nav-float: 840px;/, "and is what it was without a count");
});
