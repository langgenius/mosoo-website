import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import test from "node:test";

import { draftOnlyPermalinks, readDraftInfo } from "../apps/blog/src/lib/draft-assets.mjs";

const post = (permalink, draft, body = "body") => `---\ntitle: "x"\npermalink: "${permalink}"\n${draft ? "draft: true\n" : ""}---\n\n${body}\n`;
const contentDir = new URL("../apps/blog/src/content/blog/", import.meta.url);
const posts = () =>
  readdirSync(contentDir)
    .filter((name) => /\.mdx?$/.test(name) && name !== "README.md")
    .map((name) => [name, readFileSync(new URL(name, contentDir), "utf8")]);

test("draft info is read from front matter only", () => {
  assert.deepEqual(readDraftInfo(post("guide", true)), { permalink: "guide", draft: true });
  assert.deepEqual(readDraftInfo(post("guide", false)), { permalink: "guide", draft: false });
  assert.equal(readDraftInfo("no front matter\ndraft: true"), undefined);
});

test("assets are stripped only when every locale of a permalink is a draft", () => {
  assert.deepEqual(draftOnlyPermalinks([post("a", true), post("a", true), post("b", true), post("b", false), post("c", false)]), ["a"]);
});

test("a published post that references a draft-only folder protects it", () => {
  const published = post("live", false, "![figure](/blog/blog/shared-assets/figure.png)");
  assert.deepEqual(draftOnlyPermalinks([post("shared-assets", true), published]), []);
});

test("Introducing Mosoo Computer is published in every locale and keeps its assets", () => {
  const entries = posts().filter(([name]) => name.startsWith("introducing-mosoo-computer"));
  assert.deepEqual(entries.map(([name]) => name).sort(), ["introducing-mosoo-computer-ja.mdx", "introducing-mosoo-computer-zh.mdx", "introducing-mosoo-computer.mdx"]);
  for (const [name, source] of entries) {
    assert.equal(readDraftInfo(source)?.draft, false, `${name} must not be a draft`);
    assert.match(source, /^heroImage: "\/blog\/blog\/introducing-mosoo-computer\/cover\.jpg"$/m);
    assert.match(source, /\]\(\/blog\/blog\/introducing-mosoo-computer\/architecture-en\.png\)/);
  }
  assert.ok(!draftOnlyPermalinks(posts().map(([, source]) => source)).includes("introducing-mosoo-computer"));
  for (const asset of ["cover.jpg", "cover-material.webp", "architecture-en.png"]) {
    assert.ok(existsSync(new URL(`../apps/blog/public/blog/introducing-mosoo-computer/${asset}`, import.meta.url)), `${asset} must ship`);
  }
});

test("the playbook is withdrawn from the site: no entries, links or playbook-only screenshots", () => {
  for (const [name, source] of posts()) {
    assert.ok(!/playbook/i.test(name), `${name} should not exist`);
    assert.ok(!/playbook/i.test(source), `${name} still mentions the playbook`);
  }
  for (const asset of ["01-create-agent.png", "02-model-access.png", "03-subscription-status.png", "04-channels.png"]) {
    assert.ok(!existsSync(new URL(`../apps/blog/public/blog/introducing-mosoo-computer/${asset}`, import.meta.url)), `${asset} should be withdrawn`);
  }
});

test("every hero image and live cover referenced by a post exists", () => {
  const registry = readFileSync(new URL("../apps/blog/src/covers/registry.ts", import.meta.url), "utf8");
  for (const [name, source] of posts()) {
    const hero = source.match(/^heroImage: "\/blog(\/blog\/[^"]+)"$/m)?.[1];
    assert.ok(hero, `${name} has no heroImage`);
    assert.ok(existsSync(new URL(`../apps/blog/public${hero}`, import.meta.url)), `${name}: ${hero} is missing`);
    const cover = source.match(/^heroCover: "([^"]+)"$/m)?.[1];
    if (cover) assert.ok(registry.includes(`"${cover}": {`), `${name}: live cover ${cover} is not registered`);
  }
});

test("drafts are listed in development only", () => {
  const drafts = readFileSync(new URL("../apps/blog/src/lib/drafts.ts", import.meta.url), "utf8");
  assert.match(drafts, /SHOW_DRAFTS: boolean = import\.meta\.env\.DEV/);
  const rss = readFileSync(new URL("../apps/blog/src/pages/rss.xml.ts", import.meta.url), "utf8");
  assert.match(rss, /!data\.draft/);
});
