import assert from "node:assert/strict";
import test from "node:test";

import {
  getIndexHreflangAlternates,
  getPostHreflangAlternates,
} from "../apps/blog/src/lib/seo.mjs";
import { blogSitemapI18n, serializeBlogSitemapItem } from "../apps/blog/src/lib/sitemap.mjs";
import {
  categoryLabel,
  footerCopyByLocale,
  headerCopyByLocale,
  indexCopyByLocale,
  postCopyByLocale,
} from "../apps/blog/src/lib/copy.mjs";

const posts = [
  { id: "guide.mdx", data: { locale: "en", permalink: "guide", translationKey: "guide" } },
  { id: "guide-zh.mdx", data: { locale: "zh", permalink: "guide", translationKey: "guide" } },
  { id: "guide-ja.mdx", data: { locale: "ja", permalink: "guide", translationKey: "guide" } },
];

test("blog indexes expose every language plus an English default", () => {
  assert.deepEqual(getIndexHreflangAlternates("/blog"), {
    en: "/blog",
    "zh-CN": "/blog/zh",
    ja: "/blog/ja",
    "x-default": "/blog",
  });
});

test("translated posts expose reciprocal hreflang links", () => {
  assert.deepEqual(getPostHreflangAlternates(posts[1], posts, "/blog"), {
    en: "/blog/guide",
    "zh-CN": "/blog/zh/guide",
    ja: "/blog/ja/guide",
    "x-default": "/blog/guide",
  });
});

test("unpaired posts do not claim unavailable translations", () => {
  const single = {
    id: "standalone.mdx",
    data: { locale: "en", permalink: "standalone", translationKey: "standalone" },
  };
  assert.equal(getPostHreflangAlternates(single, [single], "/blog"), undefined);
});

test("blog sitemap emits canonical localized alternates with an English default", () => {
  assert.deepEqual(blogSitemapI18n, {
    defaultLocale: "en",
    locales: {
      en: "en",
      zh: "zh-CN",
      ja: "ja",
    },
  });

  assert.deepEqual(
    serializeBlogSitemapItem({
      url: "https://mosoo.ai/blog/",
      links: [
        { lang: "en", url: "https://mosoo.ai/blog/" },
        { lang: "zh-CN", url: "https://mosoo.ai/blog/zh" },
        { lang: "ja", url: "https://mosoo.ai/blog/ja" },
      ],
    }),
    {
      url: "https://mosoo.ai/blog",
      links: [
        { lang: "en", url: "https://mosoo.ai/blog" },
        { lang: "zh-CN", url: "https://mosoo.ai/blog/zh" },
        { lang: "ja", url: "https://mosoo.ai/blog/ja" },
        { hreflang: "x-default", url: "https://mosoo.ai/blog" },
      ],
    },
  );
});

test("localized blog chrome uses localized visible copy", () => {
  assert.equal(indexCopyByLocale.zh.title, "mosoo 开发手记。");
  assert.equal(indexCopyByLocale.ja.allPosts, "すべての記事");
  assert.equal(categoryLabel("zh", "Engineering"), "工程");
  assert.equal(categoryLabel("ja", "Product"), "プロダクト");
  // The header CTA is the home's (v5 FIXES: "Learn More" named neither its target nor its action).
  assert.equal(headerCopyByLocale.zh.tryMosoo, "试用 mosoo");
  assert.equal(postCopyByLocale.ja.github, "GitHub の mosoo →");
  assert.equal(postCopyByLocale.ja.by, "著者");
  // The footer is the company credit in every language, as on the home.
  assert.equal(footerCopyByLocale.zh, "© 2026 LangGenius, Inc.");
});

test("blog chrome carries no bamboo imagery", () => {
  // The owner retired the bamboo motif (2026-10-19); the masthead and footer are plain lines now.
  for (const copy of [indexCopyByLocale, footerCopyByLocale]) {
    assert.doesNotMatch(JSON.stringify(copy), /bamboo|grove|竹/i);
  }
});
